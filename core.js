(function(root){
'use strict';
const key=(a,b)=>JSON.stringify([String(a).trim(),String(b).trim()]);
const money=n=>Math.round((n+Number.EPSILON)*100)/100;
function unique(rows,field){const map=new Map();for(const r of rows){const k=String(r[field]||'').trim();if(!k)continue;if(map.has(k))throw Error('Duplicate '+field+': '+k);map.set(k,r);}return map;}
function date(v){if(!v)return '';const s=String(v).slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||Number.isNaN(Date.parse(s)))throw Error('Invalid CRM date: '+v);return s;}
function convert(raw,mapping,contacts,accounts,asof){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(asof)||Number.isNaN(Date.parse(asof)))throw Error('Choose a valid report valuation date.');
 for(const h of ['Family Name','Portfolio Name','Amount Invested','Current Value'])if(!raw.length||!(h in raw[0]))throw Error('Raw data is missing '+h);
 if(!Array.isArray(mapping.families)||!Array.isArray(mapping.holders))throw Error('Invalid reviewed mapping file.');
 const families=unique(mapping.families,'MProfit Family'), cm=unique(contacts,'Record Id'), am=unique(accounts,'Record Id'), hm=new Map(), groups=new Map(), unknown=new Set();
 for(const h of mapping.holders){const k=key(h['Source Family'],h['Source Portfolio']);if(hm.has(k))throw Error('Duplicate holder mapping.');hm.set(k,h);}
 let source=0;
 for(const r of raw){const f=String(r['Family Name']||'').trim(),p=String(r['Portfolio Name']||'').trim(),a=r['Amount Invested'],v=r['Current Value'];
  if(!f||!p||typeof a!=='number'||typeof v!=='number'||!Number.isFinite(a)||!Number.isFinite(v))throw Error('Incomplete identity or nonnumeric balance in Raw data.');
  if(!families.has(f))throw Error('Unmapped family: '+f+'. Review mapping before conversion.');
  const k=key(f,p);if(!hm.has(k))unknown.add(f);let g=groups.get(k);if(!g){g={family:f,portfolio:p,invested:0,value:0};groups.set(k,g);}g.invested+=a;g.value+=v;source+=v;
 }
 const fs=new Map(), cs=new Map(), excluded=[], blocked=new Set();
 const add=(map,id,a,v)=>{const s=map.get(id)||{invested:0,value:0};s.invested+=a;s.value+=v;map.set(id,s);};
 for(const g of groups.values()){
  const f=families.get(g.family), aid=f['Record Id'], account=am.get(aid);
  if(!account)throw Error('Mapped Account missing from CRM export: '+f['CRM Family']);
  if(date(account['Portfolio As-of Date'])>asof)throw Error('Account has a newer portfolio date: '+f['CRM Family']);
  add(fs,aid,g.invested,g.value);
  const h=hm.get(key(g.family,g.portfolio)), cid=h?.['Contact Id'], c=cm.get(cid);let reason='';
  if(unknown.has(g.family))reason='New portfolio in source family; review complete ownership';
  else if(h?.['Hold Reason'])reason=h['Hold Reason'];
  else if(!cid)reason='No reviewed Contact mapping';
  else if(!c)reason='Contact missing from CRM export';
  else if(c['Account Name.id']!==h['Family Id']||c['Account Name.id']!==aid)reason='CRM family link changed';
  else if(date(c['Portfolio As-of Date'])>asof)reason='Contact has a newer portfolio date';
  if(reason){if(cid)blocked.add(cid);excluded.push({...g,reason,contactId:cid||''});}else add(cs,cid,g.invested,g.value);
 }
 for(const cid of blocked){if(cs.has(cid)){const v=cs.get(cid);excluded.push({family:'',portfolio:cm.get(cid)?.['Contact Name']||cid,...v,reason:'Other portfolio for this Contact is unresolved',contactId:cid});cs.delete(cid);}}
 function rows(sums,current,idLabel,nameLabel){return [...sums].sort(([a],[b])=>a.localeCompare(b)).map(([id,s])=>{
  const a=money(s.invested),v=money(s.value);if(a===0)throw Error('Zero investment for '+id+' requires review before export.');
  const c=current.get(id),name=c[nameLabel]||[c['First Name'],c['Last Name']].filter(Boolean).join(' ');
  return {[idLabel]:id,[nameLabel]:name,'Amount Invested':a,'Current Value':v,'Gain %':money((v-a)/a*100),'Portfolio As-of Date':asof};});}
 const familyRows=rows(fs,am,'Record Id','Account Name'),contactRows=rows(cs,cm,'Contact Id','Contact Name');
 const familyTotal=money(familyRows.reduce((s,r)=>s+r['Current Value'],0)), contactTotal=money(contactRows.reduce((s,r)=>s+r['Current Value'],0));
 if(Math.abs(familyTotal-money(source))>.02)throw Error('Family totals do not reconcile.');
 return {familyRows,contactRows,excluded,positions:raw.length,sourceValue:money(source),contactValue:contactTotal,heldValue:money(source-contactTotal)};
}
function csv(rows){if(!rows.length)return '';const cols=Object.keys(rows[0]);const cell=v=>'"'+String(v??'').replace(/^[=+@\t\r]/,"'$&").replaceAll('"','""')+'"';return '\uFEFF'+[cols,...rows.map(r=>cols.map(c=>r[c]))].map(r=>r.map(cell).join(',')).join('\r\n');}
root.MProfitConverter={convert,csv};if(typeof module!=='undefined')module.exports=root.MProfitConverter;
})(typeof window!=='undefined'?window:globalThis);
