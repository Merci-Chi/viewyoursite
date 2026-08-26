import { useState } from "react";
import { useStore } from "@/lib/store";
import { Plus, X, Type, Heading, Image as ImageIcon, Video, Square, ListPlus, Shapes, Minus, AudioLines, CalendarDays, BarChart3, Quote as QuoteI, Code2, FileText, Rss, Share2, Search, Box } from "lucide-react";

const CATEGORIES = [
  {
    name: "Text",
    items: [
      { type: "heading", label: "Heading", I: Heading },
      { type: "text", label: "Text", I: Type },
      { type: "quote", label: "Quote", I: QuoteI },
      { type: "markdown", label: "Markdown", I: FileText },
    ],
  },
  {
    name: "Media",
    items: [
      { type: "image", label: "Image", I: ImageIcon },
      { type: "video", label: "Video", I: Video },
      { type: "audio", label: "Audio", I: AudioLines },
    ],
  },
  {
    name: "Interactive",
    items: [
      { type: "button", label: "Button", I: Square },
      { type: "form", label: "Form", I: ListPlus },
      { type: "accordion", label: "Accordion", I: Box },
      { type: "search", label: "Search field", I: Search },
    ],
  },
  {
    name: "Layout",
    items: [
      { type: "shape", label: "Shape", I: Shapes },
      { type: "line", label: "Line / Divider", I: Minus },
      { type: "container", label: "Container", I: Box },
    ],
  },
  {
    name: "Data & Embed",
    items: [
      { type: "calendar", label: "Calendar", I: CalendarDays },
      { type: "chart", label: "Chart", I: BarChart3 },
      { type: "code", label: "Code (HTML)", I: Code2 },
      { type: "embed", label: "Embed / iframe", I: Rss },
      { type: "social", label: "Social links", I: Share2 },
    ],
  },
];

export default function AddMenu() {
  const [open, setOpen] = useState(false);
  const addElement = useStore((s) => s.addElement);
  const zoom = useStore((s) => s.zoom);

  const handleAdd = (type) => {
    // add near visual center inside current editing scope
    const editingScope = useStore.getState().editingScope || "main";
    addElement(type, 120, 80, editingScope);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      {open && (
        <div className="float-panel p-4 mb-3 w-[520px] pop-in" data-testid="add-menu-popup">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg font-semibold">Add to canvas</h3>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-neutral-100"><X size={16}/></button>
          </div>
          <div className="max-h-[420px] overflow-y-auto pr-1">
            {CATEGORIES.map((cat) => (
              <div key={cat.name} className="mb-4">
                <div className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">{cat.name}</div>
                <div className="grid grid-cols-4 gap-2">
                  {cat.items.map(({ type, label, I }) => (
                    <button
                      key={type}
                      data-testid={`add-${type}`}
                      onClick={() => handleAdd(type)}
                      className="group flex flex-col items-center justify-center gap-1 p-3 rounded-xl border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 transition"
                    >
                      <I size={18} className="text-neutral-700 group-hover:text-neutral-900"/>
                      <span className="text-[11px] font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <button
        data-testid="add-menu-toggle"
        onClick={() => setOpen(!open)}
        className="pill-btn pill-btn-primary shadow-lg"
        style={{ padding: "14px 22px", fontSize: 15, borderRadius: 999 }}
      >
        <Plus size={18} style={{ transform: open ? "rotate(45deg)" : "none", transition: "transform 200ms" }} /> Add
      </button>
    </div>
  );
}
