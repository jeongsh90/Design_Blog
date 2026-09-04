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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initHeaderBreadcrumb);
  } else {
    initHeaderBreadcrumb();
  }
})();
