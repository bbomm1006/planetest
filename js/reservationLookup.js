/* ════════════════════════════════════════════════
    RESERVATION LOOKUP — 예약 조회/변경 JS
  ════════════════════════════════════════════════ */

  var _lkpTab=1, _lkpData=[];
  var _RSV_API='/admin/api_front/reserve_public.php';

  function lkpSwitchTab(n){
    _lkpTab=n;
    document.getElementById('lkpTab1').classList.toggle('on',n===1);
    document.getElementById('lkpTab2').classList.toggle('on',n===2);
    document.getElementById('lkpFormA').style.display=n===1?'':'none';
    document.getElementById('lkpFormB').style.display=n===2?'':'none';
    document.getElementById('lkpResult').innerHTML='';
  }
  function lkpFmtPhone(inp){
    var v=(inp.value||'').replace(/\D/g,'');
    if(v.length>3&&v.length<=7) v=v.slice(0,3)+'-'+v.slice(3);
    else if(v.length>7) v=v.slice(0,3)+'-'+v.slice(3,7)+'-'+v.slice(7,11);
    inp.value=v;
  }
  function lkpEsc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function lkpSearch(){
    var resultEl=document.getElementById('lkpResult');
    resultEl.innerHTML='<div class="lkp-empty"><div class="rsv-spinner" style="display:inline-block;margin-right:8px;"></div>조회 중...</div>';
    var url;
    if(_lkpTab===1){
      var name=(document.getElementById('lkpName').value||'').trim();
      var phone=(document.getElementById('lkpPhone').value||'').trim();
      if(!name||!phone){ alert('이름과 연락처를 모두 입력해주세요.'); resultEl.innerHTML=''; return; }
      url=_RSV_API+'?action=lookup&name='+encodeURIComponent(name)+'&phone='+encodeURIComponent(phone);
    } else {
      var resId=(document.getElementById('lkpResId').value||'').trim();
      if(!resId){ alert('예약번호를 입력해주세요.'); resultEl.innerHTML=''; return; }
      url=_RSV_API+'?action=lookup&res_number='+encodeURIComponent(resId);
    }
    fetch(url)
      .then(function(r){return r.json();})
      .then(function(res){
        if(!res.ok){ resultEl.innerHTML='<div class="lkp-empty">조회 중 오류가 발생했습니다.</div>'; return; }
        var list=res.data||(res.item?[res.item]:[]);
        _lkpData=list; lkpRender(list);
      })
      .catch(function(){ resultEl.innerHTML='<div class="lkp-empty">조회 중 오류가 발생했습니다.</div>'; });
  }

  function lkpRender(list){
    var resultEl=document.getElementById('lkpResult');
    if(!list.length){ resultEl.innerHTML='<div class="lkp-empty">조회된 예약이 없습니다.<br><small style="color:var(--g4)">이름, 연락처를 정확히 입력하셨는지 확인해주세요.</small></div>'; return; }
    var html='<div style="font-size:.8rem;color:var(--g5);margin-bottom:12px;">총 '+list.length+'건 조회되었습니다.</div>';
    list.forEach(function(r,idx){
      var badgeCls='lkp-badge lkp-badge-'+(r.status||'접수');
      var dt=new Date((r.reserve_date||'')+'T00:00:00');
      var dows=['일','월','화','수','목','금','토'];
      var dateLabel=r.reserve_date?r.reserve_date.replace(/-/g,'.')+(isNaN(dt)?'':'('+dows[dt.getDay()]+'요일)'):'-';
      var timeLabel=r.reserve_time||'';
      var nowTs=Date.now(), isPast=false;
      if(r.reserve_date){
        if(timeLabel) isPast=nowTs>=new Date(r.reserve_date+'T'+timeLabel+':00').getTime();
        else isPast=r.reserve_date<=getKSTDateStr();
      }
      var canModify=(r.status==='접수')&&!isPast;
      var lockReason='';
      if(r.status==='확인') lockReason='관리자 확인 완료 — 변경 · 취소 불가';
      else if(r.status==='완료') lockReason='완료된 예약 — 변경 · 취소 불가';
      else if(r.status==='취소') lockReason='취소된 예약';
      else if(isPast) lockReason='예약 시간이 지난 예약 — 변경 · 취소 불가';

      html+='<div class="lkp-card" id="lkpCard'+idx+'">';
      html+='<div class="lkp-card-head"><span class="lkp-card-id">'+(r.res_number?lkpEsc(r.res_number):'#'+r.id)+'</span>';
      html+='<span class="'+badgeCls+'">'+lkpEsc(r.status||'접수')+'</span></div>';
      html+='<div class="lkp-rows">';
      if(r.res_number) html+='<div class="lkp-row"><span class="lkp-row-key">예약번호</span><span class="lkp-row-val" style="font-weight:800;color:var(--blue);">'+lkpEsc(r.res_number)+'</span></div>';
      html+='<div class="lkp-row"><span class="lkp-row-key">예약일</span><span class="lkp-row-val">'+lkpEsc(dateLabel)+'</span></div>';
      if(timeLabel) html+='<div class="lkp-row"><span class="lkp-row-key">예약시간</span><span class="lkp-row-val">'+lkpEsc(timeLabel)+'</span></div>';
      html+='<div class="lkp-row"><span class="lkp-row-key">지점</span><span class="lkp-row-val">'+lkpEsc(r.branch_name||'-')+'</span></div>';
      html+='<div class="lkp-row"><span class="lkp-row-key">예약항목</span><span class="lkp-row-val">'+lkpEsc(r.reserve_item||'-')+'</span></div>';
      html+='<div class="lkp-row"><span class="lkp-row-key">예약자</span><span class="lkp-row-val">'+lkpEsc(r.name||'-')+'</span></div>';
      html+='<div class="lkp-row"><span class="lkp-row-key">연락처</span><span class="lkp-row-val">'+lkpEsc(r.phone||'-')+'</span></div>';
      if(r.message) html+='<div class="lkp-row"><span class="lkp-row-key">요청사항</span><span class="lkp-row-val" style="word-break:break-all;">'+lkpEsc(r.message)+'</span></div>';
      html+='</div>';

      if(canModify){
        html+='<div class="lkp-actions">';
        html+='<button class="lkp-btn-change" onclick="lkpToggleDateChange('+idx+','+r.id+',\''+lkpEsc(r.reserve_date||'')+'\','+r.branch_id+','+r.item_id+',\''+lkpEsc(r.reserve_time||'')+'\')">날짜·시간 변경</button>';
        html+='<button class="lkp-btn-cancel" onclick="lkpCancel('+r.id+','+idx+')">예약 취소</button>';
        html+='</div>';
        html+='<div class="lkp-datechg" id="lkpDateChg'+idx+'" style="display:none;">';
        html+='<div class="lkp-datechg-title">📅 날짜 · 시간 변경</div>';
        html+='<div id="lkpCalWrap'+idx+'" style="margin-bottom:8px;"></div>';
        html+='</div>';
      } else if(lockReason){
        html+='<div class="lkp-lock-msg">'+lkpEsc(lockReason)+'</div>';
      }
      html+='</div>';
    });
    resultEl.innerHTML=html;
  }

  var _lkpCalState={};

  function lkpToggleDateChange(idx,rid,currentDate,branchId,itemId,currentTime){
    var box=document.getElementById('lkpDateChg'+idx);
    if(!box) return;
    if(box.style.display!=='none'){ box.style.display='none'; return; }
    box.style.display='';
    var _kstNow=new Date(Date.now()+9*60*60*1000);
    _lkpCalState[idx]={
      year:currentDate?parseInt(currentDate.slice(0,4)):_kstNow.getUTCFullYear(),
      month:currentDate?parseInt(currentDate.slice(5,7)):_kstNow.getUTCMonth()+1,
      rid:rid,branchId:branchId,itemId:itemId,
      selectedDate:currentDate||'',originalDate:currentDate||'',
      selectedTime:currentTime||'',originalTime:currentTime||''
    };
    lkpRenderChangeCal(idx);
  }

  function lkpCalChgNav(idx,dir){
    var s=_lkpCalState[idx]; if(!s) return;
    var _kstNow=new Date(Date.now()+9*60*60*1000);
    if(dir===-1&&s.year===_kstNow.getUTCFullYear()&&s.month===(_kstNow.getUTCMonth()+1)) return;
    s.month+=dir;
    if(s.month>12){s.month=1;s.year++;} if(s.month<1){s.month=12;s.year--;}
    lkpRenderChangeCal(idx);
  }

  function lkpRenderChangeCal(idx){
    var wrap=document.getElementById('lkpCalWrap'+idx); if(!wrap) return;
    var s=_lkpCalState[idx]; if(!s) return;
    wrap.innerHTML='<div style="text-align:center;padding:12px 0;color:var(--g4);font-size:.8rem;"><div class="rsv-spinner" style="display:inline-block;margin-right:6px;width:16px;height:16px;"></div>날짜를 불러오는 중...</div>';
    fetch(_RSV_API+'?action=availability&branch_id='+s.branchId+'&item_id='+s.itemId+'&year='+s.year+'&month='+s.month)
      .then(function(r){return r.json();})
      .then(function(res){
        var availMap={};
        (res.data||[]).forEach(function(d){availMap[d.avail_date]=d;});
        lkpBuildChangeCal(idx,availMap);
      })
      .catch(function(){lkpBuildChangeCal(idx,{});});
  }

  function lkpBuildChangeCal(idx,availMap){
    var wrap=document.getElementById('lkpCalWrap'+idx); if(!wrap) return;
    var s=_lkpCalState[idx]; if(!s) return;
    var today=getKSTDateStr();
    var firstDow=new Date(s.year,s.month-1,1).getDay();
    var lastDay=new Date(s.year,s.month,0).getDate();
    var _kstNow=new Date(Date.now()+9*60*60*1000);
    var isCurMon=(s.year===_kstNow.getUTCFullYear()&&s.month===(_kstNow.getUTCMonth()+1));
    var html='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">'
      +'<button onclick="lkpCalChgNav('+idx+',-1)"'+(isCurMon?' disabled':'')+' style="background:none;border:1.5px solid var(--g2);border-radius:6px;padding:4px 10px;cursor:pointer;font-size:.9rem;color:var(--g5);'+(isCurMon?'opacity:.3;cursor:default;':'')+'">‹</button>'
      +'<span style="font-weight:800;font-size:.88rem;color:var(--ink);">'+s.year+'년 '+s.month+'월</span>'
      +'<button onclick="lkpCalChgNav('+idx+',1)" style="background:none;border:1.5px solid var(--g2);border-radius:6px;padding:4px 10px;cursor:pointer;font-size:.9rem;color:var(--g5);">›</button></div>';
    html+='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:4px;">';
    ['일','월','화','수','목','금','토'].forEach(function(d,i){ html+='<div style="text-align:center;font-size:.65rem;font-weight:800;color:'+(i===0?'var(--red)':i===6?'#5ab0f5':'var(--g4)')+';">'+d+'</div>'; });
    html+='</div><div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;">';
    for(var i=0;i<firstDow;i++) html+='<div></div>';
    for(var d=1;d<=lastDay;d++){
      var dateStr=s.year+'-'+String(s.month).padStart(2,'0')+'-'+String(d).padStart(2,'0');
      var dow=new Date(s.year,s.month-1,d).getDay();
      var isPast=dateStr<today, isToday=dateStr===today;
      var isSel=dateStr===s.selectedDate, isOrig=dateStr===s.originalDate;
      var av=availMap[dateStr];
      var canSel=false, bg='#fff', border='1.5px solid var(--g2)';
      var color=dow===0?'var(--red)':dow===6?'#5ab0f5':'var(--g7)', badge='';
      if(isPast||isToday){ bg='var(--g1)'; color='var(--g3)'; if(isToday) badge='<div style="font-size:.52rem;font-weight:700;color:#92400e;line-height:1;">당일</div>'; }
      else if(isOrig){ canSel=true; bg='#eff6ff'; color=dow===0?'#be185d':dow===6?'#1d4ed8':'var(--blue)'; badge='<div style="font-size:.47rem;font-weight:700;color:var(--blue);line-height:1;">현재</div>'; }
      else if(!av){ bg='#fff'; color='var(--g3)'; }
      else if(av.is_closed=='1'||av.is_closed===1){ bg='#fee2e2'; color='#fca5a5'; badge='<div style="font-size:.52rem;font-weight:700;color:#dc2626;line-height:1;">불가</div>'; }
      else if(av.is_full=='1'||av.is_full===1){ bg='#fef9c3'; color='#92400e'; badge='<div style="font-size:.52rem;font-weight:700;color:#b45309;line-height:1;">마감</div>'; }
      else { canSel=true; bg='#d1fae5'; color=dow===0?'#be185d':dow===6?'#1d4ed8':'#065f46'; badge='<div style="font-size:.52rem;font-weight:700;color:#047857;line-height:1;">가능</div>'; }
      if(isSel&&canSel) border='2px solid var(--blue)';
      html+='<div onclick="'+(isToday?'alert(\'당일 예약은 어렵습니다.\\n내일 이후 날짜를 선택해주세요.\')':canSel?'lkpCalChgSelect('+idx+',\''+dateStr+'\')':'')+'"'
        +' style="border:'+border+';border-radius:5px;padding:4px 2px;min-height:42px;background:'+bg+';display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;cursor:'+(isToday||canSel?'pointer':'default')+';user-select:none;">'
        +'<div style="font-size:.72rem;font-weight:700;color:'+color+';">'+d+'</div>'+badge+'</div>';
    }
    html+='</div>';
    if(s.selectedDate){
      var selDt=new Date(s.selectedDate+'T00:00:00');
      var dows2=['일','월','화','수','목','금','토'];
      var isSameDate=(s.selectedDate===s.originalDate);
      html+='<div style="margin-top:10px;padding:10px 12px;background:#eff6ff;border-radius:8px;border:1.5px solid #bfdbfe;">'
        +'<div style="font-size:.8rem;font-weight:700;color:var(--blue);margin-bottom:8px;">✓ '+s.selectedDate.replace(/-/g,'.')+' ('+dows2[selDt.getDay()]+')'
        +(isSameDate?' <span style="font-size:.7rem;font-weight:400;color:var(--g5);">(현재 예약일)</span>':'')+'</div>'
        +'<div id="lkpTimeSlotWrap'+idx+'"></div>'
        +'<button onclick="lkpCalChgConfirm('+idx+')" style="margin-top:8px;width:100%;padding:9px;border-radius:8px;border:none;background:var(--blue);color:#fff;font-family:inherit;font-weight:800;font-size:.78rem;cursor:pointer;">변경 확인</button></div>';
    }
    wrap.innerHTML=html;
    if(s.selectedDate) lkpLoadTimeSlots(idx,s.selectedDate);
  }

  function lkpLoadTimeSlots(idx,dateStr){
    var s=_lkpCalState[idx]; if(!s) return;
    var tw=document.getElementById('lkpTimeSlotWrap'+idx); if(!tw) return;
    tw.innerHTML='<div style="font-size:.72rem;color:var(--g4);">시간 정보를 불러오는 중...</div>';
    fetch(_RSV_API+'?action=availability&branch_id='+s.branchId+'&item_id='+s.itemId+'&date='+dateStr+'&slots=1')
      .then(function(r){return r.json();})
      .then(function(res){
        var slots=res.data||[];
        if(!slots.length){ lkpRenderTimeSlots(idx,[],null,null); return; }
        lkpRenderTimeSlots(idx,slots,null,null);
      })
      .catch(function(){lkpRenderTimeSlots(idx,[],null,null);});
  }

  function lkpRenderTimeSlots(idx,slots,startH,endH){
    var s=_lkpCalState[idx], tw=document.getElementById('lkpTimeSlotWrap'+idx);
    if(!s||!tw) return;
    if(slots.length>0){
      var html='<div style="font-size:.72rem;font-weight:700;color:var(--g5);margin-bottom:5px;">시간 선택 <span style="font-weight:400;">(선택사항)</span></div><div style="display:flex;flex-wrap:wrap;gap:6px;">';
      slots.forEach(function(sl){
        var isClosed=sl.is_closed=='1'||sl.is_closed===1;
        var booked=parseInt(sl.booked_count)||0, cap=parseInt(sl.max_capacity)||0;
        var isFull=!isClosed&&booked>=cap, disabled=isClosed||isFull;
        var isSel=(s.selectedTime===sl.avail_time);
        html+='<button type="button" onclick="'+(disabled?'void(0)':'lkpSelectTime('+idx+',\''+sl.avail_time+'\')')+'" '
          +'style="padding:7px 14px;border-radius:8px;border:2px solid '+(isSel?'var(--blue)':'var(--g2)')+';background:'+(isSel?'var(--blue)':disabled?'var(--off)':'#fff')+';color:'+(isSel?'#fff':disabled?'var(--g3)':'var(--ink3)')+';font-size:.78rem;font-weight:700;cursor:'+(disabled?'default':'pointer')+';font-family:inherit;">'
          +lkpEsc(sl.avail_time)+(isClosed?' (불가)':isFull?' (마감)':'')+'</button>';
      });
      html+='</div>'; tw.innerHTML=html;
    } else {
      tw.innerHTML='<div style="font-size:.72rem;color:var(--g4);">시간 설정 없음 — 날짜만 변경됩니다.</div>';
      s.selectedTime='';
    }
  }

  function lkpSelectTime(idx,val){
    var s=_lkpCalState[idx]; if(!s) return;
    s.selectedTime=(s.selectedTime===val)?'':val;
    var tw=document.getElementById('lkpTimeSlotWrap'+idx); if(!tw) return;
    tw.querySelectorAll('button[type="button"]').forEach(function(btn){
      var m=(btn.getAttribute('onclick')||'').match(/lkpSelectTime\(\d+,'([^']+)'\)/);
      if(!m) return;
      var isSel=(s.selectedTime===m[1]);
      btn.style.borderColor=isSel?'var(--blue)':'var(--g2)';
      btn.style.background=isSel?'var(--blue)':'#fff';
      btn.style.color=isSel?'#fff':'var(--ink3)';
    });
  }

  function lkpCalChgSelect(idx,dateStr){
    var s=_lkpCalState[idx]; if(!s) return;
    s.selectedDate=dateStr; s.selectedTime='';
    lkpRenderChangeCal(idx);
  }

  function lkpCalChgConfirm(idx){
    var s=_lkpCalState[idx];
    if(!s||!s.selectedDate){ alert('날짜를 선택해주세요.'); return; }
    var newDate=s.selectedDate, newTime=s.selectedTime||'', today=getKSTDateStr();
    if(newDate<=today){ alert('당일 및 이전 날짜는 선택할 수 없습니다.\n내일 이후 날짜를 선택해주세요.'); return; }
    if(newDate===s.originalDate&&newTime===(s.originalTime||'')){ alert('변경된 내용이 없습니다.\n다른 날짜 또는 시간을 선택해주세요.'); return; }
    if(!confirm(newDate+(newTime?' '+newTime:'')+'으로 예약를 변경하시겠습니까?')) return;
    var payload={new_date:newDate,user_action:true};
    if(newTime) payload.new_time=newTime;
    fetch(_RSV_API+'?action=update&id='+s.rid,{
      method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
    })
    .then(function(r){return r.json();})
    .then(function(res){
      if(res.ok){ alert('예약이 '+newDate+(newTime?' '+newTime:'')+'으로 변경되었습니다.'); lkpSearch(); }
      else{ alert(res.admin_confirmed?'관리자가 확인 처리한 예약은 변경하실 수 없습니다.\n고객센터로 문의해주세요.':(res.error||'변경에 실패했습니다.')); lkpSearch(); }
    })
    .catch(function(){ alert('변경 중 오류가 발생했습니다.'); });
  }

  function lkpCancel(rid,idx){
    if(!confirm('예약을 취소하시겠습니까?\n취소 후에는 복구할 수 없습니다.')) return;
    fetch(_RSV_API+'?action=update&id='+rid,{
      method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({status:'취소',user_action:true})
    })
    .then(function(r){return r.json();})
    .then(function(res){
      if(res.ok){ alert('예약이 취소되었습니다.'); lkpSearch(); }
      else{ alert(res.admin_confirmed?'관리자가 확인 처리한 예약은 취소하실 수 없습니다.\n고객센터로 문의해주세요.':(res.error||'취소 처리에 실패했습니다.')); lkpSearch(); }
    })
    .catch(function(){ alert('취소 처리 중 오류가 발생했습니다.'); });
  }