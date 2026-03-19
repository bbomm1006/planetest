<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo    = getDB();

// 테이블 없으면 자동 생성
$pdo->exec("CREATE TABLE IF NOT EXISTS homepage_info (
  id           INT(11) NOT NULL AUTO_INCREMENT,
  title        VARCHAR(255)  DEFAULT NULL,
  description  VARCHAR(500)  DEFAULT NULL,
  og_image     VARCHAR(500)  DEFAULT NULL,
  favicon      VARCHAR(500)  DEFAULT NULL,
  header_logo  VARCHAR(500)  DEFAULT NULL,
  footer_logo  VARCHAR(500)  DEFAULT NULL,
  footer_copy  VARCHAR(500)  DEFAULT NULL,
  copyright    VARCHAR(500)  DEFAULT NULL,
  phone        VARCHAR(50)   DEFAULT NULL,
  hours1       VARCHAR(255)  DEFAULT NULL,
  hours2       VARCHAR(255)  DEFAULT NULL,
  address      TEXT          DEFAULT NULL,
  sns          JSON          DEFAULT NULL,
  updated_at   DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// row 없으면 기본 삽입
$cnt = $pdo->query('SELECT COUNT(*) FROM homepage_info')->fetchColumn();
if ($cnt == 0) $pdo->exec('INSERT INTO homepage_info (id) VALUES (1)');

// ── GET ──────────────────────────────────────────────
if ($action === 'get') {
    $row = $pdo->query("SELECT id, title, description, og_image, favicon,
        header_logo, footer_logo, footer_copy, copyright,
        phone, hours1, hours2, address,
        CAST(sns AS CHAR) as sns
        FROM homepage_info WHERE id=1")->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $row['sns'] = $row['sns'] ? json_decode($row['sns'], true) : [];
    }
    echo json_encode(['ok' => true, 'data' => $row]);
    exit;
}

// ── 저장 ─────────────────────────────────────────────
if ($action === 'save') {

    function uploadImg($key, $oldPath = '') {
        if (empty($_FILES[$key]['tmp_name'])) return $oldPath;
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico'];
        $ext  = strtolower(pathinfo($_FILES[$key]['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $allowed)) return $oldPath;
        $name = uniqid('hpinfo_') . '.' . $ext;
        $dest = '/www_root/uploads/homepage_info/' . $name;
        if (!is_dir(dirname($dest))) mkdir(dirname($dest), 0755, true);
        move_uploaded_file($_FILES[$key]['tmp_name'], $dest);
        return '/uploads/homepage_info/' . $name;
    }

    $old = $pdo->query("SELECT og_image, favicon, header_logo, footer_logo FROM homepage_info WHERE id=1")->fetch(PDO::FETCH_ASSOC);

    $og_image    = uploadImg('og_image',    $old['og_image']    ?? '');
    $favicon     = uploadImg('favicon',     $old['favicon']     ?? '');
    $header_logo = uploadImg('header_logo', $old['header_logo'] ?? '');
    $footer_logo = uploadImg('footer_logo', $old['footer_logo'] ?? '');

    $snsRaw = $_POST['sns'] ?? '[]';
    $sns    = json_decode($snsRaw, true) ?: [];

    $stmt = $pdo->prepare("UPDATE homepage_info SET
        title=?, description=?, og_image=?, favicon=?,
        header_logo=?, footer_logo=?,
        footer_copy=?, copyright=?,
        phone=?, hours1=?, hours2=?, address=?,
        sns=?
        WHERE id=1");

    $stmt->execute([
        $_POST['title']       ?? '',
        $_POST['description'] ?? '',
        $og_image,
        $favicon,
        $header_logo,
        $footer_logo,
        $_POST['footer_copy'] ?? '',
        $_POST['copyright']   ?? '',
        $_POST['phone']       ?? '',
        $_POST['hours1']      ?? '',
        $_POST['hours2']      ?? '',
        $_POST['address']     ?? '',
        json_encode($sns, JSON_UNESCAPED_UNICODE),
    ]);

    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'unknown action']);