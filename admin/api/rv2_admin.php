<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/db.php';
require_once dirname(__DIR__) . '/config/session.php';
require_once dirname(__DIR__, 2) . '/lib/rv2_helpers.php';
require_once dirname(__DIR__, 2) . '/lib/rv2_notify.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$action = (string)($_GET['action'] ?? '');
$in = rv2_read_json_body();
if ($action === '' && isset($in['action'])) {
    $action = (string)$in['action'];
}

if ($action === 'export_csv' && $method === 'GET') {
    requireLogin();
    try {
        rv2_auto_complete_past($pdo);
    } catch (Throwable $e) {
    }
    $status = trim((string)($_GET['status'] ?? ''));
    $q = trim((string)($_GET['q'] ?? ''));
    $from = trim((string)($_GET['from'] ?? ''));
    $to = trim((string)($_GET['to'] ?? ''));
    $branchId = (int)($_GET['branch_id'] ?? 0);

    $sql = 'SELECT b.reservation_no, b.status, b.reservation_at, b.customer_name, b.customer_phone, b.customer_email,
            br.name AS branch_name, i.name AS item_name, b.admin_note, b.created_at
            FROM rv2_booking b
            LEFT JOIN rv2_branch br ON br.id = b.branch_id
            LEFT JOIN rv2_item i ON i.id = b.item_id
            WHERE 1=1';
    $params = [];
    if ($status !== '' && in_array($status, ['접수', '확인', '완료', '취소'], true)) {
        $sql .= ' AND b.status = ?';
        $params[] = $status;
    }
    if ($branchId > 0) {
        $sql .= ' AND b.branch_id = ?';
        $params[] = $branchId;
    }
    if ($from !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $from)) {
        $sql .= ' AND DATE(b.reservation_at) >= ?';
        $params[] = $from;
    }
    if ($to !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $to)) {
        $sql .= ' AND DATE(b.reservation_at) <= ?';
        $params[] = $to;
    }
    if ($q !== '') {
        $sql .= ' AND (b.customer_name LIKE ? OR b.customer_phone LIKE ? OR b.reservation_no LIKE ?)';
        $like = '%' . $q . '%';
        $params[] = $like;
        $params[] = $like;
        $params[] = $like;
    }
    $sql .= ' ORDER BY b.reservation_at DESC, b.id DESC';

    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="rv2_reservations_' . date('Ymd_His') . '.csv"');
    echo "\xEF\xBB\xBF";
    $out = fopen('php://output', 'w');
    fputcsv($out, ['예약번호', '상태', '예약일시', '이름', '연락처', '이메일', '지점', '항목', '관리메모', '접수일시']);
    $st = $pdo->prepare($sql);
    $st->execute($params);
    while ($row = $st->fetch(PDO::FETCH_ASSOC)) {
        fputcsv($out, [
            $row['reservation_no'],
            $row['status'],
            $row['reservation_at'],
            $row['customer_name'],
            $row['customer_phone'],
            $row['customer_email'],
            $row['branch_name'],
            $row['item_name'],
            $row['admin_note'],
            $row['created_at'],
        ]);
    }
    fclose($out);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

requireLogin();

try {
    rv2_auto_complete_past($pdo);
} catch (Throwable $e) {
}

try {
    switch ($action) {

        case 'fields_list':
            $rows = $pdo->query('SELECT * FROM rv2_field ORDER BY sort_order, id')->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as &$r) {
                $r['options'] = rv2_decode_options(is_string($r['options_json'] ?? null) ? $r['options_json'] : json_encode($r['options_json'] ?? []));
            }
            unset($r);
            rv2_json_out(['ok' => true, 'fields' => $rows]);

        case 'field_save': {
            $id = isset($in['id']) ? (int)$in['id'] : 0;
            $type = (string)($in['field_type'] ?? '');
            $allowed = ['date', 'time', 'text', 'radio', 'checkbox', 'dropdown', 'daterange'];
            if (!in_array($type, $allowed, true)) {
                rv2_json_out(['ok' => false, 'msg' => '유효하지 않은 필드 타입'], 400);
            }
            $nameKey = preg_replace('/[^a-z0-9_]/i', '_', (string)($in['name_key'] ?? ''));
            if ($nameKey === '') {
                rv2_json_out(['ok' => false, 'msg' => 'name_key가 필요합니다.'], 400);
            }
            $label = trim((string)($in['label'] ?? ''));
            if ($label === '') {
                rv2_json_out(['ok' => false, 'msg' => '라벨이 필요합니다.'], 400);
            }
            $opts = isset($in['options']) && is_array($in['options']) ? json_encode($in['options'], JSON_UNESCAPED_UNICODE) : null;
            $sort = (int)($in['sort_order'] ?? 0);
            $req = !empty($in['is_required']) ? 1 : 0;
            $act = !empty($in['is_active']) ? 1 : 0;
            if ($id > 0) {
                $st = $pdo->prepare(
                    'UPDATE rv2_field SET field_type=?, name_key=?, label=?, options_json=?, sort_order=?, is_required=?, is_active=? WHERE id=?'
                );
                $st->execute([$type, $nameKey, $label, $opts, $sort, $req, $act, $id]);
            } else {
                $st = $pdo->prepare(
                    'INSERT INTO rv2_field (field_type, name_key, label, options_json, sort_order, is_required, is_active) VALUES (?,?,?,?,?,?,?)'
                );
                $st->execute([$type, $nameKey, $label, $opts, $sort, $req, $act]);
                $id = (int)$pdo->lastInsertId();
            }
            rv2_json_out(['ok' => true, 'id' => $id]);
        }

        case 'field_delete': {
            $id = (int)($in['id'] ?? 0);
            if ($id < 1) {
                rv2_json_out(['ok' => false, 'msg' => 'id가 필요합니다.'], 400);
            }
            $pdo->prepare('DELETE FROM rv2_field WHERE id=?')->execute([$id]);
            rv2_json_out(['ok' => true]);
        }

        case 'steps_list':
            $rows = $pdo->query('SELECT * FROM rv2_step ORDER BY sort_order, id')->fetchAll(PDO::FETCH_ASSOC);
            rv2_json_out(['ok' => true, 'steps' => $rows]);

        case 'steps_save': {
            $steps = $in['steps'] ?? [];
            if (!is_array($steps)) {
                rv2_json_out(['ok' => false, 'msg' => 'steps 배열이 필요합니다.'], 400);
            }
            $pdo->beginTransaction();
            try {
                $u = $pdo->prepare('UPDATE rv2_step SET sort_order=?, is_active=? WHERE step_key=?');
                foreach ($steps as $s) {
                    $key = (string)($s['step_key'] ?? '');
                    if ($key === '') {
                        continue;
                    }
                    $u->execute([(int)($s['sort_order'] ?? 0), !empty($s['is_active']) ? 1 : 0, $key]);
                }
                $pdo->commit();
            } catch (Throwable $e) {
                $pdo->rollBack();
                rv2_json_out(['ok' => false, 'msg' => '저장 실패'], 500);
            }
            rv2_json_out(['ok' => true]);
        }

        case 'branch_list':
            $rows = $pdo->query('SELECT * FROM rv2_branch ORDER BY sort_order, id')->fetchAll(PDO::FETCH_ASSOC);
            rv2_json_out(['ok' => true, 'branches' => $rows]);

        case 'branch_save': {
            $id = (int)($in['id'] ?? 0);
            $name = trim((string)($in['name'] ?? ''));
            if ($name === '') {
                rv2_json_out(['ok' => false, 'msg' => '지점명이 필요합니다.'], 400);
            }
            $sort = (int)($in['sort_order'] ?? 0);
            $act = !empty($in['is_active']) ? 1 : 0;
            if ($id > 0) {
                $pdo->prepare('UPDATE rv2_branch SET name=?, sort_order=?, is_active=? WHERE id=?')->execute([$name, $sort, $act, $id]);
            } else {
                $pdo->prepare('INSERT INTO rv2_branch (name, sort_order, is_active) VALUES (?,?,?)')->execute([$name, $sort, $act]);
                $id = (int)$pdo->lastInsertId();
            }
            rv2_json_out(['ok' => true, 'id' => $id]);
        }

        case 'branch_delete': {
            $id = (int)($in['id'] ?? 0);
            if ($id < 1) {
                rv2_json_out(['ok' => false, 'msg' => 'id가 필요합니다.'], 400);
            }
            $pdo->prepare('DELETE FROM rv2_branch WHERE id=?')->execute([$id]);
            rv2_json_out(['ok' => true]);
        }

        case 'item_list':
            $rows = $pdo->query('SELECT * FROM rv2_item ORDER BY sort_order, id')->fetchAll(PDO::FETCH_ASSOC);
            rv2_json_out(['ok' => true, 'items' => $rows]);

        case 'item_save': {
            $id = (int)($in['id'] ?? 0);
            $name = trim((string)($in['name'] ?? ''));
            if ($name === '') {
                rv2_json_out(['ok' => false, 'msg' => '항목명이 필요합니다.'], 400);
            }
            $sort = (int)($in['sort_order'] ?? 0);
            $act = !empty($in['is_active']) ? 1 : 0;
            if ($id > 0) {
                $pdo->prepare('UPDATE rv2_item SET name=?, sort_order=?, is_active=? WHERE id=?')->execute([$name, $sort, $act, $id]);
            } else {
                $pdo->prepare('INSERT INTO rv2_item (name, sort_order, is_active) VALUES (?,?,?)')->execute([$name, $sort, $act]);
                $id = (int)$pdo->lastInsertId();
            }
            rv2_json_out(['ok' => true, 'id' => $id]);
        }

        case 'item_delete': {
            $id = (int)($in['id'] ?? 0);
            if ($id < 1) {
                rv2_json_out(['ok' => false, 'msg' => 'id가 필요합니다.'], 400);
            }
            $pdo->prepare('DELETE FROM rv2_item WHERE id=?')->execute([$id]);
            rv2_json_out(['ok' => true]);
        }

        case 'slot_list': {
            $branchId = (int)($in['branch_id'] ?? $_GET['branch_id'] ?? 0);
            $date = trim((string)($in['date'] ?? $_GET['date'] ?? ''));
            if ($branchId < 1 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                rv2_json_out(['ok' => false, 'msg' => 'branch_id, date가 필요합니다.'], 400);
            }
            $st = $pdo->prepare('SELECT * FROM rv2_slot WHERE branch_id=? AND slot_date=? ORDER BY slot_time');
            $st->execute([$branchId, $date]);
            rv2_json_out(['ok' => true, 'slots' => $st->fetchAll(PDO::FETCH_ASSOC)]);
        }

        case 'slot_bulk_create': {
            $branchId = (int)($in['branch_id'] ?? 0);
            $from = trim((string)($in['date_from'] ?? ''));
            $to = trim((string)($in['date_to'] ?? ''));
            $times = $in['times'] ?? [];
            $capacity = max(1, (int)($in['capacity'] ?? 1));
            if ($branchId < 1 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $from) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $to) || !is_array($times) || empty($times)) {
                rv2_json_out(['ok' => false, 'msg' => 'branch_id, date_from, date_to, times[]가 필요합니다.'], 400);
            }
            $tStart = strtotime($from);
            $tEnd = strtotime($to);
            if ($tStart === false || $tEnd === false || $tStart > $tEnd) {
                rv2_json_out(['ok' => false, 'msg' => '날짜 범위가 올바르지 않습니다.'], 400);
            }
            $ins = $pdo->prepare(
                'INSERT INTO rv2_slot (branch_id, slot_date, slot_time, capacity, booked)
                 VALUES (?,?,?,?,0)
                 ON DUPLICATE KEY UPDATE capacity = VALUES(capacity)'
            );
            $cnt = 0;
            for ($t = $tStart; $t <= $tEnd; $t += 86400) {
                $d = date('Y-m-d', $t);
                foreach ($times as $tm) {
                    $tm = trim((string)$tm);
                    if (!preg_match('/^\d{1,2}:\d{2}$/', $tm)) {
                        continue;
                    }
                    $parts = explode(':', $tm);
                    $h = str_pad($parts[0], 2, '0', STR_PAD_LEFT);
                    $m = str_pad($parts[1], 2, '0', STR_PAD_LEFT);
                    $timeSql = $h . ':' . $m . ':00';
                    $ins->execute([$branchId, $d, $timeSql, $capacity]);
                    $cnt++;
                }
            }
            rv2_json_out(['ok' => true, 'inserted_or_updated' => $cnt]);
        }

        case 'slot_delete': {
            $id = (int)($in['id'] ?? 0);
            if ($id < 1) {
                rv2_json_out(['ok' => false, 'msg' => 'id가 필요합니다.'], 400);
            }
            $bk = $pdo->prepare('SELECT booked FROM rv2_slot WHERE id=?');
            $bk->execute([$id]);
            if ((int)$bk->fetchColumn() > 0) {
                rv2_json_out(['ok' => false, 'msg' => '예약이 있는 슬롯은 삭제할 수 없습니다.'], 400);
            }
            $pdo->prepare('DELETE FROM rv2_slot WHERE id=?')->execute([$id]);
            rv2_json_out(['ok' => true]);
        }

        case 'slot_set_capacity': {
            $id = (int)($in['id'] ?? 0);
            $cap = (int)($in['capacity'] ?? 0);
            if ($id < 1 || $cap < 1) {
                rv2_json_out(['ok' => false, 'msg' => 'id, capacity(>=1)가 필요합니다.'], 400);
            }
            $chk = $pdo->prepare('SELECT booked FROM rv2_slot WHERE id=?');
            $chk->execute([$id]);
            $booked = (int)$chk->fetchColumn();
            if ($booked > $cap) {
                rv2_json_out(['ok' => false, 'msg' => '이미 예약 건수보다 작게 설정할 수 없습니다.'], 400);
            }
            $pdo->prepare('UPDATE rv2_slot SET capacity=? WHERE id=?')->execute([$cap, $id]);
            rv2_json_out(['ok' => true]);
        }

        case 'booking_list': {
            $page = max(1, (int)($in['page'] ?? $_GET['page'] ?? 1));
            $per = min(100, max(10, (int)($in['per_page'] ?? $_GET['per_page'] ?? 20)));
            $offset = ($page - 1) * $per;
            $status = trim((string)($in['status'] ?? $_GET['status'] ?? ''));
            $q = trim((string)($in['q'] ?? $_GET['q'] ?? ''));
            $from = trim((string)($in['from'] ?? $_GET['from'] ?? ''));
            $to = trim((string)($in['to'] ?? $_GET['to'] ?? ''));
            $branchId = (int)($in['branch_id'] ?? $_GET['branch_id'] ?? 0);

            $where = '1=1';
            $params = [];
            if ($status !== '' && in_array($status, ['접수', '확인', '완료', '취소'], true)) {
                $where .= ' AND b.status = ?';
                $params[] = $status;
            }
            if ($branchId > 0) {
                $where .= ' AND b.branch_id = ?';
                $params[] = $branchId;
            }
            if ($from !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $from)) {
                $where .= ' AND DATE(b.reservation_at) >= ?';
                $params[] = $from;
            }
            if ($to !== '' && preg_match('/^\d{4}-\d{2}-\d{2}$/', $to)) {
                $where .= ' AND DATE(b.reservation_at) <= ?';
                $params[] = $to;
            }
            if ($q !== '') {
                $where .= ' AND (b.customer_name LIKE ? OR b.customer_phone LIKE ? OR b.reservation_no LIKE ?)';
                $like = '%' . $q . '%';
                $params[] = $like;
                $params[] = $like;
                $params[] = $like;
            }
            $cntSql = "SELECT COUNT(*) FROM rv2_booking b WHERE $where";
            $stc = $pdo->prepare($cntSql);
            $stc->execute($params);
            $total = (int)$stc->fetchColumn();

            $sql = "SELECT b.*, br.name AS branch_name, i.name AS item_name, s.slot_date, s.slot_time
                    FROM rv2_booking b
                    LEFT JOIN rv2_branch br ON br.id = b.branch_id
                    LEFT JOIN rv2_item i ON i.id = b.item_id
                    LEFT JOIN rv2_slot s ON s.id = b.slot_id
                    WHERE $where
                    ORDER BY b.reservation_at DESC, b.id DESC
                    LIMIT $per OFFSET $offset";
            $st = $pdo->prepare($sql);
            $st->execute($params);
            rv2_json_out(['ok' => true, 'total' => $total, 'page' => $page, 'rows' => $st->fetchAll(PDO::FETCH_ASSOC)]);
        }

        case 'booking_get': {
            $id = (int)($in['id'] ?? $_GET['id'] ?? 0);
            if ($id < 1) {
                rv2_json_out(['ok' => false, 'msg' => 'id가 필요합니다.'], 400);
            }
            $st = $pdo->prepare(
                'SELECT b.*, br.name AS branch_name, i.name AS item_name, s.slot_date, s.slot_time
                 FROM rv2_booking b
                 LEFT JOIN rv2_branch br ON br.id = b.branch_id
                 LEFT JOIN rv2_item i ON i.id = b.item_id
                 LEFT JOIN rv2_slot s ON s.id = b.slot_id
                 WHERE b.id = ? LIMIT 1'
            );
            $st->execute([$id]);
            $row = $st->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $row['capacity_mode'] = rv2_get_capacity_mode($pdo);
            }
            rv2_json_out(['ok' => true, 'booking' => $row]);
        }

        case 'booking_set_status': {
            $id = (int)($in['id'] ?? 0);
            $newStatus = (string)($in['status'] ?? '');
            if ($id < 1 || !in_array($newStatus, ['접수', '확인', '완료', '취소'], true)) {
                rv2_json_out(['ok' => false, 'msg' => 'id, status 필요'], 400);
            }
            $st = $pdo->prepare('SELECT * FROM rv2_booking WHERE id=? FOR UPDATE');
            $pdo->beginTransaction();
            try {
                $st->execute([$id]);
                $b = $st->fetch(PDO::FETCH_ASSOC);
                if (!$b) {
                    $pdo->rollBack();
                    rv2_json_out(['ok' => false, 'msg' => '없음'], 404);
                }
                $old = $b['status'];
                if ($old === '취소' && $newStatus !== '취소') {
                    $pdo->rollBack();
                    rv2_json_out(['ok' => false, 'msg' => '취소된 예약은 복구할 수 없습니다.'], 400);
                }
                if ($newStatus === '취소' && $old !== '취소') {
                    rv2_release_booking_capacity($pdo, $b);
                }
                $note = array_key_exists('admin_note', $in) ? (string)$in['admin_note'] : null;
                if ($note !== null) {
                    $pdo->prepare('UPDATE rv2_booking SET status=?, admin_note=? WHERE id=?')->execute([$newStatus, $note, $id]);
                } else {
                    $pdo->prepare('UPDATE rv2_booking SET status=? WHERE id=?')->execute([$newStatus, $id]);
                }
                $pdo->commit();
            } catch (Throwable $e) {
                $pdo->rollBack();
                rv2_json_out(['ok' => false, 'msg' => '처리 실패'], 500);
            }
            rv2_json_out(['ok' => true]);
        }

        case 'booking_reschedule': {
            $id = (int)($in['id'] ?? 0);
            $newSlotId = (int)($in['slot_id'] ?? 0);
            $newItemQuotaId = (int)($in['item_quota_id'] ?? 0);
            if ($id < 1) {
                rv2_json_out(['ok' => false, 'msg' => 'id가 필요합니다.'], 400);
            }
            $bSt = $pdo->prepare('SELECT * FROM rv2_booking WHERE id=?');
            $bSt->execute([$id]);
            $b = $bSt->fetch(PDO::FETCH_ASSOC);
            if (!$b) {
                rv2_json_out(['ok' => false, 'msg' => '없음'], 404);
            }
            $res = rv2_booking_reschedule($pdo, $b, $newSlotId, $newItemQuotaId);
            if (!$res['ok']) {
                $msg = (string)($res['msg'] ?? '');
                $code = (strpos($msg, '마감') !== false || strpos($msg, '부족') !== false) ? 409 : 400;
                rv2_json_out($res, $code);
            }
            rv2_json_out(['ok' => true]);
        }

        case 'booking_admin_create': {
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
            rv2_json_out(['ok' => true, 'id' => $created['id'], 'reservation_no' => $created['reservation_no']]);
        }

        case 'item_quota_list': {
            $branchId = (int)($in['branch_id'] ?? $_GET['branch_id'] ?? 0);
            $date = trim((string)($in['date'] ?? $_GET['date'] ?? ''));
            if ($branchId < 1 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                rv2_json_out(['ok' => false, 'msg' => 'branch_id, date가 필요합니다.'], 400);
            }
            $st = $pdo->prepare(
                'SELECT q.*, i.name AS item_name
                 FROM rv2_item_quota q
                 INNER JOIN rv2_item i ON i.id = q.item_id
                 WHERE q.branch_id = ? AND q.quota_date = ?
                 ORDER BY i.sort_order ASC, i.id ASC'
            );
            $st->execute([$branchId, $date]);
            rv2_json_out(['ok' => true, 'quotas' => $st->fetchAll(PDO::FETCH_ASSOC)]);
        }

        case 'item_quota_bulk_create': {
            $branchId = (int)($in['branch_id'] ?? 0);
            $from = trim((string)($in['date_from'] ?? ''));
            $to = trim((string)($in['date_to'] ?? ''));
            $itemIds = $in['item_ids'] ?? [];
            if (!is_array($itemIds)) {
                $itemIds = [];
            }
            $capacity = max(1, (int)($in['capacity'] ?? 1));
            if ($branchId < 1 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $from) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $to)) {
                rv2_json_out(['ok' => false, 'msg' => 'branch_id, date_from, date_to가 필요합니다.'], 400);
            }
            $tStart = strtotime($from);
            $tEnd = strtotime($to);
            if ($tStart === false || $tEnd === false || $tStart > $tEnd) {
                rv2_json_out(['ok' => false, 'msg' => '날짜 범위가 올바르지 않습니다.'], 400);
            }
            if (empty($itemIds)) {
                $itemIds = $pdo->query('SELECT id FROM rv2_item WHERE is_active = 1')->fetchAll(PDO::FETCH_COLUMN);
            }
            $itemIds = array_map('intval', $itemIds);
            $itemIds = array_filter($itemIds, function ($x) {
                return $x > 0;
            });
            if (empty($itemIds)) {
                rv2_json_out(['ok' => false, 'msg' => '활성 항목이 없습니다.'], 400);
            }
            $ins = $pdo->prepare(
                'INSERT INTO rv2_item_quota (branch_id, item_id, quota_date, capacity, booked)
                 VALUES (?,?,?,?,0)
                 ON DUPLICATE KEY UPDATE capacity = VALUES(capacity)'
            );
            $cnt = 0;
            for ($t = $tStart; $t <= $tEnd; $t += 86400) {
                $d = date('Y-m-d', $t);
                foreach ($itemIds as $iid) {
                    $ins->execute([$branchId, $iid, $d, $capacity]);
                    $cnt++;
                }
            }
            rv2_json_out(['ok' => true, 'inserted_or_updated' => $cnt]);
        }

        case 'item_quota_delete': {
            $id = (int)($in['id'] ?? 0);
            if ($id < 1) {
                rv2_json_out(['ok' => false, 'msg' => 'id가 필요합니다.'], 400);
            }
            $bk = $pdo->prepare('SELECT booked FROM rv2_item_quota WHERE id=?');
            $bk->execute([$id]);
            if ((int)$bk->fetchColumn() > 0) {
                rv2_json_out(['ok' => false, 'msg' => '예약이 있는 항목 일정은 삭제할 수 없습니다.'], 400);
            }
            $pdo->prepare('DELETE FROM rv2_item_quota WHERE id=?')->execute([$id]);
            rv2_json_out(['ok' => true]);
        }

        case 'item_quota_set_capacity': {
            $id = (int)($in['id'] ?? 0);
            $cap = (int)($in['capacity'] ?? 0);
            if ($id < 1 || $cap < 1) {
                rv2_json_out(['ok' => false, 'msg' => 'id, capacity(>=1)가 필요합니다.'], 400);
            }
            $chk = $pdo->prepare('SELECT booked FROM rv2_item_quota WHERE id=?');
            $chk->execute([$id]);
            $booked = (int)$chk->fetchColumn();
            if ($booked > $cap) {
                rv2_json_out(['ok' => false, 'msg' => '이미 예약 건수보다 작게 설정할 수 없습니다.'], 400);
            }
            $pdo->prepare('UPDATE rv2_item_quota SET capacity=? WHERE id=?')->execute([$cap, $id]);
            rv2_json_out(['ok' => true]);
        }

        case 'settings_get': {
            $row = $pdo->query('SELECT * FROM rv2_settings WHERE id=1')->fetch(PDO::FETCH_ASSOC);
            rv2_json_out(['ok' => true, 'settings' => $row ?: []]);
        }

        case 'settings_save': {
            $emails = trim((string)($in['notify_emails'] ?? ''));
            $sheet = trim((string)($in['spreadsheet_webhook'] ?? ''));
            $alim = trim((string)($in['alimtalk_webhook'] ?? ''));
            $useEm = !empty($in['notify_use_email']) ? 1 : 0;
            $useSh = !empty($in['notify_use_sheet']) ? 1 : 0;
            $useAl = !empty($in['notify_use_alim']) ? 1 : 0;
            $pdo->prepare(
                'INSERT INTO rv2_settings (id, notify_emails, spreadsheet_webhook, alimtalk_webhook, notify_use_email, notify_use_sheet, notify_use_alim)
                 VALUES (1,?,?,?,?,?,?)
                 ON DUPLICATE KEY UPDATE notify_emails=VALUES(notify_emails), spreadsheet_webhook=VALUES(spreadsheet_webhook), alimtalk_webhook=VALUES(alimtalk_webhook), notify_use_email=VALUES(notify_use_email), notify_use_sheet=VALUES(notify_use_sheet), notify_use_alim=VALUES(notify_use_alim)'
            )->execute([$emails, $sheet !== '' ? $sheet : null, $alim !== '' ? $alim : null, $useEm, $useSh, $useAl]);
            rv2_json_out(['ok' => true]);
        }

        case 'meta':
            rv2_json_out(['ok' => true, 'capacity_mode' => rv2_get_capacity_mode($pdo)]);

        default:
            rv2_json_out(['ok' => false, 'msg' => 'unknown action'], 400);
    }
} catch (Throwable $e) {
    rv2_json_out(['ok' => false, 'msg' => '서버 오류: ' . $e->getMessage()], 500);
}
