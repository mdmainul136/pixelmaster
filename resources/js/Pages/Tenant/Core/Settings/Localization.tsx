import React from "react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { Input } from "@Tenant/components/ui/input";
import { Label } from "@Tenant/components/ui/label";
import { Button } from "@Tenant/components/ui/button";
import { Switch } from "@Tenant/components/ui/switch";
import { useForm, Head, Link } from "@inertiajs/react";
import { toast } from "sonner";
import {
  Globe,
  Calendar,
  Save,
  Loader2,
  ArrowLeft,
  DollarSign,
  Ruler,
} from "lucide-react";

interface LocalizationSettings {
  currency_code: string;
  currency_symbol: string;
  timezone: string;
  date_format: string;
  measurement_unit: string;
  fiscal_year_start: number | string;
  is_global: boolean;
  available_countries: string;
  auto_language_switcher: boolean;
  multi_currency_detection: boolean;
}

interface Props {
  settings: LocalizationSettings;
}

const Localization = ({ settings }: Props) => {
  const route = (window as any).route;

  const { data, setData, post, processing, errors } = useForm({
    currency_code: settings.currency_code || "BDT",
    currency_symbol: settings.currency_symbol || "৳",
    timezone: settings.timezone || "Asia/Dhaka",
    date_format: settings.date_format || "Y-m-d",
    measurement_unit: settings.measurement_unit || "metric",
    fiscal_year_start: settings.fiscal_year_start || 1,
    is_global: settings.is_global || false,
    auto_language_switcher: settings.auto_language_switcher || false,
    multi_currency_detection: settings.multi_currency_detection || false,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    post(route("tenant.settings.update") + "?section=localization", {
      onSuccess: () => toast.success("Localization settings updated"),
      onError: () => toast.error("Failed to update localization settings"),
    });
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  return (
    <DashboardLayout>
      <Head title="Localization Settings" />

      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href={route("tenant.settings")}
          className="rounded-lg p-2 hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Localization</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Currency, timezone, and regional preferences
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 xl:grid-cols-2 pb-20">
        {/* Currency */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" /> Currency
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Currency Code</Label>
                <Input
                  value={data.currency_code}
                  onChange={(e) => setData("currency_code", e.target.value)}
                  placeholder="BDT"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency Symbol</Label>
                <Input
                  value={data.currency_symbol}
                  onChange={(e) => setData("currency_symbol", e.target.value)}
                  placeholder="৳"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Time & Date */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Time & Date
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input
                value={data.timezone}
                onChange={(e) => setData("timezone", e.target.value)}
                placeholder="Asia/Dhaka"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date Format</Label>
                <select
                  value={data.date_format}
                  onChange={(e) => setData("date_format", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Y-m-d">2026-03-19 (Y-m-d)</option>
                  <option value="d/m/Y">19/03/2026 (d/m/Y)</option>
                  <option value="m/d/Y">03/19/2026 (m/d/Y)</option>
                  <option value="d-M-Y">19-Mar-2026 (d-M-Y)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Fiscal Year Starts</Label>
                <select
                  value={data.fiscal_year_start}
                  onChange={(e) =>
                    setData("fiscal_year_start", parseInt(e.target.value))
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {months.map((m, i) => (
                    <option key={i + 1} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Measurement & Region */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" /> Measurement
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Measurement Unit</Label>
              <div className="flex gap-3">
                {["metric", "imperial"].map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setData("measurement_unit", unit)}
                    className={`flex-1 rounded-lg border p-3 text-center text-sm font-medium transition-all ${
                      data.measurement_unit === unit
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    {unit === "metric" ? "Metric (kg, cm)" : "Imperial (lb, in)"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Region Toggles */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-card-foreground flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" /> Multi-Region
          </h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Global Store</p>
                <p className="text-xs text-muted-foreground">
                  Enable for international customers
                </p>
              </div>
              <Switch
                checked={data.is_global}
                onCheckedChange={(v) => setData("is_global", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Auto Language Switcher
                </p>
                <p className="text-xs text-muted-foreground">
                  Detect visitor language automatically
                </p>
              </div>
              <Switch
                checked={data.auto_language_switcher}
                onCheckedChange={(v) => setData("auto_language_switcher", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Multi-Currency Detection
                </p>
                <p className="text-xs text-muted-foreground">
                  Show prices in visitor's local currency
                </p>
              </div>
              <Switch
                checked={data.multi_currency_detection}
                onCheckedChange={(v) => setData("multi_currency_detection", v)}
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
          Save Localization
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default Localization;
