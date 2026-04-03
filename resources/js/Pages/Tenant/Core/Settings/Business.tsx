import React from "react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { Input } from "@Tenant/components/ui/input";
import { Label } from "@Tenant/components/ui/label";
import { Button } from "@Tenant/components/ui/button";
import { useForm, Head, Link } from "@inertiajs/react";
import { toast } from "sonner";
import {
  Building2,
  FileText,
  Save,
  Loader2,
  ArrowLeft,
  Receipt,
  Shield,
} from "lucide-react";

interface BusinessSettings {
  business_type: string;
  business_category: string;
  cr_number: string;
  vat_number: string;
  company_name: string;
  company_address: string;
  company_city: string;
  country: string;
  invoice_prefix: string;
  tax_rate: number | string;
}

interface Props {
  settings: BusinessSettings;
}

const Business = ({ settings }: Props) => {
  const route = (window as any).route;

  const { data, setData, post, processing, errors } = useForm({
    business_type: settings.business_type || "",
    business_category: settings.business_category || "",
    cr_number: settings.cr_number || "",
    vat_number: settings.vat_number || "",
    company_name: settings.company_name || "",
    company_address: settings.company_address || "",
    company_city: settings.company_city || "",
    country: settings.country || "",
    invoice_prefix: settings.invoice_prefix || "INV-",
    tax_rate: settings.tax_rate || "",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    post(route("tenant.settings.update") + "?section=business", {
      onSuccess: () => toast.success("Business settings updated"),
      onError: () => toast.error("Failed to update business settings"),
    });
  };

  return (
    <DashboardLayout>
      <Head title="Business Settings" />

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={route("tenant.settings")}
          className="rounded-lg p-2 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Business Registration
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Legal and business registration details
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 xl:grid-cols-2 pb-20">
        {/* Legal Identity */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Legal Identity
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={data.company_name}
                onChange={(e) => setData("company_name", e.target.value)}
                placeholder="Legal company name"
              />
              {errors.company_name && (
                <p className="text-xs text-destructive">{errors.company_name}</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CR / Registration Number</Label>
                <Input
                  value={data.cr_number}
                  onChange={(e) => setData("cr_number", e.target.value)}
                  placeholder="e.g. 1234567890"
                />
                {errors.cr_number && (
                  <p className="text-xs text-destructive">{errors.cr_number}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>VAT Number</Label>
                <Input
                  value={data.vat_number}
                  onChange={(e) => setData("vat_number", e.target.value)}
                  placeholder="e.g. 301234567890003"
                />
                {errors.vat_number && (
                  <p className="text-xs text-destructive">{errors.vat_number}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Business Type</Label>
                <Input
                  value={data.business_type}
                  onChange={(e) => setData("business_type", e.target.value)}
                  placeholder="e.g. LLC, Sole Proprietorship"
                />
              </div>
              <div className="space-y-2">
                <Label>Business Category</Label>
                <Input
                  value={data.business_category}
                  onChange={(e) => setData("business_category", e.target.value)}
                  placeholder="e.g. ecommerce, cross-border-ior"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address & Location */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> Address & Location
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Business Address</Label>
              <Input
                value={data.company_address}
                onChange={(e) => setData("company_address", e.target.value)}
                placeholder="Full registered address"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  value={data.company_city}
                  onChange={(e) => setData("company_city", e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Input
                  value={data.country}
                  onChange={(e) => setData("country", e.target.value)}
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Invoice & Tax */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm xl:col-span-2">
          <h3 className="mb-4 text-base font-semibold text-card-foreground flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" /> Invoice & Tax
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Invoice Prefix</Label>
              <Input
                value={data.invoice_prefix}
                onChange={(e) => setData("invoice_prefix", e.target.value)}
                placeholder="INV-"
              />
              <p className="text-[10px] text-muted-foreground">
                Prefix for generated invoices (e.g. INV-0001)
              </p>
            </div>
            <div className="space-y-2">
              <Label>Default Tax Rate (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={data.tax_rate}
                onChange={(e) => setData("tax_rate", e.target.value)}
                placeholder="15"
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
          Save Business Settings
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default Business;
