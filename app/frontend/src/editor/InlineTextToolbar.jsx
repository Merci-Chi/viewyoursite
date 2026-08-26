import { useState, useEffect } from "react";
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, Link2, List, ListOrdered, Type } from "lucide-react";

const FONTS = ["Fraunces", "DM Sans", "Inter", "Georgia", "Arial", "Times New Roman", "Courier New", "JetBrains Mono"];

export default function InlineTextToolbar({ el }) {
  const [pos, setPos] = useState({ top: -60, left: 0 });
  const [color, setColor] = useState("#000000");

  useEffect(() => {
    const update = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.top === 0 && rect.left === 0) return;
      const parentRect = document.querySelector(`[data-testid="el-${el.id}"]`)?.getBoundingClientRect();
      if (!parentRect) return;
      setPos({ top: rect.top - parentRect.top - 52, left: rect.left - parentRect.left });
    };
    const onSel = () => setTimeout(update, 10);
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, [el.id]);

  const exec = (cmd, val) => { document.execCommand(cmd, false, val); };

  return (
    <div
      className="float-panel-dark absolute z-30 pop-in flex items-center gap-0.5 p-1"
      style={{ top: pos.top, left: pos.left, pointerEvents: "auto" }}
      onMouseDown={(e) => e.preventDefault()}
      data-testid="inline-text-toolbar"
    >
      <select onChange={(e) => exec("fontName", e.target.value)} className="bg-transparent text-xs px-1 py-1 rounded hover:bg-white/10 border-0 outline-none">
        {FONTS.map(f => <option key={f} value={f} style={{ color: "#000" }}>{f}</option>)}
      </select>
      <select onChange={(e) => exec("fontSize", e.target.value)} className="bg-transparent text-xs px-1 py-1 rounded hover:bg-white/10 border-0 outline-none">
        {[1,2,3,4,5,6,7].map(s => <option key={s} value={s} style={{ color: "#000" }}>{[10,13,16,18,24,32,48][s-1]}</option>)}
      </select>
      <div className="w-px h-4 bg-white/20 mx-0.5"/>
      <IconBtn onClick={() => exec("bold")}><Bold size={13}/></IconBtn>
      <IconBtn onClick={() => exec("italic")}><Italic size={13}/></IconBtn>
      <IconBtn onClick={() => exec("underline")}><Underline size={13}/></IconBtn>
      <IconBtn onClick={() => exec("strikeThrough")}><Strikethrough size={13}/></IconBtn>
      <div className="w-px h-4 bg-white/20 mx-0.5"/>
      <label className="p-1.5 rounded hover:bg-white/10 cursor-pointer" title="Text color">
        <Type size={13}/>
        <input type="color" value={color} onChange={(e) => { setColor(e.target.value); exec("foreColor", e.target.value); }} className="absolute opacity-0 w-0 h-0"/>
      </label>
      <label className="p-1.5 rounded hover:bg-white/10 cursor-pointer" title="Highlight">
        <span className="text-xs">H</span>
        <input type="color" onChange={(e) => exec("hiliteColor", e.target.value)} className="absolute opacity-0 w-0 h-0"/>
      </label>
      <div className="w-px h-4 bg-white/20 mx-0.5"/>
      <IconBtn onClick={() => exec("justifyLeft")}><AlignLeft size={13}/></IconBtn>
      <IconBtn onClick={() => exec("justifyCenter")}><AlignCenter size={13}/></IconBtn>
      <IconBtn onClick={() => exec("justifyRight")}><AlignRight size={13}/></IconBtn>
      <IconBtn onClick={() => exec("insertUnorderedList")}><List size={13}/></IconBtn>
      <IconBtn onClick={() => exec("insertOrderedList")}><ListOrdered size={13}/></IconBtn>
      <IconBtn onClick={() => { const url = prompt("URL:"); if (url) exec("createLink", url); }}><Link2 size={13}/></IconBtn>
    </div>
  );
}

function IconBtn({ onClick, children }) {
  return <button onMouseDown={(e) => { e.preventDefault(); onClick(); }} className="p-1.5 rounded hover:bg-white/10">{children}</button>;
}
