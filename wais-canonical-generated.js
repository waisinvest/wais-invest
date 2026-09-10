// GENERATED FILE — edit canonical-universe.json, not this file.
(()=>{
  const registry={"version":"2026-09-10-v6-hidden-gems-reconciliation","authority":"WAIS System","contract":{"statusAuthority":"WAIS System only","quoteUniverseRule":"Generate from canonical stages plus policy radar; never maintain a separate hand-written research quote list.","failClosed":true,"activeStages":["READY 1","CANDIDATE+","CANDIDATE","RESEARCH"],"displayRule":"WAIS INVEST mirrors this registry and cannot promote status.","executionPolicy":"wais-execution-policy.json","listLimits":{"coreActionMaximum":12,"researchQueueMaximum":25,"oneTickerOneCanonicalStage":true,"policyRadarCreatesStatus":false},"stageModel":"DISCOVERY → CANDIDATE → CANDIDATE+ → READY 1; technical readiness and Super A are timing overlays, not research stages."},"stages":{"READY 1":[],"CANDIDATE+":["NVDA","MU","DELL"],"CANDIDATE":["TSM","AVGO","LITE","RKLB"],"RESEARCH":["CIEN","VRT","MRVL","COHR","TSEM","FN","CRDO","KEYS","CLS","TTMI","SITM","AEHR","GNRC","EROC","POWL","NVT","AXTI","SLB","HUT","PANW","FRVO","HPE","AMBQ","ALMU","ZYME"],"PHASE OUT":["GFS"]},"nonTradingLabs":{"PRE_IPO_LAB":[{"ticker":"SBE","issuer":"SB Energy, Inc.","reason":"Pre-listing identity; no verified tradable quote. Kept outside the 25-name listed-security Research Queue until listing and symbol are verified.","monitorQuote":false}]},"policyRadar":["MP","UUUU","USAR","NB","WWR","FEAM","KTOS","AVAV","RCAT","PLTR","RKLB","LUNR","LMT","NOC","LEU","CCJ","OKLO","SMR","CEG","GNRC","POWL","VRT","ETN","GEV","TTMI","AEHR","AMKR"],"quoteExceptions":{"SBE":{"monitorQuote":false,"reason":"PRE_IPO_LAB; quote coverage is not applicable until a verified listed symbol exists."}},"migrationNotes":{"asOf":"2026-09-08T09:00:00-04:00","researchCountBefore":26,"researchCountAfter":25,"promotions":[],"downgrades":[],"structuralMoves":["SBE: RESEARCH -> PRE_IPO_LAB","NVDA: legacy TECH READY stage -> CANDIDATE+ research stage + TECH_READY_EVIDENCE timing attribute"],"legacyStageDataGap":null,"noPromotionStatement":"This migration changes taxonomy only. NVDA is not READY 1 and no buy action is created."},"excludedChatOnlyTests":["TGTX"],"timingOverlays":{"TECH_READY_EVIDENCE":["NVDA"],"SUPER A PRE-BREAKOUT":[],"SUPER A ENTRY":[]},"displayViews":{"hiddenGems":{"asOf":"2026-09-10T01:20:00-04:00","maximum":6,"rule":"A compact research-priority view drawn only from the canonical RESEARCH stage; it creates no status and no buy authority.","tickers":["GNRC","POWL","TTMI","AMBQ","AEHR","CRDO"]}}};
  const d=window.WAIS_MARKET_DATA||(window.WAIS_MARKET_DATA={});
  const p=d.opportunityPipeline||(d.opportunityPipeline={});
  const stages=registry.stages||{};
  const overlays=registry.timingOverlays||{};
  const copy=name=>[...(stages[name]||[])];
  p.version=registry.version;
  p.asOf=registry.migrationNotes?.asOf||null;
  p.ready1=copy('READY 1');
  p.candidatePlus=copy('CANDIDATE+');
  p.candidate=copy('CANDIDATE');
  p.research=copy('RESEARCH');
  p.phaseOut=copy('PHASE OUT');
  p.techReady=[...(overlays.TECH_READY_EVIDENCE||[])];
  p.superAPreBreakout=[...(overlays['SUPER A PRE-BREAKOUT']||[])];
  p.superAEntry=[...(overlays['SUPER A ENTRY']||[])];
  p.actionNow=p.superAEntry.length?'SUPER A ENTRY · '+p.superAEntry.join(', '):'WAIT · NO VERIFIED ENTRY';
  d.readyList=[...p.ready1];
  d.canonicalRegistryVersion=registry.version;
  d.contentSyncStatus='CANONICAL · '+registry.version;
  d.contentSyncReason='Generated directly from the WAIS System public canonical registry; quotes cannot promote status.';
  const map={};
  for(const [stage,names] of Object.entries(stages)) for(const ticker of names||[]) map[String(ticker).toUpperCase()]=stage;
  const stocks=Array.isArray(d.focusStocks)?d.focusStocks:(d.focusStocks=[]);
  const hidden=[...(registry.displayViews?.hiddenGems?.tickers||[])];
  const hiddenSet=new Set(hidden);
  for(const stock of stocks){
    const ticker=String(stock.ticker||'').toUpperCase();
    if(map[ticker]){
      stock.executionStage=map[ticker]; stock.waisCanonicalStage=map[ticker];
      stock.stance=map[ticker]; stock.rating=map[ticker];
    }
    stock.timingOverlays=[];
    if(p.techReady.includes(ticker)) stock.timingOverlays.push('TECH READY EVIDENCE');
    if(p.superAPreBreakout.includes(ticker)) stock.timingOverlays.push('SUPER A PRE-BREAKOUT');
    if(p.superAEntry.includes(ticker)) stock.timingOverlays.push('SUPER A ENTRY');
    if(stock.bucket==='HIDDEN_GEM'&&!hiddenSet.has(ticker)) stock.bucket='RESEARCH';
  }
  const profiles={
    GNRC:['Generac Holdings','AI Data-Center Power / Grid'],
    POWL:['Powell Industries','Grid / Switchgear / Data Centers'],
    TTMI:['TTM Technologies','AI Networking / Defense Electronics'],
    AMBQ:['Ambiq Micro','Ultra-Low-Power Edge AI'],
    AEHR:['Aehr Test Systems','Semiconductor Test'],
    CRDO:['Credo Technology','AI Connectivity']
  };
  hidden.forEach((ticker,index)=>{
    let stock=stocks.find(x=>String(x.ticker||'').toUpperCase()===ticker);
    if(!stock){
      const profile=profiles[ticker]||[ticker,'Research'];
      stock={ticker,company:profile[0],category:profile[1],risk:'High',rating:'Research',stance:'RESEARCH',showInWatchlist:false};
      stocks.push(stock);
    }
    stock.bucket='HIDDEN_GEM'; stock.hiddenGemRank=index+1; stock.researchStage='RESEARCH PRIORITY';
    stock.showInWatchlist=false; stock.waisCanonicalStage='RESEARCH'; stock.stance='RESEARCH';
    stock.note='Canonical Hidden Gems research priority · research only, not READY 1 or a buy instruction.';
  });
  d.hiddenGemsReview={...registry.displayViews?.hiddenGems,names:hidden,status:'CURRENT · CANONICAL RESEARCH ONLY'};
  window.WAIS_CANONICAL_REGISTRY=registry;
})();
