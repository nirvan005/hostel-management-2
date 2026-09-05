import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/api/client";
import { useState } from "react";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Student Registration — HostelOS" },
      {
        name: "description",
        content: "Register for campus housing with your university email and get your hostel account.",
      },
      { property: "og:title", content: "Student Registration — HostelOS" },
      {
        property: "og:description",
        content: "Create your HostelOS student account to request rooms, out-passes and pay fees.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    university_id: "",
    password: "",
    confirm: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await apiClient.post("/auth/register-student", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        university_id: formData.university_id,
        password: formData.password
      });
      toast.success("Account created successfully. You can now log in.");
      navigate({ to: "/" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
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
        <h1 className="mt-6 font-display text-2xl font-semibold">Student registration</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use your university email — accounts are verified by the hostel office.
        </p>
        <form
          className="mt-6 space-y-4"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input 
              id="name" 
              placeholder="Aarav Gupta" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">University email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@univ.edu" 
                required 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                placeholder="+91 98765 43210" 
                required 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="univ_id">University ID (Enrollment No.)</Label>
            <Input 
                id="univ_id" 
                placeholder="2024CS012" 
                required 
                value={formData.university_id}
                onChange={e => setFormData({...formData, university_id: e.target.value})}
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
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </div>
    </div>
  );
}
