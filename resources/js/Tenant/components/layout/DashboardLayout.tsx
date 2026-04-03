/**
 * DashboardLayout — sGTM Tracking Platform
 * Design: dashboard-builder-main pattern (Sidebar + Header + Main)
 */
import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useLanguage } from "@Tenant/hooks/useLanguage";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { dir } = useLanguage();

  return (
    <div className="flex h-screen overflow-hidden bg-background" dir={dir}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
