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
  for(const stock of d.focusStocks||[]){{
    const ticker=String(stock.ticker||'').toUpperCase();
    if(map[ticker]){{
      stock.executionStage=map[ticker]; stock.waisCanonicalStage=map[ticker];
      stock.stance=map[ticker]; stock.rating=map[ticker];
    }}
    stock.timingOverlays=[];
    if(p.techReady.includes(ticker)) stock.timingOverlays.push('TECH READY EVIDENCE');
    if(p.superAPreBreakout.includes(ticker)) stock.timingOverlays.push('SUPER A PRE-BREAKOUT');
    if(p.superAEntry.includes(ticker)) stock.timingOverlays.push('SUPER A ENTRY');
  }}
  window.WAIS_CANONICAL_REGISTRY=registry;
}})();
"""
    TARGET.write_text(code, encoding="utf-8")
    print(f"Built {TARGET.name} from {SOURCE.name}")


if __name__ == "__main__":
    main()
