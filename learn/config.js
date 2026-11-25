// Where the course API runs (the bot's Railway service). Change it here once, both pages follow.
// STAGING branch: this copy of the site talks to the staging API only. Never merge this file into main.
window.LEARN_API = 'https://course-bot-staging.up.railway.app';
window.IS_STAGING = true;
(function () {                       // a red strip on every page that loads this file, so nobody mistakes staging for the live site
  function show() {
    if (document.getElementById('stagingBar')) return;
    var b = document.createElement('div'); b.id = 'stagingBar'; b.textContent = 'STAGING · بيئة تجريبية';
    b.style.cssText = 'position:fixed;z-index:9999;left:0;right:0;bottom:0;padding:6px 12px calc(6px + env(safe-area-inset-bottom,0px));background:#B42318;color:#fff;font:700 12px/1.4 system-ui,sans-serif;text-align:center;pointer-events:none';
    document.body.appendChild(b);
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', show) : show();
})();
// WhatsApp number for support (forgot password, new device). Digits only.
window.SUPPORT_WA = '9647744888921';
