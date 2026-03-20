<?php
declare(strict_types=1);

/**
 * 알림: 이메일(다중, PHP mail), 스프레드시트/알림톡 웹훅 POST JSON
 */
function rv2_send_notifications(
    PDO $pdo,
    array $booking,
    array $emailsToSend,
    bool $emailChannelOn,
    bool $doSheet,
    bool $doAlim
): void {
    $payload = [
        'event' => 'reservation_created',
        'reservation_no' => $booking['reservation_no'],
        'status' => $booking['status'],
        'reservation_at' => $booking['reservation_at'],
        'branch_id' => $booking['branch_id'],
        'item_id' => $booking['item_id'],
        'name' => $booking['customer_name'],
        'phone' => $booking['customer_phone'],
        'email' => $booking['customer_email'],
        'extra' => $booking['extra_json'] ?? null,
    ];
    $textBody = implode("\n", [
        '[예약 접수]',
        '예약번호: ' . $booking['reservation_no'],
        '일시: ' . $booking['reservation_at'],
        '이름: ' . $booking['customer_name'],
        '연락처: ' . $booking['customer_phone'],
    ]);

    $st = $pdo->query('SELECT notify_emails, spreadsheet_webhook, alimtalk_webhook FROM rv2_settings WHERE id = 1 LIMIT 1');
    $settings = $st ? $st->fetch(PDO::FETCH_ASSOC) : [];

    $defaultEmails = array_filter(array_map('trim', explode(',', (string)($settings['notify_emails'] ?? ''))));

    $hdr = "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n";
    $subjPrefix = '=?UTF-8?B?' . base64_encode('[예약] ') . '?=';

    if ($emailChannelOn) {
        foreach ($emailsToSend as $to) {
            $to = trim($to);
            if ($to !== '' && strpos($to, '@') !== false) {
                @mail($to, $subjPrefix . $booking['reservation_no'], $textBody, $hdr);
            }
        }
        foreach ($defaultEmails as $to) {
            if ($to !== '' && strpos($to, '@') !== false) {
                @mail($to, $subjPrefix . '알림 ' . $booking['reservation_no'], $textBody, $hdr);
            }
        }
    }

    if ($doSheet && !empty($settings['spreadsheet_webhook'])) {
        rv2_post_webhook($settings['spreadsheet_webhook'], $payload);
    }
    if ($doAlim && !empty($settings['alimtalk_webhook'])) {
        rv2_post_webhook($settings['alimtalk_webhook'], $payload + ['channel' => 'alimtalk']);
    }
}

function rv2_post_webhook(string $url, array $payload): void {
    $url = trim($url);
    if ($url === '') {
        return;
    }
    $body = json_encode($payload, JSON_UNESCAPED_UNICODE);
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json; charset=utf-8\r\nContent-Length: " . strlen($body) . "\r\n",
            'content' => $body,
            'timeout' => 8,
        ],
    ]);
    @file_get_contents($url, false, $ctx);
}
