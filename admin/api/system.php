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
           params     VARCHAR(500) DEFAULT '',
           sort_order INT          DEFAULT 0,
           created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
         ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
    );
    try { $pdo->exec("ALTER TABLE front_sections ADD COLUMN nav_label VARCHAR(100) DEFAULT '' AFTER subtitle"); } catch (Exception $e) {}
    try { $pdo->exec("ALTER TABLE front_sections ADD COLUMN anchor_id VARCHAR(100) DEFAULT '' AFTER nav_label"); } catch (Exception $e) {}
    try { $pdo->exec("ALTER TABLE front_sections ADD COLUMN params VARCHAR(500) DEFAULT '' AFTER anchor_id"); } catch (Exception $e) {}
}

// 동적 섹션 목록 조회
if ($action === 'dynSectionList') {
    try {
        _adminEnsureFrontSections($pdo);
        $rows = $pdo->query(
            'SELECT id, `key`, name, file_name, is_active, title, subtitle, nav_label, anchor_id, params, sort_order
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
    $params    = trim($_POST['params']     ?? '');
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
                        nav_label=?, anchor_id=?, params=?, is_active=?, sort_order=?
                  WHERE id=?'
            )->execute([$name, $fileName, $title, $subtitle,
                        $navLabel, $anchorId, $params, $isActive, $sortOrder, $id]);
        } else {
            // key 중복 방지: dyn_파일명_타임스탬프 suffix
            $baseKey = 'dyn_' . preg_replace('/[^a-zA-Z0-9_\-]/', '_', $fileName);
            $key     = $baseKey . '_' . time();
            $pdo->prepare(
                'INSERT INTO front_sections
                   (name, file_name, `key`, title, subtitle, nav_label, anchor_id, params, is_active, sort_order)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            )->execute([$name, $fileName, $key, $title, $subtitle,
                        $navLabel, $anchorId, $params, $isActive, $sortOrder]);
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
        // 기본값: 서비스 전환바 / 상단NAV / 히어로배너 / 풋터 4개만
        // key, name, file_name, is_active, title, subtitle, nav_label, anchor_id, params, sort_order
        $defaults = [
            ['front_service_switch', '서비스 전환 바', '_site',      1, '', '', '', '', '', 0],
            ['front_user_menu',      '상단 NAV',       '_nav',       1, '', '', '', '', '', 1],
            ['front_hero_banner',    'HERO 배너',      'top_banner', 1, '', '', '', '', '', 2],
            ['front_footer',         '풋터',           '_ft',        1, '', '', '', '', '', 99],
        ];
        $stmt = $pdo->prepare(
            'INSERT IGNORE INTO front_sections
               (`key`, name, file_name, is_active, title, subtitle, nav_label, anchor_id, params, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
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

// DB 마이그레이션: 코어 4개 제외 전부 삭제 + 중복/순서 정리
if ($action === 'dynSectionMigrate') {
    try {
        _adminEnsureFrontSections($pdo);

        // 코어 파일명 4개 (이것만 유지)
        $coreFiles = ['_site', '_nav', 'top_banner', '_ft'];

        // 1) 코어 아닌 섹션 전부 삭제
        $ph = implode(',', array_fill(0, count($coreFiles), '?'));
        $stmt = $pdo->prepare("DELETE FROM front_sections WHERE file_name NOT IN ($ph)");
        $stmt->execute($coreFiles);
        $deletedCount = $stmt->rowCount();

        // 2) _ft 중복 제거: id 가장 작은 1개만 유지
        $ftRows = $pdo->query(
            "SELECT id FROM front_sections WHERE file_name = '_ft' ORDER BY id ASC"
        )->fetchAll(PDO::FETCH_COLUMN);
        if (count($ftRows) > 1) {
            $delIds = array_slice($ftRows, 1);
            $ph2    = implode(',', array_fill(0, count($delIds), '?'));
            $pdo->prepare("DELETE FROM front_sections WHERE id IN ($ph2)")->execute($delIds);
        }

        // 3) 코어 섹션 sort_order 강제 고정 + 활성화
        $pdo->exec("UPDATE front_sections SET is_active = 1, sort_order = 0  WHERE file_name = '_site'");
        $pdo->exec("UPDATE front_sections SET is_active = 1, sort_order = 1  WHERE file_name = '_nav'");
        $pdo->exec("UPDATE front_sections SET is_active = 1, sort_order = 2  WHERE file_name = 'top_banner'");
        $pdo->exec("UPDATE front_sections SET is_active = 1, sort_order = 99 WHERE file_name = '_ft'");

        logAdminAction($pdo, 'migrate', 'front_sections', 'cleanup');
        echo json_encode([
            'ok'  => true,
            'msg' => '정리 완료. 코어 4개 외 ' . $deletedCount . '개 삭제, 풋터 중복 ' . max(0, count($ftRows) - 1) . '개 삭제, 순서 고정.',
        ]);
    } catch (Exception $e) {
        echo json_encode(['ok' => false, 'msg' => $e->getMessage()]);
    }
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action']);
