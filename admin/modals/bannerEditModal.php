<div class="modal-overlay" id="bannerEditModal">
  <div class="modal modal-lg">
    <div class="modal-header">
      <h3>배너 추가</h3>
      <button class="modal-close" onclick="closeModal('bannerEditModal')">✕</button>
    </div>
    <div class="modal-body">

      <!-- 기본 정보 -->
      <div class="form-grid" style="margin-bottom:16px;">
        <div class="form-group"><label>배너 제목 <span class="req">*</span></label>
          <input type="text" class="form-control" id="bannerModalTitle" placeholder="관리용 제목 (사용자에게 노출 안 됨)"/>
        </div>
        <div class="form-group"><label>유형</label>
          <select class="form-control" id="bannerModalType" onchange="toggleBannerModalType(this.value)">
            <option value="image">🖼️ 이미지</option>
            <option value="video">▶ 영상</option>
          </select>
        </div>
        <div class="form-group col-span-2"><label>노출 여부</label>
          <div class="toggle-wrap">
            <label class="toggle"><input type="checkbox" id="bannerModalVisible" checked><span class="toggle-slider"></span></label>
            <span class="toggle-label">노출</span>
          </div>
        </div>
      </div>

      <!-- 이미지 필드 -->
      <div id="bannerModalImgFields">
        <div class="form-grid" style="margin-bottom:16px;">
          <div class="form-group"><label>PC 이미지</label>
            <div class="upload-area" id="bannerPcImgArea" onclick="triggerUpload('bannerPcImg')">
              <div class="upload-icon">🖥️</div><p><strong>클릭하여 업로드</strong></p><p style="font-size:.75rem;">권장: 1920×600px</p>
            </div>
            <input type="file" id="bannerPcImg" accept="image/*" style="display:none">
            <input type="hidden" id="bannerModalPcImage">
          </div>
          <div class="form-group"><label>모바일 이미지</label>
            <div class="upload-area" id="bannerMoImgArea" onclick="triggerUpload('bannerMoImg')">
              <div class="upload-icon">📱</div><p><strong>클릭하여 업로드</strong></p><p style="font-size:.75rem;">권장: 768×600px</p>
            </div>
            <input type="file" id="bannerMoImg" accept="image/*" style="display:none">
            <input type="hidden" id="bannerModalMoImage">
          </div>
        </div>
      </div>

      <!-- 영상 필드 -->
      <div id="bannerModalVidFields" style="display:none;">
        <div class="form-group" style="margin-bottom:16px;"><label>유튜브 링크</label>
          <input type="text" class="form-control" id="bannerModalVideoUrl" placeholder="https://www.youtube.com/watch?v=..."/>
        </div>
      </div>

      <hr style="margin:16px 0;border-color:var(--border);">

      <!-- 오버레이 -->
      <p class="form-section-label" style="font-weight:600;margin-bottom:12px;">오버레이</p>
      <div class="form-grid" style="margin-bottom:16px;">
        <div class="form-group"><label>오버레이 사용</label>
          <div class="toggle-wrap">
            <label class="toggle"><input type="checkbox" id="bannerModalOverlayOn" checked><span class="toggle-slider"></span></label>
            <span class="toggle-label">사용</span>
          </div>
        </div>
        <div class="form-group"><label>오버레이 색상</label>
          <div class="color-input-wrap">
            <input type="text" class="form-control" id="bannerModalOverlayColor" placeholder="rgba(0,0,0,0.45)" value="rgba(0,0,0,0.45)" oninput="syncPicker('bannerModalOverlayColorPicker',this.value)"/>
            <input type="color" id="bannerModalOverlayColorPicker" value="#000000" oninput="document.getElementById('bannerModalOverlayColor').value=this.value">
          </div>
        </div>
      </div>

      <hr style="margin:16px 0;border-color:var(--border);">

      <!-- 텍스트 -->
      <p class="form-section-label" style="font-weight:600;margin-bottom:12px;">텍스트</p>
      <div class="form-grid" style="margin-bottom:16px;">
        <div class="form-group col-span-2"><label>서브타이틀 <span style="font-size:.75rem;color:var(--text-muted)">(pill 배지)</span></label>
          <input type="text" class="form-control" id="bannerModalSubtitle" placeholder="NEW ARRIVAL"/>
        </div>
        <div class="form-group"><label>메인 제목 <span style="font-size:.75rem;color:var(--text-muted)">(사용자에게 노출)</span></label>
          <input type="text" class="form-control" id="bannerModalTitleText" placeholder="히어로 슬라이드 제목"/>
        </div>
        <div class="form-group"><label>제목 색상</label>
          <div class="color-input-wrap">
            <input type="text" class="form-control" id="bannerModalTitleColor" placeholder="#ffffff" value="#ffffff" oninput="syncPicker('bannerModalTitleColorPicker',this.value)"/>
            <input type="color" id="bannerModalTitleColorPicker" value="#ffffff" oninput="document.getElementById('bannerModalTitleColor').value=this.value">
          </div>
        </div>
        <div class="form-group"><label>설명 텍스트</label>
          <input type="text" class="form-control" id="bannerModalDesc" placeholder="짧은 설명 문구"/>
        </div>
        <div class="form-group"><label>설명 색상</label>
          <div class="color-input-wrap">
            <input type="text" class="form-control" id="bannerModalDescColor" placeholder="rgba(255,255,255,.72)" value="rgba(255,255,255,.72)" oninput="syncPicker('bannerModalDescColorPicker',this.value)"/>
            <input type="color" id="bannerModalDescColorPicker" value="#ffffff" oninput="document.getElementById('bannerModalDescColor').value=this.value">
          </div>
        </div>
      </div>

      <hr style="margin:16px 0;border-color:var(--border);">

      <!-- 버튼 1 -->
      <p class="form-section-label" style="font-weight:600;margin-bottom:12px;">버튼 1 (채색 버튼)</p>
      <div class="form-grid" style="margin-bottom:8px;">
        <div class="form-group"><label>버튼 1 사용</label>
          <div class="toggle-wrap">
            <label class="toggle"><input type="checkbox" id="bannerModalBtn1On"><span class="toggle-slider"></span></label>
            <span class="toggle-label">사용</span>
          </div>
        </div>
        <div class="form-group"><label>버튼 텍스트</label>
          <input type="text" class="form-control" id="bannerModalBtn1Text" placeholder="자세히 보기"/>
        </div>
        <div class="form-group"><label>링크 URL</label>
          <input type="text" class="form-control" id="bannerModalBtn1Link" placeholder="https://"/>
        </div>
        <div class="form-group"><label>배경 색상</label>
          <div class="color-input-wrap">
            <input type="text" class="form-control" id="bannerModalBtn1Bg" placeholder="#00c6ff" value="#00c6ff" oninput="syncPicker('bannerModalBtn1BgPicker',this.value)"/>
            <input type="color" id="bannerModalBtn1BgPicker" value="#00c6ff" oninput="document.getElementById('bannerModalBtn1Bg').value=this.value">
          </div>
        </div>
        <div class="form-group"><label>텍스트 색상</label>
          <div class="color-input-wrap">
            <input type="text" class="form-control" id="bannerModalBtn1TextColor" placeholder="#ffffff" value="#ffffff" oninput="syncPicker('bannerModalBtn1TextColorPicker',this.value)"/>
            <input type="color" id="bannerModalBtn1TextColorPicker" value="#ffffff" oninput="document.getElementById('bannerModalBtn1TextColor').value=this.value">
          </div>
        </div>
      </div>

      <!-- 버튼 2 -->
      <p class="form-section-label" style="font-weight:600;margin:16px 0 12px;">버튼 2 (텍스트 버튼)</p>
      <div class="form-grid" style="margin-bottom:16px;">
        <div class="form-group"><label>버튼 2 사용</label>
          <div class="toggle-wrap">
            <label class="toggle"><input type="checkbox" id="bannerModalBtn2On"><span class="toggle-slider"></span></label>
            <span class="toggle-label">사용</span>
          </div>
        </div>
        <div class="form-group"><label>버튼 텍스트</label>
          <input type="text" class="form-control" id="bannerModalBtn2Text" placeholder="더 알아보기"/>
        </div>
        <div class="form-group"><label>링크 URL</label>
          <input type="text" class="form-control" id="bannerModalBtn2Link" placeholder="https://"/>
        </div>
        <div class="form-group"><label>텍스트 색상</label>
          <div class="color-input-wrap">
            <input type="text" class="form-control" id="bannerModalBtn2TextColor" placeholder="#ffffff" value="#ffffff" oninput="syncPicker('bannerModalBtn2TextColorPicker',this.value)"/>
            <input type="color" id="bannerModalBtn2TextColorPicker" value="#ffffff" oninput="document.getElementById('bannerModalBtn2TextColor').value=this.value">
          </div>
        </div>
      </div>

      <!-- 기존 링크 필드 (버튼 미사용 시 배너 전체 클릭 링크로 활용) -->
      <hr style="margin:16px 0;border-color:var(--border);">
      <p class="form-section-label" style="font-weight:600;margin-bottom:12px;">배너 클릭 링크 <span style="font-size:.75rem;color:var(--text-muted)">(버튼 미사용 시 전체 클릭 링크)</span></p>
      <div class="form-grid" style="margin-bottom:16px;">
        <div class="form-group"><label>링크 URL</label>
          <input type="text" class="form-control" id="bannerModalLinkUrl" placeholder="https://"/>
        </div>
        <div class="form-group"><label>링크 타겟</label>
          <select class="form-control" id="bannerModalLinkTarget">
            <option value="_self">현재창</option>
            <option value="_blank">새창</option>
          </select>
        </div>
      </div>

    </div><!-- /modal-body -->
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('bannerEditModal')">취소</button>
      <button class="btn btn-primary" onclick="saveBannerModal()">저장</button>
    </div>
  </div>
</div>