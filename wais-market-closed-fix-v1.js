// WAIS market closed-state correction.
// Closed/weekend markets should preserve the last verified session instead of being labelled STALE solely because time has passed.
(function(){
  const $=id=>document.getElementById(id);
  const fetchJSON=async path=>{const r=await fetch(`${path}?wais=${Date.now()}`,{cache:'no-store'});if(!r.ok) throw new Error(`HTTP ${r.status}`);return r.json();};
  const weekday=(zone)=>new Intl.DateTimeFormat('en-US',{timeZone:zone,weekday:'short'}).format(new Date());
  const parts=(zone)=>Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:zone,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).map(x=>[x.type,x.value]));
  const minutes=(zone)=>{const p=parts(zone);return Number(p.hour)*60+Number(p.minute);};
  const isWeekend=zone=>['Sat','Sun'].includes(weekday(zone));
  function hkFuturesOpen(){
    if(isWeekend('Asia/Hong_Kong')) return false;
    const m=minutes('Asia/Hong_Kong');
    return (m>=510&&m<=980)||(m>=1020&&m<=1800);
  }
  function usMarketsOpen(){
    if(isWeekend('America/New_York')) return false;
    const m=minutes('America/New_York');
    return m>=240&&m<=1200;
  }
  function fmt(n,d=2){const x=Number(n);return Number.isFinite(x)?x.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d}):'—';}
  function signed(n,d=2){const x=Number(n);return Number.isFinite(x)?`${x>=0?'+':''}${x.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d})}`:'—';}
  function pct(n){const x=Number(n);return Number.isFinite(x)?`${x>=0?'+':''}${x.toFixed(2)}%`:'—';}
  async function patch(){
    try{
      const data=await fetchJSON('market-indicators.json');
      const q=data?.indicators?.HSIF;
      if(q && !hkFuturesOpen()){
        if($('hsifValue')) $('hsifValue').textContent=fmt(q.value);
        if($('hsifChange')) $('hsifChange').textContent=`${signed(q.change)} · ${pct(q.changePercent)} · MARKET CLOSED`;
        const desc=$('hsifValue')?.closest('.market-indicator-card')?.querySelector('p');
        if(desc) desc.textContent=`LAST VERIFIED SESSION · ${q.asOf||q.regularCloseDate||'time unavailable'}`;
      }
      const badge=$('marketIndicatorsUpdated');
      if(badge && !usMarketsOpen() && /STALE/i.test(badge.textContent||'')){
        badge.textContent='MARKETS CLOSED · LAST VERIFIED SESSION';
      }
    }catch(e){console.warn('[WAIS] closed-market patch failed',e);}
  }
  window.addEventListener('load',()=>setTimeout(patch,500));
  window.addEventListener('wais:quotes-updated',()=>setTimeout(patch,60));
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible') setTimeout(patch,80);});
  setInterval(patch,5*60*1000);
})();
