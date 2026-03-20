<?php
/**
 * kakao_callback.php — 카카오 로그인 OAuth 콜백
 * 카카오 콘솔 Redirect URI: https://[이 도메인]/sns/kakao_callback.php
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
    $msg = urlencode('카카오 로그인이 취소되었습니다.');
    header("Location: /?ci_login_error={$msg}&ci_table={$state}");
    exit;
}

if (!$code) {
    $msg = urlencode('잘못된 접근입니다.');
    header("Location: /?ci_login_error={$msg}&ci_table={$state}");
    exit;
}

// REST API 키 조회
$row = $pdo->query('SELECT kakao_app_key FROM social_links WHERE id=1')->fetch();
$restApiKey = $row['kakao_app_key'] ?? '';

if (!$restApiKey) {
    $msg = urlencode('카카오 앱 키가 설정되지 않았습니다.');
    header("Location: /?ci_login_error={$msg}&ci_table={$state}");
    exit;
}

$redirectUri = 'https://' . $_SERVER['HTTP_HOST'] . '/sns/kakao_callback.php';

// 1) 액세스 토큰 발급
$ch = curl_init('https://kauth.kakao.com/oauth/token');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => http_build_query([
        'grant_type'   => 'authorization_code',
        'client_id'    => $restApiKey,
        'redirect_uri' => $redirectUri,
        'code'         => $code,
    ]),
    CURLOPT_HTTPHEADER     => ['Content-Type: application/x-www-form-urlencoded'],
    CURLOPT_TIMEOUT        => 10,
    CURLOPT_SSL_VERIFYPEER => true,
]);
$tokenRes  = curl_exec($ch);
$curlErr   = curl_error($ch);
curl_close($ch);

if (!$tokenRes || $curlErr) {
    $msg = urlencode('카카오 토큰 발급 실패: ' . $curlErr);
    header("Location: /?ci_login_error={$msg}&ci_table={$state}");
    exit;
}

$tokenData   = json_decode($tokenRes, true);
$accessToken = $tokenData['access_token'] ?? '';

if (!$accessToken) {
    $msg = urlencode('카카오 토큰 오류: ' . ($tokenData['error_description'] ?? $tokenData['error'] ?? ''));
    header("Location: /?ci_login_error={$msg}&ci_table={$state}");
    exit;
}

// 2) 사용자 정보 조회
$ch = curl_init('https://kapi.kakao.com/v2/user/me');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $accessToken],
    CURLOPT_TIMEOUT        => 10,
    CURLOPT_SSL_VERIFYPEER => true,
]);
$userRes = curl_exec($ch);
curl_close($ch);

$userInfo = json_decode($userRes, true);
$kakaoId  = $userInfo['id'] ?? '';
$userName = $userInfo['kakao_account']['profile']['nickname']
          ?? $userInfo['properties']['nickname']
          ?? '카카오사용자';

if (!$kakaoId) {
    $msg = urlencode('카카오 사용자 정보를 가져올 수 없습니다.');
    header("Location: /?ci_login_error={$msg}&ci_table={$state}");
    exit;
}

// 3) 세션 저장 (기존 세션 초기화 후 새 계정으로 저장)
$userId = 'kakao_' . $kakaoId;
$user   = ['id' => $userId, 'name' => $userName, 'provider' => 'kakao'];
unset($_SESSION['board_user']);
session_regenerate_id(true);
$_SESSION['board_user'] = $user;

logLogin($pdo, 'kakao', $userId, $userName, 'success');

// 4) 원래 페이지로 복귀 (폼 섹션으로 스크롤)
$anchor = $state ? '#ci-section-' . preg_replace('/[^a-z0-9_]/', '', $state) : '';
header("Location: /{$anchor}");
exit;
