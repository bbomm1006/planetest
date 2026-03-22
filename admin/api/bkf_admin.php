<?php
ob_start();
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/log_helper.php';

header('Content-Type: application/json; charset=utf-8');

// PHP warning 등이 JSON 앞에 섞이지 않도록 버퍼 정리
ob_get_clean();
ob_start();

requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo    = getDB();

// bkf_quota.capacity NULL 허용 (빈칸=제한없음, 0=마감)
try {
    $pdo->exec("ALTER TABLE `bkf_quota` MODIFY COLUMN `capacity` INT DEFAULT NULL");
} catch (Throwable $e) {}

// bkf_forms.description 컬럼 자동 추가 (없을 경우)
try {
    $pdo->exec("ALTER TABLE `bkf_forms` ADD COLUMN `description` TEXT DEFAULT NULL AFTER `btn_name`");
} catch (Throwable $e) {} // 이미 있으면 무시

// bkf_managers_history 테이블 자동 생성 (없을 경우)
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `bkf_managers_history` (
        `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `form_id`      INT UNSIGNED NOT NULL,
        `manager_id`   INT UNSIGNED DEFAULT NULL,
        `changed_by`   VARCHAR(100) NOT NULL DEFAULT '',
        `change_desc`  TEXT,
        `changed_at`   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX `idx_form_id` (`form_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
} catch (Throwable $e) {}

/* ================================================================
   slug 중복/유효성 체크
   ================================================================ */
if ($action === 'check_slug') {
    $slug = trim($_GET['slug'] ?? '');
    if (!$slug || !preg_match('/^[a-z][a-z0-9_]{2,63}$/', $slug)) {
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'Lowercase letters/numbers/underscore only, 3-64 chars, must start with a letter.']);
        exit;
    }
    $reserved = [
        'bkf_forms','bkf_fields','bkf_field_options',
        'bkf_steps','bkf_quota','bkf_managers','bkf_phone_otp'
    ];
    if (in_array('bkf_records_' . $slug, $reserved)) {
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'Reserved slug.']);
        exit;
    }
    $st = $pdo->prepare('SELECT COUNT(*) FROM bkf_forms WHERE slug = ?');
    $st->execute([$slug]);
    if ($st->fetchColumn() > 0) {
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'Slug already in use.']);
        exit;
    }
    $tblName = 'bkf_records_' . $slug;
    $st2 = $pdo->prepare("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?");
    $st2->execute([$tblName]);
    if ($st2->fetchColumn() > 0) {
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'Table already exists in DB.']);
        exit;
    }
    ob_clean();
    echo json_encode(['ok' => true, 'msg' => 'Available.']);
    exit;
}

/* ================================================================
   폼 생성
   ================================================================ */
if ($action === 'create_form') {
    $title      = trim($_POST['title']       ?? '');
    $slug       = trim($_POST['slug']        ?? '');
    $btn        = trim($_POST['btn_name']    ?? 'Reserve');
    $description = trim($_POST['description'] ?? '');

    if (!$title || !$slug) {
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'Title and slug are required.']);
        exit;
    }
    if (!preg_match('/^[a-z][a-z0-9_]{2,63}$/', $slug)) {
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'Invalid slug format.']);
        exit;
    }

    // slug 중복 체크
    $chk = $pdo->prepare('SELECT COUNT(*) FROM bkf_forms WHERE slug = ?');
    $chk->execute([$slug]);
    if ($chk->fetchColumn() > 0) {
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'Slug already in use.']);
        exit;
    }
    $tblName = 'bkf_records_' . $slug;
    $chk2 = $pdo->prepare("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?");
    $chk2->execute([$tblName]);
    if ($chk2->fetchColumn() > 0) {
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'Table already exists in DB.']);
        exit;
    }

    $pdo->beginTransaction();
    try {
        // bkf_forms INSERT
        $pdo->prepare('INSERT INTO bkf_forms (title, slug, btn_name, description) VALUES (?,?,?,?)')
            ->execute([$title, $slug, $btn, $description ?: null]);
        $form_id = (int)$pdo->lastInsertId();

        // 고정 필수 필드: name(0), phone(1) — is_deletable=0
        $pdo->prepare('INSERT INTO bkf_fields (form_id, field_key, label, type, is_required, is_deletable, is_visible, sort_order) VALUES (?,?,?,?,?,?,?,?)')
            ->execute([$form_id, 'name',  'Name',  'text', 1, 0, 1, 0]);
        $pdo->prepare('INSERT INTO bkf_fields (form_id, field_key, label, type, is_required, is_deletable, is_visible, sort_order) VALUES (?,?,?,?,?,?,?,?)')
            ->execute([$form_id, 'phone', 'Phone', 'text', 1, 0, 1, 1]);

        // 기본 스텝: date(0) → info(1)
        $pdo->prepare('INSERT INTO bkf_steps (form_id, step_key, label, sort_order, is_active) VALUES (?,?,?,?,?)')
            ->execute([$form_id, 'date', 'Date',        0, 1]);
        $pdo->prepare('INSERT INTO bkf_steps (form_id, step_key, label, sort_order, is_active) VALUES (?,?,?,?,?)')
            ->execute([$form_id, 'info', 'Information', 1, 1]);

        // 동적 예약 내역 테이블 생성
        $pdo->exec("CREATE TABLE IF NOT EXISTS `{$tblName}` (
            `id`               INT(11)      NOT NULL AUTO_INCREMENT,
            `form_id`          INT(11)      NOT NULL,
            `reservation_no`   VARCHAR(20)  NOT NULL UNIQUE,
            `name`             VARCHAR(255) NOT NULL DEFAULT '',
            `phone`            VARCHAR(50)  NOT NULL DEFAULT '',
            `status`           ENUM('접수','확인','완료','취소') NOT NULL DEFAULT '접수',
            `reservation_date` DATE         DEFAULT NULL,
            `reservation_time` TIME         DEFAULT NULL,
            `store_id`         INT(11)      DEFAULT NULL,
            `store_name`       VARCHAR(255) DEFAULT NULL,
            `created_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            `updated_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_form_id`  (`form_id`),
            KEY `idx_status`   (`status`),
            KEY `idx_res_date` (`reservation_date`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $pdo->commit();
        logAdminAction($pdo, 'create', 'bkf_forms', (string)$form_id);
        ob_clean();
        echo json_encode(['ok' => true, 'form_id' => $form_id]);
    } catch (Throwable $e) {
        $pdo->rollBack();
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'Create failed: ' . $e->getMessage()]);
    }
    exit;
}

/* ================================================================
   폼 목록
   ================================================================ */
if ($action === 'list_forms') {
    $rows = $pdo->query('SELECT id, title, slug, btn_name, is_active, quota_mode, phone_verify_use, created_at FROM bkf_forms ORDER BY id DESC')
                ->fetchAll(PDO::FETCH_ASSOC);

    // bkf_records_{slug} 테이블에 admin_memo, memo_updated_at 컬럼 자동 추가
    foreach ($rows as $r) {
        $t = 'bkf_records_' . $r['slug'];
        try { $pdo->exec("ALTER TABLE `{$t}` ADD COLUMN `admin_memo` TEXT DEFAULT NULL"); } catch (Throwable $e) {}
        try { $pdo->exec("ALTER TABLE `{$t}` ADD COLUMN `memo_updated_at` DATETIME DEFAULT NULL"); } catch (Throwable $e) {}
    }

    // N+1 제거: information_schema에서 bkf_records_* 테이블 행 수를 한 번에 조회
    $countMap = [];
    if (!empty($rows)) {
        $slugs        = array_column($rows, 'slug');
        $tblNames     = array_map(function($s) { return 'bkf_records_' . $s; }, $slugs);
        $placeholders = implode(',', array_fill(0, count($tblNames), '?'));
        $cntStmt = $pdo->prepare(
            "SELECT table_name, table_rows
             FROM information_schema.tables
             WHERE table_schema = DATABASE()
               AND table_name IN ({$placeholders})"
        );
        $cntStmt->execute($tblNames);
        foreach ($cntStmt->fetchAll(PDO::FETCH_ASSOC) as $cr) {
            $countMap[$cr['table_name']] = (int)$cr['table_rows'];
        }
    }

    foreach ($rows as &$row) {
        $tbl = 'bkf_records_' . $row['slug'];
        $row['record_count'] = $countMap[$tbl] ?? 0;
    }
    unset($row);
    ob_clean();
    echo json_encode(['ok' => true, 'data' => $rows]);
    exit;
}

/* ================================================================
   폼 상세 조회
   ================================================================ */
if ($action === 'get_form') {
    $id   = (int)($_GET['id'] ?? 0);
    $stmt = $pdo->prepare('SELECT * FROM bkf_forms WHERE id = ?');
    $stmt->execute([$id]);
    $row  = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) { echo json_encode(['ok' => false, 'msg' => 'Form not found.']); exit; }
    ob_clean();
    echo json_encode(['ok' => true, 'data' => $row]);
    exit;
}

/* ================================================================
   기본정보 저장
   ================================================================ */
if ($action === 'save_basic') {
    $id                = (int)($_POST['id']               ?? 0);
    $title             = trim($_POST['title']             ?? '');
    $btn               = trim($_POST['btn_name']          ?? '');
    $description       = trim($_POST['description']       ?? '');
    $is_active         = (int)($_POST['is_active']        ?? 1);
    $phone_verify_use  = (int)($_POST['phone_verify_use'] ?? 0);
    $quota_mode        = trim($_POST['quota_mode']        ?? 'date');

    if (!in_array($quota_mode, ['date','slot'])) $quota_mode = 'date';

    $pdo->prepare('UPDATE bkf_forms SET title=?, btn_name=?, description=?, is_active=?, phone_verify_use=?, quota_mode=? WHERE id=?')
        ->execute([$title, $btn, $description ?: null, $is_active, $phone_verify_use, $quota_mode, $id]);

    logAdminAction($pdo, 'update', 'bkf_forms', (string)$id);
    ob_clean();
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   폼 삭제
   ================================================================ */
if ($action === 'delete_form') {
    $id  = (int)($_POST['id'] ?? 0);
    if (!$id) { echo json_encode(['ok' => false, 'msg' => 'Invalid request.']); exit; }

    $row = $pdo->prepare('SELECT slug FROM bkf_forms WHERE id=?');
    $row->execute([$id]);
    $form = $row->fetch(PDO::FETCH_ASSOC);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => 'Form not found.']); exit; }

    $tbl = 'bkf_records_' . $form['slug'];

    try {
        $pdo->beginTransaction();

        // 동적 테이블 삭제
        $pdo->exec("DROP TABLE IF EXISTS `{$tbl}`");

        // 필드 옵션 삭제
        $fids = $pdo->prepare('SELECT id FROM bkf_fields WHERE form_id=?');
        $fids->execute([$id]);
        foreach ($fids->fetchAll(PDO::FETCH_COLUMN) as $fid) {
            $pdo->prepare('DELETE FROM bkf_field_options WHERE field_id=?')->execute([$fid]);
        }

        // 메타 테이블 전부 삭제
        foreach (['bkf_fields','bkf_steps','bkf_quota','bkf_managers','bkf_forms'] as $t) {
            $col = ($t === 'bkf_forms') ? 'id' : 'form_id';
            $pdo->prepare("DELETE FROM `{$t}` WHERE `{$col}`=?")->execute([$id]);
        }

        $pdo->commit();
        logAdminAction($pdo, 'delete', 'bkf_forms', (string)$id);
        ob_clean();
        echo json_encode(['ok' => true]);
    } catch (Throwable $e) {
        $pdo->rollBack();
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'Delete failed: ' . $e->getMessage()]);
    }
    exit;
}

/* ================================================================
   필드 목록
   ================================================================ */
if ($action === 'list_fields') {
    $form_id = (int)($_GET['form_id'] ?? 0);
    $stmt = $pdo->prepare(
        'SELECT f.*,
            (SELECT COUNT(*) FROM bkf_field_options WHERE field_id = f.id) AS option_count
         FROM bkf_fields f
         WHERE f.form_id = ?
         ORDER BY f.sort_order ASC'
    );
    $stmt->execute([$form_id]);
    $fields = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($fields as &$field) {
        if (in_array($field['type'], ['dropdown','radio','checkbox'])) {
            $opts = $pdo->prepare('SELECT * FROM bkf_field_options WHERE field_id=? ORDER BY sort_order ASC');
            $opts->execute([$field['id']]);
            $field['options'] = $opts->fetchAll(PDO::FETCH_ASSOC);
        }
    }
    unset($field);
    ob_clean();
    echo json_encode(['ok' => true, 'data' => $fields]);
    exit;
}

/* ================================================================
   필드 저장 (추가/수정)
   ================================================================ */
if ($action === 'save_field') {
    $id          = (int)($_POST['id']          ?? 0);
    $form_id     = (int)($_POST['form_id']     ?? 0);
    $label       = trim($_POST['label']        ?? '');
    $field_key   = trim($_POST['field_key']    ?? '');
    $type        = trim($_POST['type']         ?? '');
    $placeholder = trim($_POST['placeholder']  ?? '');
    $is_required = (int)($_POST['is_required'] ?? 0);
    $is_visible  = (int)($_POST['is_visible']  ?? 1);
    $sort_order  = (int)($_POST['sort_order']  ?? 99);
    $options     = json_decode($_POST['options'] ?? '[]', true);

    $allowed_types = ['text','date','time_slot','item_select','store_select','radio','checkbox','dropdown','date_range'];
    if (!$label || !$type || !in_array($type, $allowed_types)) {
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'Label and valid type are required.']);
        exit;
    }

    if ($id > 0) {
        // field_key, is_deletable 는 수정 불가
        $pdo->prepare('UPDATE bkf_fields SET label=?, type=?, placeholder=?, is_required=?, is_visible=?, sort_order=? WHERE id=? AND form_id=?')
            ->execute([$label, $type, $placeholder, $is_required, $is_visible, $sort_order, $id, $form_id]);
        $field_id = $id;
    } else {
        if (!$field_key || !preg_match('/^[a-z][a-z0-9_]{0,63}$/', $field_key)) {
            ob_clean();
            echo json_encode(['ok' => false, 'msg' => 'Invalid field_key format.']);
            exit;
        }
        // field_key 예약어 방지
        if (in_array($field_key, ['id','form_id','reservation_no','status','created_at','updated_at','name','phone','store_id','store_name','reservation_date','reservation_time'])) {
            ob_clean();
            echo json_encode(['ok' => false, 'msg' => 'Reserved field_key.']);
            exit;
        }
        // 중복 체크
        $chk = $pdo->prepare('SELECT COUNT(*) FROM bkf_fields WHERE form_id=? AND field_key=?');
        $chk->execute([$form_id, $field_key]);
        if ($chk->fetchColumn() > 0) {
            ob_clean();
            echo json_encode(['ok' => false, 'msg' => 'field_key already in use.']);
            exit;
        }

        $pdo->prepare('INSERT INTO bkf_fields (form_id, field_key, label, type, placeholder, is_required, is_deletable, is_visible, sort_order) VALUES (?,?,?,?,?,?,?,?,?)')
            ->execute([$form_id, $field_key, $label, $type, $placeholder, $is_required, 1, $is_visible, $sort_order]);
        $field_id = (int)$pdo->lastInsertId();

        // 동적 테이블에 컬럼 추가
        $slugRow = $pdo->prepare('SELECT slug FROM bkf_forms WHERE id=?');
        $slugRow->execute([$form_id]);
        $slug = $slugRow->fetchColumn();
        if ($slug) {
            $tbl     = 'bkf_records_' . $slug;
            $col_def = in_array($type, ['date_range']) ? 'VARCHAR(100)' : 'VARCHAR(500)';
            try {
                $pdo->exec("ALTER TABLE `{$tbl}` ADD COLUMN `{$field_key}` {$col_def} DEFAULT NULL");
            } catch (Throwable $e) { /* column already exists — ignore */ }
        }
    }

    // 옵션 저장 (dropdown / radio / checkbox)
    if (in_array($type, ['dropdown','radio','checkbox'])) {
        $pdo->prepare('DELETE FROM bkf_field_options WHERE field_id=?')->execute([$field_id]);
        foreach ((array)$options as $i => $opt) {
            $ol = trim($opt['label'] ?? '');
            $ov = (int)($opt['is_visible'] ?? 1);
            if ($ol !== '') {
                $pdo->prepare('INSERT INTO bkf_field_options (field_id, label, sort_order, is_visible) VALUES (?,?,?,?)')
                    ->execute([$field_id, $ol, $i, $ov]);
            }
        }
    }

    ob_clean();
    echo json_encode(['ok' => true, 'field_id' => $field_id]);
    exit;
}

/* ================================================================
   필드 삭제
   ================================================================ */
if ($action === 'delete_field') {
    $id      = (int)($_POST['id']      ?? 0);
    $form_id = (int)($_POST['form_id'] ?? 0);

    // is_deletable=0 인 필드는 삭제 불가
    $chk = $pdo->prepare('SELECT field_key, is_deletable, type FROM bkf_fields WHERE id=? AND form_id=?');
    $chk->execute([$id, $form_id]);
    $field = $chk->fetch(PDO::FETCH_ASSOC);
    if (!$field) { echo json_encode(['ok' => false, 'msg' => 'Field not found.']); exit; }
    if (!(int)$field['is_deletable']) {
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'This field cannot be deleted (required fixed field).']);
        exit;
    }

    $pdo->prepare('DELETE FROM bkf_field_options WHERE field_id=?')->execute([$id]);
    $pdo->prepare('DELETE FROM bkf_fields WHERE id=?')->execute([$id]);

    // 동적 테이블에서 컬럼 DROP
    $slugRow = $pdo->prepare('SELECT slug FROM bkf_forms WHERE id=?');
    $slugRow->execute([$form_id]);
    $slug = $slugRow->fetchColumn();
    if ($slug) {
        $tbl = 'bkf_records_' . $slug;
        try {
            $pdo->exec("ALTER TABLE `{$tbl}` DROP COLUMN `{$field['field_key']}`");
        } catch (Throwable $e) { /* column may not exist — ignore */ }
    }

    ob_clean();
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   필드 정렬 저장
   ================================================================ */
if ($action === 'sort_fields') {
    $orders = json_decode($_POST['orders'] ?? '[]', true);
    foreach ((array)$orders as $item) {
        $pdo->prepare('UPDATE bkf_fields SET sort_order=? WHERE id=?')
            ->execute([(int)$item['sort'], (int)$item['id']]);
    }
    ob_clean();
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   필드 노출 토글
   ================================================================ */
if ($action === 'toggle_field_visible') {
    $id  = (int)($_POST['id']         ?? 0);
    $val = (int)($_POST['is_visible'] ?? 1);
    $pdo->prepare('UPDATE bkf_fields SET is_visible=? WHERE id=?')->execute([$val, $id]);
    ob_clean();
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   스텝 목록
   ================================================================ */
if ($action === 'list_steps') {
    $form_id = (int)($_GET['form_id'] ?? 0);
    $stmt = $pdo->prepare('SELECT * FROM bkf_steps WHERE form_id=? ORDER BY sort_order ASC');
    $stmt->execute([$form_id]);
    ob_clean();
    echo json_encode(['ok' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

/* ================================================================
   스텝 일괄 저장 (추가/수정/순서)
   info 스텝은 항상 마지막 sort_order 고정
   ================================================================ */
if ($action === 'save_steps') {
    $form_id = (int)($_POST['form_id'] ?? 0);
    $items   = json_decode($_POST['items'] ?? '[]', true);

    $allowed_keys = ['store','date','time_slot','item','info'];

    // 전달된 순서 그대로 저장 (info 포함, 강제 마지막 없음)
    $sorted = (array)$items;

    foreach ($sorted as $idx => $item) {
        $step_key  = trim($item['step_key'] ?? '');
        $label     = trim($item['label']    ?? $step_key);
        $is_active = (int)($item['is_active'] ?? 1);
        $item_id   = (int)($item['id']       ?? 0);

        if (!in_array($step_key, $allowed_keys)) continue;

        $sort = $idx;

        if ($item_id > 0) {
            $pdo->prepare('UPDATE bkf_steps SET label=?, sort_order=?, is_active=? WHERE id=? AND form_id=?')
                ->execute([$label, $sort, $is_active, $item_id, $form_id]);
        } else {
            // 중복 방지
            $ck = $pdo->prepare('SELECT id FROM bkf_steps WHERE form_id=? AND step_key=?');
            $ck->execute([$form_id, $step_key]);
            if ($ck->fetchColumn()) continue;

            $pdo->prepare('INSERT INTO bkf_steps (form_id, step_key, label, sort_order, is_active) VALUES (?,?,?,?,?)')
                ->execute([$form_id, $step_key, $label, $sort, $is_active]);
        }
    }

    ob_clean();
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   스텝 단일 활성화 토글
   ================================================================ */
if ($action === 'toggle_step') {
    $id        = (int)($_POST['id']        ?? 0);
    $is_active = (int)($_POST['is_active'] ?? 1);

    // 모든 스텝 활성화/비활성화 가능

    $pdo->prepare('UPDATE bkf_steps SET is_active=? WHERE id=?')->execute([$is_active, $id]);
    ob_clean();
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   공통: 폼 정보 + slug 가져오기
   ================================================================ */
function bkf_get_form(PDO $pdo, int $form_id): ?array {
    $st = $pdo->prepare('SELECT * FROM bkf_forms WHERE id=?');
    $st->execute([$form_id]);
    $row = $st->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

function bkf_records_tbl(string $slug): string {
    return 'bkf_records_' . $slug;
}

/* ================================================================
   수량(Quota) 조회
   GET: form_id, year, month, store_id(optional)
   ================================================================ */
if ($action === 'get_quota') {
    $form_id  = (int)($_GET['form_id']  ?? 0);
    $year     = (int)($_GET['year']     ?? date('Y'));
    $month    = (int)($_GET['month']    ?? date('n'));
    $store_id = $_GET['store_id'] !== '' && $_GET['store_id'] !== null
                ? (int)$_GET['store_id'] : null;

    $form = bkf_get_form($pdo, $form_id);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => 'Form not found.']); exit; }

    $start = sprintf('%04d-%02d-01', $year, $month);
    $end   = date('Y-m-t', strtotime($start));

    if ($store_id !== null) {
        $st = $pdo->prepare(
            'SELECT * FROM bkf_quota
             WHERE form_id=? AND store_id=? AND quota_date BETWEEN ? AND ?
             ORDER BY quota_date, slot_time'
        );
        $st->execute([$form_id, $store_id, $start, $end]);
    } else {
        $st = $pdo->prepare(
            'SELECT * FROM bkf_quota
             WHERE form_id=? AND store_id IS NULL AND quota_date BETWEEN ? AND ?
             ORDER BY quota_date, slot_time'
        );
        $st->execute([$form_id, $start, $end]);
    }

    ob_clean();
    echo json_encode(['ok' => true, 'data' => $st->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

/* ================================================================
   수량(Quota) 저장 (단건 upsert)
   POST: form_id, store_id(nullable), quota_date, slot_time(nullable), capacity
   ================================================================ */
if ($action === 'save_quota') {
    $form_id   = (int)($_POST['form_id']  ?? 0);
    $store_id  = ($_POST['store_id'] !== '' && $_POST['store_id'] !== null)
                  ? (int)$_POST['store_id'] : null;
    $quota_date = trim($_POST['quota_date'] ?? '');
    $slot_time  = trim($_POST['slot_time']  ?? '') ?: null;
    $capacity   = max(0, (int)($_POST['capacity'] ?? 0));

    if (!$form_id || !$quota_date) {
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'form_id and quota_date are required.']);
        exit;
    }

    // UPSERT — capacity 만 갱신, booked 는 건드리지 않음
    if ($store_id !== null) {
        $pdo->prepare(
            'INSERT INTO bkf_quota (form_id, store_id, quota_date, slot_time, capacity, booked)
             VALUES (?,?,?,?,?,0)
             ON DUPLICATE KEY UPDATE capacity=VALUES(capacity)'
        )->execute([$form_id, $store_id, $quota_date, $slot_time, $capacity]);
    } else {
        $pdo->prepare(
            'INSERT INTO bkf_quota (form_id, store_id, quota_date, slot_time, capacity, booked)
             VALUES (?,NULL,?,?,?,0)
             ON DUPLICATE KEY UPDATE capacity=VALUES(capacity)'
        )->execute([$form_id, $quota_date, $slot_time, $capacity]);
    }

    ob_clean();
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   수량(Quota) 일괄 저장
   POST: form_id, items = [{store_id, quota_date, slot_time, capacity}, ...]
   ================================================================ */
if ($action === 'bulk_quota') {
    $form_id          = (int)($_POST['form_id'] ?? 0);
    $items            = json_decode($_POST['items'] ?? '[]', true);
    $apply_all_stores = (trim($_POST['apply_all_stores'] ?? '0') === '1');

    if (!$form_id || !is_array($items)) {
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'Invalid parameters.']);
        exit;
    }

    // apply_all_stores=true: 전체 지점 목록 조회
    $allStoreIds = [null]; // null = 공통
    if ($apply_all_stores) {
        try {
            $storeRows = $pdo->query('SELECT id FROM stores ORDER BY sort_order, id')->fetchAll(PDO::FETCH_COLUMN);
            foreach ($storeRows as $sid) {
                $allStoreIds[] = (int)$sid;
            }
        } catch (Throwable $e) {}
    }

    // 저장 대상 날짜 추출
    $targetDates = [];
    foreach ($items as $item) {
        $d = trim($item['quota_date'] ?? '');
        if ($d) $targetDates[$d] = true;
    }

    $pdo->beginTransaction();
    try {
        foreach ($allStoreIds as $targetStore) {
            // 해당 날짜 기존 데이터 삭제
            foreach (array_keys($targetDates) as $quota_date) {
                if ($targetStore !== null) {
                    $pdo->prepare('DELETE FROM bkf_quota WHERE form_id=? AND store_id=? AND quota_date=?')
                        ->execute([$form_id, $targetStore, $quota_date]);
                } else {
                    $pdo->prepare('DELETE FROM bkf_quota WHERE form_id=? AND store_id IS NULL AND quota_date=?')
                        ->execute([$form_id, $quota_date]);
                }
            }

            // 새로 삽입
            foreach ($items as $item) {
                $quota_date = trim($item['quota_date'] ?? '');
                $slot_time  = trim($item['slot_time']  ?? '') ?: null;
                $rawCap = $item['capacity'];
                $capacity = ($rawCap === null || $rawCap === '') ? null : max(0, (int)$rawCap);
                if (!$quota_date) continue;

                if ($targetStore !== null) {
                    $pdo->prepare(
                        'INSERT INTO bkf_quota (form_id, store_id, quota_date, slot_time, capacity, booked)
                         VALUES (?,?,?,?,?,0)'
                    )->execute([$form_id, $targetStore, $quota_date, $slot_time, $capacity]);
                } else {
                    $pdo->prepare(
                        'INSERT INTO bkf_quota (form_id, store_id, quota_date, slot_time, capacity, booked)
                         VALUES (?,NULL,?,?,?,0)'
                    )->execute([$form_id, $quota_date, $slot_time, $capacity]);
                }
            }
        }
        $pdo->commit();
        ob_clean();
        echo json_encode(['ok' => true]);
    } catch (Throwable $e) {
        $pdo->rollBack();
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'Bulk save failed: ' . $e->getMessage()]);
    }
    exit;
}


if ($action === 'delete_quota') {
    $id = (int)($_POST['id'] ?? 0);
    if (!$id) { echo json_encode(['ok' => false, 'msg' => 'Invalid id.']); exit; }

    // booked > 0 이면 삭제 차단
    $chk = $pdo->prepare('SELECT booked FROM bkf_quota WHERE id=?');
    $chk->execute([$id]);
    $row = $chk->fetch(PDO::FETCH_ASSOC);
    if ($row && (int)$row['booked'] > 0) {
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'Cannot delete: there are existing bookings for this quota.']);
        exit;
    }

    $pdo->prepare('DELETE FROM bkf_quota WHERE id=?')->execute([$id]);
    ob_clean();
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   담당자 목록
   ================================================================ */
if ($action === 'list_managers') {
    $form_id = (int)($_GET['form_id'] ?? 0);
    $st = $pdo->prepare('SELECT * FROM bkf_managers WHERE form_id=? ORDER BY id ASC');
    $st->execute([$form_id]);
    ob_clean();
    echo json_encode(['ok' => true, 'data' => $st->fetchAll(PDO::FETCH_ASSOC)]);
    exit;
}

/* ================================================================
   담당자 저장 (추가/수정)
   ================================================================ */
if ($action === 'save_manager') {
    $id               = (int)($_POST['id']               ?? 0);
    $form_id          = (int)($_POST['form_id']          ?? 0);
    $name             = trim($_POST['name']              ?? '');
    $dept             = trim($_POST['department']        ?? '');
    $phone            = trim($_POST['phone']             ?? '');
    $email            = trim($_POST['email']             ?? '');
    $notify_email     = (int)($_POST['notify_email']     ?? 0);
    $notify_sms       = (int)($_POST['notify_sms']       ?? 0);
    $notify_alimtalk  = (int)($_POST['notify_alimtalk']  ?? 0);
    $notify_sheet     = (int)($_POST['notify_sheet']     ?? 0);
    $sheet_webhook    = trim($_POST['sheet_webhook']     ?? '');
    $sheet_name       = trim($_POST['sheet_name']        ?? '');
    $is_active        = (int)($_POST['is_active']        ?? 1);
    $changed_by       = $_SESSION['admin_user'] ?? 'system';

    if (!$name) { ob_clean(); echo json_encode(['ok' => false, 'msg' => 'Name is required.']); exit; }

    if ($id > 0) {
        // UPDATE 전에 oldData 조회 (diff 비교용)
        $oldStmt = $pdo->prepare('SELECT * FROM bkf_managers WHERE id=?');
        $oldStmt->execute([$id]);
        $oldData = $oldStmt->fetch(PDO::FETCH_ASSOC) ?: [];

        $pdo->prepare(
            'UPDATE bkf_managers SET
                name=?, department=?, phone=?, email=?,
                notify_email=?, notify_sms=?, notify_alimtalk=?, notify_sheet=?,
                sheet_webhook=?, sheet_name=?, is_active=?
             WHERE id=? AND form_id=?'
        )->execute([
            $name, $dept, $phone, $email,
            $notify_email, $notify_sms, $notify_alimtalk, $notify_sheet,
            $sheet_webhook, $sheet_name, $is_active,
            $id, $form_id
        ]);

        // 변경된 필드 diff
        $fieldMap = [
            'name'           => $name,
            'department'     => $dept,
            'phone'          => $phone,
            'email'          => $email,
            'notify_email'   => $notify_email,
            'notify_sms'     => $notify_sms,
            'notify_alimtalk'=> $notify_alimtalk,
            'notify_sheet'   => $notify_sheet,
            'is_active'      => $is_active,
        ];
        $diff = [];
        foreach ($fieldMap as $f => $newVal) {
            $oldVal = (string)($oldData[$f] ?? '');
            $newVal = (string)($newVal ?? '');
            if ($oldVal !== $newVal) {
                $diff[$f] = ['before' => $oldData[$f] ?? '', 'after' => $newVal];
            }
        }
        if ($diff) {
            try {
                $pdo->prepare(
                    'INSERT INTO bkf_managers_history (form_id, manager_id, changed_by, change_desc) VALUES (?,?,?,?)'
                )->execute([$form_id, $id, $changed_by, json_encode($diff, JSON_UNESCAPED_UNICODE)]);
            } catch (Throwable $e) {}
        }
    } else {
        $pdo->prepare(
            'INSERT INTO bkf_managers
                (form_id, name, department, phone, email,
                 notify_email, notify_sms, notify_alimtalk, notify_sheet,
                 sheet_webhook, sheet_name, is_active)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
        )->execute([
            $form_id, $name, $dept, $phone, $email,
            $notify_email, $notify_sms, $notify_alimtalk, $notify_sheet,
            $sheet_webhook, $sheet_name, $is_active
        ]);
        $new_id = (int)$pdo->lastInsertId();
        try {
            $pdo->prepare(
                'INSERT INTO bkf_managers_history (form_id, manager_id, changed_by, change_desc) VALUES (?,?,?,?)'
            )->execute([$form_id, $new_id, $changed_by, json_encode(['action'=>'created'], JSON_UNESCAPED_UNICODE)]);
        } catch (Throwable $e) {}
    }

    ob_clean();
    echo json_encode(['ok' => true]);
    exit;
}


if ($action === 'delete_manager') {
    $id         = (int)($_POST['id']      ?? 0);
    $form_id    = (int)($_POST['form_id'] ?? 0);
    $changed_by = $_SESSION['admin_user'] ?? 'system';
    $pdo->prepare('DELETE FROM bkf_managers WHERE id=?')->execute([$id]);
    try {
        $pdo->prepare(
            'INSERT INTO bkf_managers_history (form_id, manager_id, changed_by, change_desc) VALUES (?,?,?,?)'
        )->execute([$form_id, $id, $changed_by, json_encode(['action'=>'deleted'], JSON_UNESCAPED_UNICODE)]);
    } catch (Throwable $e) {}
    ob_clean();
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   담당자 변경 이력 조회
   ================================================================ */
if ($action === 'list_manager_history') {
    $form_id = (int)($_GET['form_id'] ?? 0);
    try {
        $st = $pdo->prepare(
            'SELECT h.*, m.name AS manager_name
             FROM bkf_managers_history h
             LEFT JOIN bkf_managers m ON m.id = h.manager_id
             WHERE h.form_id = ?
             ORDER BY h.changed_at DESC LIMIT 50'
        );
        $st->execute([$form_id]);
        ob_clean();
        echo json_encode(['ok' => true, 'data' => $st->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (Throwable $e) {
        // 테이블 없으면 빈 배열 반환
        ob_clean();
        echo json_encode(['ok' => true, 'data' => []]);
    }
    exit;
}

/* ================================================================
   담당자 메모 저장
   POST: form_id, record_id, admin_memo
   ================================================================ */
if ($action === 'save_memo') {
    $form_id   = (int)($_POST['form_id']   ?? 0);
    $record_id = (int)($_POST['record_id'] ?? 0);
    $memo      = trim($_POST['admin_memo'] ?? '');

    $form = bkf_get_form($pdo, $form_id);
    if (!$form) { ob_clean(); echo json_encode(['ok' => false, 'msg' => 'Form not found.']); exit; }
    $tbl = bkf_records_tbl($form['slug']);

    try {
        $pdo->prepare("UPDATE `{$tbl}` SET admin_memo=?, memo_updated_at=NOW() WHERE id=? AND form_id=?")
            ->execute([$memo ?: null, $record_id, $form_id]);
        ob_clean();
        echo json_encode(['ok' => true]);
    } catch (Throwable $e) {
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => $e->getMessage()]);
    }
    exit;
}

/* ================================================================
   예약 내역 목록 (검색 필터 + 페이징)
   GET: form_id, keyword, status, store_id, from, to, page
   ================================================================ */
if ($action === 'list_records') {
    $form_id  = (int)($_GET['form_id']  ?? 0);
    $keyword  = trim($_GET['keyword']   ?? '');
    $status   = trim($_GET['status']    ?? '');
    $store_id = trim($_GET['store_id']  ?? '');
    $from     = trim($_GET['from']      ?? '');
    $to       = trim($_GET['to']        ?? '');
    $page     = max(1, (int)($_GET['page'] ?? 1));
    $limit    = 20;
    $offset   = ($page - 1) * $limit;

    $form = bkf_get_form($pdo, $form_id);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => 'Form not found.']); exit; }
    $tbl = bkf_records_tbl($form['slug']);

    // 자동 완료 처리 (날짜 지난 접수/확인 → 완료)
    try {
        $pdo->exec("UPDATE `{$tbl}` SET status='완료' WHERE status IN ('접수','확인') AND reservation_date < CURDATE()");
    } catch (Throwable $e) {}

    $where  = ['r.form_id = ?'];
    $params = [$form_id];

    if ($keyword) {
        $where[]  = '(r.name LIKE ? OR r.phone LIKE ? OR r.reservation_no LIKE ?)';
        $params[] = "%{$keyword}%";
        $params[] = "%{$keyword}%";
        $params[] = "%{$keyword}%";
    }
    if ($status)   { $where[] = 'r.status = ?';            $params[] = $status; }
    if ($store_id) { $where[] = 'r.store_id = ?';          $params[] = (int)$store_id; }
    if ($from)     { $where[] = 'r.reservation_date >= ?'; $params[] = $from; }
    if ($to)       { $where[] = 'r.reservation_date <= ?'; $params[] = $to; }

    $whereSQL = implode(' AND ', $where);

    $total = $pdo->prepare("SELECT COUNT(*) FROM `{$tbl}` r WHERE {$whereSQL}");
    $total->execute($params);
    $totalCount = (int)$total->fetchColumn();

    // 동적 필드 키 목록 (is_visible=1)
    $fst = $pdo->prepare(
        "SELECT field_key, label, type FROM bkf_fields
         WHERE form_id=? AND is_visible=1
         ORDER BY sort_order ASC"
    );
    $fst->execute([$form_id]);
    $fieldMeta = $fst->fetchAll(PDO::FETCH_ASSOC);

    // 실제 존재하는 컬럼만 SELECT (동적 필드 안전 처리)
    $existCols = $pdo->prepare(
        "SELECT column_name FROM information_schema.columns
         WHERE table_schema=DATABASE() AND table_name=?"
    );
    $existCols->execute([$tbl]);
    $existColList = array_column($existCols->fetchAll(PDO::FETCH_ASSOC), 'column_name');

    $extraCols = '';
    $validFields = [];
    foreach ($fieldMeta as $f) {
        if (in_array($f['field_key'], $existColList)) {
            $extraCols .= ", r.`{$f['field_key']}`";
            $validFields[] = $f;
        }
    }

    $sql = "SELECT r.id, r.reservation_no, r.name, r.phone, r.status,
                   r.reservation_date, r.reservation_time,
                   r.store_id, r.store_name, r.created_at, r.updated_at,
                   r.admin_memo, r.memo_updated_at
                   {$extraCols}
            FROM `{$tbl}` r
            WHERE {$whereSQL}
            ORDER BY r.id DESC
            LIMIT {$limit} OFFSET {$offset}";

    $st = $pdo->prepare($sql);
    $st->execute($params);
    $rows = $st->fetchAll(PDO::FETCH_ASSOC);

    ob_clean();
    echo json_encode([
        'ok'          => true,
        'data'        => $rows,
        'total'       => $totalCount,
        'page'        => $page,
        'limit'       => $limit,
        'field_meta'  => $validFields,
    ]);
    exit;
}

/* ================================================================
   예약 상세 조회
   GET: form_id, id
   ================================================================ */
if ($action === 'get_record') {
    $form_id = (int)($_GET['form_id'] ?? 0);
    $id      = (int)($_GET['id']      ?? 0);

    $form = bkf_get_form($pdo, $form_id);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => 'Form not found.']); exit; }
    $tbl = bkf_records_tbl($form['slug']);

    $st = $pdo->prepare("SELECT * FROM `{$tbl}` WHERE id=? AND form_id=?");
    $st->execute([$id, $form_id]);
    $row = $st->fetch(PDO::FETCH_ASSOC);
    if (!$row) { echo json_encode(['ok' => false, 'msg' => 'Record not found.']); exit; }

    // 필드 메타
    $fst = $pdo->prepare('SELECT * FROM bkf_fields WHERE form_id=? ORDER BY sort_order ASC');
    $fst->execute([$form_id]);
    $fields = $fst->fetchAll(PDO::FETCH_ASSOC);

    ob_clean();
    echo json_encode(['ok' => true, 'data' => $row, 'fields' => $fields]);
    exit;
}

/* ================================================================
   예약 상태 변경
   POST: form_id, id, status
   ================================================================ */
if ($action === 'update_status') {
    $form_id = (int)($_POST['form_id'] ?? 0);
    $id      = (int)($_POST['id']      ?? 0);
    $status  = trim($_POST['status']   ?? '');

    $allowed = ['접수', '확인', '완료', '취소'];
    if (!in_array($status, $allowed)) {
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'Invalid status value.']);
        exit;
    }

    $form = bkf_get_form($pdo, $form_id);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => 'Form not found.']); exit; }
    $tbl = bkf_records_tbl($form['slug']);

    // 취소 시 quota 복구
    if ($status === '취소') {
        $cur = $pdo->prepare("SELECT * FROM `{$tbl}` WHERE id=? AND form_id=?");
        $cur->execute([$id, $form_id]);
        $rec = $cur->fetch(PDO::FETCH_ASSOC);

        if ($rec && $rec['status'] !== '취소') {
            bkf_quota_restore($pdo, $form_id, $rec);
        }
    }

    $pdo->prepare("UPDATE `{$tbl}` SET status=? WHERE id=? AND form_id=?")
        ->execute([$status, $id, $form_id]);

    logAdminAction($pdo, 'update_status', 'bkf_records', (string)$id);
    ob_clean();
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   예약 수정 (관리자)
   수량 재계산: 기존 quota 복구 → 새 quota 차감
   POST: form_id, id, reservation_date, reservation_time, store_id,
         store_name, + 동적 필드 key=>value
   ================================================================ */
if ($action === 'update_record') {
    $form_id = (int)($_POST['form_id'] ?? 0);
    $id      = (int)($_POST['id']      ?? 0);

    $form = bkf_get_form($pdo, $form_id);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => 'Form not found.']); exit; }
    $tbl = bkf_records_tbl($form['slug']);

    // 현재 예약 조회
    $cur = $pdo->prepare("SELECT * FROM `{$tbl}` WHERE id=? AND form_id=?");
    $cur->execute([$id, $form_id]);
    $rec = $cur->fetch(PDO::FETCH_ASSOC);
    if (!$rec) { echo json_encode(['ok' => false, 'msg' => 'Record not found.']); exit; }

    // 접수 상태일 때만 수정 허용
    if ($rec['status'] !== '접수') {
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'Only records with status "접수" can be modified.']);
        exit;
    }

    $new_date     = trim($_POST['reservation_date'] ?? '') ?: null;
    $new_time     = trim($_POST['reservation_time'] ?? '') ?: null;
    $new_store_id = ($_POST['store_id'] !== '' && isset($_POST['store_id']))
                    ? (int)$_POST['store_id'] : null;
    $new_store_nm = trim($_POST['store_name'] ?? '') ?: null;
    $new_name     = trim($_POST['name']  ?? '') ?: $rec['name'];
    $new_phone    = trim($_POST['phone'] ?? '') ?: $rec['phone'];

    // 동적 필드 값 수집
    $fst = $pdo->prepare('SELECT field_key FROM bkf_fields WHERE form_id=? AND is_deletable=1');
    $fst->execute([$form_id]);
    $dynKeys = array_column($fst->fetchAll(PDO::FETCH_ASSOC), 'field_key');

    $pdo->beginTransaction();
    try {
        // 기존 quota 복구
        bkf_quota_restore($pdo, $form_id, $rec);

        // 새 quota 차감 (quota_mode=date면 날짜만 차감)
        $deduct_time = ($form['quota_mode'] === 'slot') ? $new_time : null;
        $quotaOk = bkf_quota_deduct($pdo, $form_id, $new_store_id, $new_date, $deduct_time);
        if (!$quotaOk) {
            $pdo->rollBack();
            ob_clean();
            echo json_encode(['ok' => false, 'msg' => 'No remaining capacity for the selected date/time.']);
            exit;
        }

        // 기본 컬럼 UPDATE
        $new_memo = isset($_POST['admin_memo']) ? trim($_POST['admin_memo']) : null;
        $sets   = ['name=?','phone=?','reservation_date=?','reservation_time=?','store_id=?','store_name=?'];
        $vals   = [$new_name, $new_phone, $new_date, $new_time, $new_store_id, $new_store_nm];
        if ($new_memo !== null) {
            $sets[] = 'admin_memo=?';
            $sets[] = 'memo_updated_at=NOW()';
            $vals[] = $new_memo ?: null;
        }

        // 동적 필드 UPDATE
        $existCols = $pdo->prepare(
            "SELECT column_name FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=?"
        );
        $existCols->execute([$tbl]);
        $existColList = array_column($existCols->fetchAll(PDO::FETCH_ASSOC), 'column_name');

        foreach ($dynKeys as $fk) {
            if (isset($_POST[$fk]) && in_array($fk, $existColList)) {
                $sets[] = "`{$fk}`=?";
                $vals[] = trim($_POST[$fk]);
            }
        }

        $vals[] = $id;
        $vals[] = $form_id;
        $pdo->prepare("UPDATE `{$tbl}` SET " . implode(',', $sets) . " WHERE id=? AND form_id=?")
            ->execute($vals);

        $pdo->commit();
        logAdminAction($pdo, 'update', 'bkf_records', (string)$id);
        ob_clean();
        echo json_encode(['ok' => true]);
    } catch (Throwable $e) {
        $pdo->rollBack();
        ob_clean();
        echo json_encode(['ok' => false, 'msg' => 'Update failed: ' . $e->getMessage()]);
    }
    exit;
}

/* ================================================================
   예약 삭제 (선택 행)
   POST: form_id, ids (comma separated)
   ================================================================ */
if ($action === 'delete_records') {
    $form_id = (int)($_POST['form_id'] ?? 0);
    $ids_raw = $_POST['ids'] ?? '';
    $ids     = array_filter(array_map('intval', explode(',', $ids_raw)));

    if (empty($ids)) { echo json_encode(['ok' => false, 'msg' => 'No records selected.']); exit; }

    $form = bkf_get_form($pdo, $form_id);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => 'Form not found.']); exit; }
    $tbl = bkf_records_tbl($form['slug']);

    $ph = implode(',', array_fill(0, count($ids), '?'));

    // 삭제 전 quota 복구
    $recs = $pdo->prepare("SELECT * FROM `{$tbl}` WHERE id IN ({$ph}) AND form_id=?");
    $recs->execute(array_merge($ids, [$form_id]));
    foreach ($recs->fetchAll(PDO::FETCH_ASSOC) as $rec) {
        if (!in_array($rec['status'], ['취소', '완료'])) {
            bkf_quota_restore($pdo, $form_id, $rec);
        }
    }

    $pdo->prepare("DELETE FROM `{$tbl}` WHERE id IN ({$ph}) AND form_id=?")
        ->execute(array_merge($ids, [$form_id]));

    ob_clean();
    echo json_encode(['ok' => true, 'deleted' => count($ids)]);
    exit;
}

/* ================================================================
   엑셀(CSV) 다운로드 — 검색 조건 반영
   GET: form_id, keyword, status, store_id, from, to
   ================================================================ */
if ($action === 'export_excel') {
    $form_id  = (int)($_GET['form_id']  ?? 0);
    $keyword  = trim($_GET['keyword']   ?? '');
    $status   = trim($_GET['status']    ?? '');
    $store_id = trim($_GET['store_id']  ?? '');
    $from     = trim($_GET['from']      ?? '');
    $to       = trim($_GET['to']        ?? '');

    $form = bkf_get_form($pdo, $form_id);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => 'Form not found.']); exit; }
    $tbl = bkf_records_tbl($form['slug']);

    // 필드 메타 (모든 필드)
    $fst = $pdo->prepare('SELECT field_key, label FROM bkf_fields WHERE form_id=? ORDER BY sort_order ASC');
    $fst->execute([$form_id]);
    $fieldMeta = $fst->fetchAll(PDO::FETCH_ASSOC);

    $where  = ['r.form_id = ?'];
    $params = [$form_id];

    if ($keyword) {
        $where[]  = '(r.name LIKE ? OR r.phone LIKE ? OR r.reservation_no LIKE ?)';
        $params[] = "%{$keyword}%";
        $params[] = "%{$keyword}%";
        $params[] = "%{$keyword}%";
    }
    if ($status)   { $where[] = 'r.status = ?';            $params[] = $status; }
    if ($store_id) { $where[] = 'r.store_id = ?';          $params[] = (int)$store_id; }
    if ($from)     { $where[] = 'r.reservation_date >= ?'; $params[] = $from; }
    if ($to)       { $where[] = 'r.reservation_date <= ?'; $params[] = $to; }

    $whereSQL = implode(' AND ', $where);

    $st = $pdo->prepare("SELECT r.* FROM `{$tbl}` r WHERE {$whereSQL} ORDER BY r.id DESC");
    $st->execute($params);
    $rows = $st->fetchAll(PDO::FETCH_ASSOC);

    // 실제 존재 컬럼 확인
    $existCols = $pdo->prepare(
        "SELECT column_name FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=?"
    );
    $existCols->execute([$tbl]);
    $existColList = array_column($existCols->fetchAll(PDO::FETCH_ASSOC), 'column_name');

    while (ob_get_level()) ob_end_clean();
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="bkf_' . $form['slug'] . '_' . date('Ymd_His') . '.csv"');
    header('Cache-Control: no-cache, must-revalidate');
    header('Pragma: no-cache');

    $out = fopen('php://output', 'w');
    fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF)); // BOM — Excel Korean charset fix

    // 헤더 행
    $headers = ['No', 'Reservation No', 'Status', 'Name', 'Phone',
                 'Date', 'Time', 'Store', 'Submitted At'];
    foreach ($fieldMeta as $f) {
        if (in_array($f['field_key'], ['name','phone'])) continue; // 고정 필드 중복 방지
        if (in_array($f['field_key'], $existColList)) {
            $headers[] = $f['label'];
        }
    }
    fputcsv($out, $headers);

    foreach ($rows as $i => $row) {
        $line = [
            $i + 1,
            $row['reservation_no'] ?? '',
            $row['status']         ?? '',
            $row['name']           ?? '',
            $row['phone']          ?? '',
            $row['reservation_date'] ?? '',
            $row['reservation_time'] ?? '',
            $row['store_name']     ?? '',
            $row['created_at']     ?? '',
        ];
        foreach ($fieldMeta as $f) {
            if (in_array($f['field_key'], ['name','phone'])) continue;
            if (in_array($f['field_key'], $existColList)) {
                $line[] = $row[$f['field_key']] ?? '';
            }
        }
        fputcsv($out, $line);
    }

    fclose($out);
    exit;
}

/* ================================================================
   Quota 공통 함수 — 복구 / 차감
   ================================================================ */

/**
 * 기존 예약 기준으로 quota.booked -1 복구
 */
function bkf_quota_restore(PDO $pdo, int $form_id, array $rec): void {
    $quota_date = $rec['reservation_date'] ?? null;
    if (!$quota_date) return;

    $slot_time = $rec['reservation_time'] ?? null;
    $store_id  = $rec['store_id']         ?? null;

    if ($store_id !== null) {
        $pdo->prepare(
            'UPDATE bkf_quota SET booked = GREATEST(0, booked - 1)
             WHERE form_id=? AND store_id=? AND quota_date=? AND (slot_time=? OR (slot_time IS NULL AND ? IS NULL))'
        )->execute([$form_id, $store_id, $quota_date, $slot_time, $slot_time]);
    } else {
        $pdo->prepare(
            'UPDATE bkf_quota SET booked = GREATEST(0, booked - 1)
             WHERE form_id=? AND store_id IS NULL AND quota_date=? AND (slot_time=? OR (slot_time IS NULL AND ? IS NULL))'
        )->execute([$form_id, $quota_date, $slot_time, $slot_time]);
    }
}

/**
 * 새 날짜/시간 기준으로 quota.booked +1 차감
 * 잔여 수량 없으면 false 반환 (트랜잭션 rollback 필요)
 */
function bkf_quota_deduct(PDO $pdo, int $form_id, ?int $store_id, ?string $quota_date, ?string $slot_time): bool {
    if (!$quota_date) return true; // quota_date 없으면 수량 체크 스킵

    if ($store_id !== null) {
        $st = $pdo->prepare(
            'SELECT id, capacity, booked FROM bkf_quota
             WHERE form_id=? AND store_id=? AND quota_date=? AND (slot_time=? OR (slot_time IS NULL AND ? IS NULL))
             FOR UPDATE'
        );
        $st->execute([$form_id, $store_id, $quota_date, $slot_time, $slot_time]);
    } else {
        $st = $pdo->prepare(
            'SELECT id, capacity, booked FROM bkf_quota
             WHERE form_id=? AND store_id IS NULL AND quota_date=? AND (slot_time=? OR (slot_time IS NULL AND ? IS NULL))
             FOR UPDATE'
        );
        $st->execute([$form_id, $quota_date, $slot_time, $slot_time]);
    }

    $quota = $st->fetch(PDO::FETCH_ASSOC);

    if (!$quota) return true; // 행 없음 = 제한없음
    $cap = $quota['capacity'];
    if ($cap === null || $cap === '') return true; // null = 제한없음
    if ((int)$cap === 0) return false;             // 0 = 마감
    if ((int)$quota['booked'] >= (int)$cap) return false; // 수량 초과

    $pdo->prepare('UPDATE bkf_quota SET booked = booked + 1 WHERE id=?')
        ->execute([$quota['id']]);

    return true;
}

/* ================================================================
   Unknown action
   ================================================================ */
ob_clean();
echo json_encode(['ok' => false, 'msg' => 'Unknown action: ' . htmlspecialchars($action)]);
