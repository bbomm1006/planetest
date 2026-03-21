<?php
declare(strict_types=1);

/* ================================================================
   bkf_helpers.php
   Common helper functions for the Booking Form (bkf) module.
   Include once at the top of any bkf API file.
   ================================================================ */

/* ----------------------------------------------------------------
   JSON response + exit
   ---------------------------------------------------------------- */
if (!function_exists('bkf_json_out')) {
    function bkf_json_out(array $data, int $code = 200): void {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }
}

/* ----------------------------------------------------------------
   Read JSON request body (POST)
   ---------------------------------------------------------------- */
if (!function_exists('bkf_read_body')) {
    function bkf_read_body(): array {
        $raw = file_get_contents('php://input');
        if ($raw === false || $raw === '') return [];
        $j = json_decode($raw, true);
        return is_array($j) ? $j : [];
    }
}

/* ----------------------------------------------------------------
   Timezone / date helpers
   ---------------------------------------------------------------- */
if (!function_exists('bkf_tz')) {
    function bkf_tz(): DateTimeZone {
        return new DateTimeZone('Asia/Seoul');
    }
}

if (!function_exists('bkf_today')) {
    function bkf_today(): string {
        return (new DateTimeImmutable('now', bkf_tz()))->format('Y-m-d');
    }
}

if (!function_exists('bkf_now')) {
    function bkf_now(): DateTimeImmutable {
        return new DateTimeImmutable('now', bkf_tz());
    }
}

/* ----------------------------------------------------------------
   Phone normalizer  010-1234-5678 → 01012345678
   ---------------------------------------------------------------- */
if (!function_exists('bkf_normalize_phone')) {
    function bkf_normalize_phone(string $phone): string {
        return preg_replace('/\D+/', '', $phone) ?? '';
    }
}

/* ----------------------------------------------------------------
   Reservation number generator  B250615ABCD12
   Unique within the dynamic records table.
   ---------------------------------------------------------------- */
if (!function_exists('bkf_gen_no')) {
    function bkf_gen_no(PDO $pdo, string $tbl): string {
        for ($i = 0; $i < 20; $i++) {
            $no = 'B' . date('ymd') . strtoupper(bin2hex(random_bytes(3)));
            $st = $pdo->prepare("SELECT 1 FROM `{$tbl}` WHERE reservation_no=? LIMIT 1");
            $st->execute([$no]);
            if (!$st->fetchColumn()) return $no;
        }
        // Fallback — virtually impossible collision
        return 'B' . date('ymdHis') . mt_rand(1000, 9999);
    }
}

/* ----------------------------------------------------------------
   Same-day 2-hour advance check
   Returns error string or null if OK.
   Only runs when a slot_time is provided.
   ---------------------------------------------------------------- */
if (!function_exists('bkf_check_2h')) {
    function bkf_check_2h(string $date, ?string $time): ?string {
        if (!$time) return null;
        $tz  = bkf_tz();
        $now = new DateTimeImmutable('now', $tz);
        try {
            $dt = new DateTimeImmutable($date . ' ' . $time . ':00', $tz);
        } catch (Throwable $e) {
            return 'Invalid date/time format.';
        }
        // Different day — no restriction
        if ($dt->format('Y-m-d') !== $now->format('Y-m-d')) return null;
        if ($dt < $now->modify('+2 hours')) {
            return 'Same-day reservations must be made at least 2 hours in advance.';
        }
        return null;
    }
}

/* ----------------------------------------------------------------
   Auto-complete past reservations
   Call once per request entry point.
   ---------------------------------------------------------------- */
if (!function_exists('bkf_auto_complete')) {
    function bkf_auto_complete(PDO $pdo, string $tbl): void {
        try {
            $pdo->exec(
                "UPDATE `{$tbl}` SET status='완료'
                 WHERE status IN ('접수','확인') AND reservation_date < CURDATE()"
            );
        } catch (Throwable $e) {
            // Non-fatal — table may not have reservation_date column yet
        }
    }
}

/* ----------------------------------------------------------------
   Auto-complete for ALL active forms (admin dashboard call)
   ---------------------------------------------------------------- */
if (!function_exists('bkf_auto_complete_all')) {
    function bkf_auto_complete_all(PDO $pdo): void {
        try {
            $rows = $pdo->query('SELECT slug FROM bkf_forms WHERE is_active=1')
                        ->fetchAll(PDO::FETCH_COLUMN);
            foreach ($rows as $slug) {
                bkf_auto_complete($pdo, 'bkf_records_' . $slug);
            }
        } catch (Throwable $e) {}
    }
}

/* ----------------------------------------------------------------
   Quota deduct  (call inside a transaction with FOR UPDATE)
   Returns true  — deducted OK  (or quota not configured)
   Returns false — sold out
   ---------------------------------------------------------------- */
if (!function_exists('bkf_quota_deduct')) {
    function bkf_quota_deduct(
        PDO    $pdo,
        int    $form_id,
        ?int   $store_id,
        ?string $quota_date,
        ?string $slot_time
    ): bool {
        if (!$quota_date) return true; // No date selected — no quota to check

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

        // Row not found or capacity=0 → treat as unlimited
        if (!$q || (int)$q['capacity'] === 0) return true;

        if ((int)$q['booked'] >= (int)$q['capacity']) return false; // Sold out

        $pdo->prepare('UPDATE bkf_quota SET booked=booked+1 WHERE id=?')
            ->execute([$q['id']]);

        return true;
    }
}

/* ----------------------------------------------------------------
   Quota restore  (quota.booked -1)
   Safe to call even when reservation has no date/store.
   ---------------------------------------------------------------- */
if (!function_exists('bkf_quota_restore')) {
    function bkf_quota_restore(PDO $pdo, int $form_id, array $rec): void {
        $date  = $rec['reservation_date'] ?? null;
        $time  = $rec['reservation_time'] ?? null;
        $store = isset($rec['store_id']) && $rec['store_id'] !== null
                 ? (int)$rec['store_id'] : null;

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
}

/* ----------------------------------------------------------------
   Fetch form row by slug (active only)
   ---------------------------------------------------------------- */
if (!function_exists('bkf_form_by_slug')) {
    function bkf_form_by_slug(PDO $pdo, string $slug): ?array {
        $slug = strtolower(trim($slug));
        if ($slug === '' || !preg_match('/^[a-z][a-z0-9_]{2,63}$/', $slug)) return null;
        $st = $pdo->prepare('SELECT * FROM bkf_forms WHERE slug=? AND is_active=1 LIMIT 1');
        $st->execute([$slug]);
        $row = $st->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }
}

/* ----------------------------------------------------------------
   Fetch form row by id
   ---------------------------------------------------------------- */
if (!function_exists('bkf_form_by_id')) {
    function bkf_form_by_id(PDO $pdo, int $id): ?array {
        $st = $pdo->prepare('SELECT * FROM bkf_forms WHERE id=? LIMIT 1');
        $st->execute([$id]);
        $row = $st->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }
}

/* ----------------------------------------------------------------
   Dynamic records table name
   ---------------------------------------------------------------- */
if (!function_exists('bkf_tbl')) {
    function bkf_tbl(string $slug): string {
        return 'bkf_records_' . $slug;
    }
}

/* ----------------------------------------------------------------
   Check if a column exists in a table
   ---------------------------------------------------------------- */
if (!function_exists('bkf_col_exists')) {
    function bkf_col_exists(PDO $pdo, string $tbl, string $col): bool {
        $st = $pdo->prepare(
            "SELECT COUNT(*) FROM information_schema.columns
             WHERE table_schema=DATABASE() AND table_name=? AND column_name=?"
        );
        $st->execute([$tbl, $col]);
        return (bool)$st->fetchColumn();
    }
}

/* ----------------------------------------------------------------
   Get existing column list for a table
   ---------------------------------------------------------------- */
if (!function_exists('bkf_get_columns')) {
    function bkf_get_columns(PDO $pdo, string $tbl): array {
        $st = $pdo->prepare(
            "SELECT column_name FROM information_schema.columns
             WHERE table_schema=DATABASE() AND table_name=?"
        );
        $st->execute([$tbl]);
        return array_column($st->fetchAll(PDO::FETCH_ASSOC), 'column_name');
    }
}

/* ----------------------------------------------------------------
   Duplicate reservation check
   Returns true if a duplicate exists (block the booking).
   ---------------------------------------------------------------- */
if (!function_exists('bkf_is_duplicate')) {
    function bkf_is_duplicate(PDO $pdo, string $tbl, int $form_id, string $name, string $phone): bool {
        $st = $pdo->prepare(
            "SELECT COUNT(*) FROM `{$tbl}`
             WHERE form_id=? AND name=? AND phone=? AND status IN ('접수','확인')"
        );
        $st->execute([$form_id, $name, $phone]);
        return (int)$st->fetchColumn() > 0;
    }
}

/* ----------------------------------------------------------------
   Validate reservation input (common rules)
   Returns array of error strings (empty = OK).
   ---------------------------------------------------------------- */
if (!function_exists('bkf_validate_input')) {
    function bkf_validate_input(
        string  $name,
        string  $phone,
        ?string $res_date,
        ?string $res_time
    ): array {
        $errors = [];

        if ($name === '')  $errors[] = 'Name is required.';
        if ($phone === '') $errors[] = 'Phone is required.';

        if ($res_date) {
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $res_date)) {
                $errors[] = 'Invalid date format (YYYY-MM-DD expected).';
            } elseif ($res_date < bkf_today()) {
                $errors[] = 'Past dates are not allowed.';
            }
        }

        if ($res_date && $res_time) {
            $err = bkf_check_2h($res_date, $res_time);
            if ($err) $errors[] = $err;
        }

        return $errors;
    }
}
