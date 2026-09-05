import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Mail, Phone, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { currency } from "@/lib/utils";

export interface Student {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  hostel: string;
  room: string;
  program: string;
  year: number;
  status: "Active" | "On Leave" | "Suspended" | "Alumni";
  balanceDue: number;
  emergencyName: string;
  emergencyPhone: string;
}

const PAGE_SIZE = 8;

export const Route = createFileRoute("/admin/students")({
  head: () => ({
    meta: [
      { title: "Students Directory — HostelOS Admin" },
      {
        name: "description",
        content:
          "Search, filter and inspect every resident: room allotment, contacts, emergency details and leave status.",
      },
      { property: "og:title", content: "Students Directory — HostelOS Admin" },
      {
        property: "og:description",
        content: "Full resident directory with profiles, rooms and leave status.",
      },
    ],
  }),
  component: StudentsPage,
});

function StudentsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Student | null>(null);
  const [reallocateOpen, setReallocateOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const queryClient = useQueryClient();

  const { data: students = [], isLoading, isError } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const res = await apiClient.get('/students');
      return res.data.data.students.map((s: any) => ({
        _id: s._id,
        id: s.user_id?.university_id || s._id,
        name: s.user_id?.name || "Unknown",
        email: s.user_id?.email || "N/A",
        phone: s.user_id?.phone || "N/A",
        hostel: s.hostel_id?.name || "Unassigned",
        room: s.room_id?.room_number || "Unassigned",
        program: s.course || "N/A",
        year: s.year || 1,
        status: s.status === "active" ? "Active" : s.status === "suspended" ? "Suspended" : "Alumni",
        balanceDue: 0, // Should be fetched from invoices in a real scenario
        emergencyName: s.emergency_contact?.name || "N/A",
        emergencyPhone: s.emergency_contact?.phone || "N/A"
      })) as Student[];
    }
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await apiClient.get('/rooms');
      return res.data.data.rooms;
    }
  });

  const assignRoomMutation = useMutation({
    mutationFn: async ({ studentId, roomId }: { studentId: string, roomId: string }) => {
      await apiClient.post(`/students/${studentId}/assign-room`, { room_id: roomId });
    },
    onSuccess: () => {
      toast.success("Room assigned successfully!");
      setReallocateOpen(false);
      setSelectedRoomId("");
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setSelected(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to assign room");
    }
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (studentId: string) => {
      await apiClient.post(`/notifications/remind`, { student_id: studentId, title: 'Fee Reminder', message: 'Please clear your pending dues.' });
    },
    onSuccess: () => {
      toast.success(`Reminder sent successfully!`);
    },
    onError: () => {
      toast.error("Failed to send reminder");
    }
  });

  const handleReallocate = () => {
    if (!selected || !selectedRoomId) return toast.error("Select a room");
    assignRoomMutation.mutate({ studentId: selected._id, roomId: selectedRoomId });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((s) => {
      const matchQ =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.room.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);
      const matchS = status === "all" || s.status === status;
      return matchQ && matchS;
    });
  }, [query, status, students]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const activeLeave = undefined;

  return (
    <>
      <PageHeader
        title="Students"
        subtitle={`${filtered.length} residents matching your filters`}
        actions={
          <Button onClick={() => toast.success("Invite sent to student email")}>
            <UserPlus className="size-4" /> Add student
          </Button>
        }
      />

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading students...</div>
      ) : isError ? (
        <div className="p-8 text-center text-red-500">Failed to load students (Rate limit or network error). Please refresh.</div>
      ) : (
      <div className="glass-panel rounded-2xl">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-56 flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search by name, ID, room or email"
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              setPage(0);
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="On Leave">On Leave</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
              <SelectItem value="Alumni">Alumni</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="hidden md:table-cell">ID</TableHead>
                <TableHead className="hidden lg:table-cell">Hostel</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className="hidden xl:table-cell">Balance</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow
                  key={s.id}
                  onClick={() => setSelected(s)}
                  className="cursor-pointer"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelected(s)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {s.name[0]}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{s.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{s.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs md:table-cell">{s.id}</TableCell>
                  <TableCell className="hidden lg:table-cell">{s.hostel}</TableCell>
                  <TableCell className="font-medium">{s.room}</TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {s.balanceDue === 0 ? (
                      <span className="text-muted-foreground">Settled</span>
                    ) : (
                      currency(s.balanceDue)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <StatusBadge status={s.status} />
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No students match your filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4">
          <p className="text-sm text-muted-foreground">
            Page {current + 1} of {pages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={current === 0}
              onClick={() => setPage(current - 1)}
            >
              <ChevronLeft className="size-4" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={current >= pages - 1}
              onClick={() => setPage(current + 1)}
            >
              Next <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
      )}

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-xl">{selected.name}</SheetTitle>
                <SheetDescription>
                  {selected.program} · Year {selected.year}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-8">
                <div className="flex items-center gap-3">
                  <StatusBadge status={selected.status} />
                  <span className="font-mono text-xs text-muted-foreground">{selected.id}</span>
                </div>

                <div className="rounded-xl bg-muted/60 p-4">
                  <p className="text-xs text-muted-foreground">Allotment</p>
                  <p className="mt-1 font-display text-2xl font-semibold">{selected.room}</p>
                  <p className="text-sm text-muted-foreground">{selected.hostel}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Contact
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <Mail className="size-4 text-muted-foreground" /> {selected.email}
                  </p>
                  <p className="flex items-center gap-2 text-sm">
                    <Phone className="size-4 text-muted-foreground" /> {selected.phone}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Emergency contact
                  </p>
                  <p className="text-sm font-medium">{selected.emergencyName}</p>
                  <p className="text-sm text-muted-foreground">{selected.emergencyPhone}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Leave status
                  </p>
                  <p className="text-sm text-muted-foreground">No active out-pass on record.</p>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Outstanding balance</p>
                  <p className="mt-1 font-display text-xl font-semibold">
                    {currency(selected.balanceDue)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => sendReminderMutation.mutate(selected._id)}
                    disabled={sendReminderMutation.isPending}
                  >
                    {sendReminderMutation.isPending ? "Sending..." : "Send reminder"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setReallocateOpen(true)}
                  >
                    Reallocate
                  </Button>
                </div>
              </div>

              <Dialog open={reallocateOpen} onOpenChange={setReallocateOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reallocate Room</DialogTitle>
                    <DialogDescription>
                      Assign a new room to {selected.name}. They will be removed from their current room.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-4">
                    <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select available room..." />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.filter((r: any) => r.status !== 'maintenance' && r.occupants.length < r.capacity).map((r: any) => (
                          <SelectItem key={r._id} value={r._id}>
                            {r.hostel_id?.name} - {r.room_number} ({r.capacity}-Seater, {r.capacity - r.occupants.length} vacant)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setReallocateOpen(false)}>Cancel</Button>
                    <Button onClick={handleReallocate} disabled={assignRoomMutation.isPending}>
                      {assignRoomMutation.isPending ? "Assigning..." : "Assign Room"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
