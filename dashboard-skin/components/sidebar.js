/* ════════════════════════════════════════════════════════════════
   Sidebar — shadcn/ui 동작 로직의 바닐라 포트
   ────────────────────────────────────────────────────────────────
   기반: D:\MyCloud\2026포트폴리오\Design-system\js\components.js 28–57행
         (initDocSidebars — data-state를 wrapper와 [data-slot="sidebar"]
          양쪽에 세팅하는 방식)  → 그대로 가져와 스펙대로 확장했다.
   스펙: _workspace/sidebar_designer-spec.md §7-1 / §7-2 / §7-8
   ════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* shadcn 원본과 동일한 쿠키 이름/수명 (§7-2 — localStorage로 바꾸지 않는다) */
  var SIDEBAR_COOKIE_NAME = "sidebar_state";
  var SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7일
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
      /* 쿠키가 막힌 환경에서도 토글 자체는 계속 동작해야 한다 */
    }
  }

  /* ── 사이드바 ─────────────────────────────────────────────── */
  function initSidebar() {
    var wrapper = document.querySelector('[data-slot="sidebar-wrapper"]');
    if (!wrapper) return;

    var sidebar = wrapper.querySelector('[data-slot="sidebar"]');

    /* §7-1 — React Context가 없으므로 DOM 속성 자체가 상태 보유자다.
       CSS 셀렉터가 wrapper 레벨과 sidebar 레벨을 모두 참조하므로
       한쪽만 바꾸면 절반이 안 먹는다. */
    function setSidebarState(expanded, persist) {
      var state = expanded ? "expanded" : "collapsed";
      wrapper.setAttribute("data-state", state);
      if (sidebar) {
        sidebar.setAttribute("data-state", state);
        /* shadcn 원본: data-collapsible={state === "collapsed" ? collapsible : ""} */
        sidebar.setAttribute("data-collapsible", expanded ? "" : "icon");
      }
      triggers().forEach(function (t) {
        t.setAttribute("aria-expanded", expanded ? "true" : "false");
      });
      /* §7-2 — 초기 힌트는 실제 상태가 정해진 뒤에는 역할이 끝났다 */
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

    /* 초기 상태: 쿠키 우선. 쿠키가 없으면 펼침(shadcn defaultOpen=true) */
    var saved = readCookie(SIDEBAR_COOKIE_NAME);
    setSidebarState(saved !== "false", false);

    triggers().forEach(function (trigger) {
      trigger.setAttribute("aria-controls", "sidebar");
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        toggleSidebar();
      });
    });

    /* [의도적 이탈] shadcn SidebarRail의 클릭 토글은 사용자 요청으로 제거했다.
       토글 경로는 sidebar-trigger 클릭과 Ctrl/Cmd+B 두 가지뿐이다. */

    /* §7-8 — Cmd/Ctrl + B. Firefox의 북마크 사이드바와 충돌하므로
       preventDefault()는 필수. 단 입력 필드 안에서는 가로채지 않는다. */
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

    /* 사이드바 검색 — 티스토리 검색 URL 패턴(/search/{키워드})으로 이동.
       [##_search_text_##] 치환자는 우리가 data-slot을 붙일 수 없는 마크업을
       서버가 생성하므로(§7-3과 같은 제약) 폼을 직접 만들고 이동만 시킨다. */
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

  /* ── 테마 토글 ────────────────────────────────────────────────
     Design-system js/components.js 1803–1825행과 동일한 방식:
     <html>의 .dark 클래스 + localStorage.theme.
     아이콘/라벨 전환은 sidebar.css가 [data-theme-when]으로 처리하므로
     여기서는 클래스와 저장만 담당한다. */
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

  /* ── 활성 항목 표시 ──────────────────────────────────────────
     [SPEC §1-2 / §8-Q2] 카테고리를 정적으로 하드코딩(A안)하는 이상
     "지금 어느 카테고리인가"는 마크업만으로 알 수 없다. 티스토리가 주는
     [##_body_id_##]도 페이지 종류만 알려줄 뿐 어느 카테고리인지는 모른다.
     → 현재 경로와 각 링크의 경로를 비교해 가장 길게 일치하는 하나만
        data-active="true"로 둔다. (스펙 A안의 "JS 무의존"에서 벗어나는
        유일한 지점이며, 이게 없으면 활성 표시가 항상 홈에 고정된다.) */
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
