/* Emex Mascot v1 - Zap the study cheetah: greeting, tips, study streak, daily challenge (load after emex-home.js) */
(function () {
  'use strict';
  const B = document.getElementById('ehc');
  if (!B) return;
  const ld = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const fmt = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const today = () => fmt(new Date()), yesterday = () => fmt(new Date(Date.now() - 864e5));
  const f = n => String(+n.toPrecision(4));

  const TIPS = [
    "Ohm's law: V = I × R. Cover the one you want and the other two show the formula.",
    'Resistors in parallel always give less than the smallest one.',
    'Series: the current is the same everywhere. Parallel: the voltage is the same.',
    'A capacitor blocks DC and passes AC. An inductor does the opposite.',
    'At resonance XL = Xc, so a series RLC circuit behaves like just R.',
    'Power factor is cos φ, where φ is the angle between voltage and current.',
    "Nigeria's mains supply is 230 V at 50 Hz.",
    'Study tip: try 3 practice problems before reading the solution. The struggle is where you learn.',
    'Study tip: 25 minutes of focus, then a 5 minute break, works well for revision.',
    '1 kWh = 3.6 MJ.',
    'A transformer only works on AC because it needs a changing magnetic flux.',
    'Always write your units. Examiners notice.',
    'Nyquist: sample at least twice the highest frequency in your signal.',
    'For a sine wave, peak = RMS × 1.414.'
  ];

  const SVG = '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="26" cy="34" r="13" fill="#e8a93a"/><circle cx="26" cy="34" r="6" fill="#7a4b1a"/><circle cx="94" cy="34" r="13" fill="#e8a93a"/><circle cx="94" cy="34" r="6" fill="#7a4b1a"/>' +
    '<ellipse cx="60" cy="64" rx="44" ry="40" fill="#f6c453"/>' +
    '<g fill="#7a4b1a"><circle cx="46" cy="46" r="2.4"/><circle cx="60" cy="44" r="2.4"/><circle cx="74" cy="46" r="2.4"/><circle cx="38" cy="56" r="2.4"/><circle cx="82" cy="56" r="2.4"/><circle cx="26" cy="72" r="2.2"/><circle cx="94" cy="72" r="2.2"/><circle cx="31" cy="86" r="2.2"/><circle cx="89" cy="86" r="2.2"/></g>' +
    '<path d="M44 71 Q38 82 40 96" stroke="#2b1d0e" stroke-width="4.5" stroke-linecap="round" fill="none"/><path d="M76 71 Q82 82 80 96" stroke="#2b1d0e" stroke-width="4.5" stroke-linecap="round" fill="none"/>' +
    '<ellipse cx="60" cy="84" rx="21" ry="15" fill="#fff7e0"/><circle cx="31" cy="80" r="5" fill="#f28b82" opacity=".45"/><circle cx="89" cy="80" r="5" fill="#f28b82" opacity=".45"/>' +
    '<g id="zp-eyes"><circle cx="44" cy="62" r="8.5" fill="#fff" stroke="#2b1d0e" stroke-width="1"/><circle cx="76" cy="62" r="8.5" fill="#fff" stroke="#2b1d0e" stroke-width="1"/><circle cx="45" cy="63" r="4.4" fill="#2b1d0e"/><circle cx="77" cy="63" r="4.4" fill="#2b1d0e"/><circle cx="46.5" cy="61" r="1.5" fill="#fff"/><circle cx="78.5" cy="61" r="1.5" fill="#fff"/></g>' +
    '<g id="zp-happy" style="display:none" stroke="#2b1d0e" stroke-width="3.6" stroke-linecap="round" fill="none"><path d="M35 65 Q44 53 53 65"/><path d="M67 65 Q76 53 85 65"/></g>' +
    '<ellipse cx="60" cy="76" rx="6.5" ry="4.5" fill="#2b1d0e"/><path d="M60 80.5 V86 M60 86 Q53 94 46 88 M60 86 Q67 94 74 88" stroke="#2b1d0e" stroke-width="2.4" stroke-linecap="round" fill="none"/>' +
    '<path d="M40 26 v12 q20 10 40 0 v-12" fill="#2a3a63"/><polygon points="60,6 98,20 60,34 22,20" fill="#1f2a44"/><polygon points="63,11 55,22 60,22 57,30 67,19 62,19" fill="#fbbf24"/><line x1="98" y1="20" x2="98" y2="40" stroke="#fbbf24" stroke-width="2"/><circle cx="98" cy="42" r="3.2" fill="#fbbf24"/></svg>';

  const st = document.createElement('style');
  st.textContent = '.zp{background:linear-gradient(135deg,#2563eb22,#7c3aed22);border:1px solid #8884;border-radius:16px;padding:12px;margin-bottom:10px;position:relative}.zp-top{display:flex;gap:10px;align-items:center}.zp-m{width:88px;height:88px;flex:none;cursor:pointer;animation:zpb 3s ease-in-out infinite}.zp-m svg{width:100%;height:100%}#zp-eyes{animation:zpk 4s infinite;transform-box:fill-box;transform-origin:center}.zp-b{flex:1;background:#8882;border-radius:14px;padding:10px;font-size:13px;line-height:1.35}.zp-b b{display:block;font-size:14px;margin-bottom:2px}.zp-s{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.zp-s span{font-size:11px;padding:3px 8px;border-radius:10px;background:#8883}.zp-j{animation:zpj .8s}.zp-ch{margin-top:8px;font-size:14px}.zp-ch .zq{margin-bottom:6px}.zp-x{position:absolute;pointer-events:none;font-size:18px;transition:transform .9s ease-out,opacity .9s}@keyframes zpb{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes zpk{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}@keyframes zpj{0%{transform:translateY(0) rotate(0)}30%{transform:translateY(-22px) rotate(-8deg)}60%{transform:translateY(-6px) rotate(8deg)}100%{transform:translateY(0) rotate(0)}}';
  document.head.appendChild(st);

  /* study streak and solved counter */
  const stats = () => { const s = ld('emexStats', { d: '', t: 0, total: 0 }); if (s.d !== today()) { s.d = today(); s.t = 0; } return s; };
  const streak = () => { const k = ld('emexStreak', { last: '', n: 0 }); return k.last === today() || k.last === yesterday() ? k.n : 0; };
  function active() { const k = ld('emexStreak', { last: '', n: 0 }); if (k.last === today()) return; k.n = k.last === yesterday() ? k.n + 1 : 1; k.last = today(); sv('emexStreak', k); }
  document.addEventListener('click', e => {
    const id = e.target && e.target.id; if (id !== 'pb' && id !== 'fb') return;
    setTimeout(() => {
      const r = B.querySelector(id === 'pb' ? '#pr' : '#fr'); if (!r || /^(Fill in|Leave exactly|Could not|Enter )/.test(r.textContent)) return;
      const s = stats(); s.t++; s.total++; sv('emexStats', s); active();
    }, 0);
  });

  /* daily challenge */
  const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  function challenge() {
    const r = rng(+today().replace(/-/g, '')), pick = a => a[Math.floor(r() * a.length)], k = Math.floor(r() * 4);
    const V = pick([5, 9, 12, 24]), R = pick([100, 220, 330, 470, 1000, 2200]), I = pick([0.5, 1, 2, 3]), R2 = pick([100, 220, 330, 470, 1000]);
    if (k === 0) return { q: 'A ' + V + ' V battery is across a ' + R + ' Ω resistor. What is the current in mA?', a: V / R * 1000, u: 'mA', h: 'Hint: I = V / R, then ×1000 for mA' };
    if (k === 1) return { q: 'A device draws ' + I + ' A from a ' + V + ' V supply. How many watts is that?', a: V * I, u: 'W', h: 'Hint: P = V × I' };
    if (k === 2) return { q: 'Two resistors, ' + R + ' Ω and ' + R2 + ' Ω, are in parallel. What is the total resistance in Ω?', a: R * R2 / (R + R2), u: 'Ω', h: 'Hint: Rp = (R1 × R2) / (R1 + R2)' };
    return { q: 'A voltage divider has Vin = ' + V + ' V, R1 = ' + R + ' Ω and R2 = ' + R2 + ' Ω (R2 to ground). What is Vout in volts?', a: V * R2 / (R + R2), u: 'V', h: 'Hint: Vout = Vin × R2 / (R1 + R2)' };
  }

  /* mascot behaviour */
  let tip = new Date().getDate() % TIPS.length, tries = 0;
  const set = (head, body) => { const t = B.querySelector('#zpt'); if (t) t.innerHTML = '<b>' + head + '</b>' + body; };
  function cheer() {
    const m = B.querySelector('#zpm'), z = B.querySelector('.zp'); if (!m || !z) return;
    m.classList.add('zp-j'); B.querySelector('#zp-eyes').style.display = 'none'; B.querySelector('#zp-happy').style.display = '';
    ['🎉', '⚡', '⭐', '🎉', '⭐', '⚡', '🎊', '⭐'].forEach((c, i) => {
      const s = document.createElement('span'); s.className = 'zp-x'; s.textContent = c; s.style.left = '40px'; s.style.top = '40px'; z.appendChild(s);
      const a = (i / 8) * 6.283, d = 60 + Math.random() * 40;
      requestAnimationFrame(() => { s.style.transform = 'translate(' + Math.cos(a) * d + 'px,' + (Math.sin(a) * d - 20) + 'px)'; s.style.opacity = '0'; });
      setTimeout(() => s.remove(), 1000);
    });
    setTimeout(() => { m.classList.remove('zp-j'); const e = B.querySelector('#zp-eyes'), h = B.querySelector('#zp-happy'); if (e) e.style.display = ''; if (h) h.style.display = 'none'; }, 2200);
  }
  function build() {
    const n = streak(), s = stats(), h = new Date().getHours(), hi = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    const z = document.createElement('div'); z.className = 'zp';
    z.innerHTML = '<div class="zp-top"><div class="zp-m" id="zpm" title="Tap me!">' + SVG + '</div><div class="zp-b"><span id="zpt"></span><div class="zp-s"><span>🔥 ' + (n ? n + '-day study streak' : 'Start a streak today!') + '</span><span>✅ ' + s.t + ' solved today</span></div></div></div><button class="eh-b" id="zpc" style="margin-top:8px">⚡ Today\'s challenge</button><div class="zp-ch" id="zpq" style="display:none"></div>';
    B.insertBefore(z, B.firstChild);
    set(hi + ', engineer!', "I'm Zap. Tap me for a tip.");
    if (ld('emexChal', { d: '' }).d === today()) B.querySelector('#zpc').textContent = '✅ Challenge done. See you tomorrow!';
  }
  function visible() { const q = B.querySelector('#hmq'), all = B.querySelector('.hm-c.on[data-l=""]'); const z = B.querySelector('.zp'); if (z) z.style.display = q && !q.value && all ? '' : 'none'; }

  new MutationObserver(() => { if (B.querySelector('#hmq') && !B.querySelector('.zp')) { build(); visible(); } }).observe(B, { childList: true, subtree: true });
  B.addEventListener('input', e => { if (e.target.id === 'hmq') visible(); });
  B.addEventListener('click', e => {
    const t = e.target.closest('button, .zp-m'); if (!t) return;
    if (t.id === 'zpm' || t.classList.contains('zp-m')) { tip = (tip + 1) % TIPS.length; set('Zap says:', TIPS[tip]); const m = B.querySelector('#zpm'); m.classList.remove('zp-j'); void m.offsetWidth; m.classList.add('zp-j'); setTimeout(() => m.classList.remove('zp-j'), 800); return; }
    if (t.id === 'zpc') {
      const box = B.querySelector('#zpq'); if (box.style.display !== 'none') { box.style.display = 'none'; return; }
      if (ld('emexChal', { d: '' }).d === today()) { set('You already did it!', 'Come back tomorrow for a new challenge.'); return; }
      const c = challenge(); tries = 0; box.style.display = '';
      box.innerHTML = '<div class="zq">' + c.q + '</div><input id="zpa" type="text" inputmode="decimal" placeholder="Answer in ' + c.u + '" autocomplete="off"><button class="eh-b" id="zpk">Check</button><div id="zpf"></div>';
      return;
    }
    if (t.id === 'zpk') {
      const c = challenge(), v = parseFloat(B.querySelector('#zpa').value), fb = B.querySelector('#zpf');
      if (isNaN(v)) { fb.textContent = 'Type a number first.'; return; }
      if (Math.abs(v - c.a) <= Math.max(Math.abs(c.a) * 0.02, 0.01)) {
        sv('emexChal', { d: today() }); active(); cheer(); set('Yes! Well done!', 'Answer: ' + f(c.a) + ' ' + c.u + '. +1 study day!');
        B.querySelector('#zpq').style.display = 'none'; B.querySelector('#zpc').textContent = '✅ Challenge done. See you tomorrow!';
        const sp = B.querySelector('.zp-s span'); if (sp) sp.textContent = '🔥 ' + streak() + '-day study streak';
      } else { tries++; fb.textContent = tries >= 3 ? 'The answer is ' + f(c.a) + ' ' + c.u + '. Try tomorrow\'s!' : 'Not quite. ' + c.h; set('Nearly!', 'Try again. You can do it.'); }
    }
  });
})();
