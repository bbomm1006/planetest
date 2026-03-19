<section class="sw" id="reservation" style="background:var(--white);">
  <div class="inner">
    <div class="s-tag"><span>RESERVATION</span></div>
    <h2 class="s-h">예약하기</h2>
    <p class="s-p">지점을 먼저 선택하시면 예약 가능한 날짜와 잔여 수량을 확인하실 수 있습니다.</p>
    <!-- ─ 스텝 인디케이터 ─ -->
    <div class="rsv-steps" id="rsvStepBar">
      <div class="rsv-step active" id="rsvStepDot1">
        <div class="rsv-step-circle">1</div>
        <div class="rsv-step-label">지점 선택</div>
      </div>
      <div class="rsv-step-line" id="rsvLine1"></div>
      <div class="rsv-step" id="rsvStepDot2">
        <div class="rsv-step-circle">2</div>
        <div class="rsv-step-label">날짜 선택</div>
      </div>
      <div class="rsv-step-line" id="rsvLine2"></div>
      <div class="rsv-step" id="rsvStepDot3">
        <div class="rsv-step-circle">3</div>
        <div class="rsv-step-label">시간 선택</div>
      </div>
      <div class="rsv-step-line" id="rsvLine3"></div>
      <div class="rsv-step" id="rsvStepDot4">
        <div class="rsv-step-circle">4</div>
        <div class="rsv-step-label">예약 항목</div>
      </div>
      <div class="rsv-step-line" id="rsvLine4"></div>
      <div class="rsv-step" id="rsvStepDot5">
        <div class="rsv-step-circle">5</div>
        <div class="rsv-step-label">신청 완료</div>
      </div>
    </div>

    <!-- ─ STEP 1 : 지점 선택 ─ -->
    <div class="rsv-panel on" id="rsvPanel1">
      <div class="rsv-panel-title">STEP 01</div>
      <div class="rsv-panel-head">방문하실 지점을 선택해 주세요</div>
      <div class="rsv-panel-sub">지점을 선택하시면 해당 지점의 예약 가능한 날짜와 잔여 수량을 확인하실 수 있습니다.</div>
      <!-- 시/도 · 시/군/구 필터 -->
      <div id="rsvRegionFilter" style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
        <select id="rsvSido" onchange="rsvOnSidoChange()"
          style="flex:1;min-width:110px;padding:9px 12px;border:1.5px solid var(--sky);border-radius:10px;background:#fff;font-family:inherit;font-size:.85rem;font-weight:600;color:var(--ink);cursor:pointer;">
          <option value="">시/도 전체</option>
        </select>
        <select id="rsvSigungu" onchange="rsvOnSigunguChange()"
          style="flex:1;min-width:110px;padding:9px 12px;border:1.5px solid var(--sky);border-radius:10px;background:#fff;font-family:inherit;font-size:.85rem;font-weight:600;color:var(--ink);cursor:pointer;">
          <option value="">시/군/구 전체</option>
        </select>
      </div>
      <div class="rsv-card-grid" id="rsvBranchList">
        <div class="rsv-loading"><div class="rsv-spinner"></div>불러오는 중...</div>
      </div>
      <div class="rsv-btn-row" style="margin-top:28px;">
        <button class="rsv-btn-next" id="rsvBtnNext1" onclick="rsvGoStep(2)" disabled>
          날짜 선택 →
        </button>
      </div>
      <div style="text-align:center;margin-top:18px;">
        <button onclick="document.getElementById('reservation-lookup').scrollIntoView({behavior:'smooth',block:'start'})"
          style="padding:10px 26px;border-radius:100px;border:1.5px solid var(--sky);background:var(--mist);
          color:var(--blue);font-family:inherit;font-size:.82rem;font-weight:700;cursor:pointer;
          transition:all .2s;" onmouseover="this.style.background='var(--pale)'" onmouseout="this.style.background='var(--mist)'">
          예약 조회 · 변경하기
        </button>
      </div>
    </div>

    <!-- ─ STEP 2 : 날짜 선택 ─ -->
    <div class="rsv-panel" id="rsvPanel2">
      <div class="rsv-breadcrumb" id="rsvBc2"></div>
      <div class="rsv-panel-title">STEP 02</div>
      <div class="rsv-panel-head">예약하실 날짜를 선택해 주세요</div>
      <div class="rsv-panel-sub">수량이 있는 예약 가능한 날짜만 표시됩니다. 각 날짜에 남은 수량을 확인하세요.</div>
      <div class="rsv-cal-wrap">
        <div class="rsv-cal-header">
          <button class="rsv-cal-nav-btn" onclick="rsvCalNav(-1)" title="이전 달">
            <svg viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <div style="display:flex;align-items:center;gap:10px;">
            <div class="rsv-cal-month" id="rsvCalTitle">2026년 1월</div>
            <button onclick="rsvGoToday()" style="padding:4px 12px;border-radius:100px;border:1.5px solid var(--sky);background:var(--mist);color:var(--blue);font-size:.72rem;font-weight:700;cursor:pointer;font-family:inherit;transition:all .18s;" onmouseover="this.style.background='var(--pale)'" onmouseout="this.style.background='var(--mist)'">오늘</button>
          </div>
          <button class="rsv-cal-nav-btn" onclick="rsvCalNav(1)" title="다음 달">
            <svg viewBox="0 0 24 24" fill="none"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
        <div class="rsv-cal-dow">
          <span>일</span><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span>
        </div>
        <div class="rsv-cal-grid" id="rsvCalGrid">
          <div class="rsv-loading" style="grid-column:1/-1"><div class="rsv-spinner"></div>날짜를 불러오는 중...</div>
        </div>
        <div class="rsv-cal-legend">
          <div class="rsv-legend-item">
            <div class="rsv-legend-dot" style="background:#d1fae5;border:1px solid #6ee7b7;"></div>예약 가능
          </div>
          <div class="rsv-legend-item">
            <div class="rsv-legend-dot" style="background:#fef9c3;border:1px solid #fde68a;"></div>예약 마감
          </div>
          <div class="rsv-legend-item">
            <div class="rsv-legend-dot" style="background:#fee2e2;border:1px solid #fca5a5;"></div>예약 불가
          </div>
        </div>
      </div>
      <div class="rsv-btn-row" style="margin-top:28px;">
        <button class="rsv-btn-back" onclick="rsvGoStep(1)">← 이전</button>
        <button class="rsv-btn-next" id="rsvBtnNext2" onclick="rsvGoStep(3)" disabled>
          시간 선택 →
        </button>
      </div>
    </div>

    <!-- ─ STEP 3 : 시간 선택 ─ -->
    <div class="rsv-panel" id="rsvPanel3">
      <div class="rsv-breadcrumb" id="rsvBc3"></div>
      <div class="rsv-panel-title">STEP 03</div>
      <div class="rsv-panel-head">예약 시간을 선택해 주세요</div>
      <div class="rsv-panel-sub" id="rsvTimeStepSub">선택하신 날짜의 예약 가능한 시간대를 선택해 주세요.</div>
      <div id="rsvTimeStepWrap" style="margin-top:8px;">
        <div class="rsv-loading"><div class="rsv-spinner"></div>시간 정보를 불러오는 중...</div>
      </div>
      <div class="rsv-btn-row" style="margin-top:28px;">
        <button class="rsv-btn-back" onclick="rsvGoStep(2)">← 이전</button>
        <button class="rsv-btn-next" id="rsvBtnNext3" onclick="rsvGoStep(4)" disabled>
          예약 항목 선택 →
        </button>
      </div>
    </div>

    <!-- ─ STEP 4 : 예약 항목 선택 ─ -->
    <div class="rsv-panel" id="rsvPanel4">
      <div class="rsv-breadcrumb" id="rsvBc4"></div>
      <div class="rsv-panel-title">STEP 04</div>
      <div class="rsv-panel-head">예약 항목을 선택해 주세요</div>
      <div class="rsv-panel-sub">선택하신 날짜에 이용 가능한 예약 항목입니다.</div>
      <div class="rsv-card-grid" id="rsvItemList">
        <div class="rsv-loading"><div class="rsv-spinner"></div>불러오는 중...</div>
      </div>
      <div class="rsv-btn-row">
        <button class="rsv-btn-back" onclick="rsvGoStep(3)">← 이전</button>
        <button class="rsv-btn-next" id="rsvBtnNext4" onclick="rsvGoStep(5)" disabled>
          신청 정보 입력 →
        </button>
      </div>
    </div>

    <!-- ─ STEP 5 : 신청 폼 ─ -->
    <div class="rsv-panel" id="rsvPanel5">
      <div class="rsv-breadcrumb" id="rsvBc5"></div>
      <div class="rsv-panel-title">STEP 05</div>
      <div class="rsv-panel-head">신청 정보를 입력해 주세요</div>
      <div class="rsv-panel-sub">정확한 정보를 입력하시면 빠르게 예약을 도와드립니다.</div>
      <div class="rsv-form-wrap">
        <div class="rsv-form-summary" id="rsvSummary"></div>
        <div class="rsv-form-2col">
          <div class="rsv-fg">
            <label class="rsv-fl">이름 <em>*</em></label>
            <input class="rsv-fi" id="rsvName" type="text" placeholder="홍길동">
          </div>
          <div class="rsv-fg" style="grid-column:1/-1;">
            <label class="rsv-fl">연락처 <em>*</em> <span id="rsvPhoneVerifiedBadge" style="display:none;background:var(--green);color:#fff;font-size:.65rem;padding:1px 8px;border-radius:100px;font-weight:700;vertical-align:middle;">인증완료</span></label>
            <div class="rsv-phone-wrap">
              <input class="rsv-fi" id="rsvPhone" type="tel" placeholder="010-0000-0000" oninput="rsvPhoneInput(this)" onkeydown="if(event.key==='Enter'){event.preventDefault();rsvSendCode();}">
              <button class="rsv-phone-send-btn" id="rsvSendCodeBtn" onclick="rsvSendCode()">인증번호 받기</button>
            </div>
            <div class="rsv-verify-box" id="rsvVerifyBox">
              <input class="rsv-verify-inp" id="rsvVerifyCode" type="text" inputmode="numeric" maxlength="6" placeholder="인증번호 6자리" oninput="this.value=this.value.replace(/\D/g,'')">
              <button class="rsv-verify-confirm-btn" onclick="rsvConfirmCode()">확인</button>
            </div>
            <div class="rsv-phone-timer" id="rsvPhoneTimer"></div>
            <div class="rsv-phone-status" id="rsvPhoneStatus"></div>
          </div>
        </div>
        <div class="rsv-fg">
          <label class="rsv-fl">이메일 <small style="font-weight:400;color:var(--g4)">(선택)</small></label>
          <input class="rsv-fi" id="rsvEmail" type="email" placeholder="example@email.com">
        </div>
        <div class="rsv-fg">
          <label class="rsv-fl">요청 사항 <small style="font-weight:400;color:var(--g4)">(선택)</small></label>
          <textarea class="rsv-fta" id="rsvMessage" placeholder="추가로 요청하실 사항이 있으시면 입력해주세요."></textarea>
        </div>
        <div class="rsv-priv">
          <div class="rsv-priv-scroll">개인정보 수집·이용 동의<br>수집 항목: 이름, 연락처, 이메일, 요청 사항<br>수집 목적: 예약 서비스 제공 및 예약 확인 안내<br>보유 기간: 예약 완료 후 1년<br>귀하는 개인정보 수집·이용에 대한 동의를 거부할 권리가 있으며, 거부 시 예약 서비스 이용이 제한될 수 있습니다.</div>
          <label class="rsv-priv-chk"><input type="checkbox" id="rsvPriv"><span>개인정보 수집 및 이용에 동의합니다 (필수)</span></label>
        </div>
        <div class="rsv-btn-row">
          <button class="rsv-btn-back" onclick="rsvGoStep(4)">← 이전</button>
          <button class="rsv-btn-next" onclick="rsvSubmit()">예약 신청하기 →</button>
        </div>
      </div>
    </div>

    <!-- ─ 완료 화면 ─ -->
    <div class="rsv-panel" id="rsvPanelDone">
      <div class="rsv-complete">
        <svg viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="38" fill="#d1fae5" stroke="#10b981" stroke-width="2"/>
          <path d="M22 40l12 12 24-24" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <h3>예약이 접수되었습니다!</h3>
        <p>입력하신 연락처로 예약 확인 안내를 드릴 예정입니다.<br>예약 관련 문의는 고객센터로 연락주세요.</p>
        <div class="rsv-complete-info" id="rsvDoneInfo"></div>
        <button onclick="rsvReset()" style="padding:12px 32px;border-radius:11px;
          border:1.5px solid var(--g2);background:var(--white);color:var(--g5);
          font-family:inherit;font-weight:700;font-size:.88rem;cursor:pointer;
          transition:all .2s;" onmouseover="this.style.borderColor='var(--sky)';this.style.color='var(--blue)'"
          onmouseout="this.style.borderColor='var(--g2)';this.style.color='var(--g5)'">
          새 예약 신청하기
        </button>
      </div>
    </div>

  </div>
</section>