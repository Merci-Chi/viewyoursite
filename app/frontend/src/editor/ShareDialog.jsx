import { useState } from "react";
import { useStore, useActiveSite } from "@/lib/store";
import { X, Copy, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ShareDialog() {
  const site = useActiveSite();
  const closePanel = useStore((s) => s.closePanel);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const publish = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/share`, { site });
      const url = `${window.location.origin}/share/${data.id}`;
      setShareUrl(url);
      toast.success("Preview link ready.");
    } catch (e) {
      toast.error("Could not publish preview: " + (e?.message || "error"));
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => { await navigator.clipboard.writeText(shareUrl); toast.success("Copied"); };

  if (!site) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center pop-in p-6" onClick={closePanel} data-testid="share-dialog">
      <div className="float-panel w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <div>
            <div className="font-display text-2xl font-semibold">Share preview</div>
            <div className="text-xs text-neutral-500 mt-1">A read-only link anyone can open — no sign-in needed.</div>
          </div>
          <button onClick={closePanel} className="p-2 rounded-full hover:bg-neutral-100"><X size={16}/></button>
        </div>
        <div className="p-4 space-y-4">
          {!shareUrl ? (
            <button onClick={publish} disabled={loading} className="pill-btn pill-btn-primary w-full !py-3" data-testid="share-publish">
              {loading ? <><Loader2 size={14} className="animate-spin"/> Publishing…</> : <><Link2 size={14}/> Publish preview link</>}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-neutral-100 rounded-lg font-mono text-xs break-all border border-neutral-200" data-testid="share-url">{shareUrl}</div>
              <div className="flex gap-2">
                <button onClick={copy} className="pill-btn flex-1"><Copy size={13}/> Copy link</button>
                <a href={shareUrl} target="_blank" rel="noreferrer" className="pill-btn pill-btn-primary flex-1 no-underline">Open</a>
              </div>
              <p className="text-[11px] text-neutral-500">Link is stored on the server so anyone with the URL can view the current snapshot. Re-publish to update.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
