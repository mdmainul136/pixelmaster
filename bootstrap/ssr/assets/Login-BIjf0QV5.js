import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { useForm, Head } from "@inertiajs/react";
function Login() {
  const { data, setData, post, processing, errors } = useForm({
    email: "",
    password: "",
    remember: false
  });
  const submit = (e) => {
    e.preventDefault();
    post("/platform/login");
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6", children: [
    /* @__PURE__ */ jsx(Head, { title: "Platform Login" }),
    /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-10 border border-slate-200", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-center mb-10", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl font-black tracking-tighter text-slate-900 mb-2", children: "PLATFORM OS" }),
        /* @__PURE__ */ jsx("p", { className: "text-slate-500 font-medium", children: "Authentication Required" })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2", children: "Email Address" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "email",
              value: data.email,
              onChange: (e) => setData("email", e.target.value),
              className: "w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all",
              placeholder: "admin@platform.com"
            }
          ),
          errors.email && /* @__PURE__ */ jsx("div", { className: "text-red-500 text-xs mt-1 font-bold", children: errors.email })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "block text-xs font-bold text-slate-700 uppercase tracking-widest mb-2", children: "Password" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              value: data.password,
              onChange: (e) => setData("password", e.target.value),
              className: "w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all",
              placeholder: "••••••••"
            }
          ),
          errors.password && /* @__PURE__ */ jsx("div", { className: "text-red-500 text-xs mt-1 font-bold", children: errors.password })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: processing,
            className: "w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 transform active:scale-[0.98]",
            children: processing ? "Authorizing..." : "Enter Console"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-8 text-center", children: /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400 font-medium italic", children: "Restricted Access Dashboard" }) })
    ] })
  ] });
}
export {
  Login as default
};
