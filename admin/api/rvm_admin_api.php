<?php
declare(strict_types=1);
ob_start(); // 어떤 PHP 경고/notice도 출력 버퍼에 격리

/**
 * rvm_admin_api.php -- Admin API for rvm reservation module
 *
 * All requests: POST JSON  { "action": "<action_name>", ...payload }
 * Some read operations: GET  ?action=<action_name>&...
 *
 * Common response format
 *   Success: { "ok": true,  ...data }
 *   Failure: { "ok": false, "msg": "..." }
 */

ini_set('display_errors', '0');
error_reporting(0);
header('Content-Type: application/json; charset=utf-8');

/* ── Load dependencies ──────────────────────────── */
try {
    require_once dirname(__DIR__) . '/config/db_customReser.php';  // reuse getCustomReserDB()
    require_once dirname(__DIR__) . '/config/session.php';         // requireLogin()
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'msg' => 'File load error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

/* ── DB connection ──────────────────────────────── */
try {
    $pdo = getCustomReserDB();   // uses same DB as customReser
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'msg' => 'DB connection error: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

/* ── Utilities ───────────────────────────────── */
function rvm_out(array $data, int $code = 200): never {
    ob_end_clean(); // 버퍼에 쌓인 경고/notice 폐기
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function rvm_body(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $j = json_decode($raw, true);
    return is_array($j) ? $j : [];
}

function rvm_today(): string {
    return (new DateTimeImmutable('now', new DateTimeZone('Asia/Seoul')))->format('Y-m-d');
}

function rvm_gen_no(PDO $pdo): string {
    for ($i = 0; $i < 20; $i++) {
        $no = 'R' . date('ymd') . strtoupper(bin2hex(random_bytes(3)));
        $st = $pdo->prepare('SELECT 1 FROM rvm_booking WHERE reservation_no=? LIMIT 1');
        $st->execute([$no]);
        if (!$st->fetchColumn()) return $no;
    }
    return 'R' . date('ymdHis') . mt_rand(1000, 9999);
}

function rvm_capacity_mode(PDO $pdo, int $instanceId): string {
    $st = $pdo->prepare(
        'SELECT step_key FROM rvm_instance_step
          WHERE instance_id=? AND is_active=1
          ORDER BY sort_order ASC, id ASC'
    );
    $st->execute([$instanceId]);
    $last = 'time';
    while (($k = $st->fetchColumn()) !== false) {
        if ($k === 'time' || $k === 'item') $last = (string)$k;
    }
    return $last;
}

/* ── Parse request ───────────────────────────────── */
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'OPTIONS') { http_response_code(204); exit; }

$in     = $method === 'GET' ? $_GET : rvm_body();
$action = (string)($in['action'] ?? $_GET['action'] ?? '');

/* ── Auth ────────────────────────────────────── */
requireLogin();

/* ══════════════════════════════════════════════
   ROUTER
══════════════════════════════════════════════ */
try {
    switch ($action) {

    /* ───────────── Region ─────────────────────── */

    case 'region_list':
        try {
            $rows = $pdo->query('SELECT * FROM rvm_region ORDER BY sort_order ASC, id ASC')->fetchAll();
        } catch (Throwable $e) {
            rvm_out(['ok' => true, 'regions' => []]);
        }
        rvm_out(['ok' => true, 'regions' => $rows]);

    case 'region_save': {
        $id   = (int)($in['id'] ?? 0);
        $name = trim((string)($in['name'] ?? ''));
        if ($name === '') rvm_out(['ok' => false, 'msg' => 'Region name is required.'], 400);

        if ($id > 0) {
            // duplicate check (exclude self)
            $dup = $pdo->prepare('SELECT id FROM rvm_region WHERE name=? AND id<>? LIMIT 1');
            $dup->execute([$name, $id]);
            if ($dup->fetchColumn()) rvm_out(['ok' => false, 'msg' => 'Region name already exists.'], 400);

            $pdo->prepare('UPDATE rvm_region SET name=?, sort_order=? WHERE id=?')
                ->execute([$name, (int)($in['sort_order'] ?? 0), $id]);
            rvm_out(['ok' => true, 'id' => $id]);
        }

        $dup = $pdo->prepare('SELECT id FROM rvm_region WHERE name=? LIMIT 1');
        $dup->execute([$name]);
        if ($dup->fetchColumn()) rvm_out(['ok' => false, 'msg' => 'Region name already exists.'], 400);

        $pdo->prepare('INSERT INTO rvm_region (name, sort_order) VALUES (?,?)')
            ->execute([$name, (int)($in['sort_order'] ?? 0)]);
        rvm_out(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    }

    case 'region_delete': {
        $id = (int)($in['id'] ?? 0);
        if ($id < 1) rvm_out(['ok' => false, 'msg' => 'Invalid ID'], 400);

        $cnt = $pdo->prepare('SELECT COUNT(*) FROM rvm_branch WHERE region_id=?');
        $cnt->execute([$id]);
        if ((int)$cnt->fetchColumn() > 0)
            rvm_out(['ok' => false, 'msg' => 'Cannot delete region with existing branches. Delete branches first.'], 400);

        $pdo->prepare('DELETE FROM rvm_region WHERE id=?')->execute([$id]);
        rvm_out(['ok' => true]);
    }

    /* ───────────── Branch ─────────────────────── */

    case 'branch_list':
        try {
            $rows = $pdo->query(
                'SELECT b.*, r.name AS region_name
                   FROM rvm_branch b
                   JOIN rvm_region r ON r.id = b.region_id
                  ORDER BY r.sort_order ASC, b.sort_order ASC, b.id ASC'
            )->fetchAll();
        } catch (Throwable $e) {
            rvm_out(['ok' => true, 'branches' => []]);
        }
        rvm_out(['ok' => true, 'branches' => $rows]);

    case 'branch_save': {
        $id       = (int)($in['id'] ?? 0);
        $regionId = (int)($in['region_id'] ?? 0);
        $name     = trim((string)($in['name'] ?? ''));
        $active   = !empty($in['is_active']) ? 1 : 0;
        $sort     = (int)($in['sort_order'] ?? 0);

        if ($regionId < 1 || $name === '')
            rvm_out(['ok' => false, 'msg' => 'Region and branch name are required.'], 400);

        // verify region exists
        $chkR = $pdo->prepare('SELECT id FROM rvm_region WHERE id=? LIMIT 1');
        $chkR->execute([$regionId]);
        if (!$chkR->fetchColumn()) rvm_out(['ok' => false, 'msg' => 'Region not found.'], 400);

        if ($id > 0) {
            $pdo->prepare('UPDATE rvm_branch SET region_id=?, name=?, is_active=?, sort_order=? WHERE id=?')
                ->execute([$regionId, $name, $active, $sort, $id]);
            rvm_out(['ok' => true, 'id' => $id]);
        }
        $pdo->prepare('INSERT INTO rvm_branch (region_id, name, is_active, sort_order) VALUES (?,?,?,?)')
            ->execute([$regionId, $name, $active, $sort]);
        rvm_out(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    }

    case 'branch_delete': {
        $id = (int)($in['id'] ?? 0);
        if ($id < 1) rvm_out(['ok' => false, 'msg' => 'Invalid ID'], 400);

        // cannot delete if active bookings exist
        $cnt = $pdo->prepare("SELECT COUNT(*) FROM rvm_booking WHERE branch_id=? AND status NOT IN ('cancelled')");
        $cnt->execute([$id]);
        if ((int)$cnt->fetchColumn() > 0)
            rvm_out(['ok' => false, 'msg' => 'Cannot delete branch with active bookings.'], 400);

        $pdo->prepare('DELETE FROM rvm_branch WHERE id=?')->execute([$id]);
        rvm_out(['ok' => true]);
    }

    /* ───────────── Instance ───────────────────── */

    case 'instance_list':
        try {
            $rows = $pdo->query(
                'SELECT i.*, s.notify_use_email, s.notify_use_sheet, s.notify_use_alimtalk,
                        s.notify_emails, s.sheet_webhook, s.alimtalk_webhook,
                        s.lookup_by_no, s.lookup_by_name_phone
                   FROM rvm_instance i
                   LEFT JOIN rvm_instance_settings s ON s.instance_id = i.id
                  ORDER BY i.sort_order ASC, i.id ASC'
            )->fetchAll();
        } catch (Throwable $e) {
            // rvm_* 테이블 미생성 시 빈 목록 반환 (스키마 적용 전 안전 폴백)
            rvm_out(['ok' => true, 'instances' => [], '_note' => 'rvm_schema.sql 적용 필요: ' . $e->getMessage()]);
        }
        rvm_out(['ok' => true, 'instances' => $rows]);

    case 'instance_save': {
        $id     = (int)($in['id'] ?? 0);
        $name   = trim((string)($in['name'] ?? ''));
        $slug   = strtolower(trim((string)($in['slug'] ?? '')));
        $desc   = trim((string)($in['description'] ?? ''));
        $active = !empty($in['is_active']) ? 1 : 0;
        $sort   = (int)($in['sort_order'] ?? 0);

        if ($name === '' || $slug === '' || !preg_match('/^[a-z0-9\-]+$/', $slug))
            rvm_out(['ok' => false, 'msg' => 'Name and slug (lowercase letters, numbers, hyphens) are required.'], 400);

        // check slug duplicate
        $dupSt = $pdo->prepare('SELECT id FROM rvm_instance WHERE slug=?' . ($id > 0 ? ' AND id<>?' : '') . ' LIMIT 1');
        $dupSt->execute($id > 0 ? [$slug, $id] : [$slug]);
        if ($dupSt->fetchColumn()) rvm_out(['ok' => false, 'msg' => 'Slug already in use.'], 400);

        if ($id > 0) {
            $pdo->prepare(
                'UPDATE rvm_instance SET name=?, slug=?, description=?, is_active=?, sort_order=? WHERE id=?'
            )->execute([$name, $slug, $desc ?: null, $active, $sort, $id]);
            rvm_out(['ok' => true, 'id' => $id]);
        }

        $pdo->prepare(
            'INSERT INTO rvm_instance (name, slug, description, is_active, sort_order) VALUES (?,?,?,?,?)'
        )->execute([$name, $slug, $desc ?: null, $active, $sort]);
        $newId = (int)$pdo->lastInsertId();

        // create default settings row
        $pdo->prepare(
            'INSERT IGNORE INTO rvm_instance_settings (instance_id) VALUES (?)'
        )->execute([$newId]);

        // insert default steps (branch->date->time->info)
        $defaultSteps = [['branch',10],['date',20],['time',30],['info',50]];
        $stIns = $pdo->prepare(
            'INSERT IGNORE INTO rvm_instance_step (instance_id, step_key, sort_order, is_active) VALUES (?,?,?,1)'
        );
        foreach ($defaultSteps as [$k, $ord]) {
            $stIns->execute([$newId, $k, $ord]);
        }

        rvm_out(['ok' => true, 'id' => $newId]);
    }

    case 'instance_delete': {
        $id = (int)($in['id'] ?? 0);
        if ($id < 1) rvm_out(['ok' => false, 'msg' => 'Invalid ID'], 400);
        $pdo->prepare('DELETE FROM rvm_instance WHERE id=?')->execute([$id]);
        rvm_out(['ok' => true]);
    }

    /* ───────────── Instance settings ──────────── */

    case 'settings_save': {
        $id = (int)($in['instance_id'] ?? 0);
        if ($id < 1) rvm_out(['ok' => false, 'msg' => 'Invalid instance_id'], 400);

        $pdo->prepare(
            'INSERT INTO rvm_instance_settings
               (instance_id, notify_use_email, notify_use_sheet, notify_use_alimtalk,
                notify_emails, sheet_webhook, alimtalk_webhook, lookup_by_no, lookup_by_name_phone)
             VALUES (?,?,?,?,?,?,?,?,?)
             ON DUPLICATE KEY UPDATE
               notify_use_email=VALUES(notify_use_email),
               notify_use_sheet=VALUES(notify_use_sheet),
               notify_use_alimtalk=VALUES(notify_use_alimtalk),
               notify_emails=VALUES(notify_emails),
               sheet_webhook=VALUES(sheet_webhook),
               alimtalk_webhook=VALUES(alimtalk_webhook),
               lookup_by_no=VALUES(lookup_by_no),
               lookup_by_name_phone=VALUES(lookup_by_name_phone)'
        )->execute([
            $id,
            !empty($in['notify_use_email'])    ? 1 : 0,
            !empty($in['notify_use_sheet'])    ? 1 : 0,
            !empty($in['notify_use_alimtalk']) ? 1 : 0,
            trim((string)($in['notify_emails']      ?? '')) ?: null,
            trim((string)($in['sheet_webhook']      ?? '')) ?: null,
            trim((string)($in['alimtalk_webhook']   ?? '')) ?: null,
            !empty($in['lookup_by_no'])         ? 1 : 0,
            !empty($in['lookup_by_name_phone']) ? 1 : 0,
        ]);
        rvm_out(['ok' => true]);
    }

    /* ───────────── Steps ──────────────────────── */

    case 'step_list':
        $rows = $pdo->prepare(
            'SELECT * FROM rvm_instance_step WHERE instance_id=? ORDER BY sort_order ASC, id ASC'
        );
        $rows->execute([(int)($in['instance_id'] ?? 0)]);
        rvm_out(['ok' => true, 'steps' => $rows->fetchAll()]);

    case 'step_save': {
        $instId  = (int)($in['instance_id'] ?? 0);
        $stepKey = (string)($in['step_key'] ?? '');
        $sort    = (int)($in['sort_order'] ?? 0);
        $active  = !empty($in['is_active']) ? 1 : 0;
        $stepId  = (int)($in['id'] ?? 0);

        $allowed = ['branch','date','time','item','info'];
        if (!in_array($stepKey, $allowed, true))
            rvm_out(['ok' => false, 'msg' => 'Invalid step_key'], 400);

        if ($stepId > 0) {
            $pdo->prepare(
                'UPDATE rvm_instance_step SET step_key=?, sort_order=?, is_active=? WHERE id=? AND instance_id=?'
            )->execute([$stepKey, $sort, $active, $stepId, $instId]);
            rvm_out(['ok' => true, 'id' => $stepId]);
        }
        $pdo->prepare(
            'INSERT INTO rvm_instance_step (instance_id, step_key, sort_order, is_active)
             VALUES (?,?,?,?)
             ON DUPLICATE KEY UPDATE sort_order=VALUES(sort_order), is_active=VALUES(is_active)'
        )->execute([$instId, $stepKey, $sort, $active]);
        rvm_out(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    }

    case 'step_delete': {
        $id = (int)($in['id'] ?? 0);
        $pdo->prepare('DELETE FROM rvm_instance_step WHERE id=?')->execute([$id]);
        rvm_out(['ok' => true]);
    }

    case 'step_bulk_save': {
        // steps: [{id, step_key, sort_order, is_active}, ...]
        $instId = (int)($in['instance_id'] ?? 0);
        $steps  = is_array($in['steps'] ?? null) ? $in['steps'] : [];
        if ($instId < 1) rvm_out(['ok' => false, 'msg' => 'Invalid instance_id'], 400);

        $pdo->prepare('DELETE FROM rvm_instance_step WHERE instance_id=?')->execute([$instId]);
        $ins = $pdo->prepare(
            'INSERT INTO rvm_instance_step (instance_id, step_key, sort_order, is_active) VALUES (?,?,?,?)'
        );
        $allowed = ['branch','date','time','item','info'];
        foreach ($steps as $s) {
            $key = (string)($s['step_key'] ?? '');
            if (!in_array($key, $allowed, true)) continue;
            $ins->execute([$instId, $key, (int)($s['sort_order'] ?? 0), !empty($s['is_active']) ? 1 : 0]);
        }
        rvm_out(['ok' => true]);
    }

    /* ───────────── Fields ─────────────────────── */

    case 'field_list':
        $st = $pdo->prepare(
            'SELECT * FROM rvm_instance_field WHERE instance_id=? ORDER BY sort_order ASC, id ASC'
        );
        $st->execute([(int)($in['instance_id'] ?? 0)]);
        $rows = $st->fetchAll();
        // decode options_json
        foreach ($rows as &$r) {
            $r['options'] = $r['options_json'] ? json_decode((string)$r['options_json'], true) : [];
            unset($r['options_json']);
        }
        unset($r);
        rvm_out(['ok' => true, 'fields' => $rows]);

    case 'field_save': {
        $fid     = (int)($in['id'] ?? 0);
        $instId  = (int)($in['instance_id'] ?? 0);
        $type    = (string)($in['field_type'] ?? '');
        $key     = trim((string)($in['name_key'] ?? ''));
        $label   = trim((string)($in['label'] ?? ''));
        $req     = !empty($in['is_required']) ? 1 : 0;
        $active  = !empty($in['is_active']) ? 1 : 0;
        $sort    = (int)($in['sort_order'] ?? 0);
        $opts    = is_array($in['options'] ?? null) ? $in['options'] : [];
        $optsJson= count($opts) ? json_encode($opts, JSON_UNESCAPED_UNICODE) : null;

        $allowed = ['text','phone','email','radio','checkbox','dropdown'];
        if (!in_array($type, $allowed, true) || $key === '' || $label === '')
            rvm_out(['ok' => false, 'msg' => 'field_type, name_key and label are all required.'], 400);

        if ($fid > 0) {
            $pdo->prepare(
                'UPDATE rvm_instance_field
                    SET field_type=?, name_key=?, label=?, options_json=?, sort_order=?, is_required=?, is_active=?
                  WHERE id=? AND instance_id=?'
            )->execute([$type, $key, $label, $optsJson, $sort, $req, $active, $fid, $instId]);
            rvm_out(['ok' => true, 'id' => $fid]);
        }

        // check name_key duplicate
        $dup = $pdo->prepare('SELECT id FROM rvm_instance_field WHERE instance_id=? AND name_key=? LIMIT 1');
        $dup->execute([$instId, $key]);
        if ($dup->fetchColumn()) rvm_out(['ok' => false, 'msg' => 'name_key already exists for this instance.'], 400);

        $pdo->prepare(
            'INSERT INTO rvm_instance_field
               (instance_id, field_type, name_key, label, options_json, sort_order, is_required, is_active)
             VALUES (?,?,?,?,?,?,?,?)'
        )->execute([$instId, $type, $key, $label, $optsJson, $sort, $req, $active]);
        rvm_out(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    }

    case 'field_delete': {
        $id = (int)($in['id'] ?? 0);
        $pdo->prepare('DELETE FROM rvm_instance_field WHERE id=?')->execute([$id]);
        rvm_out(['ok' => true]);
    }

    /* ───────────── Instance-Branch mapping ─────── */

    case 'instance_branch_list':
        $st = $pdo->prepare(
            'SELECT ib.*, b.name AS branch_name, b.region_id, r.name AS region_name
               FROM rvm_instance_branch ib
               JOIN rvm_branch b ON b.id = ib.branch_id
               JOIN rvm_region r ON r.id = b.region_id
              WHERE ib.instance_id=?
              ORDER BY ib.sort_order ASC, ib.id ASC'
        );
        $st->execute([(int)($in['instance_id'] ?? 0)]);
        rvm_out(['ok' => true, 'instance_branches' => $st->fetchAll()]);

    case 'instance_branch_sync': {
        // branch_ids: [1,2,3] -- replaces the entire connection list
        $instId    = (int)($in['instance_id'] ?? 0);
        $branchIds = is_array($in['branch_ids'] ?? null) ? array_map('intval', $in['branch_ids']) : [];
        if ($instId < 1) rvm_out(['ok' => false, 'msg' => 'Invalid instance_id'], 400);

        $pdo->prepare('DELETE FROM rvm_instance_branch WHERE instance_id=?')->execute([$instId]);
        $ins = $pdo->prepare(
            'INSERT IGNORE INTO rvm_instance_branch (instance_id, branch_id, sort_order) VALUES (?,?,?)'
        );
        foreach ($branchIds as $idx => $bid) {
            if ($bid > 0) $ins->execute([$instId, $bid, $idx * 10]);
        }
        rvm_out(['ok' => true]);
    }

    /* ───────────── Branch items ────────────────── */

    case 'branch_item_list':
        $st = $pdo->prepare(
            'SELECT * FROM rvm_branch_item
              WHERE instance_id=? AND branch_id=?
              ORDER BY sort_order ASC, id ASC'
        );
        $st->execute([(int)($in['instance_id'] ?? 0), (int)($in['branch_id'] ?? 0)]);
        rvm_out(['ok' => true, 'items' => $st->fetchAll()]);

    case 'branch_item_save': {
        $itemId  = (int)($in['id'] ?? 0);
        $instId  = (int)($in['instance_id'] ?? 0);
        $brId    = (int)($in['branch_id'] ?? 0);
        $name    = trim((string)($in['name'] ?? ''));
        $active  = !empty($in['is_active']) ? 1 : 0;
        $sort    = (int)($in['sort_order'] ?? 0);
        if ($name === '' || $instId < 1 || $brId < 1)
            rvm_out(['ok' => false, 'msg' => 'Item name, instance_id and branch_id are required.'], 400);

        if ($itemId > 0) {
            $pdo->prepare(
                'UPDATE rvm_branch_item SET name=?, is_active=?, sort_order=? WHERE id=? AND instance_id=? AND branch_id=?'
            )->execute([$name, $active, $sort, $itemId, $instId, $brId]);
            rvm_out(['ok' => true, 'id' => $itemId]);
        }
        $pdo->prepare(
            'INSERT INTO rvm_branch_item (instance_id, branch_id, name, is_active, sort_order) VALUES (?,?,?,?,?)'
        )->execute([$instId, $brId, $name, $active, $sort]);
        rvm_out(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    }

    case 'branch_item_delete': {
        $id = (int)($in['id'] ?? 0);
        $pdo->prepare('DELETE FROM rvm_branch_item WHERE id=?')->execute([$id]);
        rvm_out(['ok' => true]);
    }

    /* ───────────── Slots (date/time settings) ──── */

    case 'slot_list':
        // monthly query: instance_id, branch_id, year_month (YYYY-MM)
        $instId  = (int)($in['instance_id'] ?? 0);
        $brId    = (int)($in['branch_id']   ?? 0);
        $ym      = preg_match('/^\d{4}-\d{2}$/', (string)($in['year_month'] ?? ''))
                   ? (string)$in['year_month'] : date('Y-m');
        $from    = $ym . '-01';
        $to      = date('Y-m-t', strtotime($from));

        $st = $pdo->prepare(
            'SELECT s.*,
                    d.id AS closure_id
               FROM rvm_slot s
               LEFT JOIN rvm_day_closure d
                      ON d.instance_id=s.instance_id AND d.branch_id=s.branch_id
                     AND d.closure_date=s.slot_date
              WHERE s.instance_id=? AND s.branch_id=?
                AND s.slot_date BETWEEN ? AND ?
              ORDER BY s.slot_date ASC, s.slot_time ASC'
        );
        $st->execute([$instId, $brId, $from, $to]);
        rvm_out(['ok' => true, 'slots' => $st->fetchAll()]);

    case 'slot_save': {
        // insert or update single record
        $instId  = (int)($in['instance_id'] ?? 0);
        $brId    = (int)($in['branch_id']   ?? 0);
        $date    = (string)($in['slot_date'] ?? '');
        $time    = (string)($in['slot_time'] ?? '');
        $cap     = max(0, (int)($in['capacity'] ?? 1));
        $slotId  = (int)($in['id'] ?? 0);

        if ($instId < 1 || $brId < 1 || !$date || !$time)
            rvm_out(['ok' => false, 'msg' => 'Required fields missing.'], 400);
        if ($date < rvm_today())
            rvm_out(['ok' => false, 'msg' => 'Cannot set dates in the past.'], 400);

        if ($slotId > 0) {
            // capacity cannot be less than booked count
            $pdo->prepare(
                'UPDATE rvm_slot SET capacity=GREATEST(?,booked), is_closed=? WHERE id=?'
            )->execute([$cap, !empty($in['is_closed']) ? 1 : 0, $slotId]);
            rvm_out(['ok' => true, 'id' => $slotId]);
        }

        $pdo->prepare(
            'INSERT INTO rvm_slot (instance_id, branch_id, slot_date, slot_time, capacity, booked, is_closed)
             VALUES (?,?,?,?,?,0,0)
             ON DUPLICATE KEY UPDATE capacity=VALUES(capacity)'
        )->execute([$instId, $brId, $date, $time . ':00', $cap]);
        rvm_out(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    }

    case 'slot_delete': {
        $id = (int)($in['id'] ?? 0);
        // cannot delete slot with active bookings
        $bk = $pdo->prepare("SELECT COUNT(*) FROM rvm_booking WHERE slot_id=? AND status NOT IN ('cancelled')");
        $bk->execute([$id]);
        if ((int)$bk->fetchColumn() > 0)
            rvm_out(['ok' => false, 'msg' => 'Cannot delete slot with existing bookings.'], 400);
        $pdo->prepare('DELETE FROM rvm_slot WHERE id=?')->execute([$id]);
        rvm_out(['ok' => true]);
    }

    case 'slot_bulk_save': {
        // bulk date range setup
        $instId  = (int)($in['instance_id'] ?? 0);
        $brId    = (int)($in['branch_id']   ?? 0);
        $from    = (string)($in['date_from'] ?? '');
        $to      = (string)($in['date_to']   ?? '');
        $times   = is_array($in['times'] ?? null) ? $in['times'] : [];  // ['09:00','10:00',...]
        $cap     = max(1, (int)($in['capacity'] ?? 1));
        $today   = rvm_today();

        if ($instId < 1 || $brId < 1 || !$from || !$to || !$times)
            rvm_out(['ok' => false, 'msg' => 'Required fields missing.'], 400);
        if ($from > $to) rvm_out(['ok' => false, 'msg' => 'Start date must be before end date.'], 400);

        $ins = $pdo->prepare(
            'INSERT INTO rvm_slot (instance_id, branch_id, slot_date, slot_time, capacity, booked, is_closed)
             VALUES (?,?,?,?,?,0,0)
             ON DUPLICATE KEY UPDATE capacity=GREATEST(VALUES(capacity), booked)'
        );

        $inserted = 0;
        $cur = new DateTimeImmutable($from, new DateTimeZone('Asia/Seoul'));
        $end = new DateTimeImmutable($to,   new DateTimeZone('Asia/Seoul'));

        while ($cur <= $end) {
            $dateStr = $cur->format('Y-m-d');
            if ($dateStr >= $today) {
                foreach ($times as $t) {
                    $t = trim((string)$t);
                    if (!preg_match('/^\d{2}:\d{2}$/', $t)) continue;
                    $ins->execute([$instId, $brId, $dateStr, $t . ':00', $cap]);
                    $inserted++;
                }
            }
            $cur = $cur->modify('+1 day');
        }
        rvm_out(['ok' => true, 'inserted' => $inserted]);
    }

    case 'slot_close_date': {
        // toggle day closure on/off
        $instId = (int)($in['instance_id'] ?? 0);
        $brId   = (int)($in['branch_id']   ?? 0);
        $date   = (string)($in['slot_date'] ?? '');
        $close  = !empty($in['is_closed']);

        if ($instId < 1 || $brId < 1 || !$date)
            rvm_out(['ok' => false, 'msg' => 'Required fields missing.'], 400);

        if ($close) {
            $pdo->prepare(
                'INSERT IGNORE INTO rvm_day_closure (instance_id, branch_id, closure_date) VALUES (?,?,?)'
            )->execute([$instId, $brId, $date]);
        } else {
            $pdo->prepare(
                'DELETE FROM rvm_day_closure WHERE instance_id=? AND branch_id=? AND closure_date=?'
            )->execute([$instId, $brId, $date]);
        }
        rvm_out(['ok' => true]);
    }

    /* ───────────── Item quota (item mode) ───────── */

    case 'item_quota_list':
        $instId  = (int)($in['instance_id'] ?? 0);
        $brId    = (int)($in['branch_id']   ?? 0);
        $ym      = preg_match('/^\d{4}-\d{2}$/', (string)($in['year_month'] ?? ''))
                   ? (string)$in['year_month'] : date('Y-m');
        $from    = $ym . '-01';
        $to      = date('Y-m-t', strtotime($from));

        $st = $pdo->prepare(
            'SELECT q.*, i.name AS item_name
               FROM rvm_item_quota q
               JOIN rvm_branch_item i ON i.id = q.item_id
              WHERE q.instance_id=? AND q.branch_id=?
                AND q.quota_date BETWEEN ? AND ?
              ORDER BY q.quota_date ASC, q.item_id ASC'
        );
        $st->execute([$instId, $brId, $from, $to]);
        rvm_out(['ok' => true, 'quotas' => $st->fetchAll()]);

    case 'item_quota_save': {
        $instId = (int)($in['instance_id'] ?? 0);
        $brId   = (int)($in['branch_id']   ?? 0);
        $itemId = (int)($in['item_id']      ?? 0);
        $date   = (string)($in['quota_date'] ?? '');
        $cap    = max(0, (int)($in['capacity'] ?? 1));

        if ($instId < 1 || $brId < 1 || $itemId < 1 || !$date)
            rvm_out(['ok' => false, 'msg' => 'Required fields missing.'], 400);
        if ($date < rvm_today())
            rvm_out(['ok' => false, 'msg' => 'Cannot set dates in the past.'], 400);

        $pdo->prepare(
            'INSERT INTO rvm_item_quota (instance_id, branch_id, item_id, quota_date, capacity, booked)
             VALUES (?,?,?,?,?,0)
             ON DUPLICATE KEY UPDATE capacity=GREATEST(VALUES(capacity), booked)'
        )->execute([$instId, $brId, $itemId, $date, $cap]);
        rvm_out(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    }

    /* ───────────── Booking list ────────────────── */

    case 'booking_list': {
        $instId   = (int)($in['instance_id'] ?? 0);
        $status   = (string)($in['status']    ?? '');
        $brId     = (int)($in['branch_id']    ?? 0);
        $q        = trim((string)($in['q']    ?? ''));
        $dateFrom = (string)($in['date_from'] ?? '');
        $dateTo   = (string)($in['date_to']   ?? '');
        $page     = max(1, (int)($in['page']  ?? 1));
        $limit    = min(100, max(10, (int)($in['limit'] ?? 50)));
        $offset   = ($page - 1) * $limit;

        $where  = ['b.instance_id = ?'];
        $params = [$instId];

        if ($status !== '') { $where[] = 'b.status = ?';      $params[] = $status; }
        if ($brId   > 0)    { $where[] = 'b.branch_id = ?';   $params[] = $brId;   }
        if ($q      !== '') {
            $where[]  = '(b.reservation_no LIKE ? OR b.customer_name LIKE ? OR b.customer_phone LIKE ?)';
            $like = '%' . $q . '%';
            array_push($params, $like, $like, $like);
        }
        if ($dateFrom !== '') { $where[] = 'DATE(b.reservation_at) >= ?'; $params[] = $dateFrom; }
        if ($dateTo   !== '') { $where[] = 'DATE(b.reservation_at) <= ?'; $params[] = $dateTo;   }

        $whereStr = implode(' AND ', $where);

        $cntSt = $pdo->prepare("SELECT COUNT(*) FROM rvm_booking b WHERE $whereStr");
        $cntSt->execute($params);
        $total = (int)$cntSt->fetchColumn();

        $listSt = $pdo->prepare(
            "SELECT b.*,
                    br.name AS branch_name,
                    r.name  AS region_name
               FROM rvm_booking b
               JOIN rvm_branch br ON br.id = b.branch_id
               JOIN rvm_region  r  ON r.id  = br.region_id
              WHERE $whereStr
              ORDER BY b.reservation_at DESC, b.id DESC
              LIMIT $limit OFFSET $offset"
        );
        $listSt->execute($params);
        $rows = $listSt->fetchAll();

        // decode extra_json
        foreach ($rows as &$row) {
            $row['extra'] = $row['extra_json'] ? json_decode((string)$row['extra_json'], true) : [];
            unset($row['extra_json']);
        }
        unset($row);

        rvm_out([
            'ok'      => true,
            'total'   => $total,
            'page'    => $page,
            'limit'   => $limit,
            'pages'   => (int)ceil($total / $limit),
            'bookings'=> $rows,
        ]);
    }

    case 'booking_detail': {
        $id = (int)($in['id'] ?? 0);
        $st = $pdo->prepare(
            'SELECT b.*, br.name AS branch_name, r.name AS region_name
               FROM rvm_booking b
               JOIN rvm_branch br ON br.id = b.branch_id
               JOIN rvm_region  r  ON r.id  = br.region_id
              WHERE b.id=? LIMIT 1'
        );
        $st->execute([$id]);
        $row = $st->fetch();
        if (!$row) rvm_out(['ok' => false, 'msg' => 'Booking not found'], 404);
        $row['extra'] = $row['extra_json'] ? json_decode((string)$row['extra_json'], true) : [];
        unset($row['extra_json']);
        rvm_out(['ok' => true, 'booking' => $row]);
    }

    case 'booking_status_update': {
        $id     = (int)($in['id']     ?? 0);
        $status = (string)($in['status'] ?? '');
        $note   = trim((string)($in['admin_note'] ?? ''));
        $allowed = ['pending','confirmed','completed','cancelled'];
        if ($id < 1 || !in_array($status, $allowed, true))
            rvm_out(['ok' => false, 'msg' => 'Invalid request'], 400);

        // restore capacity on cancellation
        if ($status === 'cancelled') {
            $bk = $pdo->prepare('SELECT * FROM rvm_booking WHERE id=? LIMIT 1');
            $bk->execute([$id]);
            $bRow = $bk->fetch();
            if ($bRow && $bRow['status'] !== 'cancelled') {
                if (!empty($bRow['slot_id'])) {
                    $pdo->prepare('UPDATE rvm_slot SET booked=GREATEST(0,booked-1) WHERE id=?')
                        ->execute([(int)$bRow['slot_id']]);
                }
                if (!empty($bRow['item_quota_id'])) {
                    $pdo->prepare('UPDATE rvm_item_quota SET booked=GREATEST(0,booked-1) WHERE id=?')
                        ->execute([(int)$bRow['item_quota_id']]);
                }
            }
        }

        $pdo->prepare(
            'UPDATE rvm_booking SET status=?, admin_note=? WHERE id=?'
        )->execute([$status, $note ?: null, $id]);
        rvm_out(['ok' => true]);
    }

    /* ───────────── Admin direct booking ─────────── */

    case 'booking_create_admin': {
        // admin direct booking (no capacity deduction)
        $instId  = (int)($in['instance_id'] ?? 0);
        $brId    = (int)($in['branch_id']   ?? 0);
        $name    = trim((string)($in['customer_name']  ?? ''));
        $phone   = trim((string)($in['customer_phone'] ?? ''));
        $email   = trim((string)($in['customer_email'] ?? ''));
        $resAt   = trim((string)($in['reservation_at'] ?? ''));
        $note    = trim((string)($in['admin_note']     ?? ''));
        $extra   = is_array($in['extra'] ?? null) ? $in['extra'] : [];
        $slotId  = (int)($in['slot_id']       ?? 0) ?: null;
        $iqId    = (int)($in['item_quota_id'] ?? 0) ?: null;
        $itemId  = (int)($in['item_id']       ?? 0) ?: null;

        if ($instId < 1 || $brId < 1 || $name === '' || $phone === '' || $resAt === '')
            rvm_out(['ok' => false, 'msg' => 'instance_id, branch_id, customer_name, customer_phone and reservation_at are required.'], 400);

        $resNo = rvm_gen_no($pdo);
        $pdo->prepare(
            'INSERT INTO rvm_booking
               (instance_id, reservation_no, status, branch_id, item_id, slot_id, item_quota_id,
                reservation_at, customer_name, customer_phone, customer_email, extra_json, admin_note)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
        )->execute([
            $instId, \$resNo, 'pending', $brId, $itemId, $slotId, $iqId,
            $resAt, $name, $phone, $email ?: null,
            count($extra) ? json_encode($extra, JSON_UNESCAPED_UNICODE) : null,
            $note ?: null,
        ]);
        rvm_out(['ok' => true, 'id' => (int)$pdo->lastInsertId(), 'reservation_no' => $resNo]);
    }

    default:
        rvm_out(['ok' => false, 'msg' => "Unknown action: {$action}"], 400);

    } // end switch

} catch (Throwable $e) {
    rvm_out(['ok' => false, 'msg' => 'Server error: ' . $e->getMessage()], 500);
}
