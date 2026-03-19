<?php
/**
 * user_auth.php — 소셜 로그인 / 세션 / 로그아웃
 * POST /admin/api_front/user_auth.php        { provider, token }
 * GET  /admin/api_front/user_auth.php?action=status
 * POST /admin/api_front/user_auth.php?action=logout
 */
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');

if (session_status() === PHP_SESSION_NONE) session_start();

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

/* ══ 세션 상태 조회 ══ */
if ($action === 'status') {
    if (!empty($_SESSION['board_user'])) {
        echo json_encode(['ok' => true, 'loggedIn' => true, 'user' => $_SESSION['board_user']]);
    } else {
        echo json_encode(['ok' => true, 'loggedIn' => false]);
    }
    exit;
}

/* ══ 로그아웃 ══ */
if ($action === 'logout') {
    unset($_SESSION['board_user']);
    echo json_encode(['ok' => true]);
    exit;
}

/* ══ 소셜 로그인 ══ */
if ($method === 'POST') {
    $input    = json_decode(file_get_contents('php://input'), true) ?: [];
    $provider = trim($input['provider'] ?? '');
    $token    = trim($input['token']    ?? '');

    if (!$provider || !$token) {
        echo json_encode(['ok' => false, 'error' => '파라미터 오류']); exit;
    }

    $pdo = getDB();

    // social_links에서 API 키 조회
    $keys = $pdo->query('SELECT * FROM social_links WHERE id=1')->fetch();

    $userId = null; $userName = '';

    /* ── 카카오 ── */
    if ($provider === 'kakao') {
        $ch = curl_init('https://kapi.kakao.com/v2/user/me');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $token],
        ]);
        $r = curl_exec($ch);
        $curlErr = curl_error($ch);
        curl_close($ch);
        if (!$r || $curlErr) { echo json_encode(['ok' => false, 'error' => '카카오 API 오류: ' . $curlErr]); exit; }
        $info = json_decode($r, true);
        $userId   = 'kakao_' . ($info['id'] ?? '');
        $userName = $info['kakao_account']['profile']['nickname']
                 ?? $info['properties']['nickname']
                 ?? '카카오사용자';
    }

    /* ── 네이버 ── */
    elseif ($provider === 'naver') {
        $ch = curl_init('https://openapi.naver.com/v1/nid/me');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $token],
        ]);
        $r = curl_exec($ch);
        $curlErr = curl_error($ch);
        curl_close($ch);
        if (!$r || $curlErr) { echo json_encode(['ok' => false, 'error' => '네이버 API 오류: ' . $curlErr]); exit; }
        $info = json_decode($r, true);
        $userId   = 'naver_' . ($info['response']['id'] ?? '');
        $userName = $info['response']['name'] ?? $info['response']['nickname'] ?? '네이버사용자';
    }

    /* ── 구글 (JWT 검증) ── */
    elseif ($provider === 'google') {
        // ID 토큰 검증 (curl 사용)
        $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($token);
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $r = curl_exec($ch);
        $curlErr = curl_error($ch);
        curl_close($ch);
        if (!$r || $curlErr) { echo json_encode(['ok' => false, 'error' => '구글 API 오류: ' . $curlErr]); exit; }
        $info = json_decode($r, true);
        if (!empty($info['error'])) { echo json_encode(['ok' => false, 'error' => '구글 토큰 오류: ' . ($info['error_description'] ?? $info['error'])]); exit; }
        $userId   = 'google_' . ($info['sub'] ?? '');
        $userName = $info['name'] ?? $info['email'] ?? '구글사용자';
    }

    else {
        echo json_encode(['ok' => false, 'error' => '지원하지 않는 공급자']); exit;
    }

    if (!$userId) { echo json_encode(['ok' => false, 'error' => '사용자 정보 없음']); exit; }

    $user = ['id' => $userId, 'name' => $userName, 'provider' => $provider];
    $_SESSION['board_user'] = $user;

    echo json_encode(['ok' => true, 'user' => $user]);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Unknown action']);