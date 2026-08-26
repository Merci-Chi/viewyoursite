import { useStore, useActiveSite } from "@/lib/store";
import { exportSiteHTML } from "@/lib/exporter";
import { X, Monitor, Tablet, Smartphone } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

const WIDTHS = { desktop: 1280, tablet: 820, mobile: 390 };

export default function PreviewOverlay() {
  const previewMode = useStore((s) => s.previewMode);
  const setPreview = useStore((s) => s.setPreview);
  const site = useActiveSite();
  const [device, setDevice] = useState("desktop");
  const html = useMemo(() => (previewMode === "full" && site ? exportSiteHTML(site) : ""), [previewMode, site]);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (previewMode !== "full") return;
    const compute = () => {
      const w = WIDTHS[device];
      const availW = window.innerWidth - 80;
      const availH = window.innerHeight - 120;
      const sW = availW / w;
      const sH = availH / 900;
      setScale(Math.min(1, sW, sH));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [previewMode, device]);

  if (previewMode !== "full") return null;
  const w = WIDTHS[device];

  return (
    <div className="fixed inset-0 z-[60] bg-neutral-100 flex flex-col pop-in" data-testid="preview-overlay">
      <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 bg-white">
        <div className="flex items-center gap-2">
          <div className="font-display text-base font-semibold">Preview</div>
          <span className="text-xs text-neutral-400">{device} · {w}px</span>
        </div>
        <div className="flex items-center gap-1">
          {[{k:"desktop",I:Monitor},{k:"tablet",I:Tablet},{k:"mobile",I:Smartphone}].map(({k,I}) => (
            <button key={k} onClick={() => setDevice(k)} className={`p-1.5 rounded ${device === k ? "bg-black text-white" : "hover:bg-neutral-100"}`}><I size={14}/></button>
          ))}
          <div className="w-px h-4 bg-neutral-200 mx-2"/>
          <button onClick={() => setPreview(null)} className="p-1.5 rounded hover:bg-neutral-100" data-testid="preview-close"><X size={16}/></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto flex items-start justify-center p-6">
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
          <iframe
            title="preview"
            srcDoc={html}
            style={{ width: w, height: Math.max(900, window.innerHeight / scale - 60), border: 0, background: "white", boxShadow: "0 12px 40px -12px rgba(0,0,0,0.2)", borderRadius: 8 }}
          />
        </div>
      </div>
    </div>
  );
}
