(function () {
  "use strict";

  var CELL_TARGET = 128;
  var CELL_MIN = 100;
  var CELL_MAX = 180;
  var COLS_MIN = 2;
  var COLS_MAX = 12;

  function initPaginationActiveState() {
    var links = document.querySelectorAll("[data-pagination-link]");
    if (!links.length) return;

    var here = window.location.pathname + window.location.search;

    Array.prototype.forEach.call(links, function (link) {
      if (!link.getAttribute("href")) return;

      if (link.pathname + link.search === here) {
        link.setAttribute("aria-current", "page");
        link.setAttribute("data-variant", "outline");
      } else {
        link.removeAttribute("aria-current");
        link.setAttribute("data-variant", "ghost");
      }
    });
  }

  function pickColumns(width) {
    if (!(width > 0)) return 6;

    var cols = Math.round(width / CELL_TARGET);
    cols = Math.round(cols / 2) * 2;
    if (cols < COLS_MIN) cols = COLS_MIN;
    if (cols > COLS_MAX) cols = COLS_MAX;

    while (width / cols < CELL_MIN && cols > COLS_MIN) {
      cols -= 2;
    }
    while (width / cols > CELL_MAX && cols < COLS_MAX) {
      var next = cols + 2;
      if (width / next < CELL_MIN) break;
      cols = next;
    }
    return cols;
  }

  function syncSquareGrid(grid) {
    if (!grid) return;
    var inner = grid.closest('[data-slot="content-inner"]') || grid.parentElement;

    var width = grid.getBoundingClientRect().width;
    if (!(width > 0)) return;

    var cols = pickColumns(width);
    var cell = width / cols;
    var rowSpan = cell < CELL_MIN && cols === COLS_MIN ? 2 : 1;

    inner.style.setProperty("--content-grid-columns", String(cols));

    inner.style.setProperty("--content-grid-row", cell + "px");
    inner.setAttribute("data-grid-cols", String(cols));
    inner.setAttribute("data-grid-row-span", String(rowSpan));
  }

  function initSquareGrid() {
    var grids = document.querySelectorAll('[data-slot="content-grid"]');
    if (!grids.length) return;

    Array.prototype.forEach.call(grids, function (grid) {
      syncSquareGrid(grid);
      if (typeof ResizeObserver === "undefined") return;
      var ro = new ResizeObserver(function () {
        syncSquareGrid(grid);
      });
      ro.observe(grid);
    });

    requestAnimationFrame(function () {
      Array.prototype.forEach.call(grids, syncSquareGrid);
    });
  }

  function initViewToggle() {
    var inner = document.querySelector('[data-slot="content-inner"]');
    if (!inner) return;
    if (inner.querySelector('[data-slot="post-single"]')) return;

    var buttons = inner.querySelectorAll("[data-view-mode]");
    if (!buttons.length) return;

    var KEY = "daitnu-content-view";
    var saved = "";
    try {
      saved = localStorage.getItem(KEY) || "";
    } catch (e) {}
    var initial = saved === "thumb" || saved === "list" ? saved : "list";

    function setView(mode) {
      if (mode !== "list" && mode !== "thumb") mode = "list";
      inner.setAttribute("data-view", mode);
      try {
        localStorage.setItem(KEY, mode);
      } catch (e) {}
      Array.prototype.forEach.call(buttons, function (btn) {
        var on = btn.getAttribute("data-view-mode") === mode;
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        btn.setAttribute("data-variant", on ? "outline" : "ghost");
      });
    }

    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener("click", function () {
        setView(btn.getAttribute("data-view-mode"));
      });
    });

    setView(initial);
  }

  function init() {
    initPaginationActiveState();
    initSquareGrid();
    initViewToggle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
