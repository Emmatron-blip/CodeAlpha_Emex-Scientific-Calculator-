/* Emex Reference v1 - resistor colour code, E-series, wire sizes, units, prefixes, constants, logic (load after emex-home.js) */
(function () {
  'use strict';
  const T = document.getElementById('eht'), B = document.getElementById('ehc');
  if (!T || !B) return;
  const $ = s => B.querySelector(s), PI = Math.PI;
  const f = n => (Number.isFinite(n) ? String(+n.toPrecision(5)) : '—');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pre = t => '<div class="eh-r" style="font-size:12px;white-space:pre;overflow-x:auto">' + esc(t) + '</div>';
  const SI = { p: 1e-12, n: 1e-9, u: 1e-6, 'µ': 1e-6, m: 1e-3, k: 1e3, K: 1e3, M: 1e6, G: 1e9 };
  const num = s => { const m = /^\s*([-+]?\d*\.?\d+(?:e[-+]?\d+)?)\s*([pnuµmkKMG])?\s*Ω?\s*$/i.exec(s || ''); return m ? parseFloat(m[1]) * (m[2] ? SI[m[2]] : 1) : NaN; };
  const fr = v => (v >= 1e6 ? f(v / 1e6) + ' MΩ' : v >= 1e3 ? f(v / 1e3) + ' kΩ' : f(v) + ' Ω');
  const tbl = (head, rows) => { const w = head.map((h, i) => Math.max(h.length, ...rows.map(r => String(r[i]).length))); const line = r => r.map((c, i) => String(c).padEnd(w[i])).join('  '); return line(head) + '\n' + w.map(x => '-'.repeat(x)).join('  ') + '\n' + rows.map(line).join('\n'); };

  const COL = [['Black', '#000', 1, null], ['Brown', '#7a4a21', 10, 1], ['Red', '#e02020', 100, 2], ['Orange', '#f58a1f', 1e3, null], ['Yellow', '#f2d41f', 1e4, null], ['Green', '#2da44e', 1e5, .5], ['Blue', '#2563eb', 1e6, .25], ['Violet', '#8b5cf6', 1e7, .1], ['Grey', '#8a8f98', 1e8, .05], ['White', '#ffffff', 1e9, null], ['Gold', '#d4af37', .1, 5], ['Silver', '#c0c0c0', .01, 10]];
  const E12 = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
  const E24 = [1, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2, 2.2, 2.4, 2.7, 3, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1];
  const E96 = [1, 1.02, 1.05, 1.07, 1.1, 1.13, 1.15, 1.18, 1.21, 1.24, 1.27, 1.3, 1.33, 1.37, 1.4, 1.43, 1.47, 1.5, 1.54, 1.58, 1.62, 1.65, 1.69, 1.74, 1.78, 1.82, 1.87, 1.91, 1.96, 2, 2.05, 2.1, 2.15, 2.21, 2.26, 2.32, 2.37, 2.43, 2.49, 2.55, 2.61, 2.67, 2.74, 2.8, 2.87, 2.94, 3.01, 3.09, 3.16, 3.24, 3.32, 3.4, 3.48, 3.57, 3.65, 3.74, 3.83, 3.92, 4.02, 4.12, 4.22, 4.32, 4.42, 4.53, 4.64, 4.75, 4.87, 4.99, 5.11, 5.23, 5.36, 5.49, 5.62, 5.76, 5.9, 6.04, 6.19, 6.34, 6.49, 6.65, 6.81, 6.98, 7.15, 7.32, 7.5, 7.68, 7.87, 8.06, 8.25, 8.45, 8.66, 8.87, 9.09, 9.31, 9.53, 9.76];
  const near = (v, ser) => { const d = 10 ** Math.floor(Math.log10(v)); let best = 0, be = 1e9; [d / 10, d, d * 10].forEach(dec => ser.forEach(s => { const c = s * dec, e = Math.abs(Math.log(v / c)); if (e < be) { be = e; best = c; } })); return best; };

  const SECTIONS = [
    ['Resistor colour code', () => {
      const dop = COL.slice(0, 10).map((c, i) => '<option value="' + i + '">' + c[0] + '</option>').join('');
      const mop = COL.map((c, i) => '<option value="' + i + '">' + c[0] + ' (×' + f(c[2]) + ')</option>').join('');
      const top = COL.map((c, i) => (c[3] != null ? '<option value="' + i + '">' + c[0] + ' (±' + c[3] + '%)</option>' : '')).join('') + '<option value="-1">None (±20%)</option>';
      $('#rf').innerHTML = '<label>Number of bands</label><select id="rb"><option>4</option><option>5</option></select><div id="rsw" style="display:flex;gap:6px;margin:4px 0 10px"></div><label>Band 1</label><select id="r1">' + dop + '</select><label>Band 2</label><select id="r2">' + dop + '</select><div id="r3w"><label>Band 3</label><select id="r3">' + dop + '</select></div><label>Multiplier</label><select id="rm">' + mop + '</select><label>Tolerance</label><select id="rt">' + top + '</select><div class="eh-r" id="rr"></div>';
      $('#r1').value = 1; $('#rm').value = 2; $('#rt').value = 10;
      const calc = () => {
        const five = $('#rb').value === '5'; $('#r3w').style.display = five ? '' : 'none';
        const d = [+$('#r1').value, +$('#r2').value].concat(five ? [+$('#r3').value] : []), mi = +$('#rm').value, ti = +$('#rt').value;
        const base = d.reduce((a, x) => a * 10 + x, 0), v = base * COL[mi][2], tol = ti < 0 ? 20 : COL[ti][3];
        const cols = d.concat([mi, ti < 0 ? null : ti]);
        $('#rsw').innerHTML = cols.map(i => '<div style="flex:1;height:26px;border-radius:6px;border:1px solid #8886;background:' + (i == null ? 'transparent' : COL[i][1]) + '"></div>').join('');
        $('#rr').textContent = 'Value = ' + fr(v) + '  ±' + tol + '%\nRange = ' + fr(v * (1 - tol / 100)) + ' to ' + fr(v * (1 + tol / 100));
      };
      B.querySelectorAll('#rf select').forEach(s => { s.onchange = calc; }); calc();
    }],
    ['Standard resistor values (E-series)', () => {
      $('#rf').innerHTML = '<label>Find the nearest standard value (e.g. 4.6k, 5600, 0.33)</label><input id="ev" type="text" autocapitalize="off" placeholder="e.g. 4.6k"><div class="eh-r" id="eo">Type a value above.</div><label style="display:block;margin-top:10px">E12 (±10%)</label>' + pre(E12.join('  ')) + '<label>E24 (±5%)</label>' + pre(E24.join('  ')) + '<label>E96 (±1%)</label>' + pre(E96.join('  ')) + '<div class="eh-r">These are the base values. Multiply by 1, 10, 100, 1k, 10k, 100k or 1M.</div>';
      $('#ev').oninput = () => {
        const v = num($('#ev').value); if (!(v > 0)) { $('#eo').textContent = 'Type a value above.'; return; }
        $('#eo').textContent = 'You typed ' + fr(v) + '\n' + [['E12', E12], ['E24', E24], ['E96', E96]].map(([n, s]) => { const c = near(v, s); return 'Nearest ' + n + ': ' + fr(c) + '  (' + (c >= v ? '+' : '') + f((c - v) / v * 100) + '%)'; }).join('\n');
      };
    }],
    ['Wire sizes (mm² and AWG)', () => {
      const mm = [[1.5, 12.1], [2.5, 7.41], [4, 4.61], [6, 3.08], [10, 1.83], [16, 1.15], [25, .727], [35, .524], [50, .387], [70, .268], [95, .193], [120, .153]];
      const awg = n => { const d = .127 * 92 ** ((36 - n) / 39), A = PI / 4 * d * d; return [n, f(d), f(A), f(17.24 / A)]; };
      const rows = []; for (let n = 4; n <= 30; n += 2) rows.push(awg(n));
      $('#rf').innerHTML = '<label>Metric cables: max DC resistance at 20°C (copper, IEC 60228 class 2)</label>' + pre(tbl(['mm²', 'Ω/km'], mm)) + '<label>AWG wire (solid copper)</label>' + pre(tbl(['AWG', 'dia mm', 'area mm²', 'Ω/km'], rows)) + '<label>Look up any AWG number (0 to 40)</label><input id="aw" type="number" placeholder="e.g. 22"><div class="eh-r" id="ao">Type an AWG number.</div><div class="eh-r">Current ratings are not listed on purpose: they depend on the installation method, insulation and ambient temperature. Take them from your wiring regulations (such as BS 7671 or the NEC).</div>';
      $('#aw').oninput = () => { const n = parseFloat($('#aw').value); $('#ao').textContent = n >= 0 && n <= 40 ? 'AWG ' + n + ': diameter ' + awg(n)[1] + ' mm, area ' + awg(n)[2] + ' mm², about ' + awg(n)[3] + ' Ω/km' : 'Type an AWG number.'; };
    }],
    ['Electrical units and symbols', () => {
      $('#rf').innerHTML = pre(tbl(['Quantity', 'Sym', 'Unit', 'Equals'], [['Voltage', 'V', 'volt (V)', 'J/C'], ['Current', 'I', 'ampere (A)', 'C/s'], ['Resistance', 'R', 'ohm (Ω)', 'V/A'], ['Conductance', 'G', 'siemens (S)', '1/Ω'], ['Capacitance', 'C', 'farad (F)', 'C/V'], ['Inductance', 'L', 'henry (H)', 'Wb/A'], ['Charge', 'Q', 'coulomb (C)', 'A·s'], ['Power', 'P', 'watt (W)', 'J/s'], ['Apparent power', 'S', 'volt-amp (VA)', 'V·I'], ['Reactive power', 'Q', 'var', 'V·I·sinφ'], ['Energy', 'W', 'joule (J)', 'N·m'], ['Frequency', 'f', 'hertz (Hz)', '1/s'], ['Magnetic flux', 'Φ', 'weber (Wb)', 'V·s'], ['Flux density', 'B', 'tesla (T)', 'Wb/m²'], ['Impedance', 'Z', 'ohm (Ω)', 'V/I (AC)'], ['Reactance', 'X', 'ohm (Ω)', 'Im of Z'], ['Admittance', 'Y', 'siemens (S)', '1/Z'], ['Electric field', 'E', 'volt/metre', 'N/C'], ['Permittivity', 'ε', 'farad/metre', 'C/(V·m)'], ['Permeability', 'μ', 'henry/metre', 'Wb/(A·m)']]));
    }],
    ['SI prefixes', () => {
      $('#rf').innerHTML = pre(tbl(['Prefix', 'Sym', 'Factor', 'Example'], [['tera', 'T', '10^12', '1 THz'], ['giga', 'G', '10^9', '2.4 GHz'], ['mega', 'M', '10^6', '3.3 MΩ'], ['kilo', 'k', '10^3', '4.7 kΩ'], ['(none)', '', '10^0', '5 V'], ['milli', 'm', '10^-3', '20 mA'], ['micro', 'µ', '10^-6', '100 µF'], ['nano', 'n', '10^-9', '10 nF'], ['pico', 'p', '10^-12', '22 pF']])) + '<div class="eh-r">In the calculator inputs you can type these letters directly: 4.7k, 100u, 2m, 3M.\nCase matters: m = milli, M = mega.</div>';
    }],
    ['Physical constants', () => {
      $('#rf').innerHTML = pre(tbl(['Constant', 'Symbol', 'Value'], [['Speed of light', 'c', '2.99792458e8 m/s'], ['Planck constant', 'h', '6.62607015e-34 J·s'], ['Elementary charge', 'e', '1.602176634e-19 C'], ['Boltzmann constant', 'k', '1.380649e-23 J/K'], ['Avogadro constant', 'NA', '6.02214076e23 /mol'], ['Gas constant', 'R', '8.314462618 J/(mol·K)'], ['Permittivity of free space', 'ε0', '8.8541878128e-12 F/m'], ['Permeability of free space', 'μ0', '1.25663706212e-6 H/m'], ['Impedance of free space', 'Z0', '376.730313668 Ω'], ['Coulomb constant', 'ke', '8.9875517923e9 N·m²/C²'], ['Electron mass', 'me', '9.1093837015e-31 kg'], ['Proton mass', 'mp', '1.67262192369e-27 kg'], ['Gravitational constant', 'G', '6.67430e-11 N·m²/kg²'], ['Standard gravity', 'g', '9.80665 m/s²'], ['Stefan-Boltzmann', 'σ', '5.670374419e-8 W/(m²·K⁴)'], ['Thermal voltage at 300 K', 'VT', '25.85 mV (kT/q)']])) + '<div class="eh-r">Values from CODATA 2018. The first five are exact by definition.</div>';
    }],
    ['Logic gates and Boolean laws', () => {
      $('#rf').innerHTML = pre(tbl(['Gate', 'Expression', 'Output for AB = 00 01 10 11'], [['AND', 'A·B', '0  0  0  1'], ['OR', 'A+B', '0  1  1  1'], ['NOT', "A'", 'A = 0 → 1,  A = 1 → 0'], ['NAND', "(A·B)'", '1  1  1  0'], ['NOR', "(A+B)'", '1  0  0  0'], ['XOR', 'A⊕B', '0  1  1  0'], ['XNOR', "(A⊕B)'", '1  0  0  1']])) + pre("Identity     A+0 = A         A·1 = A\nNull         A+1 = 1         A·0 = 0\nIdempotent   A+A = A         A·A = A\nComplement   A+A' = 1        A·A' = 0\nDouble NOT   (A')' = A\nDistributive A(B+C) = AB+AC  A+BC = (A+B)(A+C)\nAbsorption   A+AB = A        A(A+B) = A\nDe Morgan    (AB)' = A'+B'   (A+B)' = A'·B'\nConsensus    AB+A'C+BC = AB+A'C\nXOR          A⊕B = A'B + AB'");
    }]
  ];

  function tRef() {
    B.innerHTML = '<label>Choose a reference</label><select id="rsel">' + SECTIONS.map((s, i) => '<option value="' + i + '">' + s[0] + '</option>').join('') + '</select><div id="rf"></div>';
    const sel = $('#rsel'); sel.onchange = () => SECTIONS[sel.value][1](); SECTIONS[0][1]();
  }
  const b = document.createElement('button');
  b.textContent = 'Reference';
  b.onclick = () => { [...T.children].forEach(x => x.classList.remove('on')); b.classList.add('on'); tRef(); };
  T.appendChild(b);

  /* add a Reference tile to the Home screen */
  new MutationObserver(() => {
    const g = B.querySelector('.hm-g');
    if (g && !g.querySelector('[data-t=Reference]')) { const t = document.createElement('button'); t.className = 'hm-t'; t.dataset.t = 'Reference'; t.innerHTML = '<b>📖</b>Reference'; g.appendChild(t); }
  }).observe(B, { childList: true, subtree: true });
})();
