import React from "react";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, ScrollText, ShieldCheck } from "lucide-react";
import { Button } from "@Tenant/components/ui/button";

export default function LegalPage({ title, content }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-6 lg:py-24 font-sans">
      <Head title={`${title} | PixelMaster`} />

      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-12">
           <Button 
            variant="ghost" 
            className="text-slate-500 hover:text-emerald-600 transition-colors p-0 flex items-center gap-2 group"
            onClick={() => window.history.back()}
           >
             <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
             Back
           </Button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 lg:p-16 mb-8 overflow-hidden relative">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
             {title.includes('Terms') ? (
               <ScrollText className="h-64 w-64 text-slate-900" />
             ) : (
               <ShieldCheck className="h-64 w-64 text-slate-900" />
             )}
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider mb-6">
              Legal Documents
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
              {title}
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed max-w-2xl">
              Please read these {title.toLowerCase()} carefully before using PixelMaster platforms and services.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-10 lg:p-16">
          <div 
            className="prose prose-slate max-w-none 
              prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tight
              prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg
              prose-li:text-slate-600 prose-li:text-lg
              prose-strong:text-slate-900 prose-strong:font-bold
              prose-a:text-emerald-600 prose-a:underline hover:prose-a:text-emerald-700
            "
            dangerouslySetInnerHTML={{ __html: content }}
          />

          <div className="mt-16 pt-12 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-sm italic mb-8">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Link href="/onboarding">
                 <Button className="bg-[#10B981] hover:bg-[#059669] text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-emerald-200">
                    Get Started Now
                 </Button>
               </Link>
               <Link href="/">
                 <Button variant="ghost" className="text-slate-500 font-bold h-12 px-8 rounded-xl">
                    Back to Home
                 </Button>
               </Link>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center">
           <p className="text-slate-400 text-[13px] font-medium">
             Questions about our documents? <a href="mailto:support@pixelmaster.com" className="text-slate-600 underline">Contact our legal team.</a>
           </p>
        </div>
      </div>
    </div>
  );
}
