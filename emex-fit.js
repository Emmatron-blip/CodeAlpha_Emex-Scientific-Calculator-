/* Emex Fit v1 - makes the calculator fill the whole phone screen like a native app */
(function () {
  'use strict';
  var TOP = 'max(env(safe-area-inset-top,0px),30px)';

  if (!document.querySelector('meta[name=viewport]')) {
    var m = document.createElement('meta');
    m.name = 'viewport';
    m.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
    document.head.appendChild(m);
  }

  var st = document.createElement('style');
  st.textContent =
    'html,body{height:100%!important;margin:0!important;overflow-x:hidden!important}' +
    'body{padding:0!important;display:block!important;min-height:100%!important}' +
    '#ehb{top:calc(' + TOP + ' + 4px)!important;right:10px!important;bottom:auto!important;width:42px!important;height:42px!important;font-size:19px!important}';
  document.head.appendChild(st);

  function ours(el) { return el.closest('#eh') || el.id === 'ehb'; }

  function rowsOf(g) {
    var cs = getComputedStyle(g), n = 0;
    if (cs.display.indexOf('grid') > -1) {
      var r = cs.gridTemplateRows;
      if (r && r !== 'none') n = r.split(' ').length;
      else {
        var c = (cs.gridTemplateColumns || '').split(' ').length || 1;
        n = Math.ceil(g.children.length / c);
      }
    } else {
      var tops = {};
      Array.prototype.forEach.call(g.children, function (k) { tops[k.offsetTop] = 1; });
      n = Object.keys(tops).length;
    }
    return n || 1;
  }

  function styleGrid(g) {
    var cs = getComputedStyle(g);
    if (cs.display.indexOf('grid') > -1) {
      g.style.gridTemplateRows = 'none';
      g.style.gridAutoRows = '1fr';
    }
    g.style.minHeight = '0';
    g.style.flex = '1 1 0';
    Array.prototype.forEach.call(g.children, function (b) {
      b.style.height = 'auto';
      b.style.minHeight = '0';
    });
  }

  function colFlex(el, grow) {
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.minHeight = '0';
    el.style.flex = grow + ' 1 0';
  }

  function fit() {
    try {
      var btns = Array.prototype.filter.call(document.querySelectorAll('body button'), function (b) { return !ours(b); });
      if (btns.length < 8) return;

      var cnt = new Map();
      btns.forEach(function (b) { var p = b.parentElement; cnt.set(p, (cnt.get(p) || 0) + 1); });
      var grids = [];
      cnt.forEach(function (n, p) { if (n >= 4) grids.push(p); });
      if (!grids.length) return;

      var lca = grids[0];
      while (lca && !grids.every(function (g) { return lca.contains(g); })) lca = lca.parentElement;
      if (lca && grids.indexOf(lca) > -1) lca = lca.parentElement;
      if (!lca || lca === document.body || lca === document.documentElement) return;

      var path = [], e = lca;
      while (e && e !== document.body) { path.unshift(e); e = e.parentElement; }
      if (!e) return;

      var total = 0;
      var rowMap = new Map();
      grids.forEach(function (g) { var r = rowsOf(g); rowMap.set(g, r); total += r; });

      path.forEach(function (el, i) {
        var s = el.style;
        s.display = 'flex'; s.flexDirection = 'column'; s.boxSizing = 'border-box';
        s.maxWidth = 'none'; s.margin = '0'; s.minHeight = '0'; s.minWidth = '0'; s.width = '100%';
        if (i === 0) {
          s.height = '100%'; s.borderRadius = '0'; s.border = '0';
          s.padding = TOP + ' 10px 10px';
        } else {
          s.flex = (i === path.length - 1 ? '1' : String(total)) + ' 1 0';
          s.height = 'auto';
        }
        if (i < path.length - 1) {
          Array.prototype.forEach.call(el.children, function (c) {
            if (c !== path[i + 1] && !c.querySelector('button') && c.offsetHeight >= 60) c.style.flex = '2 1 auto';
          });
        }
      });

      Array.prototype.forEach.call(lca.children, function (c) {
        var gs = grids.filter(function (g) { return c === g || c.contains(g); });
        if (gs.length) {
          var rows = 0;
          gs.forEach(function (g) { rows += rowMap.get(g); });
          if (c === gs[0] && gs.length === 1) { styleGrid(c); c.style.flex = rows + ' 1 0'; return; }
          colFlex(c, rows);
          gs.forEach(function (g) {
            var p = g.parentElement;
            while (p && p !== c) { colFlex(p, 1); p = p.parentElement; }
            styleGrid(g);
          });
        } else if (!c.querySelector('button') && c.offsetHeight >= 60) {
          c.style.flex = '2 1 auto';
        }
      });
    } catch (err) { /* never break the calculator */ }
  }

  window.addEventListener('load', function () { fit(); setTimeout(fit, 400); setTimeout(fit, 1200); });
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', function () { setTimeout(fit, 300); });
})();
