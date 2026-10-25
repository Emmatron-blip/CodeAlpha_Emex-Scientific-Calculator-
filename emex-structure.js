/* Emex Structure v1 - organises the library by topic instead of by level; optional Student view (load after the packs, before emex-home.js) */
(function () {
  'use strict';
  const B = document.getElementById('ehc');
  if (!B || !window.EmexPro) return;
  const P = window.EmexPro.P;
  const CATS = [['Circuits & Networks', 'Circuits'], ['Electrical Machines', 'Machines'], ['Power Systems', 'Power'], ['Power Electronics & Renewables', 'Renewables'], ['Electronics & Devices', 'Electronics'], ['Control Systems', 'Control'], ['Signals & Communications', 'Signals'], ['Digital & Computing', 'Digital'], ['Electromagnetics', 'EM'], ['Maths & Statistics', 'Maths'], ['Economics & Management', 'Economics'], ['AI & Data', 'AI'], ['Physics & Mechanics', 'Physics']];
  const RULES = [
    ['Maths & Statistics', /root finder|quadratic|linear system|complex|derivative|definite integral|statistics|n!|2nd-order ode|runge|lagrange|bessel|fourier series coefficients|laplace|normal distribution|regression|binomial|confidence|vector|right-angled|logarithms|rectangular|polar/],
    ['Physics & Mechanics', /kinematics|projectile|newton's|work and power|circular motion|pendulum|heat:|carnot/],
    ['AI & Data', /classification metrics|neuron|entropy|distance and similarity|softmax/],
    ['Economics & Management', /interest factors|npv|benefit-cost|depreciation|equivalent annual cost/],
    ['Digital & Computing', /base converter|two's complement|boolean|counters and memory/],
    ['Electromagnetics', /gauss|capacitance \(plane|magnetic fields|faraday|plane wave|point charge|wavelength & skin|coulomb/],
    ['Control Systems', /2nd-order system|steady-state error/],
    ['Signals & Communications', /square-wave fourier|convolution|sampling|signal energy|am power|shannon|friis|decibels/],
    ['Power Electronics & Renewables', /buck|rectifier outputs|solar|wind|hydropower|battery bank/],
    ['Electrical Machines', /transformer|dc motor|synchronous generator|induction motor|alternator/],
    ['Power Systems', /per-unit|fault level|short line|power factor correction|three-phase|cable voltage|symmetrical|power angle|availability/],
    ['Electronics & Devices', /diode|bjt|op-amp|555 timer/]
  ];
  const CODE = /^([A-Z]{3} \d{3}(?: \/ \d{3})?):\s*/;
  const strip = n => n.replace(CODE, '');
  const catOf = n => { const s = strip(n).toLowerCase(); for (const [c, r] of RULES) if (r.test(s)) return c; return 'Circuits & Networks'; };
  window.EmexCats = CATS; window.EmexOrder = CATS.map(c => c[0]); window.EmexShort = Object.fromEntries(CATS); window.EmexCatOf = catOf;

  if (!P.some(e => e[9])) P.push(['300L', '__init', [], () => '', 0, '', '', '', '', true]);
  P.forEach(e => {
    if (e[6] !== undefined) return;
    const m = CODE.exec(e[1]);
    e[6] = e[0] === 'Math' ? '' : e[0]; e[7] = m ? m[1] : ''; e[8] = strip(e[1]); e[0] = catOf(e[1]);
  });

  const stu = () => { try { return JSON.parse(localStorage.getItem('emexStudent')) === true; } catch (e) { return false; } };
  new MutationObserver(() => {
    const pc = B.querySelector('#pc');
    if (pc && pc.dataset.cats !== '1') {
      pc.dataset.cats = '1';
      const have = new Set(P.filter(e => !e[9]).map(e => e[0]));
      pc.innerHTML = window.EmexOrder.filter(c => have.has(c)).map(c => '<option>' + c.replace(/&/g, '&amp;') + '</option>').join('');
      pc.dispatchEvent(new Event('change'));
      const lb = pc.previousElementSibling; if (lb && lb.tagName === 'LABEL') lb.textContent = 'Topic';
    }
    const pf = B.querySelector('#pf');
    if (pf) [...pf.options].forEach(o => { const e = P[o.value]; if (!e || e[9]) return; const t = stu() ? e[1] : e[8]; if (o.textContent !== t) o.textContent = t; });
  }).observe(B, { childList: true, subtree: true, characterData: true });
})();
