import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { Button } from "@Tenant/components/ui/button";
import { Input } from "@Tenant/components/ui/input";
import { Checkbox } from "@Tenant/components/ui/checkbox";
import { Card, CardContent } from "@Tenant/components/ui/card";
import { Mail, Facebook, Globe, Chrome, Loader2, Building2, ArrowRight, Lock } from "lucide-react";

export default function Onboarding({ google_login_enabled, facebook_login_enabled }) {
  const [isAgency, setIsAgency] = useState(false);
  
  const { data, setData, post, processing, errors } = useForm({
    adminEmail: "",
    password: "", // Added password field
    agency_name: "",
    server_location: "global",
    marketing_consent: false,
    terms_consent: false,
    is_agency: false,
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure is_agency is synced with our local state before sending
    post(window.route("central.register.submit"), {
      onSuccess: () => (window.location.href = window.route("verification.notice")),
    });
  };

  const toggleAgency = (mode: boolean) => {
    setIsAgency(mode);
    setData("is_agency", mode);
  };

  const canProceed = data.adminEmail && data.password && data.terms_consent && (!isAgency || data.agency_name);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F0FDFB] flex items-center justify-center p-6 font-sans">
        <Card className="max-w-md w-full border-none shadow-2xl rounded-[32px] p-10 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <Mail className="h-10 w-10 text-emerald-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 font-mono">Check your email</h1>
          <p className="text-slate-600 leading-relaxed font-sans mt-4">
            We've sent a verification link to <span className="font-bold text-emerald-600">{data.adminEmail}</span>. 
            Please click the link to verify your account and set your password.
          </p>
          <div className="pt-6">
            <Button 
              variant="outline" 
              className="w-full rounded-xl py-6 border-slate-200 text-slate-500 font-bold" 
              onClick={() => (window.location.href = "/")}
            >
              Back to home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 lg:p-12 relative overflow-hidden">
      <Head title={`${isAgency ? 'Agency' : ''} Sign Up | PixelMaster`} />
      
      {/* Dynamic Background Decoration */}
      <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full bg-emerald-400/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      {/* Header Links */}
      <div className="mb-10 text-center space-y-4 z-10">
         <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
           {isAgency ? "Agency Portal" : "Join PixelMaster"}
         </h1>
         <p className="text-[15px] text-slate-500 font-medium">
           Already orchestrated? <Link href="/login" className="text-primary font-black hover:underline underline-offset-4">Sign in.</Link> 
           {!isAgency ? (
             <span className="ml-2 border-l border-slate-200 pl-4 py-1 inline-block font-sans">Running an agency? <button onClick={() => toggleAgency(true)} className="text-emerald-600 underline font-bold hover:text-emerald-700 decoration-2">Partner with us.</button></span>
           ) : (
             <span className="ml-2 border-l border-slate-200 pl-4 py-1 inline-block font-sans">Regular user? <button onClick={() => toggleAgency(false)} className="text-emerald-600 underline font-bold hover:text-emerald-700 decoration-2">Switch back.</button></span>
           )}
         </p>
      </div>

      {/* Signup Container */}
      <div className="max-w-xl w-full z-10">
        <Card className="w-full border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[40px] overflow-hidden bg-white">
          <CardContent className="p-10 lg:p-16 space-y-10">
            <form onSubmit={handleSubmit} className="space-y-10">
              
              <div className="space-y-6">
                {/* Agency Name Field (Only in Agency Mode) */}
                {isAgency && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="text-[11px] uppercase tracking-widest font-black text-slate-400 ml-1">Agency Brand Name</label>
                    <div className="relative group">
                      <Input 
                        type="text"
                        placeholder="e.g. PixelFlow Agency" 
                        value={data.agency_name}
                        onChange={(e) => setData("agency_name", e.target.value)}
                        className="h-14 px-12 bg-slate-50/50 border-slate-200 focus:border-primary focus:bg-white rounded-xl placeholder:text-slate-300 transition-all text-slate-900 shadow-none font-sans"
                      />
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                      {errors.agency_name && <p className="text-xs text-red-500 mt-2 font-medium">{errors.agency_name}</p>}
                    </div>
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest font-black text-slate-400 ml-1">Administrative Email</label>
                  <div className="relative group">
                    <Input 
                      type="email"
                      placeholder="admin@yourdomain.com" 
                      value={data.adminEmail}
                      onChange={(e) => setData("adminEmail", e.target.value)}
                      className="h-14 px-12 bg-slate-50/50 border-slate-200 focus:border-primary focus:bg-white rounded-xl placeholder:text-slate-300 transition-all text-slate-900 shadow-none font-sans"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-primary transition-colors" />
                    {errors.adminEmail && <p className="text-xs text-red-500 mt-2 font-medium font-sans">{errors.adminEmail}</p>}
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-widest font-black text-slate-400 ml-1">Security Password</label>
                  <div className="relative group">
                    <Input 
                      type="password"
                      placeholder="••••••••" 
                      value={data.password}
                      onChange={(e) => setData("password", e.target.value)}
                      className="h-14 px-12 bg-slate-50/50 border-slate-200 focus:border-primary focus:bg-white rounded-xl placeholder:text-slate-300 transition-all text-slate-900 shadow-none font-sans"
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 group-focus-within:text-primary transition-colors" />
                    {errors.password && <p className="text-xs text-red-500 mt-2 font-medium font-sans">{errors.password}</p>}
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-4 text-slate-500 text-[13px] px-2 bg-slate-50 p-6 rounded-2xl border border-slate-100 font-sans">
                <div className="flex items-start gap-4">
                  <Checkbox 
                    id="terms" 
                    checked={data.terms_consent}
                    onCheckedChange={(checked) => setData("terms_consent", !!checked)}
                    className="mt-1 border-slate-300 h-5 w-5 data-[state=checked]:bg-slate-900 data-[state=checked]:border-none"
                  />
                  <label htmlFor="terms" className="leading-5 cursor-pointer font-medium">
                    I agree to the <Link href={window.route('central.terms')} className="underline text-primary font-black hover:text-blue-700">Terms of Service</Link> and <Link href={window.route('central.privacy')} className="underline text-primary font-black hover:text-blue-700">Privacy Policy</Link>
                  </label>
                </div>
                <div className="flex items-start gap-4">
                  <Checkbox 
                    id="marketing" 
                    checked={data.marketing_consent}
                    onCheckedChange={(checked) => setData("marketing_consent", !!checked)}
                    className="mt-1 border-slate-300 h-5 w-5 data-[state=checked]:bg-slate-900 data-[state=checked]:border-none"
                  />
                  <label htmlFor="marketing" className="leading-5 cursor-pointer font-medium">
                    Send me security alerts and marketing updates (Optional)
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                <Button 
                  type="submit"
                  disabled={processing || !canProceed}
                  className="w-full h-16 bg-primary hover:bg-blue-700 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-primary/20 active:scale-[0.98] disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  Initialize Platform
                </Button>

                {google_login_enabled && (
                  <Button 
                    variant="outline"
                    type="button"
                    onClick={() => (window.location.href = window.route('auth.google'))}
                    className="w-full h-16 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-base rounded-2xl flex items-center justify-center gap-4 transition-all active:scale-[0.98] shadow-sm font-sans"
                  >
                    <Chrome className="h-5 w-5" />
                    Sign up with Google
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center mt-12 text-[11px] text-slate-400 font-medium uppercase tracking-widest italic">
          Powering 5,000+ server-side tracking containers worldwide.
        </p>
      </div>
    </div>
  );
}
