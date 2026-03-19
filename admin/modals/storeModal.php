<div class="modal-overlay" id="storeModal">
  <div class="modal modal-lg">
    <div class="modal-header">
      <h3>매장 추가</h3>
      <button class="modal-close" onclick="closeModal('storeModal')">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group">
          <label>매장명 <span class="req">*</span></label>
          <input type="text" class="form-control" id="storeStoreName" placeholder="매장명"/>
        </div>
        <div class="form-group">
          <label>지점명 <span class="req">*</span></label>
          <input type="text" class="form-control" id="storeBranchName" placeholder="지점명"/>
        </div>
        <div class="form-group col-span-2">
          <label>노출 여부</label>
          <div class="toggle-wrap">
            <label class="toggle"><input type="checkbox" id="storeVisible" checked><span class="toggle-slider"></span></label>
            <span class="toggle-label" id="storeVisibleLabel">노출</span>
          </div>
        </div>
        <div class="form-group col-span-2">
          <label>주소</label>
          <div style="display:flex;gap:8px;">
            <input type="text" class="form-control" id="storeAddress" placeholder="주소 검색 버튼을 눌러주세요" readonly style="background:var(--bg-secondary);cursor:pointer;" onclick="searchStoreAddress()"/>
            <button type="button" class="btn btn-outline" onclick="searchStoreAddress()" style="white-space:nowrap;">🗺️ 주소 검색</button>
          </div>
          <input type="hidden" id="storeLat">
          <input type="hidden" id="storeLng">
        </div>
        <div class="form-group col-span-2" id="storeMapWrap" style="display:none;">
          <div id="storeMapPreview" style="width:100%;height:220px;border-radius:var(--radius);border:1px solid var(--border);"></div>
        </div>
        <div class="form-group">
          <label>전화번호</label>
          <input type="text" class="form-control" id="storePhone" placeholder="02-0000-0000"/>
        </div>
        <div class="form-group">
          <label>운영시간</label>
          <input type="text" class="form-control" id="storeOpenHours" placeholder="09:00~18:00"/>
        </div>
        <div class="form-group col-span-2">
          <label>예약하기 링크</label>
          <div class="link-row">
            <input type="text" class="form-control" id="storeReserveUrl" placeholder="https://"/>
            <select class="form-control link-target" id="storeReserveTarget">
              <option value="_self">현재창</option>
              <option value="_blank">새창</option>
            </select>
          </div>
        </div>
        <div class="form-group col-span-2">
          <label>메모</label>
          <input type="text" class="form-control" id="storeMemo" placeholder="내부 메모"/>
        </div>
        <div class="form-group col-span-2">
          <label>상세 안내</label>
          <textarea class="form-control" id="storeDetailInfo" rows="3" placeholder="매장 상세 안내"></textarea>
        </div>
        <div class="form-group col-span-2">
          <label>매장 사진 <span style="font-size:.77rem;color:var(--text-muted);">(드래그로 순서 변경)</span></label>
          <div class="upload-area" onclick="triggerUpload('storeImgFiles')">
            <div class="upload-icon">📸</div>
            <p><strong>여러 장 업로드</strong> 가능 · 드래그로 순서 변경</p>
          </div>
          <input type="file" id="storeImgFiles" accept="image/*" multiple style="display:none">
          <input type="hidden" id="storeImagesVal">
          <div class="image-preview-grid" id="storeImgPreview"></div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('storeModal')">취소</button>
      <button class="btn btn-primary" onclick="saveStoreModal()">저장</button>
    </div>
  </div>
</div>