/* Emex Learn v1 - concept explanations under every formula, and reasons in Smart Solve (load after the packs and emex-home.js) */
(function () {
  'use strict';
  const B = document.getElementById('ehc');
  if (!B || !window.EmexPro) return;
  const P = window.EmexPro.P, EX = (window.EmexLearn = window.EmexLearn || {});
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  const D = {
    "Ohm's Law (leave one blank)": { what: 'The voltage across a resistor is directly proportional to the current through it. The constant that links them is the resistance: V = I × R.', use: 'Any time a resistor is involved and you know two of the three: voltage (V), current (I) or resistance (R). Leave the unknown one blank.', pts: ['1 volt across 1 ohm drives 1 amp.', 'Double the voltage with the same resistance and the current doubles.', 'It only holds for linear (ohmic) parts like resistors. LEDs and diodes do not follow it.'], ex: 'A 12 V battery is connected across a 470 Ω resistor. I = V / R = 12 / 470 = 0.0255 A, which is 25.5 mA.' },
    'Power P = V·I (leave one blank)': { what: 'Electrical power is the rate at which energy is used or delivered: P = V × I. Combined with Ohm\'s law it also becomes P = I²R and P = V²/R.', use: 'Sizing resistors and fuses, checking appliance ratings, estimating heat, or finding energy cost.', pts: ['Power is in watts (W): 1 W = 1 V × 1 A.', 'Energy in kWh = power in kW × hours used.', 'A resistor must be rated for at least the power it will dissipate, ideally double.'], ex: 'A 230 V heater draws 8.7 A. P = V × I = 230 × 8.7 = 2001 W, about 2 kW. Running it for 3 hours uses about 6 kWh.' },
    'Resistors: series & parallel': { what: 'Resistors in series share one path, so their values simply add. Resistors in parallel give the current several paths, so the total resistance is lower than the smallest one.', use: 'Combining resistors to get a value you do not have, or simplifying a circuit before using Ohm\'s law.', pts: ['Series: R = R1 + R2 + R3 …', 'Parallel: 1/R = 1/R1 + 1/R2 + 1/R3 …', 'Two resistors in parallel: R = (R1 × R2) / (R1 + R2).', 'Parallel total is always smaller than the smallest resistor.'], ex: 'For 100 Ω, 220 Ω and 330 Ω: in series the total is 650 Ω. In parallel it is 1 / (0.01 + 0.004545 + 0.00303) = 56.9 Ω, lower than 100 Ω.' },
    'Voltage divider': { what: 'Two resistors in series split the input voltage in proportion to their sizes. The output is taken across R2: Vout = Vin × R2 / (R1 + R2).', use: 'Getting a lower reference or sensor voltage, such as scaling 12 V down to 3.3 V for a microcontroller input.', pts: ['A bigger R2 gives a bigger output share.', 'It works well only when whatever you connect to Vout draws very little current.', 'A load in parallel with R2 pulls the output voltage down.', 'Not suitable for powering things, because the resistors waste power as heat.'], ex: 'Vin = 12 V, R1 = 10 kΩ, R2 = 5 kΩ. Vout = 12 × 5 / 15 = 4 V. The current is 12 / 15 kΩ = 0.8 mA.' },
    'Capacitive reactance Xc': { what: 'A capacitor opposes AC current. This opposition, called reactance, gets smaller as the frequency or the capacitance goes up: Xc = 1 / (2πfC).', use: 'Working out AC current through a capacitor, designing filters, or choosing coupling and bypass capacitors.', pts: ['At very high frequency a capacitor acts like a short circuit.', 'At DC (f = 0) it acts like an open circuit, so Xc is infinite.', 'Use farads: 100 µF = 100e-6 F.', 'Current through a capacitor leads the voltage by 90°.'], ex: 'At 50 Hz with C = 100 µF: Xc = 1 / (2π × 50 × 100e-6) = 31.8 Ω.' },
    'Inductive reactance XL': { what: 'An inductor opposes changes in current. For AC, its opposition grows with frequency and inductance: XL = 2πfL.', use: 'Finding AC current through a coil, designing chokes and filters, or analysing motors and transformers.', pts: ['At DC an inductor is just a wire (XL = 0).', 'At high frequency it blocks the current more.', 'Use henries: 10 mH = 10e-3 H.', 'Current through an inductor lags the voltage by 90°.'], ex: 'At 50 Hz with L = 10 mH: XL = 2π × 50 × 0.01 = 3.14 Ω.' },
    'Resonant frequency': { what: 'In a circuit with an inductor and a capacitor, there is one frequency where the inductive and capacitive reactances are equal and cancel: f0 = 1 / (2π√(LC)).', use: 'Tuning radios, building band-pass or notch filters, and oscillators.', pts: ['At resonance in a series RLC circuit the impedance is just R, the lowest it can be, so current is at its peak.', 'Bigger L or C lowers the resonant frequency.', 'Use henries and farads, not mH or µF.'], ex: 'L = 10 mH and C = 100 µF give f0 = 1 / (2π√(0.01 × 100e-6)) = 159.2 Hz.' },
    'RC time constant': { what: 'When a capacitor charges through a resistor, it does not fill instantly. The time constant τ = R × C tells you how fast it happens.', use: 'Timing circuits, delays, debouncing switches, and filters.', pts: ['After 1τ the capacitor has reached 63.2% of its final voltage.', 'After 5τ it is over 99% charged, which is usually treated as fully charged.', 'A bigger R or C makes it slower.', 'Discharging follows the same time constant.'], ex: 'R = 10 kΩ and C = 100 µF give τ = 10 000 × 0.0001 = 1 s. It is essentially fully charged after 5 s.' },
    'Series RLC impedance': { what: 'In a series circuit with R, L and C, the resistor opposes current directly, while L and C oppose it in opposite directions. The total opposition is the impedance: |Z| = √(R² + (XL − Xc)²).', use: 'AC circuit analysis, finding current and phase angle, and checking if a circuit is inductive or capacitive.', pts: ['If XL > Xc the circuit is inductive and the current lags the voltage.', 'If Xc > XL it is capacitive and the current leads.', 'If XL = Xc it is at resonance and |Z| = R.', 'A negative phase angle means capacitive.'], ex: 'R = 10 Ω, L = 10 mH, C = 100 µF at 50 Hz: XL = 3.14 Ω, Xc = 31.8 Ω, so net reactance = −28.7 Ω. |Z| = √(100 + 823) = 30.4 Ω and the phase is −70.8° (capacitive).' },
    'Three-phase power': { what: 'A three-phase supply delivers power through three lines. Using line values, the apparent power is S = √3 × VL × IL, and the real power is P = S × power factor.', use: 'Sizing motors, generators, cables and breakers in industrial and commercial supply.', pts: ['Use LINE voltage and LINE current.', 'S is in VA, P in watts and Q in VAR.', 'Power factor is cos φ. A low power factor wastes capacity.', 'Nigeria\'s typical three-phase line voltage is about 415 V.'], ex: 'VL = 415 V, IL = 20 A, pf = 0.85: S = √3 × 415 × 20 = 14 376 VA, P = 12 220 W and Q = 7 573 VAR.' },
    'Rectangular → Polar': { what: 'A complex number a + jb can be written as a length (magnitude r) and an angle θ. In AC circuits this turns voltages and currents into phasors.', use: 'Multiplying or dividing complex numbers, and working with impedance and phasors.', pts: ['r = √(a² + b²).', 'θ = atan(b / a). Check the quadrant: a negative real part puts the angle past 90°.', 'Polar form makes multiplication easy: multiply magnitudes and add angles.'], ex: '3 + j4 has magnitude √(9 + 16) = 5 and angle atan(4/3) = 53.13°. In polar form that is 5 ∠ 53.13°.' },
    'Polar → Rectangular': { what: 'The reverse of the polar conversion: a magnitude r and angle θ become a real part r cos θ and an imaginary part r sin θ.', use: 'Adding or subtracting phasors, which is easiest in rectangular form.', pts: ['Re = r × cos θ.', 'Im = r × sin θ.', 'Make sure the angle is in degrees here.'], ex: '10 ∠ 30° gives Re = 10 cos 30° = 8.66 and Im = 10 sin 30° = 5. So 8.66 + j5.' },
    'Transformer': { what: 'An ideal transformer changes voltage in proportion to the turns on its coils: Vs / Vp = Ns / Np. More turns on the secondary steps the voltage up, fewer steps it down.', use: 'Finding secondary voltage, or choosing turns for a required voltage.', pts: ['An ideal transformer conserves power, so a higher voltage means a lower current.', 'Is / Ip = Np / Ns.', 'Transformers work only with AC.', 'Real transformers have small losses (see the 300L pack).'], ex: 'Vp = 230 V, Np = 1000 turns, Ns = 100 turns: Vs = 230 × 100 / 1000 = 23 V.' },
    'Decibels': { what: 'The decibel compares two quantities on a log scale, which is useful when numbers span huge ranges. Power ratio: dB = 10 log10(P2/P1). Voltage ratio: dB = 20 log10(V2/V1).', use: 'Amplifier gain, filter attenuation, signal loss in cables, and radio links.', pts: ['+3 dB is about double the power. +6 dB is about double the voltage.', 'Every +10 dB is ten times the power.', 'A negative dB means a loss.', 'Voltage uses 20 because power goes with voltage squared.'], ex: 'A ratio of 100: as power it is 10 log10(100) = 20 dB. As voltage it is 20 log10(100) = 40 dB.' }
  };
  Object.keys(D).forEach(k => { if (!EX[k]) EX[k] = D[k]; });

  const sym = l => { const t = l.replace(/\s*\(.*$/, '').trim(); return t.length > 24 ? 'Input' : t; };
  const sec = (h, t) => '<div style="margin-top:8px"><b>' + h + '</b><br>' + esc(t) + '</div>';
  function html(name) {
    const d = EX[name];
    if (d) return sec('📘 What it means', d.what) + sec('🎯 When to use it', d.use) + '<div style="margin-top:8px"><b>🔑 Key points</b>' + d.pts.map(p => '<br>• ' + esc(p)).join('') + '</div>' + sec('✏️ Worked example', d.ex);
    const e = P.find(x => x[1] === name); if (!e) return '';
    const s = e[2].map(sym), lines = (e[5] || '').replace(/\{(\d+)\}/g, (m, n) => s[n] || m);
    return (lines ? sec('📐 How it is worked out', lines) : '') + '<div style="margin-top:8px"><b>⌨️ What to enter</b>' + e[2].map(l => '<br>• ' + esc(l)).join('') + '</div>' + sec('💡 Tip', 'Type values with units like 4.7k, 100u or 2m. After you tap Solve, the result shows the formula and your numbers step by step.') + '<div style="margin-top:8px;opacity:.7;font-size:12px">A fuller concept explanation for this formula is being written.</div>';
  }

  const st = document.createElement('style');
  st.textContent = '.ex{margin:6px 0 10px;border:1px solid #8884;border-radius:10px;background:#8881}.ex summary{padding:10px 12px;font-size:14px;cursor:pointer}.ex>div{padding:0 12px 12px;font-size:13.5px;line-height:1.45;white-space:pre-wrap}';
  document.head.appendChild(st);

  function refresh() {
    const d = B.querySelector('#exd'); if (!d) return;
    const pf = B.querySelector('#pf'), fs = B.querySelector('#fs');
    const name = pf && P[pf.value] ? P[pf.value][1] : fs && fs.selectedOptions[0] ? fs.selectedOptions[0].textContent : '';
    B.querySelector('#exb').innerHTML = html(name);
  }
  new MutationObserver(() => {
    const anchor = B.querySelector('#hmfav') || B.querySelector('#pf') || B.querySelector('#fs');
    if (anchor && !B.querySelector('#exd')) {
      const d = document.createElement('details'); d.id = 'exd'; d.className = 'ex'; d.innerHTML = '<summary>📘 Learn: what is this formula?</summary><div id="exb"></div>';
      anchor.after(d); refresh();
    }
  }).observe(B, { childList: true, subtree: true });
  B.addEventListener('change', () => setTimeout(refresh, 0));

  /* Smart Solve: explain why each formula was used */
  const WHY = {
    'I = V/R': "Ohm's law: current equals voltage divided by resistance.", 'I = P/V': 'From P = V × I, current is power divided by voltage.', 'I = √(P/R)': 'From P = I²R, current is the square root of power over resistance.',
    'V = I·R': "Ohm's law: voltage equals current times resistance.", 'V = P/I': 'From P = V × I, voltage is power divided by current.', 'V = √(P·R)': 'From P = V²/R, voltage is the square root of power times resistance.',
    'R = V/I': "Ohm's law rearranged: resistance is voltage divided by current.", 'R = V²/P': 'From P = V²/R, resistance is voltage squared over power.', 'R = P/I²': 'From P = I²R, resistance is power divided by current squared.',
    'P = V·I': 'Electrical power is voltage times current.', 'P = I²·R': 'Power lost as heat in a resistor grows with the square of the current.', 'P = V²/R': 'Power in a resistor can be found from voltage and resistance alone.',
    'Xc = 1/(2πfC)': "A capacitor's opposition to AC gets smaller as frequency or capacitance rises.", 'XL = 2πfL': "An inductor's opposition to AC grows with frequency and inductance.",
    'f0 = 1/(2π√(LC))': 'Resonance: the frequency where inductive and capacitive reactance are equal.', 'τ = R·C': 'The time constant: a capacitor reaches 63% of its final voltage after one τ.'
  };
  B.addEventListener('click', e => {
    if (e.target.id !== 'as') return;
    e.stopPropagation();
    const q = B.querySelector('#aq').value, out = window.EmexPro.smart(q), r = B.querySelector('#ar');
    const lines = out.split('\n');
    if (!lines.some(l => /^(I|V|R|P|Xc|XL|f0|τ) = /.test(l))) { r.textContent = out; return; }
    r.textContent = 'Here is how I worked it out:\n\n' + lines.map(l => { const k = Object.keys(WHY).find(x => l.indexOf(x + ' = ') === 0); return k ? l + '\n   Why: ' + WHY[k] : l; }).join('\n\n') + '\n\nTip: open the Formula Library and tap "Learn" on any formula to understand the concept.';
  }, true);
})();
