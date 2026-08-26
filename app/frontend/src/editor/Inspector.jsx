import { useStore, useCurrentPage } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, Link2, Lock, Trash2, Copy } from "lucide-react";

export default function Inspector() {
  const selectedIds = useStore((s) => s.selectedIds);
  const page = useCurrentPage();
  const updateElement = useStore((s) => s.updateElement);
  const updateProps = useStore((s) => s.updateElementProps);
  const removeElements = useStore((s) => s.removeElements);
  const duplicateElements = useStore((s) => s.duplicateElements);
  const clearSelection = useStore((s) => s.clearSelection);

  if (selectedIds.length !== 1 || !page) return null;
  const el = page.elements.find((e) => e.id === selectedIds[0]);
  if (!el) return null;

  const p = el.props || {};

  return (
    <div className="fixed top-24 right-4 z-30 w-[280px] float-panel p-3 pop-in max-h-[calc(100vh-140px)] overflow-y-auto" data-testid="inspector">
      <div className="flex items-center justify-between mb-3 sticky top-0 bg-inherit pb-2">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-neutral-400">{el.type}</div>
          <div className="font-display font-semibold">Element</div>
        </div>
        <button onClick={clearSelection} className="p-1.5 rounded-full hover:bg-neutral-100"><X size={14}/></button>
      </div>

      {/* Position & size */}
      <Section title="Layout">
        <div className="grid grid-cols-2 gap-2">
          <NumField label="X" value={el.x} onChange={(v) => updateElement(el.id, () => ({ x: v }))}/>
          <NumField label="Y" value={el.y} onChange={(v) => updateElement(el.id, () => ({ y: v }))}/>
          <NumField label="W" value={el.width} onChange={(v) => updateElement(el.id, () => ({ width: v }))}/>
          <NumField label="H" value={el.height} onChange={(v) => updateElement(el.id, () => ({ height: v }))}/>
          <NumField label="Rot" value={el.rotation || 0} onChange={(v) => updateElement(el.id, () => ({ rotation: v }))}/>
          <NumField label="Z" value={el.zIndex || 0} onChange={(v) => updateElement(el.id, () => ({ zIndex: v }))}/>
        </div>
        <RowLabel label="Opacity">
          <Slider value={[(el.opacity ?? 1) * 100]} max={100} onValueChange={(v) => updateElement(el.id, () => ({ opacity: v[0] / 100 }))}/>
        </RowLabel>
      </Section>

      {/* Type-specific */}
      {(el.type === "text" || el.type === "heading") && (
        <Section title="Text style">
          <RowLabel label="Font"><Select value={p.fontFamily} onValueChange={(v) => updateProps(el.id, { fontFamily: v })}><SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger><SelectContent>{["Fraunces","DM Sans","Inter","Georgia","Arial","Times New Roman","Courier New","JetBrains Mono"].map(f=><SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select></RowLabel>
          <div className="grid grid-cols-2 gap-2">
            <NumField label="Size" value={p.fontSize} onChange={(v) => updateProps(el.id, { fontSize: v })}/>
            <NumField label="Weight" value={p.fontWeight} onChange={(v) => updateProps(el.id, { fontWeight: v })} step={100}/>
            <NumField label="Line" value={p.lineHeight} onChange={(v) => updateProps(el.id, { lineHeight: v })} step={0.05}/>
            <NumField label="Track" value={p.letterSpacing} onChange={(v) => updateProps(el.id, { letterSpacing: v })} step={0.1}/>
          </div>
          <RowLabel label="Color"><ColorField value={p.color} onChange={(v) => updateProps(el.id, { color: v })}/></RowLabel>
          <RowLabel label="Background"><BgField value={p.background} onChange={(v) => updateProps(el.id, { background: v })}/></RowLabel>
        </Section>
      )}

      {el.type === "image" && (
        <Section title="Image">
          <RowLabel label="Source">
            <div className="flex gap-1">
              <Input className="h-8 text-xs flex-1" value={p.src} onChange={(e) => updateProps(el.id, { src: e.target.value })} placeholder="URL or upload →"/>
              <label className="pill-btn !px-2 !py-0 cursor-pointer" title="Upload from device">
                <span className="text-xs">↑</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { updateProps(el.id, { src: r.result, alt: f.name }); useStore.getState().addToGallery({ type: "image", data: r.result, name: f.name, size: f.size }); }; r.readAsDataURL(f); }}/>
              </label>
            </div>
          </RowLabel>
          <RowLabel label="Alt text"><Input className="h-8 text-xs" value={p.alt} onChange={(e) => updateProps(el.id, { alt: e.target.value })}/></RowLabel>
          <RowLabel label="Fit"><Select value={p.fit} onValueChange={(v) => updateProps(el.id, { fit: v })}><SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="cover">Cover</SelectItem><SelectItem value="contain">Contain</SelectItem><SelectItem value="fill">Fill</SelectItem></SelectContent></Select></RowLabel>
          <NumField label="Radius" value={p.radius} onChange={(v) => updateProps(el.id, { radius: v })}/>
          <RowLabel label="Grayscale"><Slider value={[(p.filters?.grayscale||0)*100]} max={100} onValueChange={(v)=>updateProps(el.id,{filters:{...p.filters,grayscale:v[0]/100}})}/></RowLabel>
          <RowLabel label="Blur"><Slider value={[p.filters?.blur||0]} max={20} onValueChange={(v)=>updateProps(el.id,{filters:{...p.filters,blur:v[0]}})}/></RowLabel>
          <RowLabel label="Brightness"><Slider value={[(p.filters?.brightness||1)*100]} min={0} max={200} onValueChange={(v)=>updateProps(el.id,{filters:{...p.filters,brightness:v[0]/100}})}/></RowLabel>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => updateProps(el.id, { flipX: !p.flipX })} className="pill-btn !py-1 !text-xs">Flip H</button>
            <button onClick={() => updateProps(el.id, { flipY: !p.flipY })} className="pill-btn !py-1 !text-xs">Flip V</button>
          </div>
        </Section>
      )}

      {el.type === "video" && (
        <Section title="Video">
          <RowLabel label="Source"><Select value={p.source} onValueChange={(v) => updateProps(el.id, { source: v })}><SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="upload">Uploaded / URL</SelectItem><SelectItem value="youtube">YouTube</SelectItem><SelectItem value="vimeo">Vimeo</SelectItem></SelectContent></Select></RowLabel>
          <RowLabel label="Src">
            <div className="flex gap-1">
              <Input className="h-8 text-xs flex-1" value={p.src} onChange={(e) => updateProps(el.id, { src: e.target.value })}/>
              {p.source === "upload" && (
                <label className="pill-btn !px-2 !py-0 cursor-pointer" title="Upload video from device">
                  <span className="text-xs">↑</span>
                  <input type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { updateProps(el.id, { src: r.result }); useStore.getState().addToGallery({ type: "video", data: r.result, name: f.name, size: f.size }); }; r.readAsDataURL(f); }}/>
                </label>
              )}
            </div>
          </RowLabel>
          <ToggleField label="Autoplay" value={p.autoplay} onChange={(v) => updateProps(el.id, { autoplay: v })}/>
          <ToggleField label="Muted" value={p.muted} onChange={(v) => updateProps(el.id, { muted: v })}/>
          <ToggleField label="Loop" value={p.loop} onChange={(v) => updateProps(el.id, { loop: v })}/>
          <ToggleField label="Controls" value={p.controls} onChange={(v) => updateProps(el.id, { controls: v })}/>
        </Section>
      )}

      {el.type === "audio" && (
        <Section title="Audio">
          <RowLabel label="Src">
            <div className="flex gap-1">
              <Input className="h-8 text-xs flex-1" value={p.src} onChange={(e) => updateProps(el.id, { src: e.target.value })}/>
              <label className="pill-btn !px-2 !py-0 cursor-pointer" title="Upload audio from device">
                <span className="text-xs">↑</span>
                <input type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { updateProps(el.id, { src: r.result }); useStore.getState().addToGallery({ type: "audio", data: r.result, name: f.name, size: f.size }); }; r.readAsDataURL(f); }}/>
              </label>
            </div>
          </RowLabel>
          <ToggleField label="Controls" value={p.controls} onChange={(v) => updateProps(el.id, { controls: v })}/>
          <ToggleField label="Autoplay" value={p.autoplay} onChange={(v) => updateProps(el.id, { autoplay: v })}/>
          <ToggleField label="Loop" value={p.loop} onChange={(v) => updateProps(el.id, { loop: v })}/>
          <ToggleField label="Muted" value={p.muted} onChange={(v) => updateProps(el.id, { muted: v })}/>
        </Section>
      )}

      {el.type === "button" && (
        <Section title="Button">
          <RowLabel label="Label"><Input className="h-8 text-xs" value={p.label} onChange={(e) => updateProps(el.id, { label: e.target.value })}/></RowLabel>
          <RowLabel label="Bg"><ColorField value={p.bg} onChange={(v) => updateProps(el.id, { bg: v })}/></RowLabel>
          <RowLabel label="Text"><ColorField value={p.color} onChange={(v) => updateProps(el.id, { color: v })}/></RowLabel>
          <div className="grid grid-cols-2 gap-2">
            <NumField label="Radius" value={p.radius} onChange={(v) => updateProps(el.id, { radius: v })}/>
            <NumField label="Font" value={p.fontSize} onChange={(v) => updateProps(el.id, { fontSize: v })}/>
            <NumField label="PadX" value={p.paddingX} onChange={(v) => updateProps(el.id, { paddingX: v })}/>
            <NumField label="PadY" value={p.paddingY} onChange={(v) => updateProps(el.id, { paddingY: v })}/>
          </div>
          <ToggleField label="Full width" value={p.fullWidth} onChange={(v) => updateProps(el.id, { fullWidth: v })}/>
        </Section>
      )}

      {el.type === "shape" && (
        <Section title="Shape">
          <RowLabel label="Kind"><Select value={p.shape} onValueChange={(v) => updateProps(el.id, { shape: v })}><SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="rectangle">Rectangle</SelectItem><SelectItem value="circle">Circle</SelectItem><SelectItem value="polygon">Polygon</SelectItem></SelectContent></Select></RowLabel>
          <RowLabel label="Fill"><ColorField value={p.fill} onChange={(v) => updateProps(el.id, { fill: v })}/></RowLabel>
          <RowLabel label="Stroke"><ColorField value={p.stroke} onChange={(v) => updateProps(el.id, { stroke: v })}/></RowLabel>
          <NumField label="Stroke W" value={p.strokeWidth} onChange={(v) => updateProps(el.id, { strokeWidth: v })}/>
          <NumField label="Radius" value={p.radius} onChange={(v) => updateProps(el.id, { radius: v })}/>
        </Section>
      )}

      {el.type === "code" && (
        <Section title="Code">
          <RowLabel label="Lang"><Select value={p.language} onValueChange={(v) => updateProps(el.id, { language: v })}><SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger><SelectContent>{["html","css","js","json","md","text"].map(l=><SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></RowLabel>
          <ToggleField label="Render as HTML" value={p.render} onChange={(v) => updateProps(el.id, { render: v })}/>
          <textarea value={p.code} onChange={(e) => updateProps(el.id, { code: e.target.value })} className="w-full border rounded p-2 text-xs font-mono h-32"/>
        </Section>
      )}

      {el.type === "embed" && (
        <Section title="Embed">
          <textarea value={p.html} onChange={(e) => updateProps(el.id, { html: e.target.value })} className="w-full border rounded p-2 text-xs font-mono h-32"/>
        </Section>
      )}

      {el.type === "markdown" && (
        <Section title="Markdown">
          <textarea value={p.md} onChange={(e) => updateProps(el.id, { md: e.target.value })} className="w-full border rounded p-2 text-xs font-mono h-40"/>
        </Section>
      )}

      {el.type === "form" && (
        <Section title="Form">
          <RowLabel label="Title"><Input className="h-8 text-xs" value={p.title} onChange={(e) => updateProps(el.id, { title: e.target.value })}/></RowLabel>
          <RowLabel label="Submit"><Input className="h-8 text-xs" value={p.submitLabel} onChange={(e) => updateProps(el.id, { submitLabel: e.target.value })}/></RowLabel>
          <RowLabel label="Layout"><Select value={p.layout} onValueChange={(v)=>updateProps(el.id,{layout:v})}><SelectTrigger className="h-8 text-xs"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="single">Single</SelectItem><SelectItem value="double">Two column</SelectItem></SelectContent></Select></RowLabel>
          <div className="space-y-1 mt-2">
            {p.fields.map((f, i) => (
              <div key={f.id} className="p-2 border rounded text-xs space-y-1">
                <div className="flex gap-1">
                  <Input className="h-7 text-xs flex-1" value={f.label} onChange={(e) => { const fields = [...p.fields]; fields[i] = { ...f, label: e.target.value }; updateProps(el.id, { fields }); }}/>
                  <button onClick={() => updateProps(el.id, { fields: p.fields.filter(x => x.id !== f.id) })} className="p-1 hover:bg-neutral-100 text-black rounded"><Trash2 size={12}/></button>
                </div>
                <Select value={f.type} onValueChange={(v) => { const fields = [...p.fields]; fields[i] = { ...f, type: v }; updateProps(el.id, { fields }); }}>
                  <SelectTrigger className="h-7 text-xs"><SelectValue/></SelectTrigger>
                  <SelectContent>{["text","email","tel","number","password","textarea","date","time"].map(t=><SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ))}
            <button onClick={() => updateProps(el.id, { fields: [...p.fields, { id: Math.random().toString(36).slice(2), type: "text", label: "New field", placeholder: "" }] })} className="pill-btn !text-xs w-full">+ Add field</button>
          </div>
        </Section>
      )}

      {/* Link */}
      <Section title="Link">
        <RowLabel label="URL"><Input className="h-8 text-xs" value={el.link?.href || ""} onChange={(e) => updateElement(el.id, () => ({ link: { ...el.link, href: e.target.value } }))} placeholder="https:// or #anchor or mailto:"/></RowLabel>
        <ToggleField label="New tab" value={el.link?.target === "_blank"} onChange={(v) => updateElement(el.id, () => ({ link: { ...el.link, target: v ? "_blank" : "_self" } }))}/>
      </Section>

      {/* Visibility */}
      <Section title="Visibility">
        <ToggleField label="Hide desktop" value={el.responsive?.hideDesktop} onChange={(v) => updateElement(el.id, () => ({ responsive: { ...el.responsive, hideDesktop: v } }))}/>
        <ToggleField label="Hide tablet" value={el.responsive?.hideTablet} onChange={(v) => updateElement(el.id, () => ({ responsive: { ...el.responsive, hideTablet: v } }))}/>
        <ToggleField label="Hide mobile" value={el.responsive?.hideMobile} onChange={(v) => updateElement(el.id, () => ({ responsive: { ...el.responsive, hideMobile: v } }))}/>
      </Section>

      <div className="flex gap-1 mt-3 sticky bottom-0 bg-inherit pt-2 border-t border-neutral-200">
        <button onClick={() => duplicateElements([el.id])} className="pill-btn !text-xs flex-1"><Copy size={12}/> Duplicate</button>
        <button onClick={() => removeElements([el.id])} className="pill-btn !text-xs text-black"><Trash2 size={12}/></button>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-3">
      <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function RowLabel({ label, children }) {
  return <div className="flex items-center gap-2"><span className="text-xs text-neutral-500 w-16 shrink-0">{label}</span><div className="flex-1">{children}</div></div>;
}
function NumField({ label, value, onChange, step = 1 }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-neutral-400 w-6">{label}</span>
      <Input type="number" step={step} value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} className="h-7 text-xs px-1.5"/>
    </div>
  );
}
function ColorField({ value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      <input type="color" value={typeof value === "string" && value.startsWith("#") ? value : "#000000"} onChange={(e) => onChange(e.target.value)} className="w-8 h-7 border rounded cursor-pointer"/>
      <Input value={value || ""} onChange={(e) => onChange(e.target.value)} className="h-7 text-xs px-1.5 flex-1"/>
    </div>
  );
}
function ToggleField({ label, value, onChange }) {
  return <div className="flex items-center justify-between"><span className="text-xs text-neutral-600">{label}</span><Switch checked={!!value} onCheckedChange={onChange}/></div>;
}
function BgField({ value, onChange }) {
  const v = value || { type: "none", value: "" };
  return (
    <div className="space-y-1">
      <Select value={v.type} onValueChange={(t) => onChange({ ...v, type: t })}>
        <SelectTrigger className="h-7 text-xs"><SelectValue/></SelectTrigger>
        <SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="color">Color</SelectItem><SelectItem value="gradient">Gradient</SelectItem><SelectItem value="image">Image URL</SelectItem></SelectContent>
      </Select>
      {v.type === "color" && <ColorField value={v.value} onChange={(x) => onChange({ ...v, value: x })}/>}
      {v.type === "gradient" && <Input placeholder="linear-gradient(...)" value={v.value} onChange={(e) => onChange({ ...v, value: e.target.value })} className="h-7 text-xs"/>}
      {v.type === "image" && <Input placeholder="https://..." value={v.value} onChange={(e) => onChange({ ...v, value: e.target.value })} className="h-7 text-xs"/>}
    </div>
  );
}
