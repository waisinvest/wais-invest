(function(){
  const d = window.WAIS_MARKET_DATA || {};
  d.lastUpdated = "2026-08-15";
  d.dataAsOf = "2026-08-15 weekend system audit; market prices remain latest verified snapshots";
  d.marketMode = "CAUTIOUS"; d.riskScore = 47; d.recommendedCash = 35;

  d.researchIntegrity = {
    version:"1.2", asOf:"2026-08-15", overallStatus:"ACTIVE AUDIT",
    reviewRemark:"WAIS 每週會重新檢視整體策略、系統規則、FABIBOT／模型表現及實際結果；所有策略與規則都必須按新證據持續驗證、修正及改進，而不是永久固定。",
    rule:"No log = not done. No source = not researched. No automation record = not automated.",
    layers:[
      {name:"Market / Stock Data",status:"AUTOMATED",evidence:"GitHub scheduled refresh + timestamped JSON"},
      {name:"Extended Hours",status:"AUTOMATED / PROVIDER",evidence:"Provider snapshots; not exchange-certified real-time"},
      {name:"WAIS Decision Framework",status:"ACTIVE",evidence:"Public execution architecture + live decision state"},
      {name:"Serenity / Specialist Research",status:"DATA GAP",evidence:"Log DATA GAP whenever a current independently verifiable source is unavailable; never translate missing evidence into no update"},
      {name:"Company IR / SEC",status:"MANUAL CHECK",evidence:"Explicit primary-source check required each research cycle"},
      {name:"Institutional / Industry Research",status:"MANUAL CHECK",evidence:"Must be explicitly logged; persistent ingestion still being developed"},
      {name:"Supply-chain Cross-check",status:"MANUAL CHECK",evidence:"Validate demand signals against customers, suppliers and bottlenecks"},
      {name:"New-universe Discovery",status:"ACTIVE / PARTIAL",evidence:"Search beyond existing watchlist; candidates require primary-evidence validation"},
      {name:"Economic / Earnings Calendar",status:"ACTIVE",evidence:"Official-source event gates maintained in WAIS state"},
      {name:"FABIBOT Validation",status:"DESIGNED / MANUAL",evidence:"Prediction log and automated backtest engine still pending"}
    ]
  };

  // Keep current decision state authoritative; do not fabricate a weekend READY upgrade.
  d.readyList=[];
  if(d.opportunityPipeline){d.opportunityPipeline.ready1=[];d.opportunityPipeline.actionNow='WAIT';}
  d.actionPlan = [
    "READY 1：NONE。Weekend state remains WAIT; Monday re-underwrite Price + Timing from zero.",
    "Candidate+：GFS、GOOGL、NVDA。NVDA remains under Aug 26 earnings event risk.",
    "Candidate：AVGO、AXTI、TSEM、RKLB。AXTI retains overheat / expectations-risk flag.",
    "Priority Validation：SIVE、LITE、COHR、AAOI、MU、SNDK、NBIS、IREN、SOI；all remain research-only until primary evidence passes.",
    "Research reports must show CHECKED / NOT CHECKED / DATA GAP. Missing evidence must never be phrased as no update."
  ];
  window.WAIS_MARKET_DATA=d;

  document.addEventListener('DOMContentLoaded',()=>{
    const dashboard=document.getElementById('dashboard'); if(!dashboard) return;
    const old=document.getElementById('waisResearchIntegrityPanel'); if(old) old.remove();
    const status=d.researchIntegrity;
    const detailed=Array.isArray(status.evidenceOfWork)&&status.evidenceOfWork.length?status.evidenceOfWork:status.layers;
    const syncStatus=d.contentSyncStatus||status.overallStatus;
    const syncReason=d.contentSyncReason||'';
    const box=document.createElement('section'); box.id='waisResearchIntegrityPanel'; box.className='wais-live-system'; box.style.margin='24px 0 8px';
    box.innerHTML=`
      <div class="wais-live-head"><div><span class="panel-kicker">WAIS RESEARCH INTEGRITY</span><h3>System Audit + Evidence of Work</h3></div><div class="wais-live-time">Updated ${d.lastUpdated} · ${syncStatus}</div></div>
      <div class="wais-action-banner"><strong>SYSTEM REVIEW REMARK｜</strong>${status.reviewRemark}</div>
      <div class="wais-action-banner" style="margin-top:8px;opacity:.88">${status.rule}</div>
      ${syncReason?`<div class="wais-action-banner" style="margin-top:8px"><strong>SYNC STATUS｜</strong>${syncStatus}<br><span style="opacity:.82;font-weight:500">${syncReason}</span></div>`:''}
      <div class="wais-pipe-grid">${detailed.map(x=>`<div class="wais-pipe-col"><h4>${x.layer||x.name}</h4><b>${x.status}</b><p style="margin:.4rem 0 0;opacity:.75;font-size:.8rem">${x.evidence}</p></div>`).join('')}</div>`;
    // Audit is deliberately the final dashboard block so research evidence does not interrupt action content.
    dashboard.appendChild(box);
  });
})();
