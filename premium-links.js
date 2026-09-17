// JR Premium Client Links + automatic wedding status
(function(){
 const clean=s=>String(s||'').trim();
 const slugify=s=>clean(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const prettyPath=x=>'/timeline/'+slugify(x?.couple_name||'wedding');
 function parseDate(s){s=clean(s).replace(/(\d)(st|nd|rd|th)\b/gi,'$1');let d=new Date(s);if(!isNaN(d))return d;const m=s.match(/^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})$/i);if(m){const months=['january','february','march','april','may','june','july','august','september','october','november','december'];return new Date(+m[3],months.indexOf(m[1].toLowerCase()),+m[2],12)}return null}
 function statusFor(x){const d=parseDate(x?.wedding_date);if(!d)return{label:'DATE TBD',kind:'tbd',sub:''};const n=new Date(),today=new Date(n.getFullYear(),n.getMonth(),n.getDate()),day=new Date(d.getFullYear(),d.getMonth(),d.getDate());if(today>day)return{label:'WEDDING COMPLETED',kind:'done',sub:'Timeline successfully completed · '+clean(x.wedding_date)};if(+today===+day)return{label:'LIVE · WEDDING DAY',kind:'today',sub:'Today’s live wedding timeline'};return{label:'UPCOMING',kind:'upcoming',sub:'Wedding timeline · '+clean(x.wedding_date)}}
 function findWedding(slug){return (window.state&&state.public_slug===slug&&state.couple_name)?state:(window.all||[]).find(v=>v.public_slug===slug)}
 function premiumClientLink(slug){const x=findWedding(slug);if(x?.couple_name){const u=location.origin+prettyPath(x);navigator.clipboard?.writeText(u);prompt('Client link (copied):',u);return}const u=location.origin+'/?timeline='+slug;navigator.clipboard?.writeText(u);prompt('Client link (copied):',u)}
 const basePublic=window.publicView;
 async function premiumPublicView(slug){await basePublic(slug);try{const r=await fetch(API+'?public_slug=eq.'+encodeURIComponent(slug)+'&select=*',{headers:headers()}),d=await r.json(),x=d[0];if(!x)return;const s=statusFor(x),badge=document.querySelector('.live');if(badge){badge.innerHTML='<span class="dot"></span> '+s.label;if(s.kind==='done'){badge.style.background='#f5f1ea';badge.style.borderColor='#d8cfc2';badge.style.color='#6f6255';const dot=badge.querySelector('.dot');if(dot){dot.style.background='#9a8068';dot.style.boxShadow='0 0 0 4px #eee8df'}}if(s.sub&&!document.getElementById('jrStatusSub')){const p=document.createElement('div');p.id='jrStatusSub';p.className='muted';p.style.cssText='font-size:11px;letter-spacing:.06em;margin-top:10px';p.textContent=s.sub;badge.insertAdjacentElement('afterend',p)}}const foot=document.querySelector('.footer');if(foot)foot.innerHTML=foot.innerHTML.replace(/^LIVE TIMELINE/i,s.kind==='done'?'WEDDING COMPLETED':s.kind==='today'?'LIVE · WEDDING DAY':'UPCOMING TIMELINE')}catch(e){console.error(e)}}
 async function resolvePretty(){const m=location.pathname.match(/^\/timeline\/([^/]+)\/?$/i);if(!m)return;const wanted=m[1];try{const r=await fetch(API+'?select=*',{headers:headers()}),rows=await r.json(),x=(rows||[]).find(v=>slugify(v.couple_name)===wanted);if(x?.public_slug){await premiumPublicView(x.public_slug);return}}catch(e){console.error(e)}document.getElementById('app').innerHTML='<div class="public"><div class="publicCard"><h2>Timeline not found.</h2></div></div>'}
 function decorateDashboard(){
   const rows=[...document.querySelectorAll('.wedding')];
   rows.forEach(row=>{
     const name=clean(row.querySelector('.couple')?.childNodes[0]?.textContent||row.querySelector('.couple')?.textContent);
     const dateText=clean(row.querySelector('.datebox')?.childNodes[0]?.textContent);
     const x=(window.all||[]).find(v=>clean(v.couple_name)===name && clean(niceDate(v.wedding_date).split(',')[0])===dateText) || (window.all||[]).find(v=>clean(v.couple_name)===name);
     if(!x)return;
     const s=statusFor(x), couple=row.querySelector('.couple');
     let tag=row.querySelector('.jrWeddingStatus');
     if(!tag&&couple){tag=document.createElement('div');tag.className='jrWeddingStatus';couple.appendChild(tag)}
     if(tag){tag.textContent=s.label;tag.style.cssText='font-family:Inter,-apple-system,sans-serif;font-size:9px;letter-spacing:.12em;font-weight:800;margin-top:7px;color:'+(s.kind==='done'?'#8a7460':s.kind==='today'?'#2e8b57':'#9a8068')}
   });
 }
 const baseDashboard=window.dashboard;
 async function premiumDashboard(){await baseDashboard();setTimeout(decorateDashboard,0)}
 function watchDashboard(){const app=document.getElementById('app');if(!app)return;new MutationObserver(()=>{if(document.querySelector('.wedding'))decorateDashboard()}).observe(app,{childList:true,subtree:true})}
 function install(){window.clientLink=premiumClientLink;window.publicView=premiumPublicView;window.dashboard=premiumDashboard;window.JRPremiumLinks={slugify,prettyPath,statusFor,decorateDashboard};watchDashboard();if(location.pathname.match(/^\/timeline\//i))resolvePretty();else if(!new URLSearchParams(location.search).get('timeline'))setTimeout(decorateDashboard,250)}
 if(document.readyState==='complete')install();else window.addEventListener('load',install,{once:true});
})();