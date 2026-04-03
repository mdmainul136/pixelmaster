import { jsxs, jsx } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { D as DashboardLayout } from "./DashboardLayout-gDh1-isY.js";
import { I as Input } from "./input-CdwQDcVi.js";
import { L as Label } from "./label-CNvk9rvV.js";
import { B as Button } from "./button-Dwr8R-lW.js";
import { usePage, useForm, Head, Link } from "@inertiajs/react";
import { toast } from "sonner";
import { ArrowLeft, UserCircle, Camera, Loader2, ShieldCheck } from "lucide-react";
import "@tanstack/react-query";
import "axios";
import "class-variance-authority";
import "../ssr.js";
import "@inertiajs/react/server";
import "react-dom/server";
import "ziggy-js";
import "react-hot-toast";
import "@radix-ui/react-toast";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tooltip";
import "@radix-ui/react-label";
import "@radix-ui/react-slot";
function Edit({ mustVerifyEmail, status }) {
  const { auth, tenant } = usePage().props;
  const user = auth.user;
  const route = window.route;
  const photoInput = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const profileForm = useForm({
    _method: "patch",
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    photo: null
  });
  const updatePhotoPreview = () => {
    var _a, _b;
    const photo = (_b = (_a = photoInput.current) == null ? void 0 : _a.files) == null ? void 0 : _b[0];
    if (!photo) return;
    profileForm.setData("photo", photo);
    const reader = new FileReader();
    reader.onload = (e) => {
      var _a2;
      setPhotoPreview((_a2 = e.target) == null ? void 0 : _a2.result);
    };
    reader.readAsDataURL(photo);
  };
  const submitProfile = (e) => {
    e.preventDefault();
    profileForm.post(route("tenant.profile.update"), {
      preserveScroll: true,
      onSuccess: () => toast.success("Profile information updated successfully."),
      onError: () => toast.error("Please fix the errors to update profile.")
    });
  };
  const passwordInput = useRef(null);
  const currentPasswordInput = useRef(null);
  const passwordForm = useForm({
    current_password: "",
    password: "",
    password_confirmation: ""
  });
  const submitPassword = (e) => {
    e.preventDefault();
    passwordForm.put(route("tenant.profile.password"), {
      preserveScroll: true,
      onSuccess: () => {
        passwordForm.reset();
        toast.success("Password updated successfully.");
      },
      onError: (errors) => {
        var _a, _b;
        toast.error("Failed to update password.");
        if (errors.password) {
          passwordForm.reset("password", "password_confirmation");
          (_a = passwordInput.current) == null ? void 0 : _a.focus();
        }
        if (errors.current_password) {
          passwordForm.reset("current_password");
          (_b = currentPasswordInput.current) == null ? void 0 : _b.focus();
        }
      }
    });
  };
  return /* @__PURE__ */ jsxs(DashboardLayout, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Edit Profile" }),
    /* @__PURE__ */ jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href: route("tenant.profile"),
          className: "rounded-lg p-2 hover:bg-muted transition-colors",
          children: /* @__PURE__ */ jsx(ArrowLeft, { className: "h-5 w-5 text-muted-foreground" })
        }
      ),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-foreground", children: "Edit Profile" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Update your account's profile information and password." })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "max-w-4xl pb-12 space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start", children: [
        /* @__PURE__ */ jsxs("section", { className: "rounded-xl border border-border bg-card shadow-sm h-fit", children: [
          /* @__PURE__ */ jsxs("div", { className: "border-b border-border px-6 py-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(UserCircle, { className: "h-5 w-5 text-primary" }),
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-card-foreground", children: "Profile Information" })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: submitProfile, className: "p-6 space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "relative group h-20 w-20 rounded-full overflow-hidden border-2 border-border", children: [
                photoPreview ? /* @__PURE__ */ jsx("img", { src: photoPreview, alt: "Preview", className: "h-full w-full object-cover" }) : user.profile_photo_url ? /* @__PURE__ */ jsx("img", { src: user.profile_photo_url, alt: user.name, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("div", { className: "flex h-full w-full items-center justify-center bg-primary/10 text-primary", children: /* @__PURE__ */ jsx(UserCircle, { className: "h-10 w-10" }) }),
                /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100", children: /* @__PURE__ */ jsx(Camera, { className: "h-6 w-6 text-white" }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxs(
                  Button,
                  {
                    type: "button",
                    variant: "outline",
                    size: "sm",
                    onClick: () => {
                      var _a;
                      return (_a = photoInput.current) == null ? void 0 : _a.click();
                    },
                    children: [
                      /* @__PURE__ */ jsx(Camera, { className: "mr-2 h-4 w-4" }),
                      " Change Photo"
                    ]
                  }
                ),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1.5", children: "JPG, JPEG or PNG. Max size of 1MB." }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "file",
                    className: "hidden",
                    ref: photoInput,
                    accept: "image/jpeg, image/png, image/jpg",
                    onChange: updatePhotoPreview
                  }
                ),
                profileForm.errors.photo && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: profileForm.errors.photo })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Full Name" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "name",
                  value: profileForm.data.name,
                  onChange: (e) => profileForm.setData("name", e.target.value),
                  autoComplete: "name"
                }
              ),
              profileForm.errors.name && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: profileForm.errors.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email Address" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "email",
                  type: "email",
                  value: profileForm.data.email,
                  onChange: (e) => profileForm.setData("email", e.target.value),
                  autoComplete: "username"
                }
              ),
              profileForm.errors.email && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: profileForm.errors.email })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "phone", children: "Phone Number" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "phone",
                  value: profileForm.data.phone || "",
                  onChange: (e) => profileForm.setData("phone", e.target.value),
                  placeholder: "+1 234 567 890"
                }
              ),
              profileForm.errors.phone && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: profileForm.errors.phone })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxs(Button, { disabled: profileForm.processing, type: "submit", children: [
              profileForm.processing && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Save Information"
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("section", { className: "rounded-xl border border-border bg-card shadow-sm h-fit", children: [
          /* @__PURE__ */ jsxs("div", { className: "border-b border-border px-6 py-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(ShieldCheck, { className: "h-5 w-5 text-primary" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-card-foreground", children: "Update Password" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Ensure your account is secure using a long, random password." })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: submitPassword, className: "p-6 space-y-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "current_password", children: "Current Password" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "current_password",
                  ref: currentPasswordInput,
                  value: passwordForm.data.current_password,
                  onChange: (e) => passwordForm.setData("current_password", e.target.value),
                  type: "password",
                  autoComplete: "current-password"
                }
              ),
              passwordForm.errors.current_password && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: passwordForm.errors.current_password })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "New Password" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "password",
                  ref: passwordInput,
                  value: passwordForm.data.password,
                  onChange: (e) => passwordForm.setData("password", e.target.value),
                  type: "password",
                  autoComplete: "new-password"
                }
              ),
              passwordForm.errors.password && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: passwordForm.errors.password })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "password_confirmation", children: "Confirm Password" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "password_confirmation",
                  value: passwordForm.data.password_confirmation,
                  onChange: (e) => passwordForm.setData("password_confirmation", e.target.value),
                  type: "password",
                  autoComplete: "new-password"
                }
              ),
              passwordForm.errors.password_confirmation && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: passwordForm.errors.password_confirmation })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxs(Button, { disabled: passwordForm.processing, type: "submit", variant: "secondary", children: [
              passwordForm.processing && /* @__PURE__ */ jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
              "Save Password"
            ] }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm max-w-2xl", children: [
        /* @__PURE__ */ jsxs("h3", { className: "flex items-center gap-2 text-sm font-bold text-primary", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4" }),
          " Account Privacy"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs leading-relaxed text-muted-foreground font-medium", children: "Your profile information is only used for platform notifications and identity resolution. For advanced tracking settings, visit the sGTM Container control panel." })
      ] })
    ] })
  ] });
}
export {
  Edit as default
};
