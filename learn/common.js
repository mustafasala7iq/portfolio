// Shared by the student page and the staff page: API calls, saved login, voice recorder, small helpers.
(function () {
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} },
  };
  // ?api=... lets us point a page at a test server without editing config.js
  const qApi = new URLSearchParams(location.search).get('api');
  if (qApi) store.set('learn_api', qApi);
  const API = (store.get('learn_api') || window.LEARN_API || '').replace(/\/$/, '');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  async function call(path, { method = 'GET', json, form, token } = {}) {
    const headers = {};
    if (token) headers.Authorization = 'Bearer ' + token;
    let body;
    if (json) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(json); }
    if (form) body = form;
    let r;
    try { r = await fetch(API + path, { method, headers, body }); }
    catch (e) { throw { status: 0, message: 'ما كدرنا نوصل للسيرفر. تأكد من الإنترنت وجرّب مرة ثانية.' }; }
    let data = {};
    try { data = await r.json(); } catch (e) {}
    if (!r.ok) throw { status: r.status, message: data.message || (r.status === 401 ? 'login' : 'صار خطأ، جرّب مرة ثانية.'), data };
    return data;
  }

  function fileUrl(path, token) { return path ? API + path + (path.includes('?') ? '&' : '?') + 't=' + encodeURIComponent(token) : null; }

  let toastTimer;
  function toast(msg) {
    let t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 3200);
  }

  function when(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    try { return d.toLocaleString('ar-IQ', { weekday: 'long', hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' }); }
    catch (e) { return d.toLocaleString(); }
  }

  // ---- voice recorder: record -> listen -> send (or pick a file if the browser can't record) ----
  function pickMime() {
    if (!window.MediaRecorder) return null;
    const list = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/aac'];
    for (const m of list) { try { if (MediaRecorder.isTypeSupported(m)) return m; } catch (e) {} }
    return '';
  }
  const EXT = { 'audio/webm': 'webm', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/aac': 'aac' };

  function recorder(host, { onSend, sendLabel = 'أرسل', maxSec = 180, onState = () => {} }) {
    host.innerHTML = `
      <div class="rec-box stack">
        <div class="row">
          <button type="button" class="btn rec r-start">🎙️ سجّل</button>
          <button type="button" class="btn r-stop" hidden>⏹ وكّف <span class="r-time en">0:00</span></button>
          <label class="btn ghost sm r-file-l" hidden>ارفع ملف صوت<input type="file" accept="audio/*" class="r-file" hidden></label>
        </div>
        <div class="r-review stack" hidden>
          <audio controls class="r-audio"></audio>
          <div class="row">
            <button type="button" class="btn y r-send">${sendLabel}</button>
            <button type="button" class="btn ghost sm r-again">↺ سجّل من جديد</button>
          </div>
        </div>
        <div class="err small r-err" role="alert"></div>
      </div>`;
    const $ = s => host.querySelector(s);
    let rec, chunks = [], blob = null, stream, timer, sec = 0;
    const mime = pickMime();
    if (mime === null) { $('.r-start').hidden = true; $('.r-file-l').hidden = false; }

    function reset() {
      blob = null; $('.r-review').hidden = true; $('.r-start').hidden = mime === null; $('.r-stop').hidden = true; $('.r-err').textContent = '';
      onState('idle');
    }
    function ready(b) {
      blob = b; $('.r-audio').src = URL.createObjectURL(b);
      $('.r-review').hidden = false; $('.r-start').hidden = true; $('.r-stop').hidden = true;
      onState('review');
    }
    function stopAll() {
      clearInterval(timer);
      if (stream) stream.getTracks().forEach(t => t.stop());
    }
    $('.r-start').onclick = async () => {
      $('.r-err').textContent = '';
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
      catch (e) {
        $('.r-err').textContent = 'ما كدرنا نفتح المايك. اسمح للموقع يستخدم المايكروفون من إعدادات المتصفح، أو ارفع ملف صوت.';
        $('.r-file-l').hidden = false; return;
      }
      chunks = [];
      try { rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream); }
      catch (e) { rec = new MediaRecorder(stream); }
      rec.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = () => { stopAll(); const type = (rec.mimeType || mime || 'audio/webm').split(';')[0]; ready(new Blob(chunks, { type })); };
      rec.start(1000);
      sec = 0; $('.r-time').textContent = '0:00';
      $('.r-start').hidden = true; $('.r-stop').hidden = false;
      timer = setInterval(() => {
        sec++; $('.r-time').textContent = Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0');
        if (sec >= maxSec) rec.stop();
      }, 1000);
    };
    $('.r-stop').onclick = () => { if (rec && rec.state !== 'inactive') rec.stop(); };
    $('.r-again').onclick = reset;
    $('.r-file').onchange = e => { const f = e.target.files[0]; if (f) ready(f); };
    $('.r-send').onclick = async () => {
      if (!blob) return;
      const btn = $('.r-send'); btn.disabled = true; const old = btn.innerHTML; btn.innerHTML = '<span class="spin"></span>';
      try {
        const type = (blob.type || 'audio/webm').split(';')[0];
        const name = blob.name || ('voice.' + (EXT[type] || 'webm'));
        await onSend(blob, name);
        reset();
      } catch (e) { $('.r-err').textContent = e.message || 'ما وصل، جرّب مرة ثانية.'; }
      finally { btn.disabled = false; btn.innerHTML = old; }
    };
    return { reset };
  }

  // show / hide password: an eye button inside every password field
  const EYE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6C3.9 8.3 2 12 2 12s3.6 7 10 7c1.9 0 3.5-.5 4.9-1.3"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
  function eyes(root) {
    (root || document).querySelectorAll('input[type="password"]:not([data-eye])').forEach(inp => {
      inp.dataset.eye = '1';
      const wrap = document.createElement('div'); wrap.className = 'pw-wrap';
      inp.parentNode.insertBefore(wrap, inp); wrap.appendChild(inp);
      const b = document.createElement('button'); b.type = 'button'; b.className = 'pw-eye';
      const set = shown => { inp.type = shown ? 'text' : 'password'; b.innerHTML = shown ? EYE_OFF : EYE;
        b.setAttribute('aria-label', shown ? 'اخفي الباسورد' : 'اظهر الباسورد'); b.setAttribute('aria-pressed', shown); };
      b.onclick = () => { set(inp.type === 'password'); inp.focus(); };
      set(false); wrap.appendChild(b);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => eyes()); else eyes();

  // ---- lecture videos (Bunny player): rewind 5 seconds, 0.75x speed, resume where you stopped, know when it ended ----
  let pjs = null;
  function loadPlayerJs() {
    if (window.playerjs) return Promise.resolve();
    if (!pjs) pjs = new Promise((ok, no) => {
      const s = document.createElement('script');
      s.src = 'https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js';
      s.onload = ok; s.onerror = no; document.head.appendChild(s);
    });
    return pjs;
  }
  function tools(rewind, setRate) {
    const bar = document.createElement('div'); bar.className = 'vtools';
    bar.innerHTML = '<button type="button" class="vbtn" data-a="back">⏪ رجّع 5 ثواني</button>' +
      '<button type="button" class="vbtn" data-a="speed" aria-pressed="false">🐢 السرعة: 1x</button>';
    let rate = 1;
    bar.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.a === 'back') return rewind();
      rate = rate === 1 ? 0.75 : 1; setRate(rate);
      b.textContent = '🐢 السرعة: ' + (rate === 1 ? '1x' : '0.75x'); b.setAttribute('aria-pressed', rate !== 1);
    });
    return bar;
  }
  function video(iframe, { key, token, pos = 0, done = false, onEnded } = {}) {
    if (!iframe || iframe.dataset.vt) return; iframe.dataset.vt = '1';
    const wrap = iframe.closest('.video,.lp-video') || iframe;
    let player = null, last = 0, dur = 0, sentAt = 0, ended = false;
    const save = fin => { if (key && token) call('/api/progress', { method: 'POST', json: { key, pos: last, dur, done: !!fin }, token }).catch(() => {}); };
    const bar = tools(() => player && player.getCurrentTime(t => player.setCurrentTime(Math.max(0, (t || 0) - 5))),
                      r => player && player.setPlaybackRate(r));
    bar.hidden = true; wrap.after(bar);
    loadPlayerJs().then(() => {
      player = new playerjs.Player(iframe);
      player.on('ready', () => {
        bar.hidden = false;
        let resumed = !(pos > 5 && !done);
        player.on('play', () => { if (!resumed) { resumed = true; player.setCurrentTime(pos); } });
        player.on('timeupdate', d => {
          last = d.seconds || last; dur = d.duration || dur;
          if (Date.now() - sentAt > 10000) { sentAt = Date.now(); save(false); }
        });
        player.on('pause', () => save(false));
        player.on('ended', () => { if (ended) return; ended = true; last = dur || last; save(true); if (onEnded) onEnded(); });
      });
    }).catch(() => {});
  }
  // the same two buttons for a voice clip (the imitation model)
  function audioTools(a) {
    if (!a || a.dataset.vt) return; a.dataset.vt = '1';
    a.after(tools(() => { a.currentTime = Math.max(0, a.currentTime - 5); }, r => { a.playbackRate = r; a.preservesPitch = true; }));
  }

  window.Learn = { API, store, esc, call, fileUrl, toast, when, recorder, eyes, video, audioTools };
})();
