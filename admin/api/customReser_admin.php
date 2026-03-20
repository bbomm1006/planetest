<?php
declare(strict_types=1);

// 경고/HTML이 앞에 붙으면 브라우저에서 JSON 파싱이 깨짐(Unexpected token '<')
ini_set('display_errors', '0');

header('Content-Type: application/json; charset=utf-8');

try {
    require_once dirname(__DIR__) . '/config/db_customReser.php';
    require_once dirname(__DIR__) . '/config/session.php';
    require_once dirname(__DIR__, 2) . '/lib/customReser_helpers.php';
    require_once dirname(__DIR__, 2) . '/lib/customReser_notify.php';
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'msg' => '예약 모듈 파일을 불러오지 못했습니다.',
        'detail' => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $pdo = getCustomReserDB();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'msg' => 'DB 연결 실패(db.php의 DB_HOST/DB_NAME/계정). 호스트·비밀번호·DB명을 확인하세요.',
        'detail' => $e->getMessage(),
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$in = customReser_read_json_body();
if ($method === 'GET' && empty($in)) {
    $in = $_GET;
}
$action = (string)($in['action'] ?? $_GET['action'] ?? '');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    customReser_auto_complete_past($pdo);
} catch (Throwable $e) {
}

if ($action === 'instance_list' && $method === 'GET') {
    requireLogin();
    try {
        $rows = $pdo->query('SELECT * FROM customReser_instance ORDER BY sort_order, id')->fetchAll(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        customReser_json_out([
            'ok' => false,
            'msg' => 'DB는 연결됐지만 `customReser_instance` 등 테이블 쿼리에 실패했습니다. db.php와 같은 DB에 customReser_schema.sql을 적용했는지 확인하세요.',
            'detail' => $e->getMessage(),
        ], 500);
    }
    customReser_json_out(['ok' => true, 'instances' => $rows]);
}

requireLogin();

try {
    switch ($action) {

        case 'instance_save': {
            $id = (int)($in['id'] ?? 0);
            $name = trim((string)($in['name'] ?? ''));
            $slug = strtolower(trim((string)($in['slug'] ?? '')));
            $act = !empty($in['is_active']) ? 1 : 0;
            $sort = (int)($in['sort_order'] ?? 0);
            if ($name === '' || $slug === '' || !preg_match('/^[a-z0-9\-]+$/', $slug)) {
                customReser_json_out(['ok' => false, 'msg' => '이름·slug(영문소문자·숫자·하이픈) 필요'], 400);
            }
            if ($id > 0) {
                $chk = $pdo->prepare('SELECT id FROM customReser_instance WHERE slug=? AND id<>?');
                $chk->execute([$slug, $id]);
                if ($chk->fetchColumn()) {
                    customReser_json_out(['ok' => false, 'msg' => '이미 사용 중인 slug'], 400);
                }
                $pdo->prepare('UPDATE customReser_instance SET name=?, slug=?, is_active=?, sort_order=? WHERE id=?')
                    ->execute([$name, $slug, $act, $sort, $id]);
                customReser_json_out(['ok' => true, 'id' => $id]);
            }
            $chk = $pdo->prepare('SELECT id FROM customReser_instance WHERE slug=?');
            $chk->execute([$slug]);
            if ($chk->fetchColumn()) {
                customReser_json_out(['ok' => false, 'msg' => '이미 사용 중인 slug'], 400);
            }
            $pdo->prepare('INSERT INTO customReser_instance (name, slug, is_active, sort_order) VALUES (?,?,?,?)')
                ->execute([$name, $slug, $act, $sort]);
            $newId = (int)$pdo->lastInsertId();
            $pdo->prepare(
                'INSERT INTO customReser_instance_settings (instance_id, notify_emails, notify_use_email, notify_use_sheet, notify_use_alim)
                 VALUES (?,?,1,0,0)'
            )->execute([$newId, '']);
            customReser_seed_default_steps($pdo, $newId);
            customReser_json_out(['ok' => true, 'id' => $newId]);
        }

        case 'instance_delete': {
            $id = (int)($in['id'] ?? 0);
            if ($id < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'id 필요'], 400);
            }
            $pdo->prepare('DELETE FROM customReser_instance WHERE id=?')->execute([$id]);
            customReser_json_out(['ok' => true]);
        }

        case 'meta': {
            $iid = (int)($in['instance_id'] ?? 0);
            if ($iid < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id 필요'], 400);
            }
            customReser_json_out(['ok' => true, 'capacity_mode' => customReser_capacity_mode($pdo, $iid)]);
        }

        case 'steps_list': {
            $iid = (int)($in['instance_id'] ?? $_GET['instance_id'] ?? 0);
            if ($iid < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id 필요'], 400);
            }
            $st = $pdo->prepare('SELECT * FROM customReser_instance_step WHERE instance_id=? ORDER BY sort_order, id');
            $st->execute([$iid]);
            customReser_json_out(['ok' => true, 'steps' => $st->fetchAll(PDO::FETCH_ASSOC)]);
        }

        case 'steps_save': {
            $iid = (int)($in['instance_id'] ?? 0);
            $steps = $in['steps'] ?? [];
            if ($iid < 1 || !is_array($steps)) {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id, steps[] 필요'], 400);
            }
            $allowed_keys = ['branch', 'date', 'time', 'item', 'info'];
            $pdo->beginTransaction();
            try {
                $u = $pdo->prepare(
                    'INSERT INTO customReser_instance_step (instance_id, step_key, sort_order, is_active)
                     VALUES (?,?,?,?)
                     ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order), is_active = VALUES(is_active)'
                );
                foreach ($steps as $s) {
                    $k = (string)($s['step_key'] ?? '');
                    if ($k === '' || !in_array($k, $allowed_keys, true)) {
                        continue;
                    }
                    $u->execute([$iid, $k, (int)($s['sort_order'] ?? 0), !empty($s['is_active']) ? 1 : 0]);
                }
                $pdo->commit();
            } catch (Throwable $e) {
                $pdo->rollBack();
                customReser_json_out(['ok' => false, 'msg' => '저장 실패: ' . $e->getMessage()], 500);
            }
            customReser_json_out(['ok' => true]);
        }

        case 'fields_list': {
            $iid = (int)($in['instance_id'] ?? $_GET['instance_id'] ?? 0);
            if ($iid < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id 필요'], 400);
            }
            $rows = $pdo->prepare('SELECT * FROM customReser_instance_field WHERE instance_id=? ORDER BY sort_order, id');
            $rows->execute([$iid]);
            $list = $rows->fetchAll(PDO::FETCH_ASSOC);
            foreach ($list as &$r) {
                $r['options'] = customReser_decode_options(is_string($r['options_json'] ?? null) ? $r['options_json'] : json_encode($r['options_json'] ?? []));
            }
            unset($r);
            customReser_json_out(['ok' => true, 'fields' => $list]);
        }

        case 'field_save': {
            $iid = (int)($in['instance_id'] ?? 0);
            $id = (int)($in['id'] ?? 0);
            $type = (string)($in['field_type'] ?? '');
            $allowed = ['text', 'phone', 'email', 'radio', 'checkbox', 'dropdown'];
            if ($iid < 1 || !in_array($type, $allowed, true)) {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id, field_type 필요'], 400);
            }
            $nameKey = preg_replace('/[^a-z0-9_]/i', '_', (string)($in['name_key'] ?? ''));
            $label = trim((string)($in['label'] ?? ''));
            if ($nameKey === '' || $label === '') {
                customReser_json_out(['ok' => false, 'msg' => 'name_key, label 필요'], 400);
            }
            $opts = isset($in['options']) && is_array($in['options']) ? json_encode($in['options'], JSON_UNESCAPED_UNICODE) : null;
            $sort = (int)($in['sort_order'] ?? 0);
            $req = !empty($in['is_required']) ? 1 : 0;
            $act = !empty($in['is_active']) ? 1 : 0;
            if ($id > 0) {
                $pdo->prepare(
                    'UPDATE customReser_instance_field SET field_type=?, name_key=?, label=?, options_json=?, sort_order=?, is_required=?, is_active=?
                     WHERE id=? AND instance_id=?'
                )->execute([$type, $nameKey, $label, $opts, $sort, $req, $act, $id, $iid]);
            } else {
                $pdo->prepare(
                    'INSERT INTO customReser_instance_field (instance_id, field_type, name_key, label, options_json, sort_order, is_required, is_active)
                     VALUES (?,?,?,?,?,?,?,?)'
                )->execute([$iid, $type, $nameKey, $label, $opts, $sort, $req, $act]);
                $id = (int)$pdo->lastInsertId();
            }
            customReser_json_out(['ok' => true, 'id' => $id]);
        }

        case 'field_delete': {
            $id = (int)($in['id'] ?? 0);
            $iid = (int)($in['instance_id'] ?? 0);
            if ($id < 1 || $iid < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'id, instance_id 필요'], 400);
            }
            $pdo->prepare('DELETE FROM customReser_instance_field WHERE id=? AND instance_id=?')->execute([$id, $iid]);
            customReser_json_out(['ok' => true]);
        }

        case 'region_list': {
            $rows = $pdo->query('SELECT * FROM customReser_region ORDER BY sort_order, id')->fetchAll(PDO::FETCH_ASSOC);
            customReser_json_out(['ok' => true, 'regions' => $rows]);
        }

        case 'region_save': {
            $id = (int)($in['id'] ?? 0);
            $name = trim((string)($in['name'] ?? ''));
            $pid = isset($in['parent_id']) ? (int)$in['parent_id'] : null;
            if ($name === '') {
                customReser_json_out(['ok' => false, 'msg' => '이름 필요'], 400);
            }
            $sort = (int)($in['sort_order'] ?? 0);
            $act = !empty($in['is_active']) ? 1 : 0;
            if ($id > 0) {
                $pdo->prepare('UPDATE customReser_region SET parent_id=?, name=?, sort_order=?, is_active=? WHERE id=?')
                    ->execute([$pid ?: null, $name, $sort, $act, $id]);
            } else {
                $pdo->prepare('INSERT INTO customReser_region (parent_id, name, sort_order, is_active) VALUES (?,?,?,?)')
                    ->execute([$pid ?: null, $name, $sort, $act]);
                $id = (int)$pdo->lastInsertId();
            }
            customReser_json_out(['ok' => true, 'id' => $id]);
        }

        case 'region_delete': {
            $id = (int)($in['id'] ?? 0);
            if ($id < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'id 필요'], 400);
            }
            $pdo->prepare('DELETE FROM customReser_region WHERE id=?')->execute([$id]);
            customReser_json_out(['ok' => true]);
        }

        case 'branch_list': {
            $sql = 'SELECT b.*, r.name AS region_name FROM customReser_branch b INNER JOIN customReser_region r ON r.id = b.region_id ORDER BY r.sort_order, b.sort_order';
            customReser_json_out(['ok' => true, 'branches' => $pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC)]);
        }

        case 'branch_save': {
            $id = (int)($in['id'] ?? 0);
            $rid = (int)($in['region_id'] ?? 0);
            $name = trim((string)($in['name'] ?? ''));
            if ($rid < 1 || $name === '') {
                customReser_json_out(['ok' => false, 'msg' => 'region_id, name 필요'], 400);
            }
            $sort = (int)($in['sort_order'] ?? 0);
            $act = !empty($in['is_active']) ? 1 : 0;
            if ($id > 0) {
                $pdo->prepare('UPDATE customReser_branch SET region_id=?, name=?, sort_order=?, is_active=? WHERE id=?')
                    ->execute([$rid, $name, $sort, $act, $id]);
            } else {
                $pdo->prepare('INSERT INTO customReser_branch (region_id, name, sort_order, is_active) VALUES (?,?,?,?)')
                    ->execute([$rid, $name, $sort, $act]);
                $id = (int)$pdo->lastInsertId();
            }
            customReser_json_out(['ok' => true, 'id' => $id]);
        }

        case 'branch_delete': {
            $id = (int)($in['id'] ?? 0);
            if ($id < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'id 필요'], 400);
            }
            $pdo->prepare('DELETE FROM customReser_branch WHERE id=?')->execute([$id]);
            customReser_json_out(['ok' => true]);
        }

        case 'instance_branch_list': {
            $iid = (int)($in['instance_id'] ?? $_GET['instance_id'] ?? 0);
            if ($iid < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id 필요'], 400);
            }
            $st = $pdo->prepare(
                'SELECT ib.branch_id, b.name, r.name AS region_name FROM customReser_instance_branch ib
                 INNER JOIN customReser_branch b ON b.id = ib.branch_id
                 INNER JOIN customReser_region r ON r.id = b.region_id
                 WHERE ib.instance_id = ? ORDER BY ib.sort_order'
            );
            $st->execute([$iid]);
            customReser_json_out(['ok' => true, 'assigned' => $st->fetchAll(PDO::FETCH_ASSOC)]);
        }

        case 'instance_branch_set': {
            $iid = (int)($in['instance_id'] ?? 0);
            $ids = $in['branch_ids'] ?? [];
            if ($iid < 1 || !is_array($ids)) {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id, branch_ids[] 필요'], 400);
            }
            $pdo->prepare('DELETE FROM customReser_instance_branch WHERE instance_id=?')->execute([$iid]);
            $ins = $pdo->prepare('INSERT INTO customReser_instance_branch (instance_id, branch_id, sort_order) VALUES (?,?,?)');
            $ord = 0;
            foreach ($ids as $bid) {
                $bid = (int)$bid;
                if ($bid > 0) {
                    $ins->execute([$iid, $bid, $ord += 10]);
                }
            }
            customReser_json_out(['ok' => true]);
        }

        case 'item_list': {
            $iid = (int)($in['instance_id'] ?? $_GET['instance_id'] ?? 0);
            if ($iid < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id 필요'], 400);
            }
            $st = $pdo->prepare('SELECT * FROM customReser_instance_item WHERE instance_id=? ORDER BY sort_order, id');
            $st->execute([$iid]);
            customReser_json_out(['ok' => true, 'items' => $st->fetchAll(PDO::FETCH_ASSOC)]);
        }

        case 'item_save': {
            $iid = (int)($in['instance_id'] ?? 0);
            $id = (int)($in['id'] ?? 0);
            $name = trim((string)($in['name'] ?? ''));
            if ($iid < 1 || $name === '') {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id, name 필요'], 400);
            }
            $sort = (int)($in['sort_order'] ?? 0);
            $act = !empty($in['is_active']) ? 1 : 0;
            if ($id > 0) {
                $pdo->prepare('UPDATE customReser_instance_item SET name=?, sort_order=?, is_active=? WHERE id=? AND instance_id=?')
                    ->execute([$name, $sort, $act, $id, $iid]);
            } else {
                $pdo->prepare('INSERT INTO customReser_instance_item (instance_id, name, sort_order, is_active) VALUES (?,?,?,?)')
                    ->execute([$iid, $name, $sort, $act]);
                $id = (int)$pdo->lastInsertId();
            }
            customReser_json_out(['ok' => true, 'id' => $id]);
        }

        case 'item_delete': {
            $id = (int)($in['id'] ?? 0);
            $iid = (int)($in['instance_id'] ?? 0);
            if ($id < 1 || $iid < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'id, instance_id 필요'], 400);
            }
            $pdo->prepare('DELETE FROM customReser_instance_item WHERE id=? AND instance_id=?')->execute([$id, $iid]);
            customReser_json_out(['ok' => true]);
        }

        case 'slot_list': {
            $iid = (int)($in['instance_id'] ?? $_GET['instance_id'] ?? 0);
            $branchId = (int)($in['branch_id'] ?? $_GET['branch_id'] ?? 0);
            $date = trim((string)($in['date'] ?? $_GET['date'] ?? ''));
            if ($iid < 1 || $branchId < 1 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id, branch_id, date 필요'], 400);
            }
            $st = $pdo->prepare(
                'SELECT * FROM customReser_slot WHERE instance_id=? AND branch_id=? AND slot_date=? ORDER BY slot_time'
            );
            $st->execute([$iid, $branchId, $date]);
            customReser_json_out(['ok' => true, 'slots' => $st->fetchAll(PDO::FETCH_ASSOC)]);
        }

        case 'slot_bulk_create': {
            $iid = (int)($in['instance_id'] ?? 0);
            $branchId = (int)($in['branch_id'] ?? 0);
            $from = trim((string)($in['date_from'] ?? ''));
            $to = trim((string)($in['date_to'] ?? ''));
            $times = $in['times'] ?? [];
            $capacity = max(1, (int)($in['capacity'] ?? 1));
            if ($iid < 1 || $branchId < 1 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $from) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $to) || !is_array($times) || empty($times)) {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id, branch_id, date_from, date_to, times[] 필요'], 400);
            }
            $tStart = strtotime($from);
            $tEnd = strtotime($to);
            if ($tStart === false || $tEnd === false || $tStart > $tEnd) {
                customReser_json_out(['ok' => false, 'msg' => '날짜 범위 오류'], 400);
            }
            $ins = $pdo->prepare(
                'INSERT INTO customReser_slot (instance_id, branch_id, slot_date, slot_time, capacity, booked)
                 VALUES (?,?,?,?,?,0)
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
                    $ins->execute([$iid, $branchId, $d, $timeSql, $capacity]);
                    $cnt++;
                }
            }
            customReser_json_out(['ok' => true, 'inserted_or_updated' => $cnt]);
        }

        case 'slot_delete': {
            $id = (int)($in['id'] ?? 0);
            if ($id < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'id 필요'], 400);
            }
            $bk = $pdo->prepare('SELECT booked FROM customReser_slot WHERE id=?');
            $bk->execute([$id]);
            if ((int)$bk->fetchColumn() > 0) {
                customReser_json_out(['ok' => false, 'msg' => '예약이 있는 슬롯은 삭제할 수 없습니다.'], 400);
            }
            $pdo->prepare('DELETE FROM customReser_slot WHERE id=?')->execute([$id]);
            customReser_json_out(['ok' => true]);
        }

        case 'slot_set_capacity': {
            $id = (int)($in['id'] ?? 0);
            $cap = (int)($in['capacity'] ?? 0);
            if ($id < 1 || $cap < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'id, capacity 필요'], 400);
            }
            $chk = $pdo->prepare('SELECT booked FROM customReser_slot WHERE id=?');
            $chk->execute([$id]);
            $booked = (int)$chk->fetchColumn();
            if ($booked > $cap) {
                customReser_json_out(['ok' => false, 'msg' => '예약 건수보다 작게 설정할 수 없습니다.'], 400);
            }
            $pdo->prepare('UPDATE customReser_slot SET capacity=? WHERE id=?')->execute([$cap, $id]);
            customReser_json_out(['ok' => true]);
        }

        case 'item_quota_list': {
            $iid = (int)($in['instance_id'] ?? $_GET['instance_id'] ?? 0);
            $branchId = (int)($in['branch_id'] ?? $_GET['branch_id'] ?? 0);
            $date = trim((string)($in['date'] ?? $_GET['date'] ?? ''));
            if ($iid < 1 || $branchId < 1 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id, branch_id, date 필요'], 400);
            }
            $st = $pdo->prepare(
                'SELECT q.*, i.name AS item_name FROM customReser_item_quota q
                 INNER JOIN customReser_instance_item i ON i.id = q.item_id
                 WHERE q.instance_id=? AND q.branch_id=? AND q.quota_date=? ORDER BY i.sort_order'
            );
            $st->execute([$iid, $branchId, $date]);
            customReser_json_out(['ok' => true, 'quotas' => $st->fetchAll(PDO::FETCH_ASSOC)]);
        }

        case 'item_quota_bulk_create': {
            $iid = (int)($in['instance_id'] ?? 0);
            $branchId = (int)($in['branch_id'] ?? 0);
            $from = trim((string)($in['date_from'] ?? ''));
            $to = trim((string)($in['date_to'] ?? ''));
            $itemIds = $in['item_ids'] ?? [];
            if (!is_array($itemIds)) {
                $itemIds = [];
            }
            $capacity = max(1, (int)($in['capacity'] ?? 1));
            if ($iid < 1 || $branchId < 1 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $from) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $to)) {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id, branch_id, date_from, date_to 필요'], 400);
            }
            $tStart = strtotime($from);
            $tEnd = strtotime($to);
            if ($tStart === false || $tEnd === false || $tStart > $tEnd) {
                customReser_json_out(['ok' => false, 'msg' => '날짜 범위 오류'], 400);
            }
            if (empty($itemIds)) {
                $itemIds = $pdo->prepare('SELECT id FROM customReser_instance_item WHERE instance_id=? AND is_active=1');
                $itemIds->execute([$iid]);
                $itemIds = $itemIds->fetchAll(PDO::FETCH_COLUMN);
            }
            $itemIds = array_filter(array_map('intval', $itemIds), function ($x) {
                return $x > 0;
            });
            if (empty($itemIds)) {
                customReser_json_out(['ok' => false, 'msg' => '활성 항목이 없습니다.'], 400);
            }
            $ins = $pdo->prepare(
                'INSERT INTO customReser_item_quota (instance_id, branch_id, item_id, quota_date, capacity, booked)
                 VALUES (?,?,?,?,?,0)
                 ON DUPLICATE KEY UPDATE capacity = VALUES(capacity)'
            );
            $cnt = 0;
            for ($t = $tStart; $t <= $tEnd; $t += 86400) {
                $d = date('Y-m-d', $t);
                foreach ($itemIds as $itId) {
                    $ins->execute([$iid, $branchId, $itId, $d, $capacity]);
                    $cnt++;
                }
            }
            customReser_json_out(['ok' => true, 'inserted_or_updated' => $cnt]);
        }

        case 'item_quota_delete': {
            $id = (int)($in['id'] ?? 0);
            if ($id < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'id 필요'], 400);
            }
            $bk = $pdo->prepare('SELECT booked FROM customReser_item_quota WHERE id=?');
            $bk->execute([$id]);
            if ((int)$bk->fetchColumn() > 0) {
                customReser_json_out(['ok' => false, 'msg' => '예약이 있으면 삭제할 수 없습니다.'], 400);
            }
            $pdo->prepare('DELETE FROM customReser_item_quota WHERE id=?')->execute([$id]);
            customReser_json_out(['ok' => true]);
        }

        case 'item_quota_set_capacity': {
            $id = (int)($in['id'] ?? 0);
            $cap = (int)($in['capacity'] ?? 0);
            if ($id < 1 || $cap < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'id, capacity 필요'], 400);
            }
            $chk = $pdo->prepare('SELECT booked FROM customReser_item_quota WHERE id=?');
            $chk->execute([$id]);
            $booked = (int)$chk->fetchColumn();
            if ($booked > $cap) {
                customReser_json_out(['ok' => false, 'msg' => '예약 건수보다 작게 설정할 수 없습니다.'], 400);
            }
            $pdo->prepare('UPDATE customReser_item_quota SET capacity=? WHERE id=?')->execute([$cap, $id]);
            customReser_json_out(['ok' => true]);
        }

        case 'day_closure_list': {
            $iid = (int)($in['instance_id'] ?? $_GET['instance_id'] ?? 0);
            $branchId = (int)($in['branch_id'] ?? $_GET['branch_id'] ?? 0);
            if ($iid < 1 || $branchId < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id, branch_id 필요'], 400);
            }
            $st = $pdo->prepare(
                'SELECT * FROM customReser_day_closure WHERE instance_id=? AND branch_id=? ORDER BY closure_date DESC LIMIT 200'
            );
            $st->execute([$iid, $branchId]);
            customReser_json_out(['ok' => true, 'closures' => $st->fetchAll(PDO::FETCH_ASSOC)]);
        }

        case 'day_closure_save': {
            $iid = (int)($in['instance_id'] ?? 0);
            $branchId = (int)($in['branch_id'] ?? 0);
            $d = trim((string)($in['closure_date'] ?? ''));
            $reason = trim((string)($in['reason'] ?? ''));
            if ($iid < 1 || $branchId < 1 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $d)) {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id, branch_id, closure_date 필요'], 400);
            }
            $pdo->prepare(
                'INSERT INTO customReser_day_closure (instance_id, branch_id, closure_date, reason) VALUES (?,?,?,?)
                 ON DUPLICATE KEY UPDATE reason = VALUES(reason)'
            )->execute([$iid, $branchId, $d, $reason !== '' ? $reason : null]);
            customReser_json_out(['ok' => true]);
        }

        case 'day_closure_delete': {
            $iid = (int)($in['instance_id'] ?? 0);
            $branchId = (int)($in['branch_id'] ?? 0);
            $d = trim((string)($in['closure_date'] ?? ''));
            if ($iid < 1 || $branchId < 1 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $d)) {
                customReser_json_out(['ok' => false, 'msg' => '필수값 누락'], 400);
            }
            $pdo->prepare(
                'DELETE FROM customReser_day_closure WHERE instance_id=? AND branch_id=? AND closure_date=?'
            )->execute([$iid, $branchId, $d]);
            customReser_json_out(['ok' => true]);
        }

        case 'settings_get': {
            $iid = (int)($in['instance_id'] ?? $_GET['instance_id'] ?? 0);
            if ($iid < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id 필요'], 400);
            }
            $st = $pdo->prepare('SELECT * FROM customReser_instance_settings WHERE instance_id=?');
            $st->execute([$iid]);
            customReser_json_out(['ok' => true, 'settings' => $st->fetch(PDO::FETCH_ASSOC) ?: []]);
        }

        case 'settings_save': {
            $iid = (int)($in['instance_id'] ?? 0);
            if ($iid < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id 필요'], 400);
            }
            $pdo->prepare(
                'INSERT INTO customReser_instance_settings (instance_id, notify_emails, spreadsheet_webhook, alimtalk_webhook, notify_use_email, notify_use_sheet, notify_use_alim)
                 VALUES (?,?,?,?,?,?,?)
                 ON DUPLICATE KEY UPDATE notify_emails=VALUES(notify_emails), spreadsheet_webhook=VALUES(spreadsheet_webhook), alimtalk_webhook=VALUES(alimtalk_webhook),
                 notify_use_email=VALUES(notify_use_email), notify_use_sheet=VALUES(notify_use_sheet), notify_use_alim=VALUES(notify_use_alim)'
            )->execute([
                $iid,
                trim((string)($in['notify_emails'] ?? '')),
                ($s = trim((string)($in['spreadsheet_webhook'] ?? ''))) !== '' ? $s : null,
                ($a = trim((string)($in['alimtalk_webhook'] ?? ''))) !== '' ? $a : null,
                !empty($in['notify_use_email']) ? 1 : 0,
                !empty($in['notify_use_sheet']) ? 1 : 0,
                !empty($in['notify_use_alim']) ? 1 : 0,
            ]);
            customReser_json_out(['ok' => true]);
        }

        case 'booking_list': {
            $iid = (int)($in['instance_id'] ?? $_GET['instance_id'] ?? 0);
            if ($iid < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id 필요'], 400);
            }
            $page = max(1, (int)($in['page'] ?? $_GET['page'] ?? 1));
            $per = min(100, max(10, (int)($in['per_page'] ?? $_GET['per_page'] ?? 20)));
            $offset = ($page - 1) * $per;
            $where = 'b.instance_id = ?';
            $params = [$iid];
            $status = trim((string)($in['status'] ?? $_GET['status'] ?? ''));
            if ($status !== '' && in_array($status, ['접수', '확인', '완료', '취소'], true)) {
                $where .= ' AND b.status = ?';
                $params[] = $status;
            }
            $branchId = (int)($in['branch_id'] ?? $_GET['branch_id'] ?? 0);
            if ($branchId > 0) {
                $where .= ' AND b.branch_id = ?';
                $params[] = $branchId;
            }
            $q = trim((string)($in['q'] ?? $_GET['q'] ?? ''));
            if ($q !== '') {
                $where .= ' AND (b.customer_name LIKE ? OR b.customer_phone LIKE ? OR b.reservation_no LIKE ?)';
                $like = '%' . $q . '%';
                $params[] = $like;
                $params[] = $like;
                $params[] = $like;
            }
            $cnt = $pdo->prepare("SELECT COUNT(*) FROM customReser_booking b WHERE $where");
            $cnt->execute($params);
            $total = (int)$cnt->fetchColumn();
            $sql = "SELECT b.*, br.name AS branch_name, i.name AS item_name FROM customReser_booking b
                    LEFT JOIN customReser_branch br ON br.id = b.branch_id
                    LEFT JOIN customReser_instance_item i ON i.id = b.item_id
                    WHERE $where ORDER BY b.reservation_at DESC, b.id DESC LIMIT $per OFFSET $offset";
            $st = $pdo->prepare($sql);
            $st->execute($params);
            customReser_json_out(['ok' => true, 'total' => $total, 'page' => $page, 'rows' => $st->fetchAll(PDO::FETCH_ASSOC)]);
        }

        case 'booking_get': {
            $id = (int)($in['id'] ?? $_GET['id'] ?? 0);
            if ($id < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'id 필요'], 400);
            }
            $st = $pdo->prepare(
                'SELECT b.*, br.name AS branch_name, i.name AS item_name FROM customReser_booking b
                 LEFT JOIN customReser_branch br ON br.id = b.branch_id
                 LEFT JOIN customReser_instance_item i ON i.id = b.item_id WHERE b.id=?'
            );
            $st->execute([$id]);
            $row = $st->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $row['capacity_mode'] = customReser_capacity_mode($pdo, (int)$row['instance_id']);
            }
            customReser_json_out(['ok' => true, 'booking' => $row]);
        }

        case 'booking_set_status': {
            $id = (int)($in['id'] ?? 0);
            $newStatus = (string)($in['status'] ?? '');
            if ($id < 1 || !in_array($newStatus, ['접수', '확인', '완료', '취소'], true)) {
                customReser_json_out(['ok' => false, 'msg' => 'id, status 필요'], 400);
            }
            $pdo->beginTransaction();
            try {
                $st = $pdo->prepare('SELECT * FROM customReser_booking WHERE id=? FOR UPDATE');
                $st->execute([$id]);
                $b = $st->fetch(PDO::FETCH_ASSOC);
                if (!$b) {
                    $pdo->rollBack();
                    customReser_json_out(['ok' => false, 'msg' => '없음'], 404);
                }
                $old = $b['status'];
                if ($old === '취소' && $newStatus !== '취소') {
                    $pdo->rollBack();
                    customReser_json_out(['ok' => false, 'msg' => '취소된 예약은 복구할 수 없습니다.'], 400);
                }
                if ($newStatus === '취소' && $old !== '취소') {
                    customReser_release_booking_capacity($pdo, $b);
                }
                $note = array_key_exists('admin_note', $in) ? (string)$in['admin_note'] : null;
                if ($note !== null) {
                    $pdo->prepare('UPDATE customReser_booking SET status=?, admin_note=? WHERE id=?')->execute([$newStatus, $note, $id]);
                } else {
                    $pdo->prepare('UPDATE customReser_booking SET status=? WHERE id=?')->execute([$newStatus, $id]);
                }
                $pdo->commit();
            } catch (Throwable $e) {
                $pdo->rollBack();
                customReser_json_out(['ok' => false, 'msg' => '처리 실패'], 500);
            }
            customReser_json_out(['ok' => true]);
        }

        case 'booking_reschedule': {
            $id = (int)($in['id'] ?? 0);
            if ($id < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'id 필요'], 400);
            }
            $bSt = $pdo->prepare('SELECT * FROM customReser_booking WHERE id=?');
            $bSt->execute([$id]);
            $b = $bSt->fetch(PDO::FETCH_ASSOC);
            if (!$b) {
                customReser_json_out(['ok' => false, 'msg' => '없음'], 404);
            }
            $res = customReser_booking_reschedule($pdo, $b, (int)($in['slot_id'] ?? 0), (int)($in['item_quota_id'] ?? 0));
            if (!$res['ok']) {
                customReser_json_out($res, 400);
            }
            customReser_json_out(['ok' => true]);
        }

        case 'booking_admin_create': {
            $iid = (int)($in['instance_id'] ?? 0);
            if ($iid < 1) {
                customReser_json_out(['ok' => false, 'msg' => 'instance_id 필요'], 400);
            }
            $payload = $in;
            unset($payload['action'], $payload['instance_id']);
            $created = customReser_booking_create($pdo, $iid, $payload);
            if (!$created['ok']) {
                $msg = (string)($created['msg'] ?? '');
                $code = (strpos($msg, '마감') !== false || strpos($msg, '부족') !== false) ? 409 : 400;
                customReser_json_out($created, $code);
            }
            $bSt = $pdo->prepare('SELECT * FROM customReser_booking WHERE id=?');
            $bSt->execute([(int)$created['id']]);
            $row = $bSt->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                customReser_send_admin_notifications($pdo, $iid, $row);
            }
            customReser_json_out(['ok' => true, 'id' => $created['id'], 'reservation_no' => $created['reservation_no']]);
        }

        default:
            customReser_json_out(['ok' => false, 'msg' => 'unknown action'], 400);
    }
} catch (Throwable $e) {
    customReser_json_out(['ok' => false, 'msg' => '서버 오류: ' . $e->getMessage()], 500);
}
