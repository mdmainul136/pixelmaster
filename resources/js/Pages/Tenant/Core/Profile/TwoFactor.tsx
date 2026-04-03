import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { Button } from "@Tenant/components/ui/button";
import { Input } from "@Tenant/components/ui/input";
import { Label } from "@Tenant/components/ui/label";
import { ArrowLeft, ShieldCheck, ShieldAlert, Key, Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface Props {
  twoFactorEnabled: boolean;
}

export default function TwoFactor({ twoFactorEnabled }: Props) {
  const [setupData, setSetupData] = useState<{ secret: string; qr_code: string } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Expose the global route helper from Ziggy
  const route = (window as any).route;

  const confirmForm = useForm({
    code: "",
  });

  const disableForm = useForm({});

  const startSetup = async () => {
    setIsEnabling(true);
    try {
      const { data } = await axios.post(route("tenant.profile.two-factor.enable"));
      setSetupData(data);
    } catch (error) {
      toast.error("Failed to initialize 2FA setup.");
    } finally {
      setIsEnabling(false);
    }
  };

  const submitConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    confirmForm.post(route("tenant.profile.two-factor.confirm"), {
      preserveScroll: true,
      onSuccess: () => {
        setSetupData(null);
        confirmForm.reset();
        fetchRecoveryCodes();
      },
      onError: () => confirmForm.reset("code"),
    });
  };

  const disable2FA = () => {
    disableForm.delete(route("tenant.profile.two-factor.disable"), {
      preserveScroll: true,
      onSuccess: () => {
        setRecoveryCodes([]);
        setSetupData(null);
      },
    });
  };

  const fetchRecoveryCodes = async () => {
    try {
      const { data } = await axios.get(route("tenant.profile.two-factor.recovery-codes"));
      setRecoveryCodes(data.recovery_codes || []);
    } catch (error) {
      toast.error("Failed to load recovery codes.");
    }
  };

  const regenerateRecoveryCodes = async () => {
    try {
      const { data } = await axios.post(route("tenant.profile.two-factor.recovery-codes"));
      setRecoveryCodes(data.recovery_codes || []);
      toast.success("Recovery codes regenerated successfully.");
    } catch (error) {
      toast.error("Failed to regenerate recovery codes.");
    }
  };

  const copyToClipboard = () => {
    const text = recoveryCodes.join("\n");
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Recovery codes copied to clipboard.");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <Head title="Two-Factor Authentication" />

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={route("tenant.profile")}
          className="rounded-lg p-2 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Two-Factor Authentication</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add additional security to your account using two-factor authentication.
          </p>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Status Card */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className={`mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${twoFactorEnabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
              {twoFactorEnabled ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-card-foreground">
                {twoFactorEnabled ? "You have enabled two-factor authentication." : "You have not enabled two-factor authentication."}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-2xl">
                When two-factor authentication is enabled, you will be prompted for a secure, random token during authentication. You may retrieve this token from your phone's Google Authenticator application.
              </p>

              {!twoFactorEnabled && !setupData && (
                <div className="mt-6">
                  <Button onClick={startSetup} disabled={isEnabling}>
                    {isEnabling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Enable Two-Factor
                  </Button>
                </div>
              )}

              {twoFactorEnabled && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {recoveryCodes.length === 0 ? (
                    <Button variant="outline" onClick={fetchRecoveryCodes}>
                      Show Recovery Codes
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={regenerateRecoveryCodes}>
                      <RefreshCw className="mr-2 h-4 w-4" /> Regenerate Recovery Codes
                    </Button>
                  )}
                  
                  <Button variant="destructive" onClick={disable2FA} disabled={disableForm.processing}>
                    {disableForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Disable 2FA
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Setup Wizard */}
        {!twoFactorEnabled && setupData && (
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-card-foreground">Finish enabling two-factor authentication.</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
              To finish enabling two-factor authentication, scan the following QR code using your phone's authenticator application or enter the setup key and provide the generated OTP code.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-8 items-start">
              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div dangerouslySetInnerHTML={{ __html: setupData.qr_code }} className="w-48 h-48 sm:w-56 sm:h-56 [&>svg]:w-full [&>svg]:h-full" />
              </div>

              {/* Form */}
              <div className="flex-1 w-full max-w-sm">
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Setup Key</p>
                  <code className="px-3 py-1.5 bg-muted rounded-md text-sm font-mono text-foreground break-all inline-block">
                    {setupData.secret}
                  </code>
                </div>

                <form onSubmit={submitConfirm} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Confirmation Code</Label>
                    <Input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      autoFocus
                      autoComplete="one-time-code"
                      className="text-lg tracking-widest font-mono max-w-[200px]"
                      value={confirmForm.data.code}
                      onChange={e => confirmForm.setData('code', e.target.value)}
                      placeholder="XXXXXX"
                      maxLength={6}
                    />
                    {confirmForm.errors.code && (
                      <p className="text-xs text-destructive">{confirmForm.errors.code}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={confirmForm.processing}>
                      {confirmForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirm setup
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setSetupData(null)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* Recovery Codes Display */}
        {recoveryCodes.length > 0 && (
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm bg-primary/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" /> Store these recovery codes securely.
              </h3>
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="hidden sm:flex bg-background">
                {isCopied ? <Check className="mr-2 h-4 w-4 text-emerald-500" /> : <Copy className="mr-2 h-4 w-4" />}
                {isCopied ? "Copied" : "Copy"}
              </Button>
            </div>
            
            <p className="mb-6 text-sm text-muted-foreground max-w-2xl leading-relaxed">
              These recovery codes can be used to access your account in the event you lose access to your device and cannot receive two-factor authentication codes. Keep them in a secure password manager.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg bg-background p-5 rounded-lg border font-mono text-sm tracking-wider">
              {recoveryCodes.map((code, i) => (
                <div key={i} className="text-foreground flex items-center gap-3">
                  <span className="text-muted-foreground opacity-50 text-xs w-4">{i+1}.</span>
                  {code}
                </div>
              ))}
            </div>
            
            <Button variant="outline" className="mt-4 sm:hidden w-full bg-background" onClick={copyToClipboard}>
              {isCopied ? <Check className="mr-2 h-4 w-4 text-emerald-500" /> : <Copy className="mr-2 h-4 w-4" />} 
              {isCopied ? "Copied" : "Copy Codes"}
            </Button>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
