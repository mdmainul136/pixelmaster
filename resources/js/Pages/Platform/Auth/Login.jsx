import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post('/platform/login');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6">
            <Head title="Platform Login" />
            
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-10 border border-slate-200">
                <div className="text-center mb-10">
                    <div className="text-3xl font-black tracking-tighter text-slate-900 mb-2">PLATFORM OS</div>
                    <p className="text-slate-500 font-medium">Authentication Required</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Email Address</label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="admin@platform.com"
                        />
                        {errors.email && <div className="text-red-500 text-xs mt-1 font-bold">{errors.email}</div>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2">Password</label>
                        <input
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="••••••••"
                        />
                        {errors.password && <div className="text-red-500 text-xs mt-1 font-bold">{errors.password}</div>}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 transform active:scale-[0.98]"
                    >
                        {processing ? 'Authorizing...' : 'Enter Console'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400 font-medium italic">Restricted Access Dashboard</p>
                </div>
            </div>
        </div>
    );
}
