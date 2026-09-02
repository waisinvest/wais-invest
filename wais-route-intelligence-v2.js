// WAIS ROUTE INTELLIGENCE v2.5
// Registry = verified product identity. Display = current active WAIS opportunity set.
// A verified product may remain in the registry after its underlying leaves the active pipeline,
// but it must then disappear from the Route Intelligence active display automatically.
(function(){
  const d=window.WAIS_MARKET_DATA||(window.WAIS_MARKET_DATA={});
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean=s=>String(s||'').trim().toUpperCase();
  const finite=v=>Number.isFinite(Number(v));
  const colour=s=>window.WAIS_COLOR_FOR_STATUS?window.WAIS_COLOR_FOR_STATUS(s):'grey';
  const money=v=>finite(v)&&Number(v)>0?`$${Number(v).toFixed(2)}`:'DATA GAP';
  const pct=v=>finite(v)?`${Number(v).toFixed(2)}%`:'DATA GAP';
  const compactMoney=v=>finite(v)?`$${Number(v)>=1e9?(Number(v)/1e9).toFixed(2)+'B':Number(v)>=1e6?(Number(v)/1e6).toFixed(2)+'M':Math.round(Number(v)).toLocaleString('en-US')}`:'DATA GAP';
  const meta={
    stock:{label:'STOCK',icon:'◆',cls:'wais-route-type-stock'},
    leveraged:{label:'BULLISH LEVERAGED',icon:'⚡',cls:'wais-route-type-leveraged'},
    bearish:{label:'BEARISH / INVERSE',icon:'▼',cls:'wais-route-type-bearish'},
    income:{label:'INCOME',icon:'$',cls:'wais-route-type-income'}
  };
  window.WAIS_ROUTE_TYPE_META=Object.freeze(meta);

  const stock=t=>(d.focusStocks||[]).find(x=>clean(x.ticker)===clean(t))||null;
  const routes=()=>d.relatedRoutes||{};
  const quotes=()=>window.WAIS_RUNTIME_QUOTES||{};
  const hasRouteProduct=r=>!!r&&(
    (Array.isArray(r.leveraged)&&r.leveraged.filter(Boolean).length>0)||
    (Array.isArray(r.bearish)&&r.bearish.filter(Boolean).length>0)||
    (Array.isArray(r.income)&&r.income.filter(Boolean).length>0)
  );
  const tickerOf=x=>clean(typeof x==='string'?x:(x?.ticker||''));
  const isInactiveStatus=s=>/PHASE\s*OUT|REJECT|EXIT|ARCHIVE|NO CURRENT SETUP/i.test(String(s||''));

  function pipelineTickers(){
    const p=d.opportunityPipeline||{};
    const groups=[p.ready1,p.techReady,p.candidatePlus,p.candidate];
    const declared=groups.flatMap(x=>Array.isArray(x)?x:[]).map(tickerOf).filter(Boolean);
    if(declared.length) return new Set(declared);
    return new Set((d.focusStocks||[])
      .filter(x=>x.showInWatchlist===true && !isInactiveStatus(x.stance))
      .map(x=>clean(x.ticker)).filter(Boolean));
  }

  function activeRouteTickers(){
    const active=pipelineTickers();
    return [...active].filter(t=>hasRouteProduct(routes()[t]) && stock(t) && !isInactiveStatus(stock(t)?.stance));
  }
  window.WAIS_ACTIVE_ROUTE_TICKERS=activeRouteTickers;

  function ensureShell(){
    const nav=document.querySelector('.nav-list');
    const top=nav?.querySelector('[data-section="top-picks"]');
    if(nav&&top&&!nav.querySelector('[data-section="route-intelligence"]')){
      const b=document.createElement('button');b.className='nav-item';b.dataset.section='route-intelligence';b.textContent='Route Intelligence';top.insertAdjacentElement('afterend',b);
    }
    const main=document.querySelector('main');
    const watch=document.getElementById('watchlist');
    if(main&&!document.getElementById('route-intelligence')){
      const s=document.createElement('section');s.className='page-section';s.id='route-intelligence';
      s.innerHTML=`<div class="section-banner"><div><span class="panel-kicker">WAIS EXECUTION VEHICLE INTELLIGENCE</span><h2>Route Intelligence｜投資路線</h2><p>只顯示目前 WAIS active opportunity pipeline 內、並至少有一條 independently verified Bullish Leveraged、Bearish / Inverse 或 Income product 的 underlying。Phase Out / Reject / Exit 會自動離開本頁，但已驗證產品身份仍保留在底層 Registry。</p></div></div><article class="panel route-intro-panel"><div class="panel-head"><div><span class="panel-kicker">WAIS ROUTE RULE · REGISTRY ${esc(d.routeRegistry?.version||'2.4')}</span><h3>Active underlying first · Direction-specific READY</h3></div><div class="route-audit-chip">AUTO-ALIGNED</div></div><div class="weekly-risk-note">Stock READY ≠ Bullish Leveraged READY ≠ Bearish READY ≠ Income READY。Route identity 不可令已離開 active pipeline 的 underlying 繼續留在主畫面；Bullish / Bearish routes 必須比較 activity / liquidity / tracking；Income 必須比較 cash yield、frequency、sustainable income、NAV/ROC/total-return。資料不足只可 VALIDATING / DATA GAP。</div></article><div id="routeIntelligenceGrid" class="route-intelligence-grid"></div>`;
      if(watch)main.insertBefore(s,watch);else main.appendChild(s);
    }
  }
  ensureShell();

  const chip=s=>`<span class="wais-route-decision wais-color-${colour(s)}">${esc(s||'DATA GAP')}</span>`;
  const kind=(type,t)=>{const m=meta[type];return `<div class="wais-route-kind ${m.cls}"><span>${m.icon}</span><b>${m.label}</b>${t?`<em>${esc(t)}</em>`:''}</div>`;};
  const metric=(k,v)=>`<div class="route-metric"><span>${esc(k)}</span><b>${esc(v)}</b></div>`;

  function metrics(t,type){
    const q=quotes()[clean(t)]||{};
    const rows=[metric('Price',money(q.price)),metric('Session',q.session||'DATA GAP'),metric('20D $ Volume',compactMoney(q.avgDollarVolume20d)),metric('60D Realized Vol',pct(q.realizedVol60dAnnualizedPct))];
    if(type==='leveraged'||type==='bearish'){
      rows.push(metric('Daily Target',finite(q.targetDailyMultiple)?`${Number(q.targetDailyMultiple).toFixed(1)}x`:'DATA GAP'));
      rows.push(metric('60D Tracking Error',finite(q.trackingErrorMeanAbs60dPct)?`${Number(q.trackingErrorMeanAbs60dPct).toFixed(2)}%`:'DATA GAP'));
    }
    if(type==='income'){
      rows.push(metric('TTM / Since-Inception Dist. Yield',pct(q.trailing12mDistributionYield)));
      rows.push(metric('30D Cash / Price',pct(q.current30dIncomeRate)));
      rows.push(metric('Sustainable',pct(q.sustainableIncomeYield)));
      rows.push(metric('Consistency',finite(q.incomeConsistency)?`${Number(q.incomeConsistency).toFixed(0)}/100`:'DATA GAP'));
      rows.push(metric('Frequency',q.observedFrequency||'DATA GAP'));
      rows.push(metric('TTM Coverage',q.ttmCoverageStatus||'DATA GAP'));
    }
    return rows.join('');
  }

  function candidate(list,type){
    const all=(list||[]).filter(Boolean).map(t=>({ticker:clean(t),q:quotes()[clean(t)]||{}}));
    if(!all.length)return {ticker:null,status:type==='bearish'?'NO VERIFIED BEARISH ROUTE':'NO VERIFIED ROUTE',reason:'No independently verified live product in the current registry.'};
    const withActivity=all.filter(x=>finite(x.q.avgDollarVolume20d));
    if(!withActivity.length)return {ticker:all[0].ticker,status:'VALIDATING · DATA GAP',reason:`Verified product${all.length>1?'s':''}: ${all.map(x=>x.ticker).join(' · ')}. Current activity/liquidity metrics are incomplete, so no Best label is allowed.`};
    let ranked=[...withActivity];
    if(type==='leveraged'||type==='bearish')ranked.sort((a,b)=>Number(b.q.avgDollarVolume20d)-Number(a.q.avgDollarVolume20d));
    else{
      const complete=withActivity.filter(x=>finite(x.q.trailing12mDistributionYield)&&finite(x.q.sustainableIncomeYield)&&finite(x.q.incomeConsistency));
      ranked=(complete.length?complete:withActivity).sort((a,b)=>{
        const ae=(finite(a.q.sustainableIncomeYield)?Number(a.q.sustainableIncomeYield):0)+(finite(a.q.incomeConsistency)?Number(a.q.incomeConsistency)/20:0);
        const be=(finite(b.q.sustainableIncomeYield)?Number(b.q.sustainableIncomeYield):0)+(finite(b.q.incomeConsistency)?Number(b.q.incomeConsistency)/20:0);
        return be-ae||Number(b.q.avgDollarVolume20d)-Number(a.q.avgDollarVolume20d);
      });
    }
    const x=ranked[0];
    const trackingOK=!(type==='leveraged'||type==='bearish')||finite(x.q.trackingErrorMeanAbs60dPct);
    const incomeOK=type!=='income'||(finite(x.q.trailing12mDistributionYield)&&finite(x.q.sustainableIncomeYield)&&finite(x.q.incomeConsistency));
    const status=trackingOK&&incomeOK?'VALIDATING · EVIDENCE PRESENT':'VALIDATING · DATA GAP';
    let reason='Current evidence leader among verified income products. NAV/ROC/total-return validation remains mandatory before Best/READY.';
    if(type==='leveraged')reason='Current activity leader among verified bullish leveraged products; tracking/spread evidence must remain acceptable before any Best/READY label.';
    if(type==='bearish')reason='Current activity leader among verified bearish/inverse products; bearish price evidence plus tracking/spread validation is required before Bearish READY.';
    return {ticker:x.ticker,status,reason};
  }

  function altSummary(list,type,selected){
    const rows=(list||[]).filter(Boolean).map(clean).filter(t=>t!==clean(selected));
    if(!rows.length)return '—';
    return rows.map(t=>{
      const q=quotes()[t]||{};
      if(type==='leveraged'||type==='bearish')return `${t} · ${finite(q.targetDailyMultiple)?Number(q.targetDailyMultiple).toFixed(1)+'x':'Target DATA GAP'} · 20D$ ${compactMoney(q.avgDollarVolume20d)} · Track ${finite(q.trackingErrorMeanAbs60dPct)?Number(q.trackingErrorMeanAbs60dPct).toFixed(2)+'%':'DATA GAP'}`;
      return `${t} · 20D$ ${compactMoney(q.avgDollarVolume20d)} · Dist ${pct(q.trailing12mDistributionYield)} · ${q.observedFrequency||'DATA GAP'}`;
    }).join(' | ');
  }

  function box(type,t,status,note){
    const empty=status==='NO VERIFIED ROUTE'||status==='NO VERIFIED BEARISH ROUTE';
    return `<article class="route-detail-card ${meta[type].cls}">${kind(type,t)}<div class="route-status-line">${chip(status)}</div><div class="route-metrics-grid">${t?metrics(t,type):metric('Route',empty?'No verified live product':'DATA GAP')}</div><p>${esc(note||'')}</p>${t&&type==='income'?`<button class="route-link-btn" data-income-ticker="${esc(t)}">View Income ETF →</button>`:''}</article>`;
  }

  function one(t){
    const s=stock(t),r=routes()[t]||{};
    const lev=candidate(r.leveraged,'leveraged'),bear=candidate(r.bearish,'bearish'),inc=candidate(r.income,'income');
    // Current focus-stock decision ALWAYS outranks registry-time stockStatus snapshot.
    const stockStatus=s?.stance||r.stockStatus||'DATA GAP';
    const levStatus=lev.ticker?(lev.status.includes('DATA GAP')?lev.status:(r.leveragedStatus||lev.status)):(r.leveragedStatus||lev.status);
    const bearStatus=bear.ticker?(bear.status.includes('DATA GAP')?bear.status:(r.bearishStatus||bear.status)):(r.bearishStatus||bear.status);
    const incStatus=inc.ticker?(inc.status.includes('DATA GAP')?inc.status:(r.incomeStatus||inc.status)):(r.incomeStatus||inc.status);
    // Static registry preferences such as STOCK/PENDING are not current decisions.
    const pref=/READY/i.test(String(r.preferred||''))?r.preferred:'NONE / VALIDATING';
    const stockNote='Full underlying participation; stock route still requires its own Quality / Price / Timing approval.';
    const emptyNote=r.routeResearchNote||'No verified route evidence in the current registry.';
    const bearEmpty='No independently verified live same-underlying bearish/inverse product in the current registry.';
    return `<article class="panel route-underlying-card" data-route-underlying="${esc(t)}"><div class="panel-head route-underlying-head"><div><span class="panel-kicker">ACTIVE UNDERLYING ROUTE MAP</span><h3>${esc(t)}${s?.company?` · ${esc(s.company)}`:''}</h3></div><div>${chip(stockStatus)}</div></div><div class="route-preferred-bar"><span>WAIS PREFERRED ROUTE NOW</span><b>${esc(pref)}</b><small>Only independent direction-specific approval can move to READY 1.</small></div><div class="route-four-grid">${box('stock',r.stock||t,stockStatus,stockNote)}${box('leveraged',lev.ticker,levStatus,lev.ticker?lev.reason:emptyNote)}${box('bearish',bear.ticker,bearStatus,bear.ticker?bear.reason:bearEmpty)}${box('income',inc.ticker,incStatus,inc.ticker?inc.reason:(r.routeResearchNote||'No independently verified same-underlying income product in the current registry.'))}</div><div class="route-alternatives"><span>Bullish alternatives</span><b>${esc(altSummary(r.leveraged,'leveraged',lev.ticker))}</b><span>Bearish alternatives</span><b>${esc(altSummary(r.bearish,'bearish',bear.ticker))}</b><span>Income alternatives</span><b>${esc(altSummary(r.income,'income',inc.ticker))}</b></div><div class="route-card-actions"><button class="route-link-btn" data-stock-ticker="${esc(t)}">View Watchlist / Top Pick →</button></div></article>`;
  }

  function render(){
    const g=document.getElementById('routeIntelligenceGrid');if(!g)return;
    const ts=activeRouteTickers();
    g.innerHTML=ts.map(one).join('')||'<article class="panel">No active WAIS underlyings currently have an eligible verified leveraged, bearish or income route.</article>';
    g.dataset.activeRoutes=ts.join(',');
  }
  function openRoute(t){
    const ticker=clean(t);
    if(!activeRouteTickers().includes(ticker))return;
    document.querySelector('[data-section="route-intelligence"]')?.click();
    setTimeout(()=>document.querySelector(`[data-route-underlying="${CSS.escape(ticker)}"]`)?.scrollIntoView({behavior:'smooth',block:'start'}),120);
  }
  window.WAIS_OPEN_ROUTE=openRoute;

  function addLinks(){
    document.querySelectorAll('#topPicksGrid .stock-card,#watchlistCards .watch-card').forEach(card=>{
      const t=clean(card.querySelector('h3,h4')?.textContent);
      if(!t||!activeRouteTickers().includes(t)||card.querySelector('.wais-full-route-btn'))return;
      const b=document.createElement('button');b.type='button';b.className='route-link-btn wais-full-route-btn';b.textContent='View Full Route →';b.addEventListener('click',()=>openRoute(t));card.appendChild(b);
    });
  }
  document.addEventListener('click',e=>{
    const income=e.target.closest('[data-income-ticker]');if(income){document.querySelector('[data-section="income"]')?.click();return;}
    const st=e.target.closest('[data-stock-ticker]');if(st){const t=clean(st.dataset.stockTicker),s=stock(t);document.querySelector(`[data-section="${finite(s?.topPickRank)?'top-picks':'watchlist'}"]`)?.click();}
  });

  const css=document.createElement('style');css.id='wais-route-intelligence-v2-css';css.textContent=`.route-intelligence-grid{display:grid;gap:18px}.route-underlying-card{scroll-margin-top:24px}.route-underlying-head{align-items:flex-start}.route-preferred-bar{display:grid;grid-template-columns:auto auto 1fr;gap:12px;align-items:center;padding:11px 13px;margin-bottom:12px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(255,255,255,.035)}.route-preferred-bar span{font-size:9px;letter-spacing:.8px;opacity:.7}.route-preferred-bar b{font-size:13px}.route-preferred-bar small{font-size:10px;opacity:.65}.route-four-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.route-detail-card{border:1px solid rgba(255,255,255,.14);border-left:4px solid var(--route-accent);border-radius:14px;padding:13px;background:rgba(6,18,34,.44)}.wais-route-type-stock{--route-accent:#5f91ff}.wais-route-type-leveraged{--route-accent:#ff9f43}.wais-route-type-bearish{--route-accent:#ff6b6b}.wais-route-type-income{--route-accent:#39d7c7}.wais-route-kind{display:flex;align-items:center;gap:7px;color:var(--route-accent)}.wais-route-kind span{font-size:15px}.wais-route-kind b{font-size:10px;letter-spacing:1px}.wais-route-kind em{font-size:12px;font-style:normal;color:#f2f6ff;margin-left:auto}.route-status-line{margin:10px 0}.wais-route-decision{display:inline-flex;border:1px solid;border-radius:999px;padding:5px 8px;font-size:9px;font-weight:800}.route-metrics-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px}.route-metric{padding:7px;border:1px solid rgba(255,255,255,.08);border-radius:9px}.route-metric span{display:block;font-size:8px;opacity:.6}.route-metric b{font-size:10px;color:#f3f6fb}.route-detail-card p{font-size:10px;line-height:1.45;opacity:.72}.route-alternatives{display:grid;grid-template-columns:auto 1fr auto 1fr auto 1fr;gap:8px 10px;margin-top:11px;font-size:9px;align-items:start}.route-alternatives span{opacity:.55}.route-alternatives b{font-weight:600;line-height:1.45}.route-link-btn{border:1px solid rgba(101,170,255,.32);background:rgba(70,125,190,.10);color:#b8dcff;border-radius:9px;padding:7px 9px;font-size:9px;cursor:pointer}.route-card-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.route-audit-chip{font-size:9px;padding:6px 9px;border:1px solid rgba(75,208,180,.35);border-radius:999px;color:#81e6d1}.wais-full-route-btn{margin-top:10px;width:100%}@media(max-width:1100px){.route-four-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:820px){.route-four-grid{grid-template-columns:1fr}.route-preferred-bar{grid-template-columns:1fr}.route-alternatives{grid-template-columns:1fr}.route-underlying-card{padding:12px}.route-metrics-grid{grid-template-columns:1fr 1fr}}`;
  document.head.appendChild(css);

  const refresh=()=>{render();addLinks();};
  window.WAIS_REFRESH_ROUTE_INTELLIGENCE=refresh;
  const start=()=>{refresh();['topPicksGrid','watchlistCards'].forEach(id=>{const n=document.getElementById(id);if(n)new MutationObserver(()=>setTimeout(addLinks,30)).observe(n,{childList:true});});};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
  window.addEventListener('wais:quotes-updated',()=>setTimeout(refresh,50));
  window.addEventListener('wais:decision-state-updated',()=>setTimeout(refresh,0));
})();
