<?php
/**
 * board_posts.php — 문의게시판 게시글 CRUD (inquiries 테이블 사용)
 */
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/log_helper.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');

set_error_handler(function($no,$str,$file,$line){ echo json_encode(['ok'=>false,'error'=>"PHP[$no]:$str"]); exit; });
set_exception_handler(function($e){ echo json_encode(['ok'=>false,'error'=>$e->getMessage()]); exit; });

if (session_status() === PHP_SESSION_NONE) session_start();

$pdo    = getDB();
// logAccess($pdo);
logLanding($pdo);
$method = $_SERVER['REQUEST_METHOD'];
$user   = $_SESSION['board_user'] ?? null;

// inquiries 테이블 자동 생성
try { $pdo->query("SELECT 1 FROM `inquiries` LIMIT 1"); }
catch (Exception $e) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `inquiries` (
        `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
        `category_id` INT UNSIGNED DEFAULT NULL,
        `name`        VARCHAR(100) NOT NULL DEFAULT '',
        `phone`       VARCHAR(50)  DEFAULT NULL,
        `email`       VARCHAR(200) DEFAULT NULL,
        `content`     LONGTEXT NOT NULL,
        `status`      VARCHAR(20) NOT NULL DEFAULT 'pending',
        `is_public`   TINYINT(1) NOT NULL DEFAULT 1,
        `author_id`   VARCHAR(100) DEFAULT NULL,
        `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

$dbName = $pdo->query("SELECT DATABASE()")->fetchColumn();

// author_id 컬럼 없으면 추가
$hasCol = $pdo->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='inquiries' AND COLUMN_NAME='author_id'");
$hasCol->execute([$dbName]);
if (!(int)$hasCol->fetchColumn()) {
    $pdo->exec("ALTER TABLE `inquiries` ADD COLUMN `author_id` VARCHAR(100) DEFAULT NULL");
}

// inquiry_answers 테이블 자동 생성
try { $pdo->query("SELECT 1 FROM `inquiry_answers` LIMIT 1"); }
catch (Exception $e) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `inquiry_answers` (
        `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
        `inquiry_id`  INT UNSIGNED NOT NULL,
        `admin_id`    INT UNSIGNED DEFAULT NULL,
        `author_id`   VARCHAR(100) DEFAULT NULL,
        `author_name` VARCHAR(100) DEFAULT NULL,
        `is_admin`    TINYINT(1) NOT NULL DEFAULT 0,
        `content`     TEXT NOT NULL,
        `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at`  DATETIME DEFAULT NULL,
        PRIMARY KEY (`id`),
        KEY `fk_inquiry` (`inquiry_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

$answerCols = ['author_id' => "VARCHAR(100) DEFAULT NULL", 'author_name' => "VARCHAR(100) DEFAULT NULL", 'is_admin' => "TINYINT(1) NOT NULL DEFAULT 0"];
foreach ($answerCols as $col => $def) {
    $chk = $pdo->prepare("SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='inquiry_answers' AND COLUMN_NAME=?");
    $chk->execute([$dbName, $col]);
    if (!(int)$chk->fetchColumn()) {
        $pdo->exec("ALTER TABLE `inquiry_answers` ADD COLUMN `$col` $def");
    }
}

function statusLabel($s) {
    if ($s === 'completed') return '완료';
    if ($s === 'pending')   return '접수';
    return $s;
}

/* ══ 목록 ══ */
if ($method === 'GET' && !isset($_GET['id'])) {
    $page   = max(1, (int)($_GET['page']  ?? 1));
    $limit  = min(50, (int)($_GET['limit'] ?? 10));
    $kw     = trim($_GET['kw'] ?? '');
    $offset = ($page - 1) * $limit;

    if (!$user) {
        /* 비로그인: 공개글 전체 목록 반환 (제목/작성자/날짜/상태만, 내용 미노출) */
        $where  = 'WHERE 1=1';
        $params = [];
        if ($kw) {
            $where .= ' AND (i.name LIKE ? OR i.content LIKE ?)';
            $params[] = "%$kw%";
            $params[] = "%$kw%";
        }
        $stC = $pdo->prepare("SELECT COUNT(*) FROM `inquiries` i $where");
        $stC->execute($params);
        $total = (int)$stC->fetchColumn();

        $st = $pdo->prepare(
            "SELECT i.id, i.name, i.content, i.status, i.author_id, i.category_id,
                    c.name AS cat_name, i.created_at
             FROM `inquiries` i
             LEFT JOIN `inquiry_categories` c ON c.id = i.category_id
             $where ORDER BY i.id DESC LIMIT $limit OFFSET $offset"
        );
        $st->execute($params);
        $rows = $st->fetchAll();

        $items = array_map(function($r) {
            $lines = explode("\n", trim($r['content']));
            $title = mb_strimwidth(trim($lines[0]), 0, 80, '...');
            return [
                'id'          => (int)$r['id'],
                'title'       => $title,
                'cat_name'    => $r['cat_name'] ?? '',
                'author_name' => $r['name'],
                'author_id'   => $r['author_id'],
                'status'      => statusLabel($r['status']),
                'created_at'  => $r['created_at'],
                'is_mine'     => false,
            ];
        }, $rows);

        echo json_encode(['ok' => true, 'items' => $items, 'total' => $total, 'pages' => (int)ceil($total / $limit)]);
        exit;
    }

    $where  = 'WHERE i.author_id = ?';
    $params = [$user['id']];

    if ($kw) {
        $where .= ' AND (i.name LIKE ? OR i.content LIKE ?)';
        $params[] = "%$kw%";
        $params[] = "%$kw%";
    }

    $stC = $pdo->prepare("SELECT COUNT(*) FROM `inquiries` i $where");
    $stC->execute($params);
    $total = (int)$stC->fetchColumn();

    /* ── cat_name JOIN 추가 ── */
    $st = $pdo->prepare(
        "SELECT i.id, i.name, i.phone, i.content, i.status, i.author_id, i.category_id,
                c.name AS cat_name, i.created_at
         FROM `inquiries` i
         LEFT JOIN `inquiry_categories` c ON c.id = i.category_id
         $where ORDER BY i.id DESC LIMIT $limit OFFSET $offset"
    );
    $st->execute($params);
    $rows = $st->fetchAll();

    $items = array_map(function($r) {
        $lines = explode("\n", trim($r['content']));
        $title = mb_strimwidth(trim($lines[0]), 0, 80, '...');
        return [
            'id'          => (int)$r['id'],
            'title'       => $title,
            'cat_name'    => $r['cat_name'] ?? '',   // ← 분류명
            'author_name' => $r['name'],
            'author_id'   => $r['author_id'],
            'status'      => statusLabel($r['status']),
            'created_at'  => $r['created_at'],
            'is_mine'     => true,
        ];
    }, $rows);

    echo json_encode(['ok' => true, 'items' => $items, 'total' => $total, 'pages' => (int)ceil($total / $limit)]);
    exit;
}

/* ══ 단건 조회 ══ */
if ($method === 'GET' && isset($_GET['id'])) {
    $id = (int)$_GET['id'];
    if (!$user) { echo json_encode(['ok' => false, 'error' => '로그인 필요']); exit; }

    /* ── cat_name JOIN 추가 ── */
    $st = $pdo->prepare(
        "SELECT i.*, c.name AS cat_name
         FROM `inquiries` i
         LEFT JOIN `inquiry_categories` c ON c.id = i.category_id
         WHERE i.id=?"
    );
    $st->execute([$id]);
    $post = $st->fetch();
    if (!$post) { echo json_encode(['ok' => false, 'error' => '없는 게시글']); exit; }

    if ($post['author_id'] !== $user['id']) {
        echo json_encode(['ok' => false, 'error' => '본인 글만 확인 가능합니다.']); exit;
    }

    $answers = [];
    try {
        $stA = $pdo->prepare("SELECT id, inquiry_id, content, created_at, updated_at FROM `inquiry_answers` WHERE inquiry_id=? ORDER BY id ASC");
        $stA->execute([$id]);
        $answers = array_map(function($a) {
            return [
                'id'          => $a['id'],
                'post_id'     => $a['inquiry_id'],
                'author_id'   => 'admin',
                'author_name' => '관리자',
                'is_admin'    => 1,
                'content'     => $a['content'],
                'created_at'  => $a['created_at'],
                'updated_at'  => $a['updated_at'] ?? null,
            ];
        }, $stA->fetchAll());
    } catch (Exception $e) {}

    $comments = [];
    try {
        $stC = $pdo->prepare("SELECT * FROM `bp_qna_comments` WHERE post_id=? ORDER BY id ASC");
        $stC->execute([$id]);
        $comments = array_map(function($c) {
            return [
                'id'          => $c['id'],
                'post_id'     => $c['post_id'],
                'author_id'   => $c['author_id'],
                'author_name' => $c['author_name'],
                'is_admin'    => (int)($c['is_admin'] ?? 0),
                'content'     => $c['content'],
                'created_at'  => $c['created_at'],
                'updated_at'  => $c['updated_at'] ?? null,
            ];
        }, $stC->fetchAll());
    } catch (Exception $e) {}

    $lines = explode("\n", trim($post['content']));
    $title = mb_strimwidth(trim($lines[0]), 0, 80, '...');

    $post['title']    = $title;
    $post['cat_name'] = $post['cat_name'] ?? '';   // ← 분류명
    $post['is_mine']  = true;
    $post['answers']  = $answers;
    $post['comments'] = $comments;
    $post['status']   = statusLabel($post['status']);

    echo json_encode(['ok' => true, 'item' => $post]);
    exit;
}

/* ══ 등록 ══ */
if ($method === 'POST') {
    if (!$user) { echo json_encode(['ok' => false, 'error' => '로그인 필요']); exit; }
    $input      = json_decode(file_get_contents('php://input'), true) ?: [];
    $title      = trim($input['title']       ?? '');
    $content    = trim($input['content']     ?? '');
    $phone      = trim($input['phone']       ?? '');
    $categoryId = (int)($input['category_id'] ?? 0) ?: null;  // ← 분류 ID 받기

    if (!$title || !$content) { echo json_encode(['ok' => false, 'error' => '제목과 내용을 입력하세요.']); exit; }

    $fullContent = $title . "\n" . $content;

    /* ── category_id 저장 추가 ── */
    $pdo->prepare("INSERT INTO `inquiries` (category_id, name, phone, content, author_id, status) VALUES (?,?,?,?,?,'pending')")
        ->execute([$categoryId, $user['name'], $phone, $fullContent, $user['id']]);
    echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    exit;
}

/* ══ 삭제 ══ */
if ($method === 'DELETE' && isset($_GET['id'])) {
    if (!$user) { echo json_encode(['ok' => false, 'error' => '로그인 필요']); exit; }
    $id = (int)$_GET['id'];
    $st = $pdo->prepare("SELECT author_id FROM `inquiries` WHERE id=?");
    $st->execute([$id]); $post = $st->fetch();
    if (!$post || $post['author_id'] !== $user['id']) {
        echo json_encode(['ok' => false, 'error' => '권한 없음']); exit;
    }
    $pdo->prepare("DELETE FROM `inquiry_answers` WHERE inquiry_id=?")->execute([$id]);
    $pdo->prepare("DELETE FROM `inquiries` WHERE id=?")->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Unknown action']);