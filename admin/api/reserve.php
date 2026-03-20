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

/* ── 예약 시간 목록 ── */
if ($action === 'timeList') {
    $store_id = (int)($_GET['store_id']??0);
    $sql = "SELECT rt.id, rt.store_id, s.store_name, s.branch_name,
                   rt.description, rt.start_time, rt.end_time,
                   CAST(rt.items AS CHAR) AS items,
                   rt.is_active, rt.sort_order
            FROM reservation_times rt
            LEFT JOIN stores s ON s.id=rt.store_id WHERE 1=1";
    $params=[];
    if ($store_id>0) { $sql.=' AND rt.store_id=?'; $params[]=$store_id; }
    $sql.=' ORDER BY rt.sort_order, rt.id';
    $st=$pdo->prepare($sql); $st->execute($params);
    $rows=$st->fetchAll();
    foreach($rows as &$r) {
        $r['items'] = $r['items'] ? json_decode($r['items'],true) : [];
    }
    echo json_encode(['ok'=>true,'data'=>$rows]); exit;
}

if ($action === 'timeCreate') {
    $store_id   = (int)($_POST['store_id']??0);
    $desc       = trim($_POST['description']??'');
    $start_time = trim($_POST['start_time']??'');
    $end_time   = trim($_POST['end_time']??'');
    $items      = $_POST['items']??'[]';
    $is_active  = (int)($_POST['is_active']??1);
    if (!$store_id||!$start_time||!$end_time) { echo json_encode(['ok'=>false,'msg'=>'매장·시작·종료 시간은 필수입니다.']); exit; }
    $max=$pdo->query('SELECT COALESCE(MAX(sort_order),0) FROM reservation_times')->fetchColumn();
    $pdo->prepare('INSERT INTO reservation_times (store_id,description,start_time,end_time,items,is_active,sort_order) VALUES (?,?,?,?,?,?,?)')
        ->execute([$store_id,$desc,$start_time,$end_time,$items,$is_active,$max+1]);
    echo json_encode(['ok'=>true,'id'=>(int)$pdo->lastInsertId()]); exit;
}

if ($action === 'timeUpdate') {
    $id         = (int)($_POST['id']??0);
    $store_id   = (int)($_POST['store_id']??0);
    $desc       = trim($_POST['description']??'');
    $start_time = trim($_POST['start_time']??'');
    $end_time   = trim($_POST['end_time']??'');
    $items      = $_POST['items']??'[]';
    $is_active  = (int)($_POST['is_active']??1);
    $pdo->prepare('UPDATE reservation_times SET store_id=?,description=?,start_time=?,end_time=?,items=?,is_active=? WHERE id=?')
        ->execute([$store_id,$desc,$start_time,$end_time,$items,$is_active,$id]);
    echo json_encode(['ok'=>true]); exit;
}

if ($action === 'timeDelete') {
    $id=(int)($_POST['id']??0);
    $pdo->prepare('DELETE FROM reservation_times WHERE id=?')->execute([$id]);
    echo json_encode(['ok'=>true]); exit;
}

if ($action === 'timeToggle') {
    $id=(int)($_POST['id']??0);
    $pdo->prepare('UPDATE reservation_times SET is_active=1-is_active WHERE id=?')->execute([$id]);
    $st=$pdo->prepare('SELECT is_active FROM reservation_times WHERE id=?'); $st->execute([$id]);
    echo json_encode(['ok'=>true,'is_active'=>(int)$st->fetchColumn()]); exit;
}

/* ── 예약 내역 ── */
if ($action === 'list') {
    $store_id  = (int)($_GET['store_id']??0);
    $status    = trim($_GET['status']??'');
    $kw        = trim($_GET['kw']??'');
    $date_from = trim($_GET['date_from']??'');
    $date_to   = trim($_GET['date_to']??'');
    $sql = "SELECT r.id, r.status, r.name, r.phone, r.email,
                   r.reserve_date, r.reserve_item,
                   rt.start_time, rt.description AS time_desc,
                   s.store_name, s.branch_name, r.memo, r.admin_memo,
                   DATE_FORMAT(r.created_at,'%Y-%m-%d %H:%i') AS created_at
            FROM reservations r
            LEFT JOIN stores s ON s.id=r.store_id
            LEFT JOIN reservation_times rt ON rt.id=r.reserve_time_id
            WHERE 1=1";
    $params=[];
    if ($store_id>0)  { $sql.=' AND r.store_id=?';          $params[]=$store_id; }
    if ($status)      { $sql.=' AND r.status=?';             $params[]=$status; }
    if ($date_from)   { $sql.=' AND r.reserve_date>=?';      $params[]=$date_from; }
    if ($date_to)     { $sql.=' AND r.reserve_date<=?';      $params[]=$date_to; }
    if ($kw)          { $sql.=' AND (r.name LIKE ? OR r.phone LIKE ?)'; $params[]="%$kw%"; $params[]="%$kw%"; }
    $sql.=' ORDER BY r.reserve_date DESC, r.id DESC';
    $st=$pdo->prepare($sql); $st->execute($params);
    echo json_encode(['ok'=>true,'data'=>$st->fetchAll()]); exit;
}

if ($action === 'update') {
    $id         = (int)($_POST['id']??0);
    $status     = trim($_POST['status']??'');
    $admin_memo = trim($_POST['admin_memo']??'');
    $pdo->prepare('UPDATE reservations SET status=?, admin_memo=? WHERE id=?')->execute([$status,$admin_memo,$id]);
    $_rn = $pdo->prepare('SELECT name FROM reservations WHERE id=?'); $_rn->execute([$id]); $_rr = $_rn->fetch();
    logAdminAction($pdo,'update','reservations',(string)$id,[],['name'=>$_rr['name']??'','status'=>$status]);
    echo json_encode(['ok'=>true]); exit;
}

if ($action === 'delete') {
    $id=(int)($_POST['id']??0);
    $_rn2 = $pdo->prepare('SELECT name FROM reservations WHERE id=?'); $_rn2->execute([$id]); $_rr2 = $_rn2->fetch();
    $pdo->prepare('DELETE FROM reservations WHERE id=?')->execute([$id]);
    logAdminAction($pdo,'delete','reservations',(string)$id,[],['name'=>$_rr2['name']??'']);
    echo json_encode(['ok'=>true]); exit;
}
if ($action === 'bulkDelete') {
    $ids=json_decode($_POST['ids']??'[]',true)?:[];
    $st=$pdo->prepare('DELETE FROM reservations WHERE id=?');
    foreach($ids as $id) $st->execute([(int)$id]);
    logAdminAction($pdo,'delete','reservations','bulk');
    echo json_encode(['ok'=>true]); exit;
}
echo json_encode(['ok'=>false,'msg'=>'Unknown action']);