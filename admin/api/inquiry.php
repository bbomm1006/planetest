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
    $rows = $pdo->query('SELECT id,name,is_active,sort_order FROM inquiry_categories ORDER BY sort_order,id')->fetchAll();
    echo json_encode(['ok'=>true,'data'=>$rows]); exit;
}
if ($action === 'catCreate') {
    $name = trim($_POST['name']??'');
    if (!$name) { echo json_encode(['ok'=>false,'msg'=>'분류명을 입력하세요.']); exit; }
    $max = $pdo->query('SELECT COALESCE(MAX(sort_order),0) FROM inquiry_categories')->fetchColumn();
    $pdo->prepare('INSERT INTO inquiry_categories (name,sort_order) VALUES (?,?)')->execute([$name,$max+1]);
    echo json_encode(['ok'=>true,'id'=>(int)$pdo->lastInsertId()]); exit;
}
if ($action === 'catUpdate') {
    $id=(int)($_POST['id']??0); $name=trim($_POST['name']??'');
    if (!$name) { echo json_encode(['ok'=>false,'msg'=>'분류명을 입력하세요.']); exit; }
    $pdo->prepare('UPDATE inquiry_categories SET name=? WHERE id=?')->execute([$name,$id]);
    echo json_encode(['ok'=>true]); exit;
}
if ($action === 'catToggle') {
    $id=(int)($_POST['id']??0);
    $pdo->prepare('UPDATE inquiry_categories SET is_active=1-is_active WHERE id=?')->execute([$id]);
    $st=$pdo->prepare('SELECT is_active FROM inquiry_categories WHERE id=?'); $st->execute([$id]);
    echo json_encode(['ok'=>true,'is_active'=>(int)$st->fetchColumn()]); exit;
}
if ($action === 'catDelete') {
    $id=(int)($_POST['id']??0);
    $pdo->prepare('DELETE FROM inquiry_categories WHERE id=?')->execute([$id]);
    echo json_encode(['ok'=>true]); exit;
}
if ($action === 'catReorder') {
    $ids=json_decode($_POST['ids']??'[]',true)?:[];
    $st=$pdo->prepare('UPDATE inquiry_categories SET sort_order=? WHERE id=?');
    foreach($ids as $i=>$id) $st->execute([$i+1,(int)$id]);
    echo json_encode(['ok'=>true]); exit;
}

/* ── 문의 목록 ── */
if ($action === 'list') {
    $cat_id   = (int)($_GET['cat_id']??0);
    $status   = trim($_GET['status']??'');
    $is_public= trim($_GET['is_public']??'');
    $kw       = trim($_GET['kw']??'');
    $sql      = "SELECT i.id, i.status, i.name, i.phone, i.email, i.is_public, i.content,
                        cat.name AS cat_name,
                        DATE_FORMAT(i.created_at,'%Y-%m-%d %H:%i') AS created_at,
                        (SELECT COUNT(*) FROM inquiry_answers a WHERE a.inquiry_id=i.id) AS answer_cnt
                 FROM inquiries i LEFT JOIN inquiry_categories cat ON cat.id=i.category_id WHERE 1=1";
    $params=[];
    if ($cat_id>0)    { $sql.=' AND i.category_id=?'; $params[]=$cat_id; }
    if ($status)      { $sql.=' AND i.status=?';       $params[]=$status; }
    if ($is_public!==''){ $sql.=' AND i.is_public=?';  $params[]=(int)$is_public; }
    if ($kw)          { $sql.=' AND (i.name LIKE ? OR i.email LIKE ?)'; $params[]="%$kw%"; $params[]="%$kw%"; }
    $sql.=' ORDER BY i.id DESC';
    $st=$pdo->prepare($sql); $st->execute($params);
    echo json_encode(['ok'=>true,'data'=>$st->fetchAll()]); exit;
}

/* ── 상세 (답변 포함) ── */
if ($action === 'get') {
    $id=(int)($_GET['id']??0);
    $st=$pdo->prepare("SELECT i.*, cat.name AS cat_name,
                               DATE_FORMAT(i.created_at,'%Y-%m-%d %H:%i') AS created_at
                        FROM inquiries i LEFT JOIN inquiry_categories cat ON cat.id=i.category_id
                        WHERE i.id=?");
    $st->execute([$id]); $row=$st->fetch();
    if (!$row) { echo json_encode(['ok'=>false,'msg'=>'없는 문의']); exit; }
    $as=$pdo->prepare("SELECT id,content,DATE_FORMAT(created_at,'%Y-%m-%d %H:%i') AS created_at FROM inquiry_answers WHERE inquiry_id=? ORDER BY id DESC");
    $as->execute([$id]); $row['answers']=$as->fetchAll();
    echo json_encode(['ok'=>true,'data'=>$row]); exit;
}

/* ── 상태/공개 변경 ── */
if ($action === 'update') {
    $id        = (int)($_POST['id']??0);
    $status    = trim($_POST['status']??'');
    $is_public = (int)($_POST['is_public']??1);
    $pdo->prepare('UPDATE inquiries SET status=?, is_public=? WHERE id=?')->execute([$status,$is_public,$id]);
    $_in = $pdo->prepare('SELECT name FROM inquiries WHERE id=?'); $_in->execute([$id]); $_ir = $_in->fetch();
    logAdminAction($pdo,'update','inquiries',(string)$id,[],['name'=>$_ir['name']??'','status'=>$status]);
    echo json_encode(['ok'=>true]); exit;
}

/* ── 답변 저장 ── */
if ($action === 'answerSave') {
    $inquiry_id = (int)($_POST['inquiry_id']??0);
    $answer_id  = (int)($_POST['answer_id']??0);
    $content    = trim($_POST['content']??'');
    $admin_id   = $_SESSION['admin_id'] ?? null;
    if (!$content) { echo json_encode(['ok'=>false,'msg'=>'답변 내용을 입력하세요.']); exit; }
    if ($answer_id > 0) {
        $pdo->prepare('UPDATE inquiry_answers SET content=? WHERE id=?')->execute([$content,$answer_id]);
    } else {
        $pdo->prepare('INSERT INTO inquiry_answers (inquiry_id,admin_id,content) VALUES (?,?,?)')->execute([$inquiry_id,$admin_id,$content]);
        // 상태 자동 완료
        $pdo->prepare("UPDATE inquiries SET status='completed' WHERE id=?")->execute([$inquiry_id]);
    }
    echo json_encode(['ok'=>true]); exit;
}

/* ── 답변 삭제 ── */
if ($action === 'answerDelete') {
    $id=(int)($_POST['id']??0);
    $pdo->prepare('DELETE FROM inquiry_answers WHERE id=?')->execute([$id]);
    echo json_encode(['ok'=>true]); exit;
}

/* ── 삭제 ── */
if ($action === 'delete') {
    $id=(int)($_POST['id']??0);
    $pdo->prepare('DELETE FROM inquiry_answers WHERE inquiry_id=?')->execute([$id]);
    $_in2 = $pdo->prepare('SELECT name FROM inquiries WHERE id=?'); $_in2->execute([$id]); $_ir2 = $_in2->fetch();
    $pdo->prepare('DELETE FROM inquiries WHERE id=?')->execute([$id]);
    logAdminAction($pdo,'delete','inquiries',(string)$id,[],['name'=>$_ir2['name']??'']);
    echo json_encode(['ok'=>true]); exit;
}
if ($action === 'bulkDelete') {
    $ids=json_decode($_POST['ids']??'[]',true)?:[];
    foreach($ids as $id) {
        $id=(int)$id;
        $pdo->prepare('DELETE FROM inquiry_answers WHERE inquiry_id=?')->execute([$id]);
        $pdo->prepare('DELETE FROM inquiries WHERE id=?')->execute([$id]);
    }
    logAdminAction($pdo,'delete','inquiries','bulk');
    echo json_encode(['ok'=>true]); exit;
}
echo json_encode(['ok'=>false,'msg'=>'Unknown action']);