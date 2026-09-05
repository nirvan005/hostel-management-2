import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, DoorOpen, LogIn, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export type LeaveStage = "Pending" | "Approved" | "Exited" | "Returned" | "Rejected";

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  room: string;
  from: string;
  to: string;
  destination: string;
  reason: string;
  stage: LeaveStage;
}

export const Route = createFileRoute("/admin/leaves")({
  head: () => ({
    meta: [
      { title: "Leave & Out-Pass Management — HostelOS Admin" },
      {
        name: "description",
        content:
          "Approve or reject student out-passes and track campus exit and return in real time.",
      },
      { property: "og:title", content: "Leave & Out-Pass Management — HostelOS" },
      {
        property: "og:description",
        content: "Warden queue for approving out-passes and logging exits and returns.",
      },
    ],
  }),
  component: LeavesPage,
});

function LeavesPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");

  const { data: leavesData = [], isLoading } = useQuery({
    queryKey: ['leaves'],
    queryFn: async () => {
      const res = await apiClient.get('/leaves');
      return res.data.data.leaves.map((l: any) => {
        let stage: LeaveStage = "Pending";
        if (l.status === "approved") stage = "Approved";
        else if (l.status === "rejected") stage = "Rejected";
        else if (l.status === "active") stage = "Exited";
        else if (l.status === "completed") stage = "Returned";

        return {
          id: l._id,
          studentId: l.student_id?.user_id?.university_id || l.student_id?._id,
          studentName: l.student_id?.user_id?.name || "Unknown",
          room: "Unknown", // Assuming room info isn't deeply populated for leaves
          from: new Date(l.start_date).toLocaleDateString(),
          to: new Date(l.end_date).toLocaleDateString(),
          destination: "N/A",
          reason: l.reason,
          stage
        } as LeaveRequest;
      });
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await apiClient.patch(`/leaves/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success("Leave status updated");
    }
  });

  const markGate = useMutation({
    mutationFn: async ({ id, action }: { id: string, action: string }) => {
      await apiClient.patch(`/leaves/${id}/gate`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success("Gate movement logged");
    }
  });

  const rows = useMemo(
    () => leavesData.filter((l: LeaveRequest) => filter === "all" || l.stage === filter),
    [filter, leavesData],
  );

  const counts = {
    pending: leavesData.filter((l: LeaveRequest) => l.stage === "Pending").length,
    offCampus: leavesData.filter((l: LeaveRequest) => l.stage === "Exited").length,
  };

  return (
    <>
      <PageHeader
        title="Leaves & out-passes"
        subtitle={`${counts.pending} awaiting approval · ${counts.offCampus} currently off-campus`}
        actions={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All requests</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Exited">Off-campus</SelectItem>
              <SelectItem value="Returned">Returned</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="glass-panel overflow-x-auto rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead className="hidden md:table-cell">Room</TableHead>
              <TableHead className="hidden lg:table-cell">Dates</TableHead>
              <TableHead className="hidden xl:table-cell">Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Loading requests...
                </TableCell>
              </TableRow>
            ) : null}
            {rows.map((l: LeaveRequest) => {
              const stage = l.stage;
              return (
                <TableRow key={l.id}>
                  <TableCell>
                    <p className="font-medium">{l.studentName}</p>
                    <p className="font-mono text-xs text-muted-foreground">{l.id}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{l.room}</TableCell>
                  <TableCell className="hidden text-sm whitespace-nowrap lg:table-cell">
                    {l.from} → {l.to}
                  </TableCell>
                  <TableCell className="hidden max-w-56 truncate text-sm text-muted-foreground xl:table-cell">
                    {l.reason} · {l.destination}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={stage} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {stage === "Pending" ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateStatus.mutate({ id: l.id, status: 'approved' })}
                          >
                            <Check className="size-4" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus.mutate({ id: l.id, status: 'rejected' })}
                          >
                            <X className="size-4" /> Reject
                          </Button>
                        </>
                      ) : null}
                      {stage === "Approved" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => markGate.mutate({ id: l.id, action: 'exit' })}
                        >
                          <DoorOpen className="size-4" /> Mark exited
                        </Button>
                      ) : null}
                      {stage === "Exited" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => markGate.mutate({ id: l.id, action: 'entry' })}
                        >
                          <LogIn className="size-4" /> Mark returned
                        </Button>
                      ) : null}
                      {stage === "Returned" || stage === "Rejected" ? (
                        <span className="text-xs text-muted-foreground">Closed</span>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Nothing in this queue.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
