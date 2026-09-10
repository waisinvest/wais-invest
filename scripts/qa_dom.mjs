const jsdomModule = process.argv[2];
if (!jsdomModule) throw new Error('Pass the jsdom module URL');
const { JSDOM, VirtualConsole } = await import(jsdomModule);
const errors=[];
const warnings=[];
const vc=new VirtualConsole();
vc.on('jsdomError',e=>{
  const message=String(e);
  if(message.includes('fonts.googleapis.com')) warnings.push(message);
  else errors.push(message);
});
vc.on('error',e=>{
  const message=String(e);
  if(message.includes('Failed to load market indicators')) warnings.push(message);
  else errors.push(message);
});
const dom=await JSDOM.fromURL('http://127.0.0.1:4173/',{
  resources:'usable',runScripts:'dangerously',pretendToBeVisual:true,virtualConsole:vc,
  beforeParse(window){
    window.fetch=(input,init)=>fetch(new URL(String(input),window.location.href),init);
    window.matchMedia=()=>({matches:false,addListener(){},removeListener(){}});
    window.scrollTo=()=>{};
  }
});
await new Promise(r=>setTimeout(r,2500));
const d=dom.window.document;
const checks={
  commandCenter:dom.window.WAIS_COMMAND_CENTER?.status,
  dashboardCalendar:d.querySelectorAll('#dashboard #economicEventsList .calendar-row').length,
  riskPlan:!!d.querySelector('#risk #weeklyPlan'),
  riskAudit:d.querySelectorAll('#risk .cc-audit-item').length,
  evidenceVault:d.querySelectorAll('#research .cc-source-row').length,
  watchlist:d.querySelectorAll('#watchlistCards .watch-card').length,
  topPicks:d.querySelectorAll('#topPicksGrid .watch-card').length,
  routes:d.querySelectorAll('#routeIntelligenceGrid [data-route-underlying]').length,
  hiddenGems:d.querySelectorAll('#hiddenGemsGrid .watch-card').length,
  weeklyIncome:d.querySelectorAll('#weeklyIncomeGrid article').length,
  monthlyIncome:d.querySelectorAll('#monthlyIncomeGrid article').length,
  navLinks:d.querySelectorAll('.cc-nav-link').length
};
const required={commandCenter:'READY',dashboardCalendar:5,riskPlan:true,riskAudit:3,evidenceVault:3,watchlist:1,topPicks:1,routes:1,hiddenGems:6,weeklyIncome:1,monthlyIncome:1,navLinks:3};
for(const [k,v] of Object.entries(required)){
  const actual=checks[k];
  if(typeof v==='number'&&actual<v)errors.push(`${k}: expected >=${v}, got ${actual}`);
  if(typeof v!=='number'&&actual!==v)errors.push(`${k}: expected ${v}, got ${actual}`);
}
console.log(JSON.stringify({checks,errors,warnings},null,2));
if(errors.length)process.exit(1);
