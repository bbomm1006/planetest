<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/log_helper.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }
$body = json_decode(file_get_contents('php://input'), true);
if (!$body) { echo json_encode(['ok' => false, 'msg' => '잘못된 요청']); exit; }

$pdo = getDB();
try { logAccess($pdo); } catch(Throwable $e) {}

$pdo->prepare(
    'INSERT INTO combo_inquiries
     (name, phone, product_name, time_slot, message, card_discount_name, original_price, final_price, status)
     VALUES (?,?,?,?,?,?,?,?,?)'
)->execute([
    trim($body['name']             ?? ''),
    trim($body['phone']            ?? ''),
    trim($body['productName']      ?? ''),
    trim($body['timeSlot']         ?? ''),
    trim($body['message']          ?? ''),
    trim($body['cardDiscountName'] ?? ''),
    (int)($body['originalPrice']   ?? 0),
    (int)($body['finalPrice']      ?? 0),
    '접수',
]);

echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
