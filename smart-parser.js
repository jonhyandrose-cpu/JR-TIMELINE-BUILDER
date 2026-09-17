// JR Smart Questionnaire Parser v2
(function(){
  const clean=s=>String(s||'').replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ').trim();
  const timeRe=/(?:^|\b)(1[0-2]|0?[1-9])(?:[:.]([0-5]\d))?\s*(a\.?m\.?|p\.?m\.?)\b/i;
  const eventWords=/(getting ready|details?|dress|makeup|hair|first look|couple|bride|groom|wedding party|bridesmaid|groomsmen|family|ceremony|cocktail|reception|entrance|grand entrance|first dance|father.?daughter|mother.?son|speeches?|toast|dinner|cake|money dance|hora|fireworks|golden hour|sunset|photo|coverage|service ends?)/i;
  function valueAfter(lines,labels){
    for(let i=0;i<lines.length;i++) for(const label of labels){
      const re=new RegExp('^\\s*(?:'+label+')\\s*(?:[:\\-–—]|\\?)?\\s*(.*)$','i');
      const m=lines[i].match(re); if(!m) continue;
      if(clean(m[1])) return clean(m[1]);
      for(let j=i+1;j<Math.min(lines.length,i+4);j++){const v=clean(lines[j]);if(v&&!labels.some(x=>new RegExp('^'+x,'i').test(v)))return v;}
    } return '';
  }
  function normalizeTime(s){const m=s.match(timeRe);if(!m)return'';return `${m[1]}:${m[2]||'00'} ${m[3].replace(/\./g,'').toUpperCase()}`;}
  function extractTimeline(lines){
    const out=[], seen=new Set();
    for(let i=0;i<lines.length;i++){
      const line=clean(lines[i]); const tm=line.match(timeRe); if(!tm) continue;
      let context=line;
      if(context.replace(timeRe,'').trim().length<4 && lines[i+1]) context+=' '+clean(lines[i+1]);
      if(!eventWords.test(context)){
        let nearby=''; for(let j=i-1;j<=i+2;j++) if(j>=0&&j<lines.length) nearby+=' '+clean(lines[j]);
        if(!eventWords.test(nearby))continue; context=nearby;
      }
      const time=normalizeTime(tm[0]);
      let item=clean(context.replace(timeRe,'').replace(/^\s*[-–—:|]+|[-–—:|]+\s*$/g,''));
      item=item.replace(/^(time|start time|what time)\s*[:?\-]*/i,'');
      if(item.length<3||item.length>180) continue;
      const key=time+'|'+item.toLowerCase(); if(!seen.has(key)){seen.add(key);out.push({time,item});}
    }
    return out;
  }
  function parse(text){
    const lines=String(text||'').split(/\n+/).map(clean).filter(Boolean);
    const joined=lines.join('\n');
    const data={};
    data.couple_name=valueAfter(lines,['coule names?','couple names?','bride\s*(?:name)?\s*(?:&|and)\s*groom\s*(?:name)?','names?']);
    if(!data.couple_name){const bride=valueAfter(lines,['bride(?:\'s)? name','bride']);const groom=valueAfter(lines,['groom(?:\'s)? name','groom']);if(bride&&groom)data.couple_name=bride+' & '+groom;}
    data.wedding_date=valueAfter(lines,['wedding date','event date','date of wedding']);
    data.location=valueAfter(lines,['wedding location','hotel\s*\/\s*resort','venue','location']);
    data.coverage=valueAfter(lines,['package contracted','contracted package','photography package','photo package','package','coverage']);
    data.guests=valueAfter(lines,['number of guests','estimated guests','guest count','guests']);
    data.coordinator=valueAfter(lines,['wedding coordinator','coordinator','wedding planner','planner']);
    data.videographer=valueAfter(lines,['videographer','videography company','video company']);
    data.ceremony=valueAfter(lines,['ceremony location','ceremony venue','ceremony']);
    data.cocktail=valueAfter(lines,['cocktail hour location','cocktail location','cocktail hour','cocktail']);
    data.reception=valueAfter(lines,['reception location','reception venue','reception']);
    data.wedding_party=valueAfter(lines,['wedding party','bridal party']);
    data.timeline=extractTimeline(lines);
    // If questionnaire gives explicit ceremony/cocktail/reception times, add them when absent.
    [['ceremony','Ceremony'],['cocktail','Cocktail Hour'],['reception','Reception Begins']].forEach(([k,label])=>{const v=data[k]||'';const m=v.match(timeRe);if(m&&!data.timeline.some(x=>x.item.toLowerCase().includes(label.split(' ')[0].toLowerCase())))data.timeline.push({time:normalizeTime(m[0]),item:label});});
    return data;
  }
  window.JRSmartParser={parse};
  window.readPdf=async function(e){
    const f=e.target.files[0]; if(!f)return; const st=document.getElementById('importStatus');st.textContent='Reading '+f.name+'…';
    try{
      if(!window.pdfjsLib)throw Error('PDF reader unavailable');
      pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const doc=await pdfjsLib.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise; const pages=[];
      for(let n=1;n<=doc.numPages;n++){
        const pg=await doc.getPage(n),tc=await pg.getTextContent();
        const rows={}; tc.items.forEach(it=>{const y=Math.round(it.transform[5]/3)*3;(rows[y]??=[]).push(it)});
        const page=Object.keys(rows).map(Number).sort((a,b)=>b-a).map(y=>rows[y].sort((a,b)=>a.transform[4]-b.transform[4]).map(i=>i.str).join(' ')).join('\n');pages.push(page);
      }
      const text=pages.join('\n'); document.getElementById('importText').value=text;
      const d=parse(text); const found=Object.entries(d).filter(([k,v])=>k!=='timeline'&&v).length;
      st.textContent=`PDF read successfully · ${found} essential fields · ${d.timeline.length} timed events detected. Click Generate timeline draft.`;
    }catch(err){console.error(err);st.textContent='Could not read this PDF automatically. If it is a scanned image PDF, paste the questionnaire text below.';}
  };
  window.generateDraft=function(){
    const box=document.getElementById('importText'), text=box&&box.value;if(!text||!text.trim()){alert('Upload a PDF or paste questionnaire text first.');return;}
    if(typeof sync==='function')try{sync()}catch(e){}
    const d=parse(text); Object.keys(d).forEach(k=>{if(k!=='timeline'&&d[k])state[k]=d[k]});
    if(d.timeline.length)state.timeline=d.timeline;
    else if(!state.timeline.length)state.timeline=[{time:'',item:'Details Shots / Getting Ready Coverage Begins'},{time:'',item:'First Look / Couple Portraits'},{time:'',item:'Wedding Party Photos'},{time:'',item:'Family Photos'},{time:'',item:'Ceremony'},{time:'',item:'Cocktail Hour / Guest Candids'},{time:'',item:'Golden Hour Couple Photos'},{time:'',item:'Reception Begins'},{time:'',item:'Photography Service Ends'}];
    editor();
    setTimeout(()=>{const s=document.getElementById('status');if(s)s.textContent='DRAFT GENERATED · Review extracted information and times before Save Online.'},0);
  };
})();