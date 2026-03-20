(function () {
  'use strict';

  var API = (function () {
    var a = document.createElement('a');
    a.href = 'api/customReser_admin.php';
    return a.href;
  })();

  var state = { tab: 'bookings', instanceId: 0, listPage: 1 };

  function el(id) { return document.getElementById(id); }

  function post(action, data) {
    var body = Object.assign({ action: action }, data || {});
    return fetch(API, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body)
    }).then(function (r) {
      if (r.status === 401) {
        var e = new Error('auth');
        e.auth = true;
        throw e;
      }
      return r.json();
    });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  function showGate(msg, err) {
    el('customReser-gate').style.display = 'block';
    el('customReser-app').style.display = 'none';
    el('customReser-gate').querySelector('p').textContent = msg;
    if (err) el('customReser-gate').querySelector('p').className = 'customReser-msg err';
  }

  function showApp() {
    el('customReser-gate').style.display = 'none';
    el('customReser-app').style.display = 'block';
  }

  function showMainMsg(text, ok) {
    var m = el('customReser-main-msg');
    if (!m) return;
    m.innerHTML = text ? '<div class="customReser-msg ' + (ok ? 'ok' : 'err') + '">' + esc(text) + '</div>' : '';
  }

  function openModal(html) {
    el('customReser-modal').innerHTML = html;
    el('customReser-modal-bg').classList.add('open');
  }
  function closeModal() {
    el('customReser-modal-bg').classList.remove('open');
  }
  el('customReser-modal-bg').onclick = function (e) {
    if (e.target === el('customReser-modal-bg')) closeModal();
  };

  var TABS = [
    { id: 'bookings', label: '예약 목록' },
    { id: 'steps', label: '단계' },
    { id: 'fields', label: '필드' },
    { id: 'regions', label: '지역·지점' },
    { id: 'assign', label: '인스턴스 지점' },
    { id: 'items', label: '항목' },
    { id: 'slots', label: '시간·수량' },
    { id: 'iquota', label: '항목·일정원' },
    { id: 'closure', label: '휴무일' },
    { id: 'settings', label: '알림' }
  ];

  function renderNav() {
    var nav = el('customReser-nav');
    nav.innerHTML = TABS.map(function (t) {
      return '<button type="button" data-tab="' + t.id + '" class="' + (state.tab === t.id ? 'on' : '') + '">' + esc(t.label) + '</button>';
    }).join('');
    nav.querySelectorAll('button').forEach(function (b) {
      b.onclick = function () {
        state.tab = b.getAttribute('data-tab');
        renderNav();
        renderMain();
      };
    });
  }

  function needInst() {
    if (!state.instanceId) {
      showMainMsg('예약 인스턴스를 선택하세요.', false);
      return false;
    }
    return true;
  }

  function renderMain() {
    showMainMsg('');
    var main = el('customReser-main');
    main.innerHTML = '<div id="customReser-main-msg"></div><div id="customReser-inner"></div>';
    var inner = el('customReser-inner');
    if (!state.instanceId) {
      inner.innerHTML = '<div class="customReser-card"><p>인스턴스를 선택하거나 새로 만드세요.</p></div>';
      return;
    }
    if (state.tab === 'bookings') return renderBookings(inner);
    if (state.tab === 'steps') return renderSteps(inner);
    if (state.tab === 'fields') return renderFields(inner);
    if (state.tab === 'regions') return renderRegions(inner);
    if (state.tab === 'assign') return renderAssign(inner);
    if (state.tab === 'items') return renderItems(inner);
    if (state.tab === 'slots') return renderSlots(inner);
    if (state.tab === 'iquota') return renderIQuota(inner);
    if (state.tab === 'closure') return renderClosure(inner);
    if (state.tab === 'settings') return renderSettings(inner);
  }

  function renderBookings(inner) {
    inner.innerHTML =
      '<div class="customReser-card"><h2>예약 목록</h2>' +
      '<div class="customReser-row"><div><label>검색</label><input type="text" id="rb-q"></div>' +
      '<div><label>상태</label><select id="rb-st"><option value="">전체</option><option>접수</option><option>확인</option><option>완료</option><option>취소</option></select></div>' +
      '<div><button type="button" class="customReser-btn" id="rb-go">검색</button></div>' +
      '<div><button type="button" class="customReser-btn secondary" id="rb-add">관리자 등록</button></div></div>' +
      '<div class="customReser-table-wrap"><table class="customReser-t"><thead><tr><th>번호</th><th>상태</th><th>예약일시</th><th>이름</th><th>연락처</th><th>지점/항목</th><th>인원</th><th></th></tr></thead><tbody id="rb-body"></tbody></table></div>' +
      '<div class="customReser-row" id="rb-pager"></div></div>';
    function load() {
      post('booking_list', { instance_id: state.instanceId, page: state.listPage, per_page: 20, q: el('rb-q').value.trim(), status: el('rb-st').value })
        .then(function (r) {
          if (!r.ok) return showMainMsg(r.msg || '오류', false);
          el('rb-body').innerHTML = (r.rows || []).map(function (row) {
            var dt = row.slot_date ? (String(row.slot_date).slice(0,10) + (row.slot_time ? ' ' + String(row.slot_time).slice(0,5) : '')) : String(row.reservation_at || '').slice(0,16);
            var loc = esc(row.branch_name || '') + (row.item_name ? ' / ' + esc(row.item_name) : '');
            return '<tr><td>' + esc(row.reservation_no) + '</td><td>' + esc(row.status) + '</td><td>' + dt + '</td><td>' + esc(row.customer_name) + '</td><td>' + esc(row.customer_phone) + '</td>' +
              '<td>' + loc + '</td>' +
              '<td>' + (parseInt(row.qty, 10) || 1) + '명</td>' +
              '<td><button type="button" class="customReser-btn secondary rb-det" data-id="' + row.id + '">상세</button></td></tr>';
          }).join('') || '<tr><td colspan="8">없음</td></tr>';
          var tp = Math.max(1, Math.ceil(r.total / 20));
          el('rb-pager').innerHTML = '<button type="button" class="customReser-btn secondary" id="rb-pr"' + (state.listPage <= 1 ? ' disabled' : '') + '>이전</button> ' +
            state.listPage + ' / ' + tp + ' <button type="button" class="customReser-btn secondary" id="rb-nx"' + (state.listPage >= tp ? ' disabled' : '') + '>다음</button>';
          el('rb-pr').onclick = function () { if (state.listPage > 1) { state.listPage--; load(); } };
          el('rb-nx').onclick = function () { if (state.listPage < tp) { state.listPage++; load(); } };
          inner.querySelectorAll('.rb-det').forEach(function (b) {
            b.onclick = function () { openBookingDetail(parseInt(b.getAttribute('data-id'), 10)); };
          });
        });
    }
    el('rb-go').onclick = function () { state.listPage = 1; load(); };
    el('rb-add').onclick = function () { openAdminBookModal(); };
    load();
  }

  function openAdminBookModal() {
    post('meta', { instance_id: state.instanceId }).then(function (meta) {
      var mode = meta.capacity_mode === 'item' ? 'item' : 'time';
      post('branch_list', {}).then(function (br) {
        var opts = (br.branches || []).map(function (x) {
          return '<option value="' + x.id + '">' + esc(x.region_name + ' · ' + x.name) + '</option>';
        }).join('');
        openModal(
          '<h3 style="margin-top:0">관리자 예약</h3>' +
          '<div class="customReser-row"><div><label>지점</label><select id="rab-br">' + opts + '</select></div></div>' +
          '<div class="customReser-row"><div><label>이름</label><input type="text" id="rab-nm"></div><div><label>연락처</label><input type="text" id="rab-ph"></div></div>' +
          '<div class="customReser-row"><div><label>이메일</label><input type="text" id="rab-em" style="width:100%"></div></div>' +
          '<div class="customReser-row"><div><label>날짜</label><input type="date" id="rab-dt"></div><button type="button" class="customReser-btn secondary" id="rab-ld">불러오기</button></div>' +
          '<div class="customReser-row"><div style="flex:1"><label>선택</label><select id="rab-sel" style="width:100%"></select></div></div>' +
          '<div class="customReser-row"><div><label>예약 인원</label><input type="number" id="rab-qty" min="1" max="99" value="1" style="width:70px"> 명</div></div>' +
          '<div class="customReser-row"><button type="button" class="customReser-btn" id="rab-go">등록</button> <button type="button" class="customReser-btn secondary" onclick="document.getElementById(\'customReser-modal-bg\').classList.remove(\'open\')">닫기</button></div>'
        );
        el('rab-ld').onclick = function () {
          var bid = parseInt(el('rab-br').value, 10);
          var d = el('rab-dt').value;
          if (!d) return alert('날짜');
          if (mode === 'item') {
            post('item_quota_list', { instance_id: state.instanceId, branch_id: bid, date: d }).then(function (res) {
              el('rab-sel').innerHTML = (res.quotas || []).map(function (q) {
                var rem = Math.max(0, parseInt(q.capacity, 10) - parseInt(q.booked, 10));
                return '<option value="iq:' + q.id + '"' + (rem > 0 ? '' : ' disabled') + '>' + esc(q.item_name) + ' (잔여 ' + rem + ')</option>';
              }).join('') || '<option value="">없음</option>';
            });
          } else {
            post('slot_list', { instance_id: state.instanceId, branch_id: bid, date: d }).then(function (res) {
              el('rab-sel').innerHTML = (res.slots || []).map(function (s) {
                var rem = Math.max(0, parseInt(s.capacity, 10) - parseInt(s.booked, 10));
                var t = String(s.slot_time || '').substring(0, 5);
                return '<option value="sl:' + s.id + '"' + (rem > 0 ? '' : ' disabled') + '>' + t + ' (잔여 ' + rem + ')</option>';
              }).join('') || '<option value="">없음</option>';
            });
          }
        };
        el('rab-go').onclick = function () {
          var v = el('rab-sel').value;
          if (!v || v.indexOf(':') < 0) return alert('일정 선택');
          var p = v.split(':');
          var data = {
            instance_id: state.instanceId,
            branch_id: parseInt(el('rab-br').value, 10),
            customer_name: el('rab-nm').value.trim(),
            customer_phone: el('rab-ph').value.trim(),
            customer_email: el('rab-em').value.trim(),
            qty: Math.max(1, parseInt(el('rab-qty').value, 10) || 1)
          };
          if (p[0] === 'iq') data.item_quota_id = parseInt(p[1], 10);
          else data.slot_id = parseInt(p[1], 10);
          post('booking_admin_create', data).then(function (res) {
            if (!res.ok) return alert(res.msg || '실패');
            alert('등록: ' + res.reservation_no);
            closeModal();
            renderMain();
          });
        };
      });
    });
  }

  function openBookingDetail(id) {
    post('booking_get', { id: id }).then(function (r) {
      if (!r.ok || !r.booking) return alert('실패');
      var b = r.booking;
      var cap = (b.item_quota_id && parseInt(b.item_quota_id, 10) > 0) ? 'item' : 'time';
      var stOpt = ['접수', '확인', '완료', '취소'].map(function (s) {
        return '<option value="' + s + '"' + (b.status === s ? ' selected' : '') + '>' + s + '</option>';
      }).join('');
      openModal(
        (function(){
          var bDt = b.slot_date ? (String(b.slot_date).slice(0,10) + (b.slot_time ? ' ' + String(b.slot_time).slice(0,5) : '')) : String(b.reservation_at||'').slice(0,16);
          var extraHtml = '';
          try { var ex = JSON.parse(b.extra_json||'{}'); Object.keys(ex).forEach(function(k){ extraHtml += '<tr><td style="color:#64748b">' + esc(k) + '</td><td>' + esc(String(ex[k])) + '</td></tr>'; }); } catch(e){}
          return '<h3 style="margin-top:0">예약 상세</h3>' +
          '<table style="width:100%;font-size:.88rem;border-collapse:collapse;margin-bottom:12px">' +
          '<tr><td style="color:#64748b;padding:3px 6px">예약번호</td><td style="padding:3px 6px"><strong>' + esc(b.reservation_no) + '</strong></td></tr>' +
          '<tr><td style="color:#64748b;padding:3px 6px">상태</td><td style="padding:3px 6px">' + esc(b.status) + '</td></tr>' +
          '<tr><td style="color:#64748b;padding:3px 6px">예약일시</td><td style="padding:3px 6px">' + bDt + '</td></tr>' +
          '<tr><td style="color:#64748b;padding:3px 6px">지점</td><td style="padding:3px 6px">' + esc(b.branch_name||'') + '</td></tr>' +
          (b.item_name ? '<tr><td style="color:#64748b;padding:3px 6px">항목</td><td style="padding:3px 6px">' + esc(b.item_name) + '</td></tr>' : '') +
          '<tr><td style="color:#64748b;padding:3px 6px">이름</td><td style="padding:3px 6px">' + esc(b.customer_name) + '</td></tr>' +
          '<tr><td style="color:#64748b;padding:3px 6px">연락처</td><td style="padding:3px 6px">' + esc(b.customer_phone) + '</td></tr>' +
          (b.customer_email ? '<tr><td style="color:#64748b;padding:3px 6px">이메일</td><td style="padding:3px 6px">' + esc(b.customer_email) + '</td></tr>' : '') +
          '<tr><td style="color:#64748b;padding:3px 6px">인원</td><td style="padding:3px 6px"><strong>' + (parseInt(b.qty,10)||1) + '명</strong></td></tr>' +
          extraHtml +
          '</table>' +
          '<div class="customReser-row"><select id="bd-st">' + stOpt + '</select></div>' +
          '<div class="customReser-row"><input type="text" id="bd-note" placeholder="메모" style="width:100%" value="' + esc(b.admin_note||'') + '"></div>' +
          '<div class="customReser-row"><button type="button" class="customReser-btn" id="bd-sv">상태 저장</button></div><hr>' +
          '<p style="font-size:.85rem;color:#64748b">접수만 일정 변경. 기준: ' + (cap === 'item' ? '항목' : '시간') + '</p>';
        })()+
        
        '<div class="customReser-row"><input type="date" id="bd-dt"> <button type="button" class="customReser-btn secondary" id="bd-ld">불러오기</button></div>' +
        '<div class="customReser-row"><select id="bd-sel"></select> <button type="button" class="customReser-btn" id="bd-rs">변경</button></div>' +
        '<button type="button" class="customReser-btn secondary" onclick="document.getElementById(\'customReser-modal-bg\').classList.remove(\'open\')">닫기</button>'
      );
      el('bd-sv').onclick = function () {
        post('booking_set_status', { id: id, status: el('bd-st').value, admin_note: el('bd-note').value }).then(function (res) {
          if (!res.ok) return alert(res.msg);
          closeModal();
          renderMain();
        });
      };
      el('bd-ld').onclick = function () {
        var d = el('bd-dt').value;
        if (!d) return;
        if (cap === 'item') {
          post('item_quota_list', { instance_id: state.instanceId, branch_id: b.branch_id, date: d }).then(function (res) {
            el('bd-sel').innerHTML = (res.quotas || []).map(function (q) {
              var rem = Math.max(0, parseInt(q.capacity, 10) - parseInt(q.booked, 10));
              return '<option value="' + q.id + '"' + (rem > 0 ? '' : ' disabled') + '>' + esc(q.item_name) + '</option>';
            }).join('');
          });
        } else {
          post('slot_list', { instance_id: state.instanceId, branch_id: b.branch_id, date: d }).then(function (res) {
            el('bd-sel').innerHTML = (res.slots || []).map(function (s) {
              var rem = Math.max(0, parseInt(s.capacity, 10) - parseInt(s.booked, 10));
              return '<option value="' + s.id + '"' + (rem > 0 ? '' : ' disabled') + '>' + esc(String(s.slot_time).substring(0, 5)) + '</option>';
            }).join('');
          });
        }
      };
      el('bd-rs').onclick = function () {
        var pick = parseInt(el('bd-sel').value, 10);
        if (!pick) return alert('선택');
        var pl = { id: id };
        if (cap === 'item') pl.item_quota_id = pick;
        else pl.slot_id = pick;
        post('booking_reschedule', pl).then(function (res) {
          if (!res.ok) return alert(res.msg);
          closeModal();
          renderMain();
        });
      };
    });
  }

  function renderSteps(inner) {
    post('steps_list', { instance_id: state.instanceId }).then(function (r) {
      var order = (r.steps || []).slice().sort(function (a, b) { return a.sort_order - b.sort_order; });
      var lab = { branch: '지점', date: '날짜', time: '시간', item: '항목', info: '정보' };
      function paint() {
        inner.innerHTML = '<div class="customReser-card"><h2>단계 순서</h2><p style="color:#64748b;font-size:.88rem">마지막 활성 「시간」 또는 「항목」이 수량 기준입니다.</p><ul id="rs-ul" style="list-style:none;padding:0"></ul><button type="button" class="customReser-btn" id="rs-sv">저장</button></div>';
        var ul = el('rs-ul');
        order.forEach(function (s, idx) {
          var li = document.createElement('li');
          li.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px';
          li.innerHTML = '<span style="flex:1">' + esc(lab[s.step_key] || s.step_key) + '</span>' +
            '<label><input type="checkbox" class="rs-act" data-k="' + esc(s.step_key) + '"' + (s.is_active == 1 ? ' checked' : '') + '> 활성</label>' +
            '<button type="button" class="customReser-btn secondary rs-up" data-i="' + idx + '">↑</button>' +
            '<button type="button" class="customReser-btn secondary rs-dn" data-i="' + idx + '">↓</button>';
          ul.appendChild(li);
          li.querySelector('.rs-act').onchange = function () {
            s.is_active = this.checked ? 1 : 0;
          };
        });
        ul.querySelectorAll('.rs-up').forEach(function (b) {
          b.onclick = function () {
            var i = parseInt(b.getAttribute('data-i'), 10);
            if (i > 0) {
              var t = order[i - 1];
              order[i - 1] = order[i];
              order[i] = t;
              paint();
            }
          };
        });
        ul.querySelectorAll('.rs-dn').forEach(function (b) {
          b.onclick = function () {
            var i = parseInt(b.getAttribute('data-i'), 10);
            if (i < order.length - 1) {
              var t = order[i + 1];
              order[i + 1] = order[i];
              order[i] = t;
              paint();
            }
          };
        });
        el('rs-sv').onclick = function () {
          var payload = order.map(function (s, i) {
            return { step_key: s.step_key, sort_order: (i + 1) * 10, is_active: !!s.is_active };
          });
          post('steps_save', { instance_id: state.instanceId, steps: payload }).then(function (res) {
            if (!res.ok) return alert(res.msg);
            alert('저장됨');
            renderMain();
          });
        };
      }
      paint();
    });
  }

  function renderFields(inner) {
    inner.innerHTML = '<div class="customReser-card"><h2>필드</h2><button type="button" class="customReser-btn" id="rf-add">추가</button><div class="customReser-table-wrap" style="margin-top:12px"><table class="customReser-t"><thead><tr><th>타입</th><th>키</th><th>라벨</th><th></th></tr></thead><tbody id="rf-bd"></tbody></table></div></div>';
    function load() {
      post('fields_list', { instance_id: state.instanceId }).then(function (r) {
        el('rf-bd').innerHTML = (r.fields || []).map(function (f) {
          return '<tr><td>' + esc(f.field_type) + '</td><td>' + esc(f.name_key) + '</td><td>' + esc(f.label) + '</td><td><button type="button" class="customReser-btn secondary rf-ed" data-id="' + f.id + '">수정</button> <button type="button" class="customReser-btn danger rf-dl" data-id="' + f.id + '">삭제</button></td></tr>';
        }).join('') || '<tr><td colspan="4">없음</td></tr>';
        inner.querySelectorAll('.rf-dl').forEach(function (b) {
          b.onclick = function () {
            if (!confirm('삭제?')) return;
            post('field_delete', { instance_id: state.instanceId, id: parseInt(b.getAttribute('data-id'), 10) }).then(load);
          };
        });
      });
    }
    el('rf-add').onclick = function () {
      var types = ['text', 'phone', 'email', 'radio', 'checkbox', 'dropdown'];
      openModal('<h3>필드</h3><div class="customReser-row"><label>타입</label><select id="rf-t">' + types.map(function (t) { return '<option value="' + t + '">' + t + '</option>'; }).join('') + '</select></div>' +
        '<div class="customReser-row"><input id="rf-k" placeholder="name_key"></div><div class="customReser-row"><input id="rf-l" placeholder="라벨"></div>' +
        '<div class="customReser-row"><textarea id="rf-o" placeholder="옵션 JSON (라디오/체크/드롭다운)">[]</textarea></div>' +
        '<button type="button" class="customReser-btn" id="rf-sv">저장</button>');
      el('rf-sv').onclick = function () {
        var opts;
        try { opts = JSON.parse(el('rf-o').value || '[]'); } catch (e) { return alert('JSON'); }
        post('field_save', { instance_id: state.instanceId, id: 0, field_type: el('rf-t').value, name_key: el('rf-k').value, label: el('rf-l').value, options: opts, sort_order: 0, is_required: false, is_active: true })
          .then(function (res) { if (!res.ok) return alert(res.msg); closeModal(); load(); });
      };
    };
    load();
  }

  function renderRegions(inner) {
    inner.innerHTML = '<div class="customReser-card"><h2>지역</h2><button type="button" class="customReser-btn" id="rr-add">지역 추가</button><table class="customReser-t" style="margin-top:12px"><thead><tr><th>이름</th><th></th></tr></thead><tbody id="rr-bd"></tbody></table></div>' +
      '<div class="customReser-card"><h2>지점</h2><button type="button" class="customReser-btn" id="rb-add">지점 추가</button><table class="customReser-t" style="margin-top:12px"><thead><tr><th>지역</th><th>이름</th><th></th></tr></thead><tbody id="rb-bd"></tbody></table></div>';
    function loadR() {
      post('region_list', {}).then(function (r) {
        el('rr-bd').innerHTML = (r.regions || []).map(function (x) {
          return '<tr><td>' + esc(x.name) + '</td><td><button type="button" class="customReser-btn danger rr-dl" data-id="' + x.id + '">삭제</button></td></tr>';
        }).join('');
        inner.querySelectorAll('.rr-dl').forEach(function (b) {
          b.onclick = function () {
            post('region_delete', { id: parseInt(b.getAttribute('data-id'), 10) }).then(loadR);
          };
        });
      });
    }
    function loadB() {
      post('branch_list', {}).then(function (r) {
        el('rb-bd').innerHTML = (r.branches || []).map(function (x) {
          return '<tr><td>' + esc(x.region_name) + '</td><td>' + esc(x.name) + '</td><td><button type="button" class="customReser-btn danger rb-dl" data-id="' + x.id + '">삭제</button></td></tr>';
        }).join('');
        inner.querySelectorAll('.rb-dl').forEach(function (b) {
          b.onclick = function () {
            post('branch_delete', { id: parseInt(b.getAttribute('data-id'), 10) }).then(loadB);
          };
        });
      });
    }
    el('rr-add').onclick = function () {
      var n = prompt('지역명');
      if (!n) return;
      post('region_save', { id: 0, name: n, sort_order: 0, is_active: true }).then(loadR);
    };
    el('rb-add').onclick = function () {
      post('region_list', {}).then(function (r) {
        var regs = r.regions || [];
        if (!regs.length) return alert('먼저 지역 추가');
        var rid = parseInt(prompt('지역 id: ' + regs.map(function (x) { return x.id + '=' + x.name; }).join(', ')), 10);
        var nm = prompt('지점명');
        if (!rid || !nm) return;
        post('branch_save', { id: 0, region_id: rid, name: nm, sort_order: 0, is_active: true }).then(loadB);
      });
    };
    loadR();
    loadB();
  }

  function renderAssign(inner) {
    inner.innerHTML = '<div class="customReser-card"><h2>이 인스턴스에서 사용할 지점</h2><p style="color:#64748b;font-size:.88rem">체크 후 저장</p><div id="ra-box"></div><button type="button" class="customReser-btn" id="ra-sv" style="margin-top:12px">저장</button></div>';
    Promise.all([
      post('branch_list', {}),
      post('instance_branch_list', { instance_id: state.instanceId })
    ]).then(function (arr) {
      var all = arr[0].branches || [];
      var set = {};
      (arr[1].assigned || []).forEach(function (a) { set[a.branch_id] = true; });
      el('ra-box').innerHTML = all.map(function (b) {
        return '<label style="display:block;margin:6px 0"><input type="checkbox" class="ra-cb" value="' + b.id + '"' + (set[b.id] ? ' checked' : '') + '> ' + esc(b.region_name + ' · ' + b.name) + '</label>';
      }).join('');
    });
    el('ra-sv').onclick = function () {
      var ids = [];
      inner.querySelectorAll('.ra-cb:checked').forEach(function (c) { ids.push(parseInt(c.value, 10)); });
      post('instance_branch_set', { instance_id: state.instanceId, branch_ids: ids }).then(function (res) {
        if (!res.ok) return alert(res.msg);
        alert('저장됨');
      });
    };
  }

  function renderItems(inner) {
    inner.innerHTML = '<div class="customReser-card"><h2>항목</h2><button type="button" class="customReser-btn" id="ri-add">추가</button><table class="customReser-t" style="margin-top:12px"><tbody id="ri-bd"></tbody></table></div>';
    function load() {
      post('item_list', { instance_id: state.instanceId }).then(function (r) {
        el('ri-bd').innerHTML = (r.items || []).map(function (it) {
          return '<tr><td>' + esc(it.name) + '</td><td><button type="button" class="customReser-btn danger ri-dl" data-id="' + it.id + '">삭제</button></td></tr>';
        }).join('');
        inner.querySelectorAll('.ri-dl').forEach(function (b) {
          b.onclick = function () {
            post('item_delete', { instance_id: state.instanceId, id: parseInt(b.getAttribute('data-id'), 10) }).then(load);
          };
        });
      });
    }
    el('ri-add').onclick = function () {
      var n = prompt('항목명');
      if (!n) return;
      post('item_save', { instance_id: state.instanceId, id: 0, name: n, sort_order: 0, is_active: true }).then(load);
    };
    load();
  }

  function renderSlots(inner) {
    inner.innerHTML = '<div class="customReser-card"><h2>시간 슬롯</h2><div class="customReser-row"><div><label>지점</label><select id="rs-br"></select></div><div><label>시작</label><input type="date" id="rs-f"></div><div><label>종료</label><input type="date" id="rs-t"></div></div>' +
      '<div class="customReser-row"><input type="text" id="rs-times" placeholder="09:00,10:00" style="flex:1;min-width:200px"><input type="number" id="rs-cap" value="3" min="1"><button type="button" class="customReser-btn" id="rs-bk">일괄</button></div>' +
      '<div class="customReser-row"><input type="date" id="rs-dy"> <button type="button" class="customReser-btn secondary" id="rs-ld">해당일</button></div><table class="customReser-t"><tbody id="rs-bd"></tbody></table></div>';
    post('branch_list', {}).then(function (r) {
      el('rs-br').innerHTML = (r.branches || []).map(function (b) {
        return '<option value="' + b.id + '">' + esc(b.region_name + ' · ' + b.name) + '</option>';
      }).join('');
    });
    el('rs-bk').onclick = function () {
      var times = el('rs-times').value.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
      post('slot_bulk_create', {
        instance_id: state.instanceId,
        branch_id: parseInt(el('rs-br').value, 10),
        date_from: el('rs-f').value,
        date_to: el('rs-t').value,
        times: times,
        capacity: parseInt(el('rs-cap').value, 10) || 1
      }).then(function (res) { alert(res.ok ? res.inserted_or_updated + '건' : res.msg); });
    };
    el('rs-ld').onclick = function () {
      var d = el('rs-dy').value;
      if (!d) return;
      post('slot_list', { instance_id: state.instanceId, branch_id: parseInt(el('rs-br').value, 10), date: d }).then(function (res) {
        el('rs-bd').innerHTML = (res.slots || []).map(function (s) {
          return '<tr><td>' + esc(String(s.slot_time).substring(0, 5)) + '</td><td>' + s.booked + '/' + s.capacity + '</td><td><button type="button" class="customReser-btn danger rs-dl" data-id="' + s.id + '">삭제</button></td></tr>';
        }).join('');
        inner.querySelectorAll('.rs-dl').forEach(function (b) {
          b.onclick = function () {
            post('slot_delete', { id: parseInt(b.getAttribute('data-id'), 10) }).then(function () { el('rs-ld').click(); });
          };
        });
      });
    };
  }

  function renderIQuota(inner) {
    inner.innerHTML = '<div class="customReser-card"><h2>항목 일별 정원</h2><div class="customReser-row"><select id="iq-br"></select><input type="date" id="iq-f"><input type="date" id="iq-t"><input type="number" id="iq-cap" value="5" min="1"><button type="button" class="customReser-btn" id="iq-bk">일괄</button></div>' +
      '<div class="customReser-row"><input type="date" id="iq-dy"><button type="button" class="customReser-btn secondary" id="iq-ld">해당일</button></div><table class="customReser-t"><tbody id="iq-bd"></tbody></table></div>';
    post('branch_list', {}).then(function (r) {
      el('iq-br').innerHTML = (r.branches || []).map(function (b) {
        return '<option value="' + b.id + '">' + esc(b.name) + '</option>';
      }).join('');
    });
    el('iq-bk').onclick = function () {
      post('item_quota_bulk_create', {
        instance_id: state.instanceId,
        branch_id: parseInt(el('iq-br').value, 10),
        date_from: el('iq-f').value,
        date_to: el('iq-t').value,
        capacity: parseInt(el('iq-cap').value, 10) || 1
      }).then(function (res) { alert(res.ok ? res.inserted_or_updated + '건' : res.msg); });
    };
    el('iq-ld').onclick = function () {
      post('item_quota_list', { instance_id: state.instanceId, branch_id: parseInt(el('iq-br').value, 10), date: el('iq-dy').value }).then(function (res) {
        el('iq-bd').innerHTML = (res.quotas || []).map(function (q) {
          return '<tr><td>' + esc(q.item_name) + '</td><td>' + q.booked + '/' + q.capacity + '</td><td><button type="button" class="customReser-btn danger iq-dl" data-id="' + q.id + '">삭제</button></td></tr>';
        }).join('');
        inner.querySelectorAll('.iq-dl').forEach(function (b) {
          b.onclick = function () {
            post('item_quota_delete', { id: parseInt(b.getAttribute('data-id'), 10) }).then(function () { el('iq-ld').click(); });
          };
        });
      });
    };
  }

  function renderClosure(inner) {
    inner.innerHTML = '<div class="customReser-card"><h2>휴무일 (전일 마감)</h2><div class="customReser-row"><select id="cl-br"></select><input type="date" id="cl-dt"><input type="text" id="cl-rs" placeholder="사유"><button type="button" class="customReser-btn" id="cl-sv">등록</button></div><table class="customReser-t"><tbody id="cl-bd"></tbody></table></div>';
    post('branch_list', {}).then(function (r) {
      el('cl-br').innerHTML = (r.branches || []).map(function (b) {
        return '<option value="' + b.id + '">' + esc(b.name) + '</option>';
      }).join('');
    });
    function load() {
      post('day_closure_list', { instance_id: state.instanceId, branch_id: parseInt(el('cl-br').value, 10) }).then(function (res) {
        el('cl-bd').innerHTML = (res.closures || []).map(function (c) {
          return '<tr><td>' + esc(c.closure_date) + '</td><td>' + esc(c.reason || '') + '</td><td><button type="button" class="customReser-btn danger cl-dl" data-d="' + esc(c.closure_date) + '">해제</button></td></tr>';
        }).join('');
        inner.querySelectorAll('.cl-dl').forEach(function (b) {
          b.onclick = function () {
            post('day_closure_delete', { instance_id: state.instanceId, branch_id: parseInt(el('cl-br').value, 10), closure_date: b.getAttribute('data-d') }).then(load);
          };
        });
      });
    }
    el('cl-br').onchange = load;
    el('cl-sv').onclick = function () {
      post('day_closure_save', { instance_id: state.instanceId, branch_id: parseInt(el('cl-br').value, 10), closure_date: el('cl-dt').value, reason: el('cl-rs').value }).then(load);
    };
    load();
  }

  function renderSettings(inner) {
    inner.innerHTML = '<div class="customReser-card"><h2>예약 설정</h2>' +
      '<div class="customReser-row"><label style="font-weight:600">1회 최대 예약 인원</label>' +
      '<div style="display:flex;align-items:center;gap:8px;margin-top:6px">' +
      '<input type="number" id="st-mq" min="1" max="999" style="width:80px;text-align:center"> 명' +
      '</div><p style="color:#64748b;font-size:.82rem;margin:4px 0 0">예약 위젯에서 한 번에 선택할 수 있는 최대 인원수입니다.</p></div>' +
      '<button type="button" class="customReser-btn" id="st-mq-sv" style="margin-bottom:16px">저장</button></div>' +
      '<div class="customReser-card"><h2>알림 (관리자만)</h2>' +
      '<div class="customReser-row"><label><input type="checkbox" id="st-em"> 이메일</label> <label><input type="checkbox" id="st-sh"> 스프레드시트</label> <label><input type="checkbox" id="st-al"> 알림톡</label></div>' +
      '<div class="customReser-row"><textarea id="st-ems" placeholder="이메일 쉼표 구분" style="width:100%;min-height:60px"></textarea></div>' +
      '<div class="customReser-row"><input type="text" id="st-shu" placeholder="스프레드시트 웹훅" style="width:100%"></div>' +
      '<div class="customReser-row"><input type="text" id="st-alu" placeholder="알림톡 웹훅" style="width:100%"></div>' +
      '<button type="button" class="customReser-btn" id="st-sv">저장</button></div>';

    /* max_qty: instance 목록에서 현재 인스턴스 값 읽기 */
    loadInstances().then(function (r) {
      var inst = (r.instances || []).find(function (x) { return parseInt(x.id, 10) === state.instanceId; });
      var curMax = inst && parseInt(inst.max_qty_per_booking, 10) > 0 ? parseInt(inst.max_qty_per_booking, 10) : 10;
      el('st-mq').value = curMax;
    });
    el('st-mq-sv').onclick = function () {
      var mq = parseInt(el('st-mq').value, 10) || 10;
      /* instance_save with id to update only max_qty */
      loadInstances().then(function (r) {
        var inst = (r.instances || []).find(function (x) { return parseInt(x.id, 10) === state.instanceId; });
        if (!inst) return alert('인스턴스 정보를 불러올 수 없습니다.');
        post('instance_save', {
          id: state.instanceId,
          name: inst.name,
          slug: inst.slug,
          is_active: inst.is_active == 1,
          sort_order: inst.sort_order || 0,
          max_qty_per_booking: mq
        }).then(function (res) { alert(res.ok ? '저장되었습니다.' : res.msg); });
      });
    };
    post('settings_get', { instance_id: state.instanceId }).then(function (r) {
      var s = r.settings || {};
      el('st-ems').value = s.notify_emails || '';
      el('st-shu').value = s.spreadsheet_webhook || '';
      el('st-alu').value = s.alimtalk_webhook || '';
      el('st-em').checked = parseInt(s.notify_use_email, 10) !== 0;
      el('st-sh').checked = parseInt(s.notify_use_sheet, 10) === 1;
      el('st-al').checked = parseInt(s.notify_use_alim, 10) === 1;
    });
    el('st-sv').onclick = function () {
      post('settings_save', {
        instance_id: state.instanceId,
        notify_emails: el('st-ems').value,
        spreadsheet_webhook: el('st-shu').value,
        alimtalk_webhook: el('st-alu').value,
        notify_use_email: el('st-em').checked,
        notify_use_sheet: el('st-sh').checked,
        notify_use_alim: el('st-al').checked
      }).then(function (res) { alert(res.ok ? '저장' : res.msg); });
    };
  }

  function loadInstances() {
    return fetch(API + '?action=instance_list', { credentials: 'same-origin' }).then(function (r) {
      return r.text().then(function (text) {
        var data;
        try {
          data = JSON.parse(text);
        } catch (ignore) {
          throw new Error('JSON 파싱 실패(서버가 HTML/경고를 반환했을 수 있음): ' + (text || '').replace(/\s+/g, ' ').slice(0, 300));
        }
        if (r.status === 401) {
          var e = new Error('auth');
          e.auth = true;
          throw e;
        }
        return data;
      });
    });
  }

  function fillInstanceSelect(list) {
    var sel = el('customReser-inst');
    sel.innerHTML = (list || []).map(function (x) {
      return '<option value="' + x.id + '">' + esc(x.name) + ' (' + esc(x.slug) + ')</option>';
    }).join('');
    if (list && list.length) {
      state.instanceId = parseInt(list[0].id, 10);
      sel.value = String(state.instanceId);
    } else {
      state.instanceId = 0;
    }
    sel.onchange = function () {
      state.instanceId = parseInt(sel.value, 10) || 0;
      renderMain();
    };
  }

  el('customReser-new-inst').onclick = function () {
    var name = prompt('예약 표시명');
    var slug = prompt('slug (영문·숫자·하이픈)', (name || 'book').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, ''));
    if (!name || !slug) return;
    post('instance_save', { id: 0, name: name, slug: slug, is_active: true, sort_order: 0 }).then(function (res) {
      if (!res.ok) return alert(res.msg);
      loadInstances().then(function (r2) {
        fillInstanceSelect(r2.instances || []);
        renderNav();
        renderMain();
      });
    });
  };

  window.initCustomReserAdmin = function () {
    var g = el('customReser-gate');
    var app = el('customReser-app');
    if (g) {
      g.style.display = 'block';
      g.querySelector('p').textContent = '불러오는 중…';
      g.querySelector('p').className = '';
    }
    if (app) app.style.display = 'none';
    loadInstances().then(function (r) {
      if (!r.ok) {
        var d = r.detail ? ' (' + r.detail + ')' : '';
        showGate('customReser 오류: ' + (r.msg || JSON.stringify(r)) + d, true);
        return;
      }
      showApp();
      fillInstanceSelect(r.instances || []);
      renderNav();
      renderMain();
    }).catch(function (e) {
      if (e.auth && g) {
        g.style.display = 'block';
        if (app) app.style.display = 'none';
        g.querySelector('p').textContent = '로그인이 필요합니다.';
        g.querySelector('p').className = 'customReser-msg err';
        return;
      }
      showGate('예약 모듈(customReser)을 불러올 수 없습니다. db.php와 같은 DB에 customReser_schema.sql(customReser_* 테이블) 적용 여부를 확인하세요. ' + (e.message || ''), true);
    });
  };
})();
