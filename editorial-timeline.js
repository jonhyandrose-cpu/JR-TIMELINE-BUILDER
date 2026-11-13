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
  window.JRAutoGettingReady=function(input,index,currentState){
    const value=String(input.value||'').trim();
    if(!/^getting\s*ready\s*[-–—:]\s*.+/i.test(value)||value.includes('\n'))return;
    const label=value.replace(/^getting\s*ready\s*[-–—:]\s*/i,'').trim();
    const couple=String(currentState?.couple_name||'').split(/\s+(?:&|and|y|\+)\s+/i).map(x=>x.trim());
    const first=couple[0]?.split(/\s+/)[0]?.toLowerCase();
    const second=couple[1]?.split(/\s+/)[0]?.toLowerCase();
    const name=label.toLowerCase();
    let type=null;
    if(/\b(bride|novia)\b/i.test(label))type='bride';
    else if(/\b(groom|novio)\b/i.test(label))type='groom';
    else if(first&&name===first)type='bride';
    else if(second&&name===second)type='groom';
    if(!type)return;
    const expanded=value+'\n'+(type==='bride'?bride:groom).join('\n');
    input.value=expanded;
    if(currentState?.timeline?.[index])currentState.timeline[index].item=expanded;
    input.rows=Math.min(12,expanded.split('\n').length);
  };
})();
