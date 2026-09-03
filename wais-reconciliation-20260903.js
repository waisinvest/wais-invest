// WAIS INVEST display reconciliation overlay — 2026-09-03
// WAIS INVEST is display-only. It mirrors WAIS System-approved stages and cannot create status.
(function(){
  const d=window.WAIS_MARKET_DATA||(window.WAIS_MARKET_DATA={});
  const p=d.opportunityPipeline||(d.opportunityPipeline={});
  const norm=t=>String(t||'').toUpperCase().trim();
  const uniq=a=>[...new Set((Array.isArray(a)?a:[]).map(norm).filter(Boolean))];

  p.ready1=[];
  p.techReady=[];
  p.candidatePlus=['NVDA'];
  p.candidate=['LITE','MU','MRVL','TSM','AVGO','COHR','TSEM','RKLB'];
  p.research=uniq(['TTMI','AMBQ','GNRC','AEHR','POWL','CRDO','SITM','FN','VRT','CLS','ALMU','EROC','ZYME','AXTI','SBE',...(Array.isArray(p.research)?p.research:[])]);
  p.phaseOut=uniq([...(Array.isArray(p.phaseOut)?p.phaseOut:[]),'GFS']);

  const higher=new Set();
  function cleanStage(name){
    const arr=uniq(p[name]);
    const kept=arr.filter(t=>!higher.has(t));
    kept.forEach(t=>higher.add(t));
    p[name]=kept;
  }
  ['ready1','techReady','candidatePlus','candidate','research','phaseOut'].forEach(cleanStage);

  const duplicateFocusTickers=[];
  if(Array.isArray(d.focusStocks)){
    const map=new Map();
    for(const s of d.focusStocks){
      if(!s) continue;
      const t=norm(s.ticker);
      if(!t) continue;
      if(map.has(t)) duplicateFocusTickers.push(t);
      map.set(t,map.has(t)?{...map.get(t),...s,ticker:t}:{...s,ticker:t});
    }
    d.focusStocks=[...map.values()];
  }

  const stageByTicker={};
  p.ready1.forEach(t=>stageByTicker[t]='READY 1');
  p.techReady.forEach(t=>stageByTicker[t]='TECH READY');
  p.candidatePlus.forEach(t=>stageByTicker[t]='CANDIDATE+');
  p.candidate.forEach(t=>stageByTicker[t]='CANDIDATE');
  p.research.forEach(t=>stageByTicker[t]='RESEARCH');
  p.phaseOut.forEach(t=>stageByTicker[t]='PHASE OUT');
  if(Array.isArray(d.focusStocks)){
    d.focusStocks.forEach(s=>{
      const t=norm(s.ticker);
      if(stageByTicker[t]){
        s.executionStage=stageByTicker[t];
        s.waisCanonicalStage=stageByTicker[t];
      }
    });
  }

  const quoteKeys=new Set(Object.keys((window.WAIS_STOCK_PRICES&&window.WAIS_STOCK_PRICES.prices)||d.stockPrices||{}).map(norm));
  const activeUniverse=uniq([...p.ready1,...p.techReady,...p.candidatePlus,...p.candidate,...p.research]);
  const missingQuoteCoverage=activeUniverse.filter(t=>!quoteKeys.has(t));

  d.superAEntryRadar={
    version:'2026-09-03',
    authority:'DISPLAY OF WAIS ENTRY FILTER ONLY',
    eligibleFrom:'READY 1',
    primarySignal:'SUPER A PRE-BREAKOUT CONFIRMED',
    confirmationUse:'Breakout confirmation is execution/add evidence, not a new research status',
    status:p.ready1.length?'ACTIVE':'NO ELIGIBLE READY 1 NAMES'
  };

  d.reconciliationReport={
    asOf:'2026-09-03T00:31:45Z',
    authority:'WAIS System → WAIS INVEST display',
    ready1:p.ready1,
    techReady:p.techReady,
    candidatePlus:p.candidatePlus,
    candidate:p.candidate,
    research:p.research,
    phaseOut:p.phaseOut,
    duplicateFocusTickers:uniq(duplicateFocusTickers),
    missingQuoteCoverage,
    excludedChatOnlyTests:['DELL','TGTX'],
    notes:[
      'WAIS INVEST does not create or promote statuses.',
      'DELL/TGTX chat-side Super A tests are excluded from canonical stages.',
      'No ticker may appear in more than one research stage after reconciliation.',
      'Missing public quote fields remain DATA GAP and do not alter System status.'
    ]
  };
  d.contentSyncStatus=`RECONCILED · READY 1 ${p.ready1.length?p.ready1.join(', '):'NONE'} · TECH READY ${p.techReady.length?p.techReady.join(', '):'NONE'}`;
  d.lastReconciled='2026-09-03T00:31:45Z';
  window.WAIS_MARKET_DATA=d;
  try{window.dispatchEvent(new CustomEvent('wais:reconciled',{detail:d.reconciliationReport}));}catch(_e){}
})();
