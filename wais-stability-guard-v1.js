// WAIS stability guard v1.0 — emergency protection against observer feedback loops and navigation lockups.
(function(){
  window.__WAIS_BUILD__='2026-08-24-stable-a';
  window.__WAIS_STABILITY_GUARD__=true;

  // Prevent legacy synchronous scripts from creating DOM-observer feedback loops during startup.
  const NativeMutationObserver=window.MutationObserver;
  if(NativeMutationObserver){
    class StartupSafeMutationObserver{
      constructor(){this._observer=null;}
      observe(){}
      disconnect(){if(this._observer)this._observer.disconnect();}
      takeRecords(){return [];}
    }
    window.MutationObserver=StartupSafeMutationObserver;
    window.addEventListener('load',()=>{
      try{window.__WAIS_COLOR_OBSERVER__?.disconnect?.();}catch(e){}
      window.MutationObserver=NativeMutationObserver;
    },{once:true});
  }

  function openSection(id){
    if(!id)return;
    const sections=document.querySelectorAll('.page-section');
    const nav=document.querySelectorAll('.nav-item[data-section]');
    sections.forEach(s=>s.classList.toggle('active',s.id===id));
    nav.forEach(b=>b.classList.toggle('active',b.dataset.section===id));
    const title=document.getElementById('pageTitle');
    const active=[...nav].find(b=>b.dataset.section===id);
    if(title&&active)title.textContent=active.textContent.trim();
    document.getElementById('sidebar')?.classList.remove('open');
    window.scrollTo({top:0,behavior:'auto'});
  }

  // Capturing listener is an independent fallback, so sidebar navigation still works if app.js rendering fails later.
  document.addEventListener('click',event=>{
    const navButton=event.target?.closest?.('.nav-item[data-section]');
    if(navButton){
      event.preventDefault();
      event.stopPropagation();
      openSection(navButton.dataset.section);
      return;
    }
    const jump=event.target?.closest?.('[data-jump]');
    if(jump){
      event.preventDefault();
      event.stopPropagation();
      openSection(jump.dataset.jump);
    }
  },true);

  window.WAIS_OPEN_SECTION=openSection;
})();
