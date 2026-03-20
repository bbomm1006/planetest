<?php
/**
 * custom_inquiry_front.php
 * 사용자 문의폼 프론트 UI
 *
 * 사용법 (index.php 원하는 위치에):
 *   <?php $ci_table = 'your_table_name'; include __DIR__ . '/lib/custom_inquiry_front.php'; ?>
 *
 * $ci_table 미설정 시 아무것도 출력하지 않음
 */

if (empty($ci_table)) return;

// table_name 안전 처리
$ci_table_safe = preg_replace('/[^a-z0-9_]/', '', strtolower(trim($ci_table)));
if (!$ci_table_safe) return;

// DB에서 폼 활성화 여부 확인 — 미사용이면 아무것도 출력 안 함
try {
    $ci_stmt = $pdo->prepare('SELECT is_active FROM custom_inquiry_forms WHERE table_name = ? LIMIT 1');
    $ci_stmt->execute([$ci_table_safe]);
    $ci_form_row = $ci_stmt->fetch();
    if (!$ci_form_row || (int)$ci_form_row['is_active'] !== 1) return;
} catch (Exception $e) {
    return;
}
?>

<div class="ci-section" id="ci-section-<?= htmlspecialchars($ci_table_safe) ?>">
  <div class="inner">

    <!-- 로딩 -->
    <div class="ci-loading" id="ci-loading-<?= $ci_table_safe ?>">
      <div class="ci-spinner"></div>
      <span>불러오는 중...</span>
    </div>

    <!-- 소셜 로그인 모달 (login_use=1 일 때만 표시) -->
    <div class="ci-modal-overlay" id="ci-login-modal-overlay-<?= $ci_table_safe ?>" style="display:none;" onclick="ciCloseLoginModal('<?= $ci_table_safe ?>')"></div>
    <div class="ci-modal" id="ci-login-gate-<?= $ci_table_safe ?>" style="display:none;">
      <button class="ci-modal-close" onclick="ciCloseLoginModal('<?= $ci_table_safe ?>')" aria-label="닫기">×</button>
      <div class="ci-login-gate-title">로그인이 필요합니다</div>
      <div class="ci-login-gate-desc" id="ci-login-gate-desc-<?= $ci_table_safe ?>"></div>
      <div class="ci-social-btns" id="ci-social-btns-<?= $ci_table_safe ?>"></div>

      <!-- 이메일 인증번호 로그인 폼 -->
      <div id="ci-email-otp-<?= $ci_table_safe ?>" style="display:none;margin-top:16px;">
        <div class="fg" style="margin-bottom:10px;">
          <label class="fl">이메일</label>
          <div style="display:flex;gap:8px;">
            <input type="email" class="fi" id="ci-otp-email-<?= $ci_table_safe ?>" placeholder="이메일 주소" style="flex:1;">
            <button class="f-sub" style="width:auto;padding:0 16px;white-space:nowrap;" id="ci-otp-send-btn-<?= $ci_table_safe ?>" onclick="ciSendOtp('<?= $ci_table_safe ?>')">인증번호 발송</button>
          </div>
        </div>
        <div class="fg" id="ci-otp-code-wrap-<?= $ci_table_safe ?>" style="display:none;margin-bottom:14px;">
          <label class="fl">인증번호</label>
          <div style="display:flex;gap:8px;">
            <input type="text" class="fi" id="ci-otp-code-<?= $ci_table_safe ?>" placeholder="6자리 입력" maxlength="6" inputmode="numeric" style="flex:1;letter-spacing:4px;font-weight:700;">
            <button class="f-sub" style="width:auto;padding:0 16px;white-space:nowrap;" onclick="ciVerifyOtp('<?= $ci_table_safe ?>')">확인</button>
          </div>
          <p id="ci-otp-timer-<?= $ci_table_safe ?>" style="font-size:.78rem;color:#e53e3e;margin-top:4px;"></p>
        </div>
        <div id="ci-otp-err-<?= $ci_table_safe ?>" class="ci-error" style="display:none;"></div>
      </div>

    </div>

    <!-- 완료 모달 -->
    <div class="ci-modal-overlay" id="ci-ok-modal-overlay-<?= $ci_table_safe ?>" style="display:none;"></div>
    <div class="ci-modal ci-ok-modal" id="ci-ok-modal-<?= $ci_table_safe ?>" style="display:none;">
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:72px;height:72px;margin-bottom:16px;">
        <circle cx="40" cy="40" r="38" fill="#dcfce7" stroke="#86efac" stroke-width="2"/>
        <path d="M24 40l12 12 20-24" stroke="#16a34a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <h3 style="margin:0 0 8px;font-size:1.2rem;">접수되었습니다!</h3>
      <p style="margin:0 0 12px;color:var(--g4,#666);font-size:.9rem;">궁금한 점을 자유롭게 문의해 주세요. 빠르게 답변드립니다.</p>
      <div class="ci-submit-ok-email-note" id="ci-ok-modal-email-note-<?= $ci_table_safe ?>" style="display:none;margin-bottom:16px;">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;vertical-align:middle;margin-right:4px;">
          <path d="M3 8l9 6 9-6"/><rect x="3" y="6" width="18" height="12" rx="2"/>
        </svg>
        접수 확인 메일을 발송했습니다
      </div>
      <button class="f-sub" style="max-width:200px;" onclick="ciCloseOkModal('<?= $ci_table_safe ?>')">확인</button>
    </div>

    <!-- 기간 외 안내 -->
    <div class="ci-notice" id="ci-period-notice-<?= $ci_table_safe ?>" style="display:none;">
      <div class="ci-notice-icon">📅</div>
      <div class="ci-notice-title" id="ci-period-notice-title-<?= $ci_table_safe ?>">접수 기간이 아닙니다</div>
      <div class="ci-notice-desc" id="ci-period-notice-desc-<?= $ci_table_safe ?>"></div>
    </div>

    <!-- ────────────────────────────────
         뷰 1: 문의 작성 폼
    ──────────────────────────────── -->
    <div class="ci-view" id="ci-view-form-<?= $ci_table_safe ?>">

      <!-- 섹션 헤더 -->
      <div class="s-tag" id="ci-tag-wrap-<?= $ci_table_safe ?>" style="display:none;">
        <span id="ci-tag-<?= $ci_table_safe ?>"></span>
      </div>
      <h2 class="s-h" id="ci-title-<?= $ci_table_safe ?>"></h2>
      <p class="s-p ci-form-desc" id="ci-desc-<?= $ci_table_safe ?>"></p>

      <div class="ci-form-wrap">

        <!-- 로그인 유저 정보 바 -->
        <div class="ci-user-bar" id="ci-user-bar-<?= $ci_table_safe ?>" style="display:none;">
          <div class="ci-user-bar-info">
            <strong id="ci-user-name-<?= $ci_table_safe ?>"></strong>으로 작성합니다
          </div>
          <div style="display:flex;gap:8px;">
            <button class="ci-logout-btn" onclick="ciSwitchAccount('<?= $ci_table_safe ?>')">계정 변경</button>
          </div>
        </div>

        <div class="fc">

          <!-- 제품 선택 -->
          <div class="ci-product-wrap" id="ci-product-wrap-<?= $ci_table_safe ?>" style="display:none;">
            <div class="ci-product-label">
              제품 선택 <em id="ci-product-req-mark-<?= $ci_table_safe ?>"></em>
            </div>
            <div class="ci-product-selects">
              <select id="ci-cat-select-<?= $ci_table_safe ?>" onchange="ciOnCatChange('<?= $ci_table_safe ?>')">
                <option value="">카테고리 선택</option>
              </select>
              <select id="ci-prod-select-<?= $ci_table_safe ?>">
                <option value="">제품 선택</option>
              </select>
            </div>
          </div>

          <!-- 동적 필드 -->
          <div id="ci-fields-<?= $ci_table_safe ?>"></div>

          <!-- 공개/비공개 선택 -->
          <div class="ci-visibility-wrap" id="ci-visibility-wrap-<?= $ci_table_safe ?>" style="display:none;">
            <label class="ci-visibility-opt ci-selected" id="ci-vis-private-<?= $ci_table_safe ?>">
              <input type="radio" name="ci_visibility_<?= $ci_table_safe ?>" value="0" checked> 🔒 비공개
            </label>
            <label class="ci-visibility-opt" id="ci-vis-public-<?= $ci_table_safe ?>">
              <input type="radio" name="ci_visibility_<?= $ci_table_safe ?>" value="1"> 🌐 공개
            </label>
          </div>

          <!-- 약관 -->
          <div class="ci-terms-wrap" id="ci-terms-wrap-<?= $ci_table_safe ?>"></div>

          <!-- 비로그인 로그인 유도 (login_use + 비로그인 시 JS로 표시) -->
          <div id="ci-form-login-nudge-<?= $ci_table_safe ?>" style="display:none;margin-bottom:12px;">
            <button class="ci-login-nudge-btn" onclick="ciState('<?= $ci_table_safe ?>')._pendingView='submit';ciShowLoginGate('<?= $ci_table_safe ?>',ciState('<?= $ci_table_safe ?>').config?.form)">
              🔒 로그인 후 문의하기
            </button>
          </div>

          <!-- 에러 메시지 -->
          <div class="ci-error" id="ci-form-err-<?= $ci_table_safe ?>" style="display:none;"></div>

          <!-- 제출 버튼 -->
          <button class="f-sub" id="ci-submit-btn-<?= $ci_table_safe ?>"
                  onclick="ciSubmit('<?= $ci_table_safe ?>')">문의하기</button>

          <!-- 목록으로 버튼 (목록 타입일 때만 표시) -->
          <button class="f-sub" id="ci-form-back-btn-<?= $ci_table_safe ?>"
                  style="display:none;background:var(--off,#f5f6fa);color:var(--ink2,#444);box-shadow:none;border:1.5px solid var(--g2,#ddd);margin-top:8px;"
                  onclick="ciShowView('<?= $ci_table_safe ?>', 'list')">← 목록으로</button>
        </div>

        <!-- 제출 완료 (모달로 대체 — 빈 자리 유지) -->
        <div class="f-ok" id="ci-form-ok-<?= $ci_table_safe ?>" style="display:none;"></div>
      </div>
    </div>

    <!-- ────────────────────────────────
         뷰 2: 목록 (visibility 설정 있을 때만)
    ──────────────────────────────── -->
    <div class="ci-view" id="ci-view-list-<?= $ci_table_safe ?>">
      <div class="ci-list-wrap">

        <div class="ci-action-bar">
          <h2 class="s-h" style="text-align:left;margin-bottom:0;" id="ci-list-title-<?= $ci_table_safe ?>">문의 내역</h2>
        </div>

        <!-- 검색 -->
        <div class="ci-search-bar">
          <input type="text" class="ci-search-inp" id="ci-kw-<?= $ci_table_safe ?>" placeholder="검색어 입력"
                 onkeydown="if(event.key==='Enter') ciLoadList('<?= $ci_table_safe ?>', 1)">
          <button class="ci-search-btn" onclick="ciLoadList('<?= $ci_table_safe ?>', 1)">검색</button>
        </div>

        <!-- 목록 -->
        <div class="board-list" id="ci-list-<?= $ci_table_safe ?>">
          <div class="ci-loading"><div class="ci-spinner"></div><span>불러오는 중...</span></div>
        </div>

        <!-- 로그인 유도 영역 (비로그인 + login_use 시 JS로 표시) -->
        <div id="ci-list-login-nudge-<?= $ci_table_safe ?>" style="display:none;text-align:center;margin-top:8px;">
          <button class="ci-login-nudge-btn" onclick="ciGoToForm('<?= $ci_table_safe ?>')">로그인하고 내 문의 내역 보기</button>
        </div>

        <!-- 페이지네이션 -->
        <div class="board-pager" id="ci-pager-<?= $ci_table_safe ?>"></div>

        <!-- 글쓰기 버튼 (목록 아래) -->
        <div style="text-align:right;margin-top:16px;">
          <button class="f-sub" style="width:auto;padding:10px 22px;"
                  onclick="ciGoToForm('<?= $ci_table_safe ?>')">+ 새 문의</button>
        </div>
      </div>
    </div>

    <!-- ────────────────────────────────
         뷰 3: 상세
    ──────────────────────────────── -->
    <div class="ci-view" id="ci-view-detail-<?= $ci_table_safe ?>">
      <div class="ci-detail-wrap">

        <div class="ci-action-bar">
          <button class="ci-back-btn" onclick="ciShowView('<?= $ci_table_safe ?>', 'list')">
            ← 목록으로
          </button>
        </div>

        <div class="board-detail-wrap" id="ci-detail-box-<?= $ci_table_safe ?>">
          <div class="ci-loading"><div class="ci-spinner"></div><span>불러오는 중...</span></div>
        </div>

      </div>
    </div>

  </div><!-- /.inner -->
</div><!-- /.ci-section -->

<?php unset($ci_table, $ci_table_safe, $ci_stmt, $ci_form_row); ?>
