// ===========================
// EXCEL / CSV DOWNLOAD
// ===========================
function downloadCsv(type) {
  if (type === 'consult') {
    const allExtraKeys = [];
    (typeof consultListData !== 'undefined' ? consultListData : []).forEach(function(c) {
      try {
        JSON.parse(c.extra_fields || '[]').forEach(function(f) {
          if (!allExtraKeys.includes(f.field_name)) allExtraKeys.push(f.field_name);
        });
      } catch(e) {}
    });

    const headers = ['이름','연락처','제품분류','제품명','상담시간'].concat(allExtraKeys).concat(['추가메모','상태','신청일시','관리자메모']);
    const rows = (typeof consultListData !== 'undefined' ? consultListData : []).map(function(c) {
      const status = c.status==='pending'?'접수':c.status==='confirmed'?'확인':c.status==='cancelled'?'취소':'완료';
      let extras = {};
      try { JSON.parse(c.extra_fields||'[]').forEach(function(f){ extras[f.field_name]=f.value||''; }); } catch(e){}
      const extraVals = allExtraKeys.map(function(k){ return extras[k]||''; });
      return [c.name||'', c.phone||'', c.cat_name||'', c.product||'', c.desired_time||'']
        .concat(extraVals)
        .concat([c.user_memo||'', status, c.created_at||'', c.admin_memo||'']);
    });
    _exportCsv('상담내역', headers, rows);
    return;
  }

  const configs = {
    reserve: {
      filename: '예약내역',
      headers: ['예약번호','예약일','시간','매장','항목','예약자명','연락처','이메일','추가메모','관리자메모','상태','등록일'],
      rows: (typeof reserveListData !== 'undefined' ? reserveListData : []).map(r => [
        r.id||'', r.reserve_date||'', r.reserve_time||'', r.store_name||'', r.reserve_item||'',
        r.name||'', r.phone||'', r.email||'', r.memo||'', r.admin_memo||'',
        r.status==='pending'?'접수':r.status==='confirmed'?'확인':r.status==='cancelled'?'취소':'완료',
        r.created_at||''
      ])
    },
    inquiry: {
      filename: '문의내역',
      headers: ['분류','이름','연락처','이메일','내용','상태','공개여부','신청일시','수정일시','답변','답변일시'],
      rows: (typeof inquiryListData !== 'undefined' ? inquiryListData : []).map(r => [
        r.cat_name||'', r.name||'', r.phone||'', r.email||'', r.content||'',
        r.status==='pending'?'접수':r.status==='confirmed'?'확인':r.status==='cancelled'?'취소':'완료',
        r.is_public?'공개':'비공개', r.created_at||'', r.updated_at||'', r.answer||'', r.answer_at||''
      ])
    }
  };

  const cfg = configs[type];
  if (!cfg) return;
  _exportCsv(cfg.filename, cfg.headers, cfg.rows);
}

function _exportCsv(filename, headers, rows) {
  let csv = '\uFEFF' + headers.join(',') + '\n';
  rows.forEach(r => { csv += r.map(v => `"${(v||'').toString().replace(/"/g,'""')}"`).join(',') + '\n'; });
  const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename + '_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('엑셀 다운로드가 시작됩니다.', 'success');
}