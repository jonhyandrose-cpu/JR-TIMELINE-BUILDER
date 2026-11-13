/* Presentation-only helpers and opt-in getting-ready expansion. */
(function(){
  const bride=['Room ready','Hair and makeup completed','All items together','Pajama moments first','Champagne toast','Candid getting ready moments','Dress on','Final touches','Bride portraits'];
  const groom=['Room ready','White shirt, pants and socks','All items gathered together','Getting ready moments','Tequila shots','Groom portraits'];
  const safe=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.JRFormatPublicItem=function(value){
    const lines=String(value||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
    if(!lines.length)return '';
    return '<strong class="jrEventTitle">'+safe(lines[0])+'</strong>'+
      (lines.length>1?'<span class="jrEventDetails">'+lines.slice(1).map(s=>'<span>'+safe(s)+'</span>').join('')+'</span>':'');
  };
  window.JRForceGettingReady=function(index,currentState,type){
    const row=currentState?.timeline?.[index];if(!row||!['bride','groom'].includes(type))return false;
    const title=String(row.item||'').split(/\r?\n/)[0].trim();
    if(!/^getting\s*ready/i.test(title))return false;
    if(String(row.item||'').includes('\n'))return false;
    row.item=title+'\n'+(type==='bride'?bride:groom).join('\n');
    return true;
  };
  window.JRExpandGettingReady=function(index,currentState){
    const row=currentState?.timeline?.[index];if(!row)return false;
    const value=String(row.item||'').trim();
    const firstLine=value.split(/\r?\n/)[0].trim();
    if(!/^getting\s*ready\s*[-–—:]\s*.+/i.test(firstLine))return false;
    if(value.includes('\n'))return false;
    const label=firstLine.replace(/^getting\s*ready\s*[-–—:]\s*/i,'').trim();
    const names=String(document.getElementById('f_couple_name')?.value||currentState.couple_name||'').split(/\s+(?:&|and|y|\+)\s+/i).map(x=>x.trim().split(/\s+/)[0]?.toLowerCase());
    const n=label.toLowerCase();
    let type=/\b(bride|novia)\b/i.test(label)?'bride':/\b(groom|novio)\b/i.test(label)?'groom':null;
    if(!type&&names[0]===n)type='bride';
    if(!type&&names[1]===n)type='groom';
    if(!type)return false;
    row.item=firstLine+'\n'+(type==='bride'?bride:groom).join('\n');
    return true;
  };
  window.JRAutoGettingReady=function(input,index,currentState){
    if(!currentState?.timeline?.[index])return;
    currentState.timeline[index].item=input.value;
    if(window.JRExpandGettingReady(index,currentState))input.value=currentState.timeline[index].item;
    input.rows=Math.min(12,Math.max(2,input.value.split('\n').length));
  };
})();
