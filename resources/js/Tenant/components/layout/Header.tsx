/**
 * Header — sGTM Tracking Platform
 * Design: dashboard-builder-main pattern
 * Simplified: removed region switcher, ecommerce storefront link
 */
import { useState, useRef, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
  Menu, Search, Sun, Moon, Bell, ChevronDown, Settings,
  LogOut, User, X, Activity,
} from "lucide-react";
import { useTheme } from "@Tenant/hooks/useTheme";
import { NotificationCenter, useNotifications } from "./NotificationCenter";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@Tenant/hooks/useLanguage";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const Header = ({ sidebarOpen, onToggleSidebar }: HeaderProps) => {
    const { t } = useLanguage();
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const notifications = useNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;

    const { auth } = usePage().props as unknown as { auth: { user: any } };
    const user = auth?.user;

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-white px-4 sm:px-6 shadow-none">
            {/* Left side */}
            <div className="flex items-center gap-4 flex-1">
                <button
                    onClick={onToggleSidebar}
                    className="lg:hidden rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground"
                >
                    <Menu className="h-5 w-5" />
                </button>

                <div className={`relative hidden sm:flex items-center w-full max-w-md group`}>
                    <div className={`absolute left-3 transition-colors ${searchFocused ? 'text-primary' : 'text-muted-foreground'}`}>
                        <Search className="h-4 w-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search sGTM resources..."
                        className={`h-9 w-full rounded-lg border bg-slate-50 pl-10 pr-4 text-xs font-medium outline-none transition-all placeholder:text-muted-foreground/60 ${
                            searchFocused 
                            ? 'border-primary ring-1 ring-primary bg-white shadow-sm' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                    />
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Status */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Node: Healthy</span>
                </div>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                        className={`relative rounded-lg p-2 transition-all ${notifOpen ? 'bg-slate-100 text-primary' : 'text-muted-foreground hover:bg-slate-50 hover:text-foreground'}`}
                    >
                        <Bell className="h-4.5 w-4.5" />
                        {unreadCount > 0 && (
                            <span className="absolute right-1.5 top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent px-1 text-[8px] font-black text-white">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <NotificationCenter open={notifOpen} onClose={() => setNotifOpen(false)} />
                </div>

                <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

                {/* Profile */}
                <div className="relative">
                    <button
                        onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                        className={`flex items-center gap-2.5 rounded-lg p-1 transition-all ${profileOpen ? 'bg-slate-100' : 'hover:bg-slate-50'}`}
                    >
                        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white text-xs font-black uppercase shadow-sm">
                            {user?.name ? user.name.charAt(0) : 'A'}
                        </div>
                        <div className="hidden text-left lg:block mr-1">
                            <p className="text-xs font-bold text-foreground leading-none">{user?.name || 'Administrator'}</p>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{user?.email || 'admin@pixelmaster.io'}</p>
                        </div>
                        <ChevronDown className={`hidden h-3 w-3 text-muted-foreground lg:block transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl animate-in zoom-in-95 duration-100">
                            <div className="px-3 py-2 border-b border-slate-100 mb-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Signed in as</p>
                                <p className="text-xs font-bold text-foreground truncate">{user?.email || 'admin'}</p>
                            </div>
                            <Link href="/profile" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold text-foreground transition-colors hover:bg-slate-50">
                                <User className="h-3.5 w-3.5 text-muted-foreground" /> Account Settings
                            </Link>
                            <Link href="/settings" className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold text-foreground transition-colors hover:bg-slate-50">
                                <Settings className="h-3.5 w-3.5 text-muted-foreground" /> GTM Configuration
                            </Link>
                            <div className="my-1 h-px bg-slate-100" />
                            <Link href="/auth/logout" method="post" as="button" className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-50">
                                <LogOut className="h-3.5 w-3.5" /> Sign Out
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
