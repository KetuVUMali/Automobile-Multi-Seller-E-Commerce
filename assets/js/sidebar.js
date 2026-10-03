/*!
 * OurtAuto — sidebar.js
 * Desktop collapse/expand, mobile off-canvas drawer, and the
 * collapsed-sidebar hover flyout.
 *
 * The flyout is deliberately NOT pure-CSS :hover: .ourt-sidebar-scroll
 * needs overflow-x:hidden for its own vertical scrollbar to behave,
 * which would clip any absolutely-positioned popout trying to escape
 * past the sidebar's right edge. So #ourtFlyout lives outside that
 * scroll container and this file positions it with
 * getBoundingClientRect() against whichever nav item is hovered/focused.
 */
(function () {
  "use strict";
  var body = document.body;
  var Store = window.OurtStore || { get: function () { return null; }, set: function () {} };
  var SIDEBAR_KEY = "ourt-sidebar-collapsed";
  var overlay = document.querySelector(".ourt-overlay");

  (function initState() {
    if (Store.get(SIDEBAR_KEY) === "1" && window.innerWidth >= 992) {
      body.classList.add("sidebar-collapsed");
    }
  })();

  function toggleDesktopSidebar() {
    body.classList.toggle("sidebar-collapsed");
    Store.set(SIDEBAR_KEY, body.classList.contains("sidebar-collapsed") ? "1" : "0");
    hideFlyout();
  }
  function openMobileSidebar() { body.classList.add("sidebar-mobile-open"); overlay && overlay.classList.add("show"); }
  function closeMobileSidebar() { body.classList.remove("sidebar-mobile-open"); overlay && overlay.classList.remove("show"); }

  document.addEventListener("click", function (e) {
    if (e.target.closest(".ourt-sidebar-toggle-btn")) toggleDesktopSidebar();
    if (e.target.closest(".ourt-mobile-toggle-btn")) openMobileSidebar();
    if (e.target.closest(".ourt-sidebar-close-btn")) closeMobileSidebar();
    if (e.target === overlay) closeMobileSidebar();
  });
  window.addEventListener("resize", function () { if (window.innerWidth >= 992) closeMobileSidebar(); });

  document.querySelectorAll(".ourt-sidebar-nav .ourt-nav-link.active").forEach(function (link) {
    var parentCollapse = link.closest(".ourt-nav-submenu.collapse");
    if (parentCollapse) {
      parentCollapse.classList.add("show");
      var trigger = document.querySelector('[data-bs-target="#' + parentCollapse.id + '"]');
      if (trigger) trigger.setAttribute("aria-expanded", "true");
    }
  });

  document.querySelectorAll(".ourt-sidebar-nav a.ourt-nav-link:not([data-bs-toggle])").forEach(function (a) {
    a.addEventListener("click", function () { if (window.innerWidth < 992) closeMobileSidebar(); });
  });

  /* ---- Collapsed-sidebar flyout ---- */
  var flyout = document.getElementById("ourtFlyout");
  var flyoutHideTimer = null;
  var flyoutOpenItem = null;

  function isCollapsedDesktop() { return body.classList.contains("sidebar-collapsed") && window.innerWidth >= 992; }

  function showFlyoutFor(navItem) {
    if (!flyout || !navItem || !isCollapsedDesktop()) return;
    var link = navItem.querySelector(":scope > .ourt-nav-link");
    var submenu = navItem.querySelector(":scope > .ourt-nav-submenu");
    var labelEl = link && link.querySelector(".ourt-nav-link-text");
    var label = labelEl ? labelEl.textContent : "";

    if (submenu) {
      flyout.innerHTML = '<div class="flyout-title">' + label + "</div>" + submenu.outerHTML;
      flyout.classList.add("has-submenu");
    } else {
      flyout.innerHTML = '<div class="flyout-title">' + label + "</div>";
      flyout.classList.remove("has-submenu");
    }
    var innerList = flyout.querySelector("ul");
    if (innerList) innerList.classList.remove("collapse", "show");

    var rect = navItem.getBoundingClientRect();
    flyout.style.top = Math.max(8, rect.top) + "px";
    flyout.style.left = (rect.right + 10) + "px";
    flyout.classList.add("show");
    flyoutOpenItem = navItem;
  }
  function hideFlyout() { if (flyout) flyout.classList.remove("show"); flyoutOpenItem = null; }
  function scheduleHide() { clearTimeout(flyoutHideTimer); flyoutHideTimer = setTimeout(hideFlyout, 220); }
  function cancelHide() { clearTimeout(flyoutHideTimer); }

  document.querySelectorAll(".ourt-sidebar-scroll > .ourt-sidebar-nav > .ourt-nav-item").forEach(function (item) {
    item.addEventListener("mouseenter", function () { cancelHide(); showFlyoutFor(item); });
    item.addEventListener("mouseleave", scheduleHide);
    item.addEventListener("focusin", function () { cancelHide(); showFlyoutFor(item); });
    item.addEventListener("focusout", scheduleHide);
  });
  if (flyout) { flyout.addEventListener("mouseenter", cancelHide); flyout.addEventListener("mouseleave", scheduleHide); }

  document.addEventListener("click", function (e) {
    var groupLink = e.target.closest(".ourt-sidebar-scroll > .ourt-sidebar-nav > .ourt-nav-item > .ourt-nav-link[data-bs-toggle='collapse']");
    if (groupLink && isCollapsedDesktop()) {
      e.preventDefault(); e.stopPropagation();
      var item = groupLink.closest(".ourt-nav-item");
      if (flyoutOpenItem === item) hideFlyout(); else showFlyoutFor(item);
      return;
    }
    if (flyoutOpenItem && !e.target.closest(".ourt-flyout") && !e.target.closest(".ourt-sidebar-scroll > .ourt-sidebar-nav > .ourt-nav-item")) {
      hideFlyout();
    }
  });
  window.addEventListener("resize", hideFlyout);
})();
