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


  function initProseTables() {
    var body = document.querySelector('[data-slot="post-single-body"]');
    if (!body) return;

    Array.prototype.forEach.call(body.querySelectorAll("table"), function (table) {
      if (table.getAttribute("data-prose-table") === "wrapped") return;

      var wrap = document.createElement("div");
      wrap.setAttribute("data-slot", "prose-table-wrap");
      wrap.setAttribute("tabindex", "0");

      table.parentNode.insertBefore(wrap, table);
      wrap.appendChild(table);
      table.setAttribute("data-prose-table", "wrapped");
    });
  }


  var HLJS_URL = "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.12.0/build/highlight.min.js";
  var HLJS_LANG = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    md: "markdown",
    sh: "bash",
    yml: "yaml"
  };
  var CODE_COPY_RESET_MS = 2000;
  var CODE_FILENAME_RE = /^\s*(?:\/\/|#|<!--)\s*filename\s*:\s*(.+?)\s*(?:-->)?\s*$/;
  var CODE_LANG_LABELS = {
    js: "JS",
    jsx: "JSX",
    javascript: "JS",
    ts: "TS",
    tsx: "TSX",
    typescript: "TS",
    json: "JSON",
    jsonc: "JSONC",
    html: "HTML",
    xml: "XML",
    css: "CSS",
    scss: "SCSS",
    md: "MD",
    mdx: "MDX",
    markdown: "MD",
    bash: "Bash",
    sh: "Shell",
    shell: "Shell",
    py: "Python",
    python: "Python",
    java: "Java",
    kotlin: "Kotlin",
    swift: "Swift",
    go: "Go",
    rust: "Rust",
    php: "PHP",
    sql: "SQL",
    yaml: "YAML",
    yml: "YAML",
    toml: "TOML",
    diff: "Diff"
  };

  function codeSvg(paths) {
    var box = document.createElement("div");
    box.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true">' +
      paths +
      "</svg>";
    return box.firstChild;
  }

  function codeLanguage(pre, code) {
    var value = pre.getAttribute("data-language") || pre.getAttribute("data-ke-language") || "";
    if (!value) {
      var cls = (code.getAttribute("class") || "") + " " + (pre.getAttribute("class") || "");
      var hit = cls.match(/(?:^|\s)(?:language|lang)-([\w#+.-]+)/);
      if (hit) value = hit[1];
    }
    return value.toLowerCase();
  }

  function codeHighlightSpec(pre, code) {
    var value = pre.getAttribute("data-highlight");
    if (value) return value;
    var cls = (code.getAttribute("class") || "") + " " + (pre.getAttribute("class") || "");
    var hit = cls.match(/\{([\d,\s-]+)\}/);
    return hit ? hit[1] : "";
  }

  function codeHighlightSet(spec) {
    var set = {};
    if (!spec) return set;
    var parts = String(spec).split(",");
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i].replace(/\s+/g, "");
      if (!part) continue;
      var bounds = part.split("-");
      var from = parseInt(bounds[0], 10);
      var to = bounds.length > 1 ? parseInt(bounds[1], 10) : from;
      if (!(from > 0) || !(to > 0)) continue;
      if (to < from) {
        var swap = from;
        from = to;
        to = swap;
      }
      for (var n = from; n <= to; n++) set[n] = true;
    }
    return set;
  }

  function buildCodeFigure(pre, lang, filename) {
    var figure = document.createElement("figure");
    figure.setAttribute("data-rehype-pretty-code-figure", "");
    figure.setAttribute("data-slot", "code-block");
    figure.setAttribute("data-language", lang);

    var caption = document.createElement("figcaption");
    caption.setAttribute("data-rehype-pretty-code-title", "");

    var icon = document.createElement("span");
    icon.setAttribute("data-slot", "code-block-icon");
    icon.appendChild(
      codeSvg(
        '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>' +
          '<path d="M14 2v4a2 2 0 0 0 2 2h4"/>'
      )
    );

    var name = document.createElement("span");
    name.setAttribute("data-slot", "code-block-name");
    name.textContent = filename;

    var copy = document.createElement("button");
    copy.setAttribute("type", "button");
    copy.setAttribute("data-slot", "button");
    copy.setAttribute("data-variant", "ghost");
    copy.setAttribute("data-size", "icon-sm");
    copy.setAttribute("data-code-copy", "");
    copy.setAttribute("aria-label", "코드 복사");

    var idle = codeSvg(
      '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>' +
        '<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>'
    );
    idle.setAttribute("data-copy-when", "idle");
    var done = codeSvg('<path d="M20 6 9 17l-5-5"/>');
    done.setAttribute("data-copy-when", "done");
    copy.appendChild(idle);
    copy.appendChild(done);

    caption.appendChild(icon);
    caption.appendChild(name);
    caption.appendChild(copy);

    pre.parentNode.insertBefore(figure, pre);
    figure.appendChild(pre);
    figure.insertBefore(caption, pre);

    return figure;
  }

  function bindCodeCopy(button, raw, say) {
    var timer = 0;

    function done() {
      button.setAttribute("data-copied", "true");
      say("코드를 복사했습니다");
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        timer = 0;
        button.removeAttribute("data-copied");
      }, CODE_COPY_RESET_MS);
    }

    button.addEventListener("click", function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(raw).then(done, function () {
          say("복사에 실패했습니다");
        });
        return;
      }

      try {
        var ta = document.createElement("textarea");
        ta.value = raw;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done();
      } catch (e) {
        say("복사에 실패했습니다");
      }
    });
  }

  function resolveHljsLang(lang) {
    if (!lang || !window.hljs || !window.hljs.getLanguage) return "";
    if (window.hljs.getLanguage(lang)) return lang;
    var mapped = HLJS_LANG[lang];
    if (mapped && window.hljs.getLanguage(mapped)) return mapped;
    return "";
  }

  function highlightPendingFigures() {
    if (!window.hljs || !window.hljs.highlight) return;
    var figures = document.querySelectorAll(
      '[data-slot="post-single-body"] [data-rehype-pretty-code-figure][data-code-pending]'
    );
    Array.prototype.forEach.call(figures, function (figure) {
      figure.removeAttribute("data-code-pending");
      var lang = resolveHljsLang(figure.getAttribute("data-language") || "");
      var code = figure.querySelector("pre > code");
      if (!code || !lang) return;
      var lines = code.querySelectorAll("[data-line]");
      Array.prototype.forEach.call(lines, function (line) {
        try {
          line.innerHTML = window.hljs.highlight(line.textContent, {
            language: lang,
            ignoreIllegals: true
          }).value;
        } catch (e) {}
      });
    });
  }

  function injectHighlightJs() {
    if (!document.querySelector("[data-rehype-pretty-code-figure][data-code-pending]")) return;
    if (window.hljs && window.hljs.highlight) {
      highlightPendingFigures();
      return;
    }
    if (document.querySelector("script[data-code-hljs]")) return;

    var script = document.createElement("script");
    script.src = HLJS_URL;
    script.async = true;
    script.setAttribute("data-code-hljs", "");
    script.addEventListener("load", highlightPendingFigures);
    script.addEventListener("error", function () {
      var figures = document.querySelectorAll("[data-rehype-pretty-code-figure][data-code-pending]");
      Array.prototype.forEach.call(figures, function (figure) {
        figure.removeAttribute("data-code-pending");
      });
    });
    document.body.appendChild(script);
  }

  function initCodeBlocks() {
    var body = document.querySelector('[data-slot="post-single-body"]');
    if (!body) return;

    var status = document.querySelector("[data-post-status]");
    function say(msg) {
      if (status) status.textContent = msg;
    }

    Array.prototype.forEach.call(body.querySelectorAll("pre"), function (pre) {
      if (pre.getAttribute("data-code-block") === "ready") return;

      var code = pre.querySelector("code");
      if (!code) {
        code = document.createElement("code");
        while (pre.firstChild) code.appendChild(pre.firstChild);
        pre.appendChild(code);
      }

      var lang = codeLanguage(pre, code);
      var prehighlighted = code.hasAttribute("data-line-numbers");
      var filename = pre.getAttribute("data-filename") || pre.getAttribute("title") || "";
      var highlight = codeHighlightSet(codeHighlightSpec(pre, code));
      var raw = "";
      var i;

      if (prehighlighted) {
        var authored = code.querySelectorAll("[data-line]");
        var texts = [];
        Array.prototype.forEach.call(authored, function (line) {
          texts.push(line.textContent);
        });
        raw = texts.join("\n");
      } else {
        raw = code.textContent.replace(/\r\n/g, "\n").replace(/\n$/, "");
        var lines = raw.split("\n");
        if (!filename && lines.length) {
          var hit = lines[0].match(CODE_FILENAME_RE);
          if (hit) {
            filename = hit[1];
            lines.shift();
            raw = lines.join("\n");
          }
        }

        while (code.firstChild) code.removeChild(code.firstChild);
        code.setAttribute("data-line-numbers", "");
        for (i = 0; i < lines.length; i++) {
          var line = document.createElement("span");
          line.setAttribute("data-line", "");
          if (highlight[i + 1]) line.setAttribute("data-highlighted-line", "");
          line.textContent = lines[i];
          code.appendChild(line);
        }
      }

      if (!filename) filename = lang ? CODE_LANG_LABELS[lang] || lang : "code";

      var figure = buildCodeFigure(pre, lang, filename);
      bindCodeCopy(figure.querySelector("[data-code-copy]"), raw, say);

      pre.setAttribute("data-code-block", "ready");
      pre.setAttribute("tabindex", "0");
      pre.setAttribute("data-custom-scrollbar", "");

      if (lang && !prehighlighted) figure.setAttribute("data-code-pending", "");
    });

    injectHighlightJs();
  }


  function initPostTags() {
    var list = document.querySelector('[data-slot="post-tags-list"]');
    if (!list) return;

    var links = list.querySelectorAll("a");
    if (!links.length) return;

    Array.prototype.forEach.call(links, function (a) {
      a.setAttribute("data-slot", "badge");
      a.setAttribute("data-variant", "outline");
    });

    for (var i = list.childNodes.length - 1; i >= 0; i--) {
      var n = list.childNodes[i];
      if (n.nodeType !== 1) list.removeChild(n);
    }

    list.setAttribute("data-tags", "normalized");
  }


  function initPostLike() {
    var btn = document.querySelector("[data-post-like]");
    if (!btn) return;

    var out = btn.querySelector("[data-post-like-count]");
    var KEY = "daitnu-post-like:" + window.location.pathname;
    var on = false;
    try {
      on = localStorage.getItem(KEY) === "1";
    } catch (e) {}

    function paint() {
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.setAttribute("data-liked", on ? "true" : "false");
      if (out) out.textContent = on ? "1" : "0";
    }

    btn.addEventListener("click", function () {
      on = !on;
      try {
        localStorage.setItem(KEY, on ? "1" : "0");
      } catch (e) {}
      paint();
    });

    paint();
  }


  function initPostShare() {
    var status = document.querySelector("[data-post-status]");

    function say(msg) {
      if (status) status.textContent = msg;
    }

    var share = document.querySelector("[data-post-share]");
    if (share && navigator.share) {
      share.removeAttribute("hidden");
      share.addEventListener("click", function () {
        navigator
          .share({
            title: document.title,
            url: window.location.href,
          })
          .catch(function () {});
      });
    }

    var copy = document.querySelector("[data-post-copy]");
    if (!copy) return;

    copy.addEventListener("click", function () {
      var url = window.location.href;
      var done = function () {
        copy.setAttribute("data-copied", "true");
        say("링크를 복사했습니다");
        setTimeout(function () {
          copy.removeAttribute("data-copied");
        }, 1600);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () {
          say("복사에 실패했습니다");
        });
        return;
      }

      try {
        var ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done();
      } catch (e) {
        say("복사에 실패했습니다");
      }
    });
  }


  function initCommentAvatars() {
    var boxes = document.querySelectorAll("[data-comment-logo]");
    if (!boxes.length) return;

    Array.prototype.forEach.call(boxes, function (box) {
      if (box.querySelector("img")) return;
      var text = (box.textContent || "").trim();

      if (!/^(https?:)?\/\/|^data:image\//.test(text)) {
        for (var i = box.childNodes.length - 1; i >= 0; i--) {
          if (box.childNodes[i].nodeType === 3) box.removeChild(box.childNodes[i]);
        }
        return;
      }
      for (var j = box.childNodes.length - 1; j >= 0; j--) {
        if (box.childNodes[j].nodeType === 3) box.removeChild(box.childNodes[j]);
      }
      var img = document.createElement("img");
      img.setAttribute("data-slot", "avatar-image");
      img.setAttribute("alt", "");
      img.setAttribute("loading", "lazy");
      img.src = text;
      box.appendChild(img);
    });
  }

  /* [SPEC 2026-09-05] Dropdown Menu 동작 — Design-system js/components.js의
     initDropdownMenus/closeAllDropdownMenus를 이식(다른 메뉴 타입(select/popover 등)은
     이 스킨에 아직 없어 그 부분은 생략). post-actions의 "더보기(⋯)" 메뉴 하나에 쓰인다. */
  function closeAllDropdownMenus() {
    var menus = document.querySelectorAll('[data-slot="dropdown-menu"]');
    Array.prototype.forEach.call(menus, function (menu) {
      var trigger = menu.querySelector('[data-slot="button"]');
      var content = menu.querySelector('[data-slot="dropdown-menu-content"]');
      if (content) content.setAttribute("data-state", "closed");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  }

  function initDropdownMenus() {
    var menus = document.querySelectorAll('[data-slot="dropdown-menu"]');
    if (!menus.length) return;

    Array.prototype.forEach.call(menus, function (menu) {
      var trigger = menu.querySelector('[data-slot="button"]');
      var content = menu.querySelector('[data-slot="dropdown-menu-content"]');
      if (!trigger || !content) return;

      function getItems() {
        return Array.prototype.slice.call(
          content.querySelectorAll('[data-slot="dropdown-menu-item"]')
        );
      }

      function openMenu() {
        closeAllDropdownMenus();
        content.setAttribute("data-state", "open");
        trigger.setAttribute("aria-expanded", "true");
      }

      function closeMenu() {
        content.setAttribute("data-state", "closed");
        trigger.setAttribute("aria-expanded", "false");
      }

      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (content.getAttribute("data-state") === "open") {
          closeMenu();
        } else {
          openMenu();
          var first = getItems()[0];
          if (first) setTimeout(function () { first.focus(); }, 0);
        }
      });

      trigger.addEventListener("keydown", function (event) {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          openMenu();
          var items = getItems();
          var target = event.key === "ArrowDown" ? items[0] : items[items.length - 1];
          if (target) setTimeout(function () { target.focus(); }, 0);
        }
      });

      content.addEventListener("keydown", function (event) {
        var items = getItems();
        var idx = items.indexOf(document.activeElement);

        if (event.key === "ArrowDown") {
          event.preventDefault();
          var next = items[(idx + 1) % items.length];
          if (next) next.focus();
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          var prev = items[(idx - 1 + items.length) % items.length];
          if (prev) prev.focus();
        } else if (event.key === "Escape") {
          event.stopPropagation();
          closeMenu();
          trigger.focus();
        } else if (event.key === "Tab") {
          closeMenu();
        }
      });

      content.addEventListener("click", function (event) {
        event.stopPropagation();
        if (event.target.closest('[data-slot="dropdown-menu-item"]')) {
          closeMenu();
        }
      });
    });

    document.addEventListener("click", function () {
      closeAllDropdownMenus();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeAllDropdownMenus();
    });
  }

  function init() {
    initPaginationActiveState();
    initSquareGrid();
    initViewToggle();
    initProseTables();
    initCodeBlocks();
    initPostTags();
    initPostLike();
    initPostShare();
    initCommentAvatars();
    initDropdownMenus();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
