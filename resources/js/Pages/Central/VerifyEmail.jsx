import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { Button } from "@Tenant/components/ui/button";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'), {
            onSuccess: () => toast.success('Verification link sent!'),
        });
    };

    const verificationLinkSent = status === 'verification-link-sent';

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100 selection:text-indigo-700">
            <Head title="Verify Email - Platform Hub" />
            <Toaster position="top-right" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-8">
                    <div className="bg-indigo-600 p-3 rounded-2xl shadow-xl shadow-indigo-100 rotate-3">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                </div>
                <h2 className="text-center text-3xl font-black text-slate-900 tracking-tight">
                    Check your inbox
                </h2>
                <p className="mt-2 text-center text-sm text-slate-500 font-medium max-w-xs mx-auto">
                    We've sent a verification link to your email. Please click it to activate your account.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-10 px-6 shadow-2xl shadow-slate-100 sm:rounded-3xl border border-slate-100 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

                    <div className="relative z-10">
                        {verificationLinkSent && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-emerald-900">Link Sent!</p>
                                    <p className="text-xs text-emerald-700 font-medium mt-0.5">A new verification link has been sent to your email address.</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <Button
                                disabled={processing}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                            >
                                {processing ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    "Resend Verification Email"
                                )}
                            </Button>

                            <div className="flex items-center justify-center pt-2">
                                <Link
                                    href={route('central.logout')}
                                    method="post"
                                    as="button"
                                    className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 group"
                                >
                                    <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
                                    Sign out and try another email
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Need help? Contact support@yourplatform.com
                    </p>
                </div>
            </div>
        </div>
    );
}
