(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  /* ---------------- Mobile nav ---------------- */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var mobileNav = document.getElementById("mobile-nav");
  var lastFocused = null;

  function openNav() {
    if (!mobileNav) return;
    lastFocused = document.activeElement;
    mobileNav.setAttribute("data-open", "true");
    navToggle.setAttribute("aria-expanded", "true");
    var firstLink = mobileNav.querySelector("a, button");
    if (firstLink) firstLink.focus();
    document.addEventListener("keydown", onNavKeydown);
  }

  function closeNav() {
    if (!mobileNav) return;
    mobileNav.setAttribute("data-open", "false");
    navToggle.setAttribute("aria-expanded", "false");
    document.removeEventListener("keydown", onNavKeydown);
    if (lastFocused) lastFocused.focus();
  }

  function onNavKeydown(e) {
    if (e.key === "Escape") {
      closeNav();
      return;
    }
    if (e.key === "Tab") {
      var focusable = mobileNav.querySelectorAll("a, button");
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", openNav);
    mobileNav.querySelectorAll("[data-nav-close]").forEach(function (el) {
      el.addEventListener("click", closeNav);
    });
  }

  /* ---------------- Carousel ---------------- */
  document.querySelectorAll("[data-carousel]").forEach(function (carousel) {
    var track = carousel.querySelector("[data-carousel-track]");
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-slide]"));
    var prevBtn = carousel.querySelector("[data-carousel-prev]");
    var nextBtn = carousel.querySelector("[data-carousel-next]");
    var status = carousel.querySelector("[data-carousel-status]");
    var thumbs = Array.prototype.slice.call(carousel.querySelectorAll("[data-carousel-thumb]"));
    var playBtn = carousel.querySelector("[data-carousel-playpause]");
    var playLabel = carousel.querySelector("[data-carousel-playpause-label]");
    if (!track || slides.length === 0) return;

    var current = 0;
    var autoplay = carousel.getAttribute("data-autoplay") === "true";
    var interval = parseInt(carousel.getAttribute("data-interval"), 10) || 5;
    var timer = null;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function goTo(index, opts) {
      opts = opts || {};
      current = (index + slides.length) % slides.length;
      var slide = slides[current];
      track.scrollTo({ left: slide.offsetLeft, behavior: opts.silent ? "auto" : "smooth" });
      updateUI();
    }

    function updateUI() {
      if (status) status.textContent = "Photo " + (current + 1) + " of " + slides.length;
      thumbs.forEach(function (thumb, i) {
        var active = i === current;
        thumb.setAttribute("aria-current", active ? "true" : "false");
        thumb.setAttribute("aria-selected", active ? "true" : "false");
      });
    }

    function next() {
      goTo(current + 1);
    }
    function prev() {
      goTo(current - 1);
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); stopAutoplay(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { next(); stopAutoplay(); });

    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener("click", function () {
        goTo(i);
        stopAutoplay();
      });
    });

    // Keep thumb/status state in sync when the user swipes/scrolls manually.
    var scrollDebounce;
    track.addEventListener("scroll", function () {
      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(function () {
        var trackRect = track.getBoundingClientRect();
        var closest = 0;
        var closestDist = Infinity;
        slides.forEach(function (slide, i) {
          var rect = slide.getBoundingClientRect();
          var dist = Math.abs(rect.left - trackRect.left);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        current = closest;
        updateUI();
      }, 120);
    });

    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { next(); stopAutoplay(); }
      if (e.key === "ArrowLeft") { prev(); stopAutoplay(); }
    });

    function startAutoplay() {
      if (!autoplay || reducedMotion) return;
      timer = setInterval(next, interval * 1000);
    }
    function stopAutoplay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
        if (playBtn) {
          playBtn.setAttribute("aria-pressed", "false");
          if (playLabel) playLabel.textContent = "Play";
        }
      }
    }
    if (playBtn) {
      playBtn.addEventListener("click", function () {
        if (timer) {
          stopAutoplay();
        } else {
          startAutoplay();
          playBtn.setAttribute("aria-pressed", "true");
          if (playLabel) playLabel.textContent = "Pause";
        }
      });
      carousel.addEventListener("mouseenter", function () { if (timer) stopAutoplay(); });
      carousel.addEventListener("focusin", function () { if (timer) stopAutoplay(); });
    }
    startAutoplay();

    // Lightbox
    var lightbox = document.querySelector("[data-lightbox]");
    if (lightbox) {
      var lightboxImg = lightbox.querySelector("[data-lightbox-img]");
      var lightboxCaption = lightbox.querySelector("[data-lightbox-caption]");
      var lightboxClose = lightbox.querySelector("[data-lightbox-close]");
      var lastLightboxFocus = null;

      slides.forEach(function (slide) {
        var img = slide.querySelector("img");
        if (!img) return;
        slide.style.cursor = "zoom-in";
        slide.addEventListener("click", function () {
          lastLightboxFocus = document.activeElement;
          lightboxImg.src = img.currentSrc || img.src;
          lightboxImg.alt = img.alt;
          var captionEl = slide.querySelector("figcaption");
          lightboxCaption.textContent = captionEl ? captionEl.textContent : img.alt;
          lightbox.setAttribute("data-open", "true");
          lightbox.setAttribute("aria-hidden", "false");
          lightboxClose.focus();
          stopAutoplay();
        });
      });

      function closeLightbox() {
        lightbox.setAttribute("data-open", "false");
        lightbox.setAttribute("aria-hidden", "true");
        lightboxImg.src = "";
        if (lastLightboxFocus) lastLightboxFocus.focus();
      }
      lightboxClose.addEventListener("click", closeLightbox);
      lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) closeLightbox();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && lightbox.getAttribute("data-open") === "true") closeLightbox();
      });
    }
  });

  /* ---------------- Click-to-load map ---------------- */
  document.querySelectorAll("[data-map-load]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var embed = document.querySelector("[data-map-embed]");
      if (!embed) return;
      var iframe = embed.querySelector("iframe");
      if (iframe && !iframe.src.startsWith("http")) {
        iframe.src = iframe.getAttribute("data-map-src");
      }
      embed.setAttribute("data-loaded", "true");
    });
  });

  /* ---------------- GA4 lead-click tracking ---------------- */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-cta]");
    if (!el || typeof window.gtag !== "function") return;
    window.gtag("event", "generate_lead", {
      method: el.getAttribute("data-cta"),
      cta_location: el.getAttribute("data-cta-location") || "unknown",
    });
  });
})();
