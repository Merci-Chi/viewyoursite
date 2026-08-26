import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { exportSiteHTML } from "@/lib/exporter";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function SharePreview() {
  const { sid } = useParams();
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API}/share/${sid}`);
        setHtml(exportSiteHTML(data.site));
      } catch (e) {
        setError(e?.response?.status === 404 ? "Preview link not found." : "Failed to load preview.");
      }
    })();
  }, [sid]);

  if (error) return <div className="min-h-screen flex items-center justify-center text-neutral-500 font-display text-xl">{error}</div>;
  if (!html) return <div className="min-h-screen flex items-center justify-center text-neutral-400">Loading…</div>;
  return <iframe title="site" srcDoc={html} className="fixed inset-0 w-screen h-screen border-0"/>;
}
