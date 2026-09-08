// WAIS Super A execution authority renderer — display-safe
(() => {
  'use strict';

  const cleanList = (value) => Array.isArray(value)
    ? [...new Set(value.map((item) => String(item || '').trim().toUpperCase()).filter(Boolean))]
    : [];

  const text = (tag, className, value) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = value;
    return node;
  };

  const render = async () => {
    const research = document.getElementById('research');
    if (!research) return;

    document.getElementById('waisSuperAAuthorityPanel')?.remove();

    const data = window.WAIS_MARKET_DATA || {};
    let ready = cleanList(data.ready1);
    let candidatePlus = cleanList(data.candidatePlus);
    let preBreakout = ready.length ? cleanList(data.superAPreBreakout) : [];
    let entries = ready.length ? cleanList(data.superAEntry) : [];
    let techReady = cleanList(data.techReady || data.techReadyEvidence);

    // Canonical registry is the source of truth. Runtime values are only a
    // compatibility fallback while the registry request is loading/unavailable.
    try {
      const canonicalResponse = await fetch('canonical-universe.json', { cache: 'no-store' });
      if (!canonicalResponse.ok) throw new Error('HTTP ' + canonicalResponse.status);
      const canonical = await canonicalResponse.json();
      if (canonical.authority !== 'WAIS System') throw new Error('Authority mismatch');
      ready = cleanList(canonical.stages?.['READY 1']);
      candidatePlus = cleanList(canonical.stages?.['CANDIDATE+']);
      techReady = cleanList(canonical.timingOverlays?.['TECH_READY_EVIDENCE']);
      preBreakout = ready.length ? cleanList(canonical.timingOverlays?.['SUPER A PRE-BREAKOUT']) : [];
      entries = ready.length ? cleanList(canonical.timingOverlays?.['SUPER A ENTRY']) : [];
    } catch (error) {
      console.error('Unable to load canonical WAIS registry:', error);
    }

    const panel = document.createElement('article');
    panel.id = 'waisSuperAAuthorityPanel';
    panel.className = 'panel';
    panel.style.marginBottom = '20px';

    const head = document.createElement('div');
    head.className = 'panel-head';
    const heading = document.createElement('div');
    heading.append(
      text('span', 'panel-kicker', 'WAIS EXECUTION AUTHORITY'),
      text('h3', '', 'READY 1 + SUPER A Breakout Setup')
    );
    const badge = text('span', 'pill yellow-pill', 'POLICY LOADING');
    head.append(heading, badge);

    const note = text(
      'p',
      'muted',
      'Candidate+ 只可準備；READY 1 只確認研究與公司質素；SUPER A PRE-BREAKOUT 只作預警。只有 READY 1、SUPER A setup 及 mandatory pre-output audit 全部通過，才可顯示正式入場行動。'
    );

    const flow = document.createElement('div');
    flow.className = 'signal-legend panel';
    flow.style.margin = '14px 0';
    ['CANDIDATE+ · PREPARE', 'READY 1 · RESEARCH APPROVED', 'SUPER A PRE-BREAKOUT · PRE-WARNING', 'SUPER A ENTRY · ACTION']
      .forEach((label) => flow.append(text('span', 'signal-chip signal-blue', label)));

    const grid = document.createElement('div');
    grid.className = 'metrics-grid';

    const card = (label, value, detail) => {
      const node = document.createElement('article');
      node.className = 'metric-card';
      node.append(text('span', '', label), text('strong', '', value), text('p', '', detail));
      return node;
    };

    grid.append(
      card('Candidate+', candidatePlus.join(', ') || 'NONE', 'High-priority research only; formal buy not allowed.'),
      card('READY 1', ready.join(', ') || 'NONE', 'Research approval only; waits for SUPER A timing.'),
      card('SUPER A PRE-BREAKOUT', preBreakout.join(', ') || 'NONE', ready.length ? 'Preparation warning only.' : 'No READY 1 name is eligible for pre-warning.'),
      card('SUPER A ENTRY', entries.join(', ') || 'NONE', entries.length ? 'Approved actionable setup.' : 'No fully audited entry action.')
    );

    const audit = text(
      'p',
      'weekly-risk-note',
      'MANDATORY AUDIT · Authority · Radar Test · Entry edge · Structure · Volume/RS · Catalyst · Smart Money · Invalidation · Chase filter · Freshness · Contradictions · Missing evidence. Any failure → WAIT / DATA GAP.'
    );

    panel.append(head, note, flow, grid, audit);
    const banner = research.querySelector('.section-banner');
    if (banner?.nextSibling) research.insertBefore(panel, banner.nextSibling);
    else research.append(panel);

    // Put the formal action state first on Dashboard. This mirrors WAIS authority;
    // it never calculates or promotes a ticker in the browser.
    const dashboard = document.getElementById('dashboard');
    if (dashboard) {
      document.getElementById('waisActionNowPanel')?.remove();
      const actionPanel = document.createElement('article');
      actionPanel.id = 'waisActionNowPanel';
      actionPanel.className = 'panel wais-action-now-panel';
      actionPanel.style.marginBottom = '20px';

      const actionHead = document.createElement('div');
      actionHead.className = 'panel-head';
      const actionHeading = document.createElement('div');
      actionHeading.append(
        text('span', 'panel-kicker', 'WAIS ACTION NOW · SYSTEM AUTHORITY'),
        text('h3', '', 'Can I Buy Now?｜現在可否買入')
      );
      const actionable = entries.length > 0;
      const actionBadge = text(
        'span',
        actionable ? 'pill green-pill' : 'pill yellow-pill',
        actionable ? 'ACTIONABLE' : 'WAIT · NO BUY SIGNAL'
      );
      actionHead.append(actionHeading, actionBadge);

      const actionGrid = document.createElement('div');
      actionGrid.className = 'metrics-grid';
      actionGrid.append(
        card('SUPER A ENTRY', entries.join(', ') || 'NONE', actionable ? 'Only listed names are formally actionable.' : 'No fully audited entry has been approved.'),
        card('SUPER A PRE-BREAKOUT', preBreakout.join(', ') || 'NONE', 'Prepare only; this is never a buy instruction.'),
        card('READY 1', ready.join(', ') || 'NONE', 'Research approved; still requires timing audit.'),
        card('TECH READY EVIDENCE', techReady.join(', ') || 'NONE', 'Chart evidence only; cannot authorize a purchase.')
      );

      const actionNote = text(
        'p',
        'weekly-risk-note',
        actionable
          ? 'ACTION · Follow only the WAIS-approved entry, size, invalidation and protection rules shown for the named ticker.'
          : 'ACTION · Remain in WAIT. Candidate+ and technical evidence are preparation signals only; do not chase.'
      );
      actionPanel.append(actionHead, actionGrid, actionNote);
      const hero = dashboard.querySelector('.hero');
      if (hero?.nextSibling) dashboard.insertBefore(actionPanel, hero.nextSibling);
      else dashboard.prepend(actionPanel);
    }

    try {
      const response = await fetch('wais-execution-policy.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const policy = await response.json();
      const expected = ['DISCOVERY', 'RESEARCH', 'CANDIDATE', 'CANDIDATE+', 'READY 1', 'SUPER A PRE-BREAKOUT', 'SUPER A ENTRY'];
      const valid = policy.version === '2026-09-03-v3'
        && JSON.stringify(policy.researchFlow) === JSON.stringify(expected)
        && policy.mandatoryPreOutputAudit?.failClosed === true
        && policy.actionableExecution?.immediateExecutionRequired === true;
      badge.textContent = valid ? 'v3 · SYNCED' : 'DATA GAP · POLICY MISMATCH';
      badge.className = valid ? 'pill green-pill' : 'pill yellow-pill';
    } catch (error) {
      badge.textContent = 'DATA GAP · POLICY UNAVAILABLE';
      badge.className = 'pill yellow-pill';
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(render, 350));
  } else {
    setTimeout(render, 350);
  }
})();
