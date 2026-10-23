/* Emex Pack 300L (B): GET 301, 302, 305, 306, 307, 311 (load after emex-pro.js) */
(function () {
  'use strict';
  if (!window.EmexPro) return;
  const f = n => (Number.isFinite(n) ? String(+n.toPrecision(6)) : '—');
  const PI = Math.PI, D = 180 / PI, LV = '300L', z0 = v => (Math.abs(v) < 1e-9 ? 0 : v);
  const mk = (s, v) => new Function(...v, 'with(Math){return ' + s.replace(/\^/g, '**').replace(/\blog\(/g, 'log10(').replace(/\bln\(/g, 'log(').replace(/\bpi\b/gi, 'PI').replace(/\be\b/g, 'E') + '}');
  const erf = x => { const s = x < 0 ? -1 : 1; x = Math.abs(x); const t = 1 / (1 + .3275911 * x); return s * (1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - .284496736) * t + .254829592) * t * Math.exp(-x * x)); };
  const Phi = z => .5 * (1 + erf(z / Math.SQRT2));
  window.EmexPro.P.push(
    [LV, 'GET 302: 2nd-order ODE (constant coefficients)', ['a (coefficient of y″)', 'b (coefficient of y′)', 'c (coefficient of y)'],
      ([a, b, c]) => {
        const d = b * b - 4 * a * c; if (!a) return 'a must not be zero';
        if (Math.abs(d) < 1e-12) return 'Repeated root m = ' + f(-b / (2 * a)) + '\ny = (C1 + C2·x)·e^(m·x)';
        if (d > 0) return 'Real roots\nm1 = ' + f((-b + Math.sqrt(d)) / (2 * a)) + '\nm2 = ' + f((-b - Math.sqrt(d)) / (2 * a)) + '\ny = C1·e^(m1·x) + C2·e^(m2·x)';
        const p = -b / (2 * a), q = Math.sqrt(-d) / (2 * Math.abs(a));
        return 'Complex roots m = ' + f(p) + ' ± j' + f(q) + '\ny = e^(' + f(p) + 'x)·(C1·cos(' + f(q) + 'x) + C2·sin(' + f(q) + 'x))';
      }, 0,
      'a·m² + b·m + c = 0\nm = (−{1} ± √({1}² − 4×{0}×{2})) / (2×{0})\nDistinct real: y = C1·e^(m1 x) + C2·e^(m2 x)\nRepeated: y = (C1 + C2 x)·e^(m x)\nComplex: y = e^(p x)(C1 cos qx + C2 sin qx)'],
    [LV, 'GET 302: Runge-Kutta 4 for y′ = f(x, y)', ['f(x, y), e.g. x + y', 'x0', 'y0', 'h (step size)', 'Steps'],
      (n, r) => {
        let g; try { g = mk(r[0], ['x', 'y']); g(0, 0); } catch (e) { return 'Invalid f(x, y). Example: x + y'; }
        let x = n[1], y = n[2]; const h = n[3], N = Math.round(n[4]);
        if ([x, y, h, N].some(isNaN) || N < 1 || N > 10000) return 'Enter x0, y0, h and steps (1 to 10000)';
        let xe = x, ye = y; const rows = [];
        for (let i = 1; i <= N; i++) {
          const k1 = g(x, y), k2 = g(x + h / 2, y + h * k1 / 2), k3 = g(x + h / 2, y + h * k2 / 2), k4 = g(x + h, y + h * k3);
          y += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6; x += h; ye += h * g(xe, ye); xe += h;
          if (i <= 5 || i === N) rows.push('x = ' + f(x) + '   y(RK4) = ' + f(y));
        }
        return rows.join('\n') + '\n\nAt x = ' + f(x) + ':\nRK4 = ' + f(y) + '\nEuler = ' + f(ye);
      }, 1,
      'k1 = f(xn, yn)\nk2 = f(xn + h/2, yn + h·k1/2)\nk3 = f(xn + h/2, yn + h·k2/2)\nk4 = f(xn + h, yn + h·k3)\ny(n+1) = yn + (h/6)(k1 + 2k2 + 2k3 + k4)'],
    [LV, 'GET 302: Lagrange interpolation', ['x values (comma separated)', 'y values (comma separated)', 'x to estimate'],
      (n, r) => {
        const X = r[0].split(',').map(parseFloat), Y = r[1].split(',').map(parseFloat), t = n[2];
        if (X.length < 2 || X.length !== Y.length || X.concat(Y, [t]).some(isNaN)) return 'Enter the same number of x and y values (at least 2), and the x to estimate';
        if (new Set(X).size !== X.length) return 'x values must all be different';
        let s = 0; X.forEach((xi, i) => { let l = 1; X.forEach((xj, j) => { if (i !== j) l *= (t - xj) / (xi - xj); }); s += Y[i] * l; });
        return 'P(' + f(t) + ') ≈ ' + f(s) + '\nPolynomial degree = ' + (X.length - 1);
      }, 1,
      'P(x) = Σ yi × Π (x − xj) / (xi − xj),  j ≠ i'],
    [LV, 'GET 302: Bessel Jn(x) and Legendre Pn(x)', ['n (order, whole number)', 'x'],
      ([n, x]) => {
        if (n < 0 || n !== Math.floor(n) || n > 30) return 'n must be a whole number from 0 to 30';
        const fa = k => { let p = 1; for (let i = 2; i <= k; i++) p *= i; return p; };
        let J = 0; for (let k = 0; k < 60; k++) J += (k % 2 ? -1 : 1) / (fa(k) * fa(k + n)) * (x / 2) ** (2 * k + n);
        let p0 = 1, p1 = x, P = n === 0 ? 1 : x; for (let k = 2; k <= n; k++) { const p2 = ((2 * k - 1) * x * p1 - (k - 1) * p0) / k; p0 = p1; p1 = p2; P = p1; }
        return 'J' + n + '(' + f(x) + ') = ' + (Math.abs(x) > 20 ? '— (series valid for |x| ≤ 20)' : f(J)) + '\nP' + n + '(' + f(x) + ') = ' + f(P) + (Math.abs(x) > 1 ? '   (Legendre is used for −1 ≤ x ≤ 1)' : '');
      }, 0,
      'Jn(x) = Σ (−1)^k / (k!·(k+n)!) × (x/2)^(2k+n)\n(k+1)·P(k+1) = (2k+1)·x·P(k) − k·P(k−1)'],
    [LV, 'GET 301: Complex numbers (polar, powers, roots)', ['a (real part)', 'b (imaginary part)', 'n (power or root index)'],
      ([a, b, n]) => {
        const r = Math.hypot(a, b), t = Math.atan2(b, a);
        const cj = (m, ang) => { let x = m * Math.cos(ang), y = m * Math.sin(ang); if (Math.abs(x) < 1e-12 * m) x = 0; if (Math.abs(y) < 1e-12 * m) y = 0; return f(x) + (y < 0 ? ' − ' : ' + ') + f(Math.abs(y)) + 'j'; };
        return 'Polar: ' + f(r) + ' ∠ ' + f(t * D) + '°\nConjugate = ' + f(a) + (b > 0 ? ' − ' : ' + ') + f(Math.abs(b)) + 'j\nz^' + f(n) + ' = ' + cj(r ** n, n * t) + '\nPrincipal ' + f(n) + 'th root = ' + cj(r ** (1 / n), t / n);
      }, 0,
      'r = √({0}² + {1}²),  θ = atan({1} / {0})\nz^n = r^n × (cos nθ + j sin nθ)\nz^(1/n) = r^(1/n) × (cos(θ/n) + j sin(θ/n))'],
    [LV, 'GET 301: Fourier series coefficients (numeric)', ['f(x), e.g. x or abs(x)', 'L (half period: f repeats every 2L)', 'n (harmonic)'],
      (n, r) => {
        let g; try { g = mk(r[0], ['x']); g(0); } catch (e) { return 'Invalid f(x). Example: x^2'; }
        const L = n[1], k = Math.round(n[2]); if (!(L > 0) || !(k >= 0)) return 'Enter L > 0 and n ≥ 0';
        const I = h => { const N = 2000, dx = 2 * L / N; let s = h(-L) + h(L); for (let i = 1; i < N; i++) s += h(-L + i * dx) * (i % 2 ? 4 : 2); return s * dx / 3; };
        return 'a0/2 = ' + f(z0(I(g) / (2 * L))) + ' (average value)\na' + k + ' = ' + f(z0(I(x => g(x) * Math.cos(k * PI * x / L)) / L)) + '\nb' + k + ' = ' + f(z0(I(x => g(x) * Math.sin(k * PI * x / L)) / L));
      }, 1,
      'an = (1/L) ∫ f(x) cos(nπx/L) dx   from −L to L\nbn = (1/L) ∫ f(x) sin(nπx/L) dx\na0/2 = (1/2L) ∫ f(x) dx'],
    [LV, 'EEE 311 / 315: Laplace transform at a point (numeric)', ['f(t) for t ≥ 0, e.g. exp(-t)*sin(2*t)', 's (real, positive)'],
      (n, r) => {
        let g; try { g = mk(r[0], ['t']); g(1); } catch (e) { return 'Invalid f(t). Example: t^2'; }
        const s = n[1]; if (!(s > 0)) return 'Enter s greater than 0';
        const T = 40 / s, N = 20000, h = T / N; let a = g(0) + g(T) * Math.exp(-s * T);
        for (let i = 1; i < N; i++) a += g(i * h) * Math.exp(-s * i * h) * (i % 2 ? 4 : 2);
        return 'F(' + f(s) + ') ≈ ' + f(a * h / 3) + '\n(Valid when the integral converges. Compare with your table of transforms.)';
      }, 1,
      'F(s) = ∫ f(t)·e^(−s·t) dt,  from 0 to ∞\n(computed numerically up to t = 40/s)'],

    [LV, 'GET 305: Normal distribution', ['μ (mean)', 'σ (standard deviation)', 'x1', 'x2 (upper value, x2 > x1)'],
      ([m, s, x1, x2]) => {
        if (!(s > 0)) return 'σ must be greater than 0';
        const a = (x1 - m) / s, b = (x2 - m) / s;
        return 'z1 = ' + f(a) + ',  z2 = ' + f(b) + '\nP(X ≤ x1) = ' + f(Phi(a)) + '\nP(X > x1) = ' + f(1 - Phi(a)) + '\nP(x1 ≤ X ≤ x2) = ' + f(Phi(b) - Phi(a));
      }, 0,
      'z = (x − {0}) / {1}\nP(X ≤ x) = Φ(z)\nP(x1 ≤ X ≤ x2) = Φ(z2) − Φ(z1)'],
    [LV, 'GET 305: Linear regression and correlation', ['x values (comma separated)', 'y values (comma separated)'],
      (n, r) => {
        const X = r[0].split(',').map(parseFloat), Y = r[1].split(',').map(parseFloat), k = X.length;
        if (k < 3 || k !== Y.length || X.concat(Y).some(isNaN)) return 'Enter the same number of x and y values (at least 3)';
        const mx = X.reduce((a, b) => a + b) / k, my = Y.reduce((a, b) => a + b) / k; let sxy = 0, sxx = 0, syy = 0;
        X.forEach((x, i) => { sxy += (x - mx) * (Y[i] - my); sxx += (x - mx) ** 2; syy += (Y[i] - my) ** 2; });
        if (!sxx) return 'x values must not all be the same';
        const m = sxy / sxx, c = my - m * mx, rr = sxy / Math.sqrt(sxx * syy);
        return 'y = ' + f(m) + 'x ' + (c < 0 ? '− ' : '+ ') + f(Math.abs(c)) + '\nSlope = ' + f(m) + '\nIntercept = ' + f(c) + '\nr = ' + f(rr) + '\nR² = ' + f(rr * rr);
      }, 1,
      'm = Σ(x − x̄)(y − ȳ) / Σ(x − x̄)²\nc = ȳ − m·x̄\nr = Σ(x − x̄)(y − ȳ) / √(Σ(x − x̄)² × Σ(y − ȳ)²)'],
    [LV, 'GET 305: Binomial and Poisson probability', ['n (trials)', 'p (success probability, 0 to 1)', 'k (successes)', 'λ (Poisson mean)'],
      ([n, p, k, l]) => {
        if (n < 0 || k < 0 || k > n || p < 0 || p > 1 || n !== Math.floor(n) || k !== Math.floor(k)) return 'Check n and k (whole numbers, k ≤ n) and 0 ≤ p ≤ 1';
        const nc = (a, b) => { let r = 1; for (let i = 1; i <= b; i++) r = r * (a - b + i) / i; return r; };
        const fa = i => { let q = 1; for (let j = 2; j <= i; j++) q *= j; return q; };
        const bp = i => nc(n, i) * p ** i * (1 - p) ** (n - i), pp = i => Math.exp(-l) * l ** i / fa(i);
        let cb = 0, cp = 0; for (let i = 0; i <= k; i++) { cb += bp(i); cp += pp(i); }
        return 'Binomial: P(X = k) = ' + f(bp(k)) + ', P(X ≤ k) = ' + f(cb) + '\nMean = ' + f(n * p) + ', Variance = ' + f(n * p * (1 - p)) + '\nPoisson: P(X = k) = ' + f(pp(k)) + ', P(X ≤ k) = ' + f(cp) + '\nMean = Variance = ' + f(l);
      }, 0,
      'Binomial: P(X=k) = C(n,k) · p^k · (1−p)^(n−k)\nPoisson: P(X=k) = e^(−λ) · λ^k / k!\nMean = n·p,  Variance = n·p·(1−p)'],
    [LV, 'GET 305: Confidence interval for a mean', ['x̄ (sample mean)', 's (standard deviation)', 'n (sample size)', 'Confidence level (90, 95 or 99)'],
      ([m, s, n, c]) => {
        const z = { 90: 1.645, 95: 1.96, 99: 2.576 }[c]; if (!z) return 'Use 90, 95 or 99 for the confidence level';
        const e = z * s / Math.sqrt(n);
        return f(c) + '% interval: ' + f(m - e) + ' to ' + f(m + e) + '\nMargin of error = ±' + f(e) + (n < 30 ? '\nNote: for n < 30 use the t-table value instead of z.' : '');
      }, 0,
      'E = z × s / √n    (z = 1.645, 1.96, 2.576 for 90%, 95%, 99%)\nInterval = x̄ ± E'],

    [LV, 'GET 306: Solar PV array sizing', ['Daily load (Wh)', 'Peak sun hours per day', 'System efficiency (0 to 1, e.g. 0.75)', 'Panel rating (Wp)'],
      ([w, h, e, p]) => { const a = w / (h * e), k = Math.ceil(a / p - 1e-9); return 'Array size needed = ' + f(a) + ' Wp\nPanels needed = ' + k + ' × ' + f(p) + ' Wp\nDaily energy from these panels = ' + f(k * p * h * e) + ' Wh'; }, 0,
      'Array (Wp) = {0} / ({1} × {2})\nPanels = Array / {3}  (round up)'],
    [LV, 'GET 306: Wind turbine power and Betz limit', ['Rotor diameter (m)', 'Wind speed (m/s)', 'Cp (power coefficient, max 0.593)', 'Air density (kg/m³, 1.225 at sea level)'],
      ([d, v, cp, rho]) => { const A = PI * d * d / 4, pw = .5 * rho * A * v ** 3; return 'Swept area = ' + f(A) + ' m²\nWind power available = ' + f(pw) + ' W\nBetz limit (59.3%) = ' + f(.593 * pw) + ' W\nPower extracted at Cp = ' + f(cp * pw) + ' W' + (cp > .593 ? '\nWarning: Cp cannot exceed 0.593' : ''); }, 0,
      'A = π × {0}² / 4\nP = ½ × {3} × A × {1}³\nP(extracted) = {2} × P'],
    [LV, 'GET 306: Hydropower', ['Head (m)', 'Flow rate (m³/s)', 'Overall efficiency (0 to 1)'],
      ([h, q, e]) => 'Theoretical power = ' + f(9.81 * q * h) + ' kW\nElectrical output = ' + f(9.81 * q * h * e) + ' kW\nAnnual energy (full output) = ' + f(9.81 * q * h * e * 8760) + ' kWh', 0,
      'P = ρ × g × Q × H × η = 1000 × 9.81 × {1} × {0} × {2}'],

    [LV, 'GET 311: Interest factors and equivalent amounts', ['i (% per period)', 'n (periods)', 'Amount', 'Type (1 = P present, 2 = A each period, 3 = F future)'],
      ([i, n, a, t]) => {
        const r = i / 100, g = (1 + r) ** n, fp = g, pf = 1 / g, ap = r * g / (g - 1), pa = (g - 1) / (r * g), fa = (g - 1) / r, af = r / (g - 1);
        if (!(r > 0) || !(n > 0)) return 'i and n must be greater than 0';
        let P, A, F; if (t === 1) { P = a; A = a * ap; F = a * fp; } else if (t === 2) { A = a; P = a * pa; F = a * fa; } else if (t === 3) { F = a; P = a * pf; A = a * af; } else return 'Type must be 1, 2 or 3';
        return 'F/P = ' + f(fp) + '    P/F = ' + f(pf) + '\nA/P = ' + f(ap) + '    P/A = ' + f(pa) + '\nF/A = ' + f(fa) + '    A/F = ' + f(af) + '\nEquivalent P = ' + f(P) + '\nEquivalent A = ' + f(A) + '\nEquivalent F = ' + f(F);
      }, 0,
      'F/P = (1 + i)^n,   P/F = 1 / (1 + i)^n\nA/P = i(1+i)^n / ((1+i)^n − 1),   P/A = ((1+i)^n − 1) / (i(1+i)^n)\nF/A = ((1+i)^n − 1) / i,   A/F = i / ((1+i)^n − 1)\nwith i = {0}% / 100 and n = {1}'],
    [LV, 'GET 311: NPV, IRR and payback', ['Cash flows, year 0 first (comma separated, e.g. -1000,300,400,500)', 'Discount rate (%)'],
      (n, r) => {
        const c = r[0].split(',').map(parseFloat), k = n[1] / 100;
        if (c.length < 2 || c.some(isNaN) || isNaN(k)) return 'Enter at least 2 cash flows and a discount rate';
        const npv = q => c.reduce((s, v, t) => s + v / (1 + q) ** t, 0);
        let lo = -.99, hi = 10, irr = NaN;
        if (npv(lo) * npv(hi) < 0) { for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (npv(lo) * npv(m) <= 0) hi = m; else lo = m; } irr = (lo + hi) / 2; }
        let cum = 0, pb = 'not recovered';
        for (let t = 0; t < c.length; t++) { const prev = cum; cum += c[t]; if (t > 0 && cum >= 0 && prev < 0) { pb = f(t - 1 + (-prev) / c[t]) + ' years'; break; } }
        return 'NPV at ' + f(k * 100) + '% = ' + f(npv(k)) + '\nIRR = ' + (isNaN(irr) ? 'not found (no sign change)' : f(irr * 100) + ' %') + '\nPayback = ' + pb + '\n' + (npv(k) >= 0 ? 'NPV ≥ 0: acceptable' : 'NPV < 0: reject');
      }, 1,
      'NPV = Σ CFt / (1 + i)^t\nIRR: the rate where NPV = 0\nPayback: the year when cumulative cash flow turns positive'],
    [LV, 'GET 311: Benefit-cost ratio and payback', ['Initial cost', 'Annual benefit', 'Annual cost (operating)', 'i (% per year)', 'n (years)'],
      ([c0, b, c, i, n]) => { const r = i / 100, pa = (1 - (1 + r) ** -n) / r, pwb = b * pa, pwc = c0 + c * pa; return 'PW of benefits = ' + f(pwb) + '\nPW of costs = ' + f(pwc) + '\nB/C ratio = ' + f(pwb / pwc) + (pwb / pwc >= 1 ? '  (acceptable)' : '  (reject)') + '\nNPV = ' + f(pwb - pwc) + '\nSimple payback = ' + (b > c ? f(c0 / (b - c)) + ' years' : 'never'); }, 0,
      'P/A = (1 − (1 + i)^−n) / i\nPW(benefits) = {1} × P/A\nPW(costs) = {0} + {2} × P/A\nB/C = PW(benefits) / PW(costs)'],
    [LV, 'GET 311: Depreciation (straight-line and declining balance)', ['Cost', 'Salvage value', 'Life (years)', 'Year k'],
      ([c, s, l, k]) => {
        if (l < 1 || k < 1 || k > l) return 'Year k must be between 1 and the life';
        const sl = (c - s) / l, rt = 2 / l; let b = c, dk = 0;
        for (let y = 1; y <= k; y++) { dk = Math.max(0, Math.min(b * rt, b - s)); b -= dk; }
        return 'Straight-line: ' + f(sl) + ' per year, book value after year ' + f(k) + ' = ' + f(c - sl * k) + '\nDouble declining balance (rate ' + f(rt * 100) + '%): depreciation in year ' + f(k) + ' = ' + f(dk) + ', book value = ' + f(b);
      }, 0,
      'SL = ({0} − {1}) / {2},   BV(k) = {0} − SL × {3}\nDDB rate = 2 / {2};  Dep(k) = rate × BV(k−1)  (never below salvage)'],
    [LV, 'GET 311: Equivalent annual cost (compare two options)', ['A: first cost', 'A: annual cost', 'A: salvage value', 'A: life (years)', 'B: first cost', 'B: annual cost', 'B: salvage value', 'B: life (years)', 'i (% per year)'],
      ([p1, a1, s1, n1, p2, a2, s2, n2, i]) => {
        const r = i / 100, eac = (p, a, s, n) => (p - s) * r * (1 + r) ** n / ((1 + r) ** n - 1) + s * r + a, x = eac(p1, a1, s1, n1), y = eac(p2, a2, s2, n2);
        return 'EAC of A = ' + f(x) + ' per year\nEAC of B = ' + f(y) + ' per year\n' + (x < y ? 'Option A is cheaper' : y < x ? 'Option B is cheaper' : 'Both cost the same');
      }, 0,
      'EAC(A) = ({0} − {2}) × A/P({8}%, {3}) + {2} × {8}% + {1}\nEAC(B) = ({4} − {6}) × A/P({8}%, {7}) + {6} × {8}% + {5}\nChoose the option with the lower EAC'],

    [LV, 'GET 307: Classification metrics', ['TP (true positives)', 'FP (false positives)', 'TN (true negatives)', 'FN (false negatives)'],
      ([tp, fp, tn, fn]) => { const p = tp / (tp + fp), r = tp / (tp + fn); return 'Accuracy = ' + f((tp + tn) / (tp + fp + tn + fn) * 100) + ' %\nPrecision = ' + f(p) + '\nRecall (sensitivity) = ' + f(r) + '\nSpecificity = ' + f(tn / (tn + fp)) + '\nF1 score = ' + f(2 * p * r / (p + r)); }, 0,
      'Accuracy = (TP + TN) / total\nPrecision = TP / (TP + FP)\nRecall = TP / (TP + FN)\nSpecificity = TN / (TN + FP)\nF1 = 2 × Precision × Recall / (Precision + Recall)'],
    [LV, 'GET 307: Neuron output and activation functions', ['w1', 'w2', 'b (bias)', 'x1', 'x2'],
      ([w1, w2, b, x1, x2]) => { const z = w1 * x1 + w2 * x2 + b; return 'z = ' + f(z) + '\nSigmoid = ' + f(1 / (1 + Math.exp(-z))) + '\nTanh = ' + f(Math.tanh(z)) + '\nReLU = ' + f(Math.max(0, z)) + '\nStep = ' + (z >= 0 ? 1 : 0); }, 0,
      'z = {0}×{3} + {1}×{4} + {2}\nSigmoid = 1 / (1 + e^(−z))\nReLU = max(0, z)'],
    [LV, 'GET 307: Entropy and Gini impurity', ['Class counts (comma separated, e.g. 9,5)'],
      (n, r) => {
        const c = r[0].split(',').map(parseFloat).filter(x => x >= 0), t = c.reduce((a, b) => a + b, 0);
        if (c.length < 2 || !t) return 'Enter at least 2 class counts';
        const ps = c.map(x => x / t);
        return 'Entropy = ' + f(-ps.reduce((a, p) => a + (p > 0 ? p * Math.log2(p) : 0), 0)) + ' bits\nGini = ' + f(1 - ps.reduce((a, p) => a + p * p, 0)) + '\nMaximum entropy for ' + c.length + ' classes = ' + f(Math.log2(c.length)) + ' bits';
      }, 1,
      'Entropy = −Σ p × log2(p)\nGini = 1 − Σ p²'],
    [LV, 'GET 307: Distance and similarity (KNN)', ['Vector a (comma separated)', 'Vector b (comma separated)'],
      (n, r) => {
        const a = r[0].split(',').map(parseFloat), b = r[1].split(',').map(parseFloat);
        if (a.length !== b.length || a.concat(b).some(isNaN)) return 'Enter two vectors of the same length';
        const d = a.map((x, i) => x - b[i]), dot = a.reduce((s, x, i) => s + x * b[i], 0), c = dot / (Math.hypot(...a) * Math.hypot(...b));
        return 'Euclidean = ' + f(Math.hypot(...d)) + '\nManhattan = ' + f(d.reduce((s, x) => s + Math.abs(x), 0)) + '\nCosine similarity = ' + f(c) + '\nCosine distance = ' + f(1 - c);
      }, 1,
      'Euclidean = √Σ(ai − bi)²\nManhattan = Σ|ai − bi|\nCosine similarity = a·b / (|a| × |b|)'],
    [LV, 'GET 307: Softmax and cross-entropy loss', ['Scores (comma separated)', 'Correct class number (1 = first)'],
      (n, r) => {
        const z = r[0].split(',').map(parseFloat), k = Math.round(n[1]) - 1;
        if (z.length < 2 || z.some(isNaN) || !(k >= 0 && k < z.length)) return 'Enter 2 or more scores and a valid class number';
        const m = Math.max(...z), e = z.map(x => Math.exp(x - m)), s = e.reduce((a, b) => a + b), p = e.map(x => x / s);
        return 'Probabilities = ' + p.map(f).join(', ') + '\nPredicted class = ' + (p.indexOf(Math.max(...p)) + 1) + '\nCross-entropy loss = ' + f(-Math.log(p[k]));
      }, 1,
      'softmax(zi) = e^zi / Σ e^zj\nLoss = −ln(probability of the correct class)']
  );
})();
