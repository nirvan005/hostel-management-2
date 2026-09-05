import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Receipt, Repeat2, Users } from "lucide-react";
import { ActionQueue } from "@/components/ActionQueue";
import { KpiCard } from "@/components/KpiCard";
import { OccupancyRing } from "@/components/OccupancyRing";
import { PageHeader } from "@/components/PageHeader";
import { RevenueChart } from "@/components/RevenueChart";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Warden Dashboard — HostelOS" },
      {
        name: "description",
        content:
          "Occupancy, fee collection, active out-passes and pending approvals for your hostel blocks.",
      },
      { property: "og:title", content: "Warden Dashboard — HostelOS" },
      {
        property: "og:description",
        content: "Live occupancy, revenue and approval queue for university hostels.",
      },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user } = useAuth();
  const [selectedHostel, setSelectedHostel] = useState<string>("all");
  
  const { data: hostels } = useQuery({
    queryKey: ['hostels'],
    queryFn: async () => {
      const response = await apiClient.get('/hostels');
      return response.data.data.hostels;
    },
    enabled: user?.role === 'super_admin'
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats', selectedHostel],
    queryFn: async () => {
      const url = selectedHostel && selectedHostel !== 'all' ? `/dashboard?hostel_id=${selectedHostel}` : '/dashboard';
      const response = await apiClient.get(url);
      return response.data.data;
    }
  });

  if (error) return <div className="p-8 text-center text-red-500">Failed to load dashboard</div>;
  if (isLoading || !data) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <>
      <div className="flex items-start justify-between">
        <PageHeader
          title="Command center"
          subtitle="Good evening — here's today's snapshot."
        />
        {user?.role === 'super_admin' && (
          <Select value={selectedHostel} onValueChange={setSelectedHostel}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Hostels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Hostels</SelectItem>
              {hostels?.map((h: any) => (
                <SelectItem key={h._id} value={h._id}>{h.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total students" value={data.totalStudents} icon={Users} delta="Across managed blocks" />
        <KpiCard
          label="Active leaves"
          value={data.activeLeaves}
          icon={CalendarClock}
          delta="Currently off-campus"
          accent
        />
        <KpiCard
          label="Pending room requests"
          value={data.pendingRequests}
          icon={Repeat2}
          delta="Awaiting your review"
        />
        <KpiCard
          label="Unpaid invoices"
          value={data.unpaidInvoices}
          icon={Receipt}
          delta="Across all blocks"
        />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RevenueChart data={data.monthlyRevenue} />
        </div>
        <OccupancyRing totalCapacity={data.totalCapacity} data={data.occupancyData} />
        {user?.role !== 'super_admin' && (
          <div className="xl:col-span-2">
            <ActionQueue />
          </div>
        )}
      </div>
    </>
  );
}
