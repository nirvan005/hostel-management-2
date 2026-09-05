import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/api/client";
import { useState } from "react";

export const Route = createFileRoute("/admin-invite")({
  component: AdminInvitePage,
});

function AdminInvitePage() {
  const navigate = useNavigate();
  // Get token from URL search params manually, or via route context
  const searchParams = new URLSearchParams(window.location.search);
  const token = searchParams.get('token') || '';

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    confirm: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("No invite token found in URL");
      return;
    }
    if (formData.password !== formData.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await apiClient.post("/auth/register-admin", {
        token,
        name: formData.name,
        phone: formData.phone,
        password: formData.password
      });
      toast.success("Warden account activated! Please log in.");
      navigate({ to: "/" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Activation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to sign in
        </Link>
        <h1 className="mt-6 font-display text-2xl font-semibold">Activate Warden Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome to HostelOS. Please set up your profile to activate your console.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input 
              id="name" 
              placeholder="Warden Kapoor" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <Input 
              id="phone" 
              placeholder="+91 98765 43210" 
              required 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input 
                id="confirm" 
                type="password" 
                required 
                value={formData.confirm}
                onChange={e => setFormData({...formData, confirm: e.target.value})}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Activating..." : "Activate account"}
          </Button>
        </form>
      </div>
    </div>
  );
}
