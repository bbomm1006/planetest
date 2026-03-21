<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/log_helper.php';

$_ltb = __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'lib' . DIRECTORY_SEPARATOR . 'legal_terms_bootstrap.php';
if (!is_readable($_ltb)) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(array('ok' => false, 'msg' => 'legal_terms_bootstrap.php 를 찾을 수 없습니다.'));
    exit;
}
require_once $_ltb;

header('Content-Type: application/json; charset=utf-8');

$pdo = getDB();
// logAccess($pdo);
logLanding($pdo);
legal_terms_ensure_tables($pdo);

$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($action === 'footer') {
    $rows = $pdo->query(
        'SELECT name, slug FROM legal_term_categories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    )->fetchAll();
    echo json_encode(array('ok' => true, 'items' => $rows), JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'document') {
    $slug = trim(isset($_GET['slug']) ? $_GET['slug'] : '');
    $slug = preg_replace('/[^a-zA-Z0-9\-_]/', '', $slug);
    if ($slug === '') {
        echo json_encode(array('ok' => false, 'msg' => 'slug이 필요합니다.'));
        exit;
    }

    $st = $pdo->prepare('SELECT id, name, slug FROM legal_term_categories WHERE slug = ? AND is_active = 1 LIMIT 1');
    $st->execute(array($slug));
    $cat = $st->fetch();
    if (!$cat) {
        echo json_encode(array('ok' => false, 'msg' => '약관을 찾을 수 없습니다.'));
        exit;
    }

    $st = $pdo->prepare(
        'SELECT id, version_label, body, effective_date, is_active,
                DATE_FORMAT(effective_date, "%Y-%m-%d") AS eff
         FROM legal_term_versions WHERE category_id = ? AND is_visible = 1
         ORDER BY effective_date DESC, sort_order DESC, id DESC'
    );
    $st->execute(array((int) $cat['id']));
    $vers = $st->fetchAll();
    foreach ($vers as &$v) {
        $v['effective_date'] = !empty($v['eff']) ? $v['eff'] : $v['effective_date'];
        unset($v['eff']);
    }

    $wantVid = isset($_GET['version_id']) ? (int) $_GET['version_id'] : 0;
    $current = null;
    if ($wantVid > 0) {
        foreach ($vers as $v) {
            if ((int) $v['id'] === $wantVid) {
                $current = $v;
                break;
            }
        }
    }
    if (!$current && count($vers)) {
        foreach ($vers as $v) {
            if ((int) $v['is_active'] === 1) {
                $current = $v;
                break;
            }
        }
    }
    if (!$current && count($vers)) {
        $current = $vers[0];
    }

    $list = array_map(function ($v) {
        return array(
            'id'              => (int) $v['id'],
            'version_label'   => $v['version_label'],
            'effective_date'  => $v['effective_date'],
            'is_active'       => (int) $v['is_active'],
        );
    }, $vers);

    echo json_encode(array(
        'ok'       => true,
        'category' => array('name' => $cat['name'], 'slug' => $cat['slug']),
        'versions' => $list,
        'current'  => $current ? array(
            'id'             => (int) $current['id'],
            'version_label'  => $current['version_label'],
            'effective_date' => $current['effective_date'],
            'body'           => $current['body'],
        ) : null,
    ), JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode(array('ok' => false, 'msg' => 'Unknown action'));
