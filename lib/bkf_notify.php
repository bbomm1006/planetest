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

        $formTitle = $form['title'] ?? 'Booking';

        // Build text body (SMS / email plain-text)
        $body = bkf_notify_build_body($formTitle, $booking);

        foreach ($managers as $mgr) {
            // ── Email (PHP mail)
            if ((int)$mgr['notify_email'] && !empty($mgr['email'])) {
                bkf_notify_send_email($mgr['email'], $formTitle, $body);
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
   Build plain-text notification body
   ---------------------------------------------------------------- */
if (!function_exists('bkf_notify_build_body')) {
    function bkf_notify_build_body(string $formTitle, array $booking): string {
        $lines = [
            "[{$formTitle}] New reservation received.",
            "Reservation No : " . ($booking['reservation_no'] ?? '-'),
            "Name           : " . ($booking['name']           ?? '-'),
            "Phone          : " . ($booking['phone']          ?? '-'),
            "Date           : " . ($booking['reservation_date'] ?? '-'),
            "Time           : " . ($booking['reservation_time'] ?? '-'),
            "Store          : " . ($booking['store_name']      ?? '-'),
            "Status         : " . ($booking['status']          ?? '-'),
            "Submitted at   : " . ($booking['created_at']      ?? '-'),
        ];
        return implode("\n", $lines);
    }
}

/* ----------------------------------------------------------------
   Email via PHP mail()
   ---------------------------------------------------------------- */
if (!function_exists('bkf_notify_send_email')) {
    function bkf_notify_send_email(string $to, string $formTitle, string $body): void {
        if (!$to || strpos($to, '@') === false) return;
        $subject = '=?UTF-8?B?' . base64_encode("[Booking] {$formTitle} - New Reservation") . '?=';
        $headers = "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n";
        @mail($to, $subject, $body, $headers);
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
