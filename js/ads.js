/**
 * ToolsBuddy - AdSense Interaction Engine (ads.js)
 * AdSense Publisher ID: ca-pub-6130384188487467
 *
 * Engineered strictly in compliance with Google AdSense Policies:
 * - NO background or timer-based auto-refreshing.
 * - Ads refresh ONLY upon genuine user-initiated interactions:
 *   "Calculate", "Convert", "Format", "Generate", tab switches, unit toggles.
 * - Auto-collapse unfilled or blocked ad slots after 10 seconds or immediately upon data-ad-status="unfilled".
 */

(function () {
  'use strict';

  const ADSENSE_CLIENT_ID = 'ca-pub-6130384188487467';
  const MIN_REFRESH_INTERVAL = 3000; // 3 seconds cooldown to prevent spam & protect CTR
  let lastRefreshTime = 0;
  let adCollapseTimeouts = new Map();

  /**
   * Initializes all ad containers on the page
   */
  function initAds() {
    loadAdSenseScript();
    const adContainers = document.querySelectorAll('.tb-ad-container');
    adContainers.forEach((container) => {
      setupSlotObserver(container);
      armSlotTimeout(container);
      pushAd(container);
    });
  }

  /**
   * Dynamically loads the official Google AdSense library if not already present
   */
  function loadAdSenseScript() {
    if (document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
      return;
    }
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    document.head.appendChild(script);
  }

  /**
   * Pushes an ad request to adsbygoogle
   */
  function pushAd(container) {
    const ins = container.querySelector('ins.adsbygoogle');
    if (!ins) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('[ToolsBuddy Ads] adsbygoogle push error:', e);
    }
  }

  /**
   * Arm a 10-second timeout to collapse unfilled ad slots automatically
   */
  function armSlotTimeout(container) {
    const containerId = container.id || Math.random().toString(36).substring(7);
    if (adCollapseTimeouts.has(containerId)) {
      clearTimeout(adCollapseTimeouts.get(containerId));
    }

    const timer = setTimeout(() => {
      checkAndCollapse(container);
    }, 10000);

    adCollapseTimeouts.set(containerId, timer);
  }

  /**
   * Monitors the <ins> element for Google's data-ad-status="unfilled" attribute
   */
  function setupSlotObserver(container) {
    const ins = container.querySelector('ins.adsbygoogle');
    if (!ins) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-ad-status'
        ) {
          const status = ins.getAttribute('data-ad-status');
          if (status === 'unfilled') {
            collapseContainer(container);
          } else if (status === 'filled') {
            expandContainer(container);
          }
        }
      });
    });

    observer.observe(ins, { attributes: true });
  }

  /**
   * Checks if an ad slot has filled content, otherwise collapses it
   */
  function checkAndCollapse(container) {
    const ins = container.querySelector('ins.adsbygoogle');
    if (!ins) {
      collapseContainer(container);
      return;
    }

    const status = ins.getAttribute('data-ad-status');
    const hasIframe = ins.querySelector('iframe') !== null;
    const hasContent = ins.children.length > 0;

    if (status === 'unfilled' || (!hasIframe && !hasContent)) {
      collapseContainer(container);
    }
  }

  function collapseContainer(container) {
    container.classList.add('ad-collapsed');
    container.style.display = 'none';
  }

  function expandContainer(container) {
    container.classList.remove('ad-collapsed');
    container.style.display = '';
  }

  /**
   * Global function: window.refreshAds(sourceEvent)
   * Refreshes ad units strictly upon user interaction (e.g. Calculate, Convert, Tab switch)
   */
  window.refreshAds = function (sourceEvent) {
    const now = Date.now();
    if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
      // Cooldown in effect, skipping to protect AdSense policy
      return;
    }
    lastRefreshTime = now;

    const adContainers = document.querySelectorAll('.tb-ad-container');
    if (!adContainers.length) return;

    adContainers.forEach((container) => {
      // Don't refresh if container was marked permanently unfilled by Google
      const currentIns = container.querySelector('ins.adsbygoogle');
      if (currentIns && currentIns.getAttribute('data-ad-status') === 'unfilled') {
        return;
      }

      expandContainer(container);

      // Re-create <ins> element safely for fresh slot impression
      const slotId = currentIns ? currentIns.getAttribute('data-ad-slot') : '';
      const adFormat = currentIns ? currentIns.getAttribute('data-ad-format') : 'auto';
      const adLayout = currentIns ? currentIns.getAttribute('data-ad-layout-key') : '';

      container.innerHTML = `
        <span class="tb-ad-label">Advertisement</span>
        <ins class="adsbygoogle"
             style="display:block"
             data-ad-client="${ADSENSE_CLIENT_ID}"
             ${slotId ? `data-ad-slot="${slotId}"` : ''}
             data-ad-format="${adFormat || 'auto'}"
             ${adLayout ? `data-ad-layout-key="${adLayout}"` : ''}
             data-full-width-responsive="true"></ins>
      `;

      setupSlotObserver(container);
      armSlotTimeout(container);
      pushAd(container);
    });
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAds);
  } else {
    initAds();
  }
})();
