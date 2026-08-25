var m=document.getElementById('modal');
function pop(){m.classList.add('open');document.body.style.overflow='hidden';}
function popClose(){m.classList.remove('open');document.body.style.overflow='';}
function popOut(e){if(e.target===m)popClose();}
document.addEventListener('keydown',function(e){if(e.key==='Escape'){popClose();mobClose();}});
function mobOpen(){document.getElementById('mobNav').classList.add('open');document.getElementById('mobBg').classList.add('open');document.body.style.overflow='hidden';}
function mobClose(){document.getElementById('mobNav').classList.remove('open');document.getElementById('mobBg').classList.remove('open');document.body.style.overflow='';}
var nav=document.getElementById('nav');
window.addEventListener('scroll',function(){nav.classList.toggle('scrolled',window.scrollY>50);});
var allRv=document.querySelectorAll('.rv');
var initObs=new IntersectionObserver(function(e){e.forEach(function(x){if(x.isIntersecting)x.target.classList.add('show');});},{threshold:.1,rootMargin:'0px 0px -30px 0px'});
allRv.forEach(function(el){initObs.observe(el);});
