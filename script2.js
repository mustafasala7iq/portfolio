// ==========================================
// Navbar scroll effect
// ==========================================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ==========================================
// Mobile nav toggle
// ==========================================
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close mobile nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ==========================================
// Scroll-reveal animation
// ==========================================
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -40px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));
// ==========================================
// Ad source pass-through: ?src=ad1 or ?utm_source=ad1 replaces src=landing
// in every reserve / free-lesson link
// ==========================================
(function () {
  var params = new URLSearchParams(window.location.search);
  var source = params.get('src') || params.get('utm_source');
  if (!source) return;
  document.querySelectorAll('a.js-src').forEach(function (link) {
    try {
      var url = new URL(link.href);
      url.searchParams.set('src', source);
      link.href = url.toString();
    } catch (e) { /* leave the link as it is */ }
  });
})();

// ==========================================
// After launch (13 Dec 2026, 5 PM Baghdad): the launch offer ends.
// Price goes back to 49,000, "pre-order" wording is swapped for normal
// sign-up wording (data-after on each element), and booking buttons drop
// ?preorder=1. Preview it early by adding ?launched=1 to the URL.
// ==========================================
window.LAUNCH_AT = Date.UTC(2026, 11, 13, 14, 0, 0);
(function () {
  var forced = new URLSearchParams(window.location.search).get('launched') === '1';
  if (!forced && Date.now() < window.LAUNCH_AT) return;
  if (forced) window.LAUNCH_AT = 0;
  document.querySelectorAll('[data-after]').forEach(function (el) {
    var t = el.getAttribute('data-after');
    if (t === '') el.remove(); else el.textContent = t;
  });
  document.querySelectorAll('a.hero-cta').forEach(function (a) {
    try {
      var url = new URL(a.href);
      url.searchParams.delete('preorder');
      a.href = url.toString();
    } catch (e) { /* leave the link as it is */ }
    a.childNodes.forEach(function (n) {
      if (n.nodeType === 3 && n.textContent.trim()) n.textContent = ' سجّل هسه ';
    });
  });
})();

// ==========================================
// Countdown to launch: 13 Dec 2026, 5:00 PM Baghdad (UTC+3) = 14:00 UTC
// ==========================================
(function () {
  var box = document.getElementById('countdown');
  if (!box) return;
  var launch = window.LAUNCH_AT;
  var dEl = document.getElementById('cdDays');
  var hEl = document.getElementById('cdHours');
  var mEl = document.getElementById('cdMins');
  var timer;

  function tick() {
    var left = launch - Date.now();
    if (left <= 0) {
      box.remove();
      clearInterval(timer);
      return;
    }
    var mins = Math.floor(left / 60000);
    dEl.textContent = Math.floor(mins / 1440);
    hEl.textContent = Math.floor((mins % 1440) / 60);
    mEl.textContent = mins % 60;
  }

  tick();
  timer = setInterval(tick, 15000);
})();

// Hide the sticky phone button while another booking button is on screen
(function () {
  var sticky = document.getElementById('stickyCta');
  if (!sticky || !('IntersectionObserver' in window)) return;
  var visible = new Set();
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { e.isIntersecting ? visible.add(e.target) : visible.delete(e.target); });
    sticky.classList.toggle('is-hidden', visible.size > 0);
  });
  document.querySelectorAll('a.hero-cta').forEach(function (a) {
    if (!sticky.contains(a)) io.observe(a);
  });
})();

// Reviews: show all on phones when "عرض المزيد" is tapped
(function () {
  var btn = document.querySelector('.reviews-more');
  var list = document.querySelector('.reviews');
  if (!btn || !list) return;
  btn.addEventListener('click', function () {
    var open = list.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.textContent = open ? 'عرض أقل' : 'عرض المزيد';
  });
})();
