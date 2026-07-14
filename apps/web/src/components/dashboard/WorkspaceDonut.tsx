import { PieChart } from "lucide-react";
import { cn } from "../../lib/utils";
import { SectionTitle, Legend, StatRow } from "./Shared";

const WorkspaceDonut = ({ owned, shared, boards = [], className }) => {
  const total = owned + shared;
  const R = 56;
  const SW = 16;
  const C = 2 * Math.PI * R;
  const ownedLen = total ? (owned / total) * C : 0;
  const sharedLen = total ? (shared / total) * C : 0;

  const totalTasks = boards.reduce((s, b) => s + Number(b.task_count || 0), 0);
  const avg = total ? Math.round(totalTasks / total) : 0;
  const active = boards.filter((b) => Number(b.task_count || 0) > 0).length;
  const busiest = boards.reduce(
    (a, b) => (Number(b.task_count || 0) > Number(a?.task_count || 0) ? b : a),
    null,
  );

  return (
    <div
      className={cn(
        "flex flex-col rounded-3xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <SectionTitle icon={PieChart} hint="Owned vs shared">
        Composition
      </SectionTitle>
      <div className="flex items-center gap-5">
        <div className="relative h-[128px] w-[128px] shrink-0">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
            <circle
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke="var(--color-surface-2)"
              strokeWidth={SW}
            />
            {owned > 0 && (
              <circle
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke="#2f8159"
                strokeWidth={SW}
                strokeDasharray={`${ownedLen} ${C}`}
              />
            )}
            {shared > 0 && (
              <circle
                cx="70"
                cy="70"
                r={R}
                fill="none"
                stroke="#8bc4a4"
                strokeWidth={SW}
                strokeDasharray={`${sharedLen} ${C}`}
                strokeDashoffset={-ownedLen}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-semibold tabular leading-none">
              {total}
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.1em] text-faint">boards</span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <Legend color="#2f8159" label="Owned" value={owned} />
          <Legend color="#8bc4a4" label="Shared" value={shared} />
        </div>
      </div>

      <div className="mt-6 grid flex-1 content-center gap-3.5 border-t pt-5">
        <StatRow label="Total tasks" value={totalTasks} />
        <StatRow label="Avg per board" value={avg} />
        <StatRow label="Active boards" value={`${active} / ${total}`} />
        {busiest && Number(busiest.task_count || 0) > 0 && (
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted">Busiest board</span>
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-semibold text-ink">{busiest.title}</span>
              <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium tabular text-muted">
                {busiest.task_count}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceDonut;
