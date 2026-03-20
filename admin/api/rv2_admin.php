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
                rv2_json_out(['ok' => false, 'msg' => 'name_key ?꾩슂'], 400);
            }
            $label = trim((string)($in['label'] ?? ''));
            if ($label === '') {
                rv2_json_out(['ok' => false, 'msg' => '?쇰꺼 ?꾩슂'], 400);
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
                rv2_json_out(['ok' => false, 'msg' => 'id ?꾩슂'], 400);
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
                rv2_json_out(['ok' => false, 'msg' => 'steps 諛곗뿴 ?꾩슂'], 400);
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
                rv2_json_out(['ok' => false, 'msg' => '????ㅽ뙣'], 500);
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
                rv2_json_out(['ok' => false, 'msg' => '吏?먮챸 ?꾩슂'], 400);
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
                rv2_json_out(['ok' => false, 'msg' => 'id ?꾩슂'], 400);
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
                rv2_json_out(['ok' => false, 'msg' => '??ぉ紐??꾩슂'], 400);
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
                rv2_json_out(['ok' => false, 'msg' => 'id ?꾩슂'], 400);
            }
            $pdo->prepare('DELETE FROM rv2_item WHERE id=?')->execute([$id]);
            rv2_json_out(['ok' => true]);
        }

        case 'slot_list': {
            $branchId = (int)($in['branch_id'] ?? $_GET['branch_id'] ?? 0);
            $date = trim((string)($in['date'] ?? $_GET['date'] ?? ''));
            if ($branchId < 1 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                rv2_json_out(['ok' => false, 'msg' => 'branch_id, date ?꾩슂'], 400);
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
                rv2_json_out(['ok' => false, 'msg' => 'branch_id, date_from, date_to, times[] ?꾩슂'], 400);
            }
            $tStart = strtotime($from);
            $tEnd = strtotime($to);
            if ($tStart === false || $tEnd === false || $tStart > $tEnd) {
                rv2_json_out(['ok' => false, 'msg' => '?좎쭨 踰붿쐞 ?ㅻ쪟'], 400);
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
                rv2_json_out(['ok' => false, 'msg' => 'id ?꾩슂'], 400);
            }
            $bk = $pdo->prepare('SELECT booked FROM rv2_slot WHERE id=?');
            $bk->execute([$id]);
            if ((int)$bk->fetchColumn() > 0) {
                rv2_json_out(['ok' => false, 'msg' => '?덉빟???덈뒗 ?щ’? ??젣?????놁뒿?덈떎.'], 400);
            }
            $pdo->prepare('DELETE FROM rv2_slot WHERE id=?')->execute([$id]);
            rv2_json_out(['ok' => true]);
        }

        case 'slot_set_capacity': {
            $id = (int)($in['id'] ?? 0);
            $cap = (int)($in['capacity'] ?? 0);
            if ($id < 1 || $cap < 1) {
                rv2_json_out(['ok' => false, 'msg' => 'id, capacity(>=1) ?꾩슂'], 400);
            }
            $chk = $pdo->prepare('SELECT booked FROM rv2_slot WHERE id=?');
            $chk->execute([$id]);
            $booked = (int)$chk->fetchColumn();
            if ($booked > $cap) {
                rv2_json_out(['ok' => false, 'msg' => '?대? ?덉빟???섎낫???묎쾶 ?ㅼ젙?????놁뒿?덈떎.'], 400);
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
                rv2_json_out(['ok' => false, 'msg' => 'id ?꾩슂'], 400);
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
                    rv2_json_out(['ok' => false, 'msg' => '취소된 예약은 변경할 수 없습니다.'], 400);
                }
                if ($newStatus === '취소' && $old !== '취소' && !empty($b['slot_id'])) {
                    $pdo->prepare('UPDATE rv2_slot SET booked = GREATEST(0, booked - 1) WHERE id = ?')->execute([(int)$b['slot_id']]);
                }
                if ($old === '취소' && $newStatus !== '취소') {
                    /* 蹂듦뎄 ???щ’ ?ъ쬆媛??蹂꾨룄 ?뺤콉 ???앸왂 */
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
            if ($id < 1 || $newSlotId < 1) {
                rv2_json_out(['ok' => false, 'msg' => 'id, slot_id ?꾩슂'], 400);
            }
            $pdo->beginTransaction();
            try {
                $bSt = $pdo->prepare('SELECT * FROM rv2_booking WHERE id=? FOR UPDATE');
                $bSt->execute([$id]);
                $b = $bSt->fetch(PDO::FETCH_ASSOC);
                if (!$b || $b['status'] !== '접수') {
                    $pdo->rollBack();
                    rv2_json_out(['ok' => false, 'msg' => '접수 상태에서만 일정 변경이 가능합니다.'], 400);
                }
                $oldSlotId = (int)$b['slot_id'];
                $nSt = $pdo->prepare('SELECT * FROM rv2_slot WHERE id=? FOR UPDATE');
                $nSt->execute([$newSlotId]);
                $ns = $nSt->fetch(PDO::FETCH_ASSOC);
                if (!$ns || (int)$ns['branch_id'] !== (int)$b['branch_id']) {
                    $pdo->rollBack();
                    rv2_json_out(['ok' => false, 'msg' => '같은 지점의 시간만 선택하세요.'], 400);
                }
                if ((int)$ns['booked'] >= (int)$ns['capacity']) {
                    $pdo->rollBack();
                    rv2_json_out(['ok' => false, 'msg' => '선택한 시간은 마감되었습니다.'], 409);
                }
                $dateYmd = $ns['slot_date'];
                $timeHi = substr((string)$ns['slot_time'], 0, 5);
                $err = rv2_validate_same_day_two_hours($dateYmd, $timeHi);
                if ($err) {
                    $pdo->rollBack();
                    rv2_json_out(['ok' => false, 'msg' => $err], 400);
                }
                $resAt = $dateYmd . ' ' . substr((string)$ns['slot_time'], 0, 8);

                if ($oldSlotId > 0) {
                    $pdo->prepare('UPDATE rv2_slot SET booked = GREATEST(0, booked - 1) WHERE id=?')->execute([$oldSlotId]);
                }
                $up = $pdo->prepare('UPDATE rv2_slot SET booked = booked + 1 WHERE id=? AND booked < capacity');
                $up->execute([$newSlotId]);
                if ($up->rowCount() !== 1) {
                    if ($oldSlotId > 0) {
                        $pdo->prepare('UPDATE rv2_slot SET booked = booked + 1 WHERE id=?')->execute([$oldSlotId]);
                    }
                    $pdo->rollBack();
                    rv2_json_out(['ok' => false, 'msg' => '예약 가능 인원이 부족합니다.'], 409);
                }
                $pdo->prepare('UPDATE rv2_booking SET slot_id=?, reservation_at=? WHERE id=?')->execute([$newSlotId, $resAt, $id]);
                $pdo->commit();
            } catch (Throwable $e) {
                $pdo->rollBack();
                rv2_json_out(['ok' => false, 'msg' => '변경 실패'], 500);
            }
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
            $pdo->prepare(
                'INSERT INTO rv2_settings (id, notify_emails, spreadsheet_webhook, alimtalk_webhook)
                 VALUES (1,?,?,?)
                 ON DUPLICATE KEY UPDATE notify_emails=VALUES(notify_emails), spreadsheet_webhook=VALUES(spreadsheet_webhook), alimtalk_webhook=VALUES(alimtalk_webhook)'
            )->execute([$emails, $sheet !== '' ? $sheet : null, $alim !== '' ? $alim : null]);
            rv2_json_out(['ok' => true]);
        }

        default:
            rv2_json_out(['ok' => false, 'msg' => 'unknown action'], 400);
    }
} catch (Throwable $e) {
    rv2_json_out(['ok' => false, 'msg' => '서버 오류: ' . $e->getMessage()], 500);
}
