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
        <p style="font-size:.83rem;font-weight:600;margin-bottom:8px;">구글 스프레드시트 설정</p>
        <div class="form-group" style="margin-bottom:10px;">
          <label style="font-size:.8rem;">스프레드시트 ID</label>
          <input type="text" class="form-control" id="ci_mgr_sheet_id" placeholder="URL의 /d/ 뒤 문자열"/>
        </div>
        <div class="form-group" style="margin-bottom:10px;">
          <label style="font-size:.8rem;">시트명</label>
          <input type="text" class="form-control" id="ci_mgr_sheet_name" placeholder="Sheet1"/>
        </div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px 12px;font-size:.78rem;color:#1e40af;line-height:1.7;">
          <strong>Google Sheets API 발급 방법</strong><br>
          1. <a href="https://console.cloud.google.com/" target="_blank" style="color:#2563eb;">Google Cloud Console</a> 접속 → 프로젝트 생성<br>
          2. API 및 서비스 → 라이브러리에서 <strong>Google Sheets API</strong> 활성화<br>
          3. 사용자 인증 정보 → 서비스 계정 생성 후 JSON 키 다운로드<br>
          4. 해당 서비스 계정 이메일을 스프레드시트에 <strong>편집자</strong>로 공유<br>
          5. 스프레드시트 URL: https://docs.google.com/spreadsheets/d/<strong>{ID}</strong>/edit
        </div>
      </div>

      <!-- 알림톡 설정 -->
      <div id="ci-mgr-panel-alimtalk" style="display:none;background:#f8fafc;border-radius:8px;padding:14px;margin-bottom:12px;">
        <p style="font-size:.83rem;font-weight:600;margin-bottom:8px;">알림톡 설정</p>
        <div class="form-group" style="margin-bottom:10px;">
          <label style="font-size:.8rem;">API Key</label>
          <input type="text" class="form-control" id="ci_mgr_alimtalk_key" placeholder="Solapi API Key"/>
        </div>
        <div class="form-group" style="margin-bottom:10px;">
          <label style="font-size:.8rem;">발신번호</label>
          <input type="text" class="form-control" id="ci_mgr_alimtalk_sender" placeholder="010-0000-0000"/>
        </div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px 12px;font-size:.78rem;color:#1e40af;line-height:1.7;">
          <strong>Solapi 알림톡 API 발급 방법</strong><br>
          1. <a href="https://solapi.com/" target="_blank" style="color:#2563eb;">Solapi 회원가입</a> 후 로그인<br>
          2. 카카오 비즈니스 채널 등록 및 검수 완료 필요<br>
          3. 개발자 센터 → API Key 발급<br>
          4. 알림톡 템플릿 등록 및 승인 후 사용 가능<br>
          ※ 문자(SMS)는 별도 발신번호 등록 필요
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
  <div class="modal modal-md">
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
