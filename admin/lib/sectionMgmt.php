<!-- 섹션 관리 -->
<div class="page" id="page-sectionMgmt">
  <div class="page-header">
    <div>
      <h2>섹션 관리</h2>
      <p>섹션 그룹별로 프론트 섹션을 관리합니다. 그룹을 추가해 여러 페이지에 다른 구성을 적용할 수 있습니다.</p>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-secondary" onclick="migrateDynSections()" title="풋터 중복 제거, 파일 없는 섹션 비활성화, 코어 순서 고정">🔧 DB 정리</button>
      <button class="btn btn-secondary" onclick="initDynSections()">↺ 기본값 초기화</button>
      <button class="btn btn-secondary" onclick="openSectionGroupModal(null)">+ 그룹 추가</button>
      <button class="btn btn-primary" onclick="openDynSectionModal(null)">+ 섹션 추가</button>
    </div>
  </div>

  <!-- 섹션 그룹 탭 -->
  <div class="card" style="margin-bottom:16px;">
    <div class="card-body" style="padding:12px 16px;">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <span style="font-size:.8rem;font-weight:600;color:var(--text3);white-space:nowrap;">섹션 그룹:</span>
        <div id="sectionGroupTabs" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
      </div>
    </div>
  </div>

  <div class="card" style="overflow:hidden;">
    <div class="card-header" style="justify-content:space-between;">
      <h3 id="sectionGroupCurrentName">기본 그룹</h3>
      <button id="sectionGroupDeleteBtn" class="btn btn-sm btn-danger" style="display:none;" onclick="deleteSectionGroup()">그룹 삭제</button>
    </div>
    <div class="table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width:84px;text-align:center;">순서</th>
            <th style="width:160px;">섹션명</th>
            <th>파일명 (lib/)</th>
            <th style="width:140px;">헤더 메뉴</th>
            <th style="width:76px;text-align:center;">노출</th>
            <th style="width:120px;text-align:center;">관리</th>
          </tr>
        </thead>
        <tbody id="dynSectionTbody">
          <tr><td colspan="6" style="text-align:center;color:#aaa;padding:20px;">불러오는 중...</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</div>

<!-- 섹션 그룹 추가/수정 모달 -->
<div class="modal-overlay" id="sectionGroupModal">
  <div class="modal">
    <div class="modal-header">
      <h3 id="sectionGroupModalTitle">섹션 그룹 추가</h3>
      <button class="modal-close" onclick="closeModal('sectionGroupModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="sgEditId">
      <div class="form-group">
        <label>그룹명 <span class="req">*</span></label>
        <input type="text" class="form-control" id="sgEditName" placeholder="예: 이벤트 페이지용 섹션">
        <p style="margin:4px 0 0;font-size:.75rem;color:#999;">새 그룹 생성 시 기본 4개 섹션(전환바·NAV·배너·풋터)이 자동으로 포함됩니다.</p>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('sectionGroupModal')">취소</button>
      <button class="btn btn-primary" onclick="saveSectionGroup()">저장</button>
    </div>
  </div>
</div>

<!-- 섹션 추가/수정 모달 -->
<div class="modal-overlay" id="dynSectionModal">
  <div class="modal modal-lg">
    <div class="modal-header">
      <h3 id="dynSecModalTitle">섹션 추가</h3>
      <button class="modal-close" onclick="closeDynSectionModal()">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="dynSecId">

      <div class="form-group" style="margin-bottom:16px;">
        <label>섹션명 <span class="req">*</span></label>
        <input type="text" id="dynSecName" class="form-control" placeholder="관리용 이름 (예: 이벤트 배너 섹션)">
        <p style="margin:4px 0 0;font-size:.75rem;color:#999;">관리자 목록에서만 표시됩니다.</p>
      </div>

      <div class="form-group" style="margin-bottom:6px;">
        <label>연결 파일명 <span class="req">*</span></label>
        <select id="dynSecFileSelect" class="form-control" style="width:100%;margin-bottom:6px;" onchange="onDynSecFileSelect(this.value)">
          <option value="">— 목록에서 선택 —</option>
          <optgroup label="콘텐츠 섹션">
            <option value="products">products — 제품 목록</option>
            <option value="benefits">benefits — 혜택/특징</option>
            <option value="bbs_video">bbs_video — 영상 섹션</option>
            <option value="bbs_review">bbs_review — 후기 섹션</option>
            <option value="bbs_event">bbs_event — 이벤트 섹션</option>
            <option value="stores">stores — 매장찾기</option>
            <option value="bbs_notice">bbs_notice — 공지사항</option>
            <option value="bbs_faq">bbs_faq — FAQ</option>
            <option value="bbs_gallery">bbs_gallery — 갤러리</option>
            <option value="bbs_photogallery">bbs_photogallery — 포토갤러리</option>
            <option value="bbs_slidegallery">bbs_slidegallery — 슬라이드갤러리</option>
            <option value="consult">consult — 상담 섹션</option>
            <option value="qna">qna — QnA</option>
          </optgroup>
          <optgroup label="폼 (파라미터 필수)">
            <option value="custom_inquiry_front">custom_inquiry_front — 문의폼 ★params필수</option>
            <option value="bkf_front">bkf_front — 예약폼 ★params필수</option>
          </optgroup>
          <optgroup label="직접 입력">
            <option value="__custom__">직접 입력...</option>
          </optgroup>
        </select>
        <div style="display:flex;align-items:center;border:1px solid #d1d5db;border-radius:6px;overflow:hidden;">
          <span style="padding:8px 10px;background:#f3f4f6;color:#6b7280;font-size:.8rem;white-space:nowrap;border-right:1px solid #d1d5db;">lib/</span>
          <input type="text" id="dynSecFile" class="form-control" placeholder="파일명을 위에서 선택하거나 직접 입력" style="flex:1;border:none;border-radius:0;box-shadow:none;">
          <span style="padding:8px 10px;background:#f3f4f6;color:#6b7280;font-size:.8rem;white-space:nowrap;border-left:1px solid #d1d5db;">.php</span>
        </div>
        <p style="margin:5px 0 0;font-size:.75rem;color:#999;">영문·숫자·_·- 만 사용 가능. 실제 <code>lib/파일명.php</code> 파일이 있어야 출력됩니다.</p>
      </div>

      <div id="dynSecFileGuide" style="display:none;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px 14px;margin-bottom:14px;font-size:.78rem;color:#92400e;line-height:1.6;"></div>

      <div style="background:#f8f9fc;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px;margin-bottom:16px;">
        <p style="margin:0 0 10px;font-size:.8rem;font-weight:700;color:#374151;">헤더 메뉴 연결 <span style="font-weight:400;color:#999;">(비워두면 메뉴 미표시)</span></p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group" style="margin:0;">
            <label style="display:block;margin-bottom:5px;font-size:.8rem;font-weight:600;">메뉴 표시명</label>
            <input type="text" id="dynSecNavLabel" class="form-control" placeholder="예: 갤러리" style="width:100%;">
          </div>
          <div class="form-group" style="margin:0;">
            <label style="display:block;margin-bottom:5px;font-size:.8rem;font-weight:600;">섹션 앵커 ID</label>
            <div style="display:flex;align-items:center;border:1px solid #d1d5db;border-radius:6px;overflow:hidden;">
              <span style="padding:7px 8px;background:#f3f4f6;color:#6b7280;font-size:.8rem;white-space:nowrap;border-right:1px solid #d1d5db;">#</span>
              <input type="text" id="dynSecAnchorId" class="form-control" placeholder="gallery" style="flex:1;border:none;border-radius:0;box-shadow:none;">
            </div>
            <p style="margin:4px 0 0;font-size:.72rem;color:#999;">메뉴 클릭 시 이 섹션으로 스크롤됩니다.</p>
          </div>
        </div>
      </div>

      <div style="background:#f0f4ff;border:1px solid #c7d7fc;border-radius:8px;padding:14px 16px;margin-bottom:16px;">
        <p style="margin:0 0 8px;font-size:.8rem;font-weight:700;color:#374151;">폼 파라미터 <span style="font-weight:400;color:#999;">(문의폼·예약폼 전용)</span></p>
        <input type="text" id="dynSecParams" class="form-control" placeholder="예) form1 또는 booking_00" style="width:100%;margin-bottom:8px;">
        <table style="width:100%;font-size:.75rem;color:#475569;border-collapse:collapse;">
          <tr style="background:#e8eeff;">
            <th style="padding:5px 8px;text-align:left;font-weight:600;">파일명</th>
            <th style="padding:5px 8px;text-align:left;font-weight:600;">파라미터(params)</th>
            <th style="padding:5px 8px;text-align:left;font-weight:600;">어디서 확인?</th>
          </tr>
          <tr>
            <td style="padding:5px 8px;border-bottom:1px solid #dde4f5;"><code>custom_inquiry_front</code></td>
            <td style="padding:5px 8px;border-bottom:1px solid #dde4f5;">문의폼 테이블명 (예: <code>form1</code>)</td>
            <td style="padding:5px 8px;border-bottom:1px solid #dde4f5;">관리자 → 문의폼 관리</td>
          </tr>
          <tr>
            <td style="padding:5px 8px;"><code>bkf_front</code></td>
            <td style="padding:5px 8px;">예약폼 슬러그 (예: <code>booking_00</code>)</td>
            <td style="padding:5px 8px;">관리자 → 예약 설정</td>
          </tr>
        </table>
      </div>

      <div style="display:flex;align-items:center;gap:24px;">
        <div class="form-group" style="margin:0;">
          <label>순서</label>
          <input type="number" id="dynSecOrder" class="form-control" value="0" style="width:80px;">
          <p style="margin:4px 0 0;font-size:.72rem;color:#999;">숫자가 작을수록 위에 표시</p>
        </div>
        <div class="form-group" style="margin:0;">
          <label>노출 여부</label>
          <label class="toggle" style="cursor:pointer;display:flex;align-items:center;gap:10px;margin-top:6px;">
            <input type="checkbox" id="dynSecActive" checked>
            <span class="toggle-slider"></span>
            <span id="dynSecActiveLabel" style="font-size:.8rem;color:#555;"></span>
          </label>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeDynSectionModal()">취소</button>
      <button class="btn btn-primary" onclick="saveDynSection()">저장</button>
    </div>
  </div>
</div>
