<?php
/**
 * 계정 찾기 API
 * POST /www_root/admin/api/find_account.php
 *
 * action=find_id   : 이메일로 아이디 찾기
 * action=find_pw   : 아이디+이메일로 임시 비밀번호 발급
 */

require_once __DIR__ . '/../config/db.php';

// PHPMailer
require_once __DIR__ . '/../../phpmailer/Exception.php';
require_once __DIR__ . '/../../phpmailer/PHPMailer.php';
require_once __DIR__ . '/../../phpmailer/SMTP.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'msg' => 'POST only']);
    exit;
}

/* ── 발신자 정보 (send_email.php와 동일하게 맞춰주세요) ── */
$fromName         = '관리자';
$gmailEmail       = 'solha.jin90@gmail.com';
$gmailAppPassword = 'otud ocoq cmsv hvde';

/* ── 메일 제목용 사이트 타이틀 ── */
$_siteTitle = '';
try {
    $_row = getDB()->query("SELECT title FROM homepage_info WHERE id=1 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
    $_siteTitle = $_row['title'] ?? '';
} catch (Exception $e) {}
$mailPrefix = $_siteTitle ? '[' . $_siteTitle . ']' : '[관리자]';

$action = trim($_POST['action'] ?? '');

/* ================================================================
   공통: 이메일 발송 함수
   ================================================================ */
function sendMail($toEmail, $subject, $htmlBody, $gmailEmail, $gmailAppPassword, $fromName) {
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = $gmailEmail;
        $mail->Password   = $gmailAppPassword;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;
        $mail->CharSet    = 'UTF-8';
        $mail->setFrom($gmailEmail, $fromName);
        $mail->addAddress($toEmail);
        $mail->Subject = $subject;
        $mail->isHTML(true);
        $mail->Body    = $htmlBody;
        $mail->send();
        return true;
    } catch (Exception $e) {
        return $mail->ErrorInfo;
    }
}

/* ── 홈페이지 정보 가져오기 ── */
function getSiteInfo() {
    try {
        $pdo  = getDB();
        $row  = $pdo->query("SELECT title, copyright FROM homepage_info WHERE id=1 LIMIT 1")->fetch(PDO::FETCH_ASSOC);
        return $row ?: ['title' => '', 'copyright' => ''];
    } catch (Exception $e) {
        return ['title' => '', 'copyright' => ''];
    }
}

/* ── 공통 HTML 래퍼 ── */
function mailWrap($title, $content) {
    $site      = getSiteInfo();
    $siteTitle = htmlspecialchars($site['title'] ?: '');
    $copyright = htmlspecialchars($site['copyright'] ?: '');

    return '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"></head>
<body style="font-family:\'Noto Sans KR\',sans-serif;background:#f8fafc;margin:0;padding:0;">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
  <div style="background:linear-gradient(90deg,#1255a6,#1e7fe8);padding:28px 32px;">
    <div style="font-family:Montserrat,sans-serif;font-weight:900;font-size:1.3rem;color:#fff;letter-spacing:-0.5px;">' . $siteTitle . '</div>
  </div>
  <div style="padding:28px 32px;">
    <h2 style="font-size:1.1rem;color:#1255a6;margin:0 0 16px;">' . $title . '</h2>
    ' . $content . '
  </div>
  <div style="background:#f1f5f9;padding:16px 32px;font-size:.75rem;color:#94a3b8;text-align:center;">
    ' . $copyright . '
  </div>
</div>
</body></html>';
}

/* ================================================================
   아이디 찾기
   ================================================================ */
if ($action === 'find_id') {
    $email = trim($_POST['email'] ?? '');

    if (!$email || strpos($email, '@') === false) {
        echo json_encode(['ok' => false, 'msg' => '이메일 주소를 올바르게 입력해 주세요.']);
        exit;
    }

    $pdo  = getDB();
    $stmt = $pdo->prepare('SELECT username, name FROM admins WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $admin = $stmt->fetch();

    if (!$admin) {
        // 보안상 동일한 메시지 (이메일 존재 여부 노출 방지)
        echo json_encode(['ok' => true, 'msg' => '등록된 이메일이 있으면 아이디를 발송했습니다.']);
        exit;
    }

    $maskedId = mb_substr($admin['username'], 0, 2) . str_repeat('*', max(1, mb_strlen($admin['username']) - 2));

    $content = '
        <p style="color:#334155;line-height:1.8;font-size:.92rem;">
          안녕하세요, <strong>' . htmlspecialchars($admin['name']) . '</strong>님.<br>
          요청하신 아이디 정보를 안내해 드립니다.
        </p>
        <div style="background:#f1f5f9;border-radius:8px;padding:16px 20px;margin:16px 0;font-size:1rem;">
          아이디: <strong style="color:#1255a6;letter-spacing:1px;">' . htmlspecialchars($maskedId) . '</strong>
        </div>
        <p style="color:#64748b;font-size:.83rem;">
          * 보안을 위해 아이디 일부는 마스킹 처리되어 있습니다.<br>
          * 본인이 요청하지 않은 경우 이 메일을 무시하세요.
        </p>';

    $html   = mailWrap('아이디 찾기 결과', $content);
    $result = sendMail($email, $mailPrefix . ' 아이디 안내', $html, $gmailEmail, $gmailAppPassword, $fromName);

    if ($result === true) {
        echo json_encode(['ok' => true, 'msg' => '등록된 이메일이 있으면 아이디를 발송했습니다.']);
    } else {
        echo json_encode(['ok' => false, 'msg' => '메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.']);
    }
    exit;
}

/* ================================================================
   비밀번호 찾기 (임시 비밀번호 발급)
   ================================================================ */
if ($action === 'find_pw') {
    $username = trim($_POST['username'] ?? '');
    $email    = trim($_POST['email'] ?? '');

    if (!$username) {
        echo json_encode(['ok' => false, 'msg' => '아이디를 입력해 주세요.']);
        exit;
    }
    if (!$email || strpos($email, '@') === false) {
        echo json_encode(['ok' => false, 'msg' => '이메일 주소를 올바르게 입력해 주세요.']);
        exit;
    }

    $pdo  = getDB();
    $stmt = $pdo->prepare('SELECT id, name FROM admins WHERE username = ? AND email = ? LIMIT 1');
    $stmt->execute([$username, $email]);
    $admin = $stmt->fetch();

    if (!$admin) {
        echo json_encode(['ok' => true, 'msg' => '입력하신 정보와 일치하는 계정이 있으면 임시 비밀번호를 발송했습니다.']);
        exit;
    }

    /* 임시 비밀번호 생성 (영문+숫자 10자리) */
    $chars   = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
    $tempPw  = '';
    for ($i = 0; $i < 10; $i++) {
        $tempPw .= $chars[random_int(0, strlen($chars) - 1)];
    }

    /* DB에 반영 */
    $hashed = password_hash($tempPw, PASSWORD_DEFAULT);
    $upd    = $pdo->prepare('UPDATE admins SET password = ? WHERE id = ?');
    $upd->execute([$hashed, $admin['id']]);

    $content = '
        <p style="color:#334155;line-height:1.8;font-size:.92rem;">
          안녕하세요, <strong>' . htmlspecialchars($admin['name']) . '</strong>님.<br>
          임시 비밀번호가 발급되었습니다. 로그인 후 반드시 비밀번호를 변경해 주세요.
        </p>
        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px 20px;margin:16px 0;font-size:1rem;">
          임시 비밀번호: <strong style="color:#ea580c;letter-spacing:2px;">' . htmlspecialchars($tempPw) . '</strong>
        </div>
        <p style="color:#64748b;font-size:.83rem;">
          * 임시 비밀번호는 로그인 후 즉시 변경하시기 바랍니다.<br>
          * 본인이 요청하지 않은 경우 즉시 비밀번호를 변경하고 관리자에게 문의하세요.
        </p>';

    $html   = mailWrap('임시 비밀번호 안내', $content);
    $result = sendMail($email, $mailPrefix . ' 임시 비밀번호 안내', $html, $gmailEmail, $gmailAppPassword, $fromName);

    if ($result === true) {
        echo json_encode(['ok' => true, 'msg' => '입력하신 정보와 일치하는 계정이 있으면 임시 비밀번호를 발송했습니다.']);
    } else {
        echo json_encode(['ok' => false, 'msg' => '메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.']);
    }
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action']);
