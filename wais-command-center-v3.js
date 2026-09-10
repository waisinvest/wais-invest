// WAIS INVEST Command Center v3 — unified public display, no promotion authority.
(()=>{
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const get=async path=>{const r=await fetch(`${path}?v=${Date.now()}`,{cache:'no-store'});if(!r.ok)throw Error(`${path}: ${r.status}`);return r.json()};
  const money=n=>Number.isFinite(Number(n))?`$${Number(n).toFixed(2)}`:'DATA GAP';
  const q=(prices,t)=>prices?.prices?.[t]||{};
  const card=(ticker,stage,prices,rank)=>{const x=q(prices,ticker);return `<article class="watch-card signal-card"><div class="watch-card-head"><div><span class="signal-chip signal-${stage==='READY 1'?'green':stage==='CANDIDATE+'?'yellow':'blue'}">${esc(stage)}</span><h4>${esc(ticker)}</h4></div>${rank?`<span class="priority-chip">#${rank}</span>`:''}</div><div class="watch-prices"><div><span>Latest public price</span><strong>${money(x.price)}</strong></div><div><span>As of</span><strong>${esc((x.asOf||'DATA GAP').slice(0,16).replace('T',' '))}</strong></div></div><p class="watch-note">${stage==='READY 1'?'Research approved; timing audit still required.':stage==='CANDIDATE+'?'Highest preparation priority; not a buy signal.':'Evidence building; must earn promotion.'}</p></article>`};
  function navLinks(){
    const nav=document.querySelector('.nav-list');if(!nav||nav.querySelector('.cc-nav-link'))return;
    [['Discovery Workbench','discovery-workbench.html'],['Fund DNA','fund-dna.html'],['Policy / Catalysts','policy-structural-catalysts.html']].forEach(([n,h])=>nav.insertAdjacentHTML('beforeend',`<a class="nav-item cc-nav-link" href="${h}">${n}</a>`));
  }
  function cockpit(u,prices){
    const d=document.getElementById('dashboard'),hero=d?.querySelector('.hero');if(!hero)return;
    const p=u.stages||{},o=u.timingOverlays||{},next=[...(p['READY 1']||[]),...(o['SUPER A ENTRY']||[])];
    const html=`<div class="cc-cockpit"><article class="cc-tile primary"><span>Action now</span><strong>${next.length?esc(next.join(', ')):'WAIT · NO VERIFIED ENTRY'}</strong><small>Only WAIS-approved status is shown. Price refresh cannot promote a stock.</small></article><article class="cc-tile"><span>Candidate+</span><strong>${esc((p['CANDIDATE+']||[]).join(' · ')||'NONE')}</strong><small>Prepare, verify, do not chase.</small></article><article class="cc-tile"><span>Ready 1</span><strong>${esc((p['READY 1']||[]).join(' · ')||'NONE')}</strong><small>Research approval only.</small></article><article class="cc-tile"><span>Data as of</span><strong>${esc((prices.lastUpdated||'DATA GAP').slice(0,16).replace('T',' '))}</strong><small>Delayed public snapshot · not exchange real-time.</small></article></div>`;
    hero.insertAdjacentHTML('afterend',html);
  }
  function calendarToDashboard(){
    const panel=document.querySelector('#research .economic-calendar-panel');const dash=document.getElementById('dashboard');if(!panel||!dash)return;
    panel.classList.add('cc-calendar');dash.appendChild(panel);
  }
  function riskWorkspace(research){
    const risk=document.getElementById('risk');if(!risk)return;
    const mount=document.getElementById('riskWorkspaceMount')||risk;
    const legacy=document.querySelector('#dashboard #waisResearchIntegrityPanel');if(legacy)mount.appendChild(legacy);
    const plan=[...document.querySelectorAll('#dashboard .panel')].find(x=>x.querySelector('#weeklyPlan'));if(plan)mount.appendChild(plan);
    const strategy=document.querySelector('#research .weekly-market-notes');if(strategy)mount.appendChild(strategy);
    const health=research.health||{},rows=Object.entries(research.sources||{}).slice(0,9);
    if(!mount.querySelector('#waisResearchIntegrityPanel'))mount.insertAdjacentHTML('beforeend',`<article class="panel"><div class="panel-head"><div><span class="panel-kicker">WAIS RESEARCH INTEGRITY</span><h3>System Audit + Evidence of Work</h3></div><div class="weekly-review-date">${esc((research.lastChecked||'DATA GAP').replace('T',' ').slice(0,19))}</div></div><div class="cc-audit-grid"><div class="cc-audit-item"><b>LIVE SOURCES · ${Number(health.liveSources||0)}</b><span>Current machine-readable or official evidence inputs.</span></div><div class="cc-audit-item"><b>FALLBACK · ${Number(health.fallbackSources||0)}</b><span>Labelled fallback evidence; never represented as primary data.</span></div><div class="cc-audit-item ${health.failedThisCycle?.length?'gap':''}"><b>CYCLE GAPS · ${health.failedThisCycle?.length||0}</b><span>${esc((health.failedThisCycle||[]).map(x=>x.source).join(', ')||'No reported source failure')}</span></div>${rows.map(([name,s])=>`<div class="cc-audit-item ${/GAP|STALE/.test(s.status)?'gap':''}"><b>${esc(name)} · ${esc(s.status)}</b><span>${esc(s.note||s.sourceType||'Evidence input')}</span></div>`).join('')}</div></article>`);
    const legacyTime=mount.querySelector('#waisResearchIntegrityPanel .wais-live-time');if(legacyTime)legacyTime.textContent=`Updated ${esc(research.lastChecked||'DATA GAP')} · CANONICAL`;
  }
  function researchLibrary(research){
    const root=document.getElementById('research');if(!root)return;
    [...root.children].filter(x=>!x.classList.contains('section-banner')).forEach(x=>x.remove());
    const sources=Object.entries(research.sources||{});
    root.insertAdjacentHTML('beforeend',`<div class="cc-library-tools"><a class="cc-tool" href="discovery-workbench.html"><b>Discovery Workbench</b><span>Opportunity ranking、早期候選及升級研究。</span></a><a class="cc-tool" href="fund-dna.html"><b>Fund DNA</b><span>機構持倉線索、資金認同與交叉驗證。</span></a><a class="cc-tool" href="policy-structural-catalysts.html"><b>Policy / Structural Catalysts</b><span>政策、供應鏈、國防、能源及基建催化。</span></a></div><article class="panel"><div class="panel-head"><div><span class="panel-kicker">EVIDENCE VAULT</span><h3>Sources, freshness and data gaps</h3></div><div class="weekly-review-date">${esc((research.lastChecked||'DATA GAP').replace('T',' ').slice(0,19))}</div></div><div class="cc-source-table">${sources.map(([name,s])=>`<div class="cc-source-row"><b>${esc(name)}</b><em class="${/GAP|STALE/.test(s.status)?'gap':''}">${esc(s.status||'DATA GAP')}</em><span>${esc(s.note||s.sourceType||'—')}</span></div>`).join('')}</div></article>`);
  }
  function lists(u,prices){
    const p=u.stages||{};const top=[...(p['READY 1']||[]),...(p['CANDIDATE+']||[]),...(p['CANDIDATE']||[])].slice(0,5);
    const topGrid=document.getElementById('topPicksGrid');if(topGrid)topGrid.innerHTML=top.map((t,i)=>card(t,(p['READY 1']||[]).includes(t)?'READY 1':(p['CANDIDATE+']||[]).includes(t)?'CANDIDATE+':'CANDIDATE',prices,i+1)).join('');
    const active=[...(p['READY 1']||[]),...(p['CANDIDATE+']||[]),...(p['CANDIDATE']||[])];const watch=document.getElementById('watchlistCards');if(watch)watch.innerHTML=active.map(t=>card(t,(p['READY 1']||[]).includes(t)?'READY 1':(p['CANDIDATE+']||[]).includes(t)?'CANDIDATE+':'CANDIDATE',prices)).join('');
    const gems=u.displayViews?.hiddenGems?.tickers||[];const gemGrid=document.getElementById('hiddenGemsGrid');if(gemGrid)gemGrid.innerHTML=gems.map((t,i)=>card(t,'RESEARCH',prices,i+1)).join('');
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};set('watchTotal',active.length);set('watchReady',(p['READY 1']||[]).length);set('watchHighRisk','SYSTEM');
  }
  function stampSections(u,prices){
    document.querySelectorAll('.section-banner').forEach(b=>{if(b.querySelector('.cc-section-stamp'))return;b.insertAdjacentHTML('beforeend',`<div class="cc-section-stamp market-updated">Canonical ${esc(u.version)}<br>Prices ${esc((prices.lastUpdated||'DATA GAP').slice(0,16).replace('T',' '))}</div>`)});
    const income=document.getElementById('incomeUpdated');if(income)income.textContent=`Prices ${String(prices.lastUpdated||'DATA GAP').slice(0,16).replace('T',' ')} · canonical status only`;
  }
  async function run(){
    navLinks();
    try{const [u,prices,research]=await Promise.all([get('canonical-universe.json'),get('stock-prices.json'),get('research-discovery.json')]);cockpit(u,prices);calendarToDashboard();riskWorkspace(research);researchLibrary(research);lists(u,prices);stampSections(u,prices);setTimeout(()=>lists(u,prices),1800);window.WAIS_COMMAND_CENTER={status:'READY',canonical:u.version,pricesAsOf:prices.lastUpdated,researchAsOf:research.lastChecked};}
    catch(e){console.error('[WAIS Command Center]',e);window.WAIS_COMMAND_CENTER={status:'DATA GAP',error:String(e)}}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(run,80),{once:true});else setTimeout(run,80);
})();
