<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/log_helper.php';

header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo    = getDB();

/* =====================================================
   CATEGORY (product_categories)
   ===================================================== */

if ($action === 'catList') {
    $rows = $pdo->query(
        'SELECT id, name, is_active, sort_order FROM product_categories ORDER BY sort_order, id'
    )->fetchAll();
    echo json_encode(['ok' => true, 'data' => $rows]);
    exit;
}

if ($action === 'catCreate') {
    $name      = trim($_POST['name']      ?? '');
    $is_active = (int)($_POST['is_active'] ?? 1);
    if ($name === '') { echo json_encode(['ok' => false, 'msg' => '분류명을 입력하세요.']); exit; }
    $max = $pdo->query('SELECT COALESCE(MAX(sort_order),0) FROM product_categories')->fetchColumn();
    $pdo->prepare('INSERT INTO product_categories (name, is_active, sort_order) VALUES (?,?,?)')
        ->execute([$name, $is_active, $max + 1]);
    echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    exit;
}

if ($action === 'catUpdate') {
    $id        = (int)($_POST['id']        ?? 0);
    $name      = trim($_POST['name']       ?? '');
    $is_active = (int)($_POST['is_active'] ?? 1);
    if ($id <= 0 || $name === '') { echo json_encode(['ok' => false, 'msg' => '잘못된 요청']); exit; }
    $pdo->prepare('UPDATE product_categories SET name=?, is_active=? WHERE id=?')
        ->execute([$name, $is_active, $id]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'catDelete') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['ok' => false, 'msg' => '잘못된 ID']); exit; }
    // 해당 분류 제품이 있으면 거부
    $ck = $pdo->prepare('SELECT COUNT(*) FROM product_products WHERE category_id=?');
    $ck->execute([$id]);
    if ((int)$ck->fetchColumn() > 0) {
        echo json_encode(['ok' => false, 'msg' => '해당 분류에 제품이 있어 삭제할 수 없습니다.']);
        exit;
    }
    $pdo->prepare('DELETE FROM product_categories WHERE id=?')->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'catReorder') {
    $ids  = json_decode($_POST['ids'] ?? '[]', true) ?: [];
    $stmt = $pdo->prepare('UPDATE product_categories SET sort_order=? WHERE id=?');
    foreach ($ids as $i => $id) $stmt->execute([$i + 1, (int)$id]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'catToggle') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare('UPDATE product_categories SET is_active = 1-is_active WHERE id=?')->execute([$id]);
    $st = $pdo->prepare('SELECT is_active FROM product_categories WHERE id=?');
    $st->execute([$id]);
    echo json_encode(['ok' => true, 'is_active' => (int)$st->fetchColumn()]);
    exit;
}

/* =====================================================
   CARD DISCOUNT (product_discounts)
   ===================================================== */

if ($action === 'cardList') {
    $rows = $pdo->query(
        'SELECT id, card_name, rate, is_active, sort_order FROM product_discounts ORDER BY sort_order, id'
    )->fetchAll();
    echo json_encode(['ok' => true, 'data' => $rows]);
    exit;
}

if ($action === 'cardCreate') {
    $card_name = trim($_POST['card_name'] ?? '');
    $rate      = (float)($_POST['rate']   ?? 0);
    $is_active = (int)($_POST['is_active'] ?? 1);
    if ($card_name === '') { echo json_encode(['ok' => false, 'msg' => '카드사명을 입력하세요.']); exit; }
    $max = $pdo->query('SELECT COALESCE(MAX(sort_order),0) FROM product_discounts')->fetchColumn();
    $pdo->prepare('INSERT INTO product_discounts (card_name, rate, is_active, sort_order) VALUES (?,?,?,?)')
        ->execute([$card_name, $rate, $is_active, $max + 1]);
    echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    exit;
}

if ($action === 'cardUpdate') {
    $id        = (int)($_POST['id']        ?? 0);
    $card_name = trim($_POST['card_name']  ?? '');
    $rate      = (float)($_POST['rate']    ?? 0);
    $is_active = (int)($_POST['is_active'] ?? 1);
    if ($id <= 0 || $card_name === '') { echo json_encode(['ok' => false, 'msg' => '잘못된 요청']); exit; }
    $pdo->prepare('UPDATE product_discounts SET card_name=?, rate=?, is_active=? WHERE id=?')
        ->execute([$card_name, $rate, $is_active, $id]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'cardDelete') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['ok' => false, 'msg' => '잘못된 ID']); exit; }
    $pdo->prepare('DELETE FROM product_discounts WHERE id=?')->execute([$id]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'cardReorder') {
    $ids  = json_decode($_POST['ids'] ?? '[]', true) ?: [];
    $stmt = $pdo->prepare('UPDATE product_discounts SET sort_order=? WHERE id=?');
    foreach ($ids as $i => $id) $stmt->execute([$i + 1, (int)$id]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'cardToggle') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare('UPDATE product_discounts SET is_active = 1-is_active WHERE id=?')->execute([$id]);
    $st = $pdo->prepare('SELECT is_active FROM product_discounts WHERE id=?');
    $st->execute([$id]);
    echo json_encode(['ok' => true, 'is_active' => (int)$st->fetchColumn()]);
    exit;
}

/* =====================================================
   PRODUCT (product_products)
   ===================================================== */

if ($action === 'productList') {
    $cat_id = (int)($_GET['cat_id'] ?? 0);
    $kw     = trim($_GET['kw'] ?? '');
    $sql    = 'SELECT p.id, p.category_id, c.name AS cat_name, p.model_no, p.name,
                      p.badge_text, p.badge_color, p.price, p.discount, p.image, p.sort_order,
                      DATE_FORMAT(p.created_at,"%Y-%m-%d") AS created_at
               FROM product_products p
               LEFT JOIN product_categories c ON c.id = p.category_id
               WHERE 1=1';
    $params = [];
    if ($cat_id > 0) { $sql .= ' AND p.category_id=?'; $params[] = $cat_id; }
    if ($kw !== '')  { $sql .= ' AND (p.name LIKE ? OR p.model_no LIKE ?)'; $params[] = "%$kw%"; $params[] = "%$kw%"; }
    $sql .= ' ORDER BY p.sort_order, p.id';
    $st = $pdo->prepare($sql);
    $st->execute($params);
    echo json_encode(['ok' => true, 'data' => $st->fetchAll()]);
    exit;
}

if ($action === 'productGet') {
    $id = (int)($_GET['id'] ?? 0);
    $st = $pdo->prepare('SELECT * FROM product_products WHERE id=?');
    $st->execute([$id]);
    $row = $st->fetch();
    if (!$row) { echo json_encode(['ok' => false, 'msg' => '없는 제품']); exit; }
    echo json_encode(['ok' => true, 'data' => $row]);
    exit;
}

if ($action === 'productCreate') {
    $cat_id     = (int)($_POST['category_id']  ?? 0);
    $model_no   = trim($_POST['model_no']       ?? '');
    $name       = trim($_POST['name']           ?? '');
    $badge_text = trim($_POST['badge_text']     ?? '');
    $badge_color= trim($_POST['badge_color']    ?? '');
    $price      = (int)($_POST['price']         ?? 0);
    $discount   = (int)($_POST['discount']      ?? 0);
    $short_desc = trim($_POST['short_desc']     ?? '');
    $detail_desc= trim($_POST['detail_desc']    ?? '');
    $image      = trim($_POST['image']          ?? '');
    $tags       = trim($_POST['tags']           ?? '');
    if ($cat_id <= 0 || $model_no === '' || $name === '') {
        echo json_encode(['ok' => false, 'msg' => '분류·모델명·제품명은 필수입니다.']); exit;
    }
    $max = $pdo->query('SELECT COALESCE(MAX(sort_order),0) FROM product_products')->fetchColumn();
    $pdo->prepare(
        'INSERT INTO product_products
         (category_id,model_no,name,badge_text,badge_color,price,discount,short_desc,detail_desc,image,tags,sort_order)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
    )->execute([$cat_id,$model_no,$name,$badge_text,$badge_color,$price,$discount,$short_desc,$detail_desc,$image,$tags,$max+1]);
    $newId = $pdo->lastInsertId();
    logAdminAction($pdo, 'create', 'product_products', (string)$newId, [], ['name' => $name, 'model_no' => $model_no]);
    echo json_encode(['ok' => true, 'id' => (int)$newId]);
    exit;
}

if ($action === 'productUpdate') {
    $id         = (int)($_POST['id']           ?? 0);
    $cat_id     = (int)($_POST['category_id']  ?? 0);
    $model_no   = trim($_POST['model_no']       ?? '');
    $name       = trim($_POST['name']           ?? '');
    $badge_text = trim($_POST['badge_text']     ?? '');
    $badge_color= trim($_POST['badge_color']    ?? '');
    $price      = (int)($_POST['price']         ?? 0);
    $discount   = (int)($_POST['discount']      ?? 0);
    $short_desc = trim($_POST['short_desc']     ?? '');
    $detail_desc= trim($_POST['detail_desc']    ?? '');
    $image      = trim($_POST['image']          ?? '');
    $tags       = trim($_POST['tags']           ?? '');
    if ($id <= 0 || $cat_id <= 0 || $model_no === '' || $name === '') {
        echo json_encode(['ok' => false, 'msg' => '잘못된 요청']); exit;
    }
    $pdo->prepare(
        'UPDATE product_products SET
         category_id=?,model_no=?,name=?,badge_text=?,badge_color=?,price=?,discount=?,
         short_desc=?,detail_desc=?,image=?,tags=? WHERE id=?'
    )->execute([$cat_id,$model_no,$name,$badge_text,$badge_color,$price,$discount,$short_desc,$detail_desc,$image,$tags,$id]);
    logAdminAction($pdo, 'update', 'product_products', (string)$id, [], ['name' => $name, 'model_no' => $model_no]);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'productDelete') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id <= 0) { echo json_encode(['ok' => false, 'msg' => '잘못된 ID']); exit; }
    $pdo->prepare('DELETE FROM product_products WHERE id=?')->execute([$id]);
    logAdminAction($pdo, 'delete', 'product_products', (string)$id);
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'productReorder') {
    $ids  = json_decode($_POST['ids'] ?? '[]', true) ?: [];
    $stmt = $pdo->prepare('UPDATE product_products SET sort_order=? WHERE id=?');
    foreach ($ids as $i => $id) $stmt->execute([$i + 1, (int)$id]);
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action']);