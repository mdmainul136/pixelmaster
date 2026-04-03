import React from "react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { Input } from "@Tenant/components/ui/input";
import { Label } from "@Tenant/components/ui/label";
import { Button } from "@Tenant/components/ui/button";
import { useForm, Head, Link } from "@inertiajs/react";
import { toast } from "sonner";
import {
  Palette,
  Image,
  Share2,
  Save,
  Loader2,
  ArrowLeft,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react";

interface BrandingSettings {
  logo_url: string;
  favicon_url: string;
  primary_color: string;
  secondary_color: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  linkedin_url: string;
  theme_id: string;
}

interface Props {
  settings: BrandingSettings;
}

const Branding = ({ settings }: Props) => {
  const route = (window as any).route;

  const { data, setData, post, processing, errors } = useForm({
    logo_url: settings.logo_url || "",
    favicon_url: settings.favicon_url || "",
    primary_color: settings.primary_color || "#6366f1",
    secondary_color: settings.secondary_color || "#8b5cf6",
    facebook_url: settings.facebook_url || "",
    instagram_url: settings.instagram_url || "",
    twitter_url: settings.twitter_url || "",
    linkedin_url: settings.linkedin_url || "",
    theme_id: settings.theme_id || "",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    post(route("tenant.settings.update") + "?section=branding", {
      onSuccess: () => toast.success("Branding settings updated"),
      onError: () => toast.error("Failed to update branding settings"),
    });
  };

  const presetColors = [
    { name: "Indigo", primary: "#6366f1", secondary: "#8b5cf6" },
    { name: "Blue", primary: "#3b82f6", secondary: "#60a5fa" },
    { name: "Emerald", primary: "#10b981", secondary: "#34d399" },
    { name: "Rose", primary: "#f43f5e", secondary: "#fb7185" },
    { name: "Amber", primary: "#f59e0b", secondary: "#fbbf24" },
    { name: "Cyan", primary: "#06b6d4", secondary: "#22d3ee" },
  ];

  return (
    <DashboardLayout>
      <Head title="Branding Settings" />

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={route("tenant.settings")}
          className="rounded-lg p-2 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Branding</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Colors, logos, and social media links
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 xl:grid-cols-2 pb-20">
        {/* Brand Colors */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" /> Brand Colors
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.primary_color}
                    onChange={(e) => setData("primary_color", e.target.value)}
                    className="h-10 w-14 rounded-md border border-input cursor-pointer"
                  />
                  <Input
                    value={data.primary_color}
                    onChange={(e) => setData("primary_color", e.target.value)}
                    placeholder="#6366f1"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.secondary_color}
                    onChange={(e) => setData("secondary_color", e.target.value)}
                    className="h-10 w-14 rounded-md border border-input cursor-pointer"
                  />
                  <Input
                    value={data.secondary_color}
                    onChange={(e) => setData("secondary_color", e.target.value)}
                    placeholder="#8b5cf6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Preset colors */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Quick Presets</Label>
              <div className="flex flex-wrap gap-2">
                {presetColors.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setData("primary_color", preset.primary);
                      setData("secondary_color", preset.secondary);
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-primary/40 transition-colors"
                  >
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: preset.primary }}
                    />
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ background: preset.secondary }}
                    />
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground mb-2">Preview</p>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-24 rounded-lg"
                  style={{ background: data.primary_color }}
                />
                <div
                  className="h-10 w-24 rounded-lg"
                  style={{ background: data.secondary_color }}
                />
                <div
                  className="h-10 flex-1 rounded-lg"
                  style={{
                    background: `linear-gradient(135deg, ${data.primary_color}, ${data.secondary_color})`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Logo & Favicon */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" /> Logo & Favicon
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Logo URL</Label>
              <Input
                value={data.logo_url}
                onChange={(e) => setData("logo_url", e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              {data.logo_url && (
                <div className="mt-2 rounded-lg border border-border p-3 bg-muted/50">
                  <img
                    src={data.logo_url}
                    alt="Logo preview"
                    className="h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Favicon URL</Label>
              <Input
                value={data.favicon_url}
                onChange={(e) => setData("favicon_url", e.target.value)}
                placeholder="https://example.com/favicon.ico"
              />
            </div>
            <div className="space-y-2">
              <Label>Theme</Label>
              <Input
                value={data.theme_id}
                onChange={(e) => setData("theme_id", e.target.value)}
                placeholder="default"
              />
              <p className="text-[10px] text-muted-foreground">
                Theme identifier applied to your storefront
              </p>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm xl:col-span-2">
          <h3 className="mb-4 text-base font-semibold text-card-foreground flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" /> Social Media
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Facebook className="h-4 w-4 text-blue-600" /> Facebook
              </Label>
              <Input
                value={data.facebook_url}
                onChange={(e) => setData("facebook_url", e.target.value)}
                placeholder="https://facebook.com/your-page"
              />
              {errors.facebook_url && (
                <p className="text-xs text-destructive">{errors.facebook_url}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Instagram className="h-4 w-4 text-pink-500" /> Instagram
              </Label>
              <Input
                value={data.instagram_url}
                onChange={(e) => setData("instagram_url", e.target.value)}
                placeholder="https://instagram.com/your-handle"
              />
              {errors.instagram_url && (
                <p className="text-xs text-destructive">{errors.instagram_url}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Twitter className="h-4 w-4 text-sky-500" /> Twitter / X
              </Label>
              <Input
                value={data.twitter_url}
                onChange={(e) => setData("twitter_url", e.target.value)}
                placeholder="https://x.com/your-handle"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Linkedin className="h-4 w-4 text-blue-700" /> LinkedIn
              </Label>
              <Input
                value={data.linkedin_url}
                onChange={(e) => setData("linkedin_url", e.target.value)}
                placeholder="https://linkedin.com/company/your-company"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Floating Save */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button
          onClick={handleSave}
          disabled={processing}
          className="h-12 px-8 rounded-full shadow-2xl bg-primary text-primary-foreground font-bold flex items-center gap-2 hover:scale-105 transition-transform"
        >
          {processing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Branding
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default Branding;
