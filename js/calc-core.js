/**
 * ToolsBuddy - Universal Calculator Core Engine (calc-core.js)
 * High-performance, zero-dependency controller providing:
 * - Reactive real-time calculation pipeline with debouncing
 * - Global Currency Switcher ($, €, £, ₦, ₹, C$, A$, ¥)
 * - Metric / Imperial Unit Synchronization
 * - URL Query State Serialization & 1-Click Share
 * - CSV Table Exporter & Text Summary Generator
 * - Preset Scenarios Manager
 */

(function (window, document) {
  'use strict';

  const CalcCore = {
    // Supported Currencies
    currencies: [
      { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
      { code: 'EUR', symbol: '€', name: 'Euro (€)' },
      { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
      { code: 'NGN', symbol: '₦', name: 'Nigerian Naira (₦)' },
      { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
      { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar (C$)' },
      { code: 'AUD', symbol: 'A$', name: 'Australian Dollar (A$)' },
      { code: 'JPY', symbol: '¥', name: 'Japanese Yen (¥)' }
    ],

    currentCurrency: '$',
    STORAGE_KEY_CURRENCY: 'tb_currency',

    init() {
      this.initCurrency();
      this.initNumberInputs();
      this.initUrlState();
      this.initSliders();
    },

    /**
     * Initializes Currency Switcher
     */
    initCurrency() {
      const saved = localStorage.getItem(this.STORAGE_KEY_CURRENCY);
      if (saved) {
        this.currentCurrency = saved;
      }
      this.updateCurrencyUI(this.currentCurrency);

      // Bind all currency selectors if present on page
      const selectors = document.querySelectorAll('.tb-currency-select');
      selectors.forEach(sel => {
        sel.value = this.currentCurrency;
        sel.addEventListener('change', (e) => {
          this.setCurrency(e.target.value);
        });
      });

      if (saved && saved !== '$') {
        window.dispatchEvent(new CustomEvent('tb:currency-change', { detail: { symbol: saved } }));
      }
    },

    setCurrency(symbol) {
      this.currentCurrency = symbol;
      localStorage.setItem(this.STORAGE_KEY_CURRENCY, symbol);
      this.updateCurrencyUI(symbol);

      // Trigger recalculation event if active calculator exists
      window.dispatchEvent(new CustomEvent('tb:currency-change', { detail: { symbol } }));
    },

    updateCurrencyUI(symbol) {
      // Update all prefix spans
      document.querySelectorAll('.tb-input-prefix[data-currency]').forEach(el => {
        el.textContent = symbol;
      });
      // Update label hints
      document.querySelectorAll('.tb-currency-symbol').forEach(el => {
        el.textContent = symbol;
      });
      // Synchronize any dropdowns
      document.querySelectorAll('.tb-currency-select').forEach(sel => {
        sel.value = symbol;
      });
    },

    /**
     * Format a number as currency using the active symbol
     */
    formatCurrency(amount, decimals = 2) {
      if (isNaN(amount) || amount === null) return `${this.currentCurrency}0.00`;
      const formatted = Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
      return `${this.currentCurrency}${formatted}`;
    },

    /**
     * Format integer with thousands commas
     */
    formatNumber(num, decimals = 0) {
      if (isNaN(num) || num === null) return '0';
      return Number(num).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    },

    /**
     * Parses a string or number safely, removing comma separators
     */
    parseNumber(val) {
      if (typeof val === 'number') return isNaN(val) ? 0 : val;
      if (val === null || val === undefined) return 0;
      const clean = String(val).replace(/,/g, '').trim();
      const num = parseFloat(clean);
      return isNaN(num) ? 0 : num;
    },

    /**
     * Format a raw string or number with thousands commas while preserving decimals
     */
    formatNumberString(val) {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/,/g, '').trim();
      if (str === '' || str === '-') return str;

      const isNegative = str.startsWith('-');
      const unsigned = isNegative ? str.substring(1) : str;
      const parts = unsigned.split('.');

      let integerPart = parts[0].replace(/\D/g, '');
      if (integerPart !== '') {
        if (/^0+$/.test(integerPart)) {
          integerPart = '0';
        } else {
          integerPart = Number(integerPart).toLocaleString('en-US');
        }
      }

      const decimalPart = parts.length > 1 ? '.' + parts[1].replace(/\D/g, '') : '';
      return (isNegative ? '-' : '') + integerPart + decimalPart;
    },

    /**
     * Attach dynamic live comma formatting with cursor preservation to an input
     */
    attachNumberFormatter(input) {
      if (!input || input._tbFormatted) return;
      input._tbFormatted = true;

      // Switch to text type so browser native controls permit comma characters
      if (input.type === 'number') {
        input.type = 'text';
      }
      input.inputMode = 'decimal';
      input.autocomplete = 'off';

      // Format initial value if present
      if (input.value && input.value !== '') {
        input.value = this.formatNumberString(input.value);
      }

      // Live formatting as user types with cursor preservation
      input.addEventListener('input', () => {
        const oldVal = input.value;
        const oldCursor = input.selectionStart || 0;

        // Count how many non-comma characters were before cursor
        const digitsBefore = oldVal.slice(0, oldCursor).replace(/,/g, '').length;

        const formatted = CalcCore.formatNumberString(oldVal);
        input.value = formatted;

        // Restore cursor position matching same digit count
        let newCursor = 0;
        let counted = 0;
        for (let i = 0; i < formatted.length; i++) {
          if (formatted[i] !== ',') {
            counted++;
          }
          if (counted === digitsBefore) {
            newCursor = i + 1;
            break;
          }
        }
        if (digitsBefore === 0) newCursor = 0;
        if (newCursor > formatted.length) newCursor = formatted.length;

        try {
          input.setSelectionRange(newCursor, newCursor);
        } catch (e) {}
      });

      // Cleanup on blur
      input.addEventListener('blur', () => {
        if (input.value.endsWith('.')) {
          input.value = input.value.slice(0, -1);
        }
      });
    },

    /**
     * Initialize number input formatting across the page
     */
    initNumberInputs() {
      // 1. Any input inside an input group with currency prefix
      document.querySelectorAll('.tb-input-prefix[data-currency]').forEach(prefix => {
        const group = prefix.closest('.tb-input-group');
        if (group) {
          const inp = group.querySelector('input');
          if (inp && !inp.hasAttribute('data-no-format')) {
            this.attachNumberFormatter(inp);
          }
        }
      });

      // 2. Explicitly tagged inputs
      document.querySelectorAll('input[data-format="number"], input.tb-format-number, input[data-type="currency"]').forEach(inp => {
        this.attachNumberFormatter(inp);
      });
    },

    /**
     * Connect dual-bound slider and number input
     */
    initSliders() {
      document.querySelectorAll('.tb-slider-group').forEach(group => {
        const slider = group.querySelector('input[type="range"]');
        const numInput = group.querySelector('input[type="number"]');
        if (!slider || !numInput) return;

        slider.addEventListener('input', () => {
          numInput.value = slider.value;
          numInput.dispatchEvent(new Event('input', { bubbles: true }));
        });

        numInput.addEventListener('input', () => {
          slider.value = numInput.value;
        });
      });
    },

    /**
     * Debounced Reactive Calculation Listener
     * Automatically triggers calculate callback on input changes
     */
    bindReactive(formSelector, calculateFn, debounceMs = 120) {
      const form = typeof formSelector === 'string' ? document.querySelector(formSelector) : formSelector;
      if (!form) return;

      let timer = null;
      const handler = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          try {
            calculateFn();
          } catch (err) {
            console.error('Calculation error:', err);
          }
        }, debounceMs);
      };

      form.addEventListener('input', handler);
      form.addEventListener('change', handler);

      // Listen for currency changes
      window.addEventListener('tb:currency-change', () => {
        calculateFn();
      });

      // Run initial calculation
      calculateFn();
    },

    /**
     * Synchronize Form Inputs with URL Query Parameters
     */
    initUrlState() {
      const params = new URLSearchParams(window.location.search);
      if (params.toString() === '') return;

      params.forEach((value, key) => {
        const input = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
        if (input) {
          if (input.type === 'checkbox') {
            input.checked = value === '1' || value === 'true';
          } else if (input.type === 'radio') {
            const radio = document.querySelector(`[name="${key}"][value="${value}"]`);
            if (radio) radio.checked = true;
          } else {
            input.value = value;
          }
        }
      });
    },

    /**
     * Generate Shareable URL with Form Values
     */
    getShareUrl(formSelector) {
      const form = typeof formSelector === 'string' ? document.querySelector(formSelector) : formSelector;
      if (!form) return window.location.href;

      const params = new URLSearchParams();
      const elements = form.querySelectorAll('input, select, textarea');

      elements.forEach(el => {
        if (!el.id && !el.name) return;
        const key = el.id || el.name;
        if (el.type === 'checkbox') {
          if (el.checked) params.set(key, '1');
        } else if (el.type === 'radio') {
          if (el.checked) params.set(key, el.value);
        } else if (el.value !== '') {
          params.set(key, el.value);
        }
      });

      const url = new URL(window.location.href);
      url.search = params.toString();
      return url.toString();
    },

    /**
     * Copy Shareable URL to Clipboard with Toast Notification
     */
    copyShareUrl(formSelector) {
      const url = this.getShareUrl(formSelector);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          if (window.showToast) {
            window.showToast('Calculation link copied to clipboard! Anyone opening this link will see your exact inputs.', 'success');
          } else {
            alert('Link copied to clipboard!');
          }
        });
      }
    },

    /**
     * Export HTML Table to CSV Download
     */
    exportTableToCSV(tableSelector, filename = 'schedule.csv') {
      const table = typeof tableSelector === 'string' ? document.querySelector(tableSelector) : tableSelector;
      if (!table) return;

      const rows = Array.from(table.querySelectorAll('tr'));
      const csvContent = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        return cells.map(cell => {
          let text = cell.innerText.replace(/"/g, '""').trim();
          return `"${text}"`;
        }).join(',');
      }).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (window.showToast) {
        window.showToast(`Exported ${filename} successfully!`, 'success');
      }
    },

    /**
     * Setup Preset Buttons
     */
    bindPresets(containerSelector, presetCallback) {
      const container = typeof containerSelector === 'string' ? document.querySelector(containerSelector) : containerSelector;
      if (!container) return;

      container.querySelectorAll('[data-preset]').forEach(btn => {
        btn.addEventListener('click', () => {
          const presetData = btn.getAttribute('data-preset');
          try {
            const values = JSON.parse(presetData);
            presetCallback(values);
            // Ensure inputs reflect comma formatting
            const scope = container.closest('.tb-workspace') || document;
            scope.querySelectorAll('input').forEach(inp => {
              if (inp._tbFormatted) {
                inp.value = CalcCore.formatNumberString(inp.value);
              }
            });
            // Highlight active preset
            container.querySelectorAll('[data-preset]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (window.showToast) {
              window.showToast(`Applied preset: ${btn.innerText.trim()}`, 'info');
            }
          } catch (e) {
            console.error('Invalid preset data:', e);
          }
        });
      });
    }
  };

  // Expose globally
  window.CalcCore = CalcCore;

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CalcCore.init());
  } else {
    CalcCore.init();
  }
})(window, document);
