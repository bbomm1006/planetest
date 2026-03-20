<?php
declare(strict_types=1);

function customReser_json_out(array $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function customReser_read_json_body(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }
    $j = json_decode($raw, true);
    return is_array($j) ? $j : [];
}

function customReser_normalize_phone(string $phone): string {
    return preg_replace('/\D+/', '', $phone) ?? '';
}

function customReser_gen_reservation_no(PDO $pdo): string {
    for ($i = 0; $i < 20; $i++) {
        $no = 'S' . date('ymd') . strtoupper(bin2hex(random_bytes(3)));
        $st = $pdo->prepare('SELECT 1 FROM customReser_booking WHERE reservation_no = ? LIMIT 1');
        $st->execute([$no]);
        if (!$st->fetchColumn()) {
            return $no;
        }
    }
    return 'S' . date('ymdHis') . mt_rand(1000, 9999);
}

function customReser_timezone(): DateTimeZone {
    return new DateTimeZone('Asia/Seoul');
}

function customReser_today_ymd(): string {
    return (new DateTimeImmutable('now', customReser_timezone()))->format('Y-m-d');
}

/** 당일 예약: 시작 시각이 지금으로부터 2시간 이후여야 함 */
function customReser_validate_same_day_two_hours(string $dateYmd, string $timeHi): ?string {
    $tz = customReser_timezone();
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

function customReser_auto_complete_past(PDO $pdo): void {
    $pdo->exec(
        "UPDATE customReser_booking SET status = '완료'
         WHERE status IN ('접수','확인') AND reservation_at < NOW()"
    );
}

function customReser_decode_options(?string $json): array {
    if ($json === null || $json === '') {
        return [];
    }
    $a = json_decode($json, true);
    return is_array($a) ? $a : [];
}

function customReser_instance_by_slug(PDO $pdo, string $slug): ?array {
    $slug = strtolower(trim($slug));
    if ($slug === '' || !preg_match('/^[a-z0-9\-]+$/', $slug)) {
        return null;
    }
    $st = $pdo->prepare('SELECT * FROM customReser_instance WHERE slug = ? AND is_active = 1 LIMIT 1');
    $st->execute([$slug]);
    $r = $st->fetch(PDO::FETCH_ASSOC);
    return $r ?: null;
}

/** 활성 단계 중 time/item 마지막 기준 */
function customReser_capacity_mode(PDO $pdo, int $instanceId): string {
    $st = $pdo->prepare(
        'SELECT step_key FROM customReser_instance_step WHERE instance_id = ? AND is_active = 1 ORDER BY sort_order ASC, id ASC'
    );
    $st->execute([$instanceId]);
    $last = null;
    while (($k = $st->fetchColumn()) !== false) {
        if ($k === 'time' || $k === 'item') {
            $last = (string)$k;
        }
    }
    return $last === 'item' ? 'item' : 'time';
}

function customReser_item_mode_clock_time(): string {
    return '09:00:00';
}

function customReser_is_day_closed(PDO $pdo, int $instanceId, int $branchId, string $dateYmd): bool {
    $st = $pdo->prepare(
        'SELECT 1 FROM customReser_day_closure WHERE instance_id=? AND branch_id=? AND closure_date=? LIMIT 1'
    );
    $st->execute([$instanceId, $branchId, $dateYmd]);
    return (bool)$st->fetchColumn();
}

function customReser_release_booking_capacity(PDO $pdo, array $bookingRow): void {
    if (!empty($bookingRow['slot_id'])) {
        $pdo->prepare('UPDATE customReser_slot SET booked = GREATEST(0, booked - 1) WHERE id = ?')
            ->execute([(int)$bookingRow['slot_id']]);
    }
    if (!empty($bookingRow['item_quota_id'])) {
        $pdo->prepare('UPDATE customReser_item_quota SET booked = GREATEST(0, booked - 1) WHERE id = ?')
            ->execute([(int)$bookingRow['item_quota_id']]);
    }
}

/**
 * @param array<string,mixed> $in
 * @return array{ok:bool,msg?:string,id?:int,reservation_no?:string,reservation_at?:string}
 */
function customReser_booking_create(PDO $pdo, int $instanceId, array $in): array {
    $mode = customReser_capacity_mode($pdo, $instanceId);
    $branchId = (int)($in['branch_id'] ?? 0);
    $name = trim((string)($in['customer_name'] ?? ''));
    $phone = trim((string)($in['customer_phone'] ?? ''));
    $email = trim((string)($in['customer_email'] ?? ''));
    $itemId = isset($in['item_id']) ? (int)$in['item_id'] : 0;
    $itemId = $itemId > 0 ? $itemId : null;
    $extra = isset($in['extra']) && is_array($in['extra']) ? $in['extra'] : [];

    if ($branchId < 1 || $name === '' || $phone === '') {
        return ['ok' => false, 'msg' => '지점, 이름, 연락처는 필수입니다.'];
    }

    $chkBr = $pdo->prepare(
        'SELECT 1 FROM customReser_instance_branch WHERE instance_id = ? AND branch_id = ? LIMIT 1'
    );
    $chkBr->execute([$instanceId, $branchId]);
    if (!$chkBr->fetchColumn()) {
        return ['ok' => false, 'msg' => '선택한 지점을 이 예약에서 사용할 수 없습니다.'];
    }

    $phoneNorm = customReser_normalize_phone($phone);
    $phoneSave = $phoneNorm !== '' ? $phoneNorm : $phone;

    $dup = $pdo->prepare(
        "SELECT id FROM customReser_booking WHERE instance_id = ? AND customer_name = ? AND customer_phone = ? AND status != '취소' LIMIT 1"
    );
    $dup->execute([$instanceId, $name, $phoneSave]);
    if ($dup->fetchColumn()) {
        return ['ok' => false, 'msg' => '동일 이름·연락처로 진행 중인 예약이 있습니다.'];
    }

    $slotId = null;
    $itemQuotaId = null;
    $resAt = '';

    $pdo->beginTransaction();
    try {
        if ($mode === 'time') {
            $sid = (int)($in['slot_id'] ?? 0);
            if ($sid < 1) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '시간을 선택해 주세요.'];
            }
            $slotSt = $pdo->prepare(
                'SELECT * FROM customReser_slot WHERE id = ? AND instance_id = ? FOR UPDATE'
            );
            $slotSt->execute([$sid, $instanceId]);
            $slot = $slotSt->fetch(PDO::FETCH_ASSOC);
            if (!$slot || (int)$slot['branch_id'] !== $branchId) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '잘못된 시간 슬롯입니다.'];
            }
            $dateYmd = (string)$slot['slot_date'];
            if ($dateYmd < customReser_today_ymd()) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '과거 날짜는 예약할 수 없습니다.'];
            }
            if (customReser_is_day_closed($pdo, $instanceId, $branchId, $dateYmd)) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '해당 일정은 예약이 불가합니다.'];
            }
            if ((int)$slot['booked'] >= (int)$slot['capacity']) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '해당 시간은 마감되었습니다.'];
            }
            $timeHi = substr((string)$slot['slot_time'], 0, 5);
            $err = customReser_validate_same_day_two_hours($dateYmd, $timeHi);
            if ($err) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => $err];
            }
            $resAt = $dateYmd . ' ' . substr((string)$slot['slot_time'], 0, 8);
            $up = $pdo->prepare('UPDATE customReser_slot SET booked = booked + 1 WHERE id = ? AND booked < capacity');
            $up->execute([$sid]);
            if ($up->rowCount() !== 1) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '예약 가능 인원이 부족합니다.'];
            }
            $slotId = $sid;
        } else {
            $iqid = (int)($in['item_quota_id'] ?? 0);
            if ($iqid < 1) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '항목·일정을 선택해 주세요.'];
            }
            $qSt = $pdo->prepare(
                'SELECT * FROM customReser_item_quota WHERE id = ? AND instance_id = ? FOR UPDATE'
            );
            $qSt->execute([$iqid, $instanceId]);
            $qrow = $qSt->fetch(PDO::FETCH_ASSOC);
            if (!$qrow || (int)$qrow['branch_id'] !== $branchId) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '잘못된 항목 일정입니다.'];
            }
            $dateYmd = (string)$qrow['quota_date'];
            if ($dateYmd < customReser_today_ymd()) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '과거 날짜는 예약할 수 없습니다.'];
            }
            if (customReser_is_day_closed($pdo, $instanceId, $branchId, $dateYmd)) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '해당 일정은 예약이 불가합니다.'];
            }
            if ($itemId !== null && (int)$qrow['item_id'] !== $itemId) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '선택한 항목과 일정이 일치하지 않습니다.'];
            }
            if ((int)$qrow['booked'] >= (int)$qrow['capacity']) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '해당 항목은 마감되었습니다.'];
            }
            $clock = customReser_item_mode_clock_time();
            $err = customReser_validate_same_day_two_hours($dateYmd, substr($clock, 0, 5));
            if ($err) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => $err];
            }
            $resAt = $dateYmd . ' ' . $clock;
            $up = $pdo->prepare(
                'UPDATE customReser_item_quota SET booked = booked + 1 WHERE id = ? AND booked < capacity'
            );
            $up->execute([$iqid]);
            if ($up->rowCount() !== 1) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '예약 가능 인원이 부족합니다.'];
            }
            $itemQuotaId = $iqid;
            if ($itemId === null) {
                $itemId = (int)$qrow['item_id'];
            }
        }

        $resNo = customReser_gen_reservation_no($pdo);
        $extraJson = json_encode($extra, JSON_UNESCAPED_UNICODE);
        $ins = $pdo->prepare(
            'INSERT INTO customReser_booking (instance_id, reservation_no, status, branch_id, item_id, slot_id, item_quota_id, reservation_at,
             customer_name, customer_phone, customer_email, extra_json, admin_note)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NULL)'
        );
        $ins->execute([
            $instanceId,
            $resNo,
            '접수',
            $branchId,
            $itemId,
            $slotId,
            $itemQuotaId,
            $resAt,
            $name,
            $phoneSave,
            $email !== '' ? $email : null,
            $extraJson,
        ]);
        $bid = (int)$pdo->lastInsertId();
        $pdo->commit();
        return ['ok' => true, 'id' => $bid, 'reservation_no' => $resNo, 'reservation_at' => $resAt];
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        return ['ok' => false, 'msg' => '예약 처리 중 오류가 발생했습니다.'];
    }
}

function customReser_find_booking_for_customer(PDO $pdo, int $instanceId, string $reservationNo, string $phoneRaw): ?array {
    $phone = customReser_normalize_phone($phoneRaw);
    $p = $phone !== '' ? $phone : trim($phoneRaw);
    $st = $pdo->prepare(
        'SELECT * FROM customReser_booking WHERE instance_id = ? AND reservation_no = ? AND customer_phone = ? LIMIT 1'
    );
    $st->execute([$instanceId, trim($reservationNo), $p]);
    $row = $st->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

/**
 * @return array{ok:bool,msg?:string}
 */
function customReser_booking_reschedule(PDO $pdo, array $booking, int $newSlotId, int $newItemQuotaId): array {
    $instanceId = (int)$booking['instance_id'];
    $mode = customReser_capacity_mode($pdo, $instanceId);
    $id = (int)$booking['id'];
    $branchId = (int)$booking['branch_id'];

    $pdo->beginTransaction();
    try {
        $bSt = $pdo->prepare('SELECT * FROM customReser_booking WHERE id=? FOR UPDATE');
        $bSt->execute([$id]);
        $b = $bSt->fetch(PDO::FETCH_ASSOC);
        if (!$b || $b['status'] !== '접수') {
            $pdo->rollBack();
            return ['ok' => false, 'msg' => '접수 상태에서만 일정 변경이 가능합니다.'];
        }

        if ($mode === 'time') {
            if ($newSlotId < 1) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '새 시간을 선택해 주세요.'];
            }
            $nSt = $pdo->prepare('SELECT * FROM customReser_slot WHERE id=? AND instance_id=? FOR UPDATE');
            $nSt->execute([$newSlotId, $instanceId]);
            $ns = $nSt->fetch(PDO::FETCH_ASSOC);
            if (!$ns || (int)$ns['branch_id'] !== $branchId) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '같은 지점의 시간만 선택하세요.'];
            }
            $dateYmd = (string)$ns['slot_date'];
            if ($dateYmd < customReser_today_ymd()) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '과거 날짜는 선택할 수 없습니다.'];
            }
            if (customReser_is_day_closed($pdo, $instanceId, $branchId, $dateYmd)) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '해당 일정은 예약이 불가합니다.'];
            }
            if ((int)$ns['booked'] >= (int)$ns['capacity']) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '선택한 시간은 마감되었습니다.'];
            }
            $timeHi = substr((string)$ns['slot_time'], 0, 5);
            $err = customReser_validate_same_day_two_hours($dateYmd, $timeHi);
            if ($err) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => $err];
            }
            $resAt = $dateYmd . ' ' . substr((string)$ns['slot_time'], 0, 8);
            $oldSlot = (int)($b['slot_id'] ?? 0);
            $oldIq = (int)($b['item_quota_id'] ?? 0);
            if ($oldSlot > 0) {
                $pdo->prepare('UPDATE customReser_slot SET booked = GREATEST(0, booked - 1) WHERE id=?')->execute([$oldSlot]);
            }
            if ($oldIq > 0) {
                $pdo->prepare('UPDATE customReser_item_quota SET booked = GREATEST(0, booked - 1) WHERE id=?')->execute([$oldIq]);
            }
            $up = $pdo->prepare('UPDATE customReser_slot SET booked = booked + 1 WHERE id=? AND booked < capacity');
            $up->execute([$newSlotId]);
            if ($up->rowCount() !== 1) {
                if ($oldSlot > 0) {
                    $pdo->prepare('UPDATE customReser_slot SET booked = booked + 1 WHERE id=?')->execute([$oldSlot]);
                }
                if ($oldIq > 0) {
                    $pdo->prepare('UPDATE customReser_item_quota SET booked = booked + 1 WHERE id=?')->execute([$oldIq]);
                }
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '예약 가능 인원이 부족합니다.'];
            }
            $pdo->prepare(
                'UPDATE customReser_booking SET slot_id=?, item_quota_id=NULL, reservation_at=? WHERE id=?'
            )->execute([$newSlotId, $resAt, $id]);
        } else {
            if ($newItemQuotaId < 1) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '새 항목·일정을 선택해 주세요.'];
            }
            $qSt = $pdo->prepare(
                'SELECT * FROM customReser_item_quota WHERE id=? AND instance_id=? FOR UPDATE'
            );
            $qSt->execute([$newItemQuotaId, $instanceId]);
            $nq = $qSt->fetch(PDO::FETCH_ASSOC);
            if (!$nq || (int)$nq['branch_id'] !== $branchId) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '같은 지점의 항목만 선택하세요.'];
            }
            $dateYmd = (string)$nq['quota_date'];
            if ($dateYmd < customReser_today_ymd()) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '과거 날짜는 선택할 수 없습니다.'];
            }
            if (customReser_is_day_closed($pdo, $instanceId, $branchId, $dateYmd)) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '해당 일정은 예약이 불가합니다.'];
            }
            if ((int)$nq['booked'] >= (int)$nq['capacity']) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '선택한 항목은 마감되었습니다.'];
            }
            $clock = customReser_item_mode_clock_time();
            $err = customReser_validate_same_day_two_hours($dateYmd, substr($clock, 0, 5));
            if ($err) {
                $pdo->rollBack();
                return ['ok' => false, 'msg' => $err];
            }
            $resAt = $dateYmd . ' ' . $clock;
            $newItemId = (int)$nq['item_id'];
            $oldSlot = (int)($b['slot_id'] ?? 0);
            $oldIq = (int)($b['item_quota_id'] ?? 0);
            if ($oldSlot > 0) {
                $pdo->prepare('UPDATE customReser_slot SET booked = GREATEST(0, booked - 1) WHERE id=?')->execute([$oldSlot]);
            }
            if ($oldIq > 0) {
                $pdo->prepare('UPDATE customReser_item_quota SET booked = GREATEST(0, booked - 1) WHERE id=?')->execute([$oldIq]);
            }
            $up = $pdo->prepare(
                'UPDATE customReser_item_quota SET booked = booked + 1 WHERE id=? AND booked < capacity'
            );
            $up->execute([$newItemQuotaId]);
            if ($up->rowCount() !== 1) {
                if ($oldSlot > 0) {
                    $pdo->prepare('UPDATE customReser_slot SET booked = booked + 1 WHERE id=?')->execute([$oldSlot]);
                }
                if ($oldIq > 0) {
                    $pdo->prepare('UPDATE customReser_item_quota SET booked = booked + 1 WHERE id=?')->execute([$oldIq]);
                }
                $pdo->rollBack();
                return ['ok' => false, 'msg' => '예약 가능 인원이 부족합니다.'];
            }
            $pdo->prepare(
                'UPDATE customReser_booking SET slot_id=NULL, item_quota_id=?, item_id=?, reservation_at=? WHERE id=?'
            )->execute([$newItemQuotaId, $newItemId, $resAt, $id]);
        }
        $pdo->commit();
        return ['ok' => true];
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        return ['ok' => false, 'msg' => '변경 실패'];
    }
}

function customReser_seed_default_steps(PDO $pdo, int $instanceId): void {
    $keys = [
        ['branch', 10],
        ['date', 20],
        ['time', 30],
        ['item', 40],
        ['info', 50],
    ];
    $ins = $pdo->prepare(
        'INSERT IGNORE INTO customReser_instance_step (instance_id, step_key, sort_order, is_active) VALUES (?,?,?,1)'
    );
    foreach ($keys as [$k, $ord]) {
        $ins->execute([$instanceId, $k, $ord]);
    }
}
