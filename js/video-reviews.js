/* ═══════════════════════════════════════
   video-reviews.js — 영상 & 리뷰 슬라이더
═══════════════════════════════════════ */

/* ─── 유튜브 헬퍼 ─── */
function getYtId(url) {
  if (!url) return null;
  var m = url.match(/youtu\.be\/([A-Za-z0-9_\-]{11})/);
  if (m) return m[1];
  m = url.match(/[?&]v=([A-Za-z0-9_\-]{11})/);
  if (m) return m[1];
  m = url.match(/embed\/([A-Za-z0-9_\-]{11})/);
  if (m) return m[1];
  return null;
}
function ytThumb(id) {
  return 'https://img.youtube.com/vi/' + id + '/maxresdefault.jpg';
}
function ytThumbFallback(img, id) {
  img.onerror = function() { this.style.display = 'none'; };
  img.src = 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
}

/* ─── 영상 ─── */
var vidCur = 0, vidItems = [];
function renderVideos(data) {
  vidItems = (data.videos || [])
    .filter(function (v) { return v.active && v.youtubeUrl; })
    .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
  var wrap = document.getElementById('vwrap');
  if (!vidItems.length) {
    wrap.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,.3);padding:50px 0">등록된 영상이 없습니다.</p>';
    document.getElementById('vdots').innerHTML = '';
    return;
  }
  wrap.innerHTML = '<div class="vtrack" id="vtrack">'
    + vidItems.map(function (v, i) {
      var ytId = getYtId(v.youtubeUrl);
      var thumb = ytId ? ytThumb(ytId) : '';
      return '<div class="vcard">'
        + '<div class="vthumb" onclick="playVid(' + i + ')" id="vt-' + i + '">'
        + (thumb ? '<img class="vtimg" id="vthumb-' + i + '" src="' + thumb + '" alt="" onerror="this.style.display=\'none\'">' : '')
        + '<div class="vt-ov"><div class="vplay"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div></div>'
        + '</div>'
        + '<div class="vinf"><div class="vtitle">' + esc(v.title || '') + '</div>'
        + (v.desc ? '<div class="vdesc">' + esc(v.desc) + '</div>' : '')
        + '</div></div>';
    }).join('')
    + '</div>';
  document.getElementById('vdots').innerHTML = vidItems.map(function (_, i) {
    return '<div class="vdot' + (i === 0 ? ' on' : '') + '" onclick="vidGoTo(' + i + ')"></div>';
  }).join('');
  vidCur = 0;
  vidGoTo(0, true);
}
function playVid(i) {
  var ytId = getYtId(vidItems[i].youtubeUrl);
  if (!ytId) return;
  document.getElementById('vmodTitle').textContent = vidItems[i].title || '';
  document.getElementById('vmodIframe').src = 'https://www.youtube.com/embed/' + ytId + '?autoplay=1&rel=0';
  document.getElementById('vidModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeVidModal() {
  document.getElementById('vidModal').classList.remove('open');
  document.getElementById('vmodIframe').src = '';
  document.body.style.overflow = '';
}
function vidGoTo(idx, instant) {
  var track = document.getElementById('vtrack');
  if (!track) return;
  vidCur = ((idx % vidItems.length) + vidItems.length) % vidItems.length;
  var cw = track.children[0] ? track.children[0].offsetWidth + 22 : 0;
  track.style.transform = 'translateX(-' + (vidCur * cw) + 'px)';
  document.querySelectorAll('.vdot').forEach(function (d, i) { d.classList.toggle('on', i === vidCur); });
}
function vidNav(dir) { vidGoTo(vidCur + dir); }

/* ─── 리뷰 ─── */
var rvCur = 0, rvItems = [];

function renderReviews(data) {
  rvItems = (data.reviews || [])
    .filter(function (r) { return r.active; })
    .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });

  var wrap = document.getElementById('rvwrap');
  if (!rvItems.length) {
    wrap.innerHTML = '<p style="text-align:center;color:var(--g4);padding:40px">등록된 후기가 없습니다.</p>';
    document.getElementById('rvdots').innerHTML = '';
    return;
  }

  wrap.innerHTML = '<div class="rvtrack" id="rvtrack">'
    + rvItems.map(function (r) {
      var stars = '★'.repeat(r.rating || 5) + '☆'.repeat(Math.max(0, 5 - (r.rating || 5)));
      var thumbHtml = r.imageUrl ? '<div class="rv-thumb"><img src="' + esc(r.imageUrl) + '" alt=""></div>' : '';
      return '<div class="rvc">' + thumbHtml
        + '<div class="rv-body">'
        + '<div class="rv-top"><div class="rv-mt">'
        + '<div class="rv-nm">' + esc(maskName(r.name || '')) + '</div>'
        + '<div class="rv-stars">' + stars + '</div>'
        + '<div class="rv-dt">' + esc(r.date || '') + '</div>'
        + '</div></div>'
        + '<div class="rv-txt">' + esc(r.text || '') + '</div>'
        + '<div class="rv-ok"><svg viewBox="0 0 16 16" fill="#10b981"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.5 6L7 10.5 4.5 8l1-1L7 8.5l4-4 1 1.5z"/></svg>실제 구매 고객</div>'
        + '</div></div>';
    }).join('')
    + '</div>';

  document.getElementById('rvdots').innerHTML = rvItems.map(function (_, i) {
    return '<div class="rvdot' + (i === 0 ? ' on' : '') + '" onclick="rvGoTo(' + i + ')"></div>';
  }).join('');

  rvCur = 0;
  rvGoTo(0, true);
}

function rvGoTo(idx, instant) {
  var track = document.getElementById('rvtrack');
  if (!track) return;
  rvCur = ((idx % rvItems.length) + rvItems.length) % rvItems.length;
  var cw = track.children[0] ? track.children[0].offsetWidth + 22 : 0;
  track.style.transform = 'translateX(-' + (rvCur * cw) + 'px)';
  document.querySelectorAll('.rvdot').forEach(function (d, i) { d.classList.toggle('on', i === rvCur); });
}

function rvNav(dir) { rvGoTo(rvCur + dir); }