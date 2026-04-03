import React, { useRef, useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { Button } from "@Tenant/components/ui/button";
import { Input } from "@Tenant/components/ui/input";
import { Label } from "@Tenant/components/ui/label";
import { ArrowLeft, Monitor, Smartphone, Globe, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@Tenant/components/ui/dialog";

interface Session {
  agent: {
    is_desktop: boolean;
    platform: string;
    browser: string;
  };
  ip_address: string;
  is_current_device: boolean;
  last_active: string;
}

interface Props {
  sessions: Session[];
}

export default function BrowserSessions({ sessions }: Props) {
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const passwordInput = useRef<HTMLInputElement>(null);
  
  const route = (window as any).route;

  const form = useForm({
    password: "",
  });

  const confirmLogout = () => {
    setConfirmingLogout(true);
    setTimeout(() => passwordInput.current?.focus(), 250);
  };

  const logoutOtherBrowserSessions = (e: React.FormEvent) => {
    e.preventDefault();

    form.delete(route("tenant.profile.browser-sessions.destroy"), {
      preserveScroll: true,
      onSuccess: () => {
        closeModal();
        toast.success("Logged out of other browser sessions successfully.");
      },
      onError: () => passwordInput.current?.focus(),
      onFinish: () => form.reset(),
    });
  };

  const closeModal = () => {
    setConfirmingLogout(false);
    form.reset();
    form.clearErrors();
  };

  return (
    <DashboardLayout>
      <Head title="Browser Sessions" />

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={route("tenant.profile")}
            className="rounded-lg p-2 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Browser Sessions</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and log out your active sessions on other browsers and devices.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm mb-6">
          <div className="max-w-xl text-sm text-muted-foreground leading-relaxed">
            If necessary, you may log out of all of your other browser sessions across all of your devices. Some of your recent sessions are listed below; however, this list may not be exhaustive. If you feel your account has been compromised, you should also update your password.
          </div>

          {sessions.length > 0 && (
            <div className="mt-6 divide-y divide-border border rounded-lg overflow-hidden">
              {sessions.map((session, i) => (
                <div key={i} className="flex items-center p-4 bg-card hover:bg-muted/30 transition-colors">
                  <div className="h-10 w-10 flex flex-shrink-0 items-center justify-center rounded-full bg-muted/80 text-muted-foreground">
                    {session.agent.is_desktop ? (
                      <Monitor className="h-5 w-5" />
                    ) : (
                      <Smartphone className="h-5 w-5" />
                    )}
                  </div>

                  <div className="ml-4">
                    <div className="text-sm font-medium text-foreground">
                      {session.agent.platform ? session.agent.platform : "Unknown"} -{" "}
                      {session.agent.browser ? session.agent.browser : "Unknown"}
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Globe className="h-3 w-3" /> {session.ip_address}
                      </div>

                      <span className="text-xs text-border px-1.5">•</span>

                      {session.is_current_device ? (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2 rounded-full py-0.5">
                          This device
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Last active {session.last_active}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center">
            <Button onClick={confirmLogout} variant="default" className="gap-2">
              <LogOut className="h-4 w-4" /> Log Out Other Browser Sessions
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={confirmingLogout} onOpenChange={setConfirmingLogout}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Out Other Browser Sessions</DialogTitle>
            <DialogDescription>
              Please enter your password to confirm you would like to log out of your other browser sessions across all of your devices.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={logoutOtherBrowserSessions}>
            <div className="py-4 space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                ref={passwordInput}
                value={form.data.password}
                onChange={(e) => form.setData("password", e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              {form.errors.password && (
                <p className="text-xs text-destructive mt-1">{form.errors.password}</p>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0 mt-2">
              <Button type="button" variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.processing} variant="destructive">
                {form.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log Out Other Sessions
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
