// WAIS INCOME v2.4 — monthly/30D filter presentation.
// Presentation only: the selector uses rolling Current 30D Income Rate, not annualized distribution yield.
(function(){
  function apply(){
    const panel=document.querySelector('#income .income-filter-panel');
    if(!panel) return;
    const kicker=panel.querySelector('.panel-kicker');
    const title=panel.querySelector('h3');
    const row=panel.querySelector('.income-filter-row');
    const old=document.getElementById('incomeYieldFilter');
    const current=document.getElementById('income30dFilter');
    if(kicker) kicker.textContent='WAIS MONTHLY INCOME FILTER';
    if(title) title.textContent='Estimated Monthly Yield Selector｜估算每月收入率';
    if(row){
      const label=row.querySelector('label');
      if(label){
        // Preserve the hidden legacy select if it is nested inside the label; replace only the visible text node.
        [...label.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).forEach(n=>n.textContent='');
        let caption=label.querySelector('.wais-monthly-filter-label');
        if(!caption){
          caption=document.createElement('span');
          caption.className='wais-monthly-filter-label';
          label.insertBefore(caption,label.firstChild);
        }
        caption.textContent='Estimated Monthly Income Yield (30D)';
      }
      const note=row.querySelector('.yield-filter-note');
      if(note) note.textContent='以最近30日實際分派 ÷ 最新 regular close 計算，作為約一個月收入速度比較；會隨價格及 rolling 30-day distributions 自動更新。';
    }
    if(current){
      current.setAttribute('aria-label','Estimated Monthly Income Yield (30D)');
      current.title='Rolling 30-day income rate; not annualized yield';
    }
    if(old) old.setAttribute('aria-hidden','true');
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,1100));
  window.addEventListener('wais:quotes-updated',()=>setTimeout(apply,180));
  window.addEventListener('focus',()=>setTimeout(apply,120));
})();
