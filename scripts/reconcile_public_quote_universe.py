#!/usr/bin/env python3
import json
from datetime import datetime, timezone
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
        try: prices[t]=pub.update_quote(prices.get(t,{}),t)
        except Exception as exc: failures.append(f'{t}: {exc}')
    missing=[t for t in req if not prices.get(t,{}).get('price')]
    data['canonicalQuoteUniverse']={
        'version':reg.get('version'),'authority':'WAIS System → WAIS INVEST display',
        'required':req,'requiredCount':len(req),'missing':missing,'refreshFailures':failures,
        'status':'PASS' if not missing and not failures else 'RECONCILIATION FAILED',
        'asOf':datetime.now(timezone.utc).isoformat()
    }
    STOCKS.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    if missing or failures:
        raise SystemExit('RECONCILIATION FAILED — Missing/failed public canonical quotes: '+', '.join(missing or failures))
    print(f'WAIS INVEST canonical quote reconciliation PASS: {len(req)} symbols')

if __name__=='__main__': main()
