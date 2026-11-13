/* JR editorial preview v2 — additive UI enhancement, no routing, fetching or persistence changes. */
(function(){
'use strict';
const bride=['Room ready','Hair and makeup completed','All items together','Pajama moments first','Champagne toast','Candid getting ready moments','Dress on','Final touches','Bride portraits'];
const groom=['Room ready','White shirt, pants and socks','All items gathered together','Getting ready moments','Tequila shots','Groom portraits'];
function template(type){return type==='bride'?bride:groom}
function inferType(input){
 const label=input.value.split(/\r?\n/)[0].replace(/^getting\s*ready\s*[-–—:]\s*/i,'').trim();
 if(/\b(bride|novia)\b/i.test(label))return 'bride';
 if(/\b(groom|novio)\b/i.test(label))return 'groom';
 const names=(document.getElementById('f_couple_name')?.value||'').split(/\s+(?:&|and|y|\+)\s+/i).map(s=>s.trim().split(/\s+/)[0]?.toLowerCase());
 if(names[0]&&label.toLowerCase()===names[0])return 'bride';
 if(names[1]&&label.toLowerCase()===names[1])return 'groom';
 return null;
}
function expand(input,type){
 const text=input.value.trim(), title=text.split(/\r?\n/)[0];
 if(!/^getting\s*ready\b/i.test(title)||text.includes('\n'))return;
 input.value=title+'\n'+template(type).join('\n');
 input.dispatchEvent(new Event('change',{bubbles:true}));
}
document.addEventListener('change',function(e){
 const input=e.target;
 if(!input.matches?.('#rows .timelineRow textarea'))return;
 const type=inferType(input);if(type)expand(input,type);
});
document.addEventListener('click',function(e){
 const btn=e.target.closest?.('[data-jr-prep]');if(!btn)return;
 const input=btn.closest('.timelineRow')?.querySelector('textarea');
 if(input)expand(input,btn.dataset.jrPrep);
});
function decorate(){
 document.querySelectorAll('#rows .timelineRow').forEach(row=>{
  if(row.querySelector('[data-jr-prep]'))return;
  const controls=row.querySelector('.move');
  if(!controls)return;
  for(const [type,label] of [['bride','Bride prep'],['groom','Groom prep']]){
   const b=document.createElement('button');b.type='button';b.dataset.jrPrep=type;b.textContent=label;b.title='Add standard '+type+' preparation details';controls.prepend(b);
  }
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
