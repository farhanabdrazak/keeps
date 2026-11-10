/* Local conversation integration. No external messenger access or background alerts. */
(() => {
 const key='keeps-conversation-v1';
 let followups={}, editingId=null, ready=false;
 const final=()=>document.documentElement.dataset.version!=='earlier';
 const base={renderMemories,renderMessages,init};
 const ui=document.createElement('section'); ui.className='context-tools';
 ui.innerHTML='<div id="followup-strip" aria-live="polite"></div><label for="recall-query">Bring a memory into this reply</label><div class="recall-row"><input id="recall-query" type="search" placeholder="Search saved plans, amounts or tasks…"><button id="recall-toggle" type="button">Browse saved</button></div><div id="recall-results" hidden></div><small id="local-note">Demo stays in this browser. Follow-ups appear while Keeps is open; no background alerts.</small>';
 document.querySelector('.composer-area').prepend(ui);
 const attachmentDraft=document.createElement('div');attachmentDraft.id='memory-attachment-draft';attachmentDraft.setAttribute('aria-live','polite');
 document.querySelector('#send-form').before(attachmentDraft);
 const dialog=document.createElement('dialog'); dialog.id='followup-dialog'; dialog.setAttribute('aria-labelledby','followup-heading');
 dialog.innerHTML='<form id="followup-form"><h2 id="followup-heading">Plan a follow-up</h2><p id="followup-name"></p><label>When<input id="followup-time" type="datetime-local" required></label><label for="followup-people">People involved <span class="optional-label">(optional)</span></label><input id="followup-people" type="text" maxlength="600" placeholder="e.g. You, Jamie, Sarah" aria-describedby="followup-people-help"><p id="followup-people-help" class="people-help">Separate names with commas. Names stay with this reminder; no invitations are sent.</p><p class="modal-note">Shown here when due, including on your next visit. Export to your calendar for scheduling outside Keeps. Calendar alerts depend on your calendar settings.</p><div class="modal-actions"><button type="button" id="followup-cancel" class="secondary">Cancel</button><button class="primary" type="submit">Set follow-up</button></div><button type="button" id="followup-remove" class="text-button">Remove follow-up</button></form>';
 document.body.append(dialog);
 const get=id=>memories.find(m=>m.id===Number(id));
 const namesFor=id=>followups[id]?.people||[];
 const peopleLine=id=>namesFor(id).length?`People: ${namesFor(id).join(", ")}`:"";
 function persist(){if(!ready)return;try{localStorage.setItem(key,JSON.stringify({messages,memories,suggestion,nextId,followups}));}catch{document.querySelector('#local-note').textContent='Browser storage unavailable. Changes will last only for this visit.';}}
 function render(){
  ui.hidden=!final();
  attachmentDraft.hidden=!pendingMemoryAttachment;
  attachmentDraft.innerHTML=pendingMemoryAttachment?`<div class="attachment-draft-heading"><span>Memory attached · sends with your message</span><button type="button" id="remove-memory-attachment" aria-label="Remove attached memory">×</button></div>${memoryAttachmentMarkup(pendingMemoryAttachment)}`:'';
  document.querySelectorAll('.memory-integrations,.reminder-people,.saved-message-link').forEach(e=>e.remove());
  if(final()){
   document.querySelectorAll('#memory-list [data-edit]').forEach(button=>{
    const m=get(button.dataset.edit); if(!m)return;
    const actions=document.createElement('div');actions.className='memory-integrations';
    actions.innerHTML=`<button data-reuse="${m.id}">Use in reply</button><button data-followup="${m.id}">${followups[m.id]?'Change follow-up':'Follow up'}</button>${followups[m.id]?`<button data-calendar="${m.id}">Export calendar</button><small>${esc(new Date(followups[m.id].when).toLocaleString())}</small>`:''}`;
    button.closest('article').append(actions);
    if(namesFor(m.id).length){
     const group=document.createElement('div'); group.className='reminder-people';
     group.innerHTML='<span class="people-caption">People involved</span>'+namesFor(m.id).map(name=>`<span class="person-chip">${esc(name)}</span>`).join('');
     button.closest('article').append(group);
    }
   });
   messages.forEach(message=>{
    const saved=memories.filter(m=>m.source===message.id);if(!saved.length)return;
    const b=document.createElement('button');b.className='saved-message-link';b.dataset.findMemory=saved[0].id;b.textContent=`Saved · ${saved.length} ${saved.length===1?'memory':'memories'}`;
    document.querySelector('#message-'+message.id)?.append(b);
   });
  }
  const due=memories.filter(m=>!m.resolved&&followups[m.id]&&Date.parse(followups[m.id].when)<=Date.now());
  document.querySelector('#followup-strip').innerHTML=due.length?`<strong>${due.length} follow-up${due.length===1?'':'s'} ready</strong>`+due.slice(0,3).map(m=>`<button data-find-memory="${m.id}">${esc(m.title)}${peopleLine(m.id)?`<span class="due-people">${esc(peopleLine(m.id))}</span>`:""}</button>`).join(''):'';
  recall();persist();
 }
 function recall(){
  const q=document.querySelector('#recall-query').value.trim().toLowerCase();
  const found=memories.filter(m=>!m.resolved&&(`${m.title} ${m.detail} ${m.category} ${peopleLine(m.id)}`).toLowerCase().includes(q));
  document.querySelector('#recall-results').innerHTML=found.length?found.slice(0,6).map(m=>`<div><span>${esc(m.title)} <small>${m.scope==='private'?'Only you':'Shared demo'} · ${esc(m.detail)}${peopleLine(m.id)?` · ${esc(peopleLine(m.id))}`:""}</small></span><button data-reuse="${m.id}">Use in reply</button></div>`).join(''):'<p>No active memories match. Try another word or check Resolved in the memory panel.</p>';
 }
 renderMemories=function(){base.renderMemories();render();};
 renderMessages=function(){base.renderMessages();render();};
 init=function(){followups={};base.init();render();};
 // Restore only structurally valid local data, otherwise keep the safe seed conversation.
 try{
  const s=JSON.parse(localStorage.getItem(key)||'null');
  const valid=s&&Array.isArray(s.messages)&&Array.isArray(s.memories)&&s.messages.length<2000&&s.memories.length<2000&&s.messages.every(m=>Number.isSafeInteger(m.id)&&typeof m.text==='string')&&s.memories.every(m=>Number.isSafeInteger(m.id)&&typeof m.title==='string'&&categories.includes(m.category)&&['shared','private'].includes(m.scope)&&s.messages.some(x=>x.id===m.source));
  if(valid){messages=s.messages;memories=s.memories;suggestion=s.suggestion&&typeof s.suggestion.title==='string'&&messages.some(m=>m.id===s.suggestion.source)?s.suggestion:null;nextId=Math.max(20,...messages.map(m=>m.id+1),...memories.map(m=>m.id+1));followups=Object.fromEntries(Object.entries(s.followups||{}).map(([id,value])=>[id,KeepsFollowups.normalize(value)]).filter(([id,value])=>get(id)&&value));}
 }catch{}
 ready=true;renderMessages();renderSuggestion();renderMemories();
 document.querySelector('#recall-query').addEventListener('input',()=>{document.querySelector('#recall-results').hidden=false;recall();});
 document.querySelector('#recall-toggle').addEventListener('click',()=>{const r=document.querySelector('#recall-results');r.hidden=!r.hidden;recall();});
 document.querySelector('#followup-cancel').onclick=()=>dialog.close();
 document.querySelector('#followup-remove').onclick=()=>{delete followups[editingId];dialog.close();renderMemories();};
 document.querySelector('#followup-form').onsubmit=e=>{e.preventDefault();const date=new Date(document.querySelector('#followup-time').value);if(!Number.isFinite(date.getTime()))return;followups[editingId]={when:date.toISOString(),people:KeepsFollowups.people(document.querySelector('#followup-people').value)};dialog.close();renderMemories();notify('Follow-up set. It will appear here when due.');};
 document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;if(!final()&&b.id!=='remove-memory-attachment')return;
  if(b.id==='remove-memory-attachment'){pendingMemoryAttachment=null;render();document.querySelector('#message-input').focus();}
  if(b.dataset.reuse){const m=get(b.dataset.reuse);if(!m)return;closePanel(false);pendingMemoryAttachment={title:m.title,detail:m.detail||'',category:m.category,people:namesFor(m.id).join(', ')};render();document.querySelector('#message-input').focus();notify('Memory attached. Add a message or send the card on its own.');}
  if(b.dataset.findMemory){const m=get(b.dataset.findMemory);if(!m)return;scope=m.scope;category=m.category;document.querySelector('#show-resolved').checked=m.resolved;renderMemories();openPanel();}
  if(b.dataset.followup){editingId=Number(b.dataset.followup);const m=get(editingId);if(!m)return;document.querySelector('#followup-name').textContent=m.title;const d=followups[editingId]?new Date(followups[editingId].when):new Date(Date.now()+3600000);document.querySelector('#followup-time').value=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);document.querySelector('#followup-people').value=namesFor(editingId).join(', ');document.querySelector('#followup-remove').hidden=!followups[editingId];dialog.showModal();}
  if(b.dataset.calendar){const m=get(b.dataset.calendar);if(!m||!followups[m.id])return;const content=KeepsFollowups.calendar(m,followups[m.id]);const url=URL.createObjectURL(new Blob([content],{type:'text/calendar;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='keeps-followup.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('Calendar file downloaded. Open it in your calendar to import.');}
 });
 new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['data-version']});
 setInterval(()=>{if(final())render();},60000);
})();
