import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "@/pages/Landing";
import Sites from "@/pages/Sites";
import Editor from "@/pages/Editor";
import SharePreview from "@/pages/SharePreview";
import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/sites" element={<Sites />} />
        <Route path="/editor/:siteId" element={<Editor />} />
        <Route path="/share/:sid" element={<SharePreview />} />
      </Routes>
      <Toaster position="bottom-center" />
    </BrowserRouter>
  );
}
