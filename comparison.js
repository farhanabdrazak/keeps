/* Reconstructed earlier design for a simulated evaluation, not historical evidence. */
(() => {
  const bar = document.querySelector('.version-bar');
  const buttons = [...document.querySelectorAll('.version-options [data-version]')];
  const status = document.querySelector('#version-status');
  const categorySelect = document.querySelector('#memory-category');
  const scopeSelect = document.querySelector('#memory-scope');
  const editor = document.querySelector('#edit-dialog');
  const review = document.querySelector('#legacy-review-dialog');
  const form = document.querySelector('#edit-form');
  const original = { renderMemories, renderSuggestion, notify, showEditor, saveSuggestion, applyTheme };
  const weakLabels = { Money:'Numbers', Plans:'General', 'To-Dos':'Items', Recommendations:'Misc', Dates:'Other', Decisions:'Notes' };
  let earlier = false, approved = false;
  let preferredTheme = document.documentElement.dataset.theme || 'light';

  // Preserve the preferred theme; the earlier concept only offers a light interface.
  applyTheme = function (theme) {
    preferredTheme = theme;
    original.applyTheme(earlier ? 'light' : theme);
  };
  function labelCategories() {
    document.querySelectorAll('#filters [data-filter]').forEach(button => {
      button.textContent = earlier ? (weakLabels[button.dataset.filter] || button.dataset.filter) : button.dataset.filter;
    });
    document.querySelectorAll('.tag').forEach(tag => {
      const canonical = Object.keys(weakLabels).find(name => tag.classList.contains(name));
      if (canonical) tag.textContent = earlier ? weakLabels[canonical] : canonical;
    });
    [...categorySelect.options].forEach(option => {
      if (option.value) option.textContent = earlier ? weakLabels[option.value] : option.value;
    });
  }
  renderMemories = function () {
    if (earlier) document.querySelector('#show-resolved').checked = false;
    original.renderMemories();
    labelCategories();
    if (!earlier) return;
    document.querySelectorAll('.source-button').forEach(button => button.remove());
    document.querySelectorAll('[data-resolve]').forEach(button => { button.textContent = 'Done'; });
  };
  renderSuggestion = function () {
    original.renderSuggestion();
    labelCategories();
    if (!earlier || !suggestion) return;
    document.querySelector('#confirm-suggestion').textContent = 'OK';
    document.querySelector('#edit-suggestion').textContent = 'Change';
    document.querySelector('#dismiss-suggestion').textContent = '×';
    document.querySelector('#dismiss-suggestion').setAttribute('aria-label', 'Close suggestion');
  };
  notify = function (message) {
    if (earlier && message.includes('Find it under Resolved')) message = 'Done';
    original.notify(message);
  };
  function removePrompts() {
    document.querySelectorAll('option[data-legacy-prompt]').forEach(option => option.remove());
  }
  function requireSelection(select, label) {
    const prompt = new Option(label, '');
    prompt.dataset.legacyPrompt = 'true';
    prompt.disabled = true;
    select.prepend(prompt);
    select.value = '';
  }
  showEditor = function (item, mode) {
    approved = false;
    removePrompts();
    original.showEditor(item, mode);
    labelCategories();
    categorySelect.required = earlier;
    scopeSelect.required = earlier && mode !== 'suggestion';
    form.querySelector('[type="submit"]').textContent = earlier ? 'Continue' : 'Save memory';
    if (earlier && mode !== 'edit') {
      // No useful category or destination defaults: users must choose each time.
      requireSelection(categorySelect, 'Select a group');
      if (mode !== 'suggestion') requireSelection(scopeSelect, 'Select a destination');
    }
  };
  saveSuggestion = function () {
    if (earlier && suggestion) showEditor({...suggestion, scope:'shared'}, 'suggestion');
    else original.saveSuggestion();
  };
  // The original submit handler is allowed to run only after a redundant review step.
  form.addEventListener('submit', event => {
    if (!earlier || approved) { approved = false; return; }
    event.preventDefault();
    event.stopImmediatePropagation();
    document.querySelector('#legacy-review-title').textContent = document.querySelector('#memory-title').value;
    document.querySelector('#legacy-review-group').textContent = weakLabels[categorySelect.value];
    editor.close();
    review.showModal();
  }, true);
  document.querySelector('#legacy-save').addEventListener('click', () => {
    review.close();
    approved = true;
    form.requestSubmit();
  });
  function backToEditor() { review.close(); editor.showModal(); }
  document.querySelector('#legacy-back').addEventListener('click', backToEditor);
  review.addEventListener('cancel', event => { event.preventDefault(); backToEditor(); });

  function selectVersion(version, updateUrl = true) {
    earlier = version === 'earlier';
    document.documentElement.dataset.version = earlier ? 'earlier' : 'final';
    original.applyTheme(earlier ? 'light' : preferredTheme);
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.version === (earlier ? 'earlier' : 'final'))));
    status.textContent = earlier ? 'Reconstructed earlier design · Simulated evaluation' : 'Final interface · Current repository design';
    category = 'All';
    document.querySelector('#show-resolved').checked = false;
    removePrompts();
    renderSuggestion(); renderMemories();
    if (updateUrl) {
      const url = new URL(location.href);
      if (earlier) url.searchParams.set('version', 'earlier'); else url.searchParams.delete('version');
      history.replaceState(null, '', url);
    }
  }
  buttons.forEach(button => button.addEventListener('click', () => selectVersion(button.dataset.version)));
  document.querySelector('#compare-details').addEventListener('click', () => document.querySelector('#comparison-dialog').showModal());
  document.querySelector('#show-resolved').addEventListener('change', () => renderMemories());
  window.addEventListener('popstate', () => selectVersion(new URL(location.href).searchParams.get('version'), false));
  const sizeBar = () => document.documentElement.style.setProperty('--version-bar-height', `${bar.getBoundingClientRect().height}px`);
  new ResizeObserver(sizeBar).observe(bar);
  sizeBar();
  selectVersion(new URL(location.href).searchParams.get('version'), false);
})();
