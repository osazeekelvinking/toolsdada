/**
 * ToolsBuddy - Universal AdSense Interaction Engine (js/ads.js)
 * AdSense Publisher ID: ca-pub-6130384188487467
 *
 * Verified Ad Units:
 *  - Slot 1 (Top / Hero / Above Fold):
 *      Desktop (728x90): 4369386116
 *      Mobile  (320x90): 8117059432
 *  - Slot 2 (In-Content / Above Workspace / Result):
 *      Desktop (728x90): 3056304442
 *      Mobile  (320x90): 6229262699
 *  - Slot 3 (Bottom / Below Workspace):
 *      Desktop (728x90): 9246930392
 *      Mobile  (320x90): 5231663766
 *  - Slot Footer (Page bottom / Above footer):
 *      Multiplex (Autorelaxed): 3385897927
 *
 * Features:
 *  - Automatic slot resolution mapping for responsive desktop & mobile units.
 *  - Seamless support for both static <ins class="adsbygoogle"> and dynamic containers.
 *  - Fallback safety injection of official AdSense header library if missing from <head>.
 *  - Auto-collapse unfilled or blocked ad slots after 10 seconds or upon data-ad-status="unfilled".
 *  - Robust isAdLoaded() checks (creative iframe, aswift container, filled status) to NEVER collapse loaded ads.
 *  - Policy Compliant: No background timer auto-refresh. Refreshes strictly upon genuine user
 *    interactions ("Calculate", "Convert", "Format", "Generate", tab switches) with 3s cooldown.
 */

(function (window, document) {
  'use strict';

  var AD_CLIENT = 'ca-pub-6130384188487467';
  var DESKTOP_BP = 768;
  var MIN_REFRESH_INTERVAL = 3000; // 3 seconds cooldown
  var lastRefreshTime = 0;
  var isInitialized = false;
  var resizeTimer = null;
  var lastIsDesk = window.innerWidth >= DESKTOP_BP;

  // Active verified slots from Google AdSense dashboard
  var AD_SLOTS = {
    1: { desk: '4369386116', mob: '8117059432', name: 'ToolsBuddy Top/Hero' },
    2: { desk: '3056304442', mob: '6229262699', name: 'ToolsBuddy Workspace/Mid' },
    3: { desk: '9246930392', mob: '5231663766', name: 'ToolsBuddy Bottom' },
    'top': { desk: '4369386116', mob: '8117059432' },
    'hero': { desk: '4369386116', mob: '8117059432' },
    'ad-1': { desk: '4369386116', mob: '8117059432' },
    'ad-top': { desk: '4369386116', mob: '8117059432' },
    'ad-top-slot': { desk: '4369386116', mob: '8117059432' },
    'ad-2': { desk: '3056304442', mob: '6229262699' },
    'ad-mid': { desk: '3056304442', mob: '6229262699' },
    'ad-result': { desk: '3056304442', mob: '6229262699' },
    'ad-result-slot': { desk: '3056304442', mob: '6229262699' },
    'ad-workspace': { desk: '3056304442', mob: '6229262699' },
    'ad-tutorial': { desk: '3056304442', mob: '6229262699' },
    'ad-3': { desk: '9246930392', mob: '5231663766' },
    'ad-bottom': { desk: '9246930392', mob: '5231663766' },
    'ad-bottom-slot': { desk: '9246930392', mob: '5231663766' },
    'footer': { slot: '3385897927', format: 'autorelaxed', name: 'ToolsBuddy Footer' },
    'ad-footer': { slot: '3385897927', format: 'autorelaxed', name: 'ToolsBuddy Footer' },
    'ad-footer-slot': { slot: '3385897927', format: 'autorelaxed', name: 'ToolsBuddy Footer' },
    'sidebar': { slot: '8150977743', format: 'auto', name: 'ToolsBuddy Sidebar' },
    'ad-sidebar': { slot: '8150977743', format: 'auto', name: 'ToolsBuddy Sidebar' },
    'ad-sidebar-slot': { slot: '8150977743', format: 'auto', name: 'ToolsBuddy Sidebar' }
  };

  // Known placeholder/synthetic slot patterns that should be mapped to real slots
  var SYNTHETIC_SLOT_REGEX = /^(12|13|20|30|40|50|60|70)0100100\d$/;

  /**
   * Ensures essential CSS is present for ad containers and smooth collapsing
   */
  function ensureStyles() {
    if (document.getElementById('toolsbuddy-ads-css')) return;
    var style = document.createElement('style');
    style.id = 'toolsbuddy-ads-css';
    style.textContent =
      '.tb-ad-container, .ad-slot-wrap {' +
      '  width: 100%;' +
      '  margin: 1.5rem auto;' +
      '  text-align: center;' +
      '  display: flex;' +
      '  flex-direction: column;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '  overflow: hidden;' +
      '  position: relative;' +
      '  min-height: 100px;' +
      '  background: transparent;' +
      '}' +
      '.tb-ad-container.ad-top, .ad-slot-wrap#ad-top { max-width: 728px; min-height: 90px; }' +
      '.tb-ad-container.ad-result, .ad-slot-wrap#ad-result { max-width: 728px; min-height: 90px; }' +
      '.tb-ad-container.ad-footer, .ad-slot-wrap.ad-autorelaxed { max-width: 100%; min-height: 140px; }' +
      '.tb-ad-container.ad-sidebar, .ad-slot-wrap#ad-sidebar-slot { max-width: 336px; min-height: 280px; }' +
      '.tb-ad-label, .ad-label {' +
      '  display: block;' +
      '  font-size: 10px;' +
      '  font-weight: 600;' +
      '  letter-spacing: 0.08em;' +
      '  text-transform: uppercase;' +
      '  color: var(--text-muted, var(--mute, #6B6B78));' +
      '  opacity: 0.75;' +
      '  margin: 0 auto 4px;' +
      '  line-height: 1;' +
      '  text-align: center;' +
      '  user-select: none;' +
      '}' +
      '.tb-ad-container ins.adsbygoogle, .ad-slot-wrap ins.adsbygoogle {' +
      '  display: inline-block !important;' +
      '  position: relative;' +
      '}' +
      '.tb-ad-container ins.adsbygoogle iframe, .ad-slot-wrap ins.adsbygoogle iframe {' +
      '  max-width: 100%;' +
      '}' +
      '.tb-ad-container.ad-footer ins.adsbygoogle, .ad-slot-wrap.ad-autorelaxed ins.adsbygoogle {' +
      '  display: block !important;' +
      '  width: 100% !important;' +
      '  min-height: 120px;' +
      '}' +
      '.ad-collapsed, .tb-ad-container.ad-collapsed, .ad-slot-wrap.ad-collapsed {' +
      '  display: none !important;' +
      '  min-height: 0 !important;' +
      '  height: 0 !important;' +
      '  margin: 0 !important;' +
      '  padding: 0 !important;' +
      '}';
    document.head.appendChild(style);
  }

  /**
   * Dynamically loads the official Google AdSense library if not already present in <head>
   */
  function loadAdSenseScript() {
    if (document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
      return;
    }
    var script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + AD_CLIENT;
    document.head.appendChild(script);
  }

  /**
   * Resolves the verified slot ID for an ad container
   */
  function resolveSlot(container, isDesk) {
    if (!container) return null;

    // 1. Explicit responsive attributes
    var deskSlot = container.getAttribute('data-ad-slot-desk');
    var mobSlot = container.getAttribute('data-ad-slot-mob');
    if (isDesk && deskSlot) return deskSlot;
    if (!isDesk && mobSlot) return mobSlot;
    if (deskSlot && !mobSlot) return deskSlot;

    // 2. Predefined slot key/id
    var slotKey = container.getAttribute('data-ad-slot-num') ||
                  container.getAttribute('data-ad-id') ||
                  container.id;
    if (slotKey && AD_SLOTS[slotKey]) {
      if (AD_SLOTS[slotKey].slot) return AD_SLOTS[slotKey].slot;
      return isDesk ? AD_SLOTS[slotKey].desk : AD_SLOTS[slotKey].mob;
    }

    // 3. Class-based resolution (ad-top, ad-result, ad-footer)
    if (container.classList.contains('ad-top') || container.id === 'ad-top-slot') {
      return isDesk ? AD_SLOTS[1].desk : AD_SLOTS[1].mob;
    }
    if (container.classList.contains('ad-result') || container.id === 'ad-result-slot') {
      return isDesk ? AD_SLOTS[2].desk : AD_SLOTS[2].mob;
    }
    if (container.classList.contains('ad-footer') || container.classList.contains('ad-autorelaxed') || container.id === 'ad-footer-slot') {
      return AD_SLOTS['footer'].slot;
    }

    // 4. Existing <ins> data-ad-slot
    var ins = container.querySelector('ins.adsbygoogle');
    if (ins) {
      var curSlot = ins.getAttribute('data-ad-slot');
      if (curSlot && !SYNTHETIC_SLOT_REGEX.test(curSlot)) {
        return curSlot;
      }
    }

    // 5. Default fallback to Top slot
    return isDesk ? AD_SLOTS[1].desk : AD_SLOTS[1].mob;
  }

  /**
   * Renders or prepares an ad inside a target container
   */
  function renderAd(container) {
    if (!container) return;

    var isDesk = window.innerWidth >= DESKTOP_BP;
    var slotId = resolveSlot(container, isDesk);
    var isFooter = container.classList.contains('ad-footer') ||
                   container.classList.contains('ad-autorelaxed') ||
                   container.id === 'ad-footer-slot' ||
                   container.getAttribute('data-ad-format') === 'autorelaxed';

    // Cancel existing timers / observers on this container
    if (container._adTimer) {
      clearTimeout(container._adTimer);
      container._adTimer = null;
    }
    if (container._adObserver) {
      container._adObserver.disconnect();
      container._adObserver = null;
    }

    // Uncollapse container
    container.classList.remove('ad-collapsed');
    container.style.display = '';

    // Check existing <ins>
    var ins = container.querySelector('ins.adsbygoogle');
    if (!ins) {
      // Build container contents
      container.innerHTML = '';
      var label = document.createElement('span');
      label.className = 'tb-ad-label';
      label.textContent = 'Advertisement';
      container.appendChild(label);

      ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      if (isFooter) {
        ins.style.display = 'block';
        ins.setAttribute('data-ad-format', 'autorelaxed');
      } else {
        ins.style.display = 'inline-block';
        ins.style.width = (isDesk ? 728 : 320) + 'px';
        ins.style.height = '90px';
        ins.setAttribute('data-ad-format', 'horizontal');
      }
      ins.setAttribute('data-ad-client', AD_CLIENT);
      if (slotId) ins.setAttribute('data-ad-slot', slotId);
      ins.setAttribute('data-full-width-responsive', 'true');
      container.appendChild(ins);
    } else {
      // Ensure valid client & slot attributes
      ins.setAttribute('data-ad-client', AD_CLIENT);
      if (slotId && (!ins.getAttribute('data-ad-slot') || SYNTHETIC_SLOT_REGEX.test(ins.getAttribute('data-ad-slot')))) {
        ins.setAttribute('data-ad-slot', slotId);
      }
      if (isFooter) {
        ins.setAttribute('data-ad-format', 'autorelaxed');
        ins.style.display = 'block';
      } else {
        if (!ins.getAttribute('data-ad-format')) {
          ins.setAttribute('data-ad-format', 'horizontal');
        }
      }
    }

    var adLoaded = false;
    var startTime = Date.now();
    var slotName = container.id || container.className || 'slot';

    function markLoaded() {
      if (adLoaded) return;
      adLoaded = true;
      container.classList.remove('ad-collapsed');
      container.style.display = '';

      if (container._adTimer) {
        clearTimeout(container._adTimer);
        container._adTimer = null;
      }
      if (container._adObserver) {
        container._adObserver.disconnect();
        container._adObserver = null;
      }
    }

    function isAdLoaded() {
      if (adLoaded) return true;
      var status = ins.getAttribute('data-ad-status');
      if (status === 'unfilled') return false;
      if (status === 'filled') {
        markLoaded();
        return true;
      }

      // Creative iframe check
      var creativeIframe = ins.querySelector("iframe[id^='google_ads_iframe']");
      if (creativeIframe) {
        markLoaded();
        return true;
      }

      // Visible container iframe check (aswift_0, etc.)
      var iframes = ins.getElementsByTagName('iframe');
      for (var i = 0; i < iframes.length; i++) {
        var ifr = iframes[i];
        if (ifr.id === 'google_esf') continue;
        if (ifr.style.display === 'none' || ifr.style.visibility === 'hidden') continue;

        if (ifr.id && (ifr.id.indexOf('aswift') === 0 || ifr.id.indexOf('google_ads') === 0)) {
          markLoaded();
          return true;
        }

        var rect = ifr.getBoundingClientRect ? ifr.getBoundingClientRect() : null;
        var h = (rect && rect.height) ? rect.height : (ifr.offsetHeight || 0);
        var w = (rect && rect.width) ? rect.width : (ifr.offsetWidth || 0);
        if (h > 20 || w > 20) {
          markLoaded();
          return true;
        }
      }

      // Content with done status
      if (ins.getAttribute('data-adsbygoogle-status') === 'done' && ins.children.length > 0 && status !== 'unfilled') {
        markLoaded();
        return true;
      }

      return false;
    }

    function collapseAd() {
      if (adLoaded) return; // NEVER collapse if ad has loaded
      if (ins.parentElement !== container) return;
      container.classList.add('ad-collapsed');
      container.style.display = 'none';
    }

    // MutationObserver to detect immediate filled status or creative insertion
    if (window.MutationObserver) {
      var observer = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (m.type === 'attributes' && m.attributeName === 'data-ad-status') {
            var st = ins.getAttribute('data-ad-status');
            if (st === 'filled') {
              markLoaded();
              return;
            } else if (st === 'unfilled') {
              collapseAd();
              return;
            }
          }
        }
        if (isAdLoaded()) {
          markLoaded();
        }
      });
      observer.observe(ins, { attributes: true, childList: true, subtree: true });
      container._adObserver = observer;
    }

    // 10-second safety timeout for unfilled or blocked slots
    container._adTimer = setTimeout(function () {
      if (ins.parentElement !== container) return;
      if (isAdLoaded()) {
        markLoaded();
        return;
      }
      collapseAd();
    }, 10000);

    // Push ad request if not already pushed
    if (!ins.getAttribute('data-adsbygoogle-status')) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('[ToolsBuddy Ads] Push error:', e);
      }
    }
  }

  /**
   * Refreshes all ad units on the page strictly upon user-initiated interaction
   */
  function refreshAds(sourceEvent) {
    if (document.hidden) return;
    var now = Date.now();
    if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
      return; // Cooldown to comply with AdSense policy
    }
    lastRefreshTime = now;

    ensureStyles();

    var targets = document.querySelectorAll('.tb-ad-container, .ad-slot-wrap');
    if (!targets.length) return;

    for (var i = 0; i < targets.length; i++) {
      var container = targets[i];
      var currentIns = container.querySelector('ins.adsbygoogle');
      if (currentIns && currentIns.getAttribute('data-ad-status') === 'unfilled') {
        continue;
      }

      container.classList.remove('ad-collapsed');
      container.style.display = '';

      var isDesk = window.innerWidth >= DESKTOP_BP;
      var slotId = resolveSlot(container, isDesk);
      var isFooter = container.classList.contains('ad-footer') ||
                     container.classList.contains('ad-autorelaxed') ||
                     container.id === 'ad-footer-slot';

      container.innerHTML =
        '<span class="tb-ad-label">Advertisement</span>' +
        '<ins class="adsbygoogle"' +
        '     style="display:' + (isFooter ? 'block' : 'inline-block') + '; width:' + (isFooter ? '100%' : (isDesk ? '728px' : '320px')) + '; height:' + (isFooter ? 'auto' : '90px') + ';"' +
        '     data-ad-client="' + AD_CLIENT + '"' +
        '     ' + (slotId ? 'data-ad-slot="' + slotId + '"' : '') +
        '     data-ad-format="' + (isFooter ? 'autorelaxed' : 'horizontal') + '"' +
        '     data-full-width-responsive="true"></ins>';

      renderAd(container);
    }
  }

  /**
   * Initializes all ad slots on page load
   */
  function initAds() {
    if (isInitialized) return;
    isInitialized = true;

    ensureStyles();
    loadAdSenseScript();

    var targets = document.querySelectorAll('.tb-ad-container, .ad-slot-wrap');
    for (var i = 0; i < targets.length; i++) {
      renderAd(targets[i]);
    }
  }

  // Responsive breakpoint handler (desktop <-> mobile re-alignment)
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var nowDesk = window.innerWidth >= DESKTOP_BP;
      if (nowDesk !== lastIsDesk) {
        lastIsDesk = nowDesk;
        refreshAds('resize');
      }
    }, 300);
  });

  // Auto-init when document is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAds);
  } else {
    initAds();
  }

  // Global exports
  window.initAds = initAds;
  window.renderAd = renderAd;
  window.refreshAds = refreshAds;
  window.ToolsBuddyAds = {
    client: AD_CLIENT,
    slots: AD_SLOTS,
    renderAd: renderAd,
    refreshAds: refreshAds,
    initAds: initAds
  };
})(window, document);
