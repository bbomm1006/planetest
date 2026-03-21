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
          <label>담당부서</label>
          <input type="text" class="form-control" id="combo_mgr_dept"/>
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
        <div class="form-group">
          <label style="font-size:.8rem;">시트명 <small style="color:#94a3b8;font-weight:400;">(비워두면 Sheet1)</small></label>
          <input type="text" class="form-control" id="combo_mgr_sheet_name" placeholder="Sheet1"/>
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
