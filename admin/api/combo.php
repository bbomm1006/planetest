<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/log_helper.php';
require_once __DIR__ . '/../config/combo_notify.php';
header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action     = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo        = getDB();
$changedBy  = $_SESSION['admin_user'] ?? 'system';

/* =====================================================
   신청 내역
   ===================================================== */

if ($action === 'inquiryList') {
    $kw      = trim($_GET['kw']      ?? '');
    $status  = trim($_GET['status']  ?? '');
    $product = trim($_GET['product'] ?? '');
    $sql    = 'SELECT i.*, m.name AS manager_name
               FROM combo_inquiries i
               LEFT JOIN combo_managers m ON m.id = i.manager_id
               WHERE 1=1';
    $params = [];
    if ($kw) {
        $sql .= ' AND (i.name LIKE ? OR i.phone LIKE ?)';
        $params = array_merge($params, ["%$kw%", "%$kw%"]);
    }
    if ($product) { $sql .= ' AND i.product_name=?'; $params[] = $product; }
    if ($status)  { $sql .= ' AND i.status=?';       $params[] = $status; }
    $sql .= ' ORDER BY i.id DESC';
    $st = $pdo->prepare($sql); $st->execute($params);
    echo json_encode(['ok' => true, 'data' => $st->fetchAll()]);
    exit;
}

if ($action === 'inquiryGet') {
    $id = (int)($_GET['id'] ?? 0);
    $st = $pdo->prepare(
        'SELECT i.*, m.name AS manager_name
         FROM combo_inquiries i
         LEFT JOIN combo_managers m ON m.id = i.manager_id
         WHERE i.id=?'
    );
    $st->execute([$id]);
    $row = $st->fetch();
    if (!$row) { echo json_encode(['ok' => false, 'msg' => '없는 내역']); exit; }
    echo json_encode(['ok' => true, 'data' => $row]);
    exit;
}

if ($action === 'inquirySave') {
    $id         = (int)($_POST['id']         ?? 0);
    $status     = trim($_POST['status']      ?? '');
    $manager_id = $_POST['manager_id'] !== '' ? (int)$_POST['manager_id'] : null;
    $memo       = trim($_POST['manager_memo'] ?? '');
    if ($id <= 0) { echo json_encode(['ok' => false, 'msg' => '잘못된 요청']); exit; }

    // 변경 전 상태 조회 (신규 접수 알림 발송 여부 판단용)
    $prev = $pdo->prepare('SELECT status FROM combo_inquiries WHERE id=?');
    $prev->execute([$id]);
    $prevRow = $prev->fetch(PDO::FETCH_ASSOC);

    $pdo->prepare('UPDATE combo_inquiries SET status=?, manager_id=?, manager_memo=? WHERE id=?')
        ->execute([$status, $manager_id, $memo, $id]);
    logAdminAction($pdo, 'update', 'combo_inquiries', (string)$id);

    // 상태가 '접수'로 변경될 때 담당자들에게 알림 발송
    if ($status === '접수' && ($prevRow['status'] ?? '') !== '접수') {
        $inq = $pdo->prepare('SELECT * FROM combo_inquiries WHERE id=?');
        $inq->execute([$id]);
        $inqRow = $inq->fetch(PDO::FETCH_ASSOC);
        if ($inqRow) comboSendNotifications($pdo, $inqRow);
    }

    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'inquiryStatusUpdate') {
    $id     = (int)($_POST['id']     ?? 0);
    $status = trim($_POST['status']  ?? '');
    $allowed = ['접수','확인','완료','취소'];
    if ($id <= 0 || !in_array($status, $allowed)) { echo json_encode(['ok' => false, 'msg' => '잘못된 요청']); exit; }
    $pdo->prepare('UPDATE combo_inquiries SET status=? WHERE id=?')->execute([$status, $id]);
    logAdminAction($pdo, 'update', 'combo_inquiries', (string)$id);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'inquiryDelete') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['ok' => false, 'msg' => '잘못된 ID']); exit; }
    $pdo->prepare('DELETE FROM combo_inquiries WHERE id=?')->execute([$id]);
    logAdminAction($pdo, 'delete', 'combo_inquiries', (string)$id);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'inquiryBulkDelete') {
    $ids = json_decode($_POST['ids'] ?? '[]', true) ?: [];
    $ids = array_values(array_filter(array_map('intval', $ids), function($v) { return $v > 0; }));
    if (empty($ids)) { echo json_encode(['ok' => false, 'msg' => '선택된 항목이 없습니다.']); exit; }
    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $pdo->prepare("DELETE FROM combo_inquiries WHERE id IN ($placeholders)")->execute($ids);
    logAdminAction($pdo, 'delete', 'combo_inquiries', implode(',', $ids));
    echo json_encode(['ok' => true, 'count' => count($ids)]);
    exit;
}

if ($action === 'productList') {
    $rows = $pdo->query(
        "SELECT DISTINCT product_name FROM combo_inquiries WHERE product_name IS NOT NULL AND product_name != '' ORDER BY product_name"
    )->fetchAll(PDO::FETCH_COLUMN);
    echo json_encode(['ok' => true, 'data' => $rows]);
    exit;
}

/* =====================================================
   담당관리자
   ===================================================== */

if ($action === 'managerList') {
    $rows = $pdo->query('SELECT * FROM combo_managers ORDER BY sort_order, id')->fetchAll();
    echo json_encode(['ok' => true, 'data' => $rows]);
    exit;
}

if ($action === 'managerSave') {
    $id             = (int)($_POST['id']             ?? 0);
    $name           = trim($_POST['name']            ?? '');
    $department     = trim($_POST['department']      ?? '');
    $phone          = trim($_POST['phone']           ?? '');
    $email          = trim($_POST['email']           ?? '');
    $notify_email   = (int)($_POST['notify_email']   ?? 0);
    $notify_sheet   = (int)($_POST['notify_sheet']   ?? 0);
    $notify_alimtalk= (int)($_POST['notify_alimtalk']?? 0);
    $notify_sms     = (int)($_POST['notify_sms']     ?? 0);
    $sheet_id       = trim($_POST['sheet_id']        ?? '');
    $sheet_name     = trim($_POST['sheet_name']      ?? '');
    $is_active      = (int)($_POST['is_active']      ?? 1);

    if (!$name) { echo json_encode(['ok' => false, 'msg' => '이름을 입력하세요.']); exit; }
    if (!$department) { echo json_encode(['ok' => false, 'msg' => '담당부서를 입력하세요.']); exit; }
    try {

    if ($id > 0) {
        // 변경 전 데이터 조회
        $old = $pdo->prepare('SELECT * FROM combo_managers WHERE id=?');
        $old->execute([$id]);
        $oldData = $old->fetch();

        $pdo->prepare(
            'UPDATE combo_managers SET name=?, department=?, phone=?, email=?,
             notify_email=?, notify_sheet=?, notify_alimtalk=?, notify_sms=?,
             sheet_id=?, sheet_name=?, is_active=? WHERE id=?'
        )->execute([$name, $department, $phone, $email, $notify_email, $notify_sheet, $notify_alimtalk, $notify_sms, $sheet_id, $sheet_name, $is_active, $id]);

        // 변경 히스토리
        $fieldMap = [
            'name' => $name, 'department' => $department, 'phone' => $phone, 'email' => $email,
            'notify_email' => $notify_email, 'notify_sheet' => $notify_sheet,
            'notify_alimtalk' => $notify_alimtalk, 'notify_sms' => $notify_sms,
            'is_active' => $is_active,
        ];
        $diff = [];
        foreach ($fieldMap as $f => $newVal) {
            $oldVal = (string)($oldData[$f] ?? '');
            if ($oldVal !== (string)$newVal) {
                $diff[$f] = ['before' => $oldData[$f] ?? '', 'after' => $newVal];
            }
        }
        if ($diff) {
            $pdo->prepare('INSERT INTO combo_manager_history (manager_id, changed_by, change_desc) VALUES (?,?,?)')
                ->execute([$id, $changedBy, json_encode($diff, JSON_UNESCAPED_UNICODE)]);
        }
        echo json_encode(['ok' => true, 'id' => $id]);
    } else {
        $max = $pdo->query('SELECT COALESCE(MAX(sort_order),0) FROM combo_managers')->fetchColumn();
        $pdo->prepare(
            'INSERT INTO combo_managers (name, department, phone, email, notify_email, notify_sheet, notify_alimtalk, notify_sms, sheet_id, sheet_name, is_active, sort_order)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
        )->execute([$name, $department, $phone, $email, $notify_email, $notify_sheet, $notify_alimtalk, $notify_sms, $sheet_id, $sheet_name, $is_active, $max + 1]);
        $newId = (int)$pdo->lastInsertId();
        $pdo->prepare('INSERT INTO combo_manager_history (manager_id, changed_by, change_desc) VALUES (?,?,?)')
            ->execute([$newId, $changedBy, json_encode(['action' => 'created'], JSON_UNESCAPED_UNICODE)]);
        echo json_encode(['ok' => true, 'id' => $newId]);
    }
    } catch (\Throwable $e) {
        echo json_encode(['ok' => false, 'msg' => 'DB 오류: ' . $e->getMessage()]);
    }
    exit;
}

if ($action === 'managerDelete') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['ok' => false, 'msg' => '잘못된 ID']); exit; }
    $pdo->prepare('INSERT INTO combo_manager_history (manager_id, changed_by, change_desc) VALUES (?,?,?)')
        ->execute([$id, $changedBy, json_encode(['action' => 'deleted'], JSON_UNESCAPED_UNICODE)]);
    $pdo->prepare('DELETE FROM combo_managers WHERE id=?')->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'managerReorder') {
    $ids  = json_decode($_POST['ids'] ?? '[]', true) ?: [];
    $stmt = $pdo->prepare('UPDATE combo_managers SET sort_order=? WHERE id=?');
    foreach ($ids as $i => $id) $stmt->execute([$i + 1, (int)$id]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'managerHistoryList') {
    $rows = $pdo->query(
        'SELECT h.*, m.name AS manager_name
         FROM combo_manager_history h
         LEFT JOIN combo_managers m ON m.id = h.manager_id
         ORDER BY h.changed_at DESC LIMIT 50'
    )->fetchAll();
    echo json_encode(['ok' => true, 'data' => $rows]);
    exit;
}

/* =====================================================
   타임슬롯
   ===================================================== */

if ($action === 'slotList') {
    $rows = $pdo->query('SELECT * FROM combo_timeslots ORDER BY sort_order, id')->fetchAll();
    echo json_encode(['ok' => true, 'data' => $rows]);
    exit;
}

if ($action === 'slotCreate') {
    $label = trim($_POST['label'] ?? '');
    if (!$label) { echo json_encode(['ok' => false, 'msg' => '슬롯명을 입력하세요.']); exit; }
    $max = $pdo->query('SELECT COALESCE(MAX(sort_order),0) FROM combo_timeslots')->fetchColumn();
    $pdo->prepare('INSERT INTO combo_timeslots (label, is_active, sort_order) VALUES (?,1,?)')
        ->execute([$label, $max + 1]);
    echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    exit;
}

if ($action === 'slotUpdate') {
    $id        = (int)($_POST['id']        ?? 0);
    $label     = trim($_POST['label']      ?? '');
    $is_active = (int)($_POST['is_active'] ?? 1);
    if ($id <= 0 || !$label) { echo json_encode(['ok' => false, 'msg' => '잘못된 요청']); exit; }
    $pdo->prepare('UPDATE combo_timeslots SET label=?, is_active=? WHERE id=?')
        ->execute([$label, $is_active, $id]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'slotDelete') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['ok' => false, 'msg' => '잘못된 ID']); exit; }
    $pdo->prepare('DELETE FROM combo_timeslots WHERE id=?')->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'slotReorder') {
    $ids  = json_decode($_POST['ids'] ?? '[]', true) ?: [];
    $stmt = $pdo->prepare('UPDATE combo_timeslots SET sort_order=? WHERE id=?');
    foreach ($ids as $i => $id) $stmt->execute([$i + 1, (int)$id]);
    echo json_encode(['ok' => true]);
    exit;
}

/* =====================================================
   약관
   ===================================================== */

if ($action === 'inquiryExcel') {
    $kw      = trim($_GET['kw']      ?? '');
    $status  = trim($_GET['status']  ?? '');
    $product = trim($_GET['product'] ?? '');
    $sql    = 'SELECT i.name, i.phone, i.product_name, i.time_slot, i.message,
                      i.card_discount_name, i.original_price, i.final_price,
                      i.status, m.name AS manager_name, i.manager_memo, i.created_at
               FROM combo_inquiries i
               LEFT JOIN combo_managers m ON m.id = i.manager_id
               WHERE 1=1';
    $params = [];
    if ($kw) {
        $sql .= ' AND (i.name LIKE ? OR i.phone LIKE ?)';
        $params = array_merge($params, ["%$kw%", "%$kw%"]);
    }
    if ($product) { $sql .= ' AND i.product_name=?'; $params[] = $product; }
    if ($status)  { $sql .= ' AND i.status=?';       $params[] = $status; }
    $sql .= ' ORDER BY i.id DESC';
    $st = $pdo->prepare($sql); $st->execute($params);
    $rows = $st->fetchAll();

    while (ob_get_level()) ob_end_clean();
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="combo_inquiries_' . date('Ymd_His') . '.csv"');
    header('Cache-Control: no-cache, must-revalidate');
    $out = fopen('php://output', 'w');
    fprintf($out, chr(0xEF).chr(0xBB).chr(0xBF));
    fputcsv($out, ['이름','연락처','신청 제품','상담 시간','추가 내용','카드사 할인','원래 금액','최종 금액','상태','담당자','메모','신청일시']);
    foreach ($rows as $r) {
        fputcsv($out, [
            $r['name'], $r['phone'], $r['product_name'], $r['time_slot'], $r['message'],
            $r['card_discount_name'], $r['original_price'], $r['final_price'],
            $r['status'], $r['manager_name'] ?? '', $r['manager_memo'] ?? '',
            $r['created_at'],
        ]);
    }
    fclose($out);
    exit;
}

if ($action === 'termsGet') {
    $row = $pdo->query(
        "SELECT term_body, DATE_FORMAT(updated_at,'%Y-%m-%d %H:%i') AS updated_at FROM combo_terms WHERE id=1"
    )->fetch();
    echo json_encode(['ok' => true, 'data' => $row ?: ['term_body' => '', 'updated_at' => '']]);
    exit;
}

if ($action === 'termsSave') {
    $body = trim($_POST['term_body'] ?? '');
    $pdo->prepare('UPDATE combo_terms SET term_body=?, updated_at=NOW() WHERE id=1')->execute([$body]);
    logAdminAction($pdo, 'update', 'combo_terms', '1');
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action']);
