// WAIS INCOME v1.1 — normalized percentage display layer.
// Public-output presentation only. Proprietary research logic remains private.
(function(){
  function pct(v,d=2){ const n=Number(v); return Number.isFinite(n)?`${n.toFixed(d)}%`:'—'; }
  function num(v,d=0){ const n=Number(v); return Number.isFinite(n)?n.toFixed(d):'—'; }
  function cash10kFrom30dRate(v,currency='USD'){
    const n=Number(v);
    if(!Number.isFinite(n)) return '—';
    const cash=10000*n/100;
    const c=String(currency||'USD').toUpperCase();
    return `≈ ${c} ${cash.toLocaleString('en-US',{maximumFractionDigits:0,minimumFractionDigits:0})} / $10k / 30D`;
  }

  function applyIncomeMetrics(){
    if(typeof livePrices==='undefined') return;
    document.querySelectorAll('.income-card').forEach(card=>{
      const ticker=card.querySelector('.income-title-row h3')?.textContent?.trim()?.toUpperCase();
      if(!ticker) return;
      const q=livePrices[ticker]||{};
      const ttm=Number(q.trailing12mDistributionYield);
      const rate30=Number(q.current30dIncomeRate);
      const sustainable=Number(q.sustainableIncomeYield);
      const consistency=Number(q.incomeConsistency);
      const currency=String(q.currency||'USD').toUpperCase();

      // Current 30D Income Rate is the primary live income metric because it reacts to
      // the rolling 30-day distribution window and the latest regular-close price.
      const hero=card.querySelector('.yield-hero');
      if(hero){
        const label=hero.querySelector('span');
        const strong=hero.querySelector('strong');
        const small=hero.querySelector('small');
        if(label) label.textContent='CURRENT 30D INCOME RATE*';
        if(strong) strong.textContent=pct(rate30);
        // Make the hero directly actionable: show the rolling 30-day cash equivalent per $10k.
        // Sustainability and consistency remain available in the detail rows below.
        if(small) small.textContent=cash10kFrom30dRate(rate30,currency);
      }

      const rows=[...card.querySelectorAll('.stock-meta > div')];
      const byLabel=(text)=>rows.find(r=>r.querySelector('span')?.textContent?.includes(text));
      const annual=byLabel('Annualized T12M Dist. Yield') || byLabel('TTM Income Yield');
      if(annual){ annual.querySelector('span').textContent='TTM Income Yield*'; annual.querySelector('b').textContent=pct(ttm); }
      const monthly=byLabel('Est. Monthly Cash Yield') || byLabel('Current 30D Income Rate');
      if(monthly){ monthly.querySelector('span').textContent='WAIS Sustainable Income Yield*'; monthly.querySelector('b').textContent=pct(sustainable); }
      const weekly=rows.find(r=>/Est\. Weekly Cash Yield|Distribution Frequency|Income Consistency/.test(r.querySelector('span')?.textContent||''));
      if(weekly){ weekly.querySelector('span').textContent='Income Consistency*'; weekly.querySelector('b').textContent=`${num(consistency)}/100`; }

      const duplicate=[...card.querySelectorAll('.stock-meta > div')].filter(r=>r.querySelector('span')?.textContent==='Sustainable Income Yield*');
      duplicate.slice(1).forEach(el=>el.remove());
    });

    const note=document.getElementById('incomeSystemNote');
    if(note) note.textContent='WAIS Income：Current 30D Income Rate 顯示最近30日實際收入速度；其下方 $10k / 30D 為按目前30日收入率換算的現金等值。TTM Income Yield、WAIS Sustainable Income Yield 及 Income Consistency 保留在詳細資料作可持續性與穩定度研究。Income READY 仍須同時通過價格、NAV、Total Return、distribution sustainability、流動性與風險門檻。';
  }

  document.addEventListener('DOMContentLoaded',()=>{
    setTimeout(applyIncomeMetrics,700);
    document.getElementById('incomeYieldFilter')?.addEventListener('change',()=>setTimeout(applyIncomeMetrics,80));
    window.addEventListener('focus',()=>setTimeout(applyIncomeMetrics,80));
  });
  window.addEventListener('wais:quotes-updated',()=>setTimeout(applyIncomeMetrics,80));
  window.WAIS_APPLY_INCOME_METRICS=applyIncomeMetrics;
})();
