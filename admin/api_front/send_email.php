<?php
/**
 * PureBlue — 이메일 발송 API
 * POST /www_root/admin/api_front/send_email.php
 * body: { to, subject, body }
 *
 * PHPMailer + Gmail SMTP (TLS/587) 사용
 * 사전 준비: phpmailer/src/ 폴더를 이 파일과 같은 디렉터리에 배치
 */

require_once __DIR__ . '/../../phpmailer/Exception.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/log_helper.php';
require_once __DIR__ . '/../../phpmailer/PHPMailer.php';
require_once __DIR__ . '/../../phpmailer/SMTP.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json; charset=utf-8');
try { $_lp = getDB(); logAccess($_lp); logLanding($_lp); } catch(Throwable $_le) {}
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok'=>false,'error'=>'POST only']); exit; }

$body = json_decode(file_get_contents('php://input'), true);
if (!$body) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'잘못된 요청']); exit; }

$to      = isset($body['to'])      ? trim($body['to'])      : '';
$subject = isset($body['subject']) ? trim($body['subject']) : '[퓨어블루] 신청 완료 안내';
$text    = isset($body['body'])    ? trim($body['body'])    : '';

if (!$to || strpos($to,'@') === false) {
    http_response_code(400);
    echo json_encode(['ok'=>false,'error'=>'유효하지 않은 이메일 주소']);
    exit;
}

/* ── 발신자 정보 ── */
$fromName         = 'PureBlue 고객센터';
$gmailEmail       = 'solha.jin90@gmail.com';   // Gmail 주소로 변경
$gmailAppPassword = 'otud ocoq cmsv hvde';       // Gmail 앱 비밀번호로 변경

/* ── HTML 이메일 본문 생성 ── */
$htmlBody = '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"></head><body style="font-family:\'Noto Sans KR\',sans-serif;background:#f8fafc;margin:0;padding:0;">'
  .'<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">'
  .'<div style="background:linear-gradient(90deg,#1255a6,#1e7fe8);padding:28px 32px;">'
  .'<div style="font-family:Montserrat,sans-serif;font-weight:900;font-size:1.3rem;color:#fff;letter-spacing:-0.5px;">Pure<span style="color:#00c6ff;">Blue</span></div>'
  .'<div style="color:rgba(255,255,255,.7);font-size:.8rem;margin-top:4px;">프리미엄 정수기 렌탈</div>'
  .'</div>'
  .'<div style="padding:28px 32px;">'
  .'<pre style="white-space:pre-wrap;font-family:\'Noto Sans KR\',sans-serif;font-size:.92rem;color:#334155;line-height:1.8;margin:0;">'.htmlspecialchars($text).'</pre>'
  .'</div>'
  .'<div style="background:#f1f5f9;padding:16px 32px;font-size:.75rem;color:#94a3b8;text-align:center;">'
  .'© 2026 PureBlue Corp. 고객센터: 1588-0000 | 평일 09~18시'
  .'</div>'
  .'</div></body></html>';

/* ── PHPMailer SMTP 발송 ── */
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
    $mail->addAddress($to);
    $mail->Subject  = $subject;
    $mail->isHTML(true);
    $mail->Body     = $htmlBody;

    $mail->send();
    logEmail(getDB(), $to, $subject, 'default', 'success');
    echo json_encode(['ok'=>true,'message'=>$to.'로 발송되었습니다']);
} catch (Exception $e) {
    http_response_code(500);
    logEmail(getDB(), $to, $subject, 'default', 'fail', $mail->ErrorInfo);
    echo json_encode(['ok'=>false,'error'=>'메일 발송 실패: '.$mail->ErrorInfo]);
}
