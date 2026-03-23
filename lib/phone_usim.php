<!-- ═══ USIM PLANS ═══ -->
<section id="usim">
  <div class="section-inner">
    <div class="section-header-row">
      <div class="section-header" style="margin-bottom:0">
        <div class="section-tag">유심 요금제</div>
        <h2 class="section-title">내 번호 그대로,<br><span>요금만 확 줄이세요</span></h2>
        <p class="section-sub">번호이동 / 신규가입 모두 가능 · 당일 개통</p>
      </div>
      <a class="view-all" href="#">전체보기 <i class="fa-solid fa-arrow-right"></i></a>
    </div>
    <!-- PC: 탭 버튼 / 모바일: select 드롭다운 -->
    <div class="plan-tabs">
      <button class="plan-tab active">전체</button>
      <button class="plan-tab">SK망</button>
      <button class="plan-tab">KT망</button>
      <button class="plan-tab">LG망</button>
      <button class="plan-tab">5G</button>
    </div>
    <select class="plan-select">
      <option>전체 요금제</option>
      <option>SK망</option>
      <option>KT망</option>
      <option>LG망</option>
      <option>5G</option>
    </select>
    <div class="scroll-wrap">
      <button class="scroll-arrow sa-left" onclick="scrollTrack(this,-1)"><i class="fa-solid fa-chevron-left"></i></button>
      <div class="scroll-track cols-4" id="usimTrack">
        <div class="plan-card">
          <div class="plan-operator">SK망 LTE</div>
          <div class="plan-name">미니 2GB</div>
          <div class="plan-price">9,900<small>원/월</small></div>
          <div class="plan-original">기존 55,000원</div>
          <div class="plan-specs">
            <div class="plan-spec"><i class="fa-solid fa-database"></i><span><strong>2GB</strong> + 속도제한 무제한</span></div>
            <div class="plan-spec"><i class="fa-solid fa-phone"></i><span>음성 <strong>100분</strong></span></div>
            <div class="plan-spec"><i class="fa-regular fa-comment"></i><span>문자 <strong>기본제공</strong></span></div>
          </div>
          <button class="btn-plan">신청하기</button>
        </div>
        <div class="plan-card featured">
          <div class="plan-badge">인기</div>
          <div class="plan-operator">KT망 LTE</div>
          <div class="plan-name">슬림 15GB 플러스</div>
          <div class="plan-price">19,900<small>원/월</small></div>
          <div class="plan-original">기존 69,000원</div>
          <div class="plan-specs">
            <div class="plan-spec"><i class="fa-solid fa-database"></i><span><strong>15GB</strong> + 1Mbps 무제한</span></div>
            <div class="plan-spec"><i class="fa-solid fa-phone"></i><span>음성 <strong>무제한</strong></span></div>
            <div class="plan-spec"><i class="fa-regular fa-comment"></i><span>문자 <strong>무제한</strong></span></div>
          </div>
          <button class="btn-plan">신청하기</button>
        </div>
        <div class="plan-card">
          <div class="plan-operator">LG망 LTE</div>
          <div class="plan-name">스탠다드 30GB</div>
          <div class="plan-price">28,900<small>원/월</small></div>
          <div class="plan-original">기존 79,000원</div>
          <div class="plan-specs">
            <div class="plan-spec"><i class="fa-solid fa-database"></i><span><strong>30GB</strong> + 3Mbps 무제한</span></div>
            <div class="plan-spec"><i class="fa-solid fa-phone"></i><span>음성 <strong>무제한</strong></span></div>
            <div class="plan-spec"><i class="fa-regular fa-comment"></i><span>문자 <strong>무제한</strong></span></div>
          </div>
          <button class="btn-plan">신청하기</button>
        </div>
        <div class="plan-card">
          <div class="plan-badge" style="background:var(--dark)">5G</div>
          <div class="plan-operator">SK망 5G</div>
          <div class="plan-name">5G 완전 무제한</div>
          <div class="plan-price">39,900<small>원/월</small></div>
          <div class="plan-original">기존 110,000원</div>
          <div class="plan-specs">
            <div class="plan-spec"><i class="fa-solid fa-database"></i><span>5G <strong>완전 무제한</strong></span></div>
            <div class="plan-spec"><i class="fa-solid fa-phone"></i><span>음성 <strong>무제한</strong></span></div>
            <div class="plan-spec"><i class="fa-regular fa-comment"></i><span>문자 <strong>무제한</strong></span></div>
          </div>
          <button class="btn-plan">신청하기</button>
        </div>
      </div>
      <button class="scroll-arrow sa-right" onclick="scrollTrack(this,1)"><i class="fa-solid fa-chevron-right"></i></button>
    </div>
    <button class="show-more-btn" onclick="showMore('usimTrack',this)">더보기 <i class="fa-solid fa-chevron-down"></i></button>
  </div>
</section>