<!-- ============================================================
     담당관리자 추가/수정 모달
     ============================================================ -->
<div class="modal-overlay" id="ciManagerModal">
  <div class="modal modal-md">
    <div class="modal-header">
      <h3 id="ciManagerModalTitle">담당자 추가</h3>
      <button class="modal-close" onclick="closeModal('ciManagerModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="ci_mgr_id"/>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
        <div class="form-group">
          <label>이름 <span class="req">*</span></label>
          <input type="text" class="form-control" id="ci_mgr_name"/>
        </div>
        <div class="form-group">
          <label>담당부서</label>
          <input type="text" class="form-control" id="ci_mgr_dept"/>
        </div>
        <div class="form-group">
          <label>핸드폰번호</label>
          <input type="text" class="form-control" id="ci_mgr_phone" placeholder="010-0000-0000"/>
        </div>
        <div class="form-group">
          <label>이메일</label>
          <input type="email" class="form-control" id="ci_mgr_email"/>
        </div>
      </div>

      <hr style="border:none;border-top:1px solid var(--border);margin:16px 0;">
      <p style="font-size:.85rem;font-weight:600;margin-bottom:12px;">알림 설정</p>
      <div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:16px;">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;">
          <input type="checkbox" id="ci_mgr_notify_email"/> 이메일
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;">
          <input type="checkbox" id="ci_mgr_notify_sheet" onchange="ciToggleMgrPanel('sheet')"/> 구글시트
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;">
          <input type="checkbox" id="ci_mgr_notify_alimtalk" onchange="ciToggleMgrPanel('alimtalk')"/> 알림톡
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;">
          <input type="checkbox" id="ci_mgr_notify_sms"/> 문자(SMS)
        </label>
      </div>

      <!-- 구글시트 설정 -->
      <div id="ci-mgr-panel-sheet" style="display:none;background:#f8fafc;border-radius:8px;padding:14px;margin-bottom:12px;">
        <p style="font-size:.83rem;font-weight:600;margin-bottom:8px;">구글 스프레드시트 설정 (Apps Script 웹훅)</p>
        <div class="form-group" style="margin-bottom:10px;">
          <label style="font-size:.8rem;">Apps Script 웹훅 URL <span class="req">*</span></label>
          <input type="text" class="form-control" id="ci_mgr_sheet_id" placeholder="https://script.google.com/macros/s/.../exec"/>
        </div>
        <div class="form-group" style="margin-bottom:10px;">
          <label style="font-size:.8rem;">시트명 <small style="color:#94a3b8;font-weight:400;">(비워두면 Sheet1)</small></label>
          <input type="text" class="form-control" id="ci_mgr_sheet_name" placeholder="Sheet1"/>
        </div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:12px 14px;font-size:.78rem;color:#1e40af;line-height:1.85;">
          <strong>📋 Apps Script 웹훅 설정 방법</strong><br><br>
          <strong>① 스프레드시트 열기</strong><br>
          구글 스프레드시트에서 <strong>확장 프로그램 → Apps Script</strong> 클릭<br><br>
          <strong>② 아래 코드를 Code.gs에 붙여넣기</strong><br>
          <div style="background:#1e293b;color:#e2e8f0;border-radius:6px;padding:10px 12px;margin:8px 0;font-family:monospace;font-size:.74rem;line-height:1.7;white-space:pre-wrap;word-break:break-all;">function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheetName = data.sheet_name || 'Sheet1';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName) || ss.getSheets()[0];

    // 헤더가 없으면 첫 행에 추가
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(data.headers || []);
    }

    // 데이터 행 추가
    sheet.appendRow(data.values || []);

    return ContentService
      .createTextOutput(JSON.stringify({ok: true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ok: false, error: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}</div>
          <strong>③ 저장 후 배포</strong><br>
          오른쪽 상단 <strong>배포 → 새 배포</strong> 클릭<br>
          → 유형: <strong>웹 앱</strong> 선택<br>
          → 액세스 권한: <strong>모든 사용자</strong> 선택<br>
          → <strong>배포</strong> 버튼 클릭<br><br>
          <strong>④ 웹 앱 URL 복사</strong><br>
          배포 완료 후 나오는 URL(<code style="background:#dbeafe;padding:1px 5px;border-radius:3px;">https://script.google.com/macros/s/.../exec</code>)을<br>
          위 <strong>Apps Script 웹훅 URL</strong> 칸에 붙여넣기<br><br>
          ※ 코드 수정 후에는 반드시 <strong>새 배포(버전 업)</strong>를 해야 반영됩니다.
        </div>
      </div>

      <!-- 알림톡 설정 -->
      <div id="ci-mgr-panel-alimtalk" style="display:none;background:#f8fafc;border-radius:8px;padding:14px;margin-bottom:12px;">
        <p style="font-size:.83rem;font-weight:600;margin-bottom:8px;">문자(SMS) / 알림톡 설정 (Solapi)</p>
        <div class="form-group" style="margin-bottom:10px;">
          <label style="font-size:.8rem;">API Key <span class="req">*</span></label>
          <input type="text" class="form-control" id="ci_mgr_alimtalk_key" placeholder="Solapi API Key"/>
        </div>
        <div class="form-group" style="margin-bottom:10px;">
          <label style="font-size:.8rem;">API Secret <span class="req">*</span></label>
          <input type="text" class="form-control" id="ci_mgr_alimtalk_secret" placeholder="Solapi API Secret"/>
        </div>
        <div class="form-group" style="margin-bottom:10px;">
          <label style="font-size:.8rem;">발신번호 <span class="req">*</span></label>
          <input type="text" class="form-control" id="ci_mgr_alimtalk_sender" placeholder="01012345678 (- 없이 입력)"/>
        </div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px 12px;font-size:.78rem;color:#1e40af;line-height:1.7;">
          <strong>Solapi 설정 방법</strong><br>
          1. <a href="https://solapi.com/" target="_blank" style="color:#2563eb;">Solapi 로그인</a> → API Key 관리에서 Key/Secret 발급<br>
          2. 발송 준비 → 발신번호 등록 (심사 후 사용 가능)<br>
          3. 알림톡은 카카오 비즈니스 채널 등록 및 템플릿 승인 필요<br>
          ※ SMS는 별도 템플릿 없이 바로 발송 가능
        </div>
      </div>

      <div class="form-group">
        <label>사용여부</label>
        <div style="display:flex;gap:16px;margin-top:6px;">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_mgr_active" value="1"/> 사용</label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_mgr_active" value="0"/> 미사용</label>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('ciManagerModal')">취소</button>
      <button class="btn btn-primary" onclick="ciSaveManager()">저장</button>
    </div>
  </div>
</div>

<!-- ============================================================
     필드 추가/수정 모달
     ============================================================ -->
<div class="modal-overlay" id="ciFieldModal">
  <div class="modal modal-md">
    <div class="modal-header">
      <h3 id="ciFieldModalTitle">필드 추가</h3>
      <button class="modal-close" onclick="closeModal('ciFieldModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="ci_field_id"/>
      <div class="form-group" style="margin-bottom:14px;">
        <label>항목명 <span class="req">*</span></label>
        <input type="text" class="form-control" id="ci_field_label" placeholder="예: 문의 유형"/>
      </div>
      <div class="form-group" style="margin-bottom:14px;">
        <label>필드 키 <small style="font-weight:400;color:#94a3b8;">(자동 생성)</small></label>
        <input type="text" class="form-control" id="ci_field_key" readonly style="background:#f8fafc;color:#64748b;" placeholder="항목명 입력 시 자동 생성"/>
        <p style="font-size:.75rem;color:#94a3b8;margin-top:3px;">DB 컬럼명으로 사용됩니다. 한번 생성 후 변경 불가.</p>
      </div>
      <div class="form-group" style="margin-bottom:14px;">
        <label>타입 <span class="req">*</span></label>
        <select class="form-control" id="ci_field_type" onchange="ciOnFieldTypeChange()">
          <option value="">선택하세요</option>
          <option value="input">input (텍스트)</option>
          <option value="textarea">textarea (장문)</option>
          <option value="select">select (드롭다운)</option>
          <option value="radio">radio (단일선택)</option>
          <option value="checkbox">checkbox (다중선택)</option>
          <option value="file">file (파일업로드)</option>
        </select>
      </div>
      <!-- input/textarea: placeholder -->
      <div class="form-group" id="ci-field-placeholder-wrap" style="margin-bottom:14px;display:none;">
        <label>Placeholder</label>
        <input type="text" class="form-control" id="ci_field_placeholder"/>
      </div>
      <!-- file: 확장자 -->
      <div class="form-group" id="ci-field-ext-wrap" style="margin-bottom:14px;display:none;">
        <label>허용 확장자</label>
        <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:6px;">
          <label style="display:flex;align-items:center;gap:4px;font-weight:400;"><input type="checkbox" name="ci_field_ext" value="jpg,jpeg,png,gif,webp"/> 이미지</label>
          <label style="display:flex;align-items:center;gap:4px;font-weight:400;"><input type="checkbox" name="ci_field_ext" value="pdf"/> PDF</label>
          <label style="display:flex;align-items:center;gap:4px;font-weight:400;"><input type="checkbox" name="ci_field_ext" value="doc,docx"/> Word</label>
          <label style="display:flex;align-items:center;gap:4px;font-weight:400;"><input type="checkbox" name="ci_field_ext" value="xls,xlsx"/> Excel</label>
          <label style="display:flex;align-items:center;gap:4px;font-weight:400;"><input type="checkbox" name="ci_field_ext" value="zip"/> ZIP</label>
        </div>
      </div>
      <!-- select/radio/checkbox: 항목 -->
      <div id="ci-field-options-wrap" style="display:none;margin-bottom:14px;">
        <label style="font-size:.85rem;font-weight:600;display:block;margin-bottom:8px;">항목 목록</label>
        <div id="ci-field-options-list"></div>
        <button type="button" class="btn btn-outline" style="margin-top:8px;" onclick="ciAddFieldOption()">+ 항목 추가</button>
      </div>
      <div style="display:flex;gap:30px;">
        <div class="form-group">
          <label>필수여부</label>
          <div style="display:flex;gap:14px;margin-top:6px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_field_required" value="1"/> 필수</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_field_required" value="0" checked/> 선택</label>
          </div>
        </div>
        <div class="form-group">
          <label>노출여부</label>
          <div style="display:flex;gap:14px;margin-top:6px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_field_visible" value="1" checked/> 노출</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_field_visible" value="0"/> 미노출</label>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('ciFieldModal')">취소</button>
      <button class="btn btn-primary" onclick="ciSaveField()">저장</button>
    </div>
  </div>
</div>

<!-- ============================================================
     약관 추가/수정 모달
     ============================================================ -->
<div class="modal-overlay" id="ciTermModal">
  <div class="modal modal-md">
    <div class="modal-header">
      <h3 id="ciTermModalTitle">약관 추가</h3>
      <button class="modal-close" onclick="closeModal('ciTermModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="ci_term_id"/>
      <div class="form-group" style="margin-bottom:14px;">
        <label>약관명 <span class="req">*</span></label>
        <input type="text" class="form-control" id="ci_term_title" placeholder="예: 개인정보 수집 및 이용에 동의합니다"/>
      </div>
      <div class="form-group" style="margin-bottom:14px;">
        <label>약관 내용</label>
        <textarea class="form-control" id="ci_term_content" rows="6" style="resize:vertical;" placeholder="약관 내용을 입력하세요"></textarea>
      </div>
      <div style="display:flex;gap:30px;">
        <div class="form-group">
          <label>필수동의</label>
          <div style="display:flex;gap:14px;margin-top:6px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_term_required" value="1" checked/> 필수</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_term_required" value="0"/> 선택</label>
          </div>
        </div>
        <div class="form-group">
          <label>사용여부</label>
          <div style="display:flex;gap:14px;margin-top:6px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_term_active" value="1" checked/> 사용</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="ci_term_active" value="0"/> 미사용</label>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('ciTermModal')">취소</button>
      <button class="btn btn-primary" onclick="ciSaveTerm()">저장</button>
    </div>
  </div>
</div>

<!-- ============================================================
     문의 상세 모달
     ============================================================ -->
<div class="modal-overlay" id="ciDataDetailModal">
  <div class="modal" style="max-width:680px;">
    <div class="modal-header">
      <h3>문의 상세</h3>
      <button class="modal-close" onclick="closeModal('ciDataDetailModal')">✕</button>
    </div>
    <div class="modal-body" id="ciDataDetailBody" style="min-height:200px;">
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('ciDataDetailModal')">닫기</button>
    </div>
  </div>
</div>
