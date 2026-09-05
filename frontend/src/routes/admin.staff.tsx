import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Copy, Link as LinkIcon } from "lucide-react";
import { apiClient } from "@/api/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/admin/staff")({
  component: StaffPage,
});

interface Invite {
  _id: string;
  email: string;
  role: string;
  token: string;
  status: string;
  expiresAt: string;
}

function StaffPage() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // New Invite Form
  const [email, setEmail] = useState("");
  const [hostelIds, setHostelIds] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  const fetchInvites = async () => {
    try {
      const { data } = await apiClient.get('/invites');
      setInvites(data.data.invites);
    } catch (error) {
      toast.error("Failed to load invites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'super_admin') {
      fetchInvites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    try {
      const hostelsArray = hostelIds.split(',').map(id => id.trim()).filter(id => id.length > 0);
      
      const { data } = await apiClient.post('/invites', {
        email,
        role: 'admin',
        hostels: hostelsArray
      });
      
      const token = data.data.token;
      setGeneratedLink(`${window.location.origin}/admin-invite?token=${token}`);
      toast.success("Invite generated successfully!");
      fetchInvites(); // Refresh list
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to generate invite");
    } finally {
      setInviteLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast.success("Link copied to clipboard!");
  };

  if (user?.role !== 'super_admin') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-2xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">Only the Chief Warden can manage staff invites.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title="Staff Management"
          subtitle="Generate and manage secure invite links for new Wardens."
        />
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setGeneratedLink(""); // Reset when closing
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 size-4" />
              Invite Warden
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Invite New Warden</DialogTitle>
              <DialogDescription>
                Generate a secure link that allows a new warden to set up their account.
              </DialogDescription>
            </DialogHeader>
            
            {!generatedLink ? (
              <form onSubmit={handleCreateInvite} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Warden's Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required 
                    placeholder="warden@univ.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hostels">Assigned Hostel IDs (comma separated)</Label>
                  <Input 
                    id="hostels" 
                    placeholder="e.g. 64b8f...a1, 64b8f...a2"
                    value={hostelIds}
                    onChange={(e) => setHostelIds(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Leave blank for no initial assignment</p>
                </div>
                <Button type="submit" className="w-full" disabled={inviteLoading}>
                  {inviteLoading ? "Generating..." : "Generate Link"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4 pt-4">
                <div className="rounded-lg bg-green-500/10 p-4 border border-green-500/20">
                  <h4 className="text-sm font-medium text-green-700 dark:text-green-400">Invite Generated!</h4>
                  <p className="text-xs text-green-600/80 mt-1 dark:text-green-400/80">Send this secure link to the warden.</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Input readOnly value={generatedLink} className="font-mono text-xs" />
                  <Button size="icon" variant="outline" onClick={copyLink}>
                    <Copy className="size-4" />
                  </Button>
                </div>
                <Button variant="secondary" className="w-full mt-4" onClick={() => setDialogOpen(false)}>
                  Done
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Expires At</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : invites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No active invites found.
                </TableCell>
              </TableRow>
            ) : (
              invites.map((invite) => {
                const isExpired = new Date(invite.expiresAt) < new Date();
                return (
                  <TableRow key={invite._id}>
                    <TableCell className="font-medium">{invite.email}</TableCell>
                    <TableCell className="capitalize">{invite.role}</TableCell>
                    <TableCell>{new Date(invite.expiresAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {invite.status === 'accepted' ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Accepted
                        </span>
                      ) : isExpired ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Pending
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
