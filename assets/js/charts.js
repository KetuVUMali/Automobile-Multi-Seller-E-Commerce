/*!
 * OurtAuto — charts.js
 * Thin helper layer over Chart.js so every dashboard shares the same
 * palette, fonts, grid styling and dark-mode behaviour.
 */
(function () {
  "use strict";

  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  var registry = [];

  function baseColors() {
    return {
      text: cssVar("--ourt-text") || "#565e72",
      muted: cssVar("--ourt-muted") || "#8891a4",
      border: cssVar("--ourt-border") || "#e7e9f0",
      heading: cssVar("--ourt-heading") || "#171a2b",
      card: cssVar("--ourt-card-bg") || "#ffffff",
      palette: [
        cssVar("--chart-1") || "#2F6FED", cssVar("--chart-2") || "#ff6b35",
        cssVar("--chart-3") || "#17b26a", cssVar("--chart-4") || "#f79009",
        cssVar("--chart-5") || "#7a5cfa", cssVar("--chart-6") || "#0ba5ec",
        cssVar("--chart-7") || "#f04438", cssVar("--chart-8") || "#0d9488"
      ]
    };
  }

  function applyGlobalDefaults() {
    if (!window.Chart) return;
    var c = baseColors();
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    Chart.defaults.color = c.muted;
    Chart.defaults.borderColor = c.border;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
    Chart.defaults.plugins.legend.labels.font = { size: 12, weight: "600" };
    Chart.defaults.plugins.tooltip.backgroundColor = c.heading;
    Chart.defaults.plugins.tooltip.titleColor = "#fff";
    Chart.defaults.plugins.tooltip.bodyColor = "#fff";
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.elements.line.tension = 0.4;
    Chart.defaults.elements.point.radius = 0;
    Chart.defaults.elements.point.hoverRadius = 5;
    Chart.defaults.elements.bar.borderRadius = 6;
    Chart.defaults.elements.bar.borderSkipped = false;
  }
  applyGlobalDefaults();

  function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
    var num = parseInt(hex, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255].join(",");
  }
  function gradient(ctx, colorHex, opacity) {
    opacity = opacity === undefined ? 0.26 : opacity;
    var g = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height || 260);
    var rgb = hexToRgb(colorHex);
    g.addColorStop(0, "rgba(" + rgb + "," + opacity + ")");
    g.addColorStop(1, "rgba(" + rgb + ",0)");
    return g;
  }
  function baseGrid() {
    var c = baseColors();
    return {
      x: { grid: { display: false }, ticks: { color: c.muted, font: { size: 11 } }, border: { display: false } },
      y: { grid: { color: c.border, drawTicks: false }, ticks: { color: c.muted, font: { size: 11 }, padding: 8 }, border: { display: false } }
    };
  }
  function register(chart) { registry.push(chart); return chart; }

  var C = {
    colors: baseColors, gradient: gradient, hexToRgb: hexToRgb,

    areaLine: function (canvasId, opts) {
      var el = document.getElementById(canvasId); if (!el) return null;
      var ctx = el.getContext("2d"); var c = baseColors();
      var datasets = opts.series.map(function (s, i) {
        var color = s.color || c.palette[i % c.palette.length];
        return { label: s.label, data: s.data, borderColor: color, backgroundColor: opts.filled === false ? "transparent" : gradient(ctx, color, s.fillOpacity || 0.25), fill: opts.filled !== false, borderWidth: s.borderWidth || 2.5, pointBackgroundColor: color, pointBorderColor: "#fff", pointBorderWidth: 2 };
      });
      return register(new Chart(ctx, { type: "line", data: { labels: opts.labels, datasets: datasets }, options: Object.assign({ responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false }, plugins: { legend: { display: datasets.length > 1, position: "bottom" } }, scales: baseGrid() }, opts.overrides || {}) }));
    },

    bar: function (canvasId, opts) {
      var el = document.getElementById(canvasId); if (!el) return null;
      var ctx = el.getContext("2d"); var c = baseColors();
      var datasets = opts.series.map(function (s, i) { return { label: s.label, data: s.data, backgroundColor: s.color || c.palette[i % c.palette.length], maxBarThickness: opts.thickness || 22, borderRadius: opts.borderRadius !== undefined ? opts.borderRadius : 6 }; });
      var scales = baseGrid();
      if (opts.stacked) { scales.x.stacked = true; scales.y.stacked = true; }
      return register(new Chart(ctx, { type: "bar", data: { labels: opts.labels, datasets: datasets }, options: Object.assign({ indexAxis: opts.horizontal ? "y" : "x", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: datasets.length > 1, position: "bottom" } }, scales: scales }, opts.overrides || {}) }));
    },

    barLineCombo: function (canvasId, opts) {
      var el = document.getElementById(canvasId); if (!el) return null;
      var ctx = el.getContext("2d"); var c = baseColors();
      var barColor = opts.barColor || c.palette[0], lineColor = opts.lineColor || c.palette[1];
      return register(new Chart(ctx, { data: { labels: opts.labels, datasets: [
        { type: "bar", label: opts.barLabel || "Value", data: opts.barData, backgroundColor: barColor, maxBarThickness: 16, borderRadius: 6, order: 2 },
        { type: "line", label: opts.lineLabel || "Trend", data: opts.lineData, borderColor: lineColor, backgroundColor: gradient(ctx, lineColor, 0.12), fill: true, borderWidth: 3, pointRadius: 0, pointHoverRadius: 5, order: 1 }
      ] }, options: { responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false }, plugins: { legend: { position: "bottom" } }, scales: baseGrid() } }));
    },

    donut: function (canvasId, opts) {
      var el = document.getElementById(canvasId); if (!el) return null;
      var ctx = el.getContext("2d"); var c = baseColors();
      return register(new Chart(ctx, { type: "doughnut", data: { labels: opts.labels, datasets: [{ data: opts.data, backgroundColor: opts.colors || c.palette, borderWidth: opts.borderWidth === undefined ? 6 : opts.borderWidth, borderColor: c.card, hoverOffset: 6 }] }, options: Object.assign({ responsive: true, maintainAspectRatio: false, cutout: opts.cutout || "70%", plugins: { legend: { display: opts.legend !== false, position: "bottom" } } }, opts.overrides || {}) }));
    },

    gauge: function (canvasId, opts) {
      var el = document.getElementById(canvasId); if (!el) return null;
      var ctx = el.getContext("2d"); var c = baseColors();
      var remainder = opts.max - opts.value;
      return register(new Chart(ctx, { type: "doughnut", data: { labels: opts.labels || ["Value", "Remaining"], datasets: [{ data: opts.segments || [opts.value, remainder], backgroundColor: opts.colors || [c.palette[0], c.border], borderWidth: 0, circumference: 180, rotation: 270, cutout: "78%" }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: opts.tooltip !== false } } } }));
    },

    radar: function (canvasId, opts) {
      var el = document.getElementById(canvasId); if (!el) return null;
      var ctx = el.getContext("2d"); var c = baseColors();
      var datasets = opts.series.map(function (s, i) { var color = s.color || c.palette[i % c.palette.length]; return { label: s.label, data: s.data, borderColor: color, backgroundColor: "rgba(" + hexToRgb(color) + ",0.18)", pointBackgroundColor: color, borderWidth: 2 }; });
      return register(new Chart(ctx, { type: "radar", data: { labels: opts.labels, datasets: datasets }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } }, scales: { r: { grid: { color: c.border }, angleLines: { color: c.border }, ticks: { display: false }, pointLabels: { color: c.text, font: { size: 11 } } } } } }));
    },

    sparkline: function (canvasId, opts) {
      var el = document.getElementById(canvasId); if (!el) return null;
      var ctx = el.getContext("2d"); var color = opts.color || baseColors().palette[0];
      return register(new Chart(ctx, { type: "line", data: { labels: opts.labels || opts.data.map(function (_, i) { return i; }), datasets: [{ data: opts.data, borderColor: color, backgroundColor: gradient(ctx, color, 0.22), fill: true, borderWidth: 2, pointRadius: 0, tension: 0.45 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } }, scales: { x: { display: false }, y: { display: false } } } }));
    },

    polarArea: function (canvasId, opts) {
      var el = document.getElementById(canvasId); if (!el) return null;
      var ctx = el.getContext("2d"); var c = baseColors();
      return register(new Chart(ctx, { type: "polarArea", data: { labels: opts.labels, datasets: [{ data: opts.data, backgroundColor: (opts.colors || c.palette).map(function (h) { return "rgba(" + hexToRgb(h) + ",0.75)"; }) }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } }, scales: { r: { grid: { color: c.border }, ticks: { display: false } } } } }));
    },

    registry: registry
  };
  window.OurtCharts = C;

  /* Re-theme registered charts on dark/light toggle. IMPORTANT: only
     mutate a *property* of an existing option object (e.g. `.ticks.color`)
     — never reassign the object itself (e.g. `x.ticks = x.ticks || {}`).
     Chart.js v4's scale/tick/plugin options are Proxy-backed resolvers,
     and writing one back onto itself triggers infinite internal
     recursion ("Maximum call stack size exceeded") instead of being the
     harmless no-op it looks like. Every scale/plugin object created by
     the helpers above always already has these sub-objects (Chart.js
     merges them in from defaults at creation), so there's nothing to
     guard against here. */
  window.addEventListener("ourt:theme-changed", function () {
    applyGlobalDefaults();
    var c = baseColors();
    registry.forEach(function (chart) {
      if (!chart || !chart.options) return;
      var scales = chart.options.scales;
      if (scales) {
        if (scales.x) { scales.x.ticks.color = c.muted; if (scales.x.grid) scales.x.grid.color = c.border; }
        if (scales.y) { scales.y.ticks.color = c.muted; if (scales.y.grid) scales.y.grid.color = c.border; }
        if (scales.r) {
          if (scales.r.grid) scales.r.grid.color = c.border;
          if (scales.r.angleLines) scales.r.angleLines.color = c.border;
          if (scales.r.pointLabels) scales.r.pointLabels.color = c.text;
        }
      }
      if (chart.options.plugins) {
        if (chart.options.plugins.legend && chart.options.plugins.legend.labels) chart.options.plugins.legend.labels.color = c.text;
        if (chart.options.plugins.tooltip) {
          chart.options.plugins.tooltip.backgroundColor = c.heading;
          chart.options.plugins.tooltip.titleColor = "#fff";
          chart.options.plugins.tooltip.bodyColor = "#fff";
        }
      }
      if (chart.config.type === "doughnut" || chart.config.type === "pie") {
        chart.data.datasets.forEach(function (ds) { ds.borderColor = c.card; });
      }
      chart.update();
    });
  });
})();
