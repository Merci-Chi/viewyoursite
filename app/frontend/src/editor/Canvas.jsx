import { useRef, useState } from "react";
import { useStore, useActiveSite, useCurrentPage } from "@/lib/store";
import CanvasElement from "./CanvasElement";
import ContextMenu from "./ContextMenu";
import AlignToolbar from "./AlignToolbar";

const PREVIEW_WIDTHS = { desktop: 1280, tablet: 820, mobile: 390 };

export default function Canvas() {
  const site = useActiveSite();
  const page = useCurrentPage();
  const zoom = useStore((s) => s.zoom);
  const showGrid = useStore((s) => s.showGrid);
  const previewMode = useStore((s) => s.previewMode);
  const clearSelection = useStore((s) => s.clearSelection);
  const setContextMenu = useStore((s) => s.setContextMenu);
  const contextMenu = useStore((s) => s.contextMenu);
  const [guides, setGuides] = useState([]);

  if (!site || !page) return null;

  const width = previewMode ? PREVIEW_WIDTHS[previewMode] || (page.canvasWidth || 1280) : (page.canvasWidth || 1280);
  const height = page.canvasHeight || 900;

  const bg = (() => {
    const b = page.background;
    if (!b) return "#fff";
    if (b.type === "color") return b.value;
    if (b.type === "gradient") return b.value;
    if (b.type === "image") return `url('${b.value}') center/cover no-repeat`;
    return "#fff";
  })();

  const handleBgClick = (e) => {
    if (e.target === e.currentTarget) clearSelection();
    setContextMenu(null);
  };
  const handleBgContext = (e) => {
    if (e.target === e.currentTarget) { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, targetId: null }); }
  };

  return (
    <div className="absolute inset-0 pt-[68px] pb-[60px] px-6 overflow-auto flex flex-col items-center" onClick={() => setContextMenu(null)}>
      <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: "top center", marginTop: 24 }}>
        {/* Header */}
        {site.header.show && page.showHeader && (
          <div className="relative" style={{ width }}>
            <span className="scope-header-tag">Header</span>
            <div
              onClick={handleBgClick}
              onContextMenu={handleBgContext}
              className="relative overflow-hidden"
              style={{
                width, height: site.header.height,
                background: site.header.background?.value || "#ffffff",
                borderRadius: "12px 12px 0 0",
                boxShadow: "0 2px 4px -2px hsl(0 0% 0% / 0.06)",
                border: "1px solid hsl(0 0% 88%)",
                borderBottom: "none",
              }}
            >
              {site.header.elements.map((el) => (
                <CanvasElement key={el.id} el={el} scope="header" guides={guides} setGuides={setGuides} canvasBounds={{ width, height: site.header.height }} />
              ))}
            </div>
          </div>
        )}

        {/* Main */}
        <div
          onClick={handleBgClick}
          onContextMenu={handleBgContext}
          className={`relative ${showGrid ? "canvas-grid" : ""}`}
          style={{
            width, height,
            background: bg,
            boxShadow: "0 24px 80px -20px hsl(0 0% 0% / 0.15)",
            borderRadius: (site.header.show && page.showHeader) ? 0 : ((site.footer.show && page.showFooter) ? 0 : 12),
            border: "1px solid hsl(0 0% 88%)",
            borderTop: (site.header.show && page.showHeader) ? "none" : "1px solid hsl(0 0% 88%)",
            borderBottom: (site.footer.show && page.showFooter) ? "none" : "1px solid hsl(0 0% 88%)",
          }}
          data-testid="editor-canvas"
        >
          {page.elements.map((el) => (
            <CanvasElement key={el.id} el={el} scope="main" guides={guides} setGuides={setGuides} canvasBounds={{ width, height }} />
          ))}
          {guides.map((g, i) => (
            <div key={i} className="guide-line" style={g.orientation === "v" ? { left: g.pos, top: 0, width: 1, height } : { top: g.pos, left: 0, height: 1, width }} />
          ))}
        </div>

        {/* Footer */}
        {site.footer.show && page.showFooter && (
          <div className="relative" style={{ width, marginBottom: 40 }}>
            <div
              onClick={handleBgClick}
              onContextMenu={handleBgContext}
              className="relative overflow-hidden"
              style={{
                width, height: site.footer.height,
                background: site.footer.background?.value || "#000000",
                borderRadius: "0 0 12px 12px",
                boxShadow: "0 2px 4px -2px hsl(0 0% 0% / 0.06)",
                border: "1px solid hsl(0 0% 88%)",
                borderTop: "none",
              }}
            >
              {site.footer.elements.map((el) => (
                <CanvasElement key={el.id} el={el} scope="footer" guides={guides} setGuides={setGuides} canvasBounds={{ width, height: site.footer.height }} />
              ))}
            </div>
            <span className="scope-footer-tag" style={{ top: "auto", bottom: -22 }}>Footer</span>
          </div>
        )}
      </div>

      {contextMenu && <ContextMenu />}
      <AlignToolbar />
    </div>
  );
}
