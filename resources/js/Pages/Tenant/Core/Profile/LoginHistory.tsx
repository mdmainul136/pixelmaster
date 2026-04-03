import React from "react";
import { Head, Link } from "@inertiajs/react";
import DashboardLayout from "@Tenant/components/layout/DashboardLayout";
import { Button } from "@Tenant/components/ui/button";
import { ArrowLeft, Monitor, Smartphone, Globe, History } from "lucide-react";

interface HistoryItem {
  id: number;
  ip_address: string;
  device: string;
  browser: string;
  location: string;
  login_at: string;
  login_at_human: string;
  is_current_device: boolean;
}

interface Props {
  loginHistories: {
    data: HistoryItem[];
    current_page: number;
    last_page: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: any[];
    total: number;
  };
}

export default function LoginHistory({ loginHistories }: Props) {
  const route = (window as any).route;

  return (
    <DashboardLayout>
      <Head title="Login History" />

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={route("tenant.profile")}
            className="rounded-lg p-2 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Login History</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review your recent account access activity and devices.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl">
        <div className="rounded-xl border border-border bg-card shadow-sm mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">Device & Browser</th>
                  <th scope="col" className="px-6 py-4 font-medium">IP Address</th>
                  <th scope="col" className="px-6 py-4 font-medium">Location</th>
                  <th scope="col" className="px-6 py-4 font-medium text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loginHistories.data.length > 0 ? (
                  loginHistories.data.map((history) => (
                    <tr key={history.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            {history.device?.toLowerCase().includes("mac") || 
                             history.device?.toLowerCase().includes("windows") || 
                             history.device?.toLowerCase().includes("linux") ? (
                              <Monitor className="h-4 w-4" />
                            ) : (
                              <Smartphone className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-foreground flex items-center gap-2">
                              {history.device || 'Unknown OS'}
                              {history.is_current_device && (
                                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400 border border-green-500/20">
                                  This Device
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{history.browser || 'Unknown Browser'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{history.ip_address || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {history.location}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-medium text-foreground">{history.login_at_human}</div>
                        <div className="text-xs text-muted-foreground">{history.login_at}</div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <History className="h-10 w-10 text-muted-foreground/50 mb-3" />
                        <p>No login history recorded yet.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {loginHistories.last_page > 1 && (
            <div className="p-4 border-t border-border flex flex-col sm:flex-row sm:justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{(loginHistories.current_page - 1) * 10 + 1}</span> to <span className="font-medium text-foreground">{Math.min(loginHistories.current_page * 10, loginHistories.total)}</span> of <span className="font-medium text-foreground">{loginHistories.total}</span> entries
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={loginHistories.prev_page_url || '#'}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 ${!loginHistories.prev_page_url ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                  preserveScroll
                >
                  Previous
                </Link>
                <Link
                  href={loginHistories.next_page_url || '#'}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 ${!loginHistories.next_page_url ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                  preserveScroll
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
