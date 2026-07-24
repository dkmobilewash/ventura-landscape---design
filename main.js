/* ==========================================================================
   Ventura Landscape & Design — Shared JavaScript
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initStickyHeader();
    initMobileNav();
    initSmoothScroll();
    initFadeIn();
    initActiveNav();
    initContactForm();
  });

  /* ----------------------------------------------------------------------
     Sticky header shadow on scroll
     ---------------------------------------------------------------------- */
  function initStickyHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 12) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ----------------------------------------------------------------------
     Mobile hamburger menu + nested submenu toggles
     ---------------------------------------------------------------------- */
  function initMobileNav() {
    var burger = document.querySelector(".nav-burger");
    var panel = document.querySelector(".mobile-nav");
    if (!burger || !panel) return;

    burger.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });

    // Submenu toggles inside the mobile panel
    var toggles = panel.querySelectorAll(".m-toggle");
    toggles.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var submenu = btn.nextElementSibling;
        var isOpen = btn.classList.toggle("is-open");
        if (submenu) submenu.classList.toggle("is-open", isOpen);
      });
    });

    // Close menu when a real link is tapped
    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        panel.classList.remove("is-open");
        burger.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ----------------------------------------------------------------------
     Smooth scroll for in-page anchor links
     ---------------------------------------------------------------------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === "#" || href.length < 2) return;
      link.addEventListener("click", function (e) {
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ----------------------------------------------------------------------
     Scroll-triggered fade-in using IntersectionObserver
     ---------------------------------------------------------------------- */
  function initFadeIn() {
    var els = document.querySelectorAll(".fade-in");
    if (!els.length) return;

    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    els.forEach(function (el) { observer.observe(el); });
  }

  /* ----------------------------------------------------------------------
     Active nav link highlighting based on current path
     ---------------------------------------------------------------------- */
  function initActiveNav() {
    var path = window.location.pathname;
    var current = path.substring(path.lastIndexOf("/") + 1) || "index.html";
    // Normalize a trailing "/" to index.html
    if (current === "") current = "index.html";

    document.querySelectorAll(".main-nav a, .mobile-nav a").forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href) return;
      var file = href.substring(href.lastIndexOf("/") + 1);
      if (file === current && current !== "") {
        link.classList.add("is-active");
      }
      // Highlight parent dropdown labels by section
      if (path.indexOf("/services/") !== -1 && link.dataset.section === "services") {
        link.classList.add("is-active");
      }
      if (path.indexOf("/locations/") !== -1 && link.dataset.section === "locations") {
        link.classList.add("is-active");
      }
    });
  }

  /* ----------------------------------------------------------------------
     Contact form validation + success state
     ---------------------------------------------------------------------- */
  function initContactForm() {
    var forms = document.querySelectorAll(".js-contact-form");
    forms.forEach(function (form) {
      var success = form.parentNode.querySelector(".form-success");

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var valid = true;
        var requiredFields = form.querySelectorAll("[required]");

        requiredFields.forEach(function (field) {
          var wrap = field.closest(".field");
          var value = (field.value || "").trim();
          var fieldValid = value !== "";

          // Email pattern check
          if (fieldValid && field.type === "email") {
            fieldValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          }

          if (wrap) wrap.classList.toggle("has-error", !fieldValid);
          if (!fieldValid) valid = false;
        });

        if (!valid) {
          var firstError = form.querySelector(".field.has-error");
          if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }

        // Send form data to Zapier webhook
        var formData = {};
        requiredFields.forEach(function (field) {
          if (field.name) formData[field.name] = (field.value || "").trim();
        });
        var messageField = form.querySelector("[name='message']");
        if (messageField) formData.message = (messageField.value || "").trim();
        formData.website = "Ventura Landscape Design";
        formData.submittedAt = new Date().toISOString();
        try {
          fetch("https://hooks.zapier.com/hooks/catch/20117350/44fmixd/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
          });
        } catch (e) {
          console.error("[Zapier Webhook Error]", e);
        }

        // Show success state
        form.style.display = "none";
        if (success) {
          success.classList.add("is-visible");
          success.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });

      // Clear error styling as the user corrects a field
      form.querySelectorAll("[required]").forEach(function (field) {
        field.addEventListener("input", function () {
          var wrap = field.closest(".field");
          if (wrap && wrap.classList.contains("has-error")) {
            wrap.classList.remove("has-error");
          }
        });
      });
    });
  }
})();
