// ==========================================================================
// Interactive Components
// 1. Button Ripple Effect
// 2. Project Detail Modal
// 3. Tooltip Accessibility (keyboard support handled via CSS)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================================
  // 1. BUTTON RIPPLE EFFECT
  // ========================================================================

  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      // Remove any existing ripple
      const existingRipple = this.querySelector('.btn__ripple');
      if (existingRipple) existingRipple.remove();

      // Create ripple element
      const ripple = document.createElement('span');
      ripple.classList.add('btn__ripple');

      // Position ripple at click point
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;

      this.appendChild(ripple);

      // Cleanup after animation
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  // ========================================================================
  // 2. PROJECT DETAIL MODAL
  // ========================================================================

  const modalOverlay = document.querySelector('.modal-overlay');
  const modal = document.querySelector('.modal');
  const modalTitle = document.querySelector('.modal__title');
  const modalImage = document.querySelector('.modal__image');
  const modalMeta = document.querySelector('.modal__meta');
  const modalDescription = document.querySelector('.modal__description');
  const modalCloseBtn = document.querySelector('.modal__close');
  const modalLiveLink = document.querySelector('.modal__link-live');
  const modalCodeLink = document.querySelector('.modal__link-code');

  // Open modal when clicking a project card
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't open if clicking a link inside the card
      if (e.target.closest('a')) return;

      const data = {
        title: card.dataset.title || card.querySelector('.project-card-title')?.textContent || 'Project',
        image: card.dataset.image || card.querySelector('.project-card__thumbnail img')?.src || '',
        tags: card.dataset.tags ? card.dataset.tags.split(',') : [],
        description: card.dataset.description || '',
        liveUrl: card.dataset.liveUrl || '',
        codeUrl: card.dataset.codeUrl || ''
      };

      openModal(data);
    });

    // Make cards keyboard accessible
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View project: ${card.dataset.title || 'details'}`);

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  function openModal(data) {
    if (!modalOverlay) return;

    // Populate modal content
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalImage) {
      modalImage.src = data.image;
      modalImage.alt = data.title;
      modalImage.style.display = data.image ? 'block' : 'none';
    }

    if (modalMeta) {
      modalMeta.innerHTML = data.tags
        .map(tag => `<span class="tag">${tag.trim()}</span>`)
        .join('');
    }

    if (modalDescription) {
      modalDescription.innerHTML = data.description;
    }

    if (modalLiveLink) {
      modalLiveLink.href = data.liveUrl;
      modalLiveLink.style.display = data.liveUrl ? 'inline-flex' : 'none';
    }

    if (modalCodeLink) {
      modalCodeLink.href = data.codeUrl;
      modalCodeLink.style.display = data.codeUrl ? 'inline-flex' : 'none';
    }

    // Show modal
    modalOverlay.classList.add('is-active');
    document.body.classList.add('modal-open');

    // Trap focus inside modal
    trapFocus(modal);

    // Focus close button
    setTimeout(() => modalCloseBtn?.focus(), 100);
  }

  function closeModal() {
    if (!modalOverlay) return;

    modalOverlay.classList.remove('is-active');
    document.body.classList.remove('modal-open');

    // Return focus to the triggering element
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  // Close button
  modalCloseBtn?.addEventListener('click', closeModal);

  // Click outside to close
  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay?.classList.contains('is-active')) {
      closeModal();
    }
  });

  // Focus trap utility
  let lastFocusedElement = null;

  function trapFocus(element) {
    if (!element) return;

    lastFocusedElement = document.activeElement;

    const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusableElements = element.querySelectorAll(focusableSelectors);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', function handleTab(e) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }

      // Remove listener when modal closes
      if (!modalOverlay?.classList.contains('is-active')) {
        element.removeEventListener('keydown', handleTab);
      }
    });
  }

  // ========================================================================
  // 3. MOBILE NAV TOGGLE
  // ========================================================================

  const navToggle = document.querySelector('.navbar__toggle');
  const navLinks = document.querySelector('.navbar__links');

  navToggle?.addEventListener('click', () => {
    navLinks?.classList.toggle('is-open');
    const isOpen = navLinks?.classList.contains('is-open');
    navToggle.setAttribute('aria-expanded', isOpen);
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  // Close nav when clicking a link
  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });
});