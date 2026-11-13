/* Draft-only client preview and optional per-event comments; preview branch only. */
(function(){
'use strict';
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function editorNotes(){
 document.querySelectorAll('#rows .timelineRow').forEach((row,i)=>{
  if(row.dataset.jrNotesReady)return;
  const activity=row.querySelector('textarea');if(!activity)return;
  row.dataset.jrNotesReady='1';
  const lines=activity.value.split(/\r?\n/);activity.value=lines.shift()||'';
  activity.rows=2;activity.placeholder='Activity / Photo moment';
  activity.setAttribute('aria-label','Photo activity');
  const notes=document.createElement('textarea');notes.className='jrEventNotes';notes.rows=3;
  notes.placeholder='Optional notes for your clients (one detail per line)';
  notes.setAttribute('aria-label','Optional photo activity notes');
  notes.value=lines.join('\n');
  activity.insertAdjacentElement('afterend',notes);
  const update=()=>{
    if(!window.state?.timeline?.[i])return;
    window.state.timeline[i].item=activity.value.trim()+(notes.value.trim()?'\n'+notes.value.trim():'');
  };
  // state is lexical in the original app; update through the existing inline onchange
  const updateNative=()=>{const text=activity.value.trim()+(notes.value.trim()?'\n'+notes.value.trim():'');activity.value=text;activity.dispatchEvent(new Event('change'));activity.value=text.split(/\r?\n/)[0];};
  notes.addEventListener('change',updateNative);
  activity.addEventListener('change',()=>{if(notes.value.trim()){const combined=activity.value.trim()+'\n'+notes.value.trim();activity.value=combined;activity.dispatchEvent(new Event('input'));activity.value=combined.split(/\r?\n/)[0];}});
 });
}
window.JRPreviewDraft=function(){
 const fields=['couple_name','wedding_date','location','coverage','guests','coordinator','videographer','ceremony','cocktail','reception','wedding_party'];
 const labels={coverage:'Photography Coverage',guests:'Estimated Guests',coordinator:'Coordinator',videographer:'Videographer',ceremony:'Ceremony',cocktail:'Cocktail Hour',reception:'Reception',wedding_party:'Wedding Party'};
 const value=id=>document.getElementById('f_'+id)?.value||'';
 const rows=Array.from(document.querySelectorAll('#rows .timelineRow')).map(row=>({
   time:row.querySelector('input')?.value||'',
   item:(row.querySelector('textarea')?.value||'').split(/\r?\n/)[0],
   notes:row.querySelector('.jrEventNotes')?.value||''
 }));
 const requests=(document.getElementById('requests')?.value||'').split('\n').filter(Boolean);
 const info=fields.slice(3).filter(k=>value(k)).map(k=>'<div class="infoItem"><small>'+escapeHTML(labels[k])+'</small><div>'+escapeHTML(value(k))+'</div></div>').join('');
 const entries=rows.map(r=>'<div class="publicRow"><div class="publicTime">'+escapeHTML(r.time)+'</div><div class="publicItem"><strong class="jrEventTitle">'+escapeHTML(r.item)+'</strong>'+(r.notes?'<span class="jrEventDetails">'+r.notes.split(/\r?\n/).filter(Boolean).map(n=>'<span>'+escapeHTML(n)+'</span>').join('')+'</span>':'')+'</div></div>').join('');
 const modal=document.createElement('div');modal.className='jrDraftOverlay';modal.innerHTML='<div class="jrDraftBar"><strong>CLIENT PREVIEW · NOT PUBLISHED</strong><button type="button" class="jrDraftClose">Close Preview</button></div><div class="public"><div class="publicCard"><div class="publicHead"><div class="eyebrow">Jonhy & Rose Photography Studio</div><h1>'+escapeHTML(value('couple_name')||'Wedding Couple')+'</h1><div class="meta">'+escapeHTML(value('wedding_date'))+'<br>'+escapeHTML(value('location'))+'</div></div><section class="publicSection"><h2>Essential Information</h2><div class="infoGrid">'+info+'</div></section>'+(requests.length?'<section class="publicSection"><h2>Key Photo Requests</h2><div class="infoGrid">'+requests.map(q=>'<div class="infoItem"><div>'+escapeHTML(q)+'</div></div>').join('')+'</div></section>':'')+'<section class="publicSection"><h2>Wedding Photography Timeline</h2>'+entries+'</section></div></div>';
 document.body.appendChild(modal);document.body.style.overflow='hidden';
 const close=()=>{modal.remove();document.body.style.overflow=''};
 modal.querySelector('.jrDraftClose').addEventListener('click',close);
 modal.addEventListener('click',e=>{if(e.target===modal)close()});
};
let pending=false;
const mo=new MutationObserver(()=>{if(pending)return;pending=true;queueMicrotask(()=>{pending=false;editorNotes()})});
function start(){editorNotes();mo.observe(document.getElementById('app')||document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
