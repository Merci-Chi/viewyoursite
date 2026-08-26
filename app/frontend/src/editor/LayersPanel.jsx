import { useStore, useActiveSite, useCurrentPage } from "@/lib/store";
import { X, Eye, EyeOff, Lock, Unlock } from "lucide-react";

export default function LayersPanel() {
  const closePanel = useStore((s) => s.closePanel);
  const site = useActiveSite();
  const page = useCurrentPage();
  const editingScope = useStore((s) => s.editingScope);
  const selectedIds = useStore((s) => s.selectedIds);
  const select = useStore((s) => s.select);
  const setEditingScope = useStore((s) => s.setEditingScope);
  const updateElement = useStore((s) => s.updateElement);
  if (!site || !page) return null;

  const sections = [
    { name: "Header", scope: "header", els: site.header.elements },
    { name: "Page (" + page.title + ")", scope: "main", els: page.elements },
    { name: "Footer", scope: "footer", els: site.footer.elements },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end pt-14 pr-4 bg-black/10 pop-in" onClick={closePanel} data-testid="layers-panel">
      <div className="float-panel w-[280px] max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-3 border-b border-neutral-200">
          <div className="font-display text-lg font-semibold">Layers</div>
          <button onClick={closePanel} className="p-1.5 rounded hover:bg-neutral-100"><X size={14}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {sections.map((sec) => (
            <div key={sec.scope}>
              <button onClick={() => setEditingScope(sec.scope)} className={`w-full text-left text-[10px] uppercase tracking-widest mb-1 px-2 py-1 rounded ${editingScope === sec.scope ? "bg-black text-white" : "text-neutral-400 hover:bg-neutral-100"}`}>{sec.name} · {sec.els.length}</button>
              <div className="space-y-0.5">
                {sec.els.slice().reverse().map((el) => (
                  <div
                    key={el.id}
                    onClick={() => select([el.id])}
                    className={`flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer ${selectedIds.includes(el.id) ? "bg-black text-white" : "hover:bg-neutral-100"}`}
                  >
                    <span className="text-[10px] opacity-60 uppercase w-14 shrink-0">{el.type}</span>
                    <span className="flex-1 truncate">{(el.props?.html || el.props?.label || el.props?.text || el.props?.alt || el.id).replace(/<[^>]*>/g, "").slice(0, 24) || "—"}</span>
                    <button onClick={(e) => { e.stopPropagation(); updateElement(el.id, (x) => ({ hidden: !x.hidden })); }} className="opacity-60 hover:opacity-100">{el.hidden ? <EyeOff size={11}/> : <Eye size={11}/>}</button>
                    <button onClick={(e) => { e.stopPropagation(); updateElement(el.id, (x) => ({ locked: !x.locked })); }} className="opacity-60 hover:opacity-100">{el.locked ? <Lock size={11}/> : <Unlock size={11}/>}</button>
                  </div>
                ))}
                {sec.els.length === 0 && <div className="text-[10px] italic text-neutral-400 px-2 py-1">empty</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
