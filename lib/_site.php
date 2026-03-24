<style>  
/* ── 서비스 전환 바 (통합 네비) ── */
.site-sw{
  position:fixed;top:0;left:0;right:0;z-index:1001;
  display:flex;align-items:center;justify-content:center;
  background:rgba(4,6,14,.97);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);
  height:40px;border-bottom:1px solid rgba(255,255,255,.07);
}
.site-sw a{
  display:flex;align-items:center;gap:6px;
  padding:0 18px;height:100%;
  font-size:.72rem;font-weight:700;letter-spacing:.04em;
  color:rgba(255,255,255,.62);text-decoration:none;
  transition:color .2s,background .2s;
  border-right:1px solid rgba(255,255,255,.07);
  white-space:nowrap;
}
.site-sw a:last-child{border-right:none;}
.site-sw a:hover{color:rgba(255,255,255,.9);background:rgba(255,255,255,.05);}
.site-sw a.sw-active{color:#fff;}
.site-sw a svg{width:13px;height:13px;flex-shrink:0;stroke:currentColor;fill:none;stroke-width:2;}
.site-sw a.sw-active svg{stroke:#00c6ff;}

/* ── 모바일 대응: 균등 분할 및 중앙 정렬 보정 ── */
@media (max-width: 768px) {
  .site-sw {
    justify-content: space-between; /* 전체 영역을 꽉 채우도록 설정 */
  }

  .site-sw a {
    flex: 1;                 /* 5등분 균등 분할 */
    display: flex;           /* 플렉스 박스 활성화 */
    justify-content: center; /* 아이콘 가로 중앙 정렬 (쏠림 방지) */
    align-content: center;   /* 세로 정렬 보강 */
    padding: 0;              /* 기존 패딩 초기화 */
    font-size: 0;            /* 텍스트 숨김 */
    gap: 0;
    
    /* 구분선이 안 보일 경우를 대비해 명시적 설정 */
    border-right: 1px solid rgba(255, 255, 255, .1) !important;
  }

  .site-sw a:last-child {
    border-right: none !important; /* 마지막 항목 구분선 제거 */
  }

  .site-sw a svg {
    width: 18px;   /* 터치 편의성을 위해 크기를 살짝 더 키움 */
    height: 18px;
    margin: 0 auto; /* 마진 자동 설정으로 중앙 고정 */
  }
}
/* ── END 서비스 전환 바 ── */
</style>

<div class="site-sw">
  <a href="http://plane01.gabia.io/" class="sw-active">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8 7 4 10 4 14a8 8 0 0016 0c0-4-4-7-8-12z"/></svg>정수기
  </a>
  <a href="http://plane01.gabia.io/castle.php" >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="18"/><rect x="14" y="9" width="7" height="12"/></svg>분양
  </a>
  <a href="http://plane01.gabia.io/apart.php" >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="18"/><rect x="14" y="9" width="7" height="12"/></svg>분양2
  </a>
  <a href="http://plane01.gabia.io/car.php">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="13" width="22" height="6" rx="2"/><path d="M7 13V9a2 2 0 012-2h6a2 2 0 012 2v4"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>렌트카
  </a>
  <a href="http://plane01.gabia.io/phone.php">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>모바일
  </a>  
  <a href="http://plane01.gabia.io/insurance.php">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>보험
  </a>  
  <a href="http://plane01.gabia.io/card.php">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>카드
  </a>
</div>

<script>
  const links = document.querySelectorAll('.site-sw a');
  const currentPath = window.location.pathname;

  links.forEach(link => {
    const linkPath = new URL(link.href).pathname;

    if (currentPath === linkPath) {
      link.classList.add('sw-active');
    } else {
      link.classList.remove('sw-active');
    }
  });
</script>