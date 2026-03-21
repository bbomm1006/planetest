<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo    = getDB();

// alimtalk_settings 테이블 없으면 자동 생성
$pdo->exec("CREATE TABLE IF NOT EXISTS `alimtalk_settings` (
    `id`         INT(11) NOT NULL AUTO_INCREMENT,
    `api_key`    VARCHAR(255) DEFAULT NULL,
    `api_secret` VARCHAR(255) DEFAULT NULL,
    `sender`     VARCHAR(50)  DEFAULT NULL,
    `pfid`       VARCHAR(100) DEFAULT NULL,
    `tpl_notify` VARCHAR(100) DEFAULT NULL,
    `tpl_reply`  VARCHAR(100) DEFAULT NULL,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

// 조회
if ($action === 'get') {
    $row = $pdo->query('SELECT * FROM alimtalk_settings WHERE id=1 LIMIT 1')->fetch();
    if (!$row) {
        echo json_encode(['ok' => true, 'data' => []]);
    } else {
        // api_secret은 있는지 여부만 반환 (보안)
        echo json_encode(['ok' => true, 'data' => [
            'api_key'    => $row['api_key']    ?? '',
            'api_secret' => !empty($row['api_secret']) ? '••••' : '',
            'sender'     => $row['sender']     ?? '',
            'pfid'       => $row['pfid']       ?? '',
            'tpl_notify' => $row['tpl_notify'] ?? '',
            'tpl_reply'  => $row['tpl_reply']  ?? '',
        ]]);
    }
    exit;
}

// 저장
if ($action === 'save') {
    $api_key    = trim($_POST['api_key']    ?? '');
    $api_secret = trim($_POST['api_secret'] ?? '');
    $sender     = trim($_POST['sender']     ?? '');
    $pfid       = trim($_POST['pfid']       ?? '');
    $tpl_notify = trim($_POST['tpl_notify'] ?? '');
    $tpl_reply  = trim($_POST['tpl_reply']  ?? '');

    $existing = $pdo->query('SELECT id, api_secret FROM alimtalk_settings WHERE id=1 LIMIT 1')->fetch();

    if ($existing) {
        // secret 비어있으면 기존값 유지
        $finalSecret = $api_secret ?: $existing['api_secret'];
        $pdo->prepare('UPDATE alimtalk_settings SET api_key=?, api_secret=?, sender=?, pfid=?, tpl_notify=?, tpl_reply=? WHERE id=1')
            ->execute([$api_key, $finalSecret, $sender, $pfid, $tpl_notify, $tpl_reply]);
    } else {
        $pdo->prepare('INSERT INTO alimtalk_settings (id, api_key, api_secret, sender, pfid, tpl_notify, tpl_reply) VALUES (1,?,?,?,?,?,?)')
            ->execute([$api_key, $api_secret, $sender, $pfid, $tpl_notify, $tpl_reply]);
    }
    echo json_encode(['ok' => true]);
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action']);
