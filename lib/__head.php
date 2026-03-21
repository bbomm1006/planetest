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

<link rel="stylesheet" href="css/custom_inquiry_front.css">

<script>if(history.scrollRestoration){history.scrollRestoration="manual";}window.scrollTo(0,0);</script>

<?php
// 관리자에서 저장한 대표 컬러를 :root 변수로 주입 (없으면 CSS 기본값 사용)
try {
    $colorRow = $pdo->query("SELECT color_base, color_point, color_sub FROM homepage_info WHERE id=1")->fetch(PDO::FETCH_ASSOC);
    $cvars = [];
    $colorMap = [
        'color_base'  => '--color-base',
        'color_point' => '--color-point',
        'color_sub'   => '--color-sub',
    ];
    foreach ($colorMap as $col => $var) {
        $v = trim($colorRow[$col] ?? '');
        if (preg_match('/^#[0-9a-fA-F]{3,8}$/', $v)) {
            $cvars[] = $var . ':' . $v;
        }
    }
    if ($cvars) echo '<style>:root{' . implode(';', $cvars) . '}</style>' . "\n";
} catch (Exception $e) { /* 컬럼 미생성 시 CSS 기본값으로 동작 */ }
?>

<?php if (!empty($script['head_code'])) echo $script['head_code']; ?>
</head>