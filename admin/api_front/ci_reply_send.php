<?php
/**
 * ci_reply_send.php — 관리자 답변 발송 전용 API
 *
 * custom_inquiry_data.php save_reply 액션에서 호출:
 *   require_once __DIR__ . '/../api_front/ci_reply_send.php';
 *
 * 또는 독립 POST 엔드포인트로도 사용 가능:
 *   POST /admin/api_front/ci_reply_send.php
 *   body: { form_id, row_id, content, method }
 *   method: 'alimtalk' | 'sms'
 *
 * 필요 변수 (require 방식으로 호출 시 호출 측에서 선언):
 *   $pdo      — PDO 인스턴스
 *   $form     — custom_inquiry_forms 레코드 (getFormInfo 결과)
 *   $id       — 답변 대상 row id
 *   $content  — 답변 내용
 *
 * ※ 이메일 발송은 custom_inquiry_data.php 에 이미 구현됨 → 이 파일은 알림톡/SMS 전용
 */

/* ════════════════════════════════════
   독립 엔드포인트로 호출된 경우
════════════════════════════════════ */
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

    // 폼 정보 조회
    $fStmt = $pdo->prepare('SELECT * FROM custom_inquiry_forms WHERE id = ? LIMIT 1');
    $fStmt->execute([$form_id]);
    $form = $fStmt->fetch(PDO::FETCH_ASSOC);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => '폼 없음']); exit; }

    $id = $row_id;

    $result = ciReplySend($pdo, $form, $id, $content, $method);
    echo json_encode($result);
    exit;
}

/* ════════════════════════════════════
   require 방식으로 호출된 경우
   — $pdo, $form, $id, $content 는 호출 측에서 선언
════════════════════════════════════ */
if (isset($pdo, $form, $id, $content)) {
    $ciRsMethod = $form['reply_method'] ?? '';
    if (in_array($ciRsMethod, ['alimtalk', 'sms'], true)) {
        ciReplySend($pdo, $form, $id, $content, $ciRsMethod);
    }
    unset($ciRsMethod);
}

/* ════════════════════════════════════
   핵심 발송 함수
════════════════════════════════════ */
if (!function_exists('ciReplySend')) {
    function ciReplySend(PDO $pdo, array $form, int $rowId, string $content, string $method): array
    {
        $tbl     = $form['table_name'];
        $form_id = (int)$form['id'];

        // ── 수신자 전화번호 조회 ──
        // field_key 에 'phone' 또는 'tel' 포함된 필드 감지 (첫 번째)
        $pfStmt = $pdo->prepare(
            "SELECT field_key FROM custom_inquiry_fields
              WHERE form_id = ?
                AND (field_key LIKE '%phone%' OR field_key LIKE '%tel%' OR field_key LIKE '%mobile%')
                AND is_visible = 1
              ORDER BY sort_order ASC LIMIT 1"
        );
        $pfStmt->execute([$form_id]);
        $phoneKey = $pfStmt->fetchColumn();

        $toPhone = '';
        if ($phoneKey) {
            $rowStmt = $pdo->prepare("SELECT `{$phoneKey}` FROM `{$tbl}` WHERE id = ? LIMIT 1");
            $rowStmt->execute([$rowId]);
            $toPhone = preg_replace('/[^0-9]/', '', (string)($rowStmt->fetchColumn() ?? ''));
        }

        if (!$toPhone) {
            return ['ok' => false, 'msg' => '수신자 전화번호를 찾을 수 없습니다.'];
        }

        // ── 발신번호 조회 (system 테이블 또는 고정값) ──
        $fromPhone = '';
        try {
            $sysStmt = $pdo->query("SELECT sms_sender FROM system_settings WHERE id = 1 LIMIT 1");
            $fromPhone = (string)($sysStmt->fetchColumn() ?? '');
        } catch (Exception $e) {}
        if (!$fromPhone) $fromPhone = '07000000000'; // 기본 발신번호 (실제 등록 번호로 교체)

        $formTitle = $form['title'] ?? '문의';

        /* ════════════════════
           알림톡 발송
           (카카오 비즈메시지 API 연동 필요)
        ════════════════════ */
        if ($method === 'alimtalk') {
            /*
             * ── 연동 방법 ──
             * 1) 카카오 비즈메시지 파트너사 API 키를 DB 또는 환경변수에 저장
             * 2) 아래 주석을 해제하고 실제 값으로 교체
             *
             * 권장 서비스: 솔라피(Solapi), 알리고(Aligo), NHN Cloud 등
             *
             * === 솔라피 예시 ===
             *
             * $apiKey    = 'YOUR_SOLAPI_API_KEY';
             * $apiSecret = 'YOUR_SOLAPI_API_SECRET';
             * $pfId      = 'YOUR_KAKAO_PFID';       // 카카오 채널 플러스친구 ID
             * $templateId= 'YOUR_TEMPLATE_CODE';    // 사전 등록된 템플릿 코드
             *
             * $payload = json_encode([
             *     'message' => [
             *         'to'   => $toPhone,
             *         'from' => $fromPhone,
             *         'kakaoOptions' => [
             *             'pfId'       => $pfId,
             *             'templateId' => $templateId,
             *             'variables'  => [
             *                 '#{폼명}'  => $formTitle,
             *                 '#{답변}'  => $content,
             *             ],
             *         ],
             *     ],
             * ]);
             *
             * $ch = curl_init('https://api.solapi.com/messages/v4/send');
             * $date = gmdate('Y-m-d\TH:i:s\Z');
             * $salt = bin2hex(random_bytes(16));
             * $hmac = hash_hmac('sha256', $date . $salt, $apiSecret);
             * curl_setopt_array($ch, [
             *     CURLOPT_RETURNTRANSFER => true,
             *     CURLOPT_POST           => true,
             *     CURLOPT_POSTFIELDS     => $payload,
             *     CURLOPT_HTTPHEADER     => [
             *         'Content-Type: application/json',
             *         "Authorization: HMAC-SHA256 apiKey={$apiKey}, date={$date}, salt={$salt}, signature={$hmac}",
             *     ],
             * ]);
             * $resp = curl_exec($ch);
             * curl_close($ch);
             * $result = json_decode($resp, true);
             * if (!empty($result['errorCode'])) throw new Exception($result['errorMessage'] ?? '알림톡 발송 실패');
             */

            // ── 미연동 상태 안내 ──
            return [
                'ok'  => false,
                'msg' => '알림톡 API 미연동 상태입니다. ci_reply_send.php 내 연동 코드를 설정해 주세요.',
                'to'  => $toPhone,
            ];
        }

        /* ════════════════════
           SMS 발송
           (문자 API 연동 필요)
        ════════════════════ */
        if ($method === 'sms') {
            /*
             * ── 연동 방법 ──
             * 권장 서비스: 솔라피(Solapi), 알리고(Aligo), 네이버 클라우드 SENS 등
             *
             * === 솔라피 예시 ===
             *
             * $apiKey    = 'YOUR_SOLAPI_API_KEY';
             * $apiSecret = 'YOUR_SOLAPI_API_SECRET';
             *
             * $smsText = "[{$formTitle}] 답변이 등록되었습니다.\n\n" . mb_substr($content, 0, 80);
             *
             * $payload = json_encode([
             *     'message' => [
             *         'to'   => $toPhone,
             *         'from' => $fromPhone,
             *         'text' => $smsText,
             *         'type' => mb_strlen($smsText) > 90 ? 'LMS' : 'SMS',
             *     ],
             * ]);
             *
             * $ch = curl_init('https://api.solapi.com/messages/v4/send');
             * $date = gmdate('Y-m-d\TH:i:s\Z');
             * $salt = bin2hex(random_bytes(16));
             * $hmac = hash_hmac('sha256', $date . $salt, $apiSecret);
             * curl_setopt_array($ch, [
             *     CURLOPT_RETURNTRANSFER => true,
             *     CURLOPT_POST           => true,
             *     CURLOPT_POSTFIELDS     => $payload,
             *     CURLOPT_HTTPHEADER     => [
             *         'Content-Type: application/json',
             *         "Authorization: HMAC-SHA256 apiKey={$apiKey}, date={$date}, salt={$salt}, signature={$hmac}",
             *     ],
             * ]);
             * $resp = curl_exec($ch);
             * curl_close($ch);
             * $result = json_decode($resp, true);
             * if (!empty($result['errorCode'])) throw new Exception($result['errorMessage'] ?? 'SMS 발송 실패');
             */

            // ── 미연동 상태 안내 ──
            return [
                'ok'  => false,
                'msg' => 'SMS API 미연동 상태입니다. ci_reply_send.php 내 연동 코드를 설정해 주세요.',
                'to'  => $toPhone,
            ];
        }

        return ['ok' => false, 'msg' => '지원하지 않는 발송 방식: ' . $method];
    }
}
