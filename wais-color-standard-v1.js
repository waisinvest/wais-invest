// WAIS UNIVERSAL COLOR STANDARD v2.2 — stable one-shot rendering; no DOM observer loops.
(function(){
  const STANDARD={
    GREEN:{meaning:'READY 1 / BUY / ADD / ACTIVE HOLD'},
    YELLOW:{meaning:'WAIT / CANDIDATE+ / NEAR ENTRY / TECH READY / PENDING CONFIRMATION'},
    BLUE:{meaning:'WATCH / CANDIDATE / RESEARCH / VALIDATING / DISCOVERY'},
    PURPLE:{meaning:'DEFENSE / PROTECT PROFIT / TRIM / MOSTLY CASH'},
    RED:{meaning:'EXIT / REJECT / STOP / PHASE OUT / AVOID / CRITICAL'},
    GREY:{meaning:'NO SIGNAL / DATA GAP / DATA PENDING / CLOSED / N/A / INSUFFICIENT'}
  };
  const ROUTES={
    STOCK:{meaning:'Underlying equity route',token:'route-stock'},
    LEVERAGED:{meaning:'Leveraged route; lightning icon is mandatory',token:'route-leveraged'},
    INCOME:{meaning:'Income route; never use READY green as the product identity colour',token:'route-income'}
  };
  window.WAIS_COLOR_STANDARD=Object.freeze(STANDARD);
  window.WAIS_ROUTE_COLOR_STANDARD=Object.freeze(ROUTES);
  const CLS=['wais-color-green','wais-color-yellow','wais-color-blue','wais-color-purple','wais-color-red','wais-color-grey'];
  const clean=v=>String(v||'').trim().toUpperCase();
  function colorForStatus(status=''){
    const s=clean(status);
    if(!s||/NO SIGNAL|NONE|DATA PENDING|DATA GAP|INSUFFICIENT|UNKNOWN|NOT CHECKED|MARKET CLOSED|CLOSED|N\/A/.test(s)) return 'grey';
    if(/EXIT|REJECT|STOP|PHASE OUT|REMOVE|AVOID|CRITICAL/.test(s)) return 'red';
    if(/DEFENSE|DEFENSIVE|PROTECT|TRIM|MOSTLY CASH/.test(s)) return 'purple';
    if(/CANDIDATE\+|READY WATCH|NEAR ENTRY|TECH READY|ENTRY WATCH|EVENT WATCH|WAIT|CAUTIOUS|PENDING CONFIRMATION|OVERHEAT WATCH/.test(s)) return 'yellow';
    if(/(^|\b)READY 1(\b|$)|READY INCOME 1|^READY$|\bBUY\b|\bADD\b|FIRST TRANCHE|ACTIVE HOLD|\bMANAGE\b/.test(s)) return 'green';
    if(/CANDIDATE|WATCH|RESEARCH|DISCOVERY|VALIDAT|SCOUT|EARLY|CHECKED|MANUAL CHECK|ACTIVE \/ PARTIAL/.test(s)) return 'blue';
    return 'grey';
  }
  function apply(el,status){
    if(!el)return;
    CLS.forEach(c=>el.classList.remove(c));
    const c=colorForStatus(status);
    el.classList.add(`wais-color-${c}`);
    el.dataset.waisCanonicalColour=c;
  }
  window.getSignalMeta=status=>{const c=colorForStatus(status);return{className:`signal-${c}`,label:status||'NO SIGNAL',waisColor:c};};
  window.getResearchStageMeta=stage=>{const s=clean(stage||'RESEARCH');return{label:s||'RESEARCH',className:'stage-research'};};

  function normalize(){
    document.querySelectorAll('.signal-chip,.status-text,.pill,.research-stage-chip,.research-stage-cell,.wais-route-decision').forEach(el=>apply(el,el.textContent));
    document.querySelectorAll('#income .income-card').forEach(card=>{
      const ticker=card.querySelector('.income-title-row h3,h3')?.textContent?.trim()?.toUpperCase();
      const item=(window.WAIS_MARKET_DATA?.incomeEtfs||[]).find(x=>clean(x.ticker)===ticker);
      const s=item?.status||card.querySelector('.signal-chip')?.textContent||'NO SIGNAL';
      apply(card,s);apply(card.querySelector('.signal-chip'),s);apply(card.querySelector('.today-action'),s);
    });
    document.querySelectorAll('#income .yield-hero strong,#income .stock-meta b,#income .safe-entry-grid strong,#route-intelligence .route-metric b').forEach(el=>el.classList.add('wais-neutral-metric'));
  }

  const css=document.createElement('style');
  css.id='wais-universal-colour-standard';
  css.textContent=`
    :root{--wais-ready:#45d49a;--wais-ready-bg:rgba(46,169,113,.15);--wais-wait:#f0c85a;--wais-wait-bg:rgba(198,151,42,.15);--wais-watch:#69aee8;--wais-watch-bg:rgba(57,126,185,.14);--wais-protect:#aa7be8;--wais-protect-bg:rgba(123,76,182,.14);--wais-exit:#e66565;--wais-exit-bg:rgba(185,55,55,.14);--wais-grey:#9aa5b5;--wais-grey-bg:rgba(104,114,130,.12);--wais-route-stock:#4f7fe8;--wais-route-leveraged:#ff9f43;--wais-route-income:#28c7be}
    .wais-color-green,.signal-green{color:#a2f3d0!important;border-color:rgba(69,212,154,.67)!important;background:var(--wais-ready-bg)!important}
    .wais-color-yellow,.signal-yellow,.signal-orange{color:#ffe28a!important;border-color:rgba(240,200,90,.68)!important;background:var(--wais-wait-bg)!important}
    .wais-color-blue,.signal-blue{color:#b2ddff!important;border-color:rgba(105,174,232,.64)!important;background:var(--wais-watch-bg)!important}
    .wais-color-purple,.signal-purple{color:#ddc0ff!important;border-color:rgba(170,123,232,.66)!important;background:var(--wais-protect-bg)!important}
    .wais-color-red,.signal-red{color:#ffb0ae!important;border-color:rgba(230,101,101,.68)!important;background:var(--wais-exit-bg)!important}
    .wais-color-grey,.signal-grey{color:#c8d0dc!important;border-color:rgba(154,165,181,.50)!important;background:var(--wais-grey-bg)!important}
    .stage-validating,.stage-research,.stage-watchlist{color:#b2ddff!important;border-color:rgba(105,174,232,.64)!important;background:var(--wais-watch-bg)!important}
    .wais-route-type-stock{--route-accent:var(--wais-route-stock)!important}.wais-route-type-leveraged{--route-accent:var(--wais-route-leveraged)!important}.wais-route-type-income{--route-accent:var(--wais-route-income)!important}
    .wais-neutral-metric{color:#edf4ff!important;background:transparent!important;text-shadow:none!important}
    #income .yield-hero strong,#income .stock-meta b,#income .safe-entry-grid strong{color:#edf4ff!important}
    #route-intelligence .route-detail-card{box-shadow:none!important}
    .hero>div:first-child{flex:1 1 420px;min-width:320px}
    .hero-status{flex:0 1 52%;max-width:560px;min-width:300px;align-self:flex-end}
    .hero-status>div{min-width:0}
    .hero-status strong{display:block;white-space:normal;overflow-wrap:anywhere;line-height:1.15;font-size:clamp(16px,1.7vw,25px)}
    .hero p{white-space:normal;word-break:normal;overflow-wrap:break-word}
    @media(max-width:900px){.hero{flex-direction:column;align-items:flex-start}.hero>div:first-child,.hero-status{min-width:0;max-width:none;width:100%;flex:auto}.hero-status{align-self:stretch}}
  `;
  document.head.appendChild(css);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(normalize,250),{once:true});
  else setTimeout(normalize,0);
  window.addEventListener('load',()=>setTimeout(normalize,120),{once:true});
  window.addEventListener('wais:quotes-updated',()=>setTimeout(normalize,80));
  window.WAIS_APPLY_COLOR_STANDARD=normalize;
  window.WAIS_COLOR_FOR_STATUS=colorForStatus;
})();
