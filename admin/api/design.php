<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/log_helper.php';

header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo    = getDB();

/* =====================================================
   DB 초기화
===================================================== */
function _ensureDesignTables(PDO $pdo) {
    $pdo->exec("CREATE TABLE IF NOT EXISTS section_groups (
        id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(200) NOT NULL DEFAULT '기본 그룹',
        is_default TINYINT(1)   DEFAULT 0,
        created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    try { $pdo->exec("ALTER TABLE front_sections ADD COLUMN group_id INT UNSIGNED DEFAULT 1"); } catch(Exception $e) {}

    $pdo->exec("CREATE TABLE IF NOT EXISTS color_groups (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(200) NOT NULL DEFAULT '기본 컬러',
        color_base  VARCHAR(20)  DEFAULT '#1255a6',
        color_point VARCHAR(20)  DEFAULT '#1e7fe8',
        color_sub   VARCHAR(20)  DEFAULT '#00c6ff',
        color_sub2  VARCHAR(20)  DEFAULT '#1a2540',
        is_default  TINYINT(1)   DEFAULT 0,
        created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    $pdo->exec("CREATE TABLE IF NOT EXISTS design_pages (
        id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        slug             VARCHAR(100) NOT NULL UNIQUE,
        label            VARCHAR(200) NOT NULL DEFAULT '',
        section_group_id INT UNSIGNED DEFAULT 1,
        color_group_id   INT UNSIGNED DEFAULT 1,
        extra_css        TEXT,
        created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // 기본 섹션 그룹 보장
    $cnt = $pdo->query("SELECT COUNT(*) FROM section_groups WHERE is_default=1")->fetchColumn();
    if (!$cnt) {
        $pdo->exec("INSERT INTO section_groups (name, is_default) VALUES ('기본 그룹', 1)");
        try { $pdo->exec("UPDATE front_sections SET group_id=1 WHERE group_id IS NULL OR group_id=0"); } catch(Exception $e) {}
    }

    // 기본 컬러 그룹 보장
    $cntC = $pdo->query("SELECT COUNT(*) FROM color_groups WHERE is_default=1")->fetchColumn();
    if (!$cntC) {
        // 기존 그룹이 있으면 첫 번째 행을 기본으로 승격 (새 INSERT 금지 → 중복 방지)
        $firstId = $pdo->query("SELECT id FROM color_groups ORDER BY id LIMIT 1")->fetchColumn();
        if ($firstId) {
            $pdo->prepare("UPDATE color_groups SET is_default=1 WHERE id=?")->execute(array($firstId));
        } else {
            // 진짜 아무 행도 없을 때만 INSERT
            try {
                $hi = $pdo->query("SELECT color_base,color_point,color_sub,color_sub2 FROM homepage_info WHERE id=1")->fetch(PDO::FETCH_ASSOC);
            } catch(Exception $e) { $hi = array(); }
            $pdo->prepare("INSERT INTO color_groups (name,color_base,color_point,color_sub,color_sub2,is_default) VALUES (?,?,?,?,?,1)")
                ->execute(array(
                    '기본 컬러',
                    isset($hi['color_base'])  ? $hi['color_base']  : '#1255a6',
                    isset($hi['color_point']) ? $hi['color_point'] : '#1e7fe8',
                    isset($hi['color_sub'])   ? $hi['color_sub']   : '#00c6ff',
                    isset($hi['color_sub2'])  ? $hi['color_sub2']  : '#1a2540',
                ));
        }
    }
}

_ensureDesignTables($pdo);

/* =====================================================
   섹션 그룹
===================================================== */
if ($action === 'sectionGroupList') {
    $rows = $pdo->query("SELECT id,name,is_default,created_at FROM section_groups ORDER BY is_default DESC, id")->fetchAll(PDO::FETCH_ASSOC);
    $countRows = $pdo->query("SELECT group_id, COUNT(*) as cnt FROM front_sections GROUP BY group_id")->fetchAll(PDO::FETCH_ASSOC);
    $counts = array();
    foreach ($countRows as $cr) { $counts[$cr['group_id']] = (int)$cr['cnt']; }
    foreach ($rows as &$r) { $r['section_count'] = isset($counts[$r['id']]) ? $counts[$r['id']] : 0; }
    unset($r);
    echo json_encode(array('ok'=>true,'data'=>$rows)); exit;
}

if ($action === 'sectionGroupSave') {
    $id        = (int)($_POST['id'] ?? 0);
    $name      = trim($_POST['name'] ?? '');
    $setDefault = isset($_POST['set_default']) ? (int)$_POST['set_default'] : -1;

    if ($name === '') { echo json_encode(array('ok'=>false,'msg'=>'그룹명을 입력하세요.')); exit; }

    if ($id > 0) {
        // 이름 수정 (기본 그룹도 이름 변경 가능)
        $pdo->prepare("UPDATE section_groups SET name=? WHERE id=?")->execute(array($name, $id));
        // 기본 설정 변경
        if ($setDefault === 1) {
            $pdo->exec("UPDATE section_groups SET is_default=0");
            $pdo->prepare("UPDATE section_groups SET is_default=1 WHERE id=?")->execute(array($id));
        }
    } else {
        $pdo->prepare("INSERT INTO section_groups (name,is_default) VALUES (?,0)")->execute(array($name));
        $id = (int)$pdo->lastInsertId();
        // 코어 4개 섹션 복사
        $stmt = $pdo->query("SELECT name,file_name,nav_label,anchor_id,params,sort_order FROM front_sections WHERE group_id=1 AND file_name IN ('_site','_nav','top_banner','_ft')");
        $cores = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $ins = $pdo->prepare("INSERT INTO front_sections (`key`,name,file_name,is_active,nav_label,anchor_id,params,sort_order,group_id) VALUES (?,?,?,1,?,?,?,?,?)");
        foreach ($cores as $c) {
            $key = 'grp'.$id.'_'.$c['file_name'].'_'.time().rand(100,999);
            $ins->execute(array($key, $c['name'], $c['file_name'], $c['nav_label'], $c['anchor_id'], $c['params'], $c['sort_order'], $id));
        }
    }
    logAdminAction($pdo, $id > 0 ? 'update' : 'insert', 'section_groups', (string)$id);
    echo json_encode(array('ok'=>true,'id'=>$id)); exit;
}

if ($action === 'sectionGroupSetDefault') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id <= 0) { echo json_encode(array('ok'=>false,'msg'=>'잘못된 ID')); exit; }
    $pdo->exec("UPDATE section_groups SET is_default=0");
    $pdo->prepare("UPDATE section_groups SET is_default=1 WHERE id=?")->execute(array($id));
    logAdminAction($pdo, 'update', 'section_groups', 'default='.$id);
    echo json_encode(array('ok'=>true)); exit;
}

if ($action === 'sectionGroupDelete') {
    $id = (int)($_POST['id'] ?? 0);
    $stmt = $pdo->prepare("SELECT is_default FROM section_groups WHERE id=?");
    $stmt->execute(array($id));
    $isDef = $stmt->fetchColumn();
    if ($isDef) { echo json_encode(array('ok'=>false,'msg'=>'기본 그룹은 삭제할 수 없습니다. 다른 그룹을 기본으로 설정 후 삭제하세요.')); exit; }
    // 해당 그룹 섹션 전부 삭제
    $pdo->prepare("DELETE FROM front_sections WHERE group_id=?")->execute(array($id));
    $pdo->prepare("DELETE FROM section_groups WHERE id=?")->execute(array($id));
    logAdminAction($pdo, 'delete', 'section_groups', (string)$id);
    echo json_encode(array('ok'=>true)); exit;
}

/* =====================================================
   컬러 그룹
===================================================== */
if ($action === 'colorGroupList') {
    $rows = $pdo->query("SELECT id,name,color_base,color_point,color_sub,color_sub2,is_default FROM color_groups ORDER BY is_default DESC, id")->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(array('ok'=>true,'data'=>$rows)); exit;
}

if ($action === 'colorGroupSave') {
    $id         = (int)($_POST['id'] ?? 0);
    $name       = trim($_POST['name'] ?? '');
    $setDefault = isset($_POST['set_default']) ? (int)$_POST['set_default'] : -1;

    if ($name === '') { echo json_encode(array('ok'=>false,'msg'=>'그룹명을 입력하세요.')); exit; }

    $hexVal = function($v, $d) {
        $v = trim($v);
        return preg_match('/^#[0-9a-fA-F]{3,8}$/', $v) ? $v : $d;
    };
    $base  = $hexVal($_POST['color_base']  ?? '', '#1255a6');
    $point = $hexVal($_POST['color_point'] ?? '', '#1e7fe8');
    $sub   = $hexVal($_POST['color_sub']   ?? '', '#00c6ff');
    $sub2  = $hexVal($_POST['color_sub2']  ?? '', '#1a2540');

    if ($id > 0) {
        $pdo->prepare("UPDATE color_groups SET name=?,color_base=?,color_point=?,color_sub=?,color_sub2=? WHERE id=?")->execute(array($name,$base,$point,$sub,$sub2,$id));
        if ($setDefault === 1) {
            $pdo->exec("UPDATE color_groups SET is_default=0");
            $pdo->prepare("UPDATE color_groups SET is_default=1 WHERE id=?")->execute(array($id));
        }
        // 기본 그룹이면 homepage_info도 동기화
        $stmt2 = $pdo->prepare("SELECT is_default FROM color_groups WHERE id=?");
        $stmt2->execute(array($id));
        $isDef = $stmt2->fetchColumn();
        if ($isDef) {
            $pdo->prepare("UPDATE homepage_info SET color_base=?,color_point=?,color_sub=?,color_sub2=? WHERE id=1")->execute(array($base,$point,$sub,$sub2));
        }
    } else {
        $pdo->prepare("INSERT INTO color_groups (name,color_base,color_point,color_sub,color_sub2,is_default) VALUES (?,?,?,?,?,0)")->execute(array($name,$base,$point,$sub,$sub2));
        $id = (int)$pdo->lastInsertId();
    }
    logAdminAction($pdo, $id > 0 ? 'update' : 'insert', 'color_groups', (string)$id);
    echo json_encode(array('ok'=>true,'id'=>$id)); exit;
}

if ($action === 'colorGroupSetDefault') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id <= 0) { echo json_encode(array('ok'=>false,'msg'=>'잘못된 ID')); exit; }
    $pdo->exec("UPDATE color_groups SET is_default=0");
    $pdo->prepare("UPDATE color_groups SET is_default=1 WHERE id=?")->execute(array($id));
    // homepage_info 동기화
    $row = $pdo->query("SELECT color_base,color_point,color_sub,color_sub2 FROM color_groups WHERE id={$id}")->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $pdo->prepare("UPDATE homepage_info SET color_base=?,color_point=?,color_sub=?,color_sub2=? WHERE id=1")->execute(array($row['color_base'],$row['color_point'],$row['color_sub'],$row['color_sub2']));
    }
    logAdminAction($pdo, 'update', 'color_groups', 'default='.$id);
    echo json_encode(array('ok'=>true)); exit;
}

if ($action === 'colorGroupDelete') {
    $id = (int)($_POST['id'] ?? 0);
    $stmt = $pdo->prepare("SELECT is_default FROM color_groups WHERE id=?");
    $stmt->execute(array($id));
    $isDef = $stmt->fetchColumn();
    if ($isDef) { echo json_encode(array('ok'=>false,'msg'=>'기본 컬러 그룹은 삭제할 수 없습니다. 다른 그룹을 기본으로 설정 후 삭제하세요.')); exit; }
    $pdo->prepare("DELETE FROM color_groups WHERE id=?")->execute(array($id));
    // 삭제 후 is_default=1 이 아무도 없으면 남은 첫 번째 그룹을 기본으로 승격
    $defId = $pdo->query("SELECT id FROM color_groups WHERE is_default=1 LIMIT 1")->fetchColumn();
    if (!$defId) {
        $firstId = $pdo->query("SELECT id FROM color_groups ORDER BY id LIMIT 1")->fetchColumn();
        if ($firstId) {
            $pdo->prepare("UPDATE color_groups SET is_default=1 WHERE id=?")->execute(array($firstId));
            $defId = $firstId;
        }
    }
    // 이 그룹 쓰던 design_pages는 기본 그룹으로 변경
    if ($defId) { $pdo->prepare("UPDATE design_pages SET color_group_id=? WHERE color_group_id=?")->execute(array($defId, $id)); }
    logAdminAction($pdo, 'delete', 'color_groups', (string)$id);
    echo json_encode(array('ok'=>true)); exit;
}

/* =====================================================
   섹션 그룹별 front_sections 조회
===================================================== */
if ($action === 'dynSectionListByGroup') {
    $gid = (int)(isset($_GET['group_id']) ? $_GET['group_id'] : (isset($_POST['group_id']) ? $_POST['group_id'] : 1));
    $stmt = $pdo->prepare("SELECT id,`key`,name,file_name,is_active,nav_label,anchor_id,params,sort_order,group_id FROM front_sections WHERE group_id=? ORDER BY sort_order,id");
    $stmt->execute(array($gid));
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $libBase   = realpath(__DIR__ . '/../../lib') . DIRECTORY_SEPARATOR;
    $coreFiles = array('_site','_nav','_ft');
    foreach ($rows as &$row) {
        if (in_array($row['file_name'], $coreFiles, true)) { $row['file_missing'] = false; continue; }
        $fn = preg_replace('/[^a-zA-Z0-9_\-]/', '', pathinfo($row['file_name'], PATHINFO_FILENAME));
        $row['file_missing'] = ($fn === '' || !file_exists($libBase . $fn . '.php'));
    }
    unset($row);
    echo json_encode(array('ok'=>true,'data'=>$rows)); exit;
}

/* =====================================================
   디자인 페이지
===================================================== */
if ($action === 'designPageList') {
    $rows = $pdo->query("SELECT p.*,sg.name as section_group_name,cg.name as color_group_name FROM design_pages p LEFT JOIN section_groups sg ON sg.id=p.section_group_id LEFT JOIN color_groups cg ON cg.id=p.color_group_id ORDER BY p.id DESC")->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(array('ok'=>true,'data'=>$rows)); exit;
}

if ($action === 'designPageSave') {
    $id       = (int)($_POST['id'] ?? 0);
    $slug     = preg_replace('/[^a-zA-Z0-9_\-]/', '', trim($_POST['slug'] ?? ''));
    $label    = trim($_POST['label'] ?? '');
    $sgId     = (int)($_POST['section_group_id'] ?? 1);
    $cgId     = (int)($_POST['color_group_id']   ?? 1);
    $extraCss = $_POST['extra_css'] ?? '';

    if ($slug === '') { echo json_encode(array('ok'=>false,'msg'=>'파일명을 입력하세요.')); exit; }
    $reserved = array('index','admin','lib','js','style','img','chatbot');
    if (in_array($slug, $reserved, true)) { echo json_encode(array('ok'=>false,'msg'=>'사용할 수 없는 파일명입니다.')); exit; }

    $rootDir  = realpath(__DIR__ . '/../../') . '/';
    $filePath = $rootDir . $slug . '.php';

    $phpContent  = "<?php\n";
    $phpContent .= "// [자동생성] 디자인 만들기 — {$slug}\n";
    $phpContent .= "defined('PAGE_SECTION_GROUP') || define('PAGE_SECTION_GROUP', {$sgId});\n";
    $phpContent .= "defined('PAGE_COLOR_GROUP')   || define('PAGE_COLOR_GROUP',   {$cgId});\n";
    $phpContent .= "defined('PAGE_SLUG')           || define('PAGE_SLUG',           '{$slug}');\n";
    if (trim($extraCss) !== '') {
        $escaped     = str_replace("'", "\\'", $extraCss);
        $phpContent .= "defined('PAGE_EXTRA_CSS') || define('PAGE_EXTRA_CSS', '" . $escaped . "');\n";
    }
    $phpContent .= "include __DIR__ . '/index.php';\n";

    if (file_put_contents($filePath, $phpContent) === false) {
        echo json_encode(array('ok'=>false,'msg'=>'파일 생성에 실패했습니다. 서버 권한을 확인하세요.')); exit;
    }

    if ($id > 0) {
        $pdo->prepare("UPDATE design_pages SET slug=?,label=?,section_group_id=?,color_group_id=?,extra_css=? WHERE id=?")->execute(array($slug,$label,$sgId,$cgId,$extraCss,$id));
    } else {
        $pdo->prepare("INSERT INTO design_pages (slug,label,section_group_id,color_group_id,extra_css) VALUES (?,?,?,?,?)")->execute(array($slug,$label,$sgId,$cgId,$extraCss));
        $id = (int)$pdo->lastInsertId();
    }
    logAdminAction($pdo, $id > 0 ? 'update' : 'insert', 'design_pages', (string)$id);
    echo json_encode(array('ok'=>true,'id'=>$id,'file'=>'/'.$slug.'.php')); exit;
}

if ($action === 'designPageDelete') {
    $id = (int)($_POST['id'] ?? 0);
    $stmt = $pdo->prepare("SELECT slug FROM design_pages WHERE id=?");
    $stmt->execute(array($id));
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $rootDir  = realpath(__DIR__ . '/../../') . '/';
        $filePath = $rootDir . $row['slug'] . '.php';
        if (file_exists($filePath)) {
            $contents = file_get_contents($filePath);
            if (strpos($contents, '// [자동생성]') !== false) { @unlink($filePath); }
        }
        $pdo->prepare("DELETE FROM design_pages WHERE id=?")->execute(array($id));
        logAdminAction($pdo, 'delete', 'design_pages', (string)$id);
    }
    echo json_encode(array('ok'=>true)); exit;
}

echo json_encode(array('ok'=>false,'msg'=>'unknown action'));