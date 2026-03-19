<!-- ========================
     홈페이지 정보 관리
     ======================== -->
<div class="page" id="page-homepageInfo">


    <!-- 변경 후 -->
    <div class="page-header">
    <div><h2>홈페이지 정보 관리</h2></div>
    <button class="btn btn-primary" onclick="hiSave()">💾 저장</button>
    </div>

  <div class="card">
    <div class="card-header"><h3>기본 SEO</h3></div>
    <div class="card-body">
      <div class="form-group" style="margin-bottom:16px;">
        <label>홈페이지 타이틀</label>
        <input type="text" class="form-control" id="hi_title" placeholder="사이트 타이틀">
      </div>
      <div class="form-group" style="margin-bottom:16px;">
        <label>메타 디스크립션</label>
        <input type="text" class="form-control" id="hi_description" placeholder="검색엔진 설명문">
      </div>
      <div class="form-group">
        <label>공유하기 이미지 (OG Image)</label>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:6px;">
          <img id="hi_og_preview" src="" alt="" style="height:60px;border-radius:6px;border:1px solid var(--border);display:none;object-fit:cover;">
          <label class="btn btn-sm btn-outline" style="cursor:pointer;margin:0;">
            이미지 선택
            <input type="file" id="hi_og_file" accept="image/*" style="display:none;" onchange="hiPreview(this,'hi_og_preview','hi_og_name')">
          </label>
          <span id="hi_og_name" style="font-size:.8rem;color:var(--text3);">선택된 파일 없음</span>
        </div>
      </div>
      <div class="form-group">
        <label>파비콘 <small style="color:var(--text3);">(권장: 32×32 .ico 또는 .png)</small></label>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:6px;">
          <img id="hi_favicon_preview" src="" alt="" style="height:32px;border-radius:4px;border:1px solid var(--border);display:none;">
          <label class="btn btn-sm btn-outline" style="cursor:pointer;margin:0;">
            이미지 선택
            <input type="file" id="hi_favicon_file" accept="image/*,.ico" style="display:none;" onchange="hiPreview(this,'hi_favicon_preview','hi_favicon_name')">
          </label>
          <span id="hi_favicon_name" style="font-size:.8rem;color:var(--text3);">선택된 파일 없음</span>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><h3>로고</h3></div>
    <div class="card-body">
      <div class="form-group" style="margin-bottom:16px;">
        <label>헤더 로고</label>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:6px;">
          <img id="hi_header_logo_preview" src="" alt="" style="height:60px;border-radius:6px;border:1px solid var(--border);display:none;object-fit:contain;background:#f5f5f5;padding:4px;max-width:160px;">
          <label class="btn btn-sm btn-outline" style="cursor:pointer;margin:0;">
            이미지 선택
            <input type="file" id="hi_header_logo_file" accept="image/*" style="display:none;" onchange="hiPreview(this,'hi_header_logo_preview','hi_header_logo_name')">
          </label>
          <span id="hi_header_logo_name" style="font-size:.8rem;color:var(--text3);">선택된 파일 없음</span>
        </div>
      </div>
      <div class="form-group">
        <label>풋터 로고</label>
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:6px;">
          <img id="hi_footer_logo_preview" src="" alt="" style="height:60px;border-radius:6px;border:1px solid var(--border);display:none;object-fit:contain;background:#f5f5f5;padding:4px;max-width:160px;">
          <label class="btn btn-sm btn-outline" style="cursor:pointer;margin:0;">
            이미지 선택
            <input type="file" id="hi_footer_logo_file" accept="image/*" style="display:none;" onchange="hiPreview(this,'hi_footer_logo_preview','hi_footer_logo_name')">
          </label>
          <span id="hi_footer_logo_name" style="font-size:.8rem;color:var(--text3);">선택된 파일 없음</span>
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><h3>풋터 &amp; 연락처</h3></div>
    <div class="card-body">
      <div class="form-group" style="margin-bottom:16px;">
        <label>풋터 카피</label>
        <input type="text" class="form-control" id="hi_footer_copy" placeholder="풋터 상단 문구">
      </div>
      <div class="form-group" style="margin-bottom:16px;">
        <label>주소</label>
        <textarea class="form-control" id="hi_address" rows="3" placeholder="서울특별시 ..."></textarea>
      </div>
      <div class="form-grid" style="gap:16px;margin-bottom:16px;">
        <div class="form-group">
          <label>운영시간 1</label>
          <input type="text" class="form-control" id="hi_hours1" placeholder="평일 09:00 ~ 18:00">
        </div>
        <div class="form-group">
          <label>운영시간 2</label>
          <input type="text" class="form-control" id="hi_hours2" placeholder="토·일 휴무">
        </div>
      </div>
      <div class="form-grid" style="gap:16px;margin-bottom:0;">
        <div class="form-group">
          <label>전화번호</label>
          <input type="text" class="form-control" id="hi_phone" placeholder="02-0000-0000">
        </div>
        <div class="form-group">
          <label>카피라이트</label>
          <input type="text" class="form-control" id="hi_copyright" placeholder="© 2025 Company. All rights reserved.">
        </div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <h3>SNS 링크</h3>
      <button class="btn btn-sm btn-outline" onclick="hiAddSns()">+ 추가</button>
    </div>
    <div class="card-body">
      <div id="hiSnsList">
        <div style="text-align:center;padding:24px;color:var(--text3);font-size:.84rem;">SNS 링크를 추가하세요.</div>
      </div>
    </div>
  </div>

</div>