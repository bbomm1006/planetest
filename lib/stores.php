<?php
require_once __DIR__ . '/../admin/config/db.php';
$_pdo = getDB();
$_kakao = $_pdo->query('SELECT js_key FROM kakao_api_keys WHERE id=1')->fetch(PDO::FETCH_ASSOC);
$_kakaoJsKey = $_kakao['js_key'] ?? '';
?>
<section class="sw off" id="stores">
  <div class="inner">
    <div style="text-align:center;margin-bottom:28px">
      <div class="s-tag"><span>STORE LOCATOR</span></div>
      <h2 class="s-h">가까운 매장 찾기</h2>
      <p class="s-p">전국 퓨어블루 공식 매장에서 직접 체험해보세요</p>
    </div>
    <div class="sl-wrap">
      <div class="sl-search-group">
        <div class="sl-drop-row">
          <select class="sl-drop" id="slDropSido" onchange="slOnSidoChange()">
            <option value="">시/도 전체</option>
          </select>
          <select class="sl-drop" id="slDropSigungu" onchange="slApplyFilter()">
            <option value="">시/군/구 전체</option>
          </select>
        </div>
        <div class="sl-search-row">
          <div class="sl-search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;flex-shrink:0;color:var(--g4)"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="slSearchInput" placeholder="매장명으로 검색" oninput="slApplyFilter()" autocomplete="off">
          </div>
          <button class="sl-search-btn" onclick="slApplyFilter()">검색</button>
          <button class="sl-near-btn" id="slNearBtn" onclick="slFindNearby()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;flex-shrink:0"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="9" stroke-width="1.5" stroke-dasharray="2 2"/></svg>내 주변 매장</button>
        </div>
        <div class="sl-near-msg" id="slNearMsg"></div>
      </div>

      <div class="sl-body-clip">
      <div class="sl-body" id="slBody">
        <div class="sl-panel">
          <div class="sl-panel-head">
            <span class="sl-count" id="slCount">매장 0개</span>
            <select class="sl-sort" id="slSort" onchange="slApplyFilter()">
              <option value="default">기본순</option>
              <option value="name">이름순</option>
              <option value="dist">거리순</option>
            </select>
          </div>
          <div class="sl-list" id="slList">
            <div class="sl-empty">매장 정보를 불러오는 중...</div>
          </div>
        </div>
        <div class="sl-detail-panel" id="slDetailPanel">
          <div id="slDetailEmpty" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:10px;color:#94a3b8;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span style="font-size:.82rem;font-weight:600;">매장을 선택해 주세요</span>
          </div>
          <div class="sl-detail-close-wrap" id="slDetailHead" style="display:none;">
            <button class="sl-detail-close sl-detail-close-float" onclick="slCloseDetail()" title="닫기">
              <svg viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor"/></svg>
            </button>
          </div>
          <div class="sl-detail-scroll" id="slDetailScroll"></div>
          <div class="sl-detail-foot" id="slDetailFoot" style="display:none;">
            <button class="sl-detail-reserv" id="slDetailReservBtn" onclick="slReserveStore()">예약하기</button>
          </div>
        </div>
        <div class="sl-right" id="slRight">
          <div class="sl-map-area" id="slMapArea">
            <div id="slNaverMapEl"></div>
            <div class="sl-map-ph" id="slMapPh">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1255a6" stroke-width="1.5" style="width:60px;height:60px;opacity:.4"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <div style="font-size:1.05rem;font-weight:800;color:var(--ink2);margin-top:8px;">매장을 선택해 주세요</div>
              <div id="slMapPhDesc" style="font-size:.8rem;color:var(--g4);margin-top:8px;text-align:center;line-height:1.7;max-width:200px;">왼쪽 목록에서 매장을 클릭하면<br>지도와 상세 정보를 확인할 수 있습니다</div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <div class="sl-mobile-modal" id="slMobileModal" onclick="if(event.target===this)slCloseMobileModal()">
        <div class="sl-mobile-modal-inner">
          <div class="sl-mobile-modal-head">
            <h3 id="slMobileModalTitle">매장 상세</h3>
            <button class="sl-mobile-modal-close" onclick="slCloseMobileModal()">
              <svg viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor"/></svg>
            </button>
          </div>
          <div class="sl-mobile-modal-scroll" id="slMobileModalScroll"></div>
          <div class="sl-mobile-modal-foot">
            <button class="sl-detail-reserv" id="slMobileReservBtn" onclick="slReserveStore()">예약하기</button>
          </div>
        </div>
      </div>
      <div class="sl-toast" id="slToast">주소가 복사되었습니다</div>
      <div class="sl-share-modal" id="slShareModal" onclick="if(event.target===this)slCloseShareModal()">
        <div class="sl-share-sheet">
          <div class="sl-share-sheet-head">
            <span class="sl-share-sheet-title" id="slShareTitle">매장 공유</span>
            <button class="sl-share-sheet-close" onclick="slCloseShareModal()">
              <svg viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor"/></svg>
            </button>
          </div>
          <div class="sl-share-options">
            <button class="sl-share-option" onclick="slShareCopyLink()">
              <div class="sl-share-option-icon" style="background:#eef3fb;">
                <svg viewBox="0 0 24 24" fill="none" stroke="#1255a6" stroke-width="2" style="width:22px;height:22px"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
              </div>
              <div><div class="sl-share-option-label">링크 복사</div><div class="sl-share-option-desc">클립보드에 매장 링크를 복사합니다</div></div>
            </button>
            <button class="sl-share-option" onclick="slShareKakao()">
              <div class="sl-share-option-icon" style="background:#FEF01B;">
                <svg viewBox="0 0 24 24" style="width:22px;height:22px"><path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.57 1.43 4.84 3.6 6.26L4.5 21l4.44-2.22C10.21 19.26 11.1 19.5 12 19.5c5.523 0 10-3.477 10-7.5S17.523 3 12 3z" fill="#3C1E1E"/></svg>
              </div>
              <div><div class="sl-share-option-label">카카오톡으로 공유</div><div class="sl-share-option-desc">카카오톡으로 매장 정보를 공유합니다 (PC는 링크 복사)</div></div>
            </button>
            <button class="sl-share-option" onclick="slShareSMS()">
              <div class="sl-share-option-icon" style="background:#e8f5e9;">
                <svg viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2" style="width:22px;height:22px"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              </div>
              <div><div class="sl-share-option-label">문자로 공유</div><div class="sl-share-option-desc">SMS로 매장 정보를 전송합니다</div></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<?php if (!empty($_kakaoJsKey)): ?>
<script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=<?= htmlspecialchars($_kakaoJsKey, ENT_QUOTES) ?>&libraries=services"></script>
<?php else: ?>
<script>console.warn('[stores] 카카오 지도 JS Key가 설정되지 않았습니다. 관리자 > 카카오 API 관리에서 JavaScript 키를 입력해주세요.');</script>
<?php endif; ?>