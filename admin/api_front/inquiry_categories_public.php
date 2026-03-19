<?php
require_once __DIR__ . '/../config/db.php';
header('Content-Type: application/json; charset=utf-8');

$pdo  = getDB();
$rows = $pdo->query(
    'SELECT id, name FROM inquiry_categories WHERE is_active=1 ORDER BY sort_order, id'
)->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(['ok' => true, 'data' => $rows], JSON_UNESCAPED_UNICODE);