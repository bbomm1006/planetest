/* ═══════════════════════════════════════
   store.js — 매장 찾기 (카카오 지도)
═══════════════════════════════════════ */

var _slAll         = [];
var _slFiltered    = [];
var _slActive      = -1;
var _slUserLat     = null;
var _slUserLng     = null;
var _slMap         = null;
var _slMarkers     = [];
var _slOpenIw      = null;
var _slActiveStore = null;
var _slMapInited   = false;
var _slToastTimer  = null;

/* ── 거리 계산 (Haversine, km) ── */
function _slKm(lat1, lng1, lat2, lng2) {
  var R = 6371, p = Math.PI / 180;
  var dLat = (lat2 - lat1) * p, dLng = (lng2 - lng1) * p;
  var a = Math.sin(dLat/2)*Math.sin(dLat/2)
    + Math.cos(lat1*p)*Math.cos(lat2*p)
    * Math.sin(dLng/2)*Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

/* ── 드롭다운 빌드 ── */
function _slBuildDropdowns() {
  var sidoMap = {};
  _slAll.forEach(function(s) {
    var r = (s.region || '').trim();
    if (!r) return;
    var parts = r.split(/\s+/);
    var sido = parts[0] || r;
    var sigungu = parts.slice(1).join(' ') || '';
    if (!sidoMap[sido]) sidoMap[sido] = [];
    if (sigungu && sidoMap[sido].indexOf(sigungu) < 0) sidoMap[sido].push(sigungu);
  });
  var sidos = Object.keys(sidoMap).sort();
  var ds = document.getElementById('slDropSido');
  if (ds) ds.innerHTML = '<option value="">시/도 전체</option>' + sidos.map(function(s) {
    return '<option value="' + esc(s) + '">' + esc(s) + '</option>';
  }).join('');
  var dg = document.getElementById('slDropSigungu');
  if (dg) dg.innerHTML = '<option value="">시/군/구 전체</option>';
  window._slSidoMap = sidoMap;
}

function slOnSidoChange() {
  var sido = document.getElementById('slDropSido').value;
  var dg = document.getElementById('slDropSigungu');
  if (!dg) return;
  var list = (window._slSidoMap && sido) ? ((window._slSidoMap[sido]) || []).sort() : [];
  dg.innerHTML = '<option value="">시/군/구 전체</option>' + list.map(function(g) {
    return '<option value="' + esc(g) + '">' + esc(g) + '</option>';
  }).join('');
  slApplyFilter();
}

/* ── 필터+정렬+렌더 ── */
function slApplyFilter() {
  var q = (document.getElementById('slSearchInput').value || '').trim().toLowerCase();
  var dSido    = (document.getElementById('slDropSido').value    || '').trim();
  var dSigungu = (document.getElementById('slDropSigungu').value || '').trim();
  var sortV    = (document.getElementById('slSort').value        || 'default');

  _slFiltered = _slAll.filter(function(s) {
    var okText = !q
      || (s.name   || '').toLowerCase().indexOf(q) >= 0
      || (s.branch || '').toLowerCase().indexOf(q) >= 0
      || (s.address|| '').toLowerCase().indexOf(q) >= 0
      || (s.region || '').toLowerCase().indexOf(q) >= 0;
    var r = (s.region || '').trim();
    var parts = r.split(/\s+/);
    var sSido    = parts[0] || r;
    var sSigungu = parts.slice(1).join(' ') || '';
    var okSido    = !dSido    || sSido === dSido;
    var okSigungu = !dSigungu || sSigungu === dSigungu || r === dSigungu;
    return okText && okSido && okSigungu;
  });

  if (sortV === 'name') {
    _slFiltered.sort(function(a,b) { return (a.name||'').localeCompare(b.name||''); });
  } else if (sortV === 'dist' && _slUserLat !== null) {
    _slFiltered.sort(function(a,b) {
      var da = (a.lat&&a.lng) ? _slKm(_slUserLat,_slUserLng,parseFloat(a.lat),parseFloat(a.lng)) : 99999;
      var db = (b.lat&&b.lng) ? _slKm(_slUserLat,_slUserLng,parseFloat(b.lat),parseFloat(b.lng)) : 99999;
      return da - db;
    });
  }

  _slActive = _slFiltered.length ? 0 : -1;
  _slRenderList();
  if (_slMap) _slUpdateMapMarkers(false);
  if (_slFiltered.length && !_slIsMobile()) _slSelectStore(0);
}

function _slIsMobile() { return window.innerWidth <= 860; }

/* ── 토스트 ── */
function _slShowToast(msg) {
  var t = document.getElementById('slToast');
  if (!t) return;
  t.textContent = msg || '복사되었습니다';
  t.classList.add('show');
  clearTimeout(_slToastTimer);
  _slToastTimer = setTimeout(function() { t.classList.remove('show'); }, 2000);
}

/* ── 주소 복사 ── */
function slCopyAddress(addr) {
  if (!addr) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(addr).then(function() { _slShowToast('주소가 복사되었습니다'); }).catch(function() { _slFallbackCopy(addr); });
  } else { _slFallbackCopy(addr); }
}
function _slFallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); _slShowToast('주소가 복사되었습니다'); } catch(e) { _slShowToast('복사 실패'); }
  document.body.removeChild(ta);
}

/* ── 공유 ── */
var _slShareData = {};
function slShareStore(s) {
  if (!s || !s.name) return;
  _slShareData = s;
  var title = (s.name||'') + (s.branch ? ' '+s.branch : '');
  var titleEl = document.getElementById('slShareTitle');
  if (titleEl) titleEl.textContent = title + ' 공유';
  var modal = document.getElementById('slShareModal');
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function slCloseShareModal() {
  var modal = document.getElementById('slShareModal');
  if (modal) { modal.classList.remove('open'); document.body.style.overflow = ''; }
}
function slShareCopyLink() {
  var s = _slShareData;
  var url = window.location.href.split('#')[0] + '#stores';
  var text = (s.name||'') + (s.branch?' '+s.branch:'') + (s.address?'\n주소: '+s.address:'') + '\n' + url;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() { slCloseShareModal(); _slShowToast('링크가 복사되었습니다'); }).catch(function() { _slFallbackCopyShare(text); });
  } else { _slFallbackCopyShare(text); }
}
function _slFallbackCopyShare(text) {
  var ta = document.createElement('textarea');
  ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px;';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); slCloseShareModal(); _slShowToast('링크가 복사되었습니다'); } catch(e) { _slShowToast('복사 실패'); }
  document.body.removeChild(ta);
}
function slShareKakao() {
  var s = _slShareData;
  var url = window.location.href.split('#')[0] + '#stores';
  var title = (s.name||'') + (s.branch?' '+s.branch:'');
  var text = title + (s.address?'\n주소: '+s.address:'') + '\n' + url;
  slCloseShareModal();
  if (navigator.share) { navigator.share({title:title,text:text,url:url}).catch(function(){}); return; }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() { _slShowToast('링크가 복사되었습니다. 카카오톡에 붙여넣기 해주세요'); }).catch(function() { _slFallbackCopyShare(text); });
  } else { _slFallbackCopyShare(text); }
}
function slShareSMS() {
  var s = _slShareData;
  var url = window.location.href.split('#')[0] + '#stores';
  var text = (s.name||'') + (s.branch?' '+s.branch:'') + (s.address?' - '+s.address:'') + ' ' + url;
  window.location.href = 'sms:?body=' + encodeURIComponent(text);
  slCloseShareModal();
}

/* ── 예약 연동 ── */
function slReserveStore() {
  if (!_slActiveStore) return;
  var s = _slActiveStore;
  if (s.reserve_url && s.reserve_url.trim() !== '') {
    if (_slIsMobile()) slCloseMobileModal();
    window.open(s.reserve_url, s.reserve_target || '_blank', 'noopener');
    return;
  }
  // reserve_url 없을 때
  if (_slIsMobile()) slCloseMobileModal();
  var sec = document.getElementById('reservation');
  if (sec) sec.scrollIntoView({behavior:'smooth', block:'start'});
}

/* ── 상세 HTML 빌드 ── */
function _slBuildDetailHTML(s) {
  var ph = (s.photos || []).filter(function(u) { return u && u !== ''; });
  var carouselHtml = '';
  if (ph.length === 1) {
    carouselHtml = '<div class="sl-carousel"><div class="sl-carousel-track"><div class="sl-carousel-slide"><img src="' + esc(ph[0]) + '" alt="" loading="lazy"></div></div></div>';
  } else if (ph.length > 1) {
    var slides = ph.map(function(u) { return '<div class="sl-carousel-slide"><img src="' + esc(u) + '" alt="" loading="lazy"></div>'; }).join('');
    var dots   = ph.map(function(_,i) { return '<div class="sl-carousel-dot' + (i===0?' on':'') + '" data-idx="' + i + '"></div>'; }).join('');
    carouselHtml = '<div class="sl-carousel" id="slCarousel">'
      + '<div class="sl-carousel-track" id="slCarouselTrack">' + slides + '</div>'
      + '<button class="sl-carousel-btn sl-carousel-prev" onclick="_slCarouselPrev()"><svg viewBox="0 0 24 24" fill="none"><polyline points="15 18 9 12 15 6" stroke="currentColor" stroke-width="2.5"/></svg></button>'
      + '<button class="sl-carousel-btn sl-carousel-next" onclick="_slCarouselNext()"><svg viewBox="0 0 24 24" fill="none"><polyline points="9 18 15 12 9 6" stroke="currentColor" stroke-width="2.5"/></svg></button>'
      + '<div class="sl-carousel-dots" id="slCarouselDots">' + dots + '</div>'
      + '</div>';
  }

  /* 지도 링크 */
  var kakaoLink = '', naverLink = '';
  var destName = encodeURIComponent((s.name||'매장') + (s.branch?' '+s.branch:''));
  var destAddr = encodeURIComponent(s.address || destName);
  if (s.lat && s.lng) {
    var dLat = parseFloat(s.lat), dLng = parseFloat(s.lng);
    kakaoLink = 'https://map.kakao.com/link/to/' + destName + ',' + dLat + ',' + dLng;
    if (_slUserLat !== null && _slUserLng !== null) {
      naverLink = 'https://map.naver.com/p/directions/' + _slUserLng + ',' + _slUserLat + ',%EB%82%B4%EC%9C%84%EC%B9%98,,PLACE_POI/' + dLng + ',' + dLat + ',' + destName + ',,PLACE_POI/-/car?c=15,0,0,0,dh';
    } else {
      naverLink = 'https://map.naver.com/p/directions/-/' + dLng + ',' + dLat + ',' + destName + ',,PLACE_POI/-/car?c=15,0,0,0,dh';
    }
  } else if (s.address) {
    kakaoLink = 'https://map.kakao.com/?q=' + destAddr;
    naverLink  = 'https://map.naver.com/p/search/' + destAddr;
  }
  if (s.naver_map_url && s.naver_map_url.indexOf('http') === 0) naverLink  = s.naver_map_url;
  if (s.kakao_map_url && s.kakao_map_url.indexOf('http') === 0) kakaoLink = s.kakao_map_url;

  var safeAddr = (s.address||'').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
  var addrRow  = s.address
    ? '<div class="sl-detail-row"><span class="sl-detail-lbl">주소</span>'
      + '<div class="sl-addr-wrap"><span>' + esc(s.address) + '</span>'
      + '<button class="sl-copy-btn" onclick="slCopyAddress(\'' + safeAddr + '\')" title="주소 복사">'
      + '<svg viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/>'
      + '<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/></svg>'
      + '</button></div></div>' : '';
  var phoneRow  = s.phone  ? '<div class="sl-detail-row"><span class="sl-detail-lbl">전화</span><span>' + esc(s.phone)  + '</span></div>' : '';
  var hoursRow  = s.hours  ? '<div class="sl-detail-row"><span class="sl-detail-lbl">운영시간</span><span>' + esc(s.hours) + '</span></div>' : '';
  var detailRow = s.detail ? '<div class="sl-detail-row"><span class="sl-detail-lbl">안내</span><span class="sl-detail-desc">' + esc(s.detail) + '</span></div>' : '';
  var memoRow   = (s.memo && s.memo !== s.detail) ? '<div class="sl-detail-row"><span class="sl-detail-lbl">메모</span><span>' + esc(s.memo) + '</span></div>' : '';

  var mapBtns = '';
  if (naverLink)  mapBtns += '<a class="sl-map-link sl-map-naver" href="' + esc(naverLink)  + '" target="_blank" rel="noopener">네이버 지도</a>';
  if (kakaoLink) mapBtns += '<a class="sl-map-link sl-map-kakao" href="' + esc(kakaoLink) + '" target="_blank" rel="noopener">카카오 지도</a>';
  var mapBtnHtml = mapBtns ? '<div class="sl-map-btns">' + mapBtns + '</div>' : '';

  var shareBtnIcon = '<button class="sl-share-icon" onclick="event.stopPropagation();slShareStore(window._slActiveStore||{})" title="공유">'
    + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>'
    + '</button>';

  return carouselHtml
    + '<div class="sl-detail-body">'
    + '<div class="sl-detail-name">' + esc(s.name||'')
    + (s.branch ? '<span class="sl-detail-branch">' + esc(s.branch) + '</span>' : '')
    + shareBtnIcon + '</div>'
    + '<div class="sl-detail-rows">' + addrRow + phoneRow + hoursRow + detailRow + memoRow + '</div>'
    + mapBtnHtml + '</div>';
}

/* ── 캐러셀 ── */
var _slCarouselIdx = 0, _slCarouselLen = 0;
function _slInitCarousel() {
  var track = document.getElementById('slCarouselTrack');
  if (!track) return;
  _slCarouselLen = track.children.length;
  _slCarouselIdx = 0;
  _slCarouselUpdate();
}
function _slCarouselUpdate() {
  var track = document.getElementById('slCarouselTrack');
  if (!track) return;
  track.style.transform = 'translateX(-' + (_slCarouselIdx * 100) + '%)';
  document.querySelectorAll('#slCarouselDots .sl-carousel-dot').forEach(function(d,i) { d.classList.toggle('on', i === _slCarouselIdx); });
}
function _slCarouselPrev() { _slCarouselIdx = Math.max(0, _slCarouselIdx-1); _slCarouselUpdate(); }
function _slCarouselNext() { _slCarouselIdx = Math.min(_slCarouselLen-1, _slCarouselIdx+1); _slCarouselUpdate(); }

/* ── 목록 렌더 ── */
function _slRenderList() {
  var el  = document.getElementById('slList');
  var cnt = document.getElementById('slCount');
  if (!el) return;
  if (cnt) cnt.textContent = '매장 ' + _slFiltered.length + '개';
  if (!_slFiltered.length) {
    el.innerHTML = '<div class="sl-empty">검색 결과가 없습니다.<br><small style="color:var(--g4)">조건을 변경해보세요</small></div>';
    return;
  }
  el.innerHTML = _slFiltered.map(function(s, i) {
    var dist = (_slUserLat !== null && s.lat && s.lng) ? _slKm(_slUserLat, _slUserLng, parseFloat(s.lat), parseFloat(s.lng)) : null;
    var infoText = '';
    if (s.memo)   infoText = s.memo.split('\n')[0];
    else if (s.detail) infoText = s.detail.split('\n')[0];
    return '<div class="sl-item' + (i === _slActive ? ' active' : '') + '" id="sli-' + i + '" onclick="_slSelectStore(' + i + ')">'
      + '<div class="sl-item-top"><span class="sl-item-name">' + esc(s.name||'') + '</span>'
      + (s.branch ? '<span class="sl-item-branch">' + esc(s.branch) + '</span>' : '')
      + '</div>'
      + '<div class="sl-item-addr">' + esc(s.address || s.region || '주소 정보 없음') + '</div>'
      + (infoText ? '<div class="sl-item-info">' + esc(infoText) + '</div>' : '')
      + '<button class="sl-item-reserv" onclick="event.stopPropagation();_slSelectStore(' + i + ');setTimeout(slReserveStore,80)">예약하기</button>'
      + '</div>';
  }).join('');
}

/* ── 카카오 지도 초기화 ── */
function _slInitMap(targetStore) {
  if (_slMapInited) return;
  _slMapInited = true;

  var el = document.getElementById('slNaverMapEl'); // 기존 엘리먼트 재사용
  if (!el || !window.kakao || !window.kakao.maps) { _slMapInited = false; return; }

  var wrap = document.getElementById('slMapArea');
  var isMob = window.innerWidth <= 860;
  var mapH  = isMob ? Math.min(220, Math.round(window.innerWidth * 0.30)) : 580;
  if (wrap) {
    wrap.style.position = 'relative'; wrap.style.height = mapH + 'px';
    wrap.style.minHeight = mapH + 'px'; wrap.style.width = '100%';
    wrap.style.display = 'block'; wrap.style.overflow = 'hidden';
  }
  el.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:' + mapH + 'px;display:block;z-index:1;';

  var lat = 37.5665, lng = 126.9780;
  if (targetStore && targetStore.lat && targetStore.lng) {
    lat = parseFloat(targetStore.lat); lng = parseFloat(targetStore.lng);
  } else {
    for (var i = 0; i < _slAll.length; i++) {
      if (_slAll[i].lat && _slAll[i].lng) { lat = parseFloat(_slAll[i].lat); lng = parseFloat(_slAll[i].lng); break; }
    }
  }

  var center = new kakao.maps.LatLng(lat, lng);
  _slMap = new kakao.maps.Map(el, { center: center, level: targetStore ? 4 : 9 });

  /* placeholder 숨기기 */
  var ph = document.getElementById('slMapPh');
  if (ph) { ph.style.opacity = '0'; ph.style.pointerEvents = 'none'; setTimeout(function() { ph.style.display = 'none'; }, 300); }

  _slAddAllMarkers();

  if (targetStore && targetStore.lat && targetStore.lng) {
    setTimeout(function() { _slHighlightMarker(targetStore); }, 100);
  }
}

/* ── 전체 마커 생성 ── */
function _slAddAllMarkers() {
  _slMarkers = [];
  _slAll.forEach(function(st) {
    if (!st.lat || !st.lng) return;
    var pos = new kakao.maps.LatLng(parseFloat(st.lat), parseFloat(st.lng));

    /* 기본 마커 이미지 */
    var imgDot = new kakao.maps.MarkerImage(
      'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png',
      new kakao.maps.Size(24, 35)
    );
    var mk = new kakao.maps.Marker({ position: pos, map: _slMap, image: imgDot });

    /* 인포윈도우 */
    var iw = new kakao.maps.InfoWindow({
      content: '<div style="padding:6px 10px;font-size:.78rem;font-weight:700;white-space:nowrap;color:#111;min-width:80px">'
        + esc(st.name||'') + (st.branch ? ' ' + esc(st.branch) : '') + '</div>',
      removable: false
    });

    mk.__store = st; mk.__iw = iw;

    kakao.maps.event.addListener(mk, 'click', function() {
      if (_slOpenIw) _slOpenIw.close();
      iw.open(_slMap, mk); _slOpenIw = iw;
      var fi = -1;
      for (var k = 0; k < _slFiltered.length; k++) { if (_slFiltered[k].id === st.id) { fi = k; break; } }
      if (fi >= 0) {
        _slSelectStore(fi);
        var item = document.getElementById('sli-' + fi);
        if (item) item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        document.getElementById('slSearchInput').value = '';
        document.getElementById('slDropSido').value = '';
        document.getElementById('slDropSigungu').innerHTML = '<option value="">시/군/구 전체</option>';
        _slFiltered = _slAll.slice(); _slRenderList();
        for (var k = 0; k < _slFiltered.length; k++) { if (_slFiltered[k].id === st.id) { _slSelectStore(k); break; } }
      }
    });

    _slMarkers.push(mk);
  });
}

/* ── 마커 하이라이트 ── */
function _slHighlightMarker(store) {
  if (!_slMap) return;
  _slMarkers.forEach(function(mk) {
    var isThis = mk.__store && mk.__store.id === store.id;
    if (isThis) {
      if (_slOpenIw) _slOpenIw.close();
      mk.__iw.open(_slMap, mk); _slOpenIw = mk.__iw;
    }
  });
}

/* ── 마커 필터 업데이트 ── */
function _slUpdateMapMarkers(resetBounds) {
  if (!_slMap) return;
  var fids = {}; _slFiltered.forEach(function(s) { fids[s.id] = true; });

  var bounds = new kakao.maps.LatLngBounds();
  var has = false;

  _slMarkers.forEach(function(mk) {
    var show = fids[mk.__store && mk.__store.id] || resetBounds;
    mk.setMap(show ? _slMap : null);
    if (show && mk.__store.lat && mk.__store.lng) {
      bounds.extend(new kakao.maps.LatLng(parseFloat(mk.__store.lat), parseFloat(mk.__store.lng)));
      has = true;
    }
  });

  if (has) {
    if (_slFiltered.length === 1 && !resetBounds) {
      _slMap.setCenter(new kakao.maps.LatLng(parseFloat(_slFiltered[0].lat), parseFloat(_slFiltered[0].lng)));
      _slMap.setLevel(4);
    } else {
      _slMap.setBounds(bounds, 60, 60, 60, 60);
    }
  }
}

/* ── 지도 이동 ── */
function _slMoveMap(s) {
  if (!_slMap) return;
  if (s.lat && s.lng) {
    _slMap.setCenter(new kakao.maps.LatLng(parseFloat(s.lat), parseFloat(s.lng)));
    _slMap.setLevel(4);
    _slHighlightMarker(s);
  } else if (s.address && window.kakao && kakao.maps.services) {
    var geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(s.address, function(result, status) {
      if (status === kakao.maps.services.Status.OK) {
        s.lat = parseFloat(result[0].y); s.lng = parseFloat(result[0].x);
        _slMap.setCenter(new kakao.maps.LatLng(s.lat, s.lng)); _slMap.setLevel(4);
      }
    });
  }
}

/* ── 상세 패널 닫기 ── */
function slCloseDetail() {
  var panel   = document.getElementById('slDetailPanel');
  var foot    = document.getElementById('slDetailFoot');
  var body    = document.getElementById('slBody');
  var emptyEl = document.getElementById('slDetailEmpty');
  var scrollEl= document.getElementById('slDetailScroll');
  var headEl  = document.getElementById('slDetailHead');
  if (panel)   panel.classList.remove('open');
  if (body)    body.classList.remove('detail-open');
  if (foot)    foot.style.display = 'none';
  if (headEl)  headEl.style.display = 'none';
  if (emptyEl) emptyEl.style.display = 'flex';
  if (scrollEl) scrollEl.innerHTML = '';
  _slActive = -1; _slActiveStore = null; window._slActiveStore = null;
  document.querySelectorAll('.sl-item').forEach(function(el) { el.classList.remove('active'); });
  if (_slOpenIw) { _slOpenIw.close(); _slOpenIw = null; }
}

/* ── 모바일 모달 닫기 ── */
function slCloseMobileModal() {
  var m = document.getElementById('slMobileModal');
  if (m) m.classList.remove('open');
  document.body.style.overflow = ''; document.body.style.overflowY = '';
  var listEl = document.getElementById('slList');
  var prevInline = listEl ? listEl.querySelector('.sl-inline-detail') : null;
  if (prevInline) prevInline.parentNode.removeChild(prevInline);
  _slActive = -1; _slActiveStore = null; window._slActiveStore = null;
  document.querySelectorAll('.sl-item').forEach(function(el) { el.classList.remove('active'); });
}

/* ── 매장 선택 ── */
function _slSelectStore(idx) {
  if (!_slIsMobile() && _slActive === idx) { slCloseDetail(); return; }
  _slActive = idx;
  var s = _slFiltered[idx];
  if (!s) return;
  _slActiveStore = s; window._slActiveStore = s;
  document.querySelectorAll('.sl-item').forEach(function(el, i) { el.classList.toggle('active', i === idx); });

  /* 지도 이동 */
  if (_slMap) {
    _slMoveMap(s);
  } else {
    var _retry = 0;
    function _doInit() {
      if (_slMap) { _slMoveMap(s); return; }
      if (window.kakao && window.kakao.maps && window.kakao.maps.Map) {
        if (!_slMapInited) _slInitMap(s);
        else if (++_retry < 20) setTimeout(_doInit, 150);
      } else if (++_retry < 30) { setTimeout(_doInit, 150); }
    }
    _doInit();
  }

  var html = _slBuildDetailHTML(s);

  if (_slIsMobile()) {
    var listEl = document.getElementById('slList');
    var prevInline = listEl ? listEl.querySelector('.sl-inline-detail') : null;
    if (prevInline) prevInline.parentNode.removeChild(prevInline);
    var items = listEl ? listEl.querySelectorAll('.sl-item') : [];
    var clickedItem = null;
    items.forEach(function(el, i) { if (i === idx) clickedItem = el; });
    if (clickedItem) {
      var inlineDiv = document.createElement('div');
      inlineDiv.className = 'sl-inline-detail';
      inlineDiv.style.cssText = 'background:#f7f9fc;border-top:1px solid #e2e8f0;border-bottom:2px solid #d6eafc;padding:16px 16px 12px;';
      inlineDiv.innerHTML = html + '<div style="padding:4px 0 0;"><button class="sl-detail-reserv" style="width:100%;margin-top:12px;" onclick="slReserveStore()">예약하기</button></div>';
      clickedItem.insertAdjacentElement('afterend', inlineDiv);
      setTimeout(function() { clickedItem.scrollIntoView({ behavior:'smooth', block:'start' }); }, 80);
    }
    setTimeout(_slInitCarousel, 50);
  } else {
    var panel    = document.getElementById('slDetailPanel');
    var scrollEl = document.getElementById('slDetailScroll');
    var foot     = document.getElementById('slDetailFoot');
    var body     = document.getElementById('slBody');
    var emptyEl  = document.getElementById('slDetailEmpty');
    var headEl   = document.getElementById('slDetailHead');
    if (emptyEl)  emptyEl.style.display = 'none';
    if (headEl)   headEl.style.display = 'flex';
    if (scrollEl) scrollEl.innerHTML = html;
    if (foot)     foot.style.display = 'block';
    if (body)     body.classList.add('detail-open');
    if (panel)    panel.classList.add('open');
    setTimeout(_slInitCarousel, 80);
  }
}

/* ── 내 주변 매장 ── */
function slFindNearby() {
  var msg = document.getElementById('slNearMsg');
  var btn = document.getElementById('slNearBtn');
  if (!navigator.geolocation) {
    if (msg) { msg.textContent = '현재 위치를 지원하지 않는 브라우저입니다.'; msg.className = 'sl-near-msg err'; msg.style.display = 'block'; }
    return;
  }
  if (btn) { btn.textContent = '위치 확인 중...'; btn.classList.add('loading'); }
  if (msg) msg.style.display = 'none';
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      _slUserLat = pos.coords.latitude; _slUserLng = pos.coords.longitude;
      if (btn) { btn.textContent = '내 주변 매장'; btn.classList.remove('loading'); }
      if (_slMap && window.kakao && window.kakao.maps) {
        _slMap.setCenter(new kakao.maps.LatLng(_slUserLat, _slUserLng));
        _slMap.setLevel(6);
        if (window._slMyLocMarker) window._slMyLocMarker.setMap(null);
        window._slMyLocMarker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(_slUserLat, _slUserLng),
          map: _slMap,
          zIndex: 20
        });
      }
      document.getElementById('slSort').value = 'dist';
      slApplyFilter();
      setTimeout(function() {
        if (_slFiltered.length > 0) {
          if (!_slIsMobile()) _slSelectStore(0);
          var firstItem = document.getElementById('sli-0');
          if (firstItem) firstItem.scrollIntoView({ behavior:'smooth', block:'nearest' });
        }
      }, 150);
    },
    function(err) {
      if (btn) { btn.textContent = '내 주변 매장'; btn.classList.remove('loading'); }
      var errMsg;
      if (err.code === 1) errMsg = '위치 권한이 거부되었습니다. 브라우저 주소창 옆 자물쇠(🔒) 아이콘을 클릭해 위치 권한을 허용해주세요.';
      else if (err.code === 2) errMsg = '현재 위치 정보를 가져올 수 없습니다.';
      else if (err.code === 3) errMsg = '위치 요청 시간이 초과되었습니다.';
      else errMsg = '현재 위치를 가져오지 못했습니다.';
      if (msg) { msg.textContent = errMsg; msg.className = 'sl-near-msg err'; msg.style.display = 'block'; }
    },
    { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
  );
}

/* ── 데이터 로드 ── */
function pbLoadStores() {
  fetch('/admin/api_front/store_public.php')
    .then(function(r) { return r.json(); })
    .catch(function() { return { ok: false, data: [] }; })
    .then(function(res) {
      if (!res.ok) {
        var el = document.getElementById('slList');
        if (el) el.innerHTML = '<div class="sl-empty">매장 정보를 불러오지 못했습니다.<br><small>잠시 후 다시 시도해주세요</small></div>';
        return;
      }
      _slAll      = (res.data || []).filter(function(s) { return !!s.active; });
      _slFiltered = _slAll.slice();
      _slBuildDropdowns();
      var cnt = document.getElementById('slCount');
      if (cnt) cnt.textContent = '매장 ' + _slAll.length + '개';
      _slRenderList();

      if (_slAll.length > 0 && !_slMapInited && !_slMap) {
        var _attempt = 0;
        var _tryInit = function() {
          if (_slMapInited || _slMap) return;
          if (window.kakao && window.kakao.maps && window.kakao.maps.Map) { _slInitMap(null); }
          else if (++_attempt < 40) setTimeout(_tryInit, 150);
        };
        setTimeout(_tryInit, 100);
      }
    });
}

/* ── DOM 준비 ── */
document.addEventListener('DOMContentLoaded', function() {
  pbLoadStores();

  function _slUpdatePhDesc() {
    var el = document.getElementById('slMapPhDesc');
    if (!el) return;
    el.innerHTML = window.innerWidth <= 860
      ? '아래 목록에서 매장을 탭하면<br>지도와 상세 정보를 확인할 수 있습니다'
      : '왼쪽 목록에서 매장을 클릭하면<br>지도와 상세 정보를 확인할 수 있습니다';
  }
  _slUpdatePhDesc();
  window.addEventListener('resize', _slUpdatePhDesc);

  var ph = document.getElementById('slMapPh');
  if (ph && !_slMap) { ph.style.display = 'flex'; ph.style.opacity = '1'; ph.style.pointerEvents = 'none'; }
  if (window.innerWidth > 860) {
    var area = document.getElementById('slMapArea');
    if (area) { area.style.position = 'relative'; area.style.height = '580px'; area.style.minHeight = '580px'; }
  }
  if (window.innerWidth <= 860) {
    var mArea = document.getElementById('slMapArea');
    if (mArea) { mArea.style.position = 'relative'; mArea.style.height = Math.min(220, Math.round(window.innerWidth * 0.30)) + 'px'; mArea.style.minHeight = '120px'; }
  }
});

/* ── IntersectionObserver로 지도 초기화 ── */
(function() {
  var storesSec = document.getElementById('stores');
  if (!storesSec) return;
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (!e.isIntersecting) return;
      if (_slAll && _slAll.length > 0 && !_slMapInited && !_slMap) {
        var _a = 0;
        var _f = function() {
          if (_slMap || _slMapInited) return;
          if (window.kakao && window.kakao.maps && window.kakao.maps.Map) _slInitMap(null);
          else if (++_a < 20) setTimeout(_f, 200);
        };
        _f();
      }
    });
  }, { threshold: 0.05 });
  obs.observe(storesSec);
})();