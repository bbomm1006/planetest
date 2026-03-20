<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../../phpmailer/Exception.php';
require_once __DIR__ . '/../../phpmailer/PHPMailer.php';
require_once __DIR__ . '/../../phpmailer/SMTP.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;
header('Content-Type: application/json; charset=utf-8');
set_error_handler(function($no,$str,$file,$line){ echo json_encode(['ok'=>false,'msg'=>"PHP[$no]:$str $file:$line"]); exit; });
set_exception_handler(function($e){ echo json_encode(['ok'=>false,'msg'=>$e->getMessage()]); exit; });

$pdo    = getDB();
$action = $_GET['action'] ?? $_POST['action'] ?? 'config';

/* ================================================================
   폼 설정 + 필드 + 약관 한번에 조회
   GET ?action=config&table_name=form_type1
   ================================================================ */
if ($action === 'config') {
    $table_name = preg_replace('/[^a-z0-9_]/', '', strtolower(trim($_GET['table_name'] ?? '')));
    if (!$table_name) { echo json_encode(['ok'=>false,'msg'=>'table_name 필요']); exit; }

    $form = $pdo->prepare('SELECT * FROM custom_inquiry_forms WHERE table_name=? AND is_active=1 LIMIT 1');
    $form->execute([$table_name]);
    $formRow = $form->fetch();
    if (!$formRow) { echo json_encode(['ok'=>false,'msg'=>'폼을 찾을 수 없습니다.']); exit; }

    $form_id = $formRow['id'];

    // 필드 (노출중인 것만) - 필드 목록 먼저, 옵션 별도 조회
    $fStmt = $pdo->prepare('SELECT * FROM custom_inquiry_fields WHERE form_id=? AND is_visible=1 ORDER BY sort_order ASC');
    $fStmt->execute([$form_id]);
    $fields = $fStmt->fetchAll();

    // 옵션이 있는 필드 id 목록 추출 후 옵션 일괄 조회
    $fieldIds = array_column($fields, 'id');
    $optionMap = [];
    if (!empty($fieldIds)) {
        $inPlaceholders = implode(',', array_fill(0, count($fieldIds), '?'));
        $oStmt = $pdo->prepare("SELECT field_id, label FROM custom_inquiry_field_options WHERE field_id IN ($inPlaceholders) AND is_visible=1 ORDER BY sort_order ASC");
        $oStmt->execute($fieldIds);
        foreach ($oStmt->fetchAll() as $opt) {
            $optionMap[$opt['field_id']][] = $opt['label'];
        }
    }
    foreach ($fields as &$f) {
        $f['options'] = $optionMap[$f['id']] ?? [];
    }
    unset($f);

    // 약관 (사용중인 것만)
    $tStmt = $pdo->prepare('SELECT * FROM custom_inquiry_terms WHERE form_id=? AND is_active=1 ORDER BY sort_order ASC');
    $tStmt->execute([$form_id]);
    $terms = $tStmt->fetchAll();

    // 기본 상태 id
    $sStmt = $pdo->prepare('SELECT id FROM custom_inquiry_statuses WHERE form_id=? AND is_default=1 LIMIT 1');
    $sStmt->execute([$form_id]);
    $defaultStatus = $sStmt->fetchColumn();

    // 제품 데이터 (product_use=1 일 때만)
    $categories = [];
    $products   = [];
    if ($formRow['product_use']) {
        $catStmt = $pdo->query('SELECT id, name FROM product_categories WHERE is_active=1 ORDER BY sort_order, id');
        $categories = $catStmt->fetchAll();
        $prodStmt = $pdo->query('SELECT id, category_id, name, model_no FROM product_products ORDER BY sort_order, id');
        $products = $prodStmt->fetchAll();
    }

    // 숫자형 필드 명시적 캐스팅 (JS에서 타입 혼선 방지)
    $formRow['product_use']      = (int)$formRow['product_use'];
    $formRow['product_required'] = (int)($formRow['product_required'] ?? 0);
    $formRow['login_use']        = (int)($formRow['login_use']        ?? 0);
    $formRow['comment_use']      = (int)($formRow['comment_use']      ?? 0);
    $formRow['period_use']       = (int)($formRow['period_use']       ?? 0);
    $formRow['reply_use']        = (int)($formRow['reply_use']        ?? 0);
    $formRow['is_active']        = (int)$formRow['is_active'];

    echo json_encode([
        'ok'             => true,
        'form'           => $formRow,
        'fields'         => $fields,
        'terms'          => $terms,
        'default_status' => $defaultStatus ?: null,
        'categories'     => $categories,
        'products'       => $products,
    ]);
    exit;
}

/* ================================================================
   문의 등록
   POST ?action=create
   body JSON: { table_name, title, fields:{key:val,...}, terms:[id,...], login_type, login_id }
   ================================================================ */
if ($action === 'create') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];

    $table_name = preg_replace('/[^a-z0-9_]/', '', strtolower(trim($input['table_name'] ?? '')));
    if (!$table_name) { echo json_encode(['ok'=>false,'msg'=>'table_name 필요']); exit; }

    // 폼 유효성
    $form = $pdo->prepare('SELECT * FROM custom_inquiry_forms WHERE table_name=? AND is_active=1 LIMIT 1');
    $form->execute([$table_name]);
    $formRow = $form->fetch();
    if (!$formRow) { echo json_encode(['ok'=>false,'msg'=>'폼을 찾을 수 없습니다.']); exit; }

    // 기간 체크
    if ($formRow['period_use']) {
        $today = date('Y-m-d');
        if ($formRow['period_start'] && $today < $formRow['period_start']) {
            echo json_encode(['ok'=>false,'msg'=>'아직 접수 기간이 아닙니다.']); exit;
        }
        if ($formRow['period_end'] && $today > $formRow['period_end']) {
            echo json_encode(['ok'=>false,'msg'=>'접수 기간이 종료되었습니다.']); exit;
        }
    }

    $form_id       = $formRow['id'];
    $fieldValues   = $input['fields']          ?? [];
    $login_type    = trim($input['login_type'] ?? '');
    $login_id      = trim($input['login_id']   ?? '');
    $visibility    = intval($input['visibility'] ?? 1);

    // 기본 상태
    $sStmt = $pdo->prepare('SELECT id FROM custom_inquiry_statuses WHERE form_id=? AND is_default=1 LIMIT 1');
    $sStmt->execute([$form_id]);
    $status_id = $sStmt->fetchColumn() ?: null;

    // 허용된 필드키 조회
    $fStmt = $pdo->prepare('SELECT field_key, is_required, type FROM custom_inquiry_fields WHERE form_id=? AND is_visible=1');
    $fStmt->execute([$form_id]);
    $allowedFields = $fStmt->fetchAll(PDO::FETCH_ASSOC);

    // 필수 필드 체크
    foreach ($allowedFields as $af) {
        if ($af['is_required'] && empty($fieldValues[$af['field_key']])) {
            echo json_encode(['ok'=>false,'msg'=>$af['field_key'].' 항목은 필수입니다.']); exit;
        }
    }

    // 첫번째 필드값을 title 컬럼에 저장
    $firstFStmt = $pdo->prepare('SELECT field_key FROM custom_inquiry_fields WHERE form_id=? AND is_visible=1 ORDER BY sort_order ASC LIMIT 1');
    $firstFStmt->execute([$form_id]);
    $firstFKey = $firstFStmt->fetchColumn();
    $autoTitle = $firstFKey && isset($fieldValues[$firstFKey]) ? trim($fieldValues[$firstFKey]) : '';

    // INSERT - 고정 컬럼
    $cols   = ['form_id', 'title', 'status_id', 'login_type', 'login_id', 'visibility'];
    $vals   = [$form_id, $autoTitle, $status_id, $login_type ?: null, $login_id ?: null, $visibility];
    $ph     = ['?','?','?','?','?','?'];

    // 동적 필드 컬럼 (product 컬럼 포함)
    $allowedKeys = array_column($allowedFields, 'field_key');
    if ($formRow['product_use']) {
        $allowedKeys = array_merge($allowedKeys, ['category_id','category_name','product_id','product_name']);
    }

    // 실제 테이블에 존재하는 컬럼만 추려서 INSERT (컬럼 불일치 오류 방지)
    $existColStmt = $pdo->prepare(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?"
    );
    $existColStmt->execute([$table_name]);
    $existCols = array_column($existColStmt->fetchAll(PDO::FETCH_ASSOC), 'COLUMN_NAME');

    foreach ($fieldValues as $k => $v) {
        if (!in_array($k, $allowedKeys, true)) continue;
        if (!in_array($k, $existCols, true)) continue;  // 실제 컬럼 없으면 스킵
        $cols[] = "`{$k}`";
        $vals[] = is_array($v) ? implode(',', $v) : $v;
        $ph[]   = '?';
    }

    $sql = "INSERT INTO `{$table_name}` (" . implode(',', $cols) . ") VALUES (" . implode(',', $ph) . ")";
    $pdo->prepare($sql)->execute($vals);
    $insert_id = $pdo->lastInsertId();

    // 고객 접수 확인 메일 발송 (field_key에 email 포함 시 자동 감지)
    require_once __DIR__ . '/ci_confirm_mail.php';

    // 담당자 알림 메일 발송 (notify_email=1 인 담당자에게)
    $mgrs = $pdo->prepare('SELECT * FROM custom_inquiry_managers WHERE form_id=? AND is_active=1 AND notify_email=1');
    $mgrs->execute([$form_id]);
    $managers = $mgrs->fetchAll();

    if (!empty($managers)) {
        try {
            $gmailEmail       = 'solha.jin90@gmail.com';
            $gmailAppPassword = 'otud ocoq cmsv hvde';
            $fromName         = '관리자';

            // 메일 본문 구성
            $bodyLines = [];
            $bodyLines[] = "[{$formRow['title']}] 새 문의가 접수되었습니다.";
            $bodyLines[] = '';
            $bodyLines[] = '■ 접수 내용';

            // 필드값 출력
            $fStmt2 = $pdo->prepare('SELECT * FROM custom_inquiry_fields WHERE form_id=? AND is_visible=1 ORDER BY sort_order ASC');
            $fStmt2->execute([$form_id]);
            $fMeta = $fStmt2->fetchAll();
            foreach ($fMeta as $fm) {
                $fk = $fm['field_key'];
                $fval = '';
                if ($fk === 'category_id') $fval = $fieldValues['category_name'] ?? '';
                elseif ($fk === 'product_id') $fval = $fieldValues['product_name'] ?? '';
                else $fval = isset($fieldValues[$fk]) ? $fieldValues[$fk] : '';
                $bodyLines[] = $fm['label'] . ': ' . $fval;
            }
            $bodyLines[] = '';
            $bodyLines[] = '접수 일시: ' . date('Y-m-d H:i:s');

            $bodyText = implode("
", $bodyLines);
            $htmlBody = '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:sans-serif;background:#f8fafc;padding:0;margin:0;">'
                . '<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08);">'
                . '<div style="background:linear-gradient(90deg,#1255a6,#1e7fe8);padding:24px 28px;color:#fff;font-size:1rem;font-weight:700;">'
                . htmlspecialchars($formRow['title']) . ' - 새 문의 접수</div>'
                . '<div style="padding:24px 28px;"><pre style="white-space:pre-wrap;font-family:sans-serif;font-size:.9rem;color:#334155;line-height:1.8;margin:0;">'
                . htmlspecialchars($bodyText) . '</pre></div>'
                . '<div style="background:#f1f5f9;padding:12px 28px;font-size:.75rem;color:#94a3b8;text-align:center;">관리자 시스템 자동 발송</div>'
                . '</div></body></html>';

            foreach ($managers as $mgr) {
                if (!$mgr['email'] || strpos($mgr['email'], '@') === false) continue;
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
                $mail->addAddress($mgr['email'], $mgr['name']);
                $mail->Subject  = '[' . $formRow['title'] . '] 새 문의 접수';
                $mail->isHTML(true);
                $mail->Body     = $htmlBody;
                $mail->send();
            }
        } catch (Exception $e) {
            // 메일 발송 실패는 무시 (접수는 성공 처리)
        }
    }

    // ── 구글시트 웹훅 발송 (notify_sheet=1 인 담당자에게)
    $sheetMgrs = $pdo->prepare('SELECT * FROM custom_inquiry_managers WHERE form_id=? AND is_active=1 AND notify_sheet=1');
    $sheetMgrs->execute([$form_id]);
    $sheetManagers = $sheetMgrs->fetchAll();

    if (!empty($sheetManagers)) {
        // 헤더 및 값 구성
        $fStmt3 = $pdo->prepare('SELECT * FROM custom_inquiry_fields WHERE form_id=? AND is_visible=1 ORDER BY sort_order ASC');
        $fStmt3->execute([$form_id]);
        $fMeta3 = $fStmt3->fetchAll();

        $headers = ['접수번호', '접수일시'];
        $values  = [$insert_id, date('Y-m-d H:i:s')];

        foreach ($fMeta3 as $fm) {
            $fk = $fm['field_key'];
            if ($fk === 'category_id') {
                $headers[] = '제품 분류';
                $values[]  = $fieldValues['category_name'] ?? '';
            } elseif ($fk === 'product_id') {
                $headers[] = '제품명';
                $values[]  = $fieldValues['product_name'] ?? '';
            } else {
                $headers[] = $fm['label'];
                $values[]  = $fieldValues[$fk] ?? '';
            }
        }

        foreach ($sheetManagers as $smgr) {
            $webhookUrl = trim($smgr['sheet_id'] ?? '');
            if (!$webhookUrl || strpos($webhookUrl, 'https://script.google.com') !== 0) continue;

            try {
                $payload = json_encode([
                    'sheet_name' => $smgr['sheet_name'] ?: 'Sheet1',
                    'headers'    => $headers,
                    'values'     => $values,
                ]);
                $ch = curl_init($webhookUrl);
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POST           => true,
                    CURLOPT_POSTFIELDS     => $payload,
                    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
                    CURLOPT_TIMEOUT        => 10,
                    CURLOPT_SSL_VERIFYPEER => true,
                ]);
                curl_exec($ch);
                curl_close($ch);
            } catch (Exception $e) {
                // 시트 전송 실패 무시
            }
        }
    }

    echo json_encode(['ok'=>true, 'id'=>$insert_id]);
    exit;
}

/* ================================================================
   목록 조회
   GET ?action=list&table_name=form_type2&page=1&limit=10&kw=검색어
   - 비로그인: 전체 목록 (is_mine=false)
   - 로그인:   전체 목록 + 본인 글 is_mine=true
   ================================================================ */
if ($action === 'list') {
    $table_name = preg_replace('/[^a-z0-9_]/', '', strtolower(trim($_GET['table_name'] ?? '')));
    if (!$table_name) { echo json_encode(['ok'=>false,'msg'=>'table_name 필요']); exit; }

    $form = $pdo->prepare('SELECT * FROM custom_inquiry_forms WHERE table_name=? AND is_active=1 LIMIT 1');
    $form->execute([$table_name]);
    $formRow = $form->fetch();
    if (!$formRow) { echo json_encode(['ok'=>false,'msg'=>'폼을 찾을 수 없습니다.']); exit; }

    if (session_status() === PHP_SESSION_NONE) session_start();
    $sessionUser  = $_SESSION['board_user'] ?? null;
    $loginUserId  = $sessionUser ? $sessionUser['id'] : '';
    $visType      = $formRow['visibility_type'] ?? ''; // 'public' | 'private' | 'both' | ''
    $loginUse     = (int)($formRow['login_use'] ?? 0);

    // 조회 권한 판단
    // - visibility_type 없음(공개글 off) → 목록 조회 불가
    if (!$visType) { echo json_encode(['ok'=>false,'msg'=>'조회 권한이 없습니다.']); exit; }

    $page   = max(1, intval($_GET['page']  ?? 1));
    $limit  = min(50, intval($_GET['limit'] ?? 10));
    $kw     = trim($_GET['kw'] ?? '');
    $offset = ($page - 1) * $limit;

    $fkStmt = $pdo->prepare('SELECT field_key, label FROM custom_inquiry_fields WHERE form_id=? AND is_visible=1 ORDER BY sort_order ASC LIMIT 1');
    $fkStmt->execute([$formRow['id']]);
    $firstField = $fkStmt->fetch();
    $titleKey   = $firstField ? $firstField['field_key'] : 'title';

    $where  = ['d.form_id = ?'];
    $params = [$formRow['id']];

    if ($kw) {
        $where[] = "d.`{$titleKey}` LIKE ?";
        $params[] = "%{$kw}%";
    }

    // 조회 범위 결정
    // public  → visibility=1 전체 공개
    // private → 내 글만 (로그인 필수)
    // both    → visibility=1 공개글 전체 + 내 비공개글
    if ($visType === 'public') {
        $where[] = 'd.visibility = 1';
    } elseif ($visType === 'private') {
        if (!$loginUserId) { echo json_encode(['ok'=>false,'msg'=>'로그인이 필요합니다.']); exit; }
        $where[] = 'd.login_id = ?';
        $params[] = $loginUserId;
    } elseif ($visType === 'both') {
        if ($loginUserId) {
            // 공개글 전체 + 내 비공개글
            $where[] = '(d.visibility = 1 OR d.login_id = ?)';
            $params[] = $loginUserId;
        } else {
            // 비로그인 → 공개글만
            $where[] = 'd.visibility = 1';
        }
    }

    $whereSQL = implode(' AND ', $where);

    $totalStmt = $pdo->prepare("SELECT COUNT(*) FROM `{$table_name}` d WHERE {$whereSQL}");
    $totalStmt->execute($params);
    $total = (int)$totalStmt->fetchColumn();

    $stmt = $pdo->prepare(
        "SELECT d.id, d.`{$titleKey}` as title_val, d.login_id, d.created_at, d.visibility,
                s.label as status_label
         FROM `{$table_name}` d
         LEFT JOIN custom_inquiry_statuses s ON d.status_id = s.id
         WHERE {$whereSQL}
         ORDER BY d.id DESC LIMIT {$limit} OFFSET {$offset}"
    );
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $items = array_map(function($r) use ($loginUserId) {
        $isMine = $loginUserId && $r['login_id'] === $loginUserId;
        return [
            'id'          => (int)$r['id'],
            'title'       => mb_strimwidth($r['title_val'] ?? '', 0, 80, '...'),
            'author_name' => $r['login_id'] ? (function($id){
                $pm = ['kakao'=>'카카오','naver'=>'네이버','google'=>'구글','email'=>'이메일'];
                $sep = strpos($id, '_');
                if ($sep === false) return $id;
                $prov = substr($id, 0, $sep);
                $uid  = substr($id, $sep + 1);
                $masked = mb_strlen($uid) > 1 ? mb_substr($uid, 0, 1) . str_repeat('*', mb_strlen($uid) - 1) : $uid;
                return ($pm[$prov] ?? $prov) . ' ' . $masked;
            })($r['login_id']) : '익명',
            'status'      => $r['status_label'] ?? '접수',
            'created_at'  => $r['created_at'],
            'visibility'  => (int)$r['visibility'],
            'is_mine'     => $isMine,
        ];
    }, $rows);

    echo json_encode([
        'ok'    => true,
        'items' => $items,
        'total' => $total,
        'pages' => (int)ceil($total / $limit),
    ]);
    exit;
}

/* ================================================================
   단건 상세 조회
   GET ?action=detail&table_name=form_type2&id=1
   ================================================================ */
if ($action === 'detail') {
    $table_name = preg_replace('/[^a-z0-9_]/', '', strtolower(trim($_GET['table_name'] ?? '')));
    $id         = intval($_GET['id'] ?? 0);
    if (!$table_name || !$id) { echo json_encode(['ok'=>false,'msg'=>'파라미터 필요']); exit; }

    $form = $pdo->prepare('SELECT * FROM custom_inquiry_forms WHERE table_name=? AND is_active=1 LIMIT 1');
    $form->execute([$table_name]);
    $formRow = $form->fetch();
    if (!$formRow) { echo json_encode(['ok'=>false,'msg'=>'폼 없음']); exit; }

    if (session_status() === PHP_SESSION_NONE) session_start();
    $sessionUser = $_SESSION['board_user'] ?? null;
    $loginUserId = $sessionUser ? $sessionUser['id'] : '';
    $visType     = $formRow['visibility_type'] ?? '';

    $stmt = $pdo->prepare("SELECT d.*, s.label as status_label FROM `{$table_name}` d LEFT JOIN custom_inquiry_statuses s ON d.status_id=s.id WHERE d.id=?");
    $stmt->execute([$id]);
    $row = $stmt->fetch();
    if (!$row) { echo json_encode(['ok'=>false,'msg'=>'게시글 없음']); exit; }

    // 상세 조회 권한 판단
    $isMine    = $loginUserId && $row['login_id'] === $loginUserId;
    $isPublic  = (int)$row['visibility'] === 1;

    if ($visType === 'public') {
        // 공개글 전체 공개 → 누구나 조회 가능
    } elseif ($visType === 'private') {
        // 비공개 → 본인만
        if (!$loginUserId) { echo json_encode(['ok'=>false,'msg'=>'로그인이 필요합니다.']); exit; }
        if (!$isMine) { echo json_encode(['ok'=>false,'msg'=>'본인 글만 확인할 수 있습니다.']); exit; }
    } elseif ($visType === 'both') {
        // 공개글은 누구나, 비공개글은 본인만
        if (!$isPublic) {
            if (!$loginUserId) { echo json_encode(['ok'=>false,'msg'=>'로그인이 필요합니다.']); exit; }
            if (!$isMine) { echo json_encode(['ok'=>false,'msg'=>'본인 글만 확인할 수 있습니다.']); exit; }
        }
    } else {
        // visibility_type 없음 → 조회 불가
        echo json_encode(['ok'=>false,'msg'=>'조회 권한이 없습니다.']); exit;
    }

    // 필드 메타
    $fStmt = $pdo->prepare('SELECT * FROM custom_inquiry_fields WHERE form_id=? AND is_visible=1 ORDER BY sort_order ASC');
    $fStmt->execute([$formRow['id']]);
    $fields = $fStmt->fetchAll();

    // 관리자 답변
    $answers = [];
    $ansTable = 'ci_answers_' . $table_name;
    try {
        $aStmt = $pdo->prepare("SELECT * FROM `{$ansTable}` WHERE row_id=? ORDER BY id ASC");
        $aStmt->execute([$id]);
        $answers = $aStmt->fetchAll();
    } catch (Exception $e) {}

    // 댓글
    $comments = [];
    $comTable = 'ci_comments_' . $table_name;
    try {
        $cStmt = $pdo->prepare("SELECT * FROM `{$comTable}` WHERE row_id=? ORDER BY id ASC");
        $cStmt->execute([$id]);
        $comments = $cStmt->fetchAll();
    } catch (Exception $e) {}

    $row['is_mine']  = $isMine;
    $row['fields']   = $fields;
    $row['answers']  = $answers;
    $row['comments'] = $comments;

    try { $pdo->prepare("UPDATE `{$table_name}` SET view_count=view_count+1 WHERE id=?")->execute([$id]); } catch(Exception $e){}

    echo json_encode(['ok'=>true,'item'=>$row]);
    exit;
}

/* ================================================================
   댓글 등록
   POST ?action=comment_write
   body: { table_name, row_id, content }
   ================================================================ */
if ($action === 'comment_write') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $table_name = preg_replace('/[^a-z0-9_]/', '', strtolower(trim($input['table_name'] ?? '')));
    $row_id     = intval($input['row_id']  ?? 0);
    $content    = trim($input['content']   ?? '');
    if (!$table_name || !$row_id || !$content) { echo json_encode(['ok'=>false,'msg'=>'파라미터 필요']); exit; }

    if (session_status() === PHP_SESSION_NONE) session_start();
    $sessionUser = $_SESSION['board_user'] ?? null;
    if (!$sessionUser) { echo json_encode(['ok'=>false,'msg'=>'로그인 필요']); exit; }

    $comTable = 'ci_comments_' . $table_name;

    // 관리자 스키마와 통일된 테이블 생성
    $pdo->exec("CREATE TABLE IF NOT EXISTS `{$comTable}` (
        `id`          INT(11) NOT NULL AUTO_INCREMENT,
        `row_id`      INT(11) NOT NULL,
        `author`      VARCHAR(255) DEFAULT NULL,
        `author_id`   VARCHAR(255) DEFAULT NULL,
        `author_name` VARCHAR(100) DEFAULT NULL,
        `login_type`  VARCHAR(20) DEFAULT NULL,
        `is_admin`    TINYINT(1) NOT NULL DEFAULT 0,
        `content`     TEXT NOT NULL,
        `visibility`  TINYINT(1) DEFAULT 1,
        `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP,
        `updated_at`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`), KEY `idx_row_id` (`row_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // 기존 테이블 컬럼 누락 시 자동 추가
    $missingCols = [
        'author'      => 'VARCHAR(255) DEFAULT NULL',
        'author_id'   => 'VARCHAR(255) DEFAULT NULL',
        'author_name' => 'VARCHAR(100) DEFAULT NULL',
        'login_type'  => 'VARCHAR(20) DEFAULT NULL',
        'is_admin'    => 'TINYINT(1) NOT NULL DEFAULT 0',
        'visibility'  => 'TINYINT(1) DEFAULT 1',
    ];
    foreach ($missingCols as $col => $def) {
        try {
            $chk = $pdo->prepare("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name=? AND column_name=?");
            $chk->execute([$comTable, $col]);
            if (!$chk->fetchColumn()) {
                $pdo->exec("ALTER TABLE `{$comTable}` ADD COLUMN `{$col}` {$def}");
            }
        } catch (Exception $e) {}
    }

    $authorName = $sessionUser['name'] ?? $sessionUser['id'] ?? '익명';
    $authorId   = $sessionUser['id'] ?? '';
    $loginType  = $sessionUser['login_type'] ?? $sessionUser['provider'] ?? '';

    $pdo->prepare("INSERT INTO `{$comTable}` (row_id, author, author_id, author_name, login_type, is_admin, content) VALUES (?,?,?,?,?,0,?)")
        ->execute([$row_id, $authorName, $authorId, $authorName, $loginType, $content]);

    echo json_encode(['ok'=>true, 'id'=>(int)$pdo->lastInsertId()]);
    exit;
}

/* ================================================================
   댓글 삭제
   POST ?action=comment_delete
   body: { table_name, comment_id }
   ================================================================ */
if ($action === 'comment_delete') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $table_name = preg_replace('/[^a-z0-9_]/', '', strtolower(trim($input['table_name'] ?? '')));
    $cid        = intval($input['comment_id'] ?? 0);
    if (!$table_name || !$cid) { echo json_encode(['ok'=>false,'msg'=>'파라미터 필요']); exit; }

    if (session_status() === PHP_SESSION_NONE) session_start();
    $sessionUser = $_SESSION['board_user'] ?? null;
    if (!$sessionUser) { echo json_encode(['ok'=>false,'msg'=>'로그인 필요']); exit; }

    $comTable = 'ci_comments_' . $table_name;
    $chk = $pdo->prepare("SELECT author_id FROM `{$comTable}` WHERE id=?");
    $chk->execute([$cid]);
    $row = $chk->fetch();
    if (!$row || $row['author_id'] !== $sessionUser['id']) {
        echo json_encode(['ok'=>false,'msg'=>'권한 없음']); exit;
    }
    $pdo->prepare("DELETE FROM `{$comTable}` WHERE id=?")->execute([$cid]);
    echo json_encode(['ok'=>true]);
    exit;
}

/* ================================================================
   게시글 삭제
   POST ?action=delete_post
   body: { table_name, id }
   ================================================================ */
if ($action === 'delete_post') {
    $input = json_decode(file_get_contents('php://input'), true) ?: [];
    $table_name = preg_replace('/[^a-z0-9_]/', '', strtolower(trim($input['table_name'] ?? '')));
    $id         = intval($input['id'] ?? 0);
    if (!$table_name || !$id) { echo json_encode(['ok'=>false,'msg'=>'파라미터 필요']); exit; }

    if (session_status() === PHP_SESSION_NONE) session_start();
    $sessionUser = $_SESSION['board_user'] ?? null;
    if (!$sessionUser) { echo json_encode(['ok'=>false,'msg'=>'로그인 필요']); exit; }

    $chk = $pdo->prepare("SELECT login_id FROM `{$table_name}` WHERE id=?");
    $chk->execute([$id]);
    $row = $chk->fetch();
    if (!$row || $row['login_id'] !== $sessionUser['id']) {
        echo json_encode(['ok'=>false,'msg'=>'권한 없음']); exit;
    }
    $pdo->prepare("DELETE FROM `{$table_name}` WHERE id=?")->execute([$id]);
    echo json_encode(['ok'=>true]);
    exit;
}

echo json_encode(['ok'=>false,'msg'=>'Unknown action']);