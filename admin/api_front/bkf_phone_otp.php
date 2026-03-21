<?php
declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');

require_once dirname(__DIR__) . '/config/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$pdo    = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$in     = ($method === 'POST')
          ? (json_decode(file_get_contents('php://input'), true) ?: $_POST)
          : $_GET;
$action = trim((string)($in['action'] ?? ''));

function bkf_otp_out(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function bkf_normalize_phone(string $p): string {
    return preg_replace('/\D+/', '', $p) ?? '';
}

/* ================================================================
   send — 인증번호 생성 + Solapi SMS 발송
   POST: action=send, phone, slug(폼 식별용 — phone_verify_use 확인)
   ================================================================ */
if ($action === 'send') {
    if ($method !== 'POST') bkf_otp_out(['ok' => false, 'msg' => 'POST only.'], 405);

    $phone = bkf_normalize_phone((string)($in['phone'] ?? ''));
    $slug  = trim((string)($in['slug'] ?? ''));

    if (strlen($phone) < 10 || strlen($phone) > 11) {
        bkf_otp_out(['ok' => false, 'msg' => 'Invalid phone number.'], 400);
    }

    // 폼의 phone_verify_use 확인
    if ($slug !== '') {
        $fChk = $pdo->prepare('SELECT phone_verify_use FROM bkf_forms WHERE slug=? AND is_active=1');
        $fChk->execute([$slug]);
        $fRow = $fChk->fetch(PDO::FETCH_ASSOC);
        if (!$fRow) {
            bkf_otp_out(['ok' => false, 'msg' => 'Form not found.'], 404);
        }
        if (!(int)$fRow['phone_verify_use']) {
            bkf_otp_out(['ok' => false, 'msg' => 'Phone verification is not enabled for this form.'], 400);
        }
    }

    // 발송 횟수 제한: 10분 내 3회 초과 차단
    $rateChk = $pdo->prepare(
        "SELECT COUNT(*) FROM bkf_phone_otp
         WHERE phone=? AND created_at > DATE_SUB(NOW(), INTERVAL 10 MINUTE)"
    );
    $rateChk->execute([$phone]);
    if ((int)$rateChk->fetchColumn() >= 3) {
        bkf_otp_out(['ok' => false, 'msg' => 'Too many requests. Please wait 10 minutes.'], 429);
    }

    // 6자리 코드 생성
    $code    = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $expires = date('Y-m-d H:i:s', strtotime('+5 minutes'));

    // Solapi 설정 조회
    $atRow = null;
    try {
        $atRow = $pdo->query('SELECT * FROM alimtalk_settings WHERE id=1 LIMIT 1')->fetch(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {}

    $apiKey    = trim($atRow['api_key']    ?? '');
    $apiSecret = trim($atRow['api_secret'] ?? '');
    $fromPhone = preg_replace('/\D/', '', trim($atRow['sender'] ?? ''));

    if (!$apiKey || !$apiSecret || !$fromPhone) {
        bkf_otp_out(['ok' => false, 'msg' => 'SMS service is not configured. Please contact administrator.'], 500);
    }

    $smsText = "[Verification] Your code: {$code} (valid 5 min)";

    // Solapi HMAC 인증
    $date   = gmdate("Y-m-d\TH:i:s\Z");
    $salt   = bin2hex(random_bytes(16));
    $hmac   = hash_hmac('sha256', $date . $salt, $apiSecret);
    $auth   = "HMAC-SHA256 apiKey={$apiKey}, date={$date}, salt={$salt}, signature={$hmac}";

    $payload = json_encode([
        'message' => [
            'to'   => $phone,
            'from' => $fromPhone,
            'text' => $smsText,
            'type' => 'SMS',
        ],
    ]);

    try {
        $ch = curl_init('https://api.solapi.com/messages/v4/send');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json', "Authorization: {$auth}"],
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $resp  = curl_exec($ch);
        $errno = curl_errno($ch);
        curl_close($ch);

        if ($errno) {
            bkf_otp_out(['ok' => false, 'msg' => 'SMS send failed (curl error).'], 500);
        }

        $result = json_decode($resp, true);
        if (!empty($result['errorCode'])) {
            bkf_otp_out([
                'ok'  => false,
                'msg' => 'SMS send failed: ' . ($result['errorMessage'] ?? $result['errorCode']),
            ], 500);
        }
    } catch (Throwable $e) {
        bkf_otp_out(['ok' => false, 'msg' => 'SMS send error: ' . $e->getMessage()], 500);
    }

    // OTP 저장 (기존 미사용 코드 만료 처리)
    $pdo->prepare(
        "UPDATE bkf_phone_otp SET used=1 WHERE phone=? AND used=0"
    )->execute([$phone]);

    $pdo->prepare(
        "INSERT INTO bkf_phone_otp (phone, code, fail_count, used, expires_at) VALUES (?,?,0,0,?)"
    )->execute([$phone, $code, $expires]);

    bkf_otp_out(['ok' => true, 'msg' => 'Verification code sent.']);
}

/* ================================================================
   verify — 인증번호 검증
   POST: action=verify, phone, code
   성공 시 otp_token 반환 (submit 시 전달용)
   ================================================================ */
if ($action === 'verify') {
    if ($method !== 'POST') bkf_otp_out(['ok' => false, 'msg' => 'POST only.'], 405);

    $phone = bkf_normalize_phone((string)($in['phone'] ?? ''));
    $code  = trim((string)($in['code'] ?? ''));

    if (!$phone || !$code) {
        bkf_otp_out(['ok' => false, 'msg' => 'Phone and code are required.'], 400);
    }

    // 최신 OTP 조회 (미사용 + 미만료)
    $otpSt = $pdo->prepare(
        "SELECT * FROM bkf_phone_otp
         WHERE phone=? AND used=0 AND expires_at > NOW()
         ORDER BY id DESC LIMIT 1"
    );
    $otpSt->execute([$phone]);
    $otp = $otpSt->fetch(PDO::FETCH_ASSOC);

    if (!$otp) {
        bkf_otp_out(['ok' => false, 'msg' => 'Verification code has expired. Please request a new one.'], 400);
    }

    // 5회 실패 잠금
    if ((int)$otp['fail_count'] >= 5) {
        bkf_otp_out(['ok' => false, 'msg' => 'Too many failed attempts. Please request a new code.'], 429);
    }

    if ($otp['code'] !== $code) {
        // 실패 횟수 증가
        $pdo->prepare("UPDATE bkf_phone_otp SET fail_count=fail_count+1 WHERE id=?")
            ->execute([$otp['id']]);
        $remaining = 4 - (int)$otp['fail_count']; // 현재 실패 후 남은 횟수
        bkf_otp_out([
            'ok'  => false,
            'msg' => "Incorrect code. {$remaining} attempt(s) remaining.",
        ], 400);
    }

    // 검증 성공 — used=1 로 표시
    $pdo->prepare("UPDATE bkf_phone_otp SET used=1 WHERE id=?")->execute([$otp['id']]);

    // otp_token = phone:code (submit 시 서버에서 재검증)
    $otp_token = $phone . ':' . $code;

    bkf_otp_out(['ok' => true, 'otp_token' => $otp_token]);
}

/* ================================================================
   Unknown action
   ================================================================ */
bkf_otp_out(['ok' => false, 'msg' => 'Unknown action.'], 400);
