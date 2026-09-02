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
    }
  });

  // Top Picks must be a deterministic view of the latest pipeline, not legacy ranks.
  fs.forEach(s=>{ if(Number.isFinite(Number(s.topPickRank))) s.topPickRank=null; });
  const topOrder=[...candidatePlus,...candidate].slice(0,5);
  topOrder.forEach((t,i)=>{ if(by[t]){by[t].topPickRank=i+1;by[t].showInWatchlist=true;} });

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
