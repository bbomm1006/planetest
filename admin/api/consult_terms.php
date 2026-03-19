<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo    = getDB();

// ── 조회
if ($action === 'get') {
    $row = $pdo->query('SELECT * FROM consult_terms WHERE id = 1')->fetch();
    echo json_encode(['ok' => true, 'data' => $row]);
    exit;
}

// ── 저장
if ($action === 'save') {
    $name = trim($_POST['term_name'] ?? '');
    $body = trim($_POST['term_body'] ?? '');
    $pdo->prepare('UPDATE consult_terms SET term_name=?, term_body=? WHERE id=1')->execute([$name, $body]);
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action']);