<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>PureBlue — 프리미엄 정수기 렌탈</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Bebas+Neue&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">

<link href="css/reset.css" rel="stylesheet">
<link href="css/main.css" rel="stylesheet">

<script>if(history.scrollRestoration){history.scrollRestoration="manual";}window.scrollTo(0,0);</script>

<?php
require_once __DIR__ . '/../admin/config/db.php';
$pdo = getDB();
$script = $pdo->query('SELECT head_code, body_code FROM scripts WHERE id = 1')->fetch();
if (!empty($script['head_code'])) echo $script['head_code'];
?>
</head>