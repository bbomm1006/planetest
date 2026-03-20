<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/log_helper.php';

header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo    = getDB();

/* ================================================================
   테이블명 중복/유효성 체크
   ================================================================ */
if ($action === 'check_table') {
    $name = trim($_GET['table_name'] ?? '');
    if (!$name || !preg_match('/^[a-z][a-z0-9_]{2,63}$/', $name)) {
        echo json_encode(['ok' => false, 'msg' => '영문 소문자로 시작, 영문/숫자/언더바만 가능 (3~64자)']);
        exit;
    }
    // custom_inquiry_ 접두어 예약 키워드 체크
    $reserved = ['custom_inquiry_forms','custom_inquiry_fields','custom_inquiry_field_options',
                 'custom_inquiry_managers','custom_inquiry_manager_history',
                 'custom_inquiry_statuses','custom_inquiry_terms'];
    if (in_array($name, $reserved)) {
        echo json_encode(['ok' => false, 'msg' => '사용할 수 없는 테이블명입니다.']);
        exit;
    }
    // 이미 등록된 폼 테이블명 체크
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM custom_inquiry_forms WHERE table_name = ?');
    $stmt->execute([$name]);
    if ($stmt->fetchColumn() > 0) {
        echo json_encode(['ok' => false, 'msg' => '이미 사용 중인 테이블명입니다.']);
        exit;
    }
    // 실제 DB에 해당 이름의 테이블 존재 여부
    $stmt2 = $pdo->prepare("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?");
    $stmt2->execute([$name]);
    if ($stmt2->fetchColumn() > 0) {
        echo json_encode(['ok' => false, 'msg' => 'DB에 이미 같은 이름의 테이블이 존재합니다.']);
        exit;
    }
    echo json_encode(['ok' => true, 'msg' => '사용 가능한 테이블명입니다.']);
    exit;
}

/* ================================================================
   폼 생성
   ================================================================ */
if ($action === 'create_form') {
    $title      = trim($_POST['title'] ?? '');
    $desc       = trim($_POST['description'] ?? '');
    $btn        = trim($_POST['btn_name'] ?? '문의하기');
    $table_name = trim($_POST['table_name'] ?? '');

    if (!$title || !$table_name) {
        echo json_encode(['ok' => false, 'msg' => '필수 항목을 입력해 주세요.']);
        exit;
    }
    if (!preg_match('/^[a-z][a-z0-9_]{2,63}$/', $table_name)) {
        echo json_encode(['ok' => false, 'msg' => '테이블명 형식이 올바르지 않습니다.']);
        exit;
    }
    // 중복 체크
    $chk = $pdo->prepare('SELECT COUNT(*) FROM custom_inquiry_forms WHERE table_name = ?');
    $chk->execute([$table_name]);
    if ($chk->fetchColumn() > 0) {
        echo json_encode(['ok' => false, 'msg' => '이미 사용 중인 테이블명입니다.']);
        exit;
    }
    $chk2 = $pdo->prepare("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?");
    $chk2->execute([$table_name]);
    if ($chk2->fetchColumn() > 0) {
        echo json_encode(['ok' => false, 'msg' => 'DB에 이미 같은 이름의 테이블이 존재합니다.']);
        exit;
    }

    // 폼 INSERT
    $stmt = $pdo->prepare('INSERT INTO custom_inquiry_forms (title, description, btn_name, table_name) VALUES (?,?,?,?)');
    $stmt->execute([$title, $desc, $btn, $table_name]);
    $form_id = $pdo->lastInsertId();

    // 기본 상태 INSERT
    $pdo->prepare('INSERT INTO custom_inquiry_statuses (form_id, label, color, sort_order, is_default) VALUES (?,?,?,?,?)')
        ->execute([$form_id, '접수', '#3b82f6', 0, 1]);
    $pdo->prepare('INSERT INTO custom_inquiry_statuses (form_id, label, color, sort_order, is_default) VALUES (?,?,?,?,?)')
        ->execute([$form_id, '완료', '#22c55e', 1, 0]);

    // 동적 문의 내역 테이블 생성
    $pdo->exec("CREATE TABLE IF NOT EXISTS `{$table_name}` (
        `id`           INT(11) NOT NULL AUTO_INCREMENT,
        `form_id`      INT(11) NOT NULL,
        `title`        VARCHAR(500) DEFAULT NULL,
        `status_id`    INT(11) DEFAULT NULL,
        `login_type`   VARCHAR(20) DEFAULT NULL,
        `login_id`     VARCHAR(255) DEFAULT NULL,
        `visibility`   TINYINT(1) DEFAULT 1,
        `view_count`   INT(11) DEFAULT 0,
        `created_at`   DATETIME DEFAULT CURRENT_TIMESTAMP,
        `updated_at`   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        KEY `idx_form_id` (`form_id`),
        KEY `idx_created_at` (`created_at`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    logAdminAction($pdo, 'create', 'custom_inquiry_forms', (string)$form_id);
    echo json_encode(['ok' => true, 'form_id' => $form_id]);
    exit;
}

/* ================================================================
   폼 목록
   ================================================================ */
if ($action === 'list_forms') {
    $rows = $pdo->query('SELECT id, title, table_name, is_active, created_at FROM custom_inquiry_forms ORDER BY id DESC')->fetchAll();
    echo json_encode(['ok' => true, 'data' => $rows]);
    exit;
}

/* ================================================================
   폼 상세 조회
   ================================================================ */
if ($action === 'get_form') {
    $id   = intval($_GET['id'] ?? 0);
    $stmt = $pdo->prepare('SELECT * FROM custom_inquiry_forms WHERE id = ?');
    $stmt->execute([$id]);
    $row  = $stmt->fetch();
    if (!$row) { echo json_encode(['ok' => false, 'msg' => '폼을 찾을 수 없습니다.']); exit; }
    echo json_encode(['ok' => true, 'data' => $row]);
    exit;
}

/* ================================================================
   기본정보 저장
   ================================================================ */
if ($action === 'save_basic') {
    $id              = intval($_POST['id'] ?? 0);
    $title           = trim($_POST['title'] ?? '');
    $desc            = trim($_POST['description'] ?? '');
    $btn             = trim($_POST['btn_name'] ?? '');
    $is_active       = intval($_POST['is_active'] ?? 1);
    $period_use      = intval($_POST['period_use'] ?? 0);
    $period_start    = $_POST['period_start'] ?? null;
    $period_end      = $_POST['period_end'] ?? null;
    $login_use       = intval($_POST['login_use'] ?? 0);
    $login_types     = trim($_POST['login_types'] ?? '');
    $visibility_type = trim($_POST['visibility_type'] ?? '');
    $comment_use     = intval($_POST['comment_use'] ?? 0);
    $comment_vis     = trim($_POST['comment_visibility'] ?? '');
    $product_use     = intval($_POST['product_use'] ?? 0);
    $product_req     = intval($_POST['product_required'] ?? 0);

    $stmt = $pdo->prepare('UPDATE custom_inquiry_forms SET
        title=?, description=?, btn_name=?, is_active=?,
        period_use=?, period_start=?, period_end=?,
        login_use=?, login_types=?,
        visibility_type=?, comment_use=?, comment_visibility=?,
        product_use=?, product_required=?
        WHERE id=?');
    $stmt->execute([
        $title, $desc, $btn, $is_active,
        $period_use, ($period_use ? $period_start : null), ($period_use ? $period_end : null),
        $login_use, ($login_use ? $login_types : ''),
        ($visibility_type ?: null), $comment_use, ($comment_use ? $comment_vis : null),
        $product_use, $product_req,
        $id
    ]);
    logAdminAction($pdo, 'update', 'custom_inquiry_forms', (string)($id??''));
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   답변설정 저장
   ================================================================ */
if ($action === 'save_reply') {
    $id          = intval($_POST['id'] ?? 0);
    $reply_use   = intval($_POST['reply_use'] ?? 0);
    $reply_method= trim($_POST['reply_method'] ?? '');
    $stmt = $pdo->prepare('UPDATE custom_inquiry_forms SET reply_use=?, reply_method=? WHERE id=?');
    $stmt->execute([$reply_use, ($reply_use ? $reply_method : null), $id]);
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   담당자 목록
   ================================================================ */
if ($action === 'list_managers') {
    $form_id = intval($_GET['form_id'] ?? 0);
    $rows = $pdo->prepare('SELECT * FROM custom_inquiry_managers WHERE form_id = ? ORDER BY id ASC');
    $rows->execute([$form_id]);
    echo json_encode(['ok' => true, 'data' => $rows->fetchAll()]);
    exit;
}

/* ================================================================
   담당자 저장 (추가/수정)
   ================================================================ */
if ($action === 'save_manager') {
    $id              = intval($_POST['id'] ?? 0);
    $form_id         = intval($_POST['form_id'] ?? 0);
    $name            = trim($_POST['name'] ?? '');
    $dept            = trim($_POST['department'] ?? '');
    $phone           = trim($_POST['phone'] ?? '');
    $email           = trim($_POST['email'] ?? '');
    $notify_email    = intval($_POST['notify_email'] ?? 0);
    $notify_sheet    = intval($_POST['notify_sheet'] ?? 0);
    $notify_alimtalk = intval($_POST['notify_alimtalk'] ?? 0);
    $notify_sms      = intval($_POST['notify_sms'] ?? 0);
    $sheet_id        = trim($_POST['sheet_id'] ?? '');
    $sheet_name      = trim($_POST['sheet_name'] ?? '');
    $alimtalk_key    = trim($_POST['alimtalk_key'] ?? '');
    $alimtalk_sender = trim($_POST['alimtalk_sender'] ?? '');
    $is_active       = intval($_POST['is_active'] ?? 1);
    $changed_by      = $_SESSION['admin_user'] ?? 'system';

    if (!$name) { echo json_encode(['ok' => false, 'msg' => '이름을 입력해 주세요.']); exit; }

    if ($id > 0) {
        // 수정 전 스냅샷
        $old = $pdo->prepare('SELECT * FROM custom_inquiry_managers WHERE id=?');
        $old->execute([$id]);
        $oldData = $old->fetch();

        $stmt = $pdo->prepare('UPDATE custom_inquiry_managers SET
            name=?, department=?, phone=?, email=?,
            notify_email=?, notify_sheet=?, notify_alimtalk=?, notify_sms=?,
            sheet_id=?, sheet_name=?, alimtalk_key=?, alimtalk_sender=?,
            is_active=? WHERE id=?');
        $stmt->execute([$name, $dept, $phone, $email,
            $notify_email, $notify_sheet, $notify_alimtalk, $notify_sms,
            $sheet_id, $sheet_name, $alimtalk_key, $alimtalk_sender,
            $is_active, $id]);

        // 변경 히스토리
        $diff = [];
        $fields = ['name','department','phone','email','notify_email','notify_sheet','notify_alimtalk','notify_sms','is_active'];
        foreach ($fields as $f) {
            $newVal = $$f ?? '';
            if ((string)$oldData[$f] !== (string)$newVal) {
                $diff[$f] = ['before' => $oldData[$f], 'after' => $newVal];
            }
        }
        if ($diff) {
            $pdo->prepare('INSERT INTO custom_inquiry_manager_history (form_id, manager_id, changed_by, change_desc) VALUES (?,?,?,?)')
                ->execute([$form_id, $id, $changed_by, json_encode($diff, JSON_UNESCAPED_UNICODE)]);
        }
    } else {
        $stmt = $pdo->prepare('INSERT INTO custom_inquiry_managers
            (form_id, name, department, phone, email, notify_email, notify_sheet, notify_alimtalk, notify_sms,
             sheet_id, sheet_name, alimtalk_key, alimtalk_sender, is_active)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
        $stmt->execute([$form_id, $name, $dept, $phone, $email,
            $notify_email, $notify_sheet, $notify_alimtalk, $notify_sms,
            $sheet_id, $sheet_name, $alimtalk_key, $alimtalk_sender, $is_active]);
        $new_id = $pdo->lastInsertId();
        $pdo->prepare('INSERT INTO custom_inquiry_manager_history (form_id, manager_id, changed_by, change_desc) VALUES (?,?,?,?)')
            ->execute([$form_id, $new_id, $changed_by, json_encode(['action'=>'created'], JSON_UNESCAPED_UNICODE)]);
    }
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   담당자 삭제
   ================================================================ */
if ($action === 'delete_manager') {
    $id      = intval($_POST['id'] ?? 0);
    $form_id = intval($_POST['form_id'] ?? 0);
    $changed_by = $_SESSION['admin_user'] ?? 'system';
    $pdo->prepare('DELETE FROM custom_inquiry_managers WHERE id=?')->execute([$id]);
    $pdo->prepare('INSERT INTO custom_inquiry_manager_history (form_id, manager_id, changed_by, change_desc) VALUES (?,?,?,?)')
        ->execute([$form_id, $id, $changed_by, json_encode(['action'=>'deleted'])]);
    logAdminAction($pdo, 'delete', 'custom_inquiry_managers', (string)$id);
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   담당자 변경 히스토리
   ================================================================ */
if ($action === 'list_manager_history') {
    $form_id = intval($_GET['form_id'] ?? 0);
    $rows = $pdo->prepare('SELECT h.*, m.name as manager_name FROM custom_inquiry_manager_history h
        LEFT JOIN custom_inquiry_managers m ON h.manager_id = m.id
        WHERE h.form_id = ? ORDER BY h.changed_at DESC LIMIT 50');
    $rows->execute([$form_id]);
    echo json_encode(['ok' => true, 'data' => $rows->fetchAll()]);
    exit;
}

/* ================================================================
   상태 목록
   ================================================================ */
if ($action === 'list_statuses') {
    $form_id = intval($_GET['form_id'] ?? 0);
    $rows = $pdo->prepare('SELECT * FROM custom_inquiry_statuses WHERE form_id = ? ORDER BY sort_order ASC');
    $rows->execute([$form_id]);
    echo json_encode(['ok' => true, 'data' => $rows->fetchAll()]);
    exit;
}

/* ================================================================
   상태 저장 (일괄)
   ================================================================ */
if ($action === 'save_statuses') {
    $form_id = intval($_POST['form_id'] ?? 0);
    $items   = json_decode($_POST['items'] ?? '[]', true);
    foreach ($items as $item) {
        $id    = intval($item['id'] ?? 0);
        $label = trim($item['label'] ?? '');
        $color = trim($item['color'] ?? '#64748b');
        $sort  = intval($item['sort_order'] ?? 0);
        $is_default = intval($item['is_default'] ?? 0);
        $is_active  = intval($item['is_active'] ?? 1);
        if ($id > 0) {
            $pdo->prepare('UPDATE custom_inquiry_statuses SET label=?, color=?, sort_order=?, is_default=?, is_active=? WHERE id=? AND form_id=?')
                ->execute([$label, $color, $sort, $is_default, $is_active, $id, $form_id]);
        } else {
            $pdo->prepare('INSERT INTO custom_inquiry_statuses (form_id, label, color, sort_order, is_default, is_active) VALUES (?,?,?,?,?,?)')
                ->execute([$form_id, $label, $color, $sort, $is_default, $is_active]);
        }
    }
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   상태 삭제
   ================================================================ */
if ($action === 'delete_status') {
    $id = intval($_POST['id'] ?? 0);
    $pdo->prepare('DELETE FROM custom_inquiry_statuses WHERE id=?')->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   필드 목록
   ================================================================ */
if ($action === 'list_fields') {
    $form_id = intval($_GET['form_id'] ?? 0);
    $rows = $pdo->prepare('SELECT f.*, (SELECT COUNT(*) FROM custom_inquiry_field_options WHERE field_id=f.id) as option_count
        FROM custom_inquiry_fields f WHERE f.form_id = ? ORDER BY f.sort_order ASC');
    $rows->execute([$form_id]);
    $fields = $rows->fetchAll();
    foreach ($fields as &$field) {
        if (in_array($field['type'], ['select','radio','checkbox'])) {
            $opts = $pdo->prepare('SELECT * FROM custom_inquiry_field_options WHERE field_id=? ORDER BY sort_order ASC');
            $opts->execute([$field['id']]);
            $field['options'] = $opts->fetchAll();
        }
    }
    echo json_encode(['ok' => true, 'data' => $fields]);
    exit;
}

/* ================================================================
   필드 저장 (추가/수정)
   ================================================================ */
if ($action === 'save_field') {
    $id          = intval($_POST['id'] ?? 0);
    $form_id     = intval($_POST['form_id'] ?? 0);
    $label       = trim($_POST['label'] ?? '');
    $field_key   = trim($_POST['field_key'] ?? '');
    $type        = trim($_POST['type'] ?? '');
    $placeholder = trim($_POST['placeholder'] ?? '');
    $file_exts   = trim($_POST['file_exts'] ?? '');
    $is_required = intval($_POST['is_required'] ?? 0);
    $is_visible  = intval($_POST['is_visible'] ?? 1);
    $sort_order  = intval($_POST['sort_order'] ?? 99);
    $options     = json_decode($_POST['options'] ?? '[]', true);

    if (!$label || !$type) { echo json_encode(['ok' => false, 'msg' => '항목명과 타입을 입력해 주세요.']); exit; }

    if ($id > 0) {
        // field_key는 수정 불가 (기존값 유지)
        $pdo->prepare('UPDATE custom_inquiry_fields SET label=?, type=?, placeholder=?, file_exts=?, is_required=?, is_visible=?, sort_order=? WHERE id=? AND form_id=?')
            ->execute([$label, $type, $placeholder, $file_exts, $is_required, $is_visible, $sort_order, $id, $form_id]);
        $field_id = $id;
    } else {
        if (!$field_key || !preg_match('/^[a-z][a-z0-9_]{0,63}$/', $field_key)) {
            echo json_encode(['ok' => false, 'msg' => '필드 키 형식이 올바르지 않습니다.']); exit;
        }
        // 중복 체크
        $chk = $pdo->prepare('SELECT COUNT(*) FROM custom_inquiry_fields WHERE form_id=? AND field_key=?');
        $chk->execute([$form_id, $field_key]);
        if ($chk->fetchColumn() > 0) { echo json_encode(['ok' => false, 'msg' => '이미 사용 중인 필드 키입니다.']); exit; }

        $pdo->prepare('INSERT INTO custom_inquiry_fields (form_id, field_key, label, type, placeholder, file_exts, is_required, is_visible, sort_order) VALUES (?,?,?,?,?,?,?,?,?)')
            ->execute([$form_id, $field_key, $label, $type, $placeholder, $file_exts, $is_required, $is_visible, $sort_order]);
        $field_id = $pdo->lastInsertId();

        // 동적 테이블에 컬럼 추가
        $form_row = $pdo->prepare('SELECT table_name FROM custom_inquiry_forms WHERE id=?');
        $form_row->execute([$form_id]);
        $tbl = $form_row->fetchColumn();
        if ($tbl) {
            $col_type = in_array($type, ['textarea','file']) ? 'TEXT' : 'VARCHAR(500)';
            try {
                $pdo->exec("ALTER TABLE `{$tbl}` ADD COLUMN `{$field_key}` {$col_type} DEFAULT NULL");
            } catch (Exception $e) { /* 컬럼 이미 존재 등 무시 */ }
        }
    }

    // 옵션 저장 (select/radio/checkbox)
    if (in_array($type, ['select','radio','checkbox'])) {
        $pdo->prepare('DELETE FROM custom_inquiry_field_options WHERE field_id=?')->execute([$field_id]);
        foreach ($options as $i => $opt) {
            $ol = trim($opt['label'] ?? '');
            $ov = intval($opt['is_visible'] ?? 1);
            if ($ol) {
                $pdo->prepare('INSERT INTO custom_inquiry_field_options (field_id, label, sort_order, is_visible) VALUES (?,?,?,?)')
                    ->execute([$field_id, $ol, $i, $ov]);
            }
        }
    }
    echo json_encode(['ok' => true, 'field_id' => $field_id]);
    exit;
}

/* ================================================================
   필드 정렬 저장
   ================================================================ */
if ($action === 'sort_fields') {
    $orders = json_decode($_POST['orders'] ?? '[]', true);
    foreach ($orders as $item) {
        $pdo->prepare('UPDATE custom_inquiry_fields SET sort_order=? WHERE id=?')
            ->execute([intval($item['sort']), intval($item['id'])]);
    }
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   필드 노출여부 토글
   ================================================================ */
if ($action === 'toggle_field_visible') {
    $id  = intval($_POST['id'] ?? 0);
    $val = intval($_POST['is_visible'] ?? 1);
    $pdo->prepare('UPDATE custom_inquiry_fields SET is_visible=? WHERE id=?')->execute([$val, $id]);
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   필드 옵션 삭제 (연결된 내역 있는지 체크)
   ================================================================ */
if ($action === 'delete_field_option') {
    $opt_id   = intval($_POST['option_id'] ?? 0);
    $form_id  = intval($_POST['form_id'] ?? 0);

    // 필드 정보 조회
    $opt = $pdo->prepare('SELECT o.label, f.field_key, f.form_id FROM custom_inquiry_field_options o JOIN custom_inquiry_fields f ON o.field_id=f.id WHERE o.id=?');
    $opt->execute([$opt_id]);
    $optRow = $opt->fetch();

    if ($optRow) {
        $form_row = $pdo->prepare('SELECT table_name FROM custom_inquiry_forms WHERE id=?');
        $form_row->execute([$optRow['form_id']]);
        $tbl = $form_row->fetchColumn();
        if ($tbl) {
            try {
                $count_stmt = $pdo->prepare("SELECT COUNT(*) FROM `{$tbl}` WHERE `{$optRow['field_key']}` LIKE ?");
                $count_stmt->execute(['%' . $optRow['label'] . '%']);
                $cnt = $count_stmt->fetchColumn();
                if ($cnt > 0) {
                    echo json_encode(['ok' => false, 'warn' => true, 'msg' => "이 항목으로 등록된 내역이 {$cnt}건 있습니다. 삭제하시겠습니까?", 'count' => $cnt]);
                    exit;
                }
            } catch (Exception $e) {}
        }
    }
    $pdo->prepare('DELETE FROM custom_inquiry_field_options WHERE id=?')->execute([$opt_id]);
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   필드 옵션 강제 삭제
   ================================================================ */
if ($action === 'force_delete_field_option') {
    $opt_id = intval($_POST['option_id'] ?? 0);
    $pdo->prepare('DELETE FROM custom_inquiry_field_options WHERE id=?')->execute([$opt_id]);
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   약관 목록
   ================================================================ */
if ($action === 'list_terms') {
    $form_id = intval($_GET['form_id'] ?? 0);
    $rows = $pdo->prepare('SELECT * FROM custom_inquiry_terms WHERE form_id=? ORDER BY sort_order ASC');
    $rows->execute([$form_id]);
    echo json_encode(['ok' => true, 'data' => $rows->fetchAll()]);
    exit;
}

/* ================================================================
   약관 저장 (추가/수정)
   ================================================================ */
if ($action === 'save_term') {
    $id          = intval($_POST['id'] ?? 0);
    $form_id     = intval($_POST['form_id'] ?? 0);
    $title       = trim($_POST['title'] ?? '');
    $content     = trim($_POST['content'] ?? '');
    $is_required = intval($_POST['is_required'] ?? 1);
    $is_active   = intval($_POST['is_active'] ?? 1);
    $sort_order  = intval($_POST['sort_order'] ?? 99);
    $updated_by  = $_SESSION['admin_user'] ?? 'system';

    if (!$title) { echo json_encode(['ok' => false, 'msg' => '약관명을 입력해 주세요.']); exit; }

    if ($id > 0) {
        $pdo->prepare('UPDATE custom_inquiry_terms SET title=?, content=?, is_required=?, is_active=?, sort_order=?, updated_by=? WHERE id=? AND form_id=?')
            ->execute([$title, $content, $is_required, $is_active, $sort_order, $updated_by, $id, $form_id]);
    } else {
        $pdo->prepare('INSERT INTO custom_inquiry_terms (form_id, title, content, is_required, is_active, sort_order, updated_by) VALUES (?,?,?,?,?,?,?)')
            ->execute([$form_id, $title, $content, $is_required, $is_active, $sort_order, $updated_by]);
    }
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   약관 삭제
   ================================================================ */
if ($action === 'delete_term') {
    $id = intval($_POST['id'] ?? 0);
    $pdo->prepare('DELETE FROM custom_inquiry_terms WHERE id=?')->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   약관 정렬 저장
   ================================================================ */
if ($action === 'sort_terms') {
    $orders = json_decode($_POST['orders'] ?? '[]', true);
    foreach ($orders as $item) {
        $pdo->prepare('UPDATE custom_inquiry_terms SET sort_order=? WHERE id=?')
            ->execute([intval($item['sort']), intval($item['id'])]);
    }
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action']);
