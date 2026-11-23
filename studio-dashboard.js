/* JR Studio dashboard v1 — editorial white layout for the timelines list.
   Visual only: reads the same `all` rows and calls the same openTimeline / newTimeline /
   deleteTimeline functions. Nothing is written to the database from here. */
(function(){
const CSS=`
#app .sd{--ink:#111;--g:#7a7a7a;--hl:#ececec;--sand:#c9a77c;max-width:760px;margin:0 auto;padding:calc(14px + env(safe-area-inset-top)) 20px 60px;color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"Inter","Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
body:has(#app .sd){background:#fff}body:has(#app .sd) #jrHomeLink{display:none!important}
.sd *{box-sizing:border-box}.sd a{color:inherit;text-decoration:none}.sd .g{color:var(--g)}
.sd button{font:inherit;cursor:pointer;background:none;border:0;padding:0;color:inherit;border-radius:0}
.sdTop{display:flex;align-items:center;justify-content:space-between;padding-bottom:14px;border-bottom:.5px solid var(--hl)}
.sdBrand{display:flex;align-items:center;gap:9px;font-size:13px;color:var(--g)}
.sdMark{width:28px;height:28px;border-radius:50%;background:var(--ink);color:#fff;font-size:10px;letter-spacing:.05em;display:grid;place-items:center}
.sdNav{display:flex;align-items:center;gap:16px;font-size:13px;color:var(--g)}
.sd .sdNew{background:var(--ink);color:#fff;border-radius:999px;padding:7px 13px;font-size:12px}
.sdTitle{padding:34px 0 26px}.sdTitle h1{font:500 44px/1 inherit;font-family:inherit;letter-spacing:-.045em;margin:0}
.sdBy{font-size:12px;letter-spacing:.16em;color:var(--g);margin-top:12px}
.sdHero{background:var(--ink);color:#f5f5f5;border-radius:18px;padding:22px 20px 20px}
.sdHero .row{display:flex;justify-content:space-between;font-size:12px;color:#9a9a9a}
.sdCount{display:flex;align-items:baseline;gap:9px;margin-top:20px}.sdCount b{font-weight:500;font-size:72px;line-height:.85;letter-spacing:-.06em}.sdCount span{color:#9a9a9a;font-size:15px}
.sdHero h2{font:500 26px/1.15 inherit;font-family:inherit;letter-spacing:-.03em;margin:18px 0 5px}
.sdHero .meta{font-size:13px;color:#9a9a9a}
.sdPills{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.sdPill{font-size:12px;border:.5px solid #343434;border-radius:999px;padding:6px 11px}
.sdBtns{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:18px}
.sd .sdB{border-radius:10px;padding:12px;font-size:14px;text-align:center}.sd .sdB.w{background:#fff;color:var(--ink);font-weight:500}.sd .sdB.o{border:.5px solid #3c3c3c;color:#f5f5f5}
.sdEmptyHero{border:.5px dashed #d8d8d8;border-radius:18px;padding:26px 20px;color:var(--g);font-size:14px}
.sdDot{display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:7px;vertical-align:1px;background:#bdbdbd}
.sdDot.ok{background:#2fb36f}.sdDot.warn{background:#e0a63b}.sdDot.bad{background:#e5484d}.sdDot.sand{background:var(--sand)}
.sdStats{display:grid;grid-template-columns:repeat(3,1fr);margin-top:22px;border-top:.5px solid var(--hl);border-bottom:.5px solid var(--hl)}
.sdStats button{text-align:left;padding:13px 0 13px 14px;border-left:.5px solid var(--hl)}.sdStats button:first-child{padding-left:0;border-left:0}
.sdStats b{display:block;font-weight:500;font-size:24px;letter-spacing:-.03em}.sdStats small{font-size:11px;color:var(--g)}
.sdLbl{font-size:13px;color:var(--g);margin:30px 0 6px}
.sd .sdSc{display:flex;width:100%;justify-content:space-between;align-items:center;padding:14px 0;font-size:15px;border-top:.5px solid var(--hl)}
.sdSc:last-child{border-bottom:.5px solid var(--hl)}.sdSc em{font-style:normal;font-size:13px;color:var(--g)}.sdSc em.bad{color:#c2410c}
.sdChips{display:flex;gap:6px;overflow-x:auto;padding:30px 0 6px;scrollbar-width:none;-webkit-overflow-scrolling:touch}.sdChips::-webkit-scrollbar{display:none}
.sd .sdChip{flex:0 0 auto;font-size:13px;padding:7px 13px;border-radius:999px;border:.5px solid #e2e2e2;color:var(--g);white-space:nowrap}
.sd .sdChip.on{background:var(--ink);border-color:var(--ink);color:#fff}
.sdMonth{display:flex;align-items:center;gap:12px;font-size:12px;letter-spacing:.14em;color:var(--g);margin:26px 0 2px;text-transform:uppercase}.sdMonth:after{content:"";flex:1;height:.5px;background:var(--hl)}
.sdRow{display:grid;grid-template-columns:64px 1fr auto;gap:12px;align-items:center;padding:15px 0;border-bottom:.5px solid var(--hl);cursor:pointer}
.sdDay b{display:block;font-weight:500;font-size:24px;letter-spacing:-.03em;line-height:1}.sdDay small{white-space:nowrap;font-size:10px;letter-spacing:.08em;color:var(--g)}
.sdName{font-size:16px;letter-spacing:-.01em}.sdSub{font-size:12px;color:var(--g);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sdRow.past{opacity:.42;filter:grayscale(1)}.sdRow.past .sdName{text-decoration:line-through;text-decoration-thickness:.5px;text-decoration-color:#9a9a9a}
.sdRow.next .sdDay b{color:var(--sand)}
.sdMenu{position:relative}.sdMenu summary{list-style:none;width:36px;height:36px;display:grid;place-items:center;border-radius:50%;color:var(--g);font-size:20px;line-height:1;cursor:pointer}.sdMenu summary::-webkit-details-marker{display:none}
.sdMenu[open] summary{background:#f3f3f3}
.sdMenu .pop{position:absolute;right:0;top:40px;z-index:30;min-width:180px;background:#fff;border:.5px solid #e2e2e2;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.08);padding:6px;display:flex;flex-direction:column}
.sdMenu .pop>*{text-align:left;padding:11px 12px;border-radius:8px;font-size:14px}.sdMenu .pop>*:hover{background:#f5f5f5}.sdMenu .pop .del{color:#c62828}
.sdNone{color:var(--g);font-size:14px;padding:30px 0}
.sdToast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%);background:#111;color:#fff;font:13px -apple-system,Arial;padding:10px 16px;border-radius:999px;z-index:99}
@media(min-width:900px){.sd{padding-top:30px}.sdTitle h1{font-size:56px}}
`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);

const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rows=()=>{try{return all||[]}catch(e){return[]}};
const day=v=>typeof jrDay==='function'?jrDay(v):null;
const mk=d=>typeof monthKey==='function'?monthKey(d):'';
function today(){const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Cancun',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(new Date()),g=k=>+p.find(x=>x.type===k).value;return new Date(g('year'),g('month')-1,g('day'),12)}
const light=new Map();let lightBusy=false;
const lkey=x=>[x.id,x.location,x.wedding_date,x.updated_at].join('|');
async function loadLight(list){
  if(lightBusy||!window.JRClientExperience?.withLight)return;lightBusy=true;let changed=false;
  for(const x of list){if(light.has(lkey(x)))continue;let L=null;try{L=await window.JRClientExperience.withLight(x)}catch(e){}light.set(lkey(x),L||{});changed=true}
  lightBusy=false;if(changed&&document.querySelector('#app .sd'))render(cur());
}
const L=x=>light.get(lkey(x))||null;
const accepted=x=>/^(accepted|light_accepted)$/.test(x.client_status||'');
const updatedSince=x=>x.client_responded_at&&x.updated_at&&new Date(x.updated_at)-new Date(x.client_responded_at)>60000;
function status(x,past){
  if(past)return['','Completed'];
  const l=L(x);if(l&&l.status==='short')return['bad','Light short'];if(l&&l.status==='tight')return['warn','Light tight'];
  if(accepted(x))return updatedSince(x)?['warn','Updated since accepted']:['ok','Confirmed'];
  return['','Not confirmed yet'];
}
const cur=()=>document.getElementById('jrMonthFilter')?.value||'';
function link(x){return (window.JR_PUBLIC_ORIGIN||location.origin)+'/?timeline='+encodeURIComponent(x.public_slug)}
function toast(t){const n=document.createElement('div');n.className='sdToast';n.textContent=t;document.body.appendChild(n);setTimeout(()=>n.remove(),1800)}

function render(month){
  const app=document.getElementById('app');if(!app)return;
  const T=today(),all_=rows().map(x=>({x,d:day(x.wedding_date)}));
  const up=all_.filter(a=>a.d&&a.d>=T).sort((a,b)=>a.d-b.d);
  const past=all_.filter(a=>a.d&&a.d<T).sort((a,b)=>b.d-a.d);
  const tbd=all_.filter(a=>!a.d);
  const next=up[0];
  const upMonths=[...new Set(up.map(a=>mk(a.d)))];
  if(month&&month!=='__past'&&month!=='__await'&&!upMonths.includes(month)&&!all_.some(a=>a.d&&mk(a.d)===month))month='';
  const conf=up.filter(a=>accepted(a.x)).length,wait=up.length-conf;
  const alerts=up.filter(a=>{const l=L(a.x);return l&&(l.status==='short'||l.status==='tight')}).length;
  const short=m=>{const [n,y]=m.split(' ');return n.slice(0,3)+(+y!==T.getFullYear()?" '"+String(y).slice(2):'')};

  let hero;
  if(next){
    const x=next.x,n=Math.round((next.d-T)/864e5),l=L(x),s=status(x,false);
    const sun=l&&l.info?'<span class="sdPill"><span class="sdDot '+(l.status==='short'?'bad':l.status==='tight'?'warn':'ok')+'"></span>Sunset '+E(String(l.info.sunset).replace(/\s?PM/i,''))+'</span>':'';
    hero='<div class="sdHero"><div class="row"><span><span class="sdDot sand"></span>Next wedding</span><span>'+E(next.d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}))+'</span></div>'+
      '<div class="sdCount">'+(n===0?'<b>Today</b>':'<b>'+n+'</b><span>'+(n===1?'day':'days')+' to go</span>')+'</div>'+
      '<h2>'+E(x.couple_name||'Untitled wedding')+'</h2><div class="meta">'+E([x.location,x.coverage].filter(Boolean).join(' · ')||'Venue TBD')+'</div>'+
      '<div class="sdPills">'+sun+'<span class="sdPill"><span class="sdDot '+(s[0]||'')+'"></span>'+E(s[1])+'</span></div>'+
      '<div class="sdBtns"><button class="sdB w" data-open="'+E(x.id)+'">Open</button><button class="sdB o" data-send="'+E(x.id)+'">Send to couple</button></div></div>';
  }else hero='<div class="sdEmptyHero">No upcoming weddings yet. Start one from a questionnaire.</div>';

  let list;
  const rowHtml=(a,isPast,isNext)=>{const x=a.x,d=a.d,s=status(x,isPast);
    return '<div class="sdRow'+(isPast?' past':'')+(isNext?' next':'')+'" data-open="'+E(x.id)+'"><div class="sdDay">'+(d?'<b>'+String(d.getDate()).padStart(2,'0')+'</b><small>'+E(d.toLocaleDateString('en-US',{month:'short'}).toUpperCase()+' · '+d.toLocaleDateString('en-US',{weekday:'short'}).toUpperCase())+'</small>':'<b>—</b><small>TBD</small>')+'</div>'+
    '<div style="min-width:0"><div class="sdName">'+E(x.couple_name||'Untitled wedding')+'</div><div class="sdSub"><span class="sdDot '+s[0]+'"></span>'+E(s[1])+(x.location?' · '+E(x.location):'')+'</div></div>'+
    '<details class="sdMenu"><summary aria-label="More actions">⋯</summary><div class="pop"><button data-open="'+E(x.id)+'">Open</button>'+(x.public_slug?'<a href="'+E(link(x)+'#studio-view='+encodeURIComponent(month&&!month.startsWith('__')?month:''))+'">View as couple</a><button data-share="'+E(x.id)+'">Share link</button>':'')+(isPast?'':'<button data-send="'+E(x.id)+'">Send to couple</button>')+'<button class="del" data-del="'+E(x.id)+'">Delete</button></div></details></div>'};
  const group=(arr,isPast)=>{const m=new Map();arr.forEach(a=>{const k=mk(a.d);if(!m.has(k))m.set(k,[]);m.get(k).push(a)});return [...m].map(([k,v])=>'<div class="sdMonth">'+E(k)+'</div>'+v.map(a=>rowHtml(a,isPast,next&&a.x.id===next.x.id)).join('')).join('')};
  if(month==='__past')list=past.length?group(past,true):'<div class="sdNone">No past weddings yet.</div>';
  else if(month==='__await'){const w=up.filter(a=>!accepted(a.x));list=w.length?group(w,false):'<div class="sdNone">Every upcoming couple has confirmed.</div>'}
  else if(month){const inM=all_.filter(a=>a.d&&mk(a.d)===month).sort((a,b)=>a.d-b.d);list=inM.map(a=>rowHtml(a,a.d<T,next&&a.x.id===next.x.id)).join('')||'<div class="sdNone">No weddings this month.</div>'}
  else list=(group(up,false)||'')+(tbd.length?'<div class="sdMonth">Date TBD</div>'+tbd.map(a=>rowHtml(a,false,false)).join(''):'')+(past.length?'<div class="sdMonth">Past weddings</div>'+past.map(a=>rowHtml(a,true,false)).join(''):'')||'<div class="sdNone">No timelines yet.</div>';

  const chip=(v,t)=>'<button class="sdChip'+(month===v?' on':'')+'" data-month="'+E(v)+'">'+E(t)+'</button>';
  app.innerHTML='<div class="sd"><input type="hidden" id="jrMonthFilter" value="'+E(month)+'"><div id="count" hidden></div>'+
   '<div class="sdTop"><a class="sdBrand" href="https://the-studio-jr.vercel.app/"><span class="sdMark">JR</span>The Studio JR</a><div class="sdNav"><a href="https://the-studio-jr.vercel.app/finanzas">Finanzas</a><button class="sdNew" data-new="1">+ New</button></div></div>'+
   '<div class="sdTitle"><h1>Timeline<br>Builder</h1><div class="sdBy">BY JONHY &amp; ROSE</div></div>'+hero+
   '<div class="sdStats"><button data-month=""><b>'+up.length+'</b><small>Upcoming</small></button><button data-month=""><b>'+conf+'</b><small>Confirmed</small></button><button data-month="__await"><b>'+wait+'</b><small>Not confirmed</small></button></div>'+
   '<div class="sdLbl">Shortcuts</div><div><button class="sdSc" data-pdf="1"><span>New from questionnaire</span><em>PDF →</em></button><button class="sdSc" data-month="__await"><span>Not confirmed yet</span><em>'+wait+' →</em></button><button class="sdSc" data-alerts="1"><span>Light alerts</span><em class="'+(alerts?'bad':'')+'">'+(lightBusy&&!alerts?'…':alerts)+' →</em></button><a class="sdSc" href="https://the-studio-jr.vercel.app/finanzas"><span>Finanzas</span><em>→</em></a></div>'+
   '<div class="sdChips">'+chip('','All')+upMonths.map(m=>chip(m,short(m))).join('')+(past.length?chip('__past','Past'):'')+'</div>'+
   '<div id="dash">'+list+'</div></div>';
  loadLight(up.slice(0,10).map(a=>a.x));
}

function wait(sel,ms){return new Promise(r=>{const t0=Date.now();(function f(){const n=document.querySelector(sel);if(n||Date.now()-t0>ms)return r(n);setTimeout(f,80)})()})}
document.addEventListener('click',async e=>{
  if(!e.target.closest('#app .sd'))return;const t=e.target.closest('[data-open],[data-send],[data-del],[data-share],[data-month],[data-new],[data-pdf],[data-alerts]');
  document.querySelectorAll('#app .sdMenu[open]').forEach(d=>{if(!d.contains(e.target))d.open=false});
  if(!t||t.tagName==='SUMMARY')return;
  if(t.closest('summary'))return;
  const find=id=>rows().find(x=>x.id===id);
  if(t.dataset.month!==undefined){render(t.dataset.month);document.querySelector('.sdChips')?.scrollIntoView({behavior:'smooth',block:'start'});return}
  if(t.dataset.new){newTimeline();return}
  if(t.dataset.pdf){newTimeline();const f=document.getElementById('pdf');if(f){f.scrollIntoView({block:'center'});f.click()}return}
  if(t.dataset.alerts){const T=today();const bad=rows().filter(x=>{const d=day(x.wedding_date),l=L(x);return d&&d>=T&&l&&(l.status==='short'||l.status==='tight')});if(!bad.length){toast(lightBusy?'Checking light…':'All upcoming weddings have good light');return}render('');setTimeout(()=>{const el=document.querySelector('.sdRow[data-open="'+bad[0].id+'"]');el?.scrollIntoView({behavior:'smooth',block:'center'})},50);return}
  if(t.dataset.del){t.closest('details')&&(t.closest('details').open=false);deleteTimeline(t.dataset.del);return}
  if(t.dataset.share){const x=find(t.dataset.share);if(!x)return;const u=link(x);t.closest('details').open=false;try{if(navigator.share){await navigator.share({title:x.couple_name+' · Wedding day timeline',url:u});return}}catch(err){if(err&&err.name==='AbortError')return}try{await navigator.clipboard.writeText(u);toast('Link copied')}catch(err){prompt('Client link:',u)}return}
  if(t.dataset.send){openTimeline(t.dataset.send);const b=await wait('[data-jrx-send]',3000);if(b)b.click();return}
  if(t.dataset.open){if(e.target.closest('.sdMenu')&&t.classList.contains('sdRow'))return;openTimeline(t.dataset.open);window.scrollTo(0,0)}
});

window.renderDashboardMonth=render;
try{renderDashboardMonth=render}catch(e){}
if(document.getElementById('dash')&&rows().length)render(cur());
})();
