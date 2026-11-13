/* Project content: replace placeholder images and copy as the portfolio develops. */
const projects = [
  {year:'2024',title:'Performing Representation',short:'A study of architectural representation as a way of making and performing space.',field:'ARCHITECTURE / RESEARCH',loop:'assets/loop-1.gif',frames:['assets/project-1.svg','assets/sketch-1.svg']},
  {year:'2025',title:'Material Studies',short:'Small experiments in models, fabrication, and what different materials can do.',field:'OBJECTS / FABRICATION',loop:'assets/loop-2.gif',frames:['assets/project-2.svg','assets/sketch-2.svg']},
  {year:'2025',title:'Image Experiments',short:'Cyanotypes, photographs, and images that sit somewhere between drawing and document.',field:'IMAGES / REPRESENTATION',loop:'assets/loop-3.gif',frames:['assets/project-3.svg','assets/sketch-3.svg']},
  {year:'2026',title:'Independent Publications',short:'Books and printed matter collecting writing, photographs, and graphic experiments.',field:'PRINT / EDITORIAL',loop:'assets/loop-4.gif',frames:['assets/project-4.svg','assets/sketch-4.svg']},
  {year:'2026',title:'Other Objects',short:'An assortment of things made for no particular category, or perhaps several.',field:'OBJECTS / OTHER',loop:'assets/loop-5.gif',frames:['assets/project-5.svg','assets/sketch-5.svg']}
];

const viewport = document.querySelector('#viewport');
const projectsEl = document.querySelector('#projects');
const preview = document.querySelector('#preview');
const previewImage = document.querySelector('#previewImage');
const meter = document.querySelector('#meter');
const percent = document.querySelector('#percent');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (x,min,max) => Math.max(min,Math.min(max,x));
const maxScroll = () => Math.max(0,viewport.scrollWidth - viewport.clientWidth);

// One project has its own animation timers. Opening another never closes it.
const projectTimers = new WeakMap();
function clearProjectTimers(node) {
  (projectTimers.get(node) || []).forEach(clearTimeout);
  projectTimers.set(node, []);
}
function later(node, fn, ms) {
  const id = setTimeout(fn, ms);
  projectTimers.get(node).push(id);
}
function animationTime(name, fallback) {
  if (reducedMotion.matches) return 0;
  const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
  return Number.isFinite(value) ? value : fallback;
}

projects.forEach((p,i) => {
  const node = document.createElement('article');
  node.className = 'project';
  node.id = `project-${i}`;
  node.dataset.expanded = 'false';
  const n = String(i+1).padStart(2,'0');
  node.innerHTML = `
    <button class="project-number" type="button" aria-controls="detail-${i}"
      aria-expanded="false" aria-label="Open project ${n}: ${p.title}">${n}</button>
    <div class="project-summary">
      <img class="loop" src="${p.loop}" alt="" draggable="false">
      <p class="excerpt">${p.short}</p>
      <p class="meta">${p.year} / ${p.field}</p>
    </div>
    <section id="detail-${i}" class="project-detail" aria-label="Project: ${p.title}" hidden inert>
      <div class="detail-mask-inner">
        <h2>${p.title}</h2>
        <figure><img src="${p.frames[0]}" alt="Placeholder artwork for ${p.title}"><figcaption>01 / PLACEHOLDER IMAGE</figcaption></figure>
        <p class="detail-note">Project description, process notes, drawings, and photographs go here. Scroll vertically anywhere within this expanded column.</p>
        <figure><img src="${p.frames[1]}" alt="Schematic placeholder for ${p.title}"><figcaption>02 / SCHEMATIC STUDY</figcaption></figure>
        <figure><img src="${p.frames[0]}" alt="Further documentation for ${p.title}"><figcaption>03 / ADDITIONAL DOCUMENTATION</figcaption></figure>
        <p class="detail-note">END OF PROJECT / ${n}</p>
      </div>
    </section>`;
  projectsEl.appendChild(node);
  projectTimers.set(node, []);

  node.querySelector('.project-number').addEventListener('click', () => toggle(i));
  const summary = node.querySelector('.project-summary');
  summary.setAttribute('role', 'button');
  summary.setAttribute('tabindex', '0');
  summary.setAttribute('aria-label', `Open project ${n}: ${p.title}`);
  summary.addEventListener('click', () => {
    if (node.dataset.expanded !== 'true') toggle(i);
  });
  summary.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && node.dataset.expanded !== 'true') {
      e.preventDefault();toggle(i);
    }
  });
  const excerpt = node.querySelector('.excerpt');
  excerpt.addEventListener('pointerenter', e => {
    if (e.pointerType === 'mouse' && matchMedia('(hover:hover)').matches) showPreview(e,p.frames[0]);
  });
  excerpt.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse') positionPreview(e);
  });
  excerpt.addEventListener('pointerleave', hidePreview);
  node.addEventListener('scroll', hidePreview, {passive:true});
});

function toggle(index) {
  const node = document.querySelector(`#project-${index}`);
  const detail = node.querySelector('.project-detail');
  const number = node.querySelector('.project-number');
  const opening = node.dataset.expanded !== 'true';
  const widthTime = animationTime('--expand-ms', 1800);
  const maskTime = animationTime('--mask-ms', 450);
  clearProjectTimers(node);
  stopMomentum();
  hidePreview();

  node.dataset.expanded = String(opening);
  number.setAttribute('aria-expanded', String(opening));
  node.querySelector('.project-summary').tabIndex = opening ? -1 : 0;
  number.setAttribute('aria-label', `${opening ? 'Close' : 'Open'} project ${String(index+1).padStart(2,'0')}: ${projects[index].title}`);

  if (opening) {
    detail.hidden = false;
    detail.inert = false;
    node.classList.add('is-active');
    // Ensure the closed mask is painted before it begins revealing downward.
    void detail.offsetHeight;
    requestAnimationFrame(() => node.classList.add('revealed'));
    // Overlap the reveal and widening so there is no awkward dead time.
    later(node, () => node.classList.add('open'), maskTime);
  } else {
    // Shrink the image and reflow text before retracting the mask upward.
    node.classList.remove('open');
    detail.inert = true;
    later(node, () => node.classList.remove('revealed'), widthTime);
    later(node, () => {
      detail.hidden = true;
      node.classList.remove('is-active');
      node.scrollTop = 0;
    }, widthTime + maskTime + 30);
  }
}

function showPreview(e,src) {
  previewImage.src = src;
  positionPreview(e);
  preview.classList.add('visible');
}
function positionPreview(e) {
  const w = preview.offsetWidth || 260;
  const h = preview.offsetHeight || 180;
  preview.style.left = `${clamp(e.clientX+20,8,innerWidth-w-8)}px`;
  preview.style.top = `${clamp(e.clientY+20,8,innerHeight-h-72)}px`;
}
function hidePreview() { preview.classList.remove('visible'); }

/* Weighted horizontal wheel scroll. Values retained from your current version. */
const SCROLL_SETTINGS = { sensitivity: 1.08, spring: 0.005, damping: 0.86 };
let targetX = viewport.scrollLeft;
let velocity = 0, raf = 0, lastFrame = 0;
function stopMomentum() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0; velocity = 0; lastFrame = 0; targetX = viewport.scrollLeft;
}
function animate(now) {
  raf = 0;
  const dt = lastFrame ? clamp((now-lastFrame)/16.67,0.5,2) : 1;
  lastFrame = now;
  targetX = clamp(targetX,0,maxScroll());
  const distance = targetX - viewport.scrollLeft;
  velocity = (velocity + distance*SCROLL_SETTINGS.spring*dt) * Math.pow(SCROLL_SETTINGS.damping,dt);
  const next = clamp(viewport.scrollLeft+velocity*dt,0,maxScroll());
  viewport.scrollLeft = next;
  if (Math.abs(targetX-next)<.45 && Math.abs(velocity)<.13) {
    viewport.scrollLeft = targetX; velocity = 0; lastFrame = 0; return;
  }
  raf = requestAnimationFrame(animate);
}

// Important: one wheel listener handles BOTH axes, so expanded-column
// scrolling works over its image, body text, and all documentation.
viewport.addEventListener('wheel', e => {
  const column = e.target.closest('.project.is-active');
  const modifier = e.deltaMode===1 ? 16 : e.deltaMode===2 ? innerHeight : 1;
  const delta = (Math.abs(e.deltaX)>Math.abs(e.deltaY) ? e.deltaX : e.deltaY)*modifier;
  e.preventDefault();
  hidePreview();
  if (column) {
    stopMomentum();
    column.scrollTop += delta;
    return;
  }
  if (reducedMotion.matches) {
    stopMomentum();
    viewport.scrollLeft = clamp(viewport.scrollLeft+delta,0,maxScroll());
    return;
  }
  if (!raf) {targetX=viewport.scrollLeft;lastFrame=0;}
  targetX=clamp(targetX+delta*SCROLL_SETTINGS.sensitivity,0,maxScroll());
  if (!raf && Math.abs(targetX-viewport.scrollLeft)>.1) raf=requestAnimationFrame(animate);
},{passive:false});

// Dragging the background moves the timeline; dragging inside an open column does not.
let drag = null, blockClick = false;
viewport.addEventListener('pointerdown', e => {
  stopMomentum();
  if (e.pointerType!=='mouse' || e.button!==0 || e.target.closest('button,a,.project.is-active')) return;
  drag = {id:e.pointerId,x:e.clientX,initial:viewport.scrollLeft,moved:false};
  viewport.setPointerCapture(e.pointerId);
  viewport.classList.add('dragging');
});
viewport.addEventListener('pointermove', e => {
  if (!drag || e.pointerId!==drag.id) return;
  const dx=e.clientX-drag.x;
  if (Math.abs(dx)>5) drag.moved=true;
  if (drag.moved) viewport.scrollLeft=drag.initial-dx;
});
function endDrag() {
  if (!drag) return;
  blockClick=drag.moved;drag=null;
  viewport.classList.remove('dragging');
  if (blockClick) requestAnimationFrame(() => blockClick=false);
}
viewport.addEventListener('pointerup',endDrag);
viewport.addEventListener('pointercancel',endDrag);
viewport.addEventListener('click', e => {if (blockClick){e.preventDefault();e.stopPropagation();}},true);
viewport.addEventListener('keydown', e => {
  if (e.target.closest('.project.is-active')) return;
  if (e.key==='ArrowRight' || e.key==='ArrowLeft') {
    e.preventDefault();stopMomentum();
    viewport.scrollBy({left:e.key==='ArrowRight'?260:-260,behavior:reducedMotion.matches?'instant':'smooth'});
  }
});
function updateProgress() {
  const pct = maxScroll()?Math.round(viewport.scrollLeft/maxScroll()*100):100;
  meter.style.width = `${pct}%`;
  percent.textContent = `${String(pct).padStart(2,'0')}%`;
}
viewport.addEventListener('scroll',updateProgress,{passive:true});
window.addEventListener('resize',updateProgress);
updateProgress();
document.querySelector('#reset').addEventListener('click',() => {
  stopMomentum();viewport.scrollTo({left:0,behavior:reducedMotion.matches?'instant':'smooth'});
});
const about = document.querySelector('#about');
const aboutBtn = document.querySelector('#aboutBtn');
function setAbout(open) {
  about.hidden=!open;
  aboutBtn.setAttribute('aria-expanded',String(open));
  aboutBtn.textContent = open ? 'ABOUT −' : 'ABOUT +';
  hidePreview();
}
aboutBtn.addEventListener('click',()=>setAbout(about.hidden));
document.querySelector('#aboutClose').addEventListener('click',()=>setAbout(false));
document.addEventListener('keydown',e => {if(e.key==='Escape') setAbout(false);});
