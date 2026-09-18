// JR Smart Questionnaire Parser v3 — Jonhy & Rose wedding logic
(function(){
  const clean=s=>String(s||'').replace(/\u00a0/g,' ').replace(/[ \t]+/g,' ').trim();
  const timeRe=/(1[0-2]|0?[1-9])(?:[:.]([0-5]\d))?\s*(a\.?m\.?|p\.?m\.?)/i;
  const qStarts=/^(Bride's full name|How does the bride|Groom's full name|How does the groom|Would you like photos|Would you like a MAGAZINE|Will you want a first look|Will you want a dad|Will you want a bridesmaids|Are you both writing personal vows|For the family portraits|Are there any family situations|If there is a situation|Is there a specific photo|Are there any specific photos|Will there be other photographers|Do you have videography|Confirm the wedding package|If you select \*custom|Do you have any additional|Other extra service|Bride's phone|Another phone|Name and best way to contact your wedding coordinator|Wedding date|Location of event|Ceremony type|If you select "Other"|Estimated guests|How many bridesmaids|Bride's getting ready|Groom's getting ready|Place and time of the ceremony|What is the most important part of the ceremony|How long do you expect the ceremony|Will the ceremony be outdoors|Place and time of the cocktail|Is there any special setup for the cocktail|Place and time of the reception|Will there be pyrotechnics|Do you have any specific events|We love getting to know)/i;
  const instruction=/^(Enter your answer|Essential information|Extra photographer|Extra hour|Welcome party|Drone|Other|THE FIRST LOOK|A MAGAZINE|LET US KNOW)/i;
  function answerAfter(lines,label){
    const re=label instanceof RegExp?label:new RegExp('^'+label,'i');
    for(let i=0;i<lines.length;i++) if(re.test(lines[i])){
      const a=[];
      for(let j=i+1;j<lines.length&&j<i+8;j++){
        const v=clean(lines[j]); if(!v)continue;
        if(qStarts.test(v))break;
        if(instruction.test(v)&&!a.length)continue;
        if(instruction.test(v))break;
        a.push(v);
      }
      return clean(a.join(' '));
    }
    return '';
  }
  function shortName(full,fallback){const x=clean(full);if(!x)return fallback||'';return x.split(/\s+/)[0];}
  function extractTime(s){const str=String(s||'');let m=str.match(timeRe);if(m){let h=+m[1],min=+(m[2]||0),ap=m[3].replace(/\./g,'').toLowerCase();if(ap==='pm'&&h!==12)h+=12;if(ap==='am'&&h===12)h=0;return h*60+min;}m=str.match(/(?:time[^0-9]{0,35}|aim(?:ing)?[^0-9]{0,20}|around\s*)\b(1[0-2]|[1-9])(?::([0-5]\d))?\b/i)||str.match(/\b(1[0-2]|[1-9]):([0-5]\d)\b/);if(!m)return null;let h=+m[1],min=+(m[2]||0);if(h>=1&&h<=10)h+=12;return h*60+min;}
  function fmt(min){min=((min%1440)+1440)%1440;let h=Math.floor(min/60),m=min%60,ap=h>=12?'PM':'AM';let hh=h%12||12;return hh+':'+String(m).padStart(2,'0')+' '+ap;}
  function coverageHours(s){const m=String(s||'').match(/(\d+(?:\.\d+)?)\s*[- ]?hours?/i);return m?+m[1]:null;}
  function cleanPlaceTime(s){return clean(s).replace(/\s*@\s*/g,' — ').replace(/\s+-\s+(?=\d{1,2}(?::\d{2})?\s*(?:am|pm))/i,' — ');}
  function yes(s){return /\byes\b/i.test(s)&&!/\bno\b/i.test(s);}
  function no(s){return /\b(no|not having|did not|don't|do not)\b/i.test(s);}
  function pushUnique(a,v){v=clean(v);if(v&&!a.some(x=>x.toLowerCase()===v.toLowerCase()))a.push(v);}
  function parse(text){
    const lines=String(text||'').split(/\n+/).map(clean).filter(Boolean);
    const brideFull=answerAfter(lines,/^Bride's full name/i), groomFull=answerAfter(lines,/^Groom's full name/i);
    const bridePref=answerAfter(lines,/^How does the bride prefer/i), groomPref=answerAfter(lines,/^How does the groom prefer/i);
    const firstLook=answerAfter(lines,/^Will you want a first look/i);
    const reveals=answerAfter(lines,/^Will you want a dad\/mom\/siblings reveal/i);
    const bridesReveal=answerAfter(lines,/^Will you want a bridesmaids reveal/i);
    const vows=answerAfter(lines,/^Are you both writing personal vows/i);
    const family=answerAfter(lines,/^For the family portraits/i);
    const specialFamily=answerAfter(lines,/^Is there a specific photo with someone/i);
    const familyMoments=answerAfter(lines,/^Are there any specific photos or moments/i);
    const ceremonyImportant=answerAfter(lines,/^What is the most important part of the ceremony/i);
    const cocktailSetup=answerAfter(lines,/^Is there any special setup for the cocktail/i);
    const surprises=answerAfter(lines,/^Do you have any specific events or surprises/i);
    const gettingReady=answerAfter(lines,/^Would you like photos of the "getting ready"/i);
    const party=answerAfter(lines,/^How many bridesmaids and groomsmen/i);
    const ceremonyRaw=answerAfter(lines,/^Place and time of the ceremony/i);
    const cocktailRaw=answerAfter(lines,/^Place and time of the cocktail/i);
    const receptionRaw=answerAfter(lines,/^Place and time of the reception/i);
    const video=answerAfter(lines,/^Do you have videography service/i);
    const coordinator=answerAfter(lines,/^Name and best way to contact your wedding coordinator/i);
    const coverage=answerAfter(lines,/^Confirm the wedding package/i);
    const outdoor=answerAfter(lines,/^Will the ceremony be outdoors/i);
    const data={
      couple_name:(shortName(bridePref,shortName(brideFull))+' & '+shortName(groomPref,shortName(groomFull))).replace(/^ & | & $/g,''),
      wedding_date:answerAfter(lines,/^Wedding date$/i),
      location:answerAfter(lines,/^Location of event/i),
      coverage:coverage.replace(/(\d+)\s*-?hours?/i,'$1 Hours'),
      guests:answerAfter(lines,/^Estimated guests/i),
      coordinator:/not been assigned|tbd/i.test(coordinator)?'TBD (Resort Weddings)':coordinator,
      videographer:no(video)?'No videographer':video,
      ceremony:cleanPlaceTime(ceremonyRaw),
      cocktail:cleanPlaceTime(cocktailRaw),
      reception:cleanPlaceTime(receptionRaw),
      wedding_party:party,
      key_requests:[], timeline:[]
    };
    if(/outdoor/i.test(outdoor)) data.ceremony_type='Outdoor Ceremony';
    if(yes(firstLook))pushUnique(data.key_requests,'First Look');
    if(reveals){if(/groom.*mom|mom.*groom/i.test(reveals))pushUnique(data.key_requests,'Groom Mom Reveal');if(/bride.*dad|dad.*bride/i.test(reveals))pushUnique(data.key_requests,'Bride Dad Reveal');if(!/groom.*mom|mom.*groom|bride.*dad|dad.*bride/i.test(reveals))pushUnique(data.key_requests,reveals);}
    if(yes(bridesReveal)||(/reveal/i.test(bridesReveal)&&!no(bridesReveal)))pushUnique(data.key_requests,'Bridesmaids / Friends Reveal');
    if(vows){pushUnique(data.key_requests,/not photographed|unplugged|without photo/i.test(vows)?'Private Vows (not photographed)':'Private Vows');}
    if(/immediate/i.test(family))pushUnique(data.key_requests,'Immediate Family Photos');
    if(/extended/i.test(family))pushUnique(data.key_requests,'Extended Family Photos');
    if(specialFamily&&!/^no!?$/i.test(specialFamily))pushUnique(data.key_requests,'Must-have family photos: '+specialFamily);
    if(familyMoments&&!/^no!?$/i.test(familyMoments))pushUnique(data.key_requests,'Family photo requests: '+familyMoments);
    if(/first kiss/i.test(ceremonyImportant))pushUnique(data.key_requests,'First Kiss');
    if(/enter|entrance/i.test(cocktailSetup))pushUnique(data.key_requests,'Couple Entrance to Cocktail Hour');
    if(/father|bride.*dance/i.test(surprises))pushUnique(data.key_requests,'Bride & Father Dance');
    if(/mother|groom.*dance/i.test(surprises))pushUnique(data.key_requests,'Groom & Mother Dance');
    if(surprises&&!/^no[.! ]*$/i.test(surprises)&&!/father|mother|dance/i.test(surprises))pushUnique(data.key_requests,surprises);

    const cer=extractTime(ceremonyRaw), cock=extractTime(cocktailRaw), rec=extractTime(receptionRaw), hrs=coverageHours(coverage)||8;
    if(cer===null){
      const anchor=rec!==null?rec-120:(cock!==null?cock-60:null);
      const start=anchor!==null?anchor-(hrs>=8?210:hrs>=6?150:120):null;
      const T=(m,item)=>data.timeline.push({time:m===null?'TBD':fmt(m),item});
      T(start,'Details Shots / Bride Getting Ready Coverage Begins');
      T(start===null?null:start+30,'Groom Getting Ready / Groomsmen Photos');
      if(yes(firstLook)){T(anchor===null?null:anchor-90,'First Look / Couple Portraits');T(anchor===null?null:anchor-50,'Wedding Party Photos');}
      T(anchor===null?null:anchor-25,'Ceremony Prep / Freshen Up');
      T(anchor,'Ceremony'+(ceremonyRaw?' ('+clean(ceremonyRaw)+')':' — TIME TBD'));
      T(anchor===null?null:anchor+30,'Group Photo / Immediate Family Photos');
      if(cock!==null)T(cock,'Cocktail Hour / Guest Candids');
      if(rec!==null){T(rec-30,'Golden Hour Couple Photos (optional)');T(rec,'Reception Begins');}
      T(start===null?null:start+hrs*60,'Photography Service Ends');
    }
    if(cer!==null){
      const pre=hrs>=8?210:hrs>=6?150:120, start=cer-pre, end=start+hrs*60;
      const T=(m,item)=>data.timeline.push({time:fmt(m),item});
      const dressedOnly=/fully dressed|only when/i.test(gettingReady);
      T(start,dressedOnly?'Details Shots / Bride Getting Ready Coverage Begins':'Details Shots / Bride Getting Ready Coverage Begins');
      T(start+30,'Groom Getting Ready / Groomsmen Photos');
      let cursor=cer-120;
      if(/groom.*mom|mom.*groom/i.test(reveals)){T(cursor,'Groom Mom Reveal');cursor+=10;}
      if(/bride.*dad|dad.*bride/i.test(reveals)){T(cursor,'Bride Dad Reveal');cursor+=10;}
      if(yes(bridesReveal)||(/reveal/i.test(bridesReveal)&&!no(bridesReveal))){T(cursor,'Bridesmaids / Friends Reveal');cursor+=10;}
      if(yes(firstLook)){
        T(cursor,/not photographed|unplugged|without photo/i.test(vows)?'First Look / then Private Vows (unplugged for photographers)':'First Look / Couple Moment');cursor+=10;
        T(cursor,'Couple Portraits');cursor+=30;
        T(cursor,'Wedding Party Photos');cursor+=party.match(/\d+/g)?.reduce((a,b)=>a+(+b),0)>=16?35:25;
      } else {
        if(vows&&!/morning/i.test(vows)) {T(cursor,/not photographed|unplugged|without photo/i.test(vows)?'Private Vows (unplugged for photographers)':'Private Vows');cursor+=15;}
        T(cursor,'Wedding Party / Individual Group Photos');cursor+=25;
      }
      T(Math.min(cer-25,cursor),'Ceremony Prep / Freshen Up');
      T(cer,'Ceremony'+(ceremonyRaw? ' ('+clean(ceremonyRaw.replace(timeRe,'').replace(/[@—-]+\s*$/,''))+')':''));
      const familyTime=cer+20; T(familyTime,'Group Photo / Immediate Family Photos');
      if(cock!==null)T(cock,/enter|entrance/i.test(cocktailSetup)?'Cocktail Hour / Couple Entrance':'Cocktail Hour / Guest Candids');
      if(rec!==null){if(rec-(cock||familyTime)>=25)T(rec-30,'Sunset / Golden Hour Couple Photos (optional)');T(rec,'Reception Begins');}
      T(end,'Photography Service Ends');
      data.timeline.sort((a,b)=>extractTime(a.time)-extractTime(b.time));
    }
    // Safety net: a successfully parsed questionnaire must never return an empty timeline.
    if(!data.timeline.length){
      const T=(time,item)=>data.timeline.push({time:time||'TBD',item});
      T('TBD','Photography Coverage Begins / Details & Getting Ready');
      if(yes(firstLook))T('TBD','First Look / Couple Portraits');
      T('TBD','Wedding Party Photos');
      T('TBD','Ceremony Prep / Freshen Up');
      T('TBD','Ceremony'+(ceremonyRaw?' — '+clean(ceremonyRaw):''));
      T('TBD','Group Photo / Immediate Family Photos');
      if(!/no cocktail/i.test(cocktailRaw))T('TBD','Cocktail Hour / Guest Candids');
      T('TBD','Golden Hour Couple Photos (optional)');
      T('TBD','Reception Begins'+(receptionRaw?' — '+clean(receptionRaw):''));
      T('TBD','Photography Service Ends');
    }
    return data;
  }
  window.JRSmartParser={parse};
  window.JRSmartParserReadPdf=window.readPdf=async function(e){
    const f=e.target.files[0];if(!f)return;const st=document.getElementById('importStatus');st.textContent='Reading '+f.name+'…';
    try{if(!window.pdfjsLib)throw Error('PDF reader unavailable');pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';const doc=await pdfjsLib.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise,pages=[];
      for(let n=1;n<=doc.numPages;n++){const pg=await doc.getPage(n),tc=await pg.getTextContent(),rows={};tc.items.forEach(it=>{const y=Math.round(it.transform[5]/3)*3;(rows[y]??=[]).push(it)});pages.push(Object.keys(rows).map(Number).sort((a,b)=>b-a).map(y=>rows[y].sort((a,b)=>a.transform[4]-b.transform[4]).map(i=>i.str).join(' ')).join('\n'));}
      const text=pages.join('\n');document.getElementById('importText').value=text;const d=parse(text);const found=['couple_name','wedding_date','location','coverage','guests','coordinator','videographer','ceremony','cocktail','reception','wedding_party'].filter(k=>d[k]).length;st.textContent=`PDF analyzed · ${found} essential fields · ${d.key_requests.length} key requests · ${d.timeline.length} timeline events. Click Generate timeline draft.`;
    }catch(err){console.error(err);st.textContent='Could not read this PDF automatically. Paste the questionnaire text below.';}
  };
  // Bind the PDF input directly after every editor render. This avoids the legacy inline reader.
  function bindSmartPdf(){
    const input=document.getElementById('pdf');
    if(!input||input.dataset.jrSmartBound)return;
    input.dataset.jrSmartBound='1';
    input.addEventListener('change',function(e){e.stopImmediatePropagation();window.readPdf(e)},true);
  }
  document.addEventListener('change',function(e){
    if(e.target&&e.target.id==='pdf'&&!e.target.dataset.jrSmartHandled){
      e.target.dataset.jrSmartHandled='1';
    }
  },true);
  const smartObserver=new MutationObserver(()=>bindSmartPdf());
  document.addEventListener('DOMContentLoaded',()=>{bindSmartPdf();smartObserver.observe(document.body,{childList:true,subtree:true})},{once:true});
  window.generateDraft=function(){const box=document.getElementById('importText'),text=box&&box.value;if(!text||!text.trim()){alert('Upload a PDF first.');return;}if(typeof sync==='function')try{sync()}catch(e){}const d=parse(text);['couple_name','wedding_date','location','coverage','guests','coordinator','videographer','ceremony','cocktail','reception','wedding_party'].forEach(k=>{if(d[k])state[k]=d[k]});state.key_requests=d.key_requests||[];if(d.timeline.length)state.timeline=d.timeline;editor();setTimeout(()=>{const s=document.getElementById('status');if(s)s.textContent='SMART DRAFT GENERATED · Review, adjust if needed, then Save Online.'},0);};
})();