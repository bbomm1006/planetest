<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo    = getDB();

// ── 목록
if ($action === 'list') {
    $rows = $pdo->query('SELECT id, username, name, email, created_at FROM admins ORDER BY sort_order, id')->fetchAll();
    echo json_encode(['ok' => true, 'data' => $rows]);
    exit;
}

// ── 추가
if ($action === 'create') {
    $username = trim($_POST['username'] ?? '');
    $password = trim($_POST['password'] ?? '');
    $name     = trim($_POST['name']     ?? '');
    $email    = trim($_POST['email']    ?? '');

    if ($username === '' || $password === '' || $name === '') {
        echo json_encode(['ok' => false, 'msg' => '모든 항목을 입력하세요.']);
        exit;
    }

    // 중복 체크
    $ck = $pdo->prepare('SELECT id FROM admins WHERE username = ?');
    $ck->execute([$username]);
    if ($ck->fetch()) {
        echo json_encode(['ok' => false, 'msg' => '이미 사용 중인 아이디입니다.']);
        exit;
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare('INSERT INTO admins (username, password, name, email) VALUES (?, ?, ?, ?)');
    $stmt->execute([$username, $hash, $name, $email]);
    echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
    exit;
}

// ── 수정
if ($action === 'update') {
    $id       = (int)($_POST['id'] ?? 0);
    $name     = trim($_POST['name']     ?? '');
    $email    = trim($_POST['email']    ?? '');
    $password = trim($_POST['password'] ?? '');

    if ($id === 0 || $name === '') {
        echo json_encode(['ok' => false, 'msg' => '잘못된 요청입니다.']);
        exit;
    }

    if ($password !== '') {
        $hash = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare('UPDATE admins SET name = ?, email = ?, password = ? WHERE id = ?');
        $stmt->execute([$name, $email, $hash, $id]);
    } else {
        $stmt = $pdo->prepare('UPDATE admins SET name = ?, email = ? WHERE id = ?');
        $stmt->execute([$name, $email, $id]);
    }
    echo json_encode(['ok' => true]);
    exit;
}

// ── 삭제
if ($action === 'delete') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id === (int)currentAdmin()['id']) {
        echo json_encode(['ok' => false, 'msg' => '자신의 계정은 삭제할 수 없습니다.']);
        exit;
    }
    $pdo->prepare('DELETE FROM admins WHERE id = ?')->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

// ── 내 정보 수정 (비밀번호 포함)
if ($action === 'updateMyInfo') {
    $me      = currentAdmin();
    $name    = trim($_POST['name']        ?? '');
    $email   = trim($_POST['email']       ?? '');
    $curPw   = trim($_POST['current_pw']  ?? '');
    $newPw   = trim($_POST['new_pw']      ?? '');
    $newPw2  = trim($_POST['new_pw2']     ?? '');

    if ($name === '' || $curPw === '') {
        echo json_encode(['ok' => false, 'msg' => '이름과 현재 비밀번호를 입력하세요.']);
        exit;
    }

    $stmt = $pdo->prepare('SELECT password FROM admins WHERE id = ?');
    $stmt->execute([$me['id']]);
    $row = $stmt->fetch();
    if (!$row || !password_verify($curPw, $row['password'])) {
        echo json_encode(['ok' => false, 'msg' => '현재 비밀번호가 올바르지 않습니다.']);
        exit;
    }

    if ($newPw !== '') {
        if ($newPw !== $newPw2) {
            echo json_encode(['ok' => false, 'msg' => '새 비밀번호가 일치하지 않습니다.']);
            exit;
        }
        $hash = password_hash($newPw, PASSWORD_BCRYPT);
        $pdo->prepare('UPDATE admins SET name = ?, email = ?, password = ? WHERE id = ?')->execute([$name, $email, $hash, $me['id']]);
    } else {
        $pdo->prepare('UPDATE admins SET name = ?, email = ? WHERE id = ?')->execute([$name, $email, $me['id']]);
    }

    $_SESSION['admin_name'] = $name;
    echo json_encode(['ok' => true, 'name' => $name]);
    exit;
}

// ── 순서 저장
if ($action === 'reorder') {
    $ids = $_POST['ids'] ?? [];
    foreach ($ids as $i => $id) {
        $pdo->prepare('UPDATE admins SET sort_order = ? WHERE id = ?')->execute([$i, (int)$id]);
    }
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action']);