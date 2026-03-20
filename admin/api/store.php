<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/log_helper.php';

header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo    = getDB();

/* =====================================================
   KAKAO API (kakao_api_keys, id=1 단일 행)
   ===================================================== */

if ($action === 'kakaoGet') {
    $row = $pdo->query('SELECT sdk_url, js_key, rest_key FROM kakao_api_keys WHERE id=1')->fetch();
    if (!$row) $row = ['sdk_url' => 'https://dapi.kakao.com/v2/maps/sdk.js', 'js_key' => '', 'rest_key' => ''];
    echo json_encode(['ok' => true, 'data' => $row]);
    exit;
}

if ($action === 'kakaoSave') {
    $sdk_url  = trim($_POST['sdk_url']  ?? 'https://dapi.kakao.com/v2/maps/sdk.js');
    $js_key   = trim($_POST['js_key']   ?? '');
    $rest_key = trim($_POST['rest_key'] ?? '');
    $pdo->prepare(
        'INSERT INTO kakao_api_keys (id, sdk_url, js_key, rest_key)
         VALUES (1, ?, ?, ?)
         ON DUPLICATE KEY UPDATE sdk_url=VALUES(sdk_url), js_key=VALUES(js_key), rest_key=VALUES(rest_key)'
    )->execute([$sdk_url, $js_key, $rest_key]);
    echo json_encode(['ok' => true]);
    exit;
}

/* =====================================================
   STORE (stores)
   ===================================================== */

if ($action === 'storeList') {
    $rows = $pdo->query(
        'SELECT id, store_name, branch_name, address, lat, lng, phone, open_hours,
                reserve_url, reserve_target, memo, detail_info, images, sort_order,
                DATE_FORMAT(created_at,"%Y-%m-%d") AS created_at,
                DATE_FORMAT(updated_at,"%Y-%m-%d") AS updated_at
         FROM stores ORDER BY sort_order, id'
    )->fetchAll();
    echo json_encode(['ok' => true, 'data' => $rows]);
    exit;
}

if ($action === 'storeGet') {
    $id = (int)($_GET['id'] ?? 0);
    $st = $pdo->prepare('SELECT * FROM stores WHERE id=?');
    $st->execute([$id]);
    $row = $st->fetch();
    if (!$row) { echo json_encode(['ok' => false, 'msg' => '없는 매장']); exit; }
    echo json_encode(['ok' => true, 'data' => $row]);
    exit;
}

if ($action === 'storeCreate') {
    $store_name     = trim($_POST['store_name']     ?? '');
    $branch_name    = trim($_POST['branch_name']    ?? '');
    $address        = trim($_POST['address']        ?? '');
    $lat            = $_POST['lat']   !== '' ? (float)$_POST['lat']  : null;
    $lng            = $_POST['lng']   !== '' ? (float)$_POST['lng']  : null;
    $phone          = trim($_POST['phone']          ?? '');
    $open_hours     = trim($_POST['open_hours']     ?? '');
    $reserve_url    = trim($_POST['reserve_url']    ?? '');
    $reserve_target = $_POST['reserve_target']      ?? '_self';
    $memo           = trim($_POST['memo']           ?? '');
    $detail_info    = trim($_POST['detail_info']    ?? '');
    $images         = trim($_POST['images']         ?? '');
    if ($store_name === '' || $branch_name === '') {
        echo json_encode(['ok' => false, 'msg' => '매장명·지점명은 필수입니다.']); exit;
    }
    $max = $pdo->query('SELECT COALESCE(MAX(sort_order),0) FROM stores')->fetchColumn();
    $pdo->prepare(
        'INSERT INTO stores (store_name,branch_name,address,lat,lng,phone,open_hours,
         reserve_url,reserve_target,memo,detail_info,images,sort_order)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
    )->execute([$store_name,$branch_name,$address,$lat,$lng,$phone,$open_hours,
                $reserve_url,$reserve_target,$memo,$detail_info,$images,$max+1]);
    $newId = $pdo->lastInsertId();
    logAdminAction($pdo, 'create', 'stores', (string)$newId, [], ['store_name' => $store_name, 'branch_name' => $branch_name]);
    echo json_encode(['ok' => true, 'id' => (int)$newId]);
    exit;
}

if ($action === 'storeUpdate') {
    $id             = (int)($_POST['id']            ?? 0);
    $store_name     = trim($_POST['store_name']     ?? '');
    $branch_name    = trim($_POST['branch_name']    ?? '');
    $address        = trim($_POST['address']        ?? '');
    $lat            = $_POST['lat'] !== '' ? (float)$_POST['lat'] : null;
    $lng            = $_POST['lng'] !== '' ? (float)$_POST['lng'] : null;
    $phone          = trim($_POST['phone']          ?? '');
    $open_hours     = trim($_POST['open_hours']     ?? '');
    $reserve_url    = trim($_POST['reserve_url']    ?? '');
    $reserve_target = $_POST['reserve_target']      ?? '_self';
    $memo           = trim($_POST['memo']           ?? '');
    $detail_info    = trim($_POST['detail_info']    ?? '');
    $images         = trim($_POST['images']         ?? '');
    if ($id <= 0 || $store_name === '' || $branch_name === '') {
        echo json_encode(['ok' => false, 'msg' => '잘못된 요청']); exit;
    }
    $pdo->prepare(
        'UPDATE stores SET store_name=?,branch_name=?,address=?,lat=?,lng=?,phone=?,open_hours=?,
         reserve_url=?,reserve_target=?,memo=?,detail_info=?,images=? WHERE id=?'
    )->execute([$store_name,$branch_name,$address,$lat,$lng,$phone,$open_hours,
                $reserve_url,$reserve_target,$memo,$detail_info,$images,$id]);
    logAdminAction($pdo, 'update', 'stores', (string)$id, [], ['store_name' => $store_name, 'branch_name' => $branch_name]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'storeDelete') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['ok' => false, 'msg' => '잘못된 ID']); exit; }
    $pdo->prepare('DELETE FROM stores WHERE id=?')->execute([$id]);
    logAdminAction($pdo, 'delete', 'stores', (string)$id);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'storeReorder') {
    $ids  = json_decode($_POST['ids'] ?? '[]', true) ?: [];
    $stmt = $pdo->prepare('UPDATE stores SET sort_order=? WHERE id=?');
    foreach ($ids as $i => $id) $stmt->execute([$i + 1, (int)$id]);
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action']);