/**
 * ToolsBuddy - Core Application Script (main.js)
 * Zero dependencies, instant execution, vanilla ES6+
 */

(function () {
  'use strict';

  /* ==========================================================================
     Theme Management (Dark / Light)
     ========================================================================== */
  const THEME_STORAGE_KEY = 'tb_theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    updateThemeToggleUI(theme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  function updateThemeToggleUI(theme) {
    const toggleBtns = document.querySelectorAll('.tb-theme-toggle');
    toggleBtns.forEach((btn) => {
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      btn.innerHTML =
        theme === 'dark'
          ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>`
          : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>`;
    });
  }

  // Apply immediately on parse to avoid flash of wrong theme
  applyTheme(getPreferredTheme());

  /* ==========================================================================
     Global Toast Notifications
     ========================================================================== */
  let toastContainer = null;

  function ensureToastContainer() {
    if (!toastContainer) {
      toastContainer = document.querySelector('.tb-toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'tb-toast-container';
        document.body.appendChild(toastContainer);
      }
    }
    return toastContainer;
  }

  window.showToast = function (message, type = 'success', duration = 2800) {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = `tb-toast ${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-danger)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brand-primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'toastOut 0.25s ease forwards';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, duration);
  };

  /* ==========================================================================
     1-Click Clipboard Copy
     ========================================================================== */
  window.copyToClipboard = function (text, successMsg = 'Copied to clipboard!') {
    if (!text && text !== '0') {
      window.showToast('Nothing to copy', 'error');
      return;
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        () => window.showToast(successMsg, 'success'),
        () => fallbackCopy(text, successMsg)
      );
    } else {
      fallbackCopy(text, successMsg);
    }
  };

  function fallbackCopy(text, successMsg) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      window.showToast(successMsg, 'success');
    } catch (err) {
      window.showToast('Failed to copy', 'error');
    }
    document.body.removeChild(textArea);
  }

  /* ==========================================================================
     Safe LocalStorage Wrapper
     ========================================================================== */
  window.tbStorage = {
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    }
  };

  /* ==========================================================================
     DOM Ready Handlers
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    // Attach theme toggle buttons
    document.querySelectorAll('.tb-theme-toggle').forEach((btn) => {
      btn.addEventListener('click', toggleTheme);
    });

    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });
    }

    // Setup FAQ Accordions
    document.querySelectorAll('.tb-faq-trigger').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.tb-faq-item');
        if (!item) return;
        const isOpen = item.classList.contains('open');

        // Optional accordion auto-close siblings
        const parent = item.parentElement;
        if (parent) {
          parent.querySelectorAll('.tb-faq-item.open').forEach((sibling) => {
            if (sibling !== item) sibling.classList.remove('open');
          });
        }

        item.classList.toggle('open', !isOpen);
      });
    });

    // Setup Header Navigation (Desktop Dropdown & Mobile Menu)
    initNavigation();

    // Setup Homepage Search & Filters if present
    initHomepageFilters();
  });

  /* ==========================================================================
     Header Navigation (Desktop Dropdown + Mobile Menu)
     ========================================================================== */
  function initNavigation() {
    // 1. Desktop Dropdown
    const calcDropdown = document.getElementById('tb-calc-dropdown');
    const calcTrigger = document.getElementById('tb-calc-trigger');

    if (calcDropdown && calcTrigger) {
      calcTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = calcDropdown.classList.contains('is-open');
        calcDropdown.classList.toggle('is-open', !isOpen);
        calcTrigger.setAttribute('aria-expanded', String(!isOpen));
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!calcDropdown.contains(e.target)) {
          calcDropdown.classList.remove('is-open');
          calcTrigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // 2. Mobile Navigation Toggle & Backdrop
    const mobileToggle = document.getElementById('tb-mobile-toggle');
    const mobileNav = document.getElementById('tb-mobile-nav');
    const mobileBackdrop = document.getElementById('tb-mobile-backdrop');

    function toggleMobileNav(open) {
      if (!mobileNav || !mobileToggle) return;
      mobileToggle.classList.toggle('is-active', open);
      mobileToggle.setAttribute('aria-expanded', String(open));
      mobileNav.classList.toggle('is-open', open);
      mobileNav.setAttribute('aria-hidden', String(!open));

      if (mobileBackdrop) {
        mobileBackdrop.classList.toggle('is-open', open);
        mobileBackdrop.setAttribute('aria-hidden', String(!open));
      }

      document.body.classList.toggle('tb-menu-open', open);
    }

    if (mobileToggle && mobileNav) {
      mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = mobileNav.classList.contains('is-open');
        toggleMobileNav(!isOpen);
      });

      if (mobileBackdrop) {
        mobileBackdrop.addEventListener('click', () => toggleMobileNav(false));
      }

      // Close menu on link navigation
      mobileNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => toggleMobileNav(false));
      });

      // Auto close on desktop resize
      window.addEventListener('resize', () => {
        if (window.innerWidth > 860 && mobileNav.classList.contains('is-open')) {
          toggleMobileNav(false);
        }
      });
    }

    // 3. Mobile Calculators Accordion
    const mobileCalcToggle = document.getElementById('tb-mobile-calc-toggle');
    const mobileCalcAccordion = document.getElementById('tb-mobile-calc-accordion');

    if (mobileCalcToggle && mobileCalcAccordion) {
      mobileCalcToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isExpanded = mobileCalcAccordion.classList.contains('is-expanded');
        mobileCalcAccordion.classList.toggle('is-expanded', !isExpanded);
        mobileCalcToggle.setAttribute('aria-expanded', String(!isExpanded));
      });
    }

    // 4. Global Esc Key Listener to close all open menus
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (calcDropdown) {
          calcDropdown.classList.remove('is-open');
          if (calcTrigger) calcTrigger.setAttribute('aria-expanded', 'false');
        }
        toggleMobileNav(false);
      }
    });
  }

  /* ==========================================================================
     Homepage Search & Category Filter
     ========================================================================== */
  function initHomepageFilters() {
    const searchInput = document.getElementById('tb-search-input');
    const clearBtn = document.getElementById('tb-search-clear');
    const filterPills = document.querySelectorAll('.tb-filter-pill');
    const toolCards = document.querySelectorAll('.tb-card');
    const emptyState = document.getElementById('tb-empty-state');

    if (!searchInput && !filterPills.length) return;

    let activeCategory = 'all';
    let searchQuery = '';

    function filterTools() {
      let visibleCount = 0;
      const q = searchQuery.trim().toLowerCase();

      toolCards.forEach((card) => {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const desc = (card.getAttribute('data-desc') || '').toLowerCase();
        const category = (card.getAttribute('data-category') || '').toLowerCase();
        const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();

        const matchesCat = activeCategory === 'all' || category === activeCategory;
        const matchesQuery = !q || title.includes(q) || desc.includes(q) || keywords.includes(q);

        if (matchesCat && matchesQuery) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (emptyState) {
        if (visibleCount === 0) {
          emptyState.style.display = 'block';
          if (q.length > 1 && window.TB_TOOLS_INDEX) {
            const matches = window.TB_TOOLS_INDEX.filter(item =>
              item.title.toLowerCase().includes(q) ||
              item.desc.toLowerCase().includes(q) ||
              (item.keywords && item.keywords.some(k => k.toLowerCase().includes(q)))
            ).slice(0, 6);

            if (matches.length > 0) {
              emptyState.innerHTML = `
                <div class="tb-empty-title" style="margin-bottom: 0.25rem;">Directory Matches (${matches.length})</div>
                <div class="tb-empty-desc" style="margin-bottom: 1.25rem;">Found in our extended 200+ calculator directory:</div>
                <div style="display: flex; flex-direction: column; gap: 0.6rem; max-width: 480px; margin: 0 auto; text-align: left;">
                  ${matches.map(m => `
                    <a href="${m.url}" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); text-decoration: none; color: inherit; transition: border-color 0.15s ease;" onmouseover="this.style.borderColor='var(--brand-primary)'" onmouseout="this.style.borderColor='var(--border-color)'">
                      <div>
                        <div style="font-weight: 700; color: var(--brand-primary); font-size: 0.95rem;">${m.title}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">${m.category} &bull; ${m.status === 'active' ? 'Live Tool' : 'Directory Entry'}</div>
                      </div>
                      <span style="font-size: 0.9rem; font-weight: 700; color: var(--brand-primary);">&rarr;</span>
                    </a>
                  `).join('')}
                </div>
              `;
            } else {
              emptyState.innerHTML = `
                <svg class="tb-empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <div class="tb-empty-title">No matching tools found</div>
                <div class="tb-empty-desc">Try searching for keywords like "mortgage", "calorie", "compound", "loan", "percentage", or "date".</div>
              `;
            }
          }
        } else {
          emptyState.style.display = 'none';
        }
      }

      if (clearBtn) {
        clearBtn.classList.toggle('visible', q.length > 0);
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        filterTools();
      });

      // Keyboard shortcut '/' to focus search
      document.addEventListener('keydown', (e) => {
        if (
          e.key === '/' &&
          document.activeElement !== searchInput &&
          !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)
        ) {
          e.preventDefault();
          searchInput.focus();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
          searchQuery = '';
          searchInput.focus();
          filterTools();
        }
      });
    }

    filterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        filterPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        activeCategory = pill.getAttribute('data-filter') || 'all';
        filterTools();
      });
    });
  }

  /* ==========================================================================
     Smart Header (Non-sticky on scroll down, reveals on scroll back up)
     ========================================================================== */
  const siteHeader = document.querySelector('.tb-header, .site-header');
  if (siteHeader && !document.querySelector('.sticky-nav')) {
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
    let ticking = false;
    const threshold = 8;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
          const diff = currentScrollY - lastScrollY;

          if (document.body.classList.contains('tb-menu-open')) {
            siteHeader.classList.remove('tb-header-hidden');
            return;
          }

          if (currentScrollY <= 15) {
            // Near top of document -> always visible
            siteHeader.classList.remove('tb-header-hidden');
          } else if (diff > threshold && currentScrollY > 70) {
            // Scrolling down -> hide header
            siteHeader.classList.add('tb-header-hidden');
          } else if (diff < -threshold) {
            // Scrolling up -> reveal header
            siteHeader.classList.remove('tb-header-hidden');
          }

          lastScrollY = Math.max(0, currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
})();
