(function () {
  'use strict';

  var API = '/admin/api_front/customReser_public.php';

  function call(slug, action, data, method) {
    method = (method || 'GET').toUpperCase();
    if (method === 'GET') {
      var q = new URLSearchParams();
      q.set('slug', slug);
      q.set('action', action);
      if (data) {
        Object.keys(data).forEach(function (k) {
          if (data[k] != null && data[k] !== '') q.set(k, String(data[k]));
        });
      }
      return fetch(API + '?' + q.toString()).then(function (r) { return r.json(); });
    }
    var body = Object.assign({ slug: slug, action: action }, data || {});
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body)
    }).then(function (r) { return r.json(); });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  function buildPlan(cfg) {
    var mode = cfg.capacity_mode || 'time';
    var steps = (cfg.steps || [])
      .filter(function (s) { return parseInt(s.is_active, 10) === 1; })
      .sort(function (a, b) { return a.sort_order - b.sort_order; });
    var out = [];
    for (var i = 0; i < steps.length; i++) {
      var k = steps[i].step_key;
      if (k === 'time' && mode !== 'time') continue;
      if (k === 'item' && mode !== 'item') continue;
      out.push(k);
    }
    return out;
  }

  function initReserPublic(root, slug) {
    var msgEl = root.querySelector('#customReser-msg');
    var progEl = root.querySelector('#customReser-progress');
    var hostEl = root.querySelector('#customReser-step-host');
    var actEl = root.querySelector('#customReser-actions');
    var capHint = root.querySelector('#customReser-cap-hint');

    var st = {
      cfg: null,
      plan: [],
      stepIndex: 0,
      branchId: 0,
      dateYmd: '',
      slotId: 0,
      itemQuotaId: 0,
      itemId: 0,
      extra: {},
      calYear: 0,
      calMonth: 0,
      calDays: null
    };

    function showMsg(text, ok) {
      if (!msgEl) return;
      if (!text) {
        msgEl.innerHTML = '';
        return;
      }
      msgEl.innerHTML = '<div class="customReser-msg ' + (ok ? 'ok' : 'err') + '">' + esc(text) + '</div>';
    }

    function renderProgress() {
      if (!progEl) return;
      var labels = { branch: '지점', date: '날짜', time: '시간', item: '항목', info: '정보' };
      progEl.innerHTML = st.plan.map(function (k, i) {
        return '<span class="' + (i === st.stepIndex ? 'on' : '') + '">' + esc(labels[k] || k) + '</span>';
      }).join('');
    }

    function goStep(delta) {
      st.stepIndex = Math.max(0, Math.min(st.plan.length - 1, st.stepIndex + delta));
      renderProgress();
      renderStep();
    }

    function renderStep() {
      if (!hostEl || !actEl) return;
      var key = st.plan[st.stepIndex];
      actEl.innerHTML = '';
      hostEl.innerHTML = '';

      if (key === 'branch') {
        var brs = st.cfg.branches || [];
        if (!brs.length) {
          hostEl.innerHTML = '<p class="customReser-sub">등록된 지점이 없습니다. 관리자에서 이 인스턴스에 지점을 연결해 주세요.</p>';
          return;
        }
        var h = '<div class="customReser-field"><label>지점 선택</label><select id="customReser-sel-branch">';
        brs.forEach(function (b) {
          h += '<option value="' + b.id + '">' + esc(b.region_name + ' · ' + b.name) + '</option>';
        });
        h += '</select></div>';
        hostEl.innerHTML = h;
        var sel = hostEl.querySelector('#customReser-sel-branch');
        if (sel) sel.value = String(st.branchId || brs[0].id);
        actEl.innerHTML = '<button type="button" class="customReser-btn primary" id="customReser-next">다음</button>';
        actEl.querySelector('#customReser-next').onclick = function () {
          st.branchId = parseInt(sel.value, 10) || 0;
          goStep(1);
        };
        return;
      }

      if (key === 'date') {
        var today = st.cfg.today || '';
        if (!st.calYear) {
          var p = today.split('-');
          st.calYear = parseInt(p[0], 10) || new Date().getFullYear();
          st.calMonth = parseInt(p[1], 10) || new Date().getMonth() + 1;
        }
        function loadCal() {
          call(slug, 'calendar', { branch_id: st.branchId, year: st.calYear, month: st.calMonth }, 'GET').then(function (r) {
            if (!r.ok) return showMsg(r.msg || '달력 오류', false);
            st.calDays = r.days || {};
            paintCal();
          });
        }
        function paintCal() {
          var first = new Date(st.calYear, st.calMonth - 1, 1);
          var startWd = first.getDay();
          var dim = new Date(st.calYear, st.calMonth, 0).getDate();
          var today = st.cfg.today || '';
          var h = '<div class="customReser-cal-nav">';
          h += '<button type="button" class="customReser-btn secondary" id="customReser-cal-prev">‹</button>';
          h += '<strong>' + st.calYear + '년 ' + st.calMonth + '월</strong>';
          h += '<button type="button" class="customReser-btn secondary" id="customReser-cal-next">›</button></div>';
          h += '<div class="customReser-cal-grid">';
          var wds = ['일', '월', '화', '수', '목', '금', '토'];
          wds.forEach(function (w) { h += '<div><strong>' + w + '</strong></div>'; });
          for (var i = 0; i < startWd; i++) h += '<div></div>';
          for (var d = 1; d <= dim; d++) {
            var ymd = st.calYear + '-' + String(st.calMonth).padStart(2, '0') + '-' + String(d).padStart(2, '0');
            var day = st.calDays[ymd];
            var dis = !day || !day.open || day.past || day.closed;
            var cls = st.dateYmd === ymd ? ' pick' : '';
            h += '<button type="button" data-d="' + ymd + '"' + (dis ? ' disabled' : '') + ' class="' + cls.trim() + '">' + d + '</button>';
          }
          h += '</div>';
          hostEl.innerHTML = h;
          hostEl.querySelector('#customReser-cal-prev').onclick = function () {
            st.calMonth--;
            if (st.calMonth < 1) { st.calMonth = 12; st.calYear--; }
            loadCal();
          };
          hostEl.querySelector('#customReser-cal-next').onclick = function () {
            st.calMonth++;
            if (st.calMonth > 12) { st.calMonth = 1; st.calYear++; }
            loadCal();
          };
          hostEl.querySelectorAll('[data-d]').forEach(function (btn) {
            btn.onclick = function () {
              st.dateYmd = btn.getAttribute('data-d');
              hostEl.querySelectorAll('[data-d]').forEach(function (b) { b.classList.remove('pick'); });
              btn.classList.add('pick');
            };
          });
        }
        loadCal();
        actEl.innerHTML = '<button type="button" class="customReser-btn secondary" id="customReser-back">이전</button> <button type="button" class="customReser-btn primary" id="customReser-next">다음</button>';
        actEl.querySelector('#customReser-back').onclick = function () { goStep(-1); };
        actEl.querySelector('#customReser-next').onclick = function () {
          if (!st.dateYmd || st.dateYmd < today) {
            showMsg('날짜를 선택해 주세요.', false);
            return;
          }
          showMsg('');
          goStep(1);
        };
        return;
      }

      if (key === 'time') {
        call(slug, 'slots', { branch_id: st.branchId, date: st.dateYmd }, 'GET').then(function (r) {
          if (!r.ok) return showMsg(r.msg || '오류', false);
          if (r.closed) {
            hostEl.innerHTML = '<p class="customReser-sub">해당 일정은 휴무입니다.</p>';
            return;
          }
          var slots = r.slots || [];
          if (!slots.length) {
            hostEl.innerHTML = '<p class="customReser-sub">선택한 날짜에 예약 가능한 시간이 없습니다.</p>';
            return;
          }
          var hh = '<div class="customReser-slot-list">';
          slots.forEach(function (s) {
            var dis = !s.available;
            hh += '<button type="button" data-id="' + s.id + '"' + (dis ? ' disabled' : '') + '>' + esc(s.slot_time) + (dis ? ' (마감)' : ' (잔여 ' + s.remaining + ')') + '</button>';
          });
          hh += '</div>';
          hostEl.innerHTML = hh;
          hostEl.querySelectorAll('.customReser-slot-list button').forEach(function (btn) {
            btn.onclick = function () {
              if (btn.disabled) return;
              hostEl.querySelectorAll('.customReser-slot-list button').forEach(function (b) { b.classList.remove('on'); });
              btn.classList.add('on');
              st.slotId = parseInt(btn.getAttribute('data-id'), 10);
            };
          });
        });
        actEl.innerHTML = '<button type="button" class="customReser-btn secondary" id="customReser-back">이전</button> <button type="button" class="customReser-btn primary" id="customReser-next">다음</button>';
        actEl.querySelector('#customReser-back').onclick = function () { goStep(-1); };
        actEl.querySelector('#customReser-next').onclick = function () {
          if (!st.slotId) {
            showMsg('시간을 선택해 주세요.', false);
            return;
          }
          showMsg('');
          goStep(1);
        };
        return;
      }

      if (key === 'item') {
        call(slug, 'item_quotas', { branch_id: st.branchId, date: st.dateYmd }, 'GET').then(function (r) {
          if (!r.ok) return showMsg(r.msg || '오류', false);
          if (r.closed) {
            hostEl.innerHTML = '<p class="customReser-sub">해당 일정은 휴무입니다.</p>';
            return;
          }
          var qs = r.quotas || [];
          if (!qs.length) {
            hostEl.innerHTML = '<p class="customReser-sub">선택한 날짜에 예약 가능한 항목이 없습니다.</p>';
            return;
          }
          var hh = '<div class="customReser-item-list">';
          qs.forEach(function (q) {
            var dis = !q.available;
            hh += '<button type="button" data-id="' + q.id + '" data-item="' + q.item_id + '"' + (dis ? ' disabled' : '') + '>' + esc(q.item_name) + (dis ? ' (마감)' : ' (잔여 ' + q.remaining + ')') + '</button>';
          });
          hh += '</div>';
          hostEl.innerHTML = hh;
          hostEl.querySelectorAll('.customReser-item-list button').forEach(function (btn) {
            btn.onclick = function () {
              if (btn.disabled) return;
              hostEl.querySelectorAll('.customReser-item-list button').forEach(function (b) { b.classList.remove('on'); });
              btn.classList.add('on');
              st.itemQuotaId = parseInt(btn.getAttribute('data-id'), 10);
              st.itemId = parseInt(btn.getAttribute('data-item'), 10) || 0;
            };
          });
        });
        actEl.innerHTML = '<button type="button" class="customReser-btn secondary" id="customReser-back">이전</button> <button type="button" class="customReser-btn primary" id="customReser-next">다음</button>';
        actEl.querySelector('#customReser-back').onclick = function () { goStep(-1); };
        actEl.querySelector('#customReser-next').onclick = function () {
          if (!st.itemQuotaId) {
            showMsg('항목을 선택해 주세요.', false);
            return;
          }
          showMsg('');
          goStep(1);
        };
        return;
      }

      if (key === 'info') {
        var fields = (st.cfg.fields || []).slice().sort(function (a, b) { return a.sort_order - b.sort_order; });
        var h = '<div class="customReser-field"><label>이름 *</label><input type="text" id="customReser-cname" required></div>';
        h += '<div class="customReser-field"><label>연락처 *</label><input type="tel" id="customReser-cphone" inputmode="numeric" required></div>';
        h += '<div class="customReser-field"><label>이메일</label><input type="email" id="customReser-cemail"></div>';
        fields.forEach(function (f) {
          var req = parseInt(f.is_required, 10) === 1;
          var fid = 'customReser-f-' + f.id;
          if (f.field_type === 'text' || f.field_type === 'phone' || f.field_type === 'email') {
            h += '<div class="customReser-field"><label>' + esc(f.label) + (req ? ' *' : '') + '</label><input type="' + (f.field_type === 'email' ? 'email' : 'text') + '" id="' + fid + '" data-key="' + esc(f.name_key) + '"' + (req ? ' required' : '') + '></div>';
          } else if (f.field_type === 'dropdown') {
            h += '<div class="customReser-field"><label>' + esc(f.label) + (req ? ' *' : '') + '</label><select id="' + fid + '" data-key="' + esc(f.name_key) + '"' + (req ? ' required' : '') + '><option value="">선택</option>';
            (f.options || []).forEach(function (opt) {
              var v = typeof opt === 'object' ? (opt.value || opt.label) : opt;
              var lab = typeof opt === 'object' ? (opt.label || opt.value) : opt;
              h += '<option value="' + esc(String(v)) + '">' + esc(String(lab)) + '</option>';
            });
            h += '</select></div>';
          } else if (f.field_type === 'radio') {
            h += '<div class="customReser-field"><span class="customReser-sub">' + esc(f.label) + (req ? ' *' : '') + '</span><div data-key="' + esc(f.name_key) + '" data-req="' + (req ? '1' : '0') + '">';
            (f.options || []).forEach(function (opt, idx) {
              var v = typeof opt === 'object' ? (opt.value || opt.label) : opt;
              var lab = typeof opt === 'object' ? (opt.label || opt.value) : opt;
              h += '<label style="display:block;margin:6px 0"><input type="radio" name="rf-' + f.id + '" value="' + esc(String(v)) + '"> ' + esc(String(lab)) + '</label>';
            });
            h += '</div></div>';
          } else if (f.field_type === 'checkbox') {
            h += '<div class="customReser-field"><span class="customReser-sub">' + esc(f.label) + (req ? ' *' : '') + '</span><div data-key="' + esc(f.name_key) + '" data-req="' + (req ? '1' : '0') + '" data-cb="1">';
            (f.options || []).forEach(function (opt) {
              var v = typeof opt === 'object' ? (opt.value || opt.label) : opt;
              var lab = typeof opt === 'object' ? (opt.label || opt.value) : opt;
              h += '<label style="display:block;margin:6px 0"><input type="checkbox" value="' + esc(String(v)) + '"> ' + esc(String(lab)) + '</label>';
            });
            h += '</div></div>';
          }
        });
        hostEl.innerHTML = h;
        actEl.innerHTML = '<button type="button" class="customReser-btn secondary" id="customReser-back">이전</button> <button type="button" class="customReser-btn primary" id="customReser-submit">예약하기</button>';
        actEl.querySelector('#customReser-back').onclick = function () { goStep(-1); };
        actEl.querySelector('#customReser-submit').onclick = function () {
          var nm = hostEl.querySelector('#customReser-cname');
          var ph = hostEl.querySelector('#customReser-cphone');
          if (!nm || !nm.value.trim() || !ph || !ph.value.trim()) {
            showMsg('이름과 연락처는 필수입니다.', false);
            return;
          }
          var extra = {};
          fields.forEach(function (f) {
            var el = hostEl.querySelector('#customReser-f-' + f.id);
            if (el && el.dataset.key) {
              if (f.field_type === 'checkbox') return;
              if (el.value) extra[el.dataset.key] = el.value;
              return;
            }
            var wrap = hostEl.querySelector('[data-key="' + f.name_key + '"]');
            if (!wrap) return;
            if (wrap.dataset.cb === '1') {
              var vals = [];
              wrap.querySelectorAll('input[type=checkbox]:checked').forEach(function (c) { vals.push(c.value); });
              if (vals.length) extra[f.name_key] = vals;
            } else if (wrap.querySelector('input[type=radio]')) {
              var chk = wrap.querySelector('input[type=radio]:checked');
              if (chk) extra[f.name_key] = chk.value;
            }
          });
          var payload = {
            branch_id: st.branchId,
            customer_name: nm.value.trim(),
            customer_phone: ph.value.trim(),
            customer_email: (hostEl.querySelector('#customReser-cemail') || {}).value || '',
            extra: extra
          };
          if (st.cfg.capacity_mode === 'item') {
            payload.item_quota_id = st.itemQuotaId;
            if (st.itemId) payload.item_id = st.itemId;
          } else {
            payload.slot_id = st.slotId;
          }
          call(slug, 'book', payload, 'POST').then(function (res) {
            if (!res.ok) return showMsg(res.msg || '예약 실패', false);
            showMsg('예약이 접수되었습니다. 예약번호: ' + res.reservation_no, true);
            st.stepIndex = 0;
            st.branchId = 0;
            st.dateYmd = '';
            st.slotId = 0;
            st.itemQuotaId = 0;
            st.itemId = 0;
            st.extra = {};
            renderProgress();
            renderStep();
          });
        };
      }
    }

    call(slug, 'config', {}, 'GET').then(function (r) {
      if (!r.ok) {
        showMsg(r.msg || '설정을 불러올 수 없습니다. slug·DB를 확인하세요.', false);
        if (hostEl) hostEl.innerHTML = '';
        return;
      }
      st.cfg = r;
      st.plan = buildPlan(r);
      if (capHint) {
        var m = r.capacity_mode === 'item' ? '항목(일별 정원) 기준으로 예약됩니다.' : '시간 슬롯 기준으로 예약됩니다.';
        capHint.textContent = m;
        capHint.hidden = false;
      }
      if (!st.plan.length) {
        showMsg('활성화된 단계가 없습니다.', false);
        return;
      }
      st.stepIndex = 0;
      renderProgress();
      renderStep();
    });

    /* ----- 조회 / 변경 ----- */
    var lkMsg = root.querySelector('#customReser-lookup-msg');
    var lkRes = root.querySelector('#customReser-result');
    var lkPanel = root.querySelector('#customReser-resched-panel');

    function lkShow(text, ok) {
      if (!lkMsg) return;
      if (!text) {
        lkMsg.innerHTML = '';
        return;
      }
      lkMsg.innerHTML = '<div class="customReser-msg ' + (ok ? 'ok' : 'err') + '">' + esc(text) + '</div>';
    }

    function renderBookingCard(b, mode) {
      var dt = (b.slot_date || '').toString().slice(0, 10);
      var tm = (b.slot_time || '').toString().slice(0, 5);
      var when = dt ? (dt + (tm ? ' ' + tm : '')) : (b.reservation_at || '').toString().slice(0, 16);
      var h = '<div class="customReser-booking-card">';
      h += '<p><strong>' + esc(b.reservation_no) + '</strong> · ' + esc(b.status) + '</p>';
      h += '<p>' + esc(when) + '</p>';
      h += '<p>' + esc(b.branch_name || '') + (b.item_name ? ' · ' + esc(b.item_name) : '') + '</p>';
      h += '<p>' + esc(b.customer_name) + ' / ' + esc(b.customer_phone) + '</p>';
      if (b.status === '접수') {
        h += '<p style="margin-top:10px"><button type="button" class="customReser-btn secondary customReser-rs-open" data-no="' + esc(b.reservation_no) + '">일정 변경</button> ';
        h += '<button type="button" class="customReser-btn secondary customReser-cn-open" data-no="' + esc(b.reservation_no) + '">취소</button></p>';
      }
      h += '</div>';
      return h;
    }

    var lkBtn = root.querySelector('#customReser-lookup-btn');
    if (lkBtn) {
      lkBtn.onclick = function () {
        lkShow('');
        if (lkPanel) {
          lkPanel.hidden = true;
          lkPanel.innerHTML = '';
        }
        var no = (root.querySelector('#customReser-lookup-no') || {}).value || '';
        var nm = (root.querySelector('#customReser-lookup-name') || {}).value || '';
        var ph = (root.querySelector('#customReser-lookup-phone') || {}).value || '';
        if (no.trim()) {
          call(slug, 'lookup', { reservation_no: no.trim() }, 'POST').then(function (r) {
            if (!r.ok) return lkShow(r.msg || '조회 실패', false);
            if (!r.booking) return lkShow('예약을 찾을 수 없습니다.', false);
            if (lkRes) lkRes.innerHTML = renderBookingCard(r.booking, r.capacity_mode);
            bindLookupActions(r.capacity_mode);
          });
          return;
        }
        if (nm.trim() && ph.trim()) {
          call(slug, 'lookup', { customer_name: nm.trim(), customer_phone: ph.trim() }, 'POST').then(function (r) {
            if (!r.ok) return lkShow(r.msg || '조회 실패', false);
            var list = r.list || [];
            if (!list.length) return lkShow('예약을 찾을 수 없습니다.', false);
            if (lkRes) lkRes.innerHTML = list.map(function (b) { return renderBookingCard(b, r.capacity_mode); }).join('');
            bindLookupActions(r.capacity_mode);
          });
          return;
        }
        lkShow('예약번호 또는 이름+연락처를 입력하세요.', false);
      };
    }

    function bindLookupActions(mode) {
      if (!lkRes) return;
      lkRes.querySelectorAll('.customReser-cn-open').forEach(function (btn) {
        btn.onclick = function () {
          var rno = btn.getAttribute('data-no');
          var ph = prompt('예약 시 입력한 연락처를 다시 입력하세요.');
          if (!ph) return;
          call(slug, 'user_cancel', { reservation_no: rno, customer_phone: ph }, 'POST').then(function (res) {
            if (!res.ok) return lkShow(res.msg || '취소 실패', false);
            lkShow('취소되었습니다.', true);
            if (lkRes) lkRes.innerHTML = '';
          });
        };
      });
      lkRes.querySelectorAll('.customReser-rs-open').forEach(function (btn) {
        btn.onclick = function () {
          var rno = btn.getAttribute('data-no');
          var ph = prompt('예약 시 입력한 연락처를 입력하세요.');
          if (!ph || !lkPanel) return;
          lkPanel.hidden = false;
          lkPanel.innerHTML = '<h3 style="margin-top:0;font-size:1rem">새 일정 선택</h3><p class="customReser-sub">지점·날짜는 기존 예약과 동일한 브랜치 기준으로 다시 고릅니다.</p>' +
            '<div class="customReser-field"><label>날짜</label><input type="date" id="customReser-rs-dt"></div>' +
            '<div id="customReser-rs-pick"></div>' +
            '<button type="button" class="customReser-btn primary" id="customReser-rs-go">변경 요청</button>';
          var pickEl = lkPanel.querySelector('#customReser-rs-pick');
          lkPanel.querySelector('#customReser-rs-go').onclick = function () {
            var dt = lkPanel.querySelector('#customReser-rs-dt').value;
            var sid = lkPanel.querySelector('[data-slot-pick].on');
            var iq = lkPanel.querySelector('[data-iq-pick].on');
            var payload = { reservation_no: rno, customer_phone: ph };
            if (mode === 'item' && iq) payload.item_quota_id = parseInt(iq.getAttribute('data-iq-pick'), 10);
            else if (sid) payload.slot_id = parseInt(sid.getAttribute('data-slot-pick'), 10);
            else {
              lkShow('새 슬롯/항목을 선택하세요.', false);
              return;
            }
            call(slug, 'user_reschedule', payload, 'POST').then(function (res) {
              if (!res.ok) return lkShow(res.msg || '변경 실패', false);
              lkShow('일정이 변경되었습니다.', true);
              lkPanel.hidden = true;
              lkPanel.innerHTML = '';
              if (lkRes) lkRes.innerHTML = '';
            });
          };
          lkPanel.querySelector('#customReser-rs-dt').addEventListener('change', function () {
            var dt = this.value;
            if (!dt) return;
            call(slug, 'lookup', { reservation_no: rno }, 'POST').then(function (lr) {
              if (!lr.ok || !lr.booking) return;
              var br = lr.booking.branch_id;
              if (mode === 'time') {
                call(slug, 'slots', { branch_id: br, date: dt }, 'GET').then(function (sr) {
                  if (!sr.ok || !pickEl) return;
                  var rows = sr.slots || [];
                  pickEl.innerHTML = '<div class="customReser-slot-list">' + rows.map(function (s) {
                    var dis = !s.available;
                    return '<button type="button" data-slot-pick="' + s.id + '"' + (dis ? ' disabled' : '') + '>' + esc(s.slot_time) + '</button>';
                  }).join('') + '</div>';
                  pickEl.querySelectorAll('[data-slot-pick]').forEach(function (b) {
                    b.onclick = function () {
                      if (b.disabled) return;
                      pickEl.querySelectorAll('[data-slot-pick]').forEach(function (x) { x.classList.remove('on'); });
                      b.classList.add('on');
                    };
                  });
                });
              } else {
                call(slug, 'item_quotas', { branch_id: br, date: dt }, 'GET').then(function (qr) {
                  if (!qr.ok || !pickEl) return;
                  var rows = qr.quotas || [];
                  pickEl.innerHTML = '<div class="customReser-item-list">' + rows.map(function (q) {
                    var dis = !q.available;
                    return '<button type="button" data-iq-pick="' + q.id + '"' + (dis ? ' disabled' : '') + '>' + esc(q.item_name) + '</button>';
                  }).join('') + '</div>';
                  pickEl.querySelectorAll('[data-iq-pick]').forEach(function (b) {
                    b.onclick = function () {
                      if (b.disabled) return;
                      pickEl.querySelectorAll('[data-iq-pick]').forEach(function (x) { x.classList.remove('on'); });
                      b.classList.add('on');
                    };
                  });
                });
              }
            });
          });
        };
      });
    }
  }

  function boot() {
    document.querySelectorAll('.customReser-suite[data-customReser-slug]').forEach(function (root) {
      var slug = (root.getAttribute('data-customReser-slug') || '').trim();
      if (!slug) return;
      initReserPublic(root, slug);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
