// WAIS current rolling calendar guard — keeps only today/future verified events in the visible board.
(function(){
  const esc=(v='')=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const todayET=()=>{
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));
    return `${p.year}-${p.month}-${p.day}`;
  };
  const weekLabel=(dateISO)=>{
    if(!dateISO)return '';
    const now=new Date();
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit',weekday:'short'}).formatToParts(now);
    const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));
    const base=new Date(`${p.year}-${p.month}-${p.day}T12:00:00`);
    const weekday=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(p.weekday);
    const mondayOffset=(weekday+6)%7;
    const start=new Date(base);start.setDate(base.getDate()-mondayOffset);
    const next=new Date(start);next.setDate(start.getDate()+7);
    const after=new Date(start);after.setDate(start.getDate()+14);
    const d=new Date(`${dateISO}T12:00:00`);
    if(d>=start&&d<next)return '本週';
    if(d>=next&&d<after)return '下週';
    return '';
  };
  async function render(){
    const target=document.getElementById('economicEventsList');
    if(!target)return;
    try{
      const r=await fetch(`weekly-events.json?waisCurrent=${Date.now()}`,{cache:'no-store',headers:{'Cache-Control':'no-cache'}});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      const data=await r.json();
      const today=todayET();
      const events=(Array.isArray(data.events)?data.events:[]).filter(e=>String(e.dateISO||'')>=today);
      const updated=document.getElementById('economicEventsUpdated');
      if(updated){
        const stamp=data.lastUpdated?new Date(data.lastUpdated).toLocaleString('en-CA',{timeZone:'America/New_York'}):'—';
        updated.textContent=`日程資料更新：${stamp} ET｜只顯示今日及未來已驗證事件`;
      }
      target.innerHTML=events.length?events.map((e,i)=>{
        const week=weekLabel(e.dateISO||'');
        return `<div class="calendar-row"><span>${String(i+1).padStart(2,'0')}</span><p><strong>${week?`<em class="week-tag">${week}</em>`:''}${esc(e.date||'')}｜${esc(e.event||'')}</strong><br>${esc(e.time||'')}${e.referenceMonth?`｜${esc(e.referenceMonth)}`:''}<br><small>${esc(e.source||'')}</small></p></div>`;
      }).join(''):'<div class="calendar-row"><span>—</span><p>目前沒有今日或未來已確認的高影響事件。</p></div>';
      window.WAIS_VISIBLE_EVENT_WINDOW={from:today,count:events.length,lastUpdated:data.lastUpdated||null};
    }catch(err){console.warn('[WAIS] current calendar refresh failed',err);}
  }
  window.WAIS_RENDER_CURRENT_CALENDAR=render;
  const run=()=>{
    render();
    [600,1800,3500,6000,10000,15000,25000,40000].forEach(ms=>setTimeout(render,ms));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('pageshow',()=>setTimeout(render,250));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')render();});
})();
