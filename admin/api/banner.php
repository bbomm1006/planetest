<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo    = getDB();

/* ── 목록 조회 ── */
if ($action === 'list') {
    $rows = $pdo->query(
        'SELECT id, title, type, is_visible, link_url, link_target,
                pc_image, mo_image, video_url, sort_order,
                subtitle, title_text, title_color,
                description, desc_color,
                overlay_on, overlay_color,
                btn1_on, btn1_text, btn1_link, btn1_bg, btn1_text_color,
                btn2_on, btn2_text, btn2_link, btn2_text_color,
                DATE_FORMAT(created_at,"%Y-%m-%d") AS created_at
         FROM banners ORDER BY sort_order, id'
    )->fetchAll();
    echo json_encode(['ok' => true, 'data' => $rows]);
    exit;
}

/* ── 추가 ── */
if ($action === 'create') {
    $p = _bannerParams();
    if ($p['title'] === '') { echo json_encode(['ok'=>false,'msg'=>'제목을 입력하세요.']); exit; }

    $maxOrder = $pdo->query('SELECT COALESCE(MAX(sort_order),0) FROM banners')->fetchColumn();
    $pdo->prepare(
        'INSERT INTO banners
           (title, type, is_visible, link_url, link_target,
            pc_image, mo_image, video_url, sort_order,
            subtitle, title_text, title_color,
            description, desc_color,
            overlay_on, overlay_color,
            btn1_on, btn1_text, btn1_link, btn1_bg, btn1_text_color,
            btn2_on, btn2_text, btn2_link, btn2_text_color)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    )->execute([
        $p['title'], $p['type'], $p['is_visible'], $p['link_url'], $p['link_target'],
        $p['pc_image'], $p['mo_image'], $p['video_url'], $maxOrder + 1,
        $p['subtitle'], $p['title_text'], $p['title_color'],
        $p['description'], $p['desc_color'],
        $p['overlay_on'], $p['overlay_color'],
        $p['btn1_on'], $p['btn1_text'], $p['btn1_link'], $p['btn1_bg'], $p['btn1_text_color'],
        $p['btn2_on'], $p['btn2_text'], $p['btn2_link'], $p['btn2_text_color'],
    ]);
    echo json_encode(['ok'=>true,'id'=>(int)$pdo->lastInsertId()]);
    exit;
}

/* ── 수정 ── */
if ($action === 'update') {
    $id = (int)($_POST['id'] ?? 0);
    $p  = _bannerParams();
    if ($id <= 0 || $p['title'] === '') { echo json_encode(['ok'=>false,'msg'=>'잘못된 요청']); exit; }

    $pdo->prepare(
        'UPDATE banners SET
           title=?, type=?, is_visible=?, link_url=?, link_target=?,
           pc_image=?, mo_image=?, video_url=?,
           subtitle=?, title_text=?, title_color=?,
           description=?, desc_color=?,
           overlay_on=?, overlay_color=?,
           btn1_on=?, btn1_text=?, btn1_link=?, btn1_bg=?, btn1_text_color=?,
           btn2_on=?, btn2_text=?, btn2_link=?, btn2_text_color=?
         WHERE id=?'
    )->execute([
        $p['title'], $p['type'], $p['is_visible'], $p['link_url'], $p['link_target'],
        $p['pc_image'], $p['mo_image'], $p['video_url'],
        $p['subtitle'], $p['title_text'], $p['title_color'],
        $p['description'], $p['desc_color'],
        $p['overlay_on'], $p['overlay_color'],
        $p['btn1_on'], $p['btn1_text'], $p['btn1_link'], $p['btn1_bg'], $p['btn1_text_color'],
        $p['btn2_on'], $p['btn2_text'], $p['btn2_link'], $p['btn2_text_color'],
        $id,
    ]);
    echo json_encode(['ok'=>true]);
    exit;
}

/* ── 삭제 ── */
if ($action === 'delete') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['ok'=>false,'msg'=>'잘못된 ID']); exit; }
    $pdo->prepare('DELETE FROM banners WHERE id=?')->execute([$id]);
    echo json_encode(['ok'=>true]);
    exit;
}

/* ── 순서 저장 ── */
if ($action === 'reorder') {
    $ids  = json_decode($_POST['ids'] ?? '[]', true) ?: [];
    $stmt = $pdo->prepare('UPDATE banners SET sort_order=? WHERE id=?');
    foreach ($ids as $i => $id) $stmt->execute([$i + 1, (int)$id]);
    echo json_encode(['ok'=>true]);
    exit;
}

/* ── 노출 토글 ── */
if ($action === 'toggleVisible') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare('UPDATE banners SET is_visible = 1-is_visible WHERE id=?')->execute([$id]);
    $row = $pdo->prepare('SELECT is_visible FROM banners WHERE id=?');
    $row->execute([$id]);
    echo json_encode(['ok'=>true,'is_visible'=>(int)$row->fetchColumn()]);
    exit;
}

echo json_encode(['ok'=>false,'msg'=>'Unknown action']);

/* ── 공통 파라미터 파싱 ── */
function _bannerParams(): array {
    return [
        'title'           => trim($_POST['title']            ?? ''),
        'type'            => $_POST['type']                  ?? 'image',
        'is_visible'      => (int)($_POST['is_visible']      ?? 1),
        'link_url'        => trim($_POST['link_url']         ?? ''),
        'link_target'     => $_POST['link_target']           ?? '_self',
        'pc_image'        => trim($_POST['pc_image']         ?? ''),
        'mo_image'        => trim($_POST['mo_image']         ?? ''),
        'video_url'       => trim($_POST['video_url']        ?? ''),
        'subtitle'        => trim($_POST['subtitle']         ?? ''),
        'title_text'      => trim($_POST['title_text']       ?? ''),
        'title_color'     => trim($_POST['title_color']      ?? '#ffffff'),
        'description'     => trim($_POST['description']      ?? ''),
        'desc_color'      => trim($_POST['desc_color']       ?? 'rgba(255,255,255,.72)'),
        'overlay_on'      => (int)($_POST['overlay_on']      ?? 1),
        'overlay_color'   => trim($_POST['overlay_color']    ?? 'rgba(0,0,0,0.45)'),
        'btn1_on'         => (int)($_POST['btn1_on']         ?? 0),
        'btn1_text'       => trim($_POST['btn1_text']        ?? ''),
        'btn1_link'       => trim($_POST['btn1_link']        ?? ''),
        'btn1_bg'         => trim($_POST['btn1_bg']          ?? '#00c6ff'),
        'btn1_text_color' => trim($_POST['btn1_text_color']  ?? '#ffffff'),
        'btn2_on'         => (int)($_POST['btn2_on']         ?? 0),
        'btn2_text'       => trim($_POST['btn2_text']        ?? ''),
        'btn2_link'       => trim($_POST['btn2_link']        ?? ''),
        'btn2_text_color' => trim($_POST['btn2_text_color']  ?? '#ffffff'),
    ];
}