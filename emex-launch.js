/* Emex Launch v1 - the app opens on the Home screen; the calculator is a tile (load after emex-ref.js, before emex-fit.js) */
(function () {
  'use strict';
  const b = document.getElementById('ehb');
  if (!b) return;
  b.textContent = '🏠';
  b.setAttribute('aria-label', 'Home');
  b.click();
})();
