import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Head } from "@inertiajs/react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { Database, Lightbulb, TrendingUp, Shield, Package, BarChart3, AlertTriangle, HardDrive, Zap, Server, Globe, Info, CheckCircle2, X, ChevronDown, ChevronRight } from "lucide-react";
const Section = ({ id, icon: Icon, color, title, badge, subtitle, children }) => /* @__PURE__ */ jsxs("div", { id, className: "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden scroll-mt-6", children: [
  /* @__PURE__ */ jsxs("div", { className: `flex items-start gap-4 px-8 py-6 border-b border-white/10 ${color}`, children: [
    /* @__PURE__ */ jsx("div", { className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 mt-0.5", children: /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6 text-white" }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-white", children: title }),
        badge && /* @__PURE__ */ jsx("span", { className: "rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider", children: badge })
      ] }),
      subtitle && /* @__PURE__ */ jsx("p", { className: "text-sm text-white/60 mt-0.5", children: subtitle })
    ] })
  ] }),
  /* @__PURE__ */ jsx("div", { className: "px-8 py-7 text-slate-300", children })
] });
const Callout = ({ icon: Icon = Info, color = "blue", title, children }) => {
  const palette = { blue: "bg-blue-500/10 border-blue-500/20", amber: "bg-amber-500/10 border-amber-500/20", green: "bg-emerald-500/10 border-emerald-500/20", red: "bg-red-500/10 border-red-500/20" };
  const ic = { blue: "text-blue-400", amber: "text-amber-400", green: "text-emerald-400", red: "text-red-400" };
  return /* @__PURE__ */ jsxs("div", { className: `rounded-xl border p-4 flex gap-3 ${palette[color]}`, children: [
    /* @__PURE__ */ jsx(Icon, { className: `h-4 w-4 shrink-0 mt-0.5 ${ic[color]}` }),
    /* @__PURE__ */ jsxs("div", { children: [
      title && /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-white mb-1", children: title }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 leading-relaxed", children })
    ] })
  ] });
};
const CompareRow = ({ label, single, multi, winner }) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-white/5 hover:bg-white/3 transition-colors", children: [
  /* @__PURE__ */ jsx("td", { className: "py-3 pr-4 text-xs font-medium text-slate-300", children: label }),
  /* @__PURE__ */ jsx("td", { className: "py-3 pr-4", children: /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-1.5 text-xs ${winner === "single" ? "text-emerald-400" : "text-red-400"}`, children: [
    winner === "single" ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 shrink-0" }) : /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5 shrink-0" }),
    /* @__PURE__ */ jsx("span", { children: single })
  ] }) }),
  /* @__PURE__ */ jsx("td", { className: "py-3", children: /* @__PURE__ */ jsxs("div", { className: `flex items-center gap-1.5 text-xs ${winner === "multi" ? "text-emerald-400" : winner === "both" ? "text-emerald-400" : "text-slate-400"}`, children: [
    winner === "multi" || winner === "both" ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 shrink-0" }) : /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5 shrink-0" }),
    /* @__PURE__ */ jsx("span", { children: multi })
  ] }) })
] });
const ReasonCard = ({ num, icon: Icon, color, iconBg, title, subtitle, simple, points, code }) => /* @__PURE__ */ jsxs("div", { className: `rounded-2xl border overflow-hidden ${color}`, children: [
  /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 p-6 pb-4", children: [
    /* @__PURE__ */ jsx("div", { className: `flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBg}`, children: /* @__PURE__ */ jsx(Icon, { className: "h-6 w-6 text-white" }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mb-0.5", children: /* @__PURE__ */ jsxs("span", { className: "text-[10px] font-bold text-slate-500 uppercase tracking-widest", children: [
        "কারণ ",
        num
      ] }) }),
      /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-white", children: title }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: subtitle })
    ] })
  ] }),
  /* @__PURE__ */ jsxs("div", { className: "px-6 pb-6 space-y-3", children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 leading-relaxed", children: simple }),
    points && /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: points.map((p, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
      /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-300 leading-relaxed", children: p })
    ] }, i)) }),
    code && /* @__PURE__ */ jsx("div", { className: "rounded-lg bg-black/30 border border-white/10 px-4 py-3 font-mono text-[10px] text-emerald-400 leading-relaxed whitespace-pre", children: code })
  ] })
] });
const AccordionItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "border border-white/10 rounded-xl overflow-hidden", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setOpen(!open),
        className: "w-full flex items-center justify-between px-6 py-4 text-left text-sm font-semibold text-white hover:bg-white/5 transition-colors",
        children: [
          /* @__PURE__ */ jsx("span", { children: q }),
          open ? /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 text-slate-400 shrink-0" }) : /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 text-slate-400 shrink-0" })
        ]
      }
    ),
    open && /* @__PURE__ */ jsx("div", { className: "px-6 pb-5 border-t border-white/10 pt-4", children: /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 leading-relaxed", children: a }) })
  ] });
};
function MultiDbDocsPage() {
  const toc = [
    { id: "why", label: "🤔 কেন Multi-DB বাধ্যতামূলক?" },
    { id: "compare", label: "⚖️ Single vs Multi — তুলনা" },
    { id: "reason1", label: "📈 ১. স্কেলেবিলিটি" },
    { id: "reason2", label: "🔒 ২. GDPR/CCPA Privacy" },
    { id: "reason3", label: "💾 ৩. Backup ও Export" },
    { id: "reason4", label: "💳 ৪. কোটা ও বিলিং" },
    { id: "reason5", label: "🧩 ৫. Custom Modules" },
    { id: "howworks", label: "⚙️ কীভাবে কাজ করে?" },
    { id: "realworld", label: "🌍 Real-World প্রমাণ" },
    { id: "faq", label: "❓ FAQ" }
  ];
  return /* @__PURE__ */ jsxs(PlatformLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Multi-DB Architecture | PixelMaster Platform" }),
    /* @__PURE__ */ jsx("div", { className: "-m-4 sm:-m-6 lg:-m-8 min-h-full", style: { background: "hsl(222,47%,8%)" }, children: /* @__PURE__ */ jsxs("div", { className: "p-4 sm:p-6 lg:p-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[hsl(222,47%,11%)] to-slate-900 border border-white/10 p-10 mb-8 shadow-2xl", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0 opacity-10",
            style: { backgroundImage: "radial-gradient(circle at 15% 60%, hsl(270,70%,55%) 0%, transparent 50%), radial-gradient(circle at 85% 20%, hsl(200,84%,45%) 0%, transparent 40%)" }
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
          /* @__PURE__ */ jsxs("div", { className: "inline-flex items-center gap-2 rounded-full bg-purple-500/20 border border-purple-500/30 px-4 py-1.5 mb-5", children: [
            /* @__PURE__ */ jsx(Database, { className: "h-3.5 w-3.5 text-purple-400" }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold text-purple-400 uppercase tracking-wider", children: "Architecture Deep Dive · Multi-Tenant DB" })
          ] }),
          /* @__PURE__ */ jsxs("h1", { className: "text-4xl font-black text-white tracking-tight mb-3 leading-tight", children: [
            "কেন Tenant-wise Multi-DB",
            /* @__PURE__ */ jsx("br", {}),
            /* @__PURE__ */ jsx("span", { className: "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400", children: "PixelMaster-এর জন্য বাধ্যতামূলক?" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-400 text-base max-w-2xl leading-relaxed mb-6", children: 'Stape, Vercel, Shopify-এর মতো Enterprise SaaS প্ল্যাটফর্মের স্ট্যান্ডার্ড আর্কিটেকচার। কেন এটা শুধু "ভালো অপশন" নয়, বরং Scale করতে হলে এর কোনো বিকল্প নেই — পাঁচটি সলিড কারণসহ।' }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg", children: [
            { v: "∞", l: "স্কেল সীমাহীন", c: "text-purple-400" },
            { v: "100%", l: "Data Isolation", c: "text-blue-400" },
            { v: "GDPR", l: "Compliant by design", c: "text-emerald-400" },
            { v: "0", l: "Cross-tenant leak risk", c: "text-red-400" }
          ].map(({ v, l, c }) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/10 bg-white/5 p-4 text-center", children: [
            /* @__PURE__ */ jsx("p", { className: `text-2xl font-black ${c}`, children: v }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500 mt-1 leading-tight", children: l })
          ] }, l)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 xl:grid-cols-[230px_1fr] gap-8", children: [
        /* @__PURE__ */ jsx("div", { className: "hidden xl:block", children: /* @__PURE__ */ jsxs("div", { className: "sticky top-8 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4", children: "এই পেজে" }),
          /* @__PURE__ */ jsx("nav", { className: "space-y-0.5", children: toc.map((item) => /* @__PURE__ */ jsx(
            "a",
            {
              href: `#${item.id}`,
              className: "block rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/10 hover:text-white transition-colors",
              children: item.label
            },
            item.id
          )) })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6 min-w-0", children: [
          /* @__PURE__ */ jsxs(
            Section,
            {
              id: "why",
              icon: Lightbulb,
              title: "কেন Multi-DB 'বাধ্যতামূলক'?",
              badge: "Core Architecture",
              subtitle: "সহজ ভাষায় বোঝা যাক",
              color: "bg-gradient-to-r from-purple-600/30 to-blue-600/20",
              children: [
                /* @__PURE__ */ jsxs(Callout, { color: "blue", title: "সহজ উদাহরণ", children: [
                  "ভাবুন একটি বড় অ্যাপার্টমেন্ট বিল্ডিং। ",
                  /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Single Database = একটাই বড় হল ঘর" }),
                  " যেখানে সবাই থাকে। যদি একজন জোরে চিৎকার করে বা কোনো সমস্যা তৈরি করে, সবাই ক্ষতিগ্রস্ত।",
                  /* @__PURE__ */ jsx("br", {}),
                  /* @__PURE__ */ jsx("br", {}),
                  /* @__PURE__ */ jsx("strong", { className: "text-white", children: "Multi-DB = প্রতিটা ফ্ল্যাট আলাদা, লক করা।" }),
                  " একটি ফ্ল্যাটে সমস্যা হলে পাশের ফ্ল্যাট কেউ জানেই না।"
                ] }),
                /* @__PURE__ */ jsx("div", { className: "mt-5 grid md:grid-cols-3 gap-4", children: [
                  { icon: TrendingUp, color: "text-orange-400", title: "প্রতিদিন কোটি ইভেন্ট", body: "একটি মাঝারি ক্লায়েন্টের সাইটে প্রতিদিন ১০ লাখ পেজভিউ হলে মাসে ৩০ কোটি রো। ১০ ক্লায়েন্ট মানে ৩০০ কোটি রো একটি টেবিলে — MySQL এর পক্ষে সম্পূর্ণ অসম্ভব।" },
                  { icon: Shield, color: "text-blue-400", title: "আইন মানার চাপ", body: "Facebook CAPI ও GA4-এর জন্য কাস্টমারের Email, Phone, IP প্রসেস হচ্ছে। GDPR অনুযায়ী এই ডাটা physically isolated না থাকলে €২০ Million পর্যন্ত জরিমানা।" },
                  { icon: Package, color: "text-purple-400", title: "ক্লায়েন্ট-নির্দিষ্ট কাস্টমাইজেশন", body: "কেউ শুধু Tracking মডিউল কিনেছে, কেউ POS ও Website Builder-ও কিনেছে। আলাদা DB মানে আলাদা schema — অপ্রয়োজনীয় টেবিল নেই।" }
                ].map(({ icon: Icon, color, title, body }) => /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-white/10 bg-white/5 p-4", children: [
                  /* @__PURE__ */ jsx(Icon, { className: `h-5 w-5 mb-2 ${color}` }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-white mb-1.5", children: title }),
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-400 leading-relaxed", children: body })
                ] }, title)) })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Section,
            {
              id: "compare",
              icon: BarChart3,
              title: "Single DB vs Multi-DB — পূর্ণ তুলনা",
              subtitle: "কোথায় কে এগিয়ে, কোথায় কে পিছিয়ে",
              color: "bg-gradient-to-r from-slate-600/30 to-slate-500/20",
              children: [
                /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-xs", children: [
                  /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-white/10", children: [
                    /* @__PURE__ */ jsx("th", { className: "text-left py-3 pr-4 text-slate-500 font-bold uppercase tracking-wider", children: "বিষয়" }),
                    /* @__PURE__ */ jsx("th", { className: "text-left py-3 pr-4 text-slate-400 font-bold", children: "❌ Single Database" }),
                    /* @__PURE__ */ jsx("th", { className: "text-left py-3 text-emerald-400 font-bold", children: "✅ Multi-DB (Tenant-wise)" })
                  ] }) }),
                  /* @__PURE__ */ jsxs("tbody", { children: [
                    /* @__PURE__ */ jsx(CompareRow, { label: "১ কোটি ইভেন্টের পরে পারফরম্যান্স", single: "ভয়াবহ ধীর, টাইমআউট", multi: "আগের মতোই দ্রুত", winner: "multi" }),
                    /* @__PURE__ */ jsx(CompareRow, { label: "একজনের লোড অন্যকে প্রভাবিত করে?", single: "হ্যাঁ, সবাই ক্ষতিগ্রস্ত", multi: "না, পুরোপুরি বিচ্ছিন্ন", winner: "multi" }),
                    /* @__PURE__ */ jsx(CompareRow, { label: "GDPR Physical Isolation", single: "নেই — শেয়ার্ড টেবিল", multi: "আছে — আলাদা DB", winner: "multi" }),
                    /* @__PURE__ */ jsx(CompareRow, { label: "একজনের ডাটা এক্সপোর্ট করা", single: "লাখ রো ফিল্টার করতে হবে", multi: "একটি mysqldump কমান্ড", winner: "multi" }),
                    /* @__PURE__ */ jsx(CompareRow, { label: "Storage Quota সঠিকভাবে মাপা", single: "প্রায় অসম্ভব", multi: "SELECT data_length...", winner: "multi" }),
                    /* @__PURE__ */ jsx(CompareRow, { label: "হ্যাক হলে ক্ষতির পরিসর", single: "সব ক্লায়েন্টের ডাটা ফাঁস", multi: "শুধু সেই একটি DB", winner: "multi" }),
                    /* @__PURE__ */ jsx(CompareRow, { label: "মডিউল-নির্দিষ্ট Schema", single: "সবার জন্য একই টেবিল", multi: "প্রয়োজন অনুযায়ী টেবিল", winner: "multi" }),
                    /* @__PURE__ */ jsx(CompareRow, { label: "ডেভেলপমেন্ট জটিলতা", single: "সহজ শুরু", multi: "শুরুতে একটু বেশি", winner: "single" }),
                    /* @__PURE__ */ jsx(CompareRow, { label: "Deadlock / Lock Contention", single: "খুব বেশি ঝুঁকি", multi: "শূন্য — আলাদা DB", winner: "multi" }),
                    /* @__PURE__ */ jsx(CompareRow, { label: "একজন ক্লায়েন্ট সাসপেন্ড করা", single: "রো-লেভেল ফিল্টার লাগবে", multi: "DB বন্ধ করলেই হলো", winner: "multi" }),
                    /* @__PURE__ */ jsx(CompareRow, { label: "১+ বছর পরে ব্যবহারযোগ্যতা", single: "প্রায় অসম্ভব", multi: "সহজেই পারফরম্যান্ট", winner: "multi" })
                  ] })
                ] }) }),
                /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxs(Callout, { color: "amber", icon: AlertTriangle, title: "একটি গুরুত্বপূর্ণ সত্য", children: [
                  "Single Database-এ শুরু করা সহজ। কিন্তু যখন Scale করার সময় আসে, তখন Multi-DB-এ মাইগ্রেট করা প্রায় অসম্ভব — লাখ লাখ রো রিঅর্গানাইজ করতে হবে, downtime হবে, ডাটা হারানোর ঝুঁকি থাকবে।",
                  /* @__PURE__ */ jsx("strong", { className: "text-white", children: " শুরু থেকে সঠিক আর্কিটেকচার বেছে নেওয়াই বুদ্ধিমানের কাজ।" })
                ] }) })
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", { id: "reason1", className: "scroll-mt-6", children: /* @__PURE__ */ jsx(
            ReasonCard,
            {
              num: "১",
              icon: TrendingUp,
              color: "border-orange-500/20 bg-orange-500/5",
              iconBg: "bg-gradient-to-br from-orange-500 to-amber-600",
              title: "High Volume Tracking Data — স্কেলেবিলিটি",
              subtitle: "যখন মিলিয়ন ইভেন্ট আসে, Single DB বুঝতেই পারে না কী করবে",
              simple: "Tracking Container-এ প্রতিদিন লক্ষ লক্ষ ইভেন্ট (Pageview, Add to Cart, Purchase) ফায়ার হয়। যদি সব ইউজারের ট্র্যাকিং লগ একটি Single DB-এর একটি টেবিলে রাখা হয়, কয়েক সপ্তাহের মধ্যেই সেই টেবিলে Billions of Rows জমবে এবং পুরো প্ল্যাটফর্ম Crash করবে।",
              points: [
                "প্রতি ক্লায়েন্টের DB আলাদা — একজনের হেভি লোড অন্যজনকে স্পর্শ করে না",
                "Kafka Consumer tenant_id দিয়ে সঠিক DB-তে switch করে — কোনো Lock Contention নেই",
                "ClickHouse-এও আলাদা Database: tracking_{tenant_id} — Analytics Query সরাসরি ওই DB-এই যায়",
                "MySQL Partition by month + আলাদা DB = পুরোনো ডাটা archive করা তুলনামূলকভাবে সহজ"
              ],
              code: `-- একটি Single DB-তে ১ বছর পরে কী হয়:
SELECT COUNT(*) FROM tracking_event_logs;
-- ফলাফল: 4,320,000,000 rows (৪০০ কোটি++)
-- Query Time: 45 seconds ← সার্ভার ক্র্যাশের পথে

-- Multi-DB-তে একই পরিমাণ ডাটায় (১০ ক্লায়েন্ট):
USE tenant_acme_store;
SELECT COUNT(*) FROM tracking_event_logs;
-- ফলাফল: 432,000,000 rows (শুধু ওই ক্লায়েন্টের)
-- Query Time: 1.2 seconds ← কারণ ৯০% ডাটা নেই`
            }
          ) }),
          /* @__PURE__ */ jsx("div", { id: "reason2", className: "scroll-mt-6", children: /* @__PURE__ */ jsx(
            ReasonCard,
            {
              num: "২",
              icon: Shield,
              color: "border-blue-500/20 bg-blue-500/5",
              iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
              title: "Strict Data Privacy ও Compliance — GDPR / CCPA",
              subtitle: "আইন ভাঙলে €২০ মিলিয়ন জরিমানা — এটা কোনো জোকস নয়",
              simple: "Facebook CAPI ও GA4-এর জন্য কাস্টমারের Email, Phone Number, IP Address, আচরণগত ডাটা প্রসেস হচ্ছে। ইউরোপের GDPR বা আমেরিকার CCPA অনুযায়ী এই First-Party Tracking ডাটা physically isolated থাকতে হবে।",
              points: [
                "Single DB: একটি SQL Injection বা misconfigured query-তে সব ক্লায়েন্টের সব কাস্টমার ডাটা ফাঁস",
                "Multi-DB: হ্যাকার একটি DB ক্র্যাক করলেও বাকি সব DB সম্পূর্ণ নিরাপদ",
                "GDPR Right to Erasure: tracking:purge-consent শুধু ওই একটি DB-তে DELETE চালায়",
                "ডাটা Residency Requirements: EU ক্লায়েন্টের DB EU Server-এ, Asia ক্লায়েন্টের DB Asia Server-এ রাখা সম্ভব",
                "Audit Trail আলাদা — একজনের compliance report অন্যজনের ডাটা স্পর্শ করে না"
              ],
              code: `// GDPR: ব্যবহারকারী ডাটা মুছতে বললে কী হয়?

// ❌ Single DB — সব ক্লায়েন্টের table-এ WHERE ফিল্টার করতে হয়
DELETE FROM tracking_event_logs
  WHERE user_id = 'user_123'  -- কিন্তু কোন ক্লায়েন্টের ইউজার?
  AND tenant_id = 'acme-store'; -- এই কলামই থাকে না অনেক সময়

// ✅ Multi-DB — PixelMaster এ যেভাবে হয়:
tenancy()->initialize('acme-store');
// শুধু acme-store-এর DB-তে disconnect হয় user_123
DB::table('tracking_event_logs')
  ->where('user_id', 'user_123')->delete();
tenancy()->end(); // → পরের ক্লায়েন্টের জন্য ready`
            }
          ) }),
          /* @__PURE__ */ jsx("div", { id: "reason3", className: "scroll-mt-6", children: /* @__PURE__ */ jsx(
            ReasonCard,
            {
              num: "৩",
              icon: HardDrive,
              color: "border-emerald-500/20 bg-emerald-500/5",
              iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
              title: "Client-Specific Backup ও Data Export",
              subtitle: "ক্লায়েন্ট চলে গেলে তার ডাটা ফেরত দিন — এক কমান্ডে",
              simple: "ধরুন একজন বড় ক্লায়েন্ট subscription cancel করে তার পুরো tracking history, container config এবং ইভেন্ট লগ অন্য provider-এ নিয়ে যেতে চাইছে। Single DB-তে এটা প্রায় অসম্ভব কারণ লাখ লাখ রো থেকে শুধু তার ডাটা আলাদা করতে হবে।",
              points: [
                "Single DB: যদি ১ কোটি রোর টেবিলে ১০ ক্লায়েন্টের ডাটা মিশানো থাকে, ফিল্টার করা ঘণ্টার কাজ",
                "Multi-DB: একটি mysqldump কমান্ডে পুরো DB export — ৩০ সেকেন্ড",
                "ক্লায়েন্টকে তার নিজের DB dump দেওয়া যায় — তারা যেকোনো সার্ভারে ইমপোর্ট করতে পারবে",
                "Backup schedule আলাদা — বড় ক্লায়েন্টের hourly backup, ছোটটার daily backup করা সম্ভব"
              ],
              code: `# ❌ Single DB Export — nightmare scenario
mysqldump main_db --where="tenant_id='acme-store'" \\
  -t tracking_event_logs > acme_events.sql
# সময় লাগবে: ৪-৫ ঘণ্টা (১ কোটি রো filter)
# Database lock হবে এই সময়, সবাই ক্ষতিগ্রস্ত

# ✅ Multi-DB Export — PixelMaster style
mysqldump tenant_acme_store > acme_full_backup.sql
# সময় লাগবে: ২০-৩০ সেকেন্ড
# অন্য কোনো ক্লায়েন্টের কোনো প্রভাব নেই`
            }
          ) }),
          /* @__PURE__ */ jsx("div", { id: "reason4", className: "scroll-mt-6", children: /* @__PURE__ */ jsx(
            ReasonCard,
            {
              num: "৪",
              icon: Zap,
              color: "border-yellow-500/20 bg-yellow-500/5",
              iconBg: "bg-gradient-to-br from-yellow-500 to-orange-500",
              title: "Database Quota ও Billing — সঠিক স্টোরেজ মাপা",
              subtitle: "Starter=২GB, Pro=১০GB — কীভাবে মাপবেন যদি সব এক DB-তে থাকে?",
              simple: "PixelMaster-এ Starter, Growth ও Pro প্যাকেজে আলাদা storage limit আছে। Multi-DB ছাড়া এই quota সঠিকভাবে মাপাই সম্ভব না। একটি shared table-এ WHERE tenant_id দিয়ে size মাপা MySQL-এ support করে না।",
              points: [
                "প্রতি ক্লায়েন্টের DB size MySQL এর information_schema থেকে directly পড়া যায়",
                "Dashboard-এ real-time দেখানো যায়: 'আপনার ২GB এর মধ্যে ১.৪GB ব্যবহার হয়েছে'",
                "Quota পূর্ণ হলে ওই DB-তে নতুন ইভেন্ট write বন্ধ করা যায় — অন্যরা প্রভাবিত হয় না",
                "sgtm:prune-logs কমান্ড tier অনুযায়ী পুরনো রো মুছে quota নিয়ন্ত্রণ করে"
              ],
              code: `-- ✅ Multi-DB: একটি ক্লায়েন্টের exact storage usage
SELECT
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
FROM information_schema.TABLES
WHERE table_schema = 'tenant_acme_store';
-- ফলাফল: 1423.87 MB (সরাসরি, সঠিক)

-- ❌ Single DB: এটা কাজ করে না
SELECT SUM(LENGTH(event_data)) / 1024 / 1024
FROM tracking_event_logs
WHERE tenant_id = 'acme-store';
-- ফলাফল: শুধু একটি কলামের size, index ধরে না
-- এবং এই query টি ১ কোটি row-এ ১ মিনিট সময় নেয়`
            }
          ) }),
          /* @__PURE__ */ jsx("div", { id: "reason5", className: "scroll-mt-6", children: /* @__PURE__ */ jsx(
            ReasonCard,
            {
              num: "৫",
              icon: Package,
              color: "border-purple-500/20 bg-purple-500/5",
              iconBg: "bg-gradient-to-br from-purple-500 to-pink-600",
              title: "Custom Modules Marketplace — শুধু দরকারি টেবিলই থাকবে",
              subtitle: "যে মডিউল কিনেছে, সে মডিউলের টেবিলই তার DB-তে",
              simple: "PixelMaster-এ Modules/Marketplace সিস্টেম আছে। কেউ শুধু Tracking নিচ্ছে, কেউ আবার POS, Website Builder বা IOR Marketplace-ও কিনছে। Single DB-তে সবার জন্য সব টেবিল তৈরি করা হয়, যেগুলোর বেশিরভাগই কেউ ব্যবহারই করে না।",
              points: [
                "ক্লায়েন্ট-A শুধু Tracking কিনেছে: তার DB-তে শুধু tracking_* টেবিল",
                "ক্লায়েন্ট-B সব মডিউল কিনেছে: তার DB-তে tracking_* + pos_* + shop_* সব টেবিল",
                "Selective migration: শুধু purchased modules-এর migration file চালানো হয়",
                "DB size অনেক ছোট থাকে — অপ্রয়োজনীয় ১০০+ টেবিল নেই",
                "নতুন মডিউল কিনলে শুধু সেই ক্লায়েন্টের DB-তে নতুন migration চালানো হয়"
              ],
              code: `// PixelMaster-এ Tenant Onboarding:
// শুধু কেনা মডিউলই migrate হয়

// Starter Plan → শুধু Core + Tracking
php artisan tenants:migrate --tenants=acme-store \\
  --path=database/migrations/core \\
  --path=database/migrations/tracking

// Pro Plan → সব মডিউল
php artisan tenants:migrate --tenants=bigclient \\
  --path=database/migrations/core \\
  --path=database/migrations/tracking \\
  --path=database/migrations/pos \\
  --path=database/migrations/marketplace

// ফলাফল: bigclient-এর DB-তে ১৫০+ টেবিল
// ফলাফল: acme-store-এর DB-তে মাত্র ৪০ টেবিল`
            }
          ) }),
          /* @__PURE__ */ jsxs(
            Section,
            {
              id: "howworks",
              icon: Server,
              title: "PixelMaster-এ কীভাবে এটা কাজ করে?",
              badge: "Implementation",
              subtitle: "Stancl Tenancy + Kafka + ClickHouse — তিন স্তরের isolation",
              color: "bg-gradient-to-r from-cyan-600/30 to-blue-500/20",
              children: [
                /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-3 gap-4 mb-5", children: [
                  {
                    layer: "Layer 1 — MySQL",
                    color: "border-cyan-500/30",
                    icon: Database,
                    iconColor: "text-cyan-400",
                    how: "Stancl/Tenancy প্রতিটি HTTP request বা Kafka message-এ tenant_id পড়ে এবং database connection automatically switch করে। কোনো manual query-তে tenant filter লিখতে হয় না।",
                    example: "tenancy()->initialize('acme-store')\n// MySQL: now using tenant_acme_store.*"
                  },
                  {
                    layer: "Layer 2 — ClickHouse",
                    color: "border-yellow-500/30",
                    icon: BarChart3,
                    iconColor: "text-yellow-400",
                    how: "Analytics query সরাসরি tracking_{tenant_id} database-এ যায়। ClickHouseService::getActiveDatabase() dynamically tenant DB নির্ধারণ করে।",
                    example: "Database: tracking_acme_store\nTable: event_logs (MergeTree)"
                  },
                  {
                    layer: "Layer 3 — Redis",
                    color: "border-red-500/30",
                    icon: Zap,
                    iconColor: "text-red-400",
                    how: "Cache key-গুলো tenant_id দিয়ে namespace করা। এক ক্লায়েন্টের dedup cache বা billing counter অন্যজনের সাথে কখনো conflict হয় না।",
                    example: "tracking_dedup:acme-store:evt_xyz\ntracking_usage:acme-store:2026-03-30"
                  }
                ].map(({ layer, color, icon: Icon, iconColor, how, example }) => /* @__PURE__ */ jsxs("div", { className: `rounded-xl border ${color} bg-white/5 p-4`, children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                    /* @__PURE__ */ jsx(Icon, { className: `h-4 w-4 ${iconColor}` }),
                    /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-white", children: layer })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-400 leading-relaxed mb-3", children: how }),
                  /* @__PURE__ */ jsx("div", { className: "rounded-lg bg-black/30 border border-white/10 px-3 py-2 font-mono text-[10px] text-emerald-400 whitespace-pre", children: example })
                ] }, layer)) }),
                /* @__PURE__ */ jsxs(Callout, { color: "green", title: "Stancl Tenancy — আমাদের Multi-DB মেশিন", children: [
                  "PixelMaster ব্যবহার করে ",
                  /* @__PURE__ */ jsx("strong", { className: "text-white", children: "stancl/tenancy" }),
                  " Laravel package। এটা automatically প্রতিটি Tenant অনুযায়ী MySQL connection switch করে। Kafka Consumer daemon-এ ",
                  /* @__PURE__ */ jsx("code", { className: "text-white mx-1", children: "tenancy()->initialize($tenant_id)" }),
                  " একটাই লাইন — এরপর থেকে সব query সরাসরি ওই ক্লায়েন্টের private database-এ যায়।",
                  /* @__PURE__ */ jsxs("code", { className: "text-white mx-1", children: [
                    "finally ",
                    "{",
                    " tenancy()->end(); ",
                    "}"
                  ] }),
                  "নিশ্চিত করে যে context কখনো পরের message-এ leak করে না।"
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            Section,
            {
              id: "realworld",
              icon: Globe,
              title: "Real-World প্রমাণ — বড় কোম্পানিরা কী করে?",
              subtitle: "Stape, Vercel, Shopify, Heroku — সবাই Multi-DB pattern ব্যবহার করে",
              color: "bg-gradient-to-r from-indigo-600/30 to-violet-500/20",
              children: [
                /* @__PURE__ */ jsx("div", { className: "grid md:grid-cols-2 gap-4", children: [
                  {
                    company: "Stape.io",
                    what: "Server-Side GTM SaaS",
                    how: "প্রতিটি ক্লায়েন্টের জন্য আলাদা Docker container এবং আলাদা database। একজনের container crash হলে বাকিরা সম্পূর্ণ অপ্রভাবিত।",
                    color: "border-orange-500/20 bg-orange-500/5",
                    badge: "Direct Competitor",
                    badgeColor: "bg-orange-500/20 text-orange-400"
                  },
                  {
                    company: "Shopify",
                    what: "E-commerce SaaS Platform",
                    how: "প্রতিটি শপের জন্য isolated database (Shopify Pods architecture)। একটি বড় শপের ট্রাফিক spike ছোট শপের loading speed প্রভাবিত করে না।",
                    color: "border-green-500/20 bg-green-500/5",
                    badge: "Industry Standard",
                    badgeColor: "bg-green-500/20 text-green-400"
                  },
                  {
                    company: "Vercel",
                    what: "Cloud Platform (Edge Functions)",
                    how: "প্রতিটি deployment environment সম্পূর্ণ isolated। একজনের deployment fail হলে অন্যজনের production site প্রভাবিত হয় না।",
                    color: "border-slate-500/20 bg-slate-500/5",
                    badge: "Infrastructure",
                    badgeColor: "bg-slate-500/20 text-slate-400"
                  },
                  {
                    company: "Heroku",
                    what: "App Hosting Platform",
                    how: "Heroku Postgres-এ প্রতিটি app-এর আলাদা database দেওয়া হয়। Shared database tier শুধুমাত্র hobby project-এর জন্য।",
                    color: "border-purple-500/20 bg-purple-500/5",
                    badge: "PaaS Leader",
                    badgeColor: "bg-purple-500/20 text-purple-400"
                  }
                ].map(({ company, what, how, color, badge, badgeColor }) => /* @__PURE__ */ jsxs("div", { className: `rounded-xl border ${color} p-5`, children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2 mb-3", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-white", children: company }),
                      /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-500", children: what })
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: `text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${badgeColor}`, children: badge })
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 leading-relaxed", children: how })
                ] }, company)) }),
                /* @__PURE__ */ jsxs("div", { className: "mt-5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-5", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-white mb-2", children: "PixelMaster এই কোম্পানিগুলোর মতোই সঠিক পথে আছে" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-400 leading-relaxed", children: [
                    "stancl/tenancy + Kafka tenant isolation + ClickHouse per-tenant database + Redis namespaced keys — এই চার স্তরের isolation একসাথে করলেই তৈরি হয় enterprise-grade tracking infrastructure। এই architecture একবার ঠিকভাবে সেটআপ করলে ১০ ক্লায়েন্ট বা ১০,০০০ ক্লায়েন্ট —",
                    /* @__PURE__ */ jsx("strong", { className: "text-white", children: " কোনো code change ছাড়াই scale করে।" })
                  ] })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            Section,
            {
              id: "faq",
              icon: Info,
              title: "সাধারণ প্রশ্ন ও উত্তর",
              subtitle: "যে প্রশ্নগুলো সবার মনে আসে",
              color: "bg-gradient-to-r from-slate-600/30 to-slate-500/20",
              children: /* @__PURE__ */ jsx("div", { className: "space-y-2", children: [
                {
                  q: "Multi-DB আর্কিটেকচার কি setup করা কঠিন?",
                  a: "শুরুতে একটু বেশি কোড লিখতে হয়, এটা সত্য। কিন্তু stancl/tenancy প্যাকেজ এই জটিলতার বেশিরভাগটাই handle করে। একবার configured হলে নতুন ক্লায়েন্ট onboard করা শুধু একটি artisan command: php artisan tenants:migrate। Developer experience-এর দিক থেকে Single DB এর তুলনায় পার্থক্য কমই।"
                },
                {
                  q: "কতজন ক্লায়েন্ট হলে Multi-DB প্রয়োজন হয়?",
                  a: "Tracking platform-এর জন্য উত্তর হলো: Day 1 থেকেই। কারণ tracking data exponentially বাড়ে। আজকে ১০ ক্লায়েন্ট, কিন্তু ৬ মাস পরে ১০০ ক্লায়েন্টের ডাটা একটি টেবিলে থাকলে যে পরিমাণ mess তৈরি হবে, মাইগ্রেশন প্রায় অসম্ভব হয়ে যাবে। শুরু থেকেই Multi-DB করাটাই একমাত্র সঠিক সিদ্ধান্ত।"
                },
                {
                  q: "কি প্রতিটি ক্লায়েন্টের জন্য আলাদা MySQL server লাগবে?",
                  a: "না। একটি MySQL server-এ অনেক database তৈরি করা সম্ভব এবং বেশিরভাগ ক্ষেত্রে এটাই করা হয়। পার্থক্য হলো প্রতিটি tenant-এর জন্য আলাদা MySQL DATABASE (namespace), আলাদা server নয়। খুব বড় client হলে তখন dedicated server বিবেচনা করা যায়।"
                },
                {
                  q: "Kafka Consumer কি সব tenant-এর জন্য একই consumer দিয়ে কাজ করে?",
                  a: "হ্যাঁ। একটি Kafka consumer daemon সব tenant handle করে। প্রতিটি message-এ tenant_id থাকে। Consumer সেটা পড়ে tenancy()->initialize(tenant_id) call করে — এতে MySQL connection সঠিক tenant DB-তে switch হয়। Message process করার পরে tenancy()->end() call হয় — পরের message-এর জন্য clean state।"
                },
                {
                  q: "ClickHouse-এও কি আলাদা database দরকার?",
                  a: "হ্যাঁ, এবং এটা অত্যন্ত গুরুত্বপূর্ণ। ClickHouse-এ analytics query চলে বিলিয়ন রো-এর উপর। যদি সব tenant-এর ডাটা একটি ClickHouse table-এ থাকে এবং WHERE tenant_id = ? দিয়ে filter করতে হয়, তাহলে প্রতিটি analytics query পুরো table scan করবে। আলাদা database: tracking_{tenant_id} থাকলে query শুধু ওই tenant-এর partition-এ যায়।"
                },
                {
                  q: "এই আর্কিটেকচার maintain করা কি কঠিন?",
                  a: "Long-term-এ Multi-DB আসলে সহজ। কারণ: (১) একটি tenant-এর সমস্যা debug করা সহজ — শুধু ওই DB দেখলেই হবে, (২) schema পরিবর্তন করা সহজ — একটি tenants:migrate command সব tenant update করে, (৩) একটি tenant suspend করা সহজ — শুধু তার DB connection বন্ধ করলেই হয়। Single DB-তে এই কাজগুলো অনেক বেশি জটিল।"
                }
              ].map((item) => /* @__PURE__ */ jsx(AccordionItem, { ...item }, item.q)) })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-8 text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-4xl mb-4", children: "🏆" }),
            /* @__PURE__ */ jsx("h3", { className: "text-xl font-black text-white mb-3", children: "এককথায় সারমর্ম" }),
            /* @__PURE__ */ jsxs("div", { className: "grid md:grid-cols-2 gap-4 text-left mt-5 mb-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-red-500/20 bg-red-500/5 p-4", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-red-400 mb-2", children: "❌ Single DB (সব ইউজার একসাথে)" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 leading-relaxed", children: "ছোট প্রজেক্ট, ব্লগ বা সিম্পল টুলের জন্য ঠিক আছে। কিন্তু tracking system-এর ক্ষেত্রে মাসখানেকের মধ্যেই scalability ভেঙে পড়বে। GDPR risk বিশাল। ডাটা export প্রায় অসম্ভব।" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-emerald-400 mb-2", children: "✅ Multi-DB (Tenant-wise)" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 leading-relaxed", children: "Stape, Vercel, Shopify-এর মতো বড় Enterprise SaaS-এর standard pattern। Setup করতে একটু সময় লাগে, কিন্তু সিস্টেম ১০ বছর চললেও slow হবে না এবং data leak-এর কোনো chance নেই।" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto", children: [
              "PixelMaster-এ এই আর্কিটেকচার সম্পূর্ণরূপে implemented —",
              /* @__PURE__ */ jsxs("strong", { className: "text-white", children: [
                " MySQL (stancl/tenancy) + ClickHouse (tracking_",
                "{tenant_id}",
                ") + Redis (namespaced keys)"
              ] }),
              "। এটাই PixelMaster-কে একটি true enterprise-grade platform করে তোলে।"
            ] })
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  MultiDbDocsPage as default
};
