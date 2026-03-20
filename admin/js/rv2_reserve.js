(function () {
  'use strict';

  var API = (function () {
    var a = document.createElement('a');
    a.href = 'api/rv2_admin.php';
    return a.href;
  })();

  var state = { tab: 'list', listPage: 1, branches: [], bookingTotal: 0 };

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
      return r.text().then(function (text) {
        try {
          return JSON.parse(text);
        } catch (ignore) {
          var e2 = new Error('서버가 JSON이 아닌 응답을 보냈습니다. api/rv2_admin.php 경로·PHP 오류·파일 인코딩을 확인하세요.');
          e2.raw = (text || '').replace(/\s+/g, ' ').slice(0, 280);
          throw e2;
        }
      });
    });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  function findById(arr, id) {
    for (var i = 0; i < (arr || []).length; i++) {
      if (arr[i].id === id) return arr[i];
    }
    return null;
  }

  function showMainMsg(text, ok) {
    var m = el('rv2a-main-msg');
    if (!m) return;
    m.innerHTML = text ? '<div class="rv2a-msg ' + (ok ? 'ok' : 'err') + '">' + esc(text) + '</div>' : '';
  }

  function openModal(html) {
    el('rv2a-modal').innerHTML = html;
    el('rv2a-modal-bg').classList.add('open');
  }
  function closeModal() {
    el('rv2a-modal-bg').classList.remove('open');
  }
  el('rv2a-modal-bg').onclick = function (e) {
    if (e.target === el('rv2a-modal-bg')) closeModal();
  };

  var TABS = [
    { id: 'list', label: '예약 목록' },
    { id: 'fields', label: '필드 관리' },
    { id: 'steps', label: '단계 순서' },
    { id: 'branches', label: '지점' },
    { id: 'items', label: '항목' },
    { id: 'slots', label: '시간·수량' },
    { id: 'settings', label: '알림 설정' }
  ];

  function renderNav() {
    var nav = el('rv2a-nav');
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

  function renderMain() {
    showMainMsg('');
    var main = el('rv2a-main');
    main.innerHTML = '<div id="rv2a-main-msg"></div><div id="rv2a-inner"></div>';
    var inner = el('rv2a-inner');
    if (state.tab === 'list') return renderList(inner);
    if (state.tab === 'fields') return renderFields(inner);
    if (state.tab === 'steps') return renderSteps(inner);
    if (state.tab === 'branches') return renderBranches(inner);
    if (state.tab === 'items') return renderItems(inner);
    if (state.tab === 'slots') return renderSlots(inner);
    if (state.tab === 'settings') return renderSettings(inner);
  }

  function renderList(inner) {
    inner.innerHTML =
      '<div class="rv2a-card"><h2>예약 목록</h2>' +
      '<div class="rv2a-row">' +
      '<div><label>검색(이름/전화/예약번호)</label><input type="text" id="f-q"></div>' +
      '<div><label>상태</label><select id="f-st"><option value="">전체</option><option>접수</option><option>확인</option><option>완료</option><option>취소</option></select></div>' +
      '<div><label>지점</label><select id="f-br"><option value="0">전체</option></select></div>' +
      '<div><label>시작일</label><input type="date" id="f-from"></div>' +
      '<div><label>종료일</label><input type="date" id="f-to"></div>' +
      '<div><button type="button" class="rv2a-btn" id="btn-search">검색</button></div>' +
      '<div><button type="button" class="rv2a-btn secondary" id="btn-export">엑셀(CSV) 다운로드</button></div>' +
      '</div>' +
      '<div class="rv2a-table-wrap"><table class="rv2a-t"><thead><tr><th>예약번호</th><th>상태</th><th>일시</th><th>지점</th><th>이름</th><th>연락처</th><th>관리</th></tr></thead><tbody id="tbl-body"></tbody></table></div>' +
      '<div class="rv2a-row" id="pager"></div></div>';

    post('branch_list', {}).then(function (r) {
      if (!r.ok) return;
      state.branches = r.branches || [];
      var sel = el('f-br');
      state.branches.forEach(function (b) {
        var o = document.createElement('option');
        o.value = b.id;
        o.textContent = b.name;
        sel.appendChild(o);
      });
    });

    function load() {
      post('booking_list', {
        page: state.listPage,
        per_page: 20,
        q: el('f-q').value.trim(),
        status: el('f-st').value,
        branch_id: parseInt(el('f-br').value, 10) || 0,
        from: el('f-from').value,
        to: el('f-to').value
      }).then(function (r) {
        if (!r.ok) {
          showMainMsg(r.msg || '목록 오류');
          return;
        }
        state.bookingTotal = r.total;
        el('tbl-body').innerHTML = (r.rows || []).map(function (row) {
          return '<tr><td>' + esc(row.reservation_no) + '</td><td>' + esc(row.status) + '</td><td>' + esc(row.reservation_at) + '</td><td>' + esc(row.branch_name) + '</td><td>' + esc(row.customer_name) + '</td><td>' + esc(row.customer_phone) + '</td><td><button type="button" class="rv2a-btn secondary btn-det" data-id="' + row.id + '">상세</button></td></tr>';
        }).join('') || '<tr><td colspan="7">데이터 없음</td></tr>';

        var totalPages = Math.max(1, Math.ceil(r.total / 20));
        el('pager').innerHTML =
          '<button type="button" class="rv2a-btn secondary" id="p-prev"' + (state.listPage <= 1 ? ' disabled' : '') + '>이전</button>' +
          '<span style="padding:8px">' + state.listPage + ' / ' + totalPages + ' (총 ' + r.total + '건)</span>' +
          '<button type="button" class="rv2a-btn secondary" id="p-next"' + (state.listPage >= totalPages ? ' disabled' : '') + '>다음</button>';

        el('p-prev').onclick = function () {
          if (state.listPage > 1) { state.listPage--; load(); }
        };
        el('p-next').onclick = function () {
          if (state.listPage < totalPages) { state.listPage++; load(); }
        };

        inner.querySelectorAll('.btn-det').forEach(function (btn) {
          btn.onclick = function () {
            openBookingDetail(parseInt(btn.getAttribute('data-id'), 10));
          };
        });
      });
    }

    el('btn-search').onclick = function () { state.listPage = 1; load(); };
    el('btn-export').onclick = function () {
      var q = new URLSearchParams({
        action: 'export_csv',
        q: el('f-q').value.trim(),
        status: el('f-st').value,
        branch_id: el('f-br').value,
        from: el('f-from').value,
        to: el('f-to').value
      });
      window.open(API + '?' + q.toString(), '_blank');
    };
    load();
  }

  function openBookingDetail(id) {
    post('booking_get', { id: id }).then(function (r) {
      if (!r.ok || !r.booking) {
        alert('조회 실패');
        return;
      }
      var b = r.booking;
      var statusOpts = ['접수', '확인', '완료', '취소'].map(function (s) {
        return '<option value="' + s + '"' + (b.status === s ? ' selected' : '') + '>' + s + '</option>';
      }).join('');
      openModal(
        '<h3 style="margin-top:0">예약 상세</h3>' +
        '<p><strong>번호</strong> ' + esc(b.reservation_no) + '</p>' +
        '<p><strong>일시</strong> ' + esc(b.reservation_at) + '</p>' +
        '<div class="rv2a-row"><div><label>상태</label><select id="m-st">' + statusOpts + '</select></div></div>' +
        '<div class="rv2a-row"><div style="flex:1"><label>관리 메모</label><input type="text" id="m-note" style="width:100%" value="' + esc(b.admin_note || '') + '"></div></div>' +
        '<div class="rv2a-row"><button type="button" class="rv2a-btn" id="m-save-st">상태 저장</button></div>' +
        '<hr style="margin:16px 0;border:none;border-top:1px solid #e2e8f0">' +
        '<p style="font-size:.85rem;color:#64748b">접수 상태일 때만 날짜·시간(슬롯) 변경 가능합니다.</p>' +
        '<div class="rv2a-row"><div><label>새 예약일</label><input type="date" id="m-dt"></div>' +
        '<div><button type="button" class="rv2a-btn secondary" id="m-load-sl">해당일 슬롯 불러오기</button></div></div>' +
        '<div class="rv2a-row"><div><label>새 슬롯</label><select id="m-slot"><option value="">먼저 날짜 선택 후 불러오기</option></select></div>' +
        '<div><button type="button" class="rv2a-btn" id="m-resched">일정 변경</button></div></div>' +
        '<div class="rv2a-row"><button type="button" class="rv2a-btn secondary" onclick="document.getElementById(\'rv2a-modal-bg\').classList.remove(\'open\')">닫기</button></div>'
      );
      el('m-save-st').onclick = function () {
        post('booking_set_status', { id: id, status: el('m-st').value, admin_note: el('m-note').value })
          .then(function (res) {
            if (!res.ok) return alert(res.msg || '실패');
            alert('저장됨');
            closeModal();
            renderMain();
          });
      };
      el('m-load-sl').onclick = function () {
        var d = el('m-dt').value;
        if (!d) return alert('날짜 선택');
        post('slot_list', { branch_id: b.branch_id, date: d }).then(function (res) {
          if (!res.ok) return alert(res.msg || '실패');
          var sel = el('m-slot');
          sel.innerHTML = (res.slots || []).map(function (s) {
            var t = String(s.slot_time || '').substring(0, 5);
            var av = parseInt(s.capacity, 10) > parseInt(s.booked, 10);
            return '<option value="' + s.id + '"' + (av ? '' : ' disabled') + '>' + t + ' (잔여 ' + (parseInt(s.capacity, 10) - parseInt(s.booked, 10)) + ')</option>';
          }).join('') || '<option value="">슬롯 없음</option>';
        });
      };
      el('m-resched').onclick = function () {
        var sid = parseInt(el('m-slot').value, 10);
        if (!sid) return alert('슬롯 선택');
        post('booking_reschedule', { id: id, slot_id: sid }).then(function (res) {
          if (!res.ok) return alert(res.msg || '실패');
          alert('변경 완료');
          closeModal();
          renderMain();
        });
      };
    });
  }

  function renderFields(inner) {
    inner.innerHTML = '<div class="rv2a-card"><h2>필드 관리</h2><p style="color:#64748b;font-size:.88rem">타입: 날짜, 시간, 텍스트, 라디오, 체크박스, 드롭다운, 기간(시작~종료)</p>' +
      '<button type="button" class="rv2a-btn" id="f-add">필드 추가</button>' +
      '<div class="rv2a-table-wrap" style="margin-top:16px"><table class="rv2a-t"><thead><tr><th>타입</th><th>키</th><th>라벨</th><th>필수</th><th>순서</th><th>활성</th><th></th></tr></thead><tbody id="ft-body"></tbody></table></div></div>';

    function loadF() {
      post('fields_list', {}).then(function (r) {
        if (!r.ok) return;
        el('ft-body').innerHTML = (r.fields || []).map(function (f) {
          return '<tr><td>' + esc(f.field_type) + '</td><td>' + esc(f.name_key) + '</td><td>' + esc(f.label) + '</td><td>' + (f.is_required ? 'Y' : '') + '</td><td>' + f.sort_order + '</td><td>' + (f.is_active ? 'Y' : 'N') + '</td><td><button type="button" class="rv2a-btn secondary btn-ed" data-id="' + f.id + '">수정</button> <button type="button" class="rv2a-btn danger btn-del" data-id="' + f.id + '">삭제</button></td></tr>';
        }).join('') || '<tr><td colspan="7">없음</td></tr>';
        inner.querySelectorAll('.btn-del').forEach(function (b) {
          b.onclick = function () {
            if (!confirm('삭제할까요?')) return;
            post('field_delete', { id: parseInt(b.getAttribute('data-id'), 10) }).then(function (res) {
              if (res.ok) loadF();
            });
          };
        });
        inner.querySelectorAll('.btn-ed').forEach(function (b) {
          b.onclick = function () {
            var id = parseInt(b.getAttribute('data-id'), 10);
            var f = findById(r.fields, id);
            if (f) openFieldForm(f, loadF);
          };
        });
      });
    }
    el('f-add').onclick = function () { openFieldForm(null, loadF); };
    loadF();
  }

  function openFieldForm(f, cb) {
    var types = ['date', 'time', 'text', 'radio', 'checkbox', 'dropdown', 'daterange'];
    var optStr = f && f.options ? JSON.stringify(f.options) : '["옵션1","옵션2"]';
    openModal(
      '<h3 style="margin-top:0">' + (f ? '필드 수정' : '필드 추가') + '</h3>' +
      '<div class="rv2a-row"><div><label>타입</label><select id="ff-type">' + types.map(function (t) {
        return '<option value="' + t + '"' + (f && f.field_type === t ? ' selected' : '') + '>' + t + '</option>';
      }).join('') + '</select></div></div>' +
      '<div class="rv2a-row"><div><label>name_key (영문/숫자_)</label><input type="text" id="ff-key" value="' + esc(f ? f.name_key : '') + '"></div></div>' +
      '<div class="rv2a-row"><div><label>라벨</label><input type="text" id="ff-lab" value="' + esc(f ? f.label : '') + '"></div></div>' +
      '<div class="rv2a-row"><div style="flex:1"><label>옵션(JSON 배열, 라디오/체크/드롭다운)</label><textarea id="ff-opt" rows="3" style="width:100%">' + esc(optStr) + '</textarea></div></div>' +
      '<div class="rv2a-row"><div><label>정렬</label><input type="number" id="ff-so" value="' + (f ? f.sort_order : 0) + '"></div>' +
      '<div><label><input type="checkbox" id="ff-req"' + (f && f.is_required ? ' checked' : '') + '> 필수</label></div>' +
      '<div><label><input type="checkbox" id="ff-act"' + (!f || f.is_active ? ' checked' : '') + '> 활성</label></div></div>' +
      '<div class="rv2a-row"><button type="button" class="rv2a-btn" id="ff-save">저장</button> <button type="button" class="rv2a-btn secondary" onclick="document.getElementById(\'rv2a-modal-bg\').classList.remove(\'open\')">취소</button></div>'
    );
    el('ff-save').onclick = function () {
      var opts;
      try { opts = JSON.parse(el('ff-opt').value || '[]'); } catch (e) { alert('옵션 JSON 오류'); return; }
      post('field_save', {
        id: f ? f.id : 0,
        field_type: el('ff-type').value,
        name_key: el('ff-key').value.trim(),
        label: el('ff-lab').value.trim(),
        options: opts,
        sort_order: parseInt(el('ff-so').value, 10) || 0,
        is_required: el('ff-req').checked,
        is_active: el('ff-act').checked
      }).then(function (res) {
        if (!res.ok) return alert(res.msg || '실패');
        closeModal();
        cb();
      });
    };
  }

  function renderSteps(inner) {
    post('steps_list', {}).then(function (r) {
      if (!r.ok) return;
      var order = (r.steps || []).slice().sort(function (a, b) { return a.sort_order - b.sort_order; });

      function reorder(arr, from, to) {
        if (to < 0 || to >= arr.length) return;
        var x = arr.splice(from, 1)[0];
        arr.splice(to, 0, x);
      }

      function paint() {
        inner.innerHTML = '<div class="rv2a-card"><h2>예약 단계 순서</h2><p style="color:#64748b;font-size:.88rem">위/아래로 순서 변경 후 저장하세요.</p><ul id="st-ul" style="list-style:none;padding:0"></ul><button type="button" class="rv2a-btn" id="st-save">순서 저장</button></div>';
        var ul = el('st-ul');
        order.forEach(function (s, idx) {
          var li = document.createElement('li');
          li.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px;background:#f8fafc';
          li.innerHTML =
            '<span style="flex:1;font-weight:600">' + esc(s.step_key) + '</span>' +
            '<label><input type="checkbox" class="st-act" data-k="' + esc(s.step_key) + '"' + (s.is_active == 1 ? ' checked' : '') + '> 활성</label>' +
            '<button type="button" class="rv2a-btn secondary st-up" data-i="' + idx + '">↑</button>' +
            '<button type="button" class="rv2a-btn secondary st-down" data-i="' + idx + '">↓</button>';
          ul.appendChild(li);
          var cb = li.querySelector('.st-act');
          cb.addEventListener('change', function () {
            s.is_active = cb.checked ? 1 : 0;
          });
        });
        ul.querySelectorAll('.st-up').forEach(function (b) {
          b.onclick = function () {
            var i = parseInt(b.getAttribute('data-i'), 10);
            reorder(order, i, i - 1);
            paint();
          };
        });
        ul.querySelectorAll('.st-down').forEach(function (b) {
          b.onclick = function () {
            var i = parseInt(b.getAttribute('data-i'), 10);
            reorder(order, i, i + 1);
            paint();
          };
        });
        el('st-save').onclick = function () {
          var payload = order.map(function (s, i) {
            return { step_key: s.step_key, sort_order: (i + 1) * 10, is_active: !!s.is_active };
          });
          post('steps_save', { steps: payload }).then(function (res) {
            if (!res.ok) return alert(res.msg || '실패');
            alert('저장됨');
            renderSteps(inner);
          });
        };
      }
      paint();
    });
  }

  function renderBranches(inner) {
    inner.innerHTML = '<div class="rv2a-card"><h2>지점</h2><button type="button" class="rv2a-btn" id="br-add">추가</button><table class="rv2a-t" style="margin-top:12px"><thead><tr><th>이름</th><th>순서</th><th>활성</th><th></th></tr></thead><tbody id="br-body"></tbody></table></div>';
    function load() {
      post('branch_list', {}).then(function (r) {
        el('br-body').innerHTML = (r.branches || []).map(function (b) {
          return '<tr><td>' + esc(b.name) + '</td><td>' + b.sort_order + '</td><td>' + (b.is_active ? 'Y' : 'N') + '</td><td><button type="button" class="rv2a-btn secondary br-ed" data-id="' + b.id + '">수정</button> <button type="button" class="rv2a-btn danger br-del" data-id="' + b.id + '">삭제</button></td></tr>';
        }).join('');
        inner.querySelectorAll('.br-del').forEach(function (b) {
          b.onclick = function () {
            if (!confirm('삭제?')) return;
            post('branch_delete', { id: parseInt(b.getAttribute('data-id'), 10) }).then(load);
          };
        });
        inner.querySelectorAll('.br-ed').forEach(function (b) {
          b.onclick = function () {
            var id = parseInt(b.getAttribute('data-id'), 10);
            var br = findById(r.branches, id);
            var n = prompt('지점명', br.name);
            if (n == null) return;
            post('branch_save', { id: id, name: n, sort_order: br.sort_order, is_active: !!br.is_active }).then(load);
          };
        });
      });
    }
    el('br-add').onclick = function () {
      var n = prompt('지점명');
      if (!n) return;
      post('branch_save', { id: 0, name: n, sort_order: 0, is_active: true }).then(load);
    };
    load();
  }

  function renderItems(inner) {
    inner.innerHTML = '<div class="rv2a-card"><h2>예약 항목</h2><button type="button" class="rv2a-btn" id="it-add">추가</button><table class="rv2a-t" style="margin-top:12px"><thead><tr><th>이름</th><th>순서</th><th>활성</th><th></th></tr></thead><tbody id="it-body"></tbody></table></div>';
    function load() {
      post('item_list', {}).then(function (r) {
        el('it-body').innerHTML = (r.items || []).map(function (b) {
          return '<tr><td>' + esc(b.name) + '</td><td>' + b.sort_order + '</td><td>' + (b.is_active ? 'Y' : 'N') + '</td><td><button type="button" class="rv2a-btn secondary it-ed" data-id="' + b.id + '">수정</button> <button type="button" class="rv2a-btn danger it-del" data-id="' + b.id + '">삭제</button></td></tr>';
        }).join('');
        inner.querySelectorAll('.it-del').forEach(function (b) {
          b.onclick = function () {
            if (!confirm('삭제?')) return;
            post('item_delete', { id: parseInt(b.getAttribute('data-id'), 10) }).then(load);
          };
        });
        inner.querySelectorAll('.it-ed').forEach(function (b) {
          b.onclick = function () {
            var id = parseInt(b.getAttribute('data-id'), 10);
            var it = findById(r.items, id);
            var n = prompt('항목명', it.name);
            if (n == null) return;
            post('item_save', { id: id, name: n, sort_order: it.sort_order, is_active: !!it.is_active }).then(load);
          };
        });
      });
    }
    el('it-add').onclick = function () {
      var n = prompt('항목명');
      if (!n) return;
      post('item_save', { id: 0, name: n, sort_order: 0, is_active: true }).then(load);
    };
    load();
  }

  function renderSlots(inner) {
    inner.innerHTML = '<div class="rv2a-card"><h2>시간대 · 수량</h2>' +
      '<div class="rv2a-row"><div><label>지점</label><select id="sl-br"></select></div>' +
      '<div><label>시작일</label><input type="date" id="sl-f"></div>' +
      '<div><label>종료일</label><input type="date" id="sl-t"></div></div>' +
      '<div class="rv2a-row"><div style="flex:1"><label>시간 목록 (쉼표로 구분, 예: 09:00,10:00,11:00)</label><input type="text" id="sl-times" style="width:100%" value="09:00,10:00,11:00,14:00,15:00"></div>' +
      '<div><label>슬롯당 정원</label><input type="number" id="sl-cap" value="3" min="1"></div>' +
      '<div><button type="button" class="rv2a-btn" id="sl-bulk">일괄 생성/갱신</button></div></div>' +
      '<div class="rv2a-row"><div><label>특정일 조회</label><input type="date" id="sl-day"></div><button type="button" class="rv2a-btn secondary" id="sl-load">해당일 슬롯</button></div>' +
      '<table class="rv2a-t"><thead><tr><th>시간</th><th>정원</th><th>예약</th><th></th></tr></thead><tbody id="sl-body"></tbody></table></div>';

    post('branch_list', {}).then(function (r) {
      var sel = el('sl-br');
      (r.branches || []).forEach(function (b) {
        var o = document.createElement('option');
        o.value = b.id;
        o.textContent = b.name;
        sel.appendChild(o);
      });
    });

    el('sl-bulk').onclick = function () {
      var times = el('sl-times').value.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
      post('slot_bulk_create', {
        branch_id: parseInt(el('sl-br').value, 10),
        date_from: el('sl-f').value,
        date_to: el('sl-t').value,
        times: times,
        capacity: parseInt(el('sl-cap').value, 10) || 1
      }).then(function (res) {
        if (!res.ok) return alert(res.msg || '실패');
        alert((res.inserted_or_updated || 0) + '건 반영');
      });
    };

    el('sl-load').onclick = function () {
      var d = el('sl-day').value;
      if (!d) return alert('날짜 선택');
      post('slot_list', { branch_id: parseInt(el('sl-br').value, 10), date: d }).then(function (res) {
        el('sl-body').innerHTML = (res.slots || []).map(function (s) {
          return '<tr><td>' + esc(String(s.slot_time).substring(0, 5)) + '</td><td>' + s.capacity + '</td><td>' + s.booked + '</td><td><button type="button" class="rv2a-btn secondary sl-capb" data-id="' + s.id + '">정원</button> <button type="button" class="rv2a-btn danger sl-del" data-id="' + s.id + '">삭제</button></td></tr>';
        }).join('') || '<tr><td colspan="4">없음</td></tr>';
        inner.querySelectorAll('.sl-del').forEach(function (b) {
          b.onclick = function () {
            if (!confirm('삭제? (예약 없을 때만)')) return;
            post('slot_delete', { id: parseInt(b.getAttribute('data-id'), 10) }).then(function (x) {
              if (!x.ok) alert(x.msg || '실패');
              el('sl-load').click();
            });
          };
        });
        inner.querySelectorAll('.sl-capb').forEach(function (b) {
          b.onclick = function () {
            var c = prompt('새 정원', '5');
            if (c == null) return;
            post('slot_set_capacity', { id: parseInt(b.getAttribute('data-id'), 10), capacity: parseInt(c, 10) }).then(function (x) {
              if (!x.ok) alert(x.msg || '실패');
              el('sl-load').click();
            });
          };
        });
      });
    };
  }

  function renderSettings(inner) {
    inner.innerHTML = '<div class="rv2a-card"><h2>알림 설정</h2><p style="color:#64748b;font-size:.88rem">이메일은 서버 mail() 함수 사용. 스프레드시트/알림톡은 웹훅 URL로 JSON POST 됩니다.</p>' +
      '<div class="rv2a-row"><div style="flex:1"><label>기본 알림 이메일(쉼표 구분)</label><textarea id="set-em" rows="2" style="width:100%"></textarea></div></div>' +
      '<div class="rv2a-row"><div style="flex:1"><label>스프레드시트 웹훅 URL</label><input type="text" id="set-sh" style="width:100%"></div></div>' +
      '<div class="rv2a-row"><div style="flex:1"><label>알림톡 웹훅 URL</label><input type="text" id="set-al" style="width:100%"></div></div>' +
      '<button type="button" class="rv2a-btn" id="set-save">저장</button></div>';

    post('settings_get', {}).then(function (r) {
      var s = r.settings || {};
      el('set-em').value = s.notify_emails || '';
      el('set-sh').value = s.spreadsheet_webhook || '';
      el('set-al').value = s.alimtalk_webhook || '';
    });
    el('set-save').onclick = function () {
      post('settings_save', {
        notify_emails: el('set-em').value,
        spreadsheet_webhook: el('set-sh').value,
        alimtalk_webhook: el('set-al').value
      }).then(function (res) {
        if (!res.ok) return alert(res.msg || '실패');
        alert('저장됨');
      });
    };
  }

  post('booking_list', { page: 1, per_page: 1 }).then(function (r) {
    if (!r.ok) throw new Error(r.msg || 'API 오류');
    el('rv2a-gate').style.display = 'none';
    el('rv2a-app').style.display = 'block';
    renderNav();
    renderMain();
  }).catch(function (e) {
    if (e.auth) {
      el('rv2a-gate').style.display = 'block';
    } else {
      el('rv2a-gate').style.display = 'block';
      el('rv2a-gate').querySelector('p').textContent = '연결 오류: ' + (e.message || '');
    }
  });
})();
