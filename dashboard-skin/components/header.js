/* ════════════════════════════════════════════════════════════════
   Header — 브레드크럼 보정
   ────────────────────────────────────────────────────────────────
   기반: D:\MyCloud\2026포트폴리오\Design-system\js\dashboard.js 91–118행
         (updateHeaderBreadcrumb — 상위 크럼과 구분자를 display로 여닫는 방식)
   스펙: _workspace/header_designer-spec.md §3-3

   왜 필요한가:
     헤더 브레드크럼은 [##_title_##](블로그 제목) / [##_page_title_##](페이지 제목)
     2단인데, 홈에서는 티스토리가 두 자리에 같은 값을 넣는다.
     "다잇누 / 다잇누"가 되지 않도록 앞 크럼과 구분자를 접는다.

   원본은 값이 "있을 때" 펴는 방향이고 우리는 "같을 때" 접는 방향이다 —
   서버가 이미 값을 채워 내려주기 때문(JS가 실패해도 내용은 온전하다).
   ════════════════════════════════════════════════════════════════ */
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

    /* 페이지 제목이 비었거나 블로그 제목과 같으면(=홈) 1단으로 접는다 */
    if (!pageText || pageText === text(blog)) {
      blog.style.display = "none";
      sep.style.display = "none";
      if (!pageText) page.textContent = text(blog);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeaderBreadcrumb);
  } else {
    initHeaderBreadcrumb();
  }
})();

/* ════════════════════════════════════════════════════════════════
   Header — 즐겨찾기 토글 (2026-09-02 요청)
   ────────────────────────────────────────────────────────────────
   아직 "글" 콘텐츠 구역이 없어 post id가 없다 — 현재 페이지 경로
   (location.pathname)를 키로 삼아 localStorage에 저장하는 최소 구현.
   목록을 모아 보여주는 화면은 다음 구역(content) 이후 과제로 남긴다.
   ════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var STORAGE_KEY = "dashboard-skin:favorites";

  function readFavorites() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function writeFavorites(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      /* 프라이빗 브라우징 등으로 저장 실패해도 버튼 자체는 계속 토글되게 둔다 */
    }
  }

  function setPressed(btn, on) {
    btn.setAttribute("data-favorited", on ? "true" : "false");
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function initFavoriteToggle() {
    var btn = document.querySelector("[data-favorite-toggle]");
    if (!btn) return;

    var key = location.pathname;
    var favorites = readFavorites();
    setPressed(btn, favorites.indexOf(key) !== -1);

    btn.addEventListener("click", function () {
      var list = readFavorites();
      var idx = list.indexOf(key);
      var nowOn;
      if (idx === -1) {
        list.push(key);
        nowOn = true;
      } else {
        list.splice(idx, 1);
        nowOn = false;
      }
      writeFavorites(list);
      setPressed(btn, nowOn);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFavoriteToggle);
  } else {
    initFavoriteToggle();
  }
})();
