/* Emex Home v1 - Home screen with search across all formulas, level filters, favourites and recent (load after the packs) */
(function () {
  'use strict';
  const T = document.getElementById('eht'), B = document.getElementById('ehc');
  if (!T || !B || !window.EmexPro) return;
  const P = window.EmexPro.P;
  const ld = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const HUB = ["Ohm's Law (leave one blank)", 'Power P = V·I (leave one blank)', 'Resistors: series & parallel', 'Voltage divider', 'Capacitive reactance Xc', 'Inductive reactance XL', 'Resonant frequency', 'RC time constant', 'Series RLC impedance', 'Three-phase power', 'Rectangular → Polar', 'Polar → Rectangular', 'Transformer', 'Decibels'];
  const TILES = [['🧮', 'Calculator', ''], ['📚', 'Formula Library', 'Pro'], ['⚡', 'Basic Formulas', 'Formulas'], ['🔄', 'Converters', 'Convert'], ['📈', 'Graph', 'Graph'], ['🎮', 'Games', 'Games'], ['🤖', 'AI Solver', 'AI'], ['🕘', 'History', 'History'], ['🎨', 'Theme', 'Theme']];
  let level = '', query = '';

  const st = document.createElement('style');
  st.textContent = '.hm-g{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}.hm-t{padding:14px 4px;border-radius:14px;border:1px solid #8884;background:#8881;color:var(--efg);font-size:12px;text-align:center}.hm-t b{display:block;font-size:24px;margin-bottom:4px;font-weight:400}.hm-ch{display:flex;gap:6px;overflow-x:auto;margin:2px 0 8px}.hm-c{flex:none;padding:6px 12px;border-radius:16px;border:1px solid #8884;background:transparent;color:var(--efg);font-size:13px}.hm-c.on{background:var(--ea);color:#fff;border-color:var(--ea)}.hm-r{display:flex;justify-content:space-between;gap:8px;align-items:center}.hm-b{font-size:11px;opacity:.7;flex:none}.hm-h{font-size:12px;opacity:.7;margin:12px 0 2px}';
  document.head.appendChild(st);

  const items = () => HUB.map(n => ({ n, l: 'Core', hub: 1, h: n.toLowerCase() })).concat(P.map((e, i) => ({ n: e[1], l: e[0], i, h: (e[1] + ' ' + e[2].join(' ')).toLowerCase() })));
  const tab = name => { const b = [...T.children].find(x => x.textContent === name); if (b) b.click(); };
  const row = (it, k, star) => '<button class="eh-o" data-k="' + k + '"><span class="hm-r"><span>' + (star ? '★ ' : '') + esc(it.n) + '</span><span class="hm-b">' + it.l + '</span></span></button>';

  function open(it) {
    if (it.hub) {
      tab('Formulas');
      setTimeout(() => { const fs = B.querySelector('#fs'); if (!fs) return; const o = [...fs.options].find(x => x.textContent === it.n); if (o) { fs.value = o.value; fs.dispatchEvent(new Event('change')); } }, 60);
    } else {
      tab('Pro');
      setTimeout(() => {
        const pc = B.querySelector('#pc'), pf = B.querySelector('#pf'); if (!pc || !pf) return;
        pc.value = it.l; pc.dispatchEvent(new Event('change')); pf.value = String(it.i); pf.dispatchEvent(new Event('change'));
      }, 60);
    }
  }

  function render() {
    const all = items(), favs = ld('emexFav', []), rec = ld('emexRecent', []);
    const levels = ['Core', '100L', '200L', '300L', '400L', '500L', 'Math'].filter(l => all.some(x => x.l === l));
    let h = '<input id="hmq" type="search" placeholder="Search ' + all.length + ' formulas" autocomplete="off" autocapitalize="off">';
    h += '<div class="hm-ch"><button class="hm-c' + (level ? '' : ' on') + '" data-l="">All</button>' + levels.map(l => '<button class="hm-c' + (level === l ? ' on' : '') + '" data-l="' + l + '">' + l + '</button>').join('') + '</div><div id="hmo"></div>';
    B.innerHTML = h;
    const q = B.querySelector('#hmq'); q.value = query;
    const out = B.querySelector('#hmo');
    function list() {
      query = q.value; const words = query.toLowerCase().split(/\s+/).filter(Boolean), cur = items();
      if (!words.length && !level) {
        let s = '<div class="hm-g">' + TILES.map(t => '<button class="hm-t" data-t="' + t[2] + '"><b>' + t[0] + '</b>' + t[1] + '</button>').join('') + '</div>';
        const fi = favs.map(n => cur.find(x => x.n === n)).filter(Boolean), ri = rec.map(n => cur.find(x => x.n === n)).filter(Boolean);
        if (fi.length) s += '<div class="hm-h">FAVOURITES</div>' + fi.map(x => row(x, cur.indexOf(x), 1)).join('');
        if (ri.length) s += '<div class="hm-h">RECENT</div>' + ri.map(x => row(x, cur.indexOf(x))).join('');
        if (!fi.length && !ri.length) s += '<div class="eh-r">Search above, or open the Formula Library. Tap ☆ on any formula to keep it here.</div>';
        out.innerHTML = s; return;
      }
      let res = cur.filter(x => (!level || x.l === level) && words.every(w => x.h.includes(w)));
      res.sort((a, b) => (words.length && a.n.toLowerCase().includes(words[0]) ? 0 : 1) - (words.length && b.n.toLowerCase().includes(words[0]) ? 0 : 1));
      const shown = res.slice(0, 80);
      out.innerHTML = (shown.length ? '<div class="hm-h">' + res.length + ' RESULT' + (res.length === 1 ? '' : 'S') + '</div>' + shown.map(x => row(x, cur.indexOf(x), favs.includes(x.n))).join('') + (res.length > 80 ? '<div class="eh-r">Showing 80. Type more to narrow down.</div>' : '') : '<div class="eh-r">Nothing found. Try a shorter word, like "motor" or "filter".</div>');
    }
    q.oninput = list; list();
  }

  B.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.l !== undefined && t.classList.contains('hm-c')) { level = t.dataset.l; render(); return; }
    if (t.dataset.t !== undefined && t.classList.contains('hm-t')) { if (t.dataset.t) tab(t.dataset.t); else document.getElementById('ehx').click(); return; }
    if (t.dataset.k !== undefined) { const it = items()[+t.dataset.k]; if (it) open(it); return; }
    if (t.id === 'hmfav') {
      const pf = B.querySelector('#pf'); if (!pf) return; const n = P[pf.value][1], f = ld('emexFav', []), k = f.indexOf(n);
      if (k >= 0) f.splice(k, 1); else f.unshift(n); sv('emexFav', f.slice(0, 40)); favLabel(); return;
    }
    if (t.id === 'pb') { const pf = B.querySelector('#pf'); if (pf && P[pf.value]) { const n = P[pf.value][1], r = ld('emexRecent', []).filter(x => x !== n); r.unshift(n); sv('emexRecent', r.slice(0, 8)); } }
  });
  B.addEventListener('change', () => setTimeout(favLabel, 0));

  /* star button in the Formula Library screen */
  function favLabel() {
    const b = B.querySelector('#hmfav'), pf = B.querySelector('#pf'); if (!b || !pf || !P[pf.value]) return;
    b.textContent = ld('emexFav', []).includes(P[pf.value][1]) ? '★ In favourites (tap to remove)' : '☆ Add to favourites';
  }
  new MutationObserver(() => {
    const pf = B.querySelector('#pf');
    if (pf && !B.querySelector('#hmfav')) { const b = document.createElement('button'); b.id = 'hmfav'; b.className = 'eh-b'; b.style.background = '#8883'; b.style.color = 'inherit'; pf.after(b); favLabel(); }
  }).observe(B, { childList: true, subtree: true });

  /* Home tab: first tab, and the lightning button always opens it */
  const hb = document.createElement('button');
  hb.textContent = 'Home';
  hb.onclick = () => { [...T.children].forEach(x => x.classList.remove('on')); hb.classList.add('on'); render(); };
  T.insertBefore(hb, T.firstChild);
  const lb = document.getElementById('ehb');
  if (lb) lb.addEventListener('click', () => { query = ''; level = ''; hb.click(); });
})();
