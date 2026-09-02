// WAIS canonical decision state — 2026-08-20
// Loads last so stale overlays cannot override the current decision language.
(function(){
  const d=window.WAIS_MARKET_DATA||(window.WAIS_MARKET_DATA={});

  d.lastUpdated='2026-08-20';
  d.lastStrategyUpdated='2026-08-20T10:06:00-04:00';
  d.dataAsOf='2026-08-20 canonical decision sync; price fields remain sourced from the existing quote feed and retain their own timestamps';

  d.riskScore=60;
  d.recommendedCash=45;
  d.marketMode='SELECTIVE RECOVERY WATCH';
  d.defenseStatus='SELECTIVE · NOT FULL DEFENSE';
  d.contentSyncStatus='CURRENT · EARLY RADAR SYNCED · SELECTIVE RECOVERY · READY 1 NONE';
  d.contentSyncReason='Broad index stress eased while semiconductor breadth stayed mixed. WAIS is not full Risk-On. READY 1 remains closed; earlier-stage sponsorship, catalyst quality and reclaim quality determine priority.';

  d.readyList=[];
  d.techReadyList=[];

  d.earlyRadar={
    asOf:'2026-08-20 10:06 ET',
    discoverySignal:['KEYS','FN'],
    smartMoneyBuild:['ADI','POWL'],
    preReadyEarly:['MRVL','ZYME','EROC'],
    preReady:[],
    ready1:[]
  };

  d.opportunityPipeline=d.opportunityPipeline||{};
  d.opportunityPipeline.asOf='2026-08-20 10:06 ET canonical sync';
  d.opportunityPipeline.actionNow='SELECTIVE RECOVERY WATCH · NO CHASE · RANK EARLY SPONSORSHIP';
  d.opportunityPipeline.ready1=[];
  d.opportunityPipeline.techReady=[];
  d.opportunityPipeline.preReady=[];
  d.opportunityPipeline.preReadyEarly=['MRVL','ZYME','EROC'];
  d.opportunityPipeline.smartMoneyBuild=['ADI','POWL'];
  d.opportunityPipeline.discoverySignal=['KEYS','FN'];
  d.opportunityPipeline.inUniverse=['MRVL','ZYME','EROC','POWL','GOOGL','NVDA','MU','GFS','AVGO','TSEM','AXTI','RKLB','COHR','LITE','POET','AEHR','FORM','MXL','NVTS','OSS','AIRO','ALMU','AMBQ','ADI','KEYS','FN'];
  d.opportunityPipeline.outOfCore=['BYND','RARE','PRAX'];
  d.opportunityPipeline.phaseOut=['MOD'];
  d.opportunityPipeline.noSetup=['PLTR'];
  d.opportunityPipeline.closestToReady=['MRVL','ZYME','EROC','GOOGL','NVDA'];
  d.opportunityPipeline.statusChanges=[
    'Market remains SELECTIVE RECOVERY WATCH with Risk Score 60 and cash 45%; READY 1 and TECH READY remain NONE.',
    'EROC enters PRE-READY EARLY: Q2 contracted backlog reached about $1.7B, up roughly 10x YoY, anchored by a 470 MW Anthropic order extending commitments into 2028; cash was $626.6M with no debt at June 30. Revenue timing remains execution-dependent and customer concentration is the main counterweight.',
    'POWL is reopened from PHASE OUT into SMART-MONEY BUILD / deep research because orders, backlog and data-center awards materially improved. It is not READY and still needs valuation/price-structure verification.',
    'ZYME remains PRE-READY EARLY into the Aug 25 PDUFA; MRVL remains PRE-READY EARLY into the Aug 27 earnings gate.',
    'ADI remains SMART-MONEY BUILD; KEYS and FN remain DISCOVERY SIGNAL. BYND, RARE and PRAX remain OUT OF WAIS CORE; MOD remains PHASE OUT; PLTR remains NO SETUP.'
  ];

  const stocks=Array.isArray(d.focusStocks)?d.focusStocks:(d.focusStocks=[]);
  const find=(t)=>stocks.find(x=>String(x.ticker||'').toUpperCase()===t);
  const patch=(t,fields)=>{const s=find(t); if(s) Object.assign(s,fields);};
  const addResearch=(ticker,company,stage,note,extra={})=>{
    if(find(ticker)) return patch(ticker,Object.assign({stance:stage,rating:'Research',researchStage:stage,universeStatus:'IN',currentAction:'RESEARCH ONLY',note},extra));
    stocks.push(Object.assign({ticker,company,category:'WAIS Early Radar',bucket:'HIDDEN_GEM',risk:'High',rating:'Research',stance:stage,researchStage:stage,evidenceConfidence:'VALIDATING',entry:null,target:null,showInWatchlist:false,universeStatus:'IN',currentAction:'RESEARCH ONLY',note},extra));
  };

  patch('MRVL',{stance:'PRE-READY EARLY · EVENT / RETEST WATCH',rating:'Pre-Ready Early',researchStage:'PRE-READY EARLY',universeStatus:'IN',currentAction:'WAIT · DO NOT CHASE',executionStage:'PRE-READY EARLY',executionAction:'WAIT FOR CONTROLLED RETEST / RECLAIM',note:'Primary evidence strengthened materially. Keep in core universe, but the event gap and Aug 27 earnings prevent READY 1; require controlled pullback/reclaim and acceptable volume/breadth.'});
  patch('GOOGL',{universeStatus:'IN'});
  patch('NVDA',{universeStatus:'IN'});
  patch('MU',{universeStatus:'IN'});
  patch('GFS',{universeStatus:'IN'});
  patch('AVGO',{universeStatus:'IN'});
  patch('TSEM',{universeStatus:'IN'});
  patch('AXTI',{universeStatus:'IN'});
  patch('RKLB',{universeStatus:'IN'});
  patch('COHR',{universeStatus:'IN'});
  patch('LITE',{universeStatus:'IN'});
  patch('POET',{universeStatus:'IN'});
  patch('POWL',{stance:'SMART-MONEY BUILD · FUNDAMENTAL REOPEN',rating:'Research',researchStage:'SMART-MONEY BUILD',universeStatus:'IN',currentAction:'DEEP RESEARCH · NO CHASE',executionStage:'SMART-MONEY BUILD',executionAction:'VERIFY VALUATION / PRICE STRUCTURE',note:'Reopened after primary evidence showed strong order acceleration, backlog growth and a >$400M data-center mega-order. Fundamentals improved enough to reverse Phase Out, but valuation and technical sponsorship still need confirmation.'});
  patch('MOD',{stance:'PHASE OUT',rating:'Phase Out',universeStatus:'OUT'});
  patch('PLTR',{stance:'NO SETUP',rating:'No Setup',universeStatus:'OUT'});

  addResearch('ZYME','Zymeworks','PRE-READY EARLY · PDUFA EVENT WATCH','Aug 25, 2026 U.S. PDUFA for first-line HER2+ GEA. Positive Phase 3 HERIZON-GEA-01 data, FDA Priority Review/RTOR, existing Ziihera commercial validation, a potential $250M U.S. approval milestone and repeated analyst support justify PRE-READY EARLY. Current exchange-quality Aug 19/20 quote is DATA GAP, so no live entry trigger is approved.',{rating:'Pre-Ready Early',risk:'Very High',currentAction:'EVENT WATCH · SMALL SIZE ONLY IF PRICE VERIFIED',executionStage:'PRE-READY EARLY',executionAction:'VERIFY CURRENT PRICE / SIZE SMALL / NO BLIND EVENT CHASE',earnings:'PDUFA 2026-08-25',evidenceConfidence:78});
  addResearch('EROC','ERock','PRE-READY EARLY · AI POWER BACKLOG','Q2 2026 contracted backlog reached about $1.7B, up roughly 10x YoY, with a 470 MW Anthropic order extending production commitments into 2028. Hyperion assembly started, a 366 MW El Paso project supports Meta, and June 30 liquidity was $626.6M cash, no debt, plus an undrawn $250M credit facility. Main risks are execution, customer concentration and the fact that six-month revenue was still down YoY, so no chase after the post-earnings re-rate.',{rating:'Pre-Ready Early',risk:'High',currentAction:'WAIT FOR CONTROLLED RETEST / VALIDATE PRICE',executionStage:'PRE-READY EARLY',executionAction:'VERIFY LIVE PRICE / NO CHASE',evidenceConfidence:70});
  addResearch('ADI','Analog Devices','SMART-MONEY BUILD','AI data-center power-management demand and guidance improvement justify active build-stage research; not READY and no automatic buy.');
  addResearch('KEYS','Keysight Technologies','DISCOVERY SIGNAL','Recent order/revenue acceleration supports an AI/high-speed-test discovery track; requires valuation, sponsorship and price-structure validation before promotion.');
  addResearch('FN','Fabrinet','DISCOVERY SIGNAL','Data-center optical/CPO exposure keeps FN in discovery; require primary-evidence and price/valuation cross-check before any promotion.');

  d.actionPlan=[
    'ACTION NOW：SELECTIVE RECOVERY WATCH。READY 1 = NONE；TECH READY = NONE；Cash 45%。',
    'PRE-READY EARLY：MRVL, ZYME, EROC。ZYME係PDUFA binary-event setup；EROC係AI power/backlog setup，兩者都不可blind chase。',
    'SMART-MONEY BUILD：ADI, POWL。POWL由Phase Out重新打開研究，原因係orders/backlog/data-center mega-order出現實質改善。',
    'DISCOVERY SIGNAL：KEYS, FN。',
    'OUT OF CORE：BYND, RARE, PRAX。PHASE OUT：MOD。NO SETUP：PLTR。',
    'Do not promote any name because it was mentioned externally; promotion requires primary evidence + valuation + expectations risk + price/volume + event-risk confirmation.'
  ];

  const syncVisibleState=()=>{
    const set=(id,text)=>{const el=document.getElementById(id); if(el) el.textContent=text;};
    set('marketMode',d.marketMode);
    set('actionPill',d.marketMode);
    set('defenseStatus',d.defenseStatus);
    set('riskLabel','Selective / Recovery Watch');
    set('riskResultMode','Selective / Recovery Watch');
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(syncVisibleState,0));
  else setTimeout(syncVisibleState,0);
})();
