<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/log_helper.php';

header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo    = getDB();

/* =====================================================
   MENU
   ===================================================== */

// 메뉴 목록 조회
if ($action === 'menuList') {
    $rows = $pdo->query('SELECT `key`, label, is_active, sort_order FROM menus ORDER BY sort_order, id')->fetchAll();
    echo json_encode(['ok' => true, 'data' => $rows]);
    exit;
}

// 메뉴 일괄 저장 (체크박스 상태 배열)
if ($action === 'menuSave') {
    // items: [{key, is_active}, ...]
    $items = json_decode($_POST['items'] ?? '[]', true) ?: [];
    foreach ($items as $item) {
        $key      = $item['key']       ?? '';
        $isActive = (int)($item['is_active'] ?? 0);
        if ($key === '') continue;
        // UPSERT
        $pdo->prepare(
            'INSERT INTO menus (`key`, label, is_active) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE is_active = VALUES(is_active)'
        )->execute([$key, $item['label'] ?? $key, $isActive]);
    }
    logAdminAction($pdo, 'update', 'menus', 'bulk');
    echo json_encode(['ok' => true]);
    exit;
}

/* =====================================================
   SCRIPT
   ===================================================== */

// 스크립트 조회 (항상 id=1 단일 행)
if ($action === 'scriptGet') {
    $row = $pdo->query('SELECT head_code, body_code FROM scripts WHERE id = 1')->fetch();
    if (!$row) $row = ['head_code' => '', 'body_code' => ''];
    echo json_encode(['ok' => true, 'data' => $row]);
    exit;
}

// 스크립트 저장
if ($action === 'scriptSave') {
    $head = $_POST['head_code'] ?? '';
    $body = $_POST['body_code'] ?? '';
    $pdo->prepare(
        'INSERT INTO scripts (id, head_code, body_code) VALUES (1, ?, ?)
         ON DUPLICATE KEY UPDATE head_code = VALUES(head_code), body_code = VALUES(body_code)'
    )->execute([$head, $body]);
    logAdminAction($pdo, 'update', 'scripts', '1');
    echo json_encode(['ok' => true]);
    exit;
}

/* =====================================================
   SOCIAL LINKS
   ===================================================== */

// 소셜 설정 조회
if ($action === 'socialGet') {
    $row = $pdo->query('SELECT kakao_app_key, naver_client_id, naver_client_secret, google_client_id, updated_at FROM social_links WHERE id = 1')->fetch();
    if (!$row) $row = ['kakao_app_key'=>'','naver_client_id'=>'','naver_client_secret'=>'','google_client_id'=>'','updated_at'=>''];
    echo json_encode(['ok' => true, 'data' => $row]);
    exit;
}

// 소셜 설정 저장
if ($action === 'socialSave') {
    $kakao  = trim($_POST['kakao_app_key']       ?? '');
    $navId  = trim($_POST['naver_client_id']     ?? '');
    $navSec = trim($_POST['naver_client_secret'] ?? '');
    $google = trim($_POST['google_client_id']    ?? '');
    $pdo->prepare(
        'INSERT INTO social_links (id, kakao_app_key, naver_client_id, naver_client_secret, google_client_id)
         VALUES (1, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           kakao_app_key = VALUES(kakao_app_key),
           naver_client_id = VALUES(naver_client_id),
           naver_client_secret = VALUES(naver_client_secret),
           google_client_id = VALUES(google_client_id)'
    )->execute([$kakao, $navId, $navSec, $google]);
    logAdminAction($pdo, 'update', 'social_links', '1');
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action']);
