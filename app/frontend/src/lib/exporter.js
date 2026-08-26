// Exports a full multi-page site as a single self-contained HTML file.
import { marked } from "marked";

function esc(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function bgCss(bg) {
  if (!bg || bg.type === "none") return "";
  if (bg.type === "color") return `background:${bg.value};`;
  if (bg.type === "gradient") return `background:${bg.value};`;
  if (bg.type === "image") return `background:url('${bg.value}') center/cover no-repeat;`;
  if (bg.type === "video") return "";
  return "";
}

function elementHTML(el, siteBase) {
  const styleParts = [
    `position:absolute`, `left:${el.x}px`, `top:${el.y}px`,
    `width:${el.width}px`, `height:${el.height}px`,
    `opacity:${el.opacity}`, `transform:rotate(${el.rotation}deg)`,
    `z-index:${el.zIndex || 0}`,
  ];
  if (el.hidden) styleParts.push("display:none");
  const style = styleParts.join(";");
  const p = el.props || {};
  const link = el.link?.href;
  const openWrap = link ? `<a href="${esc(link)}" ${el.link?.target === "_blank" ? 'target="_blank"' : ""} ${el.link?.nofollow ? 'rel="nofollow"' : ""} style="${style};text-decoration:none;color:inherit;display:block">` : `<div style="${style}">`;
  const closeWrap = link ? `</a>` : `</div>`;
  let inner = "";

  switch (el.type) {
    case "heading":
    case "text": {
      const tag = el.type === "heading" ? (p.tag || "h1") : "div";
      const s = `font-family:${p.fontFamily};font-size:${p.fontSize}px;font-weight:${p.fontWeight};line-height:${p.lineHeight};letter-spacing:${p.letterSpacing}px;color:${p.color};text-align:${p.textAlign};padding:${p.padding}px;${bgCss(p.background)}width:100%;height:100%;box-sizing:border-box;overflow:hidden;`;
      inner = `<${tag} style="${s}">${p.html}</${tag}>`;
      break;
    }
    case "image": {
      const f = p.filters || {};
      const filter = `filter:blur(${f.blur||0}px) grayscale(${(f.grayscale||0)}) sepia(${(f.sepia||0)}) brightness(${f.brightness||1}) contrast(${f.contrast||1}) saturate(${f.saturate||1}) hue-rotate(${f.hueRotate||0}deg) invert(${f.invert||0});`;
      const transform = `transform:scaleX(${p.flipX?-1:1}) scaleY(${p.flipY?-1:1});`;
      const s = `width:100%;height:100%;object-fit:${p.fit};object-position:${(p.focal?.x||0.5)*100}% ${(p.focal?.y||0.5)*100}%;border-radius:${p.radius}px;opacity:${p.opacity};${filter}${transform}display:block;`;
      inner = p.src ? `<img src="${esc(p.src)}" alt="${esc(p.alt)}" ${p.lightbox ? '' : ''} style="${s}"/>` : `<div style="width:100%;height:100%;background:#eee;border-radius:${p.radius}px;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;">Image</div>`;
      if (p.caption) inner += `<div style="font-size:12px;color:#666;margin-top:4px;text-align:center;">${esc(p.caption)}</div>`;
      break;
    }
    case "video": {
      if (p.source === "youtube" && p.src) {
        const idm = p.src.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
        const id = idm ? idm[1] : p.src;
        inner = `<iframe src="https://www.youtube.com/embed/${id}${p.autoplay ? '?autoplay=1&mute=1' : ''}" style="width:100%;height:100%;border:0;border-radius:12px" allowfullscreen></iframe>`;
      } else if (p.source === "vimeo" && p.src) {
        const idm = p.src.match(/vimeo\.com\/(\d+)/);
        const id = idm ? idm[1] : p.src;
        inner = `<iframe src="https://player.vimeo.com/video/${id}${p.autoplay ? '?autoplay=1&muted=1' : ''}" style="width:100%;height:100%;border:0;border-radius:12px" allowfullscreen></iframe>`;
      } else {
        inner = `<video src="${esc(p.src)}" ${p.autoplay ? 'autoplay' : ''} ${p.muted ? 'muted' : ''} ${p.loop ? 'loop' : ''} ${p.controls ? 'controls' : ''} playsinline style="width:100%;height:100%;object-fit:cover;border-radius:12px;background:#000"></video>`;
      }
      break;
    }
    case "button": {
      const s = `background:${p.bg};color:${p.color};border:${p.borderWidth}px solid ${p.borderColor};border-radius:${p.radius}px;font-weight:${p.fontWeight};font-size:${p.fontSize}px;padding:${p.paddingY}px ${p.paddingX}px;cursor:pointer;font-family:inherit;display:inline-flex;align-items:center;gap:8px;`;
      const wrap = `display:flex;justify-content:${p.align === 'left' ? 'flex-start' : p.align === 'right' ? 'flex-end' : 'center'};width:100%;height:100%;align-items:center;`;
      const btnStyle = p.fullWidth ? s + "width:100%;justify-content:center;" : s;
      inner = `<div style="${wrap}"><button style="${btnStyle}">${esc(p.label)}</button></div>`;
      break;
    }
    case "form": {
      const fields = p.fields.map((f) => {
        const label = `<label style="display:block;font-size:13px;margin-bottom:4px">${esc(f.label)}${f.required ? ' *' : ''}</label>`;
        const input = f.type === "textarea"
          ? `<textarea placeholder="${esc(f.placeholder||'')}" ${f.required?'required':''} style="width:100%;padding:8px;border-radius:8px;border:1px solid #ddd;font-family:inherit;min-height:80px"></textarea>`
          : f.type === "select"
          ? `<select style="width:100%;padding:8px;border-radius:8px;border:1px solid #ddd">${(f.options||[]).map(o=>`<option>${esc(o)}</option>`).join('')}</select>`
          : `<input type="${f.type||'text'}" placeholder="${esc(f.placeholder||'')}" ${f.required?'required':''} style="width:100%;padding:8px;border-radius:8px;border:1px solid #ddd;font-family:inherit" />`;
        return `<div style="margin-bottom:10px">${label}${input}</div>`;
      }).join("");
      inner = `<form style="width:100%;height:100%;padding:12px;box-sizing:border-box;overflow:auto"><h3 style="margin:0 0 12px 0">${esc(p.title||'')}</h3>${fields}<button type="button" style="background:${p.submitColor};color:white;border:0;border-radius:999px;padding:10px 18px;cursor:pointer">${esc(p.submitLabel)}</button></form>`;
      break;
    }
    case "accordion": {
      inner = `<div style="width:100%;height:100%;overflow:auto">` + p.items.map((it) => `<details style="border-bottom:1px solid #eee;padding:10px 0" ${it.open ? 'open' : ''}><summary style="cursor:pointer;font-weight:600">${esc(it.title)}</summary><div style="padding:8px 0;color:#444">${esc(it.body)}</div></details>`).join("") + `</div>`;
      break;
    }
    case "shape": {
      const shape = p.shape;
      const common = `width:100%;height:100%;background:${p.fill};border:${p.strokeWidth}px solid ${p.stroke};opacity:${p.opacity};`;
      if (shape === "circle") inner = `<div style="${common};border-radius:50%"></div>`;
      else if (shape === "polygon") inner = `<div style="${common};clip-path:polygon(50% 0,100% 38%,82% 100%,18% 100%,0 38%)"></div>`;
      else inner = `<div style="${common};border-radius:${p.radius}px"></div>`;
      break;
    }
    case "line": {
      const s = p.orientation === "vertical"
        ? `width:${p.thickness}px;height:100%;background:${p.color};border-left:${p.thickness}px ${p.style} ${p.color};`
        : `width:100%;height:${p.thickness}px;background:${p.color};border-top:${p.thickness}px ${p.style} ${p.color};`;
      inner = `<div style="${s}"></div>`;
      break;
    }
    case "audio":
      inner = `<audio src="${esc(p.src)}" ${p.controls ? 'controls' : ''} ${p.autoplay?'autoplay':''} ${p.loop?'loop':''} ${p.muted?'muted':''} style="width:100%"></audio>`;
      break;
    case "quote":
      inner = `<blockquote style="font-family:${p.fontFamily};font-size:${p.fontSize}px;color:${p.color};border-left:3px solid #000000;padding:8px 16px;margin:0;height:100%;box-sizing:border-box">"${esc(p.text)}"<footer style="font-size:14px;margin-top:8px;color:#666">— ${esc(p.author)}</footer></blockquote>`;
      break;
    case "code":
      if (p.render && p.language === "html") inner = p.code;
      else inner = `<pre style="width:100%;height:100%;overflow:auto;background:#0f0f10;color:#f5f5f5;padding:12px;border-radius:8px;font-family:monospace;font-size:13px;margin:0"><code>${esc(p.code)}</code></pre>`;
      break;
    case "markdown":
      inner = `<div style="width:100%;height:100%;overflow:auto;padding:8px;box-sizing:border-box">${marked.parse(p.md || "")}</div>`;
      break;
    case "embed":
      inner = `<div style="width:100%;height:100%">${p.html}</div>`;
      break;
    case "social": {
      const icons = { instagram: "IG", twitter: "TW", github: "GH", facebook: "FB", linkedin: "IN", youtube: "YT", tiktok: "TK" };
      inner = `<div style="display:flex;gap:${p.gap}px;align-items:center;height:100%">` + p.items.map((it) => `<a href="${esc(it.url||'#')}" target="_blank" style="color:${p.color};font-size:${p.size}px;text-decoration:none;font-weight:600;font-family:monospace">${icons[it.platform] || it.platform.slice(0,2).toUpperCase()}</a>`).join("") + `</div>`;
      break;
    }
    case "search":
      inner = `<form style="width:100%;height:100%"><input type="search" placeholder="${esc(p.placeholder)}" style="width:100%;height:100%;padding:0 16px;border-radius:${p.radius}px;border:1px solid #ddd;color:${p.color};font-family:inherit;box-sizing:border-box"/></form>`;
      break;
    case "calendar":
      inner = `<div style="width:100%;height:100%;background:#fff;border-radius:12px;border:1px solid #eee;padding:12px;box-sizing:border-box;font-size:12px">Calendar widget</div>`;
      break;
    case "chart":
      inner = `<div style="width:100%;height:100%;background:#fff;border-radius:12px;border:1px solid #eee;padding:12px;box-sizing:border-box;font-size:12px">${p.variant} chart</div>`;
      break;
    case "container":
      inner = `<div style="width:100%;height:100%;border-radius:${p.radius}px;padding:${p.padding}px;box-sizing:border-box;${bgCss(p.background)}"></div>`;
      break;
    default:
      inner = "";
  }
  return openWrap + inner + closeWrap;
}

function pageHTML(page, site) {
  const bg = bgCss(page.background);
  const headerHtml = site.header.show && page.showHeader
    ? `<header style="position:relative;width:100%;height:${site.header.height}px;${bgCss(site.header.background)};overflow:hidden">${site.header.elements.map((e) => elementHTML(e)).join("")}</header>`
    : "";
  const footerHtml = site.footer.show && page.showFooter
    ? `<footer style="position:relative;width:100%;height:${site.footer.height}px;${bgCss(site.footer.background)};overflow:hidden">${site.footer.elements.map((e) => elementHTML(e)).join("")}</footer>`
    : "";
  const body = `<main style="position:relative;width:100%;height:${page.canvasHeight}px;${bg}overflow:hidden">${page.elements.map((e) => elementHTML(e)).join("")}</main>`;
  return `${headerHtml}${body}${footerHtml}${page.inject?.body || ""}`;
}

export function exportSiteHTML(site) {
  const home = site.pages.find((p) => p.isHome) || site.pages[0];

  const pagesBlocks = site.pages.filter((p) => p.kind !== "link").map((p) => {
    const width = p.canvasWidth || 1280;
    const totalHeight = (site.header.show && p.showHeader ? site.header.height : 0) + (p.canvasHeight || 900) + (site.footer.show && p.showFooter ? site.footer.height : 0);
    return `
    <section id="page-${p.slug}" data-page-id="${p.id}" style="display:${p.id === home.id ? 'block' : 'none'};width:100%;">
      ${p.password ? `<script>(function(){var k="${p.slug}_pw";if(sessionStorage.getItem(k)!=="1"){var v=prompt("Password required for ${esc(p.title)}");if(v!=="${esc(p.password)}"){document.getElementById('page-${p.slug}').innerHTML='<div style="padding:80px;text-align:center;font-family:sans-serif">Wrong password.</div>';}else{sessionStorage.setItem(k,"1")}}})();</script>` : ""}
      <div style="width:${width}px;max-width:100%;margin:0 auto;position:relative;">${pageHTML(p, site)}</div>
    </section>`;
  }).join("");

  const routerScript = `
<script>
document.querySelectorAll('a[data-page]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();var t=a.getAttribute('data-page');document.querySelectorAll('section[data-page-id]').forEach(function(s){s.style.display=s.getAttribute('data-page-id')===t?'block':'none';});window.scrollTo(0,0);});});
</script>`;

  const seo = home.seo || {};
  const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(seo.title || site.name || 'Site')}</title>
<meta name="description" content="${esc(seo.description || '')}"/>
${seo.ogImage ? `<meta property="og:image" content="${esc(seo.ogImage)}"/>` : ''}
${site.favicon ? `<link rel="icon" href="${esc(site.favicon)}"/>` : ''}
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=${(site.theme?.display||'Fraunces').replace(/ /g,'+')}:wght@400;600;700&family=${(site.theme?.body||'DM+Sans').replace(/ /g,'+')}:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
:root{--display:'${site.theme?.display||'Fraunces'}',serif;--body:'${site.theme?.body||'DM Sans'}',sans-serif;--accent:${site.theme?.accent||'#000000'};--ink:${site.theme?.ink||'#000000'};--paper:${site.theme?.paper||'#ffffff'};}
*{box-sizing:border-box}
html,body{margin:0;padding:0;font-family:var(--body);color:var(--ink);${bgCss(site.background)}}
a{color:var(--accent)}
</style>
${home.inject?.header || ""}
</head>
<body>
${pagesBlocks}
${routerScript}
${home.inject?.footer || ""}
</body>
</html>`;
  return doc;
}

export function downloadHTML(site) {
  const html = exportSiteHTML(site);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `${site.name || 'site'}.html`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
