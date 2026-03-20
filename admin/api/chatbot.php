<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';
header('Content-Type: application/json; charset=utf-8');
set_error_handler(function($no,$str,$file,$line){ echo json_encode(['ok'=>false,'msg'=>"PHP[$no]:$str $file:$line"]); exit; });
set_exception_handler(function($e){ echo json_encode(['ok'=>false,'msg'=>$e->getMessage()]); exit; });
requireLogin();

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$pdo = getDB();

/* ══════════════════════════════════════════
   KB (지식베이스)
══════════════════════════════════════════ */
if ($action === 'kbList') {
    $rows = $pdo->query("SELECT id, keywords, answer, follow_text, follow_context, is_active, sort_order, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i') AS created_at FROM chatbot_kb ORDER BY sort_order ASC, id ASC")->fetchAll();
    echo json_encode(['ok'=>true,'data'=>$rows]); exit;
}
if ($action === 'kbSave') {
    $id           = (int)($_POST['id'] ?? 0);
    $keywords     = trim($_POST['keywords'] ?? '');
    $answer       = trim($_POST['answer'] ?? '');
    $follow_text  = trim($_POST['follow_text'] ?? '');
    $follow_context = trim($_POST['follow_context'] ?? '');
    if (!$keywords || !$answer) { echo json_encode(['ok'=>false,'msg'=>'키워드와 답변은 필수입니다.']); exit; }
    if ($id > 0) {
        $pdo->prepare("UPDATE chatbot_kb SET keywords=?, answer=?, follow_text=?, follow_context=? WHERE id=?")
            ->execute([$keywords, $answer, $follow_text ?: null, $follow_context ?: null, $id]);
    } else {
        $max = (int)$pdo->query("SELECT COALESCE(MAX(sort_order),0) FROM chatbot_kb")->fetchColumn();
        $pdo->prepare("INSERT INTO chatbot_kb (keywords, answer, follow_text, follow_context, sort_order) VALUES (?,?,?,?,?)")
            ->execute([$keywords, $answer, $follow_text ?: null, $follow_context ?: null, $max + 1]);
        $id = (int)$pdo->lastInsertId();
    }
    echo json_encode(['ok'=>true,'id'=>$id]); exit;
}
if ($action === 'kbToggle') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare("UPDATE chatbot_kb SET is_active = 1 - is_active WHERE id=?")->execute([$id]);
    $st = $pdo->prepare("SELECT is_active FROM chatbot_kb WHERE id=?"); $st->execute([$id]);
    echo json_encode(['ok'=>true,'is_active'=>(int)$st->fetchColumn()]); exit;
}
if ($action === 'kbDelete') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare("DELETE FROM chatbot_kb WHERE id=?")->execute([$id]);
    echo json_encode(['ok'=>true]); exit;
}
if ($action === 'kbBulkDelete') {
    $ids = json_decode($_POST['ids'] ?? '[]', true) ?: [];
    $st  = $pdo->prepare("DELETE FROM chatbot_kb WHERE id=?");
    foreach ($ids as $id) $st->execute([(int)$id]);
    echo json_encode(['ok'=>true]); exit;
}
if ($action === 'kbReorder') {
    $ids = json_decode($_POST['ids'] ?? '[]', true) ?: [];
    $st  = $pdo->prepare("UPDATE chatbot_kb SET sort_order=? WHERE id=?");
    foreach ($ids as $i => $id) $st->execute([$i + 1, (int)$id]);
    echo json_encode(['ok'=>true]); exit;
}

/* ══════════════════════════════════════════
   Context (후속질문 분기)
══════════════════════════════════════════ */
if ($action === 'ctxList') {
    $rows = $pdo->query("SELECT id, context_key, keywords, answer, fallback, is_active, sort_order, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i') AS created_at FROM chatbot_context ORDER BY context_key, sort_order ASC, id ASC")->fetchAll();
    echo json_encode(['ok'=>true,'data'=>$rows]); exit;
}
if ($action === 'ctxSave') {
    $id          = (int)($_POST['id'] ?? 0);
    $context_key = trim($_POST['context_key'] ?? '');
    $keywords    = trim($_POST['keywords'] ?? '');
    $answer      = trim($_POST['answer'] ?? '');
    $fallback    = trim($_POST['fallback'] ?? '');
    if (!$context_key || !$keywords || !$answer) { echo json_encode(['ok'=>false,'msg'=>'context_key, 키워드, 답변은 필수입니다.']); exit; }
    if ($id > 0) {
        $pdo->prepare("UPDATE chatbot_context SET context_key=?, keywords=?, answer=?, fallback=? WHERE id=?")
            ->execute([$context_key, $keywords, $answer, $fallback ?: null, $id]);
    } else {
        $max = (int)$pdo->query("SELECT COALESCE(MAX(sort_order),0) FROM chatbot_context")->fetchColumn();
        $pdo->prepare("INSERT INTO chatbot_context (context_key, keywords, answer, fallback, sort_order) VALUES (?,?,?,?,?)")
            ->execute([$context_key, $keywords, $answer, $fallback ?: null, $max + 1]);
        $id = (int)$pdo->lastInsertId();
    }
    echo json_encode(['ok'=>true,'id'=>$id]); exit;
}
if ($action === 'ctxToggle') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare("UPDATE chatbot_context SET is_active = 1 - is_active WHERE id=?")->execute([$id]);
    $st = $pdo->prepare("SELECT is_active FROM chatbot_context WHERE id=?"); $st->execute([$id]);
    echo json_encode(['ok'=>true,'is_active'=>(int)$st->fetchColumn()]); exit;
}
if ($action === 'ctxDelete') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare("DELETE FROM chatbot_context WHERE id=?")->execute([$id]);
    echo json_encode(['ok'=>true]); exit;
}
if ($action === 'ctxBulkDelete') {
    $ids = json_decode($_POST['ids'] ?? '[]', true) ?: [];
    $st  = $pdo->prepare("DELETE FROM chatbot_context WHERE id=?");
    foreach ($ids as $id) $st->execute([(int)$id]);
    echo json_encode(['ok'=>true]); exit;
}

/* ══════════════════════════════════════════
   Quick (빠른질문 버튼)
══════════════════════════════════════════ */
if ($action === 'quickList') {
    $rows = $pdo->query("SELECT id, label, question_text, context_key, is_active, sort_order, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i') AS created_at FROM chatbot_quick ORDER BY sort_order ASC, id ASC")->fetchAll();
    echo json_encode(['ok'=>true,'data'=>$rows]); exit;
}
if ($action === 'quickSave') {
    $id            = (int)($_POST['id'] ?? 0);
    $label         = trim($_POST['label'] ?? '');
    $question_text = trim($_POST['question_text'] ?? '');
    $context_key   = trim($_POST['context_key'] ?? '');
    if (!$label || !$question_text) { echo json_encode(['ok'=>false,'msg'=>'버튼 라벨과 질문 텍스트는 필수입니다.']); exit; }
    if ($id > 0) {
        $pdo->prepare("UPDATE chatbot_quick SET label=?, question_text=?, context_key=? WHERE id=?")
            ->execute([$label, $question_text, $context_key ?: null, $id]);
    } else {
        $max = (int)$pdo->query("SELECT COALESCE(MAX(sort_order),0) FROM chatbot_quick")->fetchColumn();
        $pdo->prepare("INSERT INTO chatbot_quick (label, question_text, context_key, sort_order) VALUES (?,?,?,?)")
            ->execute([$label, $question_text, $context_key ?: null, $max + 1]);
        $id = (int)$pdo->lastInsertId();
    }
    echo json_encode(['ok'=>true,'id'=>$id]); exit;
}
if ($action === 'quickToggle') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare("UPDATE chatbot_quick SET is_active = 1 - is_active WHERE id=?")->execute([$id]);
    $st = $pdo->prepare("SELECT is_active FROM chatbot_quick WHERE id=?"); $st->execute([$id]);
    echo json_encode(['ok'=>true,'is_active'=>(int)$st->fetchColumn()]); exit;
}
if ($action === 'quickDelete') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare("DELETE FROM chatbot_quick WHERE id=?")->execute([$id]);
    echo json_encode(['ok'=>true]); exit;
}
if ($action === 'quickBulkDelete') {
    $ids = json_decode($_POST['ids'] ?? '[]', true) ?: [];
    $st  = $pdo->prepare("DELETE FROM chatbot_quick WHERE id=?");
    foreach ($ids as $id) $st->execute([(int)$id]);
    echo json_encode(['ok'=>true]); exit;
}
if ($action === 'quickReorder') {
    $ids = json_decode($_POST['ids'] ?? '[]', true) ?: [];
    $st  = $pdo->prepare("UPDATE chatbot_quick SET sort_order=? WHERE id=?");
    foreach ($ids as $i => $id) $st->execute([$i + 1, (int)$id]);
    echo json_encode(['ok'=>true]); exit;
}

/* ══════════════════════════════════════════
   Default (기본 답변)
══════════════════════════════════════════ */
if ($action === 'defList') {
    $rows = $pdo->query("SELECT id, answer, is_active, sort_order, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i') AS created_at FROM chatbot_default ORDER BY sort_order ASC, id ASC")->fetchAll();
    echo json_encode(['ok'=>true,'data'=>$rows]); exit;
}
if ($action === 'defSave') {
    $id     = (int)($_POST['id'] ?? 0);
    $answer = trim($_POST['answer'] ?? '');
    if (!$answer) { echo json_encode(['ok'=>false,'msg'=>'답변을 입력하세요.']); exit; }
    if ($id > 0) {
        $pdo->prepare("UPDATE chatbot_default SET answer=? WHERE id=?")->execute([$answer, $id]);
    } else {
        $max = (int)$pdo->query("SELECT COALESCE(MAX(sort_order),0) FROM chatbot_default")->fetchColumn();
        $pdo->prepare("INSERT INTO chatbot_default (answer, sort_order) VALUES (?,?)")->execute([$answer, $max + 1]);
        $id = (int)$pdo->lastInsertId();
    }
    echo json_encode(['ok'=>true,'id'=>$id]); exit;
}
if ($action === 'defToggle') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare("UPDATE chatbot_default SET is_active = 1 - is_active WHERE id=?")->execute([$id]);
    $st = $pdo->prepare("SELECT is_active FROM chatbot_default WHERE id=?"); $st->execute([$id]);
    echo json_encode(['ok'=>true,'is_active'=>(int)$st->fetchColumn()]); exit;
}
if ($action === 'defDelete') {
    $id = (int)($_POST['id'] ?? 0);
    $pdo->prepare("DELETE FROM chatbot_default WHERE id=?")->execute([$id]);
    echo json_encode(['ok'=>true]); exit;
}

/* ══════════════════════════════════════════
   Config (봇 설정)
══════════════════════════════════════════ */
if ($action === 'configLoad') {
    $rows = $pdo->query("SELECT config_key, config_value FROM chatbot_config ORDER BY sort_order ASC")->fetchAll();
    $cfg  = [];
    foreach ($rows as $r) $cfg[$r['config_key']] = $r['config_value'];
    echo json_encode(['ok'=>true,'data'=>$cfg]); exit;
}
if ($action === 'configSave') {
    $fields = ['bot_name','bot_status','welcome_message','greeting_morning','greeting_afternoon','greeting_evening','footer_note','default_fallback','error_message','phone_number'];
    $st = $pdo->prepare("UPDATE chatbot_config SET config_value=? WHERE config_key=?");
    foreach ($fields as $key) {
        $val = trim($_POST[$key] ?? '');
        if ($val !== '') $st->execute([$val, $key]);
    }
    echo json_encode(['ok'=>true]); exit;
}

echo json_encode(['ok'=>false,'msg'=>'Unknown action']);
