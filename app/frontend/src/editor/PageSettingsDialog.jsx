import { useState, useEffect } from "react";
import { useStore, useActiveSite } from "@/lib/store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode";
import { toast } from "sonner";

export default function PageSettingsDialog() {
  const site = useActiveSite();
  const pageId = useStore((s) => s.panelData);
  const closePanel = useStore((s) => s.closePanel);
  const updatePage = useStore((s) => s.updatePage);
  const page = site?.pages.find((p) => p.id === pageId);
  const [local, setLocal] = useState(page);
  const [qr, setQr] = useState("");

  useEffect(() => { setLocal(page); }, [pageId]);
  useEffect(() => {
    if (local?.slug) QRCode.toDataURL(`${window.location.origin}/#${local.slug}`, { width: 180 }).then(setQr).catch(() => {});
  }, [local?.slug]);

  if (!local) return null;

  const save = () => { updatePage(local.id, () => local); toast.success("Page settings saved"); closePanel(); };

  return (
    <Dialog open onOpenChange={closePanel}>
      <DialogContent className="float-panel max-w-2xl max-h-[85vh] overflow-y-auto" data-testid="page-settings-dialog">
        <DialogHeader><DialogTitle className="font-display text-2xl">{local.title} — settings</DialogTitle></DialogHeader>
        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-5 mb-4"><TabsTrigger value="general">General</TabsTrigger><TabsTrigger value="seo">SEO</TabsTrigger><TabsTrigger value="security">Security</TabsTrigger><TabsTrigger value="code">Code</TabsTrigger><TabsTrigger value="qr">QR</TabsTrigger></TabsList>
          <TabsContent value="general" className="space-y-3">
            <Field label="Page title"><Input value={local.title} onChange={(e) => setLocal({ ...local, title: e.target.value })}/></Field>
            <Field label="Nav label"><Input value={local.navTitle} onChange={(e) => setLocal({ ...local, navTitle: e.target.value })}/></Field>
            <Field label="URL slug"><Input value={local.slug} onChange={(e) => setLocal({ ...local, slug: e.target.value.replace(/[^a-z0-9-]/g, "-") })}/></Field>
            <Row label="Show header"><Switch checked={local.showHeader} onCheckedChange={(v) => setLocal({ ...local, showHeader: v })}/></Row>
            <Row label="Show footer"><Switch checked={local.showFooter} onCheckedChange={(v) => setLocal({ ...local, showFooter: v })}/></Row>
            <Row label="Home page"><Switch checked={local.isHome} onCheckedChange={(v) => setLocal({ ...local, isHome: v })}/></Row>
            <Field label="Canvas width (px)"><Input type="number" value={local.canvasWidth || 1280} onChange={(e) => setLocal({ ...local, canvasWidth: Number(e.target.value) })}/></Field>
            <Field label="Canvas height (px)"><Input type="number" value={local.canvasHeight} onChange={(e) => setLocal({ ...local, canvasHeight: Number(e.target.value) })}/></Field>
          </TabsContent>
          <TabsContent value="seo" className="space-y-3">
            <Field label="Meta title"><Input value={local.seo?.title || ""} onChange={(e) => setLocal({ ...local, seo: { ...local.seo, title: e.target.value } })}/></Field>
            <Field label="Meta description"><textarea rows={3} className="w-full border rounded p-2 text-sm" value={local.seo?.description || ""} onChange={(e) => setLocal({ ...local, seo: { ...local.seo, description: e.target.value } })}/></Field>
            <Field label="Social / OG image URL"><Input value={local.seo?.ogImage || ""} onChange={(e) => setLocal({ ...local, seo: { ...local.seo, ogImage: e.target.value } })}/></Field>
          </TabsContent>
          <TabsContent value="security" className="space-y-3">
            <Field label="Password"><Input type="password" value={local.password} onChange={(e) => setLocal({ ...local, password: e.target.value })} placeholder="Leave empty for public"/></Field>
            <p className="text-xs text-neutral-500">Visitors will be prompted for this password on the exported HTML.</p>
          </TabsContent>
          <TabsContent value="code" className="space-y-3">
            <Field label="Head injection (analytics, custom CSS…)">
              <textarea rows={4} value={local.inject?.header || ""} onChange={(e) => setLocal({ ...local, inject: { ...local.inject, header: e.target.value } })} className="w-full border rounded p-2 text-xs font-mono" placeholder="<script>...</script>"/>
            </Field>
            <Field label="Body-start injection">
              <textarea rows={3} value={local.inject?.body || ""} onChange={(e) => setLocal({ ...local, inject: { ...local.inject, body: e.target.value } })} className="w-full border rounded p-2 text-xs font-mono"/>
            </Field>
            <Field label="Footer injection">
              <textarea rows={3} value={local.inject?.footer || ""} onChange={(e) => setLocal({ ...local, inject: { ...local.inject, footer: e.target.value } })} className="w-full border rounded p-2 text-xs font-mono"/>
            </Field>
          </TabsContent>
          <TabsContent value="qr" className="text-center py-4">
            {qr && <img src={qr} alt="qr" className="mx-auto rounded-xl border border-neutral-200"/>}
            <p className="text-xs text-neutral-500 mt-3">QR code for /{local.slug}. Scan on any device.</p>
            {qr && <a href={qr} download={`${local.slug}-qr.png`} className="pill-btn mt-3 inline-flex">Download</a>}
          </TabsContent>
        </Tabs>
        <div className="flex justify-end gap-2 pt-4 border-t border-neutral-200">
          <Button variant="outline" onClick={closePanel}>Cancel</Button>
          <Button onClick={save} data-testid="page-settings-save">Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
function Field({ label, children }) { return <div><Label className="text-xs">{label}</Label>{children}</div>; }
function Row({ label, children }) { return <div className="flex items-center justify-between"><Label className="text-xs">{label}</Label>{children}</div>; }
