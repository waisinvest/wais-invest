// WAIS Watchlist visual priority order v1.2
// Keep TOP PICK #1-#5 first, then arrange the remaining Watchlist by actionable priority.
// CSS Grid fills row-major, so the visual reading order is LEFT -> RIGHT -> next row.
(function(){
  const d=window.WAIS_MARKET_DATA||(window.WAIS_MARKET_DATA={});
  const stocks=Array.isArray(d.focusStocks)?d.focusStocks:[];

  const visible=stocks.filter(s=>s&&s.showInWatchlist===true);
  const ticker=s=>String(s?.ticker||'').toUpperCase().trim();
  const stateText=s=>`${String(s?.executionStage||'')} ${String(s?.stance||'')} ${String(s?.rating||'')}`.toUpperCase();

  // TOP PICK #1-#5 are canonical and always stay first.
  const top=[...visible]
    .filter(s=>Number.isFinite(Number(s.topPickRank)))
    .sort((a,b)=>Number(a.topPickRank)-Number(b.topPickRank));
  const topSet=new Set(top.map(ticker));

  // After Top 5, do NOT fall back to alphabetic ticker order.
  // Actionable/near-entry states come first, followed by Candidate+, Candidate, Watch, Wait.
  function stageRank(s){
    const x=stateText(s);
    if(x.includes('READY 1')||x.includes('TECH READY')) return 0;
    if(x.includes('NEAR ENTRY')||x.includes('ENTRY WATCH')||x.includes('TECH WATCH')||x.includes('TECH TRANSITION')||x.includes('SCOUT')) return 1;
    if(x.includes('CANDIDATE+')) return 2;
    if(x.includes('CANDIDATE')) return 3;
    if(x.includes('WATCH')) return 4;
    if(x.includes('WAIT')||x.includes('CAUTIOUS')) return 5;
    if(x.includes('RESEARCH')||x.includes('VALIDAT')) return 6;
    return 7;
  }

  const rest=[...visible]
    .filter(s=>!topSet.has(ticker(s)))
    .sort((a,b)=>
      stageRank(a)-stageRank(b) ||
      Number(b.evidenceConfidence||0)-Number(a.evidenceConfidence||0) ||
      ticker(a).localeCompare(ticker(b))
    );

  const ordered=[...top,...rest];
  d.watchPriorityOrder=ordered.map(ticker);
  d.watchPriorityPolicy={
    version:'1.2',
    readingOrder:'LEFT_TO_RIGHT_THEN_NEXT_ROW',
    rule:'TOP PICK #1-#5 first as a dedicated block. Remaining Watchlist names follow as Active Watchlist #6 onward, ordered by final execution/action stage, then WAIS evidence score.',
    stagePriority:['READY / TECH READY','NEAR ENTRY / TECH WATCH / SCOUT','CANDIDATE+','CANDIDATE','WATCH','WAIT','RESEARCH']
  };
  ordered.forEach((s,i)=>{ s.watchPriorityRank=i+1; });
  window.WAIS_MARKET_DATA=d;

  const css=document.createElement('style');
  css.textContent=`
    .watch-section-divider{grid-column:1/-1;display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin:12px 0 2px;padding:12px 4px 8px;border-bottom:1px solid rgba(136,168,255,.22)}
    .watch-section-divider b{font-size:16px;letter-spacing:.02em}.watch-section-divider span{font-size:11px;color:#91a0bb}
    .watch-section-divider.top-block b{color:#dbe5ff}.watch-section-divider.active-block{margin-top:22px}
    @media(max-width:720px){.watch-section-divider{align-items:flex-start;flex-direction:column;gap:4px}}
  `;
  document.head.appendChild(css);

  function makeDivider(kind,count){
    const div=document.createElement('div');
    div.className=`watch-section-divider ${kind==='top'?'top-block':'active-block'}`;
    div.dataset.waisDivider=kind;
    div.innerHTML=kind==='top'
      ?`<b>TOP PICKS · #1–#${count}</b><span>最高優先級先行｜由左至右閱讀</span>`
      :`<b>ACTIVE WATCHLIST · #${top.length+1}–#${ordered.length}</b><span>其餘候選按行動優先級排列｜由左至右閱讀</span>`;
    return div;
  }

  function applyVisualOrder(){
    const grid=document.getElementById('watchlistCards');
    if(!grid) return;
    const cards=[...grid.querySelectorAll('.watch-card')];
    if(!cards.length) return;

    grid.querySelectorAll('.watch-section-divider').forEach(x=>x.remove());

    const orderIndex=new Map(d.watchPriorityOrder.map((t,i)=>[t,i]));
    const sorted=[...cards].sort((a,b)=>{
      const ta=String(a.querySelector('h4')?.textContent||'').trim().toUpperCase();
      const tb=String(b.querySelector('h4')?.textContent||'').trim().toUpperCase();
      return (orderIndex.get(ta)??999)-(orderIndex.get(tb)??999);
    });

    if(top.length) grid.appendChild(makeDivider('top',top.length));

    sorted.forEach((card,index)=>{
      if(index===top.length && rest.length) grid.appendChild(makeDivider('active',rest.length));
      grid.appendChild(card);
      const t=String(card.querySelector('h4')?.textContent||'').trim().toUpperCase();
      const s=stocks.find(x=>ticker(x)===t);
      if(!s) return;

      if(!Number.isFinite(Number(s.topPickRank))){
        const head=card.querySelector('.signal-card-head');
        if(head){
          let chip=head.querySelector('.watch-priority-chip');
          if(!chip){
            chip=document.createElement('span');
            chip.className='priority-chip watch-priority-chip';
            head.appendChild(chip);
          }
          chip.textContent=`WATCH #${index+1}`;
        }
      }
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{
    const grid=document.getElementById('watchlistCards');
    if(!grid) return;
    let busy=false;
    const observer=new MutationObserver(()=>{
      if(busy) return;
      busy=true;
      observer.disconnect();
      applyVisualOrder();
      observer.observe(grid,{childList:true});
      busy=false;
    });
    applyVisualOrder();
    observer.observe(grid,{childList:true});
  });
})();
