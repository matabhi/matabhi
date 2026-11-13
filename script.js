/* EDITABLE PROJECT CONTENT — image loops are placeholder GIFs. */
const projects = [
  {year:'2024',title:'Performing Representation',short:'A study of architectural representation as a way of making and performing space.',field:'ARCHITECTURE / RESEARCH',loop:'assets/loop-1.gif',frames:['assets/project-1.svg','assets/sketch-1.svg']},
  {year:'2025',title:'Material Studies',short:'Small experiments in models, fabrication, and what different materials can do.',field:'OBJECTS / FABRICATION',loop:'assets/loop-2.gif',frames:['assets/project-2.svg','assets/sketch-2.svg']},
  {year:'2025',title:'Image Experiments',short:'Cyanotypes, photographs, and images that sit somewhere between drawing and document.',field:'IMAGES / REPRESENTATION',loop:'assets/loop-3.gif',frames:['assets/project-3.svg','assets/sketch-3.svg']},
  {year:'2026',title:'Independent Publications',short:'Books and printed matter collecting writing, photographs, and graphic experiments.',field:'PRINT / EDITORIAL',loop:'assets/loop-4.gif',frames:['assets/project-4.svg','assets/sketch-4.svg']},
  {year:'2026',title:'Other Objects',short:'An assortment of things made for no particular category, or perhaps several.',field:'OBJECTS / OTHER',loop:'assets/loop-5.gif',frames:['assets/project-5.svg','assets/sketch-5.svg']}
];
const viewport=document.querySelector('#viewport');
const projectsEl=document.querySelector('#projects');
const preview=document.querySelector('#preview');
const previewImage=document.querySelector('#previewImage');
const meter=document.querySelector('#meter');
const percent=document.querySelector('#percent');
let openId=-1;
let velocity=0,raf=0;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
const maxScroll=()=>Math.max(0,viewport.scrollWidth-viewport.clientWidth);

projects.forEach((p,i)=>{
  const node=document.createElement('article');node.className='project';node.id=`project-${i}`;
  node.innerHTML=`
   <section class="project-summary">
    <button class="project-trigger" type="button" aria-controls="detail-${i}" aria-expanded="false" aria-label="${String(i+1).padStart(2,'0')} — ${p.title}, open project">
      <span class="number">${String(i+1).padStart(2,'0')}</span>
      <img class="loop" src="${p.loop}" alt="" draggable="false">
      <span class="excerpt">${p.short}</span>
      <span class="meta">${p.year} &nbsp;/&nbsp; ${p.field} &nbsp; <span class="symbol">+</span></span>
    </button>
   </section>
   <section id="detail-${i}" class="project-detail" aria-label="Expanded project: ${p.title}" inert>
     <div class="detail-top"><h2>${p.title}</h2><button class="detail-close" type="button" aria-label="Close ${p.title}">CLOSE ×</button></div>
     <p class="detail-intro">${p.short}</p>
     <figure><img src="${p.frames[0]}" alt="Abstract placeholder artwork for ${p.title}"><figcaption class="caption">01 / PLACEHOLDER IMAGE — REPLACE WITH YOUR WORK</figcaption></figure>
     <p class="detail-note">Project description, process notes, drawings, and photographs will go here. This panel scrolls vertically while the timeline stays in place.</p>
     <figure class="narrow"><img src="${p.frames[1]}" alt="Placeholder schematic study for ${p.title}"><figcaption class="caption">02 / SCHEMATIC PLACEHOLDER — REPLACE WITH YOUR WORK</figcaption></figure>
     <figure><img src="${p.frames[0]}" alt="Second view for ${p.title}"><figcaption class="caption">03 / ADDITIONAL DOCUMENTATION</figcaption></figure>
     <p class="detail-note">END OF PROJECT / ${String(i+1).padStart(2,'0')}</p>
   </section>`;
  projectsEl.appendChild(node);
  const trigger=node.querySelector('.project-trigger');
  const detail=node.querySelector('.project-detail');
  trigger.addEventListener('click',()=>toggle(i));
  node.querySelector('.detail-close').addEventListener('click',()=>toggle(i));
  trigger.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&matchMedia('(hover:hover)').matches)showPreview(e,p.frames[0])});
  trigger.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')positionPreview(e)});
  trigger.addEventListener('pointerleave',hidePreview);
  detail.addEventListener('scroll',hidePreview,{passive:true});
});
function toggle(i){hidePreview();const next=openId===i?-1:i;openId=next;
  document.querySelectorAll('.project').forEach((node,index)=>{
    const expanded=index===next;
    node.classList.toggle('open',expanded);
    const trigger=node.querySelector('.project-trigger');
    trigger.setAttribute('aria-expanded',String(expanded));
    node.querySelector('.symbol').textContent=expanded?'−':'+';
    const detail=node.querySelector('.project-detail');detail.inert=!expanded;
    if(expanded)detail.scrollTop=0;
  });
  // Ensure the selected project is visible, but never auto-scroll the detail vertically.
  if(next>=0){const node=document.querySelector(`#project-${next}`);const x=node.offsetLeft-viewport.offsetLeft-30;
    viewport.scrollTo({left:Math.max(0,x),behavior:reducedMotion.matches?'instant':'smooth'});}
}
function showPreview(e,src){previewImage.src=src;positionPreview(e);preview.classList.add('visible')}
function positionPreview(e){const w=preview.offsetWidth||260,h=preview.offsetHeight||180;
  preview.style.left=`${clamp(e.clientX+20,8,innerWidth-w-8)}px`;
  preview.style.top=`${clamp(e.clientY+20,8,innerHeight-h-72)}px`;
}
function hidePreview(){preview.classList.remove('visible')}

// Wheel over expanded project content = native-feeling vertical scroll.

/* ========================================
   WEIGHTED HORIZONTAL SCROLLING
   ======================================== */

// Adjust these to change the scrolling feel.
const SCROLL_SETTINGS = {
  sensitivity: 1.08,  // Distance per wheel movement
  spring: 0.005,      // Lower = heavier/slower response
  damping: 0.86       // Higher = more glide
};

let targetX = viewport.scrollLeft;
let lastFrame = 0;

function stopMomentum() {
  if (raf) cancelAnimationFrame(raf);

  raf = 0;
  velocity = 0;
  lastFrame = 0;
  targetX = viewport.scrollLeft;
}

function animate(now) {
  raf = 0;

  const dt = lastFrame
    ? clamp((now - lastFrame) / 16.67, 0.5, 2)
    : 1;

  lastFrame = now;

  targetX = clamp(targetX, 0, maxScroll());

  const distance = targetX - viewport.scrollLeft;

  // Spring force pulls the timeline toward the target.
  velocity = (
    velocity + distance * SCROLL_SETTINGS.spring * dt
  ) * Math.pow(SCROLL_SETTINGS.damping, dt);

  const next = clamp(
    viewport.scrollLeft + velocity * dt,
    0,
    maxScroll()
  );

  viewport.scrollLeft = next;

  // Finish when the motion is almost imperceptible.
  if (
    Math.abs(targetX - next) < 0.45 &&
    Math.abs(velocity) < 0.13
  ) {
    viewport.scrollLeft = targetX;
    velocity = 0;
    lastFrame = 0;
    return;
  }

  raf = requestAnimationFrame(animate);
}

// Wheel scrolling
viewport.addEventListener('wheel', e => {

  // Preserve vertical scrolling within expanded projects.
  const panel = e.target.closest(
    '.project.open .project-detail'
  );

  if (panel) {
    stopMomentum();

    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      panel.scrollTop += e.deltaX;
    }

    return;
  }

  e.preventDefault();
  hidePreview();

  const modifier =
    e.deltaMode === 1 ? 16 :
    e.deltaMode === 2 ? innerHeight : 1;

  const delta = (
    Math.abs(e.deltaX) > Math.abs(e.deltaY)
      ? e.deltaX
      : e.deltaY
  ) * modifier;

  if (reducedMotion.matches) {
    stopMomentum();
    viewport.scrollLeft = clamp(
      viewport.scrollLeft + delta,
      0,
      maxScroll()
    );
    return;
  }

  if (!raf) {
    targetX = viewport.scrollLeft;
    lastFrame = 0;
  }

  // Move the target, not the timeline directly.
  targetX = clamp(
    targetX + delta * SCROLL_SETTINGS.sensitivity,
    0,
    maxScroll()
  );

  if (
    !raf &&
    Math.abs(targetX - viewport.scrollLeft) > 0.1
  ) {
    raf = requestAnimationFrame(animate);
  }

}, { passive: false });

// Stop existing momentum when the user clicks or drags.
viewport.addEventListener(
  'pointerdown',
  stopMomentum,
  { capture: true }
);
// Mouse drag for desktop, native swipe on phones.
let drag=null,blockClick=false;
viewport.addEventListener('pointerdown',e=>{
  if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('button,a,.project-detail'))return;
  drag={id:e.pointerId,x:e.clientX,initial:viewport.scrollLeft,moved:false};
  viewport.setPointerCapture(e.pointerId);viewport.classList.add('dragging');velocity=0;
});
viewport.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  const dx=e.clientX-drag.x;
  if(Math.abs(dx)>5)drag.moved=true;
  if(drag.moved)viewport.scrollLeft=drag.initial-dx;
});
function endDrag(){if(!drag)return;blockClick=drag.moved;drag=null;viewport.classList.remove('dragging');if(blockClick)requestAnimationFrame(()=>blockClick=false)}
viewport.addEventListener('pointerup',endDrag);viewport.addEventListener('pointercancel',endDrag);
viewport.addEventListener('click',e=>{if(blockClick){e.preventDefault();e.stopPropagation()}},true);
viewport.addEventListener('keydown',e=>{
  if(e.target.closest('.project-detail'))return;
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();viewport.scrollBy({left:e.key==='ArrowRight'?260:-260,behavior:'smooth'})}
});
function updateProgress(){const pct=maxScroll()?Math.round(viewport.scrollLeft/maxScroll()*100):100;meter.style.width=`${pct}%`;percent.textContent=`${String(pct).padStart(2,'0')}%`}
viewport.addEventListener('scroll',updateProgress,{passive:true});window.addEventListener('resize',updateProgress);updateProgress();
document.querySelector('#reset').addEventListener('click',()=>viewport.scrollTo({left:0,behavior:reducedMotion.matches?'instant':'smooth'}));
const about=document.querySelector('#about');const aboutBtn=document.querySelector('#aboutBtn');
function setAbout(open){about.hidden=!open;aboutBtn.setAttribute('aria-expanded',String(open));aboutBtn.textContent=open?'ABOUT −':'ABOUT +';hidePreview()}
aboutBtn.addEventListener('click',()=>setAbout(about.hidden));document.querySelector('#aboutClose').addEventListener('click',()=>setAbout(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){setAbout(false);if(openId!==-1)toggle(openId)}});

/* ========================================
   VERTICAL SCROLLING INSIDE OPEN COLUMNS
   ======================================== */

viewport.addEventListener('wheel', (event) => {

  // Detect whether the cursor is over an open project.
  const column = event.target.closest('.project.open');

  if (!column) return;

  // Stop horizontal momentum while inside the column.
  stopMomentum();
  hidePreview();

  // Prevent the original horizontal wheel handler
  // from processing this event.
  event.stopImmediatePropagation();

  // Mouse-wheel vertical scrolling remains native.
  // Convert horizontal trackpad gestures to vertical
  // movement within the expanded column.
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
    event.preventDefault();

    const modifier =
      event.deltaMode === 1 ? 16 :
      event.deltaMode === 2 ? innerHeight : 1;

    column.scrollTop += event.deltaX * modifier;
  }

}, { capture: true, passive: false });


// Start every expanded project at the top.
projectsEl.addEventListener('click', (event) => {
  const trigger = event.target.closest('.project-trigger');

  if (!trigger) return;

  const opened = trigger.closest('.project.open');

  if (opened) {
    opened.scrollTop = 0;
  }
});
