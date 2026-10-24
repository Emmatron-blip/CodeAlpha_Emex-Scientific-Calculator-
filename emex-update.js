/* Emex Update v1 - checks GitHub Releases and offers a one-tap update (needs emex-build.js, load after emex-home.js) */
(function () {
  'use strict';
  const B = document.getElementById('ehc');
  const REPO = window.EMEX_REPO, CUR = +window.EMEX_BUILD || 0;
  if (!B || !REPO || !CUR) return;
  const KEY = 'emexUpd';
  const ld = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const st = document.createElement('style');
  st.textContent = '.up{background:linear-gradient(135deg,#16a34a33,#2563eb33);border:1px solid #16a34a88;border-radius:14px;padding:10px 12px;margin-bottom:10px;font-size:14px}.up b{display:block;margin-bottom:4px}.up-v{font-size:11px;opacity:.7;text-align:center;margin:12px 0 2px}.up-v a{text-decoration:underline;cursor:pointer}';
  document.head.appendChild(st);

  async function check(force) {
    const c = ld(KEY, { t: 0, n: 0, url: '', dismissed: 0 });
    if (!force && Date.now() - c.t < 216e5) return c;
    try {
      const r = await fetch('https://api.github.com/repos/' + REPO + '/releases/latest', { headers: { Accept: 'application/vnd.github+json' } });
      if (!r.ok) throw new Error('bad');
      const d = await r.json(), m = /^b(\d+)$/.exec(d.tag_name || ''), a = (d.assets || []).find(x => /\.apk$/i.test(x.name));
      const u = { t: Date.now(), n: m ? +m[1] : 0, url: a ? a.browser_download_url : '', dismissed: c.dismissed || 0, ok: true };
      sv(KEY, u); return u;
    } catch (e) { return Object.assign({}, c, { ok: false }); }
  }
  const newer = u => u && u.n > CUR && u.url && u.url.indexOf('https://github.com/' + REPO + '/') === 0;
  function openUrl(u) { const P = window.Capacitor && window.Capacitor.Plugins; if (P && P.Browser) P.Browser.open({ url: u }); else window.open(u, '_blank'); }

  function banner(u) {
    if (B.querySelector('.up')) return;
    const d = document.createElement('div'); d.className = 'up';
    d.innerHTML = '<b>🆕 Update available (build ' + u.n + ')</b>New tools and fixes are ready. You have build ' + CUR + '.<div class="eh-g"><button class="eh-b" id="upgo">Download update</button><button class="eh-b" id="uplater" style="background:#8883;color:inherit">Later</button></div><div style="font-size:11px;opacity:.7;margin-top:4px">After it downloads, open the file and tap Install.</div>';
    B.insertBefore(d, B.firstChild);
  }

  new MutationObserver(async () => {
    if (!B.querySelector('#hmq') || B.querySelector('.up-v')) return;
    const v = document.createElement('div'); v.className = 'up-v'; v.innerHTML = 'Build ' + CUR + ' · <a id="upchk">Check for updates</a>';
    B.appendChild(v);
    const u = await check(false);
    if (newer(u) && u.dismissed !== u.n && B.querySelector('#hmq')) banner(u);
  }).observe(B, { childList: true, subtree: true });

  B.addEventListener('click', async e => {
    const id = e.target && e.target.id;
    if (id === 'upgo') { const u = ld(KEY, {}); if (newer(u)) openUrl(u.url); return; }
    if (id === 'uplater') { const u = ld(KEY, {}); u.dismissed = u.n; sv(KEY, u); const b = B.querySelector('.up'); if (b) b.remove(); return; }
    if (id === 'upchk') {
      const a = e.target; a.textContent = 'Checking…';
      const u = await check(true);
      if (newer(u)) { a.textContent = 'Update found'; banner(u); }
      else a.textContent = u.ok ? 'You have the latest version ✓' : 'Could not check. Are you online?';
      setTimeout(() => { if (a.isConnected) a.textContent = 'Check for updates'; }, 3500);
    }
  });
})();
