// WAIS Route Registry v2.4 — sanitized public route universe.
// Product existence/listing is research evidence only. It is never a READY or Best approval.
// Inclusion rule: an underlying appears in Route Intelligence only when at least one independently verified leveraged-long, bearish/inverse, or income product exists.
(function(){
  const d=window.WAIS_MARKET_DATA||(window.WAIS_MARKET_DATA={});
  const clean=s=>String(s||'').trim().toUpperCase();
  const stock=t=>(d.focusStocks||[]).find(x=>clean(x.ticker)===clean(t));
  const stockStatus=t=>stock(t)?.stance||'WATCH / REVIEW';

  const route=(ticker,leveraged=[],bearish=[],income=[],extra={})=>({
    stock:ticker,
    stockStatus:stockStatus(ticker),
    leveraged,
    leveragedStatus:leveraged.length?'VALIDATING · VERIFIED PRODUCT':'NO VERIFIED LIVE ROUTE',
    bearish,
    bearishStatus:bearish.length?'VALIDATING · VERIFIED PRODUCT':'NO VERIFIED BEARISH ROUTE',
    income,
    incomeStatus:income.length?'VALIDATING':'NO VERIFIED ROUTE',
    preferred:'NONE / VALIDATING',
    ...extra
  });

  d.relatedRoutes={
    GFS:route('GFS',['GFSG'],[],[],{
      preferred:'STOCK / PENDING',
      routeResearchNote:'GFSG is a verified listed 2x daily GFS long product. No independently verified live same-underlying bearish or income route is currently in the registry.'
    }),
    NVDA:route('NVDA',['NVDL','NVDX','NVDU','NVDB'],['NVD','NVDD'],['NVDY','NVYY','NYYY'],{
      routeResearchNote:'NVD is a verified -2x daily NVDA route; NVDD is a verified -1x daily inverse NVDA route. Bearish READY is independent from stock and bullish leveraged READY.'
    }),
    GOOGL:route('GOOGL',['GGLL','GOU','GOOL'],['GGLS'],['GOOY','GOOW','GOOP'],{
      routeResearchNote:'GGLS is a verified -1x daily inverse GOOGL route. Bearish READY remains independent from GOOGL stock and bullish leveraged READY.'
    }),
    MU:route('MU',['MUU','MULL','MIC'],['MUD','MUZ'],['MUYY','MUIB'],{
      routeResearchNote:'MUD (-1x) and MUZ (-2x) are independently verified bearish MU routes. MUYY and MUIB are separate income routes. Every route must pass its own liquidity, tracking and risk gates.'
    }),
    AVGO:route('AVGO',['AVL','AVGU','AVGX','AVGG','AVGC'],['AVS'],['AVGW'],{
      routeResearchNote:'AVS is a verified -1x daily inverse AVGO route. It is a tactical bearish vehicle, not an automatic hedge or READY signal.'
    }),
    RKLB:route('RKLB',['RKLX','RKX'],['RKLZ'],[],{
      routeResearchNote:'RKLX and Corgi RKX are verified 2x long RKLB routes. RKLZ is a verified -2x daily short RKLB route. Unverified ticker variants are never admitted to the registry or data pipeline.'
    }),
    TSEM:route('TSEM',['TSEG','TSEU'],[],[],{
      routeResearchNote:'Verified long routes exist. No independently verified live TSEM bearish or income route is currently in the registry.'
    }),
    AXTI:route('AXTI',['AXTX','AXTU','AXTL','AXTC'],[],[],{
      routeResearchNote:'Verified long routes exist. No independently verified live AXTI bearish or income route is currently in the registry.'
    }),
    TSM:route('TSM',['TSMX','TSMU','TSMG','TWSC'],['TSMZ','STSM'],['TSMY','TMYY'],{
      routeResearchNote:'TSMZ (-1x) and STSM (-2x) are independently verified bearish TSM routes. Bullish, bearish and income approvals remain separate.'
    }),
    MRVL:route('MRVL',['MRVU','MRVX'],[],[],{
      preferred:'STOCK / REVIEW',
      routeResearchNote:'MRVU and MRVX are verified 2x daily MRVL long routes. No independently verified live bearish MRVL route is currently in the registry.'
    }),
    COHR:route('COHR',['COHH'],[],[],{
      preferred:'STOCK / REVIEW',
      routeResearchNote:'COHH is a verified listed 2x daily COHR long route. No independently verified live bearish COHR route is currently in the registry.'
    }),
    LITE:route('LITE',['LITX'],[],[],{
      preferred:'NONE / VALIDATING',
      routeResearchNote:'LITX is a verified 2x daily LITE long route. A short-LITE regulatory filing has been seen, but no live ticker is promoted until independently verified tradable.'
    }),
    AAOI:route('AAOI',['AAOG','AAOX'],[],[],{
      preferred:'NONE / VALIDATING',
      routeResearchNote:'AAOG and AAOX are verified 2x daily AAOI long routes. A short-AAOI regulatory filing has been seen, but no live ticker is promoted until independently verified tradable.'
    })
  };

  d.routeRegistry={
    version:'2.4',
    asOf:'2026-08-16 21:26 ET',
    inclusionRule:'Only underlyings with at least one independently verified leveraged-long, bearish/inverse, or income product are shown in Route Intelligence. Stock-only names stay in Top Picks / Watchlist.',
    rule:'Stock READY ≠ Bullish Leveraged READY ≠ Bearish READY ≠ Income READY. Product existence is not approval. Best requires sufficient current activity/liquidity/tracking or income/NAV/ROC/total-return evidence; otherwise VALIDATING / DATA GAP.',
    verifiedBearishCoverage:['NVDA/NVD+NVDD','GOOGL/GGLS','MU/MUD+MUZ','AVGO/AVS','RKLB/RKLZ','TSM/TSMZ+STSM'],
    verifiedCoverage:['GFS/GFSG','NVDA','GOOGL','MU/MUYY+MUIB','AVGO','RKLB/RKLX+RKX+RKLZ','TSEM','AXTI','TSM','MRVL/MRVU+MRVX','COHR/COHH','LITE/LITX','AAOI/AAOG+AAOX'],
    excludedStockOnly:['POWL','MOD'],
    explicitGaps:['GFS: no verified live bearish route','TSEM: no verified live bearish route','AXTI: no verified live bearish route','MRVL: no verified live bearish route','COHR: no verified live bearish route','LITE: short filing evidence exists but live ticker not yet independently verified','AAOI: short filing evidence exists but live ticker not yet independently verified','MUIB: insufficient distribution history for sustainable-income comparison','POWL: no dedicated leveraged/income route independently verified — excluded from Route Intelligence','MOD: leveraged filing research exists but no independently verified live tradable route — excluded until verification']
  };

  window.WAIS_MARKET_DATA=d;
})();
