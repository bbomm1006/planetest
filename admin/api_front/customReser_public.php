<?php
declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');

try {
    require_once dirname(__DIR__) . '/config/db_customReser.php';
    require_once dirname(__DIR__, 2) . '/lib/customReser_helpers.php';
    require_once dirname(__DIR__, 2) . '/lib/customReser_notify.php';
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'msg' => '모듈 로드 실패', 'detail' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $pdo = getCustomReserDB();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'msg' => 'DB 연결 실패(db.php와 동일 설정). 호스트·DB명·계정을 확인하세요.',
        'detail' => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$in = ($method === 'POST' || $method === 'PUT') ? customReser_read_json_body() : $_GET;
$slug = trim((string)($in['slug'] ?? $_GET['slug'] ?? ''));
$action = (string)($in['action'] ?? $_GET['action'] ?? '');

try {
    customReser_auto_complete_past($pdo);
} catch (Throwable $e) {
}

if ($slug === '') {
    customReser_json_out(['ok' => false, 'msg' => 'slug 파라미터가 필요합니다.'], 400);
}

$inst = customReser_instance_by_slug($pdo, $slug);
if (!$inst) {
    customReser_json_out(['ok' => false, 'msg' => '예약을 찾을 수 없거나 비활성입니다.'], 404);
}
$iid = (int)$inst['id'];

function customReser_build_calendar(PDO $pdo, int $instanceId, int $branchId, int $year, int $month): array {
    $today = customReser_today_ymd();
    $start = sprintf('%04d-%02d-01', $year, $month);
    $end = date('Y-m-t', strtotime($start));
    $mode = customReser_capacity_mode($pdo, $instanceId);
    $days = [];

    $tStart = strtotime($start);
    $tEnd = strtotime($end);
    for ($t = $tStart; $t <= $tEnd; $t += 86400) {
        $ds = date('Y-m-d', $t);
        if ($ds < $today) {
            $days[$ds] = ['capacity' => 0, 'booked' => 0, 'open' => false, 'past' => true];
            continue;
        }
        if (customReser_is_day_closed($pdo, $instanceId, $branchId, $ds)) {
            $days[$ds] = ['capacity' => 0, 'booked' => 0, 'open' => false, 'closed' => true];
            continue;
        }
        if ($mode === 'item') {
            $st = $pdo->prepare(
                'SELECT COALESCE(SUM(capacity),0) AS cap, COALESCE(SUM(booked),0) AS booked
                 FROM customReser_item_quota WHERE instance_id=? AND branch_id=? AND quota_date=?'
            );
        } else {
            $st = $pdo->prepare(
                'SELECT COALESCE(SUM(capacity),0) AS cap, COALESCE(SUM(booked),0) AS booked
                 FROM customReser_slot WHERE instance_id=? AND branch_id=? AND slot_date=?'
            );
        }
        $st->execute([$instanceId, $branchId, $ds]);
        $row = $st->fetch(PDO::FETCH_ASSOC);
        $cap = (int)($row['cap'] ?? 0);
        $b = (int)($row['booked'] ?? 0);
        $days[$ds] = [
            'capacity' => $cap,
            'booked' => $b,
            'remaining' => max(0, $cap - $b),
            'open' => $cap > $b,
        ];
    }
    return $days;
}

switch ($action) {

    case 'config': {
        $steps = $pdo->prepare(
            'SELECT step_key, sort_order, is_active FROM customReser_instance_step WHERE instance_id=? ORDER BY sort_order, id'
        );
        $steps->execute([$iid]);
        $branches = $pdo->prepare(
            'SELECT b.id, b.name, b.sort_order, r.name AS region_name
             FROM customReser_instance_branch ib
             INNER JOIN customReser_branch b ON b.id = ib.branch_id AND b.is_active = 1
             INNER JOIN customReser_region r ON r.id = b.region_id
             WHERE ib.instance_id = ?
             ORDER BY ib.sort_order, b.id'
        );
        $branches->execute([$iid]);
        $items = $pdo->prepare(
            'SELECT id, name, sort_order FROM customReser_instance_item WHERE instance_id = ? AND is_active = 1 ORDER BY sort_order, id'
        );
        $items->execute([$iid]);
        $fields = $pdo->prepare(
            'SELECT id, field_type, name_key, label, options_json, sort_order, is_required
             FROM customReser_instance_field WHERE instance_id = ? AND is_active = 1 ORDER BY sort_order, id'
        );
        $fields->execute([$iid]);
        $fl = $fields->fetchAll(PDO::FETCH_ASSOC);
        foreach ($fl as &$f) {
            $f['options'] = customReser_decode_options(is_string($f['options_json'] ?? null) ? $f['options_json'] : json_encode($f['options_json'] ?? []));
            unset($f['options_json']);
        }
        unset($f);
        $mode = customReser_capacity_mode($pdo, $iid);
        customReser_json_out([
            'ok' => true,
            'instance' => ['id' => $iid, 'name' => $inst['name'], 'slug' => $inst['slug']],
            'steps' => $steps->fetchAll(PDO::FETCH_ASSOC),
            'branches' => $branches->fetchAll(PDO::FETCH_ASSOC),
            'items' => $items->fetchAll(PDO::FETCH_ASSOC),
            'fields' => $fl,
            'capacity_mode' => $mode,
            'today' => customReser_today_ymd(),
        ]);
    }

    case 'calendar': {
        $branchId = (int)($in['branch_id'] ?? 0);
        $year = (int)($in['year'] ?? 0);
        $month = (int)($in['month'] ?? 0);
        if ($branchId < 1 || $year < 2000 || $month < 1 || $month > 12) {
            customReser_json_out(['ok' => false, 'msg' => 'branch_id, year, month 필요'], 400);
        }
        $chk = $pdo->prepare('SELECT 1 FROM customReser_instance_branch WHERE instance_id=? AND branch_id=?');
        $chk->execute([$iid, $branchId]);
        if (!$chk->fetchColumn()) {
            customReser_json_out(['ok' => false, 'msg' => '지점을 사용할 수 없습니다.'], 400);
        }
        $days = customReser_build_calendar($pdo, $iid, $branchId, $year, $month);
        customReser_json_out([
            'ok' => true,
            'days' => $days,
            'capacity_mode' => customReser_capacity_mode($pdo, $iid),
        ]);
    }

    case 'slots': {
        $branchId = (int)($in['branch_id'] ?? 0);
        $date = trim((string)($in['date'] ?? ''));
        if ($branchId < 1 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            customReser_json_out(['ok' => false, 'msg' => 'branch_id, date 필요'], 400);
        }
        if ($date < customReser_today_ymd()) {
            customReser_json_out(['ok' => false, 'msg' => '과거 날짜입니다.'], 400);
        }
        if (customReser_is_day_closed($pdo, $iid, $branchId, $date)) {
            customReser_json_out(['ok' => true, 'slots' => [], 'closed' => true]);
        }
        $st = $pdo->prepare(
            'SELECT id, slot_time, capacity, booked FROM customReser_slot
             WHERE instance_id=? AND branch_id=? AND slot_date=? ORDER BY slot_time'
        );
        $st->execute([$iid, $branchId, $date]);
        $rows = $st->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$r) {
            $r['available'] = (int)$r['capacity'] > (int)$r['booked'];
            $r['remaining'] = max(0, (int)$r['capacity'] - (int)$r['booked']);
            $r['slot_time'] = substr((string)$r['slot_time'], 0, 5);
        }
        unset($r);
        customReser_json_out(['ok' => true, 'slots' => $rows]);
    }

    case 'item_quotas': {
        $branchId = (int)($in['branch_id'] ?? 0);
        $date = trim((string)($in['date'] ?? ''));
        if ($branchId < 1 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            customReser_json_out(['ok' => false, 'msg' => 'branch_id, date 필요'], 400);
        }
        if ($date < customReser_today_ymd()) {
            customReser_json_out(['ok' => false, 'msg' => '과거 날짜입니다.'], 400);
        }
        if (customReser_is_day_closed($pdo, $iid, $branchId, $date)) {
            customReser_json_out(['ok' => true, 'quotas' => [], 'closed' => true]);
        }
        $st = $pdo->prepare(
            'SELECT q.id, q.item_id, q.capacity, q.booked, i.name AS item_name
             FROM customReser_item_quota q
             INNER JOIN customReser_instance_item i ON i.id = q.item_id AND i.is_active = 1
             WHERE q.instance_id = ? AND q.branch_id = ? AND q.quota_date = ?
             ORDER BY i.sort_order, i.id'
        );
        $st->execute([$iid, $branchId, $date]);
        $rows = $st->fetchAll(PDO::FETCH_ASSOC);
        foreach ($rows as &$r) {
            $r['available'] = (int)$r['capacity'] > (int)$r['booked'];
            $r['remaining'] = max(0, (int)$r['capacity'] - (int)$r['booked']);
        }
        unset($r);
        customReser_json_out(['ok' => true, 'quotas' => $rows]);
    }

    case 'book': {
        if ($method !== 'POST') {
            customReser_json_out(['ok' => false, 'msg' => 'POST only'], 405);
        }
        $created = customReser_booking_create($pdo, $iid, $in);
        if (!$created['ok']) {
            $msg = (string)($created['msg'] ?? '');
            $code = (strpos($msg, '마감') !== false || strpos($msg, '부족') !== false) ? 409 : 400;
            customReser_json_out($created, $code);
        }
        $bSt = $pdo->prepare('SELECT * FROM customReser_booking WHERE id = ?');
        $bSt->execute([(int)$created['id']]);
        $row = $bSt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            customReser_send_admin_notifications($pdo, $iid, $row);
        }
        customReser_json_out(['ok' => true, 'reservation_no' => $created['reservation_no'], 'id' => $created['id']]);
    }

    case 'lookup': {
        if ($method !== 'POST') {
            customReser_json_out(['ok' => false, 'msg' => 'POST only'], 405);
        }
        $no = trim((string)($in['reservation_no'] ?? ''));
        $name = trim((string)($in['customer_name'] ?? ''));
        $phone = trim((string)($in['customer_phone'] ?? ''));
        if ($no !== '') {
            $st = $pdo->prepare(
                'SELECT b.*, br.name AS branch_name, i.name AS item_name, s.slot_date, s.slot_time
                 FROM customReser_booking b
                 LEFT JOIN customReser_branch br ON br.id = b.branch_id
                 LEFT JOIN customReser_instance_item i ON i.id = b.item_id
                 LEFT JOIN customReser_slot s ON s.id = b.slot_id
                 WHERE b.instance_id = ? AND b.reservation_no = ? LIMIT 1'
            );
            $st->execute([$iid, $no]);
            customReser_json_out(['ok' => true, 'booking' => $st->fetch(PDO::FETCH_ASSOC), 'capacity_mode' => customReser_capacity_mode($pdo, $iid)]);
        }
        if ($name !== '' && $phone !== '') {
            $pn = customReser_normalize_phone($phone);
            $st = $pdo->prepare(
                'SELECT b.*, br.name AS branch_name, i.name AS item_name, s.slot_date, s.slot_time
                 FROM customReser_booking b
                 LEFT JOIN customReser_branch br ON br.id = b.branch_id
                 LEFT JOIN customReser_instance_item i ON i.id = b.item_id
                 LEFT JOIN customReser_slot s ON s.id = b.slot_id
                 WHERE b.instance_id = ? AND b.customer_name = ? AND b.customer_phone = ?
                 ORDER BY b.id DESC LIMIT 10'
            );
            $st->execute([$iid, $name, $pn !== '' ? $pn : $phone]);
            customReser_json_out(['ok' => true, 'list' => $st->fetchAll(PDO::FETCH_ASSOC), 'capacity_mode' => customReser_capacity_mode($pdo, $iid)]);
        }
        customReser_json_out(['ok' => false, 'msg' => '예약번호 또는 이름+연락처를 입력하세요.'], 400);
    }

    case 'user_cancel': {
        if ($method !== 'POST') {
            customReser_json_out(['ok' => false, 'msg' => 'POST only'], 405);
        }
        $no = trim((string)($in['reservation_no'] ?? ''));
        $phone = trim((string)($in['customer_phone'] ?? ''));
        if ($no === '' || $phone === '') {
            customReser_json_out(['ok' => false, 'msg' => '예약번호와 연락처를 입력하세요.'], 400);
        }
        $b = customReser_find_booking_for_customer($pdo, $iid, $no, $phone);
        if (!$b) {
            customReser_json_out(['ok' => false, 'msg' => '예약을 찾을 수 없습니다.'], 404);
        }
        if ($b['status'] !== '접수') {
            customReser_json_out(['ok' => false, 'msg' => '접수 상태에서만 취소할 수 있습니다.'], 400);
        }
        $pdo->beginTransaction();
        try {
            $lock = $pdo->prepare('SELECT * FROM customReser_booking WHERE id = ? FOR UPDATE');
            $lock->execute([(int)$b['id']]);
            $cur = $lock->fetch(PDO::FETCH_ASSOC);
            if (!$cur || $cur['status'] !== '접수') {
                $pdo->rollBack();
                customReser_json_out(['ok' => false, 'msg' => '접수 상태에서만 취소할 수 있습니다.'], 400);
            }
            customReser_release_booking_capacity($pdo, $cur);
            $pdo->prepare("UPDATE customReser_booking SET status = '취소' WHERE id = ?")->execute([(int)$cur['id']]);
            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            customReser_json_out(['ok' => false, 'msg' => '처리 실패'], 500);
        }
        customReser_json_out(['ok' => true]);
    }

    case 'user_reschedule': {
        if ($method !== 'POST') {
            customReser_json_out(['ok' => false, 'msg' => 'POST only'], 405);
        }
        $no = trim((string)($in['reservation_no'] ?? ''));
        $phone = trim((string)($in['customer_phone'] ?? ''));
        $newSlot = (int)($in['slot_id'] ?? 0);
        $newIq = (int)($in['item_quota_id'] ?? 0);
        if ($no === '' || $phone === '') {
            customReser_json_out(['ok' => false, 'msg' => '예약번호와 연락처를 입력하세요.'], 400);
        }
        $b = customReser_find_booking_for_customer($pdo, $iid, $no, $phone);
        if (!$b) {
            customReser_json_out(['ok' => false, 'msg' => '예약을 찾을 수 없습니다.'], 404);
        }
        $res = customReser_booking_reschedule($pdo, $b, $newSlot, $newIq);
        if (!$res['ok']) {
            customReser_json_out($res, 400);
        }
        customReser_json_out(['ok' => true]);
    }

    default:
        customReser_json_out(['ok' => false, 'msg' => 'unknown action'], 400);
}
