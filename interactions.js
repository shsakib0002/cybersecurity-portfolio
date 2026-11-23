(() => {
  const doc = document;
  const root = doc.documentElement;
  const body = doc.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  const revealSelector = [
    '#main',
    'main > section',
    'body > section',
    '.card',
    '.project-card',
    '.experience-item',
    '.experience-detail',
    '.pipeline-card',
    '.capability-card',
    '.domain-card',
    '.skill-card',
    '.cert-card',
    '.question-list > div',
    '.metric-grid > div',
    '.publication-card'
  ].join(',');

  const revealItems = [...new Set([...doc.querySelectorAll(revealSelector)])];
  revealItems.forEach((item, index) => {
    item.classList.add('reveal-target');
    item.style.setProperty('--reveal-delay', `${Math.min(index % 5, 4) * 55}ms`);
  });

  const reveal = (item) => item.classList.add('reveal-visible');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(reveal);
  } else {
    const observer = new IntersectionObserver((entries, observerInstance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          reveal(entry.target);
          observerInstance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -44px 0px' });
    revealItems.forEach((item) => observer.observe(item));
    window.setTimeout(() => revealItems.forEach(reveal), 1200);
  }

  const progress = doc.querySelector('.reading-progress') || (() => {
    const bar = doc.createElement('div');
    bar.className = 'reading-progress';
    bar.setAttribute('aria-hidden', 'true');
    body.prepend(bar);
    return bar;
  })();

  let ticking = false;
  const updateScrollUI = () => {
    const scrollable = doc.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0})`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollUI);
      ticking = true;
    }
  }, { passive: true });
  updateScrollUI();

  const projectCards = [...doc.querySelectorAll('.project-card')];
  const filterButtons = [...doc.querySelectorAll('.filter-btn')];
  if (projectCards.length && filterButtons.length) {
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter || 'all';
        filterButtons.forEach((item) => {
          const active = item === button;
          item.classList.toggle('active', active);
          item.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        projectCards.forEach((card) => {
          const matches = filter === 'all' || (card.dataset.category || '').split(/\s+/).includes(filter);
          if (matches) {
            card.style.display = '';
            requestAnimationFrame(() => {
              card.classList.remove('is-filtered-out');
              card.classList.remove('reveal-visible');
              window.setTimeout(() => reveal(card), reduceMotion ? 0 : 60);
            });
          } else {
            card.classList.add('is-filtered-out');
            window.setTimeout(() => { card.style.display = 'none'; }, reduceMotion ? 0 : 240);
          }
        });
      });
    });
  }

  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    const cursorSpot = doc.createElement('div');
    cursorSpot.className = 'cursor-spot';
    cursorSpot.setAttribute('aria-hidden', 'true');
    body.append(cursorSpot);
    window.addEventListener('pointermove', (event) => {
      cursorSpot.style.setProperty('--cursor-x', `${event.clientX}px`);
      cursorSpot.style.setProperty('--cursor-y', `${event.clientY}px`);
    }, { passive: true });
  }

  if (!reduceMotion) {
    doc.querySelectorAll('a[href$=".html"], a[href="index.html"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
        const target = new URL(link.href, window.location.href);
        if (target.origin !== window.location.origin || target.pathname === window.location.pathname) return;
        event.preventDefault();
        body.classList.add('is-leaving');
        window.setTimeout(() => { window.location.href = link.href; }, 170);
      });
    });
  }
})();
