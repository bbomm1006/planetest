<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json; charset=utf-8');

set_error_handler(function($no, $str, $file, $line) {
    echo json_encode(['ok' => false, 'msg' => "PHP[$no]: $str ($file:$line)"]);
    exit;
});

requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo    = getDB();

function buildDateWhere(string $col, string $start, string $end): array {
    $conds = []; $params = [];
    if ($start) { $conds[] = "$col >= ?"; $params[] = $start . ' 00:00:00'; }
    if ($end)   { $conds[] = "$col <= ?"; $params[] = $end   . ' 23:59:59'; }
    return [$conds, $params];
}

// PHP 7.3 PDO JSON 컬럼 stream 변환 헬퍼
function fixJsonCols(array &$rows): void {
    $jsonCols = ['before_data', 'after_data', 'stack_trace'];
    foreach ($rows as &$row) {
        foreach ($jsonCols as $col) {
            if (isset($row[$col]) && is_resource($row[$col])) {
                $row[$col] = stream_get_contents($row[$col]);
            }
        }
    }
    unset($row);
}

$TABLE_MAP = [
    'access'       => 'logs_access',
    'login'        => 'logs_login',
    'admin_action' => 'logs_admin_action',
    'error'        => 'logs_error',
    'email'        => 'logs_email',
    'landing'      => 'logs_landing',
];

// ── LIST
if ($action === 'list') {
    $logType  = $_GET['log_type']  ?? 'access';
    $page     = max(1, (int)($_GET['page']  ?? 1));
    $limit    = min(200, max(10, (int)($_GET['limit'] ?? 50)));
    $offset   = ($page - 1) * $limit;
    $dateFrom = trim($_GET['date_from'] ?? '');
    $dateTo   = trim($_GET['date_to']   ?? '');
    $keyword  = trim($_GET['keyword']   ?? '');
    $subType  = trim($_GET['sub_type']  ?? '');

    if (!$dateFrom) $dateFrom = date('Y-m-d', strtotime('-7 days'));
    if (!$dateTo)   $dateTo   = date('Y-m-d');

    if (!isset($TABLE_MAP[$logType])) {
        echo json_encode(['ok' => false, 'msg' => '잘못된 로그 유형']);
        exit;
    }

    $table   = $TABLE_MAP[$logType];
    $dateCol = ($logType === 'email') ? 'sent_at' : 'created_at';

    $conds = []; $params = [];
    [$dc, $dp] = buildDateWhere($dateCol, $dateFrom, $dateTo);
    $conds  = array_merge($conds, $dc);
    $params = array_merge($params, $dp);

    if ($logType === 'login'        && $subType) { $conds[] = 'user_type = ?';    $params[] = $subType; }
    if ($logType === 'error'        && $subType) { $conds[] = 'level = ?';        $params[] = $subType; }
    if ($logType === 'email'        && $subType) { $conds[] = 'status = ?';       $params[] = $subType; }
    if ($logType === 'admin_action' && $subType) { $conds[] = 'action = ?';       $params[] = $subType; }
    if ($logType === 'access'       && $subType) { $conds[] = 'status_code = ?';  $params[] = (int)$subType; }
    if ($logType === 'landing'      && $subType) { $conds[] = 'utm_source = ?';   $params[] = $subType; }

    if ($keyword) {
        $kw = '%' . $keyword . '%';
        switch ($logType) {
            case 'access':       $conds[] = '(ip LIKE ? OR uri LIKE ?)';                        array_push($params,$kw,$kw); break;
            case 'login':        $conds[] = '(username LIKE ? OR user_id LIKE ? OR ip LIKE ?)'; array_push($params,$kw,$kw,$kw); break;
            case 'admin_action': $conds[] = '(admin_name LIKE ? OR action LIKE ? OR target_table LIKE ?)'; array_push($params,$kw,$kw,$kw); break;
            case 'error':        $conds[] = '(message LIKE ? OR file LIKE ?)';                  array_push($params,$kw,$kw); break;
            case 'email':        $conds[] = '(to_email LIKE ? OR subject LIKE ?)';              array_push($params,$kw,$kw); break;
            case 'landing':      $conds[] = '(utm_source LIKE ? OR utm_campaign LIKE ? OR ip LIKE ?)'; array_push($params,$kw,$kw,$kw); break;
        }
    }

    $where = $conds ? 'WHERE ' . implode(' AND ', $conds) : '';

    $cntStmt = $pdo->prepare("SELECT COUNT(*) FROM `$table` $where");
    $cntStmt->execute($params);
    $total = (int)$cntStmt->fetchColumn();
    $cntStmt->closeCursor();

    $dataStmt = $pdo->prepare("SELECT * FROM `$table` $where ORDER BY id DESC LIMIT $limit OFFSET $offset");
    $dataStmt->execute($params);
    $rows = $dataStmt->fetchAll(PDO::FETCH_ASSOC);
    fixJsonCols($rows);

    echo json_encode([
        'ok'        => true,
        'data'      => $rows,
        'total'     => $total,
        'page'      => $page,
        'limit'     => $limit,
        'pages'     => (int)ceil($total / $limit),
        'date_from' => $dateFrom,
        'date_to'   => $dateTo,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// ── DETAIL
if ($action === 'detail') {
    $logType = $_GET['log_type'] ?? '';
    $id      = (int)($_GET['id'] ?? 0);

    if (!isset($TABLE_MAP[$logType]) || !$id) {
        echo json_encode(['ok' => false, 'msg' => '잘못된 요청']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT * FROM `{$TABLE_MAP[$logType]}` WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$row) { echo json_encode(['ok' => false, 'msg' => '데이터 없음']); exit; }
    // JSON stream 처리
    foreach (['before_data', 'after_data', 'stack_trace'] as $col) {
        if (isset($row[$col]) && is_resource($row[$col])) {
            $row[$col] = stream_get_contents($row[$col]);
        }
    }
    echo json_encode(['ok' => true, 'data' => $row], JSON_UNESCAPED_UNICODE);
    exit;
}

// ── EXPORT (CSV)
if ($action === 'export') {
    $logType  = $_GET['log_type']  ?? 'access';
    $dateFrom = trim($_GET['date_from'] ?? date('Y-m-d', strtotime('-7 days')));
    $dateTo   = trim($_GET['date_to']   ?? date('Y-m-d'));
    $keyword  = trim($_GET['keyword']   ?? '');
    $subType  = trim($_GET['sub_type']  ?? '');

    if (!isset($TABLE_MAP[$logType])) exit;

    $table   = $TABLE_MAP[$logType];
    $dateCol = ($logType === 'email') ? 'sent_at' : 'created_at';

    $conds = []; $params = [];
    [$dc, $dp] = buildDateWhere($dateCol, $dateFrom, $dateTo);
    $conds = array_merge($conds, $dc); $params = array_merge($params, $dp);

    if ($logType === 'login'        && $subType) { $conds[] = 'user_type = ?';   $params[] = $subType; }
    if ($logType === 'error'        && $subType) { $conds[] = 'level = ?';       $params[] = $subType; }
    if ($logType === 'email'        && $subType) { $conds[] = 'status = ?';      $params[] = $subType; }
    if ($logType === 'admin_action' && $subType) { $conds[] = 'action = ?';      $params[] = $subType; }
    if ($logType === 'access'       && $subType) { $conds[] = 'status_code = ?'; $params[] = (int)$subType; }
    if ($logType === 'landing'      && $subType) { $conds[] = 'utm_source = ?';  $params[] = $subType; }

    if ($keyword) {
        $kw = '%' . $keyword . '%';
        switch ($logType) {
            case 'access':       $conds[] = '(ip LIKE ? OR uri LIKE ?)';                         array_push($params,$kw,$kw); break;
            case 'login':        $conds[] = '(username LIKE ? OR user_id LIKE ? OR ip LIKE ?)';  array_push($params,$kw,$kw,$kw); break;
            case 'admin_action': $conds[] = '(admin_name LIKE ? OR action LIKE ?)';              array_push($params,$kw,$kw); break;
            case 'error':        $conds[] = '(message LIKE ? OR file LIKE ?)';                   array_push($params,$kw,$kw); break;
            case 'email':        $conds[] = '(to_email LIKE ? OR subject LIKE ?)';               array_push($params,$kw,$kw); break;
            case 'landing':      $conds[] = '(utm_source LIKE ? OR utm_campaign LIKE ?)';        array_push($params,$kw,$kw); break;
        }
    }

    $where = $conds ? 'WHERE ' . implode(' AND ', $conds) : '';
    $stmt  = $pdo->prepare("SELECT * FROM `$table` $where ORDER BY id DESC");
    $stmt->execute(array_values($params));

    $labelMap = ['access'=>'접속로그','login'=>'로그인로그','admin_action'=>'관리자작업로그','error'=>'에러로그','email'=>'이메일발송로그','landing'=>'랜딩로그'];
    $filename = ($labelMap[$logType] ?? $logType) . '_' . date('Ymd') . '.csv';

    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: no-cache');

    $out = fopen('php://output', 'w');
    fwrite($out, "\xEF\xBB\xBF");
    $first = true;
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // JSON stream 처리
        foreach (['before_data', 'after_data', 'stack_trace'] as $col) {
            if (isset($row[$col]) && is_resource($row[$col])) {
                $row[$col] = stream_get_contents($row[$col]);
            }
        }
        if ($first) { fputcsv($out, array_keys($row)); $first = false; }
        fputcsv($out, array_values($row));
    }
    fclose($out);
    exit;
}

// ── WRITE HELPER
function writeLog(PDO $pdo, string $type, array $data): void {
    $map = ['access'=>'logs_access','login'=>'logs_login','admin_action'=>'logs_admin_action','error'=>'logs_error','email'=>'logs_email','landing'=>'logs_landing'];
    if (!isset($map[$type])) return;
    $cols = implode(',', array_keys($data));
    $ph   = implode(',', array_fill(0, count($data), '?'));
    try { $pdo->prepare("INSERT INTO `{$map[$type]}` ($cols) VALUES ($ph)")->execute(array_values($data)); } catch (Exception $e) {}
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action'], JSON_UNESCAPED_UNICODE);
