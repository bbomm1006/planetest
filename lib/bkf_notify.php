<?php
declare(strict_types=1);

/* ================================================================
   bkf_notify.php
   Admin notification dispatcher for the Booking Form (bkf) module.
   Sends notifications to bkf_managers when a reservation is created.

   Supported channels per manager row:
     notify_email    → PHP mail() to manager's email address
     notify_sms      → Solapi SMS  (uses alimtalk_settings)
     notify_alimtalk → Solapi Alimtalk (uses alimtalk_settings)
     notify_sheet    → Google Apps Script webhook
   ================================================================ */

/* ----------------------------------------------------------------
   Main entry point
   Call after a successful INSERT into bkf_records_{slug}.
   ---------------------------------------------------------------- */
if (!function_exists('bkf_notify_managers')) {
    function bkf_notify_managers(PDO $pdo, int $form_id, array $form, array $booking): void {

        // Load active managers for this form
        $mgrSt = $pdo->prepare(
            'SELECT * FROM bkf_managers WHERE form_id=? AND is_active=1'
        );
        $mgrSt->execute([$form_id]);
        $managers = $mgrSt->fetchAll(PDO::FETCH_ASSOC);
        if (!$managers) return;

        // Load Solapi settings once (shared across managers)
        $solapi = bkf_notify_solapi_settings($pdo);

        $formTitle = $form['title'] ?? '예약';

        // 사이트 정보
        try {
            $siteRow = $pdo->query("SELECT title, copyright FROM homepage_info WHERE id=1 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        } catch (Throwable $e) { $siteRow = null; }
        $siteName = $siteRow['title']     ?? $formTitle;
        $siteCopy = $siteRow['copyright'] ?? ('© ' . date('Y') . ' ' . $siteName);

        // Build text body (SMS용)
        $body     = bkf_notify_build_body($formTitle, $booking);
        // Build HTML body (이메일용)
        $htmlBody = bkf_notify_build_html($formTitle, $booking, $siteName, $siteCopy);

        foreach ($managers as $mgr) {
            // ── Email (PHPMailer HTML)
            if ((int)$mgr['notify_email'] && !empty($mgr['email'])) {
                bkf_notify_send_email($mgr['email'], $formTitle, $body, $htmlBody, $siteName, $siteCopy, $pdo);
            }

            // ── SMS / Alimtalk (Solapi)
            if (((int)$mgr['notify_sms'] || (int)$mgr['notify_alimtalk']) && $solapi) {
                $toPhone = bkf_notify_clean_phone($mgr['phone'] ?? '');
                if ($toPhone) {
                    bkf_notify_send_sms($solapi, $toPhone, $body, (int)$mgr['notify_alimtalk']);
                }
            }

            // ── Google Sheet webhook
            if ((int)$mgr['notify_sheet'] && !empty($mgr['sheet_webhook'])) {
                bkf_notify_send_sheet(
                    $mgr['sheet_webhook'],
                    $mgr['sheet_name'] ?: 'Sheet1',
                    $formTitle,
                    $booking
                );
            }
        }
    }
}

/* ----------------------------------------------------------------
   Build plain-text notification body (SMS용)
   ---------------------------------------------------------------- */
if (!function_exists('bkf_notify_build_body')) {
    function bkf_notify_build_body(string $formTitle, array $booking): string {
        $lines = [
            "[{$formTitle}] 새 예약이 접수되었습니다.",
            "예약번호 : " . ($booking['reservation_no']   ?? '-'),
            "이  름   : " . ($booking['name']             ?? '-'),
            "연락처   : " . ($booking['phone']            ?? '-'),
            "예약일   : " . ($booking['reservation_date'] ?? '-'),
            "시  간   : " . ($booking['reservation_time'] ?? '-'),
            "지  점   : " . ($booking['store_name']       ?? '-'),
            "접수일시 : " . ($booking['created_at']       ?? '-'),
        ];
        return implode("\n", $lines);
    }
}

/* ----------------------------------------------------------------
   Build HTML email body — ci_confirm_mail 동일 디자인
   ---------------------------------------------------------------- */
if (!function_exists('bkf_notify_build_html')) {
    function bkf_notify_build_html(string $formTitle, array $booking, string $siteName, string $siteCopy): string {
        $esc = function($v) { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); };

        $rows = [
            ['예약번호', $booking['reservation_no']    ?? '-'],
            ['이  름',   $booking['name']              ?? '-'],
            ['연락처',   $booking['phone']             ?? '-'],
            ['예약일',   $booking['reservation_date']  ?? '-'],
            ['시  간',   $booking['reservation_time']  ?? '-'],
            ['지  점',   $booking['store_name']        ?? '-'],
            ['상  태',   $booking['status']            ?? '-'],
            ['접수일시', $booking['created_at']        ?? '-'],
        ];

        $tableRows = '';
        foreach ($rows as [$label, $value]) {
            if ((string)$value === '' || (string)$value === '-') continue;
            $tableRows .= '
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:10px 12px 10px 0;width:34%;font-size:.8rem;font-weight:700;color:#64748b;vertical-align:top;">'
                . $esc($label) . '</td>
        <td style="padding:10px 0;font-size:.86rem;color:#1e293b;line-height:1.6;">'
                . nl2br($esc($value)) . '</td>
      </tr>';
        }

        $no      = $esc($booking['reservation_no'] ?? '-');
        $created = $esc($booking['created_at']     ?? date('Y-m-d H:i'));

        return '<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:\'Apple SD Gothic Neo\',\'Malgun Gothic\',sans-serif;">
<div style="max-width:580px;margin:32px auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.09);">

  <!-- 헤더 -->
  <div style="background:linear-gradient(90deg,#1255a6,#1e7fe8);padding:26px 30px;">
    <div style="color:rgba(255,255,255,.75);font-size:.75rem;font-weight:600;letter-spacing:1px;margin-bottom:6px;">예약 알림</div>
    <div style="color:#fff;font-size:1.1rem;font-weight:700;">' . $esc($formTitle) . '</div>
  </div>

  <!-- 인사 -->
  <div style="padding:26px 30px 0;">
    <p style="margin:0 0 6px;font-size:.92rem;color:#334155;line-height:1.7;">
      📋 새로운 예약이 접수되었습니다.<br>
      아래 예약 내용을 확인하고 빠르게 응대해 주세요.
    </p>
  </div>

  <!-- 예약번호 / 접수일시 -->
  <div style="margin:20px 30px 0;padding:14px 18px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;display:flex;gap:24px;flex-wrap:wrap;">
    <div>
      <div style="font-size:.72rem;color:#0369a1;font-weight:700;margin-bottom:3px;">예약번호</div>
      <div style="font-size:.92rem;font-weight:800;color:#0c4a6e;">' . $no . '</div>
    </div>
    <div>
      <div style="font-size:.72rem;color:#0369a1;font-weight:700;margin-bottom:3px;">접수일시</div>
      <div style="font-size:.92rem;font-weight:800;color:#0c4a6e;">' . $created . '</div>
    </div>
  </div>

  <!-- 예약 내용 -->
  <div style="padding:20px 30px;">
    <div style="font-size:.78rem;font-weight:700;color:#64748b;letter-spacing:.5px;text-transform:uppercase;margin-bottom:12px;">예약 내용</div>
    <table style="width:100%;border-collapse:collapse;">' . $tableRows . '
    </table>
  </div>

  <!-- 안내 문구 -->
  <div style="margin:0 30px 24px;padding:14px 18px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
    <p style="margin:0;font-size:.82rem;color:#64748b;line-height:1.72;">
      예약 내용을 확인 후 고객에게 빠르게 안내해 주세요. 관리자 페이지에서 예약 상태를 변경하실 수 있습니다.
    </p>
  </div>

  <!-- 푸터 -->
  <div style="background:#f1f5f9;padding:14px 30px;text-align:center;">
    <p style="margin:0;font-size:.72rem;color:#94a3b8;">' . $esc($siteCopy) . ' · 본 메일은 자동 발송되었습니다.</p>
  </div>

</div>
</body>
</html>';
    }
}

/* ----------------------------------------------------------------
   Email via PHPMailer — custom_inquiry_public.php 동일 방식
   ---------------------------------------------------------------- */
if (!function_exists('bkf_notify_send_email')) {
    function bkf_notify_send_email(string $to, string $formTitle, string $body, string $htmlBody = '', string $siteName = '', string $siteCopy = '', PDO $pdo = null): void {
        if (!$to || strpos($to, '@') === false) return;

        /* PHPMailer 직접 로드 — 루트/phpmailer/ */
        $pmBase = dirname(__DIR__, 2) . '/phpmailer';
        if (!class_exists('PHPMailer\\PHPMailer\\PHPMailer')) {
            if (!file_exists($pmBase . '/PHPMailer.php')) return;
            require_once $pmBase . '/Exception.php';
            require_once $pmBase . '/PHPMailer.php';
            require_once $pmBase . '/SMTP.php';
        }

        $gmailEmail = 'solha.jin90@gmail.com';
        $gmailPw    = 'otud ocoq cmsv hvde';
        $subject    = "[예약알림] {$formTitle} 새 예약 접수";

        try {
            $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = $gmailEmail;
            $mail->Password   = $gmailPw;
            $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;
            $mail->CharSet    = 'UTF-8';
            $mail->setFrom($gmailEmail, $siteName ?: '예약 알림');
            $mail->addAddress($to);
            $mail->Subject = $subject;
            $mail->isHTML(true);
            $mail->Body    = $htmlBody ?: nl2br(htmlspecialchars($body));
            $mail->AltBody = $body;
            $mail->send();
        } catch (Throwable $e) {
            // 메일 발송 실패는 예약 처리에 영향 없음
        }
    }
}

/* ----------------------------------------------------------------
   Load Solapi API settings from alimtalk_settings
   Returns null if not configured.
   ---------------------------------------------------------------- */
if (!function_exists('bkf_notify_solapi_settings')) {
    function bkf_notify_solapi_settings(PDO $pdo): ?array {
        try {
            $row = $pdo->query('SELECT * FROM alimtalk_settings WHERE id=1 LIMIT 1')
                       ->fetch(PDO::FETCH_ASSOC);
        } catch (Throwable $e) {
            return null;
        }
        if (!$row) return null;

        $apiKey    = trim($row['api_key']    ?? '');
        $apiSecret = trim($row['api_secret'] ?? '');
        $sender    = bkf_notify_clean_phone(trim($row['sender'] ?? ''));

        if (!$apiKey || !$apiSecret || !$sender) return null;

        return [
            'api_key'    => $apiKey,
            'api_secret' => $apiSecret,
            'sender'     => $sender,
            'pfid'       => trim($row['pfid']       ?? ''),
            'tpl_notify' => trim($row['tpl_notify'] ?? ''),
        ];
    }
}

/* ----------------------------------------------------------------
   Send SMS / Alimtalk via Solapi
   useAlimtalk=1 : tries Alimtalk with tpl_notify, falls back to LMS
   useAlimtalk=0 : SMS/LMS only
   ---------------------------------------------------------------- */
if (!function_exists('bkf_notify_send_sms')) {
    function bkf_notify_send_sms(array $solapi, string $to, string $text, int $useAlimtalk = 0): void {
        $apiKey    = $solapi['api_key'];
        $apiSecret = $solapi['api_secret'];
        $from      = $solapi['sender'];
        $pfid      = $solapi['pfid']       ?? '';
        $tpl       = $solapi['tpl_notify'] ?? '';

        // Solapi HMAC-SHA256
        $date = gmdate("Y-m-d\TH:i:s\Z");
        $salt = bin2hex(random_bytes(16));
        $hmac = hash_hmac('sha256', $date . $salt, $apiSecret);
        $auth = "HMAC-SHA256 apiKey={$apiKey}, date={$date}, salt={$salt}, signature={$hmac}";

        // Choose message type
        if ($useAlimtalk && $pfid && $tpl) {
            $payload = json_encode([
                'message' => [
                    'to'   => $to,
                    'from' => $from,
                    'text' => $text,
                    'kakaoOptions' => [
                        'pfId'       => $pfid,
                        'templateId' => $tpl,
                    ],
                ],
            ], JSON_UNESCAPED_UNICODE);
        } else {
            $type    = mb_strlen($text) > 90 ? 'LMS' : 'SMS';
            $payload = json_encode([
                'message' => [
                    'to'   => $to,
                    'from' => $from,
                    'text' => $text,
                    'type' => $type,
                ],
            ], JSON_UNESCAPED_UNICODE);
        }

        try {
            $ch = curl_init('https://api.solapi.com/messages/v4/send');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $payload,
                CURLOPT_HTTPHEADER     => [
                    'Content-Type: application/json',
                    "Authorization: {$auth}",
                ],
                CURLOPT_TIMEOUT        => 10,
                CURLOPT_SSL_VERIFYPEER => true,
            ]);
            curl_exec($ch);
            curl_close($ch);
        } catch (Throwable $e) {
            // Fire-and-forget — notification failure must not affect reservation
        }
    }
}

/* ----------------------------------------------------------------
   Send to Google Apps Script spreadsheet webhook
   ---------------------------------------------------------------- */
if (!function_exists('bkf_notify_send_sheet')) {
    function bkf_notify_send_sheet(
        string $webhookUrl,
        string $sheetName,
        string $formTitle,
        array  $booking
    ): void {
        $payload = json_encode([
            'sheet_name' => $sheetName,
            'headers'    => [
                'Form', 'Reservation No', 'Name', 'Phone',
                'Date', 'Time', 'Store', 'Status', 'Submitted At',
            ],
            'values'     => [
                $formTitle,
                $booking['reservation_no']  ?? '',
                $booking['name']            ?? '',
                $booking['phone']           ?? '',
                $booking['reservation_date'] ?? '',
                $booking['reservation_time'] ?? '',
                $booking['store_name']       ?? '',
                $booking['status']           ?? '',
                $booking['created_at']       ?? '',
            ],
        ], JSON_UNESCAPED_UNICODE);

        try {
            $ch = curl_init($webhookUrl);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $payload,
                CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
                CURLOPT_TIMEOUT        => 10,
                CURLOPT_SSL_VERIFYPEER => true,
            ]);
            curl_exec($ch);
            curl_close($ch);
        } catch (Throwable $e) {
            // Fire-and-forget
        }
    }
}

/* ----------------------------------------------------------------
   Phone number cleaner (strips non-digits)
   ---------------------------------------------------------------- */
if (!function_exists('bkf_notify_clean_phone')) {
    function bkf_notify_clean_phone(string $phone): string {
        return preg_replace('/\D/', '', $phone) ?? '';
    }
}
