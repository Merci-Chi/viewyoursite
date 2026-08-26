import { useEffect, useRef } from "react";
import { useStore } from "@/lib/store";
import { Copy, ClipboardPaste, Files as Dup, Trash2, ArrowUp, ArrowDown, Lock, Unlock, Eye, EyeOff, PaintBucket, Clipboard } from "lucide-react";

export default function ContextMenu() {
  const cm = useStore((s) => s.contextMenu);
  const setCM = useStore((s) => s.setContextMenu);
  const ref = useRef(null);
  const { copySelection, pasteClipboard, duplicateElements, removeElements, bringToFront, sendToBack, updateElement, copyStyle, pasteStyle, addElement } = useStore.getState();

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setCM(null); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  if (!cm) return null;

  const targetId = cm.targetId;
  const items = targetId ? [
    { L: "Copy", I: Copy, act: () => { useStore.getState().select([targetId]); copySelection(); } },
    { L: "Paste", I: ClipboardPaste, act: () => pasteClipboard() },
    { L: "Duplicate", I: Dup, act: () => duplicateElements([targetId]) },
    { L: "Copy style", I: PaintBucket, act: () => copyStyle(targetId) },
    { L: "Paste style", I: Clipboard, act: () => pasteStyle(targetId) },
    { sep: true },
    { L: "Bring to front", I: ArrowUp, act: () => bringToFront(targetId) },
    { L: "Send to back", I: ArrowDown, act: () => sendToBack(targetId) },
    { sep: true },
    { L: "Lock / unlock", I: Lock, act: () => updateElement(targetId, (e) => ({ locked: !e.locked })) },
    { L: "Hide / show", I: EyeOff, act: () => updateElement(targetId, (e) => ({ hidden: !e.hidden })) },
    { sep: true },
    { L: "Delete", I: Trash2, danger: true, act: () => removeElements([targetId]) },
  ] : [
    { L: "Paste here", I: ClipboardPaste, act: () => pasteClipboard() },
    { L: "Add text", I: Copy, act: () => addElement("text", cm.x - 200, cm.y - 80) },
    { L: "Add image", I: Copy, act: () => addElement("image", cm.x - 200, cm.y - 80) },
  ];

  return (
    <div ref={ref} className="float-panel-dark fixed z-50 py-1.5 min-w-[200px] pop-in" style={{ left: Math.min(cm.x, window.innerWidth - 220), top: Math.min(cm.y, window.innerHeight - 380) }} data-testid="context-menu">
      {items.map((it, i) => it.sep ? <div key={i} className="h-px my-1 bg-white/10"/> : (
        <button key={i} onClick={() => { it.act(); setCM(null); }} className={`w-full text-left px-3 py-1.5 flex items-center gap-2 text-[13px] hover:bg-white/10 ${it.danger ? "opacity-90 border-t border-white/10 mt-0.5" : ""}`}>
          <it.I size={13}/> {it.L}
        </button>
      ))}
    </div>
  );
}
