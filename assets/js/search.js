/*!
 * OurtAuto — search.js
 * Global search (Ctrl/Cmd+K), grouped results from a local dummy
 * dataset (window.OURT_SEARCH_INDEX, loaded via search-data.js). No
 * network calls.
 */
(function () {
  "use strict";
  var searchModalEl = document.getElementById("globalSearchModal");
  var searchInput = document.getElementById("globalSearchInput");
  var searchResults = document.getElementById("globalSearchResults");
  var DATA = window.OURT_SEARCH_INDEX || [];

  function render(query) {
    if (!searchResults) return;
    query = query.trim().toLowerCase();
    var base = window.OURT_BASE || "";
    var items = !query ? DATA.slice(0, 8) : DATA.filter(function (item) {
      return item.title.toLowerCase().indexOf(query) !== -1 || item.group.toLowerCase().indexOf(query) !== -1 || (item.subtitle || "").toLowerCase().indexOf(query) !== -1;
    });
    if (items.length === 0) {
      searchResults.innerHTML = '<div class="text-center py-5 text-muted-c"><i class="bi bi-search fs-2 d-block mb-2"></i>No results for "' + query + '"</div>';
      return;
    }
    var groups = {};
    items.forEach(function (item) { groups[item.group] = groups[item.group] || []; groups[item.group].push(item); });
    var html = "";
    Object.keys(groups).forEach(function (g) {
      html += '<div class="px-2 pt-3 pb-1 fs-12 fw-700 text-muted-c text-uppercase">' + g + "</div>";
      groups[g].forEach(function (item) {
        html += '<a href="' + base + item.url + '" class="search-result-row text-decoration-none">' +
          '<span class="sr-icon"><i class="bi ' + item.icon + '"></i></span>' +
          '<span class="flex-grow-1"><span class="d-block text-heading fw-600 fs-13">' + item.title + '</span>' +
          '<span class="d-block fs-12 text-muted-c">' + (item.subtitle || "") + "</span></span>" +
          '<i class="bi bi-arrow-right-short text-muted-c"></i></a>';
      });
    });
    searchResults.innerHTML = html;
  }

  if (searchInput) searchInput.addEventListener("input", function () { render(searchInput.value); });
  if (searchModalEl) searchModalEl.addEventListener("shown.bs.modal", function () { render(""); searchInput && searchInput.focus(); });

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      if (searchModalEl && window.bootstrap) bootstrap.Modal.getOrCreateInstance(searchModalEl).show();
    }
  });
})();
