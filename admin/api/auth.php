<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json; charset=utf-8');
$action = $_POST['action'] ?? $_GET['action'] ?? '';

// ── 로그인
if ($action === 'login') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');

    if ($username === '' || $password === '') {
        echo json_encode(['ok' => false, 'msg' => '아이디와 비밀번호를 입력하세요.']);
        exit;
    }

    $pdo  = getDB();
    $stmt = $pdo->prepare('SELECT id, username, name, email, password FROM admins WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($password, $admin['password'])) {
        echo json_encode(['ok' => false, 'msg' => '아이디 또는 비밀번호가 올바르지 않습니다.']);
        exit;
    }

    session_regenerate_id(true);
    $_SESSION['admin_id']    = $admin['id'];
    $_SESSION['admin_user']  = $admin['username'];
    $_SESSION['admin_name']  = $admin['name'];
    $_SESSION['admin_email'] = $admin['email'];

    echo json_encode(['ok' => true, 'name' => $admin['name'], 'username' => $admin['username'], 'email' => $admin['email']]);
    exit;
}

// ── 로그아웃
if ($action === 'logout') {
    $_SESSION = [];
    session_destroy();
    echo json_encode(['ok' => true]);
    exit;
}

// ── 세션 확인 (페이지 로드 시)
if ($action === 'check') {
    if (isLoggedIn()) {
        $a = currentAdmin();
        echo json_encode(['ok' => true, 'name' => $a['name'], 'username' => $a['username'], 'email' => $a['email'] ?? '']);
    } else {
        echo json_encode(['ok' => false]);
    }
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action']);