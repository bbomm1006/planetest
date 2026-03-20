<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action  = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo     = getDB();

/* ================================================================
   공통: 폼 + 테이블명 가져오기
   ================================================================ */
function getFormInfo($pdo, $form_id) {
    $stmt = $pdo->prepare('SELECT * FROM custom_inquiry_forms WHERE id=?');
    $stmt->execute([$form_id]);
    return $stmt->fetch();
}

/* ================================================================
   문의 내역 목록
   ================================================================ */
if ($action === 'list') {
    $form_id = intval($_GET['form_id'] ?? 0);
    $keyword = trim($_GET['keyword'] ?? '');
    $status  = trim($_GET['status'] ?? '');
    $from    = trim($_GET['from'] ?? '');
    $to      = trim($_GET['to'] ?? '');
    $page    = max(1, intval($_GET['page'] ?? 1));
    $limit   = 20;
    $offset  = ($page - 1) * $limit;

    $form = getFormInfo($pdo, $form_id);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => '폼을 찾을 수 없습니다.']); exit; }
    $tbl = $form['table_name'];

    $field_filters_raw = trim($_GET['field_filters'] ?? '');
    $field_filters = $field_filters_raw ? json_decode($field_filters_raw, true) : [];

    // 필드 키 화이트리스트 (SQL 인젝션 방지)
    $allowed_keys = [];
    if (!empty($field_filters)) {
        $fk_stmt = $pdo->prepare("SELECT field_key FROM custom_inquiry_fields WHERE form_id=? AND type IN ('select','radio','checkbox')");
        $fk_stmt->execute([$form_id]);
        $allowed_keys = array_column($fk_stmt->fetchAll(), 'field_key');
    }

    $where  = ['d.form_id = ?'];
    $params = [$form_id];

    if ($keyword) { $where[] = 'd.title LIKE ?'; $params[] = "%{$keyword}%"; }
    if ($status)  { $where[] = 'd.status_id = ?'; $params[] = intval($status); }
    if ($from)    { $where[] = 'DATE(d.created_at) >= ?'; $params[] = $from; }
    if ($to)      { $where[] = 'DATE(d.created_at) <= ?'; $params[] = $to; }

    // 동적 필드 필터 (select/radio/checkbox)
    foreach ($field_filters as $fkey => $fval) {
        if (!in_array($fkey, $allowed_keys, true)) continue;
        if ($fval === '' || $fval === null) continue;
        // checkbox는 FIND_IN_SET 또는 LIKE로 처리 (콤마구분 저장 방식)
        $where[] = "d.`{$fkey}` LIKE ?";
        $params[] = "%{$fval}%";
    }

    $whereSQL = implode(' AND ', $where);

    $total = $pdo->prepare("SELECT COUNT(*) FROM `{$tbl}` d WHERE {$whereSQL}");
    $total->execute($params);
    $totalCount = $total->fetchColumn();

    $sql = "SELECT d.id, d.title, d.view_count, d.created_at, s.label as status_label, s.color as status_color
            FROM `{$tbl}` d
            LEFT JOIN custom_inquiry_statuses s ON d.status_id = s.id
            WHERE {$whereSQL}
            ORDER BY d.id DESC LIMIT {$limit} OFFSET {$offset}";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    echo json_encode([
        'ok'    => true,
        'data'  => $rows,
        'total' => $totalCount,
        'page'  => $page,
        'limit' => $limit,
    ]);
    exit;
}

/* ================================================================
   문의 상세
   ================================================================ */
if ($action === 'detail') {
    $form_id = intval($_GET['form_id'] ?? 0);
    $id      = intval($_GET['id'] ?? 0);

    $form = getFormInfo($pdo, $form_id);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => '폼을 찾을 수 없습니다.']); exit; }
    $tbl = $form['table_name'];

    // 조회수 증가
    $pdo->prepare("UPDATE `{$tbl}` SET view_count = view_count + 1 WHERE id=?")->execute([$id]);

    $stmt = $pdo->prepare("SELECT d.*, s.label as status_label, s.color as status_color
        FROM `{$tbl}` d LEFT JOIN custom_inquiry_statuses s ON d.status_id = s.id WHERE d.id=?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) { echo json_encode(['ok' => false, 'msg' => '내역을 찾을 수 없습니다.']); exit; }

    // 필드 메타 조회
    $fields = $pdo->prepare('SELECT * FROM custom_inquiry_fields WHERE form_id=? AND is_visible=1 ORDER BY sort_order ASC');
    $fields->execute([$form_id]);
    $fieldMeta = $fields->fetchAll();

    echo json_encode(['ok' => true, 'data' => $row, 'fields' => $fieldMeta]);
    exit;
}

/* ================================================================
   상태 변경
   ================================================================ */
if ($action === 'update_status') {
    $form_id   = intval($_POST['form_id'] ?? 0);
    $id        = intval($_POST['id'] ?? 0);
    $status_id = intval($_POST['status_id'] ?? 0);

    $form = getFormInfo($pdo, $form_id);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => '폼을 찾을 수 없습니다.']); exit; }
    $tbl = $form['table_name'];

    $pdo->prepare("UPDATE `{$tbl}` SET status_id=? WHERE id=?")->execute([$status_id, $id]);
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   엑셀 다운로드
   ================================================================ */
if ($action === 'excel') {
    $form_id = intval($_GET['form_id'] ?? 0);
    $keyword = trim($_GET['keyword'] ?? '');
    $status  = trim($_GET['status'] ?? '');
    $from    = trim($_GET['from'] ?? '');
    $to      = trim($_GET['to'] ?? '');

    $form = getFormInfo($pdo, $form_id);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => '폼을 찾을 수 없습니다.']); exit; }
    $tbl = $form['table_name'];

    // 필드 메타
    $fields = $pdo->prepare('SELECT * FROM custom_inquiry_fields WHERE form_id=? ORDER BY sort_order ASC');
    $fields->execute([$form_id]);
    $fieldMeta = $fields->fetchAll();

    $where  = ['d.form_id = ?'];
    $params = [$form_id];
    if ($keyword) { $where[] = 'd.title LIKE ?'; $params[] = "%{$keyword}%"; }
    if ($status)  { $where[] = 'd.status_id = ?'; $params[] = intval($status); }
    if ($from)    { $where[] = 'DATE(d.created_at) >= ?'; $params[] = $from; }
    if ($to)      { $where[] = 'DATE(d.created_at) <= ?'; $params[] = $to; }
    $whereSQL = implode(' AND ', $where);

    $stmt = $pdo->prepare("SELECT d.*, s.label as status_label FROM `{$tbl}` d
        LEFT JOIN custom_inquiry_statuses s ON d.status_id = s.id
        WHERE {$whereSQL} ORDER BY d.id DESC");
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    // CSV 생성
    header('Content-Type: application/json; charset=utf-8'); // reset
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="' . $tbl . '_' . date('Ymd_His') . '.csv"');
    header('Cache-Control: no-cache');

    $out = fopen('php://output', 'w');
    fprintf($out, chr(0xEF).chr(0xBB).chr(0xBF)); // BOM

    // 헤더
    $headers = ['No', '제목', '상태', '조회수', '신청일시', '수정일시'];
    foreach ($fieldMeta as $f) { $headers[] = $f['label']; }
    fputcsv($out, $headers);

    foreach ($rows as $i => $row) {
        $line = [
            $i + 1,
            $row['title'] ?? '',
            $row['status_label'] ?? '',
            $row['view_count'] ?? 0,
            $row['created_at'] ?? '',
            $row['updated_at'] ?? '',
        ];
        foreach ($fieldMeta as $f) { $line[] = $row[$f['field_key']] ?? ''; }
        fputcsv($out, $line);
    }
    fclose($out);
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action']);
