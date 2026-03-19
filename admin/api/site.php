<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo    = getDB();

// 테이블 없으면 자동 생성
$pdo->exec("CREATE TABLE IF NOT EXISTS site (
  id           INT(10) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  header_logo  VARCHAR(500) DEFAULT '',
  footer_logo  VARCHAR(500) DEFAULT '',
  footer_copy  TEXT,
  tel          VARCHAR(100) DEFAULT '',
  hours        VARCHAR(200) DEFAULT '',
  address      VARCHAR(300) DEFAULT '',
  copyright    VARCHAR(300) DEFAULT '',
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)");

// row 없으면 기본 삽입
$cnt = $pdo->query('SELECT COUNT(*) FROM site')->fetchColumn();
if ($cnt == 0) $pdo->exec('INSERT INTO site (id) VALUES (1)');

// ── 조회
if ($action === 'get') {
    $row = $pdo->query('SELECT * FROM site WHERE id = 1')->fetch();
    echo json_encode(['ok' => true, 'data' => $row]);
    exit;
}

// ── 저장
if ($action === 'save') {
    $footer_copy = $_POST['footer_copy'] ?? '';
    $tel         = $_POST['tel']         ?? '';
    $hours       = $_POST['hours']       ?? '';
    $address     = $_POST['address']     ?? '';
    $copyright   = $_POST['copyright']   ?? '';

    $header_logo = null;
    $footer_logo = null;

    $uploadDir = __DIR__ . '/../uploads/site/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    foreach (['header_logo', 'footer_logo'] as $field) {
        if (!empty($_FILES[$field]['tmp_name'])) {
            $ext  = pathinfo($_FILES[$field]['name'], PATHINFO_EXTENSION);
            $fname = $field . '_' . time() . '.' . $ext;
            move_uploaded_file($_FILES[$field]['tmp_name'], $uploadDir . $fname);
            $$field = '/uploads/site/' . $fname;
        }
    }

    // 로고는 파일 올린 경우만 업데이트
    if ($header_logo && $footer_logo) {
        $stmt = $pdo->prepare('UPDATE site SET header_logo=?, footer_logo=?, footer_copy=?, tel=?, hours=?, address=?, copyright=? WHERE id=1');
        $stmt->execute([$header_logo, $footer_logo, $footer_copy, $tel, $hours, $address, $copyright]);
    } elseif ($header_logo) {
        $stmt = $pdo->prepare('UPDATE site SET header_logo=?, footer_copy=?, tel=?, hours=?, address=?, copyright=? WHERE id=1');
        $stmt->execute([$header_logo, $footer_copy, $tel, $hours, $address, $copyright]);
    } elseif ($footer_logo) {
        $stmt = $pdo->prepare('UPDATE site SET footer_logo=?, footer_copy=?, tel=?, hours=?, address=?, copyright=? WHERE id=1');
        $stmt->execute([$footer_logo, $footer_copy, $tel, $hours, $address, $copyright]);
    } else {
        $stmt = $pdo->prepare('UPDATE site SET footer_copy=?, tel=?, hours=?, address=?, copyright=? WHERE id=1');
        $stmt->execute([$footer_copy, $tel, $hours, $address, $copyright]);
    }

    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action']);