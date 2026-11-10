/* Local conversation integration. No external messenger access or background alerts. */
(() => {
 const key='keeps-conversation-v1';
 let followups={}, editingId=null, ready=false;
 const final=()=>document.documentElement.dataset.version!=='earlier';
 const base={renderMemories,renderMessages,init};
 const ui=document.createElement('section'); ui.className='context-tools';
 ui.innerHTML='<div id="followup-strip" aria-live="polite"></div><label for="recall-query">Bring a memory into this reply</label><div class="recall-row"><input id="recall-query" type="search" placeholder="Search saved plans, amounts or tasks…"><button id="recall-toggle" type="button">Browse saved</button></div><div id="recall-results" hidden></div><small id="local-note">Demo stays in this browser. Follow-ups appear while Keeps is open; no background alerts.</small>';
 document.querySelector('.composer-area').prepend(ui);
 const dialog=document.createElement('dialog'); dialog.id='followup-dialog'; dialog.setAttribute('aria-labelledby','followup-heading');
 dialog.innerHTML='<form id="followup-form"><h2 id="followup-heading">Plan a follow-up</h2><p id="followup-name"></p><label>When<input id="followup-time" type="datetime-local" required></label><p class="modal-note">Shown here when due, including on your next visit. Export to your calendar for scheduling outside Keeps. Calendar alerts depend on your calendar settings.</p><div class="modal-actions"><button type="button" id="followup-cancel" class="secondary">Cancel</button><button class="primary" type="submit">Set follow-up</button></div><button type="button" id="followup-remove" class="text-button">Remove follow-up</button></form>';
 document.body.append(dialog);
 const get=id=>memories.find(m=>m.id===Number(id));
 function persist(){if(!ready)return;try{localStorage.setItem(key,JSON.stringify({messages,memories,suggestion,nextId,followups}));}catch{document.querySelector('#local-note').textContent='Browser storage unavailable. Changes will last only for this visit.';}}
 function render(){
  ui.hidden=!final();
  document.querySelectorAll('.memory-integrations,.saved-message-link').forEach(e=>e.remove());
  if(final()){
   document.querySelectorAll('#memory-list [data-edit]').forEach(button=>{
    const m=get(button.dataset.edit); if(!m)return;
    const actions=document.createElement('div');actions.className='memory-integrations';
    actions.innerHTML=`<button data-reuse="${m.id}">Use in reply</button><button data-followup="${m.id}">${followups[m.id]?'Change follow-up':'Follow up'}</button>${followups[m.id]?`<button data-calendar="${m.id}">Export calendar</button><small>${esc(new Date(followups[m.id]).toLocaleString())}</small>`:''}`;
    button.closest('article').append(actions);
   });
   messages.forEach(message=>{
    const saved=memories.filter(m=>m.source===message.id);if(!saved.length)return;
    const b=document.createElement('button');b.className='saved-message-link';b.dataset.findMemory=saved[0].id;b.textContent=`Saved · ${saved.length} ${saved.length===1?'memory':'memories'}`;
    document.querySelector('#message-'+message.id)?.append(b);
   });
  }
  const due=memories.filter(m=>!m.resolved&&followups[m.id]&&Date.parse(followups[m.id])<=Date.now());
  document.querySelector('#followup-strip').innerHTML=due.length?`<strong>${due.length} follow-up${due.length===1?'':'s'} ready</strong>`+due.slice(0,3).map(m=>`<button data-find-memory="${m.id}">${esc(m.title)}</button>`).join(''):'';
  recall();persist();
 }
 function recall(){
  const q=document.querySelector('#recall-query').value.trim().toLowerCase();
  const found=memories.filter(m=>!m.resolved&&(`${m.title} ${m.detail} ${m.category}`).toLowerCase().includes(q));
  document.querySelector('#recall-results').innerHTML=found.length?found.slice(0,6).map(m=>`<div><span>${esc(m.title)} <small>${m.scope==='private'?'Only you':'Shared demo'} · ${esc(m.detail)}</small></span><button data-reuse="${m.id}">Use in reply</button></div>`).join(''):'<p>No active memories match. Try another word or check Resolved in the memory panel.</p>';
 }
 renderMemories=function(){base.renderMemories();render();};
 renderMessages=function(){base.renderMessages();render();};
 init=function(){followups={};base.init();render();};
 // Restore only structurally valid local data, otherwise keep the safe seed conversation.
 try{
  const s=JSON.parse(localStorage.getItem(key)||'null');
  const valid=s&&Array.isArray(s.messages)&&Array.isArray(s.memories)&&s.messages.length<2000&&s.memories.length<2000&&s.messages.every(m=>Number.isSafeInteger(m.id)&&typeof m.text==='string')&&s.memories.every(m=>Number.isSafeInteger(m.id)&&typeof m.title==='string'&&categories.includes(m.category)&&['shared','private'].includes(m.scope)&&s.messages.some(x=>x.id===m.source));
  if(valid){messages=s.messages;memories=s.memories;suggestion=s.suggestion&&typeof s.suggestion.title==='string'&&messages.some(m=>m.id===s.suggestion.source)?s.suggestion:null;nextId=Math.max(20,...messages.map(m=>m.id+1),...memories.map(m=>m.id+1));followups=Object.fromEntries(Object.entries(s.followups||{}).filter(([id,date])=>get(id)&&Number.isFinite(Date.parse(date))));}
 }catch{}
 ready=true;renderMessages();renderSuggestion();renderMemories();
 document.querySelector('#recall-query').addEventListener('input',()=>{document.querySelector('#recall-results').hidden=false;recall();});
 document.querySelector('#recall-toggle').addEventListener('click',()=>{const r=document.querySelector('#recall-results');r.hidden=!r.hidden;recall();});
 document.querySelector('#followup-cancel').onclick=()=>dialog.close();
 document.querySelector('#followup-remove').onclick=()=>{delete followups[editingId];dialog.close();renderMemories();};
 document.querySelector('#followup-form').onsubmit=e=>{e.preventDefault();const date=new Date(document.querySelector('#followup-time').value);if(!Number.isFinite(date.getTime()))return;followups[editingId]=date.toISOString();dialog.close();renderMemories();notify('Follow-up set. It will appear here when due.');};
 document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b||!final())return;
  if(b.dataset.reuse){const m=get(b.dataset.reuse);if(!m)return;closePanel(false);const input=document.querySelector('#message-input');const text=`${m.title}${m.detail?' — '+m.detail:''}`;input.value=(input.value?input.value+'\n':'')+text;input.focus();notify('Added to your draft. Review it before sending.');}
  if(b.dataset.findMemory){const m=get(b.dataset.findMemory);if(!m)return;scope=m.scope;category=m.category;document.querySelector('#show-resolved').checked=m.resolved;renderMemories();openPanel();}
  if(b.dataset.followup){editingId=Number(b.dataset.followup);const m=get(editingId);if(!m)return;document.querySelector('#followup-name').textContent=m.title;const d=followups[editingId]?new Date(followups[editingId]):new Date(Date.now()+3600000);document.querySelector('#followup-time').value=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);dialog.showModal();}
  if(b.dataset.calendar){const m=get(b.dataset.calendar);if(!m||!followups[m.id])return;const fmt=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const escape=s=>String(s).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');const start=new Date(followups[m.id]);const content=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Keeps//Followup//EN','BEGIN:VEVENT',`UID:keeps-${m.id}-${start.getTime()}@local`,`DTSTAMP:${fmt(new Date())}`,`DTSTART:${fmt(start)}`,`DTEND:${fmt(new Date(+start+1800000))}`,`SUMMARY:${escape(m.title)}`,`DESCRIPTION:${escape(m.detail||'Saved in Keeps')}`,'END:VEVENT','END:VCALENDAR',''].join('\r\n');const url=URL.createObjectURL(new Blob([content],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='keeps-followup.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Calendar file downloaded. Open it in your calendar to import.');}
 });
 new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['data-version']});
 setInterval(()=>{if(final())render();},60000);
})();
