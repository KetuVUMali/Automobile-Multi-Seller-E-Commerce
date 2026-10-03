/*!
 * OurtAuto — components.js
 * Small, reusable interactive widgets used across many pages.
 */
(function () {
  "use strict";

  /* ---------------- 1. ADMIN TABLE ROW ACTIONS: view / edit / delete ---------------- */
  function rowData(row) {
    return {
      name: row.getAttribute("data-row-name") || "",
      sub: row.getAttribute("data-row-sub") || "",
      price: row.getAttribute("data-row-price") || "",
      status: row.getAttribute("data-row-status") || "",
    };
  }
  document.addEventListener("click", function (e) {
    var delBtn = e.target.closest("[data-delete-row]");
    if (delBtn) {
      var row = delBtn.closest("tr");
      if (!row) return;
      var name = rowData(row).name || "this item";
      function doDelete() {
        row.style.transition = "opacity .25s ease"; row.style.opacity = "0";
        setTimeout(function () { row.remove(); window.OurtToast && window.OurtToast.show(name + " deleted.", "danger"); }, 200);
      }
      if (window.Swal) {
        Swal.fire({ title: "Delete " + name + "?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonText: "Delete", cancelButtonText: "Cancel", confirmButtonColor: "#f04438", reverseButtons: true })
          .then(function (res) { if (res.isConfirmed) doDelete(); });
      } else if (window.confirm("Delete " + name + "? This cannot be undone.")) { doDelete(); }
      return;
    }
    var editBtn = e.target.closest("[data-edit-row]");
    if (editBtn) {
      var r = editBtn.closest("tr");
      var modal = document.getElementById("editRowModal");
      if (!modal || !r || !window.bootstrap) return;
      var d = rowData(r);
      var form = modal.querySelector("#editRowForm");
      if (form.elements.itemName) form.elements.itemName.value = d.name;
      if (form.elements.itemSub) form.elements.itemSub.value = d.sub;
      if (form.elements.itemPrice) form.elements.itemPrice.value = d.price;
      if (form.elements.itemStatus) form.elements.itemStatus.value = d.status;
      modal._editingRow = r;
      bootstrap.Modal.getOrCreateInstance(modal).show();
      return;
    }
    var viewBtn = e.target.closest("[data-view-row]");
    if (viewBtn) {
      var vr = viewBtn.closest("tr");
      var vmodal = document.getElementById("quickViewModal");
      if (!vmodal || !vr || !window.bootstrap) return;
      var vd = rowData(vr);
      var setText = function (sel, val) { var el = vmodal.querySelector(sel); if (el) el.textContent = val; };
      setText("[data-qv-name]", vd.name); setText("[data-qv-sub]", vd.sub); setText("[data-qv-price]", vd.price); setText("[data-qv-status]", vd.status);
      bootstrap.Modal.getOrCreateInstance(vmodal).show();
      return;
    }
  });
  document.addEventListener("submit", function (e) {
    if (e.target.id !== "editRowForm") return;
    e.preventDefault();
    var modalEl = document.getElementById("editRowModal");
    var row = modalEl && modalEl._editingRow;
    var f = e.target;
    if (row) {
      var map = { itemName: "data-row-name-cell", itemSub: "data-row-sub-cell", itemPrice: "data-row-price-cell" };
      if (f.elements.itemName) { var nc = row.querySelector("[data-row-name]"); if (nc) nc.textContent = f.elements.itemName.value; row.setAttribute("data-row-name", f.elements.itemName.value); }
      if (f.elements.itemSub) { var sc = row.querySelector("[data-row-sub]"); if (sc) sc.textContent = f.elements.itemSub.value; row.setAttribute("data-row-sub", f.elements.itemSub.value); }
      if (f.elements.itemPrice) { var pc = row.querySelector("[data-row-price]"); if (pc) pc.textContent = f.elements.itemPrice.value; row.setAttribute("data-row-price", f.elements.itemPrice.value); }
      if (f.elements.itemStatus) row.setAttribute("data-row-status", f.elements.itemStatus.value);
    }
    if (window.bootstrap) { var inst = bootstrap.Modal.getInstance(modalEl); inst && inst.hide(); }
    window.OurtToast && window.OurtToast.show("Changes saved.", "success");
  });

  /* ---------------- 2. STATUS DROPDOWN (orders / vehicles / leads / bookings) ---------------- */
  document.addEventListener("click", function (e) {
    var opt = e.target.closest("[data-set-status]");
    if (!opt) return;
    e.preventDefault();
    var newStatus = opt.getAttribute("data-set-status");
    var variant = opt.getAttribute("data-status-variant") || "secondary";
    var row = opt.closest("tr") || opt.closest(".ourt-kanban-card") || opt.closest(".card");
    if (!row) return;
    var badgeEl = row.querySelector(".status-badge");
    if (badgeEl) {
      badgeEl.className = "badge badge-soft-" + variant + " rounded-pill status-badge dropdown-toggle cursor-pointer";
      badgeEl.textContent = newStatus;
    }
    window.OurtToast && window.OurtToast.show("Status updated to " + newStatus + ".", "success");
  });

  /* ---------------- 3. GRID / LIST VIEW TOGGLE ---------------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-view-toggle]");
    if (!btn) return;
    var mode = btn.getAttribute("data-view-toggle");
    var group = btn.closest(".btn-group");
    if (group) group.querySelectorAll("button").forEach(function (b) { b.className = "btn btn-light"; });
    btn.className = "btn btn-primary";
    var gridEl = document.getElementById("gridView"); var listEl = document.getElementById("listView");
    if (gridEl && listEl) { gridEl.classList.toggle("d-none", mode !== "grid"); listEl.classList.toggle("d-none", mode !== "list"); }
  });

  /* ---------------- 4. KANBAN DRAG & DROP (Leads / Tasks) ---------------- */
  document.querySelectorAll(".ourt-kanban-card[draggable]").forEach(function (card) {
    card.addEventListener("dragstart", function () { card.classList.add("dragging"); setTimeout(function () { card.style.opacity = "0.4"; }, 0); });
    card.addEventListener("dragend", function () { card.classList.remove("dragging"); card.style.opacity = "1"; updateKanbanCounts(); });
  });
  document.querySelectorAll(".ourt-kanban-drop-zone").forEach(function (zone) {
    zone.addEventListener("dragover", function (e) { e.preventDefault(); var dragging = document.querySelector(".ourt-kanban-card.dragging"); if (dragging) zone.appendChild(dragging); });
  });
  function updateKanbanCounts() {
    document.querySelectorAll(".ourt-kanban-col").forEach(function (col) {
      var countEl = col.querySelector(".kanban-count"); var zone = col.querySelector(".ourt-kanban-drop-zone");
      if (countEl && zone) countEl.textContent = zone.querySelectorAll(".ourt-kanban-card").length;
    });
  }

  /* ---------------- 5. MULTI-STEP FORM WIZARD ---------------- */
  document.querySelectorAll("[data-step-next]").forEach(function (btn) { btn.addEventListener("click", function () { goToStep(btn.closest(".ourt-wizard"), parseInt(btn.getAttribute("data-step-next"), 10)); }); });
  document.querySelectorAll("[data-step-prev]").forEach(function (btn) { btn.addEventListener("click", function () { goToStep(btn.closest(".ourt-wizard"), parseInt(btn.getAttribute("data-step-prev"), 10)); }); });
  function goToStep(wizard, stepNum) {
    if (!wizard) return;
    wizard.querySelectorAll(".step-pane").forEach(function (p) { p.classList.add("d-none"); });
    var target = wizard.querySelector('.step-pane[data-step="' + stepNum + '"]');
    if (target) target.classList.remove("d-none");
    wizard.querySelectorAll(".ourt-step-indicator .step").forEach(function (s) {
      var n = parseInt(s.getAttribute("data-step"), 10);
      s.classList.toggle("done", n < stepNum); s.classList.toggle("active", n === stepNum);
    });
    window.scrollTo({ top: wizard.offsetTop - 90, behavior: "smooth" });
  }
  document.addEventListener("click", function (e) {
    if (e.target.closest("[data-step-submit]")) {
      window.OurtToast && window.OurtToast.show("Saved as draft. Ready for review.", "success");
    }
  });

  /* ---------------- 6. STAR RATING PICKER ---------------- */
  document.querySelectorAll(".rating-picker").forEach(function (picker) {
    var stars = picker.querySelectorAll("i");
    stars.forEach(function (star, idx) {
      star.addEventListener("click", function () {
        stars.forEach(function (s, i) { s.className = i <= idx ? "bi bi-star-fill" : "bi bi-star"; });
        picker.setAttribute("data-value", idx + 1);
      });
    });
  });

  /* ---------------- 7. QUANTITY STEPPER ---------------- */
  document.addEventListener("click", function (e) {
    var incr = e.target.closest("[data-qty-incr]"); var decr = e.target.closest("[data-qty-decr]");
    var btn = incr || decr; if (!btn) return;
    var wrap = btn.closest(".qty-stepper"); var input = wrap.querySelector("input");
    var val = parseInt(input.value || "1", 10);
    input.value = incr ? val + 1 : Math.max(1, val - 1);
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });

  /* ---------------- 8. FAQ ACCORDION CHEVRON ---------------- */
  document.addEventListener("click", function (e) {
    var q = e.target.closest(".faq-q"); if (!q) return;
    var item = q.closest(".faq-item"); var answer = item.querySelector(".faq-a"); var icon = q.querySelector(".faq-chevron");
    var isOpen = answer.style.display === "block";
    item.closest(".faq-list").querySelectorAll(".faq-a").forEach(function (a) { a.style.display = "none"; });
    item.closest(".faq-list").querySelectorAll(".faq-chevron").forEach(function (i) { i.style.transform = "rotate(0deg)"; });
    if (!isOpen) { answer.style.display = "block"; if (icon) icon.style.transform = "rotate(180deg)"; }
  });

  /* ---------------- 9. PRICING MONTHLY / YEARLY TOGGLE ---------------- */
  var pricingToggle = document.getElementById("pricingPeriodToggle");
  if (pricingToggle) {
    pricingToggle.addEventListener("change", function () {
      document.querySelectorAll("[data-price-month]").forEach(function (el) { el.textContent = pricingToggle.checked ? el.getAttribute("data-price-year") : el.getAttribute("data-price-month"); });
      document.querySelectorAll(".pricing-period-label").forEach(function (el) { el.textContent = pricingToggle.checked ? "/year" : "/month"; });
    });
  }

  /* ---------------- 10. TABLE SEARCH + SELECT-ALL + RANGE OUTPUT ---------------- */
  document.querySelectorAll("[data-table-search]").forEach(function (input) {
    input.addEventListener("input", function () {
      var table = document.getElementById(input.getAttribute("data-table-search"));
      if (!table) return;
      var q = input.value.toLowerCase();
      table.querySelectorAll("tbody tr").forEach(function (row) {
        var match = row.textContent.toLowerCase().indexOf(q) !== -1;
        row.setAttribute("data-filtered-out", match ? "0" : "1");
      });
      if (table._ourtRepaginate) table._ourtRepaginate();
      else table.querySelectorAll("tbody tr").forEach(function (row) { row.style.display = row.getAttribute("data-filtered-out") === "1" ? "none" : ""; });
    });
  });
  document.querySelectorAll("[data-select-all]").forEach(function (master) {
    master.addEventListener("change", function () {
      var table = document.getElementById(master.getAttribute("data-select-all"));
      if (table) table.querySelectorAll('tbody input[type="checkbox"]').forEach(function (cb) { cb.checked = master.checked; });
    });
  });
  document.querySelectorAll('input[type="range"][data-range-output]').forEach(function (range) {
    var out = document.getElementById(range.getAttribute("data-range-output"));
    var render = function () { if (out) out.textContent = range.value; };
    range.addEventListener("input", render); render();
  });

  /* ---------------- 11. FILE UPLOAD PREVIEW ---------------- */
  document.querySelectorAll(".ourt-upload-drop input[type=file]").forEach(function (input) {
    input.addEventListener("change", function () {
      var label = input.closest(".ourt-upload-drop").querySelector(".upload-filename");
      if (label && input.files.length) label.textContent = input.files.length + " file(s) selected: " + Array.from(input.files).map(function (f) { return f.name; }).join(", ");
    });
  });

  /* ---------------- 12. EMI CALCULATOR ---------------- */
  function computeEmi() {
    var form = document.getElementById("emiCalcForm"); if (!form) return;
    var price = parseFloat(form.elements.vehiclePrice.value) || 0;
    var down = parseFloat(form.elements.downPayment.value) || 0;
    var rate = parseFloat(form.elements.interestRate.value) || 0;
    var tenure = parseFloat(form.elements.tenure.value) || 1;
    var principal = Math.max(0, price - down);
    var r = rate / 12 / 100;
    var n = tenure * 12;
    var emi = r === 0 ? principal / n : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    var totalPayable = emi * n;
    var totalInterest = totalPayable - principal;
    document.getElementById("emiMonthly").textContent = "₹" + Math.round(emi).toLocaleString("en-IN");
    document.getElementById("emiInterest").textContent = "₹" + Math.round(totalInterest).toLocaleString("en-IN");
    document.getElementById("emiTotal").textContent = "₹" + Math.round(totalPayable).toLocaleString("en-IN");
    if (window.OurtCharts && window.OurtCharts.registry) {
      var gaugeChart = window._emiDonut;
      if (gaugeChart) { gaugeChart.data.datasets[0].data = [Math.round(principal), Math.round(totalInterest)]; gaugeChart.update(); }
    }
  }
  var emiForm = document.getElementById("emiCalcForm");
  if (emiForm) { emiForm.addEventListener("input", computeEmi); computeEmi(); }

  /* ---------------- 13. VEHICLE VALUATION CALCULATOR (UI-only demo) ---------------- */
  var valForm = document.getElementById("valuationForm");
  if (valForm) {
    valForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var year = parseInt(valForm.elements.year.value, 10) || new Date().getFullYear();
      var mileage = parseFloat(valForm.elements.mileage.value) || 0;
      var basePrice = parseFloat(valForm.elements.basePrice.value) || 800000;
      var age = Math.max(0, new Date().getFullYear() - year);
      var conditionFactor = { Excellent: 0.92, Good: 0.84, Fair: 0.72, Poor: 0.58 }[valForm.elements.condition.value] || 0.8;
      var ageDepreciation = Math.pow(0.91, age);
      var mileagePenalty = Math.max(0.6, 1 - (mileage / 200000) * 0.35);
      var owners = parseInt(valForm.elements.owners.value, 10) || 1;
      var ownerPenalty = Math.max(0.85, 1 - (owners - 1) * 0.05);
      var estimate = basePrice * conditionFactor * ageDepreciation * mileagePenalty * ownerPenalty;
      var tradeIn = estimate * 0.88;
      var retail = estimate * 1.14;
      document.getElementById("valEstimate").textContent = "₹" + Math.round(estimate).toLocaleString("en-IN");
      document.getElementById("valTradeIn").textContent = "₹" + Math.round(tradeIn).toLocaleString("en-IN");
      document.getElementById("valRetail").textContent = "₹" + Math.round(retail).toLocaleString("en-IN");
      document.getElementById("valuationResult").classList.remove("d-none");
      window.OurtToast && window.OurtToast.show("Valuation estimated. This is a UI-only demo calculation.", "primary");
    });
  }

  /* ---------------- 14. VEHICLE COMPARE TABLE (add/remove columns via demo data) ---------------- */
  document.addEventListener("click", function (e) {
    var removeBtn = e.target.closest("[data-compare-remove]");
    if (!removeBtn) return;
    var col = removeBtn.getAttribute("data-compare-remove");
    document.querySelectorAll('[data-compare-col="' + col + '"]').forEach(function (cell) { cell.remove(); });
  });

  /* ---------------- 15. CALENDAR MONTH NAV (demo, static month set) ---------------- */
  document.addEventListener("click", function (e) {
    var navBtn = e.target.closest("[data-cal-nav]");
    if (!navBtn) return;
    window.OurtToast && window.OurtToast.show("This is a static calendar demo — hook up real month data here.", "primary");
  });

  /* ---------------- 16. PASSWORD VISIBILITY + COPY ---------------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".pwd-toggle-btn");
    if (btn) {
      var input = btn.parentElement.querySelector("input");
      if (input) { var showing = input.type === "text"; input.type = showing ? "password" : "text"; btn.querySelector("i").className = showing ? "bi bi-eye" : "bi bi-eye-slash"; }
    }
    var copyBtn = e.target.closest("[data-copy]");
    if (copyBtn) {
      navigator.clipboard && navigator.clipboard.writeText(copyBtn.getAttribute("data-copy")).then(function () { window.OurtToast && window.OurtToast.show("Copied to clipboard", "success"); });
    }
  });

  /* ---------------- 17. BULK ACTIONS BAR ---------------- */
  document.addEventListener("click", function (e) {
    var bulkBtn = e.target.closest("[data-bulk-action]");
    if (!bulkBtn) return;
    var action = bulkBtn.getAttribute("data-bulk-action");
    var table = bulkBtn.closest(".card").querySelector("table");
    var checked = table ? table.querySelectorAll('tbody input[type="checkbox"]:checked').length : 0;
    if (checked === 0) { window.OurtToast && window.OurtToast.show("Select at least one row first.", "warning"); return; }
    window.OurtToast && window.OurtToast.show(action + " applied to " + checked + " item(s).", "success");
  });
})();
