<?php
/**
 * $legalSlug — index.php 에서 전달 (영문 슬러그)
 * $pdo
 */
require_once __DIR__ . '/legal_terms_bootstrap.php';

legal_terms_ensure_tables($pdo);

$slug = preg_replace('/[^a-zA-Z0-9\-_]/', '', (string) $legalSlug);
$st   = $pdo->prepare('SELECT id, name, slug FROM legal_term_categories WHERE slug = ? LIMIT 1');
$st->execute([$slug]);
$cat = $st->fetch(PDO::FETCH_ASSOC);

if (!$cat) {
    echo '<div class="legal-page-inner"><p class="legal-page-empty">요청하신 약관을 찾을 수 없습니다.</p></div>';
    return;
}

$st = $pdo->prepare(
    'SELECT id, version_label, body, is_active, effective_date,
            DATE_FORMAT(effective_date, "%Y-%m-%d") AS eff
     FROM legal_term_versions WHERE category_id = ?
     ORDER BY effective_date DESC, sort_order DESC, id DESC'
);
$st->execute([(int) $cat['id']]);
$rows = $st->fetchAll(PDO::FETCH_ASSOC);

$versionsJs = [];
foreach ($rows as $r) {
    $versionsJs[] = [
        'id'             => (int) $r['id'],
        'version_label'  => $r['version_label'],
        'effective_date' => $r['eff'] ?: ($r['effective_date'] ? substr($r['effective_date'], 0, 10) : ''),
        'is_active'      => (int) $r['is_active'],
        'body'           => $r['body'],
    ];
}

$defaultId = 0;
foreach ($versionsJs as $v) {
    if ($v['is_active'] === 1) {
        $defaultId = $v['id'];
        break;
    }
}
if ($defaultId === 0 && count($versionsJs)) {
    $defaultId = $versionsJs[0]['id'];
}
?>
<div class="legal-page-inner">
  <div class="legal-page-head">
    <a class="legal-page-back" href="./index.php">← 홈으로</a>
    <h1 class="legal-page-title"><?= htmlspecialchars($cat['name']) ?></h1>
    <?php if (count($versionsJs) > 1): ?>
    <div class="legal-page-version-row">
      <label for="legalVersionSelect">버전</label>
      <select id="legalVersionSelect" class="form-select legal-version-select" aria-label="약관 버전 선택">
        <?php foreach ($versionsJs as $v): ?>
          <option value="<?= (int) $v['id'] ?>" <?= $v['id'] === $defaultId ? 'selected' : '' ?>>
            <?= htmlspecialchars($v['version_label']) ?>
            <?= $v['is_active'] ? ' (사용 중)' : '' ?>
          </option>
        <?php endforeach; ?>
      </select>
    </div>
    <?php endif; ?>
    <p class="legal-page-meta" id="legalPageMeta"></p>
  </div>
  <div class="legal-page-body" id="legalPageBody"></div>
</div>
<script>
(function(){
  var versions = <?= json_encode($versionsJs, JSON_UNESCAPED_UNICODE) ?>;
  var sel = document.getElementById('legalVersionSelect');
  var meta = document.getElementById('legalPageMeta');
  var body = document.getElementById('legalPageBody');
  if (!body) return;

  function esc(s){
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function nl2br(t){
    return esc(t).replace(/\n/g,'<br>');
  }
  function show(id){
    var v = versions.find(function(x){ return String(x.id) === String(id); });
    if (!v) { body.innerHTML = '<p class="legal-page-empty">등록된 약관 본문이 없습니다.</p>'; if(meta) meta.textContent=''; return; }
    if (meta) {
      var parts = [];
      if (v.effective_date) parts.push('시행일: ' + v.effective_date);
      if (v.is_active) parts.push('현재 사용 중인 버전');
      meta.textContent = parts.join(' · ');
    }
    body.innerHTML = '<div class="legal-page-prose">' + nl2br(v.body) + '</div>';
  }
  var initial = <?= (int) $defaultId ?>;
  if (sel) {
    sel.addEventListener('change', function(){ show(this.value); });
    initial = parseInt(sel.value, 10) || initial;
  }
  show(initial || (versions[0] && versions[0].id));
})();
</script>
