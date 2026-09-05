import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Building2,
  CalendarClock,
  LayoutDashboard,
  LogOut,
  Receipt,
  Search,
  Users,
  UserPlus,
  Inbox
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { useNavigate } from "@tanstack/react-router";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/leaves", label: "Leaves", icon: CalendarClock },
  { to: "/admin/requests", label: "Requests", icon: Inbox },
  { to: "/admin/invoices", label: "Invoices", icon: Receipt },
  { to: "/admin/rooms", label: "Rooms", icon: Building2 },
] as { to: string; label: string; icon: typeof Users; exact?: boolean }[];

export function AdminShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: searchResults = [] } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const res = await apiClient.get(`/search?q=${searchQuery}`);
      return res.data.data.results;
    },
    enabled: searchQuery.length > 0
  });

  // Dynamically inject Staff nav item if super admin
  const dynamicNav = [...nav];
  if (user?.role === 'super_admin' && !dynamicNav.find(n => n.to === '/admin/staff')) {
    dynamicNav.push({ to: '/admin/staff', label: 'Staff', icon: UserPlus });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar p-4 text-sidebar-foreground md:flex">
        <Link to="/admin" className="flex items-center gap-2.5 px-2 py-3">
          <span className="grid size-9 place-items-center rounded-xl bg-sidebar-primary font-display text-lg font-bold text-sidebar-primary-foreground">
            H
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">HostelOS</span>
        </Link>
        <p className="mt-4 px-3 text-[11px] font-semibold tracking-widest text-sidebar-foreground/45 uppercase">
          Warden console
        </p>
        <nav className="mt-2 space-y-1">
          {dynamicNav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to as never}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-xl bg-sidebar-accent/50 p-3">
          <p className="text-sm font-medium">{user?.name || 'Warden Kapoor'}</p>
          <p className="text-xs text-sidebar-foreground/60">{user?.role === 'super_admin' ? 'Chief Warden' : 'Warden'}</p>
          <button
            onClick={logout}
            className="mt-3 inline-flex items-center gap-2 text-xs text-sidebar-foreground/70 hover:text-sidebar-primary w-full"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:px-8">
          <div ref={searchRef} className="relative w-full max-w-sm">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search students, rooms, invoices…" 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
            />
            
            {/* Search Dropdown */}
            {showResults && searchQuery && (
              <div className="absolute top-full left-0 mt-2 w-full max-h-80 overflow-y-auto rounded-xl border border-border bg-popover text-popover-foreground shadow-md z-50">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No results found.
                  </div>
                ) : (
                  <ul className="p-2 space-y-1">
                    {searchResults.map((result: any, idx: number) => (
                      <li key={idx}>
                        <button
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted text-left transition-colors"
                          onClick={() => {
                            setShowResults(false);
                            setSearchQuery("");
                            navigate({ to: result.link });
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{result.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {result.type} • {result.subtitle}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <nav className="ml-auto flex gap-1 md:hidden">
            {dynamicNav.map((item) => (
              <Link
                key={item.to}
                to={item.to as never}
                className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <item.icon className="size-4" />
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
