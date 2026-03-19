<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json; charset=utf-8');

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    echo json_encode(['ok' => false, 'msg' => "PHP Error [$errno]: $errstr in $errfile:$errline"]);
    exit;
});
set_exception_handler(function($e) {
    echo json_encode(['ok' => false, 'msg' => $e->getMessage()]);
    exit;
});

requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo    = getDB();

/* =====================================================
   BOARD (boards)
   ===================================================== */

if ($action === 'boardList') {
    // fields_json 컬럼 없으면 자동 추가
    try {
        $pdo->query('SELECT fields_json FROM boards LIMIT 1');
    } catch (Exception $e) {
        $pdo->exec('ALTER TABLE boards ADD COLUMN fields_json TEXT DEFAULT NULL');
    }

    $rows = $pdo->query(
        'SELECT id, name, table_name, is_active, sort_order, fields_json,
                use_category, use_comment, use_file, use_thumbnail, use_tags, use_social,
                DATE_FORMAT(created_at,"%Y-%m-%d") AS created_at
         FROM boards ORDER BY sort_order, id'
    )->fetchAll();

    // bp_ 테이블 누락된 경우 자동 생성
    foreach ($rows as $row) {
        $t = $row['table_name'];
        $exists = $pdo->query("SHOW TABLES LIKE 'bp_{$t}'")->fetch();
        if (!$exists) {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS `bp_{$t}` (
                  `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
                  `category_id` INT UNSIGNED DEFAULT NULL,
                  `title`       VARCHAR(500) NOT NULL,
                  `content`     LONGTEXT NOT NULL,
                  `author`      VARCHAR(100) NOT NULL DEFAULT '관리자',
                  `views`       INT UNSIGNED NOT NULL DEFAULT 0,
                  `extra`       LONGTEXT,
                  `is_visible`  TINYINT(1) NOT NULL DEFAULT 1,
                  `is_notice`   TINYINT(1) NOT NULL DEFAULT 0,
                  `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                  `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                  PRIMARY KEY (`id`)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            ");
        }
    }

    echo json_encode(['ok' => true, 'data' => $rows]);
    exit;
}

if ($action === 'boardCreate') {
    // fields_json 컬럼 없으면 자동 추가
    try { $pdo->query('SELECT fields_json FROM boards LIMIT 1'); }
    catch (Exception $e) { $pdo->exec('ALTER TABLE boards ADD COLUMN fields_json TEXT DEFAULT NULL'); }

    $name        = trim($_POST['name']        ?? '');
    $table_name  = trim($_POST['table_name']  ?? '');
    $fields_json = trim($_POST['fields']      ?? '[]');
    $sel_keys    = json_decode($_POST['selected_keys'] ?? '[]', true) ?: [];

    if ($name === '' || $table_name === '') {
        echo json_encode(['ok' => false, 'msg' => '게시판 이름과 테이블명을 입력하세요.']); exit;
    }
    if (!preg_match('/^[a-z0-9_]+$/', $table_name)) {
        echo json_encode(['ok' => false, 'msg' => '테이블명은 영문 소문자·숫자·언더스코어만 가능합니다.']); exit;
    }
    $ck = $pdo->prepare('SELECT id FROM boards WHERE table_name=?');
    $ck->execute([$table_name]);
    if ($ck->fetch()) { echo json_encode(['ok' => false, 'msg' => '이미 존재하는 테이블명입니다.']); exit; }

    // bp_ 테이블 동적 생성
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `bp_{$table_name}` (
          `id`          INT UNSIGNED NOT NULL AUTO_INCREMENT,
          `category_id` INT UNSIGNED DEFAULT NULL,
          `title`       VARCHAR(500) NOT NULL,
          `content`     LONGTEXT NOT NULL,
          `author`      VARCHAR(100) NOT NULL DEFAULT '관리자',
          `views`       INT UNSIGNED NOT NULL DEFAULT 0,
          `extra`       LONGTEXT,
          `is_visible`  TINYINT(1) NOT NULL DEFAULT 1,
          `is_notice`   TINYINT(1) NOT NULL DEFAULT 0,
          `created_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");

    $max          = $pdo->query('SELECT COALESCE(MAX(sort_order),0) FROM boards')->fetchColumn();
    $use_category = in_array('분류',        $sel_keys) ? 1 : 0;
    $use_comment  = in_array('댓글',        $sel_keys) ? 1 : 0;
    $use_file     = in_array('첨부파일',    $sel_keys) ? 1 : 0;
    $use_thumbnail= in_array('썸네일이미지',$sel_keys) ? 1 : 0;
    $use_tags     = in_array('태그',        $sel_keys) ? 1 : 0;
    $use_social   = in_array('소셜',        $sel_keys) ? 1 : 0;

    $pdo->prepare(
        'INSERT INTO boards (name, table_name, use_category, use_comment, use_file, use_thumbnail, use_tags, use_social, fields_json, sort_order)
         VALUES (?,?,?,?,?,?,?,?,?,?)'
    )->execute([$name, $table_name, $use_category, $use_comment, $use_file, $use_thumbnail, $use_tags, $use_social, $fields_json, $max + 1]);
    $board_id = (int)$pdo->lastInsertId();

    echo json_encode(['ok' => true, 'id' => $board_id]);
    exit;
}

if ($action === 'boardFieldsUpdate') {
    // 필드 탭에서 필드 추가/토글 시 저장
    $id          = (int)($_POST['id'] ?? 0);
    $fields_json = trim($_POST['fields'] ?? '[]');
    $sel_keys    = json_decode($_POST['selected_keys'] ?? '[]', true) ?: [];
    $use_category = in_array('분류',        $sel_keys) ? 1 : 0;
    $use_comment  = in_array('댓글',        $sel_keys) ? 1 : 0;
    $use_file     = in_array('첨부파일',    $sel_keys) ? 1 : 0;
    $use_thumbnail= in_array('썸네일이미지',$sel_keys) ? 1 : 0;
    $use_tags     = in_array('태그',        $sel_keys) ? 1 : 0;
    $use_social   = in_array('소셜',        $sel_keys) ? 1 : 0;
    $pdo->prepare(
        'UPDATE boards SET fields_json=?, use_category=?, use_comment=?, use_file=?, use_thumbnail=?, use_tags=?, use_social=? WHERE id=?'
    )->execute([$fields_json, $use_category, $use_comment, $use_file, $use_thumbnail, $use_tags, $use_social, $id]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'boardDelete') {
    $id = (int)($_POST['id'] ?? 0);
    $st = $pdo->prepare('SELECT table_name FROM boards WHERE id=?');
    $st->execute([$id]);
    $row = $st->fetch();
    if (!$row) { echo json_encode(['ok' => false, 'msg' => '없는 게시판']); exit; }
    $pdo->exec("DROP TABLE IF EXISTS `bp_{$row['table_name']}`");
    $pdo->prepare('DELETE FROM board_categories WHERE board_id=?')->execute([$id]);
    $pdo->prepare('DELETE FROM boards WHERE id=?')->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

/* =====================================================
   BOARD CATEGORY (board_categories)
   ===================================================== */

if ($action === 'catList') {
    $board_id = (int)($_GET['board_id'] ?? 0);
    $st = $pdo->prepare('SELECT id, name, is_active, sort_order FROM board_categories WHERE board_id=? ORDER BY sort_order, id');
    $st->execute([$board_id]);
    echo json_encode(['ok' => true, 'data' => $st->fetchAll()]);
    exit;
}

if ($action === 'catCreate') {
    $board_id = (int)($_POST['board_id'] ?? 0);
    $name     = trim($_POST['name'] ?? '');
    if (!$name) { echo json_encode(['ok' => false, 'msg' => '분류명을 입력하세요.']); exit; }
    $max = $pdo->prepare('SELECT COALESCE(MAX(sort_order),0) FROM board_categories WHERE board_id=?');
    $max->execute([$board_id]);
    $pdo->prepare('INSERT INTO board_categories (board_id, name, sort_order) VALUES (?,?,?)')
        ->execute([$board_id, $name, (int)$max->fetchColumn() + 1]);
    echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    exit;
}

if ($action === 'catUpdate') {
    $id   = (int)($_POST['id']   ?? 0);
    $name = trim($_POST['name']  ?? '');
    if (!$name) { echo json_encode(['ok' => false, 'msg' => '분류명을 입력하세요.']); exit; }
    $pdo->prepare('UPDATE board_categories SET name=? WHERE id=?')->execute([$name, $id]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'catToggle') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare('UPDATE board_categories SET is_active = 1-is_active WHERE id=?')->execute([$id]);
    $st = $pdo->prepare('SELECT is_active FROM board_categories WHERE id=?');
    $st->execute([$id]);
    echo json_encode(['ok' => true, 'is_active' => (int)$st->fetchColumn()]);
    exit;
}

if ($action === 'catDelete') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare('DELETE FROM board_categories WHERE id=?')->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

/* =====================================================
   BOARD POST (bp_{table_name})
   ===================================================== */

if ($action === 'postList') {
    $table  = preg_replace('/[^a-z0-9_]/', '', $_GET['table'] ?? '');
    $cat_id = (int)($_GET['cat_id'] ?? 0);
    $field  = $_GET['field'] ?? '';
    $kw     = trim($_GET['kw'] ?? '');

    $sql  = "SELECT p.id, p.category_id, c.name AS cat_name, p.title, p.author,
                    p.views, CAST(p.extra AS CHAR) AS extra, p.is_notice,
                    DATE_FORMAT(p.created_at,'%Y-%m-%d %H:%i') AS created_at,
                    DATE_FORMAT(p.updated_at,'%Y-%m-%d %H:%i') AS updated_at
             FROM `bp_{$table}` p
             LEFT JOIN board_categories c ON c.id = p.category_id
             WHERE 1=1";
    $params = [];
    if ($cat_id > 0) { $sql .= ' AND p.category_id=?'; $params[] = $cat_id; }
    if ($kw !== '') {
        if ($field === 'title')       { $sql .= ' AND p.title LIKE ?';   $params[] = "%$kw%"; }
        elseif ($field === 'content') { $sql .= ' AND p.content LIKE ?'; $params[] = "%$kw%"; }
        elseif ($field === 'author')  { $sql .= ' AND p.author LIKE ?';  $params[] = "%$kw%"; }
        else { $sql .= ' AND (p.title LIKE ? OR p.author LIKE ?)'; $params[] = "%$kw%"; $params[] = "%$kw%"; }
    }
    $sql .= ' ORDER BY p.is_notice DESC, p.id DESC';
    $st = $pdo->prepare($sql);
    $st->execute($params);
    $rows = $st->fetchAll();
    foreach ($rows as &$r) {
        $r['extra'] = $r['extra'] ? json_decode($r['extra'], true) : [];
    }
    echo json_encode(['ok' => true, 'data' => $rows]);
    exit;
}

if ($action === 'postGet') {
    $table = preg_replace('/[^a-z0-9_]/', '', $_GET['table'] ?? '');
    $id    = (int)($_GET['id'] ?? 0);
    $st    = $pdo->prepare("SELECT id, category_id, title, content, author, views, is_notice,
                                    CAST(extra AS CHAR) AS extra,
                                    DATE_FORMAT(created_at,'%Y-%m-%d %H:%i') AS created_at,
                                    DATE_FORMAT(updated_at,'%Y-%m-%d %H:%i') AS updated_at
                             FROM `bp_{$table}` WHERE id=?");
    $st->execute([$id]);
    $row = $st->fetch();
    if (!$row) { echo json_encode(['ok' => false, 'msg' => '없는 게시물']); exit; }
    $row['extra'] = $row['extra'] ? json_decode($row['extra'], true) : [];
    echo json_encode(['ok' => true, 'data' => $row]);
    exit;
}

if ($action === 'postCreate') {
    $table      = preg_replace('/[^a-z0-9_]/', '', $_POST['table'] ?? '');
    $title      = trim($_POST['title']   ?? '');
    $content    = trim($_POST['content'] ?? '');
    $author     = trim($_POST['author']  ?? '관리자');
    $cat_id     = (isset($_POST['category_id']) && $_POST['category_id'] !== '') ? (int)$_POST['category_id'] : null;
    $is_notice  = (int)($_POST['is_notice'] ?? 0);
    $extra      = $_POST['extra'] ?? '{}';
    $created_at = trim($_POST['created_at'] ?? '');
    if (!$title) { echo json_encode(['ok' => false, 'msg' => '제목을 입력하세요.']); exit; }
    if ($created_at && !preg_match('/^\d{4}-\d{2}-\d{2}/', $created_at)) $created_at = '';
    if ($created_at) {
        $pdo->prepare("INSERT INTO `bp_{$table}` (category_id, title, content, author, is_notice, extra, created_at) VALUES (?,?,?,?,?,?,?)")
            ->execute([$cat_id, $title, $content, $author, $is_notice, $extra, $created_at]);
    } else {
        $pdo->prepare("INSERT INTO `bp_{$table}` (category_id, title, content, author, is_notice, extra) VALUES (?,?,?,?,?,?)")
            ->execute([$cat_id, $title, $content, $author, $is_notice, $extra]);
    }
    echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    exit;
}

if ($action === 'postUpdate') {
    $table      = preg_replace('/[^a-z0-9_]/', '', $_POST['table'] ?? '');
    $id         = (int)($_POST['id'] ?? 0);
    $title      = trim($_POST['title']   ?? '');
    $content    = trim($_POST['content'] ?? '');
    $author     = trim($_POST['author']  ?? '관리자');
    $cat_id     = (isset($_POST['category_id']) && $_POST['category_id'] !== '') ? (int)$_POST['category_id'] : null;
    $is_notice  = (int)($_POST['is_notice'] ?? 0);
    $extra      = $_POST['extra'] ?? '{}';
    $created_at = trim($_POST['created_at'] ?? '');
    if (!$title) { echo json_encode(['ok' => false, 'msg' => '제목을 입력하세요.']); exit; }
    if ($created_at) {
        $pdo->prepare("UPDATE `bp_{$table}` SET category_id=?, title=?, content=?, author=?, is_notice=?, extra=?, created_at=? WHERE id=?")
            ->execute([$cat_id, $title, $content, $author, $is_notice, $extra, $created_at, $id]);
    } else {
        $pdo->prepare("UPDATE `bp_{$table}` SET category_id=?, title=?, content=?, author=?, is_notice=?, extra=? WHERE id=?")
            ->execute([$cat_id, $title, $content, $author, $is_notice, $extra, $id]);
    }
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'postDelete') {
    $table = preg_replace('/[^a-z0-9_]/', '', $_POST['table'] ?? '');
    $id    = (int)($_POST['id'] ?? 0);
    $pdo->prepare("DELETE FROM `bp_{$table}` WHERE id=?")->execute([$id]);
    $pdo->prepare("DELETE FROM board_comments WHERE post_id=?")->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'postBulkDelete') {
    $table = preg_replace('/[^a-z0-9_]/', '', $_POST['table'] ?? '');
    $ids   = json_decode($_POST['ids'] ?? '[]', true) ?: [];
    foreach ($ids as $id) {
        $id = (int)$id;
        $pdo->prepare("DELETE FROM `bp_{$table}` WHERE id=?")->execute([$id]);
        $pdo->prepare("DELETE FROM board_comments WHERE post_id=?")->execute([$id]);
    }
    echo json_encode(['ok' => true]);
    exit;
}

/* =====================================================
   COMMENT (board_comments)
   ===================================================== */

if ($action === 'commentList') {
    $post_id = (int)($_GET['post_id'] ?? 0);
    $st = $pdo->prepare(
        "SELECT id, author, content, is_visible,
                DATE_FORMAT(created_at,'%Y-%m-%d %H:%i') AS created_at
         FROM board_comments WHERE post_id=? ORDER BY id"
    );
    $st->execute([$post_id]);
    echo json_encode(['ok' => true, 'data' => $st->fetchAll()]);
    exit;
}

if ($action === 'commentCreate') {
    $post_id = (int)($_POST['post_id'] ?? 0);
    $author  = trim($_POST['author']  ?? '관리자');
    $content = trim($_POST['content'] ?? '');
    if (!$content) { echo json_encode(['ok' => false, 'msg' => '댓글 내용을 입력하세요.']); exit; }
    $pdo->prepare('INSERT INTO board_comments (post_id, author, content) VALUES (?,?,?)')
        ->execute([$post_id, $author, $content]);
    echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    exit;
}

if ($action === 'commentDelete') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare('DELETE FROM board_comments WHERE id=?')->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action']);