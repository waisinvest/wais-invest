// WAIS INCOME FACTORY v2.0 — sanitized public-output layer only.
// Research approval is NOT buy approval. Proprietary scoring/weights remain private.
(function () {
  const d = window.WAIS_MARKET_DATA || {};

  d.incomeArchitecture = {
    version: "2.0",
    name: "WAIS INCOME FACTORY",
    objective: "Build recurring weekly/monthly cash flow by buying quality income assets at favourable prices while defending NAV and total wealth.",
    minimumScreenYield: 5,
    governingRule: "APPROVED FOR RESEARCH ≠ APPROVED TO BUY. Only INCOME READY 1 authorizes a first tranche; ADD 2 / ADD 3 require fresh WAIS approval.",
    sleeves: [
      {name:"CORE INCOME", purpose:"Diversified recurring income with stronger NAV/total-return discipline"},
      {name:"GROWTH INCOME", purpose:"Technology/growth exposure plus recurring distributions"},
      {name:"WEEKLY INCOME", purpose:"Higher-frequency cash flow with stricter distribution and NAV checks"},
      {name:"TACTICAL HIGH INCOME", purpose:"High-volatility opportunities; smaller sizing and stronger entry discipline"},
      {name:"CRASH INCOME RESERVE", purpose:"Keep dry powder for dislocations and unusually attractive yield-on-cost opportunities"}
    ],
    decisionStates: ["RESEARCH", "WATCH INCOME", "INCOME CANDIDATE", "INCOME CANDIDATE+", "INCOME READY 1", "ADD 2", "ADD 3", "HOLD & COLLECT", "DEFENSE / EXIT"],
    mandatoryChecks: ["Underlying quality", "Distribution sustainability", "Distribution source / ROC", "NAV path", "Total return", "Liquidity", "Volatility / drawdown", "Entry valuation", "Ex-date / pay-date", "Earnings & macro event risk"],
    principles: [
      "Income first, but never yield-chasing.",
      "Cash received is not automatically economic profit; judge distributions together with NAV and total return.",
      "A lower purchase cost can improve future yield-on-cost only if the income engine and underlying remain healthy.",
      "Falling price alone never triggers an ADD; distinguish market dislocation from thesis deterioration.",
      "Capital may be recycled after distributions when WAIS judges the opportunity complete or risk/reward deteriorates.",
      "Compare competing wrappers for the same underlying/theme; no ETF is permanently entitled to a portfolio slot."
    ]
  };

  d.incomeDefenseStatus = "CAUTIOUS";
  d.incomeReady1 = [];
  d.incomeActionNow = "WAIT · 0 INCOME READY 1";
  d.incomeResearchAsOf = "2026-08-11 after US close; product structure/frequency verified from issuer materials where stated";

  const base = Array.isArray(d.incomeEtfs) ? d.incomeEtfs : [];
  const map = Object.fromEntries(base.map(x => [String(x.ticker).toUpperCase(), x]));
  const upsert = item => {
    const key = item.ticker.toUpperCase();
    if (map[key]) Object.assign(map[key], item);
    else { base.push(item); map[key] = item; }
  };

  [
    {ticker:"QQQI",priceSymbol:"QQQI",currency:"USD",name:"NEOS Nasdaq-100 High Income ETF",track:"MONTHLY",category:"Core / Growth Income",frequency:"Monthly",status:"INCOME CANDIDATE+",incomeQuality:"High",navRisk:"Medium High",upsideDrag:"Medium",firstTranche:"0% until READY 1",entryMethod:"Wait for WAIS favourable-price + confirmation gate",todayAction:"WATCH — approved for research, not approved to buy.",note:"Monthly Nasdaq-100 option-income candidate. Evaluate distribution quality, NAV and total return together."},
    {ticker:"SPYI",priceSymbol:"SPYI",currency:"USD",name:"NEOS S&P 500 High Income ETF",track:"MONTHLY",category:"Core Income",frequency:"Monthly",status:"INCOME CANDIDATE+",incomeQuality:"High",navRisk:"Medium",upsideDrag:"Medium",firstTranche:"0% until READY 1",entryMethod:"Wait for WAIS favourable-price + confirmation gate",todayAction:"WATCH — approved for research, not approved to buy.",note:"Diversified S&P 500 monthly income candidate; benchmark for core income quality."},
    {ticker:"FEPI",priceSymbol:"FEPI",currency:"USD",name:"REX FANG & Innovation Equity Premium Income ETF",track:"WEEKLY",category:"Weekly Tech Income",frequency:"Weekly",status:"INCOME CANDIDATE+",incomeQuality:"Medium High",navRisk:"High",upsideDrag:"Medium High",firstTranche:"0% until READY 1",entryMethod:"Prefer market pullback / favourable yield-on-cost; verify ROC and NAV",todayAction:"WATCH — weekly cash-flow candidate; current high estimated ROC requires strict NAV/total-return defense.",note:"Frequency changed to weekly in 2026. Distribution rate is not total return."},
    {ticker:"AIPI",priceSymbol:"AIPI",currency:"USD",name:"REX AI Equity Premium Income ETF",track:"WEEKLY",category:"Weekly AI Income",frequency:"Weekly",status:"INCOME CANDIDATE",incomeQuality:"Medium",navRisk:"High",upsideDrag:"Medium High",firstTranche:"0% until READY 1",entryMethod:"AI-underlying + price + NAV confirmation required",todayAction:"WATCH — higher-risk AI income candidate; no buy approval.",note:"Weekly distribution structure; concentration and ROC/NAV risk require smaller tactical sizing."},
    {ticker:"PLYY",priceSymbol:"PLYY",currency:"USD",name:"GraniteShares YieldBOOST PLTR ETF",track:"TACTICAL",category:"PLTR High Income",frequency:"Weekly",status:"INCOME CANDIDATE",incomeQuality:"Tactical",navRisk:"Very High",upsideDrag:"Complex",firstTranche:"0% until READY 1",entryMethod:"PLTR thesis + crash/strong entry + distribution/NAV validation",todayAction:"TACTICAL WATCH — friend example accepted into research universe; not approved to buy.",note:"Very high headline distribution can include substantial ROC; underlying and entry timing are mandatory gates."},
    {ticker:"NVYY",priceSymbol:"NVYY",currency:"USD",name:"GraniteShares YieldBOOST NVDA ETF",track:"TACTICAL",category:"NVDA High Income",frequency:"Weekly",status:"INCOME CANDIDATE",incomeQuality:"Tactical",navRisk:"Very High",upsideDrag:"Complex",firstTranche:"0% until READY 1",entryMethod:"NVDA thesis + crash/strong entry + distribution/NAV validation",todayAction:"TACTICAL WATCH — approved for research, not approved to buy.",note:"High-income NVDA-linked wrapper; compare against competing NVDA income structures before deployment."},
    {ticker:"TMYY",priceSymbol:"TMYY",currency:"USD",name:"GraniteShares YieldBOOST TSM ETF",track:"TACTICAL",category:"TSM High Income",frequency:"Weekly",status:"INCOME CANDIDATE",incomeQuality:"Tactical",navRisk:"Very High",upsideDrag:"Complex",firstTranche:"0% until READY 1",entryMethod:"TSM thesis + crash/strong entry + distribution/NAV validation",todayAction:"TACTICAL WATCH — approved for research, not approved to buy.",note:"High-income TSM-linked wrapper; geopolitical and leveraged-option structure risks remain active."},
    {ticker:"MUYY",priceSymbol:"MUYY",currency:"USD",name:"GraniteShares YieldBOOST MU ETF",track:"TACTICAL",category:"MU High Income",frequency:"Weekly",status:"INCOME CANDIDATE",incomeQuality:"Tactical",navRisk:"Very High",upsideDrag:"Complex",firstTranche:"0% until READY 1",entryMethod:"MU cycle + crash/strong entry + distribution/NAV validation",todayAction:"TACTICAL WATCH — approved for research, not approved to buy.",note:"Memory-cycle sensitivity plus very high distribution/ROC risk; only deploy after explicit READY 1."},
    {ticker:"XQQI",priceSymbol:"XQQI",currency:"USD",name:"NEOS Boosted Nasdaq-100 High Income ETF",track:"TACTICAL",category:"Boosted Growth Income",frequency:"Monthly",status:"RESEARCH",incomeQuality:"Research",navRisk:"High",upsideDrag:"Complex",firstTranche:"0% research only",entryMethod:"Need longer live record and structure validation",todayAction:"RESEARCH — promising but newer boosted structure; no buy approval.",note:"Approximately boosted QQQI exposure; requires more live-history evidence before promotion."}
  ].forEach(upsert);

  if (map.QDTE) Object.assign(map.QDTE,{status:"RESEARCH / TACTICAL",firstTranche:"0% until READY 1",todayAction:"RESEARCH — weekly 0DTE income is attractive, but NAV/ROC/total-return evidence must pass before promotion."});
  if (map.JEPQ) Object.assign(map.JEPQ,{status:"INCOME CANDIDATE",firstTranche:"0% until READY 1",todayAction:"WATCH — core growth-income comparison candidate; wait for explicit READY 1."});
  if (map.JEPI) Object.assign(map.JEPI,{status:"INCOME CANDIDATE",firstTranche:"0% until READY 1",todayAction:"WATCH — diversified income benchmark; wait for explicit READY 1."});

  base.forEach(x => { x.autoBuy=false; x.requiresIncomeConfirmation=true; x.minimumYieldScreen=5; });
  d.incomeEtfs = base;

  document.addEventListener("DOMContentLoaded", () => {
    const income = document.getElementById("income");
    const master = income?.querySelector(".income-master-panel");
    if (!income || !master || document.getElementById("incomeFactoryPanel")) return;
    const panel = document.createElement("article");
    panel.id = "incomeFactoryPanel";
    panel.className = "panel";
    panel.innerHTML = `
      <div class="panel-head"><div><span class="panel-kicker">WAIS INCOME FACTORY v2.0</span><h3>Cash Flow Opportunity System</h3></div><div class="weekly-review-date">${d.incomeResearchAsOf}</div></div>
      <div class="weekly-risk-note"><b>${d.incomeActionNow}</b> · Research approval is not buy approval. Only <b>INCOME READY 1</b> authorizes the first tranche; every ADD requires a fresh signal.</div>
      <div class="research-board">
        <article class="research-card"><span>CORE / GROWTH</span><h3>QQQI · SPYI · JEPQ · JEPI</h3><p>Recurring income with stronger diversification / total-return discipline.</p></article>
        <article class="research-card"><span>WEEKLY</span><h3>FEPI · AIPI · QDTE</h3><p>Higher-frequency cash flow; distribution source and NAV defense are mandatory.</p></article>
        <article class="research-card"><span>TACTICAL HIGH INCOME</span><h3>PLYY · NVYY · TMYY · MUYY</h3><p>Approved research universe only. Seek exceptional entry price and healthy underlying; smaller sizing.</p></article>
        <article class="research-card"><span>CRASH RESERVE</span><h3>Dry Powder</h3><p>Prepare before a selloff; buy only when price advantage and income quality survive the risk gates.</p></article>
      </div>`;
    master.insertAdjacentElement("afterend", panel);
  });

  window.WAIS_MARKET_DATA = d;
})();
