// The moving parts of the home page below the signal, each started when it scrolls into view:
// - "Lately" numbers count up from nothing.
// - The project drawings play (the mast transmits, the stick splits and rejoins, the lens moves over the bars).
// With reduced motion everything is simply shown in its finished state.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = (n) => Math.round(n).toLocaleString('en-GB');

  /* ---------- counting up ---------- */

  const counts = [...document.querySelectorAll('.count[data-to]')];
  for (const c of counts) c.textContent = still ? fmt(+c.dataset.to) : '0';
  function countUp(c) {
    const to = +c.dataset.to, dur = 1600, t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      c.textContent = fmt(to * e);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- start things as they come into view ---------- */

  const targets = [...document.querySelectorAll('.glyph, .tally')];
  if (still || !('IntersectionObserver' in window)) {
    for (const t of targets) t.classList.add('in');
    for (const c of counts) c.textContent = fmt(+c.dataset.to);
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const t = e.target;
      // The drawings loop only while they're on screen; the rest run once.
      if (t.classList.contains('glyph')) { t.classList.toggle('in', e.isIntersecting); continue; }
      if (!e.isIntersecting) continue;
      t.classList.add('in');
      if (t.classList.contains('tally')) t.querySelectorAll('.count').forEach((c, i) => setTimeout(() => countUp(c), i * 120));
      io.unobserve(t);
    }
  }, { threshold: 0.35 });
  for (const t of targets) io.observe(t);
})();
