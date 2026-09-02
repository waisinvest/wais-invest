// WAIS cross-section sync — 2026-08-30
(function(){
  const d=window.WAIS_MARKET_DATA||(window.WAIS_MARKET_DATA={});
  const p=d.opportunityPipeline||(d.opportunityPipeline={});
  const fs=Array.isArray(d.focusStocks)?d.focusStocks:(d.focusStocks=[]);
  const by=Object.fromEntries(fs.map(x=>[String(x.ticker||'').toUpperCase(),x]));
  const up=(t,patch)=>{const k=String(t).toUpperCase(); if(by[k]) Object.assign(by[k],patch);};
  d.lastUpdated='2026-08-30';
  d.lastStrategyUpdated='2026-08-30T19:52:00-04:00';
  d.contentSyncStatus='CURRENT · AUG 30 SUNDAY AUDIT · READY 1 NONE · TECH READY NONE';
  p.asOf='2026-08-30 19:52 ET · Sunday audit sync';
  p.ready1=[]; p.techReady=[];
  p.candidatePlus=['NVDA','LITE'];
  p.candidate=['MRVL','TSM','MU','AVGO','COHR','TSEM','RKLB'];
  p.closestToReady=['NVDA','LITE','TSM','MU'];
  p.research=['TTMI','AMBQ','GNRC','AEHR','POWL','CRDO','SITM','FN','VRT','CLS','ALMU','EROC','ZYME','AXTI'];
  p.phaseOut=[...new Set([...(Array.isArray(p.phaseOut)?p.phaseOut:[]),'GFS'])];
  const activeWatch=new Set([...p.candidatePlus,...p.candidate]);
  fs.forEach(x=>{const t=String(x.ticker||'').toUpperCase(); if(t==='GFS'){x.showInWatchlist=false;x.topPickRank=null;return;} if(activeWatch.has(t))x.showInWatchlist=true; else if(p.research.includes(t))x.showInWatchlist=false;});
  const top=['NVDA','LITE','MRVL','TSM','MU'];
  fs.forEach(x=>{if(Number.isFinite(Number(x.topPickRank)))x.topPickRank=null;});
  top.forEach((t,i)=>up(t,{topPickRank:i+1,showInWatchlist:true}));
  const hiddenPriority=['TTMI','AMBQ','GNRC','AEHR','POWL','CRDO','SITM','FN','VRT','CLS','ALMU','EROC','ZYME','AXTI'];
  const hiddenSet=new Set(hiddenPriority);
  fs.forEach(x=>{const t=String(x.ticker||'').toUpperCase();if(x.bucket==='HIDDEN_GEM'&&!hiddenSet.has(t))x.bucket='RESEARCH';});
  hiddenPriority.forEach((t,i)=>up(t,{bucket:'HIDDEN_GEM',researchStage:'VALIDATING',hiddenGemRank:i+1,showInWatchlist:false,topPickRank:null}));
  const priorityMap=Object.fromEntries(hiddenPriority.map((t,i)=>[t,i]));
  d.focusStocks=fs.sort((a,b)=>{const A=String(a.ticker||'').toUpperCase(),B=String(b.ticker||'').toUpperCase();const ah=hiddenSet.has(A),bh=hiddenSet.has(B);if(ah&&bh)return priorityMap[A]-priorityMap[B];return 0;});
  d.hiddenGemsReview={asOf:'2026-08-30 19:52 ET',status:'CURRENT · RESEARCH ONLY',names:hiddenPriority,leaders:['TTMI','GNRC','AMBQ','AEHR','POWL','CRDO'],note:'Research priority only. READY/Candidate decisions remain independent.'};
  d.discoveryScoringModel={asOf:'2026-08-30',weights:{fundamentalInflection:25,institutionalDNA:20,stressResilience:15,valuationReratingRoom:15,notAlreadyExploded:10,catalyst:10,technicalEntry:5},currentLeaders:[
    {ticker:'GNRC',status:'RESEARCH · POWER / DATA-CENTER',edge:'$1.6B data-center backlog; 2027 hyperscale commitment nearly $700M'},
    {ticker:'TTMI',status:'RESEARCH · FUNDAMENTAL / STRATEGIC',edge:'Aug 5 SEC 10-Q current; new U.S. HDI facility volume production expected 2H26; acquisition expansion adds execution risk'},
    {ticker:'POWL',status:'RESEARCH · GRID/POWER',edge:'Infrastructure demand thesis; current timing still needs validation'},
    {ticker:'AMBQ',status:'RESEARCH · SMALL-CAP INFLECTION',edge:'High-growth validation track; no promotion without current SEC/IR + technical gate'},
    {ticker:'AEHR',status:'RESEARCH · FORWARD INFLECTION',edge:'Forward growth/backlog thesis remains validation-only'},
    {ticker:'CRDO',status:'RESEARCH · AI CONNECTIVITY',edge:'Optical/copper expansion; institutional flow mixed'}],rule:'Research ranking is not a buy ranking. Current price, valuation, institutional evidence and technical trigger are mandatory before promotion.'};
  d.policyStructuralCatalysts={asOf:'2026-08-30',groups:[{name:'Power & Grid',tickers:['GNRC','POWL']},{name:'Domestic Supply Chain',tickers:['TTMI','AEHR']},{name:'Critical Materials',tickers:['USAR','WWR','FEAM','NB','UUUU','MP']},{name:'Defense & Strategic Infrastructure',tickers:['TTMI']},{name:'AI / Data-Center Capex',tickers:['GNRC','POWL','TTMI','CRDO','VRT','CLS']}]};
  const income=Array.isArray(d.incomeEtfs)?d.incomeEtfs:(d.incomeEtfs=[]);
  const imap=Object.fromEntries(income.map(x=>[String(x.ticker||'').toUpperCase(),x]));
  const iyld={ticker:'IYLD',priceSymbol:'IYLD',currency:'USD',name:'iShares Morningstar Multi-Asset Income ETF',track:'MONTHLY',category:'Multi-Asset Income',frequency:'Monthly',status:'RESEARCH · NEAR-5% SEC YIELD COMPARATOR',incomeQuality:'Research',navRisk:'Medium',firstTranche:'0% until validated',todayAction:'RESEARCH — issuer data: 30-day SEC yield 4.98%, trailing yield 4.60%, monthly distribution; low trading volume requires liquidity caution.',note:'Issuer-verified Aug 28 NAV $22.25, YTD NAV total return 6.84%, 30-day average volume ~14.1k, median spread 0.18%. Headline yield alone does not create Income READY 1.'};
  if(imap.IYLD)Object.assign(imap.IYLD,iyld);else income.push(iyld);
  d.incomeResearchLeadersAsOf='2026-08-30 · issuer/web rechecked';
  d.incomeResearchSet={monthly:['GPIQ','QQQI','GPIX','JEPQ','SPYI','JEPI','QDVO','ISPY','IYLD'],weekly:['XDTE','QDTE','YMAX','NVIT','PLTY'],defensiveComparators:['BNDI','HYBI','IYLD'],researchOnly:['IWMI','NIHI','XSPI','CEPI','YSPY','ROCY','ROCQ','MLPI'],ready1:[]};
  d.incomeReadyList=[];
  d.incomeRouteReview={...(d.incomeRouteReview||{}),asOf:'2026-08-30 19:52 ET',status:'VALIDATING · NO INCOME READY 1',note:'IYLD is near-5% SEC yield, not >5% on latest issuer data; liquidity remains a gating factor.'};
  d.routeIntegrity={...(d.routeIntegrity||{}),asOf:'2026-08-30 19:52 ET',status:'CURRENT · ACTIVE PIPELINE AUTO-ALIGNED'};
  window.WAIS_MARKET_DATA=d;
  try{window.dispatchEvent(new CustomEvent('wais:decision-state-updated',{detail:{asOf:d.lastStrategyUpdated}}));}catch(_e){}
})();
