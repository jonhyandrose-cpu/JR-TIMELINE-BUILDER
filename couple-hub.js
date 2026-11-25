/* Portal de la pareja: arriba del timeline público, cuenta regresiva y 3 accesos
   (View your timeline · Pay your balance · Your Wedding Day Guide).
   En el editor agrega el campo "Payment link" que se guarda en client_view.pay_url. */
(function(){
const CSS=`
.public.jrHasCover .publicHead{display:none}
.jrCover{position:relative;min-height:100svh;margin:0 0 28px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:calc(40px + env(safe-area-inset-top)) 24px 70px;background:#191816;color:#f3efe8;overflow:hidden}
.jrCover:before{content:"";position:absolute;inset:18px;border:1px solid rgba(201,167,124,.28);border-radius:22px;pointer-events:none}
.jrCover .mono{height:46px;filter:invert(1);opacity:.92;margin-bottom:34px}
.jrCover .k{font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:#c9a77c}
.jrCover h1{font-family:'Cormorant Garamond',Georgia,serif;font-weight:400;font-style:italic;font-size:clamp(46px,13vw,92px);line-height:.98;margin:16px 0 18px;color:#fff;letter-spacing:-.01em}
.jrCover .meta{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#cfc8bd;line-height:1.9}
.jrCover .count{margin:30px 0 4px;font-family:'Cormorant Garamond',Georgia,serif;font-size:58px;line-height:1;color:#fff}
.jrCover .cu{font-size:13px;color:#cfc8bd}
.jrCover .menu{display:grid;gap:10px;width:100%;max-width:380px;margin-top:34px}
.jrCover .menu a{display:flex;align-items:center;justify-content:space-between;padding:15px 18px;border-radius:14px;text-decoration:none;font-size:15px;border:1px solid #3a3733;color:#f3efe8}
.jrCover .menu a.main{background:#f6f3ee;color:#191816;border-color:#f6f3ee}
.jrCover .menu a span:last-child{opacity:.6}
.jrCover .paid{font-size:12px;color:#9ed8b6;margin-top:12px}
.jrCover .share{margin-top:26px;width:100%;max-width:380px}
.jrCover .share .k{display:block;margin-bottom:10px}
.jrCover .share .row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.jrCover .share button{background:transparent;color:#f3efe8;border:1px solid #3a3733;border-radius:999px;padding:9px 15px;font:inherit;font-size:13px;cursor:pointer}
.jrCover .share small{display:block;font-size:12px;color:#cfc8bd;margin-top:8px;min-height:15px}
.jrCover .cue{position:absolute;bottom:34px;left:0;right:0;font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:#8d857a}
.jrBar{position:fixed;left:0;right:0;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:calc(9px + env(safe-area-inset-top)) 14px 10px;background:rgba(246,243,238,.93);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-bottom:1px solid #e3ddd3;transform:translateY(-110%);transition:transform .25s ease}
.jrBar.on{transform:none}
.jrBar img{height:26px;display:block}
.jrBar nav{display:flex;gap:6px;overflow-x:auto}
.jrBar nav a{white-space:nowrap;font-size:13px;color:#191816;text-decoration:none;padding:7px 12px;border-radius:999px;border:1px solid #e3ddd3;background:#fff}
.jrBar nav a.pay{background:#191816;color:#f6f3ee;border-color:#191816}
#jrTimelineStart{scroll-margin-top:70px}
@media print{.jrCover,.jrBar{display:none}.public.jrHasCover .publicHead{display:block}}
`;
const st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const qs=new URLSearchParams(location.search),slug=qs.get('timeline'),shared=qs.get('s')==='1';

function parseDay(v){try{if(typeof jrDay==='function'){const d=jrDay(v);if(d)return d}}catch(e){}const d=new Date(String(v||'')+' 12:00');return isNaN(d)?null:d}
function daysTo(d){const t=new Date();t.setHours(12,0,0,0);return Math.round((d-t)/864e5)}

async function row(){
  if(window.__jrHubRow)return window.__jrHubRow;
  try{const r=await fetch(API+'?public_slug=eq.'+encodeURIComponent(slug)+'&select=couple_name,wedding_date,client_view',{headers:headers()});const d=await r.json();window.__jrHubRow=d[0]||null}catch(e){window.__jrHubRow=null}
  return window.__jrHubRow;
}
async function hub(){
  if(!slug)return;
  const pub=document.querySelector('#app .public');const head=pub&&pub.querySelector('.publicHead');
  if(!head||document.querySelector('.jrCover'))return;
  const x=await row();if(!x||document.querySelector('.jrCover'))return;
  const cv=x.client_view&&typeof x.client_view==='object'?x.client_view:{};
  const d=parseDay(x.wedding_date),n=d?daysTo(d):null;
  const metaLines=(head.querySelector('.meta')?.innerText||'').split('\n').map(t=>t.trim()).filter(Boolean);
  const couple=x.couple_name||head.querySelector('h1')?.textContent||'';
  let cnt='';
  if(n!==null&&n>1)cnt='<div class="count">'+n+'</div><div class="cu">days until '+(shared?'the':'your')+' wedding</div>';
  else if(n===1)cnt='<div class="count">Tomorrow</div><div class="cu">See you very soon</div>';
  else if(n===0)cnt='<div class="count">Today</div><div class="cu">Enjoy every moment</div>';
  else if(n!==null)cnt='<div class="count" style="font-size:40px">Thank you</div><div class="cu">for letting us be part of your day</div>';
  const payUrl=!shared&&cv.pay_url&&!cv.paid&&(n===null||n>=0)?cv.pay_url:'';
  const guide='/guide?p='+encodeURIComponent(slug)+(shared?'&s=1':'');
  const names=esc(couple).replace(/ &amp; /,' <span style="font-style:normal">&amp;</span> ');
  const el=document.createElement('section');el.className='jrCover';
  el.innerHTML='<img class="mono" src="/jr-monogram-ink.png?v=1" alt="Jonhy &amp; Rose">'+
    '<div class="k">'+(shared?'The wedding of':'Your wedding portal')+'</div><h1>'+names+'</h1>'+
    '<div class="meta">'+metaLines.map(esc).join('<br>')+'</div>'+cnt+
    '<div class="menu"><a class="main" href="#timeline" data-go="tl"><span>The timeline</span><span>↓</span></a>'+
    '<a href="'+guide+'"><span>Wedding Day Guide</span><span>→</span></a>'+
    (payUrl?'<a href="'+esc(payUrl)+'" target="_blank" rel="noopener"><span>Pay your balance</span><span>→</span></a>':'')+'</div>'+
    (cv.paid&&!shared?'<div class="paid">Your balance is paid. Thank you!</div>':'')+
    '<div class="share"><span class="k">Share with your bridal party</span><div class="row"><button type="button" data-s="tl">The timeline</button><button type="button" data-s="guide">The guide</button><button type="button" data-s="all">Everything</button></div><small></small></div>'+
    '<div class="cue">Scroll ↓</div>';
  pub.prepend(el);pub.classList.add('jrHasCover');
  const tl=[...pub.querySelectorAll('.publicSection')].find(s=>/Photography Timeline/i.test(s.querySelector('h2')?.textContent||''));
  if(tl&&!document.getElementById('jrTimelineStart')){const a=document.createElement('div');a.id='jrTimelineStart';a.style.cssText='position:relative;top:-14px';tl.prepend(a)}
  const goTl=e=>{const t=document.getElementById('jrTimelineStart');if(t){e&&e.preventDefault();t.scrollIntoView({behavior:'smooth'})}};
  el.querySelector('[data-go=tl]').addEventListener('click',goTl);
  /* sticky bar */
  const bar=document.createElement('div');bar.className='jrBar';
  bar.innerHTML='<a href="#" data-top aria-label="Top"><img src="/jr-monogram-ink.png?v=1" alt="Jonhy &amp; Rose"></a><nav><a href="#" data-top>Portal</a><a href="#timeline" data-go="tl">Timeline</a><a href="'+guide+'">Guide</a>'+(payUrl?'<a class="pay" href="'+esc(payUrl)+'" target="_blank" rel="noopener">Pay</a>':'')+'</nav>';
  document.body.appendChild(bar);
  bar.querySelectorAll('[data-top]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();scrollTo({top:0,behavior:'smooth'})}));
  bar.querySelector('[data-go=tl]').addEventListener('click',goTl);
  const io=new IntersectionObserver(es=>es.forEach(en=>bar.classList.toggle('on',!en.isIntersecting)),{threshold:0,rootMargin:'-60px 0px 0px 0px'});io.observe(el);
  /* share */
  el.querySelectorAll('[data-s]').forEach(b=>b.addEventListener('click',async()=>{
    const k=b.dataset.s,base=location.origin+'/?timeline='+encodeURIComponent(slug)+'&s=1';
    const url=k==='guide'?location.origin+'/guide?p='+encodeURIComponent(slug)+'&s=1':k==='tl'?base+'#timeline':base;
    const data=k==='guide'?{title:'Wedding Day Guide · Jonhy & Rose',text:'A few things to have ready for the wedding day:',url}
      :k==='tl'?{title:'Wedding day timeline · '+couple,text:'The wedding day timeline for '+couple+':',url}
      :{title:couple+' · Wedding portal',text:'Everything for '+couple+'’s wedding day, timeline and guide:',url};
    const note=el.querySelector('.share small');
    try{if(navigator.share){await navigator.share(data);return}}catch(e){if(e&&e.name==='AbortError')return}
    try{await navigator.clipboard.writeText(url);note.textContent='Link copied. Paste it in your group chat.'}catch(e){note.textContent=url}
  }));
  if(location.hash==='#timeline')setTimeout(()=>goTl(),500);
}

/* Editor: payment link for the couple portal */
function editorField(){
  const ed=document.querySelector('#app .editor');if(!ed||ed.querySelector('#jrHubPay'))return;
  if(typeof state==='undefined'||!state)return;
  const anchor=ed.querySelector('#jrXStudioNote')?.closest('.field,div')||ed.querySelector('.editorBody');if(!anchor)return;
  state.client_view=state.client_view&&typeof state.client_view==='object'?state.client_view:{};
  const w=document.createElement('div');w.className='field';w.style.marginTop='14px';
  w.innerHTML='<label>PAYMENT LINK · COUPLE PORTAL</label><input id="jrHubPay" type="url" placeholder="https://buy.stripe.com/…" value="'+esc(state.client_view.pay_url||'')+'"><div class="muted" style="font-size:12px;margin-top:6px">Shows a “Pay your balance” button on the couple’s page. Leave empty to hide it. Save to apply.</div>';
  anchor.insertAdjacentElement('afterend',w);
  w.querySelector('input').addEventListener('input',e=>{state.client_view=state.client_view||{};const v=e.target.value.trim();if(v)state.client_view.pay_url=v;else delete state.client_view.pay_url});
}
document.addEventListener('input',e=>{if(e.target&&e.target.id==='jrXPay'&&typeof state!=='undefined'&&state){const v=e.target.value.trim();if(v){state.client_view=state.client_view||{};state.client_view.pay_url=v;const f=document.getElementById('jrHubPay');if(f&&!f.value)f.value=v}}});

let pend=false;
new MutationObserver(()=>{if(pend)return;pend=true;requestAnimationFrame(()=>{pend=false;try{hub()}catch(e){}try{editorField()}catch(e){}})}).observe(document.getElementById('app')||document.body,{childList:true,subtree:true});
})();
