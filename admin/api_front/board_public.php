<?php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json; charset=utf-8');

$pdo   = getDB();
$table = preg_replace('/[^a-z0-9_]/', '', $_GET['table'] ?? '');

if (!$table) {
    echo json_encode(['ok' => false, 'msg' => 'table 파라미터가 필요합니다.']);
    exit;
}

// bp_{table} 존재 여부 확인
$exists = $pdo->query("SHOW TABLES LIKE 'bp_{$table}'")->fetch();
if (!$exists) {
    echo json_encode(['ok' => false, 'msg' => '존재하지 않는 게시판입니다.']);
    exit;
}

$st = $pdo->prepare(
    "SELECT p.id, p.title, p.content, p.author,
            p.category_id, c.name AS cat_name,
            CAST(p.extra AS CHAR) AS extra,
            DATE_FORMAT(p.created_at, '%Y-%m-%d') AS created_at
     FROM `bp_{$table}` p
     LEFT JOIN board_categories c ON c.id = p.category_id
     WHERE p.is_visible = 1
     ORDER BY p.is_notice DESC, p.id DESC"
);
$st->execute();
$rows = $st->fetchAll();

$posts = array_map(function($r) {
    $extra = [];
    if ($r['extra']) {
        try { $extra = json_decode($r['extra'], true) ?: []; } catch (Exception $e) {}
    }
    // category_id로 저장된 분류명을 extra['분류']로 통합
    if (empty($extra['분류']) && !empty($r['cat_name'])) {
        $extra['분류'] = $r['cat_name'];
    }
    return [
        'id'         => (int)$r['id'],
        'title'      => $r['title'],
        'content'    => $r['content'],
        'author'     => $r['author'],
        'date'       => $r['created_at'],
        'extra'      => $extra,
        'youtubeUrl' => $extra['유튜브링크'] ?? null,
        'imageUrl'   => $extra['썸네일이미지'] ?? null,
        'rating'     => isset($extra['별점']) ? (int)$extra['별점'] : 5,
        'text'       => $r['title'],
    ];
}, $rows);

echo json_encode(['ok' => true, 'posts' => $posts]);