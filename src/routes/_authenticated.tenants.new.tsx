import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { saveTenant } from "@/lib/hamrorent.functions";
import { toast } from "sonner";
import { Copy, RotateCw } from "lucide-react";

export const Route = createFileRoute("/_authenticated/tenants/new")({
  head: () => ({ meta: [{ title: "Add tenant — HamroRent" }] }),
  component: NewTenantPage,
});

const generateShareToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

function NewTenantPage() {
  const router = useRouter();
  const save = useServerFn(saveTenant);
  const [form, setForm] = useState({ 
    name: "", 
    room_number: "", 
    phone: "", 
    move_in_date_bs: "", 
    notes: "",
    is_active: true,
    share_token: generateShareToken(),
  });
  const [loading, setLoading] = useState(false);

  const regenerateToken = () => {
    setForm({ ...form, share_token: generateShareToken() });
    toast.success("Share token regenerated");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(form.share_token);
    toast.success("Share token copied to clipboard");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    setLoading(true);
    try {
      console.log("[v0] Submitting form:", form);
      const t = await save(form);
      console.log("[v0] Tenant created:", t);
      toast.success("Tenant added");
      router.navigate({ to: "/tenants/$tenantId", params: { tenantId: (t as any).id } });
    } catch (err: any) {
      console.log("[v0] Error saving tenant:", err);
      toast.error(err.message ?? "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 font-display text-4xl">Add tenant</h1>
        <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <Field label="Full name *">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Room / Unit number">
              <Input value={form.room_number} onChange={(e) => setForm({ ...form, room_number: e.target.value })} />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Field>
          </div>
          <Field label="Move-in date (BS)" hint="e.g. Baisakh 2081 or 2081-01">
            <Input value={form.move_in_date_bs} onChange={(e) => setForm({ ...form, move_in_date_bs: e.target.value })} />
          </Field>
          <Field label="Notes">
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>

          <div className="flex items-center gap-2">
            <Checkbox 
              id="is_active" 
              checked={form.is_active} 
              onCheckedChange={(checked) => setForm({ ...form, is_active: checked as boolean })}
            />
            <Label htmlFor="is_active" className="cursor-pointer">Active tenant</Label>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <Label className="mb-3 block text-sm font-medium">Share Token</Label>
            <p className="mb-3 text-xs text-muted-foreground">
              Generate a unique token for sharing tenant information externally
            </p>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input 
                  value={form.share_token} 
                  readOnly 
                  className="font-mono text-sm"
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={copyToClipboard}
                title="Copy token"
              >
                <Copy className="size-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={regenerateToken}
                title="Generate new token"
              >
                <RotateCw className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => router.history.back()}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save tenant"}</Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
