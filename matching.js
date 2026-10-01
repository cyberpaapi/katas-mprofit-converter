(function(root){
'use strict';
const pair=(f,p)=>JSON.stringify([String(f).trim(),String(p).trim()]);
function review(raw,s){
 const families=new Map(s.mapping.families.map(f=>[f['MProfit Family'],f])),holders=new Map(s.mapping.holders.map(h=>[pair(h['Source Family'],h['Source Portfolio']),h])),contacts=new Map(s.contacts.map(c=>[c['Record Id'],c])),accounts=new Set(s.accounts.map(a=>a['Record Id']));
 const missingFamilies=[],portfolios=[],seen=new Set(),seenF=new Set();
 for(const r of raw){const family=String(r['Family Name']||'').trim(),portfolio=String(r['Portfolio Name']||'').trim();if(!family||!portfolio)throw Error('Report is missing family or portfolio names.');const f=families.get(family),aid=f?.['Record Id'];
 if(!f||!accounts.has(aid)){if(!seenF.has(family)){missingFamilies.push({family,reason:f?'Mapped CRM Account is missing from refreshed list':'New MProfit family'});seenF.add(family);}continue;}
 const k=pair(family,portfolio);if(seen.has(k))continue;seen.add(k);const h=holders.get(k),c=contacts.get(h?.['Contact Id']);let reason='';
 if(!h)reason='New portfolio';else if(h['Hold Reason'])reason=h['Hold Reason'];else if(!c)reason='No current CRM Contact match';else if(c['Account Name.id']!==h['Family Id']||c['Account Name.id']!==aid)reason='Family assignment changed';
 if(reason)portfolios.push({family,portfolio,accountId:aid,reason});
 }return {families:missingFamilies,portfolios};
}
function setFamily(s,family,id){const account=s.accounts.find(a=>a['Record Id']===id);if(!account||!family.trim())throw Error('Select a current CRM Account.');const row={'MProfit Family':family.trim(),'Record Id':id,'CRM Family':account['Account Name']};s.mapping.families=s.mapping.families.filter(f=>f['MProfit Family']!==row['MProfit Family']);s.mapping.families.push(row);return s;}
function setHolder(s,family,portfolio,id){const f=s.mapping.families.find(f=>f['MProfit Family']===family),c=s.contacts.find(c=>c['Record Id']===id);if(!f||!c||!c['Account Name.id']||c['Account Name.id']!==f['Record Id'])throw Error('Select a Contact belonging to the mapped CRM family.');const row={'Source Family':family,'Source Portfolio':portfolio,'Contact Id':id,'Family Id':c['Account Name.id'],'Hold Reason':''};s.mapping.holders=s.mapping.holders.filter(h=>pair(h['Source Family'],h['Source Portfolio'])!==pair(family,portfolio));s.mapping.holders.push(row);return s;}
root.MProfitMatching={review,setFamily,setHolder};if(typeof module!=='undefined')module.exports=root.MProfitMatching;
})(typeof window!=='undefined'?window:globalThis);
