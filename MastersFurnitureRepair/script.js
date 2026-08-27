if(window.lucide) lucide.createIcons();
const menu=document.querySelector('.menu');
const header=document.querySelector('.topbar');
menu.addEventListener('click',()=>{const open=header.classList.toggle('open');menu.setAttribute('aria-expanded',open)});
document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>header.classList.remove('open')));
document.getElementById('year').textContent=new Date().getFullYear();
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

const hangingPhotos=[...document.querySelectorAll('.hanging-photo')];
const galleryViewport=document.querySelector('.hanging-viewport');
let previousX=galleryViewport.scrollLeft,scrollVelocity=0,animationFrame;
const updateSwing=()=>{
  const currentX=galleryViewport.scrollLeft;
  scrollVelocity+=(currentX-previousX-scrollVelocity)*.22;
  previousX=currentX;
  hangingPhotos.forEach((photo,index)=>{
    const rect=photo.getBoundingClientRect();
    const proximity=Math.max(0,1-Math.abs(rect.left+rect.width/2-window.innerWidth/2)/window.innerWidth);
    const rest=[-.45,.25,-.15][index%3];
    const motion=Math.max(-.65,Math.min(.65,scrollVelocity*.012))*proximity;
    photo.style.setProperty('--swing',`${rest+motion*(index%2?-.82:1)}deg`);
  });
  scrollVelocity*=.82;
  if(Math.abs(scrollVelocity)>.03) animationFrame=requestAnimationFrame(updateSwing);
};
galleryViewport.addEventListener('scroll',()=>{cancelAnimationFrame(animationFrame);animationFrame=requestAnimationFrame(updateSwing)},{passive:true});
galleryViewport.addEventListener('wheel',event=>{
  if(Math.abs(event.deltaY)>Math.abs(event.deltaX)){event.preventDefault();galleryViewport.scrollLeft+=event.deltaY;}
},{passive:false});
document.querySelector('.gallery-prev').addEventListener('click',()=>galleryViewport.scrollBy({left:-galleryViewport.clientWidth*.82,behavior:'smooth'}));
document.querySelector('.gallery-next').addEventListener('click',()=>galleryViewport.scrollBy({left:galleryViewport.clientWidth*.82,behavior:'smooth'}));
let dragging=false,startX=0,startScroll=0;
galleryViewport.addEventListener('pointerdown',event=>{dragging=true;startX=event.clientX;startScroll=galleryViewport.scrollLeft;galleryViewport.setPointerCapture(event.pointerId)});
galleryViewport.addEventListener('pointermove',event=>{if(dragging)galleryViewport.scrollLeft=startScroll-(event.clientX-startX)});
galleryViewport.addEventListener('pointerup',()=>dragging=false);
galleryViewport.addEventListener('pointercancel',()=>dragging=false);
updateSwing();
