<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__, 2) . '/lib/rv2_helpers.php';
require_once dirname(__DIR__, 2) . '/lib/rv2_notify.php';

$pdo = getDB();

header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$in = $method === 'POST' || $method === 'PUT' ? rv2_read_json_body() : $_GET;
$action = (string)($in['action'] ?? $_GET['action'] ?? '');

try {
    rv2_auto_complete_past($pdo);
} catch (Throwable $e) {
}

switch ($action) {

    case 'config': {
        $steps = $pdo->query('SELECT step_key, sort_order, is_active FROM rv2_step ORDER BY sort_order, id')->fetchAll(PDO::FETCH_ASSOC);
        $branches = $pdo->query('SELECT id, name, sort_order FROM rv2_branch WHERE is_active = 1 ORDER BY sort_order, id')->fetchAll(PDO::FETCH_ASSOC);
        $items = $pdo->query('SELECT id, name, sort_order FROM rv2_item WHERE is_active = 1 ORDER BY sort_order, id')->fetchAll(PDO::FETCH_ASSOC);
        $fields = $pdo->query('SELECT id, field_type, name_key, label, options_json, sort_order, is_required FROM rv2_field WHERE is_active = 1 ORDER BY sort_order, id')->fetchAll(PDO::FETCH_ASSOC);
        foreach ($fields as &$f) {
            $f['options'] = rv2_decode_options(is_string($f['options_json'] ?? null) ? $f['options_json'] : json_encode($f['options_json'] ?? []));
            unset($f['options_json']);
        }
        unset($f);
        rv2_json_out(['ok' => true, 'steps' => $steps, 'branches' => $branches, 'items' => $items, 'fields' => $fields]);
    }

    case 'calendar': {
        $branchId = (int)($in['branch_id'] ?? 0);
        $year = (int)($in['year'] ?? 0);
        $month = (int)($in['month'] ?? 0);
        if ($branchId < 1 || $year < 2000 || $month < 1 || $month > 12) {
            rv2_json_out(['ok' => false, 'msg' => 'branch_id, year, month 필요'], 400);
        }
        $start = sprintf('%04d-%02d-01', $year, $month);
        $end = date('Y-m-t', strtotime($start));
        $st = $pdo->prepare(
            'SELECT slot_date, SUM(capacity) AS cap, SUM(booked) AS booked
             FROM rv2_slot WHERE branch_id = ? AND slot_date BETWEEN ? AND ?
             GROUP BY slot_date'
        );
        $st->execute([$branchId, $start, $end]);
        $days = [];
        while ($row = $st->fetch(PDO::FETCH_ASSOC)) {
            $cap = (int)$row['cap'];
            $b = (int)$row['booked'];
            $days[$row['slot_date']] = ['capacity' => $cap, 'booked' => $b, 'open' => $cap > $b];
        }
        rv2_json_out(['ok' => true, 'days' => $days]);
    }

    case 'slots': {
        $branchId = (int)($in['branch_id'] ?? 0);
        $date = trim((string)($in['date'] ?? ''));
        if ($branchId < 1 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            rv2_json_out(['ok' => false, 'msg' => 'branch_id, date(YYYY-MM-DD) 필요'], 400);
        }
        $st = $pdo->prepare(
            'SELECT id, slot_time, capacity, booked, (capacity > booked) AS available
             FROM rv2_slot WHERE branch_id = ? AND slot_date = ? ORDER BY slot_time'
        );
        $st->execute([$branchId, $date]);
        $rows = $st->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$r) {
            $r['available'] = (int)$r['capacity'] > (int)$r['booked'];
            $r['slot_time'] = substr((string)$r['slot_time'], 0, 5);
        }
        unset($r);
        rv2_json_out(['ok' => true, 'slots' => $rows]);
    }

    case 'book': {
        if ($method !== 'POST') {
            rv2_json_out(['ok' => false, 'msg' => 'POST only'], 405);
        }
        $branchId = (int)($in['branch_id'] ?? 0);
        $slotId = (int)($in['slot_id'] ?? 0);
        $itemId = isset($in['item_id']) ? (int)$in['item_id'] : null;
        $name = trim((string)($in['customer_name'] ?? ''));
        $phone = trim((string)($in['customer_phone'] ?? ''));
        $email = trim((string)($in['customer_email'] ?? ''));
        $extra = $in['extra'] ?? [];
        if (!is_array($extra)) {
            $extra = [];
        }
        $notifyEmail = !empty($in['notify_email']);
        $notifySheet = !empty($in['notify_sheet']);
        $notifyAlim = !empty($in['notify_alim']);
        $notifyEmails = $in['notify_emails'] ?? [];
        if (!is_array($notifyEmails)) {
            $notifyEmails = array_filter(array_map('trim', explode(',', (string)$notifyEmails)));
        }

        if ($branchId < 1 || $slotId < 1 || $name === '' || $phone === '') {
            rv2_json_out(['ok' => false, 'msg' => '지점, 시간대, 이름, 연락처는 필수입니다.'], 400);
        }

        $phoneNorm = rv2_normalize_phone($phone);
        $dup = $pdo->prepare(
            "SELECT id FROM rv2_booking WHERE customer_name = ? AND customer_phone = ? AND status != '취소' LIMIT 1"
        );
        $dup->execute([$name, $phoneNorm !== '' ? $phoneNorm : $phone]);
        if ($dup->fetchColumn()) {
            rv2_json_out(['ok' => false, 'msg' => '동일 이름·연락처로 진행 중인 예약이 있어 추가 예약할 수 없습니다.'], 409);
        }

        $pdo->beginTransaction();
        try {
            $slotSt = $pdo->prepare('SELECT id, branch_id, slot_date, slot_time, capacity, booked FROM rv2_slot WHERE id = ? FOR UPDATE');
            $slotSt->execute([$slotId]);
            $slot = $slotSt->fetch(PDO::FETCH_ASSOC);
            if (!$slot || (int)$slot['branch_id'] !== $branchId) {
                $pdo->rollBack();
                rv2_json_out(['ok' => false, 'msg' => '잘못된 시간 슬롯입니다.'], 400);
            }
            if ((int)$slot['booked'] >= (int)$slot['capacity']) {
                $pdo->rollBack();
                rv2_json_out(['ok' => false, 'msg' => '해당 시간은 마감되었습니다.'], 409);
            }

            $dateYmd = $slot['slot_date'];
            $timeHi = substr((string)$slot['slot_time'], 0, 5);
            $err = rv2_validate_same_day_two_hours($dateYmd, $timeHi);
            if ($err) {
                $pdo->rollBack();
                rv2_json_out(['ok' => false, 'msg' => $err], 400);
            }

            $resAt = $dateYmd . ' ' . substr((string)$slot['slot_time'], 0, 8);

            $up = $pdo->prepare('UPDATE rv2_slot SET booked = booked + 1 WHERE id = ? AND booked < capacity');
            $up->execute([$slotId]);
            if ($up->rowCount() !== 1) {
                $pdo->rollBack();
                rv2_json_out(['ok' => false, 'msg' => '예약 가능 인원이 부족합니다.'], 409);
            }

            $resNo = rv2_gen_reservation_no($pdo);
            $extraJson = json_encode($extra, JSON_UNESCAPED_UNICODE);

            $ins = $pdo->prepare(
                'INSERT INTO rv2_booking (reservation_no, status, branch_id, item_id, slot_id, reservation_at,
                 customer_name, customer_phone, customer_email, extra_json, notify_email, notify_sheet, notify_alim)
                 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
            );
            $ins->execute([
                $resNo,
                '접수',
                $branchId,
                $itemId ?: null,
                $slotId,
                $resAt,
                $name,
                $phoneNorm !== '' ? $phoneNorm : $phone,
                $email !== '' ? $email : null,
                $extraJson,
                $notifyEmail ? 1 : 0,
                $notifySheet ? 1 : 0,
                $notifyAlim ? 1 : 0,
            ]);
            $bid = (int)$pdo->lastInsertId();
            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            rv2_json_out(['ok' => false, 'msg' => '예약 처리 중 오류가 발생했습니다.'], 500);
        }

        $booking = [
            'reservation_no' => $resNo,
            'status' => '접수',
            'reservation_at' => $resAt,
            'branch_id' => $branchId,
            'item_id' => $itemId,
            'customer_name' => $name,
            'customer_phone' => $phoneNorm !== '' ? $phoneNorm : $phone,
            'customer_email' => $email,
            'extra_json' => $extra,
        ];
        $mailList = [];
        if ($notifyEmail) {
            foreach ($notifyEmails as $e) {
                $e = trim((string)$e);
                if ($e !== '') {
                    $mailList[] = $e;
                }
            }
            if ($email !== '') {
                $mailList[] = $email;
            }
        }
        rv2_send_notifications($pdo, $booking, $mailList, $notifyEmail, $notifySheet, $notifyAlim);

        rv2_json_out(['ok' => true, 'reservation_no' => $resNo, 'id' => $bid]);
    }

    case 'lookup': {
        if ($method !== 'POST') {
            rv2_json_out(['ok' => false, 'msg' => 'POST only'], 405);
        }
        $no = trim((string)($in['reservation_no'] ?? ''));
        $name = trim((string)($in['customer_name'] ?? ''));
        $phone = trim((string)($in['customer_phone'] ?? ''));
        if ($no !== '') {
            $st = $pdo->prepare(
                'SELECT b.*, br.name AS branch_name, i.name AS item_name, s.slot_date, s.slot_time
                 FROM rv2_booking b
                 LEFT JOIN rv2_branch br ON br.id = b.branch_id
                 LEFT JOIN rv2_item i ON i.id = b.item_id
                 LEFT JOIN rv2_slot s ON s.id = b.slot_id
                 WHERE b.reservation_no = ? LIMIT 1'
            );
            $st->execute([$no]);
            $row = $st->fetch(PDO::FETCH_ASSOC);
            rv2_json_out(['ok' => true, 'booking' => $row]);
        }
        if ($name !== '' && $phone !== '') {
            $pn = rv2_normalize_phone($phone);
            $st = $pdo->prepare(
                'SELECT b.*, br.name AS branch_name, i.name AS item_name, s.slot_date, s.slot_time
                 FROM rv2_booking b
                 LEFT JOIN rv2_branch br ON br.id = b.branch_id
                 LEFT JOIN rv2_item i ON i.id = b.item_id
                 LEFT JOIN rv2_slot s ON s.id = b.slot_id
                 WHERE b.customer_name = ? AND b.customer_phone = ?
                 ORDER BY b.id DESC LIMIT 5'
            );
            $st->execute([$name, $pn]);
            $rows = $st->fetchAll(PDO::FETCH_ASSOC);
            rv2_json_out(['ok' => true, 'list' => $rows]);
        }
        rv2_json_out(['ok' => false, 'msg' => '예약번호 또는 이름+연락처를 입력하세요.'], 400);
    }

    default:
        rv2_json_out(['ok' => false, 'msg' => 'unknown action'], 400);
}
