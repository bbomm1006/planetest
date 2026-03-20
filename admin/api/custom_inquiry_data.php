<?php
require_once __DIR__ . '/../../phpmailer/Exception.php';
require_once __DIR__ . '/../../phpmailer/PHPMailer.php';
require_once __DIR__ . '/../../phpmailer/SMTP.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/log_helper.php';

header('Content-Type: application/json; charset=utf-8');
requireLogin();

$action  = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo     = getDB();

/* ================================================================
   공통: 폼 + 테이블명 가져오기
   ================================================================ */
function getFormInfo($pdo, $form_id) {
    $stmt = $pdo->prepare('SELECT * FROM custom_inquiry_forms WHERE id=?');
    $stmt->execute([$form_id]);
    return $stmt->fetch();
}

/* ================================================================
   문의 내역 목록
   ================================================================ */
if ($action === 'list') {
    $form_id = intval($_GET['form_id'] ?? 0);
    $keyword = trim($_GET['keyword'] ?? '');
    $status  = trim($_GET['status'] ?? '');
    $from    = trim($_GET['from'] ?? '');
    $to      = trim($_GET['to'] ?? '');
    $page    = max(1, intval($_GET['page'] ?? 1));
    $limit   = 20;
    $offset  = ($page - 1) * $limit;

    $form = getFormInfo($pdo, $form_id);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => '폼을 찾을 수 없습니다.']); exit; }
    $tbl = $form['table_name'];

    $field_filters_raw = trim($_GET['field_filters'] ?? '');
    $field_filters = $field_filters_raw ? json_decode($field_filters_raw, true) : [];

    // 필드 키 화이트리스트 (SQL 인젝션 방지)
    $allowed_keys = [];
    if (!empty($field_filters)) {
        $fk_stmt = $pdo->prepare("SELECT field_key FROM custom_inquiry_fields WHERE form_id=? AND type IN ('select','radio','checkbox')");
        $fk_stmt->execute([$form_id]);
        $allowed_keys = array_column($fk_stmt->fetchAll(), 'field_key');
    }

    $where  = ['d.form_id = ?'];
    $params = [$form_id];

    // 첫번째 필드 키 조회 (제목 대신 표시 + 키워드 검색)
    $firstFieldStmt = $pdo->prepare('SELECT field_key FROM custom_inquiry_fields WHERE form_id=? AND is_visible=1 ORDER BY sort_order ASC LIMIT 1');
    $firstFieldStmt->execute([$form_id]);
    $firstFieldKey = $firstFieldStmt->fetchColumn();

    if ($keyword && $firstFieldKey) { $where[] = "d.`{$firstFieldKey}` LIKE ?"; $params[] = "%{$keyword}%"; }
    elseif ($keyword) { /* 필드 없으면 검색 스킵 */ }
    if ($status)  { $where[] = 'd.status_id = ?'; $params[] = intval($status); }
    if ($from)    { $where[] = 'DATE(d.created_at) >= ?'; $params[] = $from; }
    if ($to)      { $where[] = 'DATE(d.created_at) <= ?'; $params[] = $to; }

    // 동적 필드 필터 (select/radio/checkbox)
    foreach ($field_filters as $fkey => $fval) {
        if (!in_array($fkey, $allowed_keys, true)) continue;
        if ($fval === '' || $fval === null) continue;
        // checkbox는 FIND_IN_SET 또는 LIKE로 처리 (콤마구분 저장 방식)
        $where[] = "d.`{$fkey}` LIKE ?";
        $params[] = "%{$fval}%";
    }

    $whereSQL = implode(' AND ', $where);

    $total = $pdo->prepare("SELECT COUNT(*) FROM `{$tbl}` d WHERE {$whereSQL}");
    $total->execute($params);
    $totalCount = $total->fetchColumn();

    $firstFieldCol = $firstFieldKey ? ", d.`{$firstFieldKey}` as first_field_value" : '';

    // login/comment 컬럼 존재 여부 개별 확인
    $colExists = function($pdo, $tbl, $col) {
        $s = $pdo->prepare("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=? AND column_name=?");
        $s->execute([$tbl, $col]);
        return (bool)$s->fetchColumn();
    };
    $loginCols = [];
    if ($colExists($pdo, $tbl, 'login_id'))   $loginCols[] = 'd.login_id';
    if ($colExists($pdo, $tbl, 'login_type'))  $loginCols[] = 'd.login_type';
    if ($colExists($pdo, $tbl, 'login_name'))  $loginCols[] = 'd.login_name';
    $loginCol   = $loginCols ? ', ' . implode(', ', $loginCols) : '';
    $commentCol = $colExists($pdo, $tbl, 'comment_count') ? ', d.comment_count' : '';

    $sql = "SELECT d.id, d.view_count, d.created_at, s.label as status_label, s.color as status_color{$firstFieldCol}{$loginCol}{$commentCol}
            FROM `{$tbl}` d
            LEFT JOIN custom_inquiry_statuses s ON d.status_id = s.id
            WHERE {$whereSQL}
            ORDER BY d.id DESC LIMIT {$limit} OFFSET {$offset}";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    echo json_encode([
        'ok'    => true,
        'data'  => $rows,
        'total' => $totalCount,
        'page'  => $page,
        'limit' => $limit,
    ]);
    exit;
}

/* ================================================================
   문의 상세
   ================================================================ */
if ($action === 'detail') {
    $form_id = intval($_GET['form_id'] ?? 0);
    $id      = intval($_GET['id'] ?? 0);

    $form = getFormInfo($pdo, $form_id);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => '폼을 찾을 수 없습니다.']); exit; }
    $tbl = $form['table_name'];

    // 조회수 증가
    $pdo->prepare("UPDATE `{$tbl}` SET view_count = view_count + 1 WHERE id=?")->execute([$id]);

    $stmt = $pdo->prepare("SELECT d.*, s.label as status_label, s.color as status_color
        FROM `{$tbl}` d LEFT JOIN custom_inquiry_statuses s ON d.status_id = s.id WHERE d.id=?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) { echo json_encode(['ok' => false, 'msg' => '내역을 찾을 수 없습니다.']); exit; }

    // 필드 메타 조회
    $fields = $pdo->prepare('SELECT * FROM custom_inquiry_fields WHERE form_id=? AND is_visible=1 ORDER BY sort_order ASC');
    $fields->execute([$form_id]);
    $fieldMeta = $fields->fetchAll();

    // 상태 목록
    $statuses = $pdo->prepare('SELECT * FROM custom_inquiry_statuses WHERE form_id=? AND is_active=1 ORDER BY sort_order ASC');
    $statuses->execute([$form_id]);
    $statusList = $statuses->fetchAll();

    // 폼 설정 (reply_use, comment_use, login_use 등)
    $formInfo = getFormInfo($pdo, $form_id);

    echo json_encode(['ok' => true, 'data' => $row, 'fields' => $fieldMeta, 'statuses' => $statusList, 'form' => $formInfo]);
    exit;
}

/* ================================================================
   상태 변경
   ================================================================ */
if ($action === 'update_status') {
    $form_id   = intval($_POST['form_id'] ?? 0);
    $id        = intval($_POST['id'] ?? 0);
    $status_id = intval($_POST['status_id'] ?? 0);

    $form = getFormInfo($pdo, $form_id);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => '폼을 찾을 수 없습니다.']); exit; }
    $tbl = $form['table_name'];

    $pdo->prepare("UPDATE `{$tbl}` SET status_id=? WHERE id=?")->execute([$status_id, $id]);
    logAdminAction($pdo, 'update', 'custom_' . $tbl, (string)$id);
    echo json_encode(['ok' => true]);
    exit;
}

/* ================================================================
   엑셀 다운로드
   ================================================================ */
if ($action === 'excel') {
    $form_id = intval($_GET['form_id'] ?? 0);
    $keyword = trim($_GET['keyword'] ?? '');
    $status  = trim($_GET['status'] ?? '');
    $from    = trim($_GET['from'] ?? '');
    $to      = trim($_GET['to'] ?? '');

    $form = getFormInfo($pdo, $form_id);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => '폼을 찾을 수 없습니다.']); exit; }
    $tbl = $form['table_name'];

    // 필드 메타
    $fields = $pdo->prepare('SELECT * FROM custom_inquiry_fields WHERE form_id=? ORDER BY sort_order ASC');
    $fields->execute([$form_id]);
    $fieldMeta = $fields->fetchAll();

    // 첫번째 필드 키 조회 (WHERE보다 먼저)
    $efStmt = $pdo->prepare('SELECT field_key FROM custom_inquiry_fields WHERE form_id=? AND is_visible=1 ORDER BY sort_order ASC LIMIT 1');
    $efStmt->execute([$form_id]);
    $firstFieldKey = $efStmt->fetchColumn();

    $where  = ['d.form_id = ?'];
    $params = [$form_id];
    if ($keyword && $firstFieldKey) { $where[] = "d.`{$firstFieldKey}` LIKE ?"; $params[] = "%{$keyword}%"; }
    if ($status)  { $where[] = 'd.status_id = ?'; $params[] = intval($status); }
    if ($from)    { $where[] = 'DATE(d.created_at) >= ?'; $params[] = $from; }
    if ($to)      { $where[] = 'DATE(d.created_at) <= ?'; $params[] = $to; }
    $whereSQL = implode(' AND ', $where);

    $stmt = $pdo->prepare("SELECT d.*, s.label as status_label FROM `{$tbl}` d
        LEFT JOIN custom_inquiry_statuses s ON d.status_id = s.id
        WHERE {$whereSQL} ORDER BY d.id DESC");
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    // CSV 출력 (JSON 헤더 초기화 후 CSV 헤더 설정)
    while (ob_get_level()) ob_end_clean();
    header('Content-Type: text/csv; charset=UTF-8');
    header('Content-Disposition: attachment; filename="' . $tbl . '_' . date('Ymd_His') . '.csv"');
    header('Cache-Control: no-cache, must-revalidate');
    header('Pragma: no-cache');

    $out = fopen('php://output', 'w');
    fprintf($out, chr(0xEF).chr(0xBB).chr(0xBF)); // BOM (엑셀 한글 깨짐 방지)

    // 헤더 행
    $headers = ['No', '상태', '조회수', '신청일시', '수정일시'];
    foreach ($fieldMeta as $f) {
        if ($f['field_key'] === 'category_id') { $headers[] = '제품 분류'; }
        elseif ($f['field_key'] === 'product_id') { $headers[] = '제품명'; }
        else { $headers[] = $f['label']; }
    }
    fputcsv($out, $headers);

    foreach ($rows as $i => $row) {
        $line = [
            $i + 1,
            $row['status_label'] ?? '',
            $row['view_count'] ?? 0,
            $row['created_at'] ?? '',
            $row['updated_at'] ?? '',
        ];
        foreach ($fieldMeta as $f) {
            if ($f['field_key'] === 'category_id') { $line[] = $row['category_name'] ?? ''; }
            elseif ($f['field_key'] === 'product_id') { $line[] = $row['product_name'] ?? ''; }
            else { $line[] = $row[$f['field_key']] ?? ''; }
        }
        fputcsv($out, $line);
    }
    fclose($out);
    exit;
}

/* ================================================================
   답변 저장 + 이메일 발송 (reply_method === 'email' 인 경우)
   ================================================================ */
if ($action === 'save_reply') {
    $form_id = intval($_POST['form_id'] ?? 0);
    $id      = intval($_POST['id'] ?? 0);
    $content = trim($_POST['reply_content'] ?? '');

    $form = getFormInfo($pdo, $form_id);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => '폼 없음']); exit; }
    $tbl = $form['table_name'];

    // 답변 내용 저장
    $pdo->prepare("UPDATE `{$tbl}` SET reply_content=?, reply_at=NOW() WHERE id=?")->execute([$content, $id]);

    // ── 이메일 발송 (답변 기능 사용 + 이메일 방식인 경우)
    $mailSent   = false;
    $mailError  = '';
    if (!empty($content) && intval($form['reply_use'] ?? 0) === 1 && ($form['reply_method'] ?? '') === 'email') {
        // 해당 row 전체 조회
        $rowStmt = $pdo->prepare("SELECT * FROM `{$tbl}` WHERE id=?");
        $rowStmt->execute([$id]);
        $row = $rowStmt->fetch(PDO::FETCH_ASSOC);

        // email 필드 키 조회 (field_key = 'email' 로 등록된 필드)
        $efStmt = $pdo->prepare("SELECT field_key FROM custom_inquiry_fields WHERE form_id=? AND field_key='email' LIMIT 1");
        $efStmt->execute([$form_id]);
        $emailFieldKey = $efStmt->fetchColumn();

        $toEmail = '';
        if ($emailFieldKey && isset($row[$emailFieldKey])) {
            $toEmail = trim($row[$emailFieldKey]);
        }
        // fallback: 컬럼명 'email' 직접 시도
        if (!$toEmail && isset($row['email'])) {
            $toEmail = trim($row['email']);
        }

        if ($toEmail && strpos($toEmail, '@') !== false) {
            try {
                // 사이트명 조회
                $siteStmt  = $pdo->query("SELECT title FROM homepage_info WHERE id=1 LIMIT 1");
                $siteTitle = ($siteStmt ? $siteStmt->fetchColumn() : '') ?: '관리자';
                $fromName         = $siteTitle . ' 관리자';
                $gmailEmail       = 'solha.jin90@gmail.com';
                $gmailAppPassword = 'otud ocoq cmsv hvde';

                $formTitle = htmlspecialchars($form['title'] ?? '문의', ENT_QUOTES);
                $subject   = "[{$formTitle}] 답변이 등록되었습니다.";

                $htmlBody = '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"></head>'
                    . '<body style="font-family:\'Noto Sans KR\',sans-serif;background:#f8fafc;margin:0;padding:0;">'
                    . '<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">'
                    . '<div style="background:linear-gradient(90deg,#1255a6,#1e7fe8);padding:28px 32px;">'
                    . '<div style="font-weight:900;font-size:1.3rem;color:#fff;">' . htmlspecialchars($siteTitle) . '</div>'
                    . '</div>'
                    . '<div style="padding:28px 32px;">'
                    . '<p style="font-size:.95rem;color:#1e293b;margin:0 0 16px;">안녕하세요, 문의하신 내용에 대한 답변을 드립니다.</p>'
                    . '<div style="background:#f1f5f9;border-radius:8px;padding:16px 20px;margin-bottom:16px;">'
                    . '<pre style="white-space:pre-wrap;font-family:\'Noto Sans KR\',sans-serif;font-size:.92rem;color:#334155;line-height:1.8;margin:0;">'
                    . htmlspecialchars($content)
                    . '</pre>'
                    . '</div>'
                    . '</div>'
                    . '<div style="background:#f1f5f9;padding:16px 32px;font-size:.75rem;color:#94a3b8;text-align:center;">'
                    . htmlspecialchars($siteTitle) . ' 관리자 시스템 자동 발송'
                    . '</div>'
                    . '</div></body></html>';

                $mail = new PHPMailer(true);
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

                $mailSent = true;
                try { logEmail($pdo, $toEmail, $subject, 'reply', 'success'); } catch (Throwable $e) {}

            } catch (Throwable $e) {
                $mailError = $e->getMessage();
                try { logEmail($pdo, $toEmail ?? '', $subject ?? '', 'reply', 'fail', $mailError); } catch (Throwable $le) {}
            }
        }
    }

    // ── 알림톡 / SMS 발송 (reply_method 가 alimtalk 또는 sms 인 경우)
    $sendResult = ['ok' => false, 'msg' => ''];
    if (!empty($content) && intval($form['reply_use'] ?? 0) === 1
        && in_array($form['reply_method'] ?? '', ['alimtalk', 'sms'], true)) {
        require_once __DIR__ . '/../api_front/ci_reply_send.php';
        $sendResult = ciReplySend($pdo, $form, $id, $content, $form['reply_method']);
    }

    $resp = ['ok' => true, 'mail_sent' => $mailSent];
    if ($mailError)            $resp['mail_error']   = $mailError;
    if ($sendResult['ok'])     $resp['send_sent']    = true;
    if (!empty($sendResult['msg']) && !$sendResult['ok']) $resp['send_error'] = $sendResult['msg'];
    echo json_encode($resp);
    exit;
}

/* ================================================================
   선택 행 삭제
   ================================================================ */
if ($action === 'delete_rows') {
    $form_id = intval($_POST['form_id'] ?? 0);
    $ids_raw = $_POST['ids'] ?? '';
    $ids = array_filter(array_map('intval', explode(',', $ids_raw)));

    if (empty($ids)) { echo json_encode(['ok' => false, 'msg' => '삭제할 항목을 선택해 주세요.']); exit; }

    $form = getFormInfo($pdo, $form_id);
    if (!$form) { echo json_encode(['ok' => false, 'msg' => '폼 없음']); exit; }
    $tbl = $form['table_name'];

    $placeholders = implode(',', array_fill(0, count($ids), '?'));
    $pdo->prepare("DELETE FROM `{$tbl}` WHERE id IN ({$placeholders})")->execute($ids);

    // 댓글도 삭제
    $ctbl = 'ci_comments_' . $tbl;
    try {
        $pdo->prepare("DELETE FROM `{$ctbl}` WHERE row_id IN ({$placeholders})")->execute($ids);
    } catch (Exception $e) {}

    echo json_encode(['ok' => true, 'deleted' => count($ids)]);
    exit;
}

echo json_encode(['ok' => false, 'msg' => 'Unknown action']);