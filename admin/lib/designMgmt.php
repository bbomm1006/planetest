<!-- ========================
     디자인 만들기
     ======================== -->
<div class="page" id="page-designMgmt">
  <div class="page-header">
    <div>
      <h2>디자인 만들기</h2>
      <p style="font-size:.82rem;color:var(--text3);margin-top:4px;">섹션 그룹과 컬러 그룹을 조합해 새 페이지를 생성합니다.</p>
    </div>
    <button class="btn btn-primary" onclick="openDesignPageModal(null)">+ 페이지 만들기</button>
  </div>

  <div class="card">
    <div class="card-header"><h3>생성된 페이지 목록</h3></div>
    <div class="card-body" style="padding:0;">
      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>레이블</th>
              <th>파일명</th>
              <th>섹션 그룹</th>
              <th>컬러 그룹</th>
              <th>접속 URL</th>
              <th style="width:120px;text-align:center;">관리</th>
            </tr>
          </thead>
          <tbody id="designPageTbody">
            <tr><td colspan="7" style="text-align:center;color:#aaa;padding:24px;">불러오는 중...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<!-- 페이지 생성/수정 모달 -->
<div class="modal-overlay" id="designPageModal">
  <div class="modal modal-lg">
    <div class="modal-header">
      <h3 id="designPageModalTitle">페이지 만들기</h3>
      <button class="modal-close" onclick="closeModal('designPageModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="dpId">

      <div class="form-grid" style="margin-bottom:16px;">
        <div class="form-group">
          <label>페이지 레이블 <span style="font-size:.75rem;color:var(--text3);">(관리용 이름)</span></label>
          <input type="text" class="form-control" id="dpLabel" placeholder="예: 이벤트 페이지">
        </div>
        <div class="form-group">
          <label>파일명 <span class="req">*</span></label>
          <div style="display:flex;align-items:center;border:1px solid #d1d5db;border-radius:6px;overflow:hidden;">
            <span style="padding:8px 10px;background:#f3f4f6;color:#6b7280;font-size:.8rem;white-space:nowrap;border-right:1px solid #d1d5db;">/</span>
            <input type="text" class="form-control" id="dpSlug" placeholder="event" style="flex:1;border:none;border-radius:0;box-shadow:none;">
            <span style="padding:8px 10px;background:#f3f4f6;color:#6b7280;font-size:.8rem;white-space:nowrap;border-left:1px solid #d1d5db;">.php</span>
          </div>
          <p style="margin:4px 0 0;font-size:.75rem;color:#999;">영문·숫자·_·- 만 사용. 저장 시 실제 파일이 생성됩니다.</p>
        </div>
      </div>

      <div class="form-grid" style="margin-bottom:16px;">
        <div class="form-group">
          <label>섹션 그룹 <span class="req">*</span></label>
          <select class="form-control" id="dpSectionGroupId">
            <option value="">로딩 중...</option>
          </select>
        </div>
        <div class="form-group">
          <label>컬러 그룹 <span class="req">*</span></label>
          <select class="form-control" id="dpColorGroupId">
            <option value="">로딩 중...</option>
          </select>
        </div>
      </div>

      <div class="form-group" style="margin-bottom:0;">
        <label>추가 CSS <span style="font-size:.75rem;color:var(--text3);">(이 페이지에만 적용되는 CSS)</span></label>
        <textarea class="form-control" id="dpExtraCss" rows="6"
          placeholder=":root { --color-base: #ff0000; }&#10;.hero { background: #000; }"
          style="font-family:monospace;font-size:.82rem;"></textarea>
        <p style="margin:4px 0 0;font-size:.75rem;color:#999;">기본 스타일 위에 덮어쓰기됩니다. 비워두면 기본 스타일만 적용됩니다.</p>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('designPageModal')">취소</button>
      <button class="btn btn-primary" onclick="saveDesignPage()">저장 및 파일 생성</button>
    </div>
  </div>
</div>
