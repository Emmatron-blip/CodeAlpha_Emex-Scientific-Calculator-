/* Emex Launch v2 - opens on Home; the back button returns to Home; back on Home twice exits (load after emex-ref.js, before emex-fit.js) */
(function () {
  'use strict';
  const b = document.getElementById('ehb'), eh = document.getElementById('eh'), T = document.getElementById('eht');
  if (!b || !eh || !T) return;
  const css = document.createElement('style');
  css.textContent = '.eh-top{padding-top:calc(max(env(safe-area-inset-top,0px),38px) + 6px)!important}.eh-top button{min-width:44px;min-height:40px}#eht{display:none!important}';
  document.head.appendChild(css);
  b.textContent = '🏠';
  b.setAttribute('aria-label', 'Home');
  const home = () => [...T.children].find(x => x.textContent === 'Home');
  const onHome = () => { const a = T.querySelector('button.on'); return eh.classList.contains('on') && !!a && a === home(); };
  const TITLES = { Home: '⚡ Emex Tools', Pro: 'Formula Library', Formulas: 'Basic Formulas', Convert: 'Converters', Graph: 'Graph', Games: 'Games', AI: 'AI Solver', History: 'History', Theme: 'Theme', Reference: 'Reference' };
  const top = eh.querySelector('.eh-top'), title = top && top.querySelector('span'), xb = document.getElementById('ehx');
  if (top && title) {
    const back = document.createElement('button');
    back.textContent = '←'; back.setAttribute('aria-label', 'Back to Home'); back.style.display = 'none';
    title.style.flex = '1'; title.style.marginLeft = '10px';
    top.insertBefore(back, title);
    back.onclick = () => { const h = home(); if (h) h.click(); };
    const sync = () => { const a = T.querySelector('button.on'), n = a ? a.textContent : 'Home', isHome = n === 'Home'; title.textContent = TITLES[n] || n; back.style.display = isHome ? 'none' : ''; if (xb) xb.style.display = isHome ? '' : 'none'; };
    new MutationObserver(sync).observe(T, { attributes: true, subtree: true, attributeFilter: ['class'] });
    sync();
  }
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
  const boot = document.getElementById('emex-boot'); if (boot) boot.remove();
  document.addEventListener('click', () => { if (!armed) guard(); }, true);
  window.addEventListener('popstate', () => {
    armed = false;
    if (!eh.classList.contains('on')) { guard(); b.click(); return; }
    const h = home();
    if (h && !onHome()) { guard(); h.click(); return; }
    say('Press back again to exit');
  });
})();
