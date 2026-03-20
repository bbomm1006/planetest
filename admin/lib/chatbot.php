<!-- ========================
      8-1. 챗봇 지식베이스 관리
      ======================== -->
<div class="page" id="page-chatbotKB">
  <div class="page-header">
    <div><h2>챗봇 지식베이스 관리</h2><p>키워드와 답변을 등록합니다. 드래그로 우선순위를 조정할 수 있습니다.</p></div>
    <button class="btn btn-primary" onclick="openCbKbModal(null)">➕ 항목 추가</button>
  </div>
  <div class="card"><div class="card-body">
    <div class="table-filters">
      <input type="text" class="form-control" id="cbKbSearch" placeholder="키워드 / 답변 검색" onkeydown="if(event.key==='Enter')renderCbKbTable()"/>
      <button class="btn btn-outline" onclick="renderCbKbTable()">🔍 검색</button>
      <button class="btn btn-ghost" onclick="document.getElementById('cbKbSearch').value='';renderCbKbTable()">초기화</button>
    </div>
    <div class="bulk-bar" id="cbKbBulk">
      <span>선택 <span class="bulk-count">0</span>건</span>
      <button class="btn btn-sm btn-danger" onclick="cbKbBulkDelete()">선택 삭제</button>
    </div>
    <div class="table-wrap"><table class="admin-table">
      <thead><tr><th>☑</th><th>⠿</th><th>#</th><th>키워드</th><th>답변</th><th>후속질문</th><th>활성</th><th>관리</th></tr></thead>
      <tbody id="cbKbBody"></tbody>
    </table></div>
  </div></div>
</div>

<!-- ========================
      8-2. 챗봇 컨텍스트 관리
      ======================== -->
<div class="page" id="page-chatbotContext">
  <div class="page-header">
    <div><h2>컨텍스트(후속질문) 관리</h2><p>후속 질문 분기를 관리합니다.</p></div>
    <button class="btn btn-primary" onclick="openCbCtxModal(null)">➕ 항목 추가</button>
  </div>
  <div class="card"><div class="card-body">
    <div class="table-filters">
      <input type="text" class="form-control" id="cbCtxSearch" placeholder="context_key / 키워드 검색" onkeydown="if(event.key==='Enter')renderCbCtxTable()"/>
      <button class="btn btn-outline" onclick="renderCbCtxTable()">🔍 검색</button>
      <button class="btn btn-ghost" onclick="document.getElementById('cbCtxSearch').value='';renderCbCtxTable()">초기화</button>
    </div>
    <div class="bulk-bar" id="cbCtxBulk">
      <span>선택 <span class="bulk-count">0</span>건</span>
      <button class="btn btn-sm btn-danger" onclick="cbCtxBulkDelete()">선택 삭제</button>
    </div>
    <div class="table-wrap"><table class="admin-table">
      <thead><tr><th>☑</th><th>#</th><th>context_key</th><th>키워드</th><th>답변</th><th>fallback</th><th>활성</th><th>관리</th></tr></thead>
      <tbody id="cbCtxBody"></tbody>
    </table></div>
  </div></div>
</div>

<!-- ========================
      8-3. 챗봇 빠른질문 관리
      ======================== -->
<div class="page" id="page-chatbotQuick">
  <div class="page-header">
    <div><h2>빠른질문 버튼 관리</h2><p>챗봇 첫 화면에 표시되는 버튼을 관리합니다. 드래그로 순서를 변경할 수 있습니다.</p></div>
    <button class="btn btn-primary" onclick="openCbQuickModal(null)">➕ 버튼 추가</button>
  </div>
  <div class="card"><div class="card-body">
    <div class="table-wrap"><table class="admin-table">
      <thead><tr><th>⠿</th><th>#</th><th>버튼 라벨</th><th>질문 텍스트</th><th>context_key</th><th>활성</th><th>관리</th></tr></thead>
      <tbody id="cbQuickBody"></tbody>
    </table></div>
  </div></div>
</div>

<!-- ========================
      8-4. 챗봇 기본답변 & 봇 설정
      ======================== -->
<div class="page" id="page-chatbotConfig">
  <div class="page-header">
    <div><h2>챗봇 설정</h2><p>기본 답변 및 봇 외형 설정을 관리합니다.</p></div>
  </div>

  <!-- 기본 답변 -->
  <div class="card" style="margin-bottom:24px;">
    <div class="card-body">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="margin:0;font-size:1rem;">매칭 실패 시 기본 답변</h3>
        <button class="btn btn-primary btn-sm" onclick="openCbDefModal(null)">➕ 추가</button>
      </div>
      <div class="table-wrap"><table class="admin-table">
        <thead><tr><th>#</th><th>답변</th><th>활성</th><th>관리</th></tr></thead>
        <tbody id="cbDefBody"></tbody>
      </table></div>
    </div>
  </div>

  <!-- 봇 설정 -->
  <div class="card">
    <div class="card-body">
      <h3 style="margin:0 0 20px;font-size:1rem;">봇 외형 설정</h3>
      <div class="form-grid">
        <div class="form-group"><label>봇 이름</label>
          <input type="text" class="form-control" id="cfgBotName" placeholder="스마트 AI 상담"/>
        </div>
        <div class="form-group"><label>봇 상태 텍스트</label>
          <input type="text" class="form-control" id="cfgBotStatus" placeholder="온라인 · 즉시 응답"/>
        </div>
        <div class="form-group col-span-2"><label>웰컴 메시지</label>
          <input type="text" class="form-control" id="cfgWelcome" placeholder="무엇이든 편하게 질문해 주세요."/>
        </div>
        <div class="form-group"><label>오전 인사말</label>
          <input type="text" class="form-control" id="cfgMorning" placeholder="좋은 아침이에요 ☀️"/>
        </div>
        <div class="form-group"><label>오후 인사말</label>
          <input type="text" class="form-control" id="cfgAfternoon" placeholder="안녕하세요 👋"/>
        </div>
        <div class="form-group"><label>저녁 인사말</label>
          <input type="text" class="form-control" id="cfgEvening" placeholder="안녕하세요 🌙"/>
        </div>
        <div class="form-group"><label>전화번호</label>
          <input type="text" class="form-control" id="cfgPhone" placeholder="1588-0000"/>
        </div>
        <div class="form-group col-span-2"><label>하단 안내 문구</label>
          <input type="text" class="form-control" id="cfgFooter" placeholder="AI 답변은 참고용이며, 정확한 상담은 전화로 문의하세요."/>
        </div>
        <div class="form-group col-span-2"><label>기본 fallback 메시지</label>
          <input type="text" class="form-control" id="cfgFallback" placeholder="죄송해요, 이해하지 못했어요. 전화 상담을 이용해보세요!"/>
        </div>
        <div class="form-group col-span-2"><label>오류 메시지</label>
          <input type="text" class="form-control" id="cfgError" placeholder="잠시 오류가 발생했어요. 전화 상담으로 문의해 주세요."/>
        </div>
      </div>
      <div style="display:flex;justify-content:flex-end;margin-top:16px;">
        <button class="btn btn-primary" onclick="saveCbConfig()">💾 설정 저장</button>
      </div>
    </div>
  </div>
</div>
