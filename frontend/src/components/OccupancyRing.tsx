import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["var(--color-primary)", "var(--color-success)", "var(--color-warning)", "var(--color-destructive)"];

export function OccupancyRing({ totalCapacity, data }: { totalCapacity: number, data: any[] }) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="text-base font-semibold">Occupancy</h3>
      <p className="text-sm text-muted-foreground">Across all hostel blocks</p>
      <div className="relative mt-2 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={data[i].color || COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="font-display text-3xl font-semibold">{totalCapacity}</p>
            <p className="text-xs text-muted-foreground">total beds</p>
          </div>
        </div>
      </div>
      <ul className="mt-2 space-y-1.5">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="size-2.5 rounded-full" style={{ background: d.color || COLORS[i % COLORS.length] }} />
              {d.name}
            </span>
            <span className="font-medium">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
