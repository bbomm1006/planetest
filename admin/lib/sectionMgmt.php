<!-- 섹션 관리 -->
      <div class="page" id="page-sectionMgmt">
        <div class="page-header">
          <div>
            <h2>섹션 관리</h2>
            <p>프론트 메인화면 섹션을 관리합니다. 파일명 입력 시 <code>lib/파일명.php</code>와 연결됩니다. 헤더 메뉴 표시명을 설정하면 내비게이션에 자동 추가됩니다.</p>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary" onclick="initDynSections()">↺ 기본값 초기화</button>
            <button class="btn btn-primary" onclick="openDynSectionModal(null)">+ 섹션 추가</button>
          </div>
        </div>

        <div class="card" style="overflow:hidden;">
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

      <!-- 섹션 추가/수정 모달 -->
      <div id="dynSectionModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9000;align-items:center;justify-content:center;">
        <div style="background:#fff;border-radius:10px;padding:28px 32px;width:540px;max-width:95vw;max-height:90vh;overflow-y:auto;">
          <h3 id="dynSecModalTitle" style="margin:0 0 22px;font-size:1.1rem;font-weight:700;">섹션 추가</h3>
          <input type="hidden" id="dynSecId">

          <div class="form-group" style="margin-bottom:16px;">
            <label style="display:block;margin-bottom:5px;font-size:.875rem;font-weight:600;">섹션명 <span style="color:#e53e3e;">*</span></label>
            <input type="text" id="dynSecName" class="form-control" placeholder="관리용 이름 (예: 이벤트 배너 섹션)" style="width:100%;">
            <p style="margin:4px 0 0;font-size:.75rem;color:#999;">관리자 목록에서만 표시됩니다.</p>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label style="display:block;margin-bottom:5px;font-size:.875rem;font-weight:600;">연결 파일명 <span style="color:#e53e3e;">*</span></label>
            <div style="display:flex;align-items:center;border:1px solid #d1d5db;border-radius:6px;overflow:hidden;">
              <span style="padding:8px 10px;background:#f3f4f6;color:#6b7280;font-size:.8rem;white-space:nowrap;border-right:1px solid #d1d5db;">lib/</span>
              <input type="text" id="dynSecFile" class="form-control" placeholder="section_event_banner" style="flex:1;border:none;border-radius:0;box-shadow:none;">
              <span style="padding:8px 10px;background:#f3f4f6;color:#6b7280;font-size:.8rem;white-space:nowrap;border-left:1px solid #d1d5db;">.php</span>
            </div>
            <p style="margin:5px 0 0;font-size:.75rem;color:#999;">영문·숫자·_·- 만 사용 가능. 예: <code>section_event_banner</code></p>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
            <div class="form-group">
              <label style="display:block;margin-bottom:5px;font-size:.875rem;font-weight:600;">섹션 제목</label>
              <input type="text" id="dynSecTitle" class="form-control" placeholder="프론트 출력 제목" style="width:100%;">
            </div>
            <div class="form-group">
              <label style="display:block;margin-bottom:5px;font-size:.875rem;font-weight:600;">섹션 서브제목</label>
              <input type="text" id="dynSecSubtitle" class="form-control" placeholder="제목 아래 설명 문구" style="width:100%;">
            </div>
          </div>

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
                <p style="margin:4px 0 0;font-size:.72rem;color:#999;">섹션 HTML의 <code>id</code> 속성값</p>
              </div>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:24px;margin-bottom:22px;">
            <div class="form-group" style="margin:0;">
              <label style="display:block;margin-bottom:5px;font-size:.875rem;font-weight:600;">순서</label>
              <input type="number" id="dynSecOrder" class="form-control" value="0" style="width:80px;">
            </div>
            <div class="form-group" style="margin:0;">
              <label style="display:block;margin-bottom:5px;font-size:.875rem;font-weight:600;">노출 여부</label>
              <label class="toggle" style="cursor:pointer;display:flex;align-items:center;gap:10px;margin-top:6px;">
                <input type="checkbox" id="dynSecActive" checked>
                <span class="toggle-slider"></span>
                <span id="dynSecActiveLabel" style="display:none;"></span>
              </label>
            </div>
          </div>

          <div style="display:flex;gap:10px;justify-content:flex-end;padding-top:12px;border-top:1px solid #f0f0f0;">
            <button class="btn btn-secondary" onclick="closeDynSectionModal()">취소</button>
            <button class="btn btn-primary" onclick="saveDynSection()">저장</button>
          </div>
        </div>
      </div>
