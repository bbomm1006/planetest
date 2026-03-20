/* ════════════════════════════════════════════════
    RESERVATION SECTION — 예약하기 단락 JS
  ════════════════════════════════════════════════ */

  function getKSTDateStr() {
    var now = new Date();
    var kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    return kst.toISOString().slice(0, 10);
  }

  var _rsv = (function(){
    var _kst = new Date(Date.now() + 9*60*60*1000);
    return {
    step:1, date:'', time:'', branchId:0, branchName:'', itemId:0, itemName:'',
    calYear:_kst.getUTCFullYear(), calMonth:_kst.getUTCMonth()+1,
    availMap:{}, resSettings:null
    };
  }());

  function rsvEsc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function rsvFmtPhone(inp){
    var v=(inp.value||'').replace(/\D/g,'');
    if(v.length>3&&v.length<=7) v=v.slice(0,3)+'-'+v.slice(3);
    else if(v.length>7) v=v.slice(0,3)+'-'+v.slice(3,7)+'-'+v.slice(7,11);
    inp.value=v;
  }
  document.getElementById('rsvPhone').addEventListener('input',function(){rsvFmtPhone(this);});

  function rsvGoStep(n){
    ['rsvPanel1','rsvPanel2','rsvPanel3','rsvPanel4','rsvPanel5','rsvPanelDone'].forEach(function(id){
      var el=document.getElementById(id); if(el) el.classList.remove('on');
    });
    var targetId = (n===99) ? 'rsvPanelDone' : 'rsvPanel'+n;
    var target = document.getElementById(targetId);
    if(target) target.classList.add('on');
    _rsv.step = (n===99) ? 99 : n;
    rsvUpdateStepBar();
    if(n===1) rsvLoadBranches();
    if(n===2){ rsvBreadcrumb(2); rsvInitCalendar(); }
    if(n===3){ rsvBreadcrumb(3); rsvLoadTimeStep(); }
    if(n===4) rsvLoadItems();
    if(n===5){ rsvBuildSummary();
      _rsvPhoneVerified=false; _rsvVerifyCode='';
      if(_rsvVerifyTimer){clearInterval(_rsvVerifyTimer);_rsvVerifyTimer=null;}
      ['rsvVerifyBox'].forEach(function(id){ var e=document.getElementById(id); if(e) e.classList.remove('show'); });
      var tm2=document.getElementById('rsvPhoneTimer'); if(tm2){tm2.style.display='none';tm2.textContent='';}
      var st2=document.getElementById('rsvPhoneStatus'); if(st2){st2.className='rsv-phone-status';st2.textContent='';}
      var badge2=document.getElementById('rsvPhoneVerifiedBadge'); if(badge2)badge2.style.display='none';
      var sb2=document.getElementById('rsvSendCodeBtn'); if(sb2){sb2.disabled=false;sb2.textContent='인증번호 받기';}
      var vc2=document.getElementById('rsvVerifyCode'); if(vc2)vc2.value='';
      var ph2=document.getElementById('rsvPhone'); if(ph2)ph2.value='';
    }
    var sec=document.getElementById('reservation');
    if(sec&&_rsvReady) setTimeout(function(){ sec.scrollIntoView({behavior:'smooth',block:'start'}); },60);
  }

  function rsvUpdateStepBar(){
    var n=_rsv.step;
    var checkSVG='<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M5 12l5 5L20 7" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/></svg>';
    [1,2,3,4,5].forEach(function(s){
      var dot=document.getElementById('rsvStepDot'+s);
      var line=document.getElementById('rsvLine'+s);
      if(!dot) return;
      dot.classList.remove('done','active');
      var isDone=(n===99)||(s<n), isActive=(n!==99)&&(s===n);
      if(isDone) dot.classList.add('done');
      if(isActive) dot.classList.add('active');
      var circle=dot.querySelector('.rsv-step-circle');
      if(circle) circle.innerHTML=isDone?checkSVG:s;
      if(line) line.classList.toggle('done',isDone);
    });
  }

  function rsvBreadcrumb(step){
    var parts=[];
    if(step>=1&&_rsv.branchName) parts.push({label:_rsv.branchName});
    if(step>=2&&_rsv.date){
      var dt=new Date(_rsv.date+'T00:00:00');
      var dows=['일','월','화','수','목','금','토'];
      parts.push({label:_rsv.date.replace(/-/g,'.')+'('+dows[dt.getDay()]+')'});
    }
    if(step>=3&&_rsv.time) parts.push({label:_rsv.time});
    if(step>=4&&_rsv.itemName) parts.push({label:_rsv.itemName});
    var html='';
    parts.forEach(function(p,i){
      if(i>0) html+='<span class="rsv-bc-sep">›</span>';
      html+='<span class="rsv-bc-item">'+rsvEsc(p.label)+'</span>';
    });
    var el=document.getElementById('rsvBc'+step);
    if(el){ el.innerHTML=html; el.style.display=html?'flex':'none'; }
  }

  var _rsvAllBranches=[], _rsvSidoMap={};

  function rsvLoadBranches(){
    var el=document.getElementById('rsvBranchList');
    if(!el) return;
    el.innerHTML='<div class="rsv-loading"><div class="rsv-spinner"></div>불러오는 중...</div>';
    fetch('/admin/api_front/reserve_public.php?action=branches')
      .then(function(r){return r.json();})
      .then(function(res){
        _rsvAllBranches=(res.data||[]).filter(function(b){return b&&b.id;});
        if(!_rsvAllBranches.length){ el.innerHTML='<p style="color:var(--g4);padding:20px 0;">등록된 지점이 없습니다.</p>'; return; }
        _rsvSidoMap={};
        var hasRegion=false;
        _rsvAllBranches.forEach(function(b){
          var r=(b.region||'').trim();
          if(!r) return;
          hasRegion=true;
          var parts=r.split(/\s+/);
          var sido=(parts[0]||r).trim();
          var gu=parts.slice(1).join(' ').trim();
          if(!_rsvSidoMap[sido]) _rsvSidoMap[sido]={};
          if(!_rsvSidoMap[sido][gu]) _rsvSidoMap[sido][gu]=[];
          _rsvSidoMap[sido][gu].push(b);
        });
        var sdEl=document.getElementById('rsvSido'), sgEl=document.getElementById('rsvSigungu');
        var dropWrap=document.getElementById('rsvRegionFilter');
        if(hasRegion){
          var sidos=Object.keys(_rsvSidoMap).sort();
          if(sdEl) sdEl.innerHTML='<option value="">시/도 전체</option>'+sidos.map(function(s){return '<option value="'+rsvEsc(s)+'">'+rsvEsc(s)+'</option>';}).join('');
          if(sgEl) sgEl.innerHTML='<option value="">시/군/구 전체</option>';
          if(dropWrap) dropWrap.style.display='flex';
        } else {
          if(dropWrap) dropWrap.style.display='none';
        }
        rsvRenderBranchCards(_rsvAllBranches);
      })
      .catch(function(){ document.getElementById('rsvBranchList').innerHTML='<p style="color:var(--red);padding:20px 0;">지점 정보를 불러오지 못했습니다.</p>'; });
  }

  function rsvOnSidoChange(){
    var sido=(document.getElementById('rsvSido').value||'').trim();
    var sgEl=document.getElementById('rsvSigungu');
    if(!sgEl) return;
    if(!sido){ sgEl.innerHTML='<option value="">시/군/구 전체</option>'; rsvRenderBranchCards(_rsvAllBranches); return; }
    var guMap=(_rsvSidoMap&&_rsvSidoMap[sido])?_rsvSidoMap[sido]:{};
    var gus=Object.keys(guMap).filter(function(g){return g!=='';}).sort();
    sgEl.innerHTML='<option value="">시/군/구 전체</option>'+gus.map(function(g){return '<option value="'+rsvEsc(g)+'">'+rsvEsc(g)+'</option>';}).join('');
    var allInSido=[];
    Object.keys(guMap).forEach(function(k){ if(Array.isArray(guMap[k])) allInSido=allInSido.concat(guMap[k]); });
    rsvRenderBranchCards(allInSido.length?allInSido:_rsvAllBranches.filter(function(b){return (b.region||'').trim().split(/\s+/)[0]===sido;}));
  }

  function rsvOnSigunguChange(){
    var sido=(document.getElementById('rsvSido').value||'').trim();
    var sigungu=(document.getElementById('rsvSigungu').value||'').trim();
    if(!sido){ rsvRenderBranchCards(_rsvAllBranches); return; }
    var guMap=(_rsvSidoMap&&_rsvSidoMap[sido])?_rsvSidoMap[sido]:{};
    if(!sigungu){
      var allInSido=[];
      Object.keys(guMap).forEach(function(k){ if(Array.isArray(guMap[k])) allInSido=allInSido.concat(guMap[k]); });
      rsvRenderBranchCards(allInSido.length?allInSido:_rsvAllBranches.filter(function(b){return (b.region||'').trim().split(/\s+/)[0]===sido;}));
    } else {
      var result=(guMap[sigungu]&&Array.isArray(guMap[sigungu]))?guMap[sigungu]:[];
      if(!result.length) result=_rsvAllBranches.filter(function(b){ var r=(b.region||'').trim(); var p=r.split(/\s+/); return p[0]===sido&&p.slice(1).join(' ')===sigungu; });
      rsvRenderBranchCards(result);
    }
  }

  function rsvRenderBranchCards(branches){
    var el=document.getElementById('rsvBranchList');
    if(!el) return;
    if(!branches||!branches.length){
      el.innerHTML='<p style="color:var(--g4);padding:20px 0;">해당 지역에 등록된 지점이 없습니다.</p>';
      document.getElementById('rsvBtnNext1').disabled=true; return;
    }
    el.innerHTML=branches.map(function(b){
      var sel=(b.id==_rsv.branchId);
      return '<div class="rsv-card'+(sel?' selected':'')+'" onclick="rsvSelectBranchById('+b.id+')" data-bid="'+b.id+'">'
        +'<div class="rsv-card-check"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7"/></svg></div>'
        +'<div class="rsv-card-name">'+rsvEsc(b.name)+'</div>'
        +(b.description?'<div class="rsv-card-desc">'+rsvEsc(b.description)+'</div>':'')
        +'</div>';
    }).join('');
    document.getElementById('rsvBtnNext1').disabled=!_rsv.branchId;
  }

  function rsvSelectBranchById(id){
    var b=(_rsvAllBranches||[]).find(function(x){return x.id==id;});
    rsvSelectBranch(id,b?b.name:'');
  }
  function rsvSelectBranch(id,name){
    _rsv.branchId=id; _rsv.branchName=name;
    _rsv.date=''; _rsv.time=''; _rsv.itemId=0; _rsv.itemName='';
    _rsv.availMap={}; _rsv.resSettings=null;
    document.querySelectorAll('#rsvBranchList .rsv-card').forEach(function(c){
      c.classList.toggle('selected',+c.dataset.bid===id);
    });
    document.getElementById('rsvBtnNext1').disabled=false;
  }

  function rsvInitCalendar(){
    var title=document.getElementById('rsvCalTitle');
    if(title) title.textContent=_rsv.calYear+'년 '+_rsv.calMonth+'월';
    _rsvUpdateCalNavBtn();
    rsvLoadMonthAvail();
  }
  function rsvCalNav(dir){
    var _kstNow=new Date(Date.now()+9*60*60*1000);
    var curY=_kstNow.getUTCFullYear(), curM=_kstNow.getUTCMonth()+1;
    // 이전 달: 현재 달이면 이동 불가
    if(dir===-1&&_rsv.calYear===curY&&_rsv.calMonth===curM) return;
    _rsv.calMonth+=dir;
    if(_rsv.calMonth>12){_rsv.calMonth=1;_rsv.calYear++;}
    if(_rsv.calMonth<1){_rsv.calMonth=12;_rsv.calYear--;}
    var title=document.getElementById('rsvCalTitle');
    if(title) title.textContent=_rsv.calYear+'년 '+_rsv.calMonth+'월';
    _rsvUpdateCalNavBtn(); rsvLoadMonthAvail();
  }
  function _rsvUpdateCalNavBtn(){
    var _kstNow=new Date(Date.now()+9*60*60*1000);
    var curY=_kstNow.getUTCFullYear(), curM=_kstNow.getUTCMonth()+1;
    // 혹시라도 현재 달보다 이전으로 넘어갔으면 현재 달로 보정
    if(_rsv.calYear<curY||(_rsv.calYear===curY&&_rsv.calMonth<curM)){
      _rsv.calYear=curY; _rsv.calMonth=curM;
      var title=document.getElementById('rsvCalTitle');
      if(title) title.textContent=_rsv.calYear+'년 '+_rsv.calMonth+'월';
    }
    var isCur=(_rsv.calYear===curY&&_rsv.calMonth===curM);
    var prevBtn=document.querySelector('#rsvPanel2 .rsv-cal-nav-btn:first-child');
    if(prevBtn){
      prevBtn.disabled=isCur;
      prevBtn.style.opacity=isCur?'0.25':'1';
      prevBtn.style.cursor=isCur?'not-allowed':'pointer';
      prevBtn.style.pointerEvents=isCur?'none':'';
    }
  }
  function rsvGoToday(){
    var _kstNow=new Date(Date.now()+9*60*60*1000);
    _rsv.calYear=_kstNow.getUTCFullYear(); _rsv.calMonth=_kstNow.getUTCMonth()+1;
    var title=document.getElementById('rsvCalTitle');
    if(title) title.textContent=_rsv.calYear+'년 '+_rsv.calMonth+'월';
    rsvLoadMonthAvail();
  }

  function rsvLoadMonthAvail(){
    var grid=document.getElementById('rsvCalGrid');
    if(!grid) return;
    grid.innerHTML='<div class="rsv-loading" style="grid-column:1/-1"><div class="rsv-spinner"></div>날짜 정보를 불러오는 중...</div>';
    if(!_rsv.branchId){ _rsv.availMap={}; rsvBuildDateGrid(); return; }
    _rsv.availMap={};
    fetch('/admin/api_front/reserve_public.php?action=items&branch_id='+_rsv.branchId)
      .then(function(r){return r.json();})
      .then(function(ir){
        var items=ir.data||[];
        if(!items.length){ rsvBuildDateGrid(); return Promise.resolve(); }
        var promises=items.map(function(it){
          return fetch('/admin/api_front/reserve_public.php?action=availability&branch_id='+_rsv.branchId+'&item_id='+it.id+'&year='+_rsv.calYear+'&month='+_rsv.calMonth)
            .then(function(r){return r.json();})
            .then(function(av){
              (av.data||[]).forEach(function(d){
                var key=d.avail_date;
                if(!_rsv.availMap[key]) _rsv.availMap[key]={avail_date:key,is_closed:1,is_full:1,max_capacity:0,booked_count:0,remain:0};
                var cur=_rsv.availMap[key];
                if(!(d.is_closed=='1'||d.is_closed===1)){
                  var booked=parseInt(d.booked_count)||0, maxCap=parseInt(d.max_capacity)||0;
                  var remain=Math.max(0,maxCap-booked);
                  var full=(maxCap===0)||(booked>=maxCap)||(d.is_full=='1'||d.is_full===1);
                  if(!full){ cur.is_closed=0; cur.is_full=0; cur.max_capacity+=maxCap; cur.booked_count+=booked; cur.remain+=remain; }
                  else if(cur.is_closed===1){ cur.is_closed=0; cur.is_full=1; }
                }
              });
            }).catch(function(){});
        });
        return Promise.all(promises);
      })
      .then(function(){rsvBuildDateGrid();})
      .catch(function(){_rsv.availMap={}; rsvBuildDateGrid();});
  }

  function rsvBuildDateGrid(){
    var grid=document.getElementById('rsvCalGrid');
    var today=getKSTDateStr();
    var firstDow=new Date(_rsv.calYear,_rsv.calMonth-1,1).getDay();
    var lastDay=new Date(_rsv.calYear,_rsv.calMonth,0).getDate();
    var html='';
    for(var i=0;i<firstDow;i++) html+='<div class="rsv-day rsv-day-empty"></div>';
    for(var d=1;d<=lastDay;d++){
      var dateStr=_rsv.calYear+'-'+String(_rsv.calMonth).padStart(2,'0')+'-'+String(d).padStart(2,'0');
      var dow=new Date(_rsv.calYear,_rsv.calMonth-1,d).getDay();
      var isPast=dateStr<=today, isToday=dateStr===today, isSel=dateStr===_rsv.date;
      var av=_rsv.availMap[dateStr];
      var canSelect=false, badge='', extraCls='';
      if(isPast){ extraCls='rsv-day-disabled rsv-day-past'; if(isToday) badge='<div class="rsv-day-badge" style="background:#fef3c7;color:#92400e;font-size:.55rem;font-weight:700;padding:1px 4px;border-radius:3px;">당일</div>'; }
      else if(!av){ extraCls='rsv-day-disabled'; }
      else if(av.is_closed=='1'||av.is_closed===1){ extraCls='rsv-day-disabled'; badge='<div class="rsv-day-badge rsv-badge-closed">불가</div>'; }
      else if(av.is_full=='1'||av.is_full===1){ extraCls='rsv-day-disabled'; badge='<div class="rsv-day-badge rsv-badge-full">마감</div>'; }
      else { canSelect=true; badge='<div class="rsv-day-badge rsv-badge-avail">가능</div>'; }
      if(isToday) extraCls+=' rsv-day-today';
      if(dow===0&&!isPast) extraCls+=' rsv-day-sun';
      if(dow===6&&!isPast) extraCls+=' rsv-day-sat';
      if(isSel&&canSelect) extraCls+=' rsv-day-selected';
      var clickAttr=isToday?' onclick="rsvAlertToday()" style="cursor:pointer;"':(canSelect?' onclick="rsvSelectDate(\''+dateStr+'\')"':'');
      html+='<div class="rsv-day '+extraCls.trim()+'"'+clickAttr+'><div class="rsv-day-num">'+d+'</div>'+badge+'</div>';
    }
    grid.innerHTML=html||'<p style="grid-column:1/-1;color:var(--g4);padding:16px 0;text-align:center;">날짜 정보가 없습니다.</p>';
    document.getElementById('rsvBtnNext2').disabled=!_rsv.date;
  }

  function rsvAlertToday(){ alert("당일 예약은 어렵습니다.\n내일 이후 날짜를 선택해주세요."); }
  function rsvSelectDate(dateStr){ _rsv.date=dateStr; _rsv.itemId=0; _rsv.itemName=''; _rsv.time=''; document.getElementById('rsvBtnNext2').disabled=false; rsvBuildDateGrid(); }

  function rsvLoadTimeStep(){
    rsvBreadcrumb(3);
    var wrap=document.getElementById('rsvTimeStepWrap');
    var sub=document.getElementById('rsvTimeStepSub');
    var nextBtn=document.getElementById('rsvBtnNext3');
    if(!wrap) return;
    wrap.innerHTML='<div class="rsv-loading"><div class="rsv-spinner"></div>시간 정보를 불러오는 중...</div>';
    if(nextBtn) nextBtn.disabled=true;
    if(!_rsv.branchId||!_rsv.date){ wrap.innerHTML='<p style="color:var(--g4);padding:20px 0;">날짜를 먼저 선택해주세요.</p>'; return; }

    fetch('/admin/api_front/reserve_public.php?action=items&branch_id='+_rsv.branchId)
      .then(function(r){return r.json();})
      .then(function(ir){
        var items=ir.data||[];
        if(!items.length) return Promise.resolve([]);
        return Promise.all(items.map(function(it){
          return fetch('/admin/api_front/reserve_public.php?action=availability&branch_id='+_rsv.branchId+'&item_id='+it.id+'&date='+_rsv.date+'&slots=1')
            .then(function(r){return r.json();})
            .then(function(res){return res.data||[];})
            .catch(function(){return [];});
        }));
      })
      .then(function(allSlots){
        var merged={};
        (allSlots||[]).forEach(function(slots){
          (slots||[]).forEach(function(s){
            var t=s.avail_time; if(!t) return;
            if(!merged[t]) merged[t]={max_capacity:0,booked_count:0,is_closed:0};
            var m=merged[t];
            if(s.is_closed=='1'||s.is_closed===1) return;
            m.max_capacity+=(parseInt(s.max_capacity)||0);
            m.booked_count+=(parseInt(s.booked_count)||0);
          });
        });
        var times=Object.keys(merged).sort();
        if(times.length>0){ if(sub) sub.textContent='선택하신 날짜의 예약 가능한 시간대를 선택해 주세요.'; rsvRenderTimeSlotStep(times,merged,nextBtn); return; }

        if(_rsv.resSettings&&_rsv.resSettings._branchId===_rsv.branchId){ rsvRenderBranchTimeStep(_rsv.resSettings,sub,wrap,nextBtn); return; }
        fetch('/admin/api_front/reserve_public.php?action=branches&id='+_rsv.branchId)
          .then(function(r){return r.json();})
          .then(function(data){
            var br=(data.data||[])[0]||{};
            _rsv.resSettings={_branchId:_rsv.branchId,startHour:null,endHour:null};
            rsvRenderBranchTimeStep(_rsv.resSettings,sub,wrap,nextBtn);
          })
          .catch(function(){
            _rsv.resSettings={_branchId:_rsv.branchId,startHour:null,endHour:null};
            rsvRenderBranchTimeStep(_rsv.resSettings,sub,wrap,nextBtn);
          });
      })
      .catch(function(){ wrap.innerHTML='<p style="color:var(--red);padding:20px 0;">시간 정보를 불러오지 못했습니다.</p>'; });
  }

  function rsvRenderTimeSlotStep(times,merged,nextBtn){
    var wrap=document.getElementById('rsvTimeStepWrap');
    if(!wrap) return;
    var html='<div style="display:flex;flex-wrap:wrap;gap:10px;">';
    times.forEach(function(t){
      var m=merged[t];
      var remain=Math.max(0,(m.max_capacity||0)-(m.booked_count||0));
      var isFull=remain<=0, isSel=(_rsv.time===t);
      var hEnd=parseInt(t.slice(0,2))+1;
      var label=t+' ~ '+(hEnd<10?'0':'')+hEnd+':00';
      html+='<button type="button" onclick="'+(isFull?'':'rsvSelectTimeSlot(\''+t+'\')')+'" '
        +'style="padding:10px 18px;border-radius:10px;border:2px solid '+(isSel?'var(--blue)':'var(--g2)')+';background:'+(isSel?'var(--blue)':isFull?'var(--off)':'#fff')+';color:'+(isSel?'#fff':isFull?'var(--g3)':'var(--ink3)')+';font-size:.84rem;font-weight:700;cursor:'+(isFull?'default':'pointer')+';font-family:inherit;display:flex;flex-direction:column;align-items:center;gap:3px;"'+(isSel?' class="sel-t"':'')+'>'
        +'<span>'+rsvEsc(label)+'</span>'
        +(isFull?'<span style="font-size:.65rem;color:var(--g3);">마감</span>':'<span style="font-size:.65rem;color:'+(isSel?'rgba(255,255,255,.8)':'var(--green)')+';">잔여 '+remain+'자리</span>')
        +'</button>';
    });
    html+='</div>';
    wrap.innerHTML=html;
    if(nextBtn) nextBtn.disabled=!_rsv.time;
  }

  function rsvRenderBranchTimeStep(settings,sub,wrap,nextBtn){
    var startH=settings.startHour, endH=settings.endHour;
    if(startH===null||endH===null||startH>=endH){
      if(sub) sub.textContent='이 날짜는 시간 선택 없이 예약 가능합니다.';
      wrap.innerHTML='<div style="padding:20px;text-align:center;background:var(--mist);border-radius:12px;"><div style="font-size:.88rem;font-weight:700;color:var(--ink2);">시간 제한 없음</div></div>';
      _rsv.time=''; if(nextBtn) nextBtn.disabled=false; return;
    }
    if(sub) sub.textContent='예약 가능 시간: '+startH+':00 ~ '+endH+':00';
    var html='<div style="display:flex;flex-wrap:wrap;gap:10px;">';
    for(var h=startH;h<endH;h++){
      var val=(h<10?'0':'')+h+':00', hEnd2=h+1;
      var label=val+' ~ '+(hEnd2<10?'0':'')+hEnd2+':00';
      var isSel=(_rsv.time===val);
      html+='<button type="button" onclick="rsvSelectTimeSlot(\''+val+'\')" style="padding:10px 18px;border-radius:10px;border:2px solid '+(isSel?'var(--blue)':'var(--g2)')+';background:'+(isSel?'var(--blue)':'#fff')+';color:'+(isSel?'#fff':'var(--ink3)')+';font-size:.84rem;font-weight:700;cursor:pointer;font-family:inherit;"'+(isSel?' class="sel-t"':'')+'>'+rsvEsc(label)+'</button>';
    }
    html+='</div>';
    wrap.innerHTML=html;
    if(nextBtn) nextBtn.disabled=!_rsv.time;
  }

  function rsvSelectTimeSlot(val){ _rsv.time=val; _rsv.itemId=0; _rsv.itemName=''; rsvLoadTimeStep(); }

  function rsvLoadItems(){
    rsvBreadcrumb(4);
    var el=document.getElementById('rsvItemList');
    el.innerHTML='<div class="rsv-loading"><div class="rsv-spinner"></div>불러오는 중...</div>';
    fetch('/admin/api_front/reserve_public.php?action=items&branch_id='+_rsv.branchId)
      .then(function(r){return r.json();})
      .then(function(res){
        var items=res.data||[];
        if(!items.length){ el.innerHTML='<p style="color:var(--g4);padding:20px 0;">해당 지점에 등록된 예약 항목이 없습니다.</p>'; return; }
        var avPromises=items.map(function(it){
          return fetch('/admin/api_front/reserve_public.php?action=availability&branch_id='+_rsv.branchId+'&item_id='+it.id+'&date='+_rsv.date)
            .then(function(r){return r.json();})
            .then(function(avRes){
              var av=avRes.item;
              var canBook=av&&!(av.is_closed=='1'||av.is_closed===1)&&!(av.is_full=='1'||av.is_full===1)&&(parseInt(av.max_capacity)||0)>0&&(parseInt(av.booked_count)||0)<(parseInt(av.max_capacity)||0);
              var remain=av?Math.max(0,(parseInt(av.max_capacity)||0)-(parseInt(av.booked_count)||0)):0;
              return {item:it,canBook:canBook,remain:remain,av:av};
            })
            .catch(function(){return {item:it,canBook:false,remain:0,av:null};});
        });
        return Promise.all(avPromises);
      })
      .then(function(results){
        if(!results) return;
        var html=results.map(function(r){
          var it=r.item, sel=(it.id==_rsv.itemId);
          var statusBadge='';
          if(!r.canBook&&r.av){
            if(r.av.is_closed=='1'||r.av.is_closed===1) statusBadge='<div style="margin-top:6px;display:inline-block;background:#fee2e2;color:#991b1b;font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:5px;">예약 불가</div>';
            else statusBadge='<div style="margin-top:6px;display:inline-block;background:#fef9c3;color:#92400e;font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:5px;">예약 마감</div>';
          } else if(r.canBook&&r.remain>0&&r.remain<=3) statusBadge='<div style="margin-top:6px;display:inline-block;background:#d1fae5;color:#065f46;font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:5px;">잔여 '+r.remain+'자리</div>';
          else if(r.canBook) statusBadge='<div style="margin-top:6px;display:inline-block;background:#d1fae5;color:#065f46;font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:5px;">예약 가능</div>';
          return '<div class="rsv-card'+(sel?' selected':'')+(r.canBook?'':' rsv-card-disabled')+'" '+(r.canBook?'onclick="rsvSelectItem('+it.id+',\''+rsvEsc(it.name)+'\''+')"':'')+' data-iid="'+it.id+'">'
            +'<div class="rsv-card-check"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7"/></svg></div>'
            +'<div class="rsv-card-name">'+rsvEsc(it.name)+'</div>'
            +(it.description?'<div class="rsv-card-desc">'+rsvEsc(it.description)+'</div>':'')
            +statusBadge+'</div>';
        }).join('');
        el.innerHTML=html;
        document.getElementById('rsvBtnNext4').disabled=!_rsv.itemId;
      })
      .catch(function(){ el.innerHTML='<p style="color:var(--red);padding:20px 0;">항목 정보를 불러오지 못했습니다.</p>'; });
  }

  function rsvSelectItem(id,name){
    _rsv.itemId=id; _rsv.itemName=name;
    document.querySelectorAll('#rsvItemList .rsv-card').forEach(function(c){ c.classList.toggle('selected',+c.dataset.iid===id); });
    document.getElementById('rsvBtnNext4').disabled=false;
  }

  function rsvBuildSummary(){
    rsvBreadcrumb(5);
    var dt=new Date(_rsv.date+'T00:00:00');
    var dows=['일','월','화','수','목','금','토'];
    var dateLabel=_rsv.date.replace(/-/g,'.')+'  ('+dows[dt.getDay()]+'요일)';
    var el=document.getElementById('rsvSummary');
    if(!el) return;
    el.innerHTML='<div class="rsv-form-summary-row"><span class="rsv-form-summary-key">지점</span><span class="rsv-form-summary-val">'+rsvEsc(_rsv.branchName)+'</span></div>'
      +'<div class="rsv-form-summary-row"><span class="rsv-form-summary-key">예약 날짜</span><span class="rsv-form-summary-val">'+rsvEsc(dateLabel)+'</span></div>'
      +(_rsv.time?'<div class="rsv-form-summary-row"><span class="rsv-form-summary-key">예약 시간</span><span class="rsv-form-summary-val">'+rsvEsc(_rsv.time)+'</span></div>':'')
      +'<div class="rsv-form-summary-row"><span class="rsv-form-summary-key">예약 항목</span><span class="rsv-form-summary-val">'+rsvEsc(_rsv.itemName)+'</span></div>';
  }

  function rsvSubmit(){
    var name=(document.getElementById('rsvName').value||'').trim();
    var phone=(document.getElementById('rsvPhone').value||'').trim();
    var email=(document.getElementById('rsvEmail').value||'').trim();
    var msg=(document.getElementById('rsvMessage').value||'').trim();
    var priv=document.getElementById('rsvPriv').checked;
    if(!name){ alert('이름을 입력해주세요.'); return; }
    if(!phone){ alert('연락처를 입력해주세요.'); return; }
    if(!priv){ alert('개인정보 수집·이용에 동의해주세요.'); return; }
    var btn=document.querySelector('#rsvPanel5 .rsv-btn-next');
    if(btn){ btn.disabled=true; btn.textContent='접수 중...'; }
    var payload={branch_id:_rsv.branchId,item_id:_rsv.itemId,name:name,phone:phone,email:email,reserve_date:_rsv.date,reserve_time:_rsv.time||'',reserve_item:_rsv.itemName,message:msg};
    fetch('/admin/api_front/reserve_public.php?action=create',{
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)
    })
    .then(function(r){return r.text().then(function(text){
      var data; try{ data=JSON.parse(text); }catch(e){ if(btn){btn.disabled=false;btn.textContent='예약 신청하기 →';} throw new Error('서버 응답 오류: '+text.substring(0,200)); }
      if(!data.ok&&btn){btn.disabled=false;btn.textContent='예약 신청하기 →';}
      return data;
    });})
    .then(function(res){
      if(res.ok){
        if(btn){btn.disabled=false;btn.textContent='예약 신청하기 →';}
        var dt=new Date(_rsv.date+'T00:00:00'), dows=['일','월','화','수','목','금','토'];
        var dateLabel=_rsv.date.replace(/-/g,'.')+'  ('+dows[dt.getDay()]+'요일)';
        var remain=(typeof res.remain!=='undefined')?res.remain:null;
        var isFull=(typeof res.is_full!=='undefined')?res.is_full:false;
        var info=document.getElementById('rsvDoneInfo');
        if(info){
          var remainHtml=remain!==null?(isFull?'<div class="rsv-complete-row"><span style="color:var(--g5)">예약 현황</span><span style="font-weight:700;color:var(--red)">해당 날짜 예약 마감</span></div>':'<div class="rsv-complete-row"><span style="color:var(--g5)">남은 예약</span><span style="font-weight:700;color:var(--green)">'+remain+'자리 남음</span></div>'):'';
          var resNumHtml=res.res_number?'<div class="rsv-complete-row" style="border-bottom:1px solid var(--g2);padding-bottom:12px;margin-bottom:4px;"><span style="color:var(--g5)">예약번호</span><span style="font-weight:800;color:var(--blue);font-size:1rem;">'+rsvEsc(res.res_number)+'</span></div>':'';
          info.innerHTML=resNumHtml
            +'<div class="rsv-complete-row"><span style="color:var(--g5)">날짜</span><span style="font-weight:700">'+rsvEsc(dateLabel)+'</span></div>'
            +(_rsv.time?'<div class="rsv-complete-row"><span style="color:var(--g5)">시간</span><span style="font-weight:700">'+rsvEsc(_rsv.time)+'</span></div>':'')
            +'<div class="rsv-complete-row"><span style="color:var(--g5)">지점</span><span style="font-weight:700">'+rsvEsc(_rsv.branchName)+'</span></div>'
            +'<div class="rsv-complete-row"><span style="color:var(--g5)">항목</span><span style="font-weight:700">'+rsvEsc(_rsv.itemName)+'</span></div>'
            +'<div class="rsv-complete-row"><span style="color:var(--g5)">이름</span><span style="font-weight:700">'+rsvEsc(name)+'</span></div>'
            +'<div class="rsv-complete-row"><span style="color:var(--g5)">연락처</span><span style="font-weight:700">'+rsvEsc(phone)+'</span></div>'
            +(msg?'<div class="rsv-complete-row"><span style="color:var(--g5)">추가 메모</span><span style="font-size:.82rem;color:var(--g6);word-break:break-all;">'+rsvEsc(msg)+'</span></div>':'')
            +remainHtml;
        }
        rsvGoStep(99);
      } else {
        var errMsg=res.error||'다시 시도해주세요.';
        if(errMsg.indexOf('이미 예약')!==-1||errMsg.indexOf('동일한')!==-1) rsvShowDuplicatePopup(errMsg);
        else alert('예약 접수 중 오류가 발생했습니다: '+errMsg);
      }
    })
    .catch(function(err){ if(btn){btn.disabled=false;btn.textContent='예약 신청하기 →';} alert('예약 접수 오류:\n'+(err.message||'알 수 없는 오류')); });
  }

  function rsvShowDuplicatePopup(msg){
    var old=document.getElementById('rsvDupPopup'); if(old) old.parentNode.removeChild(old);
    var overlay=document.createElement('div');
    overlay.id='rsvDupPopup';
    overlay.style.cssText='position:fixed;inset:0;background:rgba(8,14,26,.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML='<div style="background:#fff;border-radius:20px;padding:32px 28px;max-width:400px;width:100%;text-align:center;">'
      +'<h3 style="font-size:1.05rem;font-weight:900;color:#1a2540;margin-bottom:10px;">중복 예약 안내</h3>'
      +'<p style="font-size:.86rem;color:#64748b;line-height:1.7;margin-bottom:24px;">'+rsvEsc(msg)+'<br><br>날짜를 다시 선택해 예약을 진행해 주세요.</p>'
      +'<button id="rsvDupConfirmBtn" style="width:100%;padding:13px;border-radius:11px;border:none;background:linear-gradient(90deg,#1255a6,#1e7fe8);color:#fff;font-family:inherit;font-weight:800;font-size:.92rem;cursor:pointer;">확인</button></div>';
    document.body.appendChild(overlay);
    document.getElementById('rsvDupConfirmBtn').addEventListener('click',function(){ overlay.parentNode.removeChild(overlay); rsvReset(); });
  }

  function rsvReset(){
    _rsv.step=1; _rsv.date=''; _rsv.time=''; _rsv.branchId=0; _rsv.branchName='';
    _rsv.itemId=0; _rsv.itemName=''; _rsv.availMap={}; _rsv.resSettings=null;
    _rsv.calYear=new Date().getFullYear(); _rsv.calMonth=new Date().getMonth()+1;
    var tw=document.getElementById('rsvTimeStepWrap'); if(tw) tw.innerHTML='';
    ['rsvName','rsvPhone','rsvEmail','rsvMessage'].forEach(function(id){ var e=document.getElementById(id); if(e) e.value=''; });
    var priv=document.getElementById('rsvPriv'); if(priv) priv.checked=false;
    _rsvPhoneVerified=false; _rsvVerifyCode=''; _rsvVerifyTimer=null;
    ['rsvVerifyBox'].forEach(function(id){ var e=document.getElementById(id); if(e) e.classList.remove('show'); });
    var tm=document.getElementById('rsvPhoneTimer'); if(tm){tm.style.display='none';tm.textContent='';}
    var st=document.getElementById('rsvPhoneStatus'); if(st){st.className='rsv-phone-status';st.textContent='';}
    var badge=document.getElementById('rsvPhoneVerifiedBadge'); if(badge) badge.style.display='none';
    var sendBtn=document.getElementById('rsvSendCodeBtn'); if(sendBtn){sendBtn.disabled=false;sendBtn.textContent='인증번호 받기';}
    var vc=document.getElementById('rsvVerifyCode'); if(vc) vc.value='';
    rsvGoStep(1);
  }

  var _rsvPhoneVerified=false, _rsvVerifyCode='', _rsvVerifyTimer=null, _rsvVerifyLeft=0;

  function rsvPhoneInput(el){
    if(_rsvPhoneVerified){
      _rsvPhoneVerified=false;
      var badge=document.getElementById('rsvPhoneVerifiedBadge'); if(badge) badge.style.display='none';
      var st=document.getElementById('rsvPhoneStatus'); if(st){st.className='rsv-phone-status';st.textContent='';}
      var vb=document.getElementById('rsvVerifyBox'); if(vb) vb.classList.remove('show');
      var tm=document.getElementById('rsvPhoneTimer'); if(tm) tm.style.display='none';
      var sendBtn=document.getElementById('rsvSendCodeBtn'); if(sendBtn){sendBtn.disabled=false;sendBtn.textContent='인증번호 받기';}
    }
  }

  function rsvSendCode(){
    var phone=(document.getElementById('rsvPhone').value||'').trim().replace(/[^0-9]/g,'');
    if(!phone||phone.length<10){ alert('올바른 연락처를 입력해주세요.'); return; }
    _rsvVerifyCode=String(Math.floor(100000+Math.random()*900000));
    var vb=document.getElementById('rsvVerifyBox'); if(vb) vb.classList.add('show');
    var vc=document.getElementById('rsvVerifyCode'); if(vc) vc.value='';
    var sendBtn=document.getElementById('rsvSendCodeBtn');
    if(sendBtn){sendBtn.disabled=true;sendBtn.textContent='재발송(59s)';}
    var st=document.getElementById('rsvPhoneStatus');
    if(st){st.className='rsv-phone-status';st.textContent='인증번호: '+_rsvVerifyCode+'  ← 위 칸에 입력해주세요.';}
    if(_rsvVerifyTimer) clearInterval(_rsvVerifyTimer);
    _rsvVerifyLeft=59;
    var tm=document.getElementById('rsvPhoneTimer');
    if(tm){tm.style.display='block';tm.textContent='남은 시간: '+_rsvVerifyLeft+'초';}
    _rsvVerifyTimer=setInterval(function(){
      _rsvVerifyLeft--;
      if(tm) tm.textContent='남은 시간: '+_rsvVerifyLeft+'초';
      if(_rsvVerifyLeft<=0){
        clearInterval(_rsvVerifyTimer); _rsvVerifyTimer=null;
        if(tm) tm.style.display='none';
        if(sendBtn){sendBtn.disabled=false;sendBtn.textContent='인증번호 재발송';}
        if(st&&!_rsvPhoneVerified){st.className='rsv-phone-status err';st.textContent='인증 시간이 만료되었습니다. 다시 시도해주세요.';}
      }
    },1000);
  }

  function rsvConfirmCode(){
    var input=(document.getElementById('rsvVerifyCode').value||'').trim();
    var st=document.getElementById('rsvPhoneStatus'), tm=document.getElementById('rsvPhoneTimer');
    if(!input){alert('인증번호를 입력해주세요.'); return;}
    if(_rsvVerifyLeft<=0&&!_rsvVerifyTimer){ if(st){st.className='rsv-phone-status err';st.textContent='인증 시간이 만료되었습니다. 재발송해주세요.';} return; }
    if(input===_rsvVerifyCode){
      _rsvPhoneVerified=true;
      if(_rsvVerifyTimer){clearInterval(_rsvVerifyTimer);_rsvVerifyTimer=null;}
      if(tm) tm.style.display='none';
      var vb=document.getElementById('rsvVerifyBox'); if(vb) vb.classList.remove('show');
      var badge=document.getElementById('rsvPhoneVerifiedBadge'); if(badge) badge.style.display='';
      var sendBtn=document.getElementById('rsvSendCodeBtn'); if(sendBtn){sendBtn.disabled=true;sendBtn.textContent='인증완료';}
      if(st){st.className='rsv-phone-status ok';st.textContent='✓ 본인 인증이 완료되었습니다.';}
    } else {
      if(st){st.className='rsv-phone-status err';st.textContent='인증번호가 일치하지 않습니다. 다시 확인해주세요.';}
    }
  }

  var _rsvReady=false;
  document.addEventListener('DOMContentLoaded',function(){ rsvGoStep(1); setTimeout(function(){_rsvReady=true;},500); });

/* ===== reservation.js: rv2 book + lookup (merged from rv2_book.js, rv2_lookup.js) ===== */
(function () {
  'use strict';
  if (!document.getElementById('rv2-step-host')) return;

  var API = (function () {
    var a = document.createElement('a');
    a.href = 'admin/api_front/rv2_public.php';
    return a.href;
  })();

  var state = {
    config: null,
    steps: [],
    stepIndex: 0,
    branchId: null,
    date: null,
    slotId: null,
    itemId: null,
    itemQuotaId: null,
    capacityMode: 'time',
    extra: {},
    calendarYear: null,
    calendarMonth: null,
    calendarDays: {}
  };

  function el(id) { return document.getElementById(id); }

  function showMsg(text, ok) {
    var m = el('rv2-msg');
    if (!text) { m.innerHTML = ''; return; }
    m.innerHTML = '<div class="rv2-msg ' + (ok ? 'ok' : 'err') + '">' + esc(text) + '</div>';
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  function getJSON(url) {
    return fetch(url, { credentials: 'omit' }).then(function (r) { return r.json(); });
  }

  function postJSON(body) {
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
      credentials: 'omit'
    }).then(function (r) { return r.json(); });
  }

  function loadConfig() {
    return getJSON(API + '?action=config').then(function (res) {
      if (!res.ok) throw new Error(res.msg || '설정 로드 실패');
      state.config = res;
      state.capacityMode = res.capacity_mode === 'item' ? 'item' : 'time';
      state.steps = (res.steps || []).filter(function (s) { return s.is_active == 1 || s.is_active === true; })
        .filter(function (s) {
          if (state.capacityMode === 'item' && s.step_key === 'time') {
            return false;
          }
          return true;
        })
        .sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
      var now = new Date();
      state.calendarYear = now.getFullYear();
      state.calendarMonth = now.getMonth() + 1;
      var capEl = el('rv2-cap-hint');
      if (capEl) {
        capEl.textContent = res.capacity_hint || '';
      }
    });
  }

  function stepKey() {
    var s = state.steps[state.stepIndex];
    return s ? s.step_key : null;
  }

  function renderProgress() {
    var host = el('rv2-progress');
    host.innerHTML = '';
    for (var i = 0; i < state.steps.length; i++) {
      var sp = document.createElement('span');
      if (i <= state.stepIndex) sp.className = 'on';
      host.appendChild(sp);
    }
  }

  function titleFor(key) {
    var map = { branch: '지점 선택', date: '날짜 선택', time: '시간 선택', item: '항목 선택', info: '정보 입력' };
    return map[key] || key;
  }

  function renderStep() {
    renderProgress();
    var host = el('rv2-step-host');
    var act = el('rv2-actions');
    host.innerHTML = '';
    act.innerHTML = '';
    showMsg('');

    var key = stepKey();
    if (!key) {
      host.innerHTML = '<div class="rv2-card"><p>표시할 단계가 없습니다. 관리자에서 단계를 활성화해 주세요.</p></div>';
      return;
    }

    if (key === 'branch') return renderBranch(host, act);
    if (key === 'date') return renderDate(host, act);
    if (key === 'time') return renderTime(host, act);
    if (key === 'item') return renderItem(host, act);
    if (key === 'info') return renderInfo(host, act);
    host.innerHTML = '<div class="rv2-card">알 수 없는 단계: ' + esc(key) + '</div>';
  }

  function navButtons(act, showPrev, onPrev, onNext, nextLabel) {
    if (showPrev) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'rv2-btn ghost';
      b.textContent = '이전';
      b.onclick = onPrev;
      act.appendChild(b);
    }
    var n = document.createElement('button');
    n.type = 'button';
    n.className = 'rv2-btn primary';
    n.textContent = nextLabel || '다음';
    n.onclick = onNext;
    act.appendChild(n);
  }

  function renderBranch(host, act) {
    var card = document.createElement('div');
    card.className = 'rv2-card';
    card.innerHTML = '<div class="rv2-step-title">' + titleFor('branch') + '</div><div class="rv2-opt-grid cols-2" id="rv2-branch-grid"></div>';
    host.appendChild(card);
    var grid = card.querySelector('#rv2-branch-grid');
    (state.config.branches || []).forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rv2-opt' + (state.branchId === b.id ? ' selected' : '');
      btn.textContent = b.name;
      btn.onclick = function () {
        state.branchId = b.id;
        state.slotId = null;
        state.itemQuotaId = null;
        state.itemId = null;
        Array.prototype.forEach.call(grid.querySelectorAll('.rv2-opt'), function (x) { x.classList.remove('selected'); });
        btn.classList.add('selected');
      };
      grid.appendChild(btn);
    });
    navButtons(act, false, null, function () {
      if (!state.branchId) { showMsg('지점을 선택해 주세요.'); return; }
      state.stepIndex++;
      renderStep();
    });
  }

  function loadCalendar() {
    if (!state.branchId) return Promise.resolve();
    var y = state.calendarYear;
    var m = state.calendarMonth;
    var url = API + '?action=calendar&branch_id=' + state.branchId + '&year=' + y + '&month=' + m;
    return getJSON(url).then(function (res) {
      if (!res.ok) throw new Error(res.msg || '캘린더 로드 실패');
      state.calendarDays = res.days || {};
    });
  }

  function renderDate(host, act) {
    if (!state.branchId) {
      showMsg('먼저 지점을 선택해 주세요.');
      state.stepIndex = 0;
      return renderStep();
    }
    var card = document.createElement('div');
    card.className = 'rv2-card';
    card.innerHTML =
      '<div class="rv2-step-title">' + titleFor('date') + '</div>' +
      '<div class="rv2-cal-nav">' +
      '<button type="button" id="rv2-cal-prev">‹</button>' +
      '<h3 id="rv2-cal-label"></h3>' +
      '<button type="button" id="rv2-cal-next">›</button>' +
      '</div>' +
      '<div class="rv2-cal-grid" id="rv2-cal-grid"></div>';
    host.appendChild(card);

    function paint() {
      el('rv2-cal-label').textContent = state.calendarYear + '년 ' + state.calendarMonth + '월';
      var grid = el('rv2-cal-grid');
      grid.innerHTML = '';
      var dow = ['일', '월', '화', '수', '목', '금', '토'];
      dow.forEach(function (d) {
        var c = document.createElement('div');
        c.className = 'rv2-cal-dow';
        c.textContent = d;
        grid.appendChild(c);
      });
      var first = new Date(state.calendarYear, state.calendarMonth - 1, 1);
      var last = new Date(state.calendarYear, state.calendarMonth, 0);
      var lead = first.getDay();
      for (var i = 0; i < lead; i++) {
        var ph = document.createElement('div');
        ph.className = 'rv2-cal-day muted';
        grid.appendChild(ph);
      }
      for (var day = 1; day <= last.getDate(); day++) {
        var ds = state.calendarYear + '-' + String(state.calendarMonth).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        var cell = document.createElement('div');
        cell.className = 'rv2-cal-day';
        cell.textContent = day;
        var info = state.calendarDays[ds];
        if (!info || !info.open) {
          cell.classList.add('closed');
        } else {
          cell.classList.add('open');
        }
        if (state.date === ds) cell.classList.add('selected');
        (function (dstr, cEl, inf) {
          cEl.onclick = function () {
            if (!inf || !inf.open) return;
            state.date = dstr;
            state.slotId = null;
            state.itemQuotaId = null;
            state.itemId = null;
            Array.prototype.forEach.call(grid.querySelectorAll('.rv2-cal-day'), function (x) { x.classList.remove('selected'); });
            cEl.classList.add('selected');
          };
        })(ds, cell, info);
        grid.appendChild(cell);
      }
    }

    loadCalendar().then(paint).catch(function (e) {
      showMsg(e.message || '오류');
    });

    el('rv2-cal-prev').onclick = function () {
      state.calendarMonth--;
      if (state.calendarMonth < 1) { state.calendarMonth = 12; state.calendarYear--; }
      loadCalendar().then(paint).catch(function (e) { showMsg(e.message); });
    };
    el('rv2-cal-next').onclick = function () {
      state.calendarMonth++;
      if (state.calendarMonth > 12) { state.calendarMonth = 1; state.calendarYear++; }
      loadCalendar().then(paint).catch(function (e) { showMsg(e.message); });
    };

    navButtons(act, state.stepIndex > 0, function () {
      state.stepIndex--;
      renderStep();
    }, function () {
      if (!state.date) { showMsg('날짜를 선택해 주세요.'); return; }
      state.stepIndex++;
      renderStep();
    });
  }

  function renderTime(host, act) {
    if (!state.branchId || !state.date) {
      showMsg('지점과 날짜를 먼저 선택해 주세요.');
      state.stepIndex = Math.max(0, state.stepIndex - 1);
      return renderStep();
    }
    var card = document.createElement('div');
    card.className = 'rv2-card';
    card.innerHTML = '<div class="rv2-step-title">' + titleFor('time') + '</div><div class="rv2-opt-grid cols-2" id="rv2-slot-grid"></div><p id="rv2-slot-hint" style="color:var(--rv2-muted);font-size:.85rem;margin-top:10px;"></p>';
    host.appendChild(card);
    var grid = card.querySelector('#rv2-slot-grid');
    var hint = card.querySelector('#rv2-slot-hint');
    getJSON(API + '?action=slots&branch_id=' + state.branchId + '&date=' + encodeURIComponent(state.date))
      .then(function (res) {
        if (!res.ok) throw new Error(res.msg || '시간 로드 실패');
        var slots = res.slots || [];
        if (!slots.length) {
          hint.textContent = '이 날짜에 등록된 시간대가 없습니다. 다른 날짜를 선택해 주세요.';
          return;
        }
        slots.forEach(function (s) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'rv2-opt' + (state.slotId === s.id ? ' selected' : '');
          btn.disabled = !s.available;
          var rem = typeof s.remaining !== 'undefined' ? s.remaining : Math.max(0, (parseInt(s.capacity, 10) || 0) - (parseInt(s.booked, 10) || 0));
          btn.textContent = s.slot_time + (s.available ? ' (잔여 ' + rem + ')' : ' (마감)');
          btn.onclick = function () {
            if (!s.available) return;
            state.slotId = s.id;
            Array.prototype.forEach.call(grid.querySelectorAll('.rv2-opt'), function (x) { x.classList.remove('selected'); });
            btn.classList.add('selected');
          };
          grid.appendChild(btn);
        });
      })
      .catch(function (e) { showMsg(e.message); });

    navButtons(act, true, function () {
      state.stepIndex--;
      renderStep();
    }, function () {
      if (!state.slotId) { showMsg('시간을 선택해 주세요.'); return; }
      state.stepIndex++;
      renderStep();
    });
  }

  function renderItem(host, act) {
    if (!state.branchId || !state.date) {
      showMsg('지점과 날짜를 먼저 선택해 주세요.');
      state.stepIndex = Math.max(0, state.stepIndex - 1);
      return renderStep();
    }
    var items = state.config.items || [];
    var card = document.createElement('div');
    card.className = 'rv2-card';
    host.appendChild(card);

    if (state.capacityMode === 'item') {
      card.innerHTML =
        '<div class="rv2-step-title">' + titleFor('item') + '</div>' +
        '<p id="rv2-item-hint" style="color:var(--rv2-muted);font-size:.85rem;margin:0 0 12px;"></p>' +
        '<div class="rv2-opt-grid cols-2" id="rv2-item-grid"></div>';
      var grid = card.querySelector('#rv2-item-grid');
      var hint = card.querySelector('#rv2-item-hint');
      if (!items.length) {
        hint.textContent = '등록된 항목이 없습니다. 관리자 설정을 확인해 주세요.';
        navButtons(act, true, function () {
          state.stepIndex--;
          renderStep();
        }, function () {
          showMsg('예약 가능한 항목이 없습니다.');
        });
        return;
      }
      hint.textContent = '잔여 수량이 실시간으로 표시됩니다.';
      getJSON(API + '?action=item_quotas&branch_id=' + state.branchId + '&date=' + encodeURIComponent(state.date))
        .then(function (res) {
          if (!res.ok) throw new Error(res.msg || '항목 정보 로드 실패');
          var quotas = res.quotas || [];
          grid.innerHTML = '';
          if (!quotas.length) {
            hint.textContent = '이 날짜에 등록된 항목 정원이 없습니다. 다른 날짜를 선택하거나 관리자에게 문의하세요.';
            return;
          }
          quotas.forEach(function (q) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'rv2-opt' + (state.itemQuotaId === q.id ? ' selected' : '');
            btn.disabled = !q.available;
            var rem = typeof q.remaining !== 'undefined' ? q.remaining : Math.max(0, (parseInt(q.capacity, 10) || 0) - (parseInt(q.booked, 10) || 0));
            btn.textContent = (q.item_name || '') + ' (잔여 ' + rem + '/' + (q.capacity || 0) + ')' + (q.available ? '' : ' · 마감');
            btn.onclick = function () {
              if (!q.available) return;
              state.itemQuotaId = q.id;
              state.itemId = parseInt(q.item_id, 10);
              Array.prototype.forEach.call(grid.querySelectorAll('.rv2-opt'), function (x) { x.classList.remove('selected'); });
              btn.classList.add('selected');
            };
            grid.appendChild(btn);
          });
        })
        .catch(function (e) { showMsg(e.message || '오류'); });
      navButtons(act, true, function () {
        state.stepIndex--;
        renderStep();
      }, function () {
        if (!state.itemQuotaId) { showMsg('항목을 선택해 주세요.'); return; }
        state.stepIndex++;
        renderStep();
      });
      return;
    }

    if (!items.length) {
      card.innerHTML = '<div class="rv2-step-title">' + titleFor('item') + '</div><p>등록된 항목이 없습니다. 건너뜁니다.</p>';
      navButtons(act, true, function () {
        state.stepIndex--;
        renderStep();
      }, function () {
        state.itemId = null;
        state.itemQuotaId = null;
        state.stepIndex++;
        renderStep();
      });
      return;
    }
    card.innerHTML = '<div class="rv2-step-title">' + titleFor('item') + '</div><div class="rv2-opt-grid cols-2" id="rv2-item-grid"></div>';
    var grid2 = card.querySelector('#rv2-item-grid');
    items.forEach(function (it) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rv2-opt' + (state.itemId === it.id ? ' selected' : '');
      btn.textContent = it.name;
      btn.onclick = function () {
        state.itemId = it.id;
        Array.prototype.forEach.call(grid2.querySelectorAll('.rv2-opt'), function (x) { x.classList.remove('selected'); });
        btn.classList.add('selected');
      };
      grid2.appendChild(btn);
    });
    navButtons(act, true, function () {
      state.stepIndex--;
      renderStep();
    }, function () {
      if (!state.itemId) { showMsg('항목을 선택해 주세요.'); return; }
      state.stepIndex++;
      renderStep();
    });
  }

  function renderInfo(host, act) {
    var fields = state.config.fields || [];
    var card = document.createElement('div');
    card.className = 'rv2-card';
    var html = '<div class="rv2-step-title">' + titleFor('info') + '</div>';
    html += '<div class="rv2-field"><label>이름 <span style="color:#b91c1c">*</span></label><input type="text" id="rv2-c-name" required></div>';
    html += '<div class="rv2-field"><label>연락처 <span style="color:#b91c1c">*</span></label><input type="text" id="rv2-c-phone" required></div>';
    html += '<div class="rv2-field"><label>이메일</label><input type="email" id="rv2-c-email"></div>';
    html += '<div id="rv2-dynamic-fields"></div>';
    html += '<p class="rv2-admin-notify-note">접수 알림은 관리자 설정(이메일·스프레드시트·알림톡 웹훅)으로만 발송됩니다.</p>';
    card.innerHTML = html;
    host.appendChild(card);

    var dyn = card.querySelector('#rv2-dynamic-fields');
    fields.forEach(function (f) {
      var fid = 'rv2-f-' + f.name_key;
      var req = f.is_required == 1 || f.is_required === true;
      var wrap = document.createElement('div');
      wrap.className = 'rv2-field';
      var label = document.createElement('label');
      label.innerHTML = esc(f.label) + (req ? ' <span style="color:#b91c1c">*</span>' : '');
      wrap.appendChild(label);

      if (f.field_type === 'text') {
        var inp = document.createElement('input');
        inp.type = 'text';
        inp.id = fid;
        wrap.appendChild(inp);
      } else if (f.field_type === 'date') {
        var inpd = document.createElement('input');
        inpd.type = 'date';
        inpd.id = fid;
        wrap.appendChild(inpd);
      } else if (f.field_type === 'time') {
        var inpt = document.createElement('input');
        inpt.type = 'time';
        inpt.id = fid;
        wrap.appendChild(inpt);
      } else if (f.field_type === 'daterange') {
        var r1 = document.createElement('input');
        r1.type = 'date';
        r1.id = fid + '_s';
        var r2 = document.createElement('input');
        r2.type = 'date';
        r2.id = fid + '_e';
        r2.style.marginTop = '8px';
        wrap.appendChild(r1);
        wrap.appendChild(r2);
      } else if (f.field_type === 'dropdown') {
        var sel = document.createElement('select');
        sel.id = fid;
        var o0 = document.createElement('option');
        o0.value = '';
        o0.textContent = '선택';
        sel.appendChild(o0);
        (f.options || []).forEach(function (opt) {
          var o = document.createElement('option');
          var v = typeof opt === 'object' ? (opt.value || opt.label) : opt;
          var l = typeof opt === 'object' ? (opt.label || opt.value) : opt;
          o.value = v;
          o.textContent = l;
          sel.appendChild(o);
        });
        wrap.appendChild(sel);
      } else if (f.field_type === 'radio') {
        (f.options || []).forEach(function (opt, idx) {
          var v = typeof opt === 'object' ? (opt.value || opt.label) : opt;
          var l = typeof opt === 'object' ? (opt.label || opt.value) : opt;
          var row = document.createElement('div');
          row.className = 'rv2-check-row';
          var rb = document.createElement('input');
          rb.type = 'radio';
          rb.name = fid;
          rb.value = v;
          rb.id = fid + '_' + idx;
          var lb = document.createElement('label');
          lb.setAttribute('for', rb.id);
          lb.style.margin = '0';
          lb.style.fontWeight = '500';
          lb.textContent = l;
          row.appendChild(rb);
          row.appendChild(lb);
          wrap.appendChild(row);
        });
      } else if (f.field_type === 'checkbox') {
        (f.options || []).forEach(function (opt, idx) {
          var v = typeof opt === 'object' ? (opt.value || opt.label) : opt;
          var l = typeof opt === 'object' ? (opt.label || opt.value) : opt;
          var row = document.createElement('div');
          row.className = 'rv2-check-row';
          var cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.value = v;
          cb.id = fid + '_' + idx;
          cb.dataset.fkey = f.name_key;
          var lb = document.createElement('label');
          lb.setAttribute('for', cb.id);
          lb.style.margin = '0';
          lb.textContent = l;
          row.appendChild(cb);
          row.appendChild(lb);
          wrap.appendChild(row);
        });
      }
      dyn.appendChild(wrap);
    });

    navButtons(act, true, function () {
      state.stepIndex--;
      renderStep();
    }, function () {
      var name = el('rv2-c-name').value.trim();
      var phone = el('rv2-c-phone').value.trim();
      var email = el('rv2-c-email').value.trim();
      if (!name || !phone) { showMsg('이름과 연락처는 필수입니다.'); return; }

      if (state.capacityMode === 'item') {
        if (!state.itemQuotaId) { showMsg('항목·잔여 수량을 선택해 주세요.'); return; }
      } else if (!state.slotId) {
        showMsg('시간을 선택해 주세요.');
        return;
      }

      var extra = {};
      for (var i = 0; i < fields.length; i++) {
        var f = fields[i];
        var req = f.is_required == 1 || f.is_required === true;
        var fid = 'rv2-f-' + f.name_key;
        if (f.field_type === 'checkbox') {
          var vals = [];
          dyn.querySelectorAll('input[type="checkbox"][data-fkey="' + f.name_key + '"]:checked').forEach(function (c) {
            vals.push(c.value);
          });
          if (req && !vals.length) { showMsg('"' + f.label + '"을(를) 선택해 주세요.'); return; }
          extra[f.name_key] = vals;
        } else if (f.field_type === 'radio') {
          var r = dyn.querySelector('input[name="' + fid + '"]:checked');
          if (req && !r) { showMsg('"' + f.label + '"을(를) 선택해 주세요.'); return; }
          extra[f.name_key] = r ? r.value : '';
        } else if (f.field_type === 'daterange') {
          var s = el(fid + '_s').value;
          var e = el(fid + '_e').value;
          if (req && (!s || !e)) { showMsg('"' + f.label + '" 기간을 입력해 주세요.'); return; }
          extra[f.name_key] = { start: s, end: e };
        } else {
          var inp = el(fid);
          var val = inp ? inp.value.trim() : '';
          if (req && !val) { showMsg('"' + f.label + '"을(를) 입력해 주세요.'); return; }
          extra[f.name_key] = val;
        }
      }

      var payload = {
        action: 'book',
        branch_id: state.branchId,
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        extra: extra
      };
      if (state.itemId) {
        payload.item_id = state.itemId;
      }
      if (state.capacityMode === 'item') {
        payload.item_quota_id = state.itemQuotaId;
      } else {
        payload.slot_id = state.slotId;
      }

      postJSON(payload).then(function (res) {
        if (!res.ok) {
          showMsg(res.msg || '예약 실패');
          return;
        }
        showMsg('예약이 완료되었습니다. 예약번호: ' + res.reservation_no, true);
        el('rv2-step-host').innerHTML = '';
        el('rv2-actions').innerHTML = '<a class="rv2-btn primary" style="display:inline-block;text-align:center;text-decoration:none;line-height:48px;" href="#rv2-lookup-anchor">예약 조회</a>';
        el('rv2-progress').innerHTML = '';
      }).catch(function () {
        showMsg('네트워크 오류');
      });
    }, '예약 완료');
  }

  loadConfig()
    .then(renderStep)
    .catch(function (e) {
      showMsg(e.message || '초기화 실패');
    });
})();

(function () {
  'use strict';
  var btn = document.getElementById('rv2-lookup-btn');
  if (!btn) return;

  var API = (function () {
    var a = document.createElement('a');
    a.href = 'admin/api_front/rv2_public.php';
    return a.href;
  })();

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  function showMsg(text, ok) {
    var m = document.getElementById('rv2-lookup-msg');
    if (!text) { m.innerHTML = ''; return; }
    m.innerHTML = '<div class="rv2-msg ' + (ok ? 'ok' : 'err') + '">' + esc(text) + '</div>';
  }

  function cardBooking(b) {
    if (!b) return '<p>조회 결과가 없습니다.</p>';
    var ex = '';
    try {
      ex = typeof b.extra_json === 'string' ? JSON.parse(b.extra_json) : (b.extra_json || {});
    } catch (e) {
      ex = {};
    }
    var extraHtml = Object.keys(ex).length
      ? '<pre style="white-space:pre-wrap;font-size:.85rem;background:#f8fafc;padding:12px;border-radius:8px;">' + esc(JSON.stringify(ex, null, 2)) + '</pre>'
      : '';
    var actions = '';
    if (b.status === '접수') {
      actions =
        '<div class="rv2-booking-actions" data-no="' + esc(b.reservation_no) + '" data-phone="' + esc(b.customer_phone) + '" data-branch="' + esc(String(b.branch_id || '')) + '" data-at="' + esc(String(b.reservation_at || '').substring(0, 10)) + '">' +
        '<button type="button" class="rv2-btn ghost rv2-u-cancel">예약 취소</button>' +
        '<button type="button" class="rv2-btn primary rv2-u-resched">일정 변경</button>' +
        '</div>';
    }
    return (
      '<div class="rv2-card rv2-booking-card">' +
      '<p class="rv2-booking-no"><strong>예약번호</strong> ' + esc(b.reservation_no) + '</p>' +
      '<p><strong>상태</strong> <span class="rv2-status">' + esc(b.status) + '</span></p>' +
      '<p><strong>일시</strong> ' + esc(b.reservation_at) + '</p>' +
      '<p><strong>지점</strong> ' + esc(b.branch_name || '') + '</p>' +
      '<p><strong>항목</strong> ' + esc(b.item_name || '-') + '</p>' +
      '<p><strong>이름</strong> ' + esc(b.customer_name) + '</p>' +
      '<p><strong>연락처</strong> ' + esc(b.customer_phone) + '</p>' +
      (b.customer_email ? '<p><strong>이메일</strong> ' + esc(b.customer_email) + '</p>' : '') +
      (extraHtml ? '<div style="margin-top:12px"><strong>추가 정보</strong>' + extraHtml + '</div>' : '') +
      actions +
      '</div>'
    );
  }

  function hideResched() {
    var p = document.getElementById('rv2-resched-panel');
    if (!p) return;
    p.hidden = true;
    p.innerHTML = '';
  }

  function postJSON(body) {
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
      credentials: 'omit'
    }).then(function (r) { return r.json(); });
  }

  function wireBookingActions(scope, capacityMode) {
    var mode = capacityMode === 'item' ? 'item' : 'time';
    scope.querySelectorAll('.rv2-u-cancel').forEach(function (btn) {
      btn.onclick = function () {
        var wrap = btn.closest('.rv2-booking-actions');
        if (!wrap) return;
        var no = wrap.getAttribute('data-no');
        var phone = prompt('예약 시 입력한 연락처를 입력해 주세요.');
        if (!phone || !phone.trim()) return;
        postJSON({ action: 'user_cancel', reservation_no: no, customer_phone: phone.trim() })
          .then(function (res) {
            if (!res.ok) {
              showMsg(res.msg || '취소 실패');
              return;
            }
            showMsg('예약이 취소되었습니다.', true);
            hideResched();
            document.getElementById('rv2-lookup-btn').click();
          })
          .catch(function () { showMsg('네트워크 오류'); });
      };
    });
    scope.querySelectorAll('.rv2-u-resched').forEach(function (btn) {
      btn.onclick = function () {
        var wrap = btn.closest('.rv2-booking-actions');
        if (!wrap) return;
        var panel = document.getElementById('rv2-resched-panel');
        if (!panel) return;
        var no = wrap.getAttribute('data-no');
        var branchId = parseInt(wrap.getAttribute('data-branch'), 10);
        var dateDef = wrap.getAttribute('data-at') || '';
        panel.hidden = false;
        panel.innerHTML =
          '<h3 class="rv2-resched-title">일정 변경</h3>' +
          '<p class="rv2-muted">접수 상태에서만 가능합니다. 연락처 확인 후 새 일정을 선택하세요.</p>' +
          '<div class="rv2-field"><label>연락처 확인</label><input type="text" id="rv2-rs-phone" autocomplete="tel"></div>' +
          '<div class="rv2-field"><label>날짜</label><input type="date" id="rv2-rs-date" value="' + esc(dateDef) + '"></div>' +
          '<div class="rv2-field"><button type="button" class="rv2-btn ghost" id="rv2-rs-load">가능한 일정 불러오기</button></div>' +
          '<div class="rv2-field"><label id="rv2-rs-lab">선택</label><select id="rv2-rs-sel"><option value="">먼저 불러오기</option></select></div>' +
          '<div class="rv2-actions" style="margin-top:12px">' +
          '<button type="button" class="rv2-btn primary" id="rv2-rs-go">변경 적용</button>' +
          '<button type="button" class="rv2-btn ghost" id="rv2-rs-close">닫기</button></div>';

        document.getElementById('rv2-rs-close').onclick = function () { hideResched(); };
        document.getElementById('rv2-rs-load').onclick = function () {
          var d = document.getElementById('rv2-rs-date').value;
          if (!d || branchId < 1) {
            showMsg('날짜와 지점 정보를 확인해 주세요.');
            return;
          }
          var sel = document.getElementById('rv2-rs-sel');
          var lab = document.getElementById('rv2-rs-lab');
          sel.innerHTML = '<option value="">불러오는 중…</option>';
          if (mode === 'item') {
            lab.textContent = '항목 (잔여 수량)';
            postJSON({ action: 'item_quotas', branch_id: branchId, date: d })
              .then(function (res) {
                if (!res.ok) {
                  sel.innerHTML = '<option value="">오류</option>';
                  return;
                }
                var qs = res.quotas || [];
                sel.innerHTML = qs.length
                  ? '<option value="">선택</option>' + qs.map(function (q) {
                    var rem = typeof q.remaining !== 'undefined' ? q.remaining : Math.max(0, (parseInt(q.capacity, 10) || 0) - (parseInt(q.booked, 10) || 0));
                    var dis = q.available ? '' : ' disabled';
                    return '<option value="iq:' + q.id + '"' + dis + '>' + esc(q.item_name) + ' (잔여 ' + rem + ')</option>';
                  }).join('')
                  : '<option value="">등록된 항목 정원 없음</option>';
              });
          } else {
            lab.textContent = '시간 슬롯';
            fetch(API + '?action=slots&branch_id=' + branchId + '&date=' + encodeURIComponent(d))
              .then(function (r) { return r.json(); })
              .then(function (res) {
                if (!res.ok) {
                  sel.innerHTML = '<option value="">오류</option>';
                  return;
                }
                var sl = res.slots || [];
                sel.innerHTML = sl.length
                  ? '<option value="">선택</option>' + sl.map(function (s) {
                    var rem = typeof s.remaining !== 'undefined' ? s.remaining : Math.max(0, (parseInt(s.capacity, 10) || 0) - (parseInt(s.booked, 10) || 0));
                    var dis = s.available ? '' : ' disabled';
                    return '<option value="sl:' + s.id + '"' + dis + '>' + esc(s.slot_time) + ' (잔여 ' + rem + ')</option>';
                  }).join('')
                  : '<option value="">슬롯 없음</option>';
              });
          }
        };
        document.getElementById('rv2-rs-go').onclick = function () {
          var phone = document.getElementById('rv2-rs-phone').value.trim();
          var v = document.getElementById('rv2-rs-sel').value;
          if (!phone) {
            showMsg('연락처를 입력해 주세요.');
            return;
          }
          if (!v || v.indexOf(':') < 0) {
            showMsg('새 일정을 선택해 주세요.');
            return;
          }
          var parts = v.split(':');
          var kind = parts[0];
          var id = parseInt(parts[1], 10);
          var body = { action: 'user_reschedule', reservation_no: no, customer_phone: phone };
          if (kind === 'iq') {
            body.item_quota_id = id;
          } else {
            body.slot_id = id;
          }
          postJSON(body)
            .then(function (res) {
              if (!res.ok) {
                showMsg(res.msg || '변경 실패');
                return;
              }
              showMsg('일정이 변경되었습니다.', true);
              hideResched();
              document.getElementById('rv2-lookup-btn').click();
            })
            .catch(function () { showMsg('네트워크 오류'); });
        };
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };
    });
  }

  btn.onclick = function () {
    showMsg('');
    hideResched();
    var no = document.getElementById('rv2-lookup-no').value.trim();
    var name = document.getElementById('rv2-lookup-name').value.trim();
    var phone = document.getElementById('rv2-lookup-phone').value.trim();
    var body = { action: 'lookup' };
    if (no) body.reservation_no = no;
    else if (name && phone) {
      body.customer_name = name;
      body.customer_phone = phone;
    } else {
      showMsg('예약번호 또는 이름+연락처를 입력하세요.');
      return;
    }

    postJSON(body)
      .then(function (res) {
        var out = document.getElementById('rv2-result');
        if (!res.ok) {
          showMsg(res.msg || '조회 실패');
          out.innerHTML = '';
          return;
        }
        var capMode = res.capacity_mode || 'time';
        if (res.booking) {
          out.innerHTML = cardBooking(res.booking);
          wireBookingActions(out, capMode);
        } else if (res.list) {
          if (!res.list.length) {
            out.innerHTML = '<div class="rv2-card"><p>조회 결과가 없습니다.</p></div>';
            return;
          }
          out.innerHTML = res.list.map(cardBooking).join('');
          wireBookingActions(out, capMode);
        }
      })
      .catch(function () {
        showMsg('네트워크 오류');
      });
  };
})();

