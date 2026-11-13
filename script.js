/* Portfolio — repaired script (November 2026).
   Replace project data here when ready. Compatible with the current styles.css. */
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

// Keep transition timers independent for each project: multiple columns can stay open.
const projectTimers = new WeakMap();
function clearProjectTimers(node) {
  (projectTimers.get(node) || []).forEach(clearTimeout);
  projectTimers.set(node, []);
}
function later(node, callback, milliseconds) {
  const handle = setTimeout(callback, milliseconds);
  projectTimers.get(node).push(handle);
}
function animationTime(property, fallback) {
  if (reducedMotion.matches) return 0;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(property).trim();
  const parsed = parseFloat(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return raw.endsWith('s') && !raw.endsWith('ms') ? parsed * 1000 : parsed;
}

projects.forEach((project, index) => {
  const number = String(index + 1).padStart(2, '0');
  const node = document.createElement('article');
  node.className = 'project';
  node.id = `project-${index}`;
  node.dataset.expanded = 'false';
  node.innerHTML = `
    <div class="project-header">
      <button class="project-number" type="button"
        aria-controls="detail-${index}" aria-expanded="false"
        aria-label="Open project ${number}: ${project.title}">${number}.</button>
      <div class="project-copy">
        <h2 class="project-title" aria-label="${project.title}"><span class="typed-title" aria-hidden="true"></span></h2>
        <p class="excerpt">${project.short}</p>
      </div>
    </div>
    <section id="detail-${index}" class="project-reveal" hidden inert aria-label="Project images and notes: ${project.title}">
      <div class="project-scroll" tabindex="0" aria-label="Scroll vertically through ${project.title}">
        <figure class="project-lead"><img src="${project.loop}" alt="Placeholder animated studies for ${project.title}"><figcaption>${project.year} / ${project.field}</figcaption></figure>
        <figure><img src="${project.frames[0]}" alt="Placeholder artwork for ${project.title}"><figcaption>01 / PROJECT DOCUMENTATION</figcaption></figure>
        <p class="detail-note">Project description, process notes, drawings, and photographs go here. This lower section scrolls while the number, title, and introduction remain visible.</p>
        <figure><img src="${project.frames[1]}" alt="Placeholder schematic study for ${project.title}"><figcaption>02 / SCHEMATIC STUDY</figcaption></figure>
        <figure><img src="${project.frames[0]}" alt="Additional placeholder documentation for ${project.title}"><figcaption>03 / ADDITIONAL DOCUMENTATION</figcaption></figure>
        <p class="detail-note">END OF PROJECT / ${number}</p>
      </div>
    </section>`;
  projectsEl.appendChild(node);
  projectTimers.set(node, []);

  const numberButton = node.querySelector('.project-number');
  const summary = node.querySelector('.project-copy');
  numberButton.addEventListener('click', () => toggle(index));
  summary.addEventListener('click', () => {
    if (node.dataset.expanded !== 'true') toggle(index);
  });

  // Instant unstyled image preview on number OR description, not the heading.
  function bindImagePreview(element) {
    element.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' && matchMedia('(hover:hover)').matches) {
        showPreview(event, project.frames[0]);
      }
    });
    element.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse' || !matchMedia('(hover:hover)').matches) return;
      if (!preview.classList.contains('visible')) showPreview(event, project.frames[0]);
      else positionPreview(event);
    });
    element.addEventListener('pointerleave', hidePreview);
  }
  bindImagePreview(numberButton);
  bindImagePreview(node.querySelector('.excerpt'));
  node.querySelector('.project-scroll').addEventListener('scroll', hidePreview, {passive: true});
});

// Types a title only AFTER the mask reveal and column expansion are complete.
function typeTitle(node, title) {
  const text = node.querySelector('.typed-title');
  const heading = node.querySelector('.project-title');
  const characters = Array.from(title);
  text.textContent = '';
  heading.classList.remove('typing');
  if (reducedMotion.matches) {
    text.textContent = title;
    return;
  }
  heading.classList.add('typing');
  characters.forEach((character, i) => {
    later(node, () => { text.textContent += character; }, 100 + i * 45);
  });
  later(node, () => heading.classList.remove('typing'), 180 + characters.length * 45);
}

// Reverse typewriter: erase characters from right to left before contraction.
function eraseTitle(node) {
  const text = node.querySelector('.typed-title');
  const heading = node.querySelector('.project-title');
  const characters = Array.from(text.textContent);
  if (reducedMotion.matches || characters.length === 0) {
    text.textContent = '';
    heading.classList.remove('typing');
    return 0;
  }
  const deleteSpeed = 35; // milliseconds per character, adjustable
  const duration = characters.length * deleteSpeed;
  heading.classList.add('typing');
  characters.forEach((_, i) => {
    later(node, () => {
      text.textContent = characters.slice(0, characters.length - i - 1).join('');
    }, (i + 1) * deleteSpeed);
  });
  later(node, () => heading.classList.remove('typing'), duration);
  return duration;
}

function toggle(index) {
  const node = document.querySelector(`#project-${index}`);
  const panel = node.querySelector('.project-reveal');
  const numberButton = node.querySelector('.project-number');
  const opening = node.dataset.expanded !== 'true';
  const maskTime = animationTime('--mask-ms', 700);
  const expandTime = animationTime('--expand-ms', 2200);

  clearProjectTimers(node);
  stopMomentum();
  hidePreview();
  node.dataset.expanded = String(opening);
  numberButton.setAttribute('aria-expanded', String(opening));
  numberButton.setAttribute('aria-label',
    `${opening ? 'Close' : 'Open'} project ${String(index + 1).padStart(2, '0')}: ${projects[index].title}`);

  if (opening) {
    // Restart safely even if the previous closing sequence was interrupted.
    node.classList.remove('revealed', 'open');
    panel.hidden = false;
    panel.inert = false;
    node.classList.add('is-active');
    node.querySelector('.project-scroll').scrollTop = 0;
    const typed = node.querySelector('.typed-title');
    typed.textContent = '';
    node.querySelector('.project-title').classList.remove('typing');

    // Mask first -> widen column -> type title.
    void panel.offsetHeight; // ensure closed clip state is painted
    requestAnimationFrame(() => {
      if (node.dataset.expanded === 'true') node.classList.add('revealed');
    });
    later(node, () => node.classList.add('open'), maskTime);
    later(node, () => typeTitle(node, projects[index].title), maskTime + expandTime);
  } else {
    // Delete title -> shrink column -> retract mask -> clean up.
    const eraseTime = eraseTitle(node);
    later(node, () => node.classList.remove('open'), eraseTime);
    later(node, () => {
      node.classList.remove('revealed');
      panel.inert = true;
    }, eraseTime + expandTime);
    later(node, () => {
      panel.hidden = true;
      node.classList.remove('is-active');
      node.querySelector('.project-scroll').scrollTop = 0;
      node.querySelector('.typed-title').textContent = '';
      node.querySelector('.project-title').classList.remove('typing');
    }, eraseTime + expandTime + maskTime + 45);
  }
}

function showPreview(event, src) {
  previewImage.src = src;
  positionPreview(event);
  preview.classList.add('visible');
}
function positionPreview(event) {
  const width = preview.offsetWidth || 260;
  const height = preview.offsetHeight || 180;
  preview.style.left = `${clamp(event.clientX + 16, 8, innerWidth - width - 8)}px`;
  preview.style.top = `${clamp(event.clientY + 16, 8, innerHeight - height - 72)}px`;
}
function hidePreview() { preview.classList.remove('visible'); }

/* Weighted horizontal scrolling: keep the user's existing preferred physics. */
const SCROLL_SETTINGS = {sensitivity: 1.08, spring: 0.005, damping: 0.86};
let targetX = viewport.scrollLeft;
let velocity = 0, raf = 0, lastFrame = 0;
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

// Wheel over an open project scrolls lower media vertically, even over fixed header.
viewport.addEventListener('wheel', event => {
  const column = event.target.closest('.project.is-active');
  const modifier = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
  const delta = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * modifier;
  event.preventDefault();
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
  if (!raf && Math.abs(targetX - viewport.scrollLeft) > 0.1)
    raf = requestAnimationFrame(animate);
}, {passive: false});

// Drag background horizontally. Open project content retains its own scrolling.
let drag = null, blockClick = false;
viewport.addEventListener('pointerdown', event => {
  stopMomentum();
  if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('button,a,.project.is-active')) return;
  drag = {id: event.pointerId, x: event.clientX, initial: viewport.scrollLeft, moved: false};
  viewport.setPointerCapture(event.pointerId);
  viewport.classList.add('dragging');
});
viewport.addEventListener('pointermove', event => {
  if (!drag || event.pointerId !== drag.id) return;
  const dx = event.clientX - drag.x;
  if (Math.abs(dx) > 5) drag.moved = true;
  if (drag.moved) viewport.scrollLeft = drag.initial - dx;
});
function endDrag() {
  if (!drag) return;
  blockClick = drag.moved;
  drag = null;
  viewport.classList.remove('dragging');
  if (blockClick) requestAnimationFrame(() => { blockClick = false; });
}
viewport.addEventListener('pointerup', endDrag);
viewport.addEventListener('pointercancel', endDrag);
viewport.addEventListener('click', event => {
  if (blockClick) { event.preventDefault(); event.stopPropagation(); }
}, true);
viewport.addEventListener('keydown', event => {
  if (event.target.closest('.project.is-active')) return;
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    stopMomentum();
    viewport.scrollBy({left: event.key === 'ArrowRight' ? 260 : -260,
      behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  }
});
function updateProgress() {
  const pct = maxScroll() ? Math.round(viewport.scrollLeft / maxScroll() * 100) : 100;
  meter.style.width = `${pct}%`;
  percent.textContent = `${String(pct).padStart(2, '0')}%`;
}
viewport.addEventListener('scroll', updateProgress, {passive: true});
window.addEventListener('resize', updateProgress);
updateProgress();
document.querySelector('#reset').addEventListener('click', () => {
  stopMomentum();
  viewport.scrollTo({left: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth'});
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
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') setAbout(false);
});
