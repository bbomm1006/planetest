<?php
if (!function_exists('comboSendNotifications')) {

    function _comboLog(string $msg): void {
        file_put_contents(__DIR__ . '/combo_notify.log', date('[Y-m-d H:i:s]') . ' ' . $msg . "\n", FILE_APPEND | LOCK_EX);
    }

    function _comboGetActiveManagers(PDO $pdo): array {
        return $pdo->query('SELECT * FROM combo_managers WHERE is_active = 1')->fetchAll(PDO::FETCH_ASSOC);
    }

    function _comboBuildHtmlMail(array $inq, string $siteName, string $siteCopy): string {
        $esc = function($v) { return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); };
        $rows = [
            ['신청일시', $inq['created_at'] ?? date('Y-m-d H:i:s')],
            ['이  름',   $inq['name']        ?? ''],
            ['연락처',   $inq['phone']       ?? ''],
            ['신청제품', $inq['product_name'] ?? ''],
            ['상담시간', $inq['time_slot']    ?? ''],
            ['카드할인', $inq['card_discount_name'] ?? '없음'],
            ['최종금액', $inq['final_price'] ? number_format((int)$inq['final_price']) . '원/월' : ''],
            ['추가내용', $inq['message']     ?? ''],
        ];
        $tableRows = '';
        foreach ($rows as [$label, $value]) {
            if ((string)$value === '') continue;
            $tableRows .= '<tr>
              <td style="padding:10px 16px;font-size:.82rem;color:#64748b;font-weight:600;white-space:nowrap;border-bottom:1px solid #f1f5f9;width:90px;">' . $esc($label) . '</td>
              <td style="padding:10px 16px;font-size:.87rem;color:#1e293b;border-bottom:1px solid #f1f5f9;">' . $esc($value) . '</td>
            </tr>';
        }
        return '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:\'Noto Sans KR\',sans-serif;">
<div style="max-width:560px;margin:36px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,.10);">
  <div style="background:linear-gradient(90deg,#1255a6,#1e7fe8);padding:28px 32px;">
    <div style="font-weight:900;font-size:1.25rem;color:#fff;">' . $esc($siteName) . '</div>
    <div style="margin-top:6px;font-size:.82rem;color:rgba(255,255,255,.75);">결합상품 신청 알림</div>
  </div>
  <div style="padding:24px 32px 8px;">
    <p style="margin:0;font-size:.95rem;color:#1e293b;font-weight:600;">📋 새로운 결합상품 신청이 접수되었습니다.</p>
    <p style="margin:8px 0 0;font-size:.82rem;color:#64748b;">아래 신청 내용을 확인하고 빠르게 응대해 주세요.</p>
  </div>
  <div style="padding:12px 32px 24px;">
    <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:10px;overflow:hidden;">' . $tableRows . '</table>
  </div>
  <div style="background:#f8fafc;padding:16px 32px;font-size:.75rem;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;">' . $esc($siteCopy) . '</div>
</div></body></html>';
    }

    function comboSendNotifications(PDO $pdo, array $inquiry): void {
        _comboLog("=== comboSendNotifications 시작 id=" . ($inquiry['id'] ?? '?'));

        $managers = _comboGetActiveManagers($pdo);
        _comboLog("활성 담당자 수: " . count($managers));
        if (!$managers) return;

        /* 사이트 정보 */
        try {
            $siteRow = $pdo->query("SELECT title, copyright FROM homepage_info WHERE id=1 LIMIT 1")->fetch();
        } catch (Throwable $e) { $siteRow = null; }
        $siteName = $siteRow['title']     ?? '고객센터';
        $siteCopy = $siteRow['copyright'] ?? ('© ' . date('Y') . ' ' . $siteName);

        /* alimtalk_settings 조회 */
        try {
            $atRow = $pdo->query('SELECT * FROM alimtalk_settings WHERE id=1 LIMIT 1')->fetch();
            _comboLog("alimtalk_settings: api_key=" . (empty($atRow['api_key']) ? 'EMPTY' : 'SET') . " api_secret=" . (empty($atRow['api_secret']) ? 'EMPTY' : 'SET') . " sender=" . ($atRow['sender'] ?? 'EMPTY'));
        } catch (Throwable $e) {
            _comboLog("alimtalk_settings 조회 실패: " . $e->getMessage());
            $atRow = null;
        }
        $apiKey    = trim($atRow['api_key']    ?? '');
        $apiSecret = trim($atRow['api_secret'] ?? '');
        $fromPhone = preg_replace('/[^0-9]/', '', trim($atRow['sender'] ?? ''));
        $pfid      = trim($atRow['pfid']       ?? '');
        $tplNotify = trim($atRow['tpl_notify'] ?? '');

        $authHeader = '';
        if ($apiKey && $apiSecret && $fromPhone) {
            $date       = gmdate('Y-m-d\TH:i:s\Z');
            $salt       = bin2hex(random_bytes(16));
            $hmac       = hash_hmac('sha256', $date . $salt, $apiSecret);
            $authHeader = "HMAC-SHA256 apiKey={$apiKey}, date={$date}, salt={$salt}, signature={$hmac}";
            _comboLog("Solapi authHeader 생성 완료");
        } else {
            _comboLog("Solapi authHeader 생성 실패: apiKey=" . ($apiKey ? 'OK' : 'EMPTY') . " apiSecret=" . ($apiSecret ? 'OK' : 'EMPTY') . " fromPhone=" . ($fromPhone ?: 'EMPTY'));
        }

        $subject  = '[결합상품 신청] ' . ($inquiry['name'] ?? '') . ' / ' . ($inquiry['product_name'] ?? '');
        $htmlBody = _comboBuildHtmlMail($inquiry, $siteName, $siteCopy);
        $smsText  = "[결합상품 신청]\n이름: " . ($inquiry['name'] ?? '') . "\n연락처: " . ($inquiry['phone'] ?? '') . "\n제품: " . ($inquiry['product_name'] ?? '') . "\n시간: " . ($inquiry['time_slot'] ?? '');

        /* PHPMailer 로드 */
        $pmBase = __DIR__ . '/../../phpmailer';
        if (!class_exists('PHPMailer\\PHPMailer\\PHPMailer') && file_exists($pmBase . '/PHPMailer.php')) {
            require_once $pmBase . '/Exception.php';
            require_once $pmBase . '/PHPMailer.php';
            require_once $pmBase . '/SMTP.php';
            _comboLog("PHPMailer 로드 완료");
        } else {
            _comboLog("PHPMailer 상태: " . (class_exists('PHPMailer\\PHPMailer\\PHPMailer') ? '이미로드됨' : '파일없음(' . $pmBase . ')'));
        }
        $gmailEmail = 'solha.jin90@gmail.com';
        $gmailPw    = 'otud ocoq cmsv hvde';

        foreach ($managers as $m) {
            _comboLog("-- 담당자: " . ($m['name'] ?? '?') . " email_flag=" . ($m['notify_email'] ?? 0) . " sms_flag=" . ($m['notify_sms'] ?? 0) . " alimtalk_flag=" . ($m['notify_alimtalk'] ?? 0) . " sheet_flag=" . ($m['notify_sheet'] ?? 0));

            /* 이메일 */
            if ((int)($m['notify_email'] ?? 0) === 1 && !empty($m['email'])) {
                _comboLog("  이메일 발송 시도: " . $m['email']);
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
                    $mail->setFrom($gmailEmail, $siteName . ' 고객센터');
                    $mail->addAddress($m['email'], $m['name'] ?? '');
                    $mail->Subject = $subject;
                    $mail->isHTML(true);
                    $mail->Body    = $htmlBody;
                    $mail->send();
                    _comboLog("  이메일 발송 성공");
                } catch (Throwable $e) {
                    _comboLog("  이메일 발송 실패: " . $e->getMessage());
                }
            } elseif ((int)($m['notify_email'] ?? 0) === 1 && empty($m['email'])) {
                _comboLog("  이메일 스킵: 이메일 주소 없음");
            }

            /* 구글시트 */
            if ((int)($m['notify_sheet'] ?? 0) === 1) {
                _comboLog("  구글시트 시도: " . ($m['sheet_id'] ?? 'URL없음'));
                if (!empty($m['sheet_id'])) {
                    try {
                        $payload = json_encode(array_merge($inquiry, [
                            'sheet_name' => !empty($m['sheet_name']) ? $m['sheet_name'] : 'Sheet1',
                        ]), JSON_UNESCAPED_UNICODE);
                        $ch = curl_init($m['sheet_id']);
                        curl_setopt_array($ch, [
                            CURLOPT_RETURNTRANSFER => true,
                            CURLOPT_POST           => true,
                            CURLOPT_POSTFIELDS     => $payload,
                            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
                            CURLOPT_TIMEOUT        => 10,
                            CURLOPT_SSL_VERIFYPEER => true,
                            CURLOPT_FOLLOWLOCATION => true,
                            CURLOPT_MAXREDIRS      => 5,
                        ]);
                        $res = curl_exec($ch);
                        $err = curl_error($ch);
                        curl_close($ch);
                        _comboLog("  구글시트 결과: " . ($err ?: substr((string)$res, 0, 100)));
                    } catch (Throwable $e) {
                        _comboLog("  구글시트 실패: " . $e->getMessage());
                    }
                }
            }

            /* SMS */
            if ((int)($m['notify_sms'] ?? 0) === 1 && !empty($m['phone'])) {
                _comboLog("  SMS 시도: " . $m['phone'] . " authHeader=" . ($authHeader ? 'OK' : 'EMPTY'));
                if ($authHeader) {
                    try {
                        $toPhone = preg_replace('/[^0-9]/', '', $m['phone']);
                        $shortSms = '[결합상품 신청] 새 신청이 접수되었습니다. 관리자 페이지를 확인해 주세요.';
                        $payload = json_encode(['message' => ['to' => $toPhone, 'from' => $fromPhone, 'text' => $shortSms, 'type' => 'SMS']], JSON_UNESCAPED_UNICODE);
                        $ch = curl_init('https://api.solapi.com/messages/v4/send');
                        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_POSTFIELDS => $payload, CURLOPT_HTTPHEADER => ['Content-Type: application/json', "Authorization: {$authHeader}"], CURLOPT_TIMEOUT => 10]);
                        $res = curl_exec($ch);
                        $err = curl_error($ch);
                        curl_close($ch);
                        _comboLog("  SMS 결과: " . ($err ?: substr((string)$res, 0, 200)));
                    } catch (Throwable $e) {
                        _comboLog("  SMS 실패: " . $e->getMessage());
                    }
                }
            }

            /* 알림톡 */
            if ((int)($m['notify_alimtalk'] ?? 0) === 1 && !empty($m['phone'])) {
                _comboLog("  알림톡 시도: " . $m['phone'] . " pfid=" . ($pfid ?: 'EMPTY') . " tpl=" . ($tplNotify ?: 'EMPTY') . " authHeader=" . ($authHeader ? 'OK' : 'EMPTY'));
                if ($authHeader) {
                    try {
                        $toPhone = preg_replace('/[^0-9]/', '', $m['phone']);
                        if ($pfid && $tplNotify) {
                            $payload = json_encode(['message' => ['to' => $toPhone, 'from' => $fromPhone, 'text' => $smsText, 'kakaoOptions' => ['pfId' => $pfid, 'templateId' => $tplNotify, 'variables' => ['#{이름}' => $inquiry['name'] ?? '', '#{제품}' => $inquiry['product_name'] ?? '', '#{연락처}' => $inquiry['phone'] ?? '', '#{시간}' => $inquiry['time_slot'] ?? '']]]], JSON_UNESCAPED_UNICODE);
                        } else {
                            $payload = json_encode(['message' => ['to' => $toPhone, 'from' => $fromPhone, 'text' => $smsText, 'type' => 'SMS']], JSON_UNESCAPED_UNICODE);
                        }
                        $ch = curl_init('https://api.solapi.com/messages/v4/send');
                        curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_POSTFIELDS => $payload, CURLOPT_HTTPHEADER => ['Content-Type: application/json', "Authorization: {$authHeader}"], CURLOPT_TIMEOUT => 10]);
                        $res = curl_exec($ch);
                        $err = curl_error($ch);
                        curl_close($ch);
                        _comboLog("  알림톡 결과: " . ($err ?: substr((string)$res, 0, 200)));
                    } catch (Throwable $e) {
                        _comboLog("  알림톡 실패: " . $e->getMessage());
                    }
                }
            }
        }
        _comboLog("=== comboSendNotifications 종료");
    }
}
