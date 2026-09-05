import { createFileRoute } from "@tanstack/react-router";
import { Check, X, Building, Search, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/admin/requests")({
  head: () => ({
    meta: [{ title: "Room Requests — HostelOS" }],
  }),
  component: AdminRequests,
});

function AdminRequests() {
  const queryClient = useQueryClient();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [adminComment, setAdminComment] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      const res = await apiClient.get('/requests');
      return res.data.data.requests;
    }
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['admin-rooms'],
    queryFn: async () => {
      const res = await apiClient.get('/rooms');
      return res.data.data.rooms;
    }
  });

  const updateRequest = useMutation({
    mutationFn: async ({ id, status, room_id, admin_comment }: any) => {
      await apiClient.patch(`/requests/${id}`, { status, room_id, admin_comment });
    },
    onSuccess: () => {
      toast.success("Request updated successfully");
      setIsDialogOpen(false);
      setSelectedRequestId(null);
      setSelectedRoomId("");
      setAdminComment("");
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update request");
    }
  });

  if (requestsLoading) return <div className="p-8 text-center">Loading requests...</div>;

  const handleApprove = (reqId: string) => {
    if (!selectedRoomId) return toast.error("Please select a room to assign");
    updateRequest.mutate({ id: reqId, status: 'approved', room_id: selectedRoomId, admin_comment: adminComment });
  };

  const handleReject = (reqId: string) => {
    updateRequest.mutate({ id: reqId, status: 'rejected', admin_comment: adminComment });
  };

  return (
    <>
      <PageHeader title="Room requests" subtitle="Manage new allocations and room changes" />
      <div className="glass-panel mt-6 overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/50 bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="px-5 py-4">Student</th>
                <th className="px-5 py-4">Type</th>
                <th className="px-5 py-4">Preference</th>
                <th className="px-5 py-4">Reason</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {requests.map((req: any) => (
                <tr key={req._id} className="transition-colors hover:bg-muted/20">
                  <td className="px-5 py-4">
                    <p className="font-medium">{req.student_id?.user_id?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{req.student_id?.user_id?.university_id || req.student_id?.user_id?.email}</p>
                  </td>
                  <td className="px-5 py-4 font-medium">
                    {req.request_type === 'new_allocation' ? 'New Allotment' : 'Room Change'}
                  </td>
                  <td className="px-5 py-4">
                    {req.preferred_room_type || 'Any'} in {req.hostel_id?.name || 'Any Hostel'}
                  </td>
                  <td className="px-5 py-4 text-muted-foreground max-w-[200px] truncate">
                    {req.reason || '-'}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={req.status as any} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    {req.status === 'pending' ? (
                      <Dialog open={isDialogOpen && selectedRequestId === req._id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (open) setSelectedRequestId(req._id);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm">Review</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Review Room Request</DialogTitle>
                            <DialogDescription>
                              Approve or reject the {req.request_type === 'new_allocation' ? 'new allotment' : 'room change'} request for {req.student_id?.user_id?.name}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Student Reason</h4>
                              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">{req.reason || 'No reason provided.'}</p>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Assign Room</label>
                              <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an available room" />
                                </SelectTrigger>
                                <SelectContent>
                                  {rooms.filter((r: any) => r.status !== 'maintenance' && r.occupants.length < r.capacity && r.hostel_id?._id === req.hostel_id?._id).map((r: any) => (
                                    <SelectItem key={r._id} value={r._id}>
                                      {r.room_number} ({r.capacity}-Seater, {r.capacity - r.occupants.length} vacant)
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Comments (Optional)</label>
                              <Textarea value={adminComment} onChange={e => setAdminComment(e.target.value)} placeholder="Note for the student..." />
                            </div>
                          </div>
                          <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="destructive" onClick={() => handleReject(req._id)} disabled={updateRequest.isPending}>
                              Reject Request
                            </Button>
                            <Button onClick={() => handleApprove(req._id)} disabled={updateRequest.isPending}>
                              Approve & Assign Room
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <span className="text-xs text-muted-foreground">{req.admin_comment || 'Reviewed'}</span>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                    No room requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
