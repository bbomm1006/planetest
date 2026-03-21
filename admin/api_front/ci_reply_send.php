<?php
/**
 * ci_reply_send.php — 관리자 답변 발송 (SMS/알림톡) - Solapi + alimtalk_settings 연동
 */

if (!function_exists('ciReplySend')) {
    function ciReplySend(PDO $pdo, array $form, int $rowId, string $content, string $method): array
    {
        $tbl     = $form['table_name'];
        $form_id = (int)$form['id'];

        // 수신자 전화번호 조회
        $pfStmt = $pdo->prepare(
            "SELECT field_key FROM custom_inquiry_fields
              WHERE form_id=? AND (field_key LIKE '%phone%' OR field_key LIKE '%tel%' OR field_key LIKE '%mobile%')
                AND is_visible=1 ORDER BY sort_order ASC LIMIT 1"
        );
        $pfStmt->execute([$form_id]);
        $phoneKey = $pfStmt->fetchColumn();

        $toPhone = '';
        if ($phoneKey) {
            $rowStmt = $pdo->prepare("SELECT `{$phoneKey}` FROM `{$tbl}` WHERE id=? LIMIT 1");
            $rowStmt->execute([$rowId]);
            $toPhone = preg_replace('/[^0-9]/', '', (string)($rowStmt->fetchColumn() ?? ''));
        }
        if (!$toPhone) return ['ok' => false, 'msg' => '수신자 전화번호를 찾을 수 없습니다.'];

        // alimtalk_settings 공통 설정 조회
        $atSettings = [];
        try {
            $atRow = $pdo->query('SELECT * FROM alimtalk_settings WHERE id=1 LIMIT 1')->fetch();
            if ($atRow) $atSettings = $atRow;
        } catch (Exception $e) {}

        $apiKey    = trim($atSettings['api_key']    ?? '');
        $apiSecret = trim($atSettings['api_secret'] ?? '');
        $fromPhone = preg_replace('/[^0-9]/', '', trim($atSettings['sender'] ?? ''));
        $pfid      = trim($atSettings['pfid']       ?? '');
        $tplReply  = trim($atSettings['tpl_reply']  ?? '');

        if (!$apiKey || !$apiSecret) return ['ok' => false, 'msg' => '알림톡 설정에 API Key/Secret이 등록되지 않았습니다.'];
        if (!$fromPhone)             return ['ok' => false, 'msg' => '알림톡 설정에 발신번호가 등록되지 않았습니다.'];

        $formTitle = $form['title'] ?? '문의';
        $smsText   = "[{$formTitle}] 답변이 등록되었습니다.\n\n" . mb_substr($content, 0, 80);

        // Solapi HMAC 인증
        $date       = gmdate('Y-m-d\TH:i:s\Z');
        $salt       = bin2hex(random_bytes(16));
        $hmac       = hash_hmac('sha256', $date . $salt, $apiSecret);
        $authHeader = "HMAC-SHA256 apiKey={$apiKey}, date={$date}, salt={$salt}, signature={$hmac}";

        // 알림톡 발송 (템플릿 있으면 알림톡, 없으면 SMS 폴백)
        if ($method === 'alimtalk' && $pfid && $tplReply) {
            $payload = json_encode([
                'message' => [
                    'to'   => $toPhone,
                    'from' => $fromPhone,
                    'text' => $smsText,
                    'kakaoOptions' => [
                        'pfId'       => $pfid,
                        'templateId' => $tplReply,
                        'variables'  => ['#{폼명}' => $formTitle],
                    ],
                ],
            ]);
        } else {
            // SMS 또는 알림톡 템플릿 미등록 시 SMS 폴백
            $payload = json_encode([
                'message' => [
                    'to'   => $toPhone,
                    'from' => $fromPhone,
                    'text' => $smsText,
                    'type' => mb_strlen($smsText) > 90 ? 'LMS' : 'SMS',
                ],
            ]);
        }

        try {
            $ch = curl_init('https://api.solapi.com/messages/v4/send');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $payload,
                CURLOPT_HTTPHEADER     => ['Content-Type: application/json', "Authorization: {$authHeader}"],
                CURLOPT_TIMEOUT        => 10,
                CURLOPT_SSL_VERIFYPEER => true,
            ]);
            $resp   = curl_exec($ch);
            curl_close($ch);
            $result = json_decode($resp, true);
            if (!empty($result['errorCode'])) {
                return ['ok' => false, 'msg' => '발송 실패: ' . ($result['errorMessage'] ?? $result['errorCode'])];
            }
            return ['ok' => true];
        } catch (Exception $e) {
            return ['ok' => false, 'msg' => '발송 오류: ' . $e->getMessage()];
        }
    }
}

// require 방식으로 호출된 경우
if (isset($pdo, $form, $id, $content)) {
    $ciRsMethod = $form['reply_method'] ?? '';
    if (in_array($ciRsMethod, ['alimtalk', 'sms'], true)) {
        ciReplySend($pdo, $form, $id, $content, $ciRsMethod);
    }
    unset($ciRsMethod);
}

// 독립 엔드포인트로 호출된 경우
if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'] ?? '')) {
    require_once __DIR__ . '/../config/db.php';
    header('Content-Type: application/json; charset=utf-8');

    $input   = json_decode(file_get_contents('php://input'), true) ?: [];
    $form_id = intval($input['form_id'] ?? 0);
    $row_id  = intval($input['row_id']  ?? 0);
    $content = trim($input['content']   ?? '');
    $method  = trim($input['method']    ?? '');

    if (!$form_id || !$row_id || !$content || !$method) {
        echo json_encode(['ok' => false, 'msg' => '파라미터 필요']); exit;
    }

    $pdo = getDB();
    $fStmt = $pdo->prepare('SELECT * FROM custom_inquiry_forms WHERE id=? LIMIT 1');
    $fStmt->execute([$form_id]);
    $form = $fStmt->fetch(PDO::FETCH_ASSOC);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => '폼 없음']); exit; }

    $id     = $row_id;
    $result = ciReplySend($pdo, $form, $id, $content, $method);
    echo json_encode($result);
    exit;
}
