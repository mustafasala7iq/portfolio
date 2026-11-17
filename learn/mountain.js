// The chapter mountain for the platform: one camp per lecture, the climber stands at the newest open lecture.
// Same drawing as the workbook's journey map, so the course keeps one look.
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const SHORT = {
    1: ['تعرّف بنفسك', 'تعرّف الآخرين', 'يومك', 'الطلب المؤدب', 'المطعم', 'الاتجاهات', 'المطار', 'رأيك', 'القراءة والكتابة', 'تحدي الفيديو'],
    2: ['أقسام الكلام', 'الشجرة النحوية', 'أدوات التعريف', 'in · on · at', 'الأزمنة الـ12', 'تحدي القواعد'],
    3: ['الإيميل', 'المقابلة', 'Small talk', 'توافق وتعارض', 'الشكاوى', 'الاجتماعات', 'القصة', 'كلمات الربط', 'أغلاطنا', 'Paraphrasing', 'القراءة والكتابة', 'التحدي النهائي'],
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(tag, a, par) { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (par) par.appendChild(e); return e; }

  function points(total, H) {
    const K = H / 540, P = [], yb = H - 70, ys = 92 * K, y9 = ys + 118;
    for (let c = 0; c < total; c++) {
      const y = c === total - 1 ? ys : yb - (yb - y9) * c / Math.max(1, total - 2), yu = y / K;
      if (c === total - 1) { P.push([222, y]); break; }
      const xl = 20 + (500 - yu) / 426 * 202, xr = 410 - (470 - yu) / 396 * 188;
      P.push([c % 2 === 0 ? Math.round(xl + 58) : Math.round(xr - 58), Math.round(y)]);
    }
    return P;
  }

  // camps: [{n, title, state: 'done'|'open'|'cur'|'locked', day}]
  window.drawMountain = function (box, { chapter, camps, onCamp }) {
    const total = camps.length, H = total > 8 ? 760 : 620, K = H / 540;
    const P = points(total, H), short = SHORT[chapter] || [];
    box.innerHTML = '';
    const svg = el('svg', { viewBox: `0 0 400 ${H}`, class: 'mtn-svg', role: 'img', 'aria-label': 'رحلتك: ' + total + ' محطات من الأسفل للقمة' });
    el('rect', { x: 0, y: 0, width: 400, height: H, rx: 22, class: 'mtn-sky' }, svg);
    el('circle', { cx: 330, cy: 72, r: 30, class: 'mtn-sun' }, svg);
    const terr = el('g', { transform: `scale(1 ${K})` }, svg);
    el('path', { d: 'M-10 540 L-10 330 L40 250 L78 300 L120 230 L170 330 L170 540Z', class: 'mtn-far' }, terr);
    el('path', { d: 'M250 540 L280 330 L330 240 L360 280 L410 200 L410 540Z', class: 'mtn-far' }, terr);
    el('path', { d: 'M-10 545 L20 500 L58 452 L84 404 L70 380 L112 316 L140 270 L132 246 L176 170 L200 124 L222 74 L246 118 L262 140 L258 160 L300 232 L322 286 L344 330 L336 352 L372 418 L410 470 L410 545Z', class: 'mtn-main' }, terr);
    el('path', { d: 'M176 170 L200 124 L222 74 L246 118 L262 140 L250 150 L236 136 L222 154 L208 140 L194 162 Z', class: 'mtn-snow' }, terr);
    el('path', { d: 'M58 452 L84 404 L104 430 Z M300 232 L322 286 L304 270 Z M112 316 L140 270 L150 300 Z', class: 'mtn-shade' }, terr);
    let d = `M${P[0][0]} ${P[0][1]}`;
    for (let i = 1; i < P.length; i++) { const a = P[i - 1], b = P[i], my = (a[1] + b[1]) / 2; d += ` C${a[0]} ${my - 6} ${b[0]} ${my + 6} ${b[0]} ${b[1]}`; }
    el('path', { d, class: 'mtn-trail' }, svg);
    const prog = el('path', { d, class: 'mtn-prog' }, svg);
    const fl = el('g', { class: 'mtn-flag' }, svg);
    el('line', { x1: 222, y1: 74 * K, x2: 222, y2: 74 * K - 46 }, fl);
    el('path', { d: `M222 ${74 * K - 46} L276 ${74 * K - 38} L222 ${74 * K - 28}Z`, class: 'mtn-flag-cloth' }, fl);

    let cur = camps.findIndex(c => c.state === 'cur'); if (cur < 0) cur = 0;
    P.forEach((p, i) => {
      const c = camps[i], last = i === total - 1;
      const cls = c.state === 'done' ? 'done' : c.state === 'cur' ? 'cur' : c.state === 'open' ? 'open' : 'todo';
      const g = el('g', { class: 'mtn-camp ' + cls, tabindex: 0, role: 'button', 'aria-label': `المحطة ${c.n}: ${c.title}` }, svg);
      if (c.state === 'cur' && !reduce) el('circle', { cx: p[0], cy: p[1], r: 26, class: 'mtn-pulse' }, g);
      el('circle', { cx: p[0], cy: p[1], r: last ? 21 : 18, class: 'mtn-dot' }, g);
      const tx = el('text', { x: p[0], y: p[1] + 6, class: 'mtn-num' }, g);
      tx.textContent = c.state === 'done' ? '✓' : c.state === 'locked' ? '🔒' : (last ? '🎬' : String(c.n));
      const side = last ? 'top' : (p[0] < 222 ? 'r' : 'l');
      const lx = side === 'r' ? p[0] + 28 : side === 'l' ? p[0] - 28 : p[0], ly = side === 'top' ? p[1] + 44 : p[1] + 5;
      const lab = el('g', { class: 'mtn-lab ' + side }, g);
      el('text', { x: lx, y: ly, class: 'mtn-lab-t' }, lab).textContent = short[i] || c.title;
      const go = () => onCamp && onCamp(c);
      g.addEventListener('click', go);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    const cl = el('g', { class: 'mtn-climber' }, svg);
    el('circle', { r: 15, class: 'mtn-climber-b' }, cl);
    el('text', { y: 6, class: 'mtn-climber-e' }, cl).textContent = '🧗';
    box.appendChild(svg);
    // white chips behind the labels, kept inside the frame
    svg.querySelectorAll('.mtn-lab').forEach(lab => {
      const t = lab.querySelector('.mtn-lab-t');
      try {
        const b = t.getBBox();
        const r = el('rect', { x: b.x - 8, y: b.y - 4, width: b.width + 16, height: b.height + 8, rx: 9, class: 'mtn-chip' });
        lab.insertBefore(r, t);
        if (b.x - 8 < 4) lab.setAttribute('transform', `translate(${4 - (b.x - 8)} 0)`);
        if (b.x + b.width + 8 > 396) lab.setAttribute('transform', `translate(${396 - (b.x + b.width + 8)} 0)`);
      } catch (e) {}
    });
    // trail filled up to the climber
    const L = prog.getTotalLength(), at = [0];
    for (let i = 1; i < P.length; i++) {
      let best = at[i - 1], bd = 1e9;
      for (let l = at[i - 1]; l <= L; l += 2) { const q = prog.getPointAtLength(l), dd = Math.abs(q.x - P[i][0]) + Math.abs(q.y - P[i][1]); if (dd < bd) { bd = dd; best = l; } if (dd > bd + 40) break; }
      at.push(best);
    }
    at[P.length - 1] = L;
    prog.style.strokeDasharray = L;
    const place = len => { prog.style.strokeDashoffset = L - len; const q = prog.getPointAtLength(len); cl.setAttribute('transform', `translate(${q.x} ${q.y - 30})`); };
    const target = at[cur];
    if (reduce || cur === 0) { place(target); return; }
    // climb from the base the first time the map is on screen
    place(0);
    let t0 = null;
    const step = ts => { if (!t0) t0 = ts; const k = Math.min(1, (ts - t0) / (900 + 220 * cur)), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; place(target * e); if (k < 1) requestAnimationFrame(step); };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { if (es.some(x => x.isIntersecting)) { io.disconnect(); requestAnimationFrame(step); } });
      io.observe(svg);
    } else place(target);
  };
})();
