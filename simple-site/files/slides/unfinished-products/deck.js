// ─── Math: render KaTeX once the DOM is parsed ───
document.addEventListener('DOMContentLoaded', function () {
  if (typeof renderMathInElement === 'undefined') return; // CDN failed, degrade gracefully
  renderMathInElement(document.body, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$',  right: '$',  inline: true  }
    ],
    throwOnError: false
  });
});

// ─── Slide navigation & fragment reveal ───
document.addEventListener('DOMContentLoaded', function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  let i = 0;
  let f = 0; // fragments revealed on the current slide

  function sectionLabel(n){
    for(let k = n; k >= 0; k--){
      if(slides[k].classList.contains('title-slide')) return '';
      if(slides[k].classList.contains('section-slide'))
        return slides[k].querySelector('.st')?.textContent || '';
    }
    return '';
  }
  function fragEls(slide){
    if(slide.classList.contains('static')) return [];
    const body = slide.querySelector('.body');
    if(!body) return [];
    const out = [];
    for(const ch of body.children){
      if(ch.classList.contains('spacer')) continue;
      if(ch.tagName === 'UL'){
        for(const li of ch.children){ if(li.tagName === 'LI') out.push(li); }
      } else {
        out.push(ch);
      }
    }
    return out;
  }
  slides.forEach(s => fragEls(s).forEach(el => el.classList.add('fr')));
  function reveal(slide, count){
    fragEls(slide).forEach((el,k)=> el.classList.toggle('on', k < count));
  }
  function chrome(){
    document.getElementById('bar').style.width = (i/Math.max(1,slides.length-1))*100 + '%';
    const isCover = slides[i].classList.contains('title-slide') || slides[i].classList.contains('section-slide');
    document.getElementById('foot').textContent = isCover ? '' : (i + ' / ' + (slides.length-1));
    document.getElementById('sec').textContent = isCover ? '' : sectionLabel(i);
  }
  function go(n, dir){
    n = Math.max(0, Math.min(slides.length-1, n));
    if(n === i) return;
    dir = dir || (n > i ? 1 : -1);
    const cur = slides[i], nxt = slides[n];
    cur.style.setProperty('--exit', (dir>0 ? -44 : 44) + 'px');
    cur.classList.remove('active');
    cur.classList.add('exit');
    nxt.classList.remove('exit');
    nxt.style.setProperty('--enter', (dir>0 ? 44 : -44) + 'px');
    i = n;
    f = dir > 0 ? 0 : fragEls(nxt).length;
    reveal(nxt, f);
    void nxt.offsetWidth;
    nxt.classList.add('active');
    setTimeout(()=>cur.classList.remove('exit'), 460);
    chrome();
  }
  function next(){
    const total = fragEls(slides[i]).length;
    if(f < total){ f++; reveal(slides[i], f); }
    else if(i < slides.length-1){ go(i+1, 1); }
  }
  function prev(){
    if(i > 0){ go(i-1, -1); }
  }
  document.addEventListener('keydown', e=>{
    if(['ArrowRight','ArrowDown',' ','PageDown'].includes(e.key)){ e.preventDefault(); next(); }
    else if(['ArrowLeft','ArrowUp','PageUp'].includes(e.key)){ e.preventDefault(); prev(); }
    else if(e.key==='Home'){ go(0, -1); }
    else if(e.key==='End'){ go(slides.length-1, -1); }
    else if(e.key==='f' || e.key==='F'){ document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }
  });
  document.addEventListener('click', e=>{ if(e.target.closest('a'))return; (e.clientX < window.innerWidth*0.28 ? prev : next)(); });
  chrome();
});
