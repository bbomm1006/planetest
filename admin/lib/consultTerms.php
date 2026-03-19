<div class="page" id="page-consultTerms">
  <div class="page-header">
    <div><h2>약관 관리</h2><p>상담 폼 약관을 관리합니다.</p></div>
  </div>
  <div class="card"><div class="card-body">
    <div class="form-group">
      <label>약관 동의 명</label>
      <input type="text" class="form-control" id="consultTermsName" placeholder="예) 개인정보 수집 및 이용 동의">
    </div>
    <div class="form-group" style="margin-top:12px;">
      <label>약관 내용</label>
      <textarea class="form-control" id="consultTermsBody" rows="12" placeholder="약관 내용을 입력하세요."></textarea>
    </div>
    <div style="margin-top:16px;display:flex;justify-content:space-between;align-items:center;">
      <span class="last-modified" id="consultTermsUpdated"></span>
      <button class="btn btn-primary" onclick="saveConsultTerms()">저장</button>
    </div>
  </div></div>
</div>