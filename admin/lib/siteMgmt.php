<div class="page" id="page-siteMgmt">
  <div class="page-header">
    <div><h2>사이트 정보 관리</h2><p>사이트 기본 정보를 관리합니다.</p></div>
  </div>
  <div class="card"><div class="card-body">
    <div class="form-group">
      <label>헤더 로고 이미지</label>
      <input type="file" class="form-control" id="siteHeaderLogo" accept="image/*">
      <div id="siteHeaderLogoPreview" style="margin-top:8px;"></div>
    </div>
    <div class="form-group" style="margin-top:16px;">
      <label>풋터 로고 이미지</label>
      <input type="file" class="form-control" id="siteFooterLogo" accept="image/*">
      <div id="siteFooterLogoPreview" style="margin-top:8px;"></div>
    </div>
    <div class="form-group" style="margin-top:16px;">
      <label>풋터 카피</label>
      <input type="text" class="form-control" id="siteFooterCopy" placeholder="풋터 카피문구">
    </div>
    <div class="form-group" style="margin-top:16px;">
      <label>전화번호</label>
      <input type="text" class="form-control" id="siteTel" placeholder="전화번호">
    </div>
    <div class="form-group" style="margin-top:16px;">
      <label>운영시간</label>
      <input type="text" class="form-control" id="siteHours" placeholder="운영시간">
    </div>
    <div class="form-group" style="margin-top:16px;">
      <label>주소</label>
      <input type="text" class="form-control" id="siteAddress" placeholder="주소">
    </div>
    <div class="form-group" style="margin-top:16px;">
      <label>카피라이트</label>
      <input type="text" class="form-control" id="siteCopyright" placeholder="© 2025 Company. All rights reserved.">
    </div>
    <div style="margin-top:24px; text-align:right;">
      <button class="btn btn-primary" onclick="saveSiteInfo()">저장</button>
    </div>
  </div></div>
</div>