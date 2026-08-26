import { useStore, useActiveSite } from "@/lib/store";
import { X, Plus, Home, Link2, ChevronDown, Settings2, Copy, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function PagesPanel() {
  const site = useActiveSite();
  const { closePanel, setCurrentPage, addPage, deletePage, duplicatePage, setPageAsHome, movePageLocation, openPanelFn, setPreview } = useStore.getState();
  const [addOpen, setAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newKind, setNewKind] = useState("blank");
  const [newLink, setNewLink] = useState("");

  if (!site) return null;

  const main = site.pages.filter((p) => p.location === "main");
  const notLinked = site.pages.filter((p) => p.location === "notLinked");

  const handleAdd = () => {
    const t = newTitle.trim() || (newKind === "link" ? "New link" : "New page");
    const slug = t.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    addPage({ title: t, navTitle: t, slug, kind: newKind, linkUrl: newLink, location: "main" });
    setNewTitle(""); setNewLink(""); setNewKind("blank"); setAddOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/20 pop-in" onClick={closePanel} data-testid="pages-panel">
      <div className="float-panel w-[560px] max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="font-display text-2xl font-semibold">Pages</h2>
          <div className="flex items-center gap-2">
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild><button className="pill-btn pill-btn-primary" data-testid="pages-add-btn"><Plus size={14}/> Add</button></DialogTrigger>
              <DialogContent className="float-panel">
                <DialogHeader><DialogTitle className="font-display text-xl">Add a page</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[{k:"blank",l:"Blank page"},{k:"link",l:"External link"},{k:"dropdown",l:"Dropdown"}].map(o => (
                      <button key={o.k} onClick={() => setNewKind(o.k)} className={`p-3 border rounded-xl text-sm ${newKind===o.k?'border-neutral-900 bg-neutral-50':'border-neutral-200'}`}>{o.l}</button>
                    ))}
                  </div>
                  <div><Label>Title</Label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} autoFocus/></div>
                  {newKind === "link" && <div><Label>URL</Label><Input value={newLink} onChange={(e) => setNewLink(e.target.value)} placeholder="https://..."/></div>}
                  <Button onClick={handleAdd} data-testid="pages-add-confirm" className="w-full">Add</Button>
                </div>
              </DialogContent>
            </Dialog>
            <button onClick={closePanel} className="p-2 rounded-full hover:bg-neutral-100"><X size={16}/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <Group label="Main navigation" pages={main} location="main"/>
          <Group label="Not linked" pages={notLinked} location="notLinked"/>
        </div>
      </div>
    </div>
  );
}

function Group({ label, pages, location }) {
  const { setCurrentPage, duplicatePage, deletePage, setPageAsHome, movePageLocation, openPanelFn, closePanel, setPreview } = useStore.getState();
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">{label}</div>
      {pages.length === 0 && <div className="text-xs text-neutral-400 italic p-2">No pages here.</div>}
      <div className="space-y-1">
        {pages.map((p) => (
          <div key={p.id} className="group flex items-center gap-2 p-2 rounded-lg hover:bg-neutral-100" data-testid={`page-row-${p.id}`}>
            <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => { setCurrentPage(p.id); closePanel(); }}>
              {p.isHome ? <Home size={14} className="text-black"/> : p.kind === "link" ? <Link2 size={14}/> : p.kind === "dropdown" ? <ChevronDown size={14}/> : <span className="w-3.5 h-3.5 border rounded-sm"/>}
              <span className="text-sm font-medium">{p.title}</span>
              {p.password && <span className="text-[9px] px-1.5 py-0.5 rounded border border-black">locked</span>}
              <span className="text-[10px] text-neutral-400 ml-auto">/{p.slug}</span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 flex gap-0.5">
              <button title="Preview" onClick={() => { setCurrentPage(p.id); setPreview("desktop"); closePanel(); }} className="p-1.5 rounded hover:bg-white"><Eye size={12}/></button>
              <button title="Settings" onClick={() => openPanelFn("pageSettings", p.id)} className="p-1.5 rounded hover:bg-white"><Settings2 size={12}/></button>
              <button title="Duplicate" onClick={() => duplicatePage(p.id)} className="p-1.5 rounded hover:bg-white"><Copy size={12}/></button>
              <button title="Move" onClick={() => movePageLocation(p.id, location === "main" ? "notLinked" : "main")} className="pill-btn !py-0 !px-1.5 !text-[10px]">→ {location === "main" ? "unlink" : "main"}</button>
              {!p.isHome && <button title="Set home" onClick={() => setPageAsHome(p.id)} className="p-1.5 rounded hover:bg-white"><Home size={12}/></button>}
              <button title="Delete" onClick={() => { if (confirm(`Delete "${p.title}"?`)) deletePage(p.id); }} className="p-1.5 rounded hover:bg-neutral-100 text-black"><Trash2 size={12}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
