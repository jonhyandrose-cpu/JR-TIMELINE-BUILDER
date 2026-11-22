/* JR client experience v1 — light check, client page, couple responses, sharing and "Send to couple".
   Additive: it enhances the existing views and never changes how timelines are saved unless the
   new database columns exist. */
(function(){
'use strict';
const STUDIO_EMAIL='jonhyandrose@gmail.com';
const $=s=>document.querySelector(s);
const E=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=v=>String(v||'').replace(/\s+/g,' ').trim();
const S=()=>{try{return typeof state!=='undefined'?state:null}catch(e){return null}};
const ALL=()=>{try{return typeof all!=='undefined'&&Array.isArray(all)?all:[]}catch(e){return []}};

/* ---------- time helpers ---------- */
function toMin(t){
  const s=String(t||'').toLowerCase();
  let m=s.match(/(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)/);
  if(m){let h=+m[1]%12;if(/p/.test(m[3]))h+=12;return h*60+(+m[2]||0)}
  m=s.match(/\b(\d{1,2}):(\d{2})\b/);
  if(m){let h=+m[1];if(h<11)h+=12;return h*60+(+m[2])}
  return null;
}
function fmtMin(m){if(m==null)return '';let h=Math.floor(m/60),mi=Math.round(m%60);if(mi===60){h++;mi=0}const ap=h>=12?'pm':'am';h=h%12||12;return h+':'+String(mi).padStart(2,'0')+' '+ap}

/* ---------- light check (shared by editor, dashboard and client page) ---------- */
function analyze(d){
  const rows=d.timeline||[],keys=d.key_requests||[];
  const cerRow=rows.find(r=>/ceremony/i.test(r.item||'')&&!/prep|freshen|after/i.test(r.item||''));
  const cerStart=toMin(cerRow?.time)??toMin(d.ceremony);
  const durK=keys.join(' ').match(/Ceremony:[^|]*?(\d{2,3})\s*min/i);
  const cerDur=durK?Math.min(+durK[1],120):30;
  const firstLook=rows.some(r=>/first look/i.test(r.item||''))||keys.some(k=>/^First look:\s*yes/i.test(k));
  const need=15+(firstLook?10:40);
  return {cerStart,cerDur,cerEnd:cerStart==null?null:cerStart+cerDur,firstLook,need};
}
async function withLight(d){
  const a=analyze(d);
  if(!window.JRLightPlanner?.calculate||!d.location||!d.wedding_date)return {...a,ok:false,reason:'missing'};
  let info=null;try{info=await window.JRLightPlanner.calculate(d.location,d.wedding_date)}catch(e){}
  if(!info)return {...a,ok:false,reason:'nolight'};
  const sunset=toMin(info.sunset),golden=toMin(info.golden);
  if(a.cerEnd==null)return {...a,sunset,golden,info,reason:'noceremony'};
  const left=sunset-a.cerEnd;
  const status=left>=a.need?'ok':(left>=a.need-10&&left>=15?'tight':'short');
  return {...a,sunset,golden,info,left,status,reason:'ok'};
}

/* ---------- styles ---------- */
const css=`
.jrX-bar{position:relative;height:58px;margin:22px 0 6px}
.jrX-bar .b{position:absolute;left:0;right:0;top:24px;height:10px;border-radius:10px;background:#ebe5db}
.jrX-bar .s{position:absolute;top:24px;height:10px;border-radius:10px}
.jrX-bar .t{position:absolute;font-size:10.5px;letter-spacing:.04em;color:#756f68;white-space:nowrap;transform:translateX(-50%)}
.jrX-bar .t.up{top:2px}.jrX-bar .t.dn{top:40px}
.jrX-bar .pin{position:absolute;top:16px;width:1px;height:26px;background:#191816}
.jrX-legend{display:flex;flex-wrap:wrap;gap:14px;font-size:11.5px;color:#756f68;margin-top:6px}
.jrX-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}
.jrX-stats{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-top:18px}
.jrX-stats div{border:1px solid #ded8cf;border-radius:12px;padding:12px 10px;text-align:center;background:#fff}
.jrX-stats b{display:block;font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:24px;line-height:1.1}
.jrX-stats span{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#9a8068}
.jrX-msg{margin-top:16px;font-size:15px;line-height:1.6;color:#3a3631}
.jrX-note{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:21px;line-height:1.45;color:#3a3631}
.jrX-sign{font-family:'Cormorant Garamond',Georgia,serif;font-size:18px;color:#5a524a;margin-top:10px}
.jrX-alert{margin-top:16px;border:1px solid #e7d3bf;background:#fbf4ec;border-radius:14px;padding:16px}
.jrX-btns{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}
.jrX-btn{flex:1;min-width:130px;min-height:46px;border-radius:999px;border:1px solid #191816;background:#191816;color:#fff;font:600 12px/1 -apple-system,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;padding:0 16px}
.jrX-btn.o{background:#fff;color:#191816;border-color:#ded8cf}
.jrX-btn.sage{background:#4e795b;border-color:#4e795b}
.jrX-done{margin-top:14px;padding:14px 16px;border-radius:12px;background:#edf4ee;color:#3e6149;font-size:14px;line-height:1.5}
.jrX-share{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
.jrX-share a,.jrX-share button{display:flex;align-items:center;justify-content:center;gap:8px;min-height:46px;border:1px solid #ded8cf;border-radius:999px;background:#fff;color:#191816;font:500 13px -apple-system,Arial,sans-serif;text-decoration:none;cursor:pointer}
.jrX-share .main{grid-column:1/-1;background:#191816;color:#fff;border-color:#191816;letter-spacing:.12em;text-transform:uppercase;font-size:12px;font-weight:600}
.jrX-ta{width:100%;min-height:90px;border:1px solid #ded8cf;border-radius:12px;padding:12px 14px;font:16px/1.5 -apple-system,Arial,sans-serif;margin-top:12px}
.jrX-pill{display:inline-block;font-size:11px;padding:5px 10px;border-radius:999px;margin-left:6px;white-space:nowrap}
.jrX-pill.ok{background:#e7f0e9;color:#3e6149}.jrX-pill.warn{background:#f8efe2;color:#7a5a2e}.jrX-pill.bad{background:#f8e6e2;color:#9a3d33}
#jrXCheck{margin:0 0 26px;padding:16px 18px;border-radius:14px;font-size:14px;line-height:1.55}
#jrXCheck.ok{background:#edf4ee;border:1px solid #cfe2d3}#jrXCheck.tight{background:#fbf4ec;border:1px solid #ecd6bd}#jrXCheck.short{background:#fbefec;border:1px solid #efcdc5}#jrXCheck.wait{background:#f6f3ee;border:1px solid #ded8cf}
#jrXCheck b{font-size:15px}
.jrX-modal{position:fixed;inset:0;z-index:200;background:rgba(17,16,14,.5);display:flex;align-items:flex-end;justify-content:center}
.jrX-sheet{background:#fbfaf7;width:100%;max-width:640px;max-height:92vh;overflow:auto;border-radius:18px 18px 0 0;padding:22px 20px calc(24px + env(safe-area-inset-bottom))}
.jrX-sheet h3{font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:28px;margin:4px 0 12px}
.jrX-tabs{display:flex;gap:8px;margin-bottom:12px}
.jrX-tabs button{flex:1;min-height:42px;border-radius:999px;border:1px solid #ded8cf;background:#fff;font:500 13px -apple-system,Arial,sans-serif;cursor:pointer}
.jrX-tabs button.on{background:#191816;color:#fff;border-color:#191816}
.jrX-sheet input,.jrX-sheet textarea{width:100%;border:1px solid #ded8cf;border-radius:10px;padding:11px 12px;font:16px/1.55 -apple-system,Arial,sans-serif;background:#fff}
.jrX-sheet label{display:block;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#9a8068;margin:12px 0 6px;font-weight:600}
.jrX-has-light .jrPreviewLightSlot,.jrX-has-light .jrPublicLight:not(.jrX-light){display:none!important}
.jrX-ed{position:relative}
.jrX-x{position:absolute;top:10px;right:0;z-index:3;min-width:34px;height:34px;padding:0 10px;border-radius:999px;border:1px solid #ded8cf;background:#fff;color:#756f68;font:600 12px -apple-system,Arial,sans-serif;cursor:pointer}
.jrX-lmWrap .jrX-x{top:-4px}
.jrX-off>*:not(.jrX-x){opacity:.28}
.jrX-off{background:repeating-linear-gradient(135deg,transparent 0 10px,rgba(154,128,104,.06) 10px 20px)}
.jrX-edit{outline:none;border-radius:6px;transition:background .2s;cursor:text}
.jrX-edit:hover{background:rgba(227,191,116,.12)}
.jrX-edit:focus{background:#fff8ea;box-shadow:0 0 0 2px #e3bf74}
.jrX-editHint{position:sticky;top:0;z-index:5;background:#f8efe2;color:#7a5a2e;font:13px/1.45 -apple-system,Arial,sans-serif;padding:10px 16px}
.jrX-toast{position:fixed;left:50%;bottom:calc(24px + env(safe-area-inset-bottom));transform:translateX(-50%);background:#191816;color:#fff;padding:11px 18px;border-radius:999px;font:13px -apple-system,Arial,sans-serif;z-index:300}
@media(max-width:520px){.jrX-stats b{font-size:21px}.jrX-share{grid-template-columns:1fr 1fr}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const isHidden=(x,k)=>((x&&x.client_view&&Array.isArray(x.client_view.hidden))?x.client_view.hidden:[]).includes(k)||(k==='light_message'&&x&&x.show_light_message===false);
function toast(t){const e=document.createElement('div');e.className='jrX-toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2600)}

/* ---------- light bar (client) ---------- */
function lightBar(L){
  if(L.reason!=='ok')return '';
  const start=Math.min(L.cerStart-40,L.golden-30),end=L.sunset+30,span=end-start,p=m=>Math.max(0,Math.min(100,(m-start)/span*100));
  const cs=p(L.cerStart),ce=p(L.cerEnd),g=p(L.golden),s=p(L.sunset);
  return '<div class="jrX-bar"><div class="b"></div>'+
    '<div class="s" style="left:'+g+'%;width:'+(s-g)+'%;background:#e3bf74"></div>'+
    '<div class="s" style="left:'+s+'%;width:'+(100-s)+'%;background:#5b5650"></div>'+
    '<div class="s" style="left:'+cs+'%;width:'+Math.max(2,ce-cs)+'%;background:#191816;height:14px;top:22px"></div>'+
    '<span class="t up" style="left:'+((cs+ce)/2)+'%">Ceremony</span>'+
    '<span class="t dn" style="left:'+cs+'%">'+fmtMin(L.cerStart)+'</span>'+
    '<div class="pin" style="left:'+s+'%"></div><span class="t up" style="left:'+s+'%">Sunset</span>'+
    '<span class="t dn" style="left:'+s+'%">'+fmtMin(L.sunset)+'</span></div>'+
    '<div class="jrX-legend"><span><i style="background:#191816"></i>Ceremony</span><span><i style="background:#e3bf74"></i>Golden hour</span><span><i style="background:#5b5650"></i>After sunset</span></div>'+
    '<div class="jrX-stats"><div><b>'+fmtMin(L.golden).replace(/ (am|pm)/,'')+'</b><span>Golden hour</span></div><div><b>'+fmtMin(L.sunset).replace(/ (am|pm)/,'')+'</b><span>Sunset</span></div><div><b>'+Math.max(0,L.left)+'′</b><span>After ceremony</span></div></div>';
}
function clientLightCopy(L,x){
  if(L.reason!=='ok')return '';
  if(isHidden(x,'light_message')&&!x.__preview)return '';
  const custom=clean(x.light_note);
  if(L.status==='ok'&&custom)return '<p class="jrX-msg jrX-lm">'+E(custom)+'</p>';
  if(L.status==='ok')return '<p class="jrX-msg jrX-lm">Your day is beautifully timed with the light. Your ceremony ends at '+fmtMin(L.cerEnd)+', leaving about '+L.left+' minutes of natural light before sunset at '+fmtMin(L.sunset)+(L.firstLook?', and your first look gives us time for portraits earlier in the day':'')+'.</p>';
  const note=clean(x.light_note)||'Your ceremony ends at '+fmtMin(L.cerEnd)+' and the sun sets at '+fmtMin(L.sunset)+', which leaves about '+Math.max(0,L.left)+' minutes of natural light for '+(L.firstLook?'your family photos and sunset portraits':'your family, wedding party and couple portraits')+'. We\'d love to talk about '+(L.firstLook?'a little more time after the ceremony':'a first look or an earlier ceremony')+' so every photo glows.';
  return '<div class="jrX-alert"><div class="eyebrow" style="margin-bottom:8px">A note about your light</div><p class="jrX-msg jrX-lm" style="margin:0">'+E(note)+'</p><div class="jrX-btns" data-jrx-light><button class="jrX-btn" data-resp="light_accepted">Sounds good</button><button class="jrX-btn o" data-resp="light_discuss">Let\'s talk</button></div></div>';
}

/* ---------- client page ---------- */
async function fetchRow(slug){
  try{const r=await fetch(API+'?public_slug=eq.'+encodeURIComponent(slug)+'&select=*',{headers:headers()});if(!r.ok)return null;return (await r.json())[0]||null}catch(e){return null}
}
function shareBlock(url,couple){
  const text='Our wedding day timeline '+(couple?'· '+couple+' ':'')+'🤍';
  return '<section class="publicSection jrX-shareSec"><h2>Share your timeline</h2><p class="jrX-msg" style="margin-top:0">Send it to your planner, family and wedding party. They\'ll always see the latest version.</p><div class="jrX-share">'+
    '<button type="button" class="main" data-share>Share</button>'+
    '<a href="https://wa.me/?text='+encodeURIComponent(text+' '+url)+'" target="_blank" rel="noopener">WhatsApp</a>'+
    '<a href="sms:&body='+encodeURIComponent(text+' '+url)+'">iMessage</a>'+
    '<a href="mailto:?subject='+encodeURIComponent('Our wedding day timeline'+(couple?' · '+couple:''))+'&body='+encodeURIComponent('Here is our wedding day timeline by Jonhy & Rose:\n\n'+url)+'">Email</a>'+
    '<button type="button" data-copy="'+E(url)+'">Copy link</button></div></section>';
}
function respondBlock(x){
  let done=x&&x.client_status;
  const outdated=done&&x.client_responded_at&&x.updated_at&&new Date(x.updated_at)-new Date(x.client_responded_at)>60000;
  if(outdated)return '<section class="publicSection jrX-respond"><h2>Your timeline was updated</h2><p class="jrX-msg" style="margin-top:0">We made some changes after you confirmed it'+(x.updated_at?' (updated '+new Date(x.updated_at).toLocaleDateString('en-US',{month:'long',day:'numeric'})+')':'')+'. Please take another look and let us know it still looks perfect.</p><div class="jrX-btns" data-jrx-main><button class="jrX-btn" data-resp="accepted">Looks perfect</button><button class="jrX-btn o" data-ask>Request a change</button></div></section>';
  if(done==='accepted')return '<section class="publicSection jrX-respond"><h2>Your timeline</h2><div class="jrX-done">You confirmed this timeline'+(x.client_responded_at?' on '+new Date(x.client_responded_at).toLocaleDateString('en-US',{month:'long',day:'numeric'}):'')+'. Thank you! If anything changes, we\'ll update this same link.</div></section>';
  return '<section class="publicSection jrX-respond"><h2>Does everything look right?</h2><p class="jrX-msg" style="margin-top:0">Take a moment to review your day. If something needs a tweak, tell us and we\'ll update this same link.</p>'+
    (done==='changes_requested'?'<div class="jrX-done" style="background:#fbf4ec;color:#7a5a2e">We received your changes and we\'re on it.</div>':'')+
    '<div class="jrX-btns" data-jrx-main><button class="jrX-btn" data-resp="accepted">Looks perfect</button><button class="jrX-btn o" data-ask>Request a change</button></div></section>';
}
async function respond(slug,status,comment,box,isPreview){
  if(isPreview){box.innerHTML='<div class="jrX-done">Preview · the couple would see a confirmation here and you\'d be notified.</div>';return}
  try{
    const r=await fetch(API.replace(/\/wedding_timelines$/,'')+'/rpc/respond_timeline',{method:'POST',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify({p_slug:slug,p_status:status,p_comment:comment||null})});
    if(!r.ok)throw new Error('rpc');
    const msg={accepted:'Thank you! Your timeline is confirmed. Jonhy & Rose have been notified.',changes_requested:'Got it! We received your note and will update your timeline soon.',light_accepted:'Wonderful! We\'ll adjust your timeline and share the update on this same link.',light_discuss:'Of course. We\'ll reach out to talk it through.'}[status];
    box.innerHTML='<div class="jrX-done">'+E(msg)+'</div>';
  }catch(e){
    const body=(status==='accepted'?'Hi Jonhy & Rose! Our timeline looks perfect.':status==='light_accepted'?'Hi Jonhy & Rose! Your light suggestion sounds good to us.':'Hi Jonhy & Rose! About our timeline:')+(comment?'\n\n'+comment:'')+'\n\n'+location.href;
    box.innerHTML='<div class="jrX-done" style="background:#f6f3ee;color:#3a3631">Please send us a quick note so we get it right away:<div class="jrX-btns"><a class="jrX-btn" style="display:flex;align-items:center;justify-content:center;text-decoration:none" href="mailto:'+STUDIO_EMAIL+'?subject='+encodeURIComponent('Our wedding timeline')+'&body='+encodeURIComponent(body)+'">Email Jonhy & Rose</a></div></div>';
  }
}
async function enhanceClient(card,isPreview){
  if(card.dataset.jrx)return;card.dataset.jrx='1';
  let x,slug=null;
  if(isPreview){
    const v=id=>document.getElementById('f_'+id)?.value||'';
    x={couple_name:v('couple_name'),wedding_date:v('wedding_date'),location:v('location'),ceremony:v('ceremony'),
       timeline:Array.from(document.querySelectorAll('#rows .timelineRow')).map(r=>({time:r.querySelector('input')?.value||'',item:r.querySelector('textarea')?.value||''})),
       key_requests:(document.getElementById('requests')?.value||'').split('\n').filter(Boolean),
       __preview:true,client_view:S()?.client_view||{},show_light_message:S()?.show_light_message!==false,studio_note:document.getElementById('jrXStudioNote')?.value||S()?.studio_note||'',light_note:document.getElementById('jrXLightNote')?.value||S()?.light_note||''};
  }else{
    slug=new URLSearchParams(location.search).get('timeline');
    if(!slug){const m=location.pathname.match(/^\/timelines\/([^/]+)/i);if(m){try{slug=(typeof fixedClientRoutes!=='undefined'&&fixedClientRoutes[m[1].toLowerCase()])||null}catch(e){slug=null}}}
    if(!slug)return;
    x=await fetchRow(slug);if(!x)return;
  }
  const url=isPreview?'(client link)':(window.JR_PUBLIC_ORIGIN||location.origin)+location.pathname+location.search;
  const head=card.querySelector('.publicHead');
  if(head&&(clean(x.studio_note)||(isPreview&&hasCol('studio_note'))))head.insertAdjacentHTML('afterend','<section class="publicSection jrX-noteSec"><div class="eyebrow" style="margin-bottom:10px">A note from us</div><p class="jrX-note">'+E(x.studio_note)+'</p><p class="jrX-sign">— Jonhy &amp; Rose</p></section>');
  // light: replace the plain light card with the bar experience
  const L=await withLight(x);
  const oldLight=card.querySelectorAll('.jrPublicLight,.jrPreviewLightSlot');
  const essential=[...card.querySelectorAll('.publicSection')].find(s=>/Essential Information/i.test(s.querySelector('h2')?.textContent||''));
  if(L.reason==='ok'){
    oldLight.forEach(n=>n.remove());
    card.classList.add('jrX-has-light');
    const html='<section class="publicSection jrX-light jrPublicLight"><h2>Your wedding light</h2><p class="jrX-msg" style="margin-top:0">Where your ceremony sits in the light on '+E(x.wedding_date)+'.</p>'+lightBar(L)+clientLightCopy(L,x)+'<div class="muted" style="margin-top:12px;font-size:11px">Planning reference · calculated for your venue. Clouds, buildings and terrain can change the light on the day.</div></section>';
    if(essential)essential.insertAdjacentHTML('beforebegin',html);else card.insertAdjacentHTML('beforeend',html);
  }
  card.insertAdjacentHTML('beforeend',respondBlock(isPreview?null:x)+(isPreview?'':shareBlock(url,x.couple_name)));
  card.addEventListener('click',async e=>{
    const sh=e.target.closest('[data-share]');
    if(sh){e.preventDefault();const data={title:'The Wedding Day · '+(x.couple_name||''),text:'Our wedding day timeline 🤍',url};
      if(navigator.share){try{await navigator.share(data)}catch(_){}}else{try{await navigator.clipboard.writeText(url);toast('Link copied')}catch(_){}}return}
    const cp=e.target.closest('[data-copy]');
    if(cp){e.preventDefault();try{await navigator.clipboard.writeText(cp.dataset.copy);toast('Link copied')}catch(_){prompt('Copy this link:',cp.dataset.copy)}return}
    const ask=e.target.closest('[data-ask]');
    if(ask){const box=ask.closest('.jrX-btns');box.outerHTML='<div data-jrx-ask><textarea class="jrX-ta" placeholder="Tell us what you\'d like to change"></textarea><div class="jrX-btns"><button class="jrX-btn" data-send-change>Send to Jonhy & Rose</button></div></div>';return}
    const sc=e.target.closest('[data-send-change]');
    if(sc){const wrap=sc.closest('[data-jrx-ask]'),txt=wrap.querySelector('textarea').value;if(!clean(txt)){wrap.querySelector('textarea').focus();return}await respond(slug,'changes_requested',txt,wrap,isPreview);return}
    const rb=e.target.closest('[data-resp]');
    if(rb){const box=rb.closest('.jrX-btns');box.innerHTML='<div class="muted" style="padding:10px 0">Sending…</div>';await respond(slug,rb.dataset.resp,'',box,isPreview)}
  });
  if(!isPreview){
    const byKey=k=>({note:card.querySelector('.jrX-noteSec'),light:card.querySelector('.jrX-light'),essential:secBy(card,/Essential Information/i),key_moments:secBy(card,/Key Moments/i),timeline:secBy(card,/Photography Timeline/i)})[k];
    ['note','light','essential','key_moments','timeline'].forEach(k=>{if(isHidden(x,k)){const n=byKey(k);if(n)n.remove()}});
  }
  if(isPreview)setupPreviewEdit(card,x);
  if(!isPreview&&x.couple_name)document.title=x.couple_name+' · The Wedding Day';
}
function secBy(card,re){return [...card.querySelectorAll('.publicSection')].find(s=>re.test(s.querySelector('h2')?.textContent||''))}

/* ---------- preview edit mode: tap to edit, ✕ to hide ---------- */
function hiddenList(){const st=S();if(!st)return [];st.client_view=st.client_view&&typeof st.client_view==='object'?st.client_view:{};if(!Array.isArray(st.client_view.hidden))st.client_view.hidden=[];return st.client_view.hidden}
function setHidden(k,on){const h=hiddenList();const i=h.indexOf(k);if(on&&i<0)h.push(k);if(!on&&i>=0)h.splice(i,1);if(k==='light_message'){const st=S();if(st)st.show_light_message=!on;const cb=document.getElementById('jrXShowLight');if(cb)cb.checked=!on}}
function fire(el){if(!el)return;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))}
function setupPreviewEdit(card,x){
  if(card.dataset.jrxEdit)return;card.dataset.jrxEdit='1';
  const canSave=hasCol('client_view');
  const bar=document.querySelector('.jrDraftOverlay .jrDraftBar');
  if(bar&&!document.querySelector('.jrX-editHint'))bar.insertAdjacentHTML('afterend','<div class="jrX-editHint">Edit mode · tap any text to edit it · ✕ hides it from the couple · changes go to your editor; tap <b>Save Online</b> to publish'+(canSave?'':' · hiding sections saves once the database update is approved')+'</div>');
  const sections={note:card.querySelector('.jrX-noteSec'),light:card.querySelector('.jrX-light'),essential:secBy(card,/Essential Information/i),key_moments:secBy(card,/Key Moments/i),timeline:secBy(card,/Photography Timeline/i)};
  const hidden=hiddenList();
  Object.entries(sections).forEach(([k,sec])=>{if(!sec)return;sec.classList.add('jrX-ed');
    const b=document.createElement('button');b.type='button';b.className='jrX-x';b.setAttribute('aria-label','Hide section');
    const paint=()=>{const off=hiddenList().includes(k);sec.classList.toggle('jrX-off',off);b.textContent=off?'Show':'✕'};
    b.onclick=e=>{e.stopPropagation();setHidden(k,!hiddenList().includes(k));paint()};sec.prepend(b);paint();});
  // light message: its own ✕ and editable text
  const lm=card.querySelector('.jrX-lm');
  if(lm){const w=document.createElement('div');w.className='jrX-ed jrX-lmWrap';lm.replaceWith(w);w.appendChild(lm);
    const b=document.createElement('button');b.type='button';b.className='jrX-x';const paint=()=>{const off=hiddenList().includes('light_message');w.classList.toggle('jrX-off',off);b.textContent=off?'Show':'✕'};
    b.onclick=e=>{e.stopPropagation();setHidden('light_message',!hiddenList().includes('light_message'));paint()};w.prepend(b);paint();
    editable(lm,v=>{const st=S();if(st)st.light_note=v;const t=document.getElementById('jrXLightNote');if(t){t.value=v;fire(t)}});}
  const note=card.querySelector('.jrX-note');
  if(note){if(!clean(note.textContent))note.textContent='Write a personal note…';editable(note,v=>{if(v==='Write a personal note…')return;const st=S();if(st)st.studio_note=v;const t=document.getElementById('jrXStudioNote');if(t){t.value=v;fire(t)}})}
  const h1=card.querySelector('.publicHead h1');if(h1)editable(h1,v=>{const f=document.getElementById('f_couple_name');if(f){f.value=v;fire(f)}});
  // essential info values
  let labelMap={};try{if(typeof labels!=='undefined')Object.entries(labels).forEach(([k,l])=>labelMap[l.toLowerCase()]=k)}catch(e){}
  (sections.essential?.querySelectorAll('.infoItem')||[]).forEach(it=>{const k=labelMap[(it.querySelector('small')?.textContent||'').toLowerCase()];const v=it.querySelector('div');if(k&&v)editable(v,val=>{const f=document.getElementById('f_'+k);if(f){f.value=val;fire(f)}})});
  // key moments: each line maps to a non-empty line of the editor box
  const kmLis=[...(sections.key_moments?.querySelectorAll('li')||[])];
  kmLis.forEach((li,i)=>editable(li,val=>{const ta=document.getElementById('requests');if(!ta)return;const lines=ta.value.split('\n').filter(l=>l.trim());lines[i]=val;ta.value=lines.filter(l=>l.trim()).join('\n');fire(ta)}));
  // timeline rows map 1:1 to editor rows
  const edRows=[...document.querySelectorAll('#rows .timelineRow')];
  [...(sections.timeline?.querySelectorAll('.publicRow')||[])].forEach((r,i)=>{const er=edRows[i];if(!er)return;
    const t=r.querySelector('.publicTime'),it=r.querySelector('.jrEventTitle')||r.querySelector('.publicItem');
    if(t)editable(t,val=>{const inp=er.querySelector('input');if(inp){inp.value=val;fire(inp)}});
    if(it)editable(it,val=>{const ta=er.querySelector('textarea');if(ta){const rest=ta.value.split(/\r?\n/).slice(1);ta.value=[val,...rest].join('\n');fire(ta)}});});
}
function editable(el,onSave){el.contentEditable='true';el.spellcheck=true;el.classList.add('jrX-edit');
  el.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&el.tagName!=='P'){e.preventDefault();el.blur()}});
  el.addEventListener('blur',()=>{const v=clean(el.innerText);onSave(v)});}

/* ---------- editor: light check + notes + Send to couple ---------- */
let editorTimer=null,lastLight=null;
function editorData(){
  const v=id=>document.getElementById('f_'+id)?.value||'';
  return {couple_name:v('couple_name'),wedding_date:v('wedding_date'),location:v('location'),ceremony:v('ceremony'),
    timeline:(S()?.timeline||[]).map(r=>({time:r.time,item:r.item})),
    key_requests:(document.getElementById('requests')?.value||'').split('\n').filter(Boolean)};
}
async function runCheck(){
  const box=document.getElementById('jrXCheck');if(!box)return;
  box.className='wait';box.innerHTML='Revisando la luz…';
  const L=await withLight(editorData());lastLight=L;
  if(L.reason==='missing'){box.innerHTML='<b>Revisión de luz</b><br>Agrega el venue y la fecha para calcular el atardecer.';return}
  if(L.reason==='nolight'){box.innerHTML='<b>Revisión de luz</b><br>No pude calcular el atardecer para este venue. Revisa la dirección.';return}
  if(L.reason==='noceremony'){box.innerHTML='<b>Revisión de luz</b><br>Atardecer '+fmtMin(L.sunset)+'. Agrega la hora de la ceremonia en el timeline para revisar la luz.';return}
  const after=L.firstLook?'familia (15) + retratos al atardecer (10)':'familia (15) + bridal party (15) + pareja (25)';
  const head={ok:'✓ La luz alcanza',tight:'⚠ La luz queda justa',short:'⚠ Falta luz natural'}[L.status];
  box.className=L.status;
  box.innerHTML='<b>'+head+'</b><br>Ceremonia '+fmtMin(L.cerStart)+'–'+fmtMin(L.cerEnd)+' · atardecer '+fmtMin(L.sunset)+' · golden hour desde '+fmtMin(L.golden)+'.<br>Quedan <b>'+Math.max(0,L.left)+' min</b> de luz después de la ceremonia y se necesitan <b>'+L.need+' min</b> para '+after+'.'+
    (L.firstLook?'<br>Con first look: los retratos de pareja y bridal party van antes de la ceremonia.':'')+
    (L.status==='ok'?'<br><span style="color:#3e6149">Se envía la plantilla "Your timeline is ready".</span>':'<br><span style="color:#7a5a2e">La pareja verá una nota sobre su luz con botones para responder. Se sugiere la plantilla "Wedding light".</span>');
}
function scheduleCheck(){clearTimeout(editorTimer);editorTimer=setTimeout(runCheck,700)}
function hasCol(c){const st=S(),a=ALL();return !!(st&&Object.prototype.hasOwnProperty.call(st,c))||!!(a[0]&&Object.prototype.hasOwnProperty.call(a[0],c))}
function setupEditor(){
  const body=document.querySelector('.editorBody');if(!body||body.dataset.jrx)return;body.dataset.jrx='1';
  const h1=body.querySelector('h1');
  const check=document.createElement('div');check.id='jrXCheck';check.className='wait';check.textContent='Revisando la luz…';
  (body.querySelector('.sectionTitle')||h1).insertAdjacentElement('beforebegin',check);
  const tb=document.querySelector('.top .toolbar');
  if(tb&&!tb.querySelector('[data-jrx-send]')){const b=document.createElement('button');b.type='button';b.dataset.jrxSend='1';b.className='primary';b.textContent='Send to couple';b.onclick=openSend;tb.appendChild(b)}
  if(hasCol('studio_note')){
    const kmTitle=[...body.querySelectorAll('.sectionTitle')].find(t=>/Key Moments/i.test(t.textContent));
    const wrap=document.createElement('div');
    wrap.innerHTML='<h3 class="sectionTitle">Note from us</h3><textarea id="jrXStudioNote" class="jrX-ta" placeholder="A personal note the couple sees at the top of their timeline"></textarea><h3 class="sectionTitle">Light note (only if light is tight)</h3><textarea id="jrXLightNote" class="jrX-ta" placeholder="Leave empty to use the automatic explanation"></textarea>';
    (kmTitle||check).insertAdjacentElement('beforebegin',wrap);
    const sn=wrap.querySelector('#jrXStudioNote'),ln=wrap.querySelector('#jrXLightNote');
    sn.value=S()?.studio_note||'';ln.value=S()?.light_note||'';
    sn.oninput=()=>{const st=S();if(st)st.studio_note=sn.value};ln.oninput=()=>{const st=S();if(st)st.light_note=ln.value};
  }
  body.addEventListener('input',scheduleCheck);body.addEventListener('change',scheduleCheck);body.addEventListener('click',e=>{if(e.target.closest('.move,button'))scheduleCheck()});
  if(hasCol('show_light_message')){
    const t=document.createElement('label');t.style.cssText='display:flex;gap:10px;align-items:center;margin:-14px 0 26px;font-size:14px;cursor:pointer';
    t.innerHTML='<input type="checkbox" id="jrXShowLight" style="width:20px;height:20px;accent-color:#191816"> Show the light message to the couple';
    check.insertAdjacentElement('afterend',t);const cb=t.querySelector('input');cb.checked=!isHidden(S(),'light_message');
    cb.onchange=()=>setHidden('light_message',!cb.checked);
  }
  runCheck();
}

/* ---------- Send to couple ---------- */
const firstNames=c=>clean(c).split(/\s*(?:&|and|y|\+)\s*/i).map(s=>s.split(' ')[0]).filter(Boolean).join(' & ')||'there';
function templates(d,L,url){
  const names=firstNames(d.couple_name);
  const ready={subject:'Your wedding day timeline · '+clean(d.couple_name),
    body:'Hi '+names+',\n\nYour wedding day timeline is ready! Everything we planned together lives in one place, and it stays up to date whenever something changes.\n\nTake a look when you have a moment. At the end of the page you can tap "Looks perfect" or let us know if anything needs a tweak. Feel free to share it with your planner, family and wedding party.'+'\n\nWith love,\nJonhy & Rose'};
  ready.lightPara=L&&L.reason==='ok'?'Good news about the light: your ceremony ends at '+fmtMin(L.cerEnd)+' and sunset is at '+fmtMin(L.sunset)+', so we\'ll have beautiful natural light for your photos.':'';
  const left=L&&L.reason==='ok'?Math.max(0,L.left):null;
  const light={subject:'A note about your wedding light · '+clean(d.couple_name),
    body:'Hi '+names+',\n\nWe went through your timeline with a lot of care and wanted to share something important about the light.\n\n'+(left!=null?'Your ceremony is at '+fmtMin(L.cerStart)+' and the sun sets at '+fmtMin(L.sunset)+'. That leaves about '+left+' minutes of natural light after the ceremony, and we need around '+L.need+' minutes for '+(L.firstLook?'your family photos and sunset portraits':'your family, wedding party and couple portraits')+'.':'The time between your ceremony and sunset is very short for all the photos we have planned.')+'\n\nA few options we\'d love you to consider:\n\n• '+(L&&L.firstLook?'Adding a little more time after the ceremony for portraits.':'A first look before the ceremony, so we can do your portraits and wedding party photos in beautiful light.')+'\n• Moving the ceremony a bit earlier, so every photo happens in natural light.\n• Keeping the current plan, knowing that some photos after sunset will use flash.\n\nYou can see your wedding light and reply right from your timeline. We\'re happy to talk it through anytime.\n\nWith love,\nJonhy & Rose'};
  return {ready,light};
}
function emailHTML(d,subjectBody,url){
  const paras=E(subjectBody).split(/\n\n+/).map(p=>p.replace(/\n/g,'<br>'));
  const sign=paras.length&&/^With love/i.test(paras[paras.length-1])?paras.pop():'With love,<br>Jonhy &amp; Rose';
  const font='Helvetica,Arial,sans-serif',serif="'Cormorant Garamond',Georgia,'Times New Roman',serif";
  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede7"><tr><td align="center" style="padding:28px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fbfaf7;border:1px solid #e2ddd3">'+
  '<tr><td align="center" style="padding:40px 30px 10px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" style="width:54px;height:54px;background:#000;color:#fff;font-family:Georgia,serif;font-size:22px">JR</td></tr></table></td></tr>'+
  '<tr><td align="center" style="padding:16px 30px 0;font-family:'+font+';font-size:10px;letter-spacing:4px;color:#8e7d6d">THE WEDDING DAY</td></tr>'+
  '<tr><td align="center" style="padding:12px 30px 6px;font-family:'+serif+';font-size:40px;line-height:44px;font-style:italic;color:#24231f">'+E(d.couple_name)+'</td></tr>'+
  '<tr><td align="center" style="padding:0 30px;font-family:'+font+';font-size:11px;line-height:19px;letter-spacing:2px;color:#72685e">'+E(String(d.wedding_date||'').toUpperCase())+'</td></tr>'+
  '<tr><td align="center" style="padding:24px 0"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="width:44px;height:1px;background:#cfc5b6;font-size:0;line-height:0">&nbsp;</td></tr></table></td></tr>'+
  paras.map(p=>'<tr><td style="padding:0 36px 16px;font-family:'+font+';font-size:15px;line-height:25px;color:#3a3631">'+p+'</td></tr>').join('')+
  '<tr><td align="center" style="padding:12px 30px 30px"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td align="center" style="background:#191816;border-radius:999px"><a href="'+E(url)+'" style="display:inline-block;padding:15px 34px;font-family:'+font+';font-size:12px;letter-spacing:2px;color:#fff;text-decoration:none">VIEW YOUR TIMELINE</a></td></tr></table></td></tr>'+
  '<tr><td align="center" style="padding:0 30px 40px;font-family:'+serif+';font-size:21px;font-style:italic;color:#5a524a">'+sign+'</td></tr>'+
  '<tr><td align="center" style="padding:16px 30px;border-top:1px solid #e8e3db;font-family:'+font+';font-size:10px;letter-spacing:2px;color:#9c8d7b">JONHY &amp; ROSE PHOTOGRAPHY STUDIO · CANCÚN · RIVIERA MAYA</td></tr></table></td></tr></table>';
}
async function openSend(){
  if(typeof sync==='function'){try{sync()}catch(e){}}
  const st=S();if(!st?.id||!st.public_slug){alert('Save Online first, then send it to the couple.');return}
  const url=(window.JR_PUBLIC_ORIGIN||location.origin)+'/?timeline='+st.public_slug;
  const d={couple_name:st.couple_name,wedding_date:st.wedding_date};
  const L=lastLight&&lastLight.reason==='ok'?lastLight:await withLight(editorData());
  const T=templates(d,L,url);let cur=(L&&L.reason==='ok'&&L.status!=='ok')?'light':'ready';
  const m=document.createElement('div');m.className='jrX-modal';
  m.innerHTML='<div class="jrX-sheet"><div class="eyebrow">Send to couple</div><h3>'+E(d.couple_name||'Timeline')+'</h3>'+
    '<div class="jrX-tabs"><button data-t="ready">Timeline ready</button><button data-t="light">Wedding light</button></div>'+
    '<div id="jrXHint" class="muted" style="font-size:12.5px"></div>'+
    '<label id="jrXLightWrap" style="display:flex;gap:10px;align-items:center;text-transform:none;letter-spacing:0;font-size:14px;color:#191816;font-weight:500;cursor:pointer"><input type="checkbox" id="jrXLightPara" checked style="width:20px;height:20px;accent-color:#191816"> Include the light message</label>'+
    '<label>Subject</label><input id="jrXSubj"><label>Message</label><textarea id="jrXBody" rows="14"></textarea>'+
    '<div class="muted" style="font-size:12px;margin-top:8px">The link to their timeline goes on the "View your timeline" button: '+E(url)+'</div>'+
    '<div class="jrX-share" style="margin-top:16px"><button class="main" data-x="email">Copy email with design</button><a data-x="wa" target="_blank" rel="noopener" href="#">WhatsApp</a><a data-x="mail" href="#">Open in Mail</a><button data-x="text">Copy text</button><button data-x="close">Close</button></div></div>';
  document.body.appendChild(m);
  const subj=m.querySelector('#jrXSubj'),bod=m.querySelector('#jrXBody'),hint=m.querySelector('#jrXHint');
  const lp=m.querySelector('#jrXLightPara'),lw=m.querySelector('#jrXLightWrap');
  const withPara=(body,on)=>{const p=T.ready.lightPara;if(!p)return body;const clean2=body.replace('\n\n'+p,'');return on?clean2.replace(/\n\nWith love,/,'\n\n'+p+'\n\nWith love,'):clean2};
  lp.onchange=()=>{if(cur==='ready'){bod.value=withPara(bod.value,lp.checked);upd()}};
  const setT=t=>{cur=t;subj.value=T[t].subject;bod.value=t==='ready'?withPara(T.ready.body,lp.checked):T[t].body;lw.style.display=(t==='ready'&&T.ready.lightPara)?'flex':'none';m.querySelectorAll('.jrX-tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
    hint.textContent=t==='light'?'Para cuando hay un tema con el sol. Edita lo que quieras antes de enviar.':(L&&L.status&&L.status!=='ok'?'Ojo: la revisión de luz marca que falta luz. Considera la plantilla "Wedding light".':'La luz alcanza: esta es la plantilla recomendada.');upd()};
  const upd=()=>{const plain=bod.value+'\n\n'+url;m.querySelector('[data-x="wa"]').href='https://wa.me/?text='+encodeURIComponent(plain);m.querySelector('[data-x="mail"]').href='mailto:?subject='+encodeURIComponent(subj.value)+'&body='+encodeURIComponent(plain)};
  subj.oninput=upd;bod.oninput=upd;
  m.querySelectorAll('.jrX-tabs button').forEach(b=>b.onclick=()=>setT(b.dataset.t));
  m.addEventListener('click',async e=>{
    if(e.target===m){m.remove();return}
    const a=e.target.closest('[data-x]');if(!a)return;const k=a.dataset.x;
    if(k==='close'){m.remove();return}
    if(k==='text'){e.preventDefault();try{await navigator.clipboard.writeText(bod.value+'\n\n'+url);toast('Message copied')}catch(_){prompt('Copy:',bod.value+'\n\n'+url)}return}
    if(k==='email'){e.preventDefault();const html=emailHTML(d,bod.value,url),plain=bod.value+'\n\n'+url;
      try{if(window.ClipboardItem&&navigator.clipboard?.write){await navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([plain],{type:'text/plain'})})]);toast('Email copied · paste it in Gmail')}
          else{await navigator.clipboard.writeText(plain);toast('Text copied (design not supported here)')}}catch(_){prompt('Copy:',plain)}
      return}
  });
  setT(cur);
}

/* ---------- dashboard: response status ---------- */
function decorateDashboard(){
  const A=ALL();if(!A.length)return;
  document.querySelectorAll('.wedding').forEach(card=>{
    if(card.dataset.jrx)return;const btn=card.querySelector('[onclick^="openTimeline"]');if(!btn)return;
    const id=(btn.getAttribute('onclick').match(/'([^']+)'/)||[])[1];const x=A.find(t=>t.id===id);if(!x)return;card.dataset.jrx='1';
    const map={accepted:['ok','Accepted ✓'],changes_requested:['warn','Changes requested'],light_accepted:['ok','Light plan ✓'],light_discuss:['warn','Wants to talk']};
    let s=map[x.client_status];if(!s)return;
    if(x.client_responded_at&&x.updated_at&&new Date(x.updated_at)-new Date(x.client_responded_at)>60000)s=['warn',x.client_status==='accepted'?'Updated since accepted':'Updated since reply'];
    const c=card.querySelector('.couple');if(c)c.insertAdjacentHTML('beforeend','<span class="jrX-pill '+s[0]+'" title="'+E(x.client_comment||'')+'">'+s[1]+'</span>');
  });
}

/* ---------- save(): include notes only when the columns exist ---------- */
if(typeof save==='function'&&!window.__jrxSave){
  window.__jrxSave=true;const orig=save;
  window.save=async function(){
    const st=S();if(hasCol('studio_note')&&st){
      const origFetch=window.fetch;
      window.fetch=function(u,o){if(typeof u==='string'&&u.indexOf(API)===0&&o&&(o.method==='POST'||o.method==='PATCH')&&o.body){try{const b=JSON.parse(o.body);b.studio_note=st.studio_note||null;b.light_note=st.light_note||null;if(hasCol('show_light_message'))b.show_light_message=st.show_light_message!==false;if(hasCol('client_view'))b.client_view=st.client_view||{};o={...o,body:JSON.stringify(b)}}catch(e){}}return origFetch.call(this,u,o)};
      try{return await orig.apply(this,arguments)}finally{window.fetch=origFetch}
    }
    return orig.apply(this,arguments);
  };
}

/* ---------- observer ---------- */
let busy=false;
new MutationObserver(()=>{if(busy)return;busy=true;queueMicrotask(()=>{busy=false;
  setupEditor();decorateDashboard();
  const draft=document.querySelector('.jrDraftOverlay .publicCard');if(draft)enhanceClient(draft,true);
  const pub=document.querySelector('#app .public .publicCard');if(pub&&pub.querySelector('.publicHead')&&!document.querySelector('.jrDraftOverlay'))enhanceClient(pub,false);
})}).observe(document.documentElement,{childList:true,subtree:true});
window.JRClientExperience={analyze,withLight,toMin,fmtMin};
})();
