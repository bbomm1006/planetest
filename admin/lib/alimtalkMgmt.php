<div class="page" id="page-alimtalkMgmt">
  <div class="page-header">
    <div><h2>알림톡 설정</h2></div>
  </div>

  <div class="card" style="max-width:640px;">
    <div class="card-body">

      <h3 style="font-size:.95rem;font-weight:700;color:#1e293b;margin:0 0 18px;">Solapi API 설정</h3>

      <div class="form-group">
        <label>API Key <span class="req">*</span></label>
        <input type="text" class="form-control" id="at_api_key" placeholder="Solapi API Key"/>
      </div>
      <div class="form-group">
        <label>API Secret <span class="req">*</span></label>
        <input type="password" class="form-control" id="at_api_secret" placeholder="Solapi API Secret"/>
        <small style="color:#94a3b8;font-size:.75rem;">저장 후 다시 열면 마스킹되어 표시됩니다.</small>
      </div>
      <div class="form-group">
        <label>발신번호 <span class="req">*</span></label>
        <input type="text" class="form-control" id="at_sender" placeholder="01012345678 (- 없이 입력)"/>
        <small style="color:#94a3b8;font-size:.75rem;">Solapi에 등록된 발신번호여야 합니다.</small>
      </div>

      <hr style="border:none;border-top:1px solid var(--border);margin:24px 0;">

      <h3 style="font-size:.95rem;font-weight:700;color:#1e293b;margin:0 0 6px;">카카오 채널 설정</h3>
      <p style="font-size:.8rem;color:#94a3b8;margin:0 0 18px;">Solapi 콘솔 → 카카오/네이버/RCS → 채널 관리에서 확인</p>

      <div class="form-group">
        <label>카카오 채널 ID (pfId) <span class="req">*</span></label>
        <input type="text" class="form-control" id="at_pfid" placeholder="@채널명 또는 pfId"/>
      </div>

      <hr style="border:none;border-top:1px solid var(--border);margin:24px 0;">

      <h3 style="font-size:.95rem;font-weight:700;color:#1e293b;margin:0 0 6px;">알림톡 템플릿 코드</h3>
      <p style="font-size:.8rem;color:#94a3b8;margin:0 0 18px;">Solapi 콘솔 → 카카오/네이버/RCS → 알림톡 템플릿에서 승인된 템플릿 코드 입력</p>

      <div class="form-group">
        <label>담당자 알림 템플릿 코드</label>
        <input type="text" class="form-control" id="at_tpl_notify" placeholder="예: KA01TP..."/>
        <small style="color:#94a3b8;font-size:.75rem;">새 문의 접수 시 담당자에게 발송</small>
      </div>
      <div class="form-group">
        <label>사용자 답변 템플릿 코드</label>
        <input type="text" class="form-control" id="at_tpl_reply" placeholder="예: KA01TP..."/>
        <small style="color:#94a3b8;font-size:.75rem;">관리자가 답변 저장 시 사용자에게 발송</small>
      </div>

      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 16px;font-size:.78rem;color:#1e40af;line-height:1.8;margin-bottom:20px;">
        <strong>📋 템플릿 등록 방법</strong><br>
        1. <a href="https://console.solapi.com/kakao/templates" target="_blank" style="color:#2563eb;">Solapi 콘솔 → 알림톡 템플릿</a> 접속<br>
        2. <strong>담당자 알림 템플릿</strong> 내용:<br>
        <code style="background:#dbeafe;padding:2px 6px;border-radius:4px;display:block;margin:4px 0;">[#{폼명}] 새 문의가 접수되었습니다.<br>문의 내용을 확인해주세요.</code>
        3. <strong>사용자 답변 템플릿</strong> 내용:<br>
        <code style="background:#dbeafe;padding:2px 6px;border-radius:4px;display:block;margin:4px 0;">[#{폼명}] 답변이 등록되었습니다.<br>문의에 남기신 메일을 확인해주세요.</code>
        4. 검수 요청 후 승인 완료 시 위 템플릿 코드 입력
      </div>

      <div id="at_save_msg" style="display:none;margin-bottom:12px;"></div>
      <button class="btn btn-primary" onclick="saveAlimtalkSettings()">저장</button>
    </div>
  </div>
</div>
