import { Link, Outlet, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { BedDouble, CalendarClock, LogOut, Receipt, Repeat2, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { useAuth } from "@/context/AuthContext";

const tabs = [
  { to: "/student/room", label: "My Room", icon: BedDouble },
  { to: "/student/requests", label: "My Requests", icon: Repeat2 },
  { to: "/student/leaves", label: "My Leaves", icon: CalendarClock },
  { to: "/student/financials", label: "Financials", icon: Receipt },
] as const;

export function StudentShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { logout } = useAuth();

  const { data: student } = useQuery({
    queryKey: ['student-me'],
    queryFn: async () => {
      const res = await apiClient.get('/students/me');
      return res.data.data.student;
    }
  });

  const { data: notifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiClient.get('/notifications');
      return res.data.data.notifications;
    }
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    await apiClient.patch(`/notifications/${id}/read`);
    refetchNotifications();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/student/room" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
              H
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">HostelOS</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{student?.user_id?.name || "Student"}</p>
              <p className="text-xs text-muted-foreground">
                {student?.hostel_id?.name || "Hostel"} · {student?.room_id?.room_number || "Room"}
              </p>
            </div>
            
            <div ref={notifRef} className="relative">
              <button
                className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="size-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex size-2 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-md z-50">
                  <div className="p-3 border-b border-border flex justify-between items-center bg-muted/20">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      No new notifications.
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {notifications.map((n: any) => (
                        <li key={n._id} className={`p-3 ${!n.read ? 'bg-primary/5' : ''}`}>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="text-sm font-medium">{n.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                            </div>
                            {!n.read && (
                              <button 
                                onClick={() => markAsRead(n._id)}
                                className="text-[10px] text-primary hover:underline whitespace-nowrap"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                logout();
                navigate({ to: '/' });
              }}
              className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
        <div className="mx-auto max-w-6xl overflow-x-auto px-4">
          <nav className="flex gap-1">
            {tabs.map((t) => {
              const active = pathname === t.to;
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className={cn(
                    "flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                    active
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  <t.icon className="size-4" />
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
