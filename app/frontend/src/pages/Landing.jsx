import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";

export default function Landing() {
  const nav = useNavigate();
  const sites = useStore((s) => s.sites);
  const createSite = useStore((s) => s.createSite);

  const handleStart = () => {
    if (Object.keys(sites).length > 0) { nav("/sites"); return; }
    const id = createSite("Untitled site");
    nav(`/editor/${id}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-black" />
          <span className="font-display text-lg font-semibold tracking-tight">Studio</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-neutral-500">
          <span>Local · No sign-up</span>
        </div>
      </nav>

      <div className="relative z-10 max-w-[1200px] mx-auto px-8 pt-16 pb-24 grid md:grid-cols-[1.1fr_0.9fr] gap-20 items-center">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500 mb-6">A free-canvas website builder</p>
          <h1 className="font-display text-6xl md:text-7xl font-semibold leading-[0.95] tracking-[-0.03em] mb-6">
            Draw a site.<br/>
            <span className="italic">Drop</span> a video.<br/>
            Ship the HTML.
          </h1>
          <p className="text-base text-neutral-600 max-w-lg mb-10 leading-relaxed">
            Every element floats where you place it. Right-click to edit. One click to export a single HTML file. No accounts, no drama.
          </p>
          <div className="flex items-center gap-4">
            <button
              data-testid="landing-get-started"
              onClick={handleStart}
              className="pill-btn pill-btn-primary"
              style={{ fontSize: 15, padding: "14px 24px", borderRadius: 999 }}
            >
              Get started <ArrowRight size={16} />
            </button>
            {Object.keys(sites).length > 0 && (
              <button data-testid="landing-open-sites" onClick={() => nav("/sites")} className="pill-btn" style={{ fontSize: 14, padding: "12px 18px" }}>
                My sites ({Object.keys(sites).length})
              </button>
            )}
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg text-xs text-neutral-600">
            <div><div className="font-semibold text-black mb-1">Free canvas</div><div>Drag anywhere. Soft guides help.</div></div>
            <div><div className="font-semibold text-black mb-1">Every element</div><div>Text, video, forms, code, charts…</div></div>
            <div><div className="font-semibold text-black mb-1">One HTML</div><div>Export the whole site instantly.</div></div>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="float-panel p-3 aspect-[4/5] relative overflow-hidden">
            <div className="absolute inset-3 rounded-[10px] overflow-hidden canvas-grid bg-white">
              <div className="absolute bg-black rounded" style={{ left: 24, top: 24, width: 180, height: 40 }} />
              <div className="absolute font-display" style={{ left: 24, top: 90, fontSize: 42, fontWeight: 700, letterSpacing: -1, lineHeight: 1 }}>
                Big<br/><span className="italic">Bold</span><br/>Ideas
              </div>
              <div className="absolute rounded-full text-white bg-black" style={{ left: 24, top: 260, padding: "10px 18px", fontSize: 13 }}>Click here</div>
              <div className="absolute bg-black" style={{ right: 24, top: 100, width: 140, height: 180, borderRadius: 16 }} />
              <div className="absolute canvas-selected-outline rounded" style={{ left: 20, top: 84, width: 210, height: 130 }} />
              <div className="canvas-handle" style={{ left: 16, top: 80 }} /><div className="canvas-handle" style={{ left: 226, top: 80 }} />
              <div className="canvas-handle" style={{ left: 16, top: 210 }} /><div className="canvas-handle" style={{ left: 226, top: 210 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
