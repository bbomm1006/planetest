<?php
/**
 * board_comments.php — 댓글 CRUD
 * 댓글 (사용자+관리자) → bp_qna_comments
 * 관리자 답변 → inquiry_answers (읽기 전용, 관리자 페이지에서만 작성)
 */
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/log_helper.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');

if (session_status() === PHP_SESSION_NONE) session_start();

$pdo    = getDB();
logAccess($pdo);
logLanding($pdo);
$method = $_SERVER['REQUEST_METHOD'];
$user   = $_SESSION['board_user'] ?? null;

// bp_qna_comments 테이블 자동 생성
try { $pdo->query("SELECT 1 FROM `bp_qna_comments` LIMIT 1"); }
catch (Exception $e) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `bp_qna_comments` (
        `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
        `post_id`     INT UNSIGNED NOT NULL,
        `author_id`   VARCHAR(100) NOT NULL,
        `author_name` VARCHAR(100) NOT NULL,
        `is_admin`    TINYINT(1) NOT NULL DEFAULT 0,
        `content`     TEXT NOT NULL,
        `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at`  DATETIME DEFAULT NULL,
        PRIMARY KEY (`id`),
        KEY `fk_post` (`post_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

/* ══ 댓글 등록 ══ */
if ($method === 'POST') {
    if (!$user) { echo json_encode(['ok' => false, 'error' => '로그인 필요']); exit; }
    $input   = json_decode(file_get_contents('php://input'), true) ?: [];
    $post_id = (int)($input['post_id'] ?? 0);
    $content = trim($input['content'] ?? '');
    if (!$post_id || !$content) { echo json_encode(['ok' => false, 'error' => '파라미터 오류']); exit; }

    // 해당 게시글이 본인 글인지 확인
    $st = $pdo->prepare("SELECT author_id FROM `inquiries` WHERE id=?");
    $st->execute([$post_id]); $post = $st->fetch();
    if (!$post || $post['author_id'] !== $user['id']) {
        echo json_encode(['ok' => false, 'error' => '권한 없음']); exit;
    }

    $pdo->prepare("INSERT INTO `bp_qna_comments` (post_id, author_id, author_name, is_admin, content) VALUES (?,?,?,0,?)")
        ->execute([$post_id, $user['id'], $user['name'], $content]);
    echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    exit;
}

/* ══ 댓글 수정 ══ */
if ($method === 'PUT' && isset($_GET['id'])) {
    if (!$user) { echo json_encode(['ok' => false, 'error' => '로그인 필요']); exit; }
    $id      = (int)$_GET['id'];
    $input   = json_decode(file_get_contents('php://input'), true) ?: [];
    $content = trim($input['content'] ?? '');
    if (!$content) { echo json_encode(['ok' => false, 'error' => '내용 입력 필요']); exit; }
    $st = $pdo->prepare("SELECT author_id FROM `bp_qna_comments` WHERE id=?");
    $st->execute([$id]); $c = $st->fetch();
    if (!$c || $c['author_id'] !== $user['id']) { echo json_encode(['ok' => false, 'error' => '권한 없음']); exit; }
    $pdo->prepare("UPDATE `bp_qna_comments` SET content=?, updated_at=NOW() WHERE id=?")->execute([$content, $id]);
    echo json_encode(['ok' => true]);
    exit;
}

/* ══ 댓글 삭제 ══ */
if ($method === 'DELETE' && isset($_GET['id'])) {
    if (!$user) { echo json_encode(['ok' => false, 'error' => '로그인 필요']); exit; }
    $id = (int)$_GET['id'];
    $st = $pdo->prepare("SELECT author_id FROM `bp_qna_comments` WHERE id=?");
    $st->execute([$id]); $c = $st->fetch();
    if (!$c || $c['author_id'] !== $user['id']) { echo json_encode(['ok' => false, 'error' => '권한 없음']); exit; }
    $pdo->prepare("DELETE FROM `bp_qna_comments` WHERE id=?")->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Unknown action']);