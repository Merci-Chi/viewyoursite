import { useNavigate } from "react-router-dom";
import { useStore, useActiveSite } from "@/lib/store";
import { ArrowLeft, Undo2, Redo2, Monitor, Tablet, Smartphone, Eye, Files, Image as ImageIcon, Settings, Download, Share2, Grid3x3, Layers } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function TopBar() {
  const nav = useNavigate();
  const site = useActiveSite();
  const { undo, redo, setPreview, previewMode, openPanelFn, setZoom, zoom, toggleGrid, showGrid } = useStore();
  const editingScope = useStore((s) => s.editingScope);
  const setEditingScope = useStore((s) => s.setEditingScope);

  const modes = [
    { k: "desktop", I: Monitor, l: "Desktop" }, { k: "tablet", I: Tablet, l: "Tablet" }, { k: "mobile", I: Smartphone, l: "Mobile" },
  ];

  return (
    <div className="fixed top-3 left-3 right-3 z-40 flex items-center gap-2 pointer-events-none" data-testid="topbar">
      {/* Left: back / undo / redo + site name */}
      <div className="float-panel pointer-events-auto flex items-center gap-0 p-1 pl-2">
        <button data-testid="topbar-back" onClick={() => nav("/sites")} className="p-1.5 rounded hover:bg-neutral-100" title="Sites"><ArrowLeft size={15}/></button>
        <div className="w-px h-4 bg-neutral-200 mx-1"/>
        <button onClick={undo} className="p-1.5 rounded hover:bg-neutral-100" title="Undo"><Undo2 size={15}/></button>
        <button onClick={redo} className="p-1.5 rounded hover:bg-neutral-100" title="Redo"><Redo2 size={15}/></button>
        <div className="w-px h-4 bg-neutral-200 mx-1"/>
        <div className="px-2 py-1 max-w-[180px]"><span className="font-display text-sm font-semibold truncate block">{site?.name || "…"}</span></div>
      </div>

      {/* Center: scope pills + preview modes */}
      <div className="float-panel pointer-events-auto flex items-center gap-0 p-1 mx-auto">
        {["main","header","footer"].map((sc) => (
          <button
            key={sc}
            data-testid={`scope-${sc}`}
            onClick={() => setEditingScope(sc)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition ${editingScope === sc ? "bg-black text-white" : "hover:bg-neutral-100 text-neutral-600"}`}
          >{sc === "main" ? "Page" : sc[0].toUpperCase() + sc.slice(1)}</button>
        ))}
        <div className="w-px h-4 bg-neutral-200 mx-1"/>
        {modes.map(({ k, I }) => (
          <button key={k} data-testid={`preview-${k}`} onClick={() => setPreview(previewMode === k ? null : k)} className={`p-1.5 rounded-full transition ${previewMode === k ? "bg-black text-white" : "hover:bg-neutral-100"}`} title={k}><I size={13}/></button>
        ))}
        <button onClick={() => setPreview("full")} className={`p-1.5 rounded-full transition ${previewMode === "full" ? "bg-black text-white" : "hover:bg-neutral-100"}`} title="Full preview" data-testid="preview-full"><Eye size={13}/></button>
      </div>

      {/* Right: panels + zoom + share/export */}
      <div className="float-panel pointer-events-auto flex items-center gap-0 p-1">
        <button data-testid="btn-pages" onClick={() => openPanelFn("pages")} className="p-1.5 rounded hover:bg-neutral-100" title="Pages"><Files size={15}/></button>
        <button data-testid="btn-media" onClick={() => openPanelFn("media")} className="p-1.5 rounded hover:bg-neutral-100" title="Media"><ImageIcon size={15}/></button>
        <button data-testid="btn-layers" onClick={() => openPanelFn("layers")} className="p-1.5 rounded hover:bg-neutral-100" title="Layers"><Layers size={15}/></button>
        <button data-testid="btn-settings" onClick={() => openPanelFn("settings")} className="p-1.5 rounded hover:bg-neutral-100" title="Site"><Settings size={15}/></button>
        <div className="w-px h-4 bg-neutral-200 mx-1"/>
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-1.5 rounded hover:bg-neutral-100" title="Zoom & grid" data-testid="btn-view">
              <span className="text-xs">{Math.round(zoom * 100)}%</span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="float-panel w-56 p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs"><span className="w-12">Zoom</span>
              <button onClick={() => setZoom(zoom - 0.1)} className="pill-btn !py-0.5 !px-2">-</button>
              <span className="flex-1 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(zoom + 0.1)} className="pill-btn !py-0.5 !px-2">+</button>
            </div>
            <button onClick={() => setZoom(1)} className="pill-btn w-full !text-xs">Reset</button>
            <button onClick={toggleGrid} className={`pill-btn w-full !text-xs ${showGrid ? "!bg-black !text-white" : ""}`}><Grid3x3 size={12}/> Grid</button>
          </PopoverContent>
        </Popover>
        <div className="w-px h-4 bg-neutral-200 mx-1"/>
        <button data-testid="btn-share" onClick={() => openPanelFn("share")} className="pill-btn !py-1 !text-xs"><Share2 size={13}/> Share</button>
        <button data-testid="btn-export" onClick={() => openPanelFn("export")} className="pill-btn pill-btn-primary !py-1 !text-xs"><Download size={13}/> Export</button>
      </div>
    </div>
  );
}
