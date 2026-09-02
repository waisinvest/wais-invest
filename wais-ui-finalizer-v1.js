// WAIS UI finalizer — lightweight one-shot mobile-safe guard.
(function(){
  const NAV_ID='waisResearchToolsFinal';
  function ensureNav(){
    const nav=document.querySelector('.nav-list');
    if(!nav || document.getElementById(NAV_ID)) return;
    const box=document.createElement('div');
    box.id=NAV_ID;
    box.className='wais-research-tools-final';
    box.innerHTML=`
      <a class="wais-direct-nav" href="discovery-workbench.html">Discovery Workbench</a>
      <a class="wais-direct-nav" href="fund-dna.html">Fund DNA</a>
      <a class="wais-direct-nav" href="policy-structural-catalysts.html">Policy / Structural Catalysts</a>`;
    const research=nav.querySelector('[data-section="research"]');
    const risk=nav.querySelector('[data-section="risk"]');
    if(research) research.insertAdjacentElement('afterend',box); else nav.insertBefore(box,risk||null);
  }
  function ensureStyle(){
    if(document.getElementById('waisFinalTypography')) return;
    const s=document.createElement('style');
    s.id='waisFinalTypography';
    s.textContent=`
      html,body,button,input,textarea,select,option,table,thead,tbody,tr,th,td,label,a,span,small,strong,b,em,p,h1,h2,h3,h4,h5,h6,div{font-family:Inter,"Noto Sans TC","PingFang TC","Microsoft JhengHei",Arial,sans-serif!important}
      body{font-weight:400!important;line-height:1.5!important;-webkit-font-smoothing:antialiased!important}
      h1,h2,h3,h4,h5,h6,.brand-name{font-weight:700!important;letter-spacing:-.015em!important}
      .sidebar{overflow-y:auto!important;-webkit-overflow-scrolling:touch!important}
      .wais-research-tools-final{display:flex!important;flex-direction:column!important;gap:7px!important;margin:0!important}
      .wais-direct-nav{display:flex!important;align-items:center!important;width:100%!important;min-height:48px!important;padding:13px 14px!important;border-radius:12px!important;background:transparent!important;color:#9ca9c0!important;font-weight:600!important;text-decoration:none!important;touch-action:manipulation!important}
      .wais-direct-nav:hover,.wais-direct-nav:focus{background:linear-gradient(90deg,rgba(131,164,255,.16),rgba(131,164,255,.03))!important;color:#fff!important;outline:none!important}
    `;
    document.head.appendChild(s);
  }
  function apply(){ ensureStyle(); ensureNav(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',apply,{once:true}); else apply();
})();
