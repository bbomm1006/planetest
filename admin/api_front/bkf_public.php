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
$in     = ($method === 'POST') ? (json_decode(file_get_contents('php://input'), true) ?: $_POST) : $_GET;
$action = trim((string)($in['action'] ?? ''));
$slug   = trim((string)($in['slug']   ?? ''));

/* ================================================================
   공통 헬퍼
   ================================================================ */
function bkf_out(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function bkf_today(): string {
    return (new DateTimeImmutable('now', new DateTimeZone('Asia/Seoul')))->format('Y-m-d');
}

function bkf_now(): DateTimeImmutable {
    return new DateTimeImmutable('now', new DateTimeZone('Asia/Seoul'));
}

function bkf_normalize_phone(string $p): string {
    return preg_replace('/\D+/', '', $p) ?? '';
}

function bkf_gen_reservation_no(PDO $pdo, string $tbl): string {
    for ($i = 0; $i < 20; $i++) {
        $no = 'B' . date('ymd') . strtoupper(bin2hex(random_bytes(3)));
        $st = $pdo->prepare("SELECT 1 FROM `{$tbl}` WHERE reservation_no=? LIMIT 1");
        $st->execute([$no]);
        if (!$st->fetchColumn()) return $no;
    }
    return 'B' . date('ymdHis') . mt_rand(1000, 9999);
}

/** 당일 2시간 전 예약 차단 (시간 슬롯 있을 때만) */
function bkf_validate_2h(string $date, ?string $time): ?string {
    if (!$time) return null;
    $tz  = new DateTimeZone('Asia/Seoul');
    $now = new DateTimeImmutable('now', $tz);
    try {
        $dt = new DateTimeImmutable($date . ' ' . $time . ':00', $tz);
    } catch (Throwable $e) {
        return 'Invalid date/time format.';
    }
    if ($dt->format('Y-m-d') !== $now->format('Y-m-d')) return null;
    if ($dt < $now->modify('+2 hours')) {
        return 'Same-day reservations must be made at least 2 hours in advance.';
    }
    return null;
}

/** quota 차감 (FOR UPDATE — 트랜잭션 안에서 호출) */
function bkf_deduct(PDO $pdo, int $form_id, ?int $store_id, ?string $quota_date, ?string $slot_time): bool {
    if (!$quota_date) return true;
    if ($store_id !== null) {
        $st = $pdo->prepare(
            'SELECT id, capacity, booked FROM bkf_quota
             WHERE form_id=? AND store_id=? AND quota_date=?
               AND (slot_time=? OR (slot_time IS NULL AND ? IS NULL))
             FOR UPDATE'
        );
        $st->execute([$form_id, $store_id, $quota_date, $slot_time, $slot_time]);
    } else {
        $st = $pdo->prepare(
            'SELECT id, capacity, booked FROM bkf_quota
             WHERE form_id=? AND store_id IS NULL AND quota_date=?
               AND (slot_time=? OR (slot_time IS NULL AND ? IS NULL))
             FOR UPDATE'
        );
        $st->execute([$form_id, $quota_date, $slot_time, $slot_time]);
    }
    $q = $st->fetch(PDO::FETCH_ASSOC);
    if (!$q) return true; // quota 행 없음 = 제한없음
    $cap = $q['capacity'];
    if ($cap === null || $cap === '') return true; // null = 제한없음
    if ((int)$cap === 0) return false;             // 0 = 마감
    if ((int)$q['booked'] >= (int)$cap) return false; // 수량 초과 = 마감
    $pdo->prepare('UPDATE bkf_quota SET booked=booked+1 WHERE id=?')->execute([$q['id']]);
    return true;
}

/** quota 복구 */
function bkf_restore(PDO $pdo, int $form_id, array $rec): void {
    $date  = $rec['reservation_date'] ?? null;
    $time  = $rec['reservation_time'] ?? null;
    $store = $rec['store_id']         ?? null;
    if (!$date) return;
    if ($store !== null) {
        $pdo->prepare(
            'UPDATE bkf_quota SET booked=GREATEST(0,booked-1)
             WHERE form_id=? AND store_id=? AND quota_date=?
               AND (slot_time=? OR (slot_time IS NULL AND ? IS NULL))'
        )->execute([$form_id, $store, $date, $time, $time]);
    } else {
        $pdo->prepare(
            'UPDATE bkf_quota SET booked=GREATEST(0,booked-1)
             WHERE form_id=? AND store_id IS NULL AND quota_date=?
               AND (slot_time=? OR (slot_time IS NULL AND ? IS NULL))'
        )->execute([$form_id, $date, $time, $time]);
    }
}

/* ================================================================
   slug 필수 확인 (get_config 제외 시 아래에서 체크)
   ================================================================ */
if ($slug === '') bkf_out(['ok' => false, 'msg' => '슬러그가 필요합니다.'], 400);

// 폼 조회
$fst = $pdo->prepare('SELECT * FROM bkf_forms WHERE slug=? AND is_active=1');
$fst->execute([$slug]);
$form = $fst->fetch(PDO::FETCH_ASSOC);
if (!$form) bkf_out(['ok' => false, 'msg' => '예약 폼을 찾을 수 없거나 비활성 상태입니다.'], 404);

$form_id = (int)$form['id'];
$tbl     = 'bkf_records_' . $slug;

// 자동 완료 처리
try {
    $pdo->exec("UPDATE `{$tbl}` SET status='완료' WHERE status IN ('접수','확인') AND reservation_date < CURDATE()");
} catch (Throwable $e) {}

/* ================================================================
   get_config — 스텝 / 필드 / 폼 설정 반환
   ================================================================ */
if ($action === 'get_config') {
    $steps = $pdo->prepare(
        'SELECT step_key, label, sort_order, is_active FROM bkf_steps
         WHERE form_id=? ORDER BY sort_order ASC'
    );
    $steps->execute([$form_id]);

    $fields = $pdo->prepare(
        'SELECT id, field_key, label, type, placeholder, is_required, sort_order
         FROM bkf_fields WHERE form_id=? AND is_visible=1 ORDER BY sort_order ASC'
    );
    $fields->execute([$form_id]);
    $fieldList = $fields->fetchAll(PDO::FETCH_ASSOC);

    // 옵션 포함
    foreach ($fieldList as &$f) {
        if (in_array($f['type'], ['dropdown','radio','checkbox'])) {
            $opts = $pdo->prepare(
                'SELECT label FROM bkf_field_options WHERE field_id=? AND is_visible=1 ORDER BY sort_order ASC'
            );
            $opts->execute([$f['id']]);
            $f['options'] = array_column($opts->fetchAll(PDO::FETCH_ASSOC), 'label');
        }
    }
    unset($f);

    bkf_out([
        'ok'               => true,
        'form'             => [
            'id'               => $form_id,
            'title'            => $form['title'],
            'description'      => $form['description'] ?? '',
            'btn_name'         => $form['btn_name'],
            'phone_verify_use' => (int)$form['phone_verify_use'],
            'quota_mode'       => $form['quota_mode'],
        ],
        'steps'  => $steps->fetchAll(PDO::FETCH_ASSOC),
        'fields' => $fieldList,
        'today'  => bkf_today(),
    ]);
}

/* ================================================================
   get_stores — 지점 목록 (stores 테이블 연동)
   ================================================================ */
if ($action === 'get_stores') {
    try {
        // is_active 컬럼 없는 경우도 대비
        try {
            $st = $pdo->query(
                "SELECT id, store_name, branch_name, address, phone
                 FROM stores WHERE is_active=1 ORDER BY sort_order, id"
            );
        } catch (Throwable $e2) {
            $st = $pdo->query(
                "SELECT id, store_name, branch_name, address, phone
                 FROM stores ORDER BY sort_order, id"
            );
        }
        bkf_out(['ok' => true, 'data' => $st->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (Throwable $e) {
        bkf_out(['ok' => false, 'msg' => 'stores table error: ' . $e->getMessage()], 500);
    }
}

/* ================================================================
   get_stores_by_slot — 날짜+시간 기준 지점별 가용 여부
   GET: slug, action, date, slot_time
   ================================================================ */
if ($action === 'get_stores_by_slot') {
    $date      = trim((string)($in['date']      ?? ''));
    $slot_time = trim((string)($in['slot_time'] ?? '')) ?: null;

    if (!$date) bkf_out(['ok' => false, 'msg' => '날짜가 필요합니다.'], 400);

    // 전체 지점 목록
    try {
        $storeRows = $pdo->query('SELECT id, store_name, branch_name, address, phone FROM stores ORDER BY sort_order, id')
            ->fetchAll(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {
        bkf_out(['ok' => false, 'msg' => 'stores table error'], 500);
    }

    $result = [];
    foreach ($storeRows as $store) {
        $sid = (int)$store['id'];

        // 해당 지점+날짜+시간 슬롯 조회
        if ($slot_time) {
            $sq = $pdo->prepare(
                'SELECT capacity, booked FROM bkf_quota
                 WHERE form_id=? AND store_id=? AND quota_date=? AND slot_time=?
                 LIMIT 1'
            );
            $sq->execute([$form_id, $sid, $date, $slot_time]);
            $row = $sq->fetch(PDO::FETCH_ASSOC);

            // 없으면 공통(NULL) 폴백
            if (!$row) {
                $sq2 = $pdo->prepare(
                    'SELECT capacity, booked FROM bkf_quota
                     WHERE form_id=? AND store_id IS NULL AND quota_date=? AND slot_time=?
                     LIMIT 1'
                );
                $sq2->execute([$form_id, $date, $slot_time]);
                $row = $sq2->fetch(PDO::FETCH_ASSOC);
            }
        } else {
            // 시간 없으면 날짜 단위 수량 조회
            $sq = $pdo->prepare(
                'SELECT capacity, booked FROM bkf_quota
                 WHERE form_id=? AND store_id=? AND quota_date=? AND slot_time IS NULL
                 LIMIT 1'
            );
            $sq->execute([$form_id, $sid, $date]);
            $row = $sq->fetch(PDO::FETCH_ASSOC);
        }

        // 가용 여부 계산
        if (!$row) {
            // 슬롯 자체가 없음 → 해당 지점에서 이 시간 운영 안 함
            $available = false;
            $remaining = null;
            $has_slot  = false;
        } else {
            $cap = $row['capacity'];
            $has_slot = true;
            if ($cap === null) {
                $available = true; $remaining = null;
            } elseif ((int)$cap === 0) {
                $available = false; $remaining = 0;
            } else {
                $remaining = max(0, (int)$cap - (int)$row['booked']);
                $available = $remaining > 0;
            }
        }

        $result[] = [
            'id'          => $sid,
            'store_name'  => $store['store_name']  ?? '',
            'branch_name' => $store['branch_name'] ?? '',
            'address'     => $store['address']     ?? '',
            'phone'       => $store['phone']       ?? '',
            'has_slot'    => $has_slot,
            'available'   => $available,
            'remaining'   => $remaining,
        ];
    }

    bkf_out(['ok' => true, 'data' => $result]);
}

/* ================================================================
   get_calendar — 월별 날짜 가용 현황
   GET: slug, action, year, month, store_id(optional)
   ================================================================ */
if ($action === 'get_calendar') {
    $year     = (int)($in['year']     ?? date('Y'));
    $month    = (int)($in['month']    ?? date('n'));
    $store_id = ($in['store_id'] !== '' && isset($in['store_id']))
                ? (int)$in['store_id'] : null;

    if ($year < 2000 || $month < 1 || $month > 12) {
        bkf_out(['ok' => false, 'msg' => 'Invalid year/month.'], 400);
    }

    $today     = bkf_today();
    $startDate = sprintf('%04d-%02d-01', $year, $month);
    $endDate   = date('Y-m-t', strtotime($startDate));
    $days      = [];

    for ($t = strtotime($startDate); $t <= strtotime($endDate); $t += 86400) {
        $ds = date('Y-m-d', $t);

        if ($ds < $today) {
            $days[$ds] = ['open' => false, 'past' => true, 'remaining' => 0];
            continue;
        }

        // quota 조회 (날짜 단위 합산)
        if ($store_id !== null) {
            $st = $pdo->prepare(
                'SELECT COALESCE(SUM(capacity),0) AS cap, COALESCE(SUM(booked),0) AS booked
                 FROM bkf_quota WHERE form_id=? AND store_id=? AND quota_date=?'
            );
            $st->execute([$form_id, $store_id, $ds]);
            $row_pre = $st->fetch(PDO::FETCH_ASSOC);
            // 지점별 설정 없으면 공통(NULL)으로 폴백
            if ((int)($row_pre['cap'] ?? 0) === 0) {
                $st2 = $pdo->prepare(
                    'SELECT COALESCE(SUM(capacity),0) AS cap, COALESCE(SUM(booked),0) AS booked
                     FROM bkf_quota WHERE form_id=? AND store_id IS NULL AND quota_date=?'
                );
                $st2->execute([$form_id, $ds]);
                $row_pre = $st2->fetch(PDO::FETCH_ASSOC);
            }
            $row = $row_pre;
        } else {
            $st = $pdo->prepare(
                'SELECT COALESCE(SUM(capacity),0) AS cap, COALESCE(SUM(booked),0) AS booked
                 FROM bkf_quota WHERE form_id=? AND store_id IS NULL AND quota_date=?'
            );
            $st->execute([$form_id, $ds]);
            $row = $st->fetch(PDO::FETCH_ASSOC);
        }

        if (!isset($row)) $row = $st->fetch(PDO::FETCH_ASSOC);
        $rawCap = isset($row['cap']) ? $row['cap'] : null;
        $booked = (int)($row['booked'] ?? 0);

        if ($rawCap === null) {
            $days[$ds] = ['open'=>true,'capacity'=>null,'booked'=>$booked,'remaining'=>null,'full'=>false,'unlimited'=>true];
        } elseif ((int)$rawCap === 0) {
            $days[$ds] = ['open'=>false,'capacity'=>0,'booked'=>$booked,'remaining'=>0,'full'=>true,'unlimited'=>false];
        } else {
            $cap = (int)$rawCap;
            $remaining = max(0, $cap - $booked);
            $days[$ds] = ['open'=>$remaining>0,'capacity'=>$cap,'booked'=>$booked,'remaining'=>$remaining,'full'=>$remaining===0,'unlimited'=>false];
        }
    }

    bkf_out(['ok' => true, 'days' => $days, 'quota_mode' => $form['quota_mode']]);
}

/* ================================================================
   get_slots — 날짜별 시간 슬롯 목록
   GET: slug, action, date, store_id(optional)
   ================================================================ */
if ($action === 'get_slots') {
    $date     = trim((string)($in['date'] ?? ''));
    $store_id = ($in['store_id'] !== '' && isset($in['store_id']))
                ? (int)$in['store_id'] : null;

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        bkf_out(['ok' => false, 'msg' => '날짜 형식이 올바르지 않습니다.'], 400);
    }
    if ($date < bkf_today()) {
        bkf_out(['ok' => false, 'msg' => '지난 날짜는 선택할 수 없습니다.'], 400);
    }

    if ($store_id !== null) {
        $st = $pdo->prepare(
            'SELECT id, slot_time, capacity, booked
             FROM bkf_quota WHERE form_id=? AND store_id=? AND quota_date=? AND slot_time IS NOT NULL
             ORDER BY slot_time ASC'
        );
        $st->execute([$form_id, $store_id, $date]);
        $slots_pre = $st->fetchAll(PDO::FETCH_ASSOC);

        // 지점별 슬롯 없으면 공통(NULL)으로 폴백
        if (empty($slots_pre)) {
            $st2 = $pdo->prepare(
                'SELECT id, slot_time, capacity, booked
                 FROM bkf_quota WHERE form_id=? AND store_id IS NULL AND quota_date=? AND slot_time IS NOT NULL
                 ORDER BY slot_time ASC'
            );
            $st2->execute([$form_id, $date]);
            $slots_pre = $st2->fetchAll(PDO::FETCH_ASSOC);
        }

    } else {
        // store_id 없음: 전체 지점 슬롯 시간 합집합 (수량 정보 없이 시간만)
        $st = $pdo->prepare(
            'SELECT DISTINCT slot_time
             FROM bkf_quota
             WHERE form_id=? AND quota_date=? AND slot_time IS NOT NULL
             ORDER BY slot_time ASC'
        );
        $st->execute([$form_id, $date]);
        $times = $st->fetchAll(PDO::FETCH_COLUMN);
        $slots_pre = array_map(function($t) {
            return ['id'=>0, 'slot_time'=>$t, 'capacity'=>null, 'booked'=>0];
        }, $times);
    }

    // store_id 있는 경우 $slots_pre에 이미 fetch됨
    $slots = isset($slots_pre) ? $slots_pre : [];
    unset($slots_pre);
    $quotaMode = $form['quota_mode'] ?? 'date';

    foreach ($slots as &$s) {
        $s['slot_time'] = substr((string)($s['slot_time'] ?? ''), 0, 5); // HH:MM

        if ($quotaMode === 'date') {
            // 날짜 단위 모드: 슬롯은 선택지만 제공, 수량 제한 없음
            $s['remaining']  = null;
            $s['available']  = true;
            $s['full']       = false;
            $s['unlimited']  = true;
        } else {
            $cap = $s['capacity']; // null이면 제한없음, 0이면 마감, 양수이면 수량제한
            if ($cap === null || $cap === '') {
                // 제한없음
                $s['remaining']  = null;
                $s['available']  = true;
                $s['full']       = false;
                $s['unlimited']  = true;
            } elseif ((int)$cap === 0) {
                // 마감
                $s['remaining']  = 0;
                $s['available']  = false;
                $s['full']       = true;
                $s['unlimited']  = false;
            } else {
                // 수량 제한
                $remaining = max(0, (int)$cap - (int)$s['booked']);
                $s['remaining']  = $remaining;
                $s['available']  = $remaining > 0;
                $s['full']       = $remaining === 0;
                $s['unlimited']  = false;
            }
        }

        // 당일 2시간 이내 슬롯 비활성화 (모드 무관)
        if (bkf_validate_2h($date, $s['slot_time']) !== null) {
            $s['available'] = false;
            $s['disabled']  = true;
        }
    }
    unset($s);

    bkf_out(['ok' => true, 'slots' => $slots, 'quota_mode' => $quotaMode]);
}

/* ================================================================
   submit — 예약 접수
   POST: slug, action, name, phone, reservation_date, reservation_time,
         store_id, store_name, otp_token(번호인증 사용 시), + 동적 필드
   ================================================================ */
if ($action === 'submit') {
    if ($method !== 'POST') bkf_out(['ok' => false, 'msg' => 'POST 방식으로만 요청할 수 있습니다.'], 405);

    $name     = trim((string)($in['name']  ?? ''));
    $phone    = bkf_normalize_phone((string)($in['phone'] ?? ''));
    $res_date = trim((string)($in['reservation_date'] ?? '')) ?: null;
    $res_time = trim((string)($in['reservation_time'] ?? '')) ?: null;
    $store_id = ($in['store_id'] !== '' && isset($in['store_id']))
                ? (int)$in['store_id'] : null;
    $store_nm = trim((string)($in['store_name'] ?? '')) ?: null;

    if (!$name || !$phone) {
        bkf_out(['ok' => false, 'msg' => 'Name and phone are required.'], 400);
    }

    // ① 과거 날짜 차단
    if ($res_date && $res_date < bkf_today()) {
        bkf_out(['ok' => false, 'msg' => 'Past dates are not allowed.'], 400);
    }

    // ② 당일 2시간 전 차단
    if ($res_date && $res_time) {
        $err2h = bkf_validate_2h($res_date, $res_time);
        if ($err2h) bkf_out(['ok' => false, 'msg' => $err2h], 400);
    }

    // ③ 번호인증 확인 (폼 설정에서 phone_verify_use=1 일 때)
    if ((int)$form['phone_verify_use'] === 1) {
        $otp_token = trim((string)($in['otp_token'] ?? ''));
        if (!$otp_token) {
            bkf_out(['ok' => false, 'msg' => 'Phone verification is required.'], 400);
        }
        $otpChk = $pdo->prepare(
            "SELECT id FROM bkf_phone_otp
             WHERE phone=? AND code=? AND used=1 AND expires_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE)
             ORDER BY id DESC LIMIT 1"
        );
        // otp_token = phone:code (검증 완료 토큰)
        [$otpPhone, $otpCode] = array_pad(explode(':', $otp_token, 2), 2, '');
        $otpChk->execute([$phone, $otpCode]);
        if (!$otpChk->fetchColumn()) {
            bkf_out(['ok' => false, 'msg' => 'Phone verification failed or expired. Please verify again.'], 400);
        }
    }

    // ④ 동일 날짜+이름+전화 중복 예약 차단 (접수/확인 상태)
    if ($res_date) {
        $dupChk = $pdo->prepare(
            "SELECT COUNT(*) FROM `{$tbl}` WHERE form_id=? AND name=? AND phone=? AND reservation_date=? AND status IN ('접수','확인')"
        );
        $dupChk->execute([$form_id, $name, $phone, $res_date]);
        if ((int)$dupChk->fetchColumn() > 0) {
            bkf_out(['ok' => false, 'msg' => '해당 날짜에 동일한 정보로 이미 예약이 접수되어 있습니다.'], 409);
        }
    } else {
        // 날짜 없는 폼: 이름+전화 동일하면 중복 차단
        $dupChk = $pdo->prepare(
            "SELECT COUNT(*) FROM `{$tbl}` WHERE form_id=? AND name=? AND phone=? AND status IN ('접수','확인')"
        );
        $dupChk->execute([$form_id, $name, $phone]);
        if ((int)$dupChk->fetchColumn() > 0) {
            bkf_out(['ok' => false, 'msg' => '동일한 정보로 이미 예약이 접수되어 있습니다.'], 409);
        }
    }

    // 동적 필드 수집
    $fst2 = $pdo->prepare(
        "SELECT field_key, type, is_required FROM bkf_fields WHERE form_id=? AND is_visible=1 ORDER BY sort_order ASC"
    );
    $fst2->execute([$form_id]);
    $dynFields = $fst2->fetchAll(PDO::FETCH_ASSOC);

    // 필수 필드 검증
    foreach ($dynFields as $f) {
        if ((int)$f['is_required'] && in_array($f['field_key'], ['name','phone'])) continue; // 이미 위에서 처리
        if ((int)$f['is_required'] && empty($in[$f['field_key']])) {
            bkf_out(['ok' => false, 'msg' => "Field '{$f['field_key']}' is required."], 400);
        }
    }

    // 실제 존재 컬럼 확인
    $existColSt = $pdo->prepare(
        "SELECT column_name FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=?"
    );
    $existColSt->execute([$tbl]);
    $existCols = array_column($existColSt->fetchAll(PDO::FETCH_ASSOC), 'column_name');

    $pdo->beginTransaction();
    try {
        // ⑤ quota 차감 (FOR UPDATE)
        // quota_mode=date면 시간 무관하게 날짜 수량만 차감
        $deduct_time = ($form['quota_mode'] === 'slot') ? $res_time : null;
        $quotaOk = bkf_deduct($pdo, $form_id, $store_id, $res_date, $deduct_time);
        if (!$quotaOk) {
            $pdo->rollBack();
            bkf_out(['ok' => false, 'msg' => '선택한 날짜/시간의 예약 가능 수량이 없습니다. 다른 날짜를 선택해 주세요.'], 409);
        }

        $reservation_no = bkf_gen_reservation_no($pdo, $tbl);

        // 기본 컬럼 INSERT
        $cols = ['form_id','reservation_no','name','phone','status'];
        $vals = [$form_id, $reservation_no, $name, $phone, '접수'];

        if ($res_date) { $cols[] = 'reservation_date'; $vals[] = $res_date; }
        if ($res_time) { $cols[] = 'reservation_time'; $vals[] = $res_time; }
        if ($store_id !== null) { $cols[] = 'store_id';   $vals[] = $store_id; }
        if ($store_nm)          { $cols[] = 'store_name'; $vals[] = $store_nm; }

        // 동적 필드 값
        foreach ($dynFields as $f) {
            $fk = $f['field_key'];
            if (in_array($fk, ['name','phone'])) continue; // 이미 포함
            if (!in_array($fk, $existCols))      continue; // 컬럼 없으면 스킵
            if (!isset($in[$fk]))                continue;
            $cols[] = "`{$fk}`";
            $vals[] = is_array($in[$fk]) ? implode(',', $in[$fk]) : trim((string)$in[$fk]);
        }

        $ph  = implode(',', array_fill(0, count($vals), '?'));
        $sql = 'INSERT INTO `' . $tbl . '` (' . implode(',', $cols) . ') VALUES (' . $ph . ')';
        $pdo->prepare($sql)->execute($vals);
        $new_id = (int)$pdo->lastInsertId();

        $pdo->commit();

        // 관리자 알림 (실패해도 예약 자체는 성공)
        try {
            bkf_send_admin_notify($pdo, $form_id, $form, $new_id, $tbl);
        } catch (Throwable $e) {}

        bkf_out(['ok' => true, 'reservation_no' => $reservation_no, 'id' => $new_id]);

    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        bkf_out(['ok' => false, 'msg' => 'Reservation failed: ' . $e->getMessage()], 500);
    }
}

/* ================================================================
   lookup — 예약 조회 (이름+전화 or 예약번호)
   POST: slug, action, reservation_no | (name + phone)
   ================================================================ */
if ($action === 'lookup') {
    if ($method !== 'POST') bkf_out(['ok' => false, 'msg' => 'POST 방식으로만 요청할 수 있습니다.'], 405);

    $no    = trim((string)($in['reservation_no'] ?? ''));
    $name  = trim((string)($in['name']  ?? ''));
    $phone = bkf_normalize_phone((string)($in['phone'] ?? ''));

    if ($no !== '') {
        $st = $pdo->prepare(
            "SELECT * FROM `{$tbl}` WHERE form_id=? AND reservation_no=? LIMIT 1"
        );
        $st->execute([$form_id, $no]);
        $row = $st->fetch(PDO::FETCH_ASSOC);
        bkf_out(['ok' => true, 'data' => $row ?: null]);
    }

    if ($name !== '' && $phone !== '') {
        $st = $pdo->prepare(
            "SELECT * FROM `{$tbl}` WHERE form_id=? AND name=? AND phone=?
             ORDER BY id DESC LIMIT 10"
        );
        $st->execute([$form_id, $name, $phone]);
        bkf_out(['ok' => true, 'data' => $st->fetchAll(PDO::FETCH_ASSOC)]);
    }

    bkf_out(['ok' => false, 'msg' => '예약번호 또는 이름+전화번호를 입력해 주세요.'], 400);
}

/* ================================================================
   cancel — 사용자 취소
   POST: slug, action, reservation_no, phone
   ================================================================ */
if ($action === 'cancel') {
    if ($method !== 'POST') bkf_out(['ok' => false, 'msg' => 'POST 방식으로만 요청할 수 있습니다.'], 405);

    $no    = trim((string)($in['reservation_no'] ?? ''));
    $phone = bkf_normalize_phone((string)($in['phone'] ?? ''));

    if (!$no || !$phone) {
        bkf_out(['ok' => false, 'msg' => '예약번호와 전화번호를 입력해 주세요.'], 400);
    }

    $st = $pdo->prepare(
        "SELECT * FROM `{$tbl}` WHERE form_id=? AND reservation_no=? AND phone=? LIMIT 1"
    );
    $st->execute([$form_id, $no, $phone]);
    $rec = $st->fetch(PDO::FETCH_ASSOC);

    if (!$rec) bkf_out(['ok' => false, 'msg' => '예약을 찾을 수 없습니다.'], 404);
    if ($rec['status'] !== '접수') {
        bkf_out(['ok' => false, 'msg' => '접수 상태의 예약만 취소할 수 있습니다.'], 400);
    }

    $pdo->beginTransaction();
    try {
        // FOR UPDATE 재확인
        $lock = $pdo->prepare("SELECT * FROM `{$tbl}` WHERE id=? FOR UPDATE");
        $lock->execute([(int)$rec['id']]);
        $cur = $lock->fetch(PDO::FETCH_ASSOC);
        if (!$cur || $cur['status'] !== '접수') {
            $pdo->rollBack();
            bkf_out(['ok' => false, 'msg' => 'Reservation status has changed. Cannot cancel.'], 409);
        }

        bkf_restore($pdo, $form_id, $cur);
        $pdo->prepare("UPDATE `{$tbl}` SET status='취소' WHERE id=?")->execute([$cur['id']]);
        $pdo->commit();
        bkf_out(['ok' => true]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        bkf_out(['ok' => false, 'msg' => 'Cancel failed: ' . $e->getMessage()], 500);
    }
}

/* ================================================================
   modify — 사용자 예약 변경
   POST: slug, action, reservation_no, phone,
         reservation_date, reservation_time, store_id, store_name
   접수 상태일 때만 가능
   ================================================================ */
if ($action === 'modify') {
    if ($method !== 'POST') bkf_out(['ok' => false, 'msg' => 'POST 방식으로만 요청할 수 있습니다.'], 405);

    $no       = trim((string)($in['reservation_no'] ?? ''));
    $phone    = bkf_normalize_phone((string)($in['phone'] ?? ''));
    $new_date = trim((string)($in['reservation_date'] ?? '')) ?: null;
    $new_time = trim((string)($in['reservation_time'] ?? '')) ?: null;
    $store_id = ($in['store_id'] !== '' && isset($in['store_id']))
                ? (int)$in['store_id'] : null;
    $store_nm = trim((string)($in['store_name'] ?? '')) ?: null;

    if (!$no || !$phone) {
        bkf_out(['ok' => false, 'msg' => '예약번호와 전화번호를 입력해 주세요.'], 400);
    }

    // 과거 날짜 / 2시간 전 차단
    if ($new_date && $new_date < bkf_today()) {
        bkf_out(['ok' => false, 'msg' => 'Past dates are not allowed.'], 400);
    }
    if ($new_date && $new_time) {
        $err2h = bkf_validate_2h($new_date, $new_time);
        if ($err2h) bkf_out(['ok' => false, 'msg' => $err2h], 400);
    }

    $st = $pdo->prepare(
        "SELECT * FROM `{$tbl}` WHERE form_id=? AND reservation_no=? AND phone=? LIMIT 1"
    );
    $st->execute([$form_id, $no, $phone]);
    $rec = $st->fetch(PDO::FETCH_ASSOC);

    if (!$rec) bkf_out(['ok' => false, 'msg' => '예약을 찾을 수 없습니다.'], 404);
    if ($rec['status'] !== '접수') {
        bkf_out(['ok' => false, 'msg' => 'Only reservations with status "접수" can be modified.'], 400);
    }

    $pdo->beginTransaction();
    try {
        $lock = $pdo->prepare("SELECT * FROM `{$tbl}` WHERE id=? FOR UPDATE");
        $lock->execute([(int)$rec['id']]);
        $cur = $lock->fetch(PDO::FETCH_ASSOC);
        if (!$cur || $cur['status'] !== '접수') {
            $pdo->rollBack();
            bkf_out(['ok' => false, 'msg' => 'Reservation status has changed.'], 409);
        }

        // 기존 quota 복구
        bkf_restore($pdo, $form_id, $cur);

        // 새 quota 차감
        $ok = bkf_deduct($pdo, $form_id, $store_id, $new_date, $new_time);
        if (!$ok) {
            $pdo->rollBack();
            bkf_out(['ok' => false, 'msg' => 'No remaining capacity for the selected date/time.'], 409);
        }

        $pdo->prepare(
            "UPDATE `{$tbl}` SET reservation_date=?, reservation_time=?, store_id=?, store_name=? WHERE id=?"
        )->execute([$new_date, $new_time, $store_id, $store_nm, $cur['id']]);

        $pdo->commit();
        bkf_out(['ok' => true]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        bkf_out(['ok' => false, 'msg' => 'Modify failed: ' . $e->getMessage()], 500);
    }
}

/* ================================================================
   관리자 알림 발송 (submit 성공 후 호출)
   bkf_managers 에서 활성 담당자 조회 → 이메일/알림톡/시트
   ================================================================ */
function bkf_send_admin_notify(PDO $pdo, int $form_id, array $form, int $record_id, string $tbl): void {
    $mgrs = $pdo->prepare(
        'SELECT * FROM bkf_managers WHERE form_id=? AND is_active=1'
    );
    $mgrs->execute([$form_id]);
    $managers = $mgrs->fetchAll(PDO::FETCH_ASSOC);
    if (!$managers) return;

    // 예약 데이터 조회
    $rec = $pdo->prepare("SELECT * FROM `{$tbl}` WHERE id=? LIMIT 1");
    $rec->execute([$record_id]);
    $booking = $rec->fetch(PDO::FETCH_ASSOC);
    if (!$booking) return;

    $formTitle = $form['title'] ?? '예약';
    $msg = "[{$formTitle}] 새 예약이 접수되었습니다.\n"
         . "이름: {$booking['name']}\n"
         . "연락처: {$booking['phone']}\n"
         . "예약일: " . ($booking['reservation_date'] ?? '-') . "\n"
         . "시간: " . ($booking['reservation_time'] ?? '-') . "\n"
         . "지점: " . ($booking['store_name'] ?? '-') . "\n"
         . "예약번호: {$booking['reservation_no']}";

    // Solapi 공통 설정
    $atRow = null;
    try {
        $atRow = $pdo->query('SELECT * FROM alimtalk_settings WHERE id=1 LIMIT 1')->fetch(PDO::FETCH_ASSOC);
    } catch (Throwable $e) {}

    foreach ($managers as $mgr) {
        // SMS / 알림톡 알림
        if (((int)$mgr['notify_sms'] || (int)$mgr['notify_alimtalk']) && $atRow) {
            $toPhone   = preg_replace('/\D/', '', $mgr['phone'] ?? '');
            $apiKey    = trim($atRow['api_key']    ?? '');
            $apiSecret = trim($atRow['api_secret'] ?? '');
            $fromPhone = preg_replace('/\D/', '', trim($atRow['sender'] ?? ''));

            if ($toPhone && $apiKey && $apiSecret && $fromPhone) {
                $date   = gmdate("Y-m-d\TH:i:s\Z");
                $salt   = bin2hex(random_bytes(16));
                $hmac   = hash_hmac('sha256', $date . $salt, $apiSecret);
                $auth   = "HMAC-SHA256 apiKey={$apiKey}, date={$date}, salt={$salt}, signature={$hmac}";
                $smsLen = mb_strlen($msg);

                $payload = json_encode([
                    'message' => [
                        'to'   => $toPhone,
                        'from' => $fromPhone,
                        'text' => $msg,
                        'type' => $smsLen > 90 ? 'LMS' : 'SMS',
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
                    curl_exec($ch);
                    curl_close($ch);
                } catch (Throwable $e) {}
            }
        }

        // 이메일 알림
        if ((int)$mgr['notify_email'] && !empty($mgr['email'])) {
            $to      = $mgr['email'];
            $subject = "[{$formTitle}] 새 예약 접수 알림 - {$booking['name']}";
            $body    = $msg;
            $headers = "From: noreply@" . ($_SERVER['HTTP_HOST'] ?? 'localhost') . "\r\n"
                     . "Content-Type: text/plain; charset=UTF-8\r\n";
            try {
                mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);
            } catch (Throwable $e) {}
        }

        // 구글 시트 알림
        if ((int)$mgr['notify_sheet'] && !empty($mgr['sheet_webhook'])) {
            $sheetPayload = json_encode([
                'sheet_name' => $mgr['sheet_name'] ?: 'Sheet1',
                'headers'    => ['No', 'Name', 'Phone', 'Date', 'Time', 'Store', 'Status', 'Submitted At'],
                'values'     => [
                    $booking['reservation_no'],
                    $booking['name'],
                    $booking['phone'],
                    $booking['reservation_date'] ?? '',
                    $booking['reservation_time'] ?? '',
                    $booking['store_name']        ?? '',
                    $booking['status'],
                    $booking['created_at'],
                ],
            ]);
            try {
                $ch = curl_init($mgr['sheet_webhook']);
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POST           => true,
                    CURLOPT_POSTFIELDS     => $sheetPayload,
                    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
                    CURLOPT_TIMEOUT        => 10,
                    CURLOPT_SSL_VERIFYPEER => true,
                ]);
                curl_exec($ch);
                curl_close($ch);
            } catch (Throwable $e) {}
        }
    }
}

/* ================================================================
   update_booking — 프론트 예약 수정 (접수 상태만)
   POST: slug, id, name, phone, reservation_date, reservation_time
   ================================================================ */
if ($action === 'update_booking') {
    if ($method !== 'POST') bkf_out(['ok' => false, 'msg' => 'POST 방식으로만 요청할 수 있습니다.'], 405);

    $id           = (int)($in['id'] ?? 0);
    $name         = trim((string)($in['name']  ?? ''));
    $phone        = trim((string)($in['phone'] ?? ''));
    $new_date     = trim((string)($in['reservation_date'] ?? '')) ?: null;
    $new_time     = trim((string)($in['reservation_time'] ?? '')) ?: null;
    $new_store_id = ($in['store_id'] !== '' && isset($in['store_id'])) ? (int)$in['store_id'] : null;
    $new_store_nm = trim((string)($in['store_name'] ?? '')) ?: null;

    if (!$id || !$name || !$phone) {
        bkf_out(['ok' => false, 'msg' => '필수 항목을 입력해 주세요.'], 400);
    }

    $tbl = 'bkf_records_' . $form['slug'];

    // 현재 예약 조회
    $cur = $pdo->prepare("SELECT * FROM `{$tbl}` WHERE id=? AND form_id=?");
    $cur->execute([$id, $form_id]);
    $rec = $cur->fetch(PDO::FETCH_ASSOC);
    if (!$rec) bkf_out(['ok' => false, 'msg' => '예약을 찾을 수 없습니다.'], 404);
    if ($rec['status'] !== '접수') bkf_out(['ok' => false, 'msg' => '접수 상태의 예약만 수정할 수 있습니다.'], 400);

    $pdo->beginTransaction();
    try {
        // 기존 quota 복구
        bkf_restore($pdo, $form_id, $rec);

        // 새 quota 차감
        $deduct_time = ($form['quota_mode'] === 'slot') ? $new_time : null;
        $ok = bkf_deduct($pdo, $form_id, $new_store_id ?? ($rec['store_id'] ?? null), $new_date, $deduct_time);
        if (!$ok) {
            $pdo->rollBack();
            bkf_out(['ok' => false, 'msg' => '선택한 날짜/시간의 예약 가능 수량이 없습니다.'], 409);
        }

        $pdo->prepare("UPDATE `{$tbl}` SET name=?, phone=?, reservation_date=?, reservation_time=?, store_id=?, store_name=? WHERE id=?")
            ->execute([$name, $phone, $new_date, $new_time, $new_store_id, $new_store_nm, $id]);

        $pdo->commit();
        bkf_out(['ok' => true]);
    } catch (Throwable $e) {
        $pdo->rollBack();
        bkf_out(['ok' => false, 'msg' => '수정 실패: ' . $e->getMessage()], 500);
    }
}

/* ================================================================
   Unknown action
   ================================================================ */
bkf_out(['ok' => false, 'msg' => 'Unknown action: ' . htmlspecialchars($action)], 400);
