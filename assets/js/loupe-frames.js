// Loupe charts in posts: a chart that sets its own height (a year's calendar, say, which runs down the page
// on a phone) tells us how tall it needs to be, and its frame is resized to fit. Only frames on this page
// are touched, and only to a sensible height.
addEventListener('message', (e) => {
  const d = e.data;
  if (!d || d.loupe !== 'height' || typeof d.height !== 'number') return;
  for (const f of document.querySelectorAll('iframe.loupe')) {
    if (f.contentWindow === e.source) f.style.height = Math.max(160, Math.min(2400, Math.round(d.height))) + 'px';
  }
});
