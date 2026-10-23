/* Emex Share v1 - Share opens the phone's own share sheet (WhatsApp, Files, Gmail...). Load after emex-boost.js */
(function () {
  'use strict';
  const B = document.getElementById('ehc');
  if (!B) return;
  const TAG = '\n\n— Shared from Emex Calculator';
  const plug = () => (window.Capacitor && window.Capacitor.Plugins) || {};
  const result = () => ((B.querySelector('#pr') || B.querySelector('#fr') || {}).textContent || '');

  async function shareText(t) {
    const P = plug();
    if (P.Share) { await P.Share.share({ title: 'Emex result', text: t + TAG, dialogTitle: 'Share result' }); return true; }
    if (navigator.share) { await navigator.share({ title: 'Emex result', text: t + TAG }); return true; }
    return false;
  }

  async function shareFile(t) {
    const P = plug();
    if (!(P.Share && P.Filesystem)) return false;
    const r = await P.Filesystem.writeFile({ path: 'emex-result-' + Date.now() + '.txt', data: t + TAG, directory: 'CACHE', encoding: 'utf8' });
    await P.Share.share({ title: 'Emex result', files: [r.uri], dialogTitle: 'Share file' });
    return true;
  }

  async function copy(t) {
    try { await navigator.clipboard.writeText(t + TAG); return true; } catch (e) { return false; }
  }

  /* runs before the Boost click handler and replaces it for the Share buttons */
  B.addEventListener('click', async e => {
    const el = e.target, a = el.dataset && el.dataset.a;
    if (a !== 'share' && a !== 'file') return;
    e.stopPropagation(); e.preventDefault();
    const t = result(); if (!t) return;
    const old = el.textContent;
    try {
      const ok = a === 'share' ? await shareText(t) : await shareFile(t);
      if (!ok) throw new Error('no share');
    } catch (err) {
      if (/cancel|abort/i.test(String((err && err.message) || err))) return;
      el.textContent = (await copy(t)) ? 'Copied ✓ (share not available)' : 'Share failed';
      setTimeout(() => { el.textContent = old; }, 2200);
    }
  }, true);

  /* add a "Share as file" button next to Copy and Share (for Files by Google, Drive, etc.) */
  new MutationObserver(() => {
    const bx = B.querySelector('#bx');
    if (bx && !bx.querySelector('[data-a=file]')) {
      const b = document.createElement('button');
      b.className = 'eh-b'; b.dataset.a = 'file'; b.textContent = 'Share as file'; b.style.gridColumn = '1 / -1';
      bx.appendChild(b);
    }
  }).observe(B, { childList: true, subtree: true });
})();
