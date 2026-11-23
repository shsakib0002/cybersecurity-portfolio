/* Sakib Hasan portfolio — small, dependency-free progressive enhancement */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Theme toggle (persisted, failure-tolerant)
  var themeBtn = doc.getElementById("themeBtn");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    var next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    var m = doc.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", next === "light" ? "#f6f8fc" : "#0a0f1a");
  });

  // Mobile menu
  var menuBtn = doc.getElementById("menuBtn"), nav = doc.getElementById("navLinks");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") { setMenu(false); menuBtn.focus(); } });
  }

  // Header state, back-to-top, reading progress (rAF-throttled)
  var header = doc.getElementById("header"), toTop = doc.getElementById("toTop"), bar = doc.getElementById("progress");
  var ticking = false;
  function onScroll() {
    var y = window.scrollY, max = root.scrollHeight - window.innerHeight;
    header.classList.toggle("scrolled", y > 24);
    toTop.classList.toggle("show", y > 600);
    if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    ticking = false;
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); });

  // Reveal on scroll
  var items = doc.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduce) {
    items.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  // Scroll-spy for in-page nav links (home page only)
  var spyLinks = Array.prototype.filter.call(doc.querySelectorAll(".nav-links a.link"), function (a) {
    return a.getAttribute("href").indexOf("/#") === 0;
  });
  if (spyLinks.length && "IntersectionObserver" in window && doc.getElementById("experience")) {
    var map = {};
    spyLinks.forEach(function (a) { map[a.getAttribute("href").slice(2)] = a; });
    var clearTop = function () { if (window.scrollY < 200) spyLinks.forEach(function (a) { a.classList.remove("active"); }); };
    window.addEventListener("scroll", clearTop, { passive: true });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          spyLinks.forEach(function (a) { a.classList.remove("active"); });
          if (map[en.target.id]) map[en.target.id].classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { var s = doc.getElementById(id); if (s) spy.observe(s); });
  }

  // Contact form: Netlify Forms via fetch, with an honest fallback
  var form = doc.getElementById("contactForm"), note = doc.getElementById("formNote");
  if (form && note) form.addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = form.querySelector("button[type=submit]");
    btn.disabled = true; note.className = "form-note"; note.textContent = "Sending…";
    var body = new URLSearchParams(new FormData(form)).toString();
    fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body })
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        form.reset(); note.className = "form-note ok";
        note.textContent = "Thanks — your message has been sent. I'll reply by email.";
      })
      .catch(function () {
        note.className = "form-note err";
        note.innerHTML = 'Couldn\'t send right now. Please email <a href="mailto:sakibhasan.infosec@gmail.com">sakibhasan.infosec@gmail.com</a> directly.';
      })
      .then(function () { btn.disabled = false; });
  });
})();
