import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  accent,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: string;
  accent?: boolean;
}) {
  return (
    <div className="glass-panel rounded-2xl p-5 transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          className={cn(
            "grid size-9 place-items-center rounded-xl",
            accent ? "bg-accent/20 text-accent-foreground" : "bg-primary/10 text-primary",
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight">{value}</p>
      {delta ? <p className="mt-1 text-xs text-muted-foreground">{delta}</p> : null}
    </div>
  );
}
