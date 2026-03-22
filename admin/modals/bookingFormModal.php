<!-- ============================================================
     담당자 추가/수정 모달
     ============================================================ -->
<div class="modal-overlay" id="bkfManagerModal">
  <div class="modal modal-md" style="max-width:600px;">
    <div class="modal-header">
      <h3 id="bkfManagerModalTitle">담당자 추가</h3>
      <button class="modal-close" onclick="closeModal('bkfManagerModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="bkf_mgr_id"/>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
        <div class="form-group">
          <label>이름 <span class="req">*</span></label>
          <input type="text" class="form-control" id="bkf_mgr_name"/>
        </div>
        <div class="form-group">
          <label>담당부서</label>
          <input type="text" class="form-control" id="bkf_mgr_dept"/>
        </div>
        <div class="form-group">
          <label>휴대폰번호</label>
          <input type="text" class="form-control" id="bkf_mgr_phone" placeholder="010-0000-0000"/>
        </div>
        <div class="form-group">
          <label>이메일</label>
          <input type="email" class="form-control" id="bkf_mgr_email"/>
        </div>
      </div>

      <hr style="border:none;border-top:1px solid var(--border);margin:16px 0;">
      <p style="font-size:.85rem;font-weight:600;margin-bottom:12px;">알림 설정</p>
      <div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:16px;">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;">
          <input type="checkbox" id="bkf_mgr_notify_email"/> 이메일
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;">
          <input type="checkbox" id="bkf_mgr_notify_sheet" onchange="bkfToggleMgrPanel('sheet')"/> 구글시트
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;">
          <input type="checkbox" id="bkf_mgr_notify_alimtalk" onchange="bkfToggleMgrPanel('alimtalk')"/> 알림톡
        </label>
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;">
          <input type="checkbox" id="bkf_mgr_notify_sms"/> 문자(SMS)
        </label>
      </div>

      <!-- 구글시트 설정 패널 -->
      <div id="bkf-mgr-panel-sheet" style="display:none;background:#f8fafc;border-radius:8px;padding:14px;margin-bottom:12px;">
        <p style="font-size:.83rem;font-weight:600;margin-bottom:8px;">구글 스프레드시트 설정 (Apps Script 웹훅)</p>
        <div class="form-group" style="margin-bottom:10px;">
          <label style="font-size:.8rem;">Apps Script 웹훅 URL <span class="req">*</span></label>
          <input type="text" class="form-control" id="bkf_mgr_sheet_webhook" placeholder="https://script.google.com/macros/s/.../exec"/>
        </div>
        <div class="form-group" style="margin-bottom:10px;">
          <label style="font-size:.8rem;">시트명 <small style="color:#94a3b8;font-weight:400;">(비워두면 Sheet1)</small></label>
          <input type="text" class="form-control" id="bkf_mgr_sheet_name" placeholder="Sheet1"/>
        </div>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:12px 14px;font-size:.78rem;color:#1e40af;line-height:1.85;">
          <strong>📋 Apps Script 웹훅 설정 방법</strong><br><br>
          <strong>① 스프레드시트 열기</strong><br>
          구글 스프레드시트에서 <strong>확장 프로그램 → Apps Script</strong> 클릭<br><br>
          <strong>② 아래 코드를 Code.gs에 붙여넣기</strong>
          <div style="background:#1e293b;color:#e2e8f0;border-radius:6px;padding:10px 12px;margin:8px 0;font-family:monospace;font-size:.74rem;line-height:1.7;white-space:pre-wrap;word-break:break-all;">function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheetName = data.sheet_name || 'Sheet1';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName) || ss.getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(data.headers || []);
    sheet.appendRow(data.values || []);
    return ContentService.createTextOutput(JSON.stringify({ok:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ok:false,error:err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}</div>
          <strong>③ 저장 후 배포</strong><br>
          오른쪽 상단 <strong>배포 → 새 배포</strong> 클릭<br>
          → 유형: <strong>웹 앱</strong> / 액세스 권한: <strong>모든 사용자</strong> → <strong>배포</strong><br><br>
          <strong>④ 웹 앱 URL 복사 후 위 칸에 붙여넣기</strong>
        </div>
      </div>

      <!-- 알림톡/SMS 안내 패널 -->
      <div id="bkf-mgr-panel-alimtalk" style="display:none;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px;margin-bottom:12px;">
        <p style="font-size:.82rem;color:#1e40af;line-height:1.7;margin:0;">
          💬 알림톡/SMS 발송은 <strong>알림톡 관리</strong> 메뉴에서 공통으로 설정합니다.<br>
          담당자 휴대폰번호가 입력되어 있으면 선택한 방식으로 알림이 발송됩니다.
        </p>
      </div>

      <div class="form-group" style="margin-top:4px;">
        <label>사용여부</label>
        <div style="display:flex;gap:16px;margin-top:6px;">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="bkf_mgr_active" value="1" checked/> 사용</label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="bkf_mgr_active" value="0"/> 미사용</label>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('bkfManagerModal')">취소</button>
      <button class="btn btn-primary" onclick="bkfSaveManager()">저장</button>
    </div>
  </div>
</div>

<!-- ============================================================
     필드 추가/수정 모달
     ============================================================ -->
<div class="modal-overlay" id="bkfFieldModal">
  <div class="modal modal-md" style="max-width:580px;">
    <div class="modal-header">
      <h3 id="bkfFieldModalTitle">필드 추가</h3>
      <button class="modal-close" onclick="closeModal('bkfFieldModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="bkf_field_id"/>
      <div class="form-group" style="margin-bottom:14px;">
        <label>항목명 <span class="req">*</span></label>
        <input type="text" class="form-control" id="bkf_field_label" placeholder="예: 희망 시간대"
               oninput="bkfAutoFieldKey(this.value)"/>
      </div>
      <div class="form-group" style="margin-bottom:14px;">
        <label>필드 키 <small style="font-weight:400;color:#94a3b8;">(자동 생성, 수정 가능)</small></label>
        <input type="text" class="form-control" id="bkf_field_key" placeholder="영문 소문자·숫자·언더바"/>
        <p style="font-size:.75rem;color:#94a3b8;margin-top:3px;">DB 컬럼명으로 사용됩니다. 한번 생성 후 변경 불가.</p>
      </div>
      <div class="form-group" style="margin-bottom:14px;">
        <label>필드 타입 <span class="req">*</span></label>
        <select class="form-control" id="bkf_field_type" onchange="bkfOnFieldTypeChange()">
          <option value="">선택하세요</option>
          <optgroup label="텍스트">
            <option value="text">텍스트 입력</option>
          </optgroup>
          <optgroup label="선택">
            <option value="radio">라디오 버튼 (단일선택)</option>
            <option value="checkbox">체크박스 (다중선택)</option>
            <option value="dropdown">드롭다운</option>
            <option value="item_select">항목 선택</option>
            <option value="store_select">지점 선택 (stores 연동)</option>
          </optgroup>
          <optgroup label="날짜/시간">
            <option value="date">날짜 선택</option>
            <option value="time_slot">시간 슬롯 선택</option>
            <option value="date_range">기간 선택 (시작일~종료일)</option>
          </optgroup>
        </select>
      </div>

      <!-- placeholder (text 타입) -->
      <div class="form-group" id="bkf-field-placeholder-wrap" style="margin-bottom:14px;display:none;">
        <label>Placeholder</label>
        <input type="text" class="form-control" id="bkf_field_placeholder" placeholder="입력 안내 문구"/>
      </div>

      <!-- 옵션 목록 (radio / checkbox / dropdown / item_select) -->
      <div id="bkf-field-options-wrap" style="display:none;margin-bottom:14px;">
        <label style="font-size:.85rem;font-weight:600;display:block;margin-bottom:8px;">
          옵션 목록 <small style="font-weight:400;color:#94a3b8;">(드래그로 순서 변경)</small>
        </label>
        <div id="bkf-field-options-list" style="display:flex;flex-direction:column;gap:6px;min-height:32px;"></div>
        <button type="button" class="btn btn-outline btn-sm" style="margin-top:8px;" onclick="bkfAddFieldOption()">
          + 옵션 추가
        </button>
      </div>

      <!-- store_select 안내 -->
      <div id="bkf-field-store-info" style="display:none;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:12px 14px;margin-bottom:14px;font-size:.82rem;color:#166534;line-height:1.7;">
        📍 stores 테이블에 등록된 지점 목록을 자동으로 불러옵니다.<br>
        지점 추가/수정은 <strong>매장 관리</strong> 메뉴에서 진행하세요.
      </div>

      <!-- date_range 안내 -->
      <div id="bkf-field-daterange-info" style="display:none;background:#fefce8;border:1px solid #fde047;border-radius:8px;padding:12px 14px;margin-bottom:14px;font-size:.82rem;color:#713f12;line-height:1.7;">
        📅 시작일과 종료일을 함께 선택하는 기간 선택 필드입니다.<br>
        값은 <code style="background:#fef9c3;padding:1px 5px;border-radius:3px;">2025-06-01~2025-06-07</code> 형식으로 저장됩니다.
      </div>

      <div style="display:flex;gap:30px;margin-top:4px;">
        <div class="form-group">
          <label>필수여부</label>
          <div style="display:flex;gap:14px;margin-top:6px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="bkf_field_required" value="1"/> 필수</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="bkf_field_required" value="0" checked/> 선택</label>
          </div>
        </div>
        <div class="form-group">
          <label>노출여부</label>
          <div style="display:flex;gap:14px;margin-top:6px;">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="bkf_field_visible" value="1" checked/> 노출</label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:400;"><input type="radio" name="bkf_field_visible" value="0"/> 미노출</label>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('bkfFieldModal')">취소</button>
      <button class="btn btn-primary" onclick="bkfSaveField()">저장</button>
    </div>
  </div>
</div>

<!-- ============================================================
     수량 단건 설정 모달  (날짜 셀 클릭 시)
     ============================================================ -->
<div class="modal-overlay" id="bkfQuotaModal">
  <div class="modal modal-sm">
    <div class="modal-header">
      <h3 id="bkfQuotaModalTitle">수량 설정</h3>
      <button class="modal-close" onclick="closeModal('bkfQuotaModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="bkf_quota_date"/>
      <input type="hidden" id="bkf_quota_store_id"/>

      <p id="bkfQuotaDateLabel" style="font-size:.88rem;font-weight:600;color:#475569;margin-bottom:16px;"></p>

      <!-- 날짜 단위 수량 (quota_mode = date | both) -->
      <div id="bkf-quota-date-wrap">
        <div class="form-group" style="margin-bottom:14px;">
          <label style="font-size:.85rem;">날짜 전체 수량 <small style="font-weight:400;color:#94a3b8;">(0 = 제한없음)</small></label>
          <input type="number" class="form-control" id="bkf_quota_date_capacity" min="0" value="0" style="width:120px;"/>
        </div>
      </div>

      <!-- 시간 슬롯 수량 (quota_mode = slot | both) -->
      <div id="bkf-quota-slot-wrap" style="display:none;">
        <hr style="border:none;border-top:1px solid var(--border);margin:14px 0;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <p style="font-size:.85rem;font-weight:600;margin:0;">시간 슬롯별 수량</p>
          <button type="button" class="btn btn-outline btn-sm" onclick="bkfAddSlotRow()">+ 슬롯 추가</button>
        </div>
        <div id="bkf-quota-slot-list" style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;"></div>
      </div>

      <div style="background:#f8fafc;border-radius:6px;padding:10px 12px;margin-top:14px;font-size:.78rem;color:#64748b;line-height:1.7;">
        · 수량 0 = 제한 없음 (미설정 상태)<br>
        · 이미 예약된 건수보다 적게 설정할 수 없습니다
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('bkfQuotaModal')">취소</button>
      <button class="btn btn-primary" onclick="bkfSaveQuota()">저장</button>
    </div>
  </div>
</div>

<!-- ============================================================
     수량 일괄 설정 모달
     ============================================================ -->
<div class="modal-overlay" id="bkfBulkQuotaModal">
  <div class="modal modal-sm">
    <div class="modal-header">
      <h3>수량 일괄 설정</h3>
      <button class="modal-close" onclick="closeModal('bkfBulkQuotaModal')">✕</button>
    </div>
    <div class="modal-body">
      <p style="font-size:.83rem;color:#64748b;margin-bottom:16px;">
        현재 조회 중인 월의 날짜 전체에 동일한 수량을 적용합니다.
      </p>
      <div class="form-group" style="margin-bottom:14px;">
        <label>날짜 단위 수량 <small style="font-weight:400;color:#94a3b8;">(0 = 제한없음)</small></label>
        <input type="number" class="form-control" id="bkf_bulk_capacity" min="0" value="0" style="width:120px;"/>
      </div>
      <div id="bkf-bulk-slot-wrap">
        <div class="form-group" style="margin-bottom:10px;">
          <label style="display:flex;align-items:center;gap:8px;font-weight:400;cursor:pointer;">
            <input type="checkbox" id="bkf_bulk_use_slot" onchange="bkfToggleBulkSlot()"/>
            시간 슬롯도 함께 설정
          </label>
        </div>
        <div id="bkf-bulk-slot-area" style="display:none;background:#f8fafc;border-radius:8px;padding:12px;margin-top:4px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <p style="font-size:.82rem;font-weight:600;margin:0;color:#475569;">슬롯 목록</p>
            <button type="button" class="btn btn-outline btn-sm" onclick="bkfAddBulkSlotRow()">+ 슬롯 추가</button>
          </div>
          <div id="bkf-bulk-slot-list" style="display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto;"></div>
        </div>
      </div>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:6px;padding:10px 12px;margin-top:14px;font-size:.78rem;color:#1e40af;line-height:1.7;">
        ⚠️ 이미 수량이 설정된 날짜는 덮어쓰기 됩니다.<br>
        예약이 있는 날짜의 경우 기존 booked 값은 유지됩니다.
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('bkfBulkQuotaModal')">취소</button>
      <button class="btn btn-primary" onclick="bkfSaveBulkQuota()">적용</button>
    </div>
  </div>
</div>

<!-- ============================================================
     예약 상세 / 수정 모달
     ============================================================ -->
<div class="modal-overlay" id="bkfRecordModal">
  <div class="modal modal-lg">
    <div class="modal-header">
      <h3 id="bkfRecordModalTitle">예약 상세</h3>
      <button class="modal-close" onclick="closeModal('bkfRecordModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="bkf_record_id"/>

      <!-- 상태 + 예약번호 -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap;">
        <span id="bkfRecordStatusBadge" style="padding:4px 12px;border-radius:20px;font-size:.82rem;font-weight:600;"></span>
        <span id="bkfRecordNo" style="font-size:.85rem;color:#64748b;"></span>
        <span style="margin-left:auto;display:flex;gap:8px;align-items:center;">
          <label style="font-size:.82rem;color:#475569;font-weight:600;">상태 변경:</label>
          <select class="form-control" id="bkfRecordStatusSelect" style="width:110px;padding:5px 8px;">
            <option value="접수">접수</option>
            <option value="확인">확인</option>
            <option value="완료">완료</option>
            <option value="취소">취소</option>
          </select>
          <button class="btn btn-sm btn-outline" onclick="bkfUpdateRecordStatus()">변경</button>
        </span>
      </div>

      <!-- 수정 가능 여부 안내 -->
      <div id="bkfRecordEditNotice" style="display:none;background:#fef9c3;border:1px solid #fde047;border-radius:6px;padding:8px 12px;margin-bottom:14px;font-size:.8rem;color:#713f12;">
        ⚠️ 접수 상태일 때만 내용 수정이 가능합니다.
      </div>

      <!-- 기본 정보 그리드 -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
        <div class="form-group">
          <label>이름 <span class="req">*</span></label>
          <input type="text" class="form-control" id="bkf_rec_name"/>
        </div>
        <div class="form-group">
          <label>전화번호 <span class="req">*</span></label>
          <input type="text" class="form-control" id="bkf_rec_phone"/>
        </div>
        <div class="form-group">
          <label>예약일</label>
          <input type="date" class="form-control" id="bkf_rec_date"/>
        </div>
        <div class="form-group">
          <label>예약시간</label>
          <input type="time" class="form-control" id="bkf_rec_time"/>
        </div>
        <div class="form-group">
          <label>지점</label>
          <select class="form-control" id="bkf_rec_store">
            <option value="">지점 없음</option>
          </select>
        </div>
        <div class="form-group">
          <label>접수일시</label>
          <input type="text" class="form-control" id="bkf_rec_created_at" disabled style="background:#f8fafc;color:#94a3b8;"/>
        </div>
      </div>

      <!-- 동적 필드 영역 -->
      <div id="bkfRecordDynFields" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;"></div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('bkfRecordModal')">닫기</button>
      <button class="btn btn-primary" id="bkfRecordSaveBtn" onclick="bkfSaveRecord()">수정 저장</button>
    </div>
  </div>
</div>
