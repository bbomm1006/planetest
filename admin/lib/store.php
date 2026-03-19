<!-- 3-1. 카카오 API 관리 -->
<div class="page" id="page-kakaoApiMgmt">
  <div class="page-header">
    <div><h2>카카오 API 관리</h2><p>카카오 지도 API 키를 관리합니다.</p></div>
    <button class="btn btn-primary" onclick="saveKakaoApi()">💾 저장</button>
  </div>
  <div class="info-box kakao" style="margin-bottom:16px;">
    <div class="info-title">🟡 카카오 지도 API 키 발급 방법</div>
    <ol>
      <li><a href="https://developers.kakao.com" target="_blank">developers.kakao.com</a> 접속 → 로그인 → <strong>내 애플리케이션</strong> 클릭</li>
      <li>애플리케이션 추가 → 앱 이름·회사명 입력 후 저장</li>
      <li>생성된 앱 클릭 → <strong>앱 키</strong> 탭에서 <code>JavaScript 키</code> 복사</li>
      <li>플랫폼 탭 → <strong>Web</strong> → 사이트 도메인 등록</li>
      <li>카카오 지도 API는 별도 신청 불필요</li>
    </ol>
  </div>
  <div class="card"><div class="card-body">
    <div class="form-grid">
      <div class="form-group">
        <label>카카오 지도 SDK URL</label>
        <input type="text" class="form-control" id="kakaoSdkUrl" value="https://dapi.kakao.com/v2/maps/sdk.js"/>
      </div>
      <div class="form-group">
        <label>JavaScript 키 (appkey)</label>
        <input type="text" class="form-control" id="kakaoJsKey" placeholder="카카오 JavaScript 키 입력"/>
      </div>
      <div class="form-group">
        <label>REST API 키</label>
        <input type="text" class="form-control" id="kakaoRestKey" placeholder="카카오 REST API 키 입력"/>
      </div>
    </div>
  </div></div>
</div>

<!-- 3-2. 매장(지점) 관리 -->
<div class="page" id="page-storeMgmt">
  <div class="page-header">
    <div><h2>매장(지점) 관리</h2><p>매장 목록을 관리합니다. 드래그로 순서를 변경할 수 있습니다.</p></div>
    <button class="btn btn-primary" onclick="openStoreModal(null)">➕ 매장 추가</button>
  </div>
  <div class="card"><div class="card-body">
    <div class="table-filters">
      <select class="form-control" id="storeRegionFilter">
        <option value="">전체 지역</option>
        <option value="서울">서울</option><option value="경기">경기</option>
        <option value="인천">인천</option><option value="부산">부산</option>
        <option value="대구">대구</option><option value="광주">광주</option>
        <option value="대전">대전</option><option value="울산">울산</option>
        <option value="세종">세종</option><option value="강원">강원</option>
        <option value="충북">충북</option><option value="충남">충남</option>
        <option value="전북">전북</option><option value="전남">전남</option>
        <option value="경북">경북</option><option value="경남">경남</option>
        <option value="제주">제주</option>
      </select>
      <input type="text" class="form-control" id="storeSearch" placeholder="매장명, 지점명, 전화번호 검색..."
             onkeydown="if(event.key==='Enter')filterStoreTable()"/>
      <button class="btn btn-outline" onclick="filterStoreTable()">🔍 검색</button>
      <button class="btn btn-ghost" onclick="document.getElementById('storeSearch').value='';document.getElementById('storeRegionFilter').value='';filterStoreTable()">초기화</button>
    </div>
    <div class="bulk-bar" id="storeBulk">
      <span>선택 <span class="bulk-count">0</span>건</span>
      <button class="btn btn-sm btn-danger" onclick="bulkDelete('storeBulk','storeTableBody')">선택 삭제</button>
    </div>
    <div class="table-wrap">
      <table class="admin-table">
        <thead><tr><th>☑</th><th>⠿</th><th>#</th><th>매장명</th><th>지점명</th><th>지역</th><th>전화번호</th><th>운영시간</th><th>등록일</th><th>수정일</th><th>관리</th></tr></thead>
        <tbody id="storeTableBody"></tbody>
      </table>
    </div>
  </div></div>
</div>