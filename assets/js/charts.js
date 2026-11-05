// AI documentation showcase charts. All data is SAMPLE data.
// Built with DOM APIs + textContent only (no innerHTML), so nothing can inject markup.
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";

  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, String(attrs[k])); });
    if (parent) parent.appendChild(n);
    return n;
  }
  function txt(parent, x, y, s, attrs) {
    var t = el("text", Object.assign({ x: x, y: y }, attrs || {}), parent);
    t.textContent = s;
    return t;
  }
  function svg(container, w, h, label) {
    var s = el("svg", { viewBox: "0 0 " + w + " " + h, role: "img", "aria-label": label });
    container.appendChild(s);
    return s;
  }

  // Tooltip
  var tip = document.createElement("div");
  tip.className = "tooltip";
  tip.setAttribute("role", "status");
  function showTip(e, s) {
    tip.textContent = s;
    tip.classList.add("show");
    var x = (e.clientX || 0) + 12, y = (e.clientY || 0) + 12;
    if (x + 240 > window.innerWidth) x = window.innerWidth - 250;
    tip.style.left = x + "px"; tip.style.top = y + "px";
  }
  function hideTip() { tip.classList.remove("show"); }
  function hover(node, s) {
    node.setAttribute("tabindex", "0");
    node.addEventListener("mousemove", function (e) { showTip(e, s); });
    node.addEventListener("mouseleave", hideTip);
    node.addEventListener("focus", function () {
      var r = node.getBoundingClientRect();
      showTip({ clientX: r.left + r.width / 2, clientY: r.top }, s);
    });
    node.addEventListener("blur", hideTip);
    var title = el("title", null, node); title.textContent = s;
  }

  function widthOf(c) {
    var cs = window.getComputedStyle(c);
    var w = c.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    return Math.max(280, Math.floor(w));
  }

  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

  // ---------- 1. Leading vs lagging indicators ----------
  function indicators(c) {
    var nearMiss = [18, 22, 25, 24, 31, 35, 38, 41, 44, 47];
    var recordable = [6, 5, 6, 4, 4, 3, 3, 2, 2, 1];
    var W = widthOf(c), H = W < 520 ? 240 : 300, L = 34, R = 12, T = 18, B = 30;
    var s = svg(c, W, H, "Near-miss reports rising while recordable incidents fall, Jan to Oct 2026 (sample data)");
    var max = 50, pw = W - L - R, ph = H - T - B, step = pw / months.length;
    for (var g = 0; g <= 5; g++) {
      var y = T + ph - (g * 10 / max) * ph;
      el("line", { x1: L, x2: W - R, y1: y, y2: y, class: g ? "gridline" : "axis" }, s);
      txt(s, L - 8, y + 4, String(g * 10), { "text-anchor": "end" });
    }
    months.forEach(function (m, i) {
      var x = L + step * i + step / 2;
      txt(s, x, H - 12, m, { "text-anchor": "middle" });
      var bh = (recordable[i] / max) * ph;
      var bw = Math.min(18, step * 0.5);
      var r = el("rect", { x: x - bw / 2, y: T + ph - bh, width: bw, height: bh, rx: 2, class: "f-red" }, s);
      hover(r, m + " 2026: " + recordable[i] + " recordable incidents");
    });
    var pts = nearMiss.map(function (v, i) { return [L + step * i + step / 2, T + ph - (v / max) * ph]; });
    el("polyline", { points: pts.map(function (p) { return p.join(","); }).join(" "), fill: "none", class: "s-blue", "stroke-width": 2.5, "stroke-linejoin": "round" }, s);
    pts.forEach(function (p, i) {
      var d = el("circle", { cx: p[0], cy: p[1], r: 4.5, class: "f-blue dot" }, s);
      hover(d, months[i] + " 2026: " + nearMiss[i] + " near-miss reports");
    });
    txt(s, pts[9][0] - 6, pts[9][1] - 10, "47", { "text-anchor": "end", class: "lbl-strong" });
  }

  // ---------- 2. LTIFR vs target ----------
  function ltifr(c) {
    var v = [0.62, 0.58, 0.55, 0.51, 0.47, 0.42, 0.38, 0.33, 0.29, 0.24];
    var target = 0.40;
    var W = widthOf(c), H = 240, L = 36, R = 74, T = 16, B = 30;
    var s = svg(c, W, H, "Rolling 12-month LTIFR falling from 0.62 to 0.24 against a 0.40 target (sample data)");
    var max = 0.8, pw = W - L - R, ph = H - T - B, step = pw / (months.length - 1);
    for (var g = 0; g <= 4; g++) {
      var val = g * 0.2, y = T + ph - (val / max) * ph;
      el("line", { x1: L, x2: W - R, y1: y, y2: y, class: g ? "gridline" : "axis" }, s);
      txt(s, L - 8, y + 4, val.toFixed(1), { "text-anchor": "end" });
    }
    var ty = T + ph - (target / max) * ph;
    el("line", { x1: L, x2: W - R, y1: ty, y2: ty, class: "s-green", "stroke-width": 1.5, "stroke-dasharray": "6 5" }, s);
    txt(s, W - R + 6, ty + 4, "Target 0.40", { class: "lbl-green" });
    var pts = v.map(function (x, i) { return [L + step * i, T + ph - (x / max) * ph]; });
    var area = "M" + pts[0][0] + "," + (T + ph) + " L" + pts.map(function (p) { return p.join(","); }).join(" L") + " L" + pts[9][0] + "," + (T + ph) + " Z";
    el("path", { d: area, class: "f-ink-soft" }, s);
    el("polyline", { points: pts.map(function (p) { return p.join(","); }).join(" "), fill: "none", class: "s-ink", "stroke-width": 2.5 }, s);
    pts.forEach(function (p, i) {
      txt(s, p[0], H - 12, months[i], { "text-anchor": "middle" });
      var d = el("circle", { cx: p[0], cy: p[1], r: 4, class: v[i] <= target ? "f-green dot" : "f-orange dot" }, s);
      hover(d, months[i] + " 2026: LTIFR " + v[i].toFixed(2) + (v[i] <= target ? " (on target)" : " (above target)"));
    });
    txt(s, pts[9][0] + 8, pts[9][1] + 4, "0.24", { class: "lbl-strong" });
  }

  // ---------- 3. Compliance scorecard ----------
  function compliance(c) {
    var rows = [
      ["Health & Safety Plan (CR 7)", 96], ["Risk Assessments (CR 9)", 92], ["Fall Protection Plan (CR 10)", 88],
      ["Legal appointments (OHS Act 16(2), CR 8)", 100], ["Scaffold inspections (CR 16)", 74], ["Excavations (CR 13)", 81],
      ["Electrical installations (CR 24)", 68], ["Fire precautions (CR 29)", 90], ["PPE issue register", 85], ["Induction & training records", 94]
    ];
    var W = widthOf(c), narrow = W < 560;
    var rowH = narrow ? 44 : 30, L = narrow ? 0 : 270, R = 46, T = 8;
    var H = T + rows.length * rowH + 22;
    var s = svg(c, W, H, "Safety file compliance by Construction Regulation element (sample data)");
    var pw = W - L - R;
    [0, 50, 75, 90, 100].forEach(function (p) {
      var x = L + (p / 100) * pw;
      el("line", { x1: x, x2: x, y1: T, y2: H - 20, class: p === 0 ? "axis" : "gridline" }, s);
      if (!narrow || p !== 90) txt(s, x, H - 6, p + "%", { "text-anchor": "middle" });
    });
    rows.forEach(function (r, i) {
      var y = T + i * rowH;
      var barY = narrow ? y + 20 : y + 7, barH = narrow ? 16 : rowH - 14;
      if (narrow) txt(s, 0, y + 14, r[0], { class: "lbl-row" });
      else txt(s, L - 12, y + rowH / 2 + 4, r[0], { "text-anchor": "end", class: "lbl-row" });
      var cls = r[1] >= 90 ? "f-green" : r[1] >= 75 ? "f-amber" : "f-red";
      var bar = el("rect", { x: L, y: barY, width: (r[1] / 100) * pw, height: barH, rx: 2, class: cls }, s);
      hover(bar, r[0] + ": " + r[1] + "% compliant" + (r[1] < 75 ? " (corrective action required)" : ""));
      txt(s, L + (r[1] / 100) * pw + 6, barY + barH / 2 + 4, r[1] + "%", { class: "lbl-strong" });
    });
  }

  // ---------- 4. Root-cause Pareto ----------
  function pareto(c) {
    var d = [["Inadequate supervision", 14, "Supervision"], ["Procedure not followed", 11, "Procedure"], ["Poor housekeeping", 8, "Housekeeping"], ["PPE not worn", 6, "PPE"], ["Inadequate planning", 5, "Planning"], ["Equipment defect", 3, "Equipment"], ["Communication", 2, "Comms"]];
    var total = d.reduce(function (a, b) { return a + b[1]; }, 0);
    var W = widthOf(c), H = 290, L = 52, R = 40, T = 16, B = 66;
    var s = svg(c, W, H, "Pareto of incident root causes; top three causes account for 67% (sample data)");
    var pw = W - L - R, ph = H - T - B, step = pw / d.length, max = 15;
    for (var g = 0; g <= 3; g++) {
      var y = T + ph - (g * 5 / max) * ph;
      el("line", { x1: L, x2: W - R, y1: y, y2: y, class: g ? "gridline" : "axis" }, s);
      txt(s, L - 6, y + 4, String(g * 5), { "text-anchor": "end" });
      txt(s, W - R + 6, T + ph - (g / 3) * ph + 4, Math.round(g / 3 * 100) + "%");
    }
    var cum = 0, pts = [];
    d.forEach(function (r, i) {
      var x = L + step * i + step / 2, bh = (r[1] / max) * ph;
      cum += r[1];
      var b = el("rect", { x: x - step * 0.32, y: T + ph - bh, width: step * 0.64, height: bh, rx: 2, class: i < 3 ? "f-orange" : "f-muted" }, s);
      hover(b, r[0] + ": " + r[1] + " incidents (" + Math.round(r[1] / total * 100) + "%)");
      pts.push([x, T + ph - (cum / total) * ph]);
      txt(s, x + 4, T + ph + 14, r[2], { "text-anchor": "end", transform: "rotate(-35 " + (x + 4) + " " + (T + ph + 14) + ")" });
    });
    el("polyline", { points: pts.map(function (p) { return p.join(","); }).join(" "), fill: "none", class: "s-ink", "stroke-width": 2 }, s);
    pts.forEach(function (p) { el("circle", { cx: p[0], cy: p[1], r: 3.5, class: "f-ink" }, s); });
    var y80 = T + ph - 0.8 * ph;
    el("line", { x1: L, x2: W - R, y1: y80, y2: y80, class: "s-red", "stroke-dasharray": "4 4" }, s);
    txt(s, W - R - 4, y80 - 6, "80% line", { "text-anchor": "end", class: "lbl-red" });
  }

  // ---------- 5. Training by site ----------
  function training(c) {
    var d = [["Site 01 · Gauteng plant", 96], ["Site 02 · Mpumalanga mine", 88], ["Site 03 · Western Cape project", 79], ["Site 04 · North Africa operation", 92]];
    var W = widthOf(c), narrow = W < 520, rowH = narrow ? 46 : 44, L = narrow ? 0 : 220, R = 46, T = 6, H = T + d.length * rowH + 4;
    var s = svg(c, W, H, "Training completion by site (sample data)");
    var pw = W - L - R;
    d.forEach(function (r, i) {
      var y = T + i * rowH;
      var by = narrow ? y + 20 : y + 12, bh = narrow ? 16 : rowH - 24;
      if (narrow) txt(s, 0, y + 14, r[0], { class: "lbl-row" });
      else txt(s, L - 10, y + rowH / 2 + 4, r[0], { "text-anchor": "end", class: "lbl-row" });
      el("rect", { x: L, y: by, width: pw, height: bh, rx: 3, class: "f-track" }, s);
      var b = el("rect", { x: L, y: by, width: pw * r[1] / 100, height: bh, rx: 3, class: r[1] >= 90 ? "f-green" : r[1] >= 80 ? "f-amber" : "f-orange" }, s);
      hover(b, r[0] + ": " + r[1] + "% of required training complete");
      txt(s, L + pw + 6, by + bh / 2 + 4, r[1] + "%", { class: "lbl-strong" });
    });
  }

  // ---------- 6. Risk matrix (DOM grid) ----------
  var MATRIX = {
    inherent: [[0, 1, 2, 3, 2], [0, 2, 4, 5, 3], [1, 3, 5, 4, 2], [2, 3, 3, 2, 1], [1, 2, 1, 1, 0]],
    residual: [[0, 0, 0, 0, 0], [0, 0, 1, 0, 0], [1, 3, 4, 1, 0], [4, 6, 7, 4, 2], [5, 7, 5, 3, 0]]
  };
  function bandFor(score) { return score >= 17 ? "m-ext" : score >= 10 ? "m-high" : score >= 5 ? "m-med" : "m-low"; }
  function matrix(c, which) {
    while (c.firstChild) c.removeChild(c.firstChild);
    var data = MATRIX[which];
    var grid = document.createElement("div");
    grid.className = "matrix";
    grid.setAttribute("role", "table");
    grid.setAttribute("aria-label", (which === "inherent" ? "Inherent" : "Residual") + " risk matrix: number of hazards in each likelihood and consequence cell (sample data)");
    for (var r = 0; r < 5; r++) {
      var lik = 5 - r;
      var lbl = document.createElement("div"); lbl.className = "lbl"; lbl.textContent = "L" + lik; grid.appendChild(lbl);
      for (var col = 0; col < 5; col++) {
        var con = col + 1, score = lik * con, n = data[r][col];
        var cell = document.createElement("div");
        cell.className = "cell " + bandFor(score);
        cell.setAttribute("role", "cell");
        cell.setAttribute("tabindex", "0");
        var count = document.createElement("span"); count.textContent = n ? String(n) : "·"; cell.appendChild(count);
        var sc = document.createElement("span"); sc.className = "n"; sc.textContent = String(score); cell.appendChild(sc);
        var t = "Likelihood " + lik + " × Consequence " + con + " = " + score + ": " + n + " hazard" + (n === 1 ? "" : "s");
        cell.setAttribute("aria-label", t);
        (function (node, s) {
          node.addEventListener("mousemove", function (e) { showTip(e, s); });
          node.addEventListener("mouseleave", hideTip);
          node.addEventListener("focus", function () { var b = node.getBoundingClientRect(); showTip({ clientX: b.left, clientY: b.top }, s); });
          node.addEventListener("blur", hideTip);
        })(cell, t);
        grid.appendChild(cell);
      }
    }
    var corner = document.createElement("div"); grid.appendChild(corner);
    for (var k = 1; k <= 5; k++) { var cl = document.createElement("div"); cl.className = "lbl"; cl.textContent = "C" + k; grid.appendChild(cl); }
    c.appendChild(grid);

    var totals = { "m-ext": 0, "m-high": 0, "m-med": 0, "m-low": 0 };
    for (var rr = 0; rr < 5; rr++) for (var cc = 0; cc < 5; cc++) totals[bandFor((5 - rr) * (cc + 1))] += data[rr][cc];
    var out = document.querySelector("[data-matrix-summary]");
    if (out) {
      out.textContent = "Extreme " + totals["m-ext"] + " · High " + totals["m-high"] + " · Medium " + totals["m-med"] + " · Low " + totals["m-low"] + " — 53 hazards assessed";
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.body.appendChild(tip);
    var map = { indicators: indicators, ltifr: ltifr, compliance: compliance, pareto: pareto, training: training };
    var charts = document.querySelectorAll("[data-chart]");
    function drawAll(force) {
      charts.forEach(function (c) {
        var fn = map[c.getAttribute("data-chart")];
        if (!fn) return;
        var w = widthOf(c);
        if (!force && c.getAttribute("data-w") === String(w)) return;
        c.setAttribute("data-w", String(w));
        while (c.firstChild) c.removeChild(c.firstChild);
        fn(c);
      });
    }
    drawAll(true);
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { drawAll(false); }, 150); });

    var mc = document.querySelector("[data-matrix]");
    if (mc) {
      matrix(mc, "inherent");
      var tabs = document.querySelectorAll("[data-matrix-tab]");
      tabs.forEach(function (t) {
        t.addEventListener("click", function () {
          tabs.forEach(function (x) { x.setAttribute("aria-selected", "false"); });
          t.setAttribute("aria-selected", "true");
          var which = t.getAttribute("data-matrix-tab");
          if (which === "inherent" || which === "residual") matrix(mc, which);
        });
      });
    }
  });
})();
