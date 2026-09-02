// WAIS canonical UI sync v1.2 — stable event-driven sync without observer feedback loops.
(function(){
  const $=id=>document.getElementById(id);
  const clean=v=>String(v||'').trim();
  const modeFamily=mode=>{
    const s=clean(mode).toUpperCase();
    if(/AGGRESSIVE|RISK[- ]?ON/.test(s)) return 'AGGRESSIVE';
    if(/CAUTIOUS/.test(s)) return 'CAUTIOUS';
    if(/DEFENSE|DEFENSIVE|MOSTLY CASH|CRISIS/.test(s)) return 'DEFENSIVE';
    if(/WAIT|SELECTIVE/.test(s)) return 'SELECTIVE';
    return s||'WAIT';
  };
  const modeLabel=mode=>{
    const family=modeFamily(mode);
    if(family==='CAUTIOUS') return 'Cautious';
    if(family==='DEFENSIVE') return 'Defensive';
    if(family==='AGGRESSIVE') return 'Aggressive';
    if(family==='SELECTIVE') return 'Selective / Wait';
    return family;
  };
  const canonicalSignalMeta=status=>{
    const label=clean(status)||'NO SIGNAL';
    const c=typeof window.WAIS_COLOR_FOR_STATUS==='function'?window.WAIS_COLOR_FOR_STATUS(label):'grey';
    return {className:`signal-${c}`,label,waisColor:c};
  };
  const applyColour=(el,status)=>{
    if(!el)return;
    el.classList.remove('good','positive','warning','danger','yellow-pill','green-pill','red-pill','purple-pill','blue-pill','signal-orange');
    const c=typeof window.WAIS_COLOR_FOR_STATUS==='function'?window.WAIS_COLOR_FOR_STATUS(status):'grey';
    ['green','yellow','blue','purple','red','grey'].forEach(x=>el.classList.remove(`wais-color-${x}`,`signal-${x}`));
    el.classList.add(`wais-color-${c}`);
    el.dataset.waisCanonicalColour=c;
  };
  let syncing=false;
  function sync(){
    if(syncing)return;
    syncing=true;
    try{
      window.getSignalMeta=canonicalSignalMeta;
      window.applySignalStatus=(el,status='')=>{if(el){el.classList.add('status-text');applyColour(el,status);}};
      const d=window.WAIS_MARKET_DATA||{};
      const mode=clean(d.marketMode)||'WAIT';
      const family=modeFamily(mode);
      const posture=family==='CAUTIOUS'?'CAUTIOUS':family==='DEFENSIVE'?'DEFENSIVE':family==='AGGRESSIVE'?'AGGRESSIVE':'SELECTIVE';
      const postureText=clean(d.defenseStatus)||(family==='CAUTIOUS'?'CAUTIOUS · SELECTIVE LONG WATCH':posture);
      const set=(id,text,status=text)=>{
        const el=$(id);if(!el)return;
        const next=String(text);
        if(el.textContent!==next)el.textContent=next;
        applyColour(el,status);
      };
      set('marketMode',mode,mode);
      set('actionPill',mode,mode);
      set('defenseStatus',postureText,posture);
      set('riskLabel',modeLabel(mode),mode);
      set('riskResultMode',modeLabel(mode),mode);
      if(d.riskScore!=null)set('riskScoreMetric',d.riskScore,mode);
      if(d.recommendedCash!=null)set('cashMetric',d.recommendedCash,'NO SIGNAL');
      const dot=document.querySelector('.hero-status .status-dot');
      if(dot){
        dot.classList.remove('green','yellow','orange','red','blue','purple','grey');
        const c=typeof window.WAIS_COLOR_FOR_STATUS==='function'?window.WAIS_COLOR_FOR_STATUS(mode):'yellow';
        dot.classList.add(c==='green'?'green':c==='purple'?'purple':c==='red'?'red':c==='blue'?'blue':c==='grey'?'grey':'yellow');
        dot.dataset.waisCanonicalColour=c;
      }
      if(typeof window.WAIS_APPLY_COLOR_STANDARD==='function')window.WAIS_APPLY_COLOR_STANDARD();
    } finally { syncing=false; }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,40),{once:true});
  else setTimeout(sync,0);
  window.addEventListener('load',()=>setTimeout(sync,120),{once:true});
  window.addEventListener('wais:quotes-updated',()=>setTimeout(sync,50));
  window.WAIS_SYNC_CANONICAL_UI=sync;
})();
