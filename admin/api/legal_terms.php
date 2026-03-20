<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/log_helper.php';

$_ltb = __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'lib' . DIRECTORY_SEPARATOR . 'legal_terms_bootstrap.php';
if (!is_readable($_ltb)) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array('ok' => false, 'msg' => 'legal_terms_bootstrap.php 를 찾을 수 없습니다. admin/lib 폴더를 업로드했는지 확인하세요.'));
    exit;
}
require_once $_ltb;

header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action = isset($_POST['action']) ? $_POST['action'] : (isset($_GET['action']) ? $_GET['action'] : '');
$pdo    = getDB();

legal_terms_ensure_tables($pdo);

function legal_slug_ok($s)
{
    return (bool) preg_match('/^[a-z0-9][a-z0-9\-_]{0,98}$/i', $s);
}

/* category */
if ($action === 'cat_list') {
    $rows = $pdo->query(
        'SELECT c.id, c.name, c.slug, c.sort_order, c.is_active,
                (SELECT COUNT(*) FROM legal_term_versions v WHERE v.category_id = c.id) AS ver_count
         FROM legal_term_categories c
         ORDER BY c.sort_order ASC, c.id ASC'
    )->fetchAll();
    echo json_encode(array('ok' => true, 'data' => $rows), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'cat_save') {
    $id         = isset($_POST['id']) ? (int) $_POST['id'] : 0;
    $name       = trim(isset($_POST['name']) ? $_POST['name'] : '');
    $slug       = trim(isset($_POST['slug']) ? $_POST['slug'] : '');
    $sort_order = isset($_POST['sort_order']) ? (int) $_POST['sort_order'] : 0;
    $is_active  = (isset($_POST['is_active']) ? (int) $_POST['is_active'] : 1) ? 1 : 0;

    if ($name === '' || $slug === '') {
        echo json_encode(array('ok' => false, 'msg' => '이름과 슬러그를 입력하세요.'));
        exit;
    }
    if (!legal_slug_ok($slug)) {
        echo json_encode(array('ok' => false, 'msg' => '슬러그는 영문·숫자·하이픈·밑줄만 사용하세요.'));
        exit;
    }

    if ($id > 0) {
        $chk = $pdo->prepare('SELECT id FROM legal_term_categories WHERE slug = ? AND id != ?');
        $chk->execute(array($slug, $id));
        if ($chk->fetch()) {
            echo json_encode(array('ok' => false, 'msg' => '이미 사용 중인 슬러그입니다.'));
            exit;
        }
        $pdo->prepare(
            'UPDATE legal_term_categories SET name=?, slug=?, sort_order=?, is_active=? WHERE id=?'
        )->execute(array($name, $slug, $sort_order, $is_active, $id));
    } else {
        $chk = $pdo->prepare('SELECT id FROM legal_term_categories WHERE slug = ?');
        $chk->execute(array($slug));
        if ($chk->fetch()) {
            echo json_encode(array('ok' => false, 'msg' => '이미 사용 중인 슬러그입니다.'));
            exit;
        }
        $pdo->prepare(
            'INSERT INTO legal_term_categories (name, slug, sort_order, is_active) VALUES (?,?,?,?)'
        )->execute(array($name, $slug, $sort_order, $is_active));
    }
    logAdminAction($pdo, 'update', 'legal_term_categories', '');
    echo json_encode(array('ok' => true));
    exit;
}

if ($action === 'cat_visibility_save') {
    $raw = isset($_POST['items']) ? $_POST['items'] : '';
    $items = json_decode($raw, true);
    if (!is_array($items)) {
        echo json_encode(array('ok' => false, 'msg' => 'items(JSON)가 필요합니다.'));
        exit;
    }
    $st = $pdo->prepare('UPDATE legal_term_categories SET is_active = ? WHERE id = ?');
    foreach ($items as $it) {
        $id = isset($it['id']) ? (int) $it['id'] : 0;
        if ($id < 1) {
            continue;
        }
        $active = (!empty($it['is_active'])) ? 1 : 0;
        $st->execute(array($active, $id));
    }
    logAdminAction($pdo, 'update', 'legal_term_categories', 'visibility');
    echo json_encode(array('ok' => true));
    exit;
}

if ($action === 'ver_visibility_save') {
    $cid = isset($_POST['category_id']) ? (int) $_POST['category_id'] : 0;
    if ($cid < 1) {
        echo json_encode(array('ok' => false, 'msg' => 'category_id가 필요합니다.'));
        exit;
    }
    $raw = isset($_POST['items']) ? $_POST['items'] : '';
    $items = json_decode($raw, true);
    if (!is_array($items)) {
        echo json_encode(array('ok' => false, 'msg' => 'items(JSON)가 필요합니다.'));
        exit;
    }
    $st = $pdo->prepare('UPDATE legal_term_versions SET is_visible = ? WHERE id = ? AND category_id = ?');
    foreach ($items as $it) {
        $vid = isset($it['id']) ? (int) $it['id'] : 0;
        if ($vid < 1) {
            continue;
        }
        $vis = (!empty($it['is_visible'])) ? 1 : 0;
        $st->execute(array($vis, $vid, $cid));
    }
    logAdminAction($pdo, 'update', 'legal_term_versions', 'visibility');
    echo json_encode(array('ok' => true));
    exit;
}

if ($action === 'cat_delete') {
    $id = isset($_POST['id']) ? (int) $_POST['id'] : 0;
    if ($id < 1) {
        echo json_encode(array('ok' => false, 'msg' => '잘못된 요청입니다.'));
        exit;
    }
    $pdo->prepare('DELETE FROM legal_term_versions WHERE category_id = ?')->execute(array($id));
    $pdo->prepare('DELETE FROM legal_term_categories WHERE id = ?')->execute(array($id));
    logAdminAction($pdo, 'delete', 'legal_term_categories', '');
    echo json_encode(array('ok' => true));
    exit;
}

/* versions */
if ($action === 'ver_list') {
    $cid = isset($_GET['category_id']) ? (int) $_GET['category_id'] : (isset($_POST['category_id']) ? (int) $_POST['category_id'] : 0);
    if ($cid < 1) {
        echo json_encode(array('ok' => false, 'msg' => 'category_id가 필요합니다.'));
        exit;
    }
    $st = $pdo->prepare(
        'SELECT id, category_id, version_label, body, effective_date, is_active, is_visible, sort_order,
                DATE_FORMAT(effective_date, "%Y-%m-%d") AS effective_date_fmt
         FROM legal_term_versions WHERE category_id = ?
         ORDER BY effective_date DESC, sort_order DESC, id DESC'
    );
    $st->execute(array($cid));
    $rows = $st->fetchAll();
    foreach ($rows as &$r) {
        $r['effective_date'] = isset($r['effective_date_fmt']) ? $r['effective_date_fmt'] : $r['effective_date'];
        unset($r['effective_date_fmt']);
    }
    echo json_encode(array('ok' => true, 'data' => $rows), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'ver_save') {
    $id            = isset($_POST['id']) ? (int) $_POST['id'] : 0;
    $category_id   = isset($_POST['category_id']) ? (int) $_POST['category_id'] : 0;
    $version_label = trim(isset($_POST['version_label']) ? $_POST['version_label'] : '');
    $body          = isset($_POST['body']) ? $_POST['body'] : '';
    $effective_raw = trim(isset($_POST['effective_date']) ? $_POST['effective_date'] : '');
    $is_active     = (isset($_POST['is_active']) ? (int) $_POST['is_active'] : 0) ? 1 : 0;
    $is_visible    = (isset($_POST['is_visible']) ? (int) $_POST['is_visible'] : 1) ? 1 : 0;
    $sort_order    = isset($_POST['sort_order']) ? (int) $_POST['sort_order'] : 0;

    if ($category_id < 1 || $version_label === '') {
        echo json_encode(array('ok' => false, 'msg' => '카테고리와 버전명을 입력하세요.'));
        exit;
    }

    $effective_date = null;
    if ($effective_raw !== '') {
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $effective_raw)) {
            echo json_encode(array('ok' => false, 'msg' => '실행일 형식이 올바르지 않습니다.'));
            exit;
        }
        $effective_date = $effective_raw;
    }

    if ($id > 0) {
        $own = $pdo->prepare('SELECT category_id FROM legal_term_versions WHERE id = ?');
        $own->execute(array($id));
        $row = $own->fetch();
        if (!$row || (int) $row['category_id'] !== $category_id) {
            echo json_encode(array('ok' => false, 'msg' => '버전을 찾을 수 없습니다.'));
            exit;
        }
    }

    if ($is_active) {
        $pdo->prepare('UPDATE legal_term_versions SET is_active = 0 WHERE category_id = ?')->execute(array($category_id));
    }

    if ($id > 0) {
        $pdo->prepare(
            'UPDATE legal_term_versions SET version_label=?, body=?, effective_date=?, is_active=?, is_visible=?, sort_order=?
             WHERE id=? AND category_id=?'
        )->execute(array($version_label, $body, $effective_date, $is_active, $is_visible, $sort_order, $id, $category_id));
    } else {
        $pdo->prepare(
            'INSERT INTO legal_term_versions (category_id, version_label, body, effective_date, is_active, is_visible, sort_order)
             VALUES (?,?,?,?,?,?,?)'
        )->execute(array($category_id, $version_label, $body, $effective_date, $is_active, $is_visible, $sort_order));
    }
    logAdminAction($pdo, 'update', 'legal_term_versions', '');
    echo json_encode(array('ok' => true));
    exit;
}

if ($action === 'ver_delete') {
    $id = isset($_POST['id']) ? (int) $_POST['id'] : 0;
    if ($id < 1) {
        echo json_encode(array('ok' => false, 'msg' => '잘못된 요청입니다.'));
        exit;
    }
    $pdo->prepare('DELETE FROM legal_term_versions WHERE id = ?')->execute(array($id));
    logAdminAction($pdo, 'delete', 'legal_term_versions', '');
    echo json_encode(array('ok' => true));
    exit;
}

echo json_encode(array('ok' => false, 'msg' => 'Unknown action'));
