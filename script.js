/* Prototype 08 — horizontal portfolio with fixed project headers and inner vertical scroll.
   Edit the projects below to replace the demonstration projects and images. */
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
const clamp = (x, min, max) => Math.max(min, Math.min(max, x));
const maxScroll = () => Math.max(0, viewport.scrollWidth - viewport.clientWidth);

const projectTimers = new WeakMap();
function clearProjectTimers(node) {
  (projectTimers.get(node) || []).forEach(clearTimeout);
  projectTimers.set(node, []);
}
function later(node, fn, ms) {
  const handle = setTimeout(fn, ms);
  projectTimers.get(node).push(handle);
}
function animationTime(name, fallback) {
  if (reducedMotion.matches) return 0;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name);
  const ms = parseFloat(raw);
  return Number.isFinite(ms) ? ms : fallback;
}

projects.forEach((p, i) => {
  const number = String(i + 1).padStart(2, '0');
  const node = document.createElement('article');
  node.className = 'project';
  node.id = `project-${i}`;
  node.dataset.expanded = 'false';
  node.innerHTML = `
    <div class="project-header">
      <button class="project-number" type="button"
        aria-controls="detail-${i}" aria-expanded="false"
        aria-label="Open project ${number}: ${p.title}">${number}.</button>
      <div class="project-copy">
        <h2 class="project-title" aria-label="${p.title}"><span class="typed-title" aria-hidden="true"></span></h2>
        <p class="excerpt">${p.short}</p>
      </div>
    </div>
    <section id="detail-${i}" class="project-reveal" hidden inert aria-label="Project images and notes: ${p.title}">
      <div class="project-scroll" tabindex="0" aria-label="Scroll vertically through ${p.title}">
        <figure class="project-lead"><img src="${p.loop}" alt="Placeholder animated studies for ${p.title}"><figcaption>${p.year} / ${p.field}</figcaption></figure>
        <figure><img src="${p.frames[0]}" alt="Placeholder artwork for ${p.title}"><figcaption>01 / PROJECT DOCUMENTATION</figcaption></figure>
        <p class="detail-note">Project description, process notes, drawings, and photographs go here. This lower section scrolls while the number, title, and introduction remain visible.</p>
        <figure><img src="${p.frames[1]}" alt="Placeholder schematic study for ${p.title}"><figcaption>02 / SCHEMATIC STUDY</figcaption></figure>
        <figure><img src="${p.frames[0]}" alt="Additional placeholder documentation for ${p.title}"><figcaption>03 / ADDITIONAL DOCUMENTATION</figcaption></figure>
        <p class="detail-note">END OF PROJECT / ${number}</p>
      </div>
    </section>`;
  projectsEl.appendChild(node);
  projectTimers.set(node, []);

  const button = node.querySelector('.project-number');
  const summary = node.querySelector('.project-copy');
  button.addEventListener('click', () => toggle(i));
  summary.addEventListener('click', () => {
    if (node.dataset.expanded !== 'true') toggle(i);
  });
  // Instant, unstyled preview on the number OR the description.
  // The preview does not open when hovering the title or empty column space.
  function bindImagePreview(element) {
    element.addEventListener('pointerenter', e => {
      if (e.pointerType === 'mouse' && matchMedia('(hover:hover)').matches)
        showPreview(e, p.frames[0]);
    });
    element.addEventListener('pointermove', e => {
      if (e.pointerType === 'mouse' && matchMedia('(hover:hover)').matches) {
        if (!preview.classList.contains('visible')) showPreview(e, p.frames[0]);
        else positionPreview(e);
      }
    });
    element.addEventListener('pointerleave', hidePreview);
  }
  bindImagePreview(button);
  bindImagePreview(summary.querySelector('.excerpt'));
  node.querySelector('.project-scroll').addEventListener('scroll', hidePreview, {passive:true});
});

function typeTitle(node, title) {
  const typed = node.querySelector('.typed-title');
  const heading = node.querySelector('.project-title');
  const chars = Array.from(title);
  typed.textContent = '';
  if (reducedMotion.matches) {
    typed.textContent = title;
    heading.classList.remove('typing');
    return;
  }
  heading.classList.add('typing');
  chars.forEach((char, i) => {
    later(node, () => { typed.textContent += char; }, 100 + i * 45);
  });
  later(node, () => heading.classList.remove('typing'), 180 + chars.length * 45);
}

function toggle(index) {
  const node = document.querySelector(`#project-${index}`);
  const panel = node.querySelector('.project-reveal');
  const button = node.querySelector('.project-number');
  const opening = node.dataset.expanded !== 'true';
  const maskTime = animationTime('--mask-ms', 700);
  const expandTime = animationTime('--expand-ms', 2200);
  clearProjectTimers(node);
  stopMomentum();
  hidePreview();

  node.dataset.expanded = String(opening);
  button.setAttribute('aria-expanded', String(opening));
  button.setAttribute('aria-label', `${opening ? 'Close' : 'Open'} project ${String(index + 1).padStart(2,'0')}: ${projects[index].title}`);

  if (opening) {
    panel.hidden = false;
    panel.inert = false;
    node.classList.add('is-active');
    node.querySelector('.project-scroll').scrollTop = 0;
    // Paint the mask in its closed position first.
    void panel.offsetHeight;
    requestAnimationFrame(() => node.classList.add('revealed'));
    // Mask first, then width expansion; typing begins just after widening starts.
    later(node, () => node.classList.add('open'), maskTime);
    later(node, () => typeTitle(node, projects[index].title), maskTime + (reducedMotion.matches ? 0 : 220));
  } else {
    // Reverse: shrink images and reflow text, THEN retract mask upward.
    node.classList.remove('open');
    panel.inert = true;
    later(node, () => node.classList.remove('revealed'), expandTime);
    later(node, () => {
      panel.hidden = true;
      node.classList.remove('is-active');
      node.querySelector('.project-scroll').scrollTop = 0;
      node.querySelector('.typed-title').textContent = '';
      node.querySelector('.project-title').classList.remove('typing');
    }, expandTime + maskTime + 45);
  }
}

function showPreview(e, src) {
  previewImage.src = src;
  positionPreview(e);
  preview.classList.add('visible');
}
function positionPreview(e) {
  const w = preview.offsetWidth || 260;
  const h = preview.offsetHeight || 180;
  preview.style.left = `${clamp(e.clientX + 16, 8, innerWidth - w - 8)}px`;
  preview.style.top = `${clamp(e.clientY + 16, 8, innerHeight - h - 72)}px`;
}
function hidePreview() { preview.classList.remove('visible'); }

/* Existing weighted horizontal scroll: unchanged tuning. */
const SCROLL_SETTINGS = {sensitivity:1.08, spring:0.005, damping:0.86};
let targetX = viewport.scrollLeft, velocity = 0, raf = 0, lastFrame = 0;
function stopMomentum() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0; velocity = 0; lastFrame = 0; targetX = viewport.scrollLeft;
}
function animate(now) {
  raf = 0;
  const dt = lastFrame ? clamp((now - lastFrame) / 16.67, 0.5, 2) : 1;
  lastFrame = now;
  targetX = clamp(targetX, 0, maxScroll());
  const distance = targetX - viewport.scrollLeft;
  velocity = (velocity + distance * SCROLL_SETTINGS.spring * dt) * Math.pow(SCROLL_SETTINGS.damping, dt);
  const next = clamp(viewport.scrollLeft + velocity * dt, 0, maxScroll());
  viewport.scrollLeft = next;
  if (Math.abs(targetX - next) < 0.45 && Math.abs(velocity) < 0.13) {
    viewport.scrollLeft = targetX; velocity = 0; lastFrame = 0; return;
  }
  raf = requestAnimationFrame(animate);
}

// Wheel anywhere within an expanded column scrolls ONLY that column's lower content.
// No header movement, even while hovering the number or project description.
viewport.addEventListener('wheel', e => {
  const column = e.target.closest('.project.is-active');
  const modifier = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1;
  const delta = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * modifier;
  e.preventDefault();
  hidePreview();
  if (column) {
    stopMomentum();
    const scroller = column.querySelector('.project-scroll');
    if (scroller) scroller.scrollTop += delta;
    return;
  }
  if (reducedMotion.matches) {
    stopMomentum();
    viewport.scrollLeft = clamp(viewport.scrollLeft + delta, 0, maxScroll());
    return;
  }
  if (!raf) { targetX = viewport.scrollLeft; lastFrame = 0; }
  targetX = clamp(targetX + delta * SCROLL_SETTINGS.sensitivity, 0, maxScroll());
  if (!raf && Math.abs(targetX - viewport.scrollLeft) > .1)
    raf = requestAnimationFrame(animate);
}, {passive:false});

// Drag background to navigate horizontally; do not drag when interacting with a project.
let drag = null, blockClick = false;
viewport.addEventListener('pointerdown', e => {
  stopMomentum();
  if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('button,a,.project.is-active')) return;
  drag = {id:e.pointerId, x:e.clientX, initial:viewport.scrollLeft, moved:false};
  viewport.setPointerCapture(e.pointerId);
  viewport.classList.add('dragging');
});
viewport.addEventListener('pointermove', e => {
  if (!drag || e.pointerId !== drag.id) return;
  const dx = e.clientX - drag.x;
  if (Math.abs(dx) > 5) drag.moved = true;
  if (drag.moved) viewport.scrollLeft = drag.initial - dx;
});
function endDrag() {
  if (!drag) return;
  blockClick = drag.moved;
  drag = null;
  viewport.classList.remove('dragging');
  if (blockClick) requestAnimationFrame(() => {blockClick = false;});
}
viewport.addEventListener('pointerup', endDrag);
viewport.addEventListener('pointercancel', endDrag);
viewport.addEventListener('click', e => {
  if (blockClick) { e.preventDefault(); e.stopPropagation(); }
}, true);
viewport.addEventListener('keydown', e => {
  if (e.target.closest('.project.is-active')) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    e.preventDefault(); stopMomentum();
    viewport.scrollBy({left:e.key === 'ArrowRight' ? 260 : -260, behavior:reducedMotion.matches ? 'instant':'smooth'});
  }
});
function updateProgress() {
  const pct = maxScroll() ? Math.round(viewport.scrollLeft / maxScroll() * 100) : 100;
  meter.style.width = `${pct}%`;
  percent.textContent = `${String(pct).padStart(2,'0')}%`;
}
viewport.addEventListener('scroll', updateProgress, {passive:true});
window.addEventListener('resize', updateProgress);
updateProgress();
document.querySelector('#reset').addEventListener('click', () => {
  stopMomentum(); viewport.scrollTo({left:0, behavior:reducedMotion.matches ? 'instant':'smooth'});
});
const about = document.querySelector('#about');
const aboutBtn = document.querySelector('#aboutBtn');
function setAbout(open) {
  about.hidden = !open;
  aboutBtn.setAttribute('aria-expanded', String(open));
  aboutBtn.textContent = open ? 'ABOUT −' : 'ABOUT +';
  hidePreview();
}
aboutBtn.addEventListener('click', () => setAbout(about.hidden));
document.querySelector('#aboutClose').addEventListener('click', () => setAbout(false));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') setAbout(false);
});
