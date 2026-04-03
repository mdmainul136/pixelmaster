import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function TwoFactorChallenge() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('platform.auth.2fa.submit'));
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6">
            <Head title="Two-Factor Authentication" />
            
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-10 border border-slate-200">
                <div className="text-center mb-10">
                    <div className="text-3xl font-black tracking-tighter text-slate-900 mb-2">2FA VERIFICATION</div>
                    <p className="text-slate-500 font-medium">Please enter your 6-digit authenticator code</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2 text-center">Security Code</label>
                        <input
                            type="text"
                            value={data.code}
                            onChange={e => setData('code', e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center text-2xl font-black tracking-[0.5em]"
                            placeholder="000000"
                            maxLength="6"
                            autoFocus
                        />
                        {errors.code && <div className="text-red-500 text-xs mt-1 font-bold text-center">{errors.code}</div>}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 transform active:scale-[0.98]"
                    >
                        {processing ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400 font-medium italic">Open your authenticator app to get the code</p>
                </div>
            </div>
        </div>
    );
}
