/* Local coordination workspace: no invitations, payments or account sync. */
(() => {
  const key = 'keeps-plans-v1';
  let plans = [], selected = null, storageFailed = false;
  const uid = () => crypto.randomUUID();
  const money = cents => new Intl.NumberFormat('en-SG', {style:'currency',currency:'SGD'}).format(cents / 100);
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(saved)) plans = saved.filter(p => p && typeof p.id === 'string' && typeof p.title === 'string' &&
      Array.isArray(p.people) && p.people.every(n => typeof n === 'string') &&
      Array.isArray(p.tasks) && p.tasks.every(t => typeof t.id === 'string' && typeof t.title === 'string' && typeof t.owner === 'string') &&
      Array.isArray(p.expenses) && p.expenses.every(e => typeof e.id === 'string' && typeof e.title === 'string' && Number.isSafeInteger(e.cents) && e.cents > 0 && p.people.includes(e.payer)) &&
      Array.isArray(p.memories) && p.memories.every(Number.isSafeInteger));
  } catch {}
  selected = plans[0]?.id;
  const board = document.createElement('dialog');
  board.id = 'plan-board'; board.setAttribute('aria-labelledby','plan-board-title');
  document.body.append(board);
  const openButton = document.createElement('button');
  openButton.type='button'; openButton.id='open-plans'; openButton.textContent='Plan together';
  openButton.setAttribute('aria-haspopup','dialog'); openButton.setAttribute('aria-controls','plan-board');
  document.querySelector('.scenario-row').append(openButton);
  openButton.onclick=()=>{render();board.showModal();};
  const current=()=>plans.find(p=>p.id===selected);
  function save() {try {localStorage.setItem(key,JSON.stringify(plans));} catch {storageFailed=true;} render();}
  function linked(p) {return memories.filter(m=>p.memories.includes(m.id));}
  function options(p, first='Choose person') {return `<option value="">${first}</option>`+p.people.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');}
  function render() {
    const p=current();
    board.innerHTML=`<header class="plan-heading"><div><span class="eyebrow">FROM CONVERSATION TO COORDINATION</span><h2 id="plan-board-title">Plan together</h2><p>People, responsibilities and shared costs in one place.</p></div><button type="button" data-plan-action="close" aria-label="Close plan board">×</button></header>
      <p class="plan-demo-note">${storageFailed?'Storage unavailable: changes last only for this visit.':'Local planning demo. Names do not send invitations; expenses do not move money.'}</p>
      <div class="plan-layout"><aside class="plan-navigation"><form data-plan-form="new"><label for="new-plan-title">New plan</label><div class="plan-inline"><input id="new-plan-title" name="title" required maxlength="80" placeholder="e.g. Saturday outing"><button type="submit">Create</button></div></form><nav aria-label="Your plans">${plans.map(x=>`<button type="button" data-plan-select="${esc(x.id)}" aria-current="${x.id===selected?'page':'false'}">${esc(x.title)}<small>${x.tasks.filter(t=>t.done).length}/${x.tasks.length} tasks complete</small></button>`).join('')}</nav></aside>
      <div class="plan-content">${p?content(p):`<div class="plan-empty"><span>✧</span><h3>A plan, not another reminder.</h3><p>Create an outing or project, connect the useful chat details, assign responsibilities and keep track of who paid.</p><p>Start with a name on the left.</p></div>`}</div></div>`;
  }
  function content(p) {
    const done=p.tasks.filter(t=>t.done).length, total=p.expenses.reduce((s,e)=>s+e.cents,0);
    const balances=KeepsPlanMath.balances(p.people,p.expenses);
    return `<div class="plan-title-row"><h3>${esc(p.title)}</h3><button type="button" data-plan-action="share">Attach summary to chat</button></div>
      <div class="plan-stats"><span><b>${p.people.length}</b> people</span><span><b>${done}/${p.tasks.length}</b> tasks done</span><span><b>${money(total)}</b> recorded costs</span></div>
      <section class="plan-section"><h4>The plan</h4><form data-plan-form="details"><label>Plan name<input name="title" value="${esc(p.title)}" required maxlength="80"></label><div class="plan-grid"><label>When<input type="datetime-local" name="when" value="${esc(p.when||'')}"></label><label>Where<input name="where" value="${esc(p.where||'')}" maxlength="120" placeholder="Meeting point"></label></div><label>People involved<input name="people" value="${esc(p.people.join(', '))}" maxlength="600" placeholder="You, Jamie, Sarah"></label><small>Separate names with commas. Costs are split equally among everyone listed.</small><button type="submit">Save details</button></form></section>
      <section class="plan-section"><h4>Who is doing what?</h4><progress value="${done}" max="${p.tasks.length||1}" aria-label="Task completion"></progress><div class="plan-items">${p.tasks.map(t=>`<div class="plan-task"><label><input type="checkbox" data-plan-task="${esc(t.id)}" ${t.done?'checked':''}><span class="${t.done?'task-done':''}">${esc(t.title)}</span></label><span class="plan-owner">${esc(t.owner||'Unassigned')}</span><button type="button" data-remove-task="${esc(t.id)}" aria-label="Remove task ${esc(t.title)}">×</button></div>`).join('')||'<p class="plan-muted">No responsibilities yet. Add something like “Book the table”.</p>'}</div><form data-plan-form="task" class="plan-add-row"><input name="title" required maxlength="140" aria-label="Task" placeholder="What needs doing?"><select name="owner" aria-label="Task owner">${options(p,'Unassigned')}</select><button type="submit">Add task</button></form></section>
      <section class="plan-section"><h4>Shared costs</h4><p class="plan-muted">Record expenses already paid. Positive balances are owed back; negative balances owe the group.</p>${p.people.length?`<form data-plan-form="expense" class="plan-add-row"><input name="title" required maxlength="100" aria-label="Expense description" placeholder="e.g. Lunch"><input name="amount" type="number" min="0.01" max="1000000" step="0.01" required aria-label="Amount in SGD" placeholder="SGD"><select name="payer" required aria-label="Paid by">${options(p,'Paid by')}</select><button type="submit">Add cost</button></form>`:'<p>Add people above to split costs.</p>'}<div class="plan-items">${p.expenses.map(e=>`<div class="plan-cost"><span>${esc(e.title)}<small>Paid by ${esc(e.payer)}</small></span><strong>${money(e.cents)}</strong><button type="button" data-remove-expense="${esc(e.id)}" aria-label="Remove expense ${esc(e.title)}">×</button></div>`).join('')}</div>${total?`<div class="plan-balances">${Object.entries(balances).map(([name,amount])=>`<div><span>${esc(name)}</span><strong>${amount>0?'Is owed '+money(amount):amount<0?'Owes '+money(-amount):'Even'}</strong></div>`).join('')}</div><small>Equal split, rounded to cents. Any extra cents go in participant-list order. No payment has been requested or sent.</small>`:''}</section>
      <section class="plan-section"><h4>Details from the conversation</h4><p class="plan-muted">Link the original memories instead of copying details between apps.</p><div class="plan-linked">${memories.filter(m=>!m.resolved||p.memories.includes(m.id)).map(m=>`<div><label><input type="checkbox" data-link-memory="${m.id}" ${p.memories.includes(m.id)?'checked':''}><span><strong>${esc(m.title)}</strong><small>${esc(m.detail||m.category)}${m.resolved?' · Completed':''}</small></span></label><button type="button" data-plan-source="${m.source}">View source</button></div>`).join('')||'<p>Save a detail in chat first.</p>'}</div></section>`;
  }
  board.addEventListener('submit',e=>{
    const form=e.target.closest('form');if(!form)return;e.preventDefault();
    const data=new FormData(form), kind=form.dataset.planForm, p=current();
    const value=name=>String(data.get(name)||'').trim();
    if(kind==='new'){if(!value('title'))return;const plan={id:uid(),title:value('title'),when:'',where:'',people:[],tasks:[],expenses:[],memories:[]};plans.push(plan);selected=plan.id;}
    if(kind==='details'&&p){const people=KeepsFollowups.people(value('people'));if(p.expenses.some(x=>!people.includes(x.payer))){const input=form.elements.people;input.setCustomValidity('Keep people who paid recorded expenses, or remove those expenses first.');input.reportValidity();return;}if(!value('title'))return;Object.assign(p,{title:value('title'),when:value('when'),where:value('where'),people});p.tasks.forEach(t=>{if(!people.includes(t.owner))t.owner='';});}
    if(kind==='task'&&p){if(!value('title'))return;p.tasks.push({id:uid(),title:value('title'),owner:value('owner'),done:false});}
    if(kind==='expense'&&p){const amount=KeepsPlanMath.cents(value('amount'));if(!amount||!p.people.includes(value('payer'))||!value('title'))return;p.expenses.push({id:uid(),title:value('title'),cents:amount,payer:value('payer')});}
    save();
    const focus=board.querySelector(`[data-plan-form="${kind}"] input`);focus?.focus();
  });
  board.addEventListener('input',e=>{if(e.target.name==='people')e.target.setCustomValidity('');});
  board.addEventListener('change',e=>{
    const p=current();if(!p)return;
    if(e.target.dataset.planTask){const t=p.tasks.find(t=>t.id===e.target.dataset.planTask);if(t)t.done=e.target.checked;save();}
    if(e.target.dataset.linkMemory){const id=Number(e.target.dataset.linkMemory);p.memories=e.target.checked?[...new Set([...p.memories,id])]:p.memories.filter(x=>x!==id);save();}
  });
  board.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;const p=current();
    if(b.dataset.planAction==='close')board.close();
    if(b.dataset.planSelect){selected=b.dataset.planSelect;render();}
    if(b.dataset.removeTask&&p){p.tasks=p.tasks.filter(t=>t.id!==b.dataset.removeTask);save();}
    if(b.dataset.removeExpense&&p){p.expenses=p.expenses.filter(x=>x.id!==b.dataset.removeExpense);save();}
    if(b.dataset.planSource){board.close();const source=document.querySelector('#message-'+b.dataset.planSource);source?.scrollIntoView({behavior:'smooth',block:'center'});source?.querySelector('.bubble')?.focus({preventScroll:true});}
    if(b.dataset.planAction==='share'&&p){
      const summary=[p.when?'When: '+p.when.replace('T',' '):'',p.where?'Where: '+p.where:'',...p.tasks.map(t=>`${t.done?'✓':'○'} ${t.title} (${t.owner||'Unassigned'})`),...linked(p).map(m=>`${m.title}: ${m.detail||''}`),p.expenses.length?'Recorded costs: '+money(p.expenses.reduce((s,x)=>s+x.cents,0)):'',...Object.entries(KeepsPlanMath.balances(p.people,p.expenses)).filter(([,amount])=>amount!==0).map(([name,amount])=>`${name} ${amount>0?'is owed':'owes'} ${money(Math.abs(amount))}`)].filter(Boolean).join('\n');
      pendingMemoryAttachment={title:p.title,category:'Plan summary',detail:summary||'Plan details to follow.',people:p.people.join(', ')};
      board.close();renderMessages();document.querySelector('#message-input').focus();notify('Plan summary attached. Review and send when ready.');
    }
  });
  const originalInit=init;init=function(){plans=[];selected=null;save();originalInit();};
  const visibility=()=>{openButton.hidden=document.documentElement.dataset.version==='earlier';if(openButton.hidden&&board.open)board.close();};
  new MutationObserver(visibility).observe(document.documentElement,{attributes:true,attributeFilter:['data-version']});visibility();
})();
