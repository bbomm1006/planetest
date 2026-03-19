<?php
/**
 * banner_public.php  — 인증 불필요 공개 API
 * 사용자 페이지(hero.js)에서 fetch('/admin/api/banner_public.php')로 호출
 *
 * 반환 형태:
 * {
 *   bannerConfig: { transition, interval },
 *   banners: [ { active, order, bgType, bgSrc, bgSrcMo, ... }, ... ]
 * }
 */
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = getDB();

/* ── bannerConfig: scripts 테이블의 banner_config 컬럼, 없으면 기본값 ── */
try {
    $cfg = $pdo->query(
        'SELECT banner_transition, banner_interval FROM scripts WHERE id = 1'
    )->fetch(PDO::FETCH_ASSOC);
} catch (Exception $e) {
    $cfg = null;   // 컬럼이 아직 없을 경우 대비
}

$bannerConfig = [
    'transition' => $cfg['banner_transition'] ?? 'fade',  // 'fade' | 'slide'
    'interval'   => (int)($cfg['banner_interval'] ?? 5000), // ms, 0이면 자동재생 없음
];

/* ── 배너 목록 조회 (노출 중인 것만) ── */
$rows = $pdo->query(
    'SELECT id, title, type, link_url, link_target,
            pc_image, mo_image, video_url, sort_order,
            subtitle, title_text, title_color,
            description, desc_color,
            overlay_on, overlay_color,
            btn1_on, btn1_text, btn1_link, btn1_bg, btn1_text_color,
            btn2_on, btn2_text, btn2_link, btn2_text_color
     FROM banners
     WHERE is_visible = 1
     ORDER BY sort_order, id'
)->fetchAll(PDO::FETCH_ASSOC);

/* ── DB 행 → hero.js 가 기대하는 객체로 변환 ── */
$banners = array_map(function ($b) {
    $isVideo = ($b['type'] === 'video');

    return [
        /* 공통 */
        'active'         => true,
        'order'          => (int)$b['sort_order'],

        /* 배경 */
        'bgType'         => $b['type'],                           // 'image' | 'video'
        'bgSrc'          => $isVideo ? ($b['video_url'] ?? '')
                                     : ($b['pc_image']  ?? ''),
        'bgSrcMo'        => $b['mo_image'] ?? '',

        /* 오버레이 */
        'overlayEnabled' => (bool)($b['overlay_on'] ?? true),
        'overlayColor'   => $b['overlay_color'] ?? 'rgba(0,0,0,0.45)',

        /* 텍스트 */
        'subtitle'       => $b['subtitle']    ?? '',
        'subtitleColor'  => 'rgba(255,255,255,.9)',
        'title'          => $b['title_text']  ?? $b['title'] ?? '',
        'titleColor'     => $b['title_color'] ?? '#ffffff',
        'desc'           => $b['description'] ?? '',
        'descColor'      => $b['desc_color']  ?? 'rgba(255,255,255,.72)',

        /* 버튼 1 */
        'btn1Enabled'    => (bool)($b['btn1_on'] ?? !empty($b['link_url'])),
        'btn1Text'       => $b['btn1_text']       ?? ($b['link_url'] ? '자세히 보기' : ''),
        'btn1Link'       => $b['btn1_link']       ?? $b['link_url'] ?? '',
        'btn1Bg'         => $b['btn1_bg']         ?? '#00c6ff',
        'btn1TextColor'  => $b['btn1_text_color'] ?? '#ffffff',

        /* 버튼 2 */
        'btn2Enabled'    => (bool)($b['btn2_on']   ?? false),
        'btn2Text'       => $b['btn2_text']        ?? '',
        'btn2Link'       => $b['btn2_link']        ?? '',
        'btn2TextColor'  => $b['btn2_text_color']  ?? '#ffffff',
    ];
}, $rows);

echo json_encode([
    'bannerConfig' => $bannerConfig,
    'banners'      => $banners,
], JSON_UNESCAPED_UNICODE);