<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/log_helper.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = getDB();
logAccess($pdo);
logLanding($pdo);

/* 분류 */
$cats = $pdo->query(
    'SELECT id, name, sort_order
     FROM product_categories
     WHERE is_active = 1
     ORDER BY sort_order, id'
)->fetchAll();

$categories = array_map(function($c) {
    return [
        'id'    => (string)$c['id'],
        'name'  => $c['name'],
        'active'=> true,
        'order' => (int)$c['sort_order'],
    ];
}, $cats);

/* 제품 */
$prods = $pdo->query(
    'SELECT p.id, p.category_id, p.model_no, p.name,
            p.badge_text, p.badge_color,
            p.price, p.discount,
            p.short_desc, p.detail_desc,
            p.image, p.tags, p.sort_order
     FROM product_products p
     INNER JOIN product_categories c ON c.id = p.category_id AND c.is_active = 1
     ORDER BY p.sort_order, p.id'
)->fetchAll();

$products = array_map(function($p) {
    // tags → features 배열
    $features = [];
    if ($p['tags']) {
        $features = array_values(array_filter(array_map('trim', explode(',', $p['tags']))));
    }

    // short_desc → specs 배열 ("|"로 구분된 "항목:값" 형식 지원, 없으면 빈 배열)
    $specs = [];
    if ($p['short_desc']) {
        foreach (explode('|', $p['short_desc']) as $item) {
            $parts = array_map('trim', explode(':', $item, 2));
            if (count($parts) === 2 && $parts[0] !== '') {
                $specs[] = [$parts[0], $parts[1]];
            }
        }
    }

    return [
        'id'           => (string)$p['id'],
        'categoryId'   => (string)$p['category_id'],
        'active'       => true,
        'order'        => (int)$p['sort_order'],
        'model'        => $p['model_no'],
        'name'         => $p['name'],
        'badge'        => $p['badge_text'] ?: null,
        'badgeColor'   => $p['badge_color'] ?: '#1255a6',
        'bgColor'      => '#dbeeff',
        'priceMonthly' => (int)$p['price'],
        'priceOriginal'=> $p['discount'] > 0 ? (int)($p['price'] + $p['discount']) : null,
        'imageUrl'     => $p['image'] ?: null,
        'features'     => $features,
        'specs'        => $specs,
        'description'  => $p['short_desc'] ?: '',
        'descLong'     => $p['detail_desc'] ?: '',
    ];
}, $prods);

/* 카드 할인 */
$cards = $pdo->query(
    'SELECT id, card_name, rate
     FROM product_discounts
     WHERE is_active = 1
     ORDER BY sort_order, id'
)->fetchAll();

$cardDiscounts = array_map(function($c) {
    return [
        'id'          => (string)$c['id'],
        'name'        => $c['card_name'],
        'discountPct' => (float)$c['rate'],
        'active'      => true,
    ];
}, $cards);

echo json_encode([
    'ok'            => true,
    'categories'    => $categories,
    'products'      => $products,
    'cardDiscounts' => $cardDiscounts,
]);