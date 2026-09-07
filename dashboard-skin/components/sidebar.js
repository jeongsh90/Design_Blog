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


    var mqlMobile = window.matchMedia("(max-width: 767px)");

    var mqlTablet = window.matchMedia("(max-width: 1023px)");
    var container = sidebar
      ? sidebar.querySelector('[data-slot="sidebar-container"]')
      : null;

    var lastFocused = null;


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



    function isMobileOpen() {
      return !!sidebar && sidebar.getAttribute("data-mobile-state") === "open";
    }


    function setMobileOpen(open) {
      if (!sidebar) return;
      sidebar.setAttribute("data-mobile-state", open ? "open" : "closed");
      triggers().forEach(function (t) {
        t.setAttribute("aria-expanded", open ? "true" : "false");
      });

      if (container) {
        if (open) {

          container.setAttribute("role", "dialog");
          container.setAttribute("aria-modal", "true");
        } else {
          container.removeAttribute("role");
          container.removeAttribute("aria-modal");
        }
      }

      if (open) {
        lastFocused =
          document.activeElement && document.activeElement !== document.body
            ? document.activeElement
            : triggers()[0] || null;
        focusFirstInDrawer();
      } else if (lastFocused && typeof lastFocused.focus === "function") {
        var back = lastFocused;
        lastFocused = null;
        try {
          back.focus();
        } catch (e) {}
      }
    }

    function focusFirstInDrawer() {
      if (!container) return;
      var focusable = container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]),' +
          " select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])"
      );
      for (var i = 0; i < focusable.length; i++) {
        var el = focusable[i];

        if (el.offsetParent === null && getComputedStyle(el).position !== "fixed") {
          continue;
        }
        try {
          el.focus();
        } catch (e) {}
        if (document.activeElement === el) return;
      }
    }


    function enterMobile() {
      if (!sidebar) return;
      sidebar.setAttribute("data-mobile", "true");

      wrapper.setAttribute("data-state", "expanded");
      sidebar.setAttribute("data-state", "expanded");
      sidebar.setAttribute("data-collapsible", "");
      document.documentElement.removeAttribute("data-sidebar-init");
      setMobileOpen(false);
    }

    function exitMobile() {
      if (sidebar) {
        sidebar.removeAttribute("data-mobile");
        sidebar.removeAttribute("data-mobile-state");
      }
      if (container) {
        container.removeAttribute("role");
        container.removeAttribute("aria-modal");
      }
      lastFocused = null;
      setSidebarState(defaultExpanded(), false);
    }


    function defaultExpanded() {
      var saved = readCookie(SIDEBAR_COOKIE_NAME);
      if (saved === "false") return false;
      if (saved === "true") return true;
      return !mqlTablet.matches;
    }


    function toggleSidebar() {
      if (mqlMobile.matches) {
        setMobileOpen(!isMobileOpen());
        return;
      }
      setSidebarState(!isExpanded(), true);
    }

    function triggers() {
      return Array.prototype.slice.call(
        document.querySelectorAll(
          '[data-slot="sidebar-trigger"], [data-sidebar-trigger]'
        )
      );
    }


    if (mqlMobile.matches) {
      enterMobile();
    } else {
      setSidebarState(defaultExpanded(), false);
    }


    function onMobileChange(event) {
      if (event.matches) enterMobile();
      else exitMobile();
    }
    if (mqlMobile.addEventListener) {
      mqlMobile.addEventListener("change", onMobileChange);
    } else if (mqlMobile.addListener) {
      mqlMobile.addListener(onMobileChange);
    }

    triggers().forEach(function (trigger) {
      trigger.setAttribute("aria-controls", "sidebar");
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        toggleSidebar();
      });
    });


    wrapper.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || !target.closest) return;
      if (!target.closest("[data-sidebar-close]")) return;
      if (!mqlMobile.matches) return;
      event.preventDefault();
      setMobileOpen(false);
    });




    document.addEventListener("keydown", function (event) {

      if (event.key === "Escape" || event.key === "Esc") {
        if (mqlMobile.matches && isMobileOpen()) {
          event.preventDefault();
          setMobileOpen(false);
        }
        return;
      }

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


  function setCollapsibleState(group, open, animate) {
    var button = group.querySelector(':scope > [data-slot="sidebar-menu-button"]');
    var wrap = group.querySelector(':scope > [data-slot="sidebar-menu-sub-wrap"]');
    var inner = wrap ? wrap.querySelector(':scope > [data-slot="sidebar-menu-sub"]') : null;

    if (wrap && inner && animate) {
      wrap.style.setProperty("--accordion-content-height", inner.scrollHeight + "px");
    }

    group.setAttribute("data-state", open ? "open" : "closed");
    if (button) button.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function initCollapsibleMenus() {
    var groupsByRoot = [];
    Array.prototype.forEach.call(
      document.querySelectorAll('[data-slot="collapsible"]'),
      function (group) {
        var root = group.closest('[data-slot="sidebar-menu"]') || document;
        var entry = groupsByRoot.filter(function (e) {
          return e.root === root;
        })[0];
        if (!entry) {
          entry = { root: root, groups: [] };
          groupsByRoot.push(entry);
        }
        entry.groups.push(group);
      }
    );

    groupsByRoot.forEach(function (entry) {
      var groups = entry.groups;
      groups.forEach(function (group) {
        var button = group.querySelector(':scope > [data-slot="sidebar-menu-button"]');
        if (!button || button.dataset.collapsibleBound === "true") return;
        button.dataset.collapsibleBound = "true";

        button.addEventListener("click", function () {
          var isOpen = group.getAttribute("data-state") === "open";

          if (isOpen) {
            setCollapsibleState(group, false, true);
            return;
          }

          groups.forEach(function (other) {
            if (other !== group && other.getAttribute("data-state") === "open") {
              setCollapsibleState(other, false, true);
            }
          });
          setCollapsibleState(group, true, true);
        });
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
    initCollapsibleMenus();
    initActiveState();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
