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
// Countdown to launch: 13 Dec 2026, 5:00 PM Baghdad (UTC+3) = 14:00 UTC
// ==========================================
(function () {
  var box = document.getElementById('countdown');
  if (!box) return;
  var launch = Date.UTC(2026, 11, 13, 14, 0, 0);
  var dEl = document.getElementById('cdDays');
  var hEl = document.getElementById('cdHours');
  var mEl = document.getElementById('cdMins');
  var timer;

  function tick() {
    var left = launch - Date.now();
    if (left <= 0) {
      box.innerHTML = '<div class="cd-open">التسجيل مفتوح هسة</div>';
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
