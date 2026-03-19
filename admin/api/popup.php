<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo    = getDB();

/* ── 목록 조회 ── */
if ($action === 'list') {
    // 기간 만료된 팝업 자동 숨김 처리
    $pdo->exec(
        "UPDATE popups SET is_visible = 0
         WHERE is_visible = 1
           AND end_dt IS NOT NULL
           AND end_dt < NOW()"
    );

    $rows = $pdo->query(
        'SELECT id, title, is_visible, link_url, link_target,
                pc_image, mo_image,
                DATE_FORMAT(start_dt,"%Y-%m-%dT%H:%i") AS start_dt,
                DATE_FORMAT(end_dt,  "%Y-%m-%dT%H:%i") AS end_dt,
                sort_order,
                DATE_FORMAT(created_at,"%Y-%m-%d") AS created_at
         FROM popups ORDER BY sort_order, id'
    )->fetchAll();
    echo json_encode(['ok' => true, 'data' => $rows]);
    exit;
}

/* ── 추가 ── */
if ($action === 'create') {
    $title       = trim($_POST['title']       ?? '');
    $is_visible  = (int)($_POST['is_visible'] ?? 1);
    $link_url    = trim($_POST['link_url']    ?? '');
    $link_target = $_POST['link_target']      ?? '_self';
    $pc_image    = trim($_POST['pc_image']    ?? '');
    $mo_image    = trim($_POST['mo_image']    ?? '');
    $start_dt    = $_POST['start_dt']         ?: null;
    $end_dt      = $_POST['end_dt']           ?: null;

    if ($title === '') { echo json_encode(['ok'=>false,'msg'=>'제목을 입력하세요.']); exit; }

    $maxOrder = $pdo->query('SELECT COALESCE(MAX(sort_order),0) FROM popups')->fetchColumn();
    $pdo->prepare(
        'INSERT INTO popups (title,is_visible,link_url,link_target,pc_image,mo_image,start_dt,end_dt,sort_order)
         VALUES (?,?,?,?,?,?,?,?,?)'
    )->execute([$title,$is_visible,$link_url,$link_target,$pc_image,$mo_image,$start_dt,$end_dt,$maxOrder+1]);
    echo json_encode(['ok'=>true,'id'=>(int)$pdo->lastInsertId()]);
    exit;
}

/* ── 수정 ── */
if ($action === 'update') {
    $id          = (int)($_POST['id']         ?? 0);
    $title       = trim($_POST['title']       ?? '');
    $is_visible  = (int)($_POST['is_visible'] ?? 1);
    $link_url    = trim($_POST['link_url']    ?? '');
    $link_target = $_POST['link_target']      ?? '_self';
    $pc_image    = trim($_POST['pc_image']    ?? '');
    $mo_image    = trim($_POST['mo_image']    ?? '');
    $start_dt    = $_POST['start_dt']         ?: null;
    $end_dt      = $_POST['end_dt']           ?: null;

    if ($id <= 0 || $title === '') { echo json_encode(['ok'=>false,'msg'=>'잘못된 요청']); exit; }
    $pdo->prepare(
        'UPDATE popups SET title=?,is_visible=?,link_url=?,link_target=?,
         pc_image=?,mo_image=?,start_dt=?,end_dt=? WHERE id=?'
    )->execute([$title,$is_visible,$link_url,$link_target,$pc_image,$mo_image,$start_dt,$end_dt,$id]);
    echo json_encode(['ok'=>true]);
    exit;
}

/* ── 삭제 ── */
if ($action === 'delete') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['ok'=>false,'msg'=>'잘못된 ID']); exit; }
    $pdo->prepare('DELETE FROM popups WHERE id=?')->execute([$id]);
    echo json_encode(['ok'=>true]);
    exit;
}

/* ── 순서 저장 ── */
if ($action === 'reorder') {
    $ids = json_decode($_POST['ids'] ?? '[]', true) ?: [];
    $stmt = $pdo->prepare('UPDATE popups SET sort_order=? WHERE id=?');
    foreach ($ids as $i => $id) $stmt->execute([$i+1, (int)$id]);
    echo json_encode(['ok'=>true]);
    exit;
}

/* ── 노출 토글 ── */
if ($action === 'toggleVisible') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare('UPDATE popups SET is_visible = 1-is_visible WHERE id=?')->execute([$id]);
    $row = $pdo->prepare('SELECT is_visible FROM popups WHERE id=?');
    $row->execute([$id]);
    echo json_encode(['ok'=>true,'is_visible'=>(int)$row->fetchColumn()]);
    exit;
}

echo json_encode(['ok'=>false,'msg'=>'Unknown action']);