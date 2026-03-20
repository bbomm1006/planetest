<?php
/**
 * social_public.php — 프론트용 소셜 로그인 키 공개 API
 * GET /admin/api_front/social_public.php
 */
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/log_helper.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');

try {
    $pdo = getDB();
logAccess($pdo);
logLanding($pdo);
    $row = $pdo->query('SELECT kakao_app_key, naver_client_id, google_client_id FROM social_links WHERE id=1')->fetch();
    if (!$row) $row = ['kakao_app_key' => '', 'naver_client_id' => '', 'google_client_id' => ''];
    echo json_encode(['ok' => true, 'kakao' => $row['kakao_app_key'], 'naver' => $row['naver_client_id'], 'google' => $row['google_client_id']]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}