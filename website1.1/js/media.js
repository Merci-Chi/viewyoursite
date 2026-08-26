/* ============================================
   ViewYourSite v1.1 - Media Library
   ============================================ */

function initMedia() {
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    
    if(uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleUpload);
    }
    
    renderMedia();
}

function handleUpload(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        if(!file.type.startsWith('image/') && !file.type.startsWith('video/')){
            toast('Invalid file: '+file.name,'err');return;
        }
        
        const reader = new FileReader();
        reader.onload = ev => {
            VYS.media.push({
                id:'m_'+Date.now()+'_'+Math.random().toString(36).substr(2,5),
                name:file.name,
                type:file.type.startsWith('image/')?'img':'vid',
                dataUrl:ev.target.result,
                size:file.size
            });
            saveToStorage();
            renderMedia();
            
            if(window.mediaPickMode) applyToSelected(ev.target.result, file.type.startsWith('image/')?'img':'vid');
        };
        reader.readAsDataURL(file);
    });
    
    e.target.value='';
    toast(files.length+' file(s) uploaded','ok');
}

function renderMedia() {
    const grid = document.getElementById('mediaGrid');
    if(!grid) return;
    
    if(VYS.media.length===0){
        grid.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:40px 20px;color:#999;">
            <i class="fas fa-images" style="font-size:32px;display:block;margin-bottom:10px;"></i>
            <p>No media yet</p>
            <small style="color:#bbb;">Upload images or videos</small>
        </div>`;
        return;
    }
    
    grid.innerHTML=VYS.media.map(m=>`
        <div class="media-item" data-id="${m.id}" onclick="selectMedia('${m.id}')">
            ${m.type==='img'?`<img src="${m.dataUrl}" alt="${m.name}">`:`<video src="${m.dataUrl}"></video>`}
            <div class="media-overlay">
                <button onclick="event.stopPropagation();insertMedia('${m.id}')"><i class="fas fa-plus"></i></button>
                <button onclick="event.stopPropagation();delMedia('${m.id}')" style="color:#dc2626;"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

function selectMedia(id){
    document.querySelectorAll('.media-item').forEach(m=>{
        m.style.outline=m.dataset.id===id?'2px solid #000':'none';
    });
}

function insertMedia(id){
    const m=VYS.media.find(x=>x.id===id);
    if(!m)return;
    applyToSelected(m.dataUrl,m.type);
}

function applyToSelected(dataUrl,type){
    if(!VYS.selectedEl){toast('Select element first','err');return;}
    
    const el=VYS.selectedEl;
    const d=VYS.elements.find(x=>x.id===el.dataset.id);
    if(!d)return;
    
    if(d.type==='image'){
        d.src=dataUrl;d.alt='Image';
        el.innerHTML=`<img src="${dataUrl}" alt="Image">`;
        updatePropsPanel();pushHistory();saveToStorage();
        toast('Image added');
    }else if(d.type==='video'){
        d.src=dataUrl;
        el.innerHTML=`<video src="${dataUrl}" controls></video>`;
        updatePropsPanel();pushHistory();saveToStorage();
        toast('Video added');
    }else{
        toast('Cannot add to this element type','err');
    }
}

function delMedia(id){
    const m=VYS.media.find(x=>x.id===id);
    if(!m)return;
    
    if(confirm(`Delete "${m.name}"?`)){
        VYS.media=VYS.media.filter(x=>x.id!==id);
        renderMedia();saveToStorage();
        toast('Deleted');
    }
}

document.addEventListener('DOMContentLoaded', initMedia);

// Watch for media panel visibility
const panelObs = new MutationObserver(() => {
    if(document.getElementById('mediaPanel')?.classList.contains('active')) renderMedia();
});
if(document.getElementById('panelDrawer')) panelObs.observe(document.getElementById('panelDrawer'),{childList:true,subtree:true});
