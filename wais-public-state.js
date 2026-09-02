// Sanitized public WAIS decision state.
// No API keys, credentials, private portfolio data, model weights, or proprietary rules belong here.
(() => {
  const d = window.WAIS_MARKET_DATA || (window.WAIS_MARKET_DATA = {});
  d.publicStateVersion = '2026-08-15.1';
  d.lastStrategyUpdated = '2026-08-15T16:56:00-04:00';
  d.marketMode = 'CAUTIOUS';
  d.riskScore = 47;
  d.recommendedCash = 35;
  d.defenseStatus = 'WATCH';
  d.profitProtectionStatus = 'WATCH';
  d.readyList = [];
  d.executionLayer = 'WAIS EXECUTION v1.3 · Early Discovery → Candidate → Candidate+ → TECH READY / Scout Entry → READY 1 → Phase Out when evidence deteriorates';
  d.publicDataPolicy = {
    quoteTier: 'NEAR-REAL-TIME / DELAYED WHERE PROVIDER REQUIRES',
    rule: 'Never label delayed provider data as exchange real-time. Always show source, timestamp and freshness.',
    security: 'Frontend receives sanitized outputs only; secrets and proprietary logic remain outside the public repository.'
  };
})();
