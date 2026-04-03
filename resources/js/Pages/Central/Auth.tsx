"use client";

import React, { useState, useEffect } from "react";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { Link, router } from "@inertiajs/react";
import { useToast } from "@Tenant/components/ui/use-toast";
import axios from "axios";

// Stub: tenantApi was removed during cleanup — inline the functions
const login = async (credentials: any) => {
  const res = await axios.post("/api/v1/auth/login", credentials);
  return res.data;
};
const setAuthCookie = (token: string) => {
  document.cookie = `token=${token}; path=/; max-age=86400`;
};

const Auth = ({ google_login_enabled, facebook_login_enabled }) => {
  const { toast } = useToast();
  const [isCentral, setIsCentral] = useState(false);
  const [storeInfo, setStoreInfo] = useState<{ name: string, logo: string | null }>({ name: "PixelMaster", logo: null });
  const [credentials, setCredentials] = useState({ name: "", email: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loadingToken, setLoadingToken] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    const isCentralDomain = hostname === "localhost" || hostname === "pixelmaster.com" || hostname === "www.pixelmaster.com";
    setIsCentral(isCentralDomain);

    if (!isCentralDomain) {
      // Logic for non-central domains if needed
    }

    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');

    if (token) {
      setLoadingToken(false);
      setAuthCookie(token);
      toast({ title: "Session initialized", description: "Launching your dashboard..." });
      setTimeout(() => { router.visit("/dashboard"); }, 500);
    } else {
      const tenantId = searchParams.get('tenant_id');
      if (tenantId) {
        localStorage.setItem("tenant_id", tenantId);
        setIsCentral(true);
      }
      setLoadingToken(false);
    }
  }, [router, toast]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const res = await login(credentials);
      if (res.success) {
        toast({ title: "Success", description: "Welcome back! Redirecting..." });

        // Ensure token is set locally for API parity
        if (res.data?.token) {
          setAuthCookie(res.data.token);
        }

        // Workspace Owners (role 'admin') should land on their analytics dashboard.
        // Platform Management (/platform/*) is restricted to SuperAdmin guard sessions.
        setTimeout(() => router.visit('/dashboard'), 1000);
      } else {
        if (res.requires_onboarding) {
          toast({ title: "Account Not Found", description: "Redirecting to registration..." });
          const centralUrl = window.location.hostname.endsWith(".localhost")
            ? `http://localhost:${window.location.port}/onboarding`
            : `https://pixelmaster.com/onboarding`;
          setTimeout(() => window.location.href = centralUrl, 1500);
          return;
        }
        toast({ variant: "destructive", title: "Authentication Failed", description: res.message || "Invalid credentials" });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loadingToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-[#F8FAFC]">
      {/* Dynamic Background Decoration */}
      <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-400/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-[440px] z-10">
        <div className="bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] p-8 lg:p-12 space-y-8">
          <div className="text-center space-y-3">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm border border-primary/5">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              {isCentral ? "PixelMaster" : storeInfo.name}
            </h1>
            <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
              {isCentral ? "Admin Central Orchestration" : "Storefront Management Console"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-widest font-black text-slate-400 ml-1">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-3.5 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all text-slate-900 text-sm placeholder:text-slate-300"
                  required
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] uppercase tracking-widest font-black text-slate-400">Password</label>
                <Link href="#" className="text-[11px] font-bold text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative group">
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-3.5 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white transition-all text-slate-900 text-sm placeholder:text-slate-300"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full rounded-xl bg-slate-900 px-4 py-4 text-sm font-bold text-white shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {isLoggingIn ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Authenticating...</>
              ) : (
                <>Sign In to Dashboard <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          {(google_login_enabled || facebook_login_enabled) && (
            <div className="space-y-5 pt-2">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <span className="relative bg-white px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Social Gateway</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {google_login_enabled && (
                  <button 
                    onClick={() => (window.location.href = window.route('auth.google'))}
                    className="flex items-center justify-center gap-3 w-full rounded-xl bg-white border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98] shadow-sm"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="pt-6 text-center space-y-4">
            <p className="text-sm text-slate-500 font-medium">
              New to PixelMaster?{" "}
              <button onClick={() => router.visit("/onboarding")} className="text-primary font-black hover:underline underline-offset-4">
                Register Platform
              </button>
            </p>
            <div className="pt-6 border-t border-slate-50 flex justify-center">
              <Link href="/" className="text-[11px] hover:text-primary transition-colors uppercase tracking-[0.2em] font-black text-slate-400 flex items-center gap-2">
                <ArrowRight className="h-3 w-3 rotate-180" /> Back to Entrance
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-[11px] text-slate-400 font-medium uppercase tracking-widest">
          &copy; 2026 PixelMaster &bull; Security Verified 🛡️
        </p>
      </div>
    </div>
  );
};

export default Auth;
