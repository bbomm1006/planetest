<?php
/**
 * chatbot/api.php
 * 챗봇 JS에서 호출하는 JSON API
 * 활성화된 KB / Context / Quick / Default / Config 데이터를 반환
 */
require_once __DIR__ . '/../admin/config/db.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$pdo = getDB();

function fetchAll($pdo, $sql) {
    $rows = [];
    foreach ($pdo->query($sql) as $r) $rows[] = $r;
    return $rows;
}

$kb      = fetchAll($pdo, "SELECT keywords, answer, follow_text, follow_context FROM chatbot_kb      WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
$context = fetchAll($pdo, "SELECT context_key, keywords, answer, fallback          FROM chatbot_context WHERE is_active = 1 ORDER BY context_key, sort_order ASC, id ASC");
$quick   = fetchAll($pdo, "SELECT label, question_text, context_key               FROM chatbot_quick   WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
$defaults= fetchAll($pdo, "SELECT answer                                           FROM chatbot_default WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");

$config_rows = fetchAll($pdo, "SELECT config_key, config_value FROM chatbot_config ORDER BY sort_order ASC");
$config = [];
foreach ($config_rows as $row) {
    $config[$row['config_key']] = $row['config_value'];
}

echo json_encode([
    'kb'       => $kb,
    'context'  => $context,
    'quick'    => $quick,
    'defaults' => $defaults,
    'config'   => $config,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
