<?php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json; charset=utf-8');

$pdo   = getDB();
$terms = $pdo->query("SELECT term_body FROM combo_terms WHERE id=1")->fetch();
$slots = $pdo->query("SELECT label FROM combo_timeslots WHERE is_active=1 ORDER BY sort_order, id")->fetchAll();

echo json_encode([
    'ok'       => true,
    'termBody' => $terms ? ($terms['term_body'] ?? '') : '',
    'slots'    => array_column($slots, 'label'),
]);
