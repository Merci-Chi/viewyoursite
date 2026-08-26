import { useRef, useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import ElementRenderer from "./ElementRenderer";
import InlineTextToolbar from "./InlineTextToolbar";

const HANDLES = [
  ["nw", "top-left"], ["n", "top"], ["ne", "top-right"],
  ["w", "left"], ["e", "right"],
  ["sw", "bottom-left"], ["s", "bottom"], ["se", "bottom-right"],
];

export default function CanvasElement({ el, guides, setGuides, canvasBounds }) {
  const wrapRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [editingText, setEditingText] = useState(false);
  const selectedIds = useStore((s) => s.selectedIds);
  const select = useStore((s) => s.select);
  const setContextMenu = useStore((s) => s.setContextMenu);
  const updateElement = useStore((s) => s.updateElement);
  const showGuides = useStore((s) => s.showGuides);
  const snap = useStore((s) => s.snap);

  const selected = selectedIds.includes(el.id);
  const [hovered, setHovered] = useState(false);

  // Hide by breakpoint
  const previewMode = useStore((s) => s.previewMode);
  const r = el.responsive || {};
  const hidden = el.hidden || (previewMode === "desktop" && r.hideDesktop) || (previewMode === "tablet" && r.hideTablet) || (previewMode === "mobile" && r.hideMobile);

  useEffect(() => { if (!selected) setEditingText(false); }, [selected]);

  if (hidden) return null;

  const onPointerDown = (e) => {
    if (editingText) return;
    if (el.locked) { select([el.id], e.shiftKey); return; }
    if (e.button !== 0) return;
    e.stopPropagation();
    select([el.id], e.shiftKey);
    setDragging(true);
    const startX = e.clientX, startY = e.clientY;
    const origX = el.x, origY = el.y;
    document.body.classList.add("no-select");

    const move = (ev) => {
      let dx = ev.clientX - startX, dy = ev.clientY - startY;
      let nx = origX + dx, ny = origY + dy;
      const g = [];
      if (snap) {
        // Snap to grid at 4px
        nx = Math.round(nx / 4) * 4; ny = Math.round(ny / 4) * 4;
        // Guides at canvas center
        if (showGuides && canvasBounds) {
          const cx = canvasBounds.width / 2 - el.width / 2;
          if (Math.abs(nx - cx) < 6) { nx = cx; g.push({ orientation: "v", pos: canvasBounds.width / 2 }); }
          const cy = canvasBounds.height / 2 - el.height / 2;
          if (Math.abs(ny - cy) < 6) { ny = cy; g.push({ orientation: "h", pos: canvasBounds.height / 2 }); }
        }
      }
      updateElement(el.id, () => ({ x: nx, y: ny }), { history: false });
      setGuides(g);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setDragging(false); setGuides([]);
      document.body.classList.remove("no-select");
      // commit final position to history
      updateElement(el.id, () => ({}), {});
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const startResize = (dir) => (e) => {
    e.stopPropagation(); e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const { x, y, width, height } = el;
    document.body.classList.add("no-select");

    const move = (ev) => {
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      let nx = x, ny = y, nw = width, nh = height;
      if (dir.includes("e")) nw = Math.max(20, width + dx);
      if (dir.includes("s")) nh = Math.max(10, height + dy);
      if (dir.includes("w")) { nw = Math.max(20, width - dx); nx = x + (width - nw); }
      if (dir.includes("n")) { nh = Math.max(10, height - dy); ny = y + (height - nh); }
      updateElement(el.id, () => ({ x: nx, y: ny, width: nw, height: nh }), { history: false });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.body.classList.remove("no-select");
      updateElement(el.id, () => ({}), {});
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const startRotate = (e) => {
    e.stopPropagation(); e.preventDefault();
    const rect = wrapRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const move = (ev) => {
      const deg = Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180 / Math.PI + 90;
      updateElement(el.id, () => ({ rotation: Math.round(deg) }), { history: false });
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      updateElement(el.id, () => ({}), {});
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onContext = (e) => {
    e.preventDefault(); e.stopPropagation();
    select([el.id]);
    setContextMenu({ x: e.clientX, y: e.clientY, targetId: el.id });
  };

  const onDoubleClick = (e) => {
    if (el.type === "text" || el.type === "heading" || el.type === "quote") {
      e.stopPropagation();
      setEditingText(true);
    }
  };

  return (
    <div
      ref={wrapRef}
      data-testid={`el-${el.id}`}
      onPointerDown={onPointerDown}
      onContextMenu={onContext}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`${selected ? "canvas-selected-outline" : hovered ? "canvas-hover-outline" : ""}`}
      style={{
        position: "absolute",
        left: el.x, top: el.y, width: el.width, height: el.height,
        transform: `rotate(${el.rotation || 0}deg)`,
        opacity: el.opacity ?? 1,
        zIndex: el.zIndex || 0,
        cursor: el.locked ? "not-allowed" : editingText ? "text" : "move",
      }}
    >
      <div style={{ width: "100%", height: "100%", pointerEvents: editingText ? "auto" : "none" }}>
        <ElementRenderer el={el} editingText={editingText} setEditingText={setEditingText} />
      </div>

      {selected && !el.locked && (
        <>
          {HANDLES.map(([dir]) => {
            const pos = handlePos(dir);
            const cursor = { nw: "nwse-resize", ne: "nesw-resize", sw: "nesw-resize", se: "nwse-resize", n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize" }[dir];
            return <div key={dir} className="canvas-handle" onPointerDown={startResize(dir)} style={{ ...pos, cursor, pointerEvents: "auto" }} />;
          })}
          {/* Rotate handle */}
          <div onPointerDown={startRotate} title="Rotate" className="canvas-handle" style={{ left: "50%", top: -34, transform: "translateX(-50%)", background: "hsl(var(--accent))", borderColor: "white", pointerEvents: "auto" }} />
        </>
      )}

      {selected && editingText && <InlineTextToolbar el={el} />}
    </div>
  );
}

function handlePos(dir) {
  const s = -5;
  const m = { nw: { left: s, top: s }, ne: { right: s, top: s }, sw: { left: s, bottom: s }, se: { right: s, bottom: s }, n: { left: "50%", top: s, transform: "translateX(-50%)" }, s: { left: "50%", bottom: s, transform: "translateX(-50%)" }, e: { right: s, top: "50%", transform: "translateY(-50%)" }, w: { left: s, top: "50%", transform: "translateY(-50%)" } };
  return m[dir];
}
