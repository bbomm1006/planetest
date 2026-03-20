<?php
/**
 * user_auth.php — 소셜 로그인 / 세션 / 로그아웃
 * POST /admin/api_front/user_auth.php        { provider, token }
 * GET  /admin/api_front/user_auth.php?action=status
 * POST /admin/api_front/user_auth.php?action=logout
 */
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/log_helper.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Credentials: true');

if (session_status() === PHP_SESSION_NONE) session_start();

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

/* ══ 세션 상태 조회 ══ */
if ($action === 'status') {
    if (!empty($_SESSION['board_user'])) {
        echo json_encode(['ok' => true, 'loggedIn' => true, 'user' => $_SESSION['board_user']]);
    } else {
        echo json_encode(['ok' => true, 'loggedIn' => false]);
    }
    exit;
}

/* ══ 로그아웃 ══ */
if ($action === 'logout') {
    unset($_SESSION['board_user']);
    echo json_encode(['ok' => true]);
    exit;
}

/* ══ 소셜 로그인 ══ */
if ($method === 'POST') {
    $input    = json_decode(file_get_contents('php://input'), true) ?: [];
    $provider = trim($input['provider'] ?? '');
    $token    = trim($input['token']    ?? '');

    // email(인증번호) / email_pw 방식은 token 불필요
    $tokenFreeProviders = ['email', 'email_pw'];
    if (!$provider || (!$token && !in_array($provider, $tokenFreeProviders, true))) {
        echo json_encode(['ok' => false, 'error' => '파라미터 오류']); exit;
    }

    $pdo = getDB();
    logAccess($pdo);
    logLanding($pdo);

    // social_links에서 API 키 조회
    $keys = $pdo->query('SELECT * FROM social_links WHERE id=1')->fetch();

    $userId = null; $userName = '';

    /* ── 카카오 ── */
    if ($provider === 'kakao') {
        $ch = curl_init('https://kapi.kakao.com/v2/user/me');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $token],
        ]);
        $r = curl_exec($ch);
        $curlErr = curl_error($ch);
        curl_close($ch);
        if (!$r || $curlErr) { echo json_encode(['ok' => false, 'error' => '카카오 API 오류: ' . $curlErr]); exit; }
        $info = json_decode($r, true);
        $userId   = 'kakao_' . ($info['id'] ?? '');
        $userName = $info['kakao_account']['profile']['nickname']
                 ?? $info['properties']['nickname']
                 ?? '카카오사용자';
    }

    /* ── 네이버 ── */
    elseif ($provider === 'naver') {
        $ch = curl_init('https://openapi.naver.com/v1/nid/me');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . $token],
        ]);
        $r = curl_exec($ch);
        $curlErr = curl_error($ch);
        curl_close($ch);
        if (!$r || $curlErr) { echo json_encode(['ok' => false, 'error' => '네이버 API 오류: ' . $curlErr]); exit; }
        $info = json_decode($r, true);
        $userId   = 'naver_' . ($info['response']['id'] ?? '');
        $userName = $info['response']['name'] ?? $info['response']['nickname'] ?? '네이버사용자';
    }

    /* ── 구글 (JWT 검증) ── */
    elseif ($provider === 'google') {
        // ID 토큰 검증 (curl 사용)
        $url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($token);
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT        => 10,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $r = curl_exec($ch);
        $curlErr = curl_error($ch);
        curl_close($ch);
        if (!$r || $curlErr) { echo json_encode(['ok' => false, 'error' => '구글 API 오류: ' . $curlErr]); exit; }
        $info = json_decode($r, true);
        if (!empty($info['error'])) { echo json_encode(['ok' => false, 'error' => '구글 토큰 오류: ' . ($info['error_description'] ?? $info['error'])]); exit; }
        $userId   = 'google_' . ($info['sub'] ?? '');
        $userName = $info['name'] ?? $info['email'] ?? '구글사용자';
    }

    /* ── 이메일 인증번호 ── */
    elseif ($provider === 'email') {
        $email   = trim($input['email']     ?? '');
        $subact  = trim($input['subaction'] ?? '');
        $code    = trim($input['code']      ?? '');

        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['ok' => false, 'error' => '이메일 주소를 올바르게 입력하세요.']); exit;
        }

        $pdo->exec("CREATE TABLE IF NOT EXISTS `ci_email_otp` (
            `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `email`      VARCHAR(200) NOT NULL,
            `code`       VARCHAR(10)  NOT NULL,
            `expires_at` DATETIME     NOT NULL,
            `used`       TINYINT(1)   NOT NULL DEFAULT 0,
            `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `idx_email` (`email`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        if ($subact === 'send') {
            $pdo->prepare("DELETE FROM ci_email_otp WHERE email=?")->execute([$email]);
            $otp     = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
            $expires = date('Y-m-d H:i:s', time() + 600);
            $pdo->prepare("INSERT INTO ci_email_otp (email, code, expires_at) VALUES (?,?,?)")
                ->execute([$email, $otp, $expires]);

            require_once __DIR__ . '/../../phpmailer/Exception.php';
            require_once __DIR__ . '/../../phpmailer/PHPMailer.php';
            require_once __DIR__ . '/../../phpmailer/SMTP.php';

            try {
                $siteRow   = $pdo->query("SELECT title FROM homepage_info WHERE id=1 LIMIT 1");
                $siteTitle = ($siteRow ? $siteRow->fetchColumn() : '') ?: '관리자';

                $mail = new \PHPMailer\PHPMailer\PHPMailer(true);
                $mail->isSMTP();
                $mail->Host       = 'smtp.gmail.com';
                $mail->SMTPAuth   = true;
                $mail->Username   = 'solha.jin90@gmail.com';
                $mail->Password   = 'otud ocoq cmsv hvde';
                $mail->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port       = 587;
                $mail->CharSet    = 'UTF-8';
                $mail->setFrom('solha.jin90@gmail.com', $siteTitle);
                $mail->addAddress($email);
                $mail->Subject = '[' . $siteTitle . '] 이메일 인증번호';
                $mail->isHTML(true);
                $mail->Body = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:sans-serif;background:#f8fafc;padding:0;margin:0;">'
                    . '<div style="max-width:480px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">'
                    . '<div style="background:linear-gradient(90deg,#1255a6,#1e7fe8);padding:22px 28px;color:#fff;font-size:1rem;font-weight:700;">' . htmlspecialchars($siteTitle) . ' 이메일 인증</div>'
                    . '<div style="padding:28px;text-align:center;">'
                    . '<p style="color:#334155;font-size:.92rem;margin:0 0 18px;">아래 인증번호를 입력해 주세요.<br><span style="font-size:.8rem;color:#94a3b8;">10분 내 유효합니다.</span></p>'
                    . '<div style="font-size:2.2rem;font-weight:900;letter-spacing:8px;color:#1255a6;background:#f0f9ff;border-radius:10px;padding:16px 0;">' . $otp . '</div>'
                    . '</div>'
                    . '<div style="background:#f1f5f9;padding:12px 28px;font-size:.72rem;color:#94a3b8;text-align:center;">본 메일은 자동 발송되었습니다.</div>'
                    . '</div></body></html>';
                $mail->send();
                echo json_encode(['ok' => true, 'sent' => true]);
            } catch (Exception $e) {
                echo json_encode(['ok' => false, 'error' => '인증메일 발송 실패: ' . $e->getMessage()]);
            }
            exit;
        }

        if ($subact === 'verify') {
            if (!$code) { echo json_encode(['ok' => false, 'error' => '인증번호를 입력하세요.']); exit; }
            $stmt = $pdo->prepare("SELECT * FROM ci_email_otp WHERE email=? AND code=? AND used=0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1");
            $stmt->execute([$email, $code]);
            $row = $stmt->fetch();
            if (!$row) {
                echo json_encode(['ok' => false, 'error' => '인증번호가 올바르지 않거나 만료되었습니다.']); exit;
            }
            $pdo->prepare("UPDATE ci_email_otp SET used=1 WHERE id=?")->execute([$row['id']]);
            $userId   = 'email_' . md5($email);
            $userName = explode('@', $email)[0];
            $user = ['id' => $userId, 'name' => $userName, 'provider' => 'email'];
            $_SESSION['board_user'] = $user;
            logLogin($pdo, 'email', $userId, $userName, 'success');
            echo json_encode(['ok' => true, 'user' => $user]);
            exit;
        }

        echo json_encode(['ok' => false, 'error' => 'subaction 필요 (send|verify)']); exit;
    }

    /* ── 이메일 + 비밀번호 ── */
    elseif ($provider === 'email_pw') {
        $email    = trim($input['email']    ?? '');
        $password = trim($input['password'] ?? '');

        if (!$email || !$password) {
            echo json_encode(['ok' => false, 'error' => '이메일과 비밀번호를 입력하세요.']); exit;
        }

        // ci_email_users 테이블 자동 생성
        $pdo->exec("CREATE TABLE IF NOT EXISTS `ci_email_users` (
            `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
            `email`      VARCHAR(200) NOT NULL UNIQUE,
            `password`   VARCHAR(255) NOT NULL,
            `name`       VARCHAR(100) NOT NULL DEFAULT '',
            `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $stmt = $pdo->prepare('SELECT * FROM ci_email_users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $row = $stmt->fetch();

        if ($row) {
            // 기존 계정 — 비밀번호 검증
            if (!password_verify($password, $row['password'])) {
                echo json_encode(['ok' => false, 'error' => '이메일 또는 비밀번호가 올바르지 않습니다.']); exit;
            }
            $userId   = 'email_' . $row['id'];
            $userName = $row['name'] ?: $email;
        } else {
            // 신규 — 자동 가입
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $name = explode('@', $email)[0];
            $pdo->prepare('INSERT INTO ci_email_users (email, password, name) VALUES (?,?,?)')
                ->execute([$email, $hash, $name]);
            $newId    = $pdo->lastInsertId();
            $userId   = 'email_' . $newId;
            $userName = $name;
        }
    }

    else {
        echo json_encode(['ok' => false, 'error' => '지원하지 않는 공급자']); exit;
    }

    if (!$userId) { echo json_encode(['ok' => false, 'error' => '사용자 정보 없음']); exit; }

    // 기존 세션 초기화 후 새 계정으로 저장
    unset($_SESSION['board_user']);
    session_regenerate_id(true);
    $user = ['id' => $userId, 'name' => $userName, 'provider' => $provider];
    $_SESSION['board_user'] = $user;

    // 로그인 로그
    logLogin($pdo, $provider, $userId, $userName, 'success');

    echo json_encode(['ok' => true, 'user' => $user]);
    exit;
}

echo json_encode(['ok' => false, 'error' => 'Unknown action']);