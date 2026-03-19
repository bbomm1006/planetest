<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json; charset=utf-8');
requireLogin();

// 업로드 디렉토리 — index.php 기준 상대경로
define('UPLOAD_DIR',  __DIR__ . '/../../uploads/admin/');
define('UPLOAD_URL',  '../uploads/admin/');   // 브라우저에서 접근할 경로 (admin/ 폴더 기준)

if (!is_dir(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

if (!isset($_FILES['file'])) {
    echo json_encode(['ok' => false, 'msg' => '파일이 없습니다.']);
    exit;
}

$file    = $_FILES['file'];
$allowed = ['image/jpeg','image/png','image/gif','image/webp'];

if (!in_array($file['type'], $allowed)) {
    echo json_encode(['ok' => false, 'msg' => '이미지 파일만 업로드 가능합니다.']);
    exit;
}

if ($file['size'] > 10 * 1024 * 1024) {
    echo json_encode(['ok' => false, 'msg' => '파일 크기는 10MB 이하여야 합니다.']);
    exit;
}

$ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = date('YmdHis') . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$destPath = UPLOAD_DIR . $filename;

if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    echo json_encode(['ok' => false, 'msg' => '업로드 실패']);
    exit;
}

echo json_encode([
    'ok'   => true,
    'url'  => UPLOAD_URL . $filename,   // DB에 저장할 경로
    'name' => $filename,
]);