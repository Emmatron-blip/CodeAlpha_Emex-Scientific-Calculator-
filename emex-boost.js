/* Emex Boost v1 - step-by-step working, unit inputs (4.7k, 100u), copy/share and history (load after emex-pro.js) */
(function () {
  'use strict';
  const T = document.getElementById('eht'), B = document.getElementById('ehc');
  if (!T || !B || !window.EmexPro) return;
  const P = window.EmexPro.P;
  const ld = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const sv = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const SI = { p: 1e-12, n: 1e-9, u: 1e-6, 'µ': 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9 };
  const NUM = /^([-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)\s*([pnuµmkKMG])$/;
  const norm = v => v.split(',').map(t => { const m = NUM.exec(t.trim()); return m ? String(+(parseFloat(m[1]) * SI[m[2]]).toPrecision(12)) : t; }).join(',');

  /* formula templates: {0}, {1}... are the inputs in order */
  const FX = {
    "Ohm's Law (leave one blank)": 'V = I × R\nI = V / R\nR = V / I',
    'Power P = V·I (leave one blank)': 'P = V × I\nP = I² × R = V² / R',
    'Resistors: series & parallel': 'Series: R = R1 + R2 + …\nParallel: 1/R = 1/R1 + 1/R2 + …',
    'Voltage divider': 'Vout = {0} × {2} / ({1} + {2})\nI = {0} / ({1} + {2})',
    'Capacitive reactance Xc': 'Xc = 1 / (2π × {0} × {1})',
    'Inductive reactance XL': 'XL = 2π × {0} × {1}',
    'Resonant frequency': 'f0 = 1 / (2π × √({0} × {1}))',
    'RC time constant': 'τ = {0} × {1}\n5τ = 5 × τ',
    'Series RLC impedance': 'XL = 2π × {3} × {1}\nXc = 1 / (2π × {3} × {2})\n|Z| = √({0}² + (XL − Xc)²)\nφ = atan((XL − Xc) / {0})',
    'Three-phase power': 'S = √3 × {0} × {1}\nP = S × {2}\nQ = S × √(1 − {2}²)',
    'Rectangular → Polar': 'r = √({0}² + {1}²)\nθ = atan({1} / {0})',
    'Polar → Rectangular': 'Re = {0} × cos({1}°)\nIm = {0} × sin({1}°)',
    'Transformer': 'Vs = {0} × {2} / {1}',
    'Decibels': 'dB(power) = 10 × log10({0})\ndB(voltage) = 20 × log10({0})',
    'Thevenin: Rth = Voc / Isc': 'Rth = {0} / {1}',
    'Maximum power transfer': 'RL = {1}\nPmax = {0}² / (4 × {1})',
    'Stored energy ½·X·Y² (C,V or L,I)': 'E = ½ × {0} × {1}²',
    'Diode (Shockley) current': 'I = {0} × (e^({1} / ({2} × 0.02585)) − 1)',
    'BJT currents': 'Ic = {0} × {1}\nIe = ({0} + 1) × {1}',
    'Op-amp gain': 'Inverting = −{0} / {1}\nNon-inverting = 1 + {0} / {1}',
    'Series RLC: f0, Q, bandwidth': 'f0 = 1 / (2π × √({1} × {2}))\nQ = √({1} / {2}) / {0}\nBW = f0 / Q',
    'Wavelength & skin depth (copper)': 'λ = 3×10⁸ / {0}\nδ = 1 / √(π × {0} × 4π×10⁻⁷ × 5.8×10⁷)',
    'DC motor': 'Eb = {0} − {1} × {2}\nP = Eb × {1}\nT = P / ω, with ω = 2π × {3} / 60',
    'Sampling & ADC': 'fs ≥ 2 × {0}\nLSB = {2} / 2^{1}\nSNR = 6.02 × {1} + 1.76',
    'Transformer efficiency': 'η = {0} / ({0} + {1} + {2}) × 100%',
    'Per-unit base values': 'Zbase = {1}² / {0}\nZpu = {2} / Zbase\nIbase = {0} × 1000 / (√3 × {1})',
    'Fault level (MVA and kA)': 'Fault MVA = {0} / {2}\nIf = Fault MVA / (√3 × {1})',
    'Short line: Vs and regulation': 'Vs = √[({0}×{4} + {1}×{2})² + ({0}×√(1−{4}²) + {1}×{3})²]\nRegulation = (Vs − {0}) / {0} × 100%',
    'Power factor correction': 'Qc = {0} × (tan(acos {1}) − tan(acos {2}))\nC = Qc / (2π × {4} × {3}²)',
    'Induction motor speed & slip': 'Ns = 120 × {0} / {1}\ns = (Ns − {2}) / Ns\nfr = s × {0}',
    'Alternator EMF per phase': 'E = 4.44 × {0} × {1} × {2} × {3}',
    'Power angle: P = (E·V/X)·sinδ': 'P = ({0} × {1} / {2}) × sin({3}°)',
    '2nd-order system response': 'Mp = 100 × e^(−π×{1} / √(1−{1}²))\ntp = π / ({0} × √(1−{1}²))\nts = 4 / ({1} × {0})',
    'Steady-state error (step, ramp)': 'ess(step) = 1 / (1 + {0})\ness(ramp) = 1 / {1}',
    'AM power and FM bandwidth': 'm = ({1} − {2}) / ({1} + {2})\nPt = {0} × (1 + m²/2)\nBW = 2 × ({3} + {4})',
    'Shannon channel capacity': 'C = {0} × log2(1 + 10^({1}/10))',
    'Friis free-space link': 'λ = 3×10⁸ / {3}\nPr = {0} × 10^({1}/10) × 10^({2}/10) × (λ / (4π × {4}))²',
    'Buck / boost converter': 'Vout(buck) = {0} × {1}\nΔIL = ({0} − Vout) × {1} / ({2} × {3})\nVout(boost) = {0} / (1 − {1})',
    'Rectifier outputs': 'Vdc(half-wave) = {0} / π\nVdc(full-wave) = 2 × {0} / π\nVdc(controlled) = 2 × {0} × cos({1}°) / π\nVdc(3φ) = 3 × {0} × cos({1}°) / π',
    'Availability & reliability': 'A = {0} / ({0} + {1})\nR(t) = e^(−{2} / {0})',
    'Solar PV and wind power': 'P(PV) = {0} × {1} × {2}\nP(wind) = ½ × 1.225 × {4} × {3}³ × 0.4',
    'Battery bank sizing': 'Ah = {0} × {3} / ({1} × {2} × 0.9)',
    'Cable voltage drop (3-phase)': 'Vd = √3 × {0} × {3} × ({1} × {4} + {2} × √(1−{4}²))',
    'Symmetrical components': 'I0 = (Ia + Ib + Ic) / 3\nI1 = (Ia + a·Ib + a²·Ic) / 3\nI2 = (Ia + a²·Ib + a·Ic) / 3',
    'Quadratic ax² + bx + c = 0': 'x = (−{1} ± √({1}² − 4×{0}×{2})) / (2×{0})',
    '2×2 linear system': 'D = {0}×{4} − {1}×{3}\nx = ({2}×{4} − {1}×{5}) / D\ny = ({0}×{5} − {2}×{3}) / D',
    'Complex multiply and divide': '(a+jb)(c+jd) = (ac − bd) + j(ad + bc)\n(a+jb)/(c+jd) = [(ac + bd) + j(bc − ad)] / (c² + d²)',
    'Derivative at a point': "f′(x) ≈ [f(x+h) − f(x−h)] / 2h, h = 10⁻⁵",
    'Definite integral (Simpson)': '∫ ≈ (h/3)·[f0 + 4f1 + 2f2 + … + fn], h = (b − a)/1000',
    'Root finder (Newton)': 'x(next) = x − f(x) / f′(x)',
    'Statistics': 'mean = Σx / n\ns = √(Σ(x − mean)² / (n − 1))',
    'n!, nPr and nCr': 'nPr = n! / (n − r)!\nnCr = n! / (r! × (n − r)!)'
  };

  /* ---------- enhance the Pro / Formulas screens ---------- */
  function enhance() {
    B.querySelectorAll('#pi input[type=number],#fi input[type=number]').forEach(i => {
      i.type = 'text'; i.setAttribute('autocapitalize', 'off'); i.setAttribute('autocomplete', 'off'); i.placeholder = 'e.g. 4.7k, 100u, 1e-6';
    });
    const pc = B.querySelector('#pc');
    if (pc && !pc.dataset.lv) {
      pc.dataset.lv = 1;
      const cur = pc.value, have = new Set(P.map(x => x[0]));
      pc.innerHTML = ['100L', '200L', '300L', '400L', '500L', 'Math'].filter(l => have.has(l)).map(l => '<option>' + l + '</option>').join('');
      pc.value = cur;
    }
  }
  new MutationObserver(enhance).observe(B, { childList: true, subtree: true });

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {
      const a = document.createElement('textarea'); a.value = text; document.body.appendChild(a); a.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (x) {} a.remove(); return ok;
    }
  }

  function work(id) {
    const pro = id === 'pb', res = B.querySelector(pro ? '#pr' : '#fr');
    const ins = [...B.querySelectorAll(pro ? '#pi input' : '#fi input')];
    if (!res) return;
    const ans = res.textContent;
    if (/^(Fill in|Leave exactly|Could not|Enter )/.test(ans)) return;
    let name, tpl;
    if (pro) { const e = P[B.querySelector('#pf').value]; name = e[1]; tpl = e[5] || FX[name]; }
    else { name = B.querySelector('#fs').selectedOptions[0].textContent; tpl = FX[name]; }
    const sym = ins.map(i => { const l = i.previousElementSibling; const t = l ? l.textContent.replace(/\s*\(.*$/, '').trim() : 'x'; return t.length > 24 ? 'Input' : t; });
    const val = ins.map(i => i.value.trim());
    const given = ins.map((i, k) => val[k] !== '' ? sym[k] + ' = ' + val[k] : null).filter(Boolean).join(', ');
    const out = [name, '', 'Given: ' + given];
    if (tpl) {
      const fill = a => tpl.replace(/\{(\d+)\}/g, (m, n) => (a[n] !== undefined && a[n] !== '' ? a[n] : m));
      const f1 = fill(sym), f2 = fill(val.map(v => (v.charAt(0) === '-' ? '(' + v + ')' : v)));
      out.push('', 'Formula:', f1);
      if (f2 !== f1) out.push('', 'Substitution:', f2);
    }
    out.push('', 'Answer:', ans);
    const text = out.join('\n');
    res.textContent = text;
    let bx = B.querySelector('#bx');
    if (!bx) { bx = document.createElement('div'); bx.id = 'bx'; bx.className = 'eh-g'; bx.innerHTML = '<button class="eh-b" data-a="copy">Copy</button><button class="eh-b" data-a="share">Share</button>'; res.after(bx); }
    const h = ld('emexHist', []);
    h.unshift({ n: name, t: text, d: Date.now() });
    sv('emexHist', h.slice(0, 40));
  }

  /* normalise unit suffixes before the original Solve handler runs */
  B.addEventListener('click', e => {
    const id = e.target.id;
    if (id === 'pb' || id === 'fb') B.querySelectorAll(id === 'pb' ? '#pi input' : '#fi input').forEach(i => { i.value = norm(i.value); });
  }, true);

  B.addEventListener('click', async e => {
    const t = e.target, id = t.id;
    if (id === 'pb' || id === 'fb') { work(id); return; }
    const a = t.dataset && t.dataset.a, c = t.dataset && t.dataset.c;
    if (a) {
      const txt = (B.querySelector('#pr') || B.querySelector('#fr') || {}).textContent || '';
      if (a === 'share' && navigator.share) { navigator.share({ title: 'Emex Calculator', text: txt + '\n\n— Emex Scientific Calculator' }).catch(() => {}); return; }
      t.textContent = (await copy(txt)) ? 'Copied ✓' : 'Copy failed';
      setTimeout(() => { t.textContent = a === 'copy' ? 'Copy' : 'Share'; }, 1500);
    } else if (c !== undefined) {
      const h = ld('emexHist', []); t.textContent = (await copy(h[c].t)) ? 'Copied ✓' : 'Copy failed';
    } else if (id === 'hx') { sv('emexHist', []); hist(); }
  });

  /* ---------- History tab ---------- */
  function hist() {
    const h = ld('emexHist', []);
    B.innerHTML = h.length
      ? h.map((x, i) => '<div class="eh-r" style="margin-bottom:6px">' + esc(x.t) + '</div><button class="eh-b" data-c="' + i + '" style="margin-bottom:14px">Copy</button>').join('') + '<button class="eh-b" id="hx" style="background:#dc2626">Clear history</button>'
      : '<div class="eh-r">No saved results yet. Solve something in the Formulas or Pro tab and it appears here.</div>';
  }
  const b = document.createElement('button');
  b.textContent = 'History';
  b.onclick = () => { [...T.children].forEach(x => x.classList.remove('on')); b.classList.add('on'); hist(); };
  T.appendChild(b);
})();
