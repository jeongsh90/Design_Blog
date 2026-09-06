(function () {
  "use strict";

  function text(el) {
    return ((el && el.textContent) || "").replace(/\s+/g, " ").trim();
  }

  function initHeaderBreadcrumb() {
    var header = document.querySelector('[data-slot="header"]');
    if (!header) return;

    var blog = header.querySelector('[data-crumb="blog"]');
    var sep = header.querySelector('[data-slot="breadcrumb-separator"]');
    var page = header.querySelector('[data-slot="breadcrumb-page"]');
    if (!blog || !sep || !page) return;

    var pageText = text(page);

    if (!pageText || pageText === text(blog)) {
      blog.style.display = "none";
      sep.style.display = "none";
      if (!pageText) page.textContent = text(blog);
    }
  }

  function initMenubarAdopt() {
    var actions = document.querySelector('[data-slot="header-actions"]');
    if (!actions) return;

    function syncSubscribe() {
      var dest = actions.querySelector(".btn_subscription");
      var src = document.querySelector(".toolbar_rb .btn_subscription");
      if (!dest || !src) return;
      var id = src.getAttribute("data-blog-id");
      var url = src.getAttribute("data-url");
      if (id) dest.setAttribute("data-blog-id", id);
      if (url) dest.setAttribute("data-url", url);
    }

    function scan() {
      syncSubscribe();
      var kebab = document.querySelector(".menu_toolbar:not(.toolbar_rb)");
      if (kebab && kebab.parentElement !== actions) actions.appendChild(kebab);
    }

    scan();
    var observer = new MutationObserver(scan);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  function initThemeToggle() {
    if (window.__skinThemeInit) return;
    window.__skinThemeInit = true;
    var dock = document.querySelector("[data-slot='page-dock']");
    if (!dock) return;
    var root = document.documentElement;
    var media = window.matchMedia("(prefers-color-scheme: dark)");

    function readTheme() {
      try {
        var t = localStorage.getItem("theme");
        if (t === "light" || t === "dark") return t;
      } catch (e) {}
      return "system";
    }

    function isDark(theme) {
      if (theme === "dark") return true;
      if (theme === "light") return false;
      return media.matches;
    }

    function apply(theme) {
      if (theme !== "light" && theme !== "dark" && theme !== "system") return;
      root.setAttribute("data-theme", theme);
      root.classList.toggle("dark", isDark(theme));
      var buttons = dock.querySelectorAll("[data-slot='theme-switch'] button[data-theme]");
      Array.prototype.forEach.call(buttons, function (b) {
        var on = b.getAttribute("data-theme") === theme;
        b.setAttribute("aria-checked", on ? "true" : "false");
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      try {
        if (theme === "system") localStorage.removeItem("theme");
        else localStorage.setItem("theme", theme);
      } catch (e) {}
    }

    apply(readTheme());

    function onPick(event) {
      var btn = event.target.closest("button[data-theme]");
      if (!btn || !dock.contains(btn)) return;
      var theme = btn.getAttribute("data-theme");
      if (!theme) return;
      event.preventDefault();
      event.stopPropagation();
      apply(theme);
    }

    dock.addEventListener("pointerdown", onPick);
    dock.addEventListener("click", onPick);
    document.addEventListener("pointerdown", onPick, true);

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", function () {
        if (readTheme() === "system") apply("system");
      });
    } else if (typeof media.addListener === "function") {
      media.addListener(function () {
        if (readTheme() === "system") apply("system");
      });
    }
  }

  function initScrollTop() {
    var btn = document.querySelector('[data-slot="scroll-top"]');
    if (!btn) return;
    btn.addEventListener("click", function (event) {
      event.preventDefault();
      var inner = document.querySelector('[data-slot="content-inner"]');
      if (!inner) return;
      if (inner.__skinLenis) inner.__skinLenis.scrollTo(0);
      else inner.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function init() {
    initHeaderBreadcrumb();
    initMenubarAdopt();
    initThemeToggle();
    initScrollTop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
