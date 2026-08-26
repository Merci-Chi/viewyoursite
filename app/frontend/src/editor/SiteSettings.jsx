import { useStore, useActiveSite } from "@/lib/store";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const FONTS = ["Fraunces", "DM Sans", "Inter", "Georgia", "Arial", "JetBrains Mono", "Playfair Display", "Space Grotesk"];

export default function SiteSettings() {
  const site = useActiveSite();
  const { closePanel, updateSite } = useStore.getState();
  const active = useStore((s) => s.activeSiteId);
  if (!site) return null;
  const set = (patch) => updateSite(active, (s) => ({ ...s, ...patch }));
  const setHeader = (patch) => updateSite(active, (s) => ({ ...s, header: { ...s.header, ...patch } }));
  const setFooter = (patch) => updateSite(active, (s) => ({ ...s, footer: { ...s.footer, ...patch } }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/20 pop-in" onClick={closePanel} data-testid="site-settings">
      <div className="float-panel w-[600px] max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="font-display text-2xl font-semibold">Site settings</h2>
          <button onClick={closePanel} className="p-2 rounded-full hover:bg-neutral-100"><X size={16}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="general">
            <TabsList className="grid grid-cols-4 mb-4"><TabsTrigger value="general">General</TabsTrigger><TabsTrigger value="theme">Theme</TabsTrigger><TabsTrigger value="header">Header</TabsTrigger><TabsTrigger value="footer">Footer</TabsTrigger></TabsList>
            <TabsContent value="general" className="space-y-3">
              <F label="Site name"><Input value={site.name} onChange={(e) => set({ name: e.target.value })}/></F>
              <F label="Faction / brand"><Input value={site.faction || ""} onChange={(e) => set({ faction: e.target.value })}/></F>
              <F label="Favicon URL"><Input value={site.favicon || ""} onChange={(e) => set({ favicon: e.target.value })}/></F>
              <F label="Body background">
                <div className="flex gap-2">
                  <Select value={site.background?.type || "color"} onValueChange={(t) => set({ background: { ...site.background, type: t } })}>
                    <SelectTrigger className="h-9 w-32"><SelectValue/></SelectTrigger>
                    <SelectContent><SelectItem value="color">Color</SelectItem><SelectItem value="gradient">Gradient</SelectItem><SelectItem value="image">Image URL</SelectItem></SelectContent>
                  </Select>
                  <Input value={site.background?.value || ""} onChange={(e) => set({ background: { ...site.background, value: e.target.value } })} className="flex-1"/>
                </div>
              </F>
            </TabsContent>
            <TabsContent value="theme" className="space-y-3">
              <F label="Display font"><Select value={site.theme?.display} onValueChange={(v) => set({ theme: { ...site.theme, display: v } })}><SelectTrigger className="h-9"><SelectValue/></SelectTrigger><SelectContent>{FONTS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select></F>
              <F label="Body font"><Select value={site.theme?.body} onValueChange={(v) => set({ theme: { ...site.theme, body: v } })}><SelectTrigger className="h-9"><SelectValue/></SelectTrigger><SelectContent>{FONTS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select></F>
              <F label="Accent color"><div className="flex gap-2"><input type="color" value={site.theme?.accent} onChange={(e) => set({ theme: { ...site.theme, accent: e.target.value } })} className="w-10 h-9 border rounded"/><Input value={site.theme?.accent} onChange={(e) => set({ theme: { ...site.theme, accent: e.target.value } })}/></div></F>
              <F label="Ink (text)"><div className="flex gap-2"><input type="color" value={site.theme?.ink} onChange={(e) => set({ theme: { ...site.theme, ink: e.target.value } })} className="w-10 h-9 border rounded"/><Input value={site.theme?.ink} onChange={(e) => set({ theme: { ...site.theme, ink: e.target.value } })}/></div></F>
              <F label="Paper (bg)"><div className="flex gap-2"><input type="color" value={site.theme?.paper} onChange={(e) => set({ theme: { ...site.theme, paper: e.target.value } })} className="w-10 h-9 border rounded"/><Input value={site.theme?.paper} onChange={(e) => set({ theme: { ...site.theme, paper: e.target.value } })}/></div></F>
            </TabsContent>
            <TabsContent value="header" className="space-y-3">
              <R label="Show header"><Switch checked={site.header.show} onCheckedChange={(v) => setHeader({ show: v })}/></R>
              <F label="Height"><Input type="number" value={site.header.height} onChange={(e) => setHeader({ height: Number(e.target.value) })}/></F>
              <F label="Background color"><div className="flex gap-2"><input type="color" value={site.header.background?.value || "#ffffff"} onChange={(e) => setHeader({ background: { type: "color", value: e.target.value } })} className="w-10 h-9 border rounded"/><Input value={site.header.background?.value || ""} onChange={(e) => setHeader({ background: { type: "color", value: e.target.value } })}/></div></F>
            </TabsContent>
            <TabsContent value="footer" className="space-y-3">
              <R label="Show footer"><Switch checked={site.footer.show} onCheckedChange={(v) => setFooter({ show: v })}/></R>
              <F label="Height"><Input type="number" value={site.footer.height} onChange={(e) => setFooter({ height: Number(e.target.value) })}/></F>
              <F label="Background color"><div className="flex gap-2"><input type="color" value={site.footer.background?.value || "#000000"} onChange={(e) => setFooter({ background: { type: "color", value: e.target.value } })} className="w-10 h-9 border rounded"/><Input value={site.footer.background?.value || ""} onChange={(e) => setFooter({ background: { type: "color", value: e.target.value } })}/></div></F>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
function F({ label, children }) { return <div><Label className="text-xs">{label}</Label>{children}</div>; }
function R({ label, children }) { return <div className="flex items-center justify-between"><Label className="text-xs">{label}</Label>{children}</div>; }
