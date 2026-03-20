<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/log_helper.php';

header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo    = getDB();

// ── 설정 조회
if ($action === 'getConfig') {
    $row = $pdo->query('SELECT * FROM consults_configs WHERE id = 1')->fetch();
    echo json_encode(['ok' => true, 'data' => $row]);
    exit;
}

// ── 설정 저장
if ($action === 'saveConfig') {
    $title       = trim($_POST['title']        ?? '');
    $desc        = trim($_POST['description']  ?? '');
    $desc2       = trim($_POST['description2'] ?? '');
    $use_cat     = isset($_POST['use_category']) ? 1 : 0;
    $use_product = isset($_POST['use_product'])  ? 1 : 0;

    $pdo->prepare('UPDATE consults_configs SET title=?, description=?, description2=?, use_category=?, use_product=? WHERE id=1')
        ->execute([$title, $desc, $desc2, $use_cat, $use_product]);
    logAdminAction($pdo, 'update', 'consults_configs', '1');
    echo json_encode(['ok' => true]);
    exit;
}

// ── 필드 목록
if ($action === 'fieldList') {
    $rows = $pdo->query('SELECT * FROM consults_fields ORDER BY sort_order, id')->fetchAll();
    echo json_encode(['ok' => true, 'data' => $rows]);
    exit;
}

// ── 필드 추가
if ($action === 'fieldCreate') {
    $name    = trim($_POST['field_name']  ?? '');
    $type    = trim($_POST['field_type']  ?? '');
    $ph      = trim($_POST['placeholder'] ?? '');
    $options = trim($_POST['options']     ?? '');

    if ($name === '' || !in_array($type, ['input','select','radio','check','textarea'])) {
        echo json_encode(['ok' => false, 'msg' => '필드명과 종류를 입력하세요.']);
        exit;
    }

    $pdo->prepare('INSERT INTO consults_fields (field_name, field_type, placeholder, options, is_active) VALUES (?,?,?,?,1)')
        ->execute([$name, $type, $ph, $options]);
    logAdminAction($pdo, 'create', 'consults_fields', '');
    echo json_encode(['ok' => true]);
    exit;
}

// ── 필드 placeholder/options 수정
if ($action === 'fieldUpdate') {
    $id          = (int)($_POST['id']          ?? 0);
    $placeholder = trim($_POST['placeholder']  ?? '');
    $options     = trim($_POST['options']      ?? '');

    $pdo->prepare('UPDATE consults_fields SET placeholder=?, options=? WHERE id=?')
        ->execute([$placeholder, $options, $id]);
    logAdminAction($pdo, 'update', 'consults_fields', (string)$id);
    echo json_encode(['ok' => true]);
    exit;
}

// ── 사용여부만 토글
if ($action === 'fieldToggle') {
    $id        = (int)($_POST['id']        ?? 0);
    $is_active = (int)($_POST['is_active'] ?? 0);
    $pdo->prepare('UPDATE consults_fields SET is_active=? WHERE id=?')->execute([$is_active, $id]);
    echo json_encode(['ok' => true]);
    exit;
}

// ── 순서 저장
if ($action === 'fieldReorder') {
    $ids = json_decode($_POST['ids'] ?? '[]', true);
    foreach ($ids as $i => $id) {
        $pdo->prepare('UPDATE consults_fields SET sort_order=? WHERE id=?')->execute([$i, (int)$id]);
    }
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action']);