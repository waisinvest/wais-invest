window.WAIS_MARKET_DATA = {
  lastUpdated: "2026-08-11",
  dataAsOf: "2026-08-10 US/Canada market close; reviewed 2026-08-11 pre-market",
  marketMode: "CAUTIOUS",
  riskScore: 45,
  recommendedCash: 30,

  marketSummary: {
    trend: "8月10日高beta半導體與光通訊明顯回吐；大市長線趨勢未確認逆轉，但短線由追價風險轉為測試承接力。",
    breadth: "跌幅集中於早前急升股：GFS、COHR、LITE、AXTI等回落，顯示板塊內風險偏好降溫，不能把一次觸及Entry當成確認。",
    volatility: "本週CPI、PPI及零售銷售仍是核心風險；宏觀數據公布前，價格到位只構成NEAR ENTRY，需等盤中或收市確認。",
    liquidity: "債息回落有利風險資產，但10年期美債息仍處偏高水平，估值敏感板塊仍需控制倉位。"
  },

  keyRisks: [
    "8月12日美國CPI可能重新改變利率預期。",
    "8月13日美國PPI可能確認或否定成本通脹壓力。",
    "8月14日零售銷售將檢驗美國消費韌性。",
    "AI、光通訊及半導體部分股票短線升幅過急，回吐風險上升。",
    "地緣政治與油價變化仍可能重新推高通脹及市場波動。"
  ],

  focusStocks: [
    {
      ticker: "GFS",
      company: "GlobalFoundries",
      category: "Foundry",
      bucket: "WATCHLIST",
      topPickRank: 3,
      showInWatchlist: true,
      stance: "NEAR ENTRY",
      evidenceConfidence: 82,
      risk: "Medium High",
      rating: "Core Watch",
      entry: 51,
      target: 62,
      earnings: "2026-08-05 · REPORTED",
      note: "8月10日收50.05美元，已到原定$51 Entry附近；但單日跌7.2%，先列NEAR ENTRY，等止跌／承接確認後才可升READY 1。"
    },
    {
      ticker: "POWL",
      company: "Powell Industries",
      category: "Data Center Power",
      bucket: "WATCHLIST",
      topPickRank: 2,
      showInWatchlist: true,
      stance: "NEAR ENTRY",
      evidenceConfidence: 84,
      risk: "Medium High",
      rating: "Core Watch",
      entry: 205,
      target: 240,
      earnings: "NEXT DATE · NOT YET CONFIRMED",
      note: "8月10日收207.22美元，距$205 Entry約1.1%；列NEAR ENTRY，但股價仍低於20D及50D SMA，需等轉穩確認。"
    },
    {
      ticker: "MOD",
      company: "Modine",
      category: "Data Center Cooling",
      bucket: "WATCHLIST",
      topPickRank: 1,
      showInWatchlist: true,
      stance: "NEAR ENTRY",
      evidenceConfidence: 80,
      risk: "Medium High",
      rating: "Core Watch",
      entry: 187,
      target: 220,
      earnings: "2026-07-29 · REPORTED",
      note: "8月10日收191.01美元，距$187 Entry約2.1%；Q1 FY2027銷售增28%、調整EPS增44%，基本面較強，但先等價格確認。"
    },
    {
      ticker: "GOOGL",
      company: "Alphabet",
      category: "AI Platform / Cloud",
      bucket: "WATCHLIST",
      showInWatchlist: true,
      stance: "WATCH",
      evidenceConfidence: 90,
      risk: "Medium",
      rating: "Quality Watch",
      entry: 344,
      target: 392,
      note: "質素高；價格由自動報價檔顯示，仍等待更理想入場位置。"
    },
    {
      ticker: "NVDA",
      company: "NVIDIA",
      category: "AI Compute",
      bucket: "WATCHLIST",
      showInWatchlist: true,
      stance: "WAIT",
      evidenceConfidence: 91,
      risk: "Medium High",
      rating: "Core Watch",
      entry: 217,
      target: 250,
      note: "長期AI核心，但本週宏觀事件前不追高；以動態收市價及Entry距離判斷。"
    },
    {
      ticker: "AVGO",
      company: "Broadcom",
      category: "Networking / ASIC",
      bucket: "WATCHLIST",
      showInWatchlist: true,
      stance: "WAIT",
      evidenceConfidence: 89,
      risk: "Medium High",
      rating: "Core Watch",
      entry: 412,
      target: 470,
      note: "AI網絡及ASIC需求仍強，但估值高；等價格回落及確認。"
    },
    {
      ticker: "TSM",
      company: "TSMC",
      category: "Foundry",
      bucket: "WATCHLIST",
      showInWatchlist: true,
      stance: "WATCH",
      evidenceConfidence: 92,
      risk: "Medium",
      rating: "Core Watch",
      entry: 405,
      target: 455,
      note: "先進製程核心地位不變，等較佳風險回報位置。"
    },
    {
      ticker: "MRVL",
      company: "Marvell Technology",
      category: "AI Networking",
      bucket: "WATCHLIST",
      showInWatchlist: true,
      stance: "WAIT",
      evidenceConfidence: 82,
      risk: "Medium High",
      rating: "Watch",
      entry: 205,
      target: 240,
      note: "舊READY 1已取消；雖然價格回落，仍需重新確認基本面、走勢及事件風險。"
    },
    {
      ticker: "MU",
      company: "Micron Technology",
      category: "Memory / HBM",
      bucket: "WATCHLIST",
      showInWatchlist: true,
      stance: "WAIT",
      evidenceConfidence: 85,
      risk: "Medium High",
      rating: "Watch",
      entry: 845,
      target: 980,
      note: "HBM基本面仍具支持，但舊READY 1已取消；低於20D／50D SMA時先觀察承接。"
    },
    {
      ticker: "AAOI",
      company: "Applied Optoelectronics",
      category: "Optical",
      bucket: "WATCHLIST",
      showInWatchlist: true,
      stance: "WAIT",
      evidenceConfidence: 72,
      risk: "Very High",
      rating: "High Beta Watch",
      entry: 122,
      target: 158,
      note: "高beta光通訊標的；急升後波動仍高，不因單日回調立即接貨。"
    },
    {
      ticker: "AXTI",
      company: "AXT",
      category: "InP Materials",
      bucket: "WATCHLIST",
      showInWatchlist: true,
      stance: "WAIT",
      evidenceConfidence: 68,
      risk: "Very High",
      rating: "High Beta Watch",
      entry: 75,
      target: 100,
      note: "8月10日急跌約16.7%；雖接近舊Entry，仍屬Very High Risk，等待冷卻及基本面驗證。"
    },
    {
      ticker: "TSEM",
      company: "Tower Semiconductor",
      category: "Specialty Foundry",
      bucket: "WATCHLIST",
      showInWatchlist: true,
      stance: "WAIT",
      evidenceConfidence: 76,
      risk: "High",
      rating: "Watch",
      entry: 232,
      target: 278,
      note: "特色製程方向值得跟進，但價格仍高於20D SMA；等更佳風險回報。"
    },
    {
      ticker: "COHR",
      company: "Coherent",
      category: "Optical / Photonics",
      bucket: "WATCHLIST",
      showInWatchlist: true,
      stance: "WAIT",
      evidenceConfidence: 81,
      risk: "High",
      rating: "Watch",
      entry: 352,
      target: 420,
      note: "8月10日急跌約14.2%；AI光通訊主題未消失，但先確認急跌後承接及基本面。"
    },
    {
      ticker: "LITE",
      company: "Lumentum",
      category: "Optical / Photonics",
      bucket: "WATCHLIST",
      showInWatchlist: true,
      stance: "WAIT",
      evidenceConfidence: 80,
      risk: "High",
      rating: "Event Watch",
      entry: 0,
      target: 0,
      note: "8月10日回落約8.6%；暫停設定新Entry/Target，等事件及價格結構重新評估。"
    },

    {
      ticker: "AEHR",
      company: "Aehr Test Systems",
      category: "Semiconductor Test",
      bucket: "HIDDEN_GEM",
      showInWatchlist: false,
      stance: "RESEARCH",
      researchStage: "VALIDATING",
      evidenceConfidence: 62,
      risk: "Very High",
      rating: "Research",
      note: "8月7日收103.07美元；研究價值高，但盈利與估值風險需要持續驗證。"
    },
    {
      ticker: "FORM",
      company: "FormFactor",
      category: "Semiconductor Test",
      bucket: "HIDDEN_GEM",
      showInWatchlist: false,
      stance: "RESEARCH",
      researchStage: "VALIDATING",
      evidenceConfidence: 67,
      risk: "High",
      rating: "Research",
      note: "8月7日收117.39美元；先保留研究席位，等待更清晰催化。"
    },
    {
      ticker: "MXL",
      company: "MaxLinear",
      category: "Connectivity / Analog",
      bucket: "HIDDEN_GEM",
      showInWatchlist: false,
      stance: "RESEARCH",
      researchStage: "RESEARCH",
      evidenceConfidence: 60,
      risk: "Very High",
      rating: "Research",
      note: "8月7日收74.98美元；高beta研究標的，未達部署級別。"
    },
    {
      ticker: "POET",
      company: "POET Technologies",
      category: "Photonics",
      bucket: "HIDDEN_GEM",
      showInWatchlist: false,
      stance: "RESEARCH",
      researchStage: "RESEARCH",
      evidenceConfidence: 55,
      risk: "Very High",
      rating: "Speculative",
      note: "8月7日收8.91美元；潛在高回報亦伴隨高執行及融資風險，只作研究。"
    },
    {
      ticker: "NVTS",
      company: "Navitas Semiconductor",
      category: "Power Semiconductors",
      bucket: "HIDDEN_GEM",
      showInWatchlist: false,
      stance: "RESEARCH",
      researchStage: "VALIDATING",
      evidenceConfidence: 58,
      risk: "Very High",
      rating: "Research",
      note: "8月7日收13.89美元；高波動，需驗證AI電源需求能否轉化為收入與盈利。"
    },
    {
      ticker: "OSS",
      company: "One Stop Systems",
      category: "Edge AI / Rugged Compute",
      bucket: "HIDDEN_GEM",
      showInWatchlist: false,
      stance: "RESEARCH",
      researchStage: "RESEARCH",
      evidenceConfidence: 56,
      risk: "Very High",
      rating: "Research",
      note: "8月7日收13.24美元；屬早期研究標的，暫不列入部署名單。"
    },
    {
      ticker: "AIRO",
      company: "AIRO Group",
      category: "Aerospace / Defense Tech",
      bucket: "HIDDEN_GEM",
      showInWatchlist: false,
      stance: "RESEARCH",
      researchStage: "RESEARCH",
      evidenceConfidence: 50,
      risk: "Very High",
      rating: "Speculative",
      note: "8月7日收8.52美元；流動性及執行風險高，只作探索性研究。"
    }
  ],

  readyList: [],

  serenityData: [
    {
      theme: "AI optical and CPO",
      tickers: ["COHR", "LITE", "AAOI", "AXTI", "POET"],
      serenityView: "AI資料中心光學及InP供應鏈仍是重要研究主題。",
      waisView: "主題強，但8月7日多隻相關股急升；價格紀律優先於追逐主題。"
    },
    {
      theme: "AI foundry and specialty manufacturing",
      tickers: ["TSM", "GFS", "TSEM"],
      serenityView: "AI、ASIC及特色製程需求支持晶圓代工供應鏈。",
      waisView: "長期方向正面，但不同公司估值、製程位置及地緣風險必須分開評估。"
    },
    {
      theme: "Memory and HBM",
      tickers: ["MU"],
      serenityView: "HBM及記憶體供應仍是AI基建重要環節。",
      waisView: "基本面支持較強，但周期性高；舊READY 1已取消，重新等待Entry。"
    }
  ],

  weeklyEvents: [
    {
      date: "08月12日",
      event: "美國 CPI",
      time: "08:30 ET",
      referenceMonth: "2026年7月",
      source: "U.S. Bureau of Labor Statistics",
      waisNote: "本週最高優先級宏觀事件。"
    },
    {
      date: "08月13日",
      event: "美國 PPI",
      time: "08:30 ET",
      referenceMonth: "2026年7月",
      source: "U.S. Bureau of Labor Statistics",
      waisNote: "檢查成本通脹及利率重新定價風險。"
    },
    {
      date: "08月14日",
      event: "美國零售銷售",
      time: "08:30 ET",
      referenceMonth: "2026年7月",
      source: "U.S. Census Bureau",
      waisNote: "關注消費韌性與增長預期。"
    }
  ],

  weeklyMarketNotes: [
    { title:"本週主策略", action:"WAIT FOR CONFIRMATION", body:"Risk 45/100、CAUTIOUS。宏觀事件密集前保留約30%現金，不因強勢市況取消價格紀律。" },
    { title:"Top Picks部署", action:"3 NEAR ENTRY · 0 READY 1", body:"MOD #1、POWL #2、GFS #3已接近／進入Entry，但三者仍欠缺價格確認；Top Pick不等於立即買入。" },
    { title:"AI / 半導體", action:"BUY PULLBACK, NOT SPIKE", body:"趨勢仍強，但高beta及光通訊短線延伸。只接受有秩序回調、基本面不變的第一注機會。" },
    { title:"香港市場", action:"SELECTIVE", body:"恒指與恒科偏正面，但WAIS EAST使用獨立風險參數；不把美股訊號直接搬到港股。" }
  ],

  technicalSummary: [
    { key: "SP500", name: "S&P 500", signal: "STRONG", note: "大市趨勢仍強；接近高位時更重視Entry紀律。" },
    { key: "NASDAQ", name: "NASDAQ Composite", signal: "STRONG", note: "科技與成長股動能偏強，但高beta板塊已有延伸。" },
    { key: "SOX", name: "SOX", signal: "EXTENDED", note: "半導體強勢，但短線過熱風險上升，不追急升。" },
    { key: "VIX", name: "VIX", signal: "CALM", note: "波動率偏低，但事件密集時低VIX不等於低風險。" },
    { key: "US10Y", name: "US 10Y", signal: "WATCH", note: "仍是高估值成長股的重要估值壓力來源。" },
    { key: "HSTECH", name: "Hang Seng TECH", signal: "SELECTIVE", note: "香港科技股偏正面，但維持選股與風險紀律。" }
  ],

  incomeDefenseStatus: "CAUTIOUS",
  incomeEtfs: [
    { ticker:"WEEK", priceSymbol:"WEEK", currency:"USD", name:"Roundhill Weekly T-Bill ETF", track:"WEEKLY", category:"Weekly Core / T-Bill", frequency:"Weekly", status:"READY INCOME 1", incomeQuality:"High", navRisk:"Low", upsideDrag:"Low", firstTranche:"2% of income sleeve", entryMethod:"Near 20D average / avoid material premium", entryBandLowPct:-0.30, entryBandHighPct:0.30, todayAction:"防守收入用途可考慮第一注；定位是現金管理／短期收入，不是增長倉。", note:"短期美國國庫券策略，目標每週分派；仍有利率、匯率、ETF流動性及稅務考慮。" },
    { ticker:"QDTE", priceSymbol:"QDTE", currency:"USD", name:"Roundhill Innovation-100 0DTE Covered Call Strategy ETF", track:"WEEKLY", category:"Weekly Tactical / 0DTE", frequency:"Weekly", status:"WAIT INCOME", incomeQuality:"Medium", navRisk:"High", upsideDrag:"High", firstTranche:"0% until revalidated", entryMethod:"Do not chase yield", todayAction:"暫不因每週派息追入；先看 NAV、總回報、ROC 與波動。", note:"0DTE covered-call 收入策略；每週分派不等於低風險。" },
    { ticker:"TOPW", priceSymbol:"TOPW", currency:"USD", name:"Roundhill Top WeeklyPay ETF", track:"WEEKLY", category:"Weekly Tactical / Levered Basket", frequency:"Weekly", status:"RESEARCH", incomeQuality:"Research", navRisk:"Very High", upsideDrag:"Complex", firstTranche:"0% research only", entryMethod:"No entry until validation", todayAction:"只作研究，不進入正式 Income Ready。", note:"WeeklyPay 組合涉及增強／槓桿特性；先驗證總回報、分派來源與風險。" },
    { ticker:"VDY", priceSymbol:"VDY.TO", currency:"CAD", name:"Vanguard FTSE Canadian High Dividend Yield Index ETF", track:"MONTHLY", category:"Core Wealth / Dividend", frequency:"Monthly", status:"RESEARCH · BELOW 3%", incomeQuality:"High", navRisk:"Medium", upsideDrag:"Low", firstTranche:"0% in Income sleeve", entryMethod:"Keep in Core Wealth comparison", entryBandLowPct:-2.0, entryBandHighPct:0.0, todayAction:"T12M分派率約2.83%，低於WAIS Income 3%正式門檻；移出Income Ready競逐，保留作Core Wealth比較。", note:"質素不等於目前符合收入門檻；留意加拿大金融集中度與總回報。" },
    { ticker:"ZWB", priceSymbol:"ZWB.TO", currency:"CAD", name:"BMO Covered Call Canadian Banks ETF", track:"MONTHLY", category:"Covered Call Banks", frequency:"Monthly", status:"WATCH INCOME", incomeQuality:"High", navRisk:"Medium", upsideDrag:"Medium", firstTranche:"1.5% of income sleeve", entryMethod:"20D SMA附近或以下", entryBandLowPct:-2.0, entryBandHighPct:0.0, todayAction:"等待動態 Entry Zone；不因高分派率追價。", note:"加拿大銀行 covered-call；收入較高但會犧牲部分上行。" },
    { ticker:"ZWC", priceSymbol:"ZWC.TO", currency:"CAD", name:"BMO Canadian High Dividend Covered Call ETF", track:"MONTHLY", category:"Covered Call Dividend", frequency:"Monthly", status:"WAIT INCOME", incomeQuality:"Medium High", navRisk:"Medium", upsideDrag:"Medium", firstTranche:"1% after review", entryMethod:"Below / near 20D SMA", entryBandLowPct:-2.5, entryBandHighPct:-0.5, todayAction:"先等更好價格；比較總回報與 NAV 後再升級。", note:"高股息加 covered-call；不以派息率單獨排序。" },
    { ticker:"ZWU", priceSymbol:"ZWU.TO", currency:"CAD", name:"BMO Covered Call Utilities ETF", track:"MONTHLY", category:"Covered Call Utilities", frequency:"Monthly", status:"WATCH INCOME", incomeQuality:"Medium High", navRisk:"Medium", upsideDrag:"Medium", firstTranche:"1.5% of income sleeve", entryMethod:"20D SMA附近", entryBandLowPct:-2.0, entryBandHighPct:0.0, todayAction:"利率敏感，等動態 Entry Zone 再部署。", note:"公用事業收入候選；需配合債息與利率環境。" },
    { ticker:"JEPI", priceSymbol:"JEPI", currency:"USD", name:"JPMorgan Equity Premium Income ETF", track:"MONTHLY", category:"Equity Premium Income", frequency:"Monthly", status:"WATCH INCOME", incomeQuality:"High", navRisk:"Medium", upsideDrag:"Medium", firstTranche:"2% of income sleeve", entryMethod:"20D SMA附近或以下", entryBandLowPct:-2.0, entryBandHighPct:0.0, todayAction:"等價格進入動態 Entry Zone；適合收入核心候選，不追高。", note:"重視收入穩定、總回報與下行控制。" },
    { ticker:"JEPQ", priceSymbol:"JEPQ", currency:"USD", name:"JPMorgan Nasdaq Equity Premium Income ETF", track:"MONTHLY", category:"Growth Income", frequency:"Monthly", status:"WAIT INCOME", incomeQuality:"High", navRisk:"Medium High", upsideDrag:"Medium", firstTranche:"1.5% after pullback", entryMethod:"20D SMA以下較佳", entryBandLowPct:-2.5, entryBandHighPct:-0.5, todayAction:"科技偏強但估值較敏感，等回調後再評估。", note:"科技收入型候選；收入較高但波動與集中度高於 JEPI。" },
    { ticker:"QYLD", priceSymbol:"QYLD", currency:"USD", name:"Global X Nasdaq 100 Covered Call ETF", track:"TACTICAL", category:"High Income / Covered Call", frequency:"Monthly", status:"WAIT INCOME", incomeQuality:"Medium", navRisk:"High", upsideDrag:"High", firstTranche:"0% until total-return check", entryMethod:"Yield alone is not an entry", todayAction:"暫不列 Income Ready；先檢查 NAV、總回報與 ROC。", note:"高收入研究標的；特別留意 NAV 侵蝕及上行犧牲。" }
  ],

  actionPlan: [
    "維持CAUTIOUS模式；市場強，但本週事件密度高，不追星期五急升股。",
    "Market Risk 45/100，建議保留約30%現金。",
    "READY 1暫時為0；MOD、POWL、GFS列作Top Picks，三者為NEAR ENTRY但仍等待確認。",
    "8月12日CPI及8月13日PPI公布前控制新倉；8月14日再檢視零售銷售。",
    "如高beta AI/光通訊股出現有秩序回調而基本面不變，再重新評估第一注。"
  ],

  dailyThought: {
    date: "2026年8月11日",
    zh: "到價只是候選，承接確認才是訊號。",
    en: "Reaching the entry is a setup; confirmation makes it a signal."
  },

  notes: [
    "價格由stock-prices.json自動更新；本次策略判斷採用2026年8月10日已完成收市資料，並非即時報價。",
    "Entry及Target屬WAIS策略規劃區間的代表值，不是市場報價或保證目標。",
    "Serenity資料只作研究輸入，不代表WAIS最終結論。",
    "所有股票必須重新驗證公司公告、財報、估值、價格行為及事件風險後才可升級READY 1。"
  ]
};
