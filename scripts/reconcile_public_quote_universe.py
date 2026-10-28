#!/usr/bin/env python3
import json
from datetime import datetime, timezone, timedelta
from pathlib import Path
import update_public_market_data as pub

ROOT=Path(__file__).resolve().parents[1]
CANONICAL=ROOT/'canonical-universe.json'
STOCKS=ROOT/'stock-prices.json'
ACTIVE={'READY 1','TECH READY','CANDIDATE+','CANDIDATE','RESEARCH'}

def required(reg):
    names=[]
    for stage in ACTIVE: names.extend(reg.get('stages',{}).get(stage,[]) or [])
    names.extend(reg.get('policyRadar',[]) or [])
    exc=reg.get('quoteExceptions',{}) or {}
    out=[]; seen=set()
    for raw in names:
        t=str(raw).upper().strip()
        if not t or t in seen: continue
        seen.add(t)
        if exc.get(t,{}).get('monitorQuote') is False: continue
        out.append(t)
    return out

def main():
    reg=json.loads(CANONICAL.read_text(encoding='utf-8'))
    data=json.loads(STOCKS.read_text(encoding='utf-8')); prices=data.setdefault('prices',{})
    req=required(reg); failures=[]
    for t in req:
        try:
            candidate = pub.update_quote(prices.get(t, {}), t)
            # Fail closed: an invalid/future-dated provider timestamp is not
            # evidence of a fresh quote, even if price is present.
            observed = candidate.get('asOf')
            if not observed:
                raise ValueError('missing quote observation time')
            observed_at = datetime.fromisoformat(str(observed).replace('Z', '+00:00'))
            if observed_at.tzinfo is None:
                raise ValueError('quote observation time lacks timezone')
            if observed_at.astimezone(timezone.utc) > datetime.now(timezone.utc) + timedelta(minutes=2):
                raise ValueError('future-dated quote observation time')
            prices[t] = candidate
        except Exception as exc:
            failures.append(f'{t}: {exc}')
    missing=[t for t in req if not prices.get(t,{}).get('price')]
    # Preserve the provenance of the last full-market refresh separately.
    # A canonical-only reconciliation must not imply that optional symbols
    # and other market fields were refreshed at the same time.
    completed_at = datetime.now(timezone.utc).isoformat()
    data.setdefault('lastFullRefreshAt', data.get('lastUpdated'))
    data['lastReconciledAt'] = completed_at
    data['lastUpdated'] = completed_at
    data['canonicalQuoteUniverse']={
        'version':reg.get('version'),'authority':'WAIS System → WAIS INVEST display',
        'required':req,'requiredCount':len(req),'missing':missing,'refreshFailures':failures,
        'status':'PASS' if not missing and not failures else 'RECONCILIATION FAILED',
        'asOf':completed_at
    }
    STOCKS.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    if missing or failures:
        raise SystemExit('RECONCILIATION FAILED — Missing/failed public canonical quotes: '+', '.join(missing or failures))
    print(f'WAIS INVEST canonical quote reconciliation PASS: {len(req)} symbols')

if __name__=='__main__': main()
