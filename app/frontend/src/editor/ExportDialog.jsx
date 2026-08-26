import { useStore, useActiveSite } from "@/lib/store";
import { downloadHTML, exportSiteHTML } from "@/lib/exporter";
import { X, Download, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ExportDialog() {
  const site = useActiveSite();
  const closePanel = useStore((s) => s.closePanel);
  const [copied, setCopied] = useState(false);
  if (!site) return null;
  const html = exportSiteHTML(site);
  const bytes = new Blob([html]).size;

  const copy = async () => {
    try { await navigator.clipboard.writeText(html); setCopied(true); toast.success("HTML copied to clipboard"); setTimeout(() => setCopied(false), 1500); } catch { toast.error("Copy failed"); }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center pop-in p-6" onClick={closePanel} data-testid="export-dialog">
      <div className="float-panel w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div>
            <div className="font-display text-2xl font-semibold">Export site</div>
            <div className="text-xs text-neutral-500 mt-1">One self-contained HTML file · {(bytes / 1024).toFixed(1)} KB · {site.pages.length} pages</div>
          </div>
          <button onClick={closePanel} className="p-2 rounded-full hover:bg-neutral-100"><X size={16}/></button>
        </div>
        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex gap-2 mb-3">
            <button onClick={() => downloadHTML(site)} className="pill-btn pill-btn-primary" data-testid="export-download"><Download size={14}/> Download {site.name}.html</button>
            <button onClick={copy} className="pill-btn"><Copy size={14}/> {copied ? "Copied" : "Copy HTML"}</button>
          </div>
          <pre className="flex-1 overflow-auto text-[10px] font-mono bg-neutral-900 text-neutral-100 p-3 rounded-lg leading-relaxed whitespace-pre-wrap break-all">{html.slice(0, 8000)}{html.length > 8000 ? "\n\n[…truncated in preview — full HTML is exported.]" : ""}</pre>
        </div>
      </div>
    </div>
  );
}
