/**
 * ToolsBuddy & EbookBuddy - Unified AdSense Interaction Engine
 * Client ID: ca-pub-6130384188487467
 *
 * Configured & Verified Ad Units:
 *  - Slot 1 (Top / Hero / Above Fold):
 *      Desktop (728x90): 4369386116
 *      Mobile  (320x90): 8117059432
 *  - Slot 2 (Workspace / Result / In-Content):
 *      Desktop (728x90): 3056304442
 *      Mobile  (320x90): 6229262699
 *  - Slot 3 (Bottom / Below Workspace):
 *      Desktop (728x90): 9246930392
 *      Mobile  (320x90): 5231663766
 *  - Slot Sidebar (Sticky / Utility Aside):
 *      Standard Medium Rectangle (300x250): 8150977743
 *  - Slot Footer (Page Bottom / Above Footer):
 *      Multiplex (Autorelaxed): 3385897927
 *
 * Key Architecture:
 *  - Unified architecture across all calculators, tools, blog posts, and EbookBuddy studio.
 *  - Explicit responsive sizing per unit prevents 0x0px rendering and eliminates "No slot size" TagErrors.
 *  - Prevents race conditions by dynamically generating clean <ins> elements without rogue parse-time pushes.
 *  - Graceful 10-second safety countdown auto-collapses unfilled/blocked slots, preventing blank space.
 *  - Policy compliant: strictly zero timer auto-refresh; updates only on genuine user-initiated interactions
 *    ("Calculate", "Convert", "Format", stage switches) protected by a 3-second cooldown.
 *  - Zero regressions: full compatibility with window.EbookBuddyAds, window.ToolsBuddyAds, and global handlers.
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
    1: { desk: '4369386116', mob: '8117059432', name: 'Top/Hero' },
    2: { desk: '3056304442', mob: '6229262699', name: 'Workspace/Mid' },
    3: { desk: '9246930392', mob: '5231663766', name: 'Bottom' },
    'top': { desk: '4369386116', mob: '8117059432' },
    'hero': { desk: '4369386116', mob: '8117059432' },
    'ad-1': { desk: '4369386116', mob: '8117059432' },
    'ad-hero': { desk: '4369386116', mob: '8117059432' },
    'ad-top': { desk: '4369386116', mob: '8117059432' },
    'ad-top-slot': { desk: '4369386116', mob: '8117059432' },
    '2': { desk: '3056304442', mob: '6229262699' },
    'ad-2': { desk: '3056304442', mob: '6229262699' },
    'ad-mid': { desk: '3056304442', mob: '6229262699' },
    'ad-result': { desk: '3056304442', mob: '6229262699' },
    'ad-result-slot': { desk: '3056304442', mob: '6229262699' },
    'ad-workspace': { desk: '3056304442', mob: '6229262699' },
    'ad-tutorial': { desk: '3056304442', mob: '6229262699' },
    'tutorial': { desk: '3056304442', mob: '6229262699' },
    '3': { desk: '9246930392', mob: '5231663766' },
    'ad-3': { desk: '9246930392', mob: '5231663766' },
    'ad-bottom': { desk: '9246930392', mob: '5231663766' },
    'ad-bottom-slot': { desk: '9246930392', mob: '5231663766' },
    'sidebar': { slot: '8150977743', format: 'rectangle', name: 'Sidebar' },
    'ad-sidebar': { slot: '8150977743', format: 'rectangle', name: 'Sidebar' },
    'ad-sidebar-slot': { slot: '8150977743', format: 'rectangle', name: 'Sidebar' },
    'footer': { slot: '3385897927', format: 'autorelaxed', name: 'Footer Multiplex' },
    'ad-footer': { slot: '3385897927', format: 'autorelaxed', name: 'Footer Multiplex' },
    'ad-footer-slot': { slot: '3385897927', format: 'autorelaxed', name: 'Footer Multiplex' }
  };

  /**
   * Ensures default CSS exists for ad slot containers, labels, and collapse states
   */
  function injectStyles() {
    if (document.getElementById('toolsbuddy-unified-ads-css')) return;
    var style = document.createElement('style');
    style.id = 'toolsbuddy-unified-ads-css';
    style.textContent =
      '.tb-ad-container, .ad-slot-wrap {' +
      '  width: 100%;' +
      '  margin: 1.25rem auto;' +
      '  text-align: center;' +
      '  display: flex;' +
      '  flex-direction: column;' +
      '  align-items: center;' +
      '  justify-content: center;' +
      '  overflow: hidden;' +
      '  clear: both;' +
      '  position: relative;' +
      '  min-height: 105px;' +
      '  max-width: 760px;' +
      '  background: transparent;' +
      '  scroll-margin-top: 105px;' +
      '}' +
      '.tb-ad-container.ad-top, .ad-slot-wrap#ad-top, .ad-slot-wrap#ad-hero {' +
      '  max-width: 760px;' +
      '  min-height: 105px;' +
      '}' +
      '.tb-ad-container.ad-result, .ad-slot-wrap#ad-result {' +
      '  max-width: 760px;' +
      '  min-height: 105px;' +
      '}' +
      '.tb-ad-container.ad-footer, .ad-slot-wrap.ad-autorelaxed, .ad-slot-wrap#ad-footer {' +
      '  max-width: 100%;' +
      '  min-height: 140px;' +
      '  margin: 1.5rem auto 1rem;' +
      '}' +
      '.tb-ad-container.ad-sidebar, .ad-slot-wrap#ad-sidebar-slot {' +
      '  max-width: 336px;' +
      '  min-height: 260px;' +
      '  margin: 0 auto;' +
      '}' +
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
   * Dynamically loads official Google AdSense library if not already present
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
   * Resolves slot ID for a container element
   */
  function resolveSlot(el, isDesk) {
    if (!el) return null;

    // 1. Direct explicit responsive attributes
    var deskSlot = el.getAttribute('data-ad-slot-desk');
    var mobSlot = el.getAttribute('data-ad-slot-mob');
    if (isDesk && deskSlot) return deskSlot;
    if (!isDesk && mobSlot) return mobSlot;
    if (deskSlot && !mobSlot) return deskSlot;

    // 2. Predefined slot key/id attribute
    var slotNum = el.getAttribute('data-ad-slot-num') || el.getAttribute('data-ad-id');
    if (slotNum && AD_SLOTS[slotNum]) {
      if (AD_SLOTS[slotNum].slot) return AD_SLOTS[slotNum].slot;
      return isDesk ? AD_SLOTS[slotNum].desk : AD_SLOTS[slotNum].mob;
    }

    // 3. Fallback by element ID
    if (el.id && AD_SLOTS[el.id]) {
      if (AD_SLOTS[el.id].slot) return AD_SLOTS[el.id].slot;
      return isDesk ? AD_SLOTS[el.id].desk : AD_SLOTS[el.id].mob;
    }

    // 4. Class-based resolution
    if (el.classList.contains('ad-top') || el.id === 'ad-top-slot' || el.id === 'ad-hero') {
      return isDesk ? AD_SLOTS[1].desk : AD_SLOTS[1].mob;
    }
    if (el.classList.contains('ad-result') || el.classList.contains('ad-mid') || el.id === 'ad-result-slot') {
      return isDesk ? AD_SLOTS[2].desk : AD_SLOTS[2].mob;
    }
    if (el.classList.contains('ad-bottom') || el.id === 'ad-bottom-slot') {
      return isDesk ? AD_SLOTS[3].desk : AD_SLOTS[3].mob;
    }
    if (el.classList.contains('ad-sidebar') || el.id === 'ad-sidebar-slot') {
      return AD_SLOTS['sidebar'].slot;
    }
    if (el.classList.contains('ad-footer') || el.classList.contains('ad-autorelaxed') || el.id === 'ad-footer-slot') {
      return AD_SLOTS['footer'].slot;
    }

    // 5. Generic single data-ad-slot
    var genSlot = el.getAttribute('data-ad-slot');
    if (genSlot) return genSlot;

    // Fallback to top slot
    return isDesk ? AD_SLOTS[1].desk : AD_SLOTS[1].mob;
  }

  /**
   * Renders or re-renders an ad unit inside a container
   */
  function renderAd(target) {
    var el = typeof target === 'string' ? document.getElementById(target) : target;
    if (!el) return;

    var isDesk = window.innerWidth >= DESKTOP_BP;
    var slotId = resolveSlot(el, isDesk);
    if (!slotId) return;

    var isAutorelaxed =
      el.getAttribute('data-ad-format') === 'autorelaxed' ||
      el.classList.contains('ad-autorelaxed') ||
      el.classList.contains('ad-footer') ||
      el.id === 'ad-footer' ||
      el.id === 'ad-footer-slot';

    var isSidebar =
      el.classList.contains('ad-sidebar') ||
      el.id === 'ad-sidebar' ||
      el.id === 'ad-sidebar-slot';

    // Width and height mapping for fixed units
    var width = isDesk ? 728 : 320;
    var height = 90;

    // Cancel any previous timer/observer on this container
    if (el._unifiedAdTimer) {
      clearTimeout(el._unifiedAdTimer);
      el._unifiedAdTimer = null;
    }
    if (el._unifiedAdObserver) {
      el._unifiedAdObserver.disconnect();
      el._unifiedAdObserver = null;
    }

    // Uncollapse container when preparing new ad
    el.classList.remove('ad-collapsed');
    el.style.display = '';
    el.innerHTML = '';

    // Add subtle/tiny label above ad slot
    var label = document.createElement('span');
    label.className = el.classList.contains('tb-ad-container') ? 'tb-ad-label' : 'ad-label';
    label.textContent = 'Advertisement';
    el.appendChild(label);

    // Build fresh <ins> element with explicit dimensions
    var ins = document.createElement('ins');
    ins.className = 'adsbygoogle';

    if (isAutorelaxed) {
      ins.style.display = 'block';
      ins.setAttribute('data-ad-format', 'autorelaxed');
      ins.setAttribute('data-full-width-responsive', 'true');
    } else if (isSidebar) {
      ins.style.display = 'inline-block';
      ins.style.width = '300px';
      ins.style.height = '250px';
    } else {
      ins.style.display = 'inline-block';
      ins.style.width = width + 'px';
      ins.style.height = height + 'px';
    }

    ins.setAttribute('data-ad-client', AD_CLIENT);
    ins.setAttribute('data-ad-slot', slotId);
    el.appendChild(ins);

    var adLoaded = false;
    var collapseTimer = null;
    var observer = null;
    var startTime = Date.now();
    var slotName = el.id || el.getAttribute('data-ad-slot-num') || 'slot';

    function markLoaded() {
      if (adLoaded) return;
      adLoaded = true;
      el.classList.remove('ad-collapsed');
      el.style.display = '';

      if (collapseTimer) {
        clearTimeout(collapseTimer);
        collapseTimer = null;
      }
      if (el._unifiedAdTimer) {
        clearTimeout(el._unifiedAdTimer);
        el._unifiedAdTimer = null;
      }
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      if (el._unifiedAdObserver) {
        el._unifiedAdObserver.disconnect();
        el._unifiedAdObserver = null;
      }
    }

    function isAdLoaded() {
      if (adLoaded) return true;
      var status = ins.getAttribute('data-ad-status');
      if (status === 'unfilled') {
        return false;
      }
      if (status === 'filled') {
        markLoaded();
        return true;
      }

      // 1. Direct creative iframe check
      var creativeIframe = ins.querySelector("iframe[id^='google_ads_iframe']");
      if (creativeIframe) {
        markLoaded();
        return true;
      }

      // 2. Visible AdSense container iframe check (aswift_0, etc.)
      var iframes = ins.getElementsByTagName('iframe');
      for (var i = 0; i < iframes.length; i++) {
        var ifr = iframes[i];
        if (ifr.id === 'google_esf') continue; // Skip hidden tracking iframe

        var isHidden = ifr.style.display === 'none' || ifr.style.visibility === 'hidden';
        if (isHidden) continue;

        if (ifr.id && (ifr.id.indexOf('aswift') === 0 || ifr.id.indexOf('google_ads') === 0)) {
          markLoaded();
          return true;
        }

        var rect = ifr.getBoundingClientRect ? ifr.getBoundingClientRect() : null;
        var h = (rect && rect.height) ? rect.height : (ifr.offsetHeight || 0);
        var w = (rect && rect.width) ? rect.width : (ifr.offsetWidth || 0);
        var attrH = parseInt(ifr.getAttribute('height') || ifr.style.height || '0', 10);
        var attrW = parseInt(ifr.getAttribute('width') || ifr.style.width || '0', 10);
        if (h > 20 || w > 20 || attrH > 20 || attrW > 20) {
          markLoaded();
          return true;
        }
      }

      // 3. Fallback: check if ins has active rendered content and data-adsbygoogle-status="done"
      if (ins.getAttribute('data-adsbygoogle-status') === 'done' && ins.children.length > 0 && status !== 'unfilled') {
        var hasVisibleContent = false;
        for (var j = 0; j < ins.children.length; j++) {
          var ch = ins.children[j];
          if (ch.id !== 'google_esf' && ch.style.display !== 'none' && ch.style.visibility !== 'hidden') {
            hasVisibleContent = true;
            break;
          }
        }
        if (hasVisibleContent) {
          markLoaded();
          return true;
        }
      }

      return false;
    }

    function collapseAd() {
      if (adLoaded) return; // NEVER collapse if ad has loaded
      if (ins.parentElement !== el) return; // Ignore stale timer
      var isTopAd = el.id === 'ad-top' || el.id === 'ad-top-slot';
      var wasInLayout = !el.classList.contains('ad-collapsed') && el.offsetHeight > 0;
      el.classList.add('ad-collapsed');
      el.style.display = 'none';
      if (isTopAd && wasInLayout && typeof window.snapToStageHeader === 'function') {
        window.snapToStageHeader(true);
      }
    }

    // 1. MutationObserver watching for explicit filled status or creative iframe
    if (window.MutationObserver) {
      observer = new window.MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var m = mutations[i];
          if (m.type === 'attributes' && m.attributeName === 'data-ad-status') {
            if (ins.getAttribute('data-ad-status') === 'filled') {
              markLoaded();
              return;
            }
          }
        }
        var creativeIframe = ins.querySelector("iframe[id^='google_ads_iframe']");
        if (creativeIframe && creativeIframe.offsetHeight > 20) {
          markLoaded();
        }
      });
      observer.observe(ins, { attributes: true, childList: true, subtree: true });
      el._unifiedAdObserver = observer;
    }

    // 2. Auto-collapse after 10 seconds when no ad is rendered/loaded
    collapseTimer = setTimeout(function () {
      if (ins.parentElement !== el) return; // Container was re-rendered, ignore old timer
      if (isAdLoaded()) {
        markLoaded();
        return; // NEVER collapse loaded ads!
      }
      collapseAd();
    }, 10000);
    el._unifiedAdTimer = collapseTimer;

    // Push ad request
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // Allow safety timer to handle graceful collapse without throwing
    }
  }

  /**
   * Refreshes all ad slots on the page (strictly user-initiated or breakpoint change)
   */
  function refreshAds(sourceEvent) {
    if (document.hidden) return;
    var now = Date.now();
    if (sourceEvent !== 'resize' && now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
      return; // Cooldown to comply with AdSense policy
    }
    lastRefreshTime = now;

    injectStyles();

    var targets = document.querySelectorAll(
      '.tb-ad-container, .ad-slot-wrap, [data-ad-slot-desk], [data-ad-slot-num], #ad-hero, #ad-top, #ad-result, #ad-bottom, #ad-footer, #ad-sidebar-slot'
    );

    var seen = [];
    for (var i = 0; i < targets.length; i++) {
      var el = targets[i];
      if (seen.indexOf(el) === -1) {
        seen.push(el);
        renderAd(el);
      }
    }
  }

  /**
   * Initializes all ad slots on page load
   */
  function initAds() {
    if (isInitialized) return;
    isInitialized = true;

    injectStyles();
    loadAdSenseScript();
    refreshAds('init');
  }

  // Responsive breakpoint listener (desktop <-> mobile re-alignment)
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

  // Global exports for full backward and cross-tool compatibility
  window.renderAd = renderAd;
  window.refreshAds = refreshAds;
  window.initAds = initAds;
  window.ToolsBuddyAds = {
    client: AD_CLIENT,
    slots: AD_SLOTS,
    renderAd: renderAd,
    refreshAds: refreshAds,
    initAds: initAds
  };
  window.EbookBuddyAds = window.ToolsBuddyAds;

})(window, document);
