<?php
declare(strict_types=1);

function rv2_json_out(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function rv2_read_json_body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $j = json_decode($raw, true);
    return is_array($j) ? $j : [];
}

function rv2_normalize_phone(string $phone): string {
    return preg_replace('/\D+/', '', $phone) ?? '';
}

function rv2_gen_reservation_no(PDO $pdo): string {
    for ($i = 0; $i < 20; $i++) {
        $no = 'R' . date('ymd') . strtoupper(bin2hex(random_bytes(3)));
        $st = $pdo->prepare('SELECT 1 FROM rv2_booking WHERE reservation_no = ? LIMIT 1');
        $st->execute([$no]);
        if (!$st->fetchColumn()) {
            return $no;
        }
    }
    return 'R' . date('ymdHis') . mt_rand(1000, 9999);
}

function rv2_timezone(): DateTimeZone {
    return new DateTimeZone('Asia/Seoul');
}

/** 당일 예약: 시작 시각이 지금으로부터 2시간 이후여야 함 */
function rv2_validate_same_day_two_hours(string $dateYmd, string $timeHi): ?string {
    $tz = rv2_timezone();
    $now = new DateTimeImmutable('now', $tz);
    try {
        $dt = new DateTimeImmutable($dateYmd . ' ' . $timeHi . ':00', $tz);
    } catch (Exception $e) {
        return '날짜/시간 형식이 올바르지 않습니다.';
    }
    if ($dt->format('Y-m-d') !== $now->format('Y-m-d')) {
        return null;
    }
    $min = $now->modify('+2 hours');
    if ($dt < $min) {
        return '당일 예약은 시작 2시간 전까지만 가능합니다.';
    }
    return null;
}

function rv2_auto_complete_past(PDO $pdo): void {
    $pdo->exec(
        "UPDATE rv2_booking SET status = '완료' 
         WHERE status IN ('접수','확인') AND reservation_at < NOW()"
    );
}

function rv2_decode_options(?string $json): array {
    if ($json === null || $json === '') {
        return [];
    }
    $a = json_decode($json, true);
    return is_array($a) ? $a : [];
}
