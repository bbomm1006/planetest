<?php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json; charset=utf-8');
set_error_handler(function($no,$str,$file,$line){ echo json_encode(['ok'=>false,'error'=>"PHP[$no]:$str $file:$line"]); exit; });
set_exception_handler(function($e){ echo json_encode(['ok'=>false,'error'=>$e->getMessage()]); exit; });

$pdo    = getDB();
$action = $_GET['action'] ?? $_POST['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

/* ══════════════════════════════════════
   GET: 지점(매장) 목록
   /reserve_public.php?action=branches
══════════════════════════════════════ */
if ($action === 'branches') {
    $rows = $pdo->query(
        "SELECT id, store_name, branch_name, address, lat, lng, phone, open_hours, memo, sort_order
         FROM stores ORDER BY sort_order, id"
    )->fetchAll();
    $data = array_map(function($r) {
        // region: 주소에서 시/도 + 시/군/구 추출
        $region = '';
        if ($r['address']) {
            $parts = preg_split('/\s+/', trim($r['address']));
            $region = implode(' ', array_slice($parts, 0, 2));
        }
        return [
            'id'          => (int)$r['id'],
            'name'        => $r['store_name'] . ' ' . $r['branch_name'],
            'store_name'  => $r['store_name'],
            'branch_name' => $r['branch_name'],
            'address'     => $r['address'],
            'region'      => $region,
            'lat'         => $r['lat'],
            'lng'         => $r['lng'],
            'phone'       => $r['phone'],
            'open_hours'  => $r['open_hours'],
            'description' => $r['memo'],
        ];
    }, $rows);
    echo json_encode(['ok' => true, 'data' => $data]);
    exit;
}

/* ══════════════════════════════════════
   GET: 지점별 예약 시간 슬롯 (items)
   /reserve_public.php?action=items&branch_id=1
══════════════════════════════════════ */
if ($action === 'items') {
    $store_id = (int)($_GET['branch_id'] ?? 0);
    $sql = "SELECT rt.id, rt.store_id, rt.description, rt.start_time, rt.end_time,
                   CAST(rt.items AS CHAR) AS items_json, rt.is_active, rt.sort_order
            FROM reservation_times rt
            WHERE rt.is_active = 1";
    $params = [];
    if ($store_id > 0) { $sql .= ' AND rt.store_id = ?'; $params[] = $store_id; }
    $sql .= ' ORDER BY rt.sort_order, rt.id';
    $st = $pdo->prepare($sql); $st->execute($params);
    $rows = $st->fetchAll();
    $data = array_map(function($r) {
        $items = [];
        if ($r['items_json']) {
            try { $items = json_decode($r['items_json'], true) ?: []; } catch(Exception $e) {}
        }
        return [
            'id'          => (int)$r['id'],
            'store_id'    => (int)$r['store_id'],
            'name'        => $r['description'] ?: ($r['start_time'] . ' ~ ' . $r['end_time']),
            'description' => $r['description'],
            'start_time'  => $r['start_time'],
            'end_time'    => $r['end_time'],
            'items'       => $items,
        ];
    }, $rows);
    echo json_encode(['ok' => true, 'data' => $data]);
    exit;
}

/* ══════════════════════════════════════
   GET: 날짜별 예약 가능 여부
   /reserve_public.php?action=availability&branch_id=1&item_id=2&year=2026&month=3
   또는 &date=2026-03-20 (단일 날짜)
══════════════════════════════════════ */
if ($action === 'availability') {
    $store_id = (int)($_GET['branch_id'] ?? 0);
    $item_id  = (int)($_GET['item_id']   ?? 0);
    $year     = (int)($_GET['year']      ?? date('Y'));
    $month    = (int)($_GET['month']     ?? date('n'));
    $date     = trim($_GET['date']       ?? '');

    // 해당 item(reservation_times)의 max_capacity = items 배열 총합
    $rt = null;
    if ($item_id > 0) {
        $st = $pdo->prepare('SELECT * FROM reservation_times WHERE id=?');
        $st->execute([$item_id]);
        $rt = $st->fetch();
    }

    $maxCap = 0;
    if ($rt && $rt['items']) {
        $its = json_decode($rt['items'], true) ?: [];
        foreach ($its as $it) {
            $maxCap += (int)($it['capacity'] ?? $it['count'] ?? 1);
        }
        if ($maxCap === 0) $maxCap = count($its) ?: 1;
    }
    if ($maxCap === 0) $maxCap = 10; // 기본값

    // 날짜 범위 결정
    if ($date) {
        $dateFrom = $date;
        $dateTo   = $date;
    } else {
        $dateFrom = sprintf('%04d-%02d-01', $year, $month);
        $dateTo   = date('Y-m-t', strtotime($dateFrom));
    }

    // 해당 기간 예약 수 집계
    $sql = "SELECT reserve_date, COUNT(*) AS booked_count
            FROM reservations
            WHERE store_id = ? AND reserve_time_id = ?
              AND status NOT IN ('cancelled')
              AND reserve_date BETWEEN ? AND ?
            GROUP BY reserve_date";
    $st = $pdo->prepare($sql);
    $st->execute([$store_id, $item_id, $dateFrom, $dateTo]);
    $booked = [];
    foreach ($st->fetchAll() as $row) {
        $booked[$row['reserve_date']] = (int)$row['booked_count'];
    }

    if ($date) {
        // 단일 날짜 응답
        $cnt     = $booked[$date] ?? 0;
        $remain  = max(0, $maxCap - $cnt);
        $isFull  = ($cnt >= $maxCap);
        echo json_encode(['ok' => true, 'item' => [
            'avail_date'   => $date,
            'max_capacity' => $maxCap,
            'booked_count' => $cnt,
            'remain'       => $remain,
            'is_full'      => $isFull ? 1 : 0,
            'is_closed'    => 0,
        ]]);
        exit;
    }

    // 월별 응답
    $data = [];
    $cur = new DateTime($dateFrom);
    $end = new DateTime($dateTo);
    while ($cur <= $end) {
        $d   = $cur->format('Y-m-d');
        $cnt = $booked[$d] ?? 0;
        $remain = max(0, $maxCap - $cnt);
        $data[] = [
            'avail_date'   => $d,
            'max_capacity' => $maxCap,
            'booked_count' => $cnt,
            'remain'       => $remain,
            'is_full'      => ($cnt >= $maxCap) ? 1 : 0,
            'is_closed'    => 0,
        ];
        $cur->modify('+1 day');
    }
    echo json_encode(['ok' => true, 'data' => $data]);
    exit;
}

/* ══════════════════════════════════════
   POST: 예약 등록
   /reserve_public.php?action=create
══════════════════════════════════════ */
if ($action === 'create' && $method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];

    $store_id        = (int)($input['branch_id']    ?? 0);
    $reserve_time_id = (int)($input['item_id']      ?? 0);
    $name            = trim($input['name']           ?? '');
    $phone           = trim($input['phone']          ?? '');
    $email           = trim($input['email']          ?? '');
    $reserve_date    = trim($input['reserve_date']   ?? '');
    $reserve_time    = trim($input['reserve_time']   ?? '');
    $reserve_item    = trim($input['reserve_item']   ?? '');
    $memo            = trim($input['message']        ?? '');

    if (!$store_id || !$name || !$phone || !$reserve_date) {
        echo json_encode(['ok' => false, 'error' => '필수 항목이 누락되었습니다.']);
        exit;
    }

    // 예약번호 생성
    $res_number = 'PB-' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 4));

    // reserve_item 컬럼 없으면 추가
    try { $pdo->query('SELECT reserve_item FROM reservations LIMIT 1'); }
    catch (Exception $e) { $pdo->exec("ALTER TABLE reservations ADD COLUMN reserve_item VARCHAR(255) DEFAULT NULL"); }

    // res_number 컬럼 없으면 추가
    try { $pdo->query('SELECT res_number FROM reservations LIMIT 1'); }
    catch (Exception $e) { $pdo->exec("ALTER TABLE reservations ADD COLUMN res_number VARCHAR(50) DEFAULT NULL"); }

    $pdo->prepare(
        "INSERT INTO reservations (store_id, reserve_time_id, status, name, phone, email,
                                   reserve_date, reserve_item, memo, res_number)
         VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)"
    )->execute([$store_id, $reserve_time_id ?: null, $name, $phone, $email,
                $reserve_date, $reserve_item, $memo, '']);  // 임시 빈값

    $id = (int)$pdo->lastInsertId();
    // 관리자와 동일한 RES-XXXXXX 형식
    $res_number = 'RES-' . str_pad($id, 6, '0', STR_PAD_LEFT);
    $pdo->prepare("UPDATE reservations SET res_number=? WHERE id=?")->execute([$res_number, $id]);

    // 잔여 수량 계산
    $rt = null;
    if ($reserve_time_id) {
        $st = $pdo->prepare('SELECT items FROM reservation_times WHERE id=?');
        $st->execute([$reserve_time_id]);
        $rt = $st->fetch();
    }
    $maxCap = 10;
    if ($rt && $rt['items']) {
        $its = json_decode($rt['items'], true) ?: [];
        $maxCap = 0;
        foreach ($its as $it) $maxCap += (int)($it['capacity'] ?? $it['count'] ?? 1);
        if ($maxCap === 0) $maxCap = count($its) ?: 10;
    }
    $stC = $pdo->prepare("SELECT COUNT(*) FROM reservations WHERE store_id=? AND reserve_time_id=? AND reserve_date=? AND status!='cancelled'");
    $stC->execute([$store_id, $reserve_time_id ?: 0, $reserve_date]);
    $booked = (int)$stC->fetchColumn();
    $remain = max(0, $maxCap - $booked);

    echo json_encode([
        'ok'         => true,
        'id'         => $id,
        'res_number' => $res_number,
        'remain'     => $remain,
        'is_full'    => $remain <= 0,
    ]);
    exit;
}

/* ══════════════════════════════════════
   GET: 예약 조회 (이름+전화 or 예약번호)
   /reserve_public.php?action=lookup&name=홍길동&phone=010-...
   /reserve_public.php?action=lookup&res_number=PB-...
══════════════════════════════════════ */
if ($action === 'lookup') {
    $name       = trim($_GET['name']       ?? '');
    $phone      = trim($_GET['phone']      ?? '');
    $res_number = trim($_GET['res_number'] ?? '');

    try { $pdo->query('SELECT res_number FROM reservations LIMIT 1'); }
    catch (Exception $e) { $pdo->exec("ALTER TABLE reservations ADD COLUMN res_number VARCHAR(50) DEFAULT NULL"); }

    $sql = "SELECT r.id, r.status, r.name, r.phone, r.email,
                   r.reserve_date, r.reserve_item, r.res_number,
                   rt.start_time, rt.end_time, rt.description AS time_desc,
                   s.store_name, s.branch_name, r.memo, r.admin_memo,
                   r.reserve_time_id, r.store_id,
                   DATE_FORMAT(r.created_at,'%Y-%m-%d %H:%i') AS created_at
            FROM reservations r
            LEFT JOIN stores s ON s.id = r.store_id
            LEFT JOIN reservation_times rt ON rt.id = r.reserve_time_id
            WHERE 1=1";
    $params = [];

    if ($res_number) {
        // res_number로 먼저 검색, 없으면 숫자면 id로도 검색
        $sql .= ' AND (r.res_number = ?' . (ctype_digit($res_number) ? ' OR r.id = ?' : '') . ')';
        $params[] = $res_number;
        if (ctype_digit($res_number)) $params[] = (int)$res_number;
    } elseif ($name && $phone) {
        $phone_clean = preg_replace('/[^0-9]/', '', $phone);
        $sql .= ' AND r.name = ? AND REPLACE(REPLACE(r.phone,\'-\',\'\'),\' \',\'\') = ?';
        $params[] = $name;
        $params[] = $phone_clean;
    } else {
        echo json_encode(['ok' => false, 'error' => '검색 조건이 없습니다.']);
        exit;
    }
    $sql .= ' ORDER BY r.reserve_date DESC, r.id DESC LIMIT 20';
    $st = $pdo->prepare($sql); $st->execute($params);
    $rows = $st->fetchAll();

    $data = array_map(function($r) {
        $status_map = ['pending'=>'접수','confirmed'=>'확인','cancelled'=>'취소','completed'=>'완료'];
        $time_label = '';
        if ($r['start_time']) $time_label = substr($r['start_time'],0,5) . ' ~ ' . substr($r['end_time'],0,5);
        $res_num = isset($r['res_number']) ? $r['res_number'] : '';
        return [
            'id'           => (int)$r['id'],
            'res_number'   => $res_num,
            'status'       => $status_map[$r['status']] ?? $r['status'],
            'status_raw'   => $r['status'],
            'name'         => $r['name'],
            'phone'        => $r['phone'],
            'email'        => $r['email'],
            'reserve_date' => $r['reserve_date'],
            'reserve_time' => $time_label,
            'reserve_item' => $r['reserve_item'],
            'branch_name'  => ($r['store_name'] ?? '') . ' ' . ($r['branch_name'] ?? ''),
            'branch_id'    => (int)$r['store_id'],
            'item_id'      => (int)$r['reserve_time_id'],
            'message'      => $r['memo'],
            'admin_memo'   => $r['admin_memo'],
            'created_at'   => $r['created_at'],
        ];
    }, $rows);

    echo json_encode(['ok' => true, 'data' => $data]);
    exit;
}

/* ══════════════════════════════════════
   PUT: 예약 변경/취소
   /reserve_public.php?action=update&id=1
══════════════════════════════════════ */
if (($action === 'update' || $method === 'PUT') && isset($_GET['id'])) {
    $id    = (int)$_GET['id'];
    $input = json_decode(file_get_contents('php://input'), true) ?: [];

    // 관리자 확인 상태면 변경 불가
    $st = $pdo->prepare('SELECT status FROM reservations WHERE id=?');
    $st->execute([$id]);
    $cur = $st->fetch();
    if (!$cur) { echo json_encode(['ok'=>false,'error'=>'예약을 찾을 수 없습니다.']); exit; }
    if ($cur['status'] === 'confirmed') {
        echo json_encode(['ok'=>false,'error'=>'관리자가 확인한 예약은 변경할 수 없습니다.','admin_confirmed'=>true]);
        exit;
    }

    if (isset($input['status']) && $input['status'] === '취소') {
        $pdo->prepare("UPDATE reservations SET status='cancelled' WHERE id=?")->execute([$id]);
        echo json_encode(['ok'=>true]);
        exit;
    }

    if (isset($input['new_date'])) {
        $newDate = $input['new_date'];
        $newTime = $input['new_time'] ?? null;
        $pdo->prepare("UPDATE reservations SET reserve_date=?" . ($newTime!==null?",reserve_item=?":'') . " WHERE id=?")
            ->execute($newTime !== null ? [$newDate, $newTime, $id] : [$newDate, $id]);
        echo json_encode(['ok'=>true]);
        exit;
    }

    echo json_encode(['ok'=>false,'error'=>'Unknown action']);
    exit;
}

echo json_encode(['ok'=>false,'error'=>'Unknown action']);