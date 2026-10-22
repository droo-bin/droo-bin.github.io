// The signal on the home page, live. Any text is encoded as Bell 202 tones the way Smoke Signal sends it:
// six "mark" bits of preamble, then each character framed as a start bit (0), its eight bits lowest first, and
// a stop bit (1). A 1 is the mark tone (1200 Hz, the lazy wiggles), a 0 the space tone (2200 Hz, the tight
// ones), with the phase carried across bits so the wave never jumps.
//
// - Type in the box and the wave redraws for your text.
// - Point at (or tab to) a letter below the wave to light up its ten bits.
// - Left alone, the page keeps transmitting: a slow scan runs along the wave, lighting each letter as it passes.
// - "Have a listen" plays it at 300 baud; the letter being sent lights up as it goes.
//
// Without JavaScript the page keeps the wave drawn into it at build time.
(() => {
  const sig = document.querySelector('.signal');
  if (!sig) return;
  const caption = document.getElementById('signal-text');
  const readout = document.getElementById('signal-readout');
  const input = document.getElementById('signal-input');
  const btn = document.getElementById('hear');
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = matchMedia('(max-width: 680px)');
  const DEFAULT = 'droo-bin', PRE = 6, PER = 24, MAX = 16;

  /* ---------- encoding ---------- */

  const clean = (s) => [...String(s)].map((c) => (c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127 ? c : '?')).join('').slice(0, MAX);

  /** Bits for a run of characters, with the preamble when it starts the message. */
  function frame(chars, preamble) {
    const bits = preamble ? Array(PRE).fill(1) : [];
    const starts = [];
    for (const ch of chars) {
      starts.push(bits.length);
      const c = ch.charCodeAt(0);
      bits.push(0);
      for (let b = 0; b < 8; b++) bits.push((c >> b) & 1);
      bits.push(1);
    }
    return { bits, starts };
  }

  /** The SVG path for some bits, starting at a given phase; returns the phase it ends on. */
  function wave(bits, phase) {
    const pts = [];
    let ph = phase;
    for (let i = 0; i < bits.length; i++) {
      const step = (2 * Math.PI * (bits[i] ? 1200 : 2200)) / (1200 * PER);
      for (let s = 0; s < PER; s++) { pts.push(`${i * PER + s},${(50 - 38 * Math.sin(ph)).toFixed(1)}`); ph += step; }
    }
    pts.push(`${bits.length * PER},${(50 - 38 * Math.sin(ph)).toFixed(1)}`);
    return { d: 'M' + pts.join('L'), phase: ph };
  }

  const svg = (tag, attrs) => { const n = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); return n; };
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

  /* ---------- drawing ---------- */

  let text = DEFAULT, rows = [], all = [];   // all: [{ch, row, start, bits}] in sending order

  function draw(animate) {
    const chars = [...text];
    const per = narrow.matches ? 4 : 8;
    const lines = [];
    for (let i = 0; i < chars.length; i += per) lines.push(chars.slice(i, i + per));
    if (!lines.length) lines.push([]);
    sig.replaceChildren();
    sig.classList.add('live');
    rows = []; all = [];
    let phase = 0, offset = 0;
    lines.forEach((line, r) => {
      const { bits, starts } = frame(line, r === 0);
      const w = wave(bits, phase);
      phase = w.phase;
      const row = el('div', 'signal-row line');
      const s = svg('svg', { class: 'signal-wave', viewBox: `0 0 ${bits.length * PER} 100`, preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' });
      s.append(svg('path', { d: w.d, 'vector-effect': 'non-scaling-stroke' }));
      const band = el('div', 'frame');
      const head = el('div', 'playhead');
      const labels = el('div', 'signal-chars');
      line.forEach((ch, i) => {
        const pct = (n) => (n / bits.length) * 100;
        const sp = el('span', null, ch === ' ' ? '␣' : ch);
        sp.style.left = pct(starts[i]) + '%';
        sp.style.width = pct(10) + '%';
        sp.tabIndex = 0;
        sp.setAttribute('role', 'button');
        const item = { ch, row: rows.length, start: starts[i], n: bits.length, bitsAt: offset + starts[i], label: sp };
        sp.setAttribute('aria-label', `${describe(ch)}`);
        sp.addEventListener('pointerenter', () => show(item));
        sp.addEventListener('focus', () => show(item));
        sp.addEventListener('pointerleave', () => show(focused()));
        sp.addEventListener('blur', () => setTimeout(() => show(focused()), 0));
        labels.append(sp);
        all.push(item);
      });
      row.append(s, band, head, labels);
      sig.append(row);
      rows.push({ row, band, head, n: bits.length, from: offset });
      offset += bits.length;
    });
    // Every bit is the same width on every line, so a short last line is short rather than stretched.
    const widest = Math.max(...rows.map((r) => r.n));
    for (const r of rows) r.row.style.width = (r.n / widest) * 100 + '%';
    sig.dataset.bits = rows.map((r, i) => frame(lines[i], i === 0).bits.join('')).join('');
    if (caption) caption.textContent = text;
    if (animate && !still.matches) {
      sig.classList.remove('drawn');
      sig.classList.add('waiting');
      requestAnimationFrame(() => requestAnimationFrame(() => { sig.classList.add('drawn'); sig.classList.remove('waiting'); }));
    }
  }

  /** Words for a character's frame, as it appears on the wave. */
  function describe(ch) {
    const c = ch.charCodeAt(0);
    const bits = [];
    for (let b = 0; b < 8; b++) bits.push((c >> b) & 1);
    return `“${ch}” is character ${c}, sent lowest bit first: start 0, ${bits.join('')}, stop 1`;
  }

  /** The letter with keyboard focus, if any: it stays lit when the pointer wanders off. */
  const focused = () => all.find((a) => a.label === document.activeElement) || null;

  /** Light up one character's ten bits (or none). */
  function show(item) {
    for (const r of rows) r.band.classList.remove('on');
    for (const a of all) a.label.classList.remove('on');
    if (!item) { if (readout) readout.textContent = ''; return; }
    const r = rows[item.row];
    r.band.style.left = (item.start / item.n) * 100 + '%';
    r.band.style.width = (10 / item.n) * 100 + '%';
    r.band.classList.add('on');
    item.label.classList.add('on');
    if (readout) readout.textContent = describe(item.ch);
  }

  /* ---------- typing your own ---------- */

  if (input) {
    input.closest('.signal-try').hidden = false;
    let t = 0;
    input.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const v = clean(input.value);
        const next = v.trim() ? v : DEFAULT;
        if (next === text) return;
        stop();
        text = next;
        draw(true);
        if (btn) btn.textContent = 'Have a listen';
      }, 90);
    });
  }

  /* ---------- sound ---------- */

  const AC = window.AudioContext || window.webkitAudioContext;
  let ac = null, raf = 0;
  function stop() {
    cancelAnimationFrame(raf);
    if (ac) { try { ac.close(); } catch (e) { /* already closed */ } ac = null; }
    sig.classList.remove('playing');
    for (const r of rows) r.head.classList.remove('on');
    show(null);
  }
  if (btn && AC) {
    btn.hidden = false;
    btn.addEventListener('click', () => {
      if (ac) { stop(); btn.textContent = 'Once more'; return; }
      ac = new AC();
      const bits = sig.dataset.bits.split('').map(Number);
      const baud = 300, lead = 0.35, t0 = ac.currentTime + 0.05, start = t0 + lead;
      const osc = ac.createOscillator(), gain = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t0);
      bits.forEach((b, i) => osc.frequency.setValueAtTime(b ? 1200 : 2200, start + i / baud));
      const end = start + bits.length / baud;
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.12, t0 + 0.02);
      gain.gain.setValueAtTime(0.12, end - 0.02);
      gain.gain.linearRampToValueAtTime(0, end);
      osc.connect(gain).connect(ac.destination);
      osc.start(t0); osc.stop(end + 0.05);
      btn.textContent = 'Stop';
      sig.classList.add('playing');
      const ctx = ac;
      // Follow the sound: a playhead across the row being sent, and the letter being sent lit up.
      const tick = () => {
        if (ctx !== ac) return;
        const bit = (ctx.currentTime - start) * baud;
        if (bit >= 0 && bit < bits.length) {
          const r = rows.find((x) => bit >= x.from && bit < x.from + x.n);
          for (const x of rows) x.head.classList.toggle('on', x === r);
          if (r && !still.matches) r.head.style.left = ((bit - r.from) / r.n) * 100 + '%';
          const cur = all.find((a) => bit >= a.bitsAt && bit < a.bitsAt + 10);
          if (cur) show(cur);
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      osc.onended = () => { if (ctx === ac) { stop(); btn.textContent = 'Once more'; } };
    });
  }

  /* ---------- idle: the page keeps transmitting ---------- */
  // A slow scan along the wave, lighting each letter as it passes, then a pause before it goes again. It
  // steps aside whenever you're doing something (pointing at the wave, typing, playing), and doesn't run off
  // screen, in a background tab or with reduced motion.
  let pointing = false, onScreen = true, scanFrame = 0;
  sig.addEventListener('pointerenter', () => { pointing = true; });
  sig.addEventListener('pointerleave', () => { pointing = false; });
  if ('IntersectionObserver' in window) new IntersectionObserver((es) => { onScreen = es[0].isIntersecting; }).observe(sig);
  const busy = () => ac || pointing || !onScreen || document.hidden || still.matches ||
    (document.activeElement && (document.activeElement === input || sig.contains(document.activeElement)));
  function clearScan() {
    for (const r of rows) r.head.classList.remove('scan');
    for (const a of all) a.label.classList.remove('lit');
  }
  const scan = (now) => {
    scanFrame = requestAnimationFrame(scan);
    if (busy()) { clearScan(); return; }
    const total = rows.reduce((n, r) => n + r.n, 0);
    const sweep = Math.max(5, total / 16), rest = 2.5;          // seconds
    const t = (now / 1000) % (sweep + rest);
    if (t > sweep) { clearScan(); return; }
    const bit = (t / sweep) * total;
    const r = rows.find((x) => bit >= x.from && bit < x.from + x.n);
    for (const x of rows) x.head.classList.toggle('scan', x === r);
    if (r) r.head.style.left = ((bit - r.from) / r.n) * 100 + '%';
    for (const a of all) a.label.classList.toggle('lit', bit >= a.bitsAt && bit < a.bitsAt + 10);
  };

  narrow.addEventListener('change', () => { stop(); draw(false); });
  draw(true);
  // Start scanning once the wave has drawn in.
  setTimeout(() => { scanFrame = requestAnimationFrame(scan); }, still.matches ? 0 : 1600);
})();
