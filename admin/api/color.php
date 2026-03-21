<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/log_helper.php';

header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo    = getDB();

// MySQL 5.7 호환: information_schema로 컬럼 존재 여부 확인 후 추가
$dbName = $pdo->query("SELECT DATABASE()")->fetchColumn();
$existingCols = $pdo->query(
    "SELECT column_name FROM information_schema.columns
     WHERE table_schema = " . $pdo->quote($dbName) . "
     AND table_name = 'homepage_info'"
)->fetchAll(PDO::FETCH_COLUMN);

$toAdd = [];
if (!in_array('color_base',  $existingCols)) $toAdd[] = "ADD COLUMN color_base  VARCHAR(20) NULL";
if (!in_array('color_point', $existingCols)) $toAdd[] = "ADD COLUMN color_point VARCHAR(20) NULL";
if (!in_array('color_sub',   $existingCols)) $toAdd[] = "ADD COLUMN color_sub   VARCHAR(20) NULL";
if ($toAdd) {
    $pdo->exec("ALTER TABLE homepage_info " . implode(', ', $toAdd));
}

// row 없으면 방어 생성
$cnt = $pdo->query('SELECT COUNT(*) FROM homepage_info')->fetchColumn();
if ($cnt == 0) $pdo->exec('INSERT INTO homepage_info (id) VALUES (1)');

// ── GET ─────────────────────────────────────────────────
if ($action === 'get') {
    $row = $pdo->query(
        "SELECT
            COALESCE(NULLIF(TRIM(color_base),''),  '#1255a6') AS color_base,
            COALESCE(NULLIF(TRIM(color_point),''), '#1e7fe8') AS color_point,
            COALESCE(NULLIF(TRIM(color_sub),''),   '#00c6ff') AS color_sub
         FROM homepage_info WHERE id=1"
    )->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['ok' => true, 'data' => $row ?: [
        'color_base'  => '#1255a6',
        'color_point' => '#1e7fe8',
        'color_sub'   => '#00c6ff',
    ]]);
    exit;
}

// ── SAVE ─────────────────────────────────────────────────
if ($action === 'save') {
    $sanitize = function(string $v, string $default): string {
        $v = trim($v);
        return preg_match('/^#[0-9a-fA-F]{3,8}$/', $v) ? $v : $default;
    };

    $base  = $sanitize($_POST['color_base']  ?? '', '#1255a6');
    $point = $sanitize($_POST['color_point'] ?? '', '#1e7fe8');
    $sub   = $sanitize($_POST['color_sub']   ?? '', '#00c6ff');

    $stmt = $pdo->prepare("UPDATE homepage_info SET color_base=?, color_point=?, color_sub=? WHERE id=1");
    $stmt->execute([$base, $point, $sub]);

    logAdminAction($pdo, 'update', 'homepage_info', '1');
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'unknown action']);
