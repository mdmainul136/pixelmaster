import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { P as PlatformLayout } from "./PlatformLayout-BejqQ2vO.js";
import { useForm, Head } from "@inertiajs/react";
const FormSection = ({ title, description, children }) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b border-gray-100 last:border-0", children: [
  /* @__PURE__ */ jsxs("div", { className: "md:col-span-1", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-slate-900", children: title }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mt-1 leading-relaxed", children: description })
  ] }),
  /* @__PURE__ */ jsx("div", { className: "md:col-span-2 space-y-4", children })
] });
const InputGroup = ({ label, children }) => /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
  /* @__PURE__ */ jsx("label", { className: "text-[11px] font-bold text-slate-600 uppercase tracking-wider", children: label }),
  children
] });
function Index({ settings, twoFactorEnabled }) {
  const [activeTab, setActiveTab] = useState("general");
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [confirming2fa, setConfirming2fa] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const { data, setData, post, processing, errors } = useForm({
    // Identity
    app_name: (settings == null ? void 0 : settings.app_name) || "",
    app_url: (settings == null ? void 0 : settings.app_url) || "",
    support_email: (settings == null ? void 0 : settings.support_email) || "",
    // System State
    maintenance_mode: (settings == null ? void 0 : settings.maintenance_mode) || false,
    registration_enabled: (settings == null ? void 0 : settings.registration_enabled) || false,
    default_plan: (settings == null ? void 0 : settings.default_plan) || "starter",
    // Mail
    mail_mailer: (settings == null ? void 0 : settings.mail_mailer) || "smtp",
    mail_host: (settings == null ? void 0 : settings.mail_host) || "",
    mail_port: (settings == null ? void 0 : settings.mail_port) || 587,
    mail_username: (settings == null ? void 0 : settings.mail_username) || "",
    mail_password: (settings == null ? void 0 : settings.mail_password) || "",
    mail_encryption: (settings == null ? void 0 : settings.mail_encryption) || "tls",
    mail_from_address: (settings == null ? void 0 : settings.mail_from_address) || "",
    mail_from_name: (settings == null ? void 0 : settings.mail_from_name) || "",
    // Services (Payments & AI)
    stripe_active: (settings == null ? void 0 : settings.stripe_active) ?? true,
    stripe_mode: (settings == null ? void 0 : settings.stripe_mode) || "sandbox",
    stripe_key: (settings == null ? void 0 : settings.stripe_key) || "",
    stripe_secret: (settings == null ? void 0 : settings.stripe_secret) || "",
    paypal_active: (settings == null ? void 0 : settings.paypal_active) ?? false,
    paypal_mode: (settings == null ? void 0 : settings.paypal_mode) || "sandbox",
    paypal_client_id: (settings == null ? void 0 : settings.paypal_client_id) || "",
    paypal_secret: (settings == null ? void 0 : settings.paypal_secret) || "",
    razorpay_active: (settings == null ? void 0 : settings.razorpay_active) ?? false,
    razorpay_mode: (settings == null ? void 0 : settings.razorpay_mode) || "sandbox",
    razorpay_key: (settings == null ? void 0 : settings.razorpay_key) || "",
    razorpay_secret: (settings == null ? void 0 : settings.razorpay_secret) || "",
    sslcommerz_active: (settings == null ? void 0 : settings.sslcommerz_active) ?? false,
    sslcommerz_mode: (settings == null ? void 0 : settings.sslcommerz_mode) || "sandbox",
    sslcommerz_store_id: (settings == null ? void 0 : settings.sslcommerz_store_id) || "",
    sslcommerz_store_pw: (settings == null ? void 0 : settings.sslcommerz_store_pw) || "",
    openai_api_key: (settings == null ? void 0 : settings.openai_api_key) || "",
    openai_model: (settings == null ? void 0 : settings.openai_model) || "gpt-4o-mini",
    // Namecheap
    namecheap_api_key: (settings == null ? void 0 : settings.namecheap_api_key) || "",
    namecheap_username: (settings == null ? void 0 : settings.namecheap_username) || "",
    namecheap_client_ip: (settings == null ? void 0 : settings.namecheap_client_ip) || "",
    // Social Authentication
    google_login_enabled: (settings == null ? void 0 : settings.google_login_enabled) ?? false,
    google_client_id: (settings == null ? void 0 : settings.google_client_id) || "",
    google_client_secret: (settings == null ? void 0 : settings.google_client_secret) || "",
    google_redirect_url: (settings == null ? void 0 : settings.google_redirect_url) || "",
    facebook_login_enabled: (settings == null ? void 0 : settings.facebook_login_enabled) ?? false,
    facebook_client_id: (settings == null ? void 0 : settings.facebook_client_id) || "",
    facebook_client_secret: (settings == null ? void 0 : settings.facebook_client_secret) || "",
    facebook_redirect_url: (settings == null ? void 0 : settings.facebook_redirect_url) || ""
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("platform.settings.update"), {
      preserveScroll: true
    });
  };
  const enable2fa = () => {
    axios.post(route("platform.security.2fa.enable")).then((response) => {
      setQrCode(response.data.qr_code);
      setSecret(response.data.secret);
      setConfirming2fa(true);
    });
  };
  const confirm2fa = (e) => {
    e.preventDefault();
    setError(null);
    post(route("platform.security.2fa.confirm"), {
      data: { code },
      onSuccess: () => {
        setConfirming2fa(false);
        setQrCode(null);
        setSecret(null);
        setCode("");
      },
      onError: (err) => {
        setError(err.code || "Invalid code. Please try again.");
      }
    });
  };
  const disable2fa = () => {
    if (confirm("Are you sure you want to disable two-factor authentication?")) {
      post(route("platform.security.2fa.disable"));
    }
  };
  const tabs = [
    { id: "general", label: "General & Apps", icon: /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
      /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" }),
      /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" })
    ] }) },
    { id: "email", label: "Email Server", icon: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }) },
    { id: "services", label: "External Services", icon: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13 10V3L4 14h7v7l9-11h-7z" }) }) },
    { id: "payments", label: "Payment Gateways", icon: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" }) }) },
    { id: "domains", label: "Domain Settings", icon: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" }) }) },
    { id: "quotas", label: "Quota Limits", icon: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" }) }) },
    { id: "webhooks", label: "Webhooks", icon: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" }) }) },
    { id: "security", label: "Security & 2FA", icon: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) }) },
    { id: "social_auth", label: "Social Auth", icon: /* @__PURE__ */ jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3a10.003 10.003 0 00-6.254 2.25l-.094.058m15.46 4.512A9.986 9.986 0 0121 12c0 4.255-2.651 7.89-6.383 9.311m0-11.233A5.002 5.002 0 0115 12a5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5 5 5 0 015 5z" }) }) }
  ];
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Head, { title: "System Settings - Platform Admin" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex justify-between items-center", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-slate-900 tracking-tight", children: "System Environment" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-slate-500 mt-0.5", children: "Manage core configurations, SMTP, and external API integrations." })
      ] }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: handleSubmit,
          disabled: processing,
          className: "bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 inline-flex items-center gap-2 active:scale-95",
          children: [
            processing && /* @__PURE__ */ jsxs("svg", { className: "animate-spin h-4 w-4 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [
              /* @__PURE__ */ jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
              /* @__PURE__ */ jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
            ] }),
            processing ? "Saving Changes..." : "Save Settings"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[600px] flex flex-col md:flex-row", children: [
      /* @__PURE__ */ jsxs("div", { className: "w-full md:w-64 bg-slate-50 border-r border-gray-200 p-4 space-y-1", children: [
        tabs.map((tab) => /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setActiveTab(tab.id),
            className: `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id ? "bg-white text-slate-900 shadow-sm border border-gray-200" : "text-slate-500 hover:bg-white/50 hover:text-slate-700"}`,
            children: [
              /* @__PURE__ */ jsx("span", { className: activeTab === tab.id ? "text-slate-900" : "text-slate-400", children: tab.icon }),
              tab.label
            ]
          },
          tab.id
        )),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 pt-8 border-t border-gray-200 px-3", children: [
          /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4", children: "System Uptime" }),
          /* @__PURE__ */ jsxs("div", { className: "bg-green-50 rounded-lg p-3 border border-green-100", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" }),
              /* @__PURE__ */ jsxs("span", { className: "text-[11px] font-bold text-green-700", children: [
                "VERSION ",
                settings.version
              ] })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-green-600/70 mt-1 font-medium", children: "All systems operational" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 p-6 md:p-10 overflow-y-auto", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
        activeTab === "general" && /* @__PURE__ */ jsxs("div", { className: "animate-in fade-in slide-in-from-right-2 duration-300", children: [
          /* @__PURE__ */ jsxs(
            FormSection,
            {
              title: "Platform Identity",
              description: "Global branding and access URLs that appear across the platform.",
              children: [
                /* @__PURE__ */ jsxs(InputGroup, { label: "Application Name", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "text",
                      value: data.app_name,
                      onChange: (e) => setData("app_name", e.target.value),
                      className: `w-full bg-slate-50 text-slate-900 border ${errors.app_name ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-slate-900"} rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:ring-1 outline-none transition-all`
                    }
                  ),
                  errors.app_name && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-red-600 font-medium mt-1", children: errors.app_name })
                ] }),
                /* @__PURE__ */ jsxs(InputGroup, { label: "Application URL", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "url",
                      value: data.app_url,
                      onChange: (e) => setData("app_url", e.target.value),
                      className: `w-full bg-slate-50 text-slate-900 border ${errors.app_url ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-slate-900"} rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:ring-1 outline-none transition-all`
                    }
                  ),
                  errors.app_url && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-red-600 font-medium mt-1", children: errors.app_url })
                ] }),
                /* @__PURE__ */ jsxs(InputGroup, { label: "Support email", children: [
                  /* @__PURE__ */ jsx(
                    "input",
                    {
                      type: "email",
                      value: data.support_email,
                      onChange: (e) => setData("support_email", e.target.value),
                      className: `w-full bg-slate-50 text-slate-900 border ${errors.support_email ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-slate-900"} rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:ring-1 outline-none transition-all`
                    }
                  ),
                  errors.support_email && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-red-600 font-medium mt-1", children: errors.support_email })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            FormSection,
            {
              title: "Registration & Access",
              description: "Control how new tenants join the platform and the default experience they receive.",
              children: [
                /* @__PURE__ */ jsx(InputGroup, { label: "Default Plan for New Tenants", children: /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: data.default_plan,
                    onChange: (e) => setData("default_plan", e.target.value),
                    className: `w-full bg-slate-50 text-slate-900 border ${errors.default_plan ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-slate-900"} rounded-lg px-3 py-2.5 text-sm focus:bg-white focus:ring-1 outline-none transition-all appearance-none`,
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "starter", children: "Starter (Free)" }),
                      /* @__PURE__ */ jsx("option", { value: "growth", children: "Growth (Paid)" }),
                      /* @__PURE__ */ jsx("option", { value: "pro", children: "Pro (Unlimited)" })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-gray-100", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-slate-800", children: "Public Registration" }),
                    /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-500", children: "Allow new organizations to sign up without an invite." })
                  ] }),
                  /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
                    /* @__PURE__ */ jsx("input", { type: "checkbox", className: "sr-only peer", checked: data.registration_enabled, onChange: (e) => setData("registration_enabled", e.target.checked) }),
                    /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900" })
                  ] })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            FormSection,
            {
              title: "System Control",
              description: "High-level platform state management.",
              children: /* @__PURE__ */ jsxs("div", { className: `flex items-center justify-between p-4 rounded-xl border transition-all ${data.maintenance_mode ? "bg-red-50 border-red-100" : "bg-slate-50 border-gray-100"}`, children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: `text-sm font-bold ${data.maintenance_mode ? "text-red-900" : "text-slate-800"}`, children: "Maintenance Mode" }),
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] text-slate-500", children: "Enable to lock the platform and APIs for all users." })
                ] }),
                /* @__PURE__ */ jsxs("label", { className: "relative inline-flex items-center cursor-pointer", children: [
                  /* @__PURE__ */ jsx("input", { type: "checkbox", className: "sr-only peer", checked: data.maintenance_mode, onChange: (e) => setData("maintenance_mode", e.target.checked) }),
                  /* @__PURE__ */ jsx("div", { className: "w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500" })
                ] })
              ] })
            }
          )
        ] }),
        activeTab === "email" && /* @__PURE__ */ jsxs("div", { className: "animate-in fade-in slide-in-from-right-2 duration-300", children: [
          /* @__PURE__ */ jsxs(
            FormSection,
            {
              title: "SMTP Configuration",
              description: "Configure the outbound mail server used for notifications and system emails.",
              children: [
                /* @__PURE__ */ jsx(InputGroup, { label: "Mailer Driver", children: /* @__PURE__ */ jsxs(
                  "select",
                  {
                    value: data.mail_mailer,
                    onChange: (e) => setData("mail_mailer", e.target.value),
                    className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-slate-900 transition-all",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "smtp", children: "SMTP" }),
                      /* @__PURE__ */ jsx("option", { value: "log", children: "Log (Local Dev)" }),
                      /* @__PURE__ */ jsx("option", { value: "ses", children: "Amazon SES" }),
                      /* @__PURE__ */ jsx("option", { value: "mailgun", children: "Mailgun" })
                    ]
                  }
                ) }),
                data.mail_mailer === "smtp" && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsx("div", { className: "col-span-1", children: /* @__PURE__ */ jsx(InputGroup, { label: "Host", children: /* @__PURE__ */ jsx("input", { type: "text", value: data.mail_host, onChange: (e) => setData("mail_host", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-slate-900" }) }) }),
                  /* @__PURE__ */ jsx("div", { className: "col-span-1", children: /* @__PURE__ */ jsx(InputGroup, { label: "Port", children: /* @__PURE__ */ jsx("input", { type: "number", value: data.mail_port, onChange: (e) => setData("mail_port", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-slate-900" }) }) }),
                  /* @__PURE__ */ jsx("div", { className: "col-span-1", children: /* @__PURE__ */ jsx(InputGroup, { label: "Username", children: /* @__PURE__ */ jsx("input", { type: "text", value: data.mail_username, onChange: (e) => setData("mail_username", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-slate-900" }) }) }),
                  /* @__PURE__ */ jsx("div", { className: "col-span-1", children: /* @__PURE__ */ jsx(InputGroup, { label: "Password", children: /* @__PURE__ */ jsx("input", { type: "password", value: data.mail_password, onChange: (e) => setData("mail_password", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-slate-900" }) }) })
                ] }),
                /* @__PURE__ */ jsx(InputGroup, { label: "Encryption", children: /* @__PURE__ */ jsxs("select", { value: data.mail_encryption, onChange: (e) => setData("mail_encryption", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-slate-900", children: [
                  /* @__PURE__ */ jsx("option", { value: "tls", children: "TLS" }),
                  /* @__PURE__ */ jsx("option", { value: "ssl", children: "SSL" }),
                  /* @__PURE__ */ jsx("option", { value: "null", children: "None" })
                ] }) }),
                /* @__PURE__ */ jsxs("div", { className: "mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "bg-indigo-600 p-1 rounded", children: /* @__PURE__ */ jsx("svg", { className: "w-3 h-3 text-white", viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z" }) }) }),
                    /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold text-indigo-900 uppercase tracking-tight", children: "Resend SMTP Guide" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsx("p", { className: "text-[10px] text-indigo-700 leading-relaxed font-medium", children: "To use Resend as your provider, use these exact settings:" }),
                    /* @__PURE__ */ jsxs("ul", { className: "text-[10px] text-indigo-600 space-y-1 font-mono bg-white/50 p-2 rounded-lg border border-indigo-100", children: [
                      /* @__PURE__ */ jsx("li", { children: "Host: smtp.resend.com" }),
                      /* @__PURE__ */ jsx("li", { children: "Port: 587 (TLS)" }),
                      /* @__PURE__ */ jsx("li", { children: "User: resend" }),
                      /* @__PURE__ */ jsx("li", { children: "Pass: re_your_api_key" })
                    ] })
                  ] })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            FormSection,
            {
              title: "Sender Identity",
              description: "Default name and address that recipients will see on platform emails.",
              children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsx(InputGroup, { label: "From Name", children: /* @__PURE__ */ jsx("input", { type: "text", value: data.mail_from_name, onChange: (e) => setData("mail_from_name", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400", placeholder: "e.g. Platform Hub" }) }),
                /* @__PURE__ */ jsx(InputGroup, { label: "From Address", children: /* @__PURE__ */ jsx("input", { type: "email", value: data.mail_from_address, onChange: (e) => setData("mail_from_address", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400", placeholder: "noreply@example.com" }) })
              ] })
            }
          )
        ] }),
        activeTab === "payments" && /* @__PURE__ */ jsxs("div", { className: "animate-in fade-in slide-in-from-right-2 duration-300", children: [
          /* @__PURE__ */ jsxs(
            FormSection,
            {
              title: "Stripe (Payments)",
              description: "Required for multi-tenant billing and subscription management.",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 bg-slate-50 border border-gray-100 rounded-lg mb-4", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs font-bold text-slate-700 uppercase tracking-tight", children: "Enable Stripe" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setData("stripe_active", !data.stripe_active),
                      className: `relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${data.stripe_active ? "bg-indigo-600" : "bg-slate-200"}`,
                      children: /* @__PURE__ */ jsx("span", { className: `pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.stripe_active ? "translate-x-5" : "translate-x-0"}` })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(InputGroup, { label: "Environment Mode", children: /* @__PURE__ */ jsxs("select", { value: data.stripe_mode, onChange: (e) => setData("stripe_mode", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900", children: [
                  /* @__PURE__ */ jsx("option", { value: "sandbox", children: "Sandbox / Test" }),
                  /* @__PURE__ */ jsx("option", { value: "live", children: "Live / Production" })
                ] }) }),
                /* @__PURE__ */ jsx(InputGroup, { label: "Public Key (Publishable)", children: /* @__PURE__ */ jsx("input", { type: "text", value: data.stripe_key, onChange: (e) => setData("stripe_key", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400", placeholder: "pk_test_..." }) }),
                /* @__PURE__ */ jsx(InputGroup, { label: "Secret Key", children: /* @__PURE__ */ jsx("input", { type: "password", value: data.stripe_secret, onChange: (e) => setData("stripe_secret", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono outline-none focus:ring-1 focus:ring-slate-900" }) })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            FormSection,
            {
              title: "PayPal (Payments)",
              description: "Required for multi-tenant billing via PayPal.",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 bg-slate-50 border border-gray-100 rounded-lg mb-4", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs font-bold text-slate-700 uppercase tracking-tight", children: "Enable PayPal" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setData("paypal_active", !data.paypal_active),
                      className: `relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${data.paypal_active ? "bg-indigo-600" : "bg-slate-200"}`,
                      children: /* @__PURE__ */ jsx("span", { className: `pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.paypal_active ? "translate-x-5" : "translate-x-0"}` })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(InputGroup, { label: "Environment Mode", children: /* @__PURE__ */ jsxs("select", { value: data.paypal_mode, onChange: (e) => setData("paypal_mode", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900", children: [
                  /* @__PURE__ */ jsx("option", { value: "sandbox", children: "Sandbox / Test" }),
                  /* @__PURE__ */ jsx("option", { value: "live", children: "Live / Production" })
                ] }) }),
                /* @__PURE__ */ jsx(InputGroup, { label: "Client ID", children: /* @__PURE__ */ jsx("input", { type: "text", value: data.paypal_client_id, onChange: (e) => setData("paypal_client_id", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono outline-none focus:ring-1 focus:ring-slate-900" }) }),
                /* @__PURE__ */ jsx(InputGroup, { label: "Secret Key", children: /* @__PURE__ */ jsx("input", { type: "password", value: data.paypal_secret, onChange: (e) => setData("paypal_secret", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono outline-none focus:ring-1 focus:ring-slate-900" }) })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            FormSection,
            {
              title: "Razorpay (Payments)",
              description: "Payment gateway integration for Indian markets.",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 bg-slate-50 border border-gray-100 rounded-lg mb-4", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs font-bold text-slate-700 uppercase tracking-tight", children: "Enable Razorpay" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setData("razorpay_active", !data.razorpay_active),
                      className: `relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${data.razorpay_active ? "bg-indigo-600" : "bg-slate-200"}`,
                      children: /* @__PURE__ */ jsx("span", { className: `pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.razorpay_active ? "translate-x-5" : "translate-x-0"}` })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(InputGroup, { label: "Environment Mode", children: /* @__PURE__ */ jsxs("select", { value: data.razorpay_mode, onChange: (e) => setData("razorpay_mode", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900", children: [
                  /* @__PURE__ */ jsx("option", { value: "sandbox", children: "Sandbox / Test" }),
                  /* @__PURE__ */ jsx("option", { value: "live", children: "Live / Production" })
                ] }) }),
                /* @__PURE__ */ jsx(InputGroup, { label: "Key ID", children: /* @__PURE__ */ jsx("input", { type: "text", value: data.razorpay_key, onChange: (e) => setData("razorpay_key", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono outline-none focus:ring-1 focus:ring-slate-900" }) }),
                /* @__PURE__ */ jsx(InputGroup, { label: "Key Secret", children: /* @__PURE__ */ jsx("input", { type: "password", value: data.razorpay_secret, onChange: (e) => setData("razorpay_secret", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono outline-none focus:ring-1 focus:ring-slate-900" }) })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            FormSection,
            {
              title: "SSLCommerz (Payments)",
              description: "Payment gateway integration for Bangladesh.",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-3 bg-slate-50 border border-gray-100 rounded-lg mb-4", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-xs font-bold text-slate-700 uppercase tracking-tight", children: "Enable SSLCommerz" }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setData("sslcommerz_active", !data.sslcommerz_active),
                      className: `relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${data.sslcommerz_active ? "bg-indigo-600" : "bg-slate-200"}`,
                      children: /* @__PURE__ */ jsx("span", { className: `pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.sslcommerz_active ? "translate-x-5" : "translate-x-0"}` })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(InputGroup, { label: "Environment Mode", children: /* @__PURE__ */ jsxs("select", { value: data.sslcommerz_mode, onChange: (e) => setData("sslcommerz_mode", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-slate-900", children: [
                  /* @__PURE__ */ jsx("option", { value: "sandbox", children: "Sandbox / Test" }),
                  /* @__PURE__ */ jsx("option", { value: "live", children: "Live / Production" })
                ] }) }),
                /* @__PURE__ */ jsx(InputGroup, { label: "Store ID", children: /* @__PURE__ */ jsx("input", { type: "text", value: data.sslcommerz_store_id, onChange: (e) => setData("sslcommerz_store_id", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono outline-none focus:ring-1 focus:ring-slate-900" }) }),
                /* @__PURE__ */ jsx(InputGroup, { label: "Store Password", children: /* @__PURE__ */ jsx("input", { type: "password", value: data.sslcommerz_store_pw, onChange: (e) => setData("sslcommerz_store_pw", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono outline-none focus:ring-1 focus:ring-slate-900" }) })
              ]
            }
          )
        ] }),
        activeTab === "services" && /* @__PURE__ */ jsx("div", { className: "animate-in fade-in slide-in-from-right-2 duration-300", children: /* @__PURE__ */ jsxs(
          FormSection,
          {
            title: "OpenAI (AI Engine)",
            description: "Credentials for the platform's AI-driven features like SEO generation.",
            children: [
              /* @__PURE__ */ jsx(InputGroup, { label: "API Key", children: /* @__PURE__ */ jsx("input", { type: "password", value: data.openai_api_key, onChange: (e) => setData("openai_api_key", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono outline-none focus:ring-1 focus:ring-slate-900" }) }),
              /* @__PURE__ */ jsx(InputGroup, { label: "Preferred Model", children: /* @__PURE__ */ jsxs("select", { value: data.openai_model, onChange: (e) => setData("openai_model", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-slate-900", children: [
                /* @__PURE__ */ jsx("option", { value: "gpt-4o", children: "GPT-4o (Standard)" }),
                /* @__PURE__ */ jsx("option", { value: "gpt-4o-mini", children: "GPT-4o-mini (Faster/Cheaper)" }),
                /* @__PURE__ */ jsx("option", { value: "o1", children: "OpenAI O1 (Advanced Reasoning)" })
              ] }) })
            ]
          }
        ) }),
        activeTab === "social_auth" && /* @__PURE__ */ jsxs("div", { className: "animate-in fade-in slide-in-from-right-2 duration-300", children: [
          /* @__PURE__ */ jsxs(
            FormSection,
            {
              title: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxs("svg", { className: "w-5 h-5", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }),
                  /* @__PURE__ */ jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }),
                  /* @__PURE__ */ jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" }),
                  /* @__PURE__ */ jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })
                ] }),
                "Google Authentication"
              ] }),
              description: "Configure Google OAuth credentials for social registration and login.",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl mb-6", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-emerald-900 uppercase", children: "Enable Google Login" }),
                    /* @__PURE__ */ jsx("p", { className: "text-[10px] text-emerald-600 font-medium", children: "Allow users to sign up via Google accounts." })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setData("google_login_enabled", !data.google_login_enabled),
                      className: `relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${data.google_login_enabled ? "bg-emerald-600" : "bg-slate-300"}`,
                      children: /* @__PURE__ */ jsx("span", { className: `pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.google_login_enabled ? "translate-x-6" : "translate-x-0"}` })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(InputGroup, { label: "Google Client ID", children: /* @__PURE__ */ jsx("input", { type: "text", value: data.google_client_id, onChange: (e) => setData("google_client_id", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400", placeholder: "0000000000-xxxxx.apps.googleusercontent.com" }) }),
                /* @__PURE__ */ jsx(InputGroup, { label: "Google Client Secret", children: /* @__PURE__ */ jsx("input", { type: "password", value: data.google_client_secret, onChange: (e) => setData("google_client_secret", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono outline-none focus:ring-1 focus:ring-slate-900" }) }),
                /* @__PURE__ */ jsxs(InputGroup, { label: "Redirect URL", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                    /* @__PURE__ */ jsx("input", { type: "text", value: data.google_redirect_url, onChange: (e) => setData("google_redirect_url", e.target.value), className: "flex-1 bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-[10px] font-mono outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400", placeholder: window.route("auth.google.callback") }),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setData("google_redirect_url", window.route("auth.google.callback")),
                        className: "px-3 py-2 text-[10px] font-bold bg-white border border-gray-200 rounded-lg hover:bg-slate-50",
                        children: "Auto"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 mt-1 italic", children: "Add this URL to your Google Cloud Console authorized redirect URIs." })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            FormSection,
            {
              title: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("svg", { className: "w-5 h-5 fill-[#1877F2]", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" }) }),
                "Facebook Authentication"
              ] }),
              description: "Configure Facebook Login credentials (optional).",
              children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 bg-blue-50/50 border border-blue-100 rounded-xl mb-6", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-blue-900 uppercase", children: "Enable Facebook Login" }),
                    /* @__PURE__ */ jsx("p", { className: "text-[10px] text-blue-600 font-medium", children: "Allow users to sign up via Facebook accounts." })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => setData("facebook_login_enabled", !data.facebook_login_enabled),
                      className: `relative inline-flex h-6 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${data.facebook_login_enabled ? "bg-blue-600" : "bg-slate-300"}`,
                      children: /* @__PURE__ */ jsx("span", { className: `pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.facebook_login_enabled ? "translate-x-6" : "translate-x-0"}` })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsx(InputGroup, { label: "App ID", children: /* @__PURE__ */ jsx("input", { type: "text", value: data.facebook_client_id, onChange: (e) => setData("facebook_client_id", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono outline-none focus:ring-1 focus:ring-slate-900" }) }),
                /* @__PURE__ */ jsx(InputGroup, { label: "App Secret", children: /* @__PURE__ */ jsx("input", { type: "password", value: data.facebook_client_secret, onChange: (e) => setData("facebook_client_secret", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono outline-none focus:ring-1 focus:ring-slate-900" }) }),
                /* @__PURE__ */ jsx(InputGroup, { label: "Redirect URL", children: /* @__PURE__ */ jsx("input", { type: "text", value: data.facebook_redirect_url, onChange: (e) => setData("facebook_redirect_url", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-[10px] font-mono outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400", placeholder: window.route("auth.facebook.callback") }) })
              ]
            }
          )
        ] }),
        activeTab === "domains" && /* @__PURE__ */ jsx("div", { className: "animate-in fade-in slide-in-from-right-2 duration-300", children: /* @__PURE__ */ jsxs(
          FormSection,
          {
            title: "Namecheap (Domain Registrar)",
            description: "Credentials for automated custom domain registration and DNS management.",
            children: [
              /* @__PURE__ */ jsx(InputGroup, { label: "API Key", children: /* @__PURE__ */ jsx("input", { type: "password", value: data.namecheap_api_key, onChange: (e) => setData("namecheap_api_key", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono outline-none focus:ring-1 focus:ring-slate-900" }) }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsx(InputGroup, { label: "API Username", children: /* @__PURE__ */ jsx("input", { type: "text", value: data.namecheap_username, onChange: (e) => setData("namecheap_username", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-slate-900" }) }),
                /* @__PURE__ */ jsx(InputGroup, { label: "Whitelisted IP", children: /* @__PURE__ */ jsx("input", { type: "text", value: data.namecheap_client_ip, onChange: (e) => setData("namecheap_client_ip", e.target.value), className: "w-full bg-slate-50 text-slate-900 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400", placeholder: "e.g. 1.2.3.4" }) })
              ] })
            ]
          }
        ) }),
        activeTab === "quotas" && /* @__PURE__ */ jsx("div", { className: "animate-in fade-in slide-in-from-right-2 duration-300", children: /* @__PURE__ */ jsxs(
          FormSection,
          {
            title: "Global Quota Tiers",
            description: "Define default monthly limits for various services across the platform plans.",
            children: [
              /* @__PURE__ */ jsx("div", { className: "bg-slate-50 rounded-xl border border-gray-100 overflow-hidden", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm border-collapse", children: [
                /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b border-gray-100 bg-slate-100/50", children: [
                  /* @__PURE__ */ jsx("th", { className: "px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider", children: "Plan" }),
                  /* @__PURE__ */ jsx("th", { className: "px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider", children: "Tracking" }),
                  /* @__PURE__ */ jsx("th", { className: "px-4 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider", children: "WhatsApp" })
                ] }) }),
                /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-gray-100", children: ["starter", "growth", "pro"].map((plan) => /* @__PURE__ */ jsxs("tr", { children: [
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3 font-bold text-slate-700 capitalize", children: plan }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("input", { type: "text", className: "w-20 bg-white border border-gray-200 rounded px-2 py-1 text-xs", defaultValue: plan === "starter" ? "1,000" : plan === "growth" ? "10,000" : "50,000" }) }),
                  /* @__PURE__ */ jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsx("input", { type: "text", className: "w-20 bg-white border border-gray-200 rounded px-2 py-1 text-xs", defaultValue: plan === "starter" ? "100" : plan === "growth" ? "1,000" : "10,000" }) })
                ] }, plan)) })
              ] }) }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] text-slate-400 mt-2 font-medium", children: "Changes here will apply to new billing periods for all tenants on these plans." })
            ]
          }
        ) }),
        activeTab === "webhooks" && /* @__PURE__ */ jsx("div", { className: "animate-in fade-in slide-in-from-right-2 duration-300", children: /* @__PURE__ */ jsxs(
          FormSection,
          {
            title: "Platform Webhooks",
            description: "Manage outbound webhooks for real-time synchronization with external developer tools.",
            children: [
              /* @__PURE__ */ jsxs("button", { type: "button", className: "flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-sm", children: [
                /* @__PURE__ */ jsx("svg", { className: "w-3 h-3", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 4v16m8-8H4" }) }),
                "Add New Webhook"
              ] }),
              /* @__PURE__ */ jsx("div", { className: "mt-4 border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100", children: [
                { url: "https://api.analytics.com/hooks/tenant_created", events: ["tenant.created"], status: "Active" },
                { url: "https://security-mesh.io/hooks/critical_events", events: ["*"], status: "Inactive" }
              ].map((hook) => /* @__PURE__ */ jsxs("div", { className: "px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-slate-800", children: hook.url }),
                  /* @__PURE__ */ jsx("div", { className: "flex gap-1.5 mt-1.5", children: hook.events.map((ev) => /* @__PURE__ */ jsx("span", { className: "text-[9px] font-black bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded tracking-tighter uppercase", children: ev }, ev)) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity", children: [
                  /* @__PURE__ */ jsx("span", { className: `text-[10px] font-bold ${hook.status === "Active" ? "text-green-600" : "text-slate-400"}`, children: hook.status }),
                  /* @__PURE__ */ jsx("button", { type: "button", className: "p-1.5 hover:bg-gray-200 rounded text-slate-400", children: /* @__PURE__ */ jsx("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" }) }) })
                ] })
              ] }, hook.url)) })
            ]
          }
        ) }),
        activeTab === "security" && /* @__PURE__ */ jsx("div", { className: "animate-in fade-in slide-in-from-right-2 duration-300", children: /* @__PURE__ */ jsxs(
          FormSection,
          {
            title: "Two-Factor Authentication",
            description: "Add an extra layer of security to your admin account by requiring a code from your phone.",
            children: [
              !twoFactorEnabled && !confirming2fa && /* @__PURE__ */ jsxs("div", { className: "p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center", children: [
                /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-slate-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }) }),
                /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-slate-900 mb-1", children: "Two-Factor Authentication is Disabled" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 mb-6 max-w-xs mx-auto", children: "We recommend enabling 2FA for all administrative accounts to protect sensitive platform data." }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: enable2fa,
                    className: "px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200",
                    children: "Enable 2FA"
                  }
                )
              ] }),
              confirming2fa && /* @__PURE__ */ jsxs("div", { className: "p-8 bg-white rounded-3xl border-2 border-slate-900 shadow-xl space-y-8 animate-in zoom-in-95 duration-300", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-8 items-center", children: [
                  /* @__PURE__ */ jsx("div", { className: "bg-slate-50 p-4 rounded-2xl border-2 border-slate-100", dangerouslySetInnerHTML: { __html: qrCode } }),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-4", children: [
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("h4", { className: "text-lg font-black text-slate-900 tracking-tight", children: "Scan this QR Code" }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-500 leading-relaxed font-medium", children: "Use an authenticator app like Google Authenticator or Authy to scan this code." })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "bg-slate-50 p-3 rounded-xl border border-slate-200", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1", children: "Manual Setup Key" }),
                      /* @__PURE__ */ jsx("code", { className: "text-xs font-mono font-black text-slate-900 tracking-[0.2em]", children: secret })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "pt-6 border-t border-slate-100", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xs font-bold text-slate-900 mb-4", children: "Confirm to Activate" }),
                  /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
                    /* @__PURE__ */ jsx(
                      "input",
                      {
                        type: "text",
                        placeholder: "000 000",
                        value: code,
                        onChange: (e) => setCode(e.target.value),
                        className: "flex-1 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl px-4 py-3 text-center text-xl font-black tracking-[0.5em] outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400",
                        maxLength: "6"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        onClick: confirm2fa,
                        className: "px-8 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all",
                        children: "Confirm"
                      }
                    )
                  ] }),
                  error && /* @__PURE__ */ jsx("p", { className: "text-[11px] text-red-500 font-bold mt-2 text-center", children: error })
                ] })
              ] }),
              twoFactorEnabled && /* @__PURE__ */ jsxs("div", { className: "p-6 bg-green-50 rounded-2xl border border-green-100 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-green-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) }) }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("h4", { className: "text-sm font-bold text-green-900", children: "Two-Factor Authentication is Active" }),
                    /* @__PURE__ */ jsx("p", { className: "text-[11px] text-green-700 font-medium", children: "Your account is secured with a secondary verification layer." })
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    onClick: disable2fa,
                    className: "px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-bold hover:bg-red-200 transition-all border border-red-200",
                    children: "Disable 2FA"
                  }
                )
              ] })
            ]
          }
        ) })
      ] }) })
    ] })
  ] });
}
Index.layout = (page) => /* @__PURE__ */ jsx(PlatformLayout, { children: page, title: "System Settings" });
export {
  Index as default
};
