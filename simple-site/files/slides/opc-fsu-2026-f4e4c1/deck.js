/* ═══════════════════════════════════════════════════════════════════
   deck.js — HTML slide template behaviour
   Scale-to-fit stage · fragments · hash navigation & hyperlinks ·
   appendix numbering · overview · notes · clock · blackout · print.
   You should not need to edit this file; see slides.html for usage.
   ═══════════════════════════════════════════════════════════════════ */
(function () {
'use strict';

/* KaTeX macros available in every formula — add your own here. */
const MACROS = {
  '\\E':      '\\mathbb{E}',
  '\\R':      '\\mathbb{R}',
  '\\N':      '\\mathbb{N}',
  '\\1':      '\\mathbf{1}',
  '\\Pr':     '\\operatorname{Pr}',
  '\\argmax': '\\operatorname*{arg\\,max}',
  '\\argmin': '\\operatorname*{arg\\,min}',
  '\\supp':   '\\operatorname{supp}',
  '\\eps':    '\\varepsilon',
  '\\abs':    '\\left|#1\\right|',
  '\\norm':   '\\left\\|#1\\right\\|',
  '\\set':    '\\left\\{#1\\right\\}',
};

const html = document.documentElement;
const qs   = new URLSearchParams(location.search);

/* ?theme=mannheim&school=bwl&size=4:3&layout=center&print&noappendix override the <html> attributes (handy for demos) */
for (const k of ['theme', 'school', 'size', 'footer', 'minutes', 'layout']) if (qs.has(k)) html.dataset[k] = qs.get(k);
const LAYOUTS = ['top', 'center', 'spread'];                       // vertical layout of .body, see style.css
if (html.dataset.size === '4:3') html.style.setProperty('--sw', '960px');

document.addEventListener('DOMContentLoaded', init);

function init () {
  /* ── 0. stage + overlays (so slides.html only needs #deck) ── */
  const deck  = document.getElementById('deck');
  const stage = el('div', { id: 'stage' });
  deck.parentNode.insertBefore(stage, deck);
  stage.appendChild(deck);
  const notesBox = el('div', { id: 'notes' });
  const clockBox = el('div', { id: 'clock' });
  const blackBox = el('div', { id: 'black' });
  const jumpBox  = el('div', { id: 'jump' });
  const helpBox  = el('div', { id: 'help' });
  const printBox = el('div', { id: 'printbox' });
  document.body.append(notesBox, clockBox, blackBox, jumpBox, helpBox, printBox);
  helpBox.innerHTML = HELP_HTML;
  printBox.innerHTML = PRINT_HTML;

  /* ── 1. math ── */
  if (typeof renderMathInElement !== 'undefined') {
    renderMathInElement(deck, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
        { left: '$',  right: '$',  display: false },
      ],
      ignoredClasses: ['nomath'],
      macros: MACROS,
      throwOnError: false,
    });
  } else {
    console.warn('deck: KaTeX not loaded — check lib/katex/');
  }

  /* ── 2. slide bookkeeping ── */
  const slides = Array.from(deck.querySelectorAll(':scope > .slide'));
  if (!slides.length) return;
  const isCover = s => s.classList.contains('title-slide') || s.classList.contains('section-slide');
  let appendixStart = slides.findIndex(s => s.classList.contains('appendix'));
  if (appendixStart < 0) appendixStart = slides.length;
  slides.forEach((s, k) => { if (k >= appendixStart) s.classList.add('appendix'); });
  const lastMain = Math.max(1, appendixStart - 1);                 // number of the last main slide

  const label = k => {                                              // "7" or "A2" or "" (covers)
    if (isCover(slides[k])) return '';
    return k < appendixStart ? String(k) : 'A' + (k - appendixStart);
  };
  const sectionLabel = k => {
    for (let j = k; j >= 0; j--) {
      if (slides[j].classList.contains('title-slide')) return '';
      if (slides[j].classList.contains('section-slide')) return slides[j].querySelector('.st')?.textContent.trim() || '';
    }
    return '';
  };
  /* per-slide chrome (static per slide, so it also prints and shows in the overview) */
  slides.forEach((s, k) => {
    s.setAttribute('aria-hidden', 'true');
    s.appendChild(el('div', { className: 'ov-num', textContent: label(k) || (k === 0 ? 'Title' : '§') }));
    if (isCover(s)) return;
    const c = el('div', { className: 'chrome' });
    c.appendChild(el('span', { className: 'sec', textContent: sectionLabel(k) }));
    if (html.dataset.footer) c.appendChild(el('span', { className: 'brand', textContent: html.dataset.footer }));
    c.appendChild(el('span', { className: 'num', textContent: k < appendixStart ? `${k} / ${lastMain}` : `Appendix · ${label(k)}` }));
    const p = el('div', { className: 'prog' });
    p.style.width = (k < appendixStart ? (k / lastMain) * 100 : 100) + '%';
    c.appendChild(p);
    s.appendChild(c);
  });

  /* ── 3. fragments ──
     Every direct child of .body is one step; a <ul>/<ol> contributes its <li>s;
     .steps / .swap containers contribute their children; .now shows at once;
     .step anywhere adds that element as a step of its own.                     */
  const SKIP = ['now', 'spacer', 'notes', 'chrome', 'ov-num'];
  function collect (container, out) {
    for (const ch of container.children) {
      if (SKIP.some(c => ch.classList.contains(c))) continue;
      const list = ch.tagName === 'UL' || ch.tagName === 'OL';
      if (list || ch.classList.contains('steps') || ch.classList.contains('swap')) collect(ch, out);
      else out.push(ch);
    }
  }
  function fragEls (slide) {
    if (slide._fr) return slide._fr;
    const out = [];
    if (!slide.classList.contains('static')) {
      const body = slide.querySelector('.body');
      if (body) collect(body, out);
      slide.querySelectorAll('.step').forEach(e => { if (!out.includes(e)) out.push(e); });
      out.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1);
    }
    out.forEach(e => e.classList.add('fr'));
    return (slide._fr = out);
  }
  slides.forEach(fragEls);
  function reveal (slide, count) {
    fragEls(slide).forEach((e, k) => { e.classList.toggle('on', k < count); e.classList.remove('off'); });
    slide.querySelectorAll('.swap').forEach(sw => {
      const on = Array.from(sw.children).filter(c => c.classList.contains('on'));
      on.slice(0, -1).forEach(c => c.classList.add('off'));
    });
  }

  /* ── 4. navigation ── */
  let i = -1, f = 0;
  const stack = [];                                                  // return stack for hyperlink jumps
  const slideHash = k => '#' + (slides[k].id || k);
  function resolve (hash) {                                          // '#id' | '#7' | '#A2' → index
    const h = decodeURIComponent((hash || '').replace(/^#/, ''));
    if (!h) return 0;
    const byId = slides.findIndex(s => s.id === h);
    if (byId >= 0) return byId;
    if (/^\d+$/.test(h)) return clamp(+h);
    const m = /^[aA](\d+)$/.exec(h);
    if (m && appendixStart < slides.length) return clamp(appendixStart + +m[1]);
    return -1;
  }
  const clamp = n => Math.max(0, Math.min(slides.length - 1, n));

  function go (n, dir, opts = {}) {
    n = clamp(n);
    if (n === i) return;
    dir = dir || (n > i ? 1 : -1);
    const cur = slides[i], nxt = slides[n];
    if (cur) {
      cur.style.setProperty('--exit', (dir > 0 ? -44 : 44) + 'px');
      cur.classList.remove('active'); cur.classList.add('exit');
      cur.setAttribute('aria-hidden', 'true');
      setTimeout(() => cur.classList.remove('exit'), 460);
    }
    nxt.classList.remove('exit');
    nxt.style.setProperty('--enter', (dir > 0 ? 44 : -44) + 'px');
    i = n;
    f = (opts.allFragments || dir < 0) ? fragEls(nxt).length : 0;
    reveal(nxt, f);
    void nxt.offsetWidth;
    nxt.classList.add('active');
    nxt.setAttribute('aria-hidden', 'false');
    if (!opts.silent) history[opts.push ? 'pushState' : 'replaceState'](null, '', slideHash(i));
    const notes = nxt.querySelector('.notes');
    notesBox.innerHTML = notes ? notes.innerHTML : '';
    if (i > 0 && !clock.started) clock.start();
    if (html.classList.contains('overview')) nxt.scrollIntoView({ block: 'nearest' });
  }
  function next () {
    if (html.classList.contains('overview')) return go(i + 1, 1);
    const total = fragEls(slides[i]).length;
    if (f < total) { f++; reveal(slides[i], f); }
    else if (i < slides.length - 1) go(i + 1, 1);
  }
  function prev () {
    if (html.classList.contains('overview')) return go(i - 1, -1);
    if (f > 0) { f--; reveal(slides[i], f); }
    else if (i > 0) go(i - 1, -1);
  }
  function jump (target) {                                           // hyperlink / typed jump, remembers origin
    const n = typeof target === 'number' ? target : resolve(target);
    if (n < 0 || n === i) return;
    stack.push(i);
    go(n, 1, { push: true, allFragments: true });
  }
  function back () {
    if (!stack.length) return;
    go(stack.pop(), -1, { push: true, allFragments: true });
  }
  function onHash () {                                               // browser back/forward or manual URL edit
    const n = resolve(location.hash);
    if (n >= 0 && n !== i) go(n, n > i ? 1 : -1, { silent: true, allFragments: true });
    unscroll();
  }
  window.addEventListener('popstate', onHash);
  window.addEventListener('hashchange', onHash);

  /* ── 5. scale to fit ── */
  function fit () {
    const sw = parseFloat(getComputedStyle(html).getPropertyValue('--sw')) || 1280;
    const sh = parseFloat(getComputedStyle(html).getPropertyValue('--sh')) || 720;
    stage.style.setProperty('--s', Math.min(innerWidth / sw, innerHeight / sh));
    const cols = innerWidth > 1500 ? 4 : innerWidth > 900 ? 3 : 2;
    html.style.setProperty('--ov-cols', cols);
    html.style.setProperty('--ov-zoom', innerWidth / (cols * sw + (cols - 1) * 70 + 140));
  }
  window.addEventListener('resize', fit);
  fit();
  /* a #slide-id in the URL makes the browser scroll the overflow:hidden #deck/#stage
     towards that element (by the slide's 44px enter offset); undo that */
  function unscroll () {
    if (html.classList.contains('overview') || html.classList.contains('print')) return;
    deck.scrollLeft = deck.scrollTop = 0; stage.scrollLeft = stage.scrollTop = 0; scrollTo(0, 0);
  }
  deck.addEventListener('scroll', unscroll);
  stage.addEventListener('scroll', unscroll);
  unscroll();

  /* ── 6. overview, blackout, notes, clock, help, print ── */
  const toggle = cls => html.classList.toggle(cls);
  function overview (on) {
    html.classList.toggle('overview', on);
    if (on) { fit(); slides[i].scrollIntoView({ block: 'center' }); }
    else window.scrollTo(0, 0);
  }
  const clock = {
    started: false, t0: 0, iv: null,
    start () { this.started = true; this.t0 = Date.now(); this.iv = setInterval(() => this.tick(), 1000); this.tick(); },
    reset () { this.t0 = Date.now(); this.tick(); },
    tick () {
      const s = Math.floor((Date.now() - this.t0) / 1000);
      const mm = n => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');
      const lim = +html.dataset.minutes * 60;
      const now = new Date();
      let t = mm(s);
      if (lim) { const r = lim - s; t += r >= 0 ? `  (−${mm(r)})` : `  <span class="over">(+${mm(-r)})</span>`; }
      clockBox.innerHTML = `${t}   ·   ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    },
  };
  /* ── 6b. print modes: slides (one 16:9 page each) or handout (n per sheet, landscape) ──
     ⌘P / Ctrl-P opens a chooser; File → Print uses the last mode (default: slides).
     ?print previews slides, ?print&handout=4 (or 6) previews the handout, &paper=letter.   */
  const PAPER = { a4: [1122.5, 793.7], letter: [1056, 816] };          // landscape, CSS px @96dpi
  const print = { mode: 'steps', n: 4, paper: localStorage.getItem('deck-paper') || 'a4' };
  const pageCSS = el('style', { id: 'page-size' });
  document.head.appendChild(pageCSS);
  function unwrapSheets () {
    deck.querySelectorAll(':scope > .sheet').forEach(sh => { while (sh.firstChild) deck.appendChild(sh.firstChild); sh.remove(); });
    html.classList.remove('handout');
  }
  /* "as presented": one page per step. Each slide with fragments is replaced by clones,
     one per reveal state; the original is hidden until unwrapSteps(). */
  function unwrapSteps () {
    deck.querySelectorAll(':scope > .slide.step-clone').forEach(c => c.remove());
    deck.querySelectorAll(':scope > .slide.step-src').forEach(s => s.classList.remove('step-src'));
    html.classList.remove('steps');
  }
  function wrapSteps () {
    unwrapSteps();
    slides.forEach(s => {
      const n = fragEls(s).length;
      if (!n) return;
      const first = s.querySelector('.now') ? 0 : 1;            // a bare title page only if something shows at once
      for (let k = first; k <= n; k++) {
        const c = s.cloneNode(true);
        c.removeAttribute('id'); c.classList.add('step-clone'); c.classList.remove('active');
        const frs = Array.from(c.querySelectorAll('.fr'));
        frs.forEach((e, j) => { e.classList.toggle('on', j < k); e.classList.remove('off'); });
        c.querySelectorAll('.swap').forEach(sw => {
          const on = Array.from(sw.children).filter(x => x.classList.contains('on'));
          on.slice(0, -1).forEach(x => x.classList.add('off'));
        });
        deck.insertBefore(c, s);
      }
      s.classList.add('step-src');
    });
    html.classList.add('steps');
  }
  function wrapSheets (n) {
    unwrapSheets();
    const [W, H] = PAPER[print.paper];
    const pad = 38, gap = 16;                                             // 1 cm margin, 4 mm gutter
    const cols = n === 6 ? 3 : (n === 2 ? 1 : 2), rows = n / cols;   // 4 → 2×2, 6 → 3×2 (landscape), 2 → 1×2 (portrait)
    const portrait = n === 2;
    const sw = portrait ? H : W, sh = portrait ? W : H;
    const cw = (sw - 2 * pad - (cols - 1) * gap) / cols, ch = (sh - 2 * pad - (rows - 1) * gap) / rows;
    const z  = Math.min(cw / 1280, ch / 720);
    html.style.setProperty('--sheet-w', sw + 'px'); html.style.setProperty('--sheet-h', sh + 'px');
    html.style.setProperty('--sheet-cols', cols);     html.style.setProperty('--hz', z.toFixed(4));
    const vis = slides.filter(s => !(html.classList.contains('hide-appendix') && s.classList.contains('appendix')));
    for (let i = 0; i < vis.length; i += n) {
      const sheet = el('div', { className: 'sheet' });
      deck.insertBefore(sheet, vis[i]);
      vis.slice(i, i + n).forEach(s => sheet.appendChild(s));
    }
    html.classList.add('handout');
    return [sw, sh];
  }
  function setPrintMode (mode, n, paper) {
    print.mode = mode; if (n) print.n = n; if (paper) { print.paper = paper; localStorage.setItem('deck-paper', paper); }
    html.classList.add('print');
    unwrapSheets(); unwrapSteps();
    if (mode === 'handout') {
      const [sw, sh] = wrapSheets(print.n);
      /* named paper sizes: Safari honours these more reliably than pixel sizes */
      pageCSS.textContent = `@page{size:${print.paper === 'letter' ? 'letter' : 'A4'} ${sw > sh ? 'landscape' : 'portrait'};margin:0}`;
    } else {
      if (mode === 'steps') wrapSteps();
      pageCSS.textContent = '@page{size:1280px 720px;margin:0}';
    }
    window.scrollTo(0, 0);
  }
  function exitPrint () { unwrapSheets(); unwrapSteps(); html.classList.remove('print'); }
  function showPrintBox () {
    printBox.querySelectorAll('[data-paper]').forEach(b => b.classList.toggle('on', b.dataset.paper === print.paper));
    html.classList.add('show-print');
  }
  printBox.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.paper) { print.paper = b.dataset.paper; localStorage.setItem('deck-paper', print.paper); showPrintBox(); return; }
    if (b.dataset.close) { html.classList.remove('show-print'); return; }
    html.classList.remove('show-print');
    setPrintMode(b.dataset.mode, +b.dataset.n || print.n);
    setTimeout(() => window.print(), 80);                                 // let the layout settle first
  });
  window.addEventListener('beforeprint', () => { if (!html.classList.contains('print')) setPrintMode(print.mode); });
  window.addEventListener('afterprint',  () => { if (!qs.has('print')) exitPrint(); });
  if (qs.has('paper') && PAPER[qs.get('paper')]) print.paper = qs.get('paper');
  if (qs.has('noappendix')) html.classList.add('hide-appendix');
  if (qs.has('print')) setPrintMode(qs.has('handout') ? 'handout' : (qs.has('steps') ? 'steps' : 'slides'), +qs.get('handout') || 4);

  /* ── 7. input ── */
  let buf = '', bufT = null;
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'p' || e.key === 'P')) { e.preventDefault(); showPrintBox(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    const anyOverlay = html.classList.contains('show-help') || html.classList.contains('black') || html.classList.contains('show-print');
    if (k === 'Escape') {
      if (html.classList.contains('show-print')) return html.classList.remove('show-print');
      if (html.classList.contains('show-help')) return toggle('show-help');
      if (html.classList.contains('black')) return toggle('black');
      return overview(!html.classList.contains('overview'));
    }
    if (html.classList.contains('show-print')) return;
    if (anyOverlay && k !== '?' && k !== 'b' && k !== 'B' && k !== '.') return;
    /* typed slide number: 12⏎ or a3⏎ */
    if (/^[0-9]$/.test(k) || ((k === 'a' || k === 'A') && !buf)) {
      buf += k.toLowerCase(); jumpBox.textContent = buf; jumpBox.style.display = 'block';
      clearTimeout(bufT); bufT = setTimeout(() => { buf = ''; jumpBox.style.display = 'none'; }, 1800);
      return;
    }
    if (k === 'Enter' && buf) {
      const n = resolve('#' + buf); buf = ''; jumpBox.style.display = 'none';
      if (n >= 0) jump(n);
      if (html.classList.contains('overview')) overview(false);
      return;
    }
    switch (k) {
      case 'ArrowRight': case 'ArrowDown': case 'PageDown': e.preventDefault(); next(); break;
      case ' ': e.preventDefault(); e.shiftKey ? prev() : next(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp': e.preventDefault(); prev(); break;
      case 'Home': go(0, -1); break;
      case 'End':  go(slides.length - 1, 1, { allFragments: true }); break;
      case 'Enter': if (html.classList.contains('overview')) overview(false); break;
      case 'Backspace': e.preventDefault(); back(); break;
      case 'f': case 'F': document.fullscreenElement ? document.exitFullscreen() : html.requestFullscreen(); break;
      case 'o': case 'O': overview(!html.classList.contains('overview')); break;
      case 'b': case 'B': case '.': toggle('black'); break;
      case 'n': case 'N': toggle('show-notes'); break;
      case 't': if (!clock.started) clock.start(); toggle('show-clock'); break;
      case 'T': clock.started ? clock.reset() : clock.start(); html.classList.add('show-clock'); break;
      case 'p': html.classList.contains('print') ? exitPrint() : setPrintMode('slides'); break;
      case 'P': html.classList.contains('print') ? exitPrint() : setPrintMode('handout'); break;
      case 'm': case 'M': html.dataset.theme = html.dataset.theme === 'mannheim' ? '' : 'mannheim'; probeLogo(); break;
      case 'l': case 'L': {                                          // cycle the vertical layout (try it on a finished deck)
        const cur = Math.max(0, LAYOUTS.indexOf(html.dataset.layout || 'top'));
        html.dataset.layout = LAYOUTS[(cur + 1) % LAYOUTS.length];
        jumpBox.textContent = 'layout: ' + html.dataset.layout; jumpBox.style.display = 'block';
        clearTimeout(bufT); bufT = setTimeout(() => { jumpBox.style.display = 'none'; }, 1200);
        break;
      }
      case '?': case 'h': case 'H': toggle('show-help'); break;
    }
  });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (a) {
      const href = a.getAttribute('href');
      if (href.startsWith('#')) { e.preventDefault(); href === '#back' ? back() : jump(href); }
      return;                                                        // external links behave normally
    }
    if (html.classList.contains('overview')) {
      const s = e.target.closest('.slide');
      if (s) { go(slides.indexOf(s), 1, { allFragments: true }); overview(false); }
      return;
    }
    if (html.classList.contains('show-help')) return toggle('show-help');
    if (html.classList.contains('black')) return toggle('black');
    if (e.target.closest('#notes, #clock, .noclick')) return;
    if (String(getSelection()).length) return;                       // was selecting text, not navigating
    (e.clientX < innerWidth * 0.28 ? prev : next)();
  });
  let tx = null, ty = null;
  document.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', e => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    tx = ty = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { e.preventDefault(); dx < 0 ? next() : prev(); }
  });

  /* ── 8. authoring aids: overflow check, logo probe ── */
  function checkOverflow () {
    if (html.classList.contains('print') || html.classList.contains('overview')) return;
    html.classList.add('measure');
    const bad = [];
    slides.forEach((s, k) => {
      /* speaker notes never count: detach them while measuring */
      const notes = Array.from(s.querySelectorAll(':scope > .notes'));
      const slots = notes.map(n => { const m = document.createComment(''); n.replaceWith(m); return [n, m]; });
      const over = s.scrollHeight - s.clientHeight;
      slots.forEach(([n, m]) => m.replaceWith(n));
      s.classList.toggle('overflow', over > 2);
      if (over > 2) { s.dataset.overflow = over; bad.push(`${label(k) || k} (+${over}px)`); }
    });
    html.classList.remove('measure');
    if (bad.length) console.warn('deck: slides overflow the canvas → ' + bad.join(', '));
  }
  function probeLogo () {
    html.classList.remove('has-logo');
    const m = /url\(["']?([^"')]+)["']?\)/.exec(getComputedStyle(html).getPropertyValue('--logo-src'));
    if (!m) return;
    const im = new Image();
    im.onload = () => html.classList.add('has-logo');
    im.src = m[1];
  }
  probeLogo();

  /* ── 9. start ── */
  /* take keyboard focus on load, so ⌘P / arrow keys reach the deck before any click
     (otherwise Safari keeps focus in the address bar and its own print dialog opens) */
  document.body.tabIndex = -1;
  document.body.style.outline = 'none';
  const grabFocus = () => { try { window.focus(); document.body.focus({ preventScroll: true }); } catch (e) {} };
  grabFocus(); window.addEventListener('load', grabFocus); window.addEventListener('pageshow', grabFocus);
  const start = resolve(location.hash);
  go(start >= 0 ? start : 0, 1, { silent: true, allFragments: start > 0 });
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(checkOverflow, 50));
  window.addEventListener('load', () => setTimeout(checkOverflow, 300));
}

/* ── helpers ── */
function el (tag, props) { return Object.assign(document.createElement(tag), props); }

const PRINT_HTML = `
<div class="card">
  <h2>Print / Save as PDF</h2>
  <button data-mode="steps"><b>Slides · as presented</b><span>one 16:9 page per step, like beamer overlays</span></button>
  <button data-mode="slides"><b>Slides · one per slide</b><span>one 16:9 page per slide, all steps revealed</span></button>
  <button data-mode="handout" data-n="4"><b>Handout · 4 per sheet</b><span>landscape, two by two</span></button>
  <button data-mode="handout" data-n="6"><b>Handout · 6 per sheet</b><span>landscape, three by two</span></button>
  <button data-mode="handout" data-n="2"><b>Handout · 2 per sheet</b><span>portrait, large, room for notes</span></button>
  <div class="row">Paper <button data-paper="a4">A4</button><button data-paper="letter">Letter</button>
    <span class="hint">Choose "Save as PDF" in the dialog; keep scale 100 % and 1 page per sheet.</span></div>
  <button class="close" data-close="1">Cancel &nbsp;<kbd>Esc</kbd></button>
</div>`;

const HELP_HTML = `
<h2>Keys</h2>
<div class="cols">
<table>
<tr><td>→ ↓ Space PgDn</td><td>next step / slide</td></tr>
<tr><td>← ↑ ⇧Space PgUp</td><td>previous step / slide</td></tr>
<tr><td>Home · End</td><td>first · last slide</td></tr>
<tr><td>12 ⏎ · a2 ⏎</td><td>jump to slide 12 · appendix slide 2</td></tr>
<tr><td>Backspace</td><td>return from a jump (link, typed number)</td></tr>
<tr><td>click</td><td>right 72 % next · left 28 % back</td></tr>
<tr><td>swipe</td><td>next / back (touch)</td></tr>
</table>
<table>
<tr><td>O · Esc</td><td>overview grid (click a slide)</td></tr>
<tr><td>F</td><td>fullscreen</td></tr>
<tr><td>B · .</td><td>black screen</td></tr>
<tr><td>N</td><td>speaker notes (&lt;aside class="notes"&gt;)</td></tr>
<tr><td>T · ⇧T</td><td>elapsed-time clock · reset it</td></tr>
<tr><td>⌘P · Ctrl-P</td><td>print: slides or handout (chooser)</td></tr>
<tr><td>p · P</td><td>preview slides (all revealed) · handout layout</td></tr>
<tr><td>P</td><td>print layout preview (⌘P / Ctrl-P → Save as PDF)</td></tr>
<tr><td>M</td><td>toggle Mannheim theme</td></tr>
<tr><td>L</td><td>cycle vertical layout: top · center · spread</td></tr>
<tr><td>? · H</td><td>this help</td></tr>
</table>
</div>
<p class="muted" style="margin-top:18px;font-size:14px">URL options: ?theme=mannheim &nbsp; ?school=bwl &nbsp; ?size=4:3 &nbsp; ?layout=center &nbsp; ?print &nbsp; ?noappendix &nbsp; ?minutes=20 &nbsp; #slide-id</p>`;

})();
