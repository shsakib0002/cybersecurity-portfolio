/* Premium motion system — lightweight, accessible, and dependency-free. */
(() => {
  const initMotion = () => {
    const reducedMotion = Boolean(
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

    // Thin reading-progress indicator. It updates only while scrolling/resizing.
    const progress = document.createElement("div");
    progress.className = "scroll-progress";
    progress.setAttribute("aria-hidden", "true");
    const progressFill = document.createElement("span");
    progress.appendChild(progressFill);
    document.body.prepend(progress);

    let progressFrame = 0;
    const updateProgress = () => {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = scrollableHeight > 0
        ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight))
        : 0;
      progressFill.style.transform = `scaleX(${percentage})`;
      progressFrame = 0;
    };
    const requestProgressUpdate = () => {
      if (!progressFrame) progressFrame = window.requestAnimationFrame(updateProgress);
    };
    window.addEventListener("scroll", requestProgressUpdate, { passive: true });
    window.addEventListener("resize", requestProgressUpdate, { passive: true });
    updateProgress();

    if (reducedMotion || !("IntersectionObserver" in window)) return;

    // Reveal only meaningful content blocks; stagger cards within each visual group.
    const revealNodes = new Set();
    const revealSelectors = [
      "main .section-header",
      "main .about-text",
      "main .professional-focus",
      "main .card",
      "main .domain-card",
      "main .career-highlight",
      "main .experience-item",
      "main .cert-card",
      "main .project-card",
      "main .experience-detail",
      "main .research-feature",
      "main .research-highlight",
      "main .publication-card",
      "main .pipeline-card",
      "main .resume-section",
      "main .contact-info",
      "main .contact-form"
    ];

    revealSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => revealNodes.add(element));
    });

    const staggerGroups = [
      "main .skills-grid",
      "main .domain-grid",
      "main .career-highlights-grid",
      "main .experience-timeline",
      "main .projects-grid",
      "main .cert-grid",
      "main .pipeline-grid",
      "main .research-meta-grid",
      "main .blog-grid"
    ];
    staggerGroups.forEach((selector) => {
      document.querySelectorAll(selector).forEach((group) => {
        Array.from(group.children).forEach((element, index) => {
          element.style.setProperty("--motion-delay", `${Math.min(index, 4) * 75}ms`);
          revealNodes.add(element);
        });
      });
    });

    const observer = new IntersectionObserver((entries, activeObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        activeObserver.unobserve(entry.target);
      });
    }, {
      threshold: 0.08,
      rootMargin: "0px 0px -32px 0px"
    });

    revealNodes.forEach((element) => {
      element.classList.add("motion-reveal");
      observer.observe(element);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMotion, { once: true });
  } else {
    initMotion();
  }
})();
