/* Emex Tools Hub v1 - adds a floating menu with extra tools on top of the calculator */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const ld = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const num = v => (v === '' || v == null ? NaN : parseFloat(v));
  const f = n => (Number.isFinite(n) ? String(+n.toPrecision(6)) : '—');
  const PI = Math.PI;

  /* ---------- styles ---------- */
  const st = document.createElement('style');
  st.textContent = `
#ehb{position:fixed;right:16px;bottom:16px;width:54px;height:54px;border-radius:50%;border:0;color:#fff;font-size:24px;z-index:99998;background:linear-gradient(135deg,var(--ea,#2563eb),var(--eb,#7c3aed));box-shadow:0 4px 14px #0006}
#eh{position:fixed;inset:0;z-index:99999;display:none;flex-direction:column;background:var(--ebg,#0f172a);color:var(--efg,#e2e8f0);font:15px system-ui,sans-serif}
#eh.on{display:flex}
#eh *{box-sizing:border-box}
.eh-top{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:linear-gradient(135deg,var(--ea),var(--eb));color:#fff;font-weight:700}
.eh-top button{background:#fff3;border:0;color:#fff;font-size:20px;border-radius:8px;padding:2px 10px}
.eh-tabs{display:flex;overflow-x:auto;gap:6px;padding:8px}
.eh-tabs button{flex:none;padding:8px 14px;border-radius:20px;border:1px solid #8884;background:transparent;color:var(--efg)}
.eh-tabs button.on{background:var(--ea);color:#fff;border-color:var(--ea)}
#ehc{flex:1;overflow:auto;padding:12px}
#eh input,#eh select{width:100%;padding:10px;margin:4px 0 10px;border-radius:10px;border:1px solid #8886;background:#8881;color:var(--efg);font-size:16px}
#eh select option{color:#000}
#eh label{font-size:12px;opacity:.8}
.eh-b{width:100%;padding:12px;border:0;border-radius:10px;color:#fff;background:var(--ea);font-size:16px;margin:4px 0}
.eh-r{padding:12px;border-radius:10px;background:#8882;white-space:pre-wrap;margin-top:8px;font-family:monospace}
.eh-o{display:block;width:100%;text-align:left;padding:12px;margin:6px 0;border-radius:10px;border:1px solid #8886;background:transparent;color:var(--efg);font-size:15px}
.eh-g{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.eh-sw{padding:14px 6px;border:0;border-radius:10px;color:#fff;font-weight:700}
#ehcv{width:100%;height:auto;border:1px solid #8886;border-radius:10px;margin-top:8px}`;
  document.head.appendChild(st);

  /* ---------- themes ---------- */
  const TH = {
    Royal: ['#2563eb', '#7c3aed', '#0f172a', '#e2e8f0'],
    Light: ['#2563eb', '#7c3aed', '#f1f5f9', '#0f172a'],
    Forest: ['#059669', '#0d9488', '#06201a', '#d1fae5'],
    Sunset: ['#ea580c', '#db2777', '#1c1017', '#ffe4e6'],
    Mono: ['#64748b', '#334155', '#0b0b0c', '#e5e7eb']
  };
  let theme = ld('emexTheme', TH.Royal);
  function applyTheme(t) {
    theme = t; sv('emexTheme', t);
    const s = document.documentElement.style;
    s.setProperty('--ea', t[0]); s.setProperty('--eb', t[1]);
    s.setProperty('--ebg', t[2]); s.setProperty('--efg', t[3]);
  }

  /* ---------- currency ---------- */
  let RATES = ld('emexRates', null);
  function loadRates() {
    fetch('https://open.er-api.com/v6/latest/USD').then(r => r.json()).then(d => {
      if (d && d.rates) { RATES = { r: d.rates, t: d.time_last_update_utc }; sv('emexRates', RATES); }
    }).catch(() => {});
  }

  /* ---------- UI shell ---------- */
  const eh = document.createElement('div');
  eh.id = 'eh';
  eh.innerHTML = '<div class="eh-top"><span>⚡ Emex Tools</span><button id="ehx">✕</button></div><div class="eh-tabs" id="eht"></div><div id="ehc"></div>';
  const btn = document.createElement('button');
  btn.id = 'ehb'; btn.textContent = '⚡'; btn.setAttribute('aria-label', 'Emex Tools');
  document.body.appendChild(eh); document.body.appendChild(btn);
  applyTheme(theme);
  const body = $('#ehc');
  const TABS = [['Convert', tConv], ['Formulas', tForm], ['Graph', tGraph], ['Games', tGame], ['Theme', tTheme]];
  const tabs = $('#eht');
  TABS.forEach(([n, fn]) => {
    const b = document.createElement('button');
    b.textContent = n;
    b.onclick = () => { [...tabs.children].forEach(x => x.classList.remove('on')); b.classList.add('on'); body.innerHTML = ''; fn(); };
    tabs.appendChild(b);
  });
  btn.onclick = () => { eh.classList.add('on'); loadRates(); if (!$('.on', tabs)) tabs.children[0].click(); };
  $('#ehx').onclick = () => eh.classList.remove('on');

  /* ---------- Convert ---------- */
  const U = {
    Length: { m: 1, km: 1e3, cm: .01, mm: .001, mile: 1609.344, ft: .3048, inch: .0254 },
    Mass: { kg: 1, g: .001, lb: .45359237, oz: .0283495 },
    Energy: { J: 1, kJ: 1e3, Wh: 3600, kWh: 3.6e6, cal: 4.184 },
    Pressure: { Pa: 1, kPa: 1e3, bar: 1e5, psi: 6894.76, atm: 101325 },
    Speed: { 'm/s': 1, 'km/h': 1 / 3.6, mph: .44704, knot: .514444 },
    Data: { B: 1, KB: 1024, MB: 1048576, GB: 1073741824 },
    Temperature: { C: 1, F: 1, K: 1 },
    Currency: {}
  };
  const opts = a => a.map(x => '<option>' + x + '</option>').join('');
  function tConv() {
    body.innerHTML = '<label>Category</label><select id="cc">' + opts(Object.keys(U)) + '</select><label>Amount</label><input id="ca" type="number" value="1"><label>From</label><select id="cf"></select><label>To</label><select id="ct"></select><div class="eh-r" id="cr"></div><div id="cn" style="font-size:12px;opacity:.7;margin-top:6px"></div>';
    const cc = $('#cc'), ca = $('#ca'), cf = $('#cf'), ct = $('#ct'), cr = $('#cr');
    function units() {
      let list;
      if (cc.value === 'Currency') {
        if (!RATES) { cf.innerHTML = ct.innerHTML = ''; cr.textContent = 'Rates not loaded yet. Connect to the internet, then reopen this tab.'; return; }
        const top = ['USD', 'NGN', 'EUR', 'GBP', 'GHS', 'ZAR', 'KES', 'CAD', 'CNY', 'INR', 'JPY', 'AED'];
        list = top.filter(c => RATES.r[c]).concat(Object.keys(RATES.r).filter(c => !top.includes(c)).sort());
        $('#cn').textContent = 'Rates updated: ' + RATES.t;
      } else { list = Object.keys(U[cc.value]); $('#cn').textContent = ''; }
      cf.innerHTML = ct.innerHTML = opts(list);
      ct.selectedIndex = list.length > 1 ? 1 : 0;
      calc();
    }
    function calc() {
      const v = num(ca.value), a = cf.value, b = ct.value;
      if (isNaN(v) || !a) return;
      let out;
      if (cc.value === 'Temperature') {
        const c = a === 'C' ? v : a === 'F' ? (v - 32) * 5 / 9 : v - 273.15;
        out = b === 'C' ? c : b === 'F' ? c * 9 / 5 + 32 : c + 273.15;
      } else if (cc.value === 'Currency') out = v / RATES.r[a] * RATES.r[b];
      else out = v * U[cc.value][a] / U[cc.value][b];
      cr.textContent = v + ' ' + a + ' = ' + f(out) + ' ' + b;
    }
    cc.onchange = units; ca.oninput = calc; cf.onchange = calc; ct.onchange = calc;
    units();
  }

  /* ---------- Formulas (fm = [name, labels, mode, run]; mode 0 all required, 1 leave one blank, 2 raw text) ---------- */
  const F = [
    ["Ohm's Law (leave one blank)", ['V (volts)', 'I (amps)', 'R (ohms)'], 1, ([V, I, R]) => isNaN(V) ? 'V = ' + f(I * R) + ' V' : isNaN(I) ? 'I = ' + f(V / R) + ' A' : 'R = ' + f(V / I) + ' Ω'],
    ['Power P = V·I (leave one blank)', ['P (watts)', 'V (volts)', 'I (amps)'], 1, ([P, V, I]) => isNaN(P) ? 'P = ' + f(V * I) + ' W' : isNaN(V) ? 'V = ' + f(P / I) + ' V' : 'I = ' + f(P / V) + ' A'],
    ['Resistors: series & parallel', ['Values in Ω, comma separated'], 2, (n, r) => {
      const a = r[0].split(',').map(parseFloat).filter(x => x > 0);
      if (a.length < 2) return 'Enter 2 or more values, e.g. 100,220,330';
      return 'Series = ' + f(a.reduce((x, y) => x + y)) + ' Ω\nParallel = ' + f(1 / a.reduce((x, y) => x + 1 / y, 0)) + ' Ω';
    }],
    ['Voltage divider', ['Vin (V)', 'R1 (Ω)', 'R2 (Ω)'], 0, ([Vi, a, b]) => 'Vout = ' + f(Vi * b / (a + b)) + ' V\nCurrent = ' + f(Vi / (a + b)) + ' A'],
    ['Capacitive reactance Xc', ['f (Hz)', 'C (farads, e.g. 100e-6)'], 0, ([fr, C]) => 'Xc = ' + f(1 / (2 * PI * fr * C)) + ' Ω'],
    ['Inductive reactance XL', ['f (Hz)', 'L (henries, e.g. 10e-3)'], 0, ([fr, L]) => 'XL = ' + f(2 * PI * fr * L) + ' Ω'],
    ['Resonant frequency', ['L (henries)', 'C (farads)'], 0, ([L, C]) => 'f0 = ' + f(1 / (2 * PI * Math.sqrt(L * C))) + ' Hz'],
    ['RC time constant', ['R (Ω)', 'C (farads)'], 0, ([R, C]) => 'τ = ' + f(R * C) + ' s\n5τ (about 99% charged) = ' + f(5 * R * C) + ' s'],
    ['Series RLC impedance', ['R (Ω)', 'L (henries)', 'C (farads)', 'f (Hz)'], 0, ([R, L, C, fr]) => {
      const w = 2 * PI * fr, X = w * L - 1 / (w * C);
      return 'XL = ' + f(w * L) + ' Ω\nXc = ' + f(1 / (w * C)) + ' Ω\n|Z| = ' + f(Math.hypot(R, X)) + ' Ω\nPhase = ' + f(Math.atan2(X, R) * 180 / PI) + '°';
    }],
    ['Three-phase power', ['Line voltage VL (V)', 'Line current IL (A)', 'Power factor (0 to 1)'], 0, ([V, I, pf]) => {
      const S = Math.sqrt(3) * V * I;
      return 'S = ' + f(S) + ' VA\nP = ' + f(S * pf) + ' W\nQ = ' + f(S * Math.sqrt(Math.max(0, 1 - pf * pf))) + ' VAR';
    }],
    ['Rectangular → Polar', ['Real part', 'Imaginary part'], 0, ([a, b]) => 'r = ' + f(Math.hypot(a, b)) + '\nθ = ' + f(Math.atan2(b, a) * 180 / PI) + '°'],
    ['Polar → Rectangular', ['Magnitude r', 'Angle θ (degrees)'], 0, ([r, t]) => 'Re = ' + f(r * Math.cos(t * PI / 180)) + '\nIm = ' + f(r * Math.sin(t * PI / 180))],
    ['Transformer', ['Vp (V)', 'Np (primary turns)', 'Ns (secondary turns)'], 0, ([Vp, Np, Ns]) => 'Vs = ' + f(Vp * Ns / Np) + ' V'],
    ['Decibels', ['Ratio (output / input)'], 0, ([r]) => 'Power: ' + f(10 * Math.log10(r)) + ' dB\nVoltage: ' + f(20 * Math.log10(r)) + ' dB']
  ];
  function tForm() {
    body.innerHTML = '<label>Choose a formula</label><select id="fs">' + F.map((x, i) => '<option value="' + i + '">' + x[0] + '</option>').join('') + '</select><div id="fi"></div><button class="eh-b" id="fb">Solve</button><div class="eh-r" id="fr">Fill in the values and tap Solve.</div>';
    const fs = $('#fs'), fi = $('#fi');
    function draw() {
      const fm = F[fs.value];
      fi.innerHTML = fm[1].map(l => '<label>' + l + '</label><input ' + (fm[2] === 2 ? 'type="text"' : 'type="number" step="any"') + '>').join('');
      $('#fr').textContent = 'Fill in the values and tap Solve.';
    }
    fs.onchange = draw; draw();
    $('#fb').onclick = () => {
      const fm = F[fs.value], ins = [...fi.querySelectorAll('input')];
      const raw = ins.map(i => i.value), n = raw.map(num);
      let out;
      if (fm[2] === 1 && n.filter(isNaN).length !== 1) out = 'Leave exactly one field blank.';
      else if (fm[2] === 0 && n.some(isNaN)) out = 'Fill in every field.';
      else try { out = fm[3](n, raw); } catch (e) { out = 'Could not calculate. Check your values.'; }
      $('#fr').textContent = out;
    };
  }

  /* ---------- Graph ---------- */
  function tGraph() {
    body.innerHTML = '<label>y = f(x)   (use sin, cos, tan, sqrt, abs, log, ln, exp, pi, ^)</label><input id="ge" type="text" value="sin(x)" autocapitalize="off" autocorrect="off"><div class="eh-g"><div><label>x min</label><input id="gx0" type="number" value="-10"></div><div><label>x max</label><input id="gx1" type="number" value="10"></div></div><button class="eh-b" id="gp">Plot</button><canvas id="ehcv" width="600" height="420"></canvas><div class="eh-r" id="gm" style="display:none"></div>';
    function plot() {
      const msg = $('#gm'); msg.style.display = 'none';
      const ex = $('#ge').value.replace(/\^/g, '**').replace(/\blog\(/g, 'log10(').replace(/\bln\(/g, 'log(').replace(/\bpi\b/gi, 'PI');
      const x0 = num($('#gx0').value), x1 = num($('#gx1').value);
      let fn;
      try { fn = new Function('x', 'with(Math){return ' + ex + '}'); fn(1); } catch (e) { msg.textContent = 'Invalid expression. Example: x^2 - 3*x + 2'; msg.style.display = 'block'; return; }
      if (!(x1 > x0)) { msg.textContent = 'x max must be larger than x min.'; msg.style.display = 'block'; return; }
      const N = 600, pts = [], ys = [];
      for (let i = 0; i <= N; i++) {
        const x = x0 + (x1 - x0) * i / N; let y;
        try { y = fn(x); } catch (e) { y = NaN; }
        if (typeof y === 'number' && isFinite(y)) { pts.push([x, y]); ys.push(y); } else pts.push(null);
      }
      if (!ys.length) { msg.textContent = 'Nothing to plot in this range.'; msg.style.display = 'block'; return; }
      const s = ys.slice().sort((a, b) => a - b);
      let lo = s[Math.floor(s.length * .02)], hi = s[Math.min(s.length - 1, Math.floor(s.length * .98))];
      if (lo === hi) { lo -= 1; hi += 1; }
      const pad = (hi - lo) * .1; lo -= pad; hi += pad;
      const c = $('#ehcv'), g = c.getContext('2d'), W = c.width, H = c.height;
      const cs = getComputedStyle(document.documentElement);
      const ac = cs.getPropertyValue('--ea') || '#2563eb', fg = cs.getPropertyValue('--efg') || '#ddd';
      const X = x => (x - x0) / (x1 - x0) * W, Y = y => H - (y - lo) / (hi - lo) * H;
      g.clearRect(0, 0, W, H);
      g.strokeStyle = fg; g.globalAlpha = .35; g.lineWidth = 1; g.beginPath();
      if (lo < 0 && hi > 0) { g.moveTo(0, Y(0)); g.lineTo(W, Y(0)); }
      if (x0 < 0 && x1 > 0) { g.moveTo(X(0), 0); g.lineTo(X(0), H); }
      g.stroke(); g.globalAlpha = 1;
      g.strokeStyle = ac; g.lineWidth = 3; g.beginPath();
      let pen = false, py = 0;
      pts.forEach(p => {
        if (!p) { pen = false; return; }
        const px = X(p[0]), qy = Y(p[1]);
        if (!pen || Math.abs(qy - py) > H * .8) g.moveTo(px, qy); else g.lineTo(px, qy);
        pen = true; py = qy;
      });
      g.stroke();
      g.fillStyle = fg; g.font = '20px sans-serif';
      g.fillText('x: ' + f(x0) + ' to ' + f(x1), 8, H - 8);
      g.fillText('y: ' + f(lo + pad) + ' to ' + f(hi - pad), 8, 22);
    }
    $('#gp').onclick = plot; plot();
  }

  /* ---------- Games ---------- */
  const QB = [
    ['What is the unit of capacitance?', 'Farad', ['Henry', 'Ohm', 'Tesla'], 'Capacitance is measured in farads (F).'],
    ['Which law says currents at a node sum to zero?', "Kirchhoff's Current Law", ["Ohm's Law", "Kirchhoff's Voltage Law", "Faraday's Law"], 'KCL: charge is conserved at a node.'],
    ['What stays the same through every component in a series circuit?', 'Current', ['Voltage', 'Power', 'Resistance'], 'Series components share one path, so the same current flows.'],
    ['Series RLC resonance occurs when...', 'XL = Xc', ['R = 0', 'XL = 2Xc', 'V = I'], 'At resonance the reactances cancel and impedance equals R.'],
    ['What is the unit of inductance?', 'Henry', ['Farad', 'Weber', 'Siemens'], 'Inductance is measured in henries (H).'],
    ['Power factor equals the cosine of...', 'the angle between V and I', ['the turns ratio', 'the resistance', 'the frequency'], 'pf = cos φ, where φ is the phase angle between voltage and current.'],
    ['A transformer cannot work on...', 'DC', ['AC', 'Low voltage', 'High frequency'], 'A transformer needs a changing flux, which only AC provides.'],
    ['In steady state, a capacitor blocks...', 'DC', ['AC', 'Voltage', 'Charge storage'], 'Once charged, a capacitor passes no DC current.'],
    ['Two 10 Ω resistors in parallel give...', '5 Ω', ['20 Ω', '10 Ω', '100 Ω'], 'R = (10 × 10) / (10 + 10) = 5 Ω.'],
    ['Nigeria\'s mains frequency is...', '50 Hz', ['60 Hz', '100 Hz', '25 Hz'], 'Nigeria uses 50 Hz at about 230 V.'],
    ['1 kWh equals...', '3.6 MJ', ['3.6 kJ', '36 MJ', '360 J'], '1 kW × 3600 s = 3,600,000 J.'],
    ['Output of a NAND gate when both inputs are 1?', '0', ['1', 'Undefined', 'High impedance'], 'NAND is the inverse of AND: 1 AND 1 = 1, inverted to 0.'],
    ['A diode conducts when...', 'anode is more positive than cathode', ['cathode is more positive', 'it is hot', 'it has no voltage'], 'Forward bias lets current flow through a diode.']
  ];
  let sc = 0, stk = 0, best = ld('emexBest', 0);
  const shuf = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
  function tGame() {
    body.innerHTML = '<div class="eh-g"><button class="eh-b" id="g1">Concept Quiz</button><button class="eh-b" id="g2">Ohm Sprint</button></div><div id="gb"></div>';
    $('#g1').onclick = quiz; $('#g2').onclick = ohm; quiz();
  }
  function score() { return '<div style="opacity:.8;margin:8px 0">Score: ' + sc + '  |  Streak: ' + stk + '  |  Best streak: ' + best + '</div>'; }
  function quiz() {
    const q = QB[Math.floor(Math.random() * QB.length)], gb = $('#gb');
    gb.innerHTML = score() + '<div style="font-weight:700;margin-bottom:6px">' + q[0] + '</div>' + shuf([q[1]].concat(q[2])).map(o => '<button class="eh-o">' + o + '</button>').join('') + '<div class="eh-r" id="qx" style="display:none"></div>';
    let done = false;
    [...gb.querySelectorAll('.eh-o')].forEach(b => b.onclick = () => {
      if (done) return; done = true;
      const ok = b.textContent === q[1];
      if (ok) { sc++; stk++; if (stk > best) { best = stk; sv('emexBest', best); } } else stk = 0;
      b.style.background = ok ? '#16a34a' : '#dc2626'; b.style.color = '#fff';
      const x = $('#qx'); x.style.display = 'block'; x.innerHTML = (ok ? '✅ Correct! ' : '❌ Answer: ' + q[1] + '. ') + q[3] + '<br><button class="eh-b" id="qn">Next</button>';
      $('#qn').onclick = quiz;
    });
  }
  function ohm() {
    const V = [5, 9, 12, 24][Math.floor(Math.random() * 4)], R = [10, 47, 100, 220, 470, 1000][Math.floor(Math.random() * 6)], gb = $('#gb');
    gb.innerHTML = score() + '<div style="font-weight:700">A ' + V + ' V supply is across a ' + R + ' Ω resistor.<br>What is the current in mA?</div><input id="oa" type="number" step="any"><button class="eh-b" id="ob">Check</button><div class="eh-r" id="ox" style="display:none"></div>';
    $('#ob').onclick = () => {
      const a = num($('#oa').value), c = V / R * 1000, ok = Math.abs(a - c) <= c * .02;
      if (ok) { sc++; stk++; if (stk > best) { best = stk; sv('emexBest', best); } } else stk = 0;
      const x = $('#ox'); x.style.display = 'block';
      x.innerHTML = (ok ? '✅ Correct! ' : '❌ Not quite. ') + 'I = V / R = ' + V + ' / ' + R + ' = ' + f(c) + ' mA<br><button class="eh-b" id="on">Next</button>';
      $('#on').onclick = ohm;
    };
  }

  /* ---------- Theme ---------- */
  function tTheme() {
    body.innerHTML = '<label>Pick a theme</label><div class="eh-g">' + Object.keys(TH).map(k => '<button class="eh-sw" data-t="' + k + '" style="background:linear-gradient(135deg,' + TH[k][0] + ',' + TH[k][1] + ')">' + k + '</button>').join('') + '</div><label style="display:block;margin-top:14px">Or choose your own accent colour</label><input id="tc" type="color" value="' + (theme[0].length === 7 ? theme[0] : '#2563eb') + '"><div class="eh-r">These colours apply to the Emex Tools menu and its graphs. Your choice is saved on this phone.</div>';
    body.querySelectorAll('.eh-sw').forEach(b => b.onclick = () => applyTheme(TH[b.dataset.t]));
    $('#tc').oninput = e => applyTheme([e.target.value, e.target.value, theme[2], theme[3]]);
  }
})();
