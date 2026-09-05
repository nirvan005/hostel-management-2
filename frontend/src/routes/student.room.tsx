import { createFileRoute } from "@tanstack/react-router";
import { BedDouble, Mail, Phone, ShieldCheck, Users, Send } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/student/room")({
  head: () => ({
    meta: [
      { title: "My Room — HostelOS Student Portal" },
      {
        name: "description",
        content: "View your hostel allotment, room number, roommates and warden contact details.",
      },
      { property: "og:title", content: "My Room — HostelOS" },
      { property: "og:description", content: "Your hostel allotment, roommates and warden contact." },
    ],
  }),
  component: MyRoom,
});

function MyRoom() {
  const queryClient = useQueryClient();
  const [selectedHostel, setSelectedHostel] = useState("");
  const [preferredRoomType, setPreferredRoomType] = useState("1-Seater");
  const [reason, setReason] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  const { data: studentData, isLoading: studentLoading } = useQuery({
    queryKey: ['student-me'],
    queryFn: async () => {
      const res = await apiClient.get('/students/me');
      return res.data.data.student;
    }
  });

  const { data: roomsData = [] } = useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const res = await apiClient.get('/rooms');
      return res.data.data.rooms;
    },
    enabled: !!studentData?.room_id // Only fetch rooms if assigned
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['my-requests'],
    queryFn: async () => {
      const res = await apiClient.get('/requests');
      return res.data.data.requests;
    }
  });

  const { data: hostels = [] } = useQuery({
    queryKey: ['hostels'],
    queryFn: async () => {
      const res = await apiClient.get('/hostels');
      return res.data.data.hostels;
    }
  });

  const submitRequest = useMutation({
    mutationFn: async (payload: any) => {
      await apiClient.post('/requests', payload);
    },
    onSuccess: () => {
      toast.success("Request submitted successfully!");
      setReason("");
      setIsChanging(false);
      queryClient.invalidateQueries({ queryKey: ['my-requests'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to submit request.");
    }
  });

  if (studentLoading || requestsLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }

  const pendingRequest = requests.find((r: any) => r.status === 'pending');

  const handleRequestSubmit = () => {
    if (!selectedHostel) return toast.error("Please select a hostel.");
    submitRequest.mutate({
      hostel_id: selectedHostel,
      request_type: studentData?.room_id ? 'room_change' : 'new_allocation',
      preferred_room_type: preferredRoomType,
      reason
    });
  };

  // State: No room assigned and no pending request
  if (!studentData?.room_id && !pendingRequest) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Room Allocation" subtitle="You have not been allotted a room yet." />
        <div className="glass-panel rounded-2xl p-6 mt-6">
          <h3 className="text-lg font-medium mb-4">Request a Room</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Select Hostel</label>
              <Select value={selectedHostel} onValueChange={setSelectedHostel}>
                <SelectTrigger><SelectValue placeholder="Select a hostel" /></SelectTrigger>
                <SelectContent>
                  {hostels.map((h: any) => (
                    <SelectItem key={h._id} value={h._id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Preferred Room Type</label>
              <Select value={preferredRoomType} onValueChange={setPreferredRoomType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-Seater">Single Seater</SelectItem>
                  <SelectItem value="2-Seater">Double Seater</SelectItem>
                  <SelectItem value="3-Seater">Triple Seater</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Reason (Optional)</label>
              <Textarea placeholder="Any specific requirements..." value={reason} onChange={e => setReason(e.target.value)} />
            </div>
            <Button onClick={handleRequestSubmit} disabled={submitRequest.isPending} className="w-full">
              {submitRequest.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // State: Has pending request (can be for a new room or a change)
  if (pendingRequest && !studentData?.room_id) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title="Room Allocation" subtitle="Your request is under review." />
        <div className="glass-panel rounded-2xl p-8 text-center mt-6 flex flex-col items-center">
          <div className="size-16 rounded-full bg-primary/10 grid place-items-center mb-4">
            <Send className="size-8 text-primary" />
          </div>
          <h3 className="text-xl font-medium">Request Pending</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            Your request for a <strong>{pendingRequest.preferred_room_type}</strong> in <strong>{pendingRequest.hostel_id?.name || 'the hostel'}</strong> has been sent to the warden for approval.
          </p>
        </div>
      </div>
    );
  }


  // State: Room is assigned
  const room = roomsData.find((r: any) => r._id === studentData?.room_id?._id);
  const roommates = room ? room.occupants.filter((o: any) => o._id !== studentData?._id) : [];

  const hostelName = studentData?.hostel_id?.name || "Unassigned";
  const roomNumber = studentData?.room_id?.room_number || "N/A";
  const status = studentData?.room_id ? "Active" : "Pending";
  const joinedOn = studentData?.createdAt ? new Date(studentData.createdAt).toLocaleDateString() : "N/A";
  const program = "Undergraduate";

  return (
    <>
      <div className="flex items-start justify-between">
        <PageHeader title="My room" subtitle="Your current allotment and block contacts" />
        {studentData?.room_id && !pendingRequest && (
          <Button variant="outline" onClick={() => setIsChanging(!isChanging)}>
            {isChanging ? 'Cancel Request' : 'Request Room Change'}
          </Button>
        )}
      </div>

      {isChanging && (
        <div className="glass-panel rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Request Room Change</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Target Hostel</label>
              <Select value={selectedHostel} onValueChange={setSelectedHostel}>
                <SelectTrigger><SelectValue placeholder="Select a hostel" /></SelectTrigger>
                <SelectContent>
                  {hostels.map((h: any) => (
                    <SelectItem key={h._id} value={h._id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Preferred Type</label>
              <Select value={preferredRoomType} onValueChange={setPreferredRoomType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-Seater">Single Seater</SelectItem>
                  <SelectItem value="2-Seater">Double Seater</SelectItem>
                  <SelectItem value="3-Seater">Triple Seater</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1 block">Reason for change</label>
              <Textarea placeholder="Please explain why you need to change your room..." value={reason} onChange={e => setReason(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleRequestSubmit} disabled={submitRequest.isPending}>
            {submitRequest.isPending ? "Submitting..." : "Submit Change Request"}
          </Button>
        </div>
      )}

      {pendingRequest && studentData?.room_id && (
        <div className="rounded-xl border border-warning/50 bg-warning/10 p-4 mb-6 text-warning-foreground flex justify-between items-center">
          <div>
            <p className="font-medium text-sm">Room Change Request Pending</p>
            <p className="text-xs opacity-90">Your request for a {pendingRequest.preferred_room_type} is under review by the warden.</p>
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="glass-panel rounded-2xl p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{hostelName}</p>
              <p className="font-display text-4xl font-semibold">{roomNumber}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {room?.capacity === 1 ? 'Single' : room?.capacity === 2 ? 'Double' : room?.capacity === 3 ? 'Triple' : `${room?.capacity || 'N/A'}-Seater`} occupancy · Floor {studentData?.room_id?.floor || 1}
              </p>
            </div>
            <StatusBadge status={status as any} />
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Capacity", value: `${room?.capacity ?? 'N/A'} beds` },
              { label: "Allotted on", value: joinedOn },
              { label: "Programme", value: program },
            ].map((i) => (
              <div key={i.label} className="rounded-xl bg-muted/60 p-4">
                <dt className="text-xs text-muted-foreground">{i.label}</dt>
                <dd className="mt-1 text-sm font-medium">{i.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <ShieldCheck className="size-4 text-primary" /> Warden
          </h3>
          <p className="mt-3 text-sm font-medium">Chief Warden</p>
          <p className="text-xs text-muted-foreground">Resident Warden, {hostelName}</p>
          <div className="mt-4 space-y-2 text-sm">
            <p className="flex items-center gap-2 text-muted-foreground">
              <Mail className="size-4" /> warden.aravali@univ.edu
            </p>
            <p className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4" /> +91 98110 22114
            </p>
          </div>
          <p className="mt-4 rounded-lg bg-accent/15 p-3 text-xs text-accent-foreground">
            Office hours: 9:00–11:00 AM & 6:00–8:00 PM, Ground floor.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6 lg:col-span-3">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Users className="size-4 text-primary" /> Roommates
          </h3>
          {roommates.length === 0 ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <BedDouble className="size-4" /> No roommates allotted yet — you have the room to
              yourself.
            </p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {roommates.map((r: any) => {
                const name = r.user_id?.name || "Unknown";
                const initial = name[0] || "?";
                return (
                  <li key={r._id} className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
                    <span className="grid size-10 place-items-center rounded-full bg-primary/10 font-semibold text-primary uppercase">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{name}</p>
                      <p className="truncate text-xs text-muted-foreground">{r.user_id?.university_id || program}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
