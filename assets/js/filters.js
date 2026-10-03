/*!
 * OurtAuto — filters.js
 * Date-range preset dropdown + generic "Apply / Reset" filter bar
 * behaviour (front-end demo: filters existing table rows by simple
 * text/attribute matching, or just gives visible feedback via toast
 * when there's no bound table).
 */
(function () {
  "use strict";

  // Date range preset buttons: <a data-date-preset="Last 7 Days">
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-date-preset]");
    if (!el) return;
    var label = el.getAttribute("data-date-preset");
    var display = document.querySelector(el.getAttribute("data-date-target") || "");
    if (display) display.textContent = label;
    window.OurtToast && window.OurtToast.show("Showing data for: " + label, "primary");
  });

  // Generic filter bar: [data-filter-apply="tableId"] on a button inside
  // a .ourt-filter-bar; reads any <select>/<input> with data-filter-key
  // inside the same bar and hides table rows whose matching
  // data-row-<key> attribute doesn't contain the selected value.
  document.addEventListener("click", function (e) {
    var applyBtn = e.target.closest("[data-filter-apply]");
    if (applyBtn) {
      var tableId = applyBtn.getAttribute("data-filter-apply");
      var table = document.getElementById(tableId);
      var bar = applyBtn.closest(".ourt-filter-bar");
      if (!table || !bar) return;
      var filters = [];
      bar.querySelectorAll("[data-filter-key]").forEach(function (input) {
        var val = input.value;
        if (val && val.toLowerCase().indexOf("all") !== -1) val = "";
        if (val) filters.push({ key: input.getAttribute("data-filter-key"), val: val.toLowerCase() });
      });
      var matched = 0;
      table.querySelectorAll("tbody tr").forEach(function (row) {
        var ok = filters.every(function (f) {
          var rowVal = (row.getAttribute("data-row-" + f.key) || row.textContent || "").toLowerCase();
          return rowVal.indexOf(f.val) !== -1;
        });
        row.setAttribute("data-filtered-out", ok ? "0" : "1");
        if (ok) matched++;
      });
      if (table._ourtRepaginate) table._ourtRepaginate(); else {
        table.querySelectorAll("tbody tr").forEach(function (row) { row.style.display = row.getAttribute("data-filtered-out") === "1" ? "none" : ""; });
      }
      window.OurtToast && window.OurtToast.show(filters.length ? matched + " matching results." : "Filters cleared.", "primary");
    }
    var resetBtn = e.target.closest("[data-filter-reset]");
    if (resetBtn) {
      var tid = resetBtn.getAttribute("data-filter-reset");
      var tbl = document.getElementById(tid);
      var bar2 = resetBtn.closest(".ourt-filter-bar");
      if (bar2) bar2.querySelectorAll("[data-filter-key]").forEach(function (input) { input.selectedIndex = 0; if (input.tagName === "INPUT") input.value = ""; });
      if (tbl) {
        tbl.querySelectorAll("tbody tr").forEach(function (row) { row.removeAttribute("data-filtered-out"); row.style.display = ""; });
        if (tbl._ourtRepaginate) tbl._ourtRepaginate();
      }
    }
  });
})();
