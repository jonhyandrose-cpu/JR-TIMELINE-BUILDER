// JR Wedding Light Planner — venue + sunset + golden hour
(function(){
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  function parseWeddingDate(s){
    s=clean(s).replace(/(\d)(st|nd|rd|th)\b/gi,'$1');
    let d=new Date(s+' 12:00:00');
    if(!isNaN(d)) return d;
    const m=s.match(/(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})/);
    if(m){d=new Date(+m[3],+m[1]-1,+m[2],12);if(!isNaN(d))return d;}
    return null;
  }
  const isoDate=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  function fallbackZone(name,lat,lng){
    const s=name.toLowerCase();
    if(/quintana roo|cancun|cancún|playa mujeres|riviera maya|tulum|cozumel/.test(s))return'America/Cancun';
    if(/nayarit|punta mita|bahia mita|bahía mita|nuevo vallarta|bahia de banderas|bahía de banderas/.test(s))return'America/Bahia_Banderas';
    if(/puerto vallarta|jalisco/.test(s))return'America/Mexico_City';
    if(/los cabos|cabo san lucas|san jose del cabo|san josé del cabo|baja california sur/.test(s))return'America/Mazatlan';
    if(/dominican|punta cana|la romana/.test(s))return'America/Santo_Domingo';
    if(/jamaica|montego bay/.test(s))return'America/Jamaica';
    return Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC';
  }
  async function geocode(q){
    const url='https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&q='+encodeURIComponent(q);
    const r=await fetch(url,{headers:{'Accept':'application/json'}}); if(!r.ok)throw Error('Venue lookup failed');
    const a=await r.json(); if(!a.length)throw Error('Venue not found');
    return {lat:+a[0].lat,lng:+a[0].lon,name:a[0].display_name};
  }
  async function timezone(lat,lng,name){
    try{
      const r=await fetch(`https://timeapi.io/api/TimeZone/coordinate?latitude=${lat}&longitude=${lng}`);
      if(r.ok){const z=await r.json();return z.timeZone||z.timeZoneId||z.ianaTimeZone||fallbackZone(name,lat,lng);}
    }catch(e){}
    return fallbackZone(name,lat,lng);
  }
  async function sun(lat,lng,date){
    const r=await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${date}&formatted=0`);
    if(!r.ok)throw Error('Sun data unavailable'); const j=await r.json();
    if(j.status!=='OK'||!j.results?.sunset)throw Error('Sunset unavailable'); return j.results;
  }
  const fmt=(iso,zone)=>new Intl.DateTimeFormat('en-US',{timeZone:zone,hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(iso));
  const minus60=iso=>new Date(new Date(iso).getTime()-60*60*1000).toISOString();
  function ensureCard(){
    const body=document.querySelector('.editorBody'); if(!body)return null;
    let card=document.getElementById('jrLightPlanner'); if(card)return card;
    card=document.createElement('div');card.id='jrLightPlanner';
    card.style.cssText='margin:20px 0 28px;padding:18px 20px;border:1px solid #ded8cf;border-radius:16px;background:#f6f1e9;display:grid;grid-template-columns:minmax(0,1.5fr) repeat(2,minmax(130px,.7fr));gap:16px;align-items:center;';
    const title=body.querySelector('.sectionTitle'); body.insertBefore(card,title||body.firstChild); return card;
  }
  function renderLoading(card){card.innerHTML='<div><div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#9a8068;font-weight:700">Wedding Light Planner</div><div style="font-family:Georgia,serif;font-size:20px;margin-top:5px">Locating venue…</div></div><div style="color:#756f68">Sunset —</div><div style="color:#756f68">Golden hour —</div>';}
  function renderError(card,msg){card.innerHTML='<div style="grid-column:1/-1"><div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#9a8068;font-weight:700">Wedding Light Planner</div><div style="margin-top:7px"><strong>Light info unavailable.</strong> '+esc(msg)+'</div><button id="jrLightRetry" type="button" style="margin-top:10px">Retry location</button></div>';document.getElementById('jrLightRetry')?.addEventListener('click',refresh);}
  async function refresh(){
    const card=ensureCard(); if(!card)return;
    const locInput=document.getElementById('f_location'),dateInput=document.getElementById('f_wedding_date');
    const location=clean(locInput?.value||window.state?.location), dateText=clean(dateInput?.value||window.state?.wedding_date);
    if(!location||!dateText){renderError(card,'Add the wedding location and wedding date first.');return;}
    const d=parseWeddingDate(dateText); if(!d){renderError(card,'I could not understand the wedding date.');return;}
    renderLoading(card);
    try{
      const g=await geocode(location), zone=await timezone(g.lat,g.lng,g.name), s=await sun(g.lat,g.lng,isoDate(d));
      const sunset=fmt(s.sunset,zone), golden=fmt(minus60(s.sunset),zone);
      card.innerHTML=`<div style="min-width:0"><div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#9a8068;font-weight:700">Wedding Light Planner</div><div style="font-family:Georgia,serif;font-size:19px;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(g.name)}">${esc(location)}</div><div style="font-size:12px;color:#756f68;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${esc(g.name)}">📍 ${esc(g.name)}</div></div><div><div style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#756f68">Sunset</div><div style="font-family:Georgia,serif;font-size:25px;margin-top:4px">${esc(sunset)}</div></div><div><div style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:#756f68">Golden hour starts</div><div style="font-family:Georgia,serif;font-size:25px;margin-top:4px">${esc(golden)}</div><div style="font-size:11px;color:#756f68">1 hr before sunset</div></div><div style="grid-column:1/-1;font-size:11px;color:#756f68;border-top:1px solid #ded8cf;padding-top:9px">Calculated for ${esc(isoDate(d))} · ${esc(zone)} · venue coordinates ${g.lat.toFixed(4)}, ${g.lng.toFixed(4)}. Use as a planning reference; buildings, mountains and weather can reduce usable direct light.</div>`;
    }catch(e){console.error('JR Light Planner',e);renderError(card,'Could not locate this venue automatically. Make the Location field more specific (hotel/resort + city/country) and retry.');}
  }
  function install(){
    if(typeof window.editor!=='function'||window.__jrLightInstalled)return;
    window.__jrLightInstalled=true; const original=window.editor;
    window.editor=function(){const out=original.apply(this,arguments);setTimeout(()=>{ensureCard();refresh();const l=document.getElementById('f_location'),d=document.getElementById('f_wedding_date');[l,d].forEach(x=>x&&x.addEventListener('change',refresh));},0);return out;};
    if(document.querySelector('.editorBody'))setTimeout(refresh,0);
  }
  window.JRLightPlanner={refresh}; install();
})();