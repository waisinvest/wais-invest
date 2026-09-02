// WAIS Route Selector v1.4 — mobile-safe compact summary for Top Picks / Watchlist.
// Full detail and ranking live in Route Intelligence; this summary never implies approval.
(() => {
  const d=window.WAIS_MARKET_DATA||(window.WAIS_MARKET_DATA={});
  const routes=d.relatedRoutes||{
    GFS:{stock:'GFS',stockStatus:'TECH READY · PENDING CONFIRMATION',leveraged:[],leveragedStatus:'NO VERIFIED ROUTE',income:[],incomeStatus:'NO VERIFIED ROUTE',preferred:'STOCK / PENDING'},
    NVDA:{stock:'NVDA',stockStatus:'CANDIDATE+ · EVENT WATCH',leveraged:['NVDL','NVDX','NVDU','NVDB'],leveragedStatus:'VALIDATING',income:['NVDY','NVYY','NYYY'],incomeStatus:'VALIDATING',preferred:'NONE / VALIDATING'},
    GOOGL:{stock:'GOOGL',stockStatus:'CANDIDATE+ · ENTRY WATCH',leveraged:['GGLL','GOU','GOOL'],leveragedStatus:'VALIDATING',income:['GOOY','GOOW','GOOP'],incomeStatus:'VALIDATING',preferred:'NONE / VALIDATING'},
    MU:{stock:'MU',stockStatus:'CANDIDATE+ · HBM STRENGTH',leveraged:['MUU','MULL','MIC'],leveragedStatus:'VALIDATING',income:['MUYY','MUIB'],incomeStatus:'VALIDATING',preferred:'NONE / VALIDATING'},
    AVGO:{stock:'AVGO',stockStatus:'CANDIDATE · PULLBACK REVIEW',leveraged:['AVL','AVGU','AVGX','AVGG','AVGC'],leveragedStatus:'VALIDATING',income:['AVGW'],incomeStatus:'VALIDATING',preferred:'NONE / VALIDATING'},
    TSM:{stock:'TSM',stockStatus:'WATCH / REVIEW',leveraged:['TSMX','TSMU','TSMG','TWSC'],leveragedStatus:'VALIDATING',income:['TSMY','TMYY'],incomeStatus:'VALIDATING',preferred:'NONE / VALIDATING'},
    RKLB:{stock:'RKLB',stockStatus:'CANDIDATE · POST-EARNINGS',leveraged:['RKLX','RKXX'],leveragedStatus:'VALIDATING',income:[],incomeStatus:'NO VERIFIED ROUTE',preferred:'NONE / VALIDATING'},
    TSEM:{stock:'TSEM',stockStatus:'CANDIDATE',leveraged:['TSEG','TSEU'],leveragedStatus:'VALIDATING',income:[],incomeStatus:'NO VERIFIED ROUTE',preferred:'NONE / VALIDATING'},
    AXTI:{stock:'AXTI',stockStatus:'CANDIDATE · HIGH VOLATILITY',leveraged:['AXTX','AXTU','AXTL','AXTC'],leveragedStatus:'VALIDATING',income:[],incomeStatus:'NO VERIFIED ROUTE',preferred:'NONE / VALIDATING'},
    MRVL:{stock:'MRVL',stockStatus:'WATCH / REVIEW',leveraged:[],leveragedStatus:'NO VERIFIED ROUTE',income:[],incomeStatus:'NO VERIFIED ROUTE',preferred:'STOCK / REVIEW'}
  };
  d.relatedRoutes=routes;
  let prices={};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=v=>{const n=Number(v);return Number.isFinite(n)&&n>0?'$'+n.toFixed(2):'—'};
  const pct=v=>{const n=Number(v);return Number.isFinite(n)?`${n>=0?'+':''}${n.toFixed(2)}%`:'—'};
  function product(t,type){
    const q=prices[t]||{};
    const line=`${money(q.price)}${Number.isFinite(Number(q.changePercent))?' · '+pct(q.changePercent):''}`;
    const activity=Number.isFinite(Number(q.avgDollarVolume20d))?` · 20D $Vol ${Math.round(Number(q.avgDollarVolume20d)/1e6)}M`:'';
    const income=type==='income' ? `<small>${esc(q.observedFrequency||'')} ${Number.isFinite(Number(q.current30dIncomeRate))?'· 30D '+Number(q.current30dIncomeRate).toFixed(2)+'%':''}${Number.isFinite(Number(q.sustainableIncomeYield))?' · Sust. '+Number(q.sustainableIncomeYield).toFixed(1)+'%':''}</small>` : '';
    return `<span class="wais-route-product ${type==='leveraged'?'wais-route-product-leveraged':type==='income'?'wais-route-product-income':'wais-route-product-stock'}"><b>${type==='leveraged'?'⚡ ':''}${esc(t)}</b><small>${line}${activity}</small>${income}</span>`;
  }
  function badge(k,v){return `<div class="wais-route-status"><span>${k}</span><b>${esc(v||'DATA GAP')}</b></div>`;}
  function markup(t){
    const r=routes[t]; if(!r)return '';
    return `<details class="wais-route-selector"><summary><span>RELATED ROUTES</span><b>Stock · ⚡ Leveraged · Income</b><em>Tap to compare</em></summary><div class="wais-route-status-row">${badge('STOCK',r.stockStatus)}${badge('⚡ LEVERAGED',r.leveragedStatus)}${badge('INCOME',r.incomeStatus)}${badge('WAIS PREFERRED',r.preferred)}</div><div class="wais-route-policy">Compact summary only. Full ranking, selection evidence and independent READY live in Route Intelligence.</div><div class="wais-route-grid"><div class="wais-route-box wais-route-type-stock"><strong>STOCK ROUTE</strong>${product(r.stock,'stock')}</div><div class="wais-route-box wais-route-type-leveraged"><strong>⚡ LEVERAGED ROUTE</strong><div class="wais-route-products">${r.leveraged.length?r.leveraged.map(x=>product(x,'leveraged')).join(''):'No verified route'}</div></div><div class="wais-route-box wais-route-type-income"><strong>INCOME ROUTE</strong><div class="wais-route-products">${r.income.length?r.income.map(x=>product(x,'income')).join(''):'No verified route'}</div></div></div></details>`;
  }
  function inject(){
    document.querySelectorAll('.stock-card,.watch-card').forEach(card=>{
      const h=card.querySelector('h3,h4'); const t=String(h?.textContent||'').trim().toUpperCase();
      if(!routes[t]||card.querySelector('.wais-route-selector'))return;
      card.insertAdjacentHTML('beforeend',markup(t));
    });
  }
  async function load(){
    try{const r=await fetch(`stock-prices.json?r=${Date.now()}`,{cache:'no-store'});if(r.ok){const j=await r.json();prices=j.prices||{};}}
    catch(e){console.error('[WAIS] route price refresh failed',e);}
    inject();
  }
  const css=document.createElement('style');
  css.textContent=`.wais-route-selector{margin-top:14px;border:1px solid rgba(87,213,255,.35);border-radius:14px;background:rgba(4,18,35,.42);overflow:hidden}.wais-route-selector summary{cursor:pointer;list-style:none;display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:12px 14px}.wais-route-selector summary::-webkit-details-marker{display:none}.wais-route-selector summary span{font-size:10px;color:#7ee7ff}.wais-route-selector summary b{font-size:12px}.wais-route-selector summary em{font-size:10px;font-style:normal;opacity:.7}.wais-route-status-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:0 12px 10px}.wais-route-status,.wais-route-box{border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:8px}.wais-route-status span{display:block;font-size:8px;opacity:.7}.wais-route-status b{font-size:10px}.wais-route-policy{padding:0 14px 12px;font-size:10px;opacity:.75}.wais-route-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:0 12px 12px}.wais-route-box{border-left:3px solid var(--route-accent,rgba(255,255,255,.2))}.wais-route-box>strong{display:block;font-size:10px;margin-bottom:7px;color:var(--route-accent,#dfe8f8)}.wais-route-products{display:flex;gap:5px;flex-wrap:wrap}.wais-route-product{display:inline-flex;flex-direction:column;border-radius:8px;padding:6px 8px;background:rgba(255,255,255,.07);min-width:74px}.wais-route-product b{font-size:11px}.wais-route-product small{font-size:8px;opacity:.75}@media(max-width:760px){.wais-route-status-row{grid-template-columns:repeat(2,minmax(0,1fr))}.wais-route-grid{grid-template-columns:1fr}.wais-route-selector summary{grid-template-columns:1fr}.wais-route-selector summary em{display:none}.wais-route-product{flex:1 1 42%;min-width:0}}`;
  document.head.appendChild(css);
  function observeGrid(id){const g=document.getElementById(id);if(!g)return;new MutationObserver(()=>requestAnimationFrame(inject)).observe(g,{childList:true,subtree:false});}
  const start=()=>{observeGrid('topPicksGrid');observeGrid('watchlistCards');load();setTimeout(inject,800);};
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',start):start();
  window.addEventListener('wais:quotes-updated',load);
})();
