/*!
 * OurtAuto — charts.js
 * High-performance, production-grade chart layer over Chart.js.
 * Features:
 * - High-contrast, theme-resilient floating tooltips with zero color washout
 * - Rich value formatting with currency (₹), unit suffixes, and donut percentages
 * - Smooth bezier curves, subtle gradients, and modern rounded bars
 * - Dynamic theme adaptation across light/dark modes and custom presets
 */
(function () {
  "use strict";

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  var registry = [];

  function isDarkMode() {
    var theme = document.documentElement.getAttribute("data-theme");
    if (theme === "light") return false;
    return true; // Default is dark / black theme
  }

  function baseColors() {
    var dark = isDarkMode();
    return {
      text: cssVar("--ourt-text") || (dark ? "#cbd5e1" : "#565e72"),
      muted: cssVar("--ourt-muted") || (dark ? "#8492a6" : "#8891a4"),
      border: cssVar("--ourt-border") || (dark ? "#1e2638" : "#e7e9f0"),
      heading: cssVar("--ourt-heading") || (dark ? "#f8fafc" : "#171a2b"),
      card: cssVar("--ourt-card-bg") || (dark ? "#101625" : "#ffffff"),
      palette: [
        cssVar("--chart-1") || "#2F6FED",
        cssVar("--chart-2") || "#ff6b35",
        cssVar("--chart-3") || "#17b26a",
        cssVar("--chart-4") || "#f79009",
        cssVar("--chart-5") || "#7a5cfa",
        cssVar("--chart-6") || "#0ba5ec",
        cssVar("--chart-7") || "#f04438",
        cssVar("--chart-8") || "#0d9488"
      ]
    };
  }

  function getTooltipColors() {
    var dark = isDarkMode();
    return {
      bg: dark ? "rgba(15, 23, 42, 0.96)" : "rgba(15, 23, 42, 0.94)",
      title: "#ffffff",
      body: "#e2e8f0",
      border: dark ? "rgba(255, 255, 255, 0.16)" : "rgba(255, 255, 255, 0.12)"
    };
  }

  function formatTooltipValue(context) {
    var label = context.dataset.label || "";
    if (label) label += ": ";
    var val = context.parsed.y !== undefined ? context.parsed.y : (context.parsed !== undefined ? context.parsed : context.raw);

    // Donut or pie charts: show value and percentage
    if (context.chart.config.type === "doughnut" || context.chart.config.type === "pie") {
      var dataset = context.dataset;
      var total = dataset.data.reduce(function (acc, curr) { return acc + Number(curr || 0); }, 0);
      var pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
      var itemLabel = context.label || "";
      return " " + (itemLabel ? itemLabel + ": " : "") + val.toLocaleString() + " (" + pct + "%)";
    }

    if (typeof val === "number") {
      var dsLabel = context.dataset.label || "";
      if (dsLabel.indexOf("Cr") !== -1 || dsLabel.indexOf("₹") !== -1) {
        return " " + label + "₹" + val.toLocaleString() + " Cr";
      }
      if (dsLabel.indexOf("L") !== -1) {
        return " " + label + "₹" + val.toLocaleString() + " L";
      }
      return " " + label + val.toLocaleString();
    }
    return " " + label + val;
  }

  function customHtmlTooltip(context) {
    var tooltipModel = context.tooltip;
    var tooltipEl = document.getElementById("ourt-chart-floating-tooltip");

    if (!tooltipEl) {
      tooltipEl = document.createElement("div");
      tooltipEl.id = "ourt-chart-floating-tooltip";
      document.body.appendChild(tooltipEl);
    }

    if (!tooltipModel || tooltipModel.opacity === 0) {
      tooltipEl.classList.remove("show");
      return;
    }

    var chart = context.chart;
    var title = (tooltipModel.title && tooltipModel.title.length) ? tooltipModel.title[0] : "";
    var isDoughnut = chart.config.type === "doughnut" || chart.config.type === "pie";

    var html = "";
    if (title) {
      var badgeText = isDoughnut ? "Inventory Mix" : "Timeline";
      html += '<div class="tt-header">';
      html += '  <span>' + title + '</span>';
      html += '  <span class="tt-badge">' + badgeText + '</span>';
      html += '</div>';
    }

    var dataPoints = tooltipModel.dataPoints || [];
    var totalSum = 0;
    var isCurrency = false;

    dataPoints.forEach(function (dp) {
      var raw = dp.raw;
      var parsedY = dp.parsed.y !== undefined ? dp.parsed.y : (dp.parsed !== undefined ? dp.parsed : raw);
      var dataset = dp.dataset;
      var dsLabel = dataset.label || dp.label || "Value";

      // Clean dataset label
      var cleanLabel = dsLabel.replace(/\s*\([^)]*\)/g, "").trim();

      // Resolve dataset color
      var color = "#2F6FED";
      if (dp.element && dp.element.options) {
        color = dp.element.options.backgroundColor || dp.element.options.borderColor || color;
      } else if (dataset.borderColor && typeof dataset.borderColor === "string") {
        color = dataset.borderColor;
      } else if (dataset.backgroundColor) {
        if (Array.isArray(dataset.backgroundColor)) {
          color = dataset.backgroundColor[dp.dataIndex] || color;
        } else if (typeof dataset.backgroundColor === "string") {
          color = dataset.backgroundColor;
        }
      }

      var formattedVal = "";
      if (isDoughnut) {
        var allData = dataset.data || [];
        var total = allData.reduce(function (a, b) { return a + Number(b || 0); }, 0);
        var pct = total > 0 ? ((parsedY / total) * 100).toFixed(1) : 0;
        formattedVal = Number(parsedY).toLocaleString() + ' <span class="tt-badge ms-1">' + pct + '%</span>';
      } else if (typeof parsedY === "number") {
        if (dsLabel.indexOf("Cr") !== -1 || dsLabel.indexOf("₹") !== -1) {
          isCurrency = true;
          totalSum += parsedY;
          formattedVal = "₹" + Number(parsedY).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " Cr";
        } else if (dsLabel.indexOf("L") !== -1) {
          formattedVal = "₹" + Number(parsedY).toLocaleString() + " L";
        } else {
          totalSum += parsedY;
          formattedVal = Number(parsedY).toLocaleString();
        }
      } else {
        formattedVal = parsedY;
      }

      html += '<div class="tt-row">';
      html += '  <div class="tt-item-left">';
      html += '    <span class="tt-dot" style="background:' + color + ';color:' + color + ';"></span>';
      html += '    <span>' + cleanLabel + '</span>';
      html += '  </div>';
      html += '  <div class="tt-value">' + formattedVal + '</div>';
      html += '</div>';
    });

    if (dataPoints.length > 1 && totalSum > 0) {
      var formattedTotal = isCurrency ? ("₹" + totalSum.toFixed(1) + " Cr") : totalSum.toLocaleString();
      html += '<div class="tt-footer"><span>Combined Volume</span><strong>' + formattedTotal + '</strong></div>';
    }

    tooltipEl.innerHTML = html;

    // Positioning
    var canvasRect = chart.canvas.getBoundingClientRect();
    var caretX = tooltipModel.caretX;
    var caretY = tooltipModel.caretY;

    var topPos = window.pageYOffset + canvasRect.top + caretY;
    var leftPos = window.pageXOffset + canvasRect.left + caretX;

    // Collision detection with viewport edges
    if (canvasRect.top + caretY < 130) {
      tooltipEl.style.transform = "translate(-50%, 15px)";
    } else {
      tooltipEl.style.transform = "translate(-50%, -114%)";
    }

    tooltipEl.style.left = leftPos + "px";
    tooltipEl.style.top = topPos + "px";
    tooltipEl.classList.add("show");
  }

  // Crosshair Guide Line Plugin for Cartesian Charts
  var crosshairPlugin = {
    id: "hoverCrosshair",
    afterDatasetsDraw: function (chart) {
      if (!chart.tooltip || !chart.tooltip._active || !chart.tooltip._active.length) return;
      var activePoint = chart.tooltip._active[0];
      if (!activePoint || !activePoint.element) return;

      var ctx = chart.ctx;
      var x = activePoint.element.x;
      var yAxis = chart.scales.y;
      if (!yAxis) return; // Only cartesian charts with vertical y scale

      var topY = yAxis.top;
      var bottomY = yAxis.bottom;

      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([4, 3]);
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = isDarkMode() ? "rgba(255, 255, 255, 0.22)" : "rgba(15, 23, 42, 0.22)";
      ctx.stroke();
      ctx.restore();
    }
  };
  if (window.Chart) {
    Chart.register(crosshairPlugin);
  }

  // Hide floating tooltip if mouse abruptly leaves any chart canvas
  document.addEventListener("mouseleave", function (e) {
    if (e.target && e.target.tagName === "CANVAS") {
      var tt = document.getElementById("ourt-chart-floating-tooltip");
      if (tt) tt.classList.remove("show");
    }
  }, true);

  function applyGlobalDefaults() {
    if (!window.Chart) return;
    var c = baseColors();
    var tt = getTooltipColors();

    Chart.defaults.font.family = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    Chart.defaults.color = c.muted;
    Chart.defaults.borderColor = c.border;

    // Legends
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.pointStyle = "circle";
    Chart.defaults.plugins.legend.labels.boxWidth = 7;
    Chart.defaults.plugins.legend.labels.boxHeight = 7;
    Chart.defaults.plugins.legend.labels.padding = 16;
    Chart.defaults.plugins.legend.labels.font = { size: 12, weight: "600" };

    // Tooltips - high-performance custom HTML glassmorphic tooltip with canvas fallback
    Chart.defaults.plugins.tooltip.enabled = false;
    Chart.defaults.plugins.tooltip.external = customHtmlTooltip;
    Chart.defaults.plugins.tooltip.backgroundColor = tt.bg;
    Chart.defaults.plugins.tooltip.titleColor = tt.title;
    Chart.defaults.plugins.tooltip.bodyColor = tt.body;
    Chart.defaults.plugins.tooltip.borderColor = tt.border;
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 10;
    Chart.defaults.plugins.tooltip.caretSize = 6;
    Chart.defaults.plugins.tooltip.caretPadding = 8;
    Chart.defaults.plugins.tooltip.usePointStyle = true;
    Chart.defaults.plugins.tooltip.boxWidth = 8;
    Chart.defaults.plugins.tooltip.boxHeight = 8;
    Chart.defaults.plugins.tooltip.boxPadding = 6;
    Chart.defaults.plugins.tooltip.multiKeyBackground = "transparent";
    Chart.defaults.plugins.tooltip.titleFont = { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: "700" };
    Chart.defaults.plugins.tooltip.bodyFont = { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: "500" };
    Chart.defaults.plugins.tooltip.callbacks = {
      label: formatTooltipValue
    };

    // Elements
    Chart.defaults.elements.line.tension = 0.4;
    Chart.defaults.elements.point.radius = 0;
    Chart.defaults.elements.point.hoverRadius = 7;
    Chart.defaults.elements.point.hoverBorderWidth = 3.5;
    Chart.defaults.elements.bar.borderRadius = 7;
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
    opacity = opacity === undefined ? 0.28 : opacity;
    var g = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height || 280);
    var rgb = hexToRgb(colorHex);
    g.addColorStop(0, "rgba(" + rgb + "," + opacity + ")");
    g.addColorStop(0.85, "rgba(" + rgb + ",0.02)");
    g.addColorStop(1, "rgba(" + rgb + ",0)");
    return g;
  }

  function baseGrid() {
    var c = baseColors();
    var isDark = isDarkMode();
    var gridColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)";
    return {
      x: {
        grid: { display: false },
        ticks: { color: c.muted, font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: "500" }, padding: 6 },
        border: { display: false }
      },
      y: {
        grid: { color: gridColor, drawTicks: false },
        ticks: { color: c.muted, font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: "500" }, padding: 10 },
        border: { display: false }
      }
    };
  }

  function register(chart) {
    registry.push(chart);
    return chart;
  }

  var C = {
    colors: baseColors,
    gradient: gradient,
    hexToRgb: hexToRgb,

    areaLine: function (canvasId, opts) {
      var el = document.getElementById(canvasId); if (!el) return null;
      var ctx = el.getContext("2d"); var c = baseColors();
      var datasets = opts.series.map(function (s, i) {
        var color = s.color || c.palette[i % c.palette.length];
        return {
          label: s.label,
          data: s.data,
          borderColor: color,
          backgroundColor: opts.filled === false ? "transparent" : gradient(ctx, color, s.fillOpacity || 0.24),
          fill: opts.filled !== false,
          borderWidth: s.borderWidth || 2.8,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: color,
          pointHoverBorderColor: "#ffffff",
          pointHoverBorderWidth: 3
        };
      });
      return register(new Chart(ctx, {
        type: "line",
        data: { labels: opts.labels, datasets: datasets },
        options: Object.assign({
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          hover: { mode: "index", intersect: false },
          plugins: {
            legend: {
              display: datasets.length > 1,
              position: "bottom",
              labels: { usePointStyle: true, boxWidth: 8, padding: 16, font: { size: 12, weight: "600" } }
            }
          },
          scales: baseGrid()
        }, opts.overrides || {})
      }));
    },

    bar: function (canvasId, opts) {
      var el = document.getElementById(canvasId); if (!el) return null;
      var ctx = el.getContext("2d"); var c = baseColors();
      var datasets = opts.series.map(function (s, i) {
        var color = s.color || c.palette[i % c.palette.length];
        return {
          label: s.label,
          data: s.data,
          backgroundColor: color,
          hoverBackgroundColor: color,
          maxBarThickness: opts.thickness || 22,
          borderRadius: opts.borderRadius !== undefined ? opts.borderRadius : 7
        };
      });
      var scales = baseGrid();
      if (opts.stacked) { scales.x.stacked = true; scales.y.stacked = true; }
      return register(new Chart(ctx, {
        type: "bar",
        data: { labels: opts.labels, datasets: datasets },
        options: Object.assign({
          indexAxis: opts.horizontal ? "y" : "x",
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: datasets.length > 1,
              position: "bottom",
              labels: { usePointStyle: true, boxWidth: 8, padding: 16, font: { size: 12, weight: "600" } }
            }
          },
          scales: scales
        }, opts.overrides || {})
      }));
    },

    barLineCombo: function (canvasId, opts) {
      var el = document.getElementById(canvasId); if (!el) return null;
      var ctx = el.getContext("2d"); var c = baseColors();
      var barColor = opts.barColor || c.palette[0];
      var lineColor = opts.lineColor || c.palette[1];
      return register(new Chart(ctx, {
        data: {
          labels: opts.labels,
          datasets: [
            {
              type: "bar",
              label: opts.barLabel || "Value",
              data: opts.barData,
              backgroundColor: barColor,
              hoverBackgroundColor: barColor,
              maxBarThickness: 18,
              borderRadius: 7,
              borderSkipped: false,
              order: 2
            },
            {
              type: "line",
              label: opts.lineLabel || "Trend",
              data: opts.lineData,
              borderColor: lineColor,
              backgroundColor: gradient(ctx, lineColor, 0.18),
              fill: true,
              borderWidth: 3,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 7,
              pointHoverBackgroundColor: lineColor,
              pointHoverBorderColor: "#ffffff",
              pointHoverBorderWidth: 3.5,
              order: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          hover: { mode: "index", intersect: false },
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                usePointStyle: true,
                boxWidth: 8,
                padding: 18,
                font: { size: 12, weight: "600" }
              }
            }
          },
          scales: baseGrid()
        }
      }));
    },

    donut: function (canvasId, opts) {
      var el = document.getElementById(canvasId); if (!el) return null;
      var ctx = el.getContext("2d"); var c = baseColors();
      return register(new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: opts.labels,
          datasets: [{
            data: opts.data,
            backgroundColor: opts.colors || c.palette,
            borderWidth: opts.borderWidth === undefined ? 3 : opts.borderWidth,
            borderColor: c.card,
            hoverOffset: 12,
            hoverBorderWidth: 2,
            hoverBorderColor: isDarkMode() ? "#101625" : "#ffffff"
          }]
        },
        options: Object.assign({
          responsive: true,
          maintainAspectRatio: false,
          cutout: opts.cutout || "72%",
          plugins: {
            legend: {
              display: opts.legend !== false,
              position: opts.legendPosition || "bottom",
              labels: {
                usePointStyle: true,
                boxWidth: 8,
                padding: 16,
                font: { size: 12, weight: "600" }
              }
            }
          },
          interaction: { mode: "nearest", intersect: true },
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 800
          }
        }, opts.overrides || {})
      }));
    },

    gauge: function (canvasId, opts) {
      var el = document.getElementById(canvasId); if (!el) return null;
      var ctx = el.getContext("2d"); var c = baseColors();
      var remainder = opts.max - opts.value;
      return register(new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: opts.labels || ["Value", "Remaining"],
          datasets: [{
            data: opts.segments || [opts.value, remainder],
            backgroundColor: opts.colors || [c.palette[0], c.border],
            borderWidth: 0,
            circumference: 180,
            rotation: 270,
            cutout: "78%"
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { enabled: opts.tooltip !== false }
          }
        }
      }));
    },

    radar: function (canvasId, opts) {
      var el = document.getElementById(canvasId); if (!el) return null;
      var ctx = el.getContext("2d"); var c = baseColors();
      var datasets = opts.series.map(function (s, i) {
        var color = s.color || c.palette[i % c.palette.length];
        return {
          label: s.label,
          data: s.data,
          borderColor: color,
          backgroundColor: "rgba(" + hexToRgb(color) + ",0.18)",
          pointBackgroundColor: color,
          pointBorderColor: "#ffffff",
          pointHoverRadius: 5,
          borderWidth: 2
        };
      });
      return register(new Chart(ctx, {
        type: "radar",
        data: { labels: opts.labels, datasets: datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
          scales: {
            r: {
              grid: { color: c.border },
              angleLines: { color: c.border },
              ticks: { display: false },
              pointLabels: { color: c.text, font: { size: 11, weight: "500" } }
            }
          }
        }
      }));
    },

    sparkline: function (canvasId, opts) {
      var el = document.getElementById(canvasId); if (!el) return null;
      var ctx = el.getContext("2d"); var color = opts.color || baseColors().palette[0];
      return register(new Chart(ctx, {
        type: "line",
        data: {
          labels: opts.labels || opts.data.map(function (_, i) { return i; }),
          datasets: [{
            data: opts.data,
            borderColor: color,
            backgroundColor: gradient(ctx, color, 0.22),
            fill: true,
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.45
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: { x: { display: false }, y: { display: false } }
        }
      }));
    },

    polarArea: function (canvasId, opts) {
      var el = document.getElementById(canvasId); if (!el) return null;
      var ctx = el.getContext("2d"); var c = baseColors();
      return register(new Chart(ctx, {
        type: "polarArea",
        data: {
          labels: opts.labels,
          datasets: [{
            data: opts.data,
            backgroundColor: (opts.colors || c.palette).map(function (h) {
              return "rgba(" + hexToRgb(h) + ",0.75)";
            })
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom" } },
          scales: { r: { grid: { color: c.border }, ticks: { display: false } } }
        }
      }));
    },

    registry: registry
  };
  window.OurtCharts = C;

  /* Re-theme registered charts on dark/light toggle */
  window.addEventListener("ourt:theme-changed", function () {
    applyGlobalDefaults();
    var c = baseColors();
    var tt = getTooltipColors();

    registry.forEach(function (chart) {
      if (!chart || !chart.options) return;
      var scales = chart.options.scales;
      if (scales) {
        var isDark = isDarkMode();
        var gridColor = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)";
        if (scales.x) {
          scales.x.ticks.color = c.muted;
          if (scales.x.grid) scales.x.grid.color = gridColor;
        }
        if (scales.y) {
          scales.y.ticks.color = c.muted;
          if (scales.y.grid) scales.y.grid.color = gridColor;
        }
        if (scales.r) {
          if (scales.r.grid) scales.r.grid.color = c.border;
          if (scales.r.angleLines) scales.r.angleLines.color = c.border;
          if (scales.r.pointLabels) scales.r.pointLabels.color = c.text;
        }
      }
      if (chart.options.plugins) {
        if (chart.options.plugins.legend && chart.options.plugins.legend.labels) {
          chart.options.plugins.legend.labels.color = c.text;
        }
        if (chart.options.plugins.tooltip) {
          chart.options.plugins.tooltip.backgroundColor = tt.bg;
          chart.options.plugins.tooltip.borderColor = tt.border;
          chart.options.plugins.tooltip.titleColor = tt.title;
          chart.options.plugins.tooltip.bodyColor = tt.body;
        }
      }
      if (chart.config.type === "doughnut" || chart.config.type === "pie") {
        chart.data.datasets.forEach(function (ds) { ds.borderColor = c.card; });
      }
      chart.update();
    });
  });
})();

