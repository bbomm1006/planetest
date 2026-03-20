<?php
/**
 * naver_callback.php — 네이버 로그인 OAuth 콜백
 * 네이버 콘솔 Callback URL: https://[이 도메인]/sns/naver_callback.php
 */
require_once __DIR__ . '/../admin/config/db.php';
require_once __DIR__ . '/../admin/config/log_helper.php';

if (session_status() === PHP_SESSION_NONE) session_start();

$pdo   = getDB();
$code  = trim($_GET['code']  ?? '');
$state = trim($_GET['state'] ?? ''); // table_name (폼 식별용)
$error = trim($_GET['error'] ?? '');

// 에러 응답 처리
if ($error) {
    $msg = urlencode('네이버 로그인이 취소되었습니다.');
    header("Location: /?ci_login_error={$msg}&ci_table={$state}");
    exit;
}

if (!$code) {
    $msg = urlencode('잘못된 접근입니다.');
    header("Location: /?ci_login_error={$msg}&ci_table={$state}");
    exit;
}

// Client ID / Secret 조회
$row          = $pdo->query('SELECT naver_client_id, naver_client_secret FROM social_links WHERE id=1')->fetch();
$clientId     = $row['naver_client_id']     ?? '';
$clientSecret = $row['naver_client_secret'] ?? '';

if (!$clientId || !$clientSecret) {
    $msg = urlencode('네이버 앱 키가 설정되지 않았습니다.');
    header("Location: /?ci_login_error={$msg}&ci_table={$state}");
    exit;
}

$redirectUri = 'https://' . $_SERVER['HTTP_HOST'] . '/sns/naver_callback.php';

// 1) 액세스 토큰 발급
$tokenUrl = 'https://nid.naver.com/oauth2.0/token?' . http_build_query([
    'grant_type'    => 'authorization_code',
    'client_id'     => $clientId,
    'client_secret' => $clientSecret,
    'redirect_uri'  => $redirectUri,
    'code'          => $code,
    'state'         => $state,
]);

$ch = curl_init($tokenUrl);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 10,
    CURLOPT_SSL_VERIFYPEER => true,
]);
$tokenRes = curl_exec($ch);
$curlErr  = curl_error($ch);
curl_close($ch);

if (!$tokenRes || $curlErr) {
    $msg = urlencode('네이버 토큰 발급 실패: ' . $curlErr);
    header("Location: /?ci_login_error={$msg}&ci_table={$state}");
    exit;
}

$tokenData   = json_decode($tokenRes, true);
$accessToken = $tokenData['access_token'] ?? '';

if (!$accessToken) {
    $msg = urlencode('네이버 토큰 오류: ' . ($tokenData['error_description'] ?? $tokenData['error'] ?? ''));
    header("Location: /?ci_login_error={$msg}&ci_table={$state}");
    exit;
}

// 2) 사용자 정보 조회
$ch = curl_init('https://openapi.naver.com/v1/nid/me');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $accessToken],
    CURLOPT_TIMEOUT        => 10,
    CURLOPT_SSL_VERIFYPEER => true,
]);
$userRes  = curl_exec($ch);
curl_close($ch);

$userInfo = json_decode($userRes, true);
$naverId  = $userInfo['response']['id']   ?? '';
$userName = $userInfo['response']['name'] ?? $userInfo['response']['nickname'] ?? '네이버사용자';

if (!$naverId) {
    $msg = urlencode('네이버 사용자 정보를 가져올 수 없습니다.');
    header("Location: /?ci_login_error={$msg}&ci_table={$state}");
    exit;
}

// 3) 세션 저장 (기존 세션 초기화 후 새 계정으로 저장)
$userId = 'naver_' . $naverId;
$user   = ['id' => $userId, 'name' => $userName, 'provider' => 'naver'];
unset($_SESSION['board_user']);
session_regenerate_id(true);
$_SESSION['board_user'] = $user;

logLogin($pdo, 'naver', $userId, $userName, 'success');

// 4) 원래 페이지로 복귀
$anchor = $state ? '#ci-section-' . preg_replace('/[^a-z0-9_]/', '', $state) : '';
header("Location: /{$anchor}");
exit;
