/*!
 * OurtAuto — theme.js
 * Multi-theme system: light/dark/system mode, 7 color presets, sidebar
 * style, layout width. All persisted to localStorage and re-applied
 * pre-paint by a tiny inline script in each page's <head> (avoids a
 * flash of the wrong theme for returning visitors).
 */
(function () {
  "use strict";

  var root = document.documentElement;

  var Store = {
    get: function (key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set: function (key, val) { try { localStorage.setItem(key, val); } catch (e) { /* ignore */ } }
  };
  window.OurtStore = Store;

  var THEME_KEY = "ourt-theme";
  var PRESET_KEY = "ourt-preset";
  var SIDEBAR_STYLE_KEY = "ourt-sidebar-style";
  var LAYOUT_KEY = "ourt-layout-width";

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function applyTheme(mode) {
    // mode: "light" | "dark" | "system"
    var resolved = mode === "system" ? (systemPrefersDark() ? "dark" : "light") : mode;
    root.setAttribute("data-theme", resolved);
    root.setAttribute("data-theme-mode", mode);
    Store.set(THEME_KEY, mode);
    document.querySelectorAll(".theme-toggle-btn").forEach(function (btn) {
      btn.setAttribute("aria-label", resolved === "dark" ? "Switch to light mode" : "Switch to dark mode");
    });
    window.dispatchEvent(new CustomEvent("ourt:theme-changed", { detail: { theme: resolved, mode: mode } }));
  }

  (function initTheme() {
    var saved = Store.get(THEME_KEY) || "light";
    applyTheme(saved);
  })();

  document.addEventListener("click", function (e) {
    if (e.target.closest(".theme-toggle-btn")) {
      var current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      applyTheme(current === "dark" ? "light" : "dark");
    }
  });

  function syncActiveStates() {
    var preset = root.getAttribute("data-preset") || "blue";
    var sidebarStyle = root.getAttribute("data-sidebar") || "dark";
    var layout = root.getAttribute("data-layout") || "fluid";
    var mode = root.getAttribute("data-theme-mode") || "light";
    document.querySelectorAll("[data-set-preset]").forEach(function (el) {
      el.classList.toggle("active", el.getAttribute("data-set-preset") === preset);
    });
    document.querySelectorAll("[data-set-sidebar-style]").forEach(function (el) {
      el.classList.toggle("active", el.getAttribute("data-set-sidebar-style") === sidebarStyle);
    });
    document.querySelectorAll("[data-set-layout]").forEach(function (el) {
      el.classList.toggle("active", el.getAttribute("data-set-layout") === layout);
    });
    document.querySelectorAll("[data-set-mode]").forEach(function (el) {
      el.classList.toggle("active", el.getAttribute("data-set-mode") === mode);
    });
  }
  syncActiveStates();

  document.addEventListener("click", function (e) {
    var modeBtn = e.target.closest("[data-set-mode]");
    if (modeBtn) { applyTheme(modeBtn.getAttribute("data-set-mode")); syncActiveStates(); return; }

    var presetBtn = e.target.closest("[data-set-preset]");
    if (presetBtn) {
      var preset = presetBtn.getAttribute("data-set-preset");
      Store.set(PRESET_KEY, preset);
      // Charts bake their palette into the canvas at creation time, so a
      // clean reload is what makes every chart correctly reflect the new
      // accent color. Sidebar style / layout width below are pure CSS
      // and apply instantly with no reload needed.
      root.setAttribute("data-preset", preset);
      window.location.reload();
      return;
    }

    var sbBtn = e.target.closest("[data-set-sidebar-style]");
    if (sbBtn) {
      var style = sbBtn.getAttribute("data-set-sidebar-style");
      root.setAttribute("data-sidebar", style);
      Store.set(SIDEBAR_STYLE_KEY, style);
      syncActiveStates();
      return;
    }

    var lwBtn = e.target.closest("[data-set-layout]");
    if (lwBtn) {
      var layout = lwBtn.getAttribute("data-set-layout");
      root.setAttribute("data-layout", layout);
      Store.set(LAYOUT_KEY, layout);
      syncActiveStates();
      return;
    }
  });

  // React to OS-level theme changes when the user has chosen "system"
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var mqHandler = function () {
      if ((Store.get(THEME_KEY) || "light") === "system") applyTheme("system");
    };
    if (mq.addEventListener) mq.addEventListener("change", mqHandler);
  }
})();
