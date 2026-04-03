import { useSyncExternalStore } from "react";
import { Bell, Check, CheckCheck, Trash2, ShoppingCart, Package, Monitor, Users, DollarSign, X, BookOpen, Award, Flame, FileText, GraduationCap } from "lucide-react";
import { Badge } from "@Tenant/components/ui/badge";
import { Button } from "@Tenant/components/ui/button";
import { cn } from "@Tenant/lib/utils";
import { getNotifications, subscribe, markAsRead, markAllAsRead, deleteNotification, type Notification } from "@Tenant/data/notifications";

function useNotifications() { return useSyncExternalStore(subscribe, getNotifications, getNotifications); }

const typeIcons: Record<string, React.ReactNode> = {
  order: <ShoppingCart className="h-4 w-4" />,
  stock: <Package className="h-4 w-4" />,
  system: <Monitor className="h-4 w-4" />,
  staff: <Users className="h-4 w-4" />,
  payment: <DollarSign className="h-4 w-4" />,
  "lms-course": <BookOpen className="h-4 w-4" />,
  "lms-badge": <Award className="h-4 w-4" />,
  "lms-streak": <Flame className="h-4 w-4" />,
  "lms-quiz": <FileText className="h-4 w-4" />,
  "lms-certificate": <GraduationCap className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  order: "bg-primary/10 text-primary",
  stock: "bg-warning/10 text-warning",
  system: "bg-muted text-muted-foreground",
  staff: "bg-violet-500/10 text-violet-600",
  payment: "bg-success/10 text-success",
  "lms-course": "bg-blue-500/10 text-blue-600",
  "lms-badge": "bg-amber-500/10 text-amber-600",
  "lms-streak": "bg-orange-500/10 text-orange-600",
  "lms-quiz": "bg-emerald-500/10 text-emerald-600",
  "lms-certificate": "bg-purple-500/10 text-purple-600",
};

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 60000;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const NotificationCenter = ({ open, onClose }: Props) => {
  const notifications = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!open) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-card-foreground">Notifications</h3>
          {unreadCount > 0 && <Badge className="bg-primary text-primary-foreground text-xs px-1.5">{unreadCount}</Badge>}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="rounded p-1 text-xs text-muted-foreground hover:text-foreground" title="Mark all read">
              <CheckCheck className="h-4 w-4" />
            </button>
          )}
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
        {notifications.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">No notifications</p>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={cn("flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer", !n.read && "bg-primary/5")}
              onClick={() => !n.read && markAsRead(n.id)}
            >
              <div className={cn("mt-0.5 rounded-lg p-2", typeColors[n.type])}>
                {typeIcons[n.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm", !n.read ? "font-semibold text-card-foreground" : "text-card-foreground")}>{n.title}</p>
                <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteNotification(n.id); }} className="mt-1 rounded p-1 text-muted-foreground/50 hover:text-destructive transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export { NotificationCenter, useNotifications };
