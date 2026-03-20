<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;
/**
 * ci_confirm_mail.php — 고객 접수 확인 메일 발송
 *
 * custom_inquiry_public.php의 create 액션 INSERT 직후에 require:
 *   require_once __DIR__ . '/ci_confirm_mail.php';
 *
 * 필요 변수 (호출 측에서 이미 선언되어 있어야 함):
 *   $pdo         — PDO 인스턴스
 *   $formRow     — custom_inquiry_forms 레코드
 *   $fieldValues — 제출된 필드값 배열 ['field_key' => 'value', ...]
 *   $insert_id   — 방금 INSERT된 row id
 *
 * 동작:
 *   1) custom_inquiry_fields 에서 field_key 에 'email' 포함된 필드를 찾음
 *   2) 첫 번째로 발견된 필드값을 고객 이메일 주소로 사용
 *   3) 접수 내용 전체를 HTML 메일로 발송
 *   4) 발송 실패 시 조용히 무시 (접수 성공에 영향 없음)
 */

// 이미 로드됐을 수 있으므로 중복 실행 방지
if (!isset($pdo) || !isset($formRow) || !isset($fieldValues) || !isset($insert_id)) return;

try {
    // ── 필드 메타 조회 (label + field_key + type, 노출 순서대로) ──
    $ciCmFStmt = $pdo->prepare(
        'SELECT field_key, label, type FROM custom_inquiry_fields
          WHERE form_id = ? AND is_visible = 1
          ORDER BY sort_order ASC'
    );
    $ciCmFStmt->execute([$formRow['id']]);
    $ciCmFields = $ciCmFStmt->fetchAll(PDO::FETCH_ASSOC);

    // ── 고객 이메일 필드 감지 (field_key 에 'email' 포함, 첫 번째만) ──
    $ciCmCustomerEmail = '';
    foreach ($ciCmFields as $ciCmF) {
        if (strpos($ciCmF['field_key'], 'email') !== false) {
            $val = trim($fieldValues[$ciCmF['field_key']] ?? '');
            if ($val && strpos($val, '@') !== false) {
                $ciCmCustomerEmail = $val;
                break;
            }
        }
    }

    // 이메일 없으면 발송 불필요
    if (!$ciCmCustomerEmail) return;

    // ── SMTP 설정 (담당자 메일과 동일한 계정 사용) ──
    $ciCmSmtpEmail = 'solha.jin90@gmail.com';
    $ciCmSmtpPass  = 'otud ocoq cmsv hvde';
    $ciCmFromName  = $formRow['title'] ?? '고객센터';

    // ── 메일 본문 구성 ──
    $ciCmLines   = [];
    $ciCmLines[] = '안녕하세요, ' . htmlspecialchars($formRow['title']) . '에 문의해 주셔서 감사합니다.';
    $ciCmLines[] = '아래와 같이 접수되었습니다.';
    $ciCmLines[] = '';
    $ciCmLines[] = '■ 접수 번호: ' . $insert_id;
    $ciCmLines[] = '■ 접수 일시: ' . date('Y-m-d H:i:s');
    $ciCmLines[] = '';
    $ciCmLines[] = '■ 접수 내용';
    $ciCmLines[] = str_repeat('─', 36);

    foreach ($ciCmFields as $ciCmF) {
        $fk   = $ciCmF['field_key'];
        $fval = '';
        // 제품/카테고리는 name 컬럼으로 표시
        if ($fk === 'category_id') {
            $fval = $fieldValues['category_name'] ?? '';
        } elseif ($fk === 'product_id') {
            $fval = $fieldValues['product_name'] ?? '';
        } else {
            $fval = $fieldValues[$fk] ?? '';
        }
        // file 타입은 "첨부됨"으로 표시
        if ($ciCmF['type'] === 'file' && $fval) $fval = '(첨부파일 있음)';
        $ciCmLines[] = $ciCmF['label'] . ': ' . $fval;
    }

    $ciCmLines[] = str_repeat('─', 36);
    $ciCmLines[] = '';
    $ciCmLines[] = '검토 후 빠르게 답변 드리겠습니다.';
    $ciCmLines[] = '감사합니다.';

    $ciCmBodyText = implode("\n", $ciCmLines);

    // ── HTML 본문 ──
    $ciCmHtml = '<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:\'Apple SD Gothic Neo\',\'Malgun Gothic\',sans-serif;">
<div style="max-width:580px;margin:32px auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.09);">

  <!-- 헤더 -->
  <div style="background:linear-gradient(90deg,#1255a6,#1e7fe8);padding:26px 30px;">
    <div style="color:rgba(255,255,255,.75);font-size:.75rem;font-weight:600;letter-spacing:1px;margin-bottom:6px;">접수 확인</div>
    <div style="color:#fff;font-size:1.1rem;font-weight:700;">'
        . htmlspecialchars($formRow['title'])
        . '</div>
  </div>

  <!-- 인사 -->
  <div style="padding:26px 30px 0;">
    <p style="margin:0 0 6px;font-size:.92rem;color:#334155;line-height:1.7;">안녕하세요,<br>
    <strong>' . htmlspecialchars($formRow['title']) . '</strong>에 문의해 주셔서 감사합니다.<br>
    아래와 같이 정상적으로 접수되었습니다.</p>
  </div>

  <!-- 접수 번호 / 일시 -->
  <div style="margin:20px 30px 0;padding:14px 18px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;display:flex;gap:24px;flex-wrap:wrap;">
    <div>
      <div style="font-size:.72rem;color:#0369a1;font-weight:700;margin-bottom:3px;">접수 번호</div>
      <div style="font-size:.92rem;font-weight:800;color:#0c4a6e;">#' . $insert_id . '</div>
    </div>
    <div>
      <div style="font-size:.72rem;color:#0369a1;font-weight:700;margin-bottom:3px;">접수 일시</div>
      <div style="font-size:.92rem;font-weight:800;color:#0c4a6e;">' . date('Y-m-d H:i') . '</div>
    </div>
  </div>

  <!-- 접수 내용 -->
  <div style="padding:20px 30px;">
    <div style="font-size:.78rem;font-weight:700;color:#64748b;letter-spacing:.5px;text-transform:uppercase;margin-bottom:12px;">접수 내용</div>
    <table style="width:100%;border-collapse:collapse;">';

    foreach ($ciCmFields as $ciCmF) {
        $fk   = $ciCmF['field_key'];
        $fval = '';
        if ($fk === 'category_id') {
            $fval = $fieldValues['category_name'] ?? '';
        } elseif ($fk === 'product_id') {
            $fval = $fieldValues['product_name'] ?? '';
        } else {
            $fval = $fieldValues[$fk] ?? '';
        }
        if ($ciCmF['type'] === 'file' && $fval) $fval = '(첨부파일 있음)';

        $ciCmHtml .= '
      <tr style="border-bottom:1px solid #f1f5f9;">
        <td style="padding:10px 12px 10px 0;width:34%;font-size:.8rem;font-weight:700;color:#64748b;vertical-align:top;">'
            . htmlspecialchars($ciCmF['label']) . '</td>
        <td style="padding:10px 0;font-size:.86rem;color:#1e293b;line-height:1.6;">'
            . nl2br(htmlspecialchars($fval)) . '</td>
      </tr>';
    }

    $ciCmHtml .= '
    </table>
  </div>

  <!-- 안내 문구 -->
  <div style="margin:0 30px 24px;padding:14px 18px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
    <p style="margin:0;font-size:.82rem;color:#64748b;line-height:1.72;">
      검토 후 빠르게 답변 드리겠습니다. 추가 문의사항이 있으시면 언제든지 연락 주세요.
    </p>
  </div>

  <!-- 푸터 -->
  <div style="background:#f1f5f9;padding:14px 30px;text-align:center;">
    <p style="margin:0;font-size:.72rem;color:#94a3b8;">본 메일은 자동 발송되었습니다. 회신하지 마세요.</p>
  </div>

</div>
</body>
</html>';

    // ── PHPMailer로 발송 ──
    $ciCmMail = new PHPMailer(true);
    $ciCmMail->isSMTP();
    $ciCmMail->Host       = 'smtp.gmail.com';
    $ciCmMail->SMTPAuth   = true;
    $ciCmMail->Username   = $ciCmSmtpEmail;
    $ciCmMail->Password   = $ciCmSmtpPass;
    $ciCmMail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $ciCmMail->Port       = 587;
    $ciCmMail->CharSet    = 'UTF-8';
    $ciCmMail->setFrom($ciCmSmtpEmail, $ciCmFromName);
    $ciCmMail->addAddress($ciCmCustomerEmail);
    $ciCmMail->Subject = '[' . ($formRow['title'] ?? '접수 확인') . '] 문의가 접수되었습니다 (#' . $insert_id . ')';
    $ciCmMail->isHTML(true);
    $ciCmMail->Body    = $ciCmHtml;
    $ciCmMail->AltBody = $ciCmBodyText;
    $ciCmMail->send();

} catch (Exception $e) {
    // 고객 확인 메일 실패는 조용히 무시 — 접수 성공에 영향 없음
    // error_log('[ci_confirm_mail] ' . $e->getMessage());
} finally {
    // 변수 정리 (호출 측 네임스페이스 오염 방지)
    unset($ciCmFStmt, $ciCmFields, $ciCmCustomerEmail, $ciCmSmtpEmail, $ciCmSmtpPass,
          $ciCmFromName, $ciCmLines, $ciCmBodyText, $ciCmHtml, $ciCmMail, $ciCmF, $ciCmF, $fk, $fval);
}
