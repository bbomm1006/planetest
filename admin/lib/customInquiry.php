<!-- ========================
     문의 폼 추가
     ======================== -->
<div class="page" id="page-customInquiryCreate">
  <div class="page-header">
    <div><h2>문의 폼 추가</h2></div>
  </div>
  <div class="card"><div class="card-body">
    <div class="form-group" style="margin-bottom:16px;">
      <label>폼 제목 <span class="req">*</span></label>
      <input type="text" class="form-control" id="ci_create_title" placeholder="폼 제목을 입력하세요"/>
    </div>
    <div class="form-group" style="margin-bottom:16px;">
      <label>설명</label>
      <textarea class="form-control" id="ci_create_desc" rows="3" placeholder="폼 설명을 입력하세요" style="resize:vertical;"></textarea>
    </div>
    <div class="form-group" style="margin-bottom:16px;">
      <label>버튼명 <span class="req">*</span></label>
      <input type="text" class="form-control" id="ci_create_btn" placeholder="예: 문의하기, 신청하기" value="문의하기"/>
    </div>
    <div class="form-group" style="margin-bottom:4px;">
      <label>테이블명 <span class="req">*</span></label>
      <input type="text" class="form-control" id="ci_create_table" placeholder="영문/숫자/언더바만 가능 (예: contact_form)"/>
      <p style="font-size:.78rem;color:#94a3b8;margin-top:4px;">※ 한번 생성하면 변경 불가합니다. 영문 소문자, 숫자, 언더바(_)만 사용 가능합니다.</p>
    </div>
    <div id="ci_create_table_msg" style="font-size:.82rem;min-height:18px;margin-bottom:12px;"></div>
    <div style="display:flex;gap:10px;">
      <button class="btn btn-outline" onclick="ciCheckTable()">테이블명 중복 확인</button>
      <button class="btn btn-primary" id="ci_create_submit_btn" onclick="ciCreateForm()" disabled>폼 생성</button>
    </div>
  </div></div>
</div>

<!-- ========================
     문의 폼 목록
     ======================== -->
<div class="page" id="page-customInquiryList">
  <div class="page-header">
    <div><h2>문의 폼 목록</h2></div>
  </div>
  <div class="card"><div class="card-body">
    <div class="table-wrap">
      <table class="admin-table" id="ciFormTable">
        <thead><tr>
          <th style="width:50px;">#</th>
          <th>폼 제목</th>
          <th style="width:180px;">테이블명</th>
          <th style="width:100px;">사용여부</th>
          <th style="width:150px;">생성일시</th>
          <th style="width:130px;">관리</th>
        </tr></thead>
        <tbody id="ciFormTableBody">
          <tr><td colspan="6" style="text-align:center;padding:40px;color:#94a3b8;">로딩 중...</td></tr>
        </tbody>
      </table>
    </div>
  </div></div>
</div>

<!-- ========================
     문의 폼 상세 설정 (탭)
     ======================== -->
<div class="page" id="page-customInquiryDetail">
  <div class="page-header">
    <div>
      <h2 id="ciDetailTitle">문의 폼 설정</h2>
      <p id="ciDetailTableName" style="font-size:.8rem;color:#94a3b8;margin-top:2px;"></p>
    </div>
    <button class="btn btn-outline" onclick="showPage('customInquiryList')">← 목록으로</button>
  </div>

  <div class="ci-tabs">
    <button class="ci-tab active" onclick="ciSwitchTab('basic', this)">기본정보</button>
    <button class="ci-tab" onclick="ciSwitchTab('managers', this)">담당관리자</button>
    <button class="ci-tab" onclick="ciSwitchTab('status', this)">상태관리</button>
    <button class="ci-tab" onclick="ciSwitchTab('reply', this)">답변설정</button>
    <button class="ci-tab" onclick="ciSwitchTab('fields', this)">필드설정</button>
    <button class="ci-tab" onclick="ciSwitchTab('terms', this)">약관</button>
  </div>

  <!-- 기본정보 탭 -->
  <div class="ci-tab-panel active" id="ci-panel-basic">
    <div class="card"><div class="card-body">
      <div class="form-group" style="margin-bottom:16px;">
        <label>폼 제목 <span class="req">*</span></label>
        <input type="text" class="form-control" id="ci_title"/>
      </div>
      <div class="form-group" style="margin-bottom:16px;">
        <label>설명</label>
        <textarea class="form-control" id="ci_desc" rows="3" style="resize:vertical;"></textarea>
      </div>
      <div class="form-group" style="margin-bottom:16px;">
        <label>버튼명</label>
        <input type="text" class="form-control" id="ci_btn"/>
      </div>
      <div class="form-group" style="margin-bottom:16px;">
        <label>테이블명</label>
        <input type="text" class="form-control" id="ci_table_name_display" disabled style="background:#f8fafc;color:#94a3b8;"/>
      </div>
      <div class="form-group" style="margin-bottom:16px;">
        <label>사용여부</label>
        <div style="display:flex;gap:20px;margin-top:6px;">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_is_active" value="1"/> 사용</label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_is_active" value="0"/> 미사용</label>
        </div>
      </div>
      <hr style="margin:20px 0;border:none;border-top:1px solid var(--border);">
      <p style="font-size:.88rem;font-weight:600;margin-bottom:14px;">선택 기능</p>
      <div class="ci-feature-row">
        <div class="ci-feature-label">
          <label class="ci-toggle-wrap"><input type="checkbox" id="ci_period_use" onchange="ciToggleFeature('period')"/><span class="ci-toggle"></span></label>
          <span>기간설정</span>
          <small style="color:#94a3b8;">설정 기간에만 접수 가능 (관리자 전용)</small>
        </div>
        <div class="ci-feature-body" id="ci-feature-period" style="display:none;">
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:10px;">
            <input type="date" class="form-control" id="ci_period_start" style="width:160px;"/>
            <span>~</span>
            <input type="date" class="form-control" id="ci_period_end" style="width:160px;"/>
          </div>
        </div>
      </div>
      <div class="ci-feature-row">
        <div class="ci-feature-label">
          <label class="ci-toggle-wrap"><input type="checkbox" id="ci_login_use" onchange="ciToggleFeature('login')"/><span class="ci-toggle"></span></label>
          <span>로그인 연동</span>
        </div>
        <div class="ci-feature-body" id="ci-feature-login" style="display:none;">
          <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="checkbox" name="ci_login_type" value="kakao"/> 카카오</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="checkbox" name="ci_login_type" value="naver"/> 네이버</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="checkbox" name="ci_login_type" value="google"/> 구글</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="checkbox" name="ci_login_type" value="email"/> 이메일</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="checkbox" name="ci_login_type" value="password"/> 비밀번호</label>
          </div>
        </div>
      </div>
      <div class="ci-feature-row">
        <div class="ci-feature-label">
          <label class="ci-toggle-wrap"><input type="checkbox" id="ci_visibility_use" onchange="ciToggleFeature('visibility')"/><span class="ci-toggle"></span></label>
          <span>공개글 여부</span>
        </div>
        <div class="ci-feature-body" id="ci-feature-visibility" style="display:none;">
          <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_visibility_type" value="private"/> 비공개</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_visibility_type" value="public"/> 공개</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_visibility_type" value="both"/> 비공개/공개 선택</label>
          </div>
        </div>
      </div>
      <div class="ci-feature-row">
        <div class="ci-feature-label">
          <label class="ci-toggle-wrap"><input type="checkbox" id="ci_comment_use" onchange="ciToggleFeature('comment')"/><span class="ci-toggle"></span></label>
          <span>댓글</span>
        </div>
        <div class="ci-feature-body" id="ci-feature-comment" style="display:none;">
          <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_comment_visibility" value="private"/> 비공개</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_comment_visibility" value="public"/> 공개</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_comment_visibility" value="both"/> 비공개/공개 선택</label>
          </div>
        </div>
      </div>
      <div class="ci-feature-row">
        <div class="ci-feature-label">
          <label class="ci-toggle-wrap"><input type="checkbox" id="ci_product_use" onchange="ciToggleFeature('product')"/><span class="ci-toggle"></span></label>
          <span>제품선택</span>
        </div>
        <div class="ci-feature-body" id="ci-feature-product" style="display:none;">
          <div style="margin-top:10px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="checkbox" id="ci_product_required"/> 필수 선택</label>
          </div>
        </div>
      </div>
      <div style="margin-top:24px;">
        <button class="btn btn-primary" onclick="ciSaveBasic()">저장</button>
      </div>
    </div></div>
  </div>

  <!-- 담당관리자 탭 -->
  <div class="ci-tab-panel" id="ci-panel-managers">
    <div class="card"><div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <strong>담당관리자 목록</strong>
        <button class="btn btn-primary" onclick="ciOpenManagerModal()">+ 담당자 추가</button>
      </div>
      <div class="table-wrap">
        <table class="admin-table" id="ciManagerTable">
          <thead><tr>
            <th>이름</th><th>담당부서</th><th>연락처</th><th>이메일</th>
            <th style="width:160px;">알림설정</th><th style="width:80px;">사용</th><th style="width:120px;">관리</th>
          </tr></thead>
          <tbody id="ciManagerTableBody">
            <tr><td colspan="7" style="text-align:center;padding:30px;color:#94a3b8;">담당자가 없습니다.</td></tr>
          </tbody>
        </table>
      </div>
    </div></div>
    <div class="card" style="margin-top:16px;"><div class="card-body">
      <strong style="display:block;margin-bottom:14px;">담당자 변경 히스토리</strong>
      <div class="table-wrap">
        <table class="admin-table" id="ciManagerHistoryTable">
          <thead><tr>
            <th style="width:160px;">변경일시</th><th>담당자</th><th>변경내용</th><th style="width:120px;">변경자</th>
          </tr></thead>
          <tbody id="ciManagerHistoryBody">
            <tr><td colspan="4" style="text-align:center;padding:30px;color:#94a3b8;">이력이 없습니다.</td></tr>
          </tbody>
        </table>
      </div>
    </div></div>
  </div>

  <!-- 상태관리 탭 -->
  <div class="ci-tab-panel" id="ci-panel-status">
    <div class="card"><div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <strong>상태 항목</strong>
        <button class="btn btn-primary" onclick="ciAddStatusRow()">+ 상태 추가</button>
      </div>
      <p style="font-size:.82rem;color:#94a3b8;margin-bottom:14px;">기본 상태: 접수, 완료 / 드래그로 순서 변경 가능</p>
      <div id="ciStatusList"></div>
      <button class="btn btn-primary" style="margin-top:16px;" onclick="ciSaveStatuses()">저장</button>
    </div></div>
  </div>

  <!-- 답변설정 탭 -->
  <div class="ci-tab-panel" id="ci-panel-reply">
    <div class="card"><div class="card-body">
      <div class="form-group" style="margin-bottom:16px;">
        <label>답변 기능 사용여부</label>
        <div style="display:flex;gap:20px;margin-top:6px;">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_reply_use" value="1" onchange="ciToggleReply()"/> 사용</label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_reply_use" value="0" onchange="ciToggleReply()" checked/> 미사용</label>
        </div>
      </div>
      <div id="ci-reply-method-wrap" style="display:none;">
        <div class="form-group" style="margin-bottom:16px;">
          <label>답변 발송 방법</label>
          <div style="display:flex;gap:20px;margin-top:6px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_reply_method" value="email"/> 이메일</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_reply_method" value="alimtalk"/> 알림톡</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_reply_method" value="sms"/> 문자(SMS)</label>
          </div>
        </div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 16px;font-size:.83rem;color:#1e40af;line-height:1.7;">
          ※ 이메일 선택 시 <strong>이메일 필드</strong>가 필수로 생성됩니다.<br>
          ※ 알림톡/문자 선택 시 <strong>연락처 필드</strong>가 필수로 생성됩니다.
        </div>
      </div>
      <div style="margin-top:20px;">
        <button class="btn btn-primary" onclick="ciSaveReply()">저장</button>
      </div>
    </div></div>
  </div>

  <!-- 필드설정 탭 -->
  <div class="ci-tab-panel" id="ci-panel-fields">
    <div class="card"><div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <strong>필드 설정</strong>
        <button class="btn btn-primary" onclick="ciOpenFieldModal()">+ 필드 추가</button>
      </div>
      <div style="margin-bottom:20px;">
        <p style="font-size:.82rem;font-weight:600;color:#475569;margin-bottom:10px;">고정 필드 (삭제 불가)</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <span style="background:#e2e8f0;color:#475569;padding:5px 12px;border-radius:6px;font-size:.82rem;">신청일시</span>
          <span style="background:#e2e8f0;color:#475569;padding:5px 12px;border-radius:6px;font-size:.82rem;">수정일시</span>
          <span style="background:#e2e8f0;color:#475569;padding:5px 12px;border-radius:6px;font-size:.82rem;">조회수</span>
          <span style="background:#e2e8f0;color:#475569;padding:5px 12px;border-radius:6px;font-size:.82rem;">상태</span>
        </div>
      </div>
      <p style="font-size:.82rem;font-weight:600;color:#475569;margin-bottom:10px;">선택 필드 <small style="font-weight:400;color:#94a3b8;">(드래그로 순서 변경 / 삭제 불가, 미노출 처리만 가능)</small></p>
      <div id="ciFieldList" style="min-height:60px;"></div>
    </div></div>
  </div>

  <!-- 약관 탭 -->
  <div class="ci-tab-panel" id="ci-panel-terms">
    <div class="card"><div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
        <strong>약관 목록</strong>
        <button class="btn btn-primary" onclick="ciOpenTermModal()">+ 약관 추가</button>
      </div>
      <div class="table-wrap">
        <table class="admin-table" id="ciTermsTable">
          <thead><tr>
            <th style="width:40px;"></th>
            <th>약관명</th>
            <th style="width:80px;">필수</th>
            <th style="width:80px;">사용</th>
            <th style="width:200px;">최종수정</th>
            <th style="width:100px;">관리</th>
          </tr></thead>
          <tbody id="ciTermsTableBody">
            <tr><td colspan="6" style="text-align:center;padding:30px;color:#94a3b8;">등록된 약관이 없습니다.</td></tr>
          </tbody>
        </table>
      </div>
    </div></div>
  </div>
</div>

<!-- ========================
     문의 내역 (동적)
     ======================== -->
<div class="page" id="page-customInquiryData">
  <div class="page-header">
    <div><h2 id="ciDataTitle">문의 내역</h2></div>
    <button class="btn btn-outline" onclick="ciExcelDownload()">📥 엑셀 다운로드</button>
  </div>
  <div class="card"><div class="card-body">
    <div class="table-filters">
      <input type="date" class="form-control" id="ciDataSearchFrom"/>
      <span style="align-self:center;color:#94a3b8;">~</span>
      <input type="date" class="form-control" id="ciDataSearchTo"/>
      <div id="ciDynamicFilters" style="display:contents;"></div>
      <input type="text" class="form-control" id="ciDataSearchKeyword" placeholder="제목 검색" onkeydown="if(event.key==='Enter')ciFetchData()"/>
      <button class="btn btn-outline" onclick="ciFetchData()">🔍 검색</button>
      <button class="btn btn-ghost" onclick="ciResetSearch()">초기화</button>
    </div>
    <div class="bulk-bar" id="ciDataBulk">
      <span>선택 <span class="bulk-count">0</span>건</span>
      <button class="btn btn-sm btn-danger" onclick="ciDeleteSelected()">선택 삭제</button>
    </div>
    <div class="table-wrap">
      <table class="admin-table" id="ciDataTable">
        <thead><tr id="ciDataTableHead">
          <th style="width:50px;">#</th>
          <th>제목</th>
          <th style="width:160px;">신청일시</th>
          <th style="width:80px;">조회수</th>
          <th style="width:100px;">상태</th>
          <th style="width:80px;">상세</th>
        </tr></thead>
        <tbody id="ciDataTableBody">
          <tr><td colspan="6" style="text-align:center;padding:40px;color:#94a3b8;">로딩 중...</td></tr>
        </tbody>
      </table>
    </div>
    <div id="ciDataPagination" style="display:flex;gap:6px;justify-content:center;padding:16px 0;"></div>
  </div></div>
</div>
