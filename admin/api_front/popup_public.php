<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/log_helper.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = getDB();
// logAccess($pdo);
logLanding($pdo);
$now = date('Y-m-d H:i:s');

// 기간 만료된 팝업 자동 숨김 처리
$pdo->exec(
    "UPDATE popups SET is_visible = 0
     WHERE is_visible = 1
       AND end_dt IS NOT NULL
       AND end_dt < NOW()"
);

$rows = $pdo->prepare(
    "SELECT id, title, is_visible, link_url, link_target,
            pc_image, mo_image, sort_order
     FROM popups
     WHERE is_visible = 1
       AND (start_dt IS NULL OR start_dt <= ?)
       AND (end_dt   IS NULL OR end_dt   >= ?)
     ORDER BY sort_order, id"
);
$rows->execute([$now, $now]);
$popups = $rows->fetchAll();

$isMobile = isset($_SERVER['HTTP_USER_AGENT']) &&
            preg_match('/Mobile|Android|iPhone|iPad/i', $_SERVER['HTTP_USER_AGENT']);

$result = array_map(function($p) use ($isMobile) {
    $imgSrc = ($isMobile && $p['mo_image']) ? $p['mo_image'] : ($p['pc_image'] ?: $p['mo_image']);
    return [
        'id'         => (int)$p['id'],
        'active'     => true,
        'order'      => (int)$p['sort_order'],
        'title'      => $p['title'],
        'image_url'  => $imgSrc,
        'imageUrl'   => $imgSrc,
        'link_url'   => $p['link_url'],
        'linkUrl'    => $p['link_url'],
        'link_target'=> $p['link_target'],
    ];
}, $popups);

echo json_encode(['ok' => true, 'popups' => $result]);