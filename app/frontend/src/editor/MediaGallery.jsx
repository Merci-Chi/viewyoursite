import { useStore, useActiveSite } from "@/lib/store";
import { X, Upload, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function MediaGallery() {
  const site = useActiveSite();
  const { closePanel, addToGallery, removeFromGallery, addElement, updateElementProps } = useStore.getState();
  const gallery = site?.gallery || [];

  const handleFiles = (files) => {
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        const kind = f.type.startsWith("image/") ? "image" : f.type.startsWith("video/") ? "video" : f.type.startsWith("audio/") ? "audio" : "file";
        addToGallery({ type: kind, data: reader.result, name: f.name, size: f.size, mime: f.type });
      };
      reader.readAsDataURL(f);
    });
    toast.success("Added to gallery");
  };

  const insertToCanvas = (item) => {
    const id = addElement(item.type === "image" ? "image" : item.type === "video" ? "video" : item.type === "audio" ? "audio" : "image", 120, 120);
    setTimeout(() => updateElementProps(id, { src: item.data, alt: item.name }), 20);
    closePanel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/20 pop-in" onClick={closePanel} data-testid="media-gallery">
      <div className="float-panel w-[720px] max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="font-display text-2xl font-semibold">Media library</h2>
          <div className="flex items-center gap-2">
            <label className="pill-btn pill-btn-primary cursor-pointer"><Upload size={14}/> Upload<input type="file" accept="image/*,video/*,audio/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)}/></label>
            <button onClick={closePanel} className="p-2 rounded-full hover:bg-neutral-100"><X size={16}/></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {gallery.length === 0 ? (
            <div className="text-center py-16 dashed-frame rounded-xl">
              <div className="font-display text-2xl mb-1">Empty gallery</div>
              <p className="text-neutral-500 text-sm">Upload images, videos, or audio. Insert them anywhere on your canvas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((g) => (
                <div key={g.id} className="group relative rounded-xl overflow-hidden border border-neutral-200 aspect-square bg-neutral-50 cursor-pointer" onClick={() => insertToCanvas(g)} data-testid={`gallery-item-${g.id}`}>
                  {g.type === "image" && <img src={g.data} alt={g.name} className="w-full h-full object-cover"/>}
                  {g.type === "video" && <video src={g.data} className="w-full h-full object-cover" muted/>}
                  {g.type === "audio" && <div className="w-full h-full flex items-center justify-center text-xs">Audio</div>}
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] truncate">{g.name}</div>
                  <button onClick={(e) => { e.stopPropagation(); removeFromGallery(g.id); }} className="opacity-0 group-hover:opacity-100 absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-md"><Trash2 size={11}/></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
