<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/log_helper.php';
header('Content-Type: application/json; charset=utf-8');

$pdo = getDB();
// logAccess($pdo);
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

/* 제품별 스팩 한 번에 조회 */
$allSpecs = $pdo->query(
    'SELECT product_id, spec_name, spec_value
     FROM product_specs
     ORDER BY product_id, sort_order, id'
)->fetchAll();

$specsMap = [];
foreach ($allSpecs as $s) {
    $specsMap[$s['product_id']][] = [$s['spec_name'], $s['spec_value']];
}

$products = array_map(function($p) use ($specsMap) {
    $features = [];
    if ($p['tags']) {
        $features = array_values(array_filter(array_map('trim', explode(',', $p['tags']))));
    }

    $specs = $specsMap[$p['id']] ?? [];

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

/* 사이트 타이틀 */
$siteRow = $pdo->query("SELECT title FROM homepage_info WHERE id=1 LIMIT 1")->fetch();
$siteTitle = $siteRow ? $siteRow['title'] : 'PureBlue';

echo json_encode([
    'ok'            => true,
    'siteTitle'     => $siteTitle,
    'categories'    => $categories,
    'products'      => $products,
    'cardDiscounts' => $cardDiscounts,
]);
