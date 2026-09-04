(()=>{
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const state={stages:{},prices:{},ready:false};
  const tickerPattern=/^[A-Z][A-Z0-9.\-]{0,7}$/;
  const sectionNames={watchlist:'Watchlist','top-picks':'Top Picks','route-intelligence':'Route Intelligence',income:'Income ETFs',research:'Research Library'};
  const style=document.createElement('style');
  style.textContent=`
    .wais-ticker-link{cursor:pointer;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:4px;text-decoration-color:rgba(142,220,255,.58)}
    .wais-ticker-link:hover,.wais-ticker-link:focus{color:#8edcff;outline:none}
    .wais-ticker-highlight{box-shadow:0 0 0 2px #8edcff!important}
    .wais-ticker-modal[hidden]{display:none}.wais-ticker-modal{position:fixed;inset:0;z-index:9999;background:rgba(2,8,18,.78);display:grid;place-items:center;padding:18px}
    .wais-ticker-dialog{width:min(620px,100%);max-height:88vh;overflow:auto;background:#0d1829;border:1px solid #314765;border-radius:18px;padding:20px;color:#eef4ff;box-shadow:0 24px 70px rgba(0,0,0,.5)}
    .wais-ticker-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.wais-ticker-head h2{margin:0;font-size:30px}.wais-ticker-close{border:1px solid #314765;background:#14243b;color:#fff;border-radius:10px;padding:7px 10px;cursor:pointer}
    .wais-ticker-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:16px 0}.wais-ticker-facts div{padding:11px;border:1px solid #263650;border-radius:12px;background:#101f34}.wais-ticker-facts span{display:block;font-size:10px;color:#93a5bf}.wais-ticker-facts b{display:block;margin-top:4px}
    .wais-ticker-routes{display:flex;gap:8px;flex-wrap:wrap}.wais-ticker-routes a{color:#dbe7f7;text-decoration:none;padding:9px 11px;border:1px solid #334563;border-radius:10px;background:#14243b;font-size:12px;font-weight:700}
    .wais-authority-note{margin-top:14px;color:#93a5bf;font-size:11px;line-height:1.5}
    @media(max-width:560px){.wais-ticker-facts{grid-template-columns:1fr}.wais-ticker-dialog{padding:16px}}
  `;
  document.head.appendChild(style);

  const stageOf=t=>state.stages[t]||'RESEARCH / NOT IN ACTIVE PIPELINE';
  const quoteOf=t=>state.prices[t]||{};
  function buildStages(c){
    const source=c?.stages||{};
    Object.entries(source).forEach(([stage,list])=>(list||[]).forEach(t=>state.stages[String(t).toUpperCase()]=stage));
  }
  function ensureModal(){
    let m=document.getElementById('waisTickerModal');
    if(m)return m;
    m=document.createElement('div');m.id='waisTickerModal';m.className='wais-ticker-modal';m.hidden=true;
    m.innerHTML='<div class="wais-ticker-dialog" role="dialog" aria-modal="true" aria-labelledby="waisTickerTitle"><div class="wais-ticker-head"><div><small>WAIS MASTER OPPORTUNITY CARD</small><h2 id="waisTickerTitle"></h2></div><button class="wais-ticker-close" type="button">Close</button></div><div class="wais-ticker-facts" id="waisTickerFacts"></div><div class="wais-ticker-routes" id="waisTickerRoutes"></div><div class="wais-authority-note">所有頁面只讀取同一WAIS System正式stage；價格及外部研究不能自行升級Candidate、READY 1或Super A。</div></div>';
    document.body.appendChild(m);
    m.addEventListener('click',e=>{if(e.target===m||e.target.closest('.wais-ticker-close'))m.hidden=true});
    return m;
  }
  function href(section,ticker){
    const base=location.pathname.endsWith('.html')&&!location.pathname.endsWith('/index.html')?'index.html':'';
    return `${base}?section=${encodeURIComponent(section)}&ticker=${encodeURIComponent(ticker)}`;
  }
  function openTicker(ticker){
    const t=String(ticker).toUpperCase(),q=quoteOf(t),m=ensureModal();
    document.getElementById('waisTickerTitle').textContent=t;
    const px=Number.isFinite(Number(q.price))?`${q.currency||'USD'} ${Number(q.price).toFixed(2)}`:'DATA GAP';
    document.getElementById('waisTickerFacts').innerHTML=`
      <div><span>OFFICIAL STAGE</span><b>${esc(stageOf(t))}</b></div>
      <div><span>LATEST PRICE</span><b>${esc(px)}</b></div>
      <div><span>AS OF</span><b>${esc(q.asOf||'DATA GAP')}<br><small>Delayed / NOT exchange real-time</small></b></div>`;
    const routes=[
      ['watchlist','Watchlist'],['top-picks','Top Picks'],['route-intelligence','ETF Routes'],['income','Income ETFs'],['research','Research']
    ];
    const external=[
      ['discovery-workbench.html','Discovery'],['fund-dna.html','Fund DNA'],['policy-structural-catalysts.html','Policy']
    ];
    document.getElementById('waisTickerRoutes').innerHTML=
      routes.map(([s,l])=>`<a href="${href(s,t)}">${l}</a>`).join('')+
      external.map(([u,l])=>`<a href="${u}?ticker=${encodeURIComponent(t)}">${l}</a>`).join('');
    m.hidden=false;
  }
  function candidateText(el){
    const raw=(el.dataset?.ticker||el.textContent||'').trim().toUpperCase();
    return tickerPattern.test(raw)&&(state.stages[raw]||state.prices[raw])?raw:null;
  }
  function enhance(root=document){
    const selectors='.ticker,.income-title-row h3,.stock-card h3,.watch-card h3,.compact-list b,.mini-card b,.gem-grid b,.route-product-symbol,.chip,.row .ticker,.s b,td:first-child';
    root.querySelectorAll?.(selectors).forEach(el=>{
      if(el.classList.contains('wais-ticker-link'))return;
      const t=candidateText(el);if(!t)return;
      el.classList.add('wais-ticker-link');el.dataset.waisTicker=t;el.setAttribute('role','button');el.setAttribute('tabindex','0');el.setAttribute('aria-label',`Open ${t} across WAIS INVEST`);
    });
    const selected=new URLSearchParams(location.search).get('ticker')?.toUpperCase();
    if(selected)root.querySelectorAll?.('[data-wais-ticker="'+selected+'"]').forEach(el=>el.classList.add('wais-ticker-highlight'));
  }
  document.addEventListener('click',e=>{const el=e.target.closest('[data-wais-ticker]');if(el){e.preventDefault();openTicker(el.dataset.waisTicker)}});
  document.addEventListener('keydown',e=>{const el=e.target.closest?.('[data-wais-ticker]');if(el&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openTicker(el.dataset.waisTicker)}});
  async function init(){
    const [c,p]=await Promise.all([
      fetch('canonical-universe.json',{cache:'no-store'}).then(r=>r.json()).catch(()=>({})),
      fetch('stock-prices.json',{cache:'no-store'}).then(r=>r.json()).catch(()=>({}))
    ]);
    buildStages(c);state.prices=p.prices||{};state.ready=true;
    const params=new URLSearchParams(location.search),section=params.get('section');
    if(section){
      setTimeout(()=>document.querySelector('[data-section="'+CSS.escape(section)+'"]')?.click(),150);
    }
    enhance();
    new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)enhance(n)}))).observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>enhance(),700);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();