/*!
 * OurtAuto — main.js
 * Global page behaviour not owned by a more specific module: AOS
 * (with a visibility safety net so content can never get stuck
 * invisible), tooltips, animated KPI counters, the toast helper used
 * across every page, form-validation wiring, back-to-top, fullscreen.
 */
(function () {
  "use strict";

  /* ---- AOS init with safety net (revealRemaining) ---- */
  function revealRemaining() {
    document.querySelectorAll("[data-aos]:not(.aos-animate)").forEach(function (el) { el.classList.add("aos-animate"); });
  }
  try {
    if (window.AOS) { AOS.init({ duration: 550, once: true, offset: 26, easing: "ease-out-cubic" }); window.setTimeout(revealRemaining, 1200); }
    else { revealRemaining(); }
  } catch (e) { revealRemaining(); }

  /* ---- Tooltips / popovers ---- */
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) { new bootstrap.Tooltip(el); });
  document.querySelectorAll('[data-bs-toggle="popover"]').forEach(function (el) { new bootstrap.Popover(el); });

  /* ---- Animated counters ---- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-counter"));
    var decimals = parseInt(el.getAttribute("data-counter-decimals") || "0", 10);
    var prefix = el.getAttribute("data-counter-prefix") || "";
    var suffix = el.getAttribute("data-counter-suffix") || "";
    var duration = 1100, start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = prefix + value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) { if (entry.isIntersecting) { animateCounter(entry.target); counterObserver.unobserve(entry.target); } });
  }, { threshold: 0.4 });
  document.querySelectorAll("[data-counter]").forEach(function (el) { counterObserver.observe(el); });

  /* ---- Toast helper ---- */
  window.OurtToast = {
    show: function (message, type) {
      type = type || "primary";
      var stack = document.querySelector(".toast-stack");
      if (!stack) { stack = document.createElement("div"); stack.className = "toast-stack"; document.body.appendChild(stack); }
      var icons = { primary: "bi-info-circle", success: "bi-check-circle", danger: "bi-x-circle", warning: "bi-exclamation-triangle" };
      var el = document.createElement("div");
      el.className = "toast align-items-center border-0 text-bg-" + type;
      el.setAttribute("role", "alert");
      el.innerHTML = '<div class="d-flex"><div class="toast-body"><i class="bi ' + (icons[type] || icons.primary) + ' me-2"></i>' + message + '</div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>';
      stack.appendChild(el);
      var toast = new bootstrap.Toast(el, { delay: 3500 });
      toast.show();
      el.addEventListener("hidden.bs.toast", function () { el.remove(); });
    }
  };

  /* ---- Fullscreen ---- */
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".fullscreen-btn")) return;
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {});
    else document.exitFullscreen();
  });

  /* ---- Back to top ---- */
  var backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", function () { backToTop.classList.toggle("show", window.scrollY > 400); });
    backToTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /* ---- Footer year ---- */
  document.querySelectorAll(".current-year").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---- Bootstrap-pattern form validation + success toast ---- */
  document.querySelectorAll("form.needs-validation").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      if (!form.checkValidity()) { e.preventDefault(); e.stopPropagation(); }
      else { e.preventDefault(); window.OurtToast.show("Saved successfully.", "success"); }
      form.classList.add("was-validated");
    });
  });
})();
