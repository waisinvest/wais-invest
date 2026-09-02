// WAIS column reconciliation — 2026-09-01
// Purpose: make rendered card columns follow the latest canonical pipeline/system state.
// This file does not invent prices, targets, triggers or proprietary model fields.
(function(){
  const d=window.WAIS_MARKET_DATA||(window.WAIS_MARKET_DATA={});
  const p=d.opportunityPipeline||(d.opportunityPipeline={});
  const fs=Array.isArray(d.focusStocks)?d.focusStocks:(d.focusStocks=[]);
  const by=Object.fromEntries(fs.map(x=>[String(x.ticker||'').toUpperCase(),x]));
  const arr=x=>Array.isArray(x)?x:[];
  const tickers=x=>arr(x).map(v=>typeof v==='string'?v:v?.ticker).filter(Boolean).map(v=>String(v).toUpperCase());
  const candidatePlus=tickers(p.candidatePlus);
  const candidate=tickers(p.candidate);
  const research=tickers(p.research);
  const phaseOut=tickers(p.phaseOut);
  const ready1=tickers(p.ready1);
  const techReady=tickers(p.techReady);
  const activeWatch=new Set([...ready1,...techReady,...candidatePlus,...candidate]);
  const researchSet=new Set(research);
  const phaseSet=new Set(phaseOut);
  const setStatus=(t,status,rating)=>{
    const s=by[t]; if(!s)return;
    s.stance=status;
    s.rating=rating||status;
    s.currentAction=ready1.includes(t)?'READY 1':techReady.includes(t)?'TECH READY':'WAIT / VALIDATE';
    s.decisionAsOf=p.asOf||d.lastStrategyUpdated||d.lastUpdated||'2026-09-01';
  };
  ready1.forEach(t=>setStatus(t,'READY 1','READY 1'));
  techReady.forEach(t=>setStatus(t,'TECH READY','TECH READY'));
  candidatePlus.forEach(t=>setStatus(t,'CANDIDATE+','Candidate+'));
  candidate.forEach(t=>setStatus(t,'CANDIDATE','Candidate'));
  research.forEach(t=>setStatus(t,'RESEARCH','Research'));
  phaseOut.forEach(t=>setStatus(t,'PHASE OUT','Phase Out'));

  fs.forEach(s=>{
    const t=String(s.ticker||'').toUpperCase();
    if(phaseSet.has(t)){
      s.showInWatchlist=false;
      s.topPickRank=null;
      s.bucket='PHASE_OUT';
      s.currentAction='DO NOT ADD';
    }else if(activeWatch.has(t)){
      s.showInWatchlist=true;
      if(s.bucket==='HIDDEN_GEM'||s.bucket==='RESEARCH')s.bucket='WATCHLIST';
    }else if(researchSet.has(t)){
      s.showInWatchlist=false;
      s.topPickRank=null;
      s.bucket='HIDDEN_GEM';
      s.researchStage=s.researchStage||'VALIDATING';
    }else{
      // Latest canonical Pipeline owns System membership. A legacy base-stock that
      // is absent from every current bucket must not remain in the live Watchlist.
      s.showInWatchlist=false;
      s.topPickRank=null;
      if(s.bucket==='WATCHLIST') s.bucket='NO_CURRENT_SETUP';
      s.currentAction='NO CURRENT CANONICAL SETUP';
    }
  });

  // Top Picks must be a deterministic view of the latest pipeline, not legacy ranks.
  fs.forEach(s=>{ if(Number.isFinite(Number(s.topPickRank))) s.topPickRank=null; });
  const topOrder=[...candidatePlus,...candidate].slice(0,5);
  topOrder.forEach((t,i)=>{ if(by[t]){by[t].topPickRank=i+1;by[t].showInWatchlist=true;} });

  // Replace date-stale card commentary with the current canonical decision state.
  const currentDecisionNotes={
    NVDA:'Candidate+ only after the Sep 1 post-close audit; wait for verified price, breadth and event confirmation before any READY promotion.',
    LITE:'Candidate only; wait for a 20D reclaim and volatility contraction before reconsidering promotion.',
    MU:'Candidate only; Entry, Target, Trigger and Invalidation remain under current-cycle validation.',
    MRVL:'Candidate only; retain in the AI-networking universe but require controlled price and breadth confirmation.',
    TSM:'Candidate only; foundry thesis remains under observation while current execution levels are revalidated.',
    AVGO:'Candidate only; Sep 2 after-close earnings is a hard event gate before any promotion.',
    COHR:'Candidate only; require post-decline stabilization and current evidence confirmation.',
    TSEM:'Candidate only; wait for a better verified risk/reward setup.',
    RKLB:'Candidate only; execution and timing risk remain part of the current validation.'
  };
  Object.entries(currentDecisionNotes).forEach(([t,n])=>{if(by[t])by[t].note=n;});

  // Time-sensitive presentation fields follow the current System decision cycle.
  const decisionDate=String(d.lastStrategyUpdated||p.asOf||d.lastUpdated||'2026-09-01').slice(0,10);
  d.dailyThought={
    date:decisionDate,
    zh:'到價只是候選，承接確認才是訊號。',
    en:'Reaching a price level creates a candidate; confirmation creates a signal.'
  };
  if(by.NVDA)by.NVDA.earnings='2026-08-26 · REPORTED';
  if(by.AVGO)by.AVGO.earnings='2026-09-02 · AFTER CLOSE · 17:00 ET';
  ['LITE','MU','MRVL','TSM','COHR','TSEM','RKLB'].forEach(t=>{if(by[t])by[t].earnings='NEXT DATE · NOT YET CONFIRMED';});

  // Research Library must use the current System cycle, never legacy weekly notes.
  d.weeklyMarketNotes=[
    {title:'ACTION NOW · DEFENSE / SELECTIVE',action:'READY 1 NONE',body:'55% cash；READY 1及TECH READY維持NONE，不因日內價格變動自動升級。'},
    {title:'OPPORTUNITY PIPELINE',action:'NVDA CANDIDATE+',body:'NVDA維持Candidate+；LITE、MU、MRVL、TSM、AVGO、COHR、TSEM、RKLB維持Candidate。'},
    {title:'EVENT GATE',action:'AVGO 9/2 AFTER CLOSE',body:'AVGO業績及指引完成核實前，不升級AI networking／semiconductor路線。'},
    {title:'VALIDATION RULE',action:'NO FABRICATED LEVELS',body:'Entry、Target、Trigger及Invalidation未經VERIFIED／CHECKED只顯示VALIDATING或DATA GAP。'},
    {title:'PUBLIC DATA POLICY',action:'DELAYED · NOT REAL-TIME',body:'市場價格只作最新可取得公開snapshot，必須同時顯示source、as-of及delay狀態；決策仍由WAIS System批准。'}
  ];
  d.technicalSummary=[
    {key:'SP500',name:'S&P 500',signal:'WAIT',note:'Live public snapshot只供市場脈搏；正式風險狀態仍為Sep 1 post-close DEFENSE。'},
    {key:'NASDAQ',name:'NASDAQ Composite',signal:'WAIT',note:'日內反彈不等於READY；需等收市breadth及System重新批准。'},
    {key:'NASDAQ100',name:'NASDAQ 100',signal:'WAIT',note:'大型科技股仍受事件與利率閘門約束。'},
    {key:'SOX',name:'SOX',signal:'DEFENSE',note:'半導體breadth未經新收市審核前，不撤銷Sep 1防守判斷。'},
    {key:'VIX',name:'VIX',signal:'CAUTIOUS',note:'波動率snapshot只作風險輸入，不單獨產生買入訊號。'},
    {key:'US10Y',name:'US 10Y',signal:'DEFENSE',note:'高孳息率仍是長久期估值阻力；等收市後重新核實。'},
    {key:'HSI',name:'Hang Seng Index',signal:'WAIT',note:'香港市場已收市資料；不由公開價格feed自行產生交易批准。'},
    {key:'HSTECH',name:'Hang Seng TECH',signal:'WAIT',note:'香港科技股只作市場結構觀察，決策由System另行批准。'},
    {key:'HSIF',name:'Hang Seng Futures',signal:'DATA GAP',note:'保留最後已驗證公開snapshot；automatic source unavailable，NOT current / NOT exchange real-time。'}
  ];
  if(by.AXTI)by.AXTI.note='Research only; extreme volatility and current valuation/technical evidence require a fresh System review before any promotion.';
  if(by.AEHR)by.AEHR.note='Research only; earnings quality, valuation and current price structure require fresh verification before any promotion.';

  // Entry / Target / Trigger / Invalidation authority guard.
  // Legacy numeric values are retained only as explicitly named references so they
  // cannot render as a fresh trading signal. A value may render again only after a
  // future evidence cycle explicitly marks that field VERIFIED or CHECKED.
  const isValidated=v=>/\b(VERIFIED|CHECKED)\b/i.test(String(v||'')) && !/NOT\s+(VERIFIED|CHECKED)/i.test(String(v||''));
  fs.forEach(s=>{
    const t=String(s.ticker||'').toUpperCase();
    const governed=activeWatch.has(t)||researchSet.has(t)||phaseSet.has(t);
    if(!governed)return;

    if(Number.isFinite(Number(s.entry)) && Number(s.entry)>0 && !isValidated(s.entryValidation)){
      s.legacyEntryReference=Number(s.entry);
      s.entry=null;
    }
    if(Number.isFinite(Number(s.target)) && Number(s.target)>0 && !isValidated(s.targetValidation)){
      s.legacyTargetReference=Number(s.target);
      s.target=null;
    }

    if(activeWatch.has(t)){
      s.entryValidation=isValidated(s.entryValidation)?s.entryValidation:'VALIDATING · NOT A BUY SIGNAL';
      s.targetValidation=isValidated(s.targetValidation)?s.targetValidation:'VALIDATING · RESEARCH REFERENCE ONLY';
      s.triggerValidation=isValidated(s.triggerValidation)?s.triggerValidation:'DATA GAP · REVALIDATE BEFORE READY';
      s.invalidationValidation=isValidated(s.invalidationValidation)?s.invalidationValidation:'DATA GAP · REVALIDATE BEFORE READY';
    }else if(researchSet.has(t)){
      s.entryValidation=isValidated(s.entryValidation)?s.entryValidation:'NOT SET · RESEARCH STAGE';
      s.targetValidation=isValidated(s.targetValidation)?s.targetValidation:'NOT SET · RESEARCH STAGE';
      s.triggerValidation=isValidated(s.triggerValidation)?s.triggerValidation:'DATA GAP · RESEARCH STAGE';
      s.invalidationValidation=isValidated(s.invalidationValidation)?s.invalidationValidation:'DATA GAP · RESEARCH STAGE';
    }else if(phaseSet.has(t)){
      s.entryValidation='PHASE OUT · NO NEW ENTRY';
      s.targetValidation='PHASE OUT · NOT AN ACTIVE TARGET';
      s.triggerValidation='PHASE OUT';
      s.invalidationValidation='PHASE OUT';
    }
  });

  // Target Achievement is a canonical decision-state field. The presentation layer
  // may calculate progress only when both Entry and Target remain explicitly verified.
  // Otherwise it must show the System status instead of deriving a percentage from
  // legacy, localStorage, research-only or missing values.
  fs.forEach(s=>{
    const t=String(s.ticker||'').toUpperCase();
    if(activeWatch.has(t)){
      const entryReady=Number.isFinite(Number(s.entry))&&Number(s.entry)>0&&isValidated(s.entryValidation);
      const targetReady=Number.isFinite(Number(s.target))&&Number(s.target)>0&&isValidated(s.targetValidation);
      s.targetAchievement=entryReady&&targetReady&&Number(s.target)>Number(s.entry)
        ?{status:'TRACKING · VERIFIED SYSTEM LEVELS',calculation:'(current - entry) / (target - entry)',asOf:s.decisionAsOf||p.asOf||d.lastStrategyUpdated}
        :{status:'NOT CALCULATED · ENTRY / TARGET NOT VERIFIED',calculation:null,asOf:s.decisionAsOf||p.asOf||d.lastStrategyUpdated};
    }else if(researchSet.has(t)){
      s.targetAchievement={status:'NOT SET · RESEARCH STAGE',calculation:null,asOf:s.decisionAsOf||p.asOf||d.lastStrategyUpdated};
    }else if(phaseSet.has(t)){
      s.targetAchievement={status:'PHASE OUT · NOT TRACKED',calculation:null,asOf:s.decisionAsOf||p.asOf||d.lastStrategyUpdated};
    }
  });
  d.targetAchievementPolicy={
    authority:'WAIS SYSTEM',
    formula:'(current - verified entry) / (verified target - verified entry)',
    rule:'No percentage unless Entry and Target are both VERIFIED/CHECKED. Browser-saved levels cannot override System stocks.',
    asOf:d.lastStrategyUpdated||p.asOf||'2026-09-01'
  };

  // Research Integrity panel: machine gaps and manual/public-web work are separate facts.
  const ri=d.researchIntegrity||(d.researchIntegrity={});
  ri.asOf=d.lastStrategyUpdated||ri.asOf||'2026-09-01 19:45 ET';
  ri.overallStatus='CHECKED · MANUAL/WEB FALLBACK USED WHERE MACHINE ADAPTERS UNAVAILABLE';
  ri.evidenceOfWork=[
    {layer:'Serenity / specialist machine adapter',status:'DATA GAP',evidence:'Machine adapter unavailable; research continued via Reuters / TrendForce public specialist fallback.'},
    {layer:'Manual specialist / public web fallback',status:'CHECKED',evidence:'Reuters market/industry and TrendForce AI-infrastructure cross-check completed.'},
    {layer:'Company IR',status:'CHECKED',evidence:'Broadcom, NVIDIA, TTM Technologies and Generac primary materials checked.'},
    {layer:'SEC / regulatory machine adapter',status:'DATA GAP',evidence:'No dedicated adapter in this runtime; public sec.gov access used separately.'},
    {layer:'SEC / regulatory public fallback',status:'CHECKED',evidence:'TTM 10-Q/acquisition filings and Generac filing availability cross-checked through public SEC.'},
    {layer:'Earnings / guidance / transcripts',status:'CHECKED',evidence:'NVIDIA/Marvell reported results and Broadcom Sep 2 hard gate checked.'},
    {layer:'Institutional / industry research',status:'CHECKED',evidence:'Reuters and TrendForce evidence cross-checked against company materials.'},
    {layer:'Supply-chain cross-check',status:'CHECKED',evidence:'AWS/NVIDIA deployment, AI racks/cooling, TTM networking and Generac hyperscale demand compared.'},
    {layer:'New-universe discovery',status:'CHECKED',evidence:'SB Energy IPO surfaced as research-only; no automatic promotion.'},
    {layer:'Economic / earnings calendar',status:'CHECKED',evidence:'Sep 1 JOLTS/Construction results verified; verified master precedes rolling weekly normalizer.'},
    {layer:'Income NAV / ROC / total-return',status:'DATA GAP',evidence:'No new full-universe evidence set completed this cycle; no Income Best/READY promotion.'},
    {layer:'Route Intelligence',status:'CHECKED',evidence:'Stock / Leveraged / Bearish / Income READY remain independently gated; no Best promotion.'}
  ];

  d.columnReconciliation={
    asOf:'2026-09-01 19:45 ET',
    source:'Latest canonical opportunityPipeline + 2026-09-01 post-close system state',
    status:'ACTIVE',
    protectedFields:'Legacy Entry/Target hidden until VERIFIED/CHECKED; Target Achievement unavailable without verified System levels; no fabricated price / target / trigger / invalidation values'
  };
  window.WAIS_MARKET_DATA=d;
})();
