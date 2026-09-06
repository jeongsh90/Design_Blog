(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


  var smoothEnabled =
    typeof window.gsap !== "undefined" &&
    typeof window.Lenis !== "undefined" &&
    !reducedMotion;

  if (smoothEnabled && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }


  function initSmoothScroll(options) {
    var lenis = new window.Lenis(
      Object.assign(
        {
          smoothWheel: true,
          syncTouch: false,
        },
        options
      )
    );

    function onScroll() {
      if (window.ScrollTrigger) window.ScrollTrigger.update();
    }
    lenis.on("scroll", onScroll);

    function raf(time) {
      lenis.raf(time * 1000);
    }
    window.gsap.ticker.add(raf);
    window.gsap.ticker.lagSmoothing(0);

    return lenis;
  }


  var SCROLLBAR_IDLE_MS = 1000;

  function initScrollbarAutoHide(el, lenis) {
    var idleTimer = 0;

    function hide() {
      idleTimer = 0;
      el.removeAttribute("data-scrolling");
    }

    function onActivity() {
      if (el.getAttribute("data-scrolling") !== "true") {
        el.setAttribute("data-scrolling", "true");
      }
      if (idleTimer) window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(hide, SCROLLBAR_IDLE_MS);
    }

    el.addEventListener("scroll", onActivity, { passive: true });
    if (lenis) lenis.on("scroll", onActivity);
  }

  function init() {
    var sidebarContent = document.querySelector('[data-slot="sidebar-content"]');
    var widgets = document.querySelector('[data-slot="widgets"]');
    var contentInner = document.querySelector('[data-slot="content-inner"]');


    var lenisPairs = [];

    if (smoothEnabled) {

      initSmoothScroll();


      if (sidebarContent) {
        initSmoothScroll({ wrapper: sidebarContent, content: sidebarContent });
      }


      if (widgets) {
        lenisPairs.push([widgets, initSmoothScroll({ wrapper: widgets, content: widgets })]);
      }


      if (contentInner) {
        var contentLenis = initSmoothScroll({
          wrapper: contentInner,
          content: contentInner,
        });
        contentInner.__skinLenis = contentLenis;
        lenisPairs.push([contentInner, contentLenis]);
      }
    }


    if (!reducedMotion) {
      var targets = document.querySelectorAll("[data-custom-scrollbar]");
      Array.prototype.forEach.call(targets, function (el) {
        var lenis = null;
        for (var i = 0; i < lenisPairs.length; i++) {
          if (lenisPairs[i][0] === el) {
            lenis = lenisPairs[i][1];
            break;
          }
        }
        initScrollbarAutoHide(el, lenis);
      });
    }


    if (lenisPairs.length) {
      var resizeAll = function () {
        for (var i = 0; i < lenisPairs.length; i++) lenisPairs[i][1].resize();
      };


      if (typeof MutationObserver !== "undefined") {
        var pendingResize = false;
        var scheduleResize = function () {
          if (pendingResize) return;
          pendingResize = true;
          requestAnimationFrame(function () {
            pendingResize = false;
            resizeAll();
          });
        };
        var mo = new MutationObserver(scheduleResize);
        for (var i = 0; i < lenisPairs.length; i++) {
          mo.observe(lenisPairs[i][0], { childList: true, subtree: true });
        }
      }

      window.addEventListener("load", resizeAll);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(resizeAll);
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
