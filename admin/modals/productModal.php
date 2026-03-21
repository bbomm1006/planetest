<div class="modal-overlay" id="productModal">
  <div class="modal modal-lg">
    <div class="modal-header">
      <h3>제품 추가</h3>
      <button class="modal-close" onclick="closeModal('productModal')">✕</button>
    </div>
    <div class="modal-body">
      <div class="form-grid">
        <div class="form-group">
          <label>분류 <span class="req">*</span></label>
          <select class="form-control" id="productCategoryId">
            <option value="">-- 분류 선택 --</option>
          </select>
        </div>
        <div class="form-group">
          <label>모델명 <span class="req">*</span></label>
          <input type="text" class="form-control" id="productModelNo" placeholder="모델명"/>
        </div>
        <div class="form-group col-span-2">
          <label>제품명 <span class="req">*</span></label>
          <input type="text" class="form-control" id="productName" placeholder="제품명"/>
        </div>
        <div class="form-group">
          <label>배지 텍스트</label>
          <input type="text" class="form-control" id="productBadgeText" placeholder="예: NEW"/>
        </div>
        <div class="form-group">
          <label>배지 색상</label>
          <div class="color-group">
            <input type="color" id="productBadgeColor" value="#dc2626">
            <input type="text"  class="form-control" id="productBadgeColorText" value="#dc2626"/>
          </div>
        </div>
        <div class="form-group">
          <label>정가</label>
          <input type="number" class="form-control" id="productPrice" placeholder="0" min="0"/>
        </div>
        <div class="form-group">
          <label>할인금액</label>
          <input type="number" class="form-control" id="productDiscount" placeholder="0" min="0"/>
        </div>
        <div class="form-group col-span-2">
          <label>짧은 설명</label>
          <input type="text" class="form-control" id="productShortDesc" placeholder="목록에 표시될 짧은 설명"/>
        </div>
        <div class="form-group col-span-2">
          <label>상세 설명</label>
          <textarea class="form-control" id="productDetailDesc" rows="6" placeholder="상세 설명 (HTML 입력 가능)"></textarea>
        </div>
        <div class="form-group col-span-2">
          <label>이미지</label>
          <div class="upload-area" id="productImgArea" onclick="triggerUpload('productImg')">
            <div class="upload-icon">📸</div><p><strong>클릭하여 업로드</strong></p>
          </div>
          <input type="file" id="productImg" accept="image/*" style="display:none">
          <input type="hidden" id="productImage">
        </div>
        <div class="form-group col-span-2">
          <label>태그</label>
          <div class="tags-input-area" id="productTagsArea" onclick="this.querySelector('input').focus()">
            <input type="text" placeholder="태그 입력 후 Enter" onkeydown="addTag(event,'productTagsArea')"/>
          </div>
          <input type="hidden" id="productTags">
          <p class="form-hint">Enter 키로 태그 추가</p>
        </div>

        <!-- ====== 스팩 편집 섹션 ====== -->
        <div class="form-group col-span-2">
          <label style="display:flex;align-items:center;justify-content:space-between;">
            <span>스팩</span>
            <button type="button" class="btn btn-sm btn-outline" onclick="addSpecRow()">+ 행 추가</button>
          </label>
          <div id="specRowsWrap" style="margin-top:8px;">
            <div id="specRows">
              <!-- 행은 JS로 추가됨 -->
            </div>
            <p id="specEmptyMsg" style="color:var(--text-muted);font-size:.82rem;padding:8px 0;">등록된 스팩이 없습니다. 행 추가 버튼을 눌러 추가하세요.</p>
          </div>
          <p class="form-hint">스팩명이 같은 제품끼리 비교 화면에서 자동으로 대조됩니다.</p>
        </div>
        <!-- ====== /스팩 편집 섹션 ====== -->

      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="closeModal('productModal')">취소</button>
      <button class="btn btn-primary" onclick="saveProductModal()">저장</button>
    </div>
  </div>
</div>
