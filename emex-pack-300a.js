/* Emex Pack 300L (A): EEE 311, 313, 315, 322, 324, 326 (load after emex-pro.js) */
(function () {
  'use strict';
  if (!window.EmexPro) return;
  const f = n => (Number.isFinite(n) ? String(+n.toPrecision(6)) : '—');
  const PI = Math.PI, M0 = 4e-7 * PI, E0 = 8.854e-12, D = 180 / PI, LV = '300L';
  window.EmexPro.P.push(
    [LV, 'EEE 311: RLC damping (series or parallel)', ['R (Ω)', 'L (H)', 'C (F)', 'Type (1 = series, 2 = parallel)'],
      ([R, Ln, C, t]) => {
        const a = t === 2 ? 1 / (2 * R * C) : R / (2 * Ln), w = 1 / Math.sqrt(Ln * C), z = a / w; let s;
        if (Math.abs(a - w) < 1e-9 * w) s = 'Critically damped\ns1 = s2 = ' + f(-a);
        else if (a > w) { const r = Math.sqrt(a * a - w * w); s = 'Overdamped\ns1 = ' + f(-a + r) + '\ns2 = ' + f(-a - r); }
        else { const d = Math.sqrt(w * w - a * a); s = 'Underdamped\ns = ' + f(-a) + ' ± j' + f(d) + '\nωd = ' + f(d) + ' rad/s'; }
        return 'α = ' + f(a) + ' Np/s\nω0 = ' + f(w) + ' rad/s\nζ = ' + f(z) + '\n' + s;
      }, 0,
      'α = R / (2L) (series), α = 1 / (2RC) (parallel)\nω0 = 1 / √(L × C)\nζ = α / ω0\ns = −α ± √(α² − ω0²)'],
    [LV, 'EEE 311: First-order step response', ['Initial value', 'Final value', 'τ (time constant, s)', 't (s)'],
      ([x0, xf, tau, t]) => 'x(t) = ' + f(xf + (x0 - xf) * Math.exp(-t / tau)) + '\n63.2% reached at t = ' + f(tau) + ' s\n99% reached at t = ' + f(4.605 * tau) + ' s', 0,
      'x(t) = {1} + ({0} − {1}) × e^(−{3} / {2})\nt(63.2%) = τ,  t(99%) = 4.605 × τ'],
    [LV, 'EEE 311: Series R-X impedance (sinusoidal)', ['R (Ω)', 'X (Ω, + inductive, − capacitive)', 'V (rms, V)'],
      ([R, X, V]) => { const Z = Math.hypot(R, X), i = V / Z, ph = Math.atan2(X, R) * D; return '|Z| = ' + f(Z) + ' Ω\nPhase = ' + f(ph) + '° (' + (X > 0 ? 'current lags' : X < 0 ? 'current leads' : 'in phase') + ')\nI = ' + f(i) + ' A\npf = ' + f(Math.cos(ph / D)) + '\nP = ' + f(i * i * R) + ' W'; }, 0,
      '|Z| = √({0}² + {1}²)\nφ = atan({1} / {0})\nI = {2} / |Z|\npf = cos φ\nP = I² × {0}'],
    [LV, 'EEE 311: Nodal analysis (2 nodes)', ['G11 (total conductance at node 1, S)', 'G12 (conductance between nodes, S)', 'G22 (total conductance at node 2, S)', 'I1 (source current into node 1, A)', 'I2 (source current into node 2, A)'],
      ([a, b, c, i1, i2]) => { const d = a * c - b * b; return d ? 'V1 = ' + f((i1 * c + b * i2) / d) + ' V\nV2 = ' + f((a * i2 + b * i1) / d) + ' V' : 'No unique solution'; }, 0,
      'D = {0}×{2} − {1}²\nV1 = ({3}×{2} + {1}×{4}) / D\nV2 = ({0}×{4} + {1}×{3}) / D'],

    [LV, 'EEE 326: RC filter response', ['R (Ω)', 'C (F)', 'f (Hz)'],
      ([R, C, fr]) => { const fc = 1 / (2 * PI * R * C), r = fr / fc, lp = 1 / Math.sqrt(1 + r * r), hp = r * lp; return 'fc = ' + f(fc) + ' Hz\nLow-pass: |H| = ' + f(lp) + ' (' + f(20 * Math.log10(lp)) + ' dB), phase ' + f(-Math.atan(r) * D) + '°\nHigh-pass: |H| = ' + f(hp) + ' (' + f(20 * Math.log10(hp)) + ' dB), phase ' + f((PI / 2 - Math.atan(r)) * D) + '°'; }, 0,
      'fc = 1 / (2π × {0} × {1})\n|H(LP)| = 1 / √(1 + ({2}/fc)²)\n|H(HP)| = ({2}/fc) / √(1 + ({2}/fc)²)'],
    [LV, 'EEE 326: Butterworth filter order', ['fp (passband edge, Hz)', 'fs (stopband edge, Hz)', 'Ap (max passband loss, dB)', 'As (min stopband loss, dB)'],
      ([fp, fs, ap, as_]) => {
        const k = (10 ** (as_ / 10) - 1) / (10 ** (ap / 10) - 1), n = Math.log10(k) / (2 * Math.log10(fs / fp)), N = Math.ceil(n - 1e-9);
        return 'n = ' + f(n) + '  →  use N = ' + N + '\n3 dB cutoff = ' + f(fp / (10 ** (ap / 10) - 1) ** (1 / (2 * N))) + ' Hz';
      }, 0,
      'n = log10[(10^({3}/10) − 1) / (10^({2}/10) − 1)] / (2 × log10({1}/{0}))\nUse the next whole number N\nfc = {0} / (10^({2}/10) − 1)^(1/2N)'],
    [LV, 'EEE 326: Two-port: Z to Y and ABCD', ['z11 (Ω)', 'z12 (Ω)', 'z21 (Ω)', 'z22 (Ω)'],
      ([a, b, c, d]) => { const dl = a * d - b * c; return dl ? 'Δz = ' + f(dl) + '\ny11 = ' + f(d / dl) + ' S\ny12 = ' + f(-b / dl) + ' S\ny21 = ' + f(-c / dl) + ' S\ny22 = ' + f(a / dl) + ' S\nA = ' + f(a / c) + ', B = ' + f(dl / c) + ' Ω\nC = ' + f(1 / c) + ' S, D = ' + f(d / c) : 'Δz = 0: no Y parameters'; }, 0,
      'Δz = {0}×{3} − {1}×{2}\ny11 = {3}/Δz, y12 = −{1}/Δz\ny21 = −{2}/Δz, y22 = {0}/Δz\nA = {0}/{2}, B = Δz/{2}, C = 1/{2}, D = {3}/{2}'],
    [LV, 'EEE 326: Parallel RLC resonance', ['R (Ω)', 'L (H)', 'C (F)'],
      ([R, Ln, C]) => { const f0 = 1 / (2 * PI * Math.sqrt(Ln * C)), q = R * Math.sqrt(C / Ln); return 'f0 = ' + f(f0) + ' Hz\nQ = ' + f(q) + '\nBandwidth = ' + f(f0 / q) + ' Hz'; }, 0,
      'f0 = 1 / (2π × √({1} × {2}))\nQ = {0} × √({2} / {1})\nBW = f0 / Q'],

    [LV, 'EEE 313: Transformer OC and SC tests', ['Voc (V)', 'Ioc (A)', 'Poc (W)', 'Vsc (V)', 'Isc (A)', 'Psc (W)'],
      ([vo, io, po, vs, isc, ps]) => {
        const ic = po / vo, im = Math.sqrt(Math.max(0, io * io - ic * ic)), zs = vs / isc, rs = ps / (isc * isc), xs = Math.sqrt(Math.max(0, zs * zs - rs * rs));
        return 'No-load (OC side):\nRc = ' + f(vo / ic) + ' Ω, Xm = ' + f(vo / im) + ' Ω\nCore loss = ' + f(po) + ' W, no-load pf = ' + f(po / (vo * io)) + '\nShort-circuit (SC side):\nReq = ' + f(rs) + ' Ω, Xeq = ' + f(xs) + ' Ω, Zeq = ' + f(zs) + ' Ω';
      }, 0,
      'Ic = {2} / {0},  Im = √({1}² − Ic²)\nRc = {0} / Ic,  Xm = {0} / Im\nZeq = {3} / {4},  Req = {5} / {4}²\nXeq = √(Zeq² − Req²)'],
    [LV, 'EEE 313: Transformer regulation and efficiency', ['V2 (rated secondary, V)', 'I2 (load current, A)', 'Req (referred to secondary, Ω)', 'Xeq (referred to secondary, Ω)', 'pf (lagging)', 'Core loss (W)'],
      ([v, i, R, X, pf, pc]) => { const s = Math.sqrt(1 - pf * pf), pcu = i * i * R, po = v * i * pf; return 'Regulation ≈ ' + f(i * (R * pf + X * s) / v * 100) + ' %\nCopper loss = ' + f(pcu) + ' W\nOutput = ' + f(po) + ' W\nEfficiency = ' + f(po / (po + pc + pcu) * 100) + ' %\nMax efficiency at I2 = ' + f(i * Math.sqrt(pc / pcu)) + ' A'; }, 0,
      'VR ≈ {1} × ({2}×{4} + {3}×√(1−{4}²)) / {0} × 100%\nPcu = {1}² × {2}\nPout = {0} × {1} × {4}\nη = Pout / (Pout + {5} + Pcu)\nI(max η) = {1} × √({5} / Pcu)'],
    [LV, 'EEE 313: DC motor speed change', ['N1 (initial speed, rpm)', 'Eb1 (initial back EMF, V)', 'Eb2 (new back EMF, V)', 'φ2/φ1 (flux ratio, 1 if unchanged)'],
      ([n1, e1, e2, r]) => 'N2 = ' + f(n1 * (e2 / e1) / r) + ' rpm', 0,
      'N ∝ Eb / φ\nN2 = {0} × ({2} / {1}) / {3}'],
    [LV, 'EEE 313: Synchronous generator regulation', ['Vt (terminal voltage per phase, V)', 'Ia (A)', 'Ra (Ω)', 'Xs (Ω)', 'pf', 'Type (1 = lagging, −1 = leading)'],
      ([v, i, R, X, pf, t]) => {
        const s = Math.sqrt(1 - pf * pf) * (t < 0 ? 1 : -1), ar = i * pf, ai = i * s, er = v + ar * R - ai * X, ei = ar * X + ai * R, E = Math.hypot(er, ei);
        return 'E (per phase) = ' + f(E) + ' V\nPower angle δ = ' + f(Math.atan2(ei, er) * D) + '°\nRegulation = ' + f((E - v) / v * 100) + ' %';
      }, 0,
      'Ia = I × (pf ∓ j·sinφ)   (lagging −, leading +)\nE = Vt + Ia × (Ra + j·Xs)\nVR = (E − Vt) / Vt × 100%'],
    [LV, 'EEE 313: Induction motor power flow', ['Pag (air-gap power, W)', 's (slip, 0 to 1)', 'f (supply frequency, Hz)', 'Poles'],
      ([pg, s, fr, p]) => { const ns = 120 * fr / p, ws = 2 * PI * ns / 60; return 'Ns = ' + f(ns) + ' rpm\nRotor speed = ' + f(ns * (1 - s)) + ' rpm\nRotor copper loss = ' + f(s * pg) + ' W\nMechanical power = ' + f((1 - s) * pg) + ' W\nTorque = ' + f(pg / ws) + ' N·m\nRotor efficiency = ' + f((1 - s) * 100) + ' %'; }, 0,
      'Ns = 120 × {2} / {3}\nPcu2 = {1} × {0}\nPmech = (1 − {1}) × {0}\nT = {0} / ωs,  ωs = 2π × Ns / 60'],

    [LV, 'EEE 315: Square-wave Fourier series', ['A (amplitude)', 'f (fundamental, Hz)', 'N (highest harmonic to include)', 't (s)'],
      ([A, fr, N, t]) => { let s = 0; for (let k = 1; k <= N; k += 2) s += 4 * A / (k * PI) * Math.sin(2 * PI * k * fr * t); return 'b1 = ' + f(4 * A / PI) + '\nb3 = ' + f(4 * A / (3 * PI)) + '\nb5 = ' + f(4 * A / (5 * PI)) + '\nPartial sum at t = ' + f(s); }, 0,
      'x(t) = Σ (4A / (kπ)) × sin(2π·k·f·t),  k = 1, 3, 5, …\nbk = 4 × {0} / (kπ)'],
    [LV, 'EEE 315: Discrete convolution', ['x[n] (comma separated)', 'h[n] (comma separated)'],
      (n, r) => {
        const x = r[0].split(',').map(parseFloat), h = r[1].split(',').map(parseFloat);
        if (x.concat(h).some(isNaN)) return 'Enter numbers separated by commas';
        const y = Array(x.length + h.length - 1).fill(0); x.forEach((a, i) => h.forEach((b, j) => { y[i + j] += a * b; }));
        return 'y[n] = ' + y.map(f).join(', ') + '\nLength = ' + y.length;
      }, 1,
      'y[n] = Σ x[k] × h[n − k]\nLength = Lx + Lh − 1'],
    [LV, 'EEE 315: Sampling and aliasing', ['f (signal frequency, Hz)', 'fs (sampling frequency, Hz)'],
      ([fr, fs]) => 'Nyquist rate = ' + f(2 * fr) + ' Hz\n' + (fs >= 2 * fr ? 'No aliasing' : 'Aliasing! Appears at ' + f(Math.abs(fr - fs * Math.round(fr / fs))) + ' Hz'), 0,
      'fs ≥ 2 × {0}\nf(alias) = |{0} − {1} × round({0} / {1})|'],
    [LV, 'EEE 315: Signal energy, power and RMS', ['Samples (comma separated)'],
      (n, r) => { const a = r[0].split(',').map(parseFloat).filter(isFinite); if (!a.length) return 'Enter numbers separated by commas'; const e = a.reduce((p, q) => p + q * q, 0); return 'Energy = ' + f(e) + '\nAverage power = ' + f(e / a.length) + '\nRMS = ' + f(Math.sqrt(e / a.length)) + '\nMean = ' + f(a.reduce((p, q) => p + q, 0) / a.length); }, 1,
      'E = Σ x[n]²\nP = E / N\nRMS = √P'],

    [LV, 'EEE 322: Number base converter (any base)', ['Number', 'From base (2 to 36)', 'To base (2 to 36)'],
      (n, r) => {
        const s = r[0].trim().toLowerCase(), a = parseInt(r[1]), b = parseInt(r[2]);
        if (!s || !(a >= 2 && a <= 36 && b >= 2 && b <= 36)) return 'Enter a number and two bases from 2 to 36';
        const v = parseInt(s, a);
        if (isNaN(v) || v.toString(a) !== s.replace(/^(-?)0+(?=.)/, '$1')) return 'Digits do not fit base ' + a;
        return s.toUpperCase() + ' (base ' + a + ') = ' + v.toString(b).toUpperCase() + ' (base ' + b + ')\nDecimal = ' + v;
      }, 1,
      'To decimal: Σ digit × base^position\nFrom decimal: divide repeatedly by the new base'],
    [LV, "EEE 322: Two's complement and range", ['Decimal value', 'Number of bits'],
      ([v0, b]) => {
        const v = Math.trunc(v0), lo = -(2 ** (b - 1)), hi = 2 ** (b - 1) - 1;
        if (b < 1 || b > 32 || v < lo || v > hi) return 'Out of range. ' + b + ' bits hold ' + f(lo) + ' to ' + f(hi);
        const u = v < 0 ? v + 2 ** b : v;
        return 'Binary = ' + u.toString(2).padStart(b, '0') + '\nHex = ' + u.toString(16).toUpperCase() + '\nRange = ' + f(lo) + ' to ' + f(hi);
      }, 0,
      'Negative values: 2^n − |value|\nRange: −2^(n−1) to 2^(n−1) − 1'],
    [LV, 'EEE 322: Boolean truth table', ['Expression with A, B, C, D and ! & | ^ , e.g. (A&B)|!C'],
      (n, r) => {
        const e = r[0].toUpperCase().replace(/\bNOT\b/g, '!').replace(/\bAND\b/g, '&').replace(/\bOR\b/g, '|').replace(/\bXOR\b/g, '^');
        if (!e.trim() || /[^ABCD01()!&|^ ]/.test(e)) return 'Use only A, B, C, D, 0, 1, ! & | ^ and brackets';
        const vs = ['A', 'B', 'C', 'D'].filter(v => e.includes(v));
        if (!vs.length) return 'Use at least one variable (A to D)';
        let fn; try { fn = new Function('A', 'B', 'C', 'D', 'return Number(' + e + ')&1'); fn(0, 0, 0, 0); } catch (x) { return 'Check your brackets and operators'; }
        const rows = [], mt = [];
        for (let i = 0; i < 2 ** vs.length; i++) {
          const val = { A: 0, B: 0, C: 0, D: 0 }; vs.forEach((v, k) => { val[v] = (i >> (vs.length - 1 - k)) & 1; });
          const o = fn(val.A, val.B, val.C, val.D); rows.push(vs.map(v => val[v]).join(' ') + '  →  ' + o); if (o) mt.push(i);
        }
        return vs.join(' ') + '  →  F\n' + rows.join('\n') + '\nΣm(' + mt.join(', ') + ')';
      }, 1,
      '! = NOT,  & = AND,  ^ = XOR,  | = OR\nF = sum of minterms where the output is 1'],
    [LV, 'EEE 322: 555 timer (astable)', ['R1 (Ω)', 'R2 (Ω)', 'C (F)'],
      ([a, b, c]) => { const th = .693 * (a + b) * c, tl = .693 * b * c; return 'f = ' + f(1 / (th + tl)) + ' Hz\nT = ' + f(th + tl) + ' s\nHigh time = ' + f(th) + ' s\nLow time = ' + f(tl) + ' s\nDuty cycle = ' + f(th / (th + tl) * 100) + ' %'; }, 0,
      'f = 1 / (0.693 × ({0} + 2×{1}) × {2})   (≈ 1.44 / ((R1 + 2R2)C))\nthigh = 0.693 × ({0} + {1}) × {2}\ntlow = 0.693 × {1} × {2}\nDuty = (R1 + R2) / (R1 + 2R2)'],
    [LV, 'EEE 322: Counters and memory size', ['Flip-flops in counter', 'Clock frequency (Hz)', 'Address lines', 'Data width (bits)'],
      ([n, fc, ad, w]) => { const m = 2 ** n, bits = 2 ** ad * w; return 'Modulus = ' + f(m) + ' states (counts 0 to ' + f(m - 1) + ')\nMSB output frequency = ' + f(fc / m) + ' Hz\nMemory = ' + f(2 ** ad) + ' words × ' + f(w) + ' bits = ' + f(bits) + ' bits (' + f(bits / 8) + ' bytes)'; }, 0,
      'Modulus = 2^{0}\nf(MSB) = {1} / 2^{0}\nMemory = 2^{2} × {3} bits'],

    [LV, "EEE 324: Gauss's law fields", ['Q (point or sphere, C)', 'λ (line charge, C/m)', 'σ (sheet charge, C/m²)', 'r (distance, m)'],
      ([q, l, s, r]) => 'Point/sphere: E = ' + f(q / (4 * PI * E0 * r * r)) + ' V/m\nLine: E = ' + f(l / (2 * PI * E0 * r)) + ' V/m\nSheet: E = ' + f(s / (2 * E0)) + ' V/m (independent of r)', 0,
      'E(point) = {0} / (4π ε0 {3}²)\nE(line) = {1} / (2π ε0 {3})\nE(sheet) = {2} / (2 ε0)\nε0 = 8.854×10⁻¹²'],
    [LV, 'EEE 324: Capacitance (plane, coaxial, spherical)', ['εr', 'A (plate area, m²)', 'd (plate gap, m)', 'a (inner radius, m)', 'b (outer radius, m)', 'L (coax length, m)'],
      ([er, A, d, a, b, Ln]) => 'Parallel plate = ' + f(er * E0 * A / d) + ' F\nCoaxial = ' + f(2 * PI * er * E0 * Ln / Math.log(b / a)) + ' F\nConcentric spheres = ' + f(4 * PI * er * E0 * a * b / (b - a)) + ' F\nIsolated sphere (radius a) = ' + f(4 * PI * er * E0 * a) + ' F', 0,
      'C(plate) = ε0 × {0} × {1} / {2}\nC(coax) = 2π ε0 {0} × {5} / ln({4}/{3})\nC(spheres) = 4π ε0 {0} × {3}×{4} / ({4} − {3})\nC(sphere) = 4π ε0 {0} × {3}'],
    [LV, "EEE 324: Magnetic fields (Ampère's law)", ['I (A)', 'r (distance, m)', 'N (turns)', 'L (solenoid length, m)'],
      ([i, r, n, l]) => 'Straight wire: B = ' + f(M0 * i / (2 * PI * r)) + ' T\nSolenoid: B = ' + f(M0 * n * i / l) + ' T\nToroid (at radius r): B = ' + f(M0 * n * i / (2 * PI * r)) + ' T', 0,
      'B(wire) = μ0 {0} / (2π {1})\nB(solenoid) = μ0 {2} {0} / {3}\nB(toroid) = μ0 {2} {0} / (2π {1})\nμ0 = 4π×10⁻⁷'],
    [LV, "EEE 324: Faraday's law and solenoid inductance", ['N (turns)', 'ΔΦ (flux change, Wb)', 'Δt (s)', 'μr', 'A (core area, m²)', 'l (length, m)'],
      ([n, df, dt, mr, A, l]) => 'Induced EMF = ' + f(n * df / dt) + ' V\nInductance = ' + f(M0 * mr * n * n * A / l) + ' H', 0,
      'EMF = {0} × {1} / {2}\nL = μ0 {3} {0}² {4} / {5}'],
    [LV, 'EEE 324: Plane wave in a medium', ['f (Hz)', 'εr', 'μr', 'σ (S/m, 0 if lossless)'],
      ([fr, er, mr, sg]) => {
        const w = 2 * PI * fr, lt = sg / (w * er * E0), v = 3e8 / Math.sqrt(er * mr);
        const o = 'Velocity = ' + f(v) + ' m/s\nWavelength = ' + f(v / fr) + ' m\nIntrinsic impedance (lossless) = ' + f(376.73 * Math.sqrt(mr / er)) + ' Ω';
        return sg > 0 ? o + '\nLoss tangent σ/(ωε) = ' + f(lt) + (lt > 100 ? ' (good conductor)' : lt < .01 ? ' (good dielectric)' : '') + '\nSkin depth = ' + f(1 / Math.sqrt(PI * fr * M0 * mr * sg)) + ' m' : o;
      }, 0,
      'v = c / √({1} × {2})\nλ = v / {0}\nη = 377 × √({2} / {1})\ntan δ = {3} / (2π {0} ε)\nδ = 1 / √(π {0} μ {3})']
  );
})();
