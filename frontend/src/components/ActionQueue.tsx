import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarClock, DoorOpen, Receipt, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/client";

const icons = {
  leave: CalendarClock,
  room: DoorOpen,
  invoice: Receipt,
  maintenance: Wrench,
};

export function ActionQueue() {
  const { data: leavesResponse } = useQuery({
    queryKey: ['leaves', 'pending'],
    queryFn: () => apiClient.get('/leaves?status=pending').then(res => res.data.data.leaves)
  });

  const { data: invoicesResponse } = useQuery({
    queryKey: ['invoices', 'pending'],
    queryFn: () => apiClient.get('/invoices').then(res => res.data.data.invoices) // Will filter by overdue/pending in frontend for now
  });

  const leaves = leavesResponse || [];
  const invoicesList = invoicesResponse || [];

  const items = [
    ...leaves
      .slice(0, 3)
      .map((l: any) => ({
        id: l._id,
        kind: "leave" as const,
        title: `${l.leave_type} — ${l.student_id?.name || 'Student'}`,
        meta: `Requested to go to: ${l.reason}`,
        to: "/admin/leaves" as const,
      })),
    ...invoicesList
      .filter((i: any) => i.status === "pending" && new Date(i.due_date) < new Date())
      .slice(0, 2)
      .map((i: any) => ({
        id: i._id,
        kind: "invoice" as const,
        title: `Overdue invoice — ${i.student_id?.name || 'Student'}`,
        meta: `₹${i.amount} · due ${new Date(i.due_date).toLocaleDateString()}`,
        to: "/admin/invoices" as const,
      })),
  ].slice(0, 5);

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Action queue</h3>
          <p className="text-sm text-muted-foreground">Most urgent items</p>
        </div>
        <span className="rounded-full bg-accent/20 px-2.5 py-1 text-xs font-semibold text-accent-foreground">
          {items.length} open
        </span>
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item) => {
          const Icon = icons[item.kind as keyof typeof icons];
          return (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-3"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground">{item.meta}</p>
              </div>
              <Button asChild size="sm" variant="ghost" className="shrink-0">
                <Link to={item.to} onClick={() => toast.info(`Opening ${item.id}`)}>
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
