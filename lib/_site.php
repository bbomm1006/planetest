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
  <a href="http://theplane.co.kr/">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>홈
  </a>
  <a href="http://plane01.gabia.io/" class="sw-active">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8 7 4 10 4 14a8 8 0 0016 0c0-4-4-7-8-12z"/></svg>정수기
  </a>
  <a href="http://plane02.gabia.io/" >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="18"/><rect x="14" y="9" width="7" height="12"/></svg>분양
  </a>
  <a href="http://plane04.gabia.io/">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" i="13" width="22" height="6" rx="2"/><path d="M7 13V9a2 2 0 012-2h6a2 2 0 012 2v4"/><circle cx="7" cy="19" r="2"/><circle cx="17" cy="19" r="2"/></svg>렌트카
  </a>
  <a href="http://plane03.gabia.io/">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>모바일
  </a>
</div>