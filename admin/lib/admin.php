<!-- ========================
           0-1. 관리자 관리
           ======================== -->
      <div class="page" id="page-adminMgmt">
        <div class="page-header">
          <div><h2>관리자 관리</h2><p>시스템 관리자 계정을 관리합니다.</p></div>
          <button class="btn btn-primary" onclick="openAdminModal(null)">➕ 관리자 추가</button>
        </div>
        <div class="card"><div class="card-body">
          <div class="bulk-bar" id="adminBulk">
            <span>선택 <span class="bulk-count">0</span>건</span>
            <button class="btn btn-sm btn-danger" onclick="bulkDeleteAdmins()">선택 삭제</button>
          </div>
          <div class="table-wrap">
            <table class="admin-table">
              <thead><tr><th>☑</th><th>⠿</th><th>#</th><th>아이디</th><th>이름</th><th>이메일</th><th>등록일</th><th>관리</th></tr></thead>
              <tbody id="adminTableBody"></tbody>
            </table>
          </div>
        </div></div>
      </div>