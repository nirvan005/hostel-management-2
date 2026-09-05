import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const toneMap: Record<string, Tone> = {
  Paid: "success",
  Approved: "success",
  Active: "success",
  Vacant: "success",
  Returned: "success",
  Pending: "warning",
  Unpaid: "warning",
  Maintenance: "warning",
  "On Leave": "info",
  Exited: "info",
  Occupied: "info",
  Rejected: "danger",
  Overdue: "danger",
  Suspended: "danger",
  Alumni: "neutral",
};

const toneClass: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/25",
  warning: "bg-warning/15 text-warning-foreground border-warning/35",
  danger: "bg-destructive/12 text-destructive border-destructive/25",
  info: "bg-primary/12 text-primary border-primary/25",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone = toneMap[status] ?? "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        toneClass[tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}
