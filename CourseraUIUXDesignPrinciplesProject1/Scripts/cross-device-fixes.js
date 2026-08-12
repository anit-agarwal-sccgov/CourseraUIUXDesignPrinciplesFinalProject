// ==========================================================================
// Cross-Device Harmony — JS Fixes & Animation QA
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================================
  // 1. PAGE LOAD — Trigger Hero Animations After Fonts/Images Ready
  // ========================================================================

  const site = document.querySelector('.site');

  // Wait for fonts to load before starting hero animations
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      site?.classList.add('is-loaded');
    });
  } else {
    // Fallback for older browsers
    window.addEventListener('load', () => {
      site?.classList.add('is-loaded');
    });
  }

  // Safety: ensure is-loaded fires within 2 seconds regardless
  setTimeout(() => {
    site?.classList.add('is-loaded');
  }, 2000);

  // ========================================================================
  // 2. INTERSECTION OBSERVER — Unified Scroll Animations
  // ========================================================================

  const animatedElements = document.querySelectorAll(
    '.portfolio-grid .project-card, ' +
    '.section__header, ' +
    '.contact-layout .contact-info, ' +
    '.contact-layout .contact-form'
  );

  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    // Instantly show all animated elements
    animatedElements.forEach(el => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
      }
    );

    animatedElements.forEach(el => observer.observe(el));
  }

  // ========================================================================
  // 3. RESIZE HANDLER — Fix Viewport Issues on Mobile
  // ========================================================================

  // Set CSS custom property for true viewport height (fixes 100vh on mobile)
  function setViewportHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  setViewportHeight();

  // Debounced resize handler
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setViewportHeight, 150);
  });

  // ========================================================================
  // 4. ORIENTATION CHANGE — Reset Animations on Rotate
  // ========================================================================

  window.addEventListener('orientationchange', () => {
    // Short delay for the viewport to settle
    setTimeout(() => {
      setViewportHeight();
    }, 200);
  });

  // ========================================================================
  // 5. NAV SCROLL — Close Mobile Nav on Scroll
  // ========================================================================

  const navLinks = document.querySelector('.navbar__links');
  const navToggle = document.querySelector('.navbar__toggle');

  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;

    // Close mobile nav if user scrolls
    if (Math.abs(currentScrollY - lastScrollY) > 50) {
      if (navLinks?.classList.contains('is-open')) {
        navLinks.classList.remove('is-open');
        navToggle?.setAttribute('aria-expanded', 'false');
      }
    }

    lastScrollY = currentScrollY;
  }, { passive: true });

  // ========================================================================
  // 6. TRANSITION END CLEANUP — Remove will-change After Animations
  // ========================================================================

  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('transitionend', (e) => {
      // Only react to the opacity transition (entrance animation)
      if (e.propertyName === 'opacity' && card.classList.contains('is-visible')) {
        card.style.willChange = 'auto';
      }
    }, { once: true });
  });

  // ========================================================================
  // 7. TEST: Animation Timing Validation (dev mode only)
  // ========================================================================

  if (window.location.search.includes('debug=animations')) {
    console.group('%c🎬 Animation QA Report', 'font-size: 14px; font-weight: bold;');

    // Check all animated elements are visible after scroll
    setTimeout(() => {
      const hidden = document.querySelectorAll('.project-card:not(.is-visible)');
      if (hidden.length > 0) {
        console.warn(`⚠️ ${hidden.length} cards still hidden — check IntersectionObserver threshold`);
      } else {
        console.log('✅ All project cards visible');
      }

      // Check hero animations fired
      const heroLoaded = site?.classList.contains('is-loaded');
      console.log(heroLoaded ? '✅ Hero animations triggered' : '⚠️ Hero still waiting for is-loaded');

      // Check for layout shift
      if (window.PerformanceObserver) {
        const clsEntries = performance.getEntriesByType('layout-shift');
        const totalCLS = clsEntries.reduce((sum, entry) => sum + entry.value, 0);
        console.log(`📐 Cumulative Layout Shift: ${totalCLS.toFixed(4)} ${totalCLS < 0.1 ? '✅' : '⚠️ High CLS'}`);
      }

      // Check transition durations
      const card = document.querySelector('.project-card');
      if (card) {
        const style = getComputedStyle(card);
        console.log(`⏱️ Card transition: ${style.transitionDuration}`);
      }

      console.groupEnd();
    }, 3000);

    // Visual debug: highlight elements as they become visible
    const debugObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const el = mutation.target;
          if (el.classList.contains('is-visible')) {
            el.style.outline = '2px solid lime';
            setTimeout(() => { el.style.outline = ''; }, 1000);
          }
        }
      });
    });

    animatedElements.forEach(el => {
      debugObserver.observe(el, { attributes: true });
    });
  }

  // ========================================================================
  // 8. SMOOTH SCROLL POLYFILL — Safari iOS < 15.4
  // ========================================================================

  if (!('scrollBehavior' in document.documentElement.style)) {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - 64;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }
});