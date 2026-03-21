<div class="modal-overlay" id="comboManagerModal">
  <div class="modal modal-md">
    <div class="modal-header">
      <h3 id="comboManagerModalTitle">담당자 추가</h3>
      <button class="modal-close" onclick="closeModal('comboManagerModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="combo_mgr_id"/>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
        <div class="form-group">
          <label>이름 <span class="req">*</span></label>
          <input type="text" class="form-control" id="combo_mgr_name"/>
        </div>

        <div class="form-group">
          <label>담당부서 <span class="req">*</span></label>
          <input type="text" class="form-control" id="combo_mgr_department" placeholder="예: 영업팀"/>
        </div>
        <div class="form-group">
          <label>핸드폰번호</label>
          <input type="text" class="form-control" id="combo_mgr_phone" placeholder="010-0000-0000"/>
        </div>
        <div class="form-group">
          <label>이메일</label>
          <input type="email" class="form-control" id="combo_mgr_email"/>
        </div>
      </div>

      <hr style="border:none;border-top:1px solid var(--border);margin:16px 0;">
      <p style="font-size:.85rem;font-weight:600;margin-bottom:12px;">알림 설정</p>
      <div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:12px;">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;">
          <input type="checkbox" id="combo_mgr_notify_email"/> 이메일
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;">
          <input type="checkbox" id="combo_mgr_notify_sheet" onchange="comboToggleSheetPanel(this)"/> 구글시트
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;">
          <input type="checkbox" id="combo_mgr_notify_alimtalk"/> 알림톡
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;">
          <input type="checkbox" id="combo_mgr_notify_sms"/> 문자(SMS)
        </label>
      </div>

      <!-- 구글시트 설정 패널 -->
      <div id="combo_mgr_sheet_panel" style="display:none;background:#f8fafc;border-radius:8px;padding:14px;margin-bottom:12px;">
        <p style="font-size:.83rem;font-weight:600;margin-bottom:8px;">구글 스프레드시트 설정 (Apps Script 웹훅)</p>
        <div class="form-group" style="margin-bottom:10px;">
          <label style="font-size:.8rem;">Apps Script 웹훅 URL <span class="req">*</span></label>
          <input type="text" class="form-control" id="combo_mgr_sheet_id" placeholder="https://script.google.com/macros/s/.../exec"/>
        </div>
        <div class="form-group" style="margin-bottom:12px;">
          <label style="font-size:.8rem;">시트명 <small style="color:#94a3b8;font-weight:400;">(비워두면 Sheet1)</small></label>
          <input type="text" class="form-control" id="combo_mgr_sheet_name" placeholder="Sheet1"/>
        </div>

        <!-- Apps Script 예시 코드 -->
        <div style="border-top:1px solid #e2e8f0;padding-top:12px;margin-top:4px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <p style="font-size:.78rem;font-weight:600;color:#475569;margin:0;">📋 Apps Script 코드 (복사해서 붙여넣기)</p>
            <button type="button" onclick="comboMgrCopyScript()" style="font-size:.72rem;padding:3px 10px;border:1px solid #cbd5e1;border-radius:5px;background:#fff;cursor:pointer;color:#475569;">복사</button>
          </div>
          <pre id="combo_mgr_script_code" style="background:#1e293b;color:#e2e8f0;border-radius:6px;padding:12px;font-size:.72rem;line-height:1.6;overflow-x:auto;margin:0;white-space:pre;">function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheetName = data.sheet_name || 'Sheet1';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);

    // 헤더가 없으면 첫 행에 추가
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['신청일시','이름','연락처','신청제품','상담시간','카드할인','최종금액','추가내용']);
    }

    sheet.appendRow([
      data.created_at || new Date().toLocaleString('ko-KR'),
      data.name        || '',
      data.phone       || '',
      data.product_name|| '',
      data.time_slot   || '',
      data.card_discount_name || '',
      data.final_price || '',
      data.message     || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({result:'ok'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({result:'error', msg: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}</pre>
          <p style="font-size:.72rem;color:#94a3b8;margin:8px 0 0;">
            ① Google Sheets 열기 → 확장 프로그램 → Apps Script<br>
            ② 위 코드 전체 붙여넣기 → 저장 → 배포 → 새 배포<br>
            ③ 유형: 웹 앱 / 액세스: 모든 사용자 → 배포 후 URL 위에 입력
          </p>
        </div>
      </div>

      <hr style="border:none;border-top:1px solid var(--border);margin:16px 0;">
      <p style="font-size:.85rem;font-weight:600;margin-bottom:12px;">사용여부</p>
      <div style="display:flex;gap:20px;">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;">
          <input type="radio" name="combo_mgr_active" value="1" checked/> 사용
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;">
          <input type="radio" name="combo_mgr_active" value="0"/> 미사용
        </label>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('comboManagerModal')">취소</button>
      <button class="btn btn-primary" onclick="saveComboManager()">저장</button>
    </div>
  </div>
</div>
