<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/log_helper.php';

header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo    = getDB();

/* =====================================================
   MENU
   ===================================================== */

// 메뉴 목록 조회
if ($action === 'menuList') {
    $rows = $pdo->query('SELECT `key`, label, is_active, sort_order FROM menus ORDER BY sort_order, id')->fetchAll();
    echo json_encode(['ok' => true, 'data' => $rows]);
    exit;
}

// 메뉴 일괄 저장 (체크박스 상태 배열)
if ($action === 'menuSave') {
    // items: [{key, is_active}, ...]
    $items = json_decode($_POST['items'] ?? '[]', true) ?: [];
    foreach ($items as $item) {
        $key      = $item['key']       ?? '';
        $isActive = (int)($item['is_active'] ?? 0);
        if ($key === '') continue;
        // UPSERT
        $pdo->prepare(
            'INSERT INTO menus (`key`, label, is_active) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE is_active = VALUES(is_active)'
        )->execute([$key, $item['label'] ?? $key, $isActive]);
    }
    logAdminAction($pdo, 'update', 'menus', 'bulk');
    echo json_encode(['ok' => true]);
    exit;
}

/* =====================================================
   SCRIPT
   ===================================================== */

// 스크립트 조회 (항상 id=1 단일 행)
if ($action === 'scriptGet') {
    $row = $pdo->query('SELECT head_code, body_code FROM scripts WHERE id = 1')->fetch();
    if (!$row) $row = ['head_code' => '', 'body_code' => ''];
    echo json_encode(['ok' => true, 'data' => $row]);
    exit;
}

// 스크립트 저장
if ($action === 'scriptSave') {
    $head = $_POST['head_code'] ?? '';
    $body = $_POST['body_code'] ?? '';
    $pdo->prepare(
        'INSERT INTO scripts (id, head_code, body_code) VALUES (1, ?, ?)
         ON DUPLICATE KEY UPDATE head_code = VALUES(head_code), body_code = VALUES(body_code)'
    )->execute([$head, $body]);
    logAdminAction($pdo, 'update', 'scripts', '1');
    echo json_encode(['ok' => true]);
    exit;
}

/* =====================================================
   SOCIAL LINKS
   ===================================================== */

// 소셜 설정 조회
if ($action === 'socialGet') {
    $row = $pdo->query('SELECT kakao_app_key, naver_client_id, naver_client_secret, google_client_id, updated_at FROM social_links WHERE id = 1')->fetch();
    if (!$row) $row = ['kakao_app_key'=>'','naver_client_id'=>'','naver_client_secret'=>'','google_client_id'=>'','updated_at'=>''];
    echo json_encode(['ok' => true, 'data' => $row]);
    exit;
}

// 소셜 설정 저장
if ($action === 'socialSave') {
    $kakao  = trim($_POST['kakao_app_key']       ?? '');
    $navId  = trim($_POST['naver_client_id']     ?? '');
    $navSec = trim($_POST['naver_client_secret'] ?? '');
    $google = trim($_POST['google_client_id']    ?? '');
    $pdo->prepare(
        'INSERT INTO social_links (id, kakao_app_key, naver_client_id, naver_client_secret, google_client_id)
         VALUES (1, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           kakao_app_key = VALUES(kakao_app_key),
           naver_client_id = VALUES(naver_client_id),
           naver_client_secret = VALUES(naver_client_secret),
           google_client_id = VALUES(google_client_id)'
    )->execute([$kakao, $navId, $navSec, $google]);
    logAdminAction($pdo, 'update', 'social_links', '1');
    echo json_encode(['ok' => true]);
    exit;
}

/* =====================================================
   DYNAMIC SECTIONS (front_sections 테이블)
   ===================================================== */

// front_sections 테이블 초기화 헬퍼 (admin API 공통)
function _adminEnsureFrontSections(PDO $pdo): void {
    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS front_sections (
           id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
           `key`      VARCHAR(100) NOT NULL UNIQUE,
           name       VARCHAR(200) NOT NULL DEFAULT '',
           file_name  VARCHAR(200) NOT NULL DEFAULT '',
           is_active  TINYINT(1)   DEFAULT 1,
           title      VARCHAR(300) DEFAULT '',
           subtitle   VARCHAR(300) DEFAULT '',
           nav_label  VARCHAR(100) DEFAULT '',
           anchor_id  VARCHAR(100) DEFAULT '',
           sort_order INT          DEFAULT 0,
           created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
         ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
    try { $pdo->exec("ALTER TABLE front_sections ADD COLUMN nav_label VARCHAR(100) DEFAULT '' AFTER subtitle"); } catch (Exception $e) {}
    try { $pdo->exec("ALTER TABLE front_sections ADD COLUMN anchor_id VARCHAR(100) DEFAULT '' AFTER nav_label"); } catch (Exception $e) {}
}

// 동적 섹션 목록 조회
if ($action === 'dynSectionList') {
    try {
        _adminEnsureFrontSections($pdo);
        $rows = $pdo->query(
            'SELECT id, `key`, name, file_name, is_active, title, subtitle, nav_label, anchor_id, sort_order
               FROM front_sections ORDER BY sort_order, id'
        )->fetchAll(PDO::FETCH_ASSOC);

        // lib 파일 존재 여부 체크 (core 구조 파일 제외)
        $libBase   = realpath(__DIR__ . '/../../lib') . DIRECTORY_SEPARATOR;
        $coreFiles = ['_site', '_nav', '_ft'];
        foreach ($rows as &$row) {
            if (in_array($row['file_name'], $coreFiles, true)) {
                $row['file_missing'] = false;
                continue;
            }
            $fn = preg_replace('/[^a-zA-Z0-9_\-]/', '',
                               pathinfo($row['file_name'], PATHINFO_FILENAME));
            $row['file_missing'] = ($fn === '' || !file_exists($libBase . $fn . '.php'));
        }
        unset($row);

        echo json_encode(['ok' => true, 'data' => $rows]);
    } catch (Exception $e) {
        echo json_encode(['ok' => false, 'msg' => $e->getMessage()]);
    }
    exit;
}

// 동적 섹션 저장 (insert or update)
if ($action === 'dynSectionSave') {
    $id        = (int)($_POST['id']        ?? 0);
    $name      = trim($_POST['name']       ?? '');
    $fileName  = trim($_POST['file_name']  ?? '');
    $title     = trim($_POST['title']      ?? '');
    $subtitle  = trim($_POST['subtitle']   ?? '');
    $navLabel  = trim($_POST['nav_label']  ?? '');
    $anchorId  = trim($_POST['anchor_id']  ?? '');
    $isActive  = (int)($_POST['is_active']  ?? 1);
    $sortOrder = (int)($_POST['sort_order'] ?? 0);

    if ($name === '' || $fileName === '') {
        echo json_encode(['ok' => false, 'msg' => '섹션명과 파일명은 필수입니다.']);
        exit;
    }
    if (!preg_match('/^[a-zA-Z0-9_\-]+$/', $fileName)) {
        echo json_encode(['ok' => false, 'msg' => '파일명은 영문, 숫자, _, - 만 사용 가능합니다.']);
        exit;
    }

    try {
        // 기존 섹션(front_*)은 key 유지, 신규 동적 섹션은 dyn_ prefix
        if ($id > 0) {
            // 수정: key는 변경하지 않음 (기존 front_* key 보존)
            $pdo->prepare(
                'UPDATE front_sections
                    SET name=?, file_name=?, title=?, subtitle=?,
                        nav_label=?, anchor_id=?, is_active=?, sort_order=?
                  WHERE id=?'
            )->execute([$name, $fileName, $title, $subtitle,
                        $navLabel, $anchorId, $isActive, $sortOrder, $id]);
        } else {
            $key = 'dyn_' . preg_replace('/[^a-zA-Z0-9_\-]/', '_', $fileName);
            $pdo->prepare(
                'INSERT INTO front_sections
                   (name, file_name, `key`, title, subtitle, nav_label, anchor_id, is_active, sort_order)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
            )->execute([$name, $fileName, $key, $title, $subtitle,
                        $navLabel, $anchorId, $isActive, $sortOrder]);
        }
        logAdminAction($pdo, $id > 0 ? 'update' : 'insert', 'front_sections', (string)($id ?: 'new'));
        echo json_encode(['ok' => true]);
    } catch (Exception $e) {
        echo json_encode(['ok' => false, 'msg' => '파일명이 이미 사용 중이거나 오류가 발생했습니다.']);
    }
    exit;
}

// 기존 섹션 기본값 초기화 (INSERT IGNORE — 기존 데이터 보존)
if ($action === 'dynSectionInit') {
    try {
        _adminEnsureFrontSections($pdo);
        $defaults = [
            ['front_service_switch',    '서비스 전환 바',             '_site',             1, '', '', '',        '',                 0],
            ['front_user_menu',         '상단 NAV',                   '_nav',              1, '', '', '',        '',                 1],
            ['front_hero_banner',       'HERO 배너',                  'top_banner',        1, '', '', '',        '',                 2],
            ['front_products',          '제품 섹션',                  'products',          1, '', '', '제품',    'products',         3],
            ['front_benefits',          '혜택 섹션',                  'benefits',          1, '', '', '혜택',    'benefits',         4],
            ['front_videos',            '영상 섹션',                  'bbs_video',         1, '', '', '영상',    'videos',           5],
            ['front_reviews',           '후기 섹션',                  'bbs_review',        1, '', '', '후기',    'reviews',          6],
            ['front_event',             '이벤트 섹션',                'bbs_event',         1, '', '', '이벤트',  'event',            7],
            ['front_stores',            '매장찾기 섹션',              'stores',            1, '', '', '매장찾기','stores',           8],
            ['front_reservation',       '예약(System1, 비활성)',      'reservation',       0, '', '', '',        '',                 9],
            ['front_reservation_lookup','예약조회(System1, 비활성)',  'reservationLookup', 0, '', '', '',        '',                 10],

            ['front_notices',           '공지사항 섹션',              'bbs_notice',        1, '', '', '공지사항','notices',          13],
            ['front_faq',               'FAQ 섹션',                   'bbs_faq',           1, '', '', 'FAQ',     'faq',              14],
            ['front_gallery',           '갤러리 섹션',                'bbs_gallery',       1, '', '', '갤러리',  'gallery',          15],
            ['front_photo_gallery',     '포토 갤러리',                'bbs_photogallery',  0, '', '', '',        '',                 16],
            ['front_slide_gallery',     '슬라이드 갤러리',            'bbs_slidegallery',  0, '', '', '',        '',                 17],
            ['front_footer',            '풋터',                       '_ft',               1, '', '', '',        '',                 18],
        ];
        $stmt = $pdo->prepare(
            'INSERT IGNORE INTO front_sections
               (`key`, name, file_name, is_active, title, subtitle, nav_label, anchor_id, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        foreach ($defaults as $d) { $stmt->execute($d); }
        logAdminAction($pdo, 'init', 'front_sections', 'defaults');
        echo json_encode(['ok' => true]);
    } catch (Exception $e) {
        echo json_encode(['ok' => false, 'msg' => $e->getMessage()]);
    }
    exit;
}

// 섹션 순서 이동 (up / down) — 이동 후 전체 sort_order 재번호화
if ($action === 'dynSectionReorder') {
    $id        = (int)($_POST['id']        ?? 0);
    $direction = trim($_POST['direction']  ?? '');
    if ($id <= 0 || !in_array($direction, ['up', 'down'], true)) {
        echo json_encode(['ok' => false, 'msg' => '잘못된 파라미터']);
        exit;
    }
    try {
        $rows = $pdo->query(
            'SELECT id FROM front_sections ORDER BY sort_order, id'
        )->fetchAll(PDO::FETCH_COLUMN);

        $pos = array_search($id, array_map('intval', $rows));
        if ($pos === false) {
            echo json_encode(['ok' => false, 'msg' => '섹션을 찾을 수 없습니다.']);
            exit;
        }

        $target = ($direction === 'up') ? $pos - 1 : $pos + 1;
        if ($target < 0 || $target >= count($rows)) {
            echo json_encode(['ok' => true]);  // 이미 맨 위/맨 아래
            exit;
        }

        // 두 항목 위치 교환
        [$rows[$pos], $rows[$target]] = [$rows[$target], $rows[$pos]];

        // 전체 sort_order 재번호화
        $stmt = $pdo->prepare('UPDATE front_sections SET sort_order=? WHERE id=?');
        foreach ($rows as $i => $rid) {
            $stmt->execute([$i, (int)$rid]);
        }

        logAdminAction($pdo, 'reorder', 'front_sections', (string)$id);
        echo json_encode(['ok' => true]);
    } catch (Exception $e) {
        echo json_encode(['ok' => false, 'msg' => $e->getMessage()]);
    }
    exit;
}

// 동적 섹션 삭제
if ($action === 'dynSectionDelete') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['ok' => false, 'msg' => '잘못된 ID']); exit; }
    try {
        $pdo->prepare('DELETE FROM front_sections WHERE id = ?')->execute([$id]);
        logAdminAction($pdo, 'delete', 'front_sections', (string)$id);
        echo json_encode(['ok' => true]);
    } catch (Exception $e) {
        echo json_encode(['ok' => false, 'msg' => $e->getMessage()]);
    }
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action']);
