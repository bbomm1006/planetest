<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/log_helper.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = getDB();
logAccess($pdo);
logLanding($pdo);

$rows = $pdo->query(
    'SELECT id, store_name, branch_name, address,
            lat, lng, phone, open_hours,
            reserve_url, reserve_target,
            memo, detail_info, images, sort_order
     FROM stores
     ORDER BY sort_order, id'
)->fetchAll(PDO::FETCH_ASSOC);

function _makeRegion($address) {
    if (!$address) return '';
    $parts = preg_split('/\s+/', trim($address));
    return implode(' ', array_slice($parts, 0, 2));
}

function _fixPhotoUrl($url) {
    if (!$url) return '';
    // ../uploads/admin/xxx.jpg → /uploads/admin/xxx.jpg
    $url = preg_replace('#^\.\./+#', '/', $url);
    // 이미 /로 시작하면 그대로
    if (strpos($url, '/') !== 0) $url = '/' . $url;
    return $url;
}

$stores = array_map(function ($s) {
    $photos = [];
    if (!empty($s['images'])) {
        $decoded = json_decode($s['images'], true);
        if (is_array($decoded)) {
            $photos = array_values(array_filter(array_map('_fixPhotoUrl', $decoded)));
        }
    }
    return [
        'id'             => (int)$s['id'],
        'active'         => true,
        'name'           => $s['store_name']    ?? '',
        'branch'         => $s['branch_name']   ?? '',
        'address'        => $s['address']       ?? '',
        'region'         => _makeRegion($s['address']),
        'lat'            => $s['lat']  !== null ? (float)$s['lat']  : null,
        'lng'            => $s['lng']  !== null ? (float)$s['lng']  : null,
        'phone'          => $s['phone']         ?? '',
        'hours'          => $s['open_hours']    ?? '',
        'memo'           => $s['memo']          ?? '',
        'detail'         => $s['detail_info']   ?? '',
        'photos'         => $photos,
        'reserve_url'    => $s['reserve_url']    ?? '',
        'reserve_target' => $s['reserve_target'] ?? '_self',
        'naver_map_url'  => '',
        'kakao_map_url'  => '',
    ];
}, $rows);

echo json_encode(['ok' => true, 'data' => $stores], JSON_UNESCAPED_UNICODE);