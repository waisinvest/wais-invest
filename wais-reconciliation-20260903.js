// WAIS INVEST display reconciliation overlay — 2026-09-03 12:00 ET
// Display-only mirror of WAIS System-approved decisions.
(function(){
  const d=window.WAIS_MARKET_DATA||(window.WAIS_MARKET_DATA={});
  const p=d.opportunityPipeline||(d.opportunityPipeline={});
  const norm=t=>String(t||'').toUpperCase().trim();
  const uniq=a=>[...new Set((Array.isArray(a)?a:[]).map(v=>norm(typeof v==='string'?v:v?.ticker)).filter(Boolean))];

  // Canonical decision snapshot. Live/delayed prices cannot promote a stage.
  p.version='2026-09-03-1200ET';
  p.asOf='2026-09-03T12:00:00-04:00';
  p.actionNow='WAIT / NO CHASE';
  p.nextGate='Sep 4 08:30 ET · Employment Situation';
  p.ready1=[];
  p.techReady=['NVDA'];
  p.candidatePlus=['MU','DELL'];
  p.candidate=['TSM','AVGO','LITE','RKLB'];
  p.research=uniq(['CIEN','VRT','MRVL','COHR','TSEM','FN','CRDO','KEYS','CLS','TTMI','SITM','AEHR','GNRC','EROC','POWL','NVT','AXTI','SLB','HUT','PANW','FRVO','HPE','TTMI','AMBQ','ALMU','ZYME','SBE']);
  p.phaseOut=uniq(['GFS']);
  p.superAPreBreakout=[];
  p.superAEntry=[];

  const higher=new Set();
  for(const name of ['ready1','techReady','candidatePlus','candidate','research','phaseOut']){
    p[name]=uniq(p[name]).filter(t=>!higher.has(t));
    p[name].forEach(t=>higher.add(t));
  }

  const stocks=Array.isArray(d.focusStocks)?d.focusStocks:(d.focusStocks=[]);
  const ensure=(ticker,fields)=>{
    let s=stocks.find(x=>norm(x?.ticker)===ticker);
    if(!s){s={ticker,company:fields.company||ticker,category:fields.category||'Research',bucket:'HIDDEN_GEM',showInWatchlist:false,risk:'High'};stocks.push(s);}
    Object.assign(s,fields);
    return s;
  };
  ensure('DELL',{company:'Dell Technologies',category:'AI Servers / Infrastructure',note:'Candidate+ but extended after a two-day surge; no chase. Wait for controlled consolidation or pullback.',currentAction:'WAIT / NO CHASE'});
  ensure('CIEN',{company:'Ciena',category:'Optical Networking',note:'Strong Q3 and raised guidance, but regular-session gap failed and shares fell sharply; Research / post-earnings expectations reset.',currentAction:'RESEARCH / DO NOT CHASE'});
  ensure('NVDA',{note:'TECH READY retained: held the 219–221 reclaim area and outperformed weak semiconductors; Hugging Face acquisition adds regulatory, integration and capital-allocation review before READY 1.',currentAction:'TECH READY · WAIT FOR ENTRY CONFIRMATION'});

  const stage={};
  p.ready1.forEach(t=>stage[t]='READY 1');
  p.techReady.forEach(t=>stage[t]='TECH READY');
  p.candidatePlus.forEach(t=>stage[t]='CANDIDATE+');
  p.candidate.forEach(t=>stage[t]='CANDIDATE');
  p.research.forEach(t=>stage[t]='RESEARCH');
  p.phaseOut.forEach(t=>stage[t]='PHASE OUT');
  stocks.forEach(s=>{const t=norm(s?.ticker);if(stage[t]){s.executionStage=stage[t];s.waisCanonicalStage=stage[t];s.stance=stage[t];s.rating=stage[t];s.decisionAsOf=p.asOf;}});

  d.lastUpdated='2026-09-03';
  d.lastStrategyUpdated=p.asOf;
  d.marketMode='CAUTIOUS / BROAD RALLY, SEMICONDUCTOR DISPERSION';
  d.riskScore=50;
  d.recommendedCash=55;
  d.readyList=[];
  d.contentSyncStatus='RECONCILED · 2026-09-03 12:00 ET';
  d.contentSyncReason='WAIS System canonical decision mirrored after external evidence, macro, expectations, price/volume and relative-strength audit.';
  d.actionPlan=[
    'READY 1 / SUPER A：NONE。唔追大市反彈或DELL第二日急升。',
    'NVDA維持TECH READY；只在正常時段守住約219–221並持續跑贏SOX時保留，跌穿約217兼RS轉負則撤銷。',
    'MU、DELL維持Candidate+；MU等待波動下降，DELL等待2–5日整固或受控回調。',
    'AVGO維持Candidate / Post-Earnings Validation；CIEN只列Research / Expectations Reset。',
    '9月4日08:30 ET Employment Situation仍是下一個硬事件閘門。'
  ];
  d.weeklyMarketNotes=[
    {title:'ACTION NOW · 12:00 ET',action:'WAIT / NO CHASE',body:'READY 1、SUPER A PRE-BREAKOUT、SUPER A ENTRY全部NONE；市場反彈但半導體內部分化。'},
    {title:'TECH READY',action:'NVDA',body:'11:45 ET附近約227.43美元、+1.35%；守住昨日reclaim並跑贏弱勢SOX，但Hugging Face收購仍需監管與capital-allocation驗證。'},
    {title:'CANDIDATE+',action:'MU / DELL',body:'MU約-1%但相對SOX仍較穩；DELL約+5.6%延續業績後急升，已過度延伸，不追。'},
    {title:'EXPECTATIONS RESET',action:'AVGO / CIEN',body:'AVGO約-4.6%；CIEN雖beat及加guidance仍約-10%，證明fundamentals不等於price confirmation。'},
    {title:'MACRO',action:'GROWTH + INFLATION MIX',body:'ISM Services 55.4、New Orders 60.9，但Prices 72.6；Waller減低即時加息預期，明日就業報告前仍需保留event discipline。'}
  ];
  d.technicalSummary=[
    {key:'SP500',name:'S&P 500',signal:'CAUTIOUS POSITIVE',note:'廣泛反彈受債息回落支持；明日就業數據前不視為全面risk-on。'},
    {key:'NASDAQ',name:'NASDAQ Composite',signal:'POSITIVE / SELECTIVE',note:'大型科技強，但AI硬件內部分化，不能用指數升幅自動升級個股。'},
    {key:'SOX',name:'SOX',signal:'WEAK / DISPERSION',note:'早段約-1.5%；AVGO及optics拖累。NVDA個別RS正面。'},
    {key:'VIX',name:'VIX',signal:'CALM BUT EVENT RISK',note:'低波動不抵銷9月4日就業數據及中東／油價風險。'},
    {key:'US10Y',name:'US 10Y',signal:'RELIEF / STILL HIGH',note:'早段約4.74–4.75%；估值壓力減輕但未消失。'}
  ];

  d.researchIntegrity={
    version:'2026-09-03-1200ET',
    asOf:p.asOf,
    overallStatus:'CHECKED · PRIMARY + MARKET CROSS-CHECK',
    reviewRemark:'先外部搜尋，再由WAIS獨立驗證；外部研究不能自動升級。',
    rule:'No source = not researched. Missing evidence = DATA GAP, never “no update”.',
    evidenceOfWork:[
      {layer:'Serenity / specialist research',status:'CHECKED PARTIAL / DATA GAP',evidence:'Seven earlier public posts remain verified. Three newer posts (NVDA, SIVE and ESMT) remain pending because public index text is truncated and direct X access returned HTTP 403; ESMT exchange ticker identity is also unverified. Excluded from evidence and no auto-promotion.'},
      {layer:'Company IR',status:'CHECKED',evidence:'NVIDIA Hugging Face acquisition and Ciena Q3 release checked against official company materials.'},
      {layer:'SEC / regulatory',status:'PARTIAL CHECKED / DATA GAP',evidence:'Deal regulatory implications reviewed; current transaction filing and full-universe SEC sweep not yet complete.'},
      {layer:'Earnings / guidance / transcripts',status:'CHECKED / TRANSCRIPT PARTIAL',evidence:'AVGO, Ciena, Dell and HPE results/guidance cross-checked; complete Ciena call transcript not independently archived this cycle.'},
      {layer:'Institutional / industry research',status:'CHECKED',evidence:'Reuters market, rates, labor and expectations read-through reviewed.'},
      {layer:'Supply-chain cross-check',status:'CHECKED',evidence:'Dell servers, AVGO silicon/networking, HPE component constraints, Ciena optics and ISM GPU/memory shortages compared.'},
      {layer:'New-universe discovery',status:'CHECKED',evidence:'CIEN entered Research / Post-Earnings Expectations Reset; no new Candidate promotion.'},
      {layer:'Economic / earnings calendar',status:'CHECKED',evidence:'BLS Q2 productivity/costs, weekly claims, ISM Services and Sep 4 Employment Situation verified.'},
      {layer:'FABIBOT',status:'DESIGNED / MANUAL',evidence:'No production backtest/log; not an automated quant model.'}
    ]
  };

  const quoteKeys=new Set(Object.keys((window.WAIS_STOCK_PRICES&&window.WAIS_STOCK_PRICES.prices)||d.stockPrices||{}).map(norm));
  const active=uniq([...p.ready1,...p.techReady,...p.candidatePlus,...p.candidate,...p.research]);
  const missingQuoteCoverage=active.filter(t=>!quoteKeys.has(t));
  d.superAEntryRadar={version:'2026-09-03-1200ET',authority:'DISPLAY OF WAIS ENTRY FILTER ONLY',eligibleFrom:'READY 1',status:'NO ELIGIBLE READY 1 NAMES'};
  d.reconciliationReport={asOf:p.asOf,authority:'WAIS System → WAIS INVEST display',ready1:p.ready1,techReady:p.techReady,candidatePlus:p.candidatePlus,candidate:p.candidate,research:p.research,phaseOut:p.phaseOut,missingQuoteCoverage,notes:['Price feeds cannot promote status.','No ticker may occupy more than one canonical stage.','READY 1 and both SUPER A stages remain empty.']};
  d.lastReconciled=p.asOf;
  window.WAIS_MARKET_DATA=d;
  try{window.dispatchEvent(new CustomEvent('wais:reconciled',{detail:d.reconciliationReport}));}catch(_e){}
})();
