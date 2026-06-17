/* ===========================================================
   an5had — brand logo
   Replaces the Framer text logo ("An5had") in the top bar with a
   wordmark + focus-reticle mark. Self-contained: injects its own
   styles. Runs post-hydration and re-applies if Framer re-renders.
   Used on every page for a consistent identity.
   =========================================================== */
(function () {
  'use strict';

  var ACCENT = '#ff5630';

  var LOGO_HTML =
    '<span class="an5-logo" aria-label="an5had">' +
      '<span class="an5-badge">a<span class="an5-badge-5">5</span></span>' +
      '<span class="an5-word">an5had</span>' +
    '</span>';

  var CSS =
    '.an5-logo{display:inline-flex;align-items:center;gap:10px;line-height:1;color:#fff;text-decoration:none;vertical-align:middle}' +
    '.an5-badge{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;' +
      'background:linear-gradient(150deg,#20242e,#0b0d11);border:1px solid rgba(255,255,255,.14);' +
      'box-shadow:inset 0 1px 0 rgba(255,255,255,.06);font-family:"Inter","Hanken Grotesk",sans-serif;' +
      'font-weight:700;font-size:13px;letter-spacing:-.04em;color:#fff;transition:border-color .3s ease}' +
    '.an5-badge-5{color:' + ACCENT + '}' +
    '.an5-logo:hover .an5-badge{border-color:rgba(255,86,48,.6)}' +
    '.an5-word{font-family:"Inter","Hanken Grotesk",sans-serif;font-weight:600;font-size:19px;letter-spacing:-.03em;color:#fff}';

  function injectStyle() {
    if (document.getElementById('an5-style')) return;
    var s = document.createElement('style');
    s.id = 'an5-style';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function applyLogo() {
    var logos = document.querySelectorAll('[data-framer-name="Logo"]');
    logos.forEach(function (el) {
      // Skip if our logo is already inside and intact.
      if (el.querySelector('.an5-logo')) return;
      el.innerHTML = LOGO_HTML;
    });
  }

  function boot() {
    injectStyle();
    applyLogo();
    // Re-apply across the hydration window.
    [200, 600, 1200, 2500, 4000].forEach(function (t) { setTimeout(applyLogo, t); });

    // Framer's React can re-render the nav (e.g. on scroll), wiping our logo.
    // Keep a PERSISTENT observer so we re-apply whenever that happens.
    // applyLogo is cheap and guarded per-element, so this never loops.
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function () { applyLogo(); });
      try { mo.observe(document.body, { childList: true, subtree: true }); } catch (e) {}
    }

    // Belt-and-suspenders: re-check on scroll.
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { applyLogo(); ticking = false; });
    }, { passive: true });
  }

  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();
