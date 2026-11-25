/* Portal de la pareja: arriba del timeline público, cuenta regresiva y 3 accesos
   (View your timeline · Pay your balance · Your Wedding Day Guide).
   En el editor agrega el campo "Payment link" que se guarda en client_view.pay_url. */
(function(){
const CSS=`
.jrHub{margin:26px 0 8px;padding:26px 22px 22px;border-radius:20px;background:#191816;color:#f3efe8;text-align:center}
.jrHub .k{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#c9a77c}
.jrHub .n{font-family:'Cormorant Garamond',Georgia,serif;font-size:64px;line-height:1;margin:12px 0 2px}
.jrHub .u{font-size:13px;color:#cfc8bd}
.jrHub .btns{display:grid;gap:10px;margin-top:22px}
.jrHub a{display:flex;align-items:center;justify-content:space-between;padding:15px 18px;border-radius:14px;text-decoration:none;font-size:15px;letter-spacing:.01em;border:1px solid #3a3733;color:#f3efe8}
.jrHub a.main{background:#f6f3ee;color:#191816;border-color:#f6f3ee}
.jrHub a span:last-child{opacity:.6}
.jrHub .share{margin-top:18px;padding-top:16px;border-top:1px solid #3a3733}
.jrHub .share .k{display:block;margin-bottom:10px}
.jrHub .share .row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.jrHub .share button{background:transparent;color:#f3efe8;border:1px solid #3a3733;border-radius:999px;padding:9px 15px;font:inherit;font-size:13px;cursor:pointer}
.jrHub .share small{display:block;font-size:12px;color:#cfc8bd;margin-top:8px;min-height:15px}
.jrHub .paid{font-size:12px;color:#9ed8b6;margin-top:12px}
@media(min-width:640px){.jrHub .btns{grid-template-columns:1fr 1fr 1fr}.jrHub a{flex-direction:column;gap:6px;justify-content:center;text-align:center}}
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
  const head=document.querySelector('#app .public .publicHead');if(!head||document.querySelector('.jrHub'))return;
  const x=await row();if(!x||document.querySelector('.jrHub'))return;
  const cv=x.client_view&&typeof x.client_view==='object'?x.client_view:{};
  const d=parseDay(x.wedding_date),n=d?daysTo(d):null;
  let top='';
  if(n!==null&&n>1)top='<div class="n">'+n+'</div><div class="u">days until '+(shared?'the':'your')+' wedding</div>';
  else if(n===1)top='<div class="n">Tomorrow</div><div class="u">See you very soon</div>';
  else if(n===0)top='<div class="n">Today</div><div class="u">Enjoy every moment</div>';
  else top='<div class="n" style="font-size:44px">Thank you</div><div class="u">for letting us be part of your day</div>';
  const pay=!shared&&cv.pay_url&&!cv.paid&&(n===null||n>=0)?'<a href="'+esc(cv.pay_url)+'" target="_blank" rel="noopener"><span>Pay your balance</span><span>→</span></a>':'';
  const el=document.createElement('section');el.className='jrHub';
  el.innerHTML='<div class="k">'+(shared?esc(x.couple_name||'Wedding day'):'Your wedding portal')+'</div>'+top+
    '<div class="btns"><a class="main" href="#jrTimelineStart"><span>View your timeline</span><span>↓</span></a>'+pay+
    '<a href="/guide"><span>Your Wedding Day Guide</span><span>→</span></a></div>'+(cv.paid&&!shared?'<div class="paid">Your balance is paid. Thank you!</div>':'')+
    '<div class="share"><span class="k">Share with your bridal party</span><div class="row"><button type="button" data-s="tl">The timeline</button><button type="button" data-s="guide">The guide</button><button type="button" data-s="all">Everything</button></div><small></small></div>';
  head.insertAdjacentElement('afterend',el);
  const couple=x.couple_name||'the couple';
  el.querySelectorAll('[data-s]').forEach(b=>b.addEventListener('click',async()=>{
    const k=b.dataset.s,g=k==='guide',base=location.origin+'/?timeline='+encodeURIComponent(slug)+'&s=1';
    const url=g?location.origin+'/guide':k==='tl'?base+'#timeline':base;
    const data=g?{title:'Wedding Day Guide · Jonhy & Rose',text:'A few things to have ready for the wedding morning:',url}
      :k==='tl'?{title:'Wedding day timeline · '+couple,text:'The wedding day timeline for '+couple+':',url}
      :{title:couple+' · Wedding portal',text:'Everything for '+couple+'’s wedding day, timeline and guide:',url};
    const note=el.querySelector('.share small');
    try{if(navigator.share){await navigator.share(data);return}}catch(e){if(e&&e.name==='AbortError')return}
    try{await navigator.clipboard.writeText(url);note.textContent='Link copied. Paste it in your group chat.'}catch(e){note.textContent=url}
  }));
  const tl=[...document.querySelectorAll('#app .publicSection')].find(s=>/Photography Timeline/i.test(s.querySelector('h2')?.textContent||''));
  if(tl&&!document.getElementById('jrTimelineStart')){const a=document.createElement('div');a.id='jrTimelineStart';a.style.cssText='position:relative;top:-14px';tl.prepend(a)}
  if(location.hash==='#timeline'){const t=document.getElementById('jrTimelineStart');if(t)setTimeout(()=>t.scrollIntoView(),400)}
  el.querySelector('a.main').addEventListener('click',e=>{const t=document.getElementById('jrTimelineStart');if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'})}});
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
