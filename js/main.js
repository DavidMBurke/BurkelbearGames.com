/**
 * Burkelbear Games — Main JavaScript
 *
 * Features:
 *  1. Mobile navigation toggle (hamburger menu)
 *  2. Nav background on scroll (.nav--scrolled)
 *  3. Smooth scroll for anchor links
 *  4. Scroll-triggered fade-in via Intersection Observer
 *  5. Active nav link highlighting on scroll
 */

(function () {
  'use strict';

  /* -------------------------------------------------------------------------
     1. Mobile Navigation Toggle
     --------------------------------------------------------------------- */

  const nav          = document.querySelector('.nav');
  const hamburger    = document.querySelector('.nav__hamburger');
  const mobileMenu   = document.querySelector('.nav__mobile');
  const mobileLinks  = document.querySelectorAll('.nav__mobile a');

  if (hamburger && mobileMenu) {

    hamburger.addEventListener('click', function () {
      const isOpen = hamburger.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close mobile menu when a link is clicked
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close mobile menu on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        hamburger.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });

    // Close mobile menu if window is resized to desktop width
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768 && mobileMenu.classList.contains('is-open')) {
        hamburger.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* -------------------------------------------------------------------------
     2. Nav Background on Scroll
     --------------------------------------------------------------------- */

  if (nav) {
    function updateNavBackground() {
      if (window.scrollY > 40) {
        nav.classList.add('nav--scrolled');
      } else {
        nav.classList.remove('nav--scrolled');
      }
    }

    // Run once on load in case page is already scrolled (e.g., browser refresh)
    updateNavBackground();

    window.addEventListener('scroll', updateNavBackground, { passive: true });
  }

  /* -------------------------------------------------------------------------
     3. Smooth Scroll for Anchor Links
     --------------------------------------------------------------------- */

  // Native CSS scroll-behavior: smooth handles most cases, but this JS version
  // provides offset compensation for the fixed nav bar.

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href');

      // Ignore bare "#" links (placeholder hrefs)
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight  = nav ? nav.offsetHeight : 0;
      const targetTop  = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      window.scrollTo({
        top:      targetTop,
        behavior: 'smooth',
      });

      // Update URL without triggering a jump
      history.pushState(null, '', targetId);
    });
  });

  /* -------------------------------------------------------------------------
     4. Scroll-Triggered Fade-In (Intersection Observer)
     --------------------------------------------------------------------- */

  // Add class="fade-in" or class="fade-in-stagger" to any element in HTML
  // to have it animate in when it enters the viewport.

  if ('IntersectionObserver' in window) {

    const fadeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Once animated, no need to observe further
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold:  0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    document.querySelectorAll('.fade-in, .fade-in-stagger').forEach(function (el) {
      fadeObserver.observe(el);
    });

  } else {
    // Fallback: show all elements immediately for browsers without IntersectionObserver
    document.querySelectorAll('.fade-in, .fade-in-stagger').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* -------------------------------------------------------------------------
     5. Active Nav Link Highlighting on Scroll
     --------------------------------------------------------------------- */

  // Maps nav link hrefs to their corresponding sections.
  // Only works on the index page where all sections exist.

  const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');

  if (navLinks.length > 0) {

    const sections = [];

    navLinks.forEach(function (link) {
      const id = link.getAttribute('href');
      if (id && id !== '#') {
        const section = document.querySelector(id);
        if (section) {
          sections.push({ link: link, section: section });
        }
      }
    });

    if (sections.length > 0) {

      function updateActiveLink() {
        const navHeight    = nav ? nav.offsetHeight : 0;
        const scrollMiddle = window.scrollY + navHeight + 100;
        let   activeIndex  = 0;

        sections.forEach(function (item, index) {
          if (item.section.offsetTop <= scrollMiddle) {
            activeIndex = index;
          }
        });

        sections.forEach(function (item, index) {
          item.link.classList.toggle('active', index === activeIndex);
        });
      }

      // Debounced scroll handler for performance
      let scrollTicking = false;
      window.addEventListener('scroll', function () {
        if (!scrollTicking) {
          window.requestAnimationFrame(function () {
            updateActiveLink();
            scrollTicking = false;
          });
          scrollTicking = true;
        }
      }, { passive: true });

      // Initial call
      updateActiveLink();
    }
  }

})();
