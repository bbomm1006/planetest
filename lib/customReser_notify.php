<?php
declare(strict_types=1);

function customReser_send_admin_notifications(PDO $pdo, int $instanceId, array $booking): void {
    $extra = $booking['extra_json'] ?? [];
    if (is_string($extra)) {
        $d = json_decode($extra, true);
        $extra = is_array($d) ? $d : [];
    }
    $payload = [
        'event' => 'reservation_created',
        'instance_id' => $instanceId,
        'reservation_no' => $booking['reservation_no'],
        'status' => $booking['status'],
        'reservation_at' => $booking['reservation_at'],
        'branch_id' => $booking['branch_id'],
        'item_id' => $booking['item_id'],
        'name' => $booking['customer_name'],
        'phone' => $booking['customer_phone'],
        'email' => $booking['customer_email'],
        'extra' => $extra,
    ];
    $textBody = implode("\n", [
        '[예약 접수]',
        '예약번호: ' . $booking['reservation_no'],
        '일시: ' . $booking['reservation_at'],
        '이름: ' . $booking['customer_name'],
        '연락처: ' . $booking['customer_phone'],
    ]);

    $st = $pdo->prepare(
        'SELECT notify_emails, spreadsheet_webhook, alimtalk_webhook, notify_use_email, notify_use_sheet, notify_use_alim
         FROM customReser_instance_settings WHERE instance_id = ? LIMIT 1'
    );
    $st->execute([$instanceId]);
    $settings = $st->fetch(PDO::FETCH_ASSOC) ?: [];

    $useEmail = !isset($settings['notify_use_email']) || (int)$settings['notify_use_email'] === 1;
    $useSheet = isset($settings['notify_use_sheet']) && (int)$settings['notify_use_sheet'] === 1;
    $useAlim = isset($settings['notify_use_alim']) && (int)$settings['notify_use_alim'] === 1;

    $defaultEmails = array_filter(array_map('trim', explode(',', (string)($settings['notify_emails'] ?? ''))));

    $hdr = "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n";
    $subjPrefix = '=?UTF-8?B?' . base64_encode('[예약] ') . '?=';

    if ($useEmail) {
        foreach ($defaultEmails as $to) {
            if ($to !== '' && strpos($to, '@') !== false) {
                @mail($to, $subjPrefix . $booking['reservation_no'], $textBody, $hdr);
            }
        }
    }

    if ($useSheet && !empty($settings['spreadsheet_webhook'])) {
        customReser_post_webhook((string)$settings['spreadsheet_webhook'], $payload);
    }
    if ($useAlim && !empty($settings['alimtalk_webhook'])) {
        customReser_post_webhook((string)$settings['alimtalk_webhook'], $payload + ['channel' => 'alimtalk']);
    }
}

function customReser_post_webhook(string $url, array $payload): void {
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
