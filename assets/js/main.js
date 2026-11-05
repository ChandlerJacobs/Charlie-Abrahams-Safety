// Shared behaviour: nav toggle, theme, reveal-on-scroll, footer year.
// No inline handlers anywhere, so the CSP can forbid inline script.
(function () {
  "use strict";
  document.documentElement.classList.remove("no-js");

  // Theme (per-viewer convenience only; storage may be unavailable)
  var root = document.documentElement;
  function readTheme() { try { return localStorage.getItem("ma-theme"); } catch (e) { return null; } }
  function saveTheme(v) { try { localStorage.setItem("ma-theme", v); } catch (e) { /* ignore */ } }
  var saved = readTheme();
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  document.addEventListener("DOMContentLoaded", function () {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector(".nav-toggle");
    if (header && toggle) {
      toggle.addEventListener("click", function () {
        var open = header.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && header.classList.contains("open")) {
          header.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
          toggle.focus();
        }
      });
    }

    var themeBtn = document.querySelector(".theme-btn");
    if (themeBtn) {
      var label = function () {
        var cur = root.getAttribute("data-theme") ||
          (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        themeBtn.textContent = cur === "dark" ? "Light mode" : "Dark mode";
        return cur;
      };
      label();
      themeBtn.addEventListener("click", function () {
        var next = label() === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        saveTheme(next);
        label();
        document.dispatchEvent(new CustomEvent("themechange"));
      });
    }

    var y = document.querySelector("[data-year]");
    if (y) y.textContent = String(new Date().getFullYear());

    // Reveal on scroll
    var els = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px" });
      els.forEach(function (el) { io.observe(el); });
    } else {
      els.forEach(function (el) { el.classList.add("in"); });
    }

    // Skill bars
    document.querySelectorAll(".skill-bar .fill[data-w]").forEach(function (f) {
      var w = parseInt(f.getAttribute("data-w"), 10);
      if (!isNaN(w)) setTimeout(function () { f.style.width = Math.max(0, Math.min(100, w)) + "%"; }, 150);
    });
  });
})();
