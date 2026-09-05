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

    /* [RESPONSIVE SPEC §4-7 ①] 모바일 판정 — shadcn hooks/use-mobile.ts의
       `window.matchMedia("(max-width: " + (768 - 1) + "px)")`와 1:1. */
    var mqlMobile = window.matchMedia("(max-width: 767px)");
    /* [RESPONSIVE SPEC §4-6] 쿠키가 없을 때만 쓰는 태블릿 기본값 판정. */
    var mqlTablet = window.matchMedia("(max-width: 1023px)");
    var container = sidebar
      ? sidebar.querySelector('[data-slot="sidebar-container"]')
      : null;
    /* 드로어를 연 트리거를 기억해 뒀다 닫을 때 포커스를 되돌린다(§4-7 ②). */
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

    /* ─────────────────────────────────────────────────────────
       [RESPONSIVE SPEC §4-7] 모바일 오프캔버스 드로어
       shadcn SidebarProvider의 openMobile/setOpenMobile 대응.
       ───────────────────────────────────────────────────────── */

    function isMobileOpen() {
      return !!sidebar && sidebar.getAttribute("data-mobile-state") === "open";
    }

    /* ② setMobileOpen — shadcn setOpenMobile과 동일하게 쿠키에 쓰지 않는다. */
    function setMobileOpen(open) {
      if (!sidebar) return;
      sidebar.setAttribute("data-mobile-state", open ? "open" : "closed");
      triggers().forEach(function (t) {
        t.setAttribute("aria-expanded", open ? "true" : "false");
      });

      if (container) {
        if (open) {
          /* Radix Dialog가 SheetContent에 주는 것과 같은 역할.
             Tab 순환 가둠은 미구현(§7 #4에 명시). */
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
        // display:none인 요소(접힘 전용 마크업 등)는 건너뛴다.
        if (el.offsetParent === null && getComputedStyle(el).position !== "fixed") {
          continue;
        }
        try {
          el.focus();
        } catch (e) {}
        if (document.activeElement === el) return;
      }
    }

    /* ③ 모드 전환 */
    function enterMobile() {
      if (!sidebar) return;
      sidebar.setAttribute("data-mobile", "true");
      /* 드로어는 언제나 펼침 레이아웃(§4-1) — 접힘 레이아웃 규칙이 전부
         wrapper[data-state="collapsed"]에 매달려 있으므로 여기만 고정하면 된다.
         쿠키는 건드리지 않는다(데스크톱 복귀 시 복원해야 하므로). */
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

    /* [§4-6] 쿠키가 있으면 쿠키가 이기고, 없을 때만 태블릿에서 접힘으로 시작. */
    function defaultExpanded() {
      var saved = readCookie(SIDEBAR_COOKIE_NAME);
      if (saved === "false") return false;
      if (saved === "true") return true;
      return !mqlTablet.matches;
    }

    /* ④ shadcn toggleSidebar와 1:1 —
       `isMobile ? setOpenMobile(o => !o) : setOpen(o => !o)` */
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

    /* 뷰포트가 모바일 경계를 넘나들 때 모드를 갈아탄다(shadcn useIsMobile의
       mql change 리스너와 같은 자리). addEventListener가 없는 구형 Safari는
       addListener로 폴백. */
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

    /* ⑤ 닫기 경로 (1) 백드롭 클릭 */
    wrapper.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || !target.closest) return;
      if (!target.closest("[data-sidebar-close]")) return;
      if (!mqlMobile.matches) return;
      event.preventDefault();
      setMobileOpen(false);
    });




    document.addEventListener("keydown", function (event) {
      /* [RESPONSIVE SPEC §4-7 ⑤] Escape로 드로어 닫기.
         새 리스너를 만들지 않고 기존 문서 keydown에 분기만 더한다.
         content.js의 Escape(드롭다운 전용)와는 대상이 달라 충돌하지 않는다. */
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
