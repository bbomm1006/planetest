<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/log_helper.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }
$body = json_decode(file_get_contents('php://input'), true);
if (!$body) { echo json_encode(['ok' => false, 'msg' => '잘못된 요청']); exit; }

$pdo = getDB();
// logAccess($pdo);

try {
    $stmt = $pdo->prepare(
        'INSERT INTO combo_inquiries
         (name, phone, product_name, time_slot, message, card_discount_name, original_price, final_price, status)
         VALUES (?,?,?,?,?,?,?,?,?)'
    );
    $stmt->execute([
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
    $newId = (int)$pdo->lastInsertId();
} catch (Throwable $e) {
    echo json_encode(['ok' => false, 'msg' => 'DB 오류: ' . $e->getMessage()]);
    exit;
}

// 알림 발송 — 에러를 로그에 기록
$logFile = __DIR__ . '/../config/combo_notify.log';
try {
    require_once __DIR__ . '/../config/combo_notify.php';
    $row = $pdo->prepare('SELECT * FROM combo_inquiries WHERE id = ?');
    $row->execute([$newId]);
    $inquiry = $row->fetch(PDO::FETCH_ASSOC);

    file_put_contents($logFile, date('[Y-m-d H:i:s]') . " inquiry_id={$newId} managers=" . json_encode(array_column(
        $pdo->query('SELECT id,name,notify_email,notify_sms,notify_alimtalk,notify_sheet,is_active FROM combo_managers WHERE is_active=1')->fetchAll(),
        null
    )) . "\n", FILE_APPEND);

    if ($inquiry) comboSendNotifications($pdo, $inquiry);

    file_put_contents($logFile, date('[Y-m-d H:i:s]') . " comboSendNotifications 완료\n", FILE_APPEND);

} catch (Throwable $e) {
    file_put_contents($logFile, date('[Y-m-d H:i:s]') . " ERROR: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine() . "\n", FILE_APPEND);
}

echo json_encode(['ok' => true, 'id' => $newId]);
