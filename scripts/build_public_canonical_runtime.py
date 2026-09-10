#!/usr/bin/env python3
"""Build the display-only JS mirror from canonical-universe.json.

The generated file contains no scoring weights or secrets.  It prevents dated
hand-written overlays from becoming a second status authority in WAIS INVEST.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "canonical-universe.json"
TARGET = ROOT / "wais-canonical-generated.js"


def main():
    registry = json.loads(SOURCE.read_text(encoding="utf-8"))
    payload = json.dumps(registry, ensure_ascii=False, separators=(",", ":"))
    code = f"""// GENERATED FILE — edit canonical-universe.json, not this file.
(()=>{{
  const registry={payload};
  const d=window.WAIS_MARKET_DATA||(window.WAIS_MARKET_DATA={{}});
  const p=d.opportunityPipeline||(d.opportunityPipeline={{}});
  const stages=registry.stages||{{}};
  const overlays=registry.timingOverlays||{{}};
  const copy=name=>[...(stages[name]||[])];
  p.version=registry.version;
  p.asOf=registry.migrationNotes?.asOf||null;
  p.ready1=copy('READY 1');
  p.candidatePlus=copy('CANDIDATE+');
  p.candidate=copy('CANDIDATE');
  p.research=copy('RESEARCH');
  p.phaseOut=copy('PHASE OUT');
  p.techReady=[...(overlays.TECH_READY_EVIDENCE||[])];
  p.superAPreBreakout=[...(overlays['SUPER A PRE-BREAKOUT']||[])];
  p.superAEntry=[...(overlays['SUPER A ENTRY']||[])];
  p.actionNow=p.superAEntry.length?'SUPER A ENTRY · '+p.superAEntry.join(', '):'WAIT · NO VERIFIED ENTRY';
  d.readyList=[...p.ready1];
  d.canonicalRegistryVersion=registry.version;
  d.contentSyncStatus='CANONICAL · '+registry.version;
  d.contentSyncReason='Generated directly from the WAIS System public canonical registry; quotes cannot promote status.';
  const map={{}};
  for(const [stage,names] of Object.entries(stages)) for(const ticker of names||[]) map[String(ticker).toUpperCase()]=stage;
  const stocks=Array.isArray(d.focusStocks)?d.focusStocks:(d.focusStocks=[]);
  const hidden=[...(registry.displayViews?.hiddenGems?.tickers||[])];
  const hiddenSet=new Set(hidden);
  for(const stock of stocks){{
    const ticker=String(stock.ticker||'').toUpperCase();
    if(map[ticker]){{
      stock.executionStage=map[ticker]; stock.waisCanonicalStage=map[ticker];
      stock.stance=map[ticker]; stock.rating=map[ticker];
    }}
    stock.timingOverlays=[];
    if(p.techReady.includes(ticker)) stock.timingOverlays.push('TECH READY EVIDENCE');
    if(p.superAPreBreakout.includes(ticker)) stock.timingOverlays.push('SUPER A PRE-BREAKOUT');
    if(p.superAEntry.includes(ticker)) stock.timingOverlays.push('SUPER A ENTRY');
    if(stock.bucket==='HIDDEN_GEM'&&!hiddenSet.has(ticker)) stock.bucket='RESEARCH';
  }}
  const profiles={{
    GNRC:['Generac Holdings','AI Data-Center Power / Grid'],
    POWL:['Powell Industries','Grid / Switchgear / Data Centers'],
    TTMI:['TTM Technologies','AI Networking / Defense Electronics'],
    AMBQ:['Ambiq Micro','Ultra-Low-Power Edge AI'],
    AEHR:['Aehr Test Systems','Semiconductor Test'],
    CRDO:['Credo Technology','AI Connectivity']
  }};
  hidden.forEach((ticker,index)=>{{
    let stock=stocks.find(x=>String(x.ticker||'').toUpperCase()===ticker);
    if(!stock){{
      const profile=profiles[ticker]||[ticker,'Research'];
      stock={{ticker,company:profile[0],category:profile[1],risk:'High',rating:'Research',stance:'RESEARCH',showInWatchlist:false}};
      stocks.push(stock);
    }}
    stock.bucket='HIDDEN_GEM'; stock.hiddenGemRank=index+1; stock.researchStage='RESEARCH PRIORITY';
    stock.showInWatchlist=false; stock.waisCanonicalStage='RESEARCH'; stock.stance='RESEARCH';
    stock.note='Canonical Hidden Gems research priority · research only, not READY 1 or a buy instruction.';
  }});
  d.hiddenGemsReview={{...registry.displayViews?.hiddenGems,names:hidden,status:'CURRENT · CANONICAL RESEARCH ONLY'}};
  window.WAIS_CANONICAL_REGISTRY=registry;
}})();
"""
    TARGET.write_text(code, encoding="utf-8")
    print(f"Built {TARGET.name} from {SOURCE.name}")


if __name__ == "__main__":
    main()
