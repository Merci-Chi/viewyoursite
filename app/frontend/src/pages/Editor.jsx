import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore, useActiveSite, useCurrentPage } from "@/lib/store";
import Canvas from "@/editor/Canvas";
import TopBar from "@/editor/TopBar";
import AddMenu from "@/editor/AddMenu";
import Inspector from "@/editor/Inspector";
import PagesPanel from "@/editor/PagesPanel";
import PageSettingsDialog from "@/editor/PageSettingsDialog";
import MediaGallery from "@/editor/MediaGallery";
import SiteSettings from "@/editor/SiteSettings";
import PreviewOverlay from "@/editor/PreviewOverlay";
import ExportDialog from "@/editor/ExportDialog";
import ShareDialog from "@/editor/ShareDialog";
import LayersPanel from "@/editor/LayersPanel";

export default function Editor() {
  const { siteId } = useParams();
  const nav = useNavigate();
  const setActiveSite = useStore((s) => s.setActiveSite);
  const sites = useStore((s) => s.sites);
  const site = useActiveSite();
  const page = useCurrentPage();
  const openPanel = useStore((s) => s.openPanel);

  useEffect(() => {
    if (!sites[siteId]) { nav("/sites"); return; }
    setActiveSite(siteId);
    return () => setActiveSite(null);
  }, [siteId]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      const t = e.target;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      const mod = e.metaKey || e.ctrlKey;
      const st = useStore.getState();
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); st.undo(); }
      else if (mod && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) { e.preventDefault(); st.redo(); }
      else if (mod && e.key.toLowerCase() === "c") { st.copySelection(); }
      else if (mod && e.key.toLowerCase() === "v") { st.pasteClipboard(); }
      else if (mod && e.key.toLowerCase() === "d") { e.preventDefault(); if (st.selectedIds.length) st.duplicateElements(st.selectedIds); }
      else if (e.key === "Delete" || e.key === "Backspace") { if (st.selectedIds.length) { e.preventDefault(); st.removeElements(st.selectedIds); } }
      else if (e.key === "Escape") { st.clearSelection(); st.setContextMenu(null); st.closePanel(); st.setPreview(null); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!site || !page) return <div className="min-h-screen flex items-center justify-center text-neutral-400">Loading…</div>;

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ background: "hsl(var(--paper-2))" }}>
      <TopBar />
      <Canvas />
      <AddMenu />
      <Inspector />

      {openPanel === "pages" && <PagesPanel />}
      {openPanel === "media" && <MediaGallery />}
      {openPanel === "settings" && <SiteSettings />}
      {openPanel === "pageSettings" && <PageSettingsDialog />}
      {openPanel === "export" && <ExportDialog />}
      {openPanel === "share" && <ShareDialog />}
      {openPanel === "layers" && <LayersPanel />}
      <PreviewOverlay />
    </div>
  );
}
