// WAIS Top Picks canonical rank normalizer v1.0
// Ensures Top Picks and Watchlist share one unique TOP PICK #1–#5 ordering.
(function(){
  const d=window.WAIS_MARKET_DATA||(window.WAIS_MARKET_DATA={});
  const stocks=Array.isArray(d.focusStocks)?d.focusStocks:[];
  const p=d.opportunityPipeline||{};

  const tickerOf=x=>String(typeof x==='string'?x:(x&&x.ticker)||'').toUpperCase().trim();
  const ordered=[];
  const add=arr=>{
    (Array.isArray(arr)?arr:[]).forEach(x=>{
      const t=tickerOf(x);
      if(t&&!ordered.includes(t)) ordered.push(t);
    });
  };

  // Pipeline priority is authoritative. Technical-ready names come first,
  // followed by Candidate+, then Candidate. READY 1 would outrank all when active.
  add(p.ready1);
  add(p.techReady);
  add(p.candidatePlus);
  add(p.candidate);

  // Remove stale ranks inherited from older base/override snapshots.
  stocks.forEach(s=>{ delete s.topPickRank; });

  const canonical=ordered
    .filter(t=>stocks.some(s=>String(s.ticker||'').toUpperCase()===t&&s.showInWatchlist===true))
    .slice(0,5);

  canonical.forEach((ticker,index)=>{
    const s=stocks.find(x=>String(x.ticker||'').toUpperCase()===ticker);
    if(s) s.topPickRank=index+1;
  });

  d.topPickOrder=canonical;
  d.topPickRankPolicy={
    version:'1.0',
    rule:'Exactly one canonical TOP PICK rank per ticker; ranks are rebuilt from the current opportunity pipeline and limited to #1–#5.',
    sourcePriority:['READY 1','TECH READY','CANDIDATE+','CANDIDATE']
  };

  window.WAIS_MARKET_DATA=d;
})();
