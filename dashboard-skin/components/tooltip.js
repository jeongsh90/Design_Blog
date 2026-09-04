(function () {
  "use strict";

  var EDGE_MARGIN = 8;

  function closeAllTooltips(exceptContent) {
    document.querySelectorAll('[data-slot="tooltip-content"][data-state="open"]').forEach(function (content) {
      if (content === exceptContent) return;
      content.setAttribute("data-state", "closed");
    });
  }


  function fitToViewport(content) {
    content.removeAttribute("data-align");
    var rect = content.getBoundingClientRect();
    if (rect.right > window.innerWidth - EDGE_MARGIN) {
      content.setAttribute("data-align", "end");
    } else if (rect.left < EDGE_MARGIN) {
      content.setAttribute("data-align", "start");
    }
  }


  function bindTooltip(trigger, content, options) {
    options = options || {};
    var delayContainer = options.delayContainer || trigger;
    var boundaryContainer = options.boundaryContainer || trigger.parentElement;

    var delay = parseInt(delayContainer.getAttribute("data-delay-duration") || "0", 10);
    var sideOffset = delayContainer.getAttribute("data-side-offset") || content.getAttribute("data-side-offset") || "0";
    content.style.setProperty("--tooltip-side-offset", sideOffset + "px");

    if (!content.getAttribute("data-side")) {
      content.setAttribute("data-side", "top");
    }

    if (!content.querySelector('[data-slot="tooltip-arrow"]')) {
      var arrow = document.createElement("span");
      arrow.setAttribute("data-slot", "tooltip-arrow");
      arrow.setAttribute("aria-hidden", "true");
      content.appendChild(arrow);
    }

    var showTimer = null;

    function collapsedOk() {
      if (!options.onlyWhenCollapsed) return true;
      var wrapper = document.querySelector('[data-slot="sidebar-wrapper"]');
      return !wrapper || wrapper.getAttribute("data-state") === "collapsed";
    }

    function show() {
      if (!collapsedOk()) return;
      clearTimeout(showTimer);
      showTimer = setTimeout(function () {
        closeAllTooltips(content);
        content.setAttribute("data-state", "open");
        requestAnimationFrame(function () {
          fitToViewport(content);
        });
      }, delay);
    }

    function hide() {
      clearTimeout(showTimer);
      content.setAttribute("data-state", "closed");
    }

    trigger.addEventListener("mouseenter", show);
    trigger.addEventListener("mouseleave", hide);
    trigger.addEventListener("focusin", show);
    trigger.addEventListener("focusout", function (event) {
      if (!boundaryContainer || !boundaryContainer.contains(event.relatedTarget)) hide();
    });

    trigger.addEventListener("keydown", function (event) {
      if (event.key === "Escape") hide();
    });
  }

  function initTooltips() {

    document.querySelectorAll('[data-slot="tooltip"]').forEach(function (tooltip) {
      if (tooltip.dataset.tooltipBound === "true") return;
      tooltip.dataset.tooltipBound = "true";

      var trigger = tooltip.querySelector('[data-slot="tooltip-trigger"]');
      var content = tooltip.querySelector('[data-slot="tooltip-content"]');
      if (!trigger || !content) return;

      bindTooltip(trigger, content, { delayContainer: tooltip, boundaryContainer: tooltip });
    });


    document.querySelectorAll('[data-slot="sidebar-menu-button"][data-tooltip]').forEach(function (trigger) {
      if (trigger.dataset.tooltipBound === "true") return;
      trigger.dataset.tooltipBound = "true";

      var host = trigger.parentElement;
      var content = host && host.querySelector(':scope > [data-slot="tooltip-content"]');
      if (!content) return;

      bindTooltip(trigger, content, { boundaryContainer: host, onlyWhenCollapsed: true });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTooltips);
  } else {
    initTooltips();
  }
})();
