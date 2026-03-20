/* =============================================================
   rvm_api.js  —  rvm_admin_ui.js 전용 API 연동 레이어
   
   사용법
     rvm_api.js 를 rvm_admin_ui.js 보다 먼저 로드하면
     window.RvmApi 객체를 통해 실제 DB와 통신합니다.
     
   엔드포인트
     window.RVM_API_URL 을 먼저 정의해두면 그 값을 사용합니다.
     없으면 /admin/api/rvm_admin_api.php 를 기본으로 사용합니다.
     
   rvm_admin_ui.js 의 더미 state 대신 실제 DB 연동으로 전환할 때
   이 파일을 먼저 불러오고, rvm_admin_ui.js 상단의
   USE_REAL_API = true 로 변경하세요.
============================================================= */

(function (global) {
  'use strict';

  var BASE = (typeof global.RVM_API_URL === 'string' && global.RVM_API_URL)
    ? global.RVM_API_URL
    : '/admin/api/rvm_admin_api.php';

  /* ── 공통 fetch 래퍼 ──────────────────────── */
  function req(action, data, method) {
    method = method || 'POST';
    var url = BASE;
    var opts = {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    };

    if (method === 'GET') {
      var params = Object.assign({ action: action }, data || {});
      url += '?' + Object.keys(params)
        .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); })
        .join('&');
    } else {
      opts.body = JSON.stringify(Object.assign({ action: action }, data || {}));
    }

    return fetch(url, opts)
      .then(function (res) {
        return res.json().then(function (json) {
          if (!json.ok) return Promise.reject(new Error(json.msg || '알 수 없는 오류'));
          return json;
        });
      });
  }

  function get(action, data) { return req(action, data, 'GET'); }
  function post(action, data) { return req(action, data, 'POST'); }

  /* ── 공개 API ────────────────────────────── */
  var RvmApi = {

    /* ─── 지역 ─────────────────────────────── */
    regionList:   function ()     { return get('region_list'); },
    regionSave:   function (data) { return post('region_save',   data); },
    regionDelete: function (id)   { return post('region_delete', { id: id }); },

    /* ─── 지점 ─────────────────────────────── */
    branchList:   function ()     { return get('branch_list'); },
    branchSave:   function (data) { return post('branch_save',   data); },
    branchDelete: function (id)   { return post('branch_delete', { id: id }); },

    /* ─── 인스턴스 ──────────────────────────── */
    instanceList:   function ()     { return get('instance_list'); },
    instanceSave:   function (data) { return post('instance_save',   data); },
    instanceDelete: function (id)   { return post('instance_delete', { id: id }); },

    /* ─── 인스턴스 설정 ─────────────────────── */
    settingsSave: function (data) { return post('settings_save', data); },

    /* ─── 단계 ─────────────────────────────── */
    stepList:      function (instanceId) { return get('step_list',    { instance_id: instanceId }); },
    stepSave:      function (data)       { return post('step_save',    data); },
    stepDelete:    function (id)         { return post('step_delete',  { id: id }); },
    stepBulkSave:  function (instanceId, steps) {
      return post('step_bulk_save', { instance_id: instanceId, steps: steps });
    },

    /* ─── 필드 ─────────────────────────────── */
    fieldList:   function (instanceId) { return get('field_list',  { instance_id: instanceId }); },
    fieldSave:   function (data)       { return post('field_save',  data); },
    fieldDelete: function (id)         { return post('field_delete', { id: id }); },

    /* ─── 인스턴스-지점 연결 ─────────────────── */
    instanceBranchList: function (instanceId) {
      return get('instance_branch_list', { instance_id: instanceId });
    },
    instanceBranchSync: function (instanceId, branchIds) {
      return post('instance_branch_sync', { instance_id: instanceId, branch_ids: branchIds });
    },

    /* ─── 지점별 항목 ───────────────────────── */
    branchItemList:   function (instanceId, branchId) {
      return get('branch_item_list', { instance_id: instanceId, branch_id: branchId });
    },
    branchItemSave:   function (data) { return post('branch_item_save',   data); },
    branchItemDelete: function (id)   { return post('branch_item_delete', { id: id }); },

    /* ─── 슬롯 (날짜/시간) ──────────────────── */
    slotList: function (instanceId, branchId, yearMonth) {
      return get('slot_list', { instance_id: instanceId, branch_id: branchId, year_month: yearMonth });
    },
    slotSave:      function (data) { return post('slot_save',        data); },
    slotDelete:    function (id)   { return post('slot_delete',       { id: id }); },
    slotBulkSave:  function (data) { return post('slot_bulk_save',    data); },
    slotCloseDate: function (data) { return post('slot_close_date',   data); },

    /* ─── 항목 정원 (item 모드) ─────────────── */
    itemQuotaList: function (instanceId, branchId, yearMonth) {
      return get('item_quota_list', { instance_id: instanceId, branch_id: branchId, year_month: yearMonth });
    },
    itemQuotaSave: function (data) { return post('item_quota_save', data); },

    /* ─── 예약 접수 목록 ────────────────────── */
    bookingList: function (params) {
      return get('booking_list', params);
    },
    bookingDetail: function (id) {
      return get('booking_detail', { id: id });
    },
    bookingStatusUpdate: function (id, status, adminNote) {
      return post('booking_status_update', { id: id, status: status, admin_note: adminNote || '' });
    },
    bookingCreateAdmin: function (data) {
      return post('booking_create_admin', data);
    },

    /* ─── 공통 에러 핸들러 헬퍼 ─────────────── */
    handleError: function (err, fallbackMsg) {
      var msg = (err && err.message) ? err.message : (fallbackMsg || '오류가 발생했습니다.');
      if (typeof window.showToast === 'function') {
        window.showToast(msg, 'error');
      } else {
        alert(msg);
      }
    },
  };

  global.RvmApi = RvmApi;

})(window);
