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
function _ensureDesignTables(PDO $pdo): void {
    // 섹션 그룹
    $pdo->exec("CREATE TABLE IF NOT EXISTS section_groups (
        id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name       VARCHAR(200) NOT NULL DEFAULT '기본 그룹',
        is_default TINYINT(1)   DEFAULT 0,
        created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // front_sections 에 group_id 컬럼 추가
    try { $pdo->exec("ALTER TABLE front_sections ADD COLUMN group_id INT UNSIGNED DEFAULT 1"); } catch(Exception $e) {}

    // 컬러 그룹
    $pdo->exec("CREATE TABLE IF NOT EXISTS color_groups (
        id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(200) NOT NULL DEFAULT '기본 컬러',
        color_base  VARCHAR(20)  DEFAULT '#1255a6',
        color_point VARCHAR(20)  DEFAULT '#1e7fe8',
        color_sub   VARCHAR(20)  DEFAULT '#00c6ff',
        color_sub2  VARCHAR(20)  DEFAULT '#ff6b35',
        is_default  TINYINT(1)   DEFAULT 0,
        created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // 생성된 페이지
    $pdo->exec("CREATE TABLE IF NOT EXISTS design_pages (
        id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        slug             VARCHAR(100) NOT NULL UNIQUE,
        label            VARCHAR(200) NOT NULL DEFAULT '',
        section_group_id INT UNSIGNED DEFAULT 1,
        color_group_id   INT UNSIGNED DEFAULT 1,
        extra_css        TEXT,
        created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // 기본 섹션 그룹 (id=1) 보장
    $cnt = $pdo->query("SELECT COUNT(*) FROM section_groups WHERE is_default=1")->fetchColumn();
    if (!$cnt) {
        $pdo->exec("INSERT INTO section_groups (name, is_default) VALUES ('기본 그룹', 1)");
        // 기존 front_sections → group_id=1 할당
        try { $pdo->exec("UPDATE front_sections SET group_id=1 WHERE group_id IS NULL OR group_id=0"); } catch(Exception $e) {}
    }

    // 기본 컬러 그룹 (id=1) 보장 — homepage_info 에서 읽어서 채움
    $cntC = $pdo->query("SELECT COUNT(*) FROM color_groups WHERE is_default=1")->fetchColumn();
    if (!$cntC) {
        try {
            $hi = $pdo->query("SELECT color_base,color_point,color_sub,color_sub2 FROM homepage_info WHERE id=1")->fetch(PDO::FETCH_ASSOC);
        } catch(Exception $e) { $hi = []; }
        $pdo->prepare("INSERT INTO color_groups (name,color_base,color_point,color_sub,color_sub2,is_default) VALUES (?,?,?,?,?,1)")
            ->execute([
                '기본 컬러',
                $hi['color_base']  ?? '#1255a6',
                $hi['color_point'] ?? '#1e7fe8',
                $hi['color_sub']   ?? '#00c6ff',
                $hi['color_sub2']  ?? '#ff6b35',
            ]);
    }
}

_ensureDesignTables($pdo);

/* =====================================================
   섹션 그룹
===================================================== */
if ($action === 'sectionGroupList') {
    $rows = $pdo->query("SELECT id,name,is_default,created_at FROM section_groups ORDER BY is_default DESC, id")->fetchAll(PDO::FETCH_ASSOC);
    // 각 그룹의 섹션 수
    $counts = $pdo->query("SELECT group_id, COUNT(*) as cnt FROM front_sections GROUP BY group_id")->fetchAll(PDO::FETCH_KEY_PAIR);
    foreach ($rows as &$r) { $r['section_count'] = (int)($counts[$r['id']] ?? 0); }
    echo json_encode(['ok'=>true,'data'=>$rows]); exit;
}

if ($action === 'sectionGroupSave') {
    $id   = (int)($_POST['id'] ?? 0);
    $name = trim($_POST['name'] ?? '');
    if ($name === '') { echo json_encode(['ok'=>false,'msg'=>'그룹명을 입력하세요.']); exit; }
    if ($id > 0) {
        $pdo->prepare("UPDATE section_groups SET name=? WHERE id=? AND is_default=0")->execute([$name,$id]);
    } else {
        $pdo->prepare("INSERT INTO section_groups (name,is_default) VALUES (?,0)")->execute([$name]);
        $id = $pdo->lastInsertId();
        // 기본 그룹 섹션을 복사하여 새 그룹 초기화
        $defaults = $pdo->query("SELECT name,file_name,is_active,nav_label,anchor_id,params,sort_order FROM front_sections WHERE group_id=1 AND is_default_core=1")->fetchAll(PDO::FETCH_ASSOC);
        // 코어 4개만 복사
        $cores = $pdo->query("SELECT name,file_name,nav_label,anchor_id,params,sort_order FROM front_sections WHERE group_id=1 AND file_name IN ('_site','_nav','top_banner','_ft')")->fetchAll(PDO::FETCH_ASSOC);
        $stmt = $pdo->prepare("INSERT INTO front_sections (`key`,name,file_name,is_active,nav_label,anchor_id,params,sort_order,group_id) VALUES (?,?,?,1,?,?,?,?,?)");
        foreach ($cores as $c) {
            $key = 'grp'.$id.'_'.$c['file_name'].'_'.time().rand(100,999);
            $stmt->execute([$key,$c['name'],$c['file_name'],$c['nav_label'],$c['anchor_id'],$c['params'],$c['sort_order'],$id]);
        }
    }
    logAdminAction($pdo, $id>0?'update':'insert', 'section_groups', (string)$id);
    echo json_encode(['ok'=>true,'id'=>$id]); exit;
}

if ($action === 'sectionGroupDelete') {
    $id = (int)($_POST['id'] ?? 0);
    $row = $pdo->prepare("SELECT is_default FROM section_groups WHERE id=?")->execute([$id]) ? $pdo->query("SELECT is_default FROM section_groups WHERE id=$id")->fetchColumn() : 1;
    if ($row) { echo json_encode(['ok'=>false,'msg'=>'기본 그룹은 삭제할 수 없습니다.']); exit; }
    $pdo->prepare("DELETE FROM front_sections WHERE group_id=? AND `key` NOT IN (SELECT `key` FROM (SELECT `key` FROM front_sections WHERE group_id=1) t)")->execute([$id]);
    $pdo->prepare("DELETE FROM front_sections WHERE group_id=?")->execute([$id]);
    $pdo->prepare("DELETE FROM section_groups WHERE id=? AND is_default=0")->execute([$id]);
    logAdminAction($pdo,'delete','section_groups',(string)$id);
    echo json_encode(['ok'=>true]); exit;
}

/* =====================================================
   컬러 그룹
===================================================== */
if ($action === 'colorGroupList') {
    $rows = $pdo->query("SELECT id,name,color_base,color_point,color_sub,color_sub2,is_default FROM color_groups ORDER BY is_default DESC, id")->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['ok'=>true,'data'=>$rows]); exit;
}

if ($action === 'colorGroupSave') {
    $id     = (int)($_POST['id'] ?? 0);
    $name   = trim($_POST['name'] ?? '');
    $hex = fn($v,$d) => preg_match('/^#[0-9a-fA-F]{3,8}$/', trim($v)) ? trim($v) : $d;
    $base   = $hex($_POST['color_base']  ?? '', '#1255a6');
    $point  = $hex($_POST['color_point'] ?? '', '#1e7fe8');
    $sub    = $hex($_POST['color_sub']   ?? '', '#00c6ff');
    $sub2   = $hex($_POST['color_sub2']  ?? '', '#ff6b35');
    if ($name === '') { echo json_encode(['ok'=>false,'msg'=>'그룹명을 입력하세요.']); exit; }
    if ($id > 0) {
        $pdo->prepare("UPDATE color_groups SET name=?,color_base=?,color_point=?,color_sub=?,color_sub2=? WHERE id=?")->execute([$name,$base,$point,$sub,$sub2,$id]);
        // 기본 그룹이면 homepage_info도 동기화
        $isDef = $pdo->query("SELECT is_default FROM color_groups WHERE id=$id")->fetchColumn();
        if ($isDef) {
            $pdo->prepare("UPDATE homepage_info SET color_base=?,color_point=?,color_sub=?,color_sub2=? WHERE id=1")->execute([$base,$point,$sub,$sub2]);
        }
    } else {
        $pdo->prepare("INSERT INTO color_groups (name,color_base,color_point,color_sub,color_sub2,is_default) VALUES (?,?,?,?,?,0)")->execute([$name,$base,$point,$sub,$sub2]);
        $id = $pdo->lastInsertId();
    }
    logAdminAction($pdo,$id>0?'update':'insert','color_groups',(string)$id);
    echo json_encode(['ok'=>true,'id'=>$id]); exit;
}

if ($action === 'colorGroupDelete') {
    $id = (int)($_POST['id'] ?? 0);
    $isDef = $pdo->query("SELECT is_default FROM color_groups WHERE id=$id")->fetchColumn();
    if ($isDef) { echo json_encode(['ok'=>false,'msg'=>'기본 컬러 그룹은 삭제할 수 없습니다.']); exit; }
    $pdo->prepare("DELETE FROM color_groups WHERE id=? AND is_default=0")->execute([$id]);
    logAdminAction($pdo,'delete','color_groups',(string)$id);
    echo json_encode(['ok'=>true]); exit;
}

/* =====================================================
   섹션 그룹별 front_sections 조회/저장 (기존 system.php 확장)
===================================================== */
if ($action === 'dynSectionListByGroup') {
    $gid = (int)($_GET['group_id'] ?? $_POST['group_id'] ?? 1);
    $rows = $pdo->prepare("SELECT id,`key`,name,file_name,is_active,nav_label,anchor_id,params,sort_order,group_id FROM front_sections WHERE group_id=? ORDER BY sort_order,id")->execute([$gid]) ? true : false;
    $stmt = $pdo->prepare("SELECT id,`key`,name,file_name,is_active,nav_label,anchor_id,params,sort_order,group_id FROM front_sections WHERE group_id=? ORDER BY sort_order,id");
    $stmt->execute([$gid]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $libBase = realpath(__DIR__ . '/../../lib') . DIRECTORY_SEPARATOR;
    $coreFiles = ['_site','_nav','_ft'];
    foreach ($rows as &$row) {
        if (in_array($row['file_name'],$coreFiles,true)) { $row['file_missing']=false; continue; }
        $fn = preg_replace('/[^a-zA-Z0-9_\-]/','',pathinfo($row['file_name'],PATHINFO_FILENAME));
        $row['file_missing'] = ($fn===''||!file_exists($libBase.$fn.'.php'));
    }
    echo json_encode(['ok'=>true,'data'=>$rows]); exit;
}

/* =====================================================
   디자인 페이지 목록/저장/삭제
===================================================== */
if ($action === 'designPageList') {
    $rows = $pdo->query("SELECT p.*,sg.name as section_group_name,cg.name as color_group_name FROM design_pages p LEFT JOIN section_groups sg ON sg.id=p.section_group_id LEFT JOIN color_groups cg ON cg.id=p.color_group_id ORDER BY p.id DESC")->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['ok'=>true,'data'=>$rows]); exit;
}

if ($action === 'designPageSave') {
    $id       = (int)($_POST['id'] ?? 0);
    $slug     = preg_replace('/[^a-zA-Z0-9_\-]/', '', trim($_POST['slug'] ?? ''));
    $label    = trim($_POST['label'] ?? '');
    $sgId     = (int)($_POST['section_group_id'] ?? 1);
    $cgId     = (int)($_POST['color_group_id']   ?? 1);
    $extraCss = $_POST['extra_css'] ?? '';

    if ($slug === '') { echo json_encode(['ok'=>false,'msg'=>'파일명을 입력하세요.']); exit; }
    if (in_array($slug, ['index','admin','lib','js','style','img','chatbot'], true)) {
        echo json_encode(['ok'=>false,'msg'=>'사용할 수 없는 파일명입니다.']); exit;
    }

    $rootDir = realpath(__DIR__ . '/../../') . '/';
    $filePath = $rootDir . $slug . '.php';

    // 페이지 PHP 파일 생성
    $phpContent = "<?php\n// [자동생성] 디자인 만들기 — {$slug}\ndefined('PAGE_SECTION_GROUP') || define('PAGE_SECTION_GROUP', {$sgId});\ndefined('PAGE_COLOR_GROUP')   || define('PAGE_COLOR_GROUP',   {$cgId});\n";
    if (trim($extraCss) !== '') {
        $escaped = addslashes($extraCss);
        $phpContent .= "defined('PAGE_EXTRA_CSS') || define('PAGE_EXTRA_CSS', '" . $escaped . "');\n";
    }
    $phpContent .= "include __DIR__ . '/index.php';\n";

    if (!file_put_contents($filePath, $phpContent)) {
        echo json_encode(['ok'=>false,'msg'=>'파일 생성에 실패했습니다. 서버 권한을 확인하세요.']); exit;
    }

    if ($id > 0) {
        $pdo->prepare("UPDATE design_pages SET slug=?,label=?,section_group_id=?,color_group_id=?,extra_css=? WHERE id=?")->execute([$slug,$label,$sgId,$cgId,$extraCss,$id]);
    } else {
        $pdo->prepare("INSERT INTO design_pages (slug,label,section_group_id,color_group_id,extra_css) VALUES (?,?,?,?,?)")->execute([$slug,$label,$sgId,$cgId,$extraCss]);
        $id = $pdo->lastInsertId();
    }
    logAdminAction($pdo,$id>0?'update':'insert','design_pages',(string)$id);
    echo json_encode(['ok'=>true,'id'=>$id,'file'=>'/'.$slug.'.php']); exit;
}

if ($action === 'designPageDelete') {
    $id = (int)($_POST['id'] ?? 0);
    $row = $pdo->prepare("SELECT slug FROM design_pages WHERE id=?") ? null : null;
    $stmt = $pdo->prepare("SELECT slug FROM design_pages WHERE id=?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $rootDir  = realpath(__DIR__ . '/../../') . '/';
        $filePath = $rootDir . $row['slug'] . '.php';
        if (file_exists($filePath)) {
            // 자동생성 파일인지 확인
            $contents = file_get_contents($filePath);
            if (strpos($contents, '// [자동생성]') !== false) {
                @unlink($filePath);
            }
        }
        $pdo->prepare("DELETE FROM design_pages WHERE id=?")->execute([$id]);
        logAdminAction($pdo,'delete','design_pages',(string)$id);
    }
    echo json_encode(['ok'=>true]); exit;
}

echo json_encode(['ok'=>false,'msg'=>'unknown action']);
