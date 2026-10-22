/* Emex Pro v1 - adds an AI tab and a 300L-500L + Math formula pack to Emex Tools (load after emex-hub.js) */
(function () {
  'use strict';
  const T = document.getElementById('eht'), B = document.getElementById('ehc');
  if (!T || !B) return;
  const $ = s => B.querySelector(s), PI = Math.PI;
  const ld = (k, d) => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
  const sv = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const num = v => (v === '' || v == null ? NaN : parseFloat(v));
  const f = n => (Number.isFinite(n) ? String(+n.toPrecision(6)) : '—');
  const CX = (re, im) => f(re) + (im < 0 ? ' - ' : ' + ') + f(Math.abs(im)) + 'j';
  const mk = s => new Function('x', 'with(Math){return ' + s.replace(/\^/g, '**').replace(/\blog\(/g, 'log10(').replace(/\bln\(/g, 'log(').replace(/\bpi\b/gi, 'PI') + '}');
  const S3 = Math.sqrt(3);

  /* [level, name, labels, run(n, raw), rawTextInputs] */
  const P = [
    ['300L', 'Thevenin: Rth = Voc / Isc', ['Voc (V)', 'Isc (A)'], ([v, i]) => 'Rth = ' + f(v / i) + ' Ω'],
    ['300L', 'Maximum power transfer', ['Vth (V)', 'Rth (Ω)'], ([v, r]) => 'RL = ' + f(r) + ' Ω\nPmax = ' + f(v * v / (4 * r)) + ' W'],
    ['300L', 'Stored energy ½·X·Y² (C,V or L,I)', ['C (F) or L (H)', 'V (V) or I (A)'], ([a, b]) => 'E = ' + f(.5 * a * b * b) + ' J'],
    ['300L', 'Diode (Shockley) current', ['Is (A, e.g. 1e-12)', 'V (V)', 'n (1 to 2)'], ([s, v, n]) => 'I = ' + f(s * (Math.exp(v / (n * .02585)) - 1)) + ' A (at 300 K)'],
    ['300L', 'BJT currents', ['β (gain)', 'Ib (A)'], ([b, i]) => 'Ic = ' + f(b * i) + ' A\nIe = ' + f((b + 1) * i) + ' A'],
    ['300L', 'Op-amp gain', ['Rf (Ω)', 'Rin (Ω)'], ([a, b]) => 'Inverting = ' + f(-a / b) + '\nNon-inverting = ' + f(1 + a / b)],
    ['300L', 'Series RLC: f0, Q, bandwidth', ['R (Ω)', 'L (H)', 'C (F)'], ([R, L, C]) => { const f0 = 1 / (2 * PI * Math.sqrt(L * C)), Q = Math.sqrt(L / C) / R; return 'f0 = ' + f(f0) + ' Hz\nQ = ' + f(Q) + '\nBandwidth = ' + f(f0 / Q) + ' Hz'; }],
    ['300L', 'Wavelength & skin depth (copper)', ['f (Hz)'], ([fr]) => 'λ = ' + f(3e8 / fr) + ' m\nδ = ' + f(1000 / Math.sqrt(PI * fr * 4e-7 * PI * 5.8e7)) + ' mm'],
    ['300L', 'DC motor', ['V (V)', 'Ia (A)', 'Ra (Ω)', 'Speed (rpm)'], ([v, i, r, N]) => { const Eb = v - i * r; return 'Back EMF = ' + f(Eb) + ' V\nPower = ' + f(Eb * i) + ' W\nTorque = ' + f(Eb * i / (N * 2 * PI / 60)) + ' N·m'; }],
    ['300L', 'Sampling & ADC', ['Max signal freq (Hz)', 'ADC bits', 'Vref (V)'], ([fm, b, vr]) => 'Min fs = ' + f(2 * fm) + ' Hz\nLSB = ' + f(vr / 2 ** b) + ' V\nIdeal SNR = ' + f(6.02 * b + 1.76) + ' dB'],
    ['300L', 'Transformer efficiency', ['Pout (W)', 'Core loss (W)', 'Copper loss (W)'], ([o, c, u]) => 'Efficiency = ' + f(o / (o + c + u) * 100) + ' %'],

    ['400L', 'Per-unit base values', ['Base MVA', 'Base kV', 'Actual Z (Ω)'], ([s, k, z]) => { const zb = k * k / s; return 'Zbase = ' + f(zb) + ' Ω\nZpu = ' + f(z / zb) + '\nIbase = ' + f(s * 1000 / (S3 * k)) + ' A'; }],
    ['400L', 'Fault level (MVA and kA)', ['Base MVA', 'Base kV', 'Zpu'], ([s, k, z]) => 'Fault MVA = ' + f(s / z) + '\nFault current = ' + f(s / z / (S3 * k)) + ' kA'],
    ['400L', 'Short line: Vs and regulation', ['Vr per phase (V)', 'I (A)', 'R (Ω)', 'X (Ω)', 'Load pf (lagging)'], ([v, i, R, X, pf]) => { const s = Math.sqrt(1 - pf * pf), vs = Math.hypot(v * pf + i * R, v * s + i * X); return 'Vs = ' + f(vs) + ' V\nRegulation = ' + f((vs - v) / v * 100) + ' %'; }],
    ['400L', 'Power factor correction', ['P (kW)', 'Old pf', 'Target pf', 'V (V)', 'f (Hz)'], ([p, a, b, v, fr]) => { const q = p * 1000 * (Math.tan(Math.acos(a)) - Math.tan(Math.acos(b))); return 'Qc = ' + f(q / 1000) + ' kVAR\nC = ' + f(q / (2 * PI * fr * v * v) * 1e6) + ' µF (single phase)'; }],
    ['400L', 'Induction motor speed & slip', ['Frequency (Hz)', 'Poles', 'Rotor speed (rpm)'], ([fr, p, N]) => { const Ns = 120 * fr / p, s = (Ns - N) / Ns; return 'Ns = ' + f(Ns) + ' rpm\nSlip = ' + f(s * 100) + ' %\nRotor freq = ' + f(s * fr) + ' Hz'; }],
    ['400L', 'Alternator EMF per phase', ['f (Hz)', 'Turns per phase', 'Flux per pole (Wb)', 'Winding factor'], ([fr, N, p, k]) => 'E = ' + f(4.44 * fr * N * p * k) + ' V'],
    ['400L', 'Power angle: P = (E·V/X)·sinδ', ['E (V)', 'V (V)', 'X (Ω)', 'δ (degrees)'], ([e, v, x, d]) => 'P per phase = ' + f(e * v / x * Math.sin(d * PI / 180)) + ' W'],
    ['400L', '2nd-order system response', ['ωn (rad/s)', 'ζ (0 to 1)'], ([w, z]) => 'Overshoot = ' + f(100 * Math.exp(-PI * z / Math.sqrt(1 - z * z))) + ' %\nPeak time = ' + f(PI / (w * Math.sqrt(1 - z * z))) + ' s\nSettling (2%) = ' + f(4 / (z * w)) + ' s'],
    ['400L', 'Steady-state error (step, ramp)', ['Kp', 'Kv'], ([kp, kv]) => 'Step error = ' + f(1 / (1 + kp)) + '\nRamp error = ' + f(1 / kv)],
    ['400L', 'AM power and FM bandwidth', ['Carrier power Pc (W)', 'Vmax', 'Vmin', 'Δf (Hz)', 'fm (Hz)'], ([pc, a, b, df, fm]) => { const m = (a - b) / (a + b); return 'm = ' + f(m) + '\nTotal AM power = ' + f(pc * (1 + m * m / 2)) + ' W\nFM Carson BW = ' + f(2 * (df + fm)) + ' Hz'; }],
    ['400L', 'Shannon channel capacity', ['Bandwidth (Hz)', 'SNR (dB)'], ([b, s]) => 'C = ' + f(b * Math.log2(1 + 10 ** (s / 10)) / 1e6) + ' Mbit/s'],
    ['400L', 'Friis free-space link', ['Pt (W)', 'Gt (dBi)', 'Gr (dBi)', 'f (Hz)', 'd (m)'], ([pt, gt, gr, fr, d]) => { const l = 3e8 / fr, pr = pt * 10 ** (gt / 10) * 10 ** (gr / 10) * (l / (4 * PI * d)) ** 2; return 'Pr = ' + f(pr) + ' W (' + f(10 * Math.log10(pr * 1000)) + ' dBm)\nPath loss = ' + f(20 * Math.log10(4 * PI * d / l)) + ' dB'; }],

    ['500L', 'Buck / boost converter', ['Vin (V)', 'Duty D (0 to 1)', 'L (H)', 'Switching f (Hz)'], ([v, d, L, fr]) => 'Buck Vout = ' + f(v * d) + ' V\nBuck ripple ΔIL = ' + f((v - v * d) * d / (L * fr)) + ' A\nBoost Vout = ' + f(v / (1 - d)) + ' V'],
    ['500L', 'Rectifier outputs', ['Vm peak (V)', 'Firing angle α (deg)'], ([vm, a]) => { const c = Math.cos(a * PI / 180); return '1φ half-wave Vdc = ' + f(vm / PI) + ' V\n1φ full-wave Vdc = ' + f(2 * vm / PI) + ' V\n1φ full controlled = ' + f(2 * vm * c / PI) + ' V\n3φ full bridge (Vm = line peak) = ' + f(3 * vm * c / PI) + ' V'; }],
    ['500L', 'Availability & reliability', ['MTBF (h)', 'MTTR (h)', 'Time t (h)'], ([a, b, t]) => 'Availability = ' + f(a / (a + b) * 100) + ' %\nReliability R(t) = ' + f(Math.exp(-t / a) * 100) + ' %'],
    ['500L', 'Solar PV and wind power', ['Panel area (m²)', 'Irradiance (W/m²)', 'Efficiency (0 to 1)', 'Wind speed (m/s)', 'Rotor area (m²)'], ([A, G, e, v, a]) => 'PV power = ' + f(A * G * e) + ' W\nWind power (Cp 0.4) = ' + f(.5 * 1.225 * a * v ** 3 * .4) + ' W'],
    ['500L', 'Battery bank sizing', ['Load (Wh/day)', 'Battery V', 'Depth of discharge (0 to 1)', 'Days of autonomy'], ([w, v, d, n]) => 'Capacity = ' + f(w * n / (v * d * .9)) + ' Ah (90% efficiency)'],
    ['500L', 'Cable voltage drop (3-phase)', ['I (A)', 'R (Ω/km)', 'X (Ω/km)', 'Length (km)', 'Power factor'], ([i, R, X, l, pf]) => 'Vd = ' + f(S3 * i * l * (R * pf + X * Math.sqrt(1 - pf * pf))) + ' V'],
    ['500L', 'Symmetrical components', ['Ia real', 'Ia imag', 'Ib real', 'Ib imag', 'Ic real', 'Ic imag'], ([ar, ai, br, bi, cr, ci]) => {
      const m = (x, y) => [x[0] * y[0] - x[1] * y[1], x[0] * y[1] + x[1] * y[0]], a = [-.5, .8660254], a2 = [-.5, -.8660254], A = [ar, ai], Bb = [br, bi], Cc = [cr, ci];
      const s = (x, y, z) => [(x[0] + y[0] + z[0]) / 3, (x[1] + y[1] + z[1]) / 3], p = z => f(Math.hypot(z[0], z[1])) + ' ∠ ' + f(Math.atan2(z[1], z[0]) * 180 / PI) + '°';
      return 'Zero seq I0 = ' + p(s(A, Bb, Cc)) + '\nPositive I1 = ' + p(s(A, m(a, Bb), m(a2, Cc))) + '\nNegative I2 = ' + p(s(A, m(a2, Bb), m(a, Cc)));
    }],

    ['Math', 'Quadratic ax² + bx + c = 0', ['a', 'b', 'c'], ([a, b, c]) => { const d = b * b - 4 * a * c; return d >= 0 ? 'x1 = ' + f((-b + Math.sqrt(d)) / (2 * a)) + '\nx2 = ' + f((-b - Math.sqrt(d)) / (2 * a)) : 'x = ' + f(-b / (2 * a)) + ' ± ' + f(Math.abs(Math.sqrt(-d) / (2 * a))) + 'j'; }],
    ['Math', '2×2 linear system', ['a1 (a1·x + b1·y = c1)', 'b1', 'c1', 'a2', 'b2', 'c2'], ([a, b, c, d, e, g]) => { const D = a * e - b * d; return D ? 'x = ' + f((c * e - b * g) / D) + '\ny = ' + f((a * g - c * d) / D) : 'No unique solution'; }],
    ['Math', 'Complex multiply and divide', ['a (real)', 'b (imag)', 'c (real)', 'd (imag)'], ([a, b, c, d]) => '(a+jb)(c+jd) = ' + CX(a * c - b * d, a * d + b * c) + '\n(a+jb)/(c+jd) = ' + CX((a * c + b * d) / (c * c + d * d), (b * c - a * d) / (c * c + d * d))],
    ['Math', 'Derivative at a point', ['f(x), e.g. x^3 + 2*x', 'x value'], (n, r) => { const g = mk(r[0]), x = n[1], h = 1e-5; return "f'(x) ≈ " + f((g(x + h) - g(x - h)) / (2 * h)); }, 1],
    ['Math', 'Definite integral (Simpson)', ['f(x), e.g. sin(x)', 'from a', 'to b'], (n, r) => { const g = mk(r[0]), a = n[1], b = n[2], N = 1000, h = (b - a) / N; let s = g(a) + g(b); for (let i = 1; i < N; i++) s += g(a + i * h) * (i % 2 ? 4 : 2); return '∫ ≈ ' + f(s * h / 3); }, 1],
    ['Math', 'Root finder (Newton)', ['f(x), e.g. x^2 - 2', 'Starting guess'], (n, r) => { const g = mk(r[0]); let x = n[1]; for (let i = 0; i < 60; i++) { const h = 1e-6, d = (g(x + h) - g(x - h)) / (2 * h), y = x - g(x) / d; if (!isFinite(y)) break; if (Math.abs(y - x) < 1e-12) { x = y; break; } x = y; } return 'x ≈ ' + f(x) + '\nf(x) = ' + f(g(x)); }, 1],
    ['Math', 'Statistics', ['Numbers, comma separated'], (n, r) => { const a = r[0].split(',').map(parseFloat).filter(isFinite).sort((p, q) => p - q), k = a.length; if (k < 2) return 'Enter 2 or more numbers'; const m = a.reduce((p, q) => p + q) / k, v = a.reduce((p, q) => p + (q - m) ** 2, 0) / (k - 1); return 'n = ' + k + '\nMean = ' + f(m) + '\nMedian = ' + f(k % 2 ? a[(k - 1) / 2] : (a[k / 2 - 1] + a[k / 2]) / 2) + '\nStd dev (sample) = ' + f(Math.sqrt(v)) + '\nRMS = ' + f(Math.sqrt(a.reduce((p, q) => p + q * q, 0) / k)); }, 1],
    ['Math', 'n!, nPr and nCr', ['n', 'r'], ([n, r]) => { const fa = x => (x < 2 ? 1 : x * fa(x - 1)); return 'n! = ' + f(fa(n)) + '\nnPr = ' + f(fa(n) / fa(n - r)) + '\nnCr = ' + f(fa(n) / (fa(r) * fa(n - r))); }],
    ['Math', 'Number base converter', ['Decimal integer'], ([d]) => { const i = Math.trunc(d); return 'Binary: ' + i.toString(2) + '\nOctal: ' + i.toString(8) + '\nHex: ' + i.toString(16).toUpperCase(); }]
  ];

  /* ---------- offline smart solver ---------- */
  const NM = { v: 'V', i: 'I', r: 'R', p: 'P', c: 'C', l: 'L', f: 'f', xc: 'Xc', xl: 'Xl' };
  const SI = { p: 1e-12, n: 1e-9, u: 1e-6, 'µ': 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9 };
  const UN = { I: 'A', V: 'V', R: 'Ω', P: 'W', Xc: 'Ω', Xl: 'Ω', f0: 'Hz', tau: 's' };
  const RL = [
    ['I', ['V', 'R'], (v, r) => v / r, 'I = V/R'], ['I', ['P', 'V'], (p, v) => p / v, 'I = P/V'], ['I', ['P', 'R'], (p, r) => Math.sqrt(p / r), 'I = √(P/R)'],
    ['V', ['I', 'R'], (i, r) => i * r, 'V = I·R'], ['V', ['P', 'I'], (p, i) => p / i, 'V = P/I'], ['V', ['P', 'R'], (p, r) => Math.sqrt(p * r), 'V = √(P·R)'],
    ['R', ['V', 'I'], (v, i) => v / i, 'R = V/I'], ['R', ['V', 'P'], (v, p) => v * v / p, 'R = V²/P'], ['R', ['P', 'I'], (p, i) => p / (i * i), 'R = P/I²'],
    ['P', ['V', 'I'], (v, i) => v * i, 'P = V·I'], ['P', ['I', 'R'], (i, r) => i * i * r, 'P = I²·R'], ['P', ['V', 'R'], (v, r) => v * v / r, 'P = V²/R'],
    ['Xc', ['f', 'C'], (fr, c) => 1 / (2 * PI * fr * c), 'Xc = 1/(2πfC)'], ['Xl', ['f', 'L'], (fr, l) => 2 * PI * fr * l, 'XL = 2πfL'],
    ['f0', ['L', 'C'], (l, c) => 1 / (2 * PI * Math.sqrt(l * c)), 'f0 = 1/(2π√(LC))'], ['tau', ['R', 'C'], (r, c) => r * c, 'τ = R·C']
  ];
  function smart(q) {
    const K = {}, re = /([a-z][a-z0-9]*)\s*=\s*(-?\d*\.?\d+(?:e-?\d+)?)([pnuµmkKMG])?/gi;
    let m;
    while ((m = re.exec(q))) { const k = NM[m[1].toLowerCase()]; if (k) K[k] = parseFloat(m[2]) * (m[3] ? SI[m[3]] : 1); }
    let t = null;
    const w = /(?:find|calc\w*|solve(?: for)?|what(?:'s| is)?|determine)\s+(?:the\s+)?([a-z][a-z0-9]*)/i.exec(q);
    if (w && NM[w[1].toLowerCase()]) t = NM[w[1].toLowerCase()];
    if (/resonan/i.test(q)) t = 'f0'; else if (/time constant|\btau\b/i.test(q)) t = 'tau';
    const out = [], seen = {};
    RL.forEach(([tg, need, fn, txt]) => {
      if ((t && tg !== t) || (!t && K[tg] !== undefined) || seen[tg]) return;
      if (need.every(x => K[x] !== undefined)) { const v = fn(...need.map(x => K[x])); if (isFinite(v)) { seen[tg] = 1; out.push(txt + ' = ' + f(v) + ' ' + UN[tg]); } }
    });
    return out.length ? out.join('\n') : 'I need more values. Examples:\nV=12 R=470 find I\nP=60 V=230 find R\nL=10m C=100u resonant frequency\nf=50 C=100u find Xc';
  }
  if (typeof window !== 'undefined') window.EmexPro = { P, smart };

  /* ---------- tabs ---------- */
  function addTab(n, fn) {
    const b = document.createElement('button');
    b.textContent = n;
    b.onclick = () => { [...T.children].forEach(x => x.classList.remove('on')); b.classList.add('on'); B.innerHTML = ''; fn(); };
    T.appendChild(b);
  }

  function tPro() {
    B.innerHTML = '<label>Level</label><select id="pc"><option>300L</option><option>400L</option><option>500L</option><option>Math</option></select><label>Formula</label><select id="pf"></select><div id="pi"></div><button class="eh-b" id="pb">Solve</button><div class="eh-r" id="pr">Fill in the values and tap Solve.</div>';
    const pc = $('#pc'), pf = $('#pf'), pi = $('#pi');
    function draw() {
      const x = P[pf.value];
      pi.innerHTML = x[2].map(l => '<label>' + l + '</label><input ' + (x[4] ? 'type="text" autocapitalize="off"' : 'type="number" step="any"') + '>').join('');
      $('#pr').textContent = 'Fill in the values and tap Solve.';
    }
    function cat() { pf.innerHTML = P.map((x, i) => x[0] === pc.value ? '<option value="' + i + '">' + x[1] + '</option>' : '').join(''); draw(); }
    pc.onchange = cat; pf.onchange = draw; cat();
    $('#pb').onclick = () => {
      const x = P[pf.value], r = [...pi.querySelectorAll('input')].map(i => i.value), n = r.map(num);
      let o;
      if (!x[4] && n.some(isNaN)) o = 'Fill in every field.';
      else try { o = x[3](n, r); } catch (e) { o = 'Could not calculate. Check your values.'; }
      $('#pr').textContent = o;
    };
  }

  const H = [];
  async function ask(q) {
    const u = ld('emexAiUrl', ''), t = ld('emexAiTok', '');
    if (!u) return 'AI is not set up yet. Open "AI setup" below and paste your proxy URL. Smart Solve works offline in the meantime.';
    H.push({ role: 'user', content: q });
    try {
      const r = await fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-App-Token': t }, body: JSON.stringify({ messages: H.slice(-8) }) });
      const d = await r.json(), a = d.text || d.error || 'No reply';
      H.push({ role: 'assistant', content: a });
      return a;
    } catch (e) { H.pop(); return 'Could not reach the AI. Check your internet connection and proxy URL.'; }
  }

  function tAI() {
    B.innerHTML = '<label>Ask an engineering question, or type values like: V=12 R=470 find I</label><textarea id="aq" rows="4" style="width:100%;padding:10px;margin:4px 0 10px;border-radius:10px;border:1px solid #8886;background:#8881;color:var(--efg);font-size:16px"></textarea><div class="eh-g"><button class="eh-b" id="as">Smart Solve (offline)</button><button class="eh-b" id="aa">Ask AI (online)</button></div><div class="eh-r" id="ar">Smart Solve handles circuit values without internet. Ask AI explains and solves anything, once set up.</div><details style="margin-top:14px"><summary>AI setup</summary><label>Proxy URL</label><input id="au" type="url" autocapitalize="off"><label>App token</label><input id="at" type="password"><button class="eh-b" id="ak">Save</button></details>';
    $('#au').value = ld('emexAiUrl', ''); $('#at').value = ld('emexAiTok', '');
    $('#as').onclick = () => { $('#ar').textContent = smart($('#aq').value); };
    $('#aa').onclick = async () => {
      const q = $('#aq').value.trim(); if (!q) return;
      $('#ar').textContent = 'Thinking...';
      $('#ar').textContent = await ask(q);
    };
    $('#ak').onclick = () => { sv('emexAiUrl', $('#au').value.trim()); sv('emexAiTok', $('#at').value.trim()); $('#ar').textContent = 'Saved.'; };
  }

  addTab('AI', tAI);
  addTab('Pro', tPro);
})();
