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
        $capacityMode = rv2_get_capacity_mode($pdo);
        rv2_json_out([
            'ok' => true,
            'steps' => $steps,
            'branches' => $branches,
            'items' => $items,
            'fields' => $fields,
            'capacity_mode' => $capacityMode,
            'capacity_hint' => $capacityMode === 'item'
                ? '현재 설정: 항목·일별 잔여 수량 기준 (마지막 단계가 항목)'
                : '현재 설정: 시간 슬롯 기준 (마지막 단계가 시간)',
        ]);
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
        $mode = rv2_get_capacity_mode($pdo);
        if ($mode === 'item') {
            $st = $pdo->prepare(
                'SELECT quota_date AS slot_date, SUM(capacity) AS cap, SUM(booked) AS booked
                 FROM rv2_item_quota WHERE branch_id = ? AND quota_date BETWEEN ? AND ?
                 GROUP BY quota_date'
            );
        } else {
            $st = $pdo->prepare(
                'SELECT slot_date, SUM(capacity) AS cap, SUM(booked) AS booked
                 FROM rv2_slot WHERE branch_id = ? AND slot_date BETWEEN ? AND ?
                 GROUP BY slot_date'
            );
        }
        $st->execute([$branchId, $start, $end]);
        $days = [];
        while ($row = $st->fetch(PDO::FETCH_ASSOC)) {
            $cap = (int)$row['cap'];
            $b = (int)$row['booked'];
            $days[$row['slot_date']] = ['capacity' => $cap, 'booked' => $b, 'open' => $cap > $b];
        }
        rv2_json_out(['ok' => true, 'days' => $days, 'capacity_mode' => $mode]);
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
            $r['remaining'] = max(0, (int)$r['capacity'] - (int)$r['booked']);
            $r['slot_time'] = substr((string)$r['slot_time'], 0, 5);
        }
        unset($r);
        rv2_json_out(['ok' => true, 'slots' => $rows, 'capacity_mode' => rv2_get_capacity_mode($pdo)]);
    }

    case 'item_quotas': {
        $branchId = (int)($in['branch_id'] ?? 0);
        $date = trim((string)($in['date'] ?? ''));
        if ($branchId < 1 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            rv2_json_out(['ok' => false, 'msg' => 'branch_id, date 필요'], 400);
        }
        $st = $pdo->prepare(
            'SELECT q.id, q.item_id, q.capacity, q.booked, i.name AS item_name
             FROM rv2_item_quota q
             INNER JOIN rv2_item i ON i.id = q.item_id AND i.is_active = 1
             WHERE q.branch_id = ? AND q.quota_date = ?
             ORDER BY i.sort_order ASC, i.id ASC'
        );
        $st->execute([$branchId, $date]);
        $rows = $st->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$r) {
            $r['available'] = (int)$r['capacity'] > (int)$r['booked'];
            $r['remaining'] = max(0, (int)$r['capacity'] - (int)$r['booked']);
        }
        unset($r);
        rv2_json_out(['ok' => true, 'quotas' => $rows, 'capacity_mode' => rv2_get_capacity_mode($pdo)]);
    }

    case 'book': {
        if ($method !== 'POST') {
            rv2_json_out(['ok' => false, 'msg' => 'POST only'], 405);
        }
        $created = rv2_booking_create($pdo, [
            'branch_id' => (int)($in['branch_id'] ?? 0),
            'slot_id' => (int)($in['slot_id'] ?? 0),
            'item_quota_id' => (int)($in['item_quota_id'] ?? 0),
            'item_id' => isset($in['item_id']) ? (int)$in['item_id'] : null,
            'customer_name' => (string)($in['customer_name'] ?? ''),
            'customer_phone' => (string)($in['customer_phone'] ?? ''),
            'customer_email' => (string)($in['customer_email'] ?? ''),
            'extra' => isset($in['extra']) && is_array($in['extra']) ? $in['extra'] : [],
        ]);
        if (!$created['ok']) {
            $msg = (string)($created['msg'] ?? '');
            $code = (strpos($msg, '마감') !== false || strpos($msg, '부족') !== false) ? 409 : 400;
            rv2_json_out($created, $code);
        }
        $bSt = $pdo->prepare('SELECT * FROM rv2_booking WHERE id = ? LIMIT 1');
        $bSt->execute([(int)$created['id']]);
        $row = $bSt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            rv2_send_reservation_admin_notifications($pdo, $row);
        }
        rv2_json_out([
            'ok' => true,
            'reservation_no' => $created['reservation_no'],
            'id' => $created['id'],
        ]);
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
            rv2_json_out(['ok' => true, 'booking' => $row, 'capacity_mode' => rv2_get_capacity_mode($pdo)]);
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
                 ORDER BY b.id DESC LIMIT 10'
            );
            $st->execute([$name, $pn !== '' ? $pn : $phone]);
            $rows = $st->fetchAll(PDO::FETCH_ASSOC);
            rv2_json_out(['ok' => true, 'list' => $rows, 'capacity_mode' => rv2_get_capacity_mode($pdo)]);
        }
        rv2_json_out(['ok' => false, 'msg' => '예약번호 또는 이름+연락처를 입력하세요.'], 400);
    }

    case 'user_cancel': {
        if ($method !== 'POST') {
            rv2_json_out(['ok' => false, 'msg' => 'POST only'], 405);
        }
        $no = trim((string)($in['reservation_no'] ?? ''));
        $phone = trim((string)($in['customer_phone'] ?? ''));
        if ($no === '' || $phone === '') {
            rv2_json_out(['ok' => false, 'msg' => '예약번호와 연락처를 입력하세요.'], 400);
        }
        $b = rv2_find_booking_for_customer($pdo, $no, $phone);
        if (!$b) {
            rv2_json_out(['ok' => false, 'msg' => '예약을 찾을 수 없습니다.'], 404);
        }
        if ($b['status'] !== '접수') {
            rv2_json_out(['ok' => false, 'msg' => '접수 상태에서만 취소할 수 있습니다.'], 400);
        }
        $pdo->beginTransaction();
        try {
            $lock = $pdo->prepare('SELECT * FROM rv2_booking WHERE id = ? FOR UPDATE');
            $lock->execute([(int)$b['id']]);
            $cur = $lock->fetch(PDO::FETCH_ASSOC);
            if (!$cur || $cur['status'] !== '접수') {
                $pdo->rollBack();
                rv2_json_out(['ok' => false, 'msg' => '접수 상태에서만 취소할 수 있습니다.'], 400);
            }
            rv2_release_booking_capacity($pdo, $cur);
            $pdo->prepare("UPDATE rv2_booking SET status = '취소' WHERE id = ?")->execute([(int)$cur['id']]);
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            rv2_json_out(['ok' => false, 'msg' => '처리 실패'], 500);
        }
        rv2_json_out(['ok' => true]);
    }

    case 'user_reschedule': {
        if ($method !== 'POST') {
            rv2_json_out(['ok' => false, 'msg' => 'POST only'], 405);
        }
        $no = trim((string)($in['reservation_no'] ?? ''));
        $phone = trim((string)($in['customer_phone'] ?? ''));
        $newSlot = (int)($in['slot_id'] ?? 0);
        $newIq = (int)($in['item_quota_id'] ?? 0);
        if ($no === '' || $phone === '') {
            rv2_json_out(['ok' => false, 'msg' => '예약번호와 연락처를 입력하세요.'], 400);
        }
        $b = rv2_find_booking_for_customer($pdo, $no, $phone);
        if (!$b) {
            rv2_json_out(['ok' => false, 'msg' => '예약을 찾을 수 없습니다.'], 404);
        }
        $res = rv2_booking_reschedule($pdo, $b, $newSlot, $newIq);
        if (!$res['ok']) {
            rv2_json_out($res, 400);
        }
        rv2_json_out(['ok' => true]);
    }

    default:
        rv2_json_out(['ok' => false, 'msg' => 'unknown action'], 400);
}
