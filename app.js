const $ = (id) => document.getElementById(id);
const fmt = (n) => new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD'}).format(n);
const fmtUSD = (n) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
let livePrices = {};
let livePricesUpdatedAt = null;
let marketIndicatorsSnapshot = null;

async function loadLivePrices() {
  try {
    const response = await fetch(
    `stock-prices.json?t=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    livePrices = data.prices || {};
    livePricesUpdatedAt = data.lastUpdated || null;
  } catch (error) {
    console.error("Unable to load stock prices:", error);
    livePrices = {};
    livePricesUpdatedAt = null;
  }
}

const stockUniverse = window.WAIS_MARKET_DATA?.focusStocks || [];

const topPicks = stockUniverse
  .filter(stock => stock.showInWatchlist === true && Number.isFinite(Number(stock.topPickRank)))
  .sort((a,b) => Number(a.topPickRank) - Number(b.topPickRank))
  .map(stock => ({
    ticker: stock.ticker,
    topPickRank: Number(stock.topPickRank),
    company: stock.company || stock.ticker,
    role: stock.category,
    risk: stock.risk,
    rating: stock.rating || (stock.stance === "READY 1" ? "Build" : "Core"),
    status: stock.stance,
    score: stock.evidenceConfidence,
    entry: Number(stock.entry) || null,
    target: Number(stock.target) || null,
    targetAchievement: stock.targetAchievement || null,
    earnings: stock.earnings || "NEXT DATE · NOT YET CONFIRMED",
    note: stock.note
  }));

const gems = stockUniverse
  .filter(stock => stock.bucket === "HIDDEN_GEM")
  .map(stock => ({
    ticker: stock.ticker,
    company: stock.company || stock.ticker,
    role: stock.category,
    risk: stock.risk,
    rating: stock.rating || (stock.risk === "Very High" ? "Speculative" : "Research"),
    status: stock.stance,
    researchStage: stock.researchStage || null,
    score: stock.evidenceConfidence,
    entry: Number(stock.entry) || null,
    target: Number(stock.target) || null,
    targetAchievement: stock.targetAchievement || null,
    note: stock.note
  }));

const incomeEtfs = window.WAIS_MARKET_DATA?.incomeEtfs || [];

const SIGNAL_META = { GREEN:{className:'signal-green'}, YELLOW:{className:'signal-yellow'}, ORANGE:{className:'signal-orange'}, RED:{className:'signal-red'}, BLUE:{className:'signal-blue'}, GREY:{className:'signal-grey'} };
function getSignalMeta(status=''){ const s=String(status||'').toUpperCase(); if(s.includes('READY')) return {...SIGNAL_META.GREEN,label:status}; if(s.includes('WATCH')||s.includes('NEAR ENTRY')||s==='HOLD') return {...SIGNAL_META.YELLOW,label:status}; if(s.includes('WAIT')||s.includes('CAUTIOUS')) return {...SIGNAL_META.ORANGE,label:status}; if(s.includes('DEFENSE')||s.includes('AVOID')||s.includes('REJECT')||s.includes('EXIT')) return {...SIGNAL_META.RED,label:status}; if(s.includes('RESEARCH')||s.includes('DISCOVERY')||s.includes('VALIDATING')) return {...SIGNAL_META.BLUE,label:status}; return {...SIGNAL_META.GREY,label:status||'NO SIGNAL'}; }
function applySignalStatus(el,status=''){
  if(!el) return;
  const sig=getSignalMeta(status);
  el.classList.remove('signal-green','signal-yellow','signal-orange','signal-red','signal-blue','signal-grey');
  el.classList.add('status-text',sig.className);
}
function quoteFor(ticker){ return livePrices[String(ticker||'').toUpperCase()]||{}; }
function distanceToEntryPct(current,entry){ const c=Number(current),e=Number(entry); return Number.isFinite(c)&&Number.isFinite(e)&&e>0?((c-e)/e)*100:null; }
function targetAchievementText(item,current,isSystem=true){
  if(!isSystem)return 'MANUAL PLAN · NOT WAIS SYSTEM';
  const state=item?.targetAchievement||{};
  if(!String(state.status||'').toUpperCase().startsWith('TRACKING'))return state.status||'NOT CALCULATED · SYSTEM DATA GAP';
  const c=Number(current),e=Number(item?.entry),t=Number(item?.target);
  if(!Number.isFinite(c)||!Number.isFinite(e)||!Number.isFinite(t)||e<=0||t<=e)return 'NOT CALCULATED · INVALID / MISSING LEVELS';
  const pct=((c-e)/(t-e))*100;
  return `${pct.toFixed(1)}% · VERIFIED SYSTEM LEVELS`;
}
function dynamicEntryZone(item,quote){ const s=Number(quote?.sma20),lo=Number(item?.entryBandLowPct),hi=Number(item?.entryBandHighPct); return Number.isFinite(s)&&s>0&&Number.isFinite(lo)&&Number.isFinite(hi)?{low:s*(1+lo/100),high:s*(1+hi/100)}:null; }


function getResearchStageMeta(stage='RESEARCH'){
  const s=String(stage||'RESEARCH').trim().toUpperCase();
  if(s.includes('WATCHLIST')) return {label:'WATCHLIST CANDIDATE',className:'stage-watchlist'};
  if(s.includes('VALIDAT')) return {label:'VALIDATING',className:'stage-validating'};
  if(s.includes('RESEARCH')) return {label:'RESEARCH',className:'stage-research'};
  return {label:s||'RESEARCH',className:'stage-research'};
}

function renderCards(items,target){
  const el=$(target); if(!el)return;
  const isGem=target==='hiddenGemsGrid';

  el.innerHTML=items.map(x=>{
    const ticker=String(x.ticker).toUpperCase();
    const q=quoteFor(ticker);
    const current=q.price;
    const entry=Number(x.entry);
    const tp=Number(x.target);
    const dist=distanceToEntryPct(current,entry);
    const sig=getSignalMeta(isGem?'RESEARCH':x.status);
    const up=Number.isFinite(entry)&&entry>0&&Number.isFinite(tp)&&tp>0
      ?(((tp-entry)/entry)*100).toFixed(1)+'%'
      :'—';

    const stageMeta=isGem?getResearchStageMeta(x.researchStage||'RESEARCH'):null;
    const secondary=isGem
      ?stageMeta.label
      :(x.topPickRank?`TOP PICK #${x.topPickRank}`:(x.rating||''));

    const entryText=Number.isFinite(entry)&&entry>0
      ?fmtUSD(entry)
      :(isGem?'Set after Watchlist promotion':'—');
    const targetText=Number.isFinite(tp)&&tp>0
      ?fmtUSD(tp)
      :(isGem?'Set after Watchlist promotion':'—');
    const distanceText=dist==null
      ?(isGem?'Not set during research stage':'—')
      :`${dist>=0?'+':''}${dist.toFixed(1)}%`;
    const upsideText=up==='—'&&isGem?'Not set during research stage':up;

    return `<article class="stock-card signal-card ${sig.className}">
      <div class="signal-card-head">
        ${isGem?'':`<span class="signal-chip ${sig.className}">${escapeHTML(sig.label)}</span>`}
        <span class="${isGem?`research-stage-chip ${stageMeta.className}`:'priority-chip'}">${escapeHTML(secondary||'')}</span>
      </div>
      <h3>${escapeHTML(x.ticker)}</h3>
      <div class="company">${escapeHTML(x.company)}</div>
      <div class="stock-meta">
        <div><span>Role</span><b>${escapeHTML(x.role)}</b></div>
        <div><span>WAIS Score</span><b>${escapeHTML(x.score)}/100</b></div>
        <div><span>Current / Last Close</span><b>${current!=null?fmtUSD(current):'—'}</b></div>
        <div><span>Price Date</span><b>${escapeHTML(q.asOf||'—')}</b></div>
        <div><span>Entry</span><b>${escapeHTML(entryText)}</b></div>
        <div><span>Distance to Entry</span><b>${escapeHTML(distanceText)}</b></div>
        <div><span>Target</span><b>${escapeHTML(targetText)}</b></div>
        <div><span>Planned Upside</span><b>${escapeHTML(upsideText)}</b></div>
        <div><span>Target Achievement</span><b>${escapeHTML(targetAchievementText(x,current,true))}</b></div>
        <div><span>Risk</span><b>${escapeHTML(x.risk)}</b></div>
        ${isGem?'':`<div><span>Earnings</span><b>${escapeHTML(x.earnings||'NEXT DATE · NOT YET CONFIRMED')}</b></div>`}
        <div class="${isGem?`research-stage-cell ${stageMeta.className}`:''}">
          <span>${isGem?'Research Stage':'Rating'}</span>
          <b>${escapeHTML(isGem?stageMeta.label:x.rating)}</b>
        </div>
      </div>
      <p class="stock-note">${escapeHTML(x.note)}</p>
    </article>`;
  }).join('');
}

const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.page-section');
function showSection(id){
  navItems.forEach(x => x.classList.toggle('active',x.dataset.section===id));
  sections.forEach(x => x.classList.toggle('active',x.id===id));
  const active = [...navItems].find(x=>x.dataset.section===id);
  $('pageTitle').textContent = active ? active.textContent : 'Dashboard';
  $('sidebar').classList.remove('open');
  window.scrollTo({top:0,behavior:'smooth'});
}
navItems.forEach(x=>x.addEventListener('click',()=>showSection(x.dataset.section)));
document.querySelectorAll('[data-jump]').forEach(x=>x.addEventListener('click',()=>showSection(x.dataset.jump)));


$('todayDate').textContent = new Intl.DateTimeFormat('zh-Hant-CA',{year:'numeric',month:'long',day:'numeric'}).format(new Date());

let holdings = JSON.parse(localStorage.getItem('waisHoldings') || '[]');

function getHoldingPrice(holding){
  const ticker = String(holding.ticker || '').toUpperCase();
  const live = Number(livePrices[ticker]?.price);
  if(Number.isFinite(live) && live > 0) return live;

  const fallback = Number(holding.price);
  return Number.isFinite(fallback) && fallback > 0 ? fallback : 0;
}

function renderHoldings(){
  const body = $('holdingsTable');
  if(!body) return;

  if(!holdings.length){
    body.innerHTML = '<tr><td colspan="8">暫時未有持倉。</td></tr>';
  }else{
    body.innerHTML = holdings.map((h,i)=>{
      const currentPrice = getHoldingPrice(h);
      const value = h.shares * currentPrice;
      const cost = h.shares * h.cost;
      const pl = value - cost;
      const priceSource = livePrices[String(h.ticker).toUpperCase()]?.price != null ? 'WAIS' : 'Manual';

      return `<tr>
        <td><b>${escapeHTML(h.ticker)}</b></td>
        <td>${(()=>{const st=stockUniverse.find(s=>String(s.ticker).toUpperCase()===String(h.ticker).toUpperCase());const sm=getSignalMeta(st?.stance||'NO SIGNAL');return `<span class="signal-chip ${sm.className}">${escapeHTML(sm.label)}</span>`;})()}</td>
        <td>${h.shares}</td>
        <td>${fmt(h.cost)}</td>
        <td>${currentPrice > 0 ? `${fmtUSD(currentPrice)} <small>${priceSource}</small>` : '—'}</td>
        <td>${fmt(value)}</td>
        <td class="${pl>=0?'positive':''}">${fmt(pl)}</td>
        <td><button class="text-btn" onclick="removeHolding(${i})">Remove</button></td>
      </tr>`;
    }).join('');
  }

  const totalCost = holdings.reduce((s,h)=>s+h.shares*h.cost,0);
  const mv = holdings.reduce((s,h)=>s+h.shares*getHoldingPrice(h),0);
  const pl = mv-totalCost;

  $('totalCost').textContent=fmt(totalCost);
  $('marketValue').textContent=fmt(mv);
  $('portfolioPL').textContent=fmt(pl);
  $('portfolioReturn').textContent=totalCost?((pl/totalCost)*100).toFixed(2)+'%':'0.00%';
  $('summaryPL').textContent=fmt(pl);
  $('summaryHoldings').textContent=holdings.length;
  $('holdingsCountLabel').textContent=`${holdings.length} 個持倉`;

  const assumedCash=100000;
  const investedPct=Math.min(100, Math.round(mv/(assumedCash+mv)*100));
  $('investedMetric').textContent=investedPct;
  $('summaryInvested').textContent=investedPct+'%';
  $('summaryCash').textContent=(100-investedPct)+'%';
}
window.removeHolding=(i)=>{holdings.splice(i,1);localStorage.setItem('waisHoldings',JSON.stringify(holdings));renderHoldings();}
$('holdingForm').addEventListener('submit',e=>{
  e.preventDefault();
  const ticker = $('tickerInput').value.trim().toUpperCase();
  const manualPrice = Number($('priceInput').value);
  const autoPrice = Number(livePrices[ticker]?.price);

  holdings.push({
    ticker,
    shares:Number($('sharesInput').value),
    cost:Number($('costInput').value),
    price:Number.isFinite(manualPrice) && manualPrice > 0
      ? manualPrice
      : (Number.isFinite(autoPrice) && autoPrice > 0 ? autoPrice : 0)
  });
  localStorage.setItem('waisHoldings',JSON.stringify(holdings));
  e.target.reset(); renderHoldings();
});
renderHoldings();

function riskState(score, cashOverride = null){
  let state;
  if(score<=20) state = {mode:'AGGRESSIVE',cash:15,label:'Aggressive',def:'NORMAL'};
  else if(score<=40) state = {mode:'WAIT',cash:25,label:'Normal / Selective',def:'NORMAL'};
  else if(score<=60) state = {mode:'CAUTIOUS',cash:30,label:'Cautious',def:'CAUTIOUS'};
  else if(score<=80) state = {mode:'DEFENSE',cash:50,label:'Defensive',def:'DEFENSIVE'};
  else state = {mode:'MOSTLY CASH',cash:75,label:'Crisis',def:'CRISIS'};

  if(Number.isFinite(Number(cashOverride))){
    state.cash = Number(cashOverride);
  }
  return state;
}
function updateRisk(score, cashOverride = null){
  const s=riskState(score, cashOverride);
  $('riskScoreMetric').textContent=score;
  $('riskProgress').style.width=score+'%';
  $('riskLabel').textContent=s.label;
  $('cashMetric').textContent=s.cash;
  $('marketMode').textContent=s.mode;
  applySignalStatus($('marketMode'),s.mode);
  $('actionPill').textContent=s.mode;
  const actionSig=getSignalMeta(s.mode);
  $('actionPill').className=`pill signal-chip ${actionSig.className}`;
  $('defenseStatus').textContent=s.def;
  applySignalStatus($('defenseStatus'),s.def);
  $('riskResultScore').textContent=score+' / 100';
  $('riskResultMode').textContent=s.label;
  $('cashRecommendation').textContent=s.cash+'%';
  $('cashRing').style.background=`conic-gradient(#88a8ff 0 ${s.cash}%,#1d2b45 ${s.cash}% 100%)`;
  localStorage.setItem('waisRiskScore',score);
}
const savedRisk=Number(window.WAIS_MARKET_DATA?.riskScore ?? 38);
const systemCash=Number(window.WAIS_MARKET_DATA?.recommendedCash);
$('riskSlider').value=savedRisk;
updateRisk(savedRisk, systemCash);
$('riskSlider').addEventListener('input',e=>updateRisk(Number(e.target.value)));

let journal = JSON.parse(localStorage.getItem('waisJournal') || '[]');
function renderJournal(){
  $('journalCount').textContent=journal.length;
  $('latestJournal').textContent=journal[0]?.title || '—';
  $('journalEntries').innerHTML=journal.map((j,i)=>`
    <article class="journal-entry">
      <button onclick="removeJournal(${i})">Delete</button>
      <span>${j.date}</span><h4>${j.title}</h4><p>${j.reason}</p>
    </article>`).join('');
}
window.removeJournal=(i)=>{journal.splice(i,1);localStorage.setItem('waisJournal',JSON.stringify(journal));renderJournal();}
$('journalForm').addEventListener('submit',e=>{
  e.preventDefault();
  journal.unshift({
    title:$('journalTitle').value.trim(),
    reason:$('journalReason').value.trim(),
    date:new Intl.DateTimeFormat('zh-Hant-CA',{year:'numeric',month:'long',day:'numeric'}).format(new Date())
  });
  localStorage.setItem('waisJournal',JSON.stringify(journal));
  e.target.reset();renderJournal();
});
renderJournal();



// ===== WAIS INVEST v2: mobile menu =====
const sidebarOverlay = $('sidebarOverlay');

function closeMobileMenu(){
  $('sidebar').classList.remove('open');
  sidebarOverlay?.classList.remove('show');
  document.body.classList.remove('menu-open');
}

function toggleMobileMenu(){
  const willOpen = !$('sidebar').classList.contains('open');
  $('sidebar').classList.toggle('open', willOpen);
  sidebarOverlay?.classList.toggle('show', willOpen);
  document.body.classList.toggle('menu-open', willOpen);
}

$('menuBtn').onclick = toggleMobileMenu;
sidebarOverlay?.addEventListener('click', closeMobileMenu);
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') closeMobileMenu();
});

// Replace the original menu closing behaviour with overlay-aware closing.
navItems.forEach(item => item.addEventListener('click', closeMobileMenu));
document.querySelectorAll('[data-jump]').forEach(item => item.addEventListener('click', closeMobileMenu));


// ===== WAIS INVEST v2: watchlist =====
const savedWatchlist = JSON.parse(localStorage.getItem("waisWatchlist") || "[]");

const autoWatchlist = (window.WAIS_MARKET_DATA?.focusStocks || [])
  .filter(stock => stock.showInWatchlist === true)
  .map(stock => {
    const savedItem = savedWatchlist.find(
      item => String(item.ticker).toUpperCase() === stock.ticker.toUpperCase()
    );

    return {
      ticker: stock.ticker,
      company: stock.company || stock.ticker,
      status: stock.stance,
      risk: stock.risk,
      score: stock.evidenceConfidence,
      topPickRank: Number(stock.topPickRank) || null,
      entry: Number(stock.entry) || 0,
      target: Number(stock.target) || 0,
      targetAchievement: stock.targetAchievement || null,
      earnings: stock.earnings || "NEXT DATE · NOT YET CONFIRMED",
      note: stock.note
    };
  });

let watchlist = [
  ...autoWatchlist,
  ...savedWatchlist.filter(
    savedItem =>
      !autoWatchlist.some(
        autoItem =>
          autoItem.ticker.toUpperCase() ===
          String(savedItem.ticker).toUpperCase()
      )
  )
];

const escapeHTML = (value='') => String(value)
  .replaceAll('&','&amp;')
  .replaceAll('<','&lt;')
  .replaceAll('>','&gt;')
  .replaceAll('"','&quot;')
  .replaceAll("'","&#039;");

function saveWatchlist(){
  localStorage.setItem('waisWatchlist', JSON.stringify(watchlist));
}

function renderWatchlist(){ const target=$('watchlistCards'); if(!target)return; $('watchTotal').textContent=watchlist.length; $('watchReady').textContent=watchlist.filter(i=>String(i.status).toUpperCase().includes('READY')).length; $('watchHighRisk').textContent=watchlist.filter(i=>i.risk==='High'||i.risk==='Very High').length; if(!watchlist.length){target.innerHTML='<div class="watch-empty">暫時未有觀察股票。</div>';return;} const sorted=[...watchlist].sort((a,b)=>(Number(a.topPickRank)||999)-(Number(b.topPickRank)||999)||String(a.ticker).localeCompare(String(b.ticker))); target.innerHTML=sorted.map(item=>{ const oi=watchlist.indexOf(item),ticker=String(item.ticker).toUpperCase(),q=quoteFor(ticker),current=q.price,dist=distanceToEntryPct(current,item.entry),sig=getSignalMeta(item.status),sys=autoWatchlist.some(a=>a.ticker.toUpperCase()===ticker); return `<article class="watch-card signal-card ${sig.className}"><div class="watch-card-head"><div><div class="signal-card-head"><span class="signal-chip ${sig.className}">${escapeHTML(sig.label)}</span>${item.topPickRank?`<span class="priority-chip">TOP PICK #${item.topPickRank}</span>`:''}</div><h4>${escapeHTML(item.ticker)}</h4>${item.company?`<small class="company-line">${escapeHTML(item.company)}</small>`:''}</div><span class="tag">${escapeHTML(item.risk)} Risk</span></div><div class="watch-prices"><div><span>Current / Last Close</span><strong>${current!=null?fmtUSD(current):'—'}</strong></div><div><span>Entry</span><strong>${item.entry>0?fmtUSD(item.entry):'—'}</strong></div><div><span>Target</span><strong>${item.target>0?fmtUSD(item.target):'—'}</strong></div></div><div class="watch-meta-grid"><div><span>Price Date</span><strong>${escapeHTML(q.asOf||'—')}</strong></div><div><span>Distance to Entry</span><strong>${dist==null?'—':`${dist>=0?'+':''}${dist.toFixed(1)}%`}</strong></div><div><span>WAIS Score</span><strong>${item.score??'—'}/100</strong></div><div><span>Target Achievement</span><strong>${escapeHTML(targetAchievementText(item,current,sys))}</strong></div><div><span>Earnings</span><strong>${escapeHTML(item.earnings||'NEXT DATE · NOT YET CONFIRMED')}</strong></div></div>${item.note?`<p class="watch-note">${escapeHTML(item.note)}</p>`:''}${sys?'':`<div class="watch-actions"><button class="danger-btn" type="button" onclick="removeWatchItem(${oi})">Remove</button></div>`}</article>`;}).join(''); }

window.removeWatchItem = index => {
  watchlist.splice(index,1);
  saveWatchlist();
  renderWatchlist();
};

$('watchlistForm')?.addEventListener('submit', event => {
  event.preventDefault();

  const ticker = $('watchTicker').value.trim().toUpperCase();
  const entry = Number($('watchEntry').value);
  const target = Number($('watchTarget').value);

  if(!ticker || entry <= 0 || target <= 0){
    alert('請輸入有效股票代號、買入價及目標價。');
    return;
  }

  watchlist.unshift({
    ticker,
    entry,
    target,
    risk:$('watchRisk').value,
    status:$('watchStatus').value,
    note:$('watchNote').value.trim()
  });

  saveWatchlist();
  event.target.reset();
  $('watchRisk').value = 'Medium';
  $('watchStatus').value = 'Wait';
  renderWatchlist();
});
function renderDashboardResearchLists(){
  const compactList = document.querySelector('#dashboard .compact-list');
  if(compactList){
    const dashboardPicks = topPicks.slice(0,5);
    compactList.innerHTML = dashboardPicks.length
      ? dashboardPicks.map((x,index) => `
        <div><span class="rank">${index+1}</span><b>${escapeHTML(x.ticker)}</b><em class="signal-inline ${getSignalMeta(x.status).className}">${escapeHTML(x.status)}</em></div>
      `).join('')
      : '<div><span class="rank">—</span><b>No READY / Top Pick</b><em>Wait</em></div>';
  }

  const gemGrid = document.querySelector('#dashboard .gem-grid');
  if(gemGrid){
    gemGrid.innerHTML = gems.slice(0,4).map(x => `
      <div class="mini-card">
        <b>${escapeHTML(x.ticker)}</b>
        <span>${escapeHTML(x.role)}</span>
        <small class="signal-inline signal-blue">${escapeHTML(x.researchStage || "RESEARCH")}</small>
      </div>
    `).join('');
  }
}

function renderWeeklyPlan(){
  const target = $('weeklyPlan');
  const plan = window.WAIS_MARKET_DATA?.actionPlan || [];
  if(!target || !plan.length) return;

  target.innerHTML = plan.slice(0,5).map((item,index) => `
    <div><b>${String(index+1).padStart(2,'0')}</b><span>${escapeHTML(item)}</span></div>
  `).join('');
}

function renderDailyThought(){
  const thought = window.WAIS_MARKET_DATA?.dailyThought;
  const box = document.querySelector('.daily-thought');
  if(!thought || !box) return;

  box.innerHTML = `
    <div class="daily-thought-label">WAIS 今日思考｜WAIS Thought of the Day｜${escapeHTML(thought.date || '')}</div>
    <div class="daily-thought-zh">${escapeHTML(thought.zh || '')}</div>
    <div class="daily-thought-en">${escapeHTML(thought.en || '')}</div>
  `;
}


let weeklyEventsSnapshot=null;
async function loadWeeklyEvents(){ try{const r=await fetch(`weekly-events.json?v=${Date.now()}`,{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);weeklyEventsSnapshot=await r.json();}catch(e){console.warn('Weekly events auto file unavailable; fallback used.',e);weeklyEventsSnapshot=null;} }

function eventWeekLabel(dateISO){
  if(!dateISO) return '';
  const now=new Date();
  const start=new Date(now);
  const day=(start.getDay()+6)%7; // Monday=0
  start.setHours(0,0,0,0);
  start.setDate(start.getDate()-day);
  const next=new Date(start); next.setDate(start.getDate()+7);
  const afterNext=new Date(start); afterNext.setDate(start.getDate()+14);
  const d=new Date(`${dateISO}T12:00:00`);
  if(d>=start && d<next) return '本週';
  if(d>=next && d<afterNext) return '下週';
  return '';
}
function renderEconomicEvents(){
  const fallback=window.WAIS_MARKET_DATA?.weeklyEvents||[];
  const events=weeklyEventsSnapshot?.events?.length?weeklyEventsSnapshot.events:fallback;
  const target=$('economicEventsList'),updated=$('economicEventsUpdated');
  if(!target)return;
  if(updated){
    const raw=weeklyEventsSnapshot?.lastUpdated||window.WAIS_MARKET_DATA?.lastUpdated||'—';
    const shown=raw && raw!=='—' ? new Date(raw).toLocaleString('en-CA') : '—';
    updated.textContent=`日程資料更新：${shown}｜本週＋下週｜Auto + verified fallback`;
  }
  target.innerHTML=events.length?events.map((e,i)=>{
    const week=eventWeekLabel(e.dateISO||'');
    return `<div class="calendar-row"><span>${String(i+1).padStart(2,'0')}</span><p><strong>${week?`<em class="week-tag">${week}</em>`:''}${escapeHTML(e.date||'')}｜${escapeHTML(e.event||'')}</strong><br>${escapeHTML(e.time||'')}${e.referenceMonth?`｜${escapeHTML(e.referenceMonth)}`:''}<br><small>${escapeHTML(e.source||'')}</small></p></div>`;
  }).join(''):'<div><span>—</span><p>本週＋下週暫時沒有已確認的高影響事件。</p></div>';
}


function renderWeeklyMarketNotes(){
  const listEl=$('weeklyMarketNotesList');
  const reviewEl=$('weeklyMarketReviewDate');
  const riskEl=$('weeklyMarketRiskNote');
  if(!listEl || !reviewEl || !riskEl) return;

  try{
    const notes=window.WAIS_MARKET_DATA?.weeklyMarketNotes || [];
    const risk=Number(window.WAIS_MARKET_DATA?.riskScore);
    const cash=Number(window.WAIS_MARKET_DATA?.recommendedCash);
    const mode=window.WAIS_MARKET_DATA?.marketMode || 'CAUTIOUS';
    const rawUpdated=window.WAIS_MARKET_DATA?.lastUpdated || '';

    const updatedText=rawUpdated
      ? new Date(rawUpdated).toLocaleString('en-CA')
      : 'Static verified fallback';

    reviewEl.textContent=`策略更新：${updatedText}`;

    if(notes.length){
      listEl.innerHTML=notes.map((n,i)=>{
        const action=String(n.action||'').trim();
        return `<div class="strategy-note-row">
          <span>${String(i+1).padStart(2,'0')}</span>
          <p>
            <strong>${escapeHTML(n.title||'WAIS Strategy')}
              ${action?`<em class="strategy-action">${escapeHTML(action)}</em>`:''}
            </strong>
            <br>${escapeHTML(n.body||'')}
          </p>
        </div>`;
      }).join('');
    }else{
      listEl.innerHTML=`<div class="strategy-note-row">
        <span>01</span>
        <p><strong>本週策略資料暫未更新</strong><br>
        保持現有 Market Risk / Cash / Entry 紀律，直至下一次已驗證策略資料更新。</p>
      </div>`;
    }

    riskEl.textContent=
      `WAIS RISK NOTE · Market Risk ${Number.isFinite(risk)?risk:'—'}/100 · ${mode} · 建議現金 ${Number.isFinite(cash)?cash:'—'}% · READY 只在價格、基本面、事件與風險條件同時確認後成立。`;

  }catch(err){
    console.error('Failed to render weekly market notes:',err);
    reviewEl.textContent='策略資料暫時未能更新';
    listEl.innerHTML=`<div class="strategy-note-row">
      <span>—</span>
      <p><strong>Strategy fallback</strong><br>
      Weekly notes 暫時未能載入；請以 Dashboard Market Risk、Cash Reserve 與已驗證市場資料為準。</p>
    </div>`;
    riskEl.textContent='WAIS Weekly Strategy Notes 暫時使用 fallback；不把未確認資料顯示成最新策略。';
  }
}

function renderTechnicalSummary(){ const configs=window.WAIS_MARKET_DATA?.technicalSummary||[],target=$('waisTechnicalSummary'),updated=$('technicalSummaryUpdated'); if(!target)return; const data=marketIndicatorsSnapshot||{},ind=data.indicators||{},dates=data.marketDates||{},file=data.lastUpdated?new Date(data.lastUpdated).toLocaleString('en-CA'):'—'; if(updated)updated.textContent=`US close: ${dates.US||'—'}｜HK close: ${dates.HK||'—'}｜檔案更新: ${file}｜NOT REAL-TIME`; target.innerHTML=configs.map(item=>{const x=ind[item.key]||{},value=formatMarketValue(x.value,item.key);let move='--';if(item.key==='VIX'&&Number.isFinite(Number(x.value)))move=`Level ${Number(x.value).toFixed(2)}`;else if(item.key==='US10Y'&&Number.isFinite(Number(x.value)))move=`${Number(x.value).toFixed(2)}%`;else if(Number.isFinite(Number(x.changePercent))){const p=Number(x.changePercent);move=`${p>0?'+':''}${p.toFixed(2)}%`;}const sig=getSignalMeta(item.signal==='EXTENDED'?'WAIT':item.signal==='STRONG'||item.signal==='CALM'||item.signal==='SELECTIVE'?'WATCH':item.signal);return `<article class="research-card structure-card ${sig.className}"><div class="structure-head"><span>${escapeHTML(item.signal||'WAIS')}</span><b>${escapeHTML(x.asOf||'—')}</b></div><h3>${escapeHTML(item.name||item.key||'')}</h3><div class="structure-value">${escapeHTML(value)}</div><div class="structure-move">${escapeHTML(move)}</div><div class="structure-signal">${escapeHTML(item.signal||'—')}</div><p>${escapeHTML(item.note||'')}</p></article>`;}).join(''); }


function getIncomeSustainability(item,annualYield){
  let score=70;
  const y=Number(annualYield);
  const nav=String(item.navRisk||'').toUpperCase();
  const quality=String(item.incomeQuality||'').toUpperCase();
  const drag=String(item.upsideDrag||'').toUpperCase();
  const category=String(item.category||'').toUpperCase();
  const track=String(item.track||'').toUpperCase();

  // Distribution burden: very high annualized cash distribution requires
  // more option income / ROC / NAV support, so sustainability confidence falls.
  if(Number.isFinite(y)){
    if(y>=40) score-=35;
    else if(y>=25) score-=25;
    else if(y>=15) score-=14;
    else if(y>=8) score-=6;
    else if(y<4) score+=5;
  }else{
    score-=15;
  }

  if(nav.includes('VERY HIGH')) score-=25;
  else if(nav.includes('HIGH')) score-=16;
  else if(nav.includes('MEDIUM')) score-=7;
  else if(nav.includes('LOW')) score+=8;

  if(quality.includes('HIGH')) score+=10;
  else if(quality.includes('MEDIUM')) score+=2;
  else if(quality.includes('LOW')) score-=10;
  else if(quality.includes('RESEARCH')) score-=6;

  if(drag.includes('HIGH')) score-=8;
  else if(drag.includes('MEDIUM')) score-=3;
  else if(drag.includes('LOW')) score+=3;

  if(category.includes('T-BILL')||category.includes('TREASURY')) score+=12;
  if(category.includes('0DTE')) score-=12;
  if(track==='TACTICAL') score-=5;

  score=Math.max(0,Math.min(100,Math.round(score)));

  let label='LOW';
  let cls='income-sustain-low';
  if(score>=75){label='HIGH';cls='income-sustain-high';}
  else if(score>=55){label='MEDIUM';cls='income-sustain-medium';}
  else if(score>=35){label='LOW';cls='income-sustain-low';}
  else {label='SPECULATIVE';cls='income-sustain-speculative';}

  let role='CORE INCOME';
  if(category.includes('T-BILL')||category.includes('TREASURY')) role='DEFENSIVE / CASH';
  else if(track==='TACTICAL'||category.includes('0DTE')||(Number.isFinite(y)&&y>=20)) role='TACTICAL INCOME';
  else if(String(item.frequency||'').toUpperCase().includes('MONTH')) role='CORE INCOME';

  return {score,label,cls,role};
}

function renderIncomeEtfs(){
  const wg=$('weeklyIncomeGrid'),mg=$('monthlyIncomeGrid'),tg=$('tacticalIncomeGrid');
  if(!wg||!mg||!tg)return;

  const filterEl=$('incomeYieldFilter');
  const minYield=Number(filterEl?.value ?? 3);
  const items=incomeEtfs;

  const enriched=items.map(item=>{
    const key=String(item.priceSymbol||item.ticker||'').toUpperCase();
    const q=quoteFor(key);
    const y=Number(q.trailing12mDistributionYield);
    return {...item,_quote:q,_yield:Number.isFinite(y)?y:null};
  });

  const filtered=enriched.filter(item=>item._yield!=null && item._yield>=minYield);
  const weekly=filtered.filter(i=>i.track==='WEEKLY');
  const monthly=filtered.filter(i=>i.track==='MONTHLY');
  const tactical=filtered.filter(i=>i.track==='TACTICAL');

  const ready=g=>g.filter(i=>String(i.status).toUpperCase().includes('READY')).length;
  if($('weeklyIncomeReadyCount'))$('weeklyIncomeReadyCount').textContent=ready(weekly);
  if($('monthlyIncomeReadyCount'))$('monthlyIncomeReadyCount').textContent=ready(monthly);
  if($('incomeYieldMatchCount'))$('incomeYieldMatchCount').textContent=filtered.length;

  const defense=window.WAIS_MARKET_DATA?.incomeDefenseStatus||window.WAIS_MARKET_DATA?.marketMode||'CAUTIOUS';
  if($('incomeDefenseStatus')){
    $('incomeDefenseStatus').textContent=defense;
    applySignalStatus($('incomeDefenseStatus'),defense);
  }
  if($('incomeCashReserve'))$('incomeCashReserve').textContent=window.WAIS_MARKET_DATA?.recommendedCash??'—';

  if($('incomeUpdated')){
    $('incomeUpdated').textContent=
      `價格／分派資料檔更新：${livePricesUpdatedAt?new Date(livePricesUpdatedAt).toLocaleString('en-CA'):'—'}｜Completed closing data / NOT REAL-TIME`;
  }

  function card(item){
    const q=item._quote||{};
    const sig=getSignalMeta(item.status);
    const price=q.price!=null?`${q.currency||item.currency||''} ${Number(q.price).toFixed(2)}`.trim():'—';
    const dist=q.lastDistribution!=null?`${q.currency||item.currency||''} ${Number(q.lastDistribution).toFixed(4)}`.trim():'—';
    const annualYield=item._yield;
    const annualYieldText=annualYield!=null?`${annualYield.toFixed(2)}%`:'—';

    // Common comparison scale across weekly and monthly products.
    const monthlyYield=annualYield!=null?annualYield/12:null;
    const monthlyYieldText=monthlyYield!=null?`${monthlyYield.toFixed(2)}%`:'—';

    const monthlyCash10k=monthlyYield!=null?10000*monthlyYield/100:null;
    const monthlyCash10kText=monthlyCash10k!=null
      ?`~${q.currency||item.currency||'USD'} ${monthlyCash10k.toFixed(0)} / $10k / month`
      :'DATA PENDING';

    const isWeekly=String(item.frequency||'').toLowerCase().includes('week');
    const weeklyYield=isWeekly && annualYield!=null?annualYield/52:null;
    const weeklyYieldText=weeklyYield!=null?`${weeklyYield.toFixed(2)}%`:'—';

    const zone=dynamicEntryZone(item,q);
    const zoneText=zone
      ?`${q.currency||item.currency||''} ${zone.low.toFixed(2)} – ${zone.high.toFixed(2)}`.trim()
      :(item.entryMethod||'—');

    const riskFlag =
      annualYield!=null && annualYield>=30 ? 'VERY HIGH DISTRIBUTION — CHECK NAV / ROC' :
      annualYield!=null && annualYield>=20 ? 'HIGH DISTRIBUTION — EXTRA RISK REVIEW' :
      annualYield!=null && annualYield>=10 ? 'ELEVATED INCOME' :
      'STANDARD INCOME RANGE';

    const sus=getIncomeSustainability(item,annualYield);

    return `<article class="stock-card income-card signal-card ${sig.className}">
      <div class="signal-card-head">
        <span class="signal-chip ${sig.className}">${escapeHTML(sig.label)}</span>
        <span class="priority-chip">${escapeHTML(item.frequency||'—')}</span>
      </div>

      <div class="income-title-row">
        <div>
          <h3>${escapeHTML(item.ticker||'')}</h3>
          <div class="company">${escapeHTML(item.name||'')}</div>
        </div>
        <div class="yield-hero ${annualYield!=null && annualYield>=5?'yield-pass':'yield-below'}">
          <span>EST. MONTHLY CASH YIELD*</span>
          <strong>${escapeHTML(monthlyYieldText)}</strong>
          <small>${escapeHTML(monthlyCash10kText)}</small>
        </div>
      </div>

      <div class="income-sustainability ${sus.cls}">
        <div>
          <span>WAIS INCOME SUSTAINABILITY</span>
          <strong>${escapeHTML(sus.label)}</strong>
        </div>
        <b>${sus.score}/100</b>
        <small>${escapeHTML(sus.role)}</small>
      </div>

      <div class="income-risk-flag">${escapeHTML(riskFlag)}</div>

      <div class="today-action ${sig.className}">
        <span>TODAY ACTION</span>
        <strong>${escapeHTML(item.todayAction||'等待WAIS重新評估。')}</strong>
      </div>

      <div class="stock-meta">
        <div><span>Current / Last Close</span><b>${escapeHTML(price)}</b></div>
        <div><span>Price Date</span><b>${escapeHTML(q.asOf||'—')}</b></div>
        <div><span>Annualized T12M Dist. Yield*</span><b>${escapeHTML(annualYieldText)}</b></div>
        <div><span>Est. Monthly Cash Yield*</span><b>${escapeHTML(monthlyYieldText)}</b></div>
        <div><span>${isWeekly?'Est. Weekly Cash Yield*':'Distribution Frequency'}</span><b>${isWeekly?escapeHTML(weeklyYieldText):escapeHTML(item.frequency||'—')}</b></div>
        <div><span>Dynamic Entry Zone</span><b>${escapeHTML(zoneText)}</b></div>
        <div><span>First Tranche</span><b>${escapeHTML(item.firstTranche||'—')}</b></div>
        <div><span>Last Distribution</span><b>${escapeHTML(dist)}</b></div>
        <div><span>Distribution Date</span><b>${escapeHTML(q.lastDistributionDate||'—')}</b></div>
        <div><span>20D SMA</span><b>${q.sma20!=null?`${q.currency||item.currency||''} ${Number(q.sma20).toFixed(2)}`:'—'}</b></div>
        <div><span>Income Quality</span><b>${escapeHTML(item.incomeQuality||'Research')}</b></div>
        <div><span>Income Sustainability</span><b class="${sus.cls}">${escapeHTML(sus.label)} · ${sus.score}/100</b></div>
        <div><span>Income Role</span><b>${escapeHTML(sus.role)}</b></div>
        <div><span>NAV Risk</span><b>${escapeHTML(item.navRisk||'—')}</b></div>
        <div><span>Upside Drag</span><b>${escapeHTML(item.upsideDrag||'—')}</b></div>
        <div><span>Category</span><b>${escapeHTML(item.category||'—')}</b></div>
      </div>

      <p class="stock-note">${escapeHTML(item.note||'')}</p>
    </article>`;
  }

  function empty(track){
    return `<div class="income-empty">目前「年化 Distribution Yield ≥${minYield}%」篩選下沒有${track}標的。</div>`;
  }

  // Higher distribution is shown first inside each category only.
  // WAIS Sustainability and status still govern suitability/action.
  const sortYield=(a,b)=>(b._yield??-1)-(a._yield??-1);
  wg.innerHTML=weekly.length?weekly.sort(sortYield).map(card).join(''):empty(' Weekly Income ');
  mg.innerHTML=monthly.length?monthly.sort(sortYield).map(card).join(''):empty(' Monthly Income ');
  tg.innerHTML=tactical.length?tactical.sort(sortYield).map(card).join(''):empty(' Tactical Income ');

  if($('incomeSystemNote')){
    $('incomeSystemNote').textContent=
      `WAIS Income：Income Universe 最低門檻為年化 Distribution Yield ≥${minYield}%；預設3%。Weekly / Monthly ETF 使用 Estimated Monthly Cash Yield 作共同比較尺度，但高分派不等於高總回報。WAIS Income Sustainability 會另外按分派負擔、NAV Risk、Income Quality、Upside Drag及策略結構作規則式評估；分數是研究指標，不是保證。價格、分派、日期、T12M Distribution Yield及20D SMA由 stock-prices.json 自動更新。`;
  }
}

if($('incomeYieldFilter')){
  $('incomeYieldFilter').addEventListener('change',renderIncomeEtfs);
}

function formatMarketValue(value, indicatorName) {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "--";
  }

  if (indicatorName === "US10Y") {
    return `${number.toFixed(2)}%`;
  }

  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function showMarketChange(elementId, change, changePercent) {
  const element = $(elementId);
  if (!element) return;

  const pointChange =
    change === null || change === undefined || change === ""
      ? NaN
      : Number(change);

  const percentChange =
    changePercent === null || changePercent === undefined || changePercent === ""
      ? NaN
      : Number(changePercent);

  element.classList.remove(
    "market-change-up",
    "market-change-down",
    "market-change-flat"
  );

  if (!Number.isFinite(pointChange) && !Number.isFinite(percentChange)) {
    element.textContent = "--";
    element.classList.add("market-change-flat");
    return;
  }

  const directionValue = Number.isFinite(percentChange)
    ? percentChange
    : pointChange;

  const sign = directionValue > 0 ? "+" : "";

  if (Number.isFinite(pointChange) && Number.isFinite(percentChange)) {
    element.textContent =
      `${sign}${pointChange.toFixed(2)} ` +
      `(${sign}${percentChange.toFixed(2)}%)`;
  } else if (Number.isFinite(percentChange)) {
    element.textContent = `${sign}${percentChange.toFixed(2)}%`;
  } else {
    element.textContent = `${sign}${pointChange.toFixed(2)}`;
  }

  if (directionValue > 0) {
    element.classList.add("market-change-up");
  } else if (directionValue < 0) {
    element.classList.add("market-change-down");
  } else {
    element.classList.add("market-change-flat");
  }
}

async function loadMarketIndicators() {
  const updatedElement = $("marketIndicatorsUpdated");

  try {
    const response = await fetch(
      `market-indicators.json?v=${Date.now()}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Market data request failed: ${response.status}`);
    }

    const data = await response.json();
    marketIndicatorsSnapshot = data;
    const indicators = data.indicators || data;

    const indicatorMap = {
    
  SP500: {
    valueId: "sp500Value",
    changeId: "sp500Change"
  },
  NASDAQ: {
    valueId: "nasdaqValue",
    changeId: "nasdaqChange"
  },
  NASDAQ100: {
    valueId: "nasdaq100Value",
    changeId: "nasdaq100Change"
  },
  DOW: {
    valueId: "dowValue",
    changeId: "dowChange"
  },
  SOX: {
    valueId: "soxValue",
    changeId: "soxChange"
  },
  VIX: {
    valueId: "vixValue",
    changeId: "vixChange"
  },
  US10Y: {
    valueId: "us10yValue",
    changeId: "us10yChange"
  },
  HSI: {
    valueId: "hsiValue",
    changeId: "hsiChange"
  },
  HSTECH: {
    valueId: "hstechValue",
    changeId: "hstechChange"
  },
  HSIF: {
    valueId: "hsifValue",
    changeId: "hsifChange"
  }
};

    Object.entries(indicatorMap).forEach(([name, elementIds]) => {
      const indicator = indicators[name] || {};

      const value =
        indicator.value ??
        indicator.price ??
        indicator.current ??
        indicator.close;

      const change =
        indicator.change ??
        indicator.pointChange ??
        indicator.dailyChange;

      const changePercent =
        indicator.changePercent ??
        indicator.percentChange ??
        indicator.changePct;

      const valueElement = $(elementIds.valueId);

      if (valueElement) {
        valueElement.textContent = formatMarketValue(value, name);
      }

      showMarketChange(
        elementIds.changeId,
        change,
        changePercent
      );
    });

    const updatedTime =
      data.lastUpdated ||
      data.updatedAt ||
      data.timestamp;

    const marketDates=data.marketDates||{};
    const usDate=marketDates.US||indicators.SP500?.asOf||indicators.NASDAQ?.asOf||"—";
    const hkDate=marketDates.HK||indicators.HSI?.asOf||indicators.HSTECH?.asOf||"—";
    const titleElement=$("marketIndicatorsTitle");
    if(titleElement) titleElement.textContent=`全球市場最新指標（US ${usDate}｜HK ${hkDate}）`;
    if(updatedElement){ if(updatedTime){ const date=new Date(updatedTime);updatedElement.textContent=`資料檔更新：${date.toLocaleString("en-CA")}｜Closing / delayed data｜NOT REAL-TIME`; } else updatedElement.textContent=`US ${usDate}｜HK ${hkDate}｜NOT REAL-TIME`; }

    renderTechnicalSummary();

  } catch (error) {
    console.error("Failed to load market indicators:", error);

    if (updatedElement) {
      updatedElement.textContent = "市場資料暫時未能載入";
    }
  }
}
async function initializeApp() {
  await loadLivePrices();
  await loadMarketIndicators();
  await loadWeeklyEvents();

  const safeRender=(name,fn)=>{
    try{ fn(); }
    catch(err){ console.error(`WAIS render failed: ${name}`,err); }
  };

  safeRender('holdings',renderHoldings);
  safeRender('top picks',()=>renderCards(topPicks, "topPicksGrid"));
  safeRender('hidden gems',()=>renderCards(gems, "hiddenGemsGrid"));
  safeRender('watchlist',renderWatchlist);
  safeRender('dashboard research lists',renderDashboardResearchLists);
  safeRender('weekly plan',renderWeeklyPlan);
  safeRender('daily thought',renderDailyThought);
  safeRender('economic events',renderEconomicEvents);
  safeRender('weekly strategy notes',renderWeeklyMarketNotes);
  safeRender('income ETFs',renderIncomeEtfs);
  safeRender('technical summary',renderTechnicalSummary);
}
initializeApp();
