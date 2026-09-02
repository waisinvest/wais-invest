// WAIS EXECUTION v1.3 — sanitized public execution layer.
// Public frontend receives only high-level states, reasons and actions.
// Proprietary weights, private portfolio data, credentials and internal decision rules remain private.
(() => {
  const d = window.WAIS_MARKET_DATA || (window.WAIS_MARKET_DATA = {});

  d.executionSystem = {
    version: 'WAIS EXECUTION v1.3',
    updatedAt: '2026-08-12T19:05:00-04:00',
    principle: 'Keep the established WAIS research architecture, strengthen it with earlier technical discovery, price intelligence and daily universe governance.',
    stages: [
      'EARLY DISCOVERY',
      'DISCOVERY / RESEARCH',
      'CANDIDATE',
      'CANDIDATE+',
      'TECH READY / SCOUT ENTRY',
      'READY 1',
      'ADD / HOLD / PROTECT / EXIT',
      'PHASE OUT / REJECT'
    ],
    earlyDiscovery: {
      purpose: 'Use market-structure and price/volume intelligence to surface names for research before they are already obvious or extended.',
      publicSignals: [
        'Relative-strength improvement',
        'Price/volume behavior',
        'Volatility compression / expansion',
        'Market-structure transition',
        'Sector / industry rotation'
      ],
      rule: 'An early signal starts research; it is not a buy signal by itself.'
    },
    candidateReview: {
      purpose: 'Prevent strong candidates from remaining indefinitely in Candidate/Candidate+ while price moves away.',
      publicChecks: [
        'Entry attractiveness',
        'Miss risk / opportunity cost',
        'Support and invalidation',
        'Technical transition quality',
        'Event and liquidity gates'
      ]
    },
    scoutEntry: {
      purpose: 'Allow a deliberately small evidence-based starter position before full READY 1 when the investment case is already strong and technical structure is beginning to transition.',
      rule: 'Scout Entry remains smaller than normal READY 1 deployment and requires a predefined invalidation.'
    },
    ready1: {
      purpose: 'Authorize deployment only after the stock thesis and the current price/timing are both acceptable.',
      validation: ['QUALITY', 'PRICE', 'TIMING'],
      rule: 'A READY 1-quality company can still be WAIT if the current price is overextended or risk/reward has deteriorated.'
    },
    dailyGovernance: {
      purpose: 'Re-underwrite the WAIS universe every day rather than carry yesterday\'s labels forward mechanically.',
      actions: ['PROMOTE', 'KEEP', 'DOWNGRADE', 'PHASE OUT / REMOVE'],
      rule: 'Broken thesis, vanished catalyst, deteriorating price/risk structure, inferior relative opportunity or a better replacement can trigger downgrade/removal.'
    }
  };

  const byTicker = Object.fromEntries((d.focusStocks || []).map(s => [String(s.ticker || '').toUpperCase(), s]));

  const stageUpdates = {
    GFS: {
      executionStage: 'CANDIDATE+ · TECH TRANSITION',
      executionAction: 'REVIEW SCOUT · DO NOT CHASE',
      executionReason: 'The latest regular close has reclaimed the 20D average after a strong rebound, but the broader trend is not fully repaired. WAIS should now actively review a controlled Scout Entry setup instead of leaving the name on passive watch, while avoiding a chase after the rebound.'
    },
    POWL: {
      executionStage: 'CANDIDATE+ · TECH WATCH',
      executionAction: 'WAIT FOR RECLAIM / SUPPORT',
      executionReason: 'Price remains near the planned area but below key medium-term averages. Keep it in the active transition queue and require evidence of support/reclaim before deployment.'
    },
    MOD: {
      executionStage: 'CANDIDATE+ · TECH WATCH',
      executionAction: 'WATCH FOR SCOUT TRIGGER',
      executionReason: 'Fundamental quality remains strong enough for active monitoring. Price has improved but trend repair is incomplete, so the next task is to identify a controlled Scout Entry trigger rather than wait silently for full READY 1.'
    }
  };

  Object.entries(stageUpdates).forEach(([ticker, patch]) => {
    if (!byTicker[ticker]) return;
    Object.assign(byTicker[ticker], patch);
    const prefix = `Execution v1.3: ${patch.executionStage} · ${patch.executionAction}. `;
    const existing = String(byTicker[ticker].note || '').replace(/^Execution(?: v1\.\d+)?:.*?\.\s*/,'');
    byTicker[ticker].note = prefix + existing;
  });

  d.actionPlan = Array.isArray(d.actionPlan) ? d.actionPlan : [];
  const action = 'Execution v1.3：保留 WAIS 原有研究架構，新增 Early Discovery + Advanced Price Intelligence + Daily Universe Review；每日重新檢查升級、降級及 Phase Out，READY 1 同時驗證 Quality / Price / Timing。';
  if (!d.actionPlan.some(x => String(x).includes('Execution v1.3'))) d.actionPlan.unshift(action);

  d.weeklyMarketNotes = Array.isArray(d.weeklyMarketNotes) ? d.weeklyMarketNotes : [];
  if (!d.weeklyMarketNotes.some(x => String(x?.title || '').includes('EARLY DISCOVERY'))) {
    d.weeklyMarketNotes.unshift({
      title: 'NEW · EARLY DISCOVERY + PRICE INTELLIGENCE',
      action: 'FIND EARLIER · BUY BETTER',
      body: 'WAIS 現在會在正式選入 Candidate 前用相對強弱、price/volume、波幅壓縮/擴張、市場結構及板塊輪動尋找早期研究訊號；Candidate/Candidate+ 會持續評估 Entry Attractiveness、Miss Risk、support/invalidation；READY 1 再分開驗證 Quality、Price、Timing。'
    });
  }
  if (!d.weeklyMarketNotes.some(x => String(x?.title || '').includes('DAILY UNIVERSE'))) {
    d.weeklyMarketNotes.unshift({
      title: 'NEW · DAILY UNIVERSE GOVERNANCE',
      action: 'PROMOTE · DOWNGRADE · PHASE OUT',
      body: '每日重新審視 READY 1、TECH READY、Candidate+、Candidate、Watch/Discovery；不機械沿用昨日標籤。Thesis 失效、催化消失、價格/風險惡化、相對機會變差或已有更佳替代標的時，可以降級或移除。'
    });
  }

  function escapeHTML(value='') {
    return String(value)
      .replaceAll('&','&amp;')
      .replaceAll('<','&lt;')
      .replaceAll('>','&gt;')
      .replaceAll('"','&quot;')
      .replaceAll("'",'&#039;');
  }

  function decorateExecutionStages() {
    document.querySelectorAll('.stock-card, .watch-card').forEach(card => {
      const heading = card.querySelector('h3, h4');
      const ticker = String(heading?.textContent || '').trim().toUpperCase();
      const stock = byTicker[ticker];
      if (!stock?.executionStage) return;

      const head = card.querySelector('.signal-card-head, .watch-card-head');
      if (!head) return;

      let badge = card.querySelector('.execution-stage-public');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'execution-stage-public';
        head.appendChild(badge);
      }
      const next = `<b>${escapeHTML(stock.executionStage)}</b><small>${escapeHTML(stock.executionAction || '')}</small>`;
      if (badge.innerHTML !== next) badge.innerHTML = next;
    });
  }

  const css = document.createElement('style');
  css.textContent = `
    .execution-stage-public{display:inline-flex;flex-direction:column;gap:2px;padding:7px 9px;border:1px solid rgba(136,168,255,.42);border-radius:10px;background:rgba(136,168,255,.10);max-width:225px}
    .execution-stage-public b{font-size:11px;letter-spacing:.25px;line-height:1.15}
    .execution-stage-public small{font-size:9px;opacity:.78;line-height:1.15}
  `;
  document.head.appendChild(css);

  const boot = () => {
    decorateExecutionStages();
    ['topPicksGrid','watchlistCards'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      // Observe only replacement/addition of cards at the grid root. Do not observe subtree,
      // because decorating a badge itself is a DOM mutation and previously caused a feedback loop.
      let scheduled = false;
      new MutationObserver(() => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
          scheduled = false;
          decorateExecutionStages();
        });
      }).observe(el, { childList: true, subtree: false });
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
