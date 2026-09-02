(function () {
  const d = window.WAIS_MARKET_DATA || {};
  d.lastUpdated = "2026-08-11";
  d.dataAsOf = "2026-08-11 US close / 16:25 ET extended-hours snapshot where available; WAIS strategy reviewed after close";
  d.marketMode = "CAUTIOUS";
  d.riskScore = 47;
  d.recommendedCash = 30;

  // WAIS Decision Contract v1.1: an Entry number must never imply an automatic buy.
  // Preferred Entry Zone = price advantage; Confirmation Trigger = evidence that
  // the price action is stabilising. Current Action remains authoritative.
  d.decisionContract = {
    version: "1.1",
    rule: "Preferred Entry Zone is not a buy signal. Buy only after the stated confirmation trigger, event gate and risk checks.",
    fields: ["preferredEntryZone", "confirmationTrigger", "currentAction", "earningsRisk", "eventRisk", "risk"]
  };

  d.opportunityPipeline = {
    version: "1.0",
    asOf: "2026-08-11 after US close",
    actionNow: "WAIT",
    ready1: [],
    candidatePlus: [
      {ticker:"GFS", price:50.82, status:"CANDIDATE+ · READY WATCH", trigger:"Hold/reclaim $51 area after macro-event confirmation", invalidation:"Loss of ~$48.50 support without recovery", reason:"Q2 fundamentals remain constructive; $50 support is being tested."},
      {ticker:"GOOGL", price:343.80, status:"CANDIDATE+ · ENTRY WATCH", trigger:"Stabilise around $340–344 after CPI; avoid buying a falling gap", invalidation:"Material thesis deterioration or failed support after macro event", reason:"Quality/valuation attractive relative to AI peers; today reached prior entry area but macro gate remains closed."},
      {ticker:"NVDA", price:217.50, status:"CANDIDATE+ · EVENT WATCH", trigger:"Hold $215–220 with post-CPI confirmation", invalidation:"Breakdown with worsening breadth / risk regime", reason:"Core AI quality; price is near watch zone, but CPI tomorrow and Aug 26 earnings require event discipline."}
    ],
    candidate: [
      {ticker:"AVGO", price:416.08, status:"CANDIDATE", trigger:"Better risk/reward near support with valuation discipline", reason:"AI ASIC/networking thesis strong; valuation and prior run-up still demand selectivity."},
      {ticker:"AXTI", price:73.78, status:"CANDIDATE · HIGH VOLATILITY", trigger:"Volatility contraction + stable support + thesis revalidation", reason:"AI/InP demand thesis remains interesting, but recent price discovery is too violent for READY 1."},
      {ticker:"TSEM", status:"CANDIDATE", trigger:"More favourable entry plus confirmation", reason:"Specialty foundry exposure remains strategically interesting."},
      {ticker:"RKLB", price:80.01, status:"CANDIDATE · POST-EARNINGS", trigger:"Hold post-earnings recovery with normal-session confirmation", reason:"Record Q2 revenue/backlog are constructive; Neutron execution/timing risk remains an event gate."}
    ],
    discovery: ["POET", "AEHR", "FORM", "MXL", "NVTS", "OSS", "AIRO"],
    noSetup: ["PLTR"],
    removed: [],
    closestToReady: ["GFS", "GOOGL", "NVDA"],
    statusChanges: [
      "GFS remains Candidate+ / READY Watch after closing back above $50.",
      "GOOGL moved into active Entry Watch after closing near the prior $344 entry reference, but CPI gate blocks READY 1 tonight.",
      "RKLB moved from earnings-event wait into post-earnings Candidate review after a strong intraday recovery from the post-report low."
    ]
  };

  d.waisEventCalendar = {
    version: "1.0",
    timezone: "ET",
    lookAheadDays: 14,
    events: [
      {date:"2026-08-12", time:"08:30", type:"MACRO", title:"U.S. CPI — July 2026", source:"U.S. Bureau of Labor Statistics", impact:"HIGH", gate:"Do not promote a price-only trigger to READY 1 immediately before the release."},
      {date:"2026-08-13", time:"08:30", type:"MACRO", title:"U.S. PPI — July 2026", source:"U.S. Bureau of Labor Statistics", impact:"HIGH", gate:"Recheck rates, growth multiples and semiconductor breadth after release."},
      {date:"2026-08-14", time:"08:30", type:"MACRO", title:"U.S. Retail Sales — July 2026", source:"U.S. Census Bureau", impact:"HIGH", gate:"Review growth/inflation mix and market breadth."},
      {date:"2026-08-26", time:"17:00 ET / 14:00 PT", type:"EARNINGS", ticker:"NVDA", title:"NVIDIA Q2 FY2027 Financial Results", source:"NVIDIA Investor Relations", impact:"HIGH", gate:"Earnings-risk flag remains active for new NVDA deployment sizing."},
      {date:"2026-08-10", time:"17:00", type:"EARNINGS · REPORTED", ticker:"RKLB", title:"Rocket Lab Q2 2026 Results", source:"Rocket Lab Investor Relations", impact:"HIGH", gate:"Post-earnings review: revenue/backlog strength vs Neutron execution/timing risk."},
      {date:"2026-08-05", time:"08:30", type:"EARNINGS · REPORTED", ticker:"GFS", title:"GlobalFoundries Q2 2026 Results", source:"GlobalFoundries Investor Relations", impact:"MEDIUM", gate:"Fundamental thesis reviewed; current gate is price/macro confirmation."}
    ]
  };

  d.marketSummary = {
    trend: "8月11日美股出現分化：NASDAQ回落，但SOX仍上升；不是全面Risk-Off，屬事件前的選股與估值再定價。",
    breadth: "大型AI股內部分化明顯；GOOGL回落至WAIS觀察區，GFS守回$50之上，RKLB業績後先急跌再明顯收復。",
    volatility: "VIX仍偏低，但8月12日CPI在08:30 ET公布；低VIX不代表事件風險低。",
    liquidity: "10年期美債息仍約4.68%，高估值股票對通脹數據及利率重新定價仍敏感。"
  };

  d.keyRisks = [
    "8月12日08:30 ET美國CPI是下一個最高優先級Event Gate。",
    "8月13日08:30 ET美國PPI可能延續或逆轉利率重新定價。",
    "8月14日零售銷售將檢驗消費與增長韌性。",
    "AI／半導體板塊仍有高beta個股急升急跌，價格到位不等於READY 1。",
    "夜盤／盤後報價流動性較低，只作Trigger線索，不單獨作確認。"
  ];

  const stocks = Array.isArray(d.focusStocks) ? d.focusStocks : [];
  const patch = (ticker, fields) => {
    const s = stocks.find(x => String(x.ticker).toUpperCase() === ticker);
    if (s) Object.assign(s, fields);
  };

  patch("GFS", {
    topPickRank: 1,
    stance: "CANDIDATE+ · READY WATCH",
    rating: "Candidate+",
    entry: 50.00,
    preferredEntryLow: 48.80,
    preferredEntryHigh: 50.00,
    preferredEntryZone: "$48.80–$50.00",
    confirmationTrigger: "Hold/reclaim ~$51 after CPI / normal-session confirmation",
    currentAction: "WAIT",
    invalidation: "Below ~$48.50 without support: pause and reassess; do not average down automatically",
    target: 62,
    earnings: "2026-08-05 · REPORTED",
    note: "8月11日收約$50.82；已回到重要觀察區，但明早CPI前仍不升READY 1。Entry Zone ≠ Buy Trigger。"
  });

  patch("GOOGL", {
    topPickRank: 2,
    stance: "CANDIDATE+ · ENTRY WATCH",
    rating: "Candidate+",
    entry: 344,
    target: 392,
    currentAction: "WAIT FOR CPI",
    confirmationTrigger: "Stabilise around $340–344 after CPI; no falling-gap buy",
    eventRisk: "CPI 2026-08-12 08:30 ET",
    note: "8月11日收約$343.80，已到原定Entry附近；但今日跌幅較大，CPI前只列Entry Watch，不把價格到位直接變成BUY。"
  });

  patch("NVDA", {
    topPickRank: 3,
    stance: "CANDIDATE+ · EVENT WATCH",
    rating: "Candidate+",
    entry: 217,
    target: 250,
    currentAction: "WAIT",
    confirmationTrigger: "Hold $215–220 after CPI confirmation",
    earnings: "2026-08-26 · AFTER CLOSE · 17:00 ET",
    eventRisk: "CPI 8/12 + earnings 8/26",
    note: "8月11日收約$217.50；價格在觀察區，但明早CPI及8月26日業績都要納入倉位與Ready判斷。"
  });

  patch("AVGO", { stance:"CANDIDATE", rating:"Candidate", entry:412, target:470, currentAction:"WAIT", note:"8月11日收約$416.08；AI ASIC/networking thesis仍強，但估值與波幅下維持Candidate。" });
  patch("AXTI", { stance:"CANDIDATE · HIGH VOL", rating:"Candidate", entry:0, target:0, currentAction:"WAIT", note:"8月11日收約$73.78；近期極端波動尚未冷卻，不因跌幅大自動升級。" });
  patch("TSEM", { stance:"CANDIDATE", rating:"Candidate", currentAction:"WAIT" });

  if (!stocks.some(x => String(x.ticker).toUpperCase() === "RKLB")) {
    stocks.push({
      ticker:"RKLB", company:"Rocket Lab", category:"Space / Defense", bucket:"WATCHLIST",
      showInWatchlist:true, stance:"CANDIDATE · POST-EARNINGS", evidenceConfidence:78,
      risk:"High", rating:"Candidate", entry:0, target:0,
      earnings:"2026-08-10 · REPORTED", currentAction:"WAIT",
      confirmationTrigger:"Hold post-earnings recovery with regular-session volume confirmation",
      note:"Q2收入及backlog創紀錄，但Neutron執行／時間表風險仍需折價；8月11日由日低大幅收復，先列Post-Earnings Candidate。"
    });
  }

  d.readyList = [];
  d.weeklyEvents = d.waisEventCalendar.events
    .filter(e => e.date >= "2026-08-12" && e.date <= "2026-08-26")
    .map(e => ({
      date: e.date,
      event: `${e.ticker ? e.ticker + " · " : ""}${e.title}`,
      time: e.time,
      referenceMonth: e.type,
      source: e.source,
      waisNote: e.gate
    }));

  d.weeklyMarketNotes = [
    { title:"ACTION NOW", action:"WAIT · 0 READY 1", body:"GFS、GOOGL、NVDA為最接近READY 1的Candidate+；明早CPI前不把單純價格到位升級為BUY。" },
    { title:"Opportunity Pipeline", action:"3 CANDIDATE+", body:"GFS = READY Watch；GOOGL = Entry Watch；NVDA = Event Watch。AVGO、AXTI、TSEM、RKLB維持Candidate。" },
    { title:"Event Gate", action:"CPI 8/12 08:30 ET", body:"CPI後先看債息、NASDAQ/SOX breadth及Candidate+價格確認，再決定是否開第一注。" },
    { title:"Extended Hours", action:"MONITOR, NOT CONFIRM", body:"夜盤／盤後會納入Live Trigger，但低流動性價格不單獨當成READY 1確認。" }
  ];

  d.actionPlan = [
    "READY 1：NONE。今晚維持WAIT，不為了有交易而硬開倉。",
    "Candidate+：GFS、GOOGL、NVDA；明早08:30 ET CPI為共同Event Gate。",
    "Candidate：AVGO、AXTI、TSEM、RKLB；其中RKLB進入Post-Earnings Review。",
    "CPI公布後重新檢查10Y、NASDAQ、SOX、VIX、breadth及Candidate+價格承接，再決定第一注。",
    "所有夜盤／盤後trigger只作預警；正常時段確認及風險閘門仍然有效。"
  ];

  // WAIS INCOME v1.0 public-output layer. Proprietary scoring/weights stay off the public repo.
  d.incomeArchitecture = {
    version: "1.0",
    minimumScreenYield: 5,
    goal: "Seek sustainable 5%+ cash income without sacrificing NAV/total-return discipline.",
    sleeves: [
      {name:"CORE WEALTH", purpose:"Long-term capital quality / growth base"},
      {name:"MONTHLY INCOME", purpose:"More stable recurring cash income"},
      {name:"WEEKLY INCOME", purpose:"Flexible weekly cash-flow opportunities; higher scrutiny"},
      {name:"CASH RESERVE", purpose:"Dry powder and drawdown protection"}
    ],
    rules: [
      "5%+ yield is a screen, not a buy instruction.",
      "Weekly distribution does not mean low risk or guaranteed income.",
      "Check distribution source, NAV path, total return, volatility and underlying quality before Income Ready 1.",
      "Very high distribution products remain tactical until NAV/total-return sustainability is validated.",
      "Underlying-to-Income: prefer strong underlying themes first, then compare the income wrapper versus owning the underlying directly."
    ]
  };

  d.incomeDefenseStatus = d.incomeDefenseStatus || "CAUTIOUS";
  const etfs = Array.isArray(d.incomeEtfs) ? d.incomeEtfs : [];
  etfs.forEach(item => {
    item.minimumYieldScreen = 5;
    item.autoBuy = false;
    item.requiresIncomeConfirmation = true;
  });

  const byTicker = Object.fromEntries(etfs.map(x => [String(x.ticker).toUpperCase(), x]));
  if (byTicker.WEEK) {
    byTicker.WEEK.incomeRole = "CASH RESERVE / DEFENSIVE WEEKLY";
    byTicker.WEEK.todayAction = "可作防守收入／現金管理候選；即使達5%+篩選亦只按價格、流動性及現金需要分注，不因每週派息自動買。";
  }
  if (byTicker.QDTE) {
    byTicker.QDTE.incomeRole = "TACTICAL WEEKLY";
    byTicker.QDTE.status = "WAIT INCOME";
    byTicker.QDTE.todayAction = "維持WAIT：先驗證NAV、12個月總回報、分派來源／ROC及0DTE波動；高派息不等於穩定收入。";
  }
  if (byTicker.TOPW) {
    byTicker.TOPW.incomeRole = "RESEARCH / HIGH RISK WEEKLY";
    byTicker.TOPW.status = "RESEARCH";
    byTicker.TOPW.todayAction = "研究席位；未完成槓桿／組合結構、NAV與總回報驗證前不升Income Ready。";
  }
  ["VDY","ZWB","ZWC","ZWU","JEPI","JEPQ"].forEach(t => {
    if (byTicker[t]) byTicker[t].incomeRole = "MONTHLY INCOME CANDIDATE";
  });
  if (byTicker.QYLD) {
    byTicker.QYLD.incomeRole = "TACTICAL MONTHLY / NAV CHECK";
    byTicker.QYLD.status = "WAIT INCOME";
  }

  window.WAIS_MARKET_DATA = d;

  // Public dashboard patch: surface the system state the user needs immediately
  // without exposing proprietary FABIBOT weights or private portfolio logic.
  document.addEventListener("DOMContentLoaded", () => {
    const filter = document.getElementById("incomeYieldFilter");
    if (filter) {
      filter.value = "5";
      filter.dispatchEvent(new Event("change", {bubbles:true}));
    }

    const dashboard = document.getElementById("dashboard");
    const metrics = dashboard?.querySelector(".metrics-grid");
    if (!dashboard || !metrics || document.getElementById("waisLiveSystemPanel")) return;

    const style = document.createElement("style");
    style.textContent = `
      .wais-live-system{margin:22px 0;padding:20px;border:1px solid rgba(136,168,255,.28);border-radius:22px;background:linear-gradient(180deg,rgba(15,36,60,.94),rgba(9,27,47,.96))}
      .wais-live-head{display:flex;gap:14px;justify-content:space-between;align-items:flex-start;margin-bottom:16px;flex-wrap:wrap}
      .wais-live-head h3{margin:4px 0 0;font-size:1.25rem}.wais-live-time{font-size:.78rem;opacity:.72}
      .wais-action-banner{padding:12px 14px;border-radius:14px;background:rgba(255,190,80,.10);border:1px solid rgba(255,190,80,.28);margin-bottom:14px;font-weight:700}
      .wais-pipe-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.wais-pipe-col{padding:13px;border-radius:15px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08)}
      .wais-pipe-col h4{margin:0 0 8px;font-size:.78rem;letter-spacing:.08em}.wais-ticker{display:inline-block;margin:3px 4px 3px 0;padding:5px 8px;border-radius:9px;background:rgba(136,168,255,.12);font-weight:800;font-size:.83rem}
      .wais-event-list{margin-top:14px;display:grid;gap:8px}.wais-event{padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.035);font-size:.84rem}.wais-event b{display:block;margin-bottom:3px}.wais-event small{opacity:.72}
      @media(max-width:760px){.wais-pipe-grid{grid-template-columns:1fr}.wais-live-system{padding:16px;margin:16px 0}}
    `;
    document.head.appendChild(style);

    const p = d.opportunityPipeline || {};
    const events = (d.waisEventCalendar?.events || []).filter(e => e.date >= "2026-08-12").slice(0,4);
    const tickers = arr => (arr || []).map(x => `<span class="wais-ticker">${typeof x === "string" ? x : x.ticker}</span>`).join("") || '<span style="opacity:.65">NONE</span>';

    const panel = document.createElement("section");
    panel.id = "waisLiveSystemPanel";
    panel.className = "wais-live-system";
    panel.innerHTML = `
      <div class="wais-live-head"><div><span class="panel-kicker">WAIS LIVE SYSTEM</span><h3>Opportunity Pipeline + Event Calendar</h3></div><div class="wais-live-time">Updated ${d.lastUpdated} · after US close</div></div>
      <div class="wais-action-banner">ACTION NOW｜${p.actionNow || "WAIT"} · READY 1: ${(p.ready1 || []).length ? "ACTIVE" : "NONE"} · Next gate: CPI 08/12 08:30 ET</div>
      <div class="wais-pipe-grid">
        <div class="wais-pipe-col"><h4>🟢 READY 1</h4>${tickers(p.ready1)}</div>
        <div class="wais-pipe-col"><h4>🟢 CANDIDATE+</h4>${tickers(p.candidatePlus)}</div>
        <div class="wais-pipe-col"><h4>🟡 CANDIDATE</h4>${tickers(p.candidate)}</div>
      </div>
      <div class="wais-event-list">${events.map(e => `<div class="wais-event"><b>${e.date} · ${e.time} ET — ${e.ticker ? e.ticker + " · " : ""}${e.title}</b><small>${e.impact} impact · ${e.gate}</small></div>`).join("")}</div>
    `;
    metrics.parentNode.insertBefore(panel, metrics);
  });
})();
