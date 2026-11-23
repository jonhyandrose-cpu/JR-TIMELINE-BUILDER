/* JR editorial preview v2 — additive UI enhancement, no routing, fetching or persistence changes. */
(function(){
'use strict';
const bride=['Room ready','Hair and makeup completed','All items together','Pajama moments first','Champagne toast','Candid getting ready moments','Dress on','Final touches','Bride portraits'];
const groom=['Room ready','White shirt, pants and socks','All items gathered together','Getting ready moments','Tequila shots','Groom portraits'];
function template(type){return type==='bride'?bride:groom}
function inferType(input){
 const label=input.value.split(/\r?\n/)[0].replace(/^getting\s*ready\s*[-–—:]?\s*/i,'').replace(/\s*(prep|getting ready)$/i,'').trim();
 if(/\b(bride|novia)\b/i.test(label))return 'bride';
 if(/\b(groom|novio)\b/i.test(label))return 'groom';
 const names=(document.getElementById('f_couple_name')?.value||'').split(/\s+(?:&|and|y|\+)\s+/i).map(s=>s.trim().split(/\s+/)[0]?.toLowerCase());
 const first=label.toLowerCase().split(/\s+/)[0];if(names[0]&&first===names[0])return 'bride';
 if(names[1]&&first===names[1])return 'groom';
 return null;
}
function fillNotes(title){
 const row=title.closest('.timelineRow');const notes=row&&row.querySelector('.jrEventNotes');if(!notes||notes.value.trim())return false;
 const t=title.value.split(/\r?\n/)[0].trim();if(!/getting\s*ready|\bprep\b|arreglo/i.test(t))return false;
 const type=inferType(title);if(!type)return false;
 notes.value=template(type).join('\n');notes.dispatchEvent(new Event('change'));notes.dispatchEvent(new Event('input',{bubbles:true}));return true;
}
document.addEventListener('change',function(e){
 if(!e.isTrusted)return;const input=e.target;
 if(!input.matches?.('#rows .timelineRow > textarea:not(.jrEventNotes)'))return;
 setTimeout(()=>fillNotes(input),0);
});
let fillTimer=null;
document.addEventListener('input',function(e){
 const input=e.target;if(!input.matches?.('#rows .timelineRow > textarea:not(.jrEventNotes)'))return;
 clearTimeout(fillTimer);fillTimer=setTimeout(()=>fillNotes(input),700);
});
function decorate(){
 document.querySelectorAll('#rows .timelineRow').forEach(row=>{
  const n=row.querySelector('.jrEventNotes');if(n&&!n.dataset.jrPh){n.dataset.jrPh='1';n.placeholder='+ Add details for the couple';n.rows=1}
 });
 document.querySelectorAll('.publicSection .publicRow .publicItem').forEach(item=>{
  if(item.dataset.jrFormatted)return;
  item.dataset.jrFormatted='1';
  const lines=item.textContent.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  if(!lines.length)return;
  item.replaceChildren();
  const title=document.createElement('strong');title.className='jrEventTitle';title.textContent=lines[0];item.appendChild(title);
  if(lines.length>1){const details=document.createElement('span');details.className='jrEventDetails';for(const line of lines.slice(1)){const span=document.createElement('span');span.textContent=line;details.appendChild(span)}item.appendChild(details)}
 });
}
let scheduled=false;
const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;decorate()})});
function start(){decorate();observer.observe(document.getElementById('app')||document.body,{subtree:true,childList:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
