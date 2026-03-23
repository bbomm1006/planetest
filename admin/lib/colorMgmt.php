<!-- ========================
     컬러 설정
     ======================== -->
<div class="page" id="page-colorMgmt">

  <div class="page-header">
    <div>
      <h2>컬러 설정</h2>
      <p style="font-size:.82rem;color:var(--text3);margin-top:4px;">
        컬러 그룹별로 색상을 관리합니다. 기본 그룹은 메인 사이트에 적용되며, 추가 그룹은 디자인 만들기에서 선택할 수 있습니다.
      </p>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn btn-secondary" onclick="openColorGroupModal(null)">+ 그룹 추가</button>
      <button class="btn btn-primary" onclick="colorSave()">💾 저장</button>
    </div>
  </div>

  <!-- 컬러 그룹 탭 -->
  <div class="card" style="margin-bottom:16px;">
    <div class="card-body" style="padding:12px 16px;">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <span style="font-size:.8rem;font-weight:600;color:var(--text3);white-space:nowrap;">컬러 그룹:</span>
        <div id="colorGroupTabs" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header" style="justify-content:space-between;">
      <h3 id="colorGroupCurrentName">기본 컬러</h3>
      <button id="colorGroupDeleteBtn" class="btn btn-sm btn-danger" style="display:none;" onclick="deleteColorGroup()">그룹 삭제</button>
    </div>
    <div class="card-body">

      <p style="font-size:.82rem;color:var(--text3);margin-bottom:24px;line-height:1.75;">
        아래 4가지 색상이 프론트 버튼, 링크, 강조 요소 등 핵심 영역에 적용됩니다.<br>
        컬러피커를 클릭하거나 HEX 코드(예: <code style="background:var(--bg2);padding:1px 5px;border-radius:4px;">#1255a6</code>)를 직접 입력하세요.
      </p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:24px;">

        <!-- 기본컬러 -->
        <div class="form-group">
          <label style="font-weight:700;font-size:.88rem;">
            기본컬러
            <small style="color:var(--text3);font-weight:400;margin-left:4px;">버튼 · 링크 · 뱃지</small>
          </label>
          <div style="display:flex;align-items:center;gap:10px;margin-top:8px;">
            <input type="color" id="color_base_picker" value="#1255a6"
              style="width:44px;height:44px;padding:2px;border:1.5px solid var(--border);border-radius:8px;cursor:pointer;flex-shrink:0;"
              oninput="colorSyncText('color_base',this.value)">
            <input type="text" class="form-control" id="color_base_text" value="#1255a6"
              placeholder="#1255a6" maxlength="20"
              style="flex:1;font-family:monospace;font-size:.88rem;"
              oninput="colorSyncPicker('color_base',this.value)">
          </div>
          <div id="color_base_bar" style="margin-top:10px;height:32px;border-radius:8px;background:#1255a6;transition:background .2s;"></div>
        </div>

        <!-- 포인트컬러 -->
        <div class="form-group">
          <label style="font-weight:700;font-size:.88rem;">
            포인트컬러
            <small style="color:var(--text3);font-weight:400;margin-left:4px;">호버 · 그라디언트 · 활성</small>
          </label>
          <div style="display:flex;align-items:center;gap:10px;margin-top:8px;">
            <input type="color" id="color_point_picker" value="#1e7fe8"
              style="width:44px;height:44px;padding:2px;border:1.5px solid var(--border);border-radius:8px;cursor:pointer;flex-shrink:0;"
              oninput="colorSyncText('color_point',this.value)">
            <input type="text" class="form-control" id="color_point_text" value="#1e7fe8"
              placeholder="#1e7fe8" maxlength="20"
              style="flex:1;font-family:monospace;font-size:.88rem;"
              oninput="colorSyncPicker('color_point',this.value)">
          </div>
          <div id="color_point_bar" style="margin-top:10px;height:32px;border-radius:8px;background:#1e7fe8;transition:background .2s;"></div>
        </div>

        <!-- 서브컬러 -->
        <div class="form-group">
          <label style="font-weight:700;font-size:.88rem;">
            서브컬러
            <small style="color:var(--text3);font-weight:400;margin-left:4px;">액센트 · 네비 · 아이콘</small>
          </label>
          <div style="display:flex;align-items:center;gap:10px;margin-top:8px;">
            <input type="color" id="color_sub_picker" value="#00c6ff"
              style="width:44px;height:44px;padding:2px;border:1.5px solid var(--border);border-radius:8px;cursor:pointer;flex-shrink:0;"
              oninput="colorSyncText('color_sub',this.value)">
            <input type="text" class="form-control" id="color_sub_text" value="#00c6ff"
              placeholder="#00c6ff" maxlength="20"
              style="flex:1;font-family:monospace;font-size:.88rem;"
              oninput="colorSyncPicker('color_sub',this.value)">
          </div>
          <div id="color_sub_bar" style="margin-top:10px;height:32px;border-radius:8px;background:#00c6ff;transition:background .2s;"></div>
        </div>

        <!-- 서브컬러2 -->
        <div class="form-group">
          <label style="font-weight:700;font-size:.88rem;">
            서브컬러2
            <small style="color:var(--text3);font-weight:400;margin-left:4px;">--color-sub2</small>
          </label>
          <div style="display:flex;align-items:center;gap:10px;margin-top:8px;">
            <input type="color" id="color_sub2_picker" value="#ff6b35"
              style="width:44px;height:44px;padding:2px;border:1.5px solid var(--border);border-radius:8px;cursor:pointer;flex-shrink:0;"
              oninput="colorSyncText('color_sub2',this.value)">
            <input type="text" class="form-control" id="color_sub2_text" value="#ff6b35"
              placeholder="#ff6b35" maxlength="20"
              style="flex:1;font-family:monospace;font-size:.88rem;"
              oninput="colorSyncPicker('color_sub2',this.value)">
          </div>
          <div id="color_sub2_bar" style="margin-top:10px;height:32px;border-radius:8px;background:#ff6b35;transition:background .2s;"></div>
        </div>

      </div>

      <div style="margin-top:24px;padding:14px 18px;background:var(--bg2);border-radius:10px;font-size:.8rem;color:var(--text3);line-height:1.8;border:1px solid var(--border);">
        <strong style="color:var(--text);display:block;margin-bottom:4px;">적용 범위 안내</strong>
        • <strong>기본컬러</strong>: 주요 버튼, 텍스트 링크, 뱃지, 가격 강조, 활성 탭 테두리<br>
        • <strong>포인트컬러</strong>: 호버 그라디언트, 포커스 링, 파생 그라디언트 끝색<br>
        • <strong>서브컬러</strong>: 상단 네비 활성 아이콘, 히어로 프로그레스 바, 도트 강조<br>
        • <strong>서브컬러2</strong>: --color-sub2 CSS 변수로 프론트에서 자유롭게 활용
      </div>
    </div>
  </div>

  <!-- 미리보기 -->
  <div class="card">
    <div class="card-header"><h3>미리보기</h3></div>
    <div class="card-body">
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
        <button id="clr_prev_solid" style="padding:10px 22px;border-radius:10px;border:none;font-size:.86rem;font-weight:700;cursor:default;color:#fff;background:#1255a6;">기본 버튼</button>
        <button id="clr_prev_grad" style="padding:10px 22px;border-radius:10px;border:none;font-size:.86rem;font-weight:700;cursor:default;color:#fff;background:linear-gradient(90deg,#1255a6,#1e7fe8);">그라디언트 버튼</button>
        <span id="clr_prev_badge" style="padding:4px 14px;border-radius:100px;font-size:.74rem;font-weight:800;color:#fff;background:#1255a6;">뱃지</span>
        <a id="clr_prev_link" href="#" onclick="return false;" style="font-size:.86rem;font-weight:600;color:#1255a6;text-decoration:none;">링크 텍스트</a>
        <div id="clr_prev_outline" style="padding:8px 16px;border-radius:8px;border:2px solid #1e7fe8;font-size:.78rem;font-weight:700;color:#1e7fe8;">포인트 테두리</div>
        <div id="clr_prev_dot" style="width:14px;height:14px;border-radius:50%;background:#00c6ff;box-shadow:0 0 0 5px rgba(0,198,255,.2);"></div>
        <div id="clr_prev_dot2" style="width:14px;height:14px;border-radius:50%;background:#ff6b35;box-shadow:0 0 0 5px rgba(255,107,53,.2);"></div>
      </div>
    </div>
  </div>

</div>

<!-- 컬러 그룹 추가/수정 모달 -->
<div class="modal-overlay" id="colorGroupModal">
  <div class="modal">
    <div class="modal-header">
      <h3 id="colorGroupModalTitle">컬러 그룹 추가</h3>
      <button class="modal-close" onclick="closeModal('colorGroupModal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="cgEditId">
      <div class="form-group">
        <label>그룹명 <span class="req">*</span></label>
        <input type="text" class="form-control" id="cgEditName" placeholder="예: 이벤트 전용 컬러">
        <p style="margin:4px 0 0;font-size:.75rem;color:#999;">새 그룹은 현재 선택된 그룹의 컬러 값으로 초기화됩니다.</p>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('colorGroupModal')">취소</button>
      <button class="btn btn-primary" onclick="saveColorGroup()">저장</button>
    </div>
  </div>
</div>
