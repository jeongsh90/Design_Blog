(function () {
  "use strict";

  var FOLDER_CLOSED_SVG =
    '<svg data-slot="folder-icon" data-icon-state="closed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>';
  var FOLDER_OPEN_SVG =
    '<svg data-slot="folder-icon" data-icon-state="open" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/></svg>';
  var FOLDER_ICON_LEAF =
    '<svg data-slot="folder-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>';
  var CHEVRON_SVG =
    '<svg data-slot="chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';

  function escapeHTML(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function cleanText(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }

  function categoryName(anchor) {
    var clone = anchor.cloneNode(true);
    Array.prototype.forEach.call(clone.querySelectorAll(".c_cnt, img"), function (el) {
      el.remove();
    });
    return cleanText(clone.textContent);
  }

  function hasNewIcon(anchor) {
    return !!anchor.querySelector('img[alt="N"]');
  }

  function badgeHTML(anchor) {
    if (!hasNewIcon(anchor)) return "";
    return '<span data-slot="sidebar-menu-badge" data-variant="new" aria-hidden="true"></span>';
  }

  function directAnchor(li) {
    return li.querySelector(":scope > a");
  }

  function buildSubItem(li) {
    var a = directAnchor(li);
    if (!a) return "";
    var name = escapeHTML(categoryName(a));
    var href = a.getAttribute("href") || "#";
    return (
      '<li data-slot="sidebar-menu-sub-item">' +
      '<a href="' + href + '" data-slot="sidebar-menu-sub-button"><span>' + name + "</span></a>" +
      badgeHTML(a) +
      "</li>"
    );
  }

  function buildTopItem(li, index, isDefaultOpen) {
    var a = directAnchor(li);
    if (!a) return "";
    var name = escapeHTML(categoryName(a));
    var href = a.getAttribute("href") || "#";
    var subUl = li.querySelector(":scope > ul.sub_category_list");
    var subLis = subUl
      ? Array.prototype.slice.call(subUl.querySelectorAll(":scope > li"))
      : [];

    if (!subLis.length) {
      return (
        '<li data-slot="sidebar-menu-item">' +
        '<a href="' + href + '" data-slot="sidebar-menu-button" data-tooltip="' + name + '">' +
        FOLDER_ICON_LEAF +
        '<span data-slot="label">' + name + "</span>" +
        "</a>" +
        badgeHTML(a) +
        '<div data-slot="tooltip-content" data-state="closed" data-side="right" role="tooltip">' + name + "</div>" +
        "</li>"
      );
    }

    var subId = "sidebar-submenu-cat-" + index;
    var subItemsHTML = subLis.map(buildSubItem).join("");
    var state = isDefaultOpen ? "open" : "closed";

    return (
      '<li data-slot="sidebar-menu-item">' +
      '<div data-slot="collapsible" data-state="' + state + '">' +
      '<button type="button" data-slot="sidebar-menu-button" data-tooltip="' + name + '" aria-expanded="' + isDefaultOpen + '" aria-controls="' + subId + '">' +
      FOLDER_CLOSED_SVG +
      FOLDER_OPEN_SVG +
      '<span data-slot="label">' + name + "</span>" +
      CHEVRON_SVG +
      "</button>" +
      '<div data-slot="tooltip-content" data-state="closed" data-side="right" role="tooltip">' + name + "</div>" +
      '<div data-slot="sidebar-menu-sub-wrap">' +
      '<ul data-slot="sidebar-menu-sub" id="' + subId + '">' + subItemsHTML + "</ul>" +
      "</div>" +
      "</div>" +
      "</li>"
    );
  }

  function normalizedPath(pathname) {
    return decodeURIComponent(pathname).replace(/\/+$/, "");
  }

  function pathIsUnder(here, href) {
    var path = normalizedPath(href);
    return here === path || here.indexOf(path + "/") === 0;
  }

  function initCategoryMenu() {
    var source = document.getElementById("category-source");
    var target = document.getElementById("sidebar-category-menu");
    if (!source || !target) return;

    var root = source.querySelector("ul.tt_category > li > ul.category_list");
    if (!root) return;

    var topLis = Array.prototype.slice.call(root.querySelectorAll(":scope > li"));
    var here = normalizedPath(window.location.pathname);
    var firstExpandableIndex = -1;
    var activeExpandableIndex = -1;

    for (var i = 0; i < topLis.length; i++) {
      var subUl = topLis[i].querySelector(":scope > ul.sub_category_list");
      if (!subUl || !subUl.querySelector(":scope > li")) continue;
      if (firstExpandableIndex === -1) firstExpandableIndex = i;

      var topAnchor = directAnchor(topLis[i]);
      if (topAnchor && pathIsUnder(here, topAnchor.getAttribute("href") || "")) {
        activeExpandableIndex = i;
      }
    }

    var openIndex = activeExpandableIndex !== -1 ? activeExpandableIndex : firstExpandableIndex;

    target.innerHTML = topLis
      .map(function (li, index) {
        return buildTopItem(li, index, index === openIndex);
      })
      .join("");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCategoryMenu);
  } else {
    initCategoryMenu();
  }
})();
