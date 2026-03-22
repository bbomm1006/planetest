<!-- ============================================================
     예약 폼 추가
     ============================================================ -->
<div class="page" id="page-bkfCreate">
  <div class="page-header">
    <div><h2>예약 폼 추가</h2></div>
  </div>
  <div class="card"><div class="card-body">
    <div class="form-group" style="margin-bottom:16px;">
      <label>폼 제목 <span class="req">*</span></label>
      <input type="text" class="form-control" id="bkf_create_title" placeholder="예: 상담 예약, 체험 예약"/>
    </div>
    <div class="form-group" style="margin-bottom:16px;">
      <label>버튼명 <span class="req">*</span></label>
      <input type="text" class="form-control" id="bkf_create_btn" placeholder="예: 예약하기" value="예약하기"/>
    </div>
    <div class="form-group" style="margin-bottom:4px;">
      <label>슬러그(slug) <span class="req">*</span></label>
      <input type="text" class="form-control" id="bkf_create_slug" placeholder="영문 소문자·숫자·언더바 (예: consult_booking)"/>
      <p style="font-size:.78rem;color:#94a3b8;margin-top:4px;">※ 한번 생성하면 변경 불가합니다. 영문 소문자로 시작, 영문/숫자/언더바(_)만 사용 가능합니다.</p>
    </div>
    <div id="bkf_create_slug_msg" style="font-size:.82rem;min-height:18px;margin-bottom:12px;"></div>
    <div style="display:flex;gap:10px;">
      <button class="btn btn-outline" onclick="bkfCheckSlug()">슬러그 중복 확인</button>
      <button class="btn btn-primary" id="bkf_create_submit_btn" onclick="bkfCreateForm()" disabled>폼 생성</button>
    </div>
  </div></div>
</div>

<!-- ============================================================
     예약 폼 목록
     ============================================================ -->
<div class="page" id="page-bkfList">
  <div class="page-header">
    <div><h2>예약 폼 목록</h2></div>
    <button class="btn btn-primary" onclick="showPage('bkfCreate')">+ 예약 폼 추가</button>
  </div>
  <div class="card"><div class="card-body">
    <div class="table-wrap">
      <table class="admin-table" id="bkfFormTable">
        <thead><tr>
          <th style="width:50px;">#</th>
          <th>폼 제목</th>
          <th style="width:160px;">슬러그</th>
          <th style="width:90px;">수량방식</th>
          <th style="width:90px;">번호인증</th>
          <th style="width:80px;">사용여부</th>
          <th style="width:80px;">예약건수</th>
          <th style="width:150px;">생성일시</th>
          <th style="width:200px;">관리</th>
        </tr></thead>
        <tbody id="bkfFormTableBody">
          <tr><td colspan="9" style="text-align:center;padding:40px;color:#94a3b8;">로딩 중...</td></tr>
        </tbody>
      </table>
    </div>
  </div></div>

  <!-- 프론트 적용 코드 안내 -->
  <div class="card" style="margin-top:16px;"><div class="card-body">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <strong style="font-size:.92rem;">📋 프론트 적용 코드</strong>
      <small style="color:#94a3b8;">슬러그를 선택하면 복사 가능한 코드가 표시됩니다.</small>
    </div>

    <!-- 슬러그 선택 -->
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:16px;flex-wrap:wrap;">
      <label style="font-size:.85rem;color:#475569;white-space:nowrap;">폼 선택</label>
      <select class="form-control" id="bkfCodeSlugSelect" style="width:200px;" onchange="bkfRenderFrontCode()">
        <option value="">-- 폼을 선택하세요 --</option>
      </select>
    </div>

    <div id="bkfFrontCodeArea" style="display:none;">
      <!-- PHP include 코드 -->
      <div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <p style="font-size:.82rem;font-weight:600;color:#475569;margin:0;">① PHP include 코드 (페이지 원하는 위치에 붙여넣기)</p>
          <button class="btn btn-sm btn-outline" onclick="bkfCopyCode('bkfCodePhp')">복사</button>
        </div>
        <pre id="bkfCodePhp" style="background:#1e293b;color:#e2e8f0;padding:12px 16px;border-radius:8px;font-size:.8rem;line-height:1.7;overflow-x:auto;white-space:pre-wrap;word-break:break-all;margin:0;"></pre>
      </div>

      <!-- CSS 코드 -->
      <div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <p style="font-size:.82rem;font-weight:600;color:#475569;margin:0;">② CSS &lt;head&gt; 안에 추가</p>
          <button class="btn btn-sm btn-outline" onclick="bkfCopyCode('bkfCodeCss')">복사</button>
        </div>
        <pre id="bkfCodeCss" style="background:#1e293b;color:#e2e8f0;padding:12px 16px;border-radius:8px;font-size:.8rem;line-height:1.7;overflow-x:auto;white-space:pre-wrap;word-break:break-all;margin:0;"></pre>
      </div>

      <!-- JS 코드 -->
      <div style="margin-bottom:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
          <p style="font-size:.82rem;font-weight:600;color:#475569;margin:0;">③ JS &lt;/body&gt; 닫기 전에 추가</p>
          <button class="btn btn-sm btn-outline" onclick="bkfCopyCode('bkfCodeJs')">복사</button>
        </div>
        <pre id="bkfCodeJs" style="background:#1e293b;color:#e2e8f0;padding:12px 16px;border-radius:8px;font-size:.8rem;line-height:1.7;overflow-x:auto;white-space:pre-wrap;word-break:break-all;margin:0;"></pre>
      </div>

      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:12px 14px;font-size:.78rem;color:#166534;line-height:1.8;">
        💡 <strong>적용 전 확인사항</strong><br>
        · 해당 페이지 PHP 파일에 <code style="background:#dcfce7;padding:1px 5px;border-radius:3px;">$pdo</code> DB 연결이 이미 있어야 합니다.<br>
        · CSS/JS가 이미 로드된 경우 중복 추가하지 마세요.<br>
        · 폼이 <strong>사용</strong> 상태여야 프론트에 표시됩니다.
      </div>
    </div>
  </div></div>
</div>

<!-- ============================================================
     예약 폼 상세 설정 (탭)
     ============================================================ -->
<div class="page" id="page-bkfDetail">
  <div class="page-header">
    <div>
      <h2 id="bkfDetailTitle">예약 폼 설정</h2>
      <p id="bkfDetailSlug" style="font-size:.8rem;color:#94a3b8;margin-top:2px;"></p>
    </div>
    <button class="btn btn-outline" onclick="showPage('bkfList')">← 목록으로</button>
  </div>

  <div class="ci-tabs">
    <button class="ci-tab active" onclick="bkfSwitchTab('basic',    this)">기본정보</button>
    <button class="ci-tab"        onclick="bkfSwitchTab('fields',   this)">필드설정</button>
    <button class="ci-tab"        onclick="bkfSwitchTab('steps',    this)">스텝설정</button>
    <button class="ci-tab"        onclick="bkfSwitchTab('quota',    this)">수량설정</button>
    <button class="ci-tab"        onclick="bkfSwitchTab('managers', this)">담당자설정</button>
    <button class="ci-tab"        onclick="bkfSwitchTab('records',  this)">예약내역</button>
  </div>

  <!-- ── 기본정보 탭 ── -->
  <div class="ci-tab-panel active" id="bkf-panel-basic">
    <div class="card"><div class="card-body">
      <div class="form-group" style="margin-bottom:16px;">
        <label>폼 제목 <span class="req">*</span></label>
        <input type="text" class="form-control" id="bkf_title"/>
      </div>
      <div class="form-group" style="margin-bottom:16px;">
        <label>폼 설명</label>
        <textarea class="form-control" id="bkf_description" rows="3"
          placeholder="예: 상담 예약을 신청해주시면 담당자가 확인 후 연락드립니다."
          style="resize:vertical;"></textarea>
        <p style="font-size:.75rem;color:#94a3b8;margin-top:4px;">프론트 예약 폼 상단에 표시됩니다.</p>
      </div>
      <div class="form-group" style="margin-bottom:16px;">
        <label>버튼명</label>
        <input type="text" class="form-control" id="bkf_btn"/>
      </div>
      <div class="form-group" style="margin-bottom:16px;">
        <label>슬러그</label>
        <input type="text" class="form-control" id="bkf_slug_display" disabled style="background:#f8fafc;color:#94a3b8;"/>
      </div>
      <div class="form-group" style="margin-bottom:16px;">
        <label>사용여부</label>
        <div style="display:flex;gap:20px;margin-top:6px;">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="bkf_is_active" value="1"/> 사용</label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="bkf_is_active" value="0"/> 미사용</label>
        </div>
      </div>
      <hr style="margin:20px 0;border:none;border-top:1px solid var(--border);">
      <p style="font-size:.88rem;font-weight:600;margin-bottom:14px;">예약 설정</p>
      <!-- 번호인증 -->
      <div class="ci-feature-row">
        <div class="ci-feature-label">
          <label class="ci-toggle-wrap">
            <input type="checkbox" id="bkf_phone_verify_use"/>
            <span class="ci-toggle"></span>
          </label>
          <span>번호인증 사용</span>
          <small>예약 접수 시 SMS 인증번호 확인</small>
        </div>
      </div>
      <!-- 수량 방식 -->
      <div class="ci-feature-row">
        <div class="ci-feature-label">
          <span style="margin-left:0;">수량(Quota) 방식</span>
        </div>
        <div style="display:flex;gap:20px;margin-top:10px;padding-left:0;">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;">
            <input type="radio" name="bkf_quota_mode" value="date"/> 날짜 단위
          </label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;">
            <input type="radio" name="bkf_quota_mode" value="slot"/> 시간 슬롯 단위
          </label>
        </div>
      </div>
      <div style="margin-top:24px;">
        <button class="btn btn-primary" onclick="bkfSaveBasic()">저장</button>
      </div>
    </div></div>
  </div>

  <!-- ── 필드설정 탭 ── -->
  <div class="ci-tab-panel" id="bkf-panel-fields">
    <div class="card"><div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <strong>필드 설정</strong>
        <button class="btn btn-primary" onclick="bkfOpenFieldModal(0)">+ 필드 추가</button>
      </div>
      <!-- 고정 필드 안내 -->
      <div style="margin-bottom:20px;">
        <p style="font-size:.82rem;font-weight:600;color:#475569;margin-bottom:10px;">고정 필드 (삭제 불가, 순서만 변경 가능)</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <span style="background:#dbeafe;color:#1e40af;padding:5px 12px;border-radius:6px;font-size:.82rem;">이름 (name)</span>
          <span style="background:#dbeafe;color:#1e40af;padding:5px 12px;border-radius:6px;font-size:.82rem;">전화번호 (phone)</span>
        </div>
      </div>
      <!-- 시스템 고정 필드 안내 -->
      <div style="margin-bottom:20px;">
        <p style="font-size:.82rem;font-weight:600;color:#475569;margin-bottom:10px;">시스템 고정 필드 (자동 저장)</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <span style="background:#e2e8f0;color:#475569;padding:5px 12px;border-radius:6px;font-size:.82rem;">예약번호</span>
          <span style="background:#e2e8f0;color:#475569;padding:5px 12px;border-radius:6px;font-size:.82rem;">예약일</span>
          <span style="background:#e2e8f0;color:#475569;padding:5px 12px;border-radius:6px;font-size:.82rem;">예약시간</span>
          <span style="background:#e2e8f0;color:#475569;padding:5px 12px;border-radius:6px;font-size:.82rem;">지점</span>
          <span style="background:#e2e8f0;color:#475569;padding:5px 12px;border-radius:6px;font-size:.82rem;">상태</span>
          <span style="background:#e2e8f0;color:#475569;padding:5px 12px;border-radius:6px;font-size:.82rem;">접수일시</span>
        </div>
      </div>
      <p style="font-size:.82rem;font-weight:600;color:#475569;margin-bottom:10px;">
        추가 필드 <small style="font-weight:400;color:#94a3b8;">(드래그로 순서 변경)</small>
      </p>
      <div id="bkfFieldList" style="min-height:60px;"></div>
    </div></div>
  </div>

  <!-- ── 스텝설정 탭 ── -->
  <div class="ci-tab-panel" id="bkf-panel-steps">
    <div class="card"><div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <strong>Step 구성</strong>
        <button class="btn btn-primary" onclick="bkfSaveSteps()">저장</button>
      </div>
      <p style="font-size:.82rem;color:#94a3b8;margin-bottom:16px;">
        드래그로 순서 변경 (정보입력 스텝도 순서 변경 가능)
      </p>
      <!-- 사용 가능한 스텝 팔레트 -->
      <div style="background:#f8fafc;border:1px solid var(--border);border-radius:8px;padding:14px 16px;margin-bottom:20px;">
        <p style="font-size:.82rem;font-weight:600;margin-bottom:10px;color:#475569;">추가 가능한 스텝</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;" id="bkfStepPalette">
          <button class="btn btn-sm btn-outline" onclick="bkfAddStep('store',    '지점 선택')">+ 지점 선택</button>
          <button class="btn btn-sm btn-outline" onclick="bkfAddStep('date',     '날짜 선택')">+ 날짜 선택</button>
          <button class="btn btn-sm btn-outline" onclick="bkfAddStep('time_slot','시간 선택')">+ 시간 선택</button>
          <button class="btn btn-sm btn-outline" onclick="bkfAddStep('item',     '항목 선택')">+ 항목 선택</button>
        </div>
        <div style="margin-top:10px;background:#fefce8;border:1px solid #fde047;border-radius:6px;padding:10px 14px;font-size:.78rem;color:#713f12;line-height:1.7;">
          💡 <strong>항목 선택 스텝 사용 방법</strong><br>
          <strong>필드설정</strong> 탭에서 <strong>"항목 선택(item_select)"</strong> 타입의 필드를 먼저 추가하고 옵션을 입력하세요.<br>
          그 후 여기서 <strong>"+ 항목 선택"</strong> 버튼을 눌러 스텝에 추가하면 프론트에 항목 선택 단계가 나타납니다.
        </div>
        
        </div>
      </div>
      <!-- 현재 스텝 목록 (드래그 가능) -->
      <div id="bkfStepList" style="min-height:80px;display:flex;flex-direction:column;gap:8px;"></div>

    </div></div>
  </div>

  <!-- ── 수량설정 탭 ── -->
  <div class="ci-tab-panel" id="bkf-panel-quota">
    <div class="card"><div class="card-body">
      <!-- 필터 영역 -->
      <div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap;margin-bottom:20px;">
        <div>
          <label style="font-size:.82rem;color:#64748b;display:block;margin-bottom:4px;">지점</label>
          <select class="form-control" id="bkfQuotaStoreFilter" onchange="bkfLoadQuota()" style="width:160px;">
            <option value="">지점 없음 (공통)</option>
          </select>
        </div>
        <div>
          <label style="font-size:.82rem;color:#64748b;display:block;margin-bottom:4px;">연도</label>
          <select class="form-control" id="bkfQuotaYear" style="width:100px;"></select>
        </div>
        <div>
          <label style="font-size:.82rem;color:#64748b;display:block;margin-bottom:4px;">월</label>
          <select class="form-control" id="bkfQuotaMonth" style="width:80px;"></select>
        </div>
        <button class="btn btn-outline" onclick="bkfLoadQuota()">조회</button>
        <button class="btn btn-primary" onclick="bkfOpenBulkQuota()">일괄 설정</button>
      </div>

      <!-- 캘린더 형태 수량 표 -->
      <div id="bkfQuotaCalendar" style="overflow-x:auto;"></div>

      <!-- 안내 -->
      <div style="margin-top:16px;background:#f8fafc;border-radius:8px;padding:12px 16px;font-size:.8rem;color:#64748b;line-height:1.8;">
        <strong>수량 설정 안내</strong><br>
        · 날짜 셀 클릭 → 해당 날짜/슬롯 수량 설정 팝업<br>
        · <strong>수량 빈칸</strong> = 제한 없음 (얼마든지 예약 가능)<br>
        · <strong>수량 0</strong> = 마감 (예약 불가, 비활성화 표시)<br>
        · <strong>수량 1 이상</strong> = 해당 수량만큼 예약 가능, 초과 시 마감<br>
        · 지점 없음(공통)으로 저장하면 모든 지점에 동일하게 적용됨<br>
        · 일괄 설정 → 해당 월 전체 날짜에 동일한 수량/슬롯 일괄 적용
      </div>
    </div></div>
  </div>

  <!-- ── 담당자설정 탭 ── -->
  <div class="ci-tab-panel" id="bkf-panel-managers">
    <div class="card"><div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <strong>담당자 목록</strong>
        <button class="btn btn-primary" onclick="bkfOpenManagerModal(0)">+ 담당자 추가</button>
      </div>
      <div class="table-wrap">
        <table class="admin-table" id="bkfManagerTable">
          <thead><tr>
            <th>이름</th>
            <th>담당부서</th>
            <th>연락처</th>
            <th>이메일</th>
            <th style="width:180px;">알림설정</th>
            <th style="width:70px;">사용</th>
            <th style="width:120px;">관리</th>
          </tr></thead>
          <tbody id="bkfManagerTableBody">
            <tr><td colspan="7" style="text-align:center;padding:30px;color:#94a3b8;">담당자가 없습니다.</td></tr>
          </tbody>
        </table>
      </div>
    </div></div>

    <!-- 담당자 변경 이력 -->
    <div class="card" style="margin-top:14px;"><div class="card-body">
      <strong style="font-size:.88rem;">변경 이력</strong>
      <div class="table-wrap" style="margin-top:10px;">
        <table class="admin-table">
          <thead><tr>
            <th style="width:140px;">변경일시</th>
            <th style="width:120px;">담당자명</th>
            <th>변경내용</th>
            <th style="width:100px;">변경자</th>
          </tr></thead>
          <tbody id="bkfManagerHistoryBody">
            <tr><td colspan="4" style="text-align:center;padding:20px;color:#94a3b8;">이력이 없습니다.</td></tr>
          </tbody>
        </table>
      </div>
    </div></div>
  </div>

  <!-- ── 예약내역 탭 ── -->
  <div class="ci-tab-panel" id="bkf-panel-records">
    <div class="page-header" style="padding:0 0 14px 0;">
      <div></div>
      <button class="btn btn-outline" onclick="bkfExcelDownload()">📥 엑셀 다운로드</button>
    </div>
    <!-- 검색 필터 -->
    <div class="card" style="margin-bottom:12px;"><div class="card-body" style="padding:14px 18px;">
      <div class="table-filters" style="flex-wrap:wrap;gap:8px;">
        <input type="text"  class="form-control" id="bkfRecordKeyword"  placeholder="이름·전화·예약번호" style="width:180px;" onkeydown="if(event.key==='Enter')bkfLoadRecords(1)"/>
        <select class="form-control" id="bkfRecordStatus" style="width:110px;">
          <option value="">전체 상태</option>
          <option value="접수">접수</option>
          <option value="확인">확인</option>
          <option value="완료">완료</option>
          <option value="취소">취소</option>
        </select>
        <select class="form-control" id="bkfRecordStore" style="width:140px;">
          <option value="">전체 지점</option>
        </select>
        <input type="date" class="form-control" id="bkfRecordFrom" style="width:140px;"/>
        <span style="align-self:center;color:#94a3b8;">~</span>
        <input type="date" class="form-control" id="bkfRecordTo"   style="width:140px;"/>
        <button class="btn btn-outline" onclick="bkfLoadRecords(1)">🔍 검색</button>
        <button class="btn btn-ghost"   onclick="bkfResetRecordSearch()">초기화</button>
      </div>
    </div></div>
    <!-- 테이블 -->
    <div class="card"><div class="card-body">
      <div class="bulk-bar" id="bkfRecordBulkBar" style="display:none;">
        <span>선택 <span class="bulk-count" id="bkfRecordBulkCount">0</span>건</span>
        <button class="btn btn-sm btn-danger" onclick="bkfDeleteSelectedRecords()">선택 삭제</button>
      </div>
      <div class="table-wrap">
        <table class="admin-table" id="bkfRecordTable">
          <thead>
            <tr id="bkfRecordTableHead">
              <th style="width:36px;"><input type="checkbox" id="bkfRecordCheckAll" onchange="bkfToggleAllCheck(this)"/></th>
              <th style="width:50px;">#</th>
              <th style="width:130px;">예약번호</th>
              <th>이름</th>
              <th style="width:120px;">전화번호</th>
              <th style="width:110px;">예약일</th>
              <th style="width:90px;">예약시간</th>
              <th style="width:110px;">지점</th>
              <th style="width:90px;">상태</th>
              <th style="width:150px;">접수일시</th>
              <th style="width:100px;">관리</th>
            </tr>
          </thead>
          <tbody id="bkfRecordTableBody">
            <tr><td colspan="11" style="text-align:center;padding:40px;color:#94a3b8;">로딩 중...</td></tr>
          </tbody>
        </table>
      </div>
      <div id="bkfRecordPagination" style="display:flex;gap:6px;justify-content:center;padding:16px 0;flex-wrap:wrap;"></div>
    </div></div>
  </div>

</div><!-- /page-bkfDetail -->
