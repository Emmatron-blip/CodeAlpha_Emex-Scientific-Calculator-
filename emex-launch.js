/* Emex Launch v2 - opens on Home; the back button returns to Home; back on Home twice exits (load after emex-ref.js, before emex-fit.js) */
(function () {
  'use strict';
  const b = document.getElementById('ehb'), eh = document.getElementById('eh'), T = document.getElementById('eht');
  if (!b || !eh || !T) return;
  b.textContent = '🏠';
  b.setAttribute('aria-label', 'Home');
  const home = () => [...T.children].find(x => x.textContent === 'Home');
  const onHome = () => { const a = T.querySelector('button.on'); return eh.classList.contains('on') && !!a && a === home(); };
  let toast;
  const say = m => {
    if (!toast) { toast = document.createElement('div'); toast.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);background:#000c;color:#fff;padding:10px 16px;border-radius:20px;font:14px system-ui,sans-serif;z-index:100000;display:none;pointer-events:none'; document.body.appendChild(toast); }
    toast.textContent = m; toast.style.display = 'block';
    clearTimeout(say.t); say.t = setTimeout(() => { toast.style.display = 'none'; }, 1800);
  };
  let armed = false;
  const guard = () => { if (armed) return; try { history.pushState({ emex: 1 }, ''); armed = true; } catch (e) {} };
  try { history.replaceState({ emex: 0 }, ''); } catch (e) {}
  guard();
  b.click();
  document.addEventListener('click', () => { if (!armed) guard(); }, true);
  window.addEventListener('popstate', () => {
    armed = false;
    if (!eh.classList.contains('on')) { guard(); b.click(); return; }
    const h = home();
    if (h && !onHome()) { guard(); h.click(); return; }
    say('Press back again to exit');
  });
})();
