import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { Head } from "@inertiajs/react";
const DocSection = ({ title, icon, color, children }) => /* @__PURE__ */ jsxs("div", { className: "bg-white border border-slate-200 rounded-[2.5rem] p-8 mb-8 shadow-sm hover:shadow-xl transition-all duration-500 border-l-4", style: { borderLeftColor: color }, children: [
  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-8", children: [
    /* @__PURE__ */ jsx("div", { className: `w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg`, style: { backgroundColor: color }, children: icon }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-black text-slate-900 tracking-tight leading-tight", children: title }),
      /* @__PURE__ */ jsx("div", { className: "h-1 w-12 bg-slate-100 mt-1 rounded-full" })
    ] })
  ] }),
  /* @__PURE__ */ jsx("div", { className: "prose prose-slate max-w-none prose-sm prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-600 prose-strong:text-slate-900", children })
] });
const SubSection = ({ title, children }) => /* @__PURE__ */ jsxs("div", { className: "mb-8 last:mb-0 bg-slate-50/50 p-6 rounded-3xl border border-slate-100", children: [
  /* @__PURE__ */ jsx("h3", { className: "text-[11px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]", children: title }),
  /* @__PURE__ */ jsx("div", { className: "text-slate-600 leading-relaxed font-medium text-sm", children })
] });
const CodeBlock = ({ code }) => /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
  /* @__PURE__ */ jsx("pre", { className: "bg-slate-900 text-slate-300 p-6 rounded-2xl border border-slate-800 mt-2 text-[12px] font-mono overflow-x-auto shadow-2xl", children: code }),
  /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity", children: "Source: AWS SDK v3" })
] });
const Docs = () => {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Infrastructure Architecture & Ops Manual" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-12 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-4xl font-black text-slate-900 tracking-tighter", children: "Infrastructure & Ops" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 mt-2 font-medium max-w-xl text-sm italic", children: "The ultimate guide to server-side GTM orchestration. Managed Docker Pools, Autonomous Scaling, and Enterprise Kubernetes pods." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxs("div", { className: "px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-100", children: [
        /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) }),
        "Operational Safe"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-5xl", children: [
      /* @__PURE__ */ jsxs(
        DocSection,
        {
          title: "Phase 1: Regional Docker Pooling (VPS)",
          color: "#6366f1",
          icon: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" }) }),
          children: [
            /* @__PURE__ */ jsx(SubSection, { title: "Core Scaling Strategy", children: /* @__PURE__ */ jsxs("p", { children: [
              "Our architecture utilizes a ",
              /* @__PURE__ */ jsx("strong", { children: "Managed VPS Pool" }),
              " approach. Instead of scaling single containers vertically, we distribute tenants across a cluster of nodes. The orchestrator resolves the ",
              /* @__PURE__ */ jsx("code", { children: "least_loaded_node" }),
              " within the tenant's chosen region (Global vs EU)."
            ] }) }),
            /* @__PURE__ */ jsx(SubSection, { title: "sGTM Environment Matrix", children: /* @__PURE__ */ jsxs("table", { className: "min-w-full text-xs text-left border-collapse mt-4", children: [
              /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-slate-200", children: [
                /* @__PURE__ */ jsx("th", { className: "pb-3 pt-0 text-slate-900 font-black uppercase", children: "Variable" }),
                /* @__PURE__ */ jsx("th", { className: "pb-3 pt-0 text-slate-900 font-black uppercase", children: "Tagging Node" }),
                /* @__PURE__ */ jsx("th", { className: "pb-3 pt-0 text-slate-900 font-black uppercase", children: "Preview Node (Max 1)" })
              ] }) }),
              /* @__PURE__ */ jsxs("tbody", { className: "divide-y divide-slate-100", children: [
                /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsx("td", { className: "py-3 font-mono text-indigo-600", children: "CONTAINER_CONFIG" }),
                  /* @__PURE__ */ jsx("td", { className: "py-3", children: "Required" }),
                  /* @__PURE__ */ jsx("td", { className: "py-3", children: "Required" })
                ] }),
                /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsx("td", { className: "py-3 font-mono text-indigo-600", children: "PREVIEW_SERVER_URL" }),
                  /* @__PURE__ */ jsx("td", { className: "py-3", children: "Required (Points to Preview IP)" }),
                  /* @__PURE__ */ jsx("td", { className: "py-3", children: /* @__PURE__ */ jsx("strong", { children: "DO NOT SET" }) })
                ] }),
                /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsx("td", { className: "py-3 font-mono text-indigo-600", children: "RUN_AS_PREVIEW_SERVER" }),
                  /* @__PURE__ */ jsx("td", { className: "py-3", children: "False" }),
                  /* @__PURE__ */ jsx("td", { className: "py-3", children: "True" })
                ] })
              ] })
            ] }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        DocSection,
        {
          title: "Phase 2: Autonomous Scaling Engine",
          color: "#10b981",
          icon: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13 10V3L4 14h7v7l9-11h-7z" }) }),
          children: [
            /* @__PURE__ */ jsx(SubSection, { title: "The 85% Trigger Strategy", children: /* @__PURE__ */ jsxs("p", { children: [
              "The ",
              /* @__PURE__ */ jsx("code", { children: "ScaleUpRegionJob" }),
              " is triggered when the aggregate capacity utilization of a region exceeds 85%. This ensures we always have a 15% buffer for sudden traffic spikes before a new node joins the cluster."
            ] }) }),
            /* @__PURE__ */ jsxs(SubSection, { title: "AWS SDK Integration (PHP)", children: [
              /* @__PURE__ */ jsx("p", { children: "To enable direct AWS scaling, configure your sGTM Scaling Webhook to point to your internal AWS bridge or use the SDK directly:" }),
              /* @__PURE__ */ jsx(CodeBlock, { code: `// Example: Dispatching AWS ASG Update
use Aws\\AutoScaling\\AutoScalingClient;

$client = new AutoScalingClient([
    'region' => $node->region,
    'version' => 'latest'
]);

$client->updateAutoScalingGroup([
    'AutoScalingGroupName' => 'sGTM-Node-Pool-' . $region,
    'DesiredCapacity' => $currentCapacity + 1,
]);` })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        DocSection,
        {
          title: "Phase 3: Hybrid Kubernetes (Enterprise)",
          color: "#0ea5e9",
          icon: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
          children: [
            /* @__PURE__ */ jsxs(SubSection, { title: "EPS-Based Scaling (Recommended)", children: [
              /* @__PURE__ */ jsxs("p", { children: [
                "For Kubernetes (EKS), we recommend scaling using ",
                /* @__PURE__ */ jsx("strong", { children: "Custom Metrics" }),
                " (CloudWatch Metrics Adapter) specifically targeting ",
                /* @__PURE__ */ jsx("strong", { children: "Events Per Second (EPS)" }),
                ". Scaling by CPU/RAM alone is often too late for sGTM spikes."
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mt-4 p-4 bg-sky-50 rounded-2xl border border-sky-100 text-sky-800 italic text-[11px]", children: [
                "Target Threshold: ",
                /* @__PURE__ */ jsx("strong", { children: "500 EPS per Pod" }),
                ". When global EPS / Pods > 500, HPA will scale out immediately."
              ] })
            ] }),
            /* @__PURE__ */ jsx(SubSection, { title: "Resource Pinning Best Practices", children: /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-5 space-y-2", children: [
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "CPU:" }),
                " 1 vCPU (Requests) / 2 vCPU (Limits)."
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Memory:" }),
                " 1GB RAM (Requests) / 3GB RAM (Limits)."
              ] }),
              /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx("strong", { children: "Isolation:" }),
                " Use Namespaces or dedicated Node Groups for sGTM to avoid Taint contamination."
              ] })
            ] }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mt-12 p-8 bg-slate-900 rounded-[3rem] text-white flex items-center justify-between shadow-2xl overflow-hidden relative", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-xl font-black tracking-tight mb-2 uppercase italic", children: "Status: System Operational" }),
          /* @__PURE__ */ jsxs("p", { className: "text-slate-400 text-sm max-w-md font-medium", children: [
            "The sGTM orchestrator is currently operating in Phase 2a (Webhook Scaling). To enable Phase 2b (AWS Direct SDK), update your ",
            /* @__PURE__ */ jsx("code", { children: "TRACKING_ORCHESTRATOR_MODE" }),
            " to ",
            /* @__PURE__ */ jsx("code", { children: "direct_sdk" }),
            " in the platform settings."
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/20 to-transparent pointer-events-none" }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
          /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-full bg-indigo-500 animate-ping opacity-20 absolute" }),
          /* @__PURE__ */ jsx("div", { className: "h-12 w-12 rounded-full border-2 border-indigo-500 flex items-center justify-center relative bg-slate-900 shadow-lg shadow-indigo-500/50", children: /* @__PURE__ */ jsx("div", { className: "h-4 w-4 rounded-full bg-white animate-pulse" }) })
        ] })
      ] })
    ] })
  ] });
};
Docs.layout = (page) => /* @__PURE__ */ jsx(PlatformLayout, { children: page });
export {
  Docs as default
};
