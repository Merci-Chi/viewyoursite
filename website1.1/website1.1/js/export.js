/* ============================================
   ViewYourSite v1.1 - Export Functionality
   ============================================ */

function exportSite() {
    const html = generateExportHTML();
    
    const blob = new Blob([html],{type:'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href=url;
    a.download=(VYS.site.name||'website').replace(/\s+/g,'-').toLowerCase()+'.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast('Exported successfully','ok');
}

function generateExportHTML(){
    const els = [...VYS.elements].sort((a,b)=>(a.zIndex||1)-(b.zIndex||1));
    const s = VYS.settings;
    
    let elsHtml='';
    els.forEach(d => { elsHtml+=exportElHTML(d); });
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>${VYS.site.name||'My Website'}</title>
    <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:${s.fontFamily||'-apple-system,sans-serif'};background:${s.bgColor||'#fff'};min-height:100vh;font-size:${s.fontSize||16}px;color:#333;}
        .page{position:relative;width:100%;max-width:1100px;margin:0 auto;padding:20px;min-height:100vh;}
        .el{position:absolute;}
        .el-text{font-size:14px;line-height:1.5;}
        .el-heading{font-size:32px;font-weight:700;line-height:1.2;color:#000;}
        .el-image img{width:100%;height:100%;object-fit:cover;}
        .el-video video{width:100%;height:100%;object-fit:contain;}
        .el-button{display:inline-flex;align-items:center;justify-content:center;padding:12px 28px;background:#000;color:#fff;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;cursor:pointer;border:none;}
        .el-divider{width:100%;height:1px;background:#ddd;}
        .el-container{background:#f7f7f7;border-radius:10px;}
        .el-section{width:100%;left:0!important;background:linear-gradient(135deg,#fafafa,#eee);}
        .el-form{background:#fff;padding:24px;border-radius:10px;border:1px solid #eee;}
        .el-form input,.el-form textarea,.el-form select{width:100%;padding:10px 14px;margin-bottom:12px;border:1px solid #ddd;border-radius:6px;font-size:14px;}
        .el-form button[type=submit]{width:100%;padding:12px;background:#000;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;}
        .accordion-item{border:1px solid #ddd;border-radius:6px;margin-bottom:6px;overflow:hidden;}
        .accordion-header{padding:12px 14px;background:#f7f7f7;cursor:pointer;display:flex;justify-content:space-between;font-weight:500;}
        .accordion-body{padding:12px 14px;display:none;font-size:13px;color:#666;}
        .accordion-item.open .accordion-body{display:block;}
        .tabs-nav{display:flex;border-bottom:2px solid #ddd;background:#f7f7f7;}
        .tab-btn{flex:1;padding:12px 16px;border:none;background:transparent;font-size:12px;font-weight:500;color:#666;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;}
        .tab-btn.active{color:#000;border-bottom-color:#000;background:#fff;}
        .tabs-panel{padding:14px;display:none;font-size:13px;color:#666;}
        .tabs-panel.open{display:block;}
        .social-icons{display:flex;gap:8px;}
        .social-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:#eee;border-radius:50%;color:#666;text-decoration:none;font-size:14px;}
        @media(max-width:768px){.page{padding:10px;}.el-section{padding-left:20px!important;padding-right:20px!important;}}
    </style>
</head>
<body>
    <div class="page">${elsHtml}</div>
    <script>
        document.querySelectorAll('.accordion-header').forEach(h=>h.addEventListener('click',()=>h.parentElement.classList.toggle('open')));
        document.querySelectorAll('.tab-btn').forEach((b,i)=>{
            b.addEventListener('click',()=>{
                const t=b.closest('.el-tabs')||b.parentElement.parentElement;
                t.querySelectorAll('.tab-btn').forEach(x=>x.classList.remove('active'));
                t.querySelectorAll('.tabs-panel').forEach(x=>x.classList.remove('open'));
                b.classList.add('active');
                t.querySelectorAll('.tabs-panel')[i]?.classList.add('open');
            });
        });
        document.querySelectorAll('.el-tabs').forEach(t=>{t.querySelector('.tab-btn')?.classList.add('active');t.querySelector('.tabs-panel')?.classList.add('open');});
    </script>
</body></html>`;
}

function exportElHTML(d){
    const st = buildStyleStr(d);
    
    switch(d.type){
        case 'text': return `<div class="el el-text" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;${st}">${esc(d.content||'')}</div>`;
        case 'heading': return `<${d.tag||'h2'} class="el el-heading" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;${st}">${esc(d.content||'')}</${d.tag||'h2'}>`;
        case 'image': return d.src?`<div class="el el-image" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;height:${d.height}px;${st}"><img src="${d.src}" alt="${esc(d.alt||'')}"></div>`:'';
        case 'video': return d.src?`<div class="el el-video" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;height:${d.height}px;${st}"><video src="${d.src}"${d.poster?` poster="${d.poster}"`:''}${d.controls!==false?' controls':''}${d.autoPlay?' autoplay':''}${d.loop?' loop':''}></video></div>`:'';
        case 'button': return `<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;${st}"><a href="${d.href||'#'}" target="${d.target||'_self'}" class="el-button">${esc(d.content||'Button')}</a></div>`;
        case 'link': return `<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;${st}"><a href="${d.href||'#'}">${esc(d.content||'Link')}</a></div>`;
        case 'divider': return `<div class="el el-divider" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;${st}"></div>`;
        case 'spacer': return `<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;height:${d.height}px;"></div>`;
        case 'container': return `<div class="el el-container" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;height:${d.height}px;${st}">Container</div>`;
        case 'section': return `<div class="el el-section" style="top:${d.y}px;width:100%;height:${d.height}px;padding:${(d.styles&&d.styles.padding)||'60px 40px'};${st}">Section Content</div>`;
        case 'columns':
            let c='';for(let i=0;i<(d.cols||2);i++)c+=`<div style="flex:1;background:#f7f7f7;border-radius:6px;padding:20px;">Column ${i+1}</div>`;
            return `<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;height:${d.height}px;display:flex;gap:12px;${st}">${c}</div>`;
        case 'grid':
            let g='';for(let i=0;i<((d.cols||3)*(d.rows||2));i++)g+=`<div style="background:#f7f7f7;border-radius:6px;min-height:50px;">Cell ${i+1}</div>`;
            return `<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;height:${d.height}px;display:grid;grid-template-columns:repeat(${d.cols||3},1fr);gap:10px;padding:10px;${st}">${g}</div>`;
        case 'form':
            let f='';(d.fields||[]).forEach(fd=>{if(fd.toLowerCase()==='message')f+='<textarea placeholder="'+fd+'"></textarea>';else f+='<input type="'+(fd.toLowerCase()==='email'?'email':'text')+'" placeholder="'+fd+'">';});
            f+='<button type="submit">'+(d.submitText||Submit)+'</button>';
            return `<form class="el el-form" action="${d.action||''}" method="${d.method||'post'}" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;${st}">${f}</form>`;
        case 'input': return `<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;${st}">${d.label?'<label>'+esc(d.label)+'</label>':''}<input type="${d.type||'text'}" placeholder="${d.placeholder||''}"></div>`;
        case 'textarea': return `<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;${st}">${d.label?'<label>'+esc(d.label)+'</label>':''}<textarea placeholder="${d.placeholder||''}" rows="${d.rows||4}"></textarea></div>`;
        case 'checkbox': return `<div class="el" style="left:${d.x}px;top:${d.y}px;${st}"><label><input type="checkbox"${d.checked?' checked':''}> ${esc(d.label||'Option')}</label></div>`;
        case 'select':
            let o='';(d.options||[]).forEach(opt=>o+='<option value="'+opt+'">'+opt+'</option>');
            return `<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;${st}">${d.label?'<label>'+esc(d.label)+'</label>':''}<select>${o}</select></div>`;
        case 'accordion':
            let a='';(d.items||[]).forEach(it=>a+='<div class="accordion-item"><div class="accordion-header">'+esc(it.title)+'<i class="fas fa-chevron-down" style="font-size:10px;"></i></div><div class="accordion-body">'+it.content+'</div></div>');
            return `<div class="el el-accordion" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;${st}">${a}</div>`;
        case 'tabs':
            let tn='',tp='';(d.tabs||[]).forEach((t,i)=>{tn+='<button class="tab-btn'+(i===0?' active':'')+'">'+t+'</button>';tp+='<div class="tabs-panel'+(i===0?' open':'')+'">Content for '+t+'</div>';});
            return `<div class="el-tabs" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;${st}"><div class="tabs-nav">${tn}</div>${tp}</div>`;
        case 'icon': return `<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;height:${d.height}px;${st}"><i class="fas ${d.iconClass||'fa-star'}"></i></div>`;
        case 'social':
            const icons={facebook:'fa-facebook-f',twitter:'fa-twitter',instagram:'fa-instagram',linkedin:'fa-linkedin-in'};
            let sc='';(d.platforms||[]).forEach(p=>sc+='<a class="social-icon"><i class="fab '+icons[p]||'fa-link'+'"></i></a>');
            return `<div class="social-icons" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;${st}">${sc||'<a class="social-icon"><i class="fas fa-share-alt"></i></a>'}</div>`;
        case 'map': return d.location?`<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;height:${d.height}px;${st}"><iframe src="https://maps.google.com/maps?q=${encodeURIComponent(d.location)}&output=embed" width="100%" height="100%" frameborder="0"></iframe></div>`:'';
        case 'embed':case 'html': return `<div class="el el-${d.type}" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;height:${d.height}px;${st}">${d.code||''}</div>`;
        default:return `<div class="el" style="left:${d.x}px;top:${d.y}px;width:${d.width}px;height:${d.height}px;${st}">${esc(d.content||'')}</div>`;
    }
}

function buildStyleStr(d){
    const s=d.styles||{};
    const parts=[];
    if(s.fontSize)parts.push('font-size:'+s.fontSize);
    if(s.color)parts.push('color:'+s.color);
    if(s.fontWeight)parts.push('font-weight:'+s.fontWeight);
    if(s.background||s.backgroundColor)parts.push('background:'+(s.background||s.backgroundColor));
    if(s.borderRadius)parts.push('border-radius:'+s.borderRadius);
    if(s.padding)parts.push('padding:'+s.padding);
    if(s.margin)parts.push('margin:'+s.margin);
    if(s.opacity&&s.opacity!=1)parts.push('opacity:'+s.opacity);
    if(s.transform)parts.push('transform:'+s.transform);
    if(d.customCss)parts.push(d.customCss);
    return parts.join(';');
}
