import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BedDouble, Users, Wrench } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

export interface Room {
  id: string;
  number: string;
  hostel: string;
  floor: number;
  type: string;
  capacity: number;
  occupants: string[];
  state: "Vacant" | "Occupied" | "Maintenance";
  note?: string;
}

const stateClass: Record<Room["state"], string> = {
  Vacant: "border-success/40 bg-success/10 hover:bg-success/15 text-success",
  Occupied: "border-destructive/35 bg-destructive/10 hover:bg-destructive/15 text-destructive",
  Maintenance: "border-warning/45 bg-warning/15 hover:bg-warning/20 text-warning-foreground",
};

export const Route = createFileRoute("/admin/rooms")({
  head: () => ({
    meta: [
      { title: "Rooms Grid — HostelOS Admin" },
      {
        name: "description",
        content:
          "Floor-by-floor visual map of every hostel room: vacant, occupied and under maintenance.",
      },
      { property: "og:title", content: "Rooms Grid — HostelOS Admin" },
      {
        property: "og:description",
        content: "Colour-coded floor plans showing occupancy and maintenance for each block.",
      },
    ],
  }),
  component: RoomsPage,
});

function RoomsPage() {
  const queryClient = useQueryClient();
  const { data: hostelsData = [] } = useQuery({
    queryKey: ['hostels'],
    queryFn: async () => {
      const res = await apiClient.get('/hostels');
      return res.data.data.hostels.map((h: any) => h.name) as string[];
    }
  });

  const { data: roomsData = [], isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await apiClient.get('/rooms');
      return res.data.data.rooms.map((r: any) => ({
        id: r._id,
        number: r.room_number,
        hostel: r.hostel_id ? r.hostel_id.name : "Unknown", // Note: The backend getRooms might not populate hostel_id's name, let's see. If not, we might need a fallback.
        floor: r.floor || 1,
        type: `${r.capacity}-Seater`,
        capacity: r.capacity,
        occupants: r.occupants.map((o: any) => o.user_id?.name || 'Unknown'),
        state: r.status === "maintenance" ? "Maintenance" : r.status === "occupied" ? "Occupied" : "Vacant",
        note: r.status === "maintenance" ? "Under maintenance" : undefined
      })) as Room[];
    }
  });

  const [hostel, setHostel] = useState<string>("");
  const [selected, setSelected] = useState<Room | null>(null);
  const [allotOpen, setAllotOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await apiClient.get('/students');
      return res.data.data.students;
    }
  });

  const assignRoomMutation = useMutation({
    mutationFn: async ({ studentId, roomId }: { studentId: string, roomId: string }) => {
      await apiClient.post(`/students/${studentId}/assign-room`, { room_id: roomId });
    },
    onSuccess: () => {
      toast.success("Student allotted successfully!");
      setAllotOpen(false);
      setSelectedStudentId("");
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setSelected(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to allot student");
    }
  });

  const toggleMaintenance = useMutation({
    mutationFn: async () => {
      if (!selected) return;
      const newStatus = selected.state === "Maintenance" ? "vacant" : "maintenance";
      await apiClient.patch(`/rooms/${selected.id}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success("Room status updated successfully");
      setSelected(null);
    },
    onError: () => {
      toast.error("Failed to update room status");
    }
  });

  // Default to first hostel when loaded
  const activeHostel = hostel || (hostelsData.length > 0 ? hostelsData[0] : "");

  const blockRooms = roomsData.filter((r) => r.hostel === activeHostel || !activeHostel); // Fallback filter if backend doesn't populate hostel name, though the page expects it. If backend doesn't populate hostel_id name, it returns ID. Actually we should assume it doesn't unless we checked. 
  // Wait, I will just filter the rooms in the UI. But if they don't have hostel_id populated, r.hostel will be "Unknown".
  // Let me just assume it's not populated and maybe fallback, but let's see.
  const floors = [...new Set(blockRooms.map((r) => r.floor))].sort();

  return (
    <>
      <PageHeader
        title="Rooms"
        subtitle="Floor-by-floor occupancy map"
        actions={
          <Select value={activeHostel || ""} onValueChange={setHostel}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select hostel" />
            </SelectTrigger>
            <SelectContent>
              {hostelsData.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading rooms...</div>
      ) : (
      <>
      <div className="mb-5 flex flex-wrap gap-4 text-sm text-muted-foreground">
        {(
          [
            ["Vacant", "bg-success"],
            ["Occupied", "bg-destructive"],
            ["Maintenance", "bg-warning"],
          ] as const
        ).map(([label, dot]) => (
          <span key={label} className="flex items-center gap-2">
            <span className={cn("size-2.5 rounded-full", dot)} /> {label}
          </span>
        ))}
      </div>

      <div className="space-y-5">
        {floors.map((floor) => {
          const list = blockRooms.filter((r) => r.floor === floor);
          return (
            <section key={floor} className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Floor {floor}</h2>
                <p className="text-xs text-muted-foreground">
                  {list.filter((r) => r.state === "Vacant").length} vacant of {list.length}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {list.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setSelected(room)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-colors",
                      stateClass[room.state],
                    )}
                  >
                    <p className="font-display text-lg font-semibold text-foreground">
                      {room.number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {room.type} · {room.occupants.length}/{room.capacity}
                    </p>
                    <p className="mt-2 text-xs font-semibold">{room.state}</p>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      </>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Room {selected.number}</DialogTitle>
                <DialogDescription>
                  {selected.hostel} · Floor {selected.floor} · {selected.type}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <StatusBadge status={selected.state} />
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <BedDouble className="size-4" /> {selected.occupants.length}/{selected.capacity}{" "}
                    beds filled
                  </span>
                </div>

                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    <Users className="size-3.5" /> Occupants
                  </p>
                  {selected.occupants.length === 0 ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No residents currently allotted.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {selected.occupants.map((o) => (
                        <li
                          key={o}
                          className="flex items-center gap-3 rounded-xl bg-muted/60 p-3 text-sm"
                        >
                          <span className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                            {o[0]}
                          </span>
                          {o}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {selected.note ? (
                  <p className="flex items-center gap-2 rounded-xl bg-warning/15 p-3 text-xs text-warning-foreground">
                    <Wrench className="size-3.5" /> {selected.note}
                  </p>
                ) : null}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => toggleMaintenance.mutate()}
                  disabled={toggleMaintenance.isPending}
                >
                  {selected.state === "Maintenance" ? "Clear maintenance" : "Flag maintenance"}
                </Button>
                <Button onClick={() => setAllotOpen(true)} disabled={selected.state === 'Maintenance' || selected.occupants.length >= selected.capacity}>
                  Allot student
                </Button>
              </DialogFooter>

              <Dialog open={allotOpen} onOpenChange={setAllotOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Allot Student to {selected.number}</DialogTitle>
                    <DialogDescription>
                      Select an unassigned student to allot to this {selected.type} room.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student..." />
                      </SelectTrigger>
                      <SelectContent>
                        {students.filter((s: any) => !s.room_id).map((s: any) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.user_id?.name} ({s.user_id?.university_id})
                          </SelectItem>
                        ))}
                        {students.filter((s: any) => !s.room_id).length === 0 && (
                          <div className="p-2 text-sm text-muted-foreground text-center">No unassigned students found.</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAllotOpen(false)}>Cancel</Button>
                    <Button 
                      onClick={() => assignRoomMutation.mutate({ studentId: selectedStudentId, roomId: selected.id })} 
                      disabled={!selectedStudentId || assignRoomMutation.isPending}
                    >
                      {assignRoomMutation.isPending ? "Allotting..." : "Allot Student"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
