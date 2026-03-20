<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/log_helper.php';
header('Content-Type: application/json; charset=utf-8');
set_error_handler(function($no,$str,$file,$line){ echo json_encode(['ok'=>false,'msg'=>"PHP[$no]:$str $file:$line"]); exit; });
set_exception_handler(function($e){ echo json_encode(['ok'=>false,'msg'=>$e->getMessage()]); exit; });
requireLogin();
$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo = getDB();

/* ── 분류 ── */
if ($action === 'catList') {
    $rows = $pdo->query('SELECT id,name,is_active,sort_order FROM product_categories ORDER BY sort_order,id')->fetchAll();
    echo json_encode(['ok'=>true,'data'=>$rows]); exit;
}
if ($action === 'catCreate') {
    $name = trim($_POST['name'] ?? '');
    if (!$name) { echo json_encode(['ok'=>false,'msg'=>'분류명을 입력하세요.']); exit; }
    $max = $pdo->query('SELECT COALESCE(MAX(sort_order),0) FROM product_categories')->fetchColumn();
    $pdo->prepare('INSERT INTO product_categories (name,sort_order) VALUES (?,?)')->execute([$name,$max+1]);
    echo json_encode(['ok'=>true,'id'=>(int)$pdo->lastInsertId()]); exit;
}
if ($action === 'catUpdate') {
    $id = (int)($_POST['id']??0); $name = trim($_POST['name']??'');
    if (!$name) { echo json_encode(['ok'=>false,'msg'=>'분류명을 입력하세요.']); exit; }
    $pdo->prepare('UPDATE product_categories SET name=? WHERE id=?')->execute([$name,$id]);
    echo json_encode(['ok'=>true]); exit;
}
if ($action === 'catToggle') {
    $id = (int)($_POST['id']??0);
    $pdo->prepare('UPDATE product_categories SET is_active=1-is_active WHERE id=?')->execute([$id]);
    $st=$pdo->prepare('SELECT is_active FROM product_categories WHERE id=?'); $st->execute([$id]);
    echo json_encode(['ok'=>true,'is_active'=>(int)$st->fetchColumn()]); exit;
}
if ($action === 'catDelete') {
    $id = (int)($_POST['id']??0);
    $pdo->prepare('DELETE FROM product_categories WHERE id=?')->execute([$id]);
    echo json_encode(['ok'=>true]); exit;
}
if ($action === 'catReorder') {
    $ids = json_decode($_POST['ids']??'[]',true)?:[];
    $st  = $pdo->prepare('UPDATE product_categories SET sort_order=? WHERE id=?');
    foreach($ids as $i=>$id) $st->execute([$i+1,(int)$id]);
    echo json_encode(['ok'=>true]); exit;
}

/* ── 상담 목록 ── */
if ($action === 'list') {
    $cat_id = (int)($_GET['cat_id']??0);
    $status = trim($_GET['status']??'');
    $kw     = trim($_GET['kw']??'');
    $sql = "SELECT c.id, c.status, c.name, c.phone, c.product, c.admin_memo,
           CAST(c.extra_fields AS CHAR) AS extra_fields,
           cat.name AS cat_name,
           DATE_FORMAT(c.created_at,'%Y-%m-%d %H:%i') AS created_at
    FROM consults c
    LEFT JOIN product_categories cat ON cat.id = c.category_id
    WHERE 1=1";
    $params=[];
    if ($cat_id>0) { $sql.=' AND c.category_id=?'; $params[]=$cat_id; }
    if ($status)   { $sql.=' AND c.status=?';       $params[]=$status; }
    if ($kw)       { $sql.=' AND (c.name LIKE ? OR c.phone LIKE ?)'; $params[]="%$kw%"; $params[]="%$kw%"; }
    $sql.=' ORDER BY c.id DESC';
    $st=$pdo->prepare($sql);
    $st->execute($params);
    $rows = $st->fetchAll(PDO::FETCH_ASSOC);  // ← 이게 핵심
    echo json_encode(['ok'=>true,'data'=>$rows]); exit;
}

/* ── 상태 변경 + 메모 저장 ── */
if ($action === 'update') {
    $id     = (int)($_POST['id']??0);
    $status = trim($_POST['status']??'');
    $memo   = trim($_POST['admin_memo']??'');
    $pdo->prepare('UPDATE consults SET status=?, admin_memo=? WHERE id=?')->execute([$status,$memo,$id]);
    $_cn = $pdo->prepare('SELECT name FROM consults WHERE id=?'); $_cn->execute([$id]); $_cr = $_cn->fetch();
    logAdminAction($pdo,'update','consults',(string)$id,[],['name'=>$_cr['name']??'','status'=>$status]);
    echo json_encode(['ok'=>true]); exit;
}

/* ── 삭제 ── */
if ($action === 'delete') {
    $id = (int)($_POST['id']??0);
    $_cn2 = $pdo->prepare('SELECT name FROM consults WHERE id=?'); $_cn2->execute([$id]); $_cr2 = $_cn2->fetch();
    $pdo->prepare('DELETE FROM consults WHERE id=?')->execute([$id]);
    logAdminAction($pdo,'delete','consults',(string)$id,[],['name'=>$_cr2['name']??'']);
    echo json_encode(['ok'=>true]); exit;
}
if ($action === 'bulkDelete') {
    $ids = json_decode($_POST['ids']??'[]',true)?:[];
    $st  = $pdo->prepare('DELETE FROM consults WHERE id=?');
    foreach($ids as $id) $st->execute([(int)$id]);
    logAdminAction($pdo,'delete','consults','bulk');
    echo json_encode(['ok'=>true]); exit;
}
echo json_encode(['ok'=>false,'msg'=>'Unknown action']);