<!-- ==============================
     챗봇 KB 추가/수정 Modal
     ============================== -->
<div class="modal-overlay" id="cbKbModal">
  <div class="modal">
    <div class="modal-header">
      <h3 id="cbKbModalTitle">지식베이스 추가</h3>
      <button class="modal-close" onclick="closeModal('cbKbModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="cbKbModalId"/>
      <div class="form-group"><label>키워드 <span class="req">*</span> <small style="color:var(--text-muted)">(쉼표로 구분)</small></label>
        <input type="text" class="form-control" id="cbKbModalKeywords" placeholder="보험,보험료,가격"/>
      </div>
      <div class="form-group"><label>답변 <span class="req">*</span></label>
        <textarea class="form-control" id="cbKbModalAnswer" rows="4" placeholder="키워드에 매칭될 때 보여줄 답변을 입력하세요."></textarea>
      </div>
      <hr style="margin:16px 0;border-color:var(--border);">
      <p style="font-weight:600;margin-bottom:12px;font-size:.875rem;">후속질문 연결 <small style="font-weight:400;color:var(--text-muted)">(선택)</small></p>
      <div class="form-group"><label>후속질문 버튼 텍스트</label>
        <input type="text" class="form-control" id="cbKbModalFollowText" placeholder="예) 어떤 보험을 찾으시나요?"/>
      </div>
      <div class="form-group"><label>연결할 context_key</label>
        <input type="text" class="form-control" id="cbKbModalFollowCtx" placeholder="예) insurance_type"/>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('cbKbModal')">취소</button>
      <button class="btn btn-primary" onclick="saveCbKb()">저장</button>
    </div>
  </div>
</div>

<!-- ==============================
     챗봇 Context 추가/수정 Modal
     ============================== -->
<div class="modal-overlay" id="cbCtxModal">
  <div class="modal">
    <div class="modal-header">
      <h3 id="cbCtxModalTitle">컨텍스트 추가</h3>
      <button class="modal-close" onclick="closeModal('cbCtxModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="cbCtxModalId"/>
      <div class="form-group"><label>context_key <span class="req">*</span> <small style="color:var(--text-muted)">(영문 snake_case)</small></label>
        <input type="text" class="form-control" id="cbCtxModalKey" placeholder="예) insurance_type"/>
      </div>
      <div class="form-group"><label>키워드 <span class="req">*</span> <small style="color:var(--text-muted)">(쉼표로 구분)</small></label>
        <input type="text" class="form-control" id="cbCtxModalKeywords" placeholder="실손,실비,의료"/>
      </div>
      <div class="form-group"><label>답변 <span class="req">*</span></label>
        <textarea class="form-control" id="cbCtxModalAnswer" rows="3" placeholder="해당 키워드 입력 시 보여줄 답변"></textarea>
      </div>
      <div class="form-group"><label>fallback 답변 <small style="color:var(--text-muted)">(키워드 불일치 시)</small></label>
        <input type="text" class="form-control" id="cbCtxModalFallback" placeholder="조금 더 자세히 말씀해 주시겠어요?"/>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('cbCtxModal')">취소</button>
      <button class="btn btn-primary" onclick="saveCbCtx()">저장</button>
    </div>
  </div>
</div>

<!-- ==============================
     챗봇 빠른질문 추가/수정 Modal
     ============================== -->
<div class="modal-overlay" id="cbQuickModal">
  <div class="modal">
    <div class="modal-header">
      <h3 id="cbQuickModalTitle">빠른질문 버튼 추가</h3>
      <button class="modal-close" onclick="closeModal('cbQuickModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="cbQuickModalId"/>
      <div class="form-group"><label>버튼 라벨 <span class="req">*</span></label>
        <input type="text" class="form-control" id="cbQuickModalLabel" placeholder="예) 보험료 문의"/>
      </div>
      <div class="form-group"><label>질문 텍스트 <span class="req">*</span> <small style="color:var(--text-muted)">(버튼 클릭 시 발송되는 질문)</small></label>
        <input type="text" class="form-control" id="cbQuickModalQuestion" placeholder="예) 보험료가 궁금해요"/>
      </div>
      <div class="form-group"><label>context_key <small style="color:var(--text-muted)">(입력 시 후속 분기로 연결)</small></label>
        <input type="text" class="form-control" id="cbQuickModalCtxKey" placeholder="예) insurance_type (선택)"/>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('cbQuickModal')">취소</button>
      <button class="btn btn-primary" onclick="saveCbQuick()">저장</button>
    </div>
  </div>
</div>

<!-- ==============================
     챗봇 기본답변 추가/수정 Modal
     ============================== -->
<div class="modal-overlay" id="cbDefModal">
  <div class="modal">
    <div class="modal-header">
      <h3 id="cbDefModalTitle">기본 답변 추가</h3>
      <button class="modal-close" onclick="closeModal('cbDefModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="cbDefModalId"/>
      <div class="form-group"><label>답변 <span class="req">*</span></label>
        <textarea class="form-control" id="cbDefModalAnswer" rows="3" placeholder="키워드 매칭 실패 시 랜덤으로 표시될 답변을 입력하세요."></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('cbDefModal')">취소</button>
      <button class="btn btn-primary" onclick="saveCbDef()">저장</button>
    </div>
  </div>
</div>
