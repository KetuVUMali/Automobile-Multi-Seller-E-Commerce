/*!
 * OurtAuto — tables.js
 * Generic front-end-only pagination + sorting for demo data tables.
 * Usage: <table id="t" data-paginate="8" data-sortable> ... </table>
 *        <nav data-paginate-for="t"></nav>
 */
(function () {
  "use strict";

  function paginateTable(table) {
    var pageSize = parseInt(table.getAttribute("data-paginate"), 10) || 10;
    var pager = document.querySelector('[data-paginate-for="' + table.id + '"]');
    var current = 1;

    function rows() { return Array.prototype.slice.call(table.querySelectorAll("tbody tr")); }

    function render() {
      var visibleRows = rows().filter(function (r) { return r.getAttribute("data-filtered-out") !== "1"; });
      var totalPages = Math.max(1, Math.ceil(visibleRows.length / pageSize));
      if (current > totalPages) current = totalPages;
      var shown = 0;
      visibleRows.forEach(function (row, i) {
        var onPage = i >= (current - 1) * pageSize && i < current * pageSize;
        row.style.display = onPage ? "" : "none";
        if (onPage) shown++;
      });
      rows().forEach(function (r) { if (r.getAttribute("data-filtered-out") === "1") r.style.display = "none"; });

      if (!pager) return;
      var html = '<ul class="pagination mb-0 justify-content-end">';
      html += '<li class="page-item ' + (current === 1 ? "disabled" : "") + '"><a class="page-link" href="#" data-page="prev"><i class="bi bi-chevron-left"></i></a></li>';
      for (var p = 1; p <= totalPages; p++) {
        if (totalPages > 7 && Math.abs(p - current) > 2 && p !== 1 && p !== totalPages) {
          if (p === 2 || p === totalPages - 1) html += '<li class="page-item disabled"><span class="page-link">…</span></li>';
          continue;
        }
        html += '<li class="page-item ' + (p === current ? "active" : "") + '"><a class="page-link" href="#" data-page="' + p + '">' + p + "</a></li>";
      }
      html += '<li class="page-item ' + (current === totalPages ? "disabled" : "") + '"><a class="page-link" href="#" data-page="next"><i class="bi bi-chevron-right"></i></a></li>';
      html += "</ul>";
      pager.innerHTML = html;
    }

    if (pager) {
      pager.addEventListener("click", function (e) {
        e.preventDefault();
        var link = e.target.closest("[data-page]");
        if (!link) return;
        var val = link.getAttribute("data-page");
        var visibleCount = rows().filter(function (r) { return r.getAttribute("data-filtered-out") !== "1"; }).length;
        var totalPages = Math.max(1, Math.ceil(visibleCount / pageSize));
        if (val === "prev") current = Math.max(1, current - 1);
        else if (val === "next") current = Math.min(totalPages, current + 1);
        else current = parseInt(val, 10);
        render();
      });
    }
    table._ourtRepaginate = function () { current = 1; render(); };
    render();
  }

  document.querySelectorAll("table[data-paginate]").forEach(paginateTable);

  document.querySelectorAll("table[data-sortable] thead th[data-sort]").forEach(function (th) {
    th.style.cursor = "pointer";
    th.addEventListener("click", function () {
      var table = th.closest("table");
      var index = Array.prototype.indexOf.call(th.parentElement.children, th);
      var type = th.getAttribute("data-sort");
      var tbody = table.querySelector("tbody");
      var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
      var asc = th.getAttribute("data-sort-dir") !== "asc";
      rows.sort(function (a, b) {
        var av = (a.children[index] && a.children[index].textContent.trim()) || "";
        var bv = (b.children[index] && b.children[index].textContent.trim()) || "";
        if (type === "number") { av = parseFloat(av.replace(/[^0-9.-]/g, "")) || 0; bv = parseFloat(bv.replace(/[^0-9.-]/g, "")) || 0; return asc ? av - bv : bv - av; }
        return asc ? av.localeCompare(bv) : bv.localeCompare(av);
      });
      rows.forEach(function (r) { tbody.appendChild(r); });
      table.querySelectorAll("thead th").forEach(function (t) { t.removeAttribute("data-sort-dir"); var sc = t.querySelector(".sort-caret"); if (sc) sc.remove(); });
      th.setAttribute("data-sort-dir", asc ? "asc" : "desc");
      th.insertAdjacentHTML("beforeend", ' <i class="bi sort-caret bi-caret-' + (asc ? "up" : "down") + '-fill"></i>');
      if (table._ourtRepaginate) table._ourtRepaginate();
    });
  });
})();
