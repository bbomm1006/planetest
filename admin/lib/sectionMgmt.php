<!-- 섹션 관리 -->
      <div class="page" id="page-sectionMgmt">
        <div class="page-header">
          <div>
            <h2>섹션 관리</h2>
            <p>프론트 메인화면 섹션을 순서대로 관리합니다. <strong>서비스 전환바·NAV·히어로배너·풋터</strong>는 기본값이며, 나머지 섹션은 직접 추가하세요.</p>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary" onclick="migrateDynSections()" title="풋터 중복 제거, 파일 없는 섹션 비활성화, 코어 순서 고정">🔧 DB 정리</button>
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
        <div style="background:#fff;border-radius:10px;padding:28px 32px;width:580px;max-width:95vw;max-height:92vh;overflow-y:auto;">
          <h3 id="dynSecModalTitle" style="margin:0 0 20px;font-size:1.1rem;font-weight:700;">섹션 추가</h3>
          <input type="hidden" id="dynSecId">

          <!-- 섹션명 -->
          <div class="form-group" style="margin-bottom:16px;">
            <label style="display:block;margin-bottom:5px;font-size:.875rem;font-weight:600;">섹션명 <span style="color:#e53e3e;">*</span></label>
            <input type="text" id="dynSecName" class="form-control" placeholder="관리용 이름 (예: 이벤트 배너 섹션)" style="width:100%;">
            <p style="margin:4px 0 0;font-size:.75rem;color:#999;">관리자 목록에서만 표시됩니다.</p>
          </div>

          <!-- 연결 파일명 — 드롭다운 + 직접입력 병행 -->
          <div class="form-group" style="margin-bottom:6px;">
            <label style="display:block;margin-bottom:5px;font-size:.875rem;font-weight:600;">연결 파일명 <span style="color:#e53e3e;">*</span></label>
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

          <!-- 파일별 가이드 안내 박스 -->
          <div id="dynSecFileGuide" style="display:none;background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px 14px;margin-bottom:14px;font-size:.78rem;color:#92400e;line-height:1.6;"></div>

          <!-- 제목 / 서브제목 -->
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

          <!-- 헤더 메뉴 연결 -->
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

          <!-- 폼 파라미터 -->
          <div style="background:#f0f4ff;border:1px solid #c7d7fc;border-radius:8px;padding:14px 16px;margin-bottom:16px;">
            <p style="margin:0 0 8px;font-size:.8rem;font-weight:700;color:#374151;">폼 파라미터 <span style="font-weight:400;color:#999;">(문의폼·예약폼 전용)</span></p>
            <input type="text" id="dynSecParams" class="form-control" placeholder="예) form1 또는 booking_00" style="width:100%;margin-bottom:8px;">
            <table style="width:100%;font-size:.75rem;color:#475569;border-collapse:collapse;">
              <tr style="background:#e8eeff;">
                <th style="padding:5px 8px;text-align:left;font-weight:600;border-radius:4px 0 0 0;">파일명</th>
                <th style="padding:5px 8px;text-align:left;font-weight:600;">파라미터(params)</th>
                <th style="padding:5px 8px;text-align:left;font-weight:600;border-radius:0 4px 0 0;">어디서 확인?</th>
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

          <!-- 순서 / 노출 -->
          <div style="display:flex;align-items:center;gap:24px;margin-bottom:22px;">
            <div class="form-group" style="margin:0;">
              <label style="display:block;margin-bottom:5px;font-size:.875rem;font-weight:600;">순서</label>
              <input type="number" id="dynSecOrder" class="form-control" value="0" style="width:80px;">
              <p style="margin:4px 0 0;font-size:.72rem;color:#999;">숫자가 작을수록 위에 표시</p>
            </div>
            <div class="form-group" style="margin:0;">
              <label style="display:block;margin-bottom:5px;font-size:.875rem;font-weight:600;">노출 여부</label>
              <label class="toggle" style="cursor:pointer;display:flex;align-items:center;gap:10px;margin-top:6px;">
                <input type="checkbox" id="dynSecActive" checked>
                <span class="toggle-slider"></span>
                <span id="dynSecActiveLabel" style="font-size:.8rem;color:#555;"></span>
              </label>
            </div>
          </div>

          <div style="display:flex;gap:10px;justify-content:flex-end;padding-top:12px;border-top:1px solid #f0f0f0;">
            <button class="btn btn-secondary" onclick="closeDynSectionModal()">취소</button>
            <button class="btn btn-primary" onclick="saveDynSection()">저장</button>
          </div>
        </div>
      </div>
