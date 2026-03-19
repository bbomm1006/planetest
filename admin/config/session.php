<?php
if (session_status() === PHP_SESSION_NONE) session_start();

function isLoggedIn(): bool {
    return !empty($_SESSION['admin_id']);
}

function requireLogin(): void {
    if (!isLoggedIn()) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'msg' => '로그인이 필요합니다.']);
        exit;
    }
}

function currentAdmin(): array {
    return [
        'id'       => $_SESSION['admin_id']    ?? 0,
        'username' => $_SESSION['admin_user']  ?? '',
        'name'     => $_SESSION['admin_name']  ?? '',
        'email'    => $_SESSION['admin_email'] ?? '',
    ];
}