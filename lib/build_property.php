<section class="sec sec-cream" id="sec-property">
  <div class="container">
    <div class="sec-head">
      <div class="sec-eyebrow"><span class="sec-eyebrow-line"></span><span class="sec-eyebrow-txt">Unit Plan</span></div>
      <div class="sec-head-row">
        <h2 class="sec-ttl sec-ttl-dark">매물정보</h2>
        <span class="btn-more" id="propMoreBtn" onclick="propMore()">
          더보기 <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </span>
      </div>
      <p class="sec-sub" style="margin-top:12px;">단순한 주거공간을 넘어 새로운 라이프스타일을 창조합니다.</p>
    </div>

    <div class="unit-grid" id="propGrid">
      <div class="unit-card" onclick="glOpen('1','84A 타입',['https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg'],'전용 84㎡ / 계약 112㎡ / 150세대',true,'84.00','28.00','112.00','150')">
        <div class="unit-img">
          <img src="https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg" alt="84A 타입" loading="lazy">
        </div>
        <div class="unit-card-body">
          <div class="unit-card-ttl">84A 타입</div>
          <div class="unit-specs">
            <div class="unit-spec-row"><span class="unit-spec-lbl">전용면적</span><span class="unit-spec-val">84.00 ㎡</span></div>
            <div class="unit-spec-row"><span class="unit-spec-lbl">계약면적</span><span class="unit-spec-val">112.00 ㎡</span></div>
            <div class="unit-spec-row"><span class="unit-spec-lbl">세대수</span><span class="unit-spec-val">150 세대</span></div>
          </div>
        </div>
      </div>
      <div class="unit-card" onclick="glOpen('2','84B 타입',['https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg'],'전용 84㎡ / 계약 110㎡ / 120세대',true,'84.00','26.00','110.00','120')">
        <div class="unit-img">
          <img src="https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg" alt="84B 타입" loading="lazy">
        </div>
        <div class="unit-card-body">
          <div class="unit-card-ttl">84B 타입</div>
          <div class="unit-specs">
            <div class="unit-spec-row"><span class="unit-spec-lbl">전용면적</span><span class="unit-spec-val">84.00 ㎡</span></div>
            <div class="unit-spec-row"><span class="unit-spec-lbl">계약면적</span><span class="unit-spec-val">110.00 ㎡</span></div>
            <div class="unit-spec-row"><span class="unit-spec-lbl">세대수</span><span class="unit-spec-val">120 세대</span></div>
          </div>
        </div>
      </div>
      <div class="unit-card" onclick="glOpen('3','101A 타입',['https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg'],'전용 101㎡ / 계약 136㎡ / 80세대',true,'101.00','35.00','136.00','80')">
        <div class="unit-img">
          <img src="https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg" alt="101A 타입" loading="lazy">
        </div>
        <div class="unit-card-body">
          <div class="unit-card-ttl">101A 타입</div>
          <div class="unit-specs">
            <div class="unit-spec-row"><span class="unit-spec-lbl">전용면적</span><span class="unit-spec-val">101.00 ㎡</span></div>
            <div class="unit-spec-row"><span class="unit-spec-lbl">계약면적</span><span class="unit-spec-val">136.00 ㎡</span></div>
            <div class="unit-spec-row"><span class="unit-spec-lbl">세대수</span><span class="unit-spec-val">80 세대</span></div>
          </div>
        </div>
      </div>
      <div class="unit-card" onclick="glOpen('4','120 타입',['https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg'],'전용 120㎡ / 계약 158㎡ / 50세대',true,'120.00','38.00','158.00','50')">
        <div class="unit-img">
          <img src="https://plane02.gabia.io/uploads/admin/20260319161727_9f7556dd.jpg" alt="120 타입" loading="lazy">
        </div>
        <div class="unit-card-body">
          <div class="unit-card-ttl">120 타입</div>
          <div class="unit-specs">
            <div class="unit-spec-row"><span class="unit-spec-lbl">전용면적</span><span class="unit-spec-val">120.00 ㎡</span></div>
            <div class="unit-spec-row"><span class="unit-spec-lbl">계약면적</span><span class="unit-spec-val">158.00 ㎡</span></div>
            <div class="unit-spec-row"><span class="unit-spec-lbl">세대수</span><span class="unit-spec-val">50 세대</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 갤러리 슬라이더 모달 -->
<div class="gl-modal-bg" id="glModal" onclick="if(event.target===this)glClose()">
  <div class="gl-modal">
    <div class="gl-modal-hd">
      <div class="gl-modal-ttl" id="glModalTtl"></div>
      <button class="gl-modal-x" onclick="glClose()">&#10005;</button>
    </div>
    <div class="gl-modal-body">
      <div class="gl-modal-specs" id="glModalSpecs" style="display:none;"></div>
      <div class="gl-slider" id="glSlider">
        <div class="gl-slider-track" id="glSliderTrack"></div>
        <button class="gl-slider-prev" id="glSliderPrev" onclick="glSlide(-1)">&#8249;</button>
        <button class="gl-slider-next" id="glSliderNext" onclick="glSlide(1)">&#8250;</button>
        <div class="gl-slider-dots" id="glSliderDots"></div>
      </div>
      <div class="gl-modal-cnt" id="glModalCnt"></div>
    </div>
  </div>
</div>

<style>
.gl-slider { position:relative; overflow:hidden; background:#000; }
.gl-slider-track { display:flex; transition:transform .35s ease; }
.gl-slider-track img { min-width:100%; width:100%; max-height:68vh; object-fit:contain; flex-shrink:0; display:block; }
.gl-slider-prev,
.gl-slider-next { position:absolute; top:50%; transform:translateY(-50%); background:rgba(0,0,0,.45); color:#fff; border:none; font-size:2rem; line-height:1; padding:10px 16px; cursor:pointer; z-index:2; transition:background .2s; }
.gl-slider-prev { left:0; }
.gl-slider-next { right:0; }
.gl-slider-prev:hover,
.gl-slider-next:hover { background:rgba(0,0,0,.75); }
.gl-slider-dots { position:absolute; bottom:12px; left:50%; transform:translateX(-50%); display:flex; gap:6px; }
.gl-slider-dot { width:7px; height:7px; border-radius:50%; background:rgba(255,255,255,.35); border:none; cursor:pointer; padding:0; transition:background .2s; }
.gl-slider-dot.on { background:#fff; }
</style>

<script>
var _glImgs = [], _glIdx = 0;

function esc(s) { if(s==null) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

function glOpen(id, title, imgs, content, hasSpecs, ae, ac, actr, hh) {
  document.getElementById('glModalTtl').textContent = title || '';

  var specs = document.getElementById('glModalSpecs');
  if (hasSpecs && (ae || ac || actr || hh)) {
    specs.style.display = 'grid';
    specs.innerHTML =
      (ae   ? '<div class="gl-modal-spec"><div class="gl-modal-spec-lbl">전용면적</div><div class="gl-modal-spec-val">'+esc(ae)+' ㎡</div></div>' : '') +
      (ac   ? '<div class="gl-modal-spec"><div class="gl-modal-spec-lbl">공용면적</div><div class="gl-modal-spec-val">'+esc(ac)+' ㎡</div></div>' : '') +
      (actr ? '<div class="gl-modal-spec"><div class="gl-modal-spec-lbl">계약면적</div><div class="gl-modal-spec-val">'+esc(actr)+' ㎡</div></div>' : '') +
      (hh   ? '<div class="gl-modal-spec"><div class="gl-modal-spec-lbl">세대수</div><div class="gl-modal-spec-val">'+esc(hh)+' 세대</div></div>' : '');
  } else { specs.style.display = 'none'; }

  _glImgs = Array.isArray(imgs) ? imgs : (imgs ? String(imgs).split(/[\n,]+/).map(function(s){return s.trim();}).filter(Boolean) : []);
  _glIdx  = 0;
  glRenderSlider();

  document.getElementById('glModalCnt').innerHTML = (content || '').replace(/\n/g,'<br>');
  document.getElementById('glModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function glRenderSlider() {
  var track = document.getElementById('glSliderTrack');
  var dots  = document.getElementById('glSliderDots');
  var prev  = document.getElementById('glSliderPrev');
  var next  = document.getElementById('glSliderNext');
  var slider = document.getElementById('glSlider');

  if (!_glImgs.length) { slider.style.display = 'none'; return; }
  slider.style.display = 'block';

  track.innerHTML = _glImgs.map(function(u){ return '<img src="'+esc(u)+'" alt="" loading="lazy">'; }).join('');
  track.style.transform = 'translateX(0)';

  var single = _glImgs.length <= 1;
  prev.style.display = single ? 'none' : '';
  next.style.display = single ? 'none' : '';
  dots.innerHTML = single ? '' : _glImgs.map(function(_,i){
    return '<button class="gl-slider-dot'+(i===0?' on':'')+'" onclick="glGoTo('+i+')"></button>';
  }).join('');
}

function glGoTo(n) {
  _glIdx = (n + _glImgs.length) % _glImgs.length;
  document.getElementById('glSliderTrack').style.transform = 'translateX(-'+(_glIdx * 100)+'%)';
  document.querySelectorAll('.gl-slider-dot').forEach(function(d,i){ d.classList.toggle('on', i===_glIdx); });
}

function glSlide(d) { glGoTo(_glIdx + d); }

function glClose() {
  document.getElementById('glModal').classList.remove('open');
  document.body.style.overflow = '';
}

var _propDone = false;
function propMore() {
  if (_propDone) return;
  _propDone = true;
  document.getElementById('propMoreBtn').style.display = 'none';
}
</script>
