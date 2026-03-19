<!-- ========================
           4-1. 게시판 추가
           ======================== -->
         
      <div class="page" id="page-boardCreate">
        <div class="page-header"><div><h2>게시판 추가</h2><p>게시판을 생성하면 메뉴 관리에도 자동 추가됩니다.</p></div></div>
        <div class="card"><div class="card-body">
          <div class="form-grid">
            <div class="form-group"><label>게시판 이름 <span class="req">*</span></label><input type="text" class="form-control" id="newBoardName" placeholder="예: 공지사항"/></div>
            <div class="form-group"><label>테이블명 <span class="req">*</span></label><input type="text" class="form-control" id="newBoardTable" placeholder="영문+언더스코어 (예: notice)"/></div>
          </div>
          <hr class="section-divider"/>
          <p style="font-size:.85rem;font-weight:700;color:var(--text-secondary);margin-bottom:8px;">선택 필드</p>
          <div style="background:var(--primary-light);border:1px solid #bfdbfe;border-radius:var(--radius);padding:8px 12px;margin-bottom:8px;font-size:.82rem;color:var(--primary);">
            ℹ️ <strong>필수</strong> : 제목, 내용, 작성일시, 수정일시, 작성자, 조회수 (항상 포함)
          </div>
          <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:var(--radius);padding:8px 12px;margin-bottom:12px;font-size:.82rem;color:#92400e;">
            💡 <strong>자동</strong> 표시 필드(소셜 등)는 글 작성 폼에 표시되지 않으며, 서비스에서 자동으로 채워집니다.<br>
            &nbsp;&nbsp;&nbsp;<strong>댓글</strong>은 글 작성 시가 아닌 게시물 상세 화면에서 등록됩니다.
          </div>
          <div class="checkbox-group" id="boardFieldCheck"></div>
          <div style="margin-top:20px;display:flex;justify-content:flex-end;">
            <button class="btn btn-primary" onclick="createBoard()">게시판 생성</button>
          </div>
        </div></div>
      </div>

      <!-- 4-2. 게시판 목록 -->
      <div class="page" id="page-boardList">
        <div class="page-header"><div><h2>게시판 목록</h2><p>생성된 게시판을 확인하고 필드를 추가·관리할 수 있습니다.</p></div></div>
        <div class="card"><div class="card-body" id="boardListArea">
          <div class="empty-state"><div class="empty-icon">📋</div><p>생성된 게시판이 없습니다.</p></div>
        </div></div>
      </div>