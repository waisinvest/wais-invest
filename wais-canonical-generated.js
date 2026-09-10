// GENERATED FILE — edit canonical-universe.json, not this file.
(()=>{
  const registry={"version":"2026-09-08-v5-four-stage-migration","authority":"WAIS System","contract":{"statusAuthority":"WAIS System only","quoteUniverseRule":"Generate from canonical stages plus policy radar; never maintain a separate hand-written research quote list.","failClosed":true,"activeStages":["READY 1","CANDIDATE+","CANDIDATE","RESEARCH"],"displayRule":"WAIS INVEST mirrors this registry and cannot promote status.","executionPolicy":"wais-execution-policy.json","listLimits":{"coreActionMaximum":12,"researchQueueMaximum":25,"oneTickerOneCanonicalStage":true,"policyRadarCreatesStatus":false},"stageModel":"DISCOVERY → CANDIDATE → CANDIDATE+ → READY 1; technical readiness and Super A are timing overlays, not research stages."},"stages":{"READY 1":[],"CANDIDATE+":["NVDA","MU","DELL"],"CANDIDATE":["TSM","AVGO","LITE","RKLB"],"RESEARCH":["CIEN","VRT","MRVL","COHR","TSEM","FN","CRDO","KEYS","CLS","TTMI","SITM","AEHR","GNRC","EROC","POWL","NVT","AXTI","SLB","HUT","PANW","FRVO","HPE","AMBQ","ALMU","ZYME"],"PHASE OUT":["GFS"]},"nonTradingLabs":{"PRE_IPO_LAB":[{"ticker":"SBE","issuer":"SB Energy, Inc.","reason":"Pre-listing identity; no verified tradable quote. Kept outside the 25-name listed-security Research Queue until listing and symbol are verified.","monitorQuote":false}]},"policyRadar":["MP","UUUU","USAR","NB","WWR","FEAM","KTOS","AVAV","RCAT","PLTR","RKLB","LUNR","LMT","NOC","LEU","CCJ","OKLO","SMR","CEG","GNRC","POWL","VRT","ETN","GEV","TTMI","AEHR","AMKR"],"quoteExceptions":{"SBE":{"monitorQuote":false,"reason":"PRE_IPO_LAB; quote coverage is not applicable until a verified listed symbol exists."}},"migrationNotes":{"asOf":"2026-09-08T09:00:00-04:00","researchCountBefore":26,"researchCountAfter":25,"promotions":[],"downgrades":[],"structuralMoves":["SBE: RESEARCH -> PRE_IPO_LAB","NVDA: legacy TECH READY stage -> CANDIDATE+ research stage + TECH_READY_EVIDENCE timing attribute"],"legacyStageDataGap":null,"noPromotionStatement":"This migration changes taxonomy only. NVDA is not READY 1 and no buy action is created."},"excludedChatOnlyTests":["TGTX"],"timingOverlays":{"TECH_READY_EVIDENCE":["NVDA"],"SUPER A PRE-BREAKOUT":[],"SUPER A ENTRY":[]}};
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
  for(const stock of d.focusStocks||[]){
    const ticker=String(stock.ticker||'').toUpperCase();
    if(map[ticker]){
      stock.executionStage=map[ticker]; stock.waisCanonicalStage=map[ticker];
      stock.stance=map[ticker]; stock.rating=map[ticker];
    }
    stock.timingOverlays=[];
    if(p.techReady.includes(ticker)) stock.timingOverlays.push('TECH READY EVIDENCE');
    if(p.superAPreBreakout.includes(ticker)) stock.timingOverlays.push('SUPER A PRE-BREAKOUT');
    if(p.superAEntry.includes(ticker)) stock.timingOverlays.push('SUPER A ENTRY');
  }
  window.WAIS_CANONICAL_REGISTRY=registry;
})();
