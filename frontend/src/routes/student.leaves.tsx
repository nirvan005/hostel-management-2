import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export type LeaveStage = "Pending" | "Approved" | "Exited" | "Returned" | "Rejected";

export interface LeaveRequest {
  id: string;
  from: string;
  to: string;
  destination: string;
  reason: string;
  stage: LeaveStage;
}

const timeline = ["Submitted", "Warden approved", "Exited campus", "Returned"];

export const Route = createFileRoute("/student/leaves")({
  head: () => ({
    meta: [
      { title: "My Out-Passes — HostelOS" },
      {
        name: "description",
        content: "Apply for hostel leave and track your out-pass from submission to return.",
      },
      { property: "og:title", content: "My Out-Passes — HostelOS" },
      { property: "og:description", content: "Apply for leave and follow your out-pass status." },
    ],
  }),
  component: MyLeaves,
});

function MyLeaves() {
  const queryClient = useQueryClient();

  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ['my-leaves'],
    queryFn: async () => {
      const res = await apiClient.get('/leaves');
      return res.data.data.leaves.map((l: any) => {
        let stage: LeaveStage = "Pending";
        if (l.status === "approved") stage = "Approved";
        else if (l.status === "rejected") stage = "Rejected";
        else if (l.status === "active") stage = "Exited";
        else if (l.status === "completed") stage = "Returned";

        return {
          id: l._id.substring(0, 8).toUpperCase(),
          from: new Date(l.start_date).toLocaleDateString(),
          to: new Date(l.end_date).toLocaleDateString(),
          destination: "N/A", // Destination wasn't in schema, could use reason/notes
          reason: l.reason,
          stage
        } as LeaveRequest;
      });
    }
  });

  const applyLeave = useMutation({
    mutationFn: async (data: { start_date: string, end_date: string, reason: string }) => {
      await apiClient.post('/leaves', data);
    },
    onSuccess: () => {
      toast.success("Out-pass request sent to warden");
      queryClient.invalidateQueries({ queryKey: ['my-leaves'] });
      // Reset form could be handled by a ref, but simple is fine
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit request");
    }
  });

  // Sort by date (newest first)
  const sortedLeaves = [...leaves].reverse();
  const active = sortedLeaves[0]; // Just showing the latest one as active for demonstration
  
  const stageIndex = active ? 
    (active.stage === "Returned" ? 3 : active.stage === "Exited" ? 2 : active.stage === "Approved" ? 1 : 0) : 0;

  return (
    <>
      <PageHeader title="My leaves" subtitle="Out-pass requests and campus exit tracking" />
      <div className="grid gap-5 lg:grid-cols-5">
        <form
          className="glass-panel space-y-4 rounded-2xl p-6 lg:col-span-2"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            applyLeave.mutate({
              start_date: formData.get('from') as string,
              end_date: formData.get('to') as string,
              reason: formData.get('why') as string,
            });
            e.currentTarget.reset();
          }}
        >
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <CalendarClock className="size-4 text-primary" /> Request leave
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="from">Start date</Label>
              <Input id="from" name="from" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">End date</Label>
              <Input id="to" name="to" type="date" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="why">Reason / Destination</Label>
            <Textarea id="why" name="why" rows={4} placeholder="Reason for leave" required />
          </div>
          <Button type="submit" className="w-full" disabled={applyLeave.isPending}>
            {applyLeave.isPending ? "Submitting..." : "Submit out-pass"}
          </Button>
        </form>

        <div className="space-y-5 lg:col-span-3">
          <div className="glass-panel rounded-2xl p-6">
            {active ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">Latest out-pass · {active.id}</h3>
                  <StatusBadge status={active.stage} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {active.from} → {active.to}
                </p>
                <ol className="mt-5 space-y-4">
                  {timeline.map((step, i) => (
                    <li key={step} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        {i <= stageIndex ? (
                          <CheckCircle2 className="size-5 text-success" />
                        ) : (
                          <Circle className="size-5 text-muted-foreground/50" />
                        )}
                        {i < timeline.length - 1 ? (
                          <span
                            className={`mt-1 w-px flex-1 ${i < stageIndex ? "bg-success" : "bg-border"}`}
                          />
                        ) : null}
                      </div>
                      <div className="pb-4">
                        <p
                          className={`text-sm font-medium ${i <= stageIndex ? "" : "text-muted-foreground"}`}
                        >
                          {step}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {i <= stageIndex ? "Completed" : "Pending"}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">You have no leave requests yet.</p>
            )}
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-base font-semibold">Past leaves</h3>
            <ul className="mt-4 space-y-3">
              {sortedLeaves.slice(1).map((l: LeaveRequest) => (
                <li
                  key={l.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {l.from} → {l.to}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{l.reason}</p>
                  </div>
                  <StatusBadge status={l.stage} />
                </li>
              ))}
              {sortedLeaves.length <= 1 ? (
                <p className="text-xs text-muted-foreground text-center">No past leaves found.</p>
              ) : null}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
