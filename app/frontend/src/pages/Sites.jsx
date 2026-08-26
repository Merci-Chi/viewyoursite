import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { downloadHTML } from "@/lib/exporter";
import { Plus, Trash2, Copy, Download, Pencil, ArrowLeft, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { newSite, newPage, newElement } from "@/lib/factory";
import { useStore as us } from "@/lib/store";

export default function Sites() {
  const nav = useNavigate();
  const sites = useStore((s) => s.sites);
  const createSite = useStore((s) => s.createSite);
  const deleteSite = useStore((s) => s.deleteSite);
  const duplicateSite = useStore((s) => s.duplicateSite);
  const renameSite = useStore((s) => s.renameSite);
  const setSiteFaction = useStore((s) => s.setSiteFaction);

  const [newDialog, setNewDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newFaction, setNewFaction] = useState("");
  const [editing, setEditing] = useState(null); // site obj
  const [importDialog, setImportDialog] = useState(false);
  const [importHTML, setImportHTML] = useState("");
  const [importName, setImportName] = useState("Imported site");

  const list = Object.values(sites).sort((a, b) => b.updatedAt - a.updatedAt);

  const handleCreate = () => {
    if (!newName.trim()) { toast.error("Give your site a name"); return; }
    const id = createSite(newName.trim());
    if (newFaction.trim()) setSiteFaction(id, newFaction.trim());
    setNewDialog(false); setNewName(""); setNewFaction("");
    nav(`/editor/${id}`);
  };

  const handleImport = () => {
    if (!importHTML.trim()) { toast.error("Paste some HTML"); return; }
    const site = newSite(importName || "Imported site");
    const page = site.pages[0];
    page.elements = [{ ...newElement("code", 40, 40), width: 900, height: 600, props: { language: "html", code: importHTML, render: true } }];
    us.setState((st) => ({ sites: { ...st.sites, [site.id]: site } }));
    try { localStorage.setItem("studio.sites.v1", JSON.stringify({ ...sites, [site.id]: site })); } catch {}
    setImportDialog(false); setImportHTML("");
    toast.success("Imported. Edit it as an HTML block or add elements around it.");
    nav(`/editor/${site.id}`);
  };

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--paper))" }}>
      <div className="max-w-[1200px] mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-10">
          <button data-testid="sites-back" onClick={() => nav("/")} className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition">
            <ArrowLeft size={16} /> Home
          </button>
          <div className="flex items-center gap-3">
            <a data-testid="sites-download-source" href={`${process.env.REACT_APP_BACKEND_URL}/api/source-zip`} className="pill-btn" title="Download the full app source as a zip">
              <Download size={14}/> Source .zip
            </a>
            <button data-testid="sites-import-html" onClick={() => setImportDialog(true)} className="pill-btn">
              <Upload size={14} /> Import HTML
            </button>
            <button data-testid="sites-create-new" onClick={() => setNewDialog(true)} className="pill-btn pill-btn-primary">
              <Plus size={16} /> Create website
            </button>
          </div>
        </div>

        <h1 className="font-display text-5xl font-semibold tracking-[-0.02em] mb-2">Your sites</h1>
        <p className="text-neutral-500 mb-10">All saved to this browser. Nothing leaves your device.</p>

        {list.length === 0 ? (
          <div className="float-panel p-14 text-center dashed-frame" data-testid="sites-empty">
            <div className="font-display text-2xl mb-2">Nothing yet.</div>
            <p className="text-neutral-500 mb-6">Create your first site to jump into the editor.</p>
            <button onClick={() => setNewDialog(true)} className="pill-btn pill-btn-primary"><Plus size={16}/> New site</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((s) => (
              <div key={s.id} data-testid={`site-card-${s.id}`} className="float-panel p-5 group hover:-translate-y-0.5 transition cursor-pointer" onClick={() => nav(`/editor/${s.id}`)}>
                <div className="aspect-[4/3] rounded-lg mb-4 canvas-grid relative overflow-hidden" style={{ background: s.background?.value || "#f5f5f5" }}>
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-400 font-display text-2xl">{s.name.slice(0, 2).toUpperCase()}</div>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    {s.faction && <div className="text-xs text-neutral-500 italic">{s.faction}</div>}
                    <div className="text-xs text-neutral-400 mt-1">{s.pages.length} page{s.pages.length !== 1 ? 's' : ''} · {new Date(s.updatedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button data-testid={`site-edit-${s.id}`} onClick={() => setEditing(s)} className="p-2 rounded-md hover:bg-neutral-100" title="Rename"><Pencil size={14}/></button>
                    <button data-testid={`site-dup-${s.id}`} onClick={() => { duplicateSite(s.id); toast.success("Duplicated"); }} className="p-2 rounded-md hover:bg-neutral-100" title="Duplicate"><Copy size={14}/></button>
                    <button data-testid={`site-export-${s.id}`} onClick={() => downloadHTML(s)} className="p-2 rounded-md hover:bg-neutral-100" title="Export HTML"><Download size={14}/></button>
                    <button data-testid={`site-delete-${s.id}`} onClick={() => { if (confirm(`Delete "${s.name}"?`)) { deleteSite(s.id); toast.success("Deleted"); } }} className="p-2 rounded-md hover:bg-neutral-100 text-black" title="Delete"><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={newDialog} onOpenChange={setNewDialog}>
        <DialogContent className="float-panel">
          <DialogHeader><DialogTitle className="font-display text-2xl">New site</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Site name</Label><Input data-testid="new-site-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="My awesome site" autoFocus /></div>
            <div><Label>Your name / brand (faction)</Label><Input data-testid="new-site-faction" value={newFaction} onChange={(e) => setNewFaction(e.target.value)} placeholder="Optional — makes it yours" /></div>
          </div>
          <DialogFooter><Button data-testid="new-site-create-confirm" onClick={handleCreate}>Create & open editor</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="float-panel">
          <DialogHeader><DialogTitle className="font-display text-2xl">Site settings</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}/></div>
              <div><Label>Faction</Label><Input value={editing.faction || ""} onChange={(e) => setEditing({ ...editing, faction: e.target.value })}/></div>
            </div>
          )}
          <DialogFooter><Button onClick={() => { renameSite(editing.id, editing.name); setSiteFaction(editing.id, editing.faction || ""); setEditing(null); toast.success("Saved"); }}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importDialog} onOpenChange={setImportDialog}>
        <DialogContent className="float-panel max-w-2xl">
          <DialogHeader><DialogTitle className="font-display text-2xl">Import HTML</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Site name</Label><Input value={importName} onChange={(e) => setImportName(e.target.value)} /></div>
            <div><Label>Paste HTML</Label><textarea value={importHTML} onChange={(e) => setImportHTML(e.target.value)} className="w-full h-60 border rounded-lg p-3 font-mono text-xs" placeholder="<html>...</html>" /></div>
          </div>
          <DialogFooter><Button data-testid="import-html-confirm" onClick={handleImport}>Import</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
