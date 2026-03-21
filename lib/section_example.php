<?php
/**
 * 동적 섹션 예시 파일 (참고용)
 *
 * 실제 파일은 lib/ 폴더에 생성하세요.
 * 예: lib/section_event_banner.php
 *
 * 사용 가능 변수 ($sectionTitle, $sectionSubtitle):
 *   관리자 > 섹션관리 > 동적 섹션에서 입력한 값이 전달됩니다.
 *
 * 제목/서브제목 스타일은 기존 섹션과 동일한 클래스를 사용하세요:
 *   <div class="s-tag"><span>태그</span></div>
 *   <h2 class="s-h">제목</h2>
 *   <p class="s-p">서브제목</p>
 */
?>
<section class="sw" style="background:var(--off);">
  <div class="inner">
    <?php if (!empty($sectionTitle)): ?>
    <h2 class="s-h"><?= htmlspecialchars($sectionTitle) ?></h2>
    <?php endif; ?>
    <?php if (!empty($sectionSubtitle)): ?>
    <p class="s-p"><?= htmlspecialchars($sectionSubtitle) ?></p>
    <?php endif; ?>
    <p style="text-align:center;color:#aaa;padding:40px 0;">
      여기에 섹션 내용을 추가하세요.
    </p>
  </div>
</section>
