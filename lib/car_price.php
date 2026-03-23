<!-- ════════════════════════════════════════
     5. 제조사별 차량 금액안내
════════════════════════════════════════ -->
<section class="section-wrap price-section" id="price">
  <div class="inner">
    <header class="price-section-head reveal">
      <div class="badge">PRICE GUIDE</div>
      <h2 class="section-title price-section-title">제조사별 차량 금액 안내</h2>
      <p class="section-sub price-section-sub">원하는 제조사와 차량을 선택해 월 렌트료를 확인하세요</p>
    </header>

    <div class="price-tabs-wrap reveal">
      <div class="price-tabs-scroll">
        <div class="price-tabs" role="tablist" aria-label="차량 구분">
          <button type="button" class="price-tab active" role="tab" data-price-type="domestic" aria-selected="true" onclick="setTab(this,'domestic')">국산차</button>
          <button type="button" class="price-tab" role="tab" data-price-type="import" aria-selected="false" onclick="setTab(this,'import')">수입차</button>
        </div>
      </div>
    </div>

    <div class="search-bar reveal">
      <label class="search-field">
        <span class="search-field-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        </span>
        <input class="search-input" type="search" autocomplete="off" placeholder="차량명 검색 (예: 팰리세이드, GV80)">
      </label>
      <button type="button" class="search-btn">검색</button>
    </div>

    <div class="brand-tabs-wrap reveal">
      <div class="brand-tabs-scroll">
        <div class="brand-tabs" id="brand-grid" role="tablist" aria-label="제조사 선택">
          <button type="button" class="brand-tab active" role="tab" aria-selected="true" data-brand="현대">
            <img class="brand-tab__logo" src="images/brands/hyundai.svg" width="120" height="28" loading="lazy" decoding="async" alt="">
            <span class="brand-tab__label">현대</span>
          </button>
          <button type="button" class="brand-tab" role="tab" aria-selected="false" data-brand="기아">
            <img class="brand-tab__logo" src="images/brands/kia.svg" width="80" height="28" loading="lazy" decoding="async" alt="">
            <span class="brand-tab__label">기아</span>
          </button>
          <button type="button" class="brand-tab" role="tab" aria-selected="false" data-brand="제네시스">
            <img class="brand-tab__logo" src="images/brands/genesis.svg" width="140" height="28" loading="lazy" decoding="async" alt="">
            <span class="brand-tab__label">제네시스</span>
          </button>
          <button type="button" class="brand-tab" role="tab" aria-selected="false" data-brand="쉐보레">
            <img class="brand-tab__logo" src="images/brands/chevrolet.svg" width="160" height="28" loading="lazy" decoding="async" alt="">
            <span class="brand-tab__label">쉐보레</span>
          </button>
          <button type="button" class="brand-tab" role="tab" aria-selected="false" data-brand="르노">
            <img class="brand-tab__logo" src="images/brands/renault.svg" width="130" height="28" loading="lazy" decoding="async" alt="">
            <span class="brand-tab__label">르노</span>
          </button>
          <button type="button" class="brand-tab" role="tab" aria-selected="false" data-brand="KG모빌리티">
            <img class="brand-tab__logo" src="images/brands/kg.svg" width="180" height="28" loading="lazy" decoding="async" alt="">
            <span class="brand-tab__label">KG모빌리티</span>
          </button>
          <button type="button" class="brand-tab" role="tab" aria-selected="false" data-brand="쌍용">
            <img class="brand-tab__logo" src="images/brands/ssangyong.svg" width="160" height="28" loading="lazy" decoding="async" alt="">
            <span class="brand-tab__label">쌍용</span>
          </button>
          <button type="button" class="brand-tab" role="tab" aria-selected="false" data-brand="폴스타">
            <img class="brand-tab__logo" src="images/brands/polestar.svg" width="140" height="28" loading="lazy" decoding="async" alt="">
            <span class="brand-tab__label">폴스타</span>
          </button>
        </div>
      </div>
    </div>

    <div class="vehicle-brand-banner reveal delay-1" id="vehicle-brand-banner">
      <img class="vehicle-brand-banner__logo" id="vehicle-brand-banner-img" src="images/brands/hyundai.svg" width="200" height="48" loading="eager" decoding="async" alt="현대">
    </div>

    <p class="vehicle-grid-empty" id="vehicle-grid-empty" hidden>선택한 제조사의 차량 정보를 준비 중입니다.</p>

    <div class="vehicle-grid reveal" id="vehicle-grid">
      <article class="vehicle-card" tabindex="0" role="button" aria-label="팰리세이드 상세 보기"
        data-v-name="팰리세이드" data-v-brand="현대" data-v-price="89" data-v-range="3년 · 5만km"
        data-v-img="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&amp;h=500&amp;fit=crop&amp;q=80"
        data-v-desc="월 납입 예시 금액입니다. 신용등급·보증금·옵션·프로모션에 따라 실제 약정 금액은 달라질 수 있으며, 전담 매니저가 맞춤 견적을 안내해 드립니다.">
        <figure class="vehicle-thumb">
          <img class="vehicle-thumb-img" src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&amp;h=375&amp;fit=crop&amp;q=80" width="600" height="375" loading="lazy" alt="">
          <figcaption class="vehicle-thumb-overlay">
            <h3 class="vehicle-overlay-title">팰리세이드</h3>
            <div class="vehicle-overlay-price">
              <span class="vehicle-overlay-from">월</span>
              <span class="vehicle-overlay-num">89</span><span class="vehicle-overlay-unit">만원</span><span class="vehicle-overlay-tilde">~</span>
            </div>
          </figcaption>
        </figure>
        <div class="vehicle-card-meta"><p class="vehicle-range">3년 · 5만km · 장기렌트</p></div>
      </article>
      <article class="vehicle-card" tabindex="0" role="button" aria-label="아이오닉6 상세 보기"
        data-v-name="아이오닉6" data-v-brand="현대" data-v-price="68" data-v-range="3년 · 5만km"
        data-v-img="https://images.unsplash.com/photo-1617814076667-1bd2159e6d09?w=800&amp;h=500&amp;fit=crop&amp;q=80"
        data-v-desc="전기차 세제 혜택 및 보조금 반영 여부에 따라 월 납입이 달라질 수 있습니다. 상세 조건은 상담 시 안내합니다.">
        <figure class="vehicle-thumb">
          <img class="vehicle-thumb-img" src="https://images.unsplash.com/photo-1617814076667-1bd2159e6d09?w=600&amp;h=375&amp;fit=crop&amp;q=80" width="600" height="375" loading="lazy" alt="">
          <figcaption class="vehicle-thumb-overlay">
            <h3 class="vehicle-overlay-title">아이오닉6</h3>
            <div class="vehicle-overlay-price">
              <span class="vehicle-overlay-from">월</span>
              <span class="vehicle-overlay-num">68</span><span class="vehicle-overlay-unit">만원</span><span class="vehicle-overlay-tilde">~</span>
            </div>
          </figcaption>
        </figure>
        <div class="vehicle-card-meta"><p class="vehicle-range">3년 · 5만km · 장기렌트</p></div>
      </article>
      <article class="vehicle-card" tabindex="0" role="button" aria-label="그랜저 상세 보기"
        data-v-name="그랜저" data-v-brand="현대" data-v-price="76" data-v-range="3년 · 5만km"
        data-v-img="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&amp;h=500&amp;fit=crop&amp;q=80"
        data-v-desc="대형 세단 인기 모델 기준 예시 금액입니다. 트림·색상·용품에 따라 변동될 수 있습니다.">
        <figure class="vehicle-thumb">
          <img class="vehicle-thumb-img" src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&amp;h=375&amp;fit=crop&amp;q=80" width="600" height="375" loading="lazy" alt="">
          <figcaption class="vehicle-thumb-overlay">
            <h3 class="vehicle-overlay-title">그랜저</h3>
            <div class="vehicle-overlay-price">
              <span class="vehicle-overlay-from">월</span>
              <span class="vehicle-overlay-num">76</span><span class="vehicle-overlay-unit">만원</span><span class="vehicle-overlay-tilde">~</span>
            </div>
          </figcaption>
        </figure>
        <div class="vehicle-card-meta"><p class="vehicle-range">3년 · 5만km · 장기렌트</p></div>
      </article>
      <article class="vehicle-card" tabindex="0" role="button" aria-label="투싼 상세 보기"
        data-v-name="투싼" data-v-brand="현대" data-v-price="52" data-v-range="3년 · 5만km"
        data-v-img="https://images.unsplash.com/photo-1519641471654-76ce32f0b6dd?w=800&amp;h=500&amp;fit=crop&amp;q=80"
        data-v-desc="SUV 라인업 기준 월 렌트 예시입니다. 계약 기간 연장 시 월 납입 조정이 가능합니다.">
        <figure class="vehicle-thumb">
          <img class="vehicle-thumb-img" src="https://images.unsplash.com/photo-1519641471654-76ce32f0b6dd?w=600&amp;h=375&amp;fit=crop&amp;q=80" width="600" height="375" loading="lazy" alt="">
          <figcaption class="vehicle-thumb-overlay">
            <h3 class="vehicle-overlay-title">투싼</h3>
            <div class="vehicle-overlay-price">
              <span class="vehicle-overlay-from">월</span>
              <span class="vehicle-overlay-num">52</span><span class="vehicle-overlay-unit">만원</span><span class="vehicle-overlay-tilde">~</span>
            </div>
          </figcaption>
        </figure>
        <div class="vehicle-card-meta"><p class="vehicle-range">3년 · 5만km · 장기렌트</p></div>
      </article>
      <article class="vehicle-card" tabindex="0" role="button" aria-label="싼타페 상세 보기"
        data-v-name="싼타페" data-v-brand="현대" data-v-price="65" data-v-range="3년 · 5만km"
        data-v-img="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&amp;h=500&amp;fit=crop&amp;q=80"
        data-v-desc="패밀리 SUV 인기 모델입니다. 5인·7인 시트 등 선택에 따라 금액이 달라질 수 있습니다.">
        <figure class="vehicle-thumb">
          <img class="vehicle-thumb-img" src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&amp;h=375&amp;fit=crop&amp;q=80" width="600" height="375" loading="lazy" alt="">
          <figcaption class="vehicle-thumb-overlay">
            <h3 class="vehicle-overlay-title">싼타페</h3>
            <div class="vehicle-overlay-price">
              <span class="vehicle-overlay-from">월</span>
              <span class="vehicle-overlay-num">65</span><span class="vehicle-overlay-unit">만원</span><span class="vehicle-overlay-tilde">~</span>
            </div>
          </figcaption>
        </figure>
        <div class="vehicle-card-meta"><p class="vehicle-range">3년 · 5만km · 장기렌트</p></div>
      </article>
      <article class="vehicle-card" tabindex="0" role="button" aria-label="스타리아 상세 보기"
        data-v-name="스타리아" data-v-brand="현대" data-v-price="78" data-v-range="3년 · 5만km"
        data-v-img="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&amp;h=500&amp;fit=crop&amp;q=80"
        data-v-desc="승합·레저 수요에 맞는 장기렌트 플랜을 제안해 드립니다. 카고·투어러 등 용도별 상담 가능합니다.">
        <figure class="vehicle-thumb">
          <img class="vehicle-thumb-img" src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&amp;h=375&amp;fit=crop&amp;q=80" width="600" height="375" loading="lazy" alt="">
          <figcaption class="vehicle-thumb-overlay">
            <h3 class="vehicle-overlay-title">스타리아</h3>
            <div class="vehicle-overlay-price">
              <span class="vehicle-overlay-from">월</span>
              <span class="vehicle-overlay-num">78</span><span class="vehicle-overlay-unit">만원</span><span class="vehicle-overlay-tilde">~</span>
            </div>
          </figcaption>
        </figure>
        <div class="vehicle-card-meta"><p class="vehicle-range">3년 · 5만km · 장기렌트</p></div>
      </article>
      <article class="vehicle-card" tabindex="0" role="button" aria-label="코나 상세 보기"
        data-v-name="코나" data-v-brand="현대" data-v-price="48" data-v-range="3년 · 5만km"
        data-v-img="https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&amp;h=500&amp;fit=crop&amp;q=80"
        data-v-desc="소형 SUV 라인업 예시 금액입니다. 트림·파워트레인에 따라 월 납입이 달라질 수 있습니다.">
        <figure class="vehicle-thumb">
          <img class="vehicle-thumb-img" src="https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=600&amp;h=375&amp;fit=crop&amp;q=80" width="600" height="375" loading="lazy" alt="">
          <figcaption class="vehicle-thumb-overlay">
            <h3 class="vehicle-overlay-title">코나</h3>
            <div class="vehicle-overlay-price">
              <span class="vehicle-overlay-from">월</span>
              <span class="vehicle-overlay-num">48</span><span class="vehicle-overlay-unit">만원</span><span class="vehicle-overlay-tilde">~</span>
            </div>
          </figcaption>
        </figure>
        <div class="vehicle-card-meta"><p class="vehicle-range">3년 · 5만km · 장기렌트</p></div>
      </article>
      <article class="vehicle-card" tabindex="0" role="button" aria-label="쏘나타 상세 보기"
        data-v-name="쏘나타" data-v-brand="현대" data-v-price="58" data-v-range="3년 · 5만km"
        data-v-img="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&amp;h=500&amp;fit=crop&amp;q=80"
        data-v-desc="중형 세단 인기 모델 기준 예시입니다. 하이브리드·가솔린 선택에 따라 금액이 변동될 수 있습니다.">
        <figure class="vehicle-thumb">
          <img class="vehicle-thumb-img" src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&amp;h=375&amp;fit=crop&amp;q=80" width="600" height="375" loading="lazy" alt="">
          <figcaption class="vehicle-thumb-overlay">
            <h3 class="vehicle-overlay-title">쏘나타</h3>
            <div class="vehicle-overlay-price">
              <span class="vehicle-overlay-from">월</span>
              <span class="vehicle-overlay-num">58</span><span class="vehicle-overlay-unit">만원</span><span class="vehicle-overlay-tilde">~</span>
            </div>
          </figcaption>
        </figure>
        <div class="vehicle-card-meta"><p class="vehicle-range">3년 · 5만km · 장기렌트</p></div>
      </article>
      <article class="vehicle-card vehicle-card--no-image" tabindex="0" role="button" aria-label="차량명 미정 상세 보기"
        data-v-name="차량명 미정" data-v-brand="현대" data-v-price="" data-v-range="조건 협의" data-v-img=""
        data-v-empty="1"
        data-v-desc="등록된 이미지와 차량 정보가 없습니다. 원하시는 차종을 남겨주시면 담당자가 별도로 연락드립니다.">
        <figure class="vehicle-thumb vehicle-thumb--empty">
          <span class="vehicle-thumb-empty-mark">NO IMAGE</span>
          <span class="vehicle-thumb-empty-hint">이미지 등록 전</span>
          <figcaption class="vehicle-thumb-overlay vehicle-thumb-overlay--empty">
            <h3 class="vehicle-overlay-title">차량명 미정</h3>
            <div class="vehicle-overlay-price">
              <span class="vehicle-overlay-num vehicle-overlay-num--muted">—</span><span class="vehicle-overlay-unit">만원</span><span class="vehicle-overlay-tilde">~</span>
            </div>
          </figcaption>
        </figure>
        <div class="vehicle-card-meta"><p class="vehicle-range vehicle-range--muted">조건 협의 · 상담 후 안내</p></div>
      </article>
    </div>
    <!-- 더보기 영역: 8개 초과 시 script.js에서 버튼 삽입 -->
    <div class="vehicle-more-host" id="vehicle-more-host" aria-live="polite"></div>
  </div>
</section>