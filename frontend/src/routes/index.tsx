import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Building2, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/api/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HostelOS — University Hostel Management Sign In" },
      {
        name: "description",
        content:
          "Sign in to HostelOS to manage hostel rooms, out-passes, invoices and student records from one console.",
      },
      { property: "og:title", content: "HostelOS — University Hostel Management" },
      {
        property: "og:description",
        content: "Multi-tenant hostel operations: rooms, leaves, invoices and students in one place.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [role, setRole] = useState<"student" | "admin">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user } = useAuth();
  
  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      window.location.href = user.role === "student" ? "/student/room" : "/admin";
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await apiClient.post("/auth/login", { email, password });
      
      const loggedInUser = data.data.user;
      
      // Enforce UI role selection matches actual DB role
      if (role === 'admin' && loggedInUser.role === 'student') {
        throw new Error('Please select the Student login tab');
      }
      if (role === 'student' && loggedInUser.role !== 'student') {
        throw new Error('Please select the Warden login tab');
      }

      login(data.token, loggedInUser);
      toast.success("Successfully logged in");
      
      window.location.href = loggedInUser.role === "student" ? "/student/room" : "/admin";
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="mesh-bg relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-sidebar-primary font-display text-xl font-bold text-sidebar-primary-foreground">
            H
          </span>
          <span className="font-display text-xl font-semibold">HostelOS</span>
        </div>
        <div className="max-w-md">
          <h1 className="font-display text-4xl leading-tight font-semibold">
            Every room, out-pass and invoice — under one roof.
          </h1>
          <p className="mt-4 text-sidebar-foreground/70">
            The multi-tenant operating system for university hostels. Built for wardens who need
            answers before the queue forms at the desk.
          </p>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              { icon: Building2, text: "Live floor-by-floor occupancy maps" },
              { icon: ShieldCheck, text: "Out-pass approvals with exit & return tracking" },
              { icon: Sparkles, text: "Semester invoicing and collection insights" },
            ].map((f) => (
              <li key={f.text} className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-lg bg-sidebar-accent">
                  <f.icon className="size-4 text-sidebar-primary" />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-sidebar-foreground/50">
          Trusted by 12 residence blocks · 4,200 students
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center rounded-xl bg-primary font-display text-lg font-bold text-primary-foreground">
              H
            </span>
            <span className="font-display text-lg font-semibold">HostelOS</span>
          </div>
          <h2 className="font-display text-2xl font-semibold">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to continue to your console.</p>

          <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
            {(
              [
                { key: "admin", label: "Warden", icon: ShieldCheck },
                { key: "student", label: "Student", icon: GraduationCap },
              ] as const
            ).map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  role === r.key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <r.icon className="size-4" />
                {r.label}
              </button>
            ))}
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={handleLogin}
          >
            <div className="space-y-2">
              <Label htmlFor="email">University email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={role === "admin" ? "warden@univ.edu" : "student@univ.edu"}
                key={role}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline">
                  Forgot?
                </button>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-dashed border-border p-4 text-center">
            <p className="text-sm text-muted-foreground">New to campus housing?</p>
            <Button asChild variant="outline" className="mt-3 w-full">
              <Link to="/register">Student registration</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
