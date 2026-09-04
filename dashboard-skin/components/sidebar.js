(function () {
  "use strict";


  var SIDEBAR_COOKIE_NAME = "sidebar_state";
  var SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
  var SIDEBAR_KEYBOARD_SHORTCUT = "b";

  function readCookie(name) {
    try {
      var m = document.cookie.match(
        new RegExp("(?:^|;\\s*)" + name + "=([^;]*)")
      );
      return m ? decodeURIComponent(m[1]) : null;
    } catch (e) {
      return null;
    }
  }

  function writeCookie(name, value) {
    try {
      document.cookie =
        name +
        "=" +
        encodeURIComponent(value) +
        "; path=/; max-age=" +
        SIDEBAR_COOKIE_MAX_AGE +
        "; samesite=lax";
    } catch (e) {

    }
  }


  function initSidebar() {
    var wrapper = document.querySelector('[data-slot="sidebar-wrapper"]');
    if (!wrapper) return;

    var sidebar = wrapper.querySelector('[data-slot="sidebar"]');


    function setSidebarState(expanded, persist) {
      var state = expanded ? "expanded" : "collapsed";
      wrapper.setAttribute("data-state", state);
      if (sidebar) {
        sidebar.setAttribute("data-state", state);

        sidebar.setAttribute("data-collapsible", expanded ? "" : "icon");
      }
      triggers().forEach(function (t) {
        t.setAttribute("aria-expanded", expanded ? "true" : "false");
      });

      document.documentElement.removeAttribute("data-sidebar-init");
      if (persist !== false) {
        writeCookie(SIDEBAR_COOKIE_NAME, expanded ? "true" : "false");
      }
    }

    function isExpanded() {
      return wrapper.getAttribute("data-state") !== "collapsed";
    }

    function toggleSidebar() {
      setSidebarState(!isExpanded(), true);
    }

    function triggers() {
      return Array.prototype.slice.call(
        document.querySelectorAll(
          '[data-slot="sidebar-trigger"], [data-sidebar-trigger]'
        )
      );
    }


    var saved = readCookie(SIDEBAR_COOKIE_NAME);
    setSidebarState(saved !== "false", false);

    triggers().forEach(function (trigger) {
      trigger.setAttribute("aria-controls", "sidebar");
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        toggleSidebar();
      });
    });




    document.addEventListener("keydown", function (event) {
      if (event.key !== SIDEBAR_KEYBOARD_SHORTCUT && event.key !== "B") return;
      if (!(event.metaKey || event.ctrlKey)) return;

      var el = event.target;
      var tag = el && el.tagName ? el.tagName.toLowerCase() : "";
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (el && el.isContentEditable) return;

      event.preventDefault();
      toggleSidebar();
    });


    var searchForm = wrapper.querySelector('[data-slot="sidebar-search-form"]');
    if (searchForm) {
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = searchForm.querySelector('[data-slot="sidebar-input"]');
        var q = input && input.value ? input.value.trim() : "";
        if (!q) return;
        window.location.href = "/search/" + encodeURIComponent(q);
      });
    }
  }


  function initThemeToggle() {
    var buttons = document.querySelectorAll("[data-theme-toggle]");
    if (!buttons.length) return;

    function apply(dark) {
      document.documentElement.classList.toggle("dark", dark);
      Array.prototype.forEach.call(buttons, function (b) {
        b.setAttribute("aria-pressed", dark ? "true" : "false");
      });
      try {
        localStorage.setItem("theme", dark ? "dark" : "light");
      } catch (e) {}
    }

    apply(document.documentElement.classList.contains("dark"));

    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener("click", function (event) {
        event.preventDefault();
        apply(!document.documentElement.classList.contains("dark"));
      });
    });
  }


  function initActiveState() {
    var wrapper = document.querySelector('[data-slot="sidebar-wrapper"]');
    if (!wrapper) return;

    var links = wrapper.querySelectorAll(
      '[data-slot="sidebar-content"] a[data-slot="sidebar-menu-button"],' +
        ' [data-slot="sidebar-content"] a[data-slot="sidebar-menu-sub-button"]'
    );
    if (!links.length) return;

    var here = decodeURIComponent(window.location.pathname).replace(/\/+$/, "");
    var best = null;
    var bestLen = -1;

    Array.prototype.forEach.call(links, function (link) {
      link.removeAttribute("data-active");
      var path;
      try {
        path = decodeURIComponent(new URL(link.href).pathname).replace(/\/+$/, "");
      } catch (e) {
        return;
      }
      var match =
        path === "" ? here === "" : here === path || here.indexOf(path + "/") === 0;
      if (match && path.length > bestLen) {
        best = link;
        bestLen = path.length;
      }
    });

    if (best) {
      best.setAttribute("data-active", "true");
      best.setAttribute("aria-current", "page");
    }
  }

  function init() {
    initSidebar();
    initThemeToggle();
    initActiveState();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
