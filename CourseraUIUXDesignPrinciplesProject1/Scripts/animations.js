// ==========================================================================
// Scroll-triggered Animations via IntersectionObserver
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll(
    '.portfolio-grid .project-card, ' +
    '.section__header, ' +
    '.contact-layout .contact-info, ' +
    '.contact-layout .contact-form'
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Animate only once
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    }
  );

  animatedElements.forEach((el) => observer.observe(el));
});