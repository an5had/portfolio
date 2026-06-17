/* ===========================================================
   Custom portfolio behaviour — positioning band scroll reveals.
   (The "Through my lens" strip was replaced by the zipper-camera
   section in zip-camera.js.)
   =========================================================== */
(function () {
  'use strict';

  document.documentElement.classList.add('pf-js');
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  function animateIntro() {
    if (!gsap || !ScrollTrigger) {
      document.querySelectorAll('.pf-reveal').forEach(function (el) {
        el.style.opacity = 1; el.style.transform = 'none';
      });
      return;
    }
    var band = document.getElementById('pf-intro');
    if (!band) return;

    gsap.to(band.querySelectorAll('.pf-reveal'), {
      opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12,
      scrollTrigger: { trigger: band, start: 'top 78%' }
    });

    var em = band.querySelector('.pf-intro-lead em');
    if (em) {
      gsap.fromTo(em, { '--ux': 0 }, {
        '--ux': 1, duration: 1, ease: 'power2.out',
        scrollTrigger: { trigger: band, start: 'top 62%' }
      });
    }
  }

  function boot() { animateIntro(); }
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
})();
