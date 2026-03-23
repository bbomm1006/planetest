<!-- ═══ RECOMMEND ═══ -->
<section id="recommend" style="padding:0">
  <div class="recommend-wrap">
      <div class="recommend-content">
        <h2>내게 딱 맞는 요금제를 찾아드려요</h2>
        <p>사용 패턴 3가지 질문으로 최적의 요금제를 추천해 드립니다.</p>
      </div>
      <div class="recommend-steps">
        <div class="recommend-step"><span class="recommend-step-num">1</span> 데이터 사용량 입력</div>
        <div class="recommend-step"><span class="recommend-step-num">2</span> 통화 패턴 선택</div>
        <div class="recommend-step"><span class="recommend-step-num">3</span> 맞춤 요금제 확인</div>
      </div>
      <div class="data-slider-wrap">
        <div class="data-slider-label">📊 1단계 · 한 달 데이터 사용량이 얼마나 되나요?</div>
        <div class="data-slider-value" id="sliderVal">10<span>GB</span></div>
        <input type="range" class="data-slider" id="dataSlider" min="0" max="6" value="2" step="1" oninput="updateSlider(this.value)">
        <div class="data-slider-ticks"><span>1GB</span><span>3GB</span><span>10GB</span><span>15GB</span><span>30GB</span><span>50GB</span><span>무제한</span></div>
        <div class="data-slider-result">
          <div>
            <div class="data-slider-result-label">추천 요금제</div>
            <div class="data-slider-result-plan" id="sliderPlan">슬림 15GB 플러스 · 월 19,900원</div>
          </div>
          <button class="data-slider-btn" onclick="location.href='#usim'">요금제 보기 →</button>
        </div>
      </div>
  </div>
</section>