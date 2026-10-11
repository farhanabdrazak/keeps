/* Reconstructed design comparison. The baseline app.js remains unchanged. */
(() => {
  const bar = document.querySelector('.version-bar');
  const buttons = [...document.querySelectorAll('[data-version]')];
  const status = document.querySelector('#version-status');
  const original = { renderMemories, renderSuggestion, notify };
  let earlier = false;

  // Re-render through the original functions so switching back restores every control.
  renderMemories = function () {
    if (earlier) {
      category = 'All';
      document.querySelector('#show-resolved').checked = false;
    }
    original.renderMemories();
    if (!earlier) return;
    document.querySelectorAll('.source-button').forEach(button => button.remove());
    document.querySelectorAll('[data-resolve]').forEach(button => {
      button.textContent = 'Done';
    });
  };
  renderSuggestion = function () {
    original.renderSuggestion();
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

  function selectVersion(version, updateUrl = true) {
    earlier = version === 'earlier';
    document.documentElement.dataset.version = earlier ? 'earlier' : 'final';
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.version === (earlier ? 'earlier' : 'final'))));
    status.textContent = earlier
      ? 'Reconstructed earlier concept · Same session data'
      : 'Final interface · Current repository design';
    renderSuggestion();
    renderMemories();
    if (updateUrl) {
      const url = new URL(location.href);
      if (earlier) url.searchParams.set('version', 'earlier');
      else url.searchParams.delete('version');
      history.replaceState(null, '', url);
    }
  }
  buttons.forEach(button => button.addEventListener('click', () => selectVersion(button.dataset.version)));
  document.querySelector('#compare-details').addEventListener('click', () => document.querySelector('#comparison-dialog').showModal());
  // The original checkbox listener captured its renderer before this extension loaded.
  document.querySelector('#show-resolved').addEventListener('change', () => renderMemories());
  window.addEventListener('popstate', () => selectVersion(new URL(location.href).searchParams.get('version'), false));
  const sizeBar = () => document.documentElement.style.setProperty('--version-bar-height', `${bar.getBoundingClientRect().height}px`);
  new ResizeObserver(sizeBar).observe(bar);
  sizeBar();
  selectVersion(new URL(location.href).searchParams.get('version'), false);
})();
