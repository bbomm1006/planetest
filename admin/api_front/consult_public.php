<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/log_helper.php';
header('Content-Type: application/json; charset=utf-8');
set_error_handler(function($no,$str,$file,$line){ echo json_encode(['ok'=>false,'msg'=>"PHP[$no]:$str $file:$line"]); exit; });
set_exception_handler(function($e){ echo json_encode(['ok'=>false,'msg'=>$e->getMessage()]); exit; });

$pdo    = getDB();
logAccess($pdo);
logLanding($pdo);
$action = $_GET['action'] ?? $_POST['action'] ?? 'config';

/* ── 폼 설정 + 추가필드 + 약관 한번에 ── */
if ($action === 'config') {
    $config = $pdo->query('SELECT * FROM consults_configs WHERE id = 1')->fetch();
    $fields = $pdo->query('SELECT * FROM consults_fields WHERE is_active=1 ORDER BY sort_order, id')->fetchAll();
    $terms  = $pdo->query('SELECT * FROM consult_terms WHERE id = 1')->fetch();
    echo json_encode(['ok' => true, 'config' => $config, 'fields' => $fields, 'terms' => $terms]);
    exit;
}

/* ── 상담 등록 ── */
if ($action === 'create') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];

    $name         = trim($input['name']        ?? '');
    $phone        = trim($input['phone']       ?? '');
    $category_id  = ($input['brandId']         ?? '') ?: null;
    $product      = trim($input['productName'] ?? '');
    $desired_time = trim($input['timeSlot']    ?? '') ?: null;
    $user_memo    = trim($input['message']     ?? '');
    $extra_fields = $input['extraFields']      ?? [];

    if (!$name || !$phone) {
        echo json_encode(['ok' => false, 'msg' => '이름과 연락처는 필수입니다.']);
        exit;
    }

    try { $pdo->query('SELECT extra_fields FROM consults LIMIT 1'); }
    catch (Exception $e) { $pdo->exec('ALTER TABLE consults ADD COLUMN extra_fields JSON DEFAULT NULL'); }

    try { $pdo->query('SELECT user_memo FROM consults LIMIT 1'); }
    catch (Exception $e) { $pdo->exec('ALTER TABLE consults ADD COLUMN user_memo TEXT DEFAULT NULL AFTER phone'); }

    try {
        $col = $pdo->query("SHOW COLUMNS FROM consults LIKE 'desired_time'")->fetch();
        if ($col && stripos($col['Type'], 'datetime') !== false) {
            $pdo->exec("ALTER TABLE consults MODIFY COLUMN desired_time VARCHAR(100) DEFAULT NULL");
        }
    } catch (Exception $e) {}

    $pdo->prepare(
        'INSERT INTO consults (status, name, phone, category_id, product, desired_time, user_memo, extra_fields)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )->execute(['pending', $name, $phone, $category_id, $product, $desired_time, $user_memo, json_encode($extra_fields)]);

    echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action']);