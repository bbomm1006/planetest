<?php
/**
 * bkf_front.php
 * 예약 폼 프론트 UI (위자드 방식)
 *
 * 사용법 (index.php 원하는 위치에):
 *   <?php $bkf_slug = 'your_slug'; include __DIR__ . '/lib/bkf_front.php'; ?>
 *
 * $bkf_slug 미설정 시 아무것도 출력하지 않음
 */

if (empty($bkf_slug)) return;

$bkf_slug_safe = preg_replace('/[^a-z0-9_]/', '', strtolower(trim($bkf_slug)));
if (!$bkf_slug_safe) return;

// DB에서 폼 활성화 여부 확인
try {
    $bkf_stmt = $pdo->prepare('SELECT id, is_active FROM bkf_forms WHERE slug = ? LIMIT 1');
    $bkf_stmt->execute([$bkf_slug_safe]);
    $bkf_form_row = $bkf_stmt->fetch();
    if (!$bkf_form_row || (int)$bkf_form_row['is_active'] !== 1) return;
} catch (Exception $e) {
    return;
}

// 고유 ID용 접미사 (같은 페이지에 여러 폼 포함 시 충돌 방지)
$s = $bkf_slug_safe;
?>

<section class="bkf-section" id="bkf-section-<?= $s ?>">
  <div class="bkf-wrap">

    <!-- 로딩 -->
    <div class="bkf-loading" id="bkf-loading-<?= $s ?>">
      <div class="bkf-spinner"></div>
      <span>불러오는 중...</span>
    </div>

    <!-- ────────────────────────────
         뷰 A: 예약 위자드
    ──────────────────────────────── -->
    <div class="bkf-view" id="bkf-view-wizard-<?= $s ?>">

      <!-- 섹션 헤더 -->
      <div class="bkf-head">
        <div class="s-tag"><span id="bkf-tag-<?= $s ?>">RESERVATION</span></div>
        <h2 class="s-h" id="bkf-title-<?= $s ?>"></h2>
        <p class="s-p" id="bkf-desc-<?= $s ?>" style="display:none;"></p>
      </div>

      <!-- 진행 스텝 바 -->
      <div class="bkf-progress" id="bkf-progress-<?= $s ?>"></div>

      <!-- 스텝 콘텐츠 -->
      <div class="bkf-step-wrap" id="bkf-step-wrap-<?= $s ?>"></div>

      <!-- 이전/다음 버튼 -->
      <div class="bkf-nav" id="bkf-nav-<?= $s ?>">
        <button class="bkf-btn-back" id="bkf-btn-back-<?= $s ?>"
                onclick="bkfPrevStep('<?= $s ?>')">← 이전</button>
        <button class="bkf-btn-next" id="bkf-btn-next-<?= $s ?>"
                onclick="bkfNextStep('<?= $s ?>')">다음 →</button>
        <button class="bkf-btn-submit" id="bkf-btn-submit-<?= $s ?>"
                style="display:none;"
                onclick="bkfSubmit('<?= $s ?>')">예약하기</button>
      </div>

      <!-- 에러 메시지 -->
      <div class="bkf-error" id="bkf-error-<?= $s ?>" style="display:none;"></div>
    </div>

    <!-- ────────────────────────────
         뷰 B: 예약 완료
    ──────────────────────────────── -->
    <div class="bkf-view" id="bkf-view-done-<?= $s ?>">
      <div class="bkf-done-box">
        <div class="s-tag"><span>RESERVATION</span></div>
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg"
             style="width:72px;height:72px;margin-bottom:20px;">
          <circle cx="40" cy="40" r="38" fill="#dcfce7" stroke="#86efac" stroke-width="2"/>
          <path d="M24 40l12 12 20-24" stroke="#16a34a" stroke-width="3.5"
                stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h2 class="s-h">예약이 접수되었습니다!</h2>
        <p class="bkf-done-sub" id="bkf-done-sub-<?= $s ?>"></p>
        <div class="bkf-done-no" id="bkf-done-no-<?= $s ?>"></div>
        <div class="bkf-done-btns">
          <button class="bkf-btn-outline"
                  onclick="bkfShowView('<?= $s ?>','lookup')">예약 조회</button>
          <button class="bkf-btn-primary"
                  onclick="bkfRestart('<?= $s ?>')">새 예약</button>
        </div>
      </div>
    </div>

    <!-- ────────────────────────────
         뷰 C: 예약 조회
    ──────────────────────────────── -->
    <div class="bkf-view" id="bkf-view-lookup-<?= $s ?>">
      <div class="bkf-lookup-box">
        <div class="bkf-head">
          <div class="s-tag"><span>RESERVATION</span></div>
          <h2 class="s-h">예약 조회</h2>
          <p class="s-p">이름 + 전화번호 또는 예약번호로 조회하세요.</p>
        </div>

        <!-- 탭 -->
        <div class="bkf-lookup-tabs">
          <button class="bkf-lookup-tab active"
                  onclick="bkfSwitchLookupTab('<?= $s ?>','phone',this)">이름 + 전화번호</button>
          <button class="bkf-lookup-tab"
                  onclick="bkfSwitchLookupTab('<?= $s ?>','no',this)">예약번호</button>
        </div>

        <!-- 이름 + 전화번호 조회 -->
        <div class="bkf-lookup-panel" id="bkf-lookup-phone-<?= $s ?>">
          <div class="bkf-fg">
            <label class="bkf-label">이름</label>
            <input type="text" class="bkf-fi" id="bkf-lookup-name-<?= $s ?>" placeholder="예약 시 입력한 이름"/>
          </div>
          <div class="bkf-fg">
            <label class="bkf-label">전화번호</label>
            <div class="bkf-phone-row">
              <input type="tel" class="bkf-fi" id="bkf-lookup-phone-<?= $s ?>"
                     placeholder="010-0000-0000" inputmode="numeric"
                     onkeydown="if(event.key==='Enter') bkfDoLookup('<?= $s ?>','phone')"/>
              <!-- 번호인증 버튼 (phone_verify_use=1 일 때만 JS로 표시) -->
              <button class="bkf-btn-verify" id="bkf-lookup-verify-btn-<?= $s ?>"
                      style="display:none;"
                      onclick="bkfSendOtp('<?= $s ?>','lookup')">인증</button>
            </div>
          </div>
          <!-- OTP 입력 (번호인증 사용 폼) -->
          <div class="bkf-otp-wrap" id="bkf-lookup-otp-<?= $s ?>" style="display:none;">
            <div class="bkf-fg">
              <label class="bkf-label">인증번호</label>
              <div class="bkf-phone-row">
                <input type="text" class="bkf-fi" id="bkf-lookup-otp-code-<?= $s ?>"
                       placeholder="6자리 입력" maxlength="6" inputmode="numeric"
                       style="letter-spacing:4px;font-weight:700;"/>
                <button class="bkf-btn-verify"
                        onclick="bkfVerifyOtp('<?= $s ?>','lookup')">확인</button>
              </div>
              <p class="bkf-otp-timer" id="bkf-lookup-otp-timer-<?= $s ?>"></p>
            </div>
          </div>
          <button class="bkf-btn-primary" style="width:100%;margin-top:8px;"
                  onclick="bkfDoLookup('<?= $s ?>','phone')">조회하기</button>
        </div>

        <!-- 예약번호 조회 -->
        <div class="bkf-lookup-panel" id="bkf-lookup-no-<?= $s ?>" style="display:none;">
          <div class="bkf-fg">
            <label class="bkf-label">예약번호</label>
            <input type="text" class="bkf-fi" id="bkf-lookup-no-input-<?= $s ?>"
                   placeholder="예: B250101ABCD12" style="letter-spacing:1px;"
                   onkeydown="if(event.key==='Enter') bkfDoLookup('<?= $s ?>','no')"/>
          </div>
          <button class="bkf-btn-primary" style="width:100%;margin-top:8px;"
                  onclick="bkfDoLookup('<?= $s ?>','no')">조회하기</button>
        </div>

        <!-- 조회 에러 -->
        <div class="bkf-error" id="bkf-lookup-err-<?= $s ?>" style="display:none;margin-top:12px;"></div>

        <!-- 조회 결과 -->
        <div id="bkf-lookup-result-<?= $s ?>" style="margin-top:20px;"></div>

        <!-- 예약하기로 돌아가기 -->
        <div style="text-align:center;margin-top:16px;">
          <button class="bkf-btn-text"
                  onclick="bkfRestart('<?= $s ?>')">← 새로 예약하기</button>
        </div>
      </div>
    </div><!-- /view-lookup -->

  </div><!-- /.bkf-wrap -->

  <!-- 예약 조회 링크 (위자드 하단 고정) -->
  <div class="bkf-lookup-link" id="bkf-lookup-link-<?= $s ?>">
    <button class="bkf-btn-text"
            onclick="bkfGoToLookup('<?= $s ?>')">이미 예약하셨나요? 예약 조회 →</button>
  </div>

</section>

<!-- 이 폼 전용 JS 초기화 (slug 전달) -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  if (typeof bkfInit === 'function') bkfInit('<?= $s ?>');
});
</script>

<?php unset($bkf_slug, $bkf_slug_safe, $bkf_stmt, $bkf_form_row, $s); ?>
