// WAIS INCOME v2.1 — sanitized public safe-entry + universe-governance layer.
// Public UI only. Proprietary ranking weights and private portfolio logic remain outside the public frontend.
(function(){
  const d = window.WAIS_MARKET_DATA || (window.WAIS_MARKET_DATA = {});
  d.incomeArchitecture = d.incomeArchitecture || {};
  d.incomeArchitecture.version = '2.1';
  d.incomeArchitecture.safeEntry = {
    name: 'WAIS SAFE ENTRY ZONE',
    rule: 'A favourable price zone is necessary but never sufficient for INCOME READY 1. Income quality, NAV/total-return health, distribution sustainability, liquidity, underlying/event risk and timing must still pass.',
    publicMethod: 'When an approved research band exists, the public site derives the zone from the latest 20D average plus the stored research band. No approved band is shown as Pending.'
  };
  d.incomeArchitecture.universeGovernance = {
    actions: ['DISCOVER','RESEARCH','PROMOTE','KEEP','DOWNGRADE','PHASE OUT / REMOVE'],
    rule: 'The Income universe is reviewed dynamically. A fund can be promoted when evidence and price improve, or phased out when income quality, NAV/total return, liquidity, structure or relative opportunity deteriorates.'
  };
  d.incomeArchitecture.current30dRule = 'Current 30D Income Rate uses actual distributions recorded in the rolling last 30 days divided by the latest regular close. It changes when the 30-day cash window or market price changes.';

  let apply30dFilter=()=>{};
  function n(v){ const x=Number(v); return Number.isFinite(x)?x:null; }
  function pct(v){ const x=n(v); return x==null?'—':`${x.toFixed(2)}%`; }
  function money(v,currency='USD'){ const x=n(v); return x==null?'—':`${currency} ${x.toFixed(2)}`; }
  function esc(v=''){ return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }
  function byTicker(ticker){ return (d.incomeEtfs||[]).find(x=>String(x.ticker||'').toUpperCase()===ticker); }
  function quote(ticker,item){
    if(typeof livePrices==='undefined') return {};
    return livePrices[String(item?.priceSymbol||ticker).toUpperCase()] || livePrices[ticker] || {};
  }
  function safeZone(item,q){
    const sma=n(q.sma20), lo=n(item?.entryBandLowPct), hi=n(item?.entryBandHighPct);
    if(sma==null || sma<=0 || lo==null || hi==null) return null;
    const a=sma*(1+lo/100), b=sma*(1+hi/100);
    return {low:Math.min(a,b),high:Math.max(a,b)};
  }
  function stage(item,current,zone){
    const s=String(item?.status||'RESEARCH').toUpperCase();
    if(/^INCOME READY 1$/.test(s)) return 'INCOME READY 1';
    if(s.includes('CANDIDATE+')) return 'INCOME CANDIDATE+';
    if(s.includes('CANDIDATE')) return 'INCOME CANDIDATE';
    if(s.includes('BELOW 3')) return 'PHASE OUT';
    if(zone && current!=null && current>=zone.low && current<=zone.high) return 'PRICE READY';
    if(s.includes('WATCH')||s.includes('WAIT')) return 'WATCH INCOME';
    return 'RESEARCH';
  }
  function universeAction(item){
    const s=String(item?.status||'').toUpperCase();
    if(s.includes('BELOW 3')) return 'PHASE OUT';
    if(/^INCOME READY 1$/.test(s)) return 'MANAGE';
    if(s.includes('CANDIDATE')) return 'PROMOTION QUEUE';
    if(s.includes('WATCH')||s.includes('WAIT')) return 'ACTIVE WATCH';
    return 'RESEARCH';
  }
  function entryRateRange(q,zone){
    const rate=n(q.current30dIncomeRate), close=n(q.regularClose);
    if(rate==null || close==null || close<=0 || !zone) return null;
    const cash30=close*rate/100;
    return {atLow:cash30/zone.low*100,atHigh:cash30/zone.high*100};
  }

  function decorateCards(){
    if(typeof livePrices==='undefined') return;
    document.querySelectorAll('.income-card').forEach(card=>{
      const ticker=card.querySelector('.income-title-row h3')?.textContent?.trim()?.toUpperCase();
      if(!ticker) return;
      const item=byTicker(ticker); if(!item) return;
      const q=quote(ticker,item), current=n(q.price), zone=safeZone(item,q), rr=entryRateRange(q,zone);
      const current30=n(q.current30dIncomeRate), sustainable=n(q.sustainableIncomeYield);
      card.dataset.income30d = current30==null?'':String(current30);
      card.dataset.incomeStage = stage(item,current,zone);

      let box=card.querySelector('.wais-safe-entry-box');
      if(!box){
        box=document.createElement('div'); box.className='wais-safe-entry-box';
        const hero=card.querySelector('.yield-hero');
        if(hero) hero.insertAdjacentElement('afterend',box); else card.querySelector('.stock-meta')?.insertAdjacentElement('beforebegin',box);
      }
      const zoneText=zone?`${money(zone.low,q.currency||item.currency)} – ${money(zone.high,q.currency||item.currency)}`:'Pending';
      const rateText=rr?`${pct(rr.atHigh)} – ${pct(rr.atLow)}`:'—';
      const inZone=zone&&current!=null&&current>=zone.low&&current<=zone.high;
      box.innerHTML=`
        <div class="safe-entry-head"><span>WAIS SAFE ENTRY</span><b>${esc(stage(item,current,zone))}</b></div>
        <div class="safe-entry-grid">
          <div><span>Current Price</span><strong>${esc(money(current,q.currency||item.currency))}</strong></div>
          <div><span>Sustainable Yield</span><strong>${esc(pct(sustainable))}</strong></div>
          <div><span>Entry Zone</span><strong>${esc(zoneText)}</strong></div>
          <div><span>30D Rate @ Entry</span><strong>${esc(rateText)}</strong></div>
        </div>
        <div class="safe-entry-foot">${inZone?'IN ENTRY ZONE · ':zone?'WAIT FOR ENTRY · ':'ENTRY PENDING · '}${esc(universeAction(item))}</div>`;
    });
  }

  function findCard(ticker){
    return [...document.querySelectorAll('.income-card')].find(card=>card.querySelector('.income-title-row h3')?.textContent?.trim()?.toUpperCase()===ticker);
  }
  function showReadyTicker(ticker){
    const sel=document.getElementById('income30dFilter');
    if(sel){ sel.value='all'; apply30dFilter(); }
    const card=findCard(ticker);
    if(!card) return;
    card.style.display='';
    card.scrollIntoView({behavior:'smooth',block:'center'});
    card.classList.add('wais-ready-focus');
    setTimeout(()=>card.classList.remove('wais-ready-focus'),1800);
  }
  function renderReadyBar(){
    const grid=document.getElementById('weeklyIncomeGrid')||document.getElementById('monthlyIncomeGrid')||document.getElementById('tacticalIncomeGrid');
    if(!grid) return;
    const section=grid.closest('.page-section')||grid.parentElement;
    if(!section) return;
    let bar=document.getElementById('waisIncomeReadyBar');
    if(!bar){
      bar=document.createElement('div'); bar.id='waisIncomeReadyBar'; bar.className='wais-income-ready-bar';
      const anchor=section.querySelector('.income-controls')||grid;
      anchor.insertAdjacentElement('beforebegin',bar);
    }
    const ready=(d.incomeEtfs||[]).filter(item=>String(item.status||'').toUpperCase().includes('READY'));
    if(!ready.length){ bar.innerHTML='<span>INCOME READY 1</span><b>NONE</b>'; return; }
    bar.innerHTML=`<span>INCOME READY 1</span><div>${ready.map(item=>`<button type="button" data-ready-ticker="${esc(String(item.ticker).toUpperCase())}">${esc(String(item.ticker).toUpperCase())} · VIEW</button>`).join('')}</div>`;
    bar.querySelectorAll('button[data-ready-ticker]').forEach(btn=>btn.addEventListener('click',()=>showReadyTicker(btn.dataset.readyTicker)));
  }

  function install30dFilter(){
    const old=document.getElementById('incomeYieldFilter');
    if(!old || document.getElementById('income30dFilter')) return;
    let allOpt=[...old.options].find(o=>Number(o.value)===0);
    if(!allOpt){ allOpt=document.createElement('option'); allOpt.value='0'; allOpt.textContent='All'; old.prepend(allOpt); }
    old.value='0'; old.style.display='none';
    const sel=document.createElement('select'); sel.id='income30dFilter'; sel.className=old.className;
    sel.innerHTML='<option value="all">全部</option><option value="lte3">≤ 3%</option><option value="gte3">≥ 3%</option><option value="gte4">≥ 4%</option><option value="gte5" selected>≥ 5%｜5%+</option>';
    old.insertAdjacentElement('afterend',sel);
    const label=old.closest('label')?.querySelector('span'); if(label) label.textContent='Current 30D Income Rate';

    apply30dFilter=()=>{
      const mode=sel.value; let visible=0;
      document.querySelectorAll('.income-card').forEach(card=>{
        const r=n(card.dataset.income30d); let show=true;
        if(mode==='lte3') show=r!=null&&r<=3;
        else if(mode==='gte3') show=r!=null&&r>=3;
        else if(mode==='gte4') show=r!=null&&r>=4;
        else if(mode==='gte5') show=r!=null&&r>=5;
        card.style.display=show?'':'none'; if(show) visible++;
      });
      const count=document.getElementById('incomeYieldMatchCount'); if(count) count.textContent=visible;
    };
    const rerenderAll=()=>{ old.value='0'; old.dispatchEvent(new Event('change',{bubbles:true})); setTimeout(refreshIncomeUI,140); };
    sel.addEventListener('change',rerenderAll);
    setTimeout(rerenderAll,300);
  }

  function refreshIncomeUI(){
    decorateCards();
    renderReadyBar();
    apply30dFilter();
    if(typeof window.WAIS_APPLY_INCOME_METRICS==='function') window.WAIS_APPLY_INCOME_METRICS();
  }

  const css=document.createElement('style');
  css.textContent=`
    .wais-safe-entry-box{margin:12px 0;padding:12px;border:1px solid rgba(83,199,170,.30);border-radius:12px;background:rgba(17,63,62,.14)}
    .safe-entry-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:9px}.safe-entry-head span{font-size:10px;font-weight:800;letter-spacing:1.2px;color:#8fa7ca}.safe-entry-head b{font-size:11px;text-align:right;color:#8de0c3}
    .safe-entry-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.safe-entry-grid div{display:flex;flex-direction:column;gap:3px}.safe-entry-grid span{font-size:10px;color:#8193ae}.safe-entry-grid strong{font-size:13px;line-height:1.25}.safe-entry-foot{margin-top:9px;padding-top:8px;border-top:1px solid rgba(255,255,255,.08);font-size:10px;line-height:1.35;color:#aab7cb}
    .wais-income-ready-bar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:0 0 16px;padding:12px 14px;border:1px solid rgba(95,226,184,.35);border-radius:12px;background:rgba(18,68,57,.22)}.wais-income-ready-bar>span{font-size:11px;font-weight:850;letter-spacing:1.1px;color:#8fa7ca}.wais-income-ready-bar b{color:#c9d4e6}.wais-income-ready-bar div{display:flex;gap:8px;flex-wrap:wrap}.wais-income-ready-bar button{border:1px solid rgba(95,226,184,.48);background:rgba(35,116,91,.28);color:#bff8df;border-radius:999px;padding:7px 11px;font-size:11px;font-weight:800;cursor:pointer}.wais-ready-focus{outline:2px solid rgba(95,226,184,.9);outline-offset:4px}
    @media(max-width:620px){.safe-entry-grid{grid-template-columns:1fr 1fr}.safe-entry-head{flex-direction:column}.safe-entry-head b{text-align:left}.wais-income-ready-bar{align-items:flex-start;flex-direction:column}}
  `; document.head.appendChild(css);

  document.addEventListener('DOMContentLoaded',()=>{ setTimeout(()=>{refreshIncomeUI();install30dFilter();},900); });
  window.addEventListener('focus',()=>setTimeout(refreshIncomeUI,120));
  window.addEventListener('wais:quotes-updated',()=>setTimeout(refreshIncomeUI,120));
  window.WAIS_REFRESH_INCOME_UI=refreshIncomeUI;
})();
