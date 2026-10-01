'use strict';
const el=id=>document.getElementById(id), STORE='katas-mprofit-setup-v1';let result=null,setup=null;
function reset(){result=null;el('results').hidden=true;el('message').textContent='';}
function validateSetup(s){
 if(s?.version!==1||!s.preparedAt||!Array.isArray(s.mapping?.families)||!Array.isArray(s.mapping?.holders))throw Error('Choose the supplied private setup file, not the mapping-only file.');
 for(const [kind,fields] of [['contacts',['Record Id','Account Name.id','Portfolio As-of Date']],['accounts',['Record Id','Account Name','Portfolio As-of Date']]]){
  if(!Array.isArray(s[kind])||!s[kind].length)throw Error('Setup has no '+kind+'.');const ids=new Set();
  for(const row of s[kind]){if(fields.some(f=>!(f in row))||!row['Record Id']||ids.has(row['Record Id']))throw Error('Invalid or duplicate '+kind+' in setup.');ids.add(row['Record Id']);}
 }return s;
}
function renderSetup(){el('convert').disabled=!setup;el('setup-status').textContent=setup?'Setup ready · prepared '+setup.preparedAt+' · '+setup.contacts.length+' clients / '+setup.accounts.length+' families':'One-time setup needed. Select the supplied setup file below.';el('setup-panel').open=!setup;}
try{const saved=localStorage.getItem(STORE);if(saved)setup=validateSetup(JSON.parse(saved));}catch(e){el('setup-message').textContent='Saved setup could not be loaded. Select your setup file again.';}renderSetup();
el('setup-file').onchange=async()=>{reset();el('unchanged').checked=false;try{const f=el('setup-file').files[0];if(!f)return;if(f.size>5*1024*1024)throw Error('Setup file is too large.');const next=validateSetup(JSON.parse(await f.text()));setup=next;try{localStorage.setItem(STORE,JSON.stringify(next));el('setup-message').textContent='Saved on this browser. Next time, choose only the MProfit report.';}catch(e){el('setup-message').textContent='Browser storage is unavailable. Setup works for this session only.';}renderSetup();}catch(e){el('setup-message').textContent=e.message;}};
el('forget').onclick=()=>{try{localStorage.removeItem(STORE);}catch(e){}setup=null;reset();el('setup-file').value='';el('unchanged').checked=false;el('setup-message').textContent='Saved setup cleared from this browser.';renderSetup();};
for(const id of ['report','date','unchanged'])el(id).addEventListener('change',reset);
el('report').addEventListener('change',()=>{const match=el('report').files[0]?.name.match(/As on (\d{2})-(\d{2})-(\d{4})/i);el('date').value=match?`${match[3]}-${match[2]}-${match[1]}`:'';});
async function workbook(){const f=el('report').files[0];if(!f)throw Error('Choose the MProfit report.');if(f.size>25*1024*1024)throw Error('Report exceeds 25 MB.');return XLSX.read(await f.arrayBuffer(),{type:'array',raw:true,cellDates:false});}
function table(target,rows){target.replaceChildren();if(!rows.length){target.textContent='None.';return;}const t=document.createElement('table'),head=t.createTHead().insertRow();for(const c of Object.keys(rows[0])){const th=document.createElement('th');th.textContent=c;head.append(th);}for(const r of rows){const tr=t.insertRow();for(const v of Object.values(r))tr.insertCell().textContent=String(v??'');}target.append(t);}
function download(name,rows){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([MProfitConverter.csv(rows)],{type:'text/csv;charset=utf-8'}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
el('convert').onclick=async()=>{reset();el('convert').disabled=true;el('message').textContent='Reading report…';try{
 if(!setup)throw Error('Select the private setup file once on this browser.');if(!el('unchanged').checked)throw Error('Confirm the client list, family assignments and report date, or refresh setup first.');
 const report=await workbook(),sheet=report.Sheets['Raw data'];if(!sheet)throw Error('The complete MProfit workbook must include Raw data.');
 result=MProfitConverter.convert(XLSX.utils.sheet_to_json(sheet,{defval:'',raw:true}),setup.mapping,setup.contacts,setup.accounts,el('date').value);
 el('summary').replaceChildren();for(const [label,value] of [['Source positions',result.positions],['Family updates',result.familyRows.length],['Client updates',result.contactRows.length],['Total current value',result.sourceValue],['Client current value',result.contactValue],['Held client value',result.heldValue]]){const d=document.createElement('div');d.className='metric';d.textContent=label;const b=document.createElement('strong');b.textContent=Number(value).toLocaleString('en-IN',{maximumFractionDigits:2});d.append(b);el('summary').append(d);}
 table(el('excluded'),result.excluded.map(r=>({'Source family':r.family,'Portfolio':r.portfolio,'Current value':Math.round(r.value*100)/100,'Reason':r.reason})));table(el('preview'),result.contactRows.slice(0,8));el('results').hidden=false;el('message').textContent='Ready. Review totals and exclusions, then download.';
 }catch(e){el('message').textContent=e.message;}finally{el('convert').disabled=!setup;}};
el('family').onclick=()=>result&&download('family-update.csv',result.familyRows);el('member').onclick=()=>result&&download('member-update.csv',result.contactRows);el('exceptions').onclick=()=>result&&download('excluded-portfolios.csv',result.excluded);
