<?php
require_once __DIR__ . '/../admin/config/db.php';
require_once __DIR__ . '/../admin/config/log_helper.php';
$pdo  = getDB();
logAccess($pdo);
logLanding($pdo);
$site = $pdo->query("SELECT title, description, og_image, favicon, header_logo FROM homepage_info WHERE id=1")->fetch(PDO::FETCH_ASSOC);
$script = $pdo->query('SELECT head_code, body_code FROM scripts WHERE id = 1')->fetch();
?>
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title><?= htmlspecialchars($site['title'] ?? 'PureBlue — 프리미엄 정수기 렌탈') ?></title>
<meta name="description" content="<?= htmlspecialchars($site['description'] ?? '') ?>">

<!-- 파비콘 -->
<?php if (!empty($site['favicon'])): ?>
<link rel="icon" href="<?= htmlspecialchars($site['favicon']) ?>">
<link rel="shortcut icon" href="<?= htmlspecialchars($site['favicon']) ?>">
<?php else: ?>
<link rel="icon" href="./img/favicon.ico">
<?php endif; ?>

<!-- OG 태그 -->
<meta property="og:title" content="<?= htmlspecialchars($site['title'] ?? 'PureBlue — 프리미엄 정수기 렌탈') ?>">
<meta property="og:description" content="<?= htmlspecialchars($site['description'] ?? '') ?>">
<?php if (!empty($site['og_image'])): ?>
<meta property="og:image" content="<?= htmlspecialchars($site['og_image']) ?>">
<?php endif; ?>
<meta property="og:type" content="website">

<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Bebas+Neue&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
<link href="css/reset.css" rel="stylesheet">
<link href="css/main.css" rel="stylesheet">
<link href="css/customReser_public.css" rel="stylesheet">
<link href="css/rvmReser_public.css" rel="stylesheet">
<link rel="stylesheet" href="css/custom_inquiry_front.css">

<script>if(history.scrollRestoration){history.scrollRestoration="manual";}window.scrollTo(0,0);</script>

<?php if (!empty($script['head_code'])) echo $script['head_code']; ?>
</head>