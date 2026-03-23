<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>분양 사이트</title>
<meta name="description" content="분양 사이트 — 분양 안내, 매물 정보, 상담 및 예약">

<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Bebas+Neue&family=DM+Sans:wght@300;400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">

<link rel="stylesheet" href="https://plane01.gabia.io/style/main.min.css">

<style>
  :root {
  --bk:  #1a1209;
  --bk2: #2a1a0e;
  --br:  #6b4226;
  --br2: #8b5c34;
  --br3: #b8905a;
  --br4: #d4b896;
  --br5: #f0e6d3;
  --br6: #f9f4ed;
  --gold:  #c9a84c;
  --gold2: #e8c97a;
  --w:  #ffffff;
  --g1: #f7f3ee;
  --g2: #ede5d8;
  --g3: #c8b49a;
  --g4: #9a8878;
  --g5: #6b5e52;
  --g6: #3d3028;
  --ln: #e0d4c3;
  --ff: 'Pretendard', 'Noto Sans KR', sans-serif;
  --cont: 1260px;
  --hh:   72px;   /* 헤더 높이 */
  --sw:   40px;   /* 서비스 전환 바 높이 */
  --ease: cubic-bezier(.22, .68, 0, 1.2);
}
</style>
<link rel="stylesheet" href="build.css">

</head>
<body>

<?php include 'lib/build_hero.php'; ?>

<?php include 'lib/build_premium.php'; ?>

<?php include 'lib/build_property.php'; ?>

<?php include 'lib/build_complex.php'; ?>

<?php include 'lib/build_interior.php'; ?>

<?php include 'lib/build_faq.php'; ?>

<?php include 'lib/build_inquiry.php'; ?>

<?php include 'lib/build_interest.php'; ?>

<?php include 'lib/build_cta.php'; ?>

<div id="toast-area"></div>

<script>
function navTo(id) {
  var el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 16, behavior: 'smooth' });
}

function toast(msg) {
  var t = document.createElement('div'); t.className = 'toast-msg'; t.textContent = msg;
  document.getElementById('toast-area').appendChild(t);
  requestAnimationFrame(function(){ t.classList.add('show'); });
  setTimeout(function(){ t.classList.remove('show'); setTimeout(function(){ t.remove(); }, 400); }, 2800);
}

function showRes(el, msg, isErr) {
  if (!el) return;
  el.textContent = msg;
  el.classList.toggle('err', isErr);
  el.classList.add('show');
  el.scrollIntoView({ behavior:'smooth', block:'nearest' });
  if (!isErr) setTimeout(function(){ el.classList.remove('show'); }, 6000);
}
</script>

</body>
</html>
