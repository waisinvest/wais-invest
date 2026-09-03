// WAIS INVEST SAFE loader — 2026-09-03
// Display-only mirror of WAIS System-approved state.
(function(){
  const v='20260903rc1';
  const scripts = [
    `wais-stability-guard-v1.js?v=${v}`,
    `market-data.base.js?v=${v}`,
    `market-data-override.js?v=${v}`,
    `wais-public-state.js?v=${v}`,
    `wais-research-integrity-v1.js?v=${v}`,

    // Income essentials only.
    `wais-income-v2.js?v=${v}`,
    `wais-income-universe-v26.js?v=${v}`,
    `wais-income-metrics-v11.js?v=${v}`,
    `wais-income-entry-v21.js?v=${v}`,
    `wais-income-filter-v24.js?v=${v}`,
    `wais-execution-v13.js?v=${v}`,

    // Runtime + current canonical/research state.
    `wais-runtime-guard.js?v=${v}`,
    `wais-market-closed-fix-v1.js?v=${v}`,
    `wais-color-standard-v1.js?v=${v}`,
    `wais-route-registry-v2.js?v=${v}`,
    `wais-route-intelligence-v2.js?v=${v}`,
    `wais-route-selector-safe-v13.js?v=${v}`,
    `wais-canonical-state-20260820.js?v=${v}`,
    `wais-cross-section-sync-20260830.js?v=${v}`,
    `wais-live-session-20260831.js?v=${v}`,
    `wais-postclose-state-20260831.js?v=${v}`,
    `wais-postclose-state-20260901.js?v=${v}`,
    `wais-column-reconciliation-20260901.js?v=${v}`,
    `wais-reconciliation-20260903.js?v=${v}`,
    `wais-calendar-current-v1.js?v=${v}`,

    // Historical overlays are intentionally not loaded.

    // Lightweight final normalization only.
    `wais-top-picks-normalizer-v1.js?v=${v}`,
    `wais-watchlist-order-v1.js?v=${v}`,
    `wais-canonical-ui-sync-v1.js?v=${v}`,
    `wais-ui-finalizer-v1.js?v=${v}`
  ];

  const seen = new Set();
  for (const url of scripts) {
    const moduleName = url.split('?')[0];
    if (seen.has(moduleName)) continue;
    seen.add(moduleName);
    document.write(`<script src="${url}"><\/script>`);
  }

  window.WAIS_CORE_LOADER = {
    version: '3.8-sep3-strict-reconciliation',
    loadedModules: [...seen],
    duplicatePolicy: 'ONE_LOAD_PER_MODULE + CROSS-STAGE DEDUPE',
    historicalOverlays: 'DISABLED_FOR_RESPONSIVENESS',
    liveCalendarObserver: 'CURRENT_FUTURE_ONLY',
    professionalUiMutationLayer: 'LIGHTWEIGHT',
    reconciliationModule: 'wais-reconciliation-20260903.js',
    writeAuthority: 'WAIS SYSTEM ONLY'
  };
})();
