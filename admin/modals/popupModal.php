<div class="modal-overlay" id="popupModal">
  <div class="modal">
    <div class="modal-header">
      <h3>팝업 추가</h3>
      <button class="modal-close" onclick="closeModal('popupModal')">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group col-span-2"><label>노출 여부</label>
          <div class="toggle-wrap">
            <label class="toggle"><input type="checkbox" id="popupVisible" checked><span class="toggle-slider"></span></label>
            <span class="toggle-label" id="popupVisibleLabel">노출</span>
          </div>
        </div>
        <div class="form-group col-span-2"><label>제목 <span class="req">*</span></label>
          <input type="text" class="form-control" id="popupTitle" placeholder="팝업 제목"/>
        </div>
        <div class="form-group"><label>링크 URL</label>
          <input type="text" class="form-control" id="popupLinkUrl" placeholder="https://"/>
        </div>
        <div class="form-group"><label>링크 타겟</label>
          <select class="form-control" id="popupLinkTarget">
            <option value="_self">현재창</option>
            <option value="_blank">새창</option>
          </select>
        </div>
        <div class="form-group"><label>노출 시작일시</label>
          <input type="datetime-local" class="form-control" id="popupStartDt"/>
        </div>
        <div class="form-group"><label>노출 종료일시</label>
          <input type="datetime-local" class="form-control" id="popupEndDt"/>
        </div>
        <div class="form-group"><label>PC 이미지</label>
          <div class="upload-area" id="popupPcImgArea" onclick="triggerUpload('popupPcImg')">
            <div class="upload-icon">🖥️</div><p><strong>PC 이미지 업로드</strong></p><p style="font-size:.75rem;">권장: 800×600px</p>
          </div>
          <input type="file" id="popupPcImg" accept="image/*" style="display:none">
          <input type="hidden" id="popupPcImageVal">
        </div>
        <div class="form-group"><label>모바일 이미지</label>
          <div class="upload-area" id="popupMoImgArea" onclick="triggerUpload('popupMoImg')">
            <div class="upload-icon">📱</div><p><strong>모바일 이미지 업로드</strong></p><p style="font-size:.75rem;">권장: 400×600px</p>
          </div>
          <input type="file" id="popupMoImg" accept="image/*" style="display:none">
          <input type="hidden" id="popupMoImageVal">
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('popupModal')">취소</button>
      <button class="btn btn-primary" onclick="savePopupModal()">저장</button>
    </div>
  </div>
</div>