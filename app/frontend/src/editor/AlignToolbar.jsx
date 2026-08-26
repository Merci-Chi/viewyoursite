import { useStore } from "@/lib/store";
import { AlignStartVertical, AlignCenterVertical, AlignEndVertical, AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal, AlignHorizontalDistributeCenter, AlignVerticalDistributeCenter } from "lucide-react";

export default function AlignToolbar() {
  const selectedIds = useStore((s) => s.selectedIds);
  const alignSelection = useStore((s) => s.alignSelection);
  if (selectedIds.length < 2) return null;

  const items = [
    { m: "left", I: AlignStartVertical, t: "Align left" },
    { m: "hcenter", I: AlignCenterVertical, t: "Center horizontally" },
    { m: "right", I: AlignEndVertical, t: "Align right" },
    { m: "top", I: AlignStartHorizontal, t: "Align top" },
    { m: "vcenter", I: AlignCenterHorizontal, t: "Center vertically" },
    { m: "bottom", I: AlignEndHorizontal, t: "Align bottom" },
    { m: "distH", I: AlignHorizontalDistributeCenter, t: "Distribute horizontally" },
    { m: "distV", I: AlignVerticalDistributeCenter, t: "Distribute vertically" },
  ];

  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-40 float-panel-dark p-1 flex items-center gap-0.5 pop-in" style={{ top: 80 }} data-testid="align-toolbar">
      <span className="text-[10px] uppercase tracking-widest px-2 opacity-70">{selectedIds.length} selected</span>
      {items.map((it) => (
        <button key={it.m} title={it.t} onClick={() => alignSelection(it.m)} className="p-2 rounded hover:bg-white/10">
          <it.I size={14}/>
        </button>
      ))}
    </div>
  );
}
