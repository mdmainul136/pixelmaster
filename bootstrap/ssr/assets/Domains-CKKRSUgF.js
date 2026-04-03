import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { useForm, Head, Link, router } from "@inertiajs/react";
import axios from "axios";
import toast from "react-hot-toast";
const DomainStatusBadge = ({ status }) => {
  const configs = {
    pending: "bg-amber-50 text-amber-600 border-amber-200",
    verified: "bg-green-50 text-green-600 border-green-200",
    failed: "bg-red-50 text-red-600 border-red-200"
  };
  return /* @__PURE__ */ jsx("span", { className: `px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${configs[status] || configs.pending}`, children: status });
};
const DnsRow = ({ type, host, value, note }) => /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
    /* @__PURE__ */ jsx("span", { className: "w-16 text-center py-1 bg-blue-600 text-white text-[10px] font-black rounded uppercase tracking-widest", children: type }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-widest", children: "Host" }),
      /* @__PURE__ */ jsx("code", { className: "text-sm font-black text-slate-900", children: host })
    ] })
  ] }),
  /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col", children: [
    /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-400 uppercase tracking-widest", children: "Value / Points To" }),
    /* @__PURE__ */ jsx("code", { className: "text-xs font-mono bg-white p-2 border border-slate-200 rounded-lg break-all", children: value })
  ] }),
  note && /* @__PURE__ */ jsx("div", { className: "text-[10px] text-slate-400 font-medium italic", children: note })
] });
const HealthReportView = ({ report }) => {
  if (!report) return null;
  return /* @__PURE__ */ jsxs("div", { className: "mt-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-2", children: [
    /* @__PURE__ */ jsx("h4", { className: "text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2", children: "📡 Live Health Diagnostics" }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 p-4 rounded-xl border border-slate-100", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-500 uppercase", children: "Global Propagation" }),
          /* @__PURE__ */ jsx("span", { className: `text-[10px] uppercase font-black px-2 py-0.5 rounded ${report.pointing.status === "ok" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`, children: report.pointing.status })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-700 font-medium mb-3", children: report.pointing.message }),
        report.pointing.propagation && /* @__PURE__ */ jsx("div", { className: "space-y-1", children: Object.entries(report.pointing.propagation).map(([resolver, isPropagated]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold text-slate-600", children: resolver }),
          /* @__PURE__ */ jsx("span", { className: isPropagated ? "text-green-500 font-black" : "text-slate-300", children: isPropagated ? "✓ YES" : "✕ NO" })
        ] }, resolver)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 p-4 rounded-xl border border-slate-100", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-bold text-slate-500 uppercase", children: "SSL Configuration" }),
          /* @__PURE__ */ jsx("span", { className: `text-[10px] uppercase font-black px-2 py-0.5 rounded ${report.ssl.status === "valid" ? "bg-green-100 text-green-700" : report.ssl.status === "provisioning" ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"}`, children: report.ssl.status })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-700 font-medium", children: report.ssl.message }),
        report.ssl.expiry && /* @__PURE__ */ jsxs("p", { className: "text-[10px] text-slate-400 mt-2", children: [
          "Expires: ",
          new Date(report.ssl.expiry).toLocaleDateString()
        ] })
      ] })
    ] })
  ] });
};
function Domains({ tenant, domains, platformIp }) {
  const [activeTab, setActiveTab] = useState("manage");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [purchasing, setPurchasing] = useState(null);
  const [verifying, setVerifying] = useState(null);
  const [oneClicking, setOneClicking] = useState(null);
  const [healthReports, setHealthReports] = useState({});
  const { data, setData, post, processing, errors, reset } = useForm({
    domain: "",
    purpose: "website"
  });
  const handleSearch = async (e) => {
    var _a, _b;
    e.preventDefault();
    if (!searchQuery) return;
    setSearching(true);
    try {
      const res = await axios.get(route("platform.domains.search"), { params: { domain: searchQuery } });
      setSearchResults(res.data.data);
    } catch (err) {
      toast.error(((_b = (_a = err.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Search failed");
    } finally {
      setSearching(false);
    }
  };
  const handleAddDomain = (e) => {
    e.preventDefault();
    post(route("platform.tenants.domains.store", tenant.id), {
      onSuccess: () => {
        reset();
        toast.success("Domain added successfully");
      }
    });
  };
  const runDnsVerification = async (id) => {
    var _a, _b;
    setVerifying(id);
    try {
      const domainObj = domains.find((d) => d.id === id);
      if (domainObj && domainObj.status === "verified") {
        const res = await axios.get(route("platform.tenants.domains.health", [tenant.id, id]));
        if (res.data.success) {
          setHealthReports((prev) => ({ ...prev, [id]: res.data.data.diagnostics }));
          toast.success("Diagnostics refreshed");
        }
      } else {
        const res = await axios.post(route("platform.tenants.domains.verify-dns", [tenant.id, id]));
        if (res.data.success) {
          toast.success(res.data.message || "DNS Verified!");
          setHealthReports((prev) => ({ ...prev, [id]: res.data.diagnostics }));
          router.reload();
        } else {
          toast.error(res.data.message || "Verification Failed");
          if (res.data.diagnostics) {
            setHealthReports((prev) => ({ ...prev, [id]: res.data.diagnostics }));
          }
        }
      }
    } catch (err) {
      toast.error(((_b = (_a = err.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Action failed");
    } finally {
      setVerifying(null);
    }
  };
  const forceVerifyDomain = (id) => {
    if (confirm("Are you sure you want to FORCE verify this domain? This bypasses real DNS checks.")) {
      router.post(route("platform.tenants.domains.verify", [tenant.id, id]), {}, {
        onSuccess: () => toast.success("Domain force verified")
      });
    }
  };
  const oneClickSetup = async (id) => {
    var _a, _b;
    setOneClicking(id);
    try {
      const res = await axios.post(route("platform.tenants.domains.one-click-setup", [tenant.id, id]));
      if (res.data.success) {
        toast.success("DNS Records updated safely");
        router.reload();
      }
    } catch (err) {
      toast.error(((_b = (_a = err.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Auto-setup failed");
    } finally {
      setOneClicking(null);
    }
  };
  const purchaseDomain = async (domain) => {
    var _a, _b;
    if (confirm(`Are you sure you want to purchase ${domain} on behalf of ${tenant.tenant_name}? A pending invoice will be generated.`)) {
      setPurchasing(domain);
      try {
        const res = await axios.post(route("platform.tenants.domains.purchase", tenant.id), {
          domain,
          years: 1
        });
        if (res.data.success) {
          toast.success(res.data.message);
          setActiveTab("manage");
          router.reload();
        }
      } catch (err) {
        toast.error(((_b = (_a = err.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to purchase domain");
      } finally {
        setPurchasing(null);
      }
    }
  };
  const setPrimary = (id) => {
    router.post(route("platform.tenants.domains.primary", [tenant.id, id]), {}, {
      onSuccess: () => toast.success("Primary domain updated")
    });
  };
  const deleteDomain = (id) => {
    if (confirm("Are you sure you want to remove this domain?")) {
      router.delete(route("platform.tenants.domains.destroy", [tenant.id, id]), {
        onSuccess: () => toast.success("Domain removed")
      });
    }
  };
  return /* @__PURE__ */ jsxs(PlatformLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: `Manage Domains - ${tenant.tenant_name}` }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-8", children: [
        /* @__PURE__ */ jsx(
          Link,
          {
            href: route("platform.tenants"),
            className: "p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors",
            children: /* @__PURE__ */ jsx("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M19 12H5M12 19l-7-7 7-7" }) })
          }
        ),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold text-slate-900 flex items-center gap-3", children: [
            "Domain Management",
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium bg-slate-100 text-slate-500 px-3 py-1 rounded-full", children: tenant.tenant_name })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-slate-500 font-medium", children: "Configure custom hostnames, verification, and provision domains." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 border-b border-slate-200 mb-8 pb-4", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setActiveTab("manage"),
            className: `px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "manage" ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-600 hover:bg-slate-50"}`,
            children: "Configured Domains"
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setActiveTab("buy"),
            className: `px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "buy" ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-white text-blue-600 hover:bg-slate-50"}`,
            children: [
              /* @__PURE__ */ jsx("span", { children: "🛒" }),
              " Provision New Domain"
            ]
          }
        )
      ] }),
      activeTab === "manage" && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-3xl border border-slate-200 shadow-sm p-6 overflow-hidden relative", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 p-8 opacity-5 pointer-events-none", children: /* @__PURE__ */ jsxs("svg", { width: "60", height: "60", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [
            /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
            /* @__PURE__ */ jsx("line", { x1: "2", y1: "12", x2: "22", y2: "12" }),
            /* @__PURE__ */ jsx("path", { d: "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" })
          ] }) }),
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-black text-slate-900 uppercase tracking-widest mb-4", children: "Register Existing Domain manually" }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleAddDomain, className: "flex flex-col md:flex-row gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  placeholder: "store.customdomain.com",
                  value: data.domain,
                  onChange: (e) => setData("domain", e.target.value),
                  className: "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                }
              ),
              errors.domain && /* @__PURE__ */ jsx("p", { className: "text-xs text-red-500 mt-1", children: errors.domain })
            ] }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: data.purpose,
                onChange: (e) => setData("purpose", e.target.value),
                className: "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "website", children: "Website" }),
                  /* @__PURE__ */ jsx("option", { value: "api", children: "API / Backend" }),
                  /* @__PURE__ */ jsx("option", { value: "other", children: "Other" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                disabled: processing,
                className: "px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50",
                children: processing ? "Adding..." : "Add Domain"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          domains.map((domain) => /* @__PURE__ */ jsx("div", { className: "bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-blue-500", children: /* @__PURE__ */ jsxs("div", { className: "p-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: `w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner ${domain.status === "verified" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`, children: "🌐" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx("h4", { className: "text-lg font-black text-slate-900 tracking-tight", children: domain.domain }),
                    domain.is_primary && /* @__PURE__ */ jsx("span", { className: "text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-black uppercase tracking-tighter", children: "Primary" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mt-1", children: [
                    /* @__PURE__ */ jsx(DomainStatusBadge, { status: domain.status }),
                    /* @__PURE__ */ jsxs("span", { className: "text-xs text-slate-400 font-medium tracking-tight", children: [
                      "Purpose: ",
                      domain.purpose
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => runDnsVerification(domain.id),
                    disabled: verifying === domain.id,
                    className: "px-4 py-1.5 text-xs font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50",
                    children: [
                      verifying === domain.id && /* @__PURE__ */ jsxs("svg", { className: "animate-spin h-3 w-3 text-white", viewBox: "0 0 24 24", children: [
                        /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none", className: "opacity-25" }),
                        /* @__PURE__ */ jsx("path", { fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z", className: "opacity-75" })
                      ] }),
                      domain.status === "verified" ? "Run Health Check" : "Verify DNS"
                    ]
                  }
                ),
                !domain.is_verified && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => forceVerifyDomain(domain.id),
                    className: "px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-all",
                    children: "Force Verify (Override)"
                  }
                ),
                !domain.is_primary && domain.status === "verified" && /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => setPrimary(domain.id),
                    className: "px-4 py-1.5 text-slate-600 bg-white border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 transition-all shadow-sm",
                    children: "Make Primary"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    onClick: () => deleteDomain(domain.id),
                    className: "p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all",
                    title: "Remove Domain",
                    children: /* @__PURE__ */ jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: /* @__PURE__ */ jsx("path", { d: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" }) })
                  }
                )
              ] })
            ] }),
            domain.status !== "verified" && /* @__PURE__ */ jsxs("div", { className: "space-y-4 animate-in fade-in slide-in-from-top-4 duration-500", children: [
              /* @__PURE__ */ jsxs("div", { className: "p-4 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-4", children: [
                /* @__PURE__ */ jsx("div", { className: "text-xl", children: "⚠️" }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsx("h5", { className: "text-xs font-black text-amber-900 uppercase tracking-widest mb-1", children: "Action Required: Verify Ownership" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-amber-700 font-medium leading-relaxed", children: "To connect your domain, instruct the merchant to add the following DNS records to their domain registrar." }),
                  (domain.is_managed || true) && /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => oneClickSetup(domain.id),
                      disabled: oneClicking === domain.id,
                      className: "mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50",
                      children: oneClicking === domain.id ? "Connecting..." : "🚀 Provision DNS Automatically"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3", children: [
                /* @__PURE__ */ jsx(
                  DnsRow,
                  {
                    type: "TXT",
                    host: domain.domain.split(".").slice(-2).join("."),
                    value: `platform-verification=${domain.verification_token}`,
                    note: "Verifies ownership"
                  }
                ),
                /* @__PURE__ */ jsx(
                  DnsRow,
                  {
                    type: "A",
                    host: "@",
                    value: platformIp || "Loading...",
                    note: "Points root to platform"
                  }
                )
              ] })
            ] }),
            domain.status === "verified" && /* @__PURE__ */ jsxs("div", { className: "space-y-4 mt-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs", children: "🔒" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-[11px] font-black text-slate-900 uppercase tracking-widest", children: "SSL Certificate" }),
                    /* @__PURE__ */ jsx("p", { className: "text-[10px] text-green-600 font-bold", children: "Active & Secured via Let's Encrypt" })
                  ] })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-[10px] font-bold text-slate-400", children: "Managed Automatically" })
              ] }),
              healthReports[domain.id] && /* @__PURE__ */ jsx(HealthReportView, { report: healthReports[domain.id] })
            ] })
          ] }) }, domain.id)),
          domains.length === 0 && /* @__PURE__ */ jsxs("div", { className: "p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm", children: [
            /* @__PURE__ */ jsx("div", { className: "text-4xl mb-4", children: "☁️" }),
            /* @__PURE__ */ jsx("h5", { className: "text-slate-900 font-bold", children: "No custom domains" }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-sm mt-1", children: "This tenant is currently using the default system domain." })
          ] })
        ] })
      ] }),
      activeTab === "buy" && /* @__PURE__ */ jsxs("div", { className: "space-y-8 animate-in fade-in slide-in-from-right-4 duration-500", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white p-8 rounded-3xl border border-blue-100 shadow-xl shadow-blue-500/5 relative overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: "absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 z-0" }),
          /* @__PURE__ */ jsxs("div", { className: "relative z-10", children: [
            /* @__PURE__ */ jsxs("h2", { className: "text-xl font-black text-slate-900 mb-2 flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("span", { className: "w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center", children: "🔍" }),
              "Provision Domain for ",
              tenant.tenant_name
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-slate-500 text-sm mb-6 max-w-lg", children: "Search for a domain and automatically provision it to this tenant. A pending invoice will automatically be generated in their billing center." }),
            /* @__PURE__ */ jsxs("form", { onSubmit: handleSearch, className: "relative max-w-2xl", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: searchQuery,
                  onChange: (e) => setSearchQuery(e.target.value),
                  placeholder: "tenant-awesome-store.com",
                  className: "w-full h-16 bg-white border-2 border-slate-200 rounded-2xl px-6 pr-40 text-lg font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  disabled: searching,
                  className: "absolute right-2 top-2 bottom-2 px-8 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50",
                  children: [
                    searching && /* @__PURE__ */ jsxs("svg", { className: "animate-spin h-4 w-4 text-white", viewBox: "0 0 24 24", children: [
                      /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4", fill: "none", className: "opacity-25" }),
                      /* @__PURE__ */ jsx("path", { fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z", className: "opacity-75" })
                    ] }),
                    searching ? "Checking..." : "Check"
                  ]
                }
              )
            ] })
          ] })
        ] }),
        searchResults && /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsx("div", { className: `p-6 rounded-2xl border-2 transition-all shadow-sm max-w-2xl ${searchResults.main.available ? "border-green-400 bg-green-50/50" : "border-slate-200 bg-white opacity-70"}`, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xl font-black text-slate-900", children: searchResults.main.domain }),
              /* @__PURE__ */ jsx("p", { className: `text-xs font-bold uppercase tracking-widest mt-1 ${searchResults.main.available ? "text-green-600" : "text-slate-400"}`, children: searchResults.main.available ? "✓ Available for Provisioning" : "✕ Already Taken" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxs("div", { className: "text-2xl font-black text-slate-900", children: [
                "$",
                searchResults.main.price,
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-slate-400 uppercase tracking-widest block mt-0.5", children: "/ year" })
              ] }),
              searchResults.main.available && /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => purchaseDomain(searchResults.main.domain),
                  disabled: purchasing === searchResults.main.domain,
                  className: "mt-3 px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:opacity-50",
                  children: purchasing === searchResults.main.domain ? "Provisioning..." : "Provision Now"
                }
              )
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-black text-slate-900 uppercase tracking-widest pt-4", children: "Alternative Suggestions" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: searchResults.suggestions.slice(0, 6).map((s, i) => /* @__PURE__ */ jsxs("div", { className: "p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-400 hover:shadow-md transition-all group", children: [
            /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-slate-900", children: s.domain }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-sm font-black text-slate-500", children: [
                "$",
                s.price
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => purchaseDomain(s.domain),
                  disabled: purchasing === s.domain,
                  className: "px-4 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-100 transition-colors disabled:opacity-50",
                  children: "Buy"
                }
              )
            ] })
          ] }, i)) })
        ] })
      ] })
    ] })
  ] });
}
export {
  Domains as default
};
