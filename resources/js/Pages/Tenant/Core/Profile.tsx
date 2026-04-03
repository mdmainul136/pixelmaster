import React, { useState } from "react";
import { usePage, Head, Link } from "@inertiajs/react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { Button } from "@Tenant/components/ui/button";
import { Input } from "@Tenant/components/ui/input";
import { Label } from "@Tenant/components/ui/label";
import { 
  User, Mail, Phone, Pencil, ShieldCheck, 
  Monitor, Key, Eye, EyeOff, Copy, Zap 
} from "lucide-react";
import { toast } from "sonner";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  profile_photo_url?: string;
  created_at?: string;
  status?: string;
}

const Profile = () => {
  const { auth, tenant } = usePage<{ auth: { user: AuthUser }, tenant: any }>().props;
  const user = auth?.user;
  const route = (window as any).route;
  const [showSecret, setShowSecret] = useState(false);

  // Split name into first/last
  const nameParts = (user?.name ?? "").split(" ");
  const firstName = nameParts[0] ?? "—";
  const lastName = nameParts.slice(1).join(" ") || "—";

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" })
    : "—";

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <DashboardLayout>
      <Head title="Profile" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">User Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">View your personal account and tracking credentials.</p>
      </div>

      {/* Profile Header Card */}
      <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="h-32 bg-gradient-to-r from-primary/80 to-primary/20" />

        <div className="relative px-6 pb-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-end sm:gap-5">
            <div className="-mt-12 overflow-hidden flex-shrink-0 flex h-24 w-24 items-center justify-center rounded-full border-4 border-card bg-primary/10 shadow-lg">
              {user?.profile_photo_url ? (
                <img src={user.profile_photo_url} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-primary" />
              )}
            </div>

            <div className="mt-3 flex-1 text-center sm:mt-0 sm:text-left">
              <h2 className="text-xl font-bold text-card-foreground">{user?.name ?? "Unknown User"}</h2>
              <div className="mt-1 flex flex-wrap justify-center sm:justify-start items-center gap-3">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="capitalize font-medium text-primary">{user?.role ?? "user"}</span>
                </span>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-2">
              <Link href={route("tenant.profile.browser-sessions")}>
                <Button variant="outline" size="sm" className="gap-1.5 border-primary/10 hover:bg-primary/5">
                  <Monitor className="h-3.5 w-3.5" /> Sessions
                </Button>
              </Link>
              <Link href={route("tenant.profile.edit")}>
                <Button size="sm" className="gap-1.5">
                  <Pencil className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 max-w-5xl">
        {/* Personal Information */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-fit">
          <div className="mb-5 flex items-center gap-2 border-b border-border/40 pb-4">
             <User className="h-4 w-4 text-primary" />
             <h3 className="text-base font-semibold text-card-foreground">Personal Identity</h3>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              { label: "First Name", value: firstName },
              { label: "Last Name", value: lastName },
              { label: "Email Address", value: user?.email ?? "—", icon: Mail },
              { label: "Phone", value: user?.phone ?? "—", icon: Phone },
            ].map((field) => (
              <div key={field.label} className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{field.label}</p>
                <p className="text-sm font-medium text-card-foreground">{field.value}</p>
              </div>
            ))}
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Account Status</p>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                user?.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {user?.status ?? "active"}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Member Since</p>
              <p className="text-sm font-medium text-card-foreground">{joinedDate}</p>
            </div>
          </div>
        </div>

        {/* Tracking Infrastructure Identity */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm h-fit">
          <div className="mb-5 flex items-center gap-2 border-b border-border/40 pb-4">
             <Key className="h-4 w-4 text-primary" />
             <h3 className="text-base font-semibold text-card-foreground">Tracking Credentials</h3>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Account Secret</Label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input 
                    type={showSecret ? "text" : "password"} 
                    value={tenant?.api_key || ""} 
                    readOnly 
                    placeholder="No Secret Initialized"
                    className="pr-24 font-mono text-xs h-11 bg-muted/30 border-muted-foreground/10 focus:border-primary/30" 
                  />
                  <div className="absolute right-1 top-1 flex gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/5" onClick={() => setShowSecret(!showSecret)}>
                      {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-primary/5" onClick={() => copyToClipboard(tenant?.api_key, 'API Key')}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Use this global secret for secure sGTM container synchronization.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg bg-primary/5 p-4 border border-primary/10 relative overflow-hidden group">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-primary fill-primary/20" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Event Quota</span>
                  </div>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    {tenant?.usage?.percentage ?? 0}%
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000 ease-out rounded-full" 
                      style={{ width: `${tenant?.usage?.percentage ?? 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="text-lg font-black text-primary tracking-tight">
                      {tenant?.usage?.used?.toLocaleString() ?? "0"}
                      <span className="text-[10px] font-bold text-muted-foreground/60 ml-1">REQUESTS</span>
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground/60 pb-0.5 uppercase tracking-tighter">
                      Limit: {((tenant?.usage?.limit ?? 10000) / 1000).toLocaleString()}k
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/30 p-4 border border-border/40 flex flex-col justify-between">
                <div className="flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Infrastructure</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-card-foreground">cGTM Hybrid Mode</p>
                  <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Optimized for high-performance server-side tracking.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
