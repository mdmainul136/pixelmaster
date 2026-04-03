import React, { useRef, useState } from "react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { Input } from "@Tenant/components/ui/input";
import { Label } from "@Tenant/components/ui/label";
import { Button } from "@Tenant/components/ui/button";
import { useForm, Head, Link, usePage } from "@inertiajs/react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, UserCircle, ShieldCheck, Camera } from "lucide-react";

interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  profile_photo_url?: string;
  email_verified_at?: string | null;
}

interface PageProps {
  mustVerifyEmail: boolean;
  status: string | null;
  auth: { user: AuthUser };
  tenant: any;
  [key: string]: any;
}

export default function Edit({ mustVerifyEmail, status }: PageProps) {
  const { auth, tenant } = usePage<PageProps>().props;
  const user = auth.user;
  const route = (window as any).route;

  const photoInput = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Form 1: Profile Information
  const profileForm = useForm({
    _method: "patch",
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    photo: null as File | null,
  });

  const updatePhotoPreview = () => {
    const photo = photoInput.current?.files?.[0];
    if (!photo) return;
    profileForm.setData("photo", photo);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(photo);
  };

  const submitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    profileForm.post(route("tenant.profile.update"), {
      preserveScroll: true,
      onSuccess: () => toast.success("Profile information updated successfully."),
      onError: () => toast.error("Please fix the errors to update profile."),
    });
  };

  // Form 2: Update Password
  const passwordInput = useRef<HTMLInputElement>(null);
  const currentPasswordInput = useRef<HTMLInputElement>(null);

  const passwordForm = useForm({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const submitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    passwordForm.put(route("tenant.profile.password"), {
      preserveScroll: true,
      onSuccess: () => {
        passwordForm.reset();
        toast.success("Password updated successfully.");
      },
      onError: (errors) => {
        toast.error("Failed to update password.");
        if (errors.password) {
          passwordForm.reset("password", "password_confirmation");
          passwordInput.current?.focus();
        }
        if (errors.current_password) {
          passwordForm.reset("current_password");
          currentPasswordInput.current?.focus();
        }
      },
    });
  };

  return (
    <DashboardLayout>
      <Head title="Edit Profile" />

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={route("tenant.profile")}
          className="rounded-lg p-2 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your account's profile information and password.
          </p>
        </div>
      </div>

      <div className="max-w-4xl pb-12 space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        {/* Profile Information Section */}
        <section className="rounded-xl border border-border bg-card shadow-sm h-fit">
          <div className="border-b border-border px-6 py-4 flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-card-foreground">Profile Information</h2>
          </div>
          
          <form onSubmit={submitProfile} className="p-6 space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative group h-20 w-20 rounded-full overflow-hidden border-2 border-border">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : user.profile_photo_url ? (
                  <img src={user.profile_photo_url} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                    <UserCircle className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => photoInput.current?.click()}
                >
                  <Camera className="mr-2 h-4 w-4" /> Change Photo
                </Button>
                <p className="text-xs text-muted-foreground mt-1.5">
                  JPG, JPEG or PNG. Max size of 1MB.
                </p>
                <input
                  type="file"
                  className="hidden"
                  ref={photoInput}
                  accept="image/jpeg, image/png, image/jpg"
                  onChange={updatePhotoPreview}
                />
                {profileForm.errors.photo && (
                  <p className="text-xs text-destructive">{profileForm.errors.photo}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileForm.data.name}
                onChange={(e) => profileForm.setData("name", e.target.value)}
                autoComplete="name"
              />
              {profileForm.errors.name && (
                <p className="text-xs text-destructive">{profileForm.errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileForm.data.email}
                onChange={(e) => profileForm.setData("email", e.target.value)}
                autoComplete="username"
              />
              {profileForm.errors.email && (
                <p className="text-xs text-destructive">{profileForm.errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileForm.data.phone || ""}
                onChange={(e) => profileForm.setData("phone", e.target.value)}
                placeholder="+1 234 567 890"
              />
              {profileForm.errors.phone && (
                <p className="text-xs text-destructive">{profileForm.errors.phone}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button disabled={profileForm.processing} type="submit">
                {profileForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Information
              </Button>
            </div>
          </form>
        </section>

        {/* Update Password Section */}
        <section className="rounded-xl border border-border bg-card shadow-sm h-fit">
           <div className="border-b border-border px-6 py-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">Update Password</h2>
              <p className="text-sm text-muted-foreground">Ensure your account is secure using a long, random password.</p>
            </div>
          </div>
          
          <form onSubmit={submitPassword} className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                ref={currentPasswordInput}
                value={passwordForm.data.current_password}
                onChange={(e) => passwordForm.setData("current_password", e.target.value)}
                type="password"
                autoComplete="current-password"
              />
              {passwordForm.errors.current_password && (
                <p className="text-xs text-destructive">{passwordForm.errors.current_password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                ref={passwordInput}
                value={passwordForm.data.password}
                onChange={(e) => passwordForm.setData("password", e.target.value)}
                type="password"
                autoComplete="new-password"
              />
              {passwordForm.errors.password && (
                <p className="text-xs text-destructive">{passwordForm.errors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirm Password</Label>
              <Input
                id="password_confirmation"
                value={passwordForm.data.password_confirmation}
                onChange={(e) => passwordForm.setData("password_confirmation", e.target.value)}
                type="password"
                autoComplete="new-password"
              />
              {passwordForm.errors.password_confirmation && (
                <p className="text-xs text-destructive">{passwordForm.errors.password_confirmation}</p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button disabled={passwordForm.processing} type="submit" variant="secondary">
                {passwordForm.processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Password
              </Button>
            </div>
          </form>
        </section>
        </div>

        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-sm max-w-2xl">
          <h3 className="flex items-center gap-2 text-sm font-bold text-primary">
            <ShieldCheck className="h-4 w-4" /> Account Privacy
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground font-medium">
            Your profile information is only used for platform notifications and identity resolution. For advanced tracking settings, visit the sGTM Container control panel.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
