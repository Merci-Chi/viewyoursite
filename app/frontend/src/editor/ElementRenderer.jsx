import { useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { marked } from "marked";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Instagram, Twitter, Github, Facebook, Linkedin, Youtube, Music2, Search } from "lucide-react";

const ICONS = { instagram: Instagram, twitter: Twitter, github: Github, facebook: Facebook, linkedin: Linkedin, youtube: Youtube, tiktok: Music2 };

function bg(bgd) {
  if (!bgd || bgd.type === "none") return {};
  if (bgd.type === "color") return { background: bgd.value };
  if (bgd.type === "gradient") return { background: bgd.value };
  if (bgd.type === "image") return { backgroundImage: `url(${bgd.value})`, backgroundSize: "cover", backgroundPosition: "center" };
  return {};
}

export default function ElementRenderer({ el, editingText, setEditingText }) {
  const p = el.props || {};
  const updateProps = useStore((s) => s.updateElementProps);
  const updateElement = useStore((s) => s.updateElement);
  const ref = useRef(null);

  switch (el.type) {
    case "text":
    case "heading": {
      const Tag = el.type === "heading" ? (p.tag || "h1") : "div";
      return (
        <Tag
          ref={ref}
          contentEditable={editingText}
          suppressContentEditableWarning
          data-placeholder="Type here…"
          data-empty={!p.html || p.html === "<br>"}
          onBlur={(e) => { updateProps(el.id, { html: e.currentTarget.innerHTML }); setEditingText && setEditingText(false); }}
          style={{
            fontFamily: p.fontFamily, fontSize: p.fontSize, fontWeight: p.fontWeight,
            lineHeight: p.lineHeight, letterSpacing: `${p.letterSpacing}px`,
            color: p.color, textAlign: p.textAlign, padding: p.padding,
            ...bg(p.background),
            width: "100%", height: "100%", overflow: el.type === "heading" ? "visible" : "hidden", margin: 0, boxSizing: "border-box",
            outline: "none", cursor: editingText ? "text" : "inherit",
          }}
          dangerouslySetInnerHTML={{ __html: p.html }}
        />
      );
    }
    case "image": {
      const f = p.filters || {};
      const filter = `blur(${f.blur||0}px) grayscale(${f.grayscale||0}) sepia(${f.sepia||0}) brightness(${f.brightness||1}) contrast(${f.contrast||1}) saturate(${f.saturate||1}) hue-rotate(${f.hueRotate||0}deg) invert(${f.invert||0})`;
      if (!p.src) return (
        <label className="w-full h-full flex items-center justify-center bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-xl cursor-pointer" style={{ pointerEvents: "auto" }}>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = () => { updateProps(el.id, { src: reader.result, alt: file.name }); useStore.getState().addToGallery({ type: "image", data: reader.result, name: file.name, size: file.size }); };
            reader.readAsDataURL(file);
          }} />
          <div className="text-center text-neutral-400">
            <div className="text-3xl leading-none">+</div>
            <div className="text-xs mt-1">Add image</div>
          </div>
        </label>
      );
      return <img src={p.src} alt={p.alt} style={{ width: "100%", height: "100%", objectFit: p.fit, objectPosition: `${(p.focal?.x||0.5)*100}% ${(p.focal?.y||0.5)*100}%`, borderRadius: p.radius, opacity: p.opacity, filter, transform: `scaleX(${p.flipX?-1:1}) scaleY(${p.flipY?-1:1})`, display: "block" }}/>;
    }
    case "video": {
      if (!p.src) return <div className="w-full h-full bg-black rounded-xl flex items-center justify-center text-white/60 text-sm">No video source</div>;
      if (p.source === "youtube") {
        const idm = p.src.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/); const id = idm ? idm[1] : p.src;
        return <iframe src={`https://www.youtube.com/embed/${id}`} style={{ width: "100%", height: "100%", border: 0, borderRadius: 12 }} allowFullScreen />;
      }
      if (p.source === "vimeo") {
        const idm = p.src.match(/vimeo\.com\/(\d+)/); const id = idm ? idm[1] : p.src;
        return <iframe src={`https://player.vimeo.com/video/${id}`} style={{ width: "100%", height: "100%", border: 0, borderRadius: 12 }} allowFullScreen />;
      }
      return <video src={p.src} muted={p.muted} loop={p.loop} controls={p.controls} playsInline style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12, background: "#000" }}/>;
    }
    case "button": {
      const align = p.align === "left" ? "flex-start" : p.align === "right" ? "flex-end" : "center";
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: align }}>
          <button style={{
            background: p.bg, color: p.color, border: `${p.borderWidth}px solid ${p.borderColor}`,
            borderRadius: p.radius, fontWeight: p.fontWeight, fontSize: p.fontSize,
            padding: `${p.paddingY}px ${p.paddingX}px`, cursor: "pointer", fontFamily: "inherit",
            width: p.fullWidth ? "100%" : "auto",
          }}>{p.label}</button>
        </div>
      );
    }
    case "form": {
      return (
        <div className="w-full h-full p-3 overflow-auto bg-white rounded-xl border border-neutral-200">
          {p.title && <h3 className="font-semibold mb-3">{p.title}</h3>}
          <div className={p.layout === "double" ? "grid grid-cols-2 gap-2" : "space-y-2"}>
            {p.fields.map((f) => (
              <div key={f.id}>
                <label className="block text-xs font-medium mb-1">{f.label}{f.required ? " *" : ""}</label>
                {f.type === "textarea"
                  ? <textarea placeholder={f.placeholder} className="w-full px-2 py-1.5 text-sm border rounded-md" rows={3}/>
                  : <input type={f.type} placeholder={f.placeholder} className="w-full px-2 py-1.5 text-sm border rounded-md"/>}
              </div>
            ))}
          </div>
          <button type="button" style={{ background: p.submitColor }} className="mt-3 px-4 py-2 text-white rounded-full text-sm font-medium">{p.submitLabel}</button>
        </div>
      );
    }
    case "accordion":
      return (
        <div className="w-full h-full overflow-auto bg-white rounded-xl border border-neutral-200 p-2">
          {p.items.map((it) => (
            <details key={it.id} className="border-b border-neutral-100 py-2" open={it.open}>
              <summary className="cursor-pointer font-semibold text-sm">{it.title}</summary>
              <div className="text-sm text-neutral-600 pt-2">{it.body}</div>
            </details>
          ))}
        </div>
      );
    case "shape": {
      const base = { width: "100%", height: "100%", background: p.fill, border: `${p.strokeWidth}px solid ${p.stroke}`, opacity: p.opacity };
      if (p.shape === "circle") return <div style={{ ...base, borderRadius: "50%" }}/>;
      if (p.shape === "polygon") return <div style={{ ...base, clipPath: "polygon(50% 0,100% 38%,82% 100%,18% 100%,0 38%)" }}/>;
      return <div style={{ ...base, borderRadius: p.radius }}/>;
    }
    case "line": {
      const isV = p.orientation === "vertical";
      return <div style={{ width: isV ? p.thickness : "100%", height: isV ? "100%" : p.thickness, borderTop: !isV ? `${p.thickness}px ${p.style} ${p.color}` : "none", borderLeft: isV ? `${p.thickness}px ${p.style} ${p.color}` : "none" }}/>;
    }
    case "audio":
      return !p.src
        ? <label className="w-full h-full flex items-center justify-center bg-neutral-100 border border-dashed border-neutral-300 rounded-xl text-xs text-neutral-500 cursor-pointer" style={{ pointerEvents: "auto" }}>
            <input type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if(!f) return; const r = new FileReader(); r.onload=()=>updateProps(el.id,{src:r.result}); r.readAsDataURL(f); }}/>+ Add audio
          </label>
        : <audio src={p.src} controls={p.controls} loop={p.loop} muted={p.muted} style={{ width: "100%" }}/>;
    case "calendar":
      return <div className="w-full h-full bg-white rounded-xl border border-neutral-200 flex items-center justify-center text-sm text-neutral-500">Calendar</div>;
    case "chart":
      return (
        <div className="w-full h-full bg-white rounded-xl border border-neutral-200 p-2">
          <ResponsiveContainer width="100%" height="100%">
            {p.variant === "bar" ? (
              <BarChart data={p.data}><XAxis dataKey="name" hide/><YAxis hide/><Bar dataKey="value" fill={p.color}/></BarChart>
            ) : p.variant === "line" ? (
              <LineChart data={p.data}><XAxis dataKey="name" hide/><YAxis hide/><Line dataKey="value" stroke={p.color} strokeWidth={2}/></LineChart>
            ) : (
              <PieChart><Pie data={p.data} dataKey="value" nameKey="name" outerRadius="80%">{p.data.map((_, i) => <Cell key={i} fill={i%2?p.color:'#000000'}/>)}</Pie></PieChart>
            )}
          </ResponsiveContainer>
        </div>
      );
    case "quote":
      return (
        <blockquote
          contentEditable={editingText}
          suppressContentEditableWarning
          onBlur={(e) => { updateProps(el.id, { text: e.currentTarget.innerText }); setEditingText && setEditingText(false); }}
          style={{ fontFamily: p.fontFamily, fontSize: p.fontSize, color: p.color, borderLeft: "3px solid hsl(var(--accent))", padding: "8px 16px", margin: 0, width: "100%", height: "100%", boxSizing: "border-box", outline: "none" }}
        >"{p.text}"<footer style={{ fontSize: 14, marginTop: 8, color: "#666" }}>— {p.author}</footer></blockquote>
      );
    case "code":
      if (p.render && p.language === "html") return <div style={{ width: "100%", height: "100%", overflow: "auto" }} dangerouslySetInnerHTML={{ __html: p.code }}/>;
      return <pre className="w-full h-full overflow-auto p-3 rounded-lg m-0 font-mono text-xs" style={{ background: p.theme === "dark" ? "#0f0f10" : "#f5f5f4", color: p.theme === "dark" ? "#f5f5f5" : "#000000" }}><code>{p.code}</code></pre>;
    case "markdown":
      return <div className="w-full h-full overflow-auto p-2 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: marked.parse(p.md || "") }}/>;
    case "embed":
      return <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: p.html }}/>;
    case "social": {
      return (
        <div style={{ display: "flex", gap: p.gap, alignItems: "center", height: "100%" }}>
          {p.items.map((it, i) => { const I = ICONS[it.platform]; return I ? <I key={i} size={p.size} color={p.color}/> : null; })}
        </div>
      );
    }
    case "search":
      return <div style={{ width: "100%", height: "100%", position: "relative" }}><Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: p.color }}/><input placeholder={p.placeholder} style={{ width: "100%", height: "100%", padding: "0 16px 0 36px", borderRadius: p.radius, border: "1px solid #ddd", color: p.color, fontFamily: "inherit", boxSizing: "border-box" }}/></div>;
    case "container":
      return <div style={{ width: "100%", height: "100%", borderRadius: p.radius, padding: p.padding, ...bg(p.background) }}/>;
    default:
      return <div className="w-full h-full bg-neutral-100 rounded flex items-center justify-center text-xs text-neutral-400">{el.type}</div>;
  }
}
