import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Repeat2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const hostels = ["Aravali Hall", "Nilgiri Hall", "Shivalik Hall"];
const rooms = [
  { id: "A-101", hostel: "Aravali Hall", number: "A-101", state: "Vacant", type: "Single", floor: 1 },
  { id: "A-102", hostel: "Aravali Hall", number: "A-102", state: "Vacant", type: "Double", floor: 1 },
  { id: "N-201", hostel: "Nilgiri Hall", number: "N-201", state: "Vacant", type: "Double", floor: 2 },
];
const roomRequests = [
  { id: "RQ-910", currentRoom: "A-104", requestedRoom: "A-101", reason: "Roommate conflict", status: "Approved", submittedOn: "2026-07-20" },
  { id: "RQ-911", currentRoom: "A-104", requestedRoom: "N-201", reason: "Closer to lab block", status: "Rejected", submittedOn: "2026-07-21" },
];

export const Route = createFileRoute("/student/requests")({
  head: () => ({
    meta: [
      { title: "My Room Requests — HostelOS" },
      {
        name: "description",
        content: "Submit a room change request and track approvals from your hostel warden.",
      },
      { property: "og:title", content: "My Room Requests — HostelOS" },
      { property: "og:description", content: "Request a room change and follow its approval status." },
    ],
  }),
  component: MyRequests,
});

function MyRequests() {
  const [hostel, setHostel] = useState("Aravali Hall");
  const vacant = rooms.filter((r) => r.hostel === hostel && r.state === "Vacant");
  const history = roomRequests.slice(0, 4);

  return (
    <>
      <PageHeader title="My requests" subtitle="Room change requests and their status" />
      <div className="grid gap-5 lg:grid-cols-5">
        <form
          className="glass-panel space-y-4 rounded-2xl p-6 lg:col-span-2"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Room request submitted", { description: "Warden review within 48 hours." });
          }}
        >
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Repeat2 className="size-4 text-primary" /> New room request
          </h3>
          <div className="space-y-2">
            <Label>Hostel block</Label>
            <Select value={hostel} onValueChange={setHostel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {hostels.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Preferred room</Label>
            <Select key={hostel} defaultValue={vacant[0]?.number ?? "none"}>
              <SelectTrigger>
                <SelectValue placeholder="Select a vacant room" />
              </SelectTrigger>
              <SelectContent>
                {vacant.length === 0 ? (
                  <SelectItem value="none">No vacancies in this block</SelectItem>
                ) : (
                  vacant.map((r) => (
                    <SelectItem key={r.id} value={r.number}>
                      {r.number} · {r.type} · Floor {r.floor}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" rows={4} placeholder="Tell the warden why you need this change" />
          </div>
          <Button type="submit" className="w-full">
            Submit request
          </Button>
        </form>

        <div className="glass-panel rounded-2xl p-6 lg:col-span-3">
          <h3 className="text-base font-semibold">Request history</h3>
          <ul className="mt-4 space-y-3">
            {history.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {r.currentRoom} → {r.requestedRoom}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.reason} · submitted {r.submittedOn}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">{r.id}</span>
                <StatusBadge status={r.status as any} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
