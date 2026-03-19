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
    _rsvUpdateCalNavBtn(); rsvLoadMonthAvail();
  }
  function rsvCalNav(dir){
    var _kstNow=new Date(Date.now()+9*60*60*1000);
    if(dir===-1&&_rsv.calYear===_kstNow.getUTCFullYear()&&_rsv.calMonth===(_kstNow.getUTCMonth()+1)) return;
    _rsv.calMonth+=dir;
    if(_rsv.calMonth>12){_rsv.calMonth=1;_rsv.calYear++;}
    if(_rsv.calMonth<1){_rsv.calMonth=12;_rsv.calYear--;}
    var title=document.getElementById('rsvCalTitle');
    if(title) title.textContent=_rsv.calYear+'년 '+_rsv.calMonth+'월';
    _rsvUpdateCalNavBtn(); rsvLoadMonthAvail();
  }
  function _rsvUpdateCalNavBtn(){
    var _kstNow=new Date(Date.now()+9*60*60*1000);
    var isCur=(_rsv.calYear===_kstNow.getUTCFullYear()&&_rsv.calMonth===(_kstNow.getUTCMonth()+1));
    var prevBtn=document.querySelector('#rsvPanel2 .rsv-cal-nav-btn:first-child');
    if(prevBtn){ prevBtn.disabled=isCur; prevBtn.style.opacity=isCur?'0.3':''; prevBtn.style.cursor=isCur?'default':''; }
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