<?php
/**
 * log_helper.php — 로그 기록 공통 헬퍼
 */

function getClientIp(): string {
    return $_SERVER['HTTP_X_FORWARDED_FOR']
        ?? $_SERVER['HTTP_X_REAL_IP']
        ?? $_SERVER['REMOTE_ADDR']
        ?? '';
}

/**
 * 로그인 로그 기록
 */
function logLogin(PDO $pdo, string $userType, ?string $userId, ?string $username, string $result, string $failReason = ''): void {
    try {
        $pdo->prepare(
            "INSERT INTO logs_login (user_type, user_id, username, ip, result, fail_reason) VALUES (?, ?, ?, ?, ?, ?)"
        )->execute([$userType, $userId, $username, getClientIp(), $result, $failReason ?: null]);
    } catch (Throwable $e) {}
}

/**
 * 관리자 작업 로그 기록
 */
function logAdminAction(PDO $pdo, string $action, string $targetTable = '', string $targetId = '', array $before = [], array $after = []): void {
    try {
        // currentAdmin() 대신 $_SESSION 직접 참조 (try 안으로 이동)
        $adminId   = $_SESSION['admin_id']   ?? 0;
        $adminName = $_SESSION['admin_name'] ?? '';

        $pdo->prepare(
            "INSERT INTO logs_admin_action (admin_id, admin_name, action, target_table, target_id, before_data, after_data, ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )->execute([
            $adminId,
            $adminName,
            $action,
            $targetTable ?: null,
            $targetId    ?: null,
            $before ? json_encode($before, JSON_UNESCAPED_UNICODE) : null,
            $after  ? json_encode($after,  JSON_UNESCAPED_UNICODE) : null,
            getClientIp(),
        ]);
    } catch (Throwable $e) {}
}

/**
 * 이메일 발송 로그 기록
 */
function logEmail(PDO $pdo, string $toEmail, string $subject, string $template, string $status, string $errorMsg = ''): void {
    try {
        $pdo->prepare(
            "INSERT INTO logs_email (to_email, subject, template, status, error_msg) VALUES (?, ?, ?, ?, ?)"
        )->execute([$toEmail, $subject, $template ?: null, $status, $errorMsg ?: null]);
    } catch (Throwable $e) {}
}

/**
 * 에러 로그 기록
 */
function logError(PDO $pdo, string $message, string $level = 'error', string $code = '', string $file = '', int $line = 0, string $stackTrace = ''): void {
    try {
        $pdo->prepare(
            "INSERT INTO logs_error (level, code, message, file, line, stack_trace, ip) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )->execute([$level, $code ?: null, $message, $file ?: null, $line ?: null, $stackTrace ?: null, getClientIp()]);
    } catch (Throwable $e) {}
}
