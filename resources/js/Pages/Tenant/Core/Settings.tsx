/**
 * Settings Page — sGTM Tracking Platform
 * Optimized: Balanced simplicity with core 'Event-Based' tracking metadata.
 */
import React from "react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { Input } from "@Tenant/components/ui/input";
import { Label } from "@Tenant/components/ui/label";
import { Button } from "@Tenant/components/ui/button";
import { Building, Globe, ShieldCheck, Save, Loader2, Server, Key, Mail, Phone, Eye, EyeOff, Copy, Info } from "lucide-react";
import { toast } from "sonner";
import { usePage, useForm, Head, router } from "@inertiajs/react";

interface SettingsProps {
  tenant: any;
  settings: Record<string, any>;
}

const Settings = ({ tenant, settings: initialSettings }: SettingsProps) => {
  const [showSecret, setShowSecret] = React.useState(false);
  const { patch, data, setData, processing } = useForm({
    tenant_name: initialSettings?.tenant_name || tenant?.tenant_name || "",
    company_name: initialSettings?.company_name || tenant?.company_name || "",
    company_email: initialSettings?.company_email || tenant?.admin_email || "",
    company_phone: initialSettings?.company_phone || tenant?.phone || "",
  } as any);

  const route = (window as any).route;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    patch(route('tenant.settings.update'), {
      onSuccess: () => toast.success("Workspace identity updated successfully"),
      onError: () => toast.error("Failed to update settings"),
    });
  };

  return (
    <DashboardLayout>
      <Head title="Settings" />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your tracking platform's core identity and support contacts.</p>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 max-w-5xl pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Identity */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <h3 className="mb-6 text-base font-semibold text-card-foreground flex items-center gap-2 border-b border-border/40 pb-4">
                <Building className="h-5 w-5 text-primary" /> Workspace Identity
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Workspace Name</Label>
                  <Input
                    value={data.tenant_name}
                    onChange={e => setData("tenant_name", e.target.value)}
                    placeholder="e.g. Production Tracking"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Organization Name</Label>
                  <Input
                    value={data.company_name}
                    onChange={e => setData("company_name", e.target.value)}
                    placeholder="e.g. Acme Corp Inc."
                    className="h-10"
                  />
                </div>
                <div className="space-y-2 pt-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Primary Tracking Subdomain</Label>
                  <Input
                    value={tenant?.domain || "—"}
                    disabled
                    className="bg-muted h-10 font-mono text-xs opacity-70 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Support Information */}
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <h3 className="mb-6 text-base font-semibold text-card-foreground flex items-center gap-2 border-b border-border/40 pb-4">
                <Mail className="h-5 w-5 text-primary" /> Support & Contact
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Support Email</Label>
                  <div className="relative">
                    <Input
                      value={data.company_email}
                      onChange={e => setData("company_email", e.target.value)}
                      placeholder="admin@company.com"
                      className="h-10 pl-10"
                    />
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Support Phone</Label>
                  <div className="relative">
                    <Input
                      value={data.company_phone}
                      onChange={e => setData("company_phone", e.target.value)}
                      placeholder="+1 234 567 890"
                      className="h-10 pl-10"
                    />
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 italic">These details are used for billing alerts and platform security notifications.</p>
              </div>
            </div>
          </div>

          {/* Platform Meta Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <h3 className="mb-6 text-base font-semibold text-card-foreground flex items-center gap-2 border-b border-border/40 pb-4">
                <Server className="h-5 w-5 text-primary" /> Platform Meta
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Tier", value: tenant?.plan || "Free", icon: ShieldCheck, color: "text-emerald-500" },
                  { label: "Region", value: initialSettings?.region || "Global / USA", icon: Globe, color: "text-sky-500" },
                  { label: "Quota", value: `${(initialSettings?.event_limit / 1000) || 0}k/mo`, icon: Key, color: "text-amber-500" },
                  { label: "Engine", value: "sGTM Hybrid", icon: Server, color: "text-primary" }
                ].map((item, i) => (
                  <div key={i} className="rounded-xl bg-muted/20 p-4 border border-border/40">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.label}</span>
                    </div>
                    <p className="text-sm font-bold text-card-foreground truncate">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm flex flex-col">
              <h3 className="mb-6 text-base font-semibold text-card-foreground flex items-center gap-2 border-b border-border/40 pb-4">
                <ShieldCheck className="h-5 w-5 text-primary" /> Security & Credentials
              </h3>
              <div className="space-y-6 flex-grow">
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <div className="flex items-center gap-2 text-amber-600 mb-1.5">
                    <Info size={14} />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Master Key Policy</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    The Global Secret is your Master Key for Sidecar node authentication. Handle with extreme care.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                      Global Account Secret <Key className="h-3 w-3" />
                    </Label>
                    <button 
                        type="button"
                        onClick={() => router.post(route('tenant.settings.rotate-secret'), {}, {
                            onBefore: () => confirm("Are you sure you want to rotate your Master Key? Existing sidecars will lose access until updated."),
                            onSuccess: () => toast.success("New Master Key generated!")
                        })}
                        className="text-[9px] font-bold text-primary hover:underline uppercase tracking-widest"
                    >
                        Rotate Key
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      type={showSecret ? "text" : "password"}
                      value={initialSettings?.global_account_secret || tenant?.global_account_secret || "—"}
                      readOnly
                      className="bg-muted/30 h-11 font-mono text-xs pr-20 border-border"
                    />
                    <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
                        <Button 
                            type="button"
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowSecret(!showSecret)}
                        >
                            {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button 
                            type="button"
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => {
                                const secret = initialSettings?.global_account_secret || tenant?.global_account_secret;
                                if (secret) {
                                    navigator.clipboard.writeText(secret);
                                    toast.success("Secret copied to clipboard");
                                }
                            }}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-1">Workspace API Key</Label>
                  <div className="relative">
                    <Input
                        value={tenant?.api_key || "—"}
                        readOnly
                        className="bg-muted/30 h-11 font-mono text-xs opacity-70 border-border pr-12"
                    />
                    <Button 
                        type="button"
                        variant="ghost" 
                        size="icon" 
                        className="absolute right-1.5 top-1.5 h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => {
                            if (tenant?.api_key) {
                                navigator.clipboard.writeText(tenant.api_key);
                                toast.success("API Key copied");
                            }
                        }}
                    >
                        <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={processing}
              className="h-12 px-10 rounded-xl shadow-xl bg-primary text-primary-foreground font-bold flex items-center gap-2"
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Workspace Changes
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
