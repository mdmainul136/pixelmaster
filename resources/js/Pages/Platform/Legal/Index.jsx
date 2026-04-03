import React, { useState, useEffect } from "react";
import PlatformLayout from "@/Layouts/PlatformLayout";
import { Head, useForm } from "@inertiajs/react";
import { Save, Eye, FileText, ShieldCheck, HelpCircle, Loader2 } from "lucide-react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

export default function LegalDocsPage({ legal }) {
    const { data, setData, post, processing } = useForm({
        terms_of_use: legal.terms_of_use || "",
        privacy_policy: legal.privacy_policy || "",
    });

    const [activeTab, setActiveTab] = useState("terms");
    const [previewMode, setPreviewMode] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("platform.legal.update"));
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'color': [] }, { 'background': [] }],
            ['link', 'clean'],
        ],
    };

    return (
        <PlatformLayout title="Legal Documents Management">
            <Head title="Legal Documents Management" />

            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full translate-x-16 -translate-y-16 opacity-50" />
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Legal Documents</h2>
                        <p className="text-slate-500 flex items-center gap-2">
                            Manage your platform's Terms and Privacy agreements using rich text formatting.
                            <HelpCircle className="h-4 w-4 text-slate-300 cursor-help" title="These pages will be publicly accessible at /terms and /privacy-notice" />
                        </p>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${previewMode ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            {previewMode ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {previewMode ? "Edit Mode" : "Preview Mode"}
                        </button>
                        
                        <button
                            onClick={handleSubmit}
                            disabled={processing}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-200 disabled:opacity-50 active:scale-95"
                        >
                             {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                             Save Documents
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation Sidebar */}
                    <div className="lg:col-span-1 space-y-3">
                        <button
                            onClick={() => setActiveTab("terms")}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all border ${activeTab === "terms" ? 'bg-white border-blue-200 text-blue-600 shadow-md ring-4 ring-blue-50' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100'}`}
                        >
                            <FileText className={`h-5 w-5 ${activeTab === "terms" ? "text-blue-600" : "text-slate-400"}`} />
                            Terms of Use
                        </button>
                        <button
                            onClick={() => setActiveTab("privacy")}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all border ${activeTab === "privacy" ? 'bg-white border-blue-200 text-blue-600 shadow-md ring-4 ring-blue-50' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100'}`}
                        >
                            <ShieldCheck className={`h-5 w-5 ${activeTab === "privacy" ? "text-blue-600" : "text-slate-400"}`} />
                            Privacy Policy
                        </button>
                    </div>

                    {/* Editor / Preview Area */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                            <div className="px-8 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">
                                    {activeTab === "terms" ? "Editing Terms of Use" : "Editing Privacy Policy"}
                                </span>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto">
                                {previewMode ? (
                                    <div className="p-12 prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight animate-in zoom-in-95 duration-200">
                                        <div dangerouslySetInnerHTML={{ __html: activeTab === "terms" ? data.terms_of_use : data.privacy_policy }} />
                                        {((activeTab === "terms" && !data.terms_of_use) || (activeTab === "privacy" && !data.privacy_policy)) && (
                                            <p className="text-slate-400 italic text-center py-20">No content available for preview.</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col pt-2 bg-white">
                                        <ReactQuill
                                            theme="snow"
                                            value={activeTab === "terms" ? data.terms_of_use : data.privacy_policy}
                                            onChange={(val) => setData(activeTab === "terms" ? "terms_of_use" : "privacy_policy", val)}
                                            modules={modules}
                                            className="flex-1 flex flex-col editor-custom h-[600px]"
                                            placeholder={`Start writing the ${activeTab === "terms" ? "terms of use" : "privacy policy"} here...`}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .editor-custom .ql-container {
                    border: none !important;
                    font-family: 'Inter', sans-serif;
                    font-size: 15px;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .editor-custom .ql-editor {
                    padding: 40px;
                    flex: 1;
                    min-height: 500px;
                }
                .editor-custom .ql-toolbar {
                    border: none !important;
                    border-bottom: 1px solid #f1f5f9 !important;
                    padding: 15px 30px !important;
                    background: #fff;
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }
                .ql-snow .ql-picker.ql-header .ql-picker-label::before {
                    content: 'Text Style' !important;
                }
                .ql-editor h1 { font-weight: 900; letter-spacing: -0.025em; }
                .ql-editor p { line-height: 1.6; }
            `}} />
        </PlatformLayout>
    );
}
