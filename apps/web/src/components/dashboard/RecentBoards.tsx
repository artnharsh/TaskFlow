import { Link } from "react-router-dom";
import { Clock, Users, ArrowUpRight } from "lucide-react";
import { cn, relativeTime } from "../../lib/utils";
import { SectionTitle } from "./Shared";

const RecentBoards = ({ boards, className }) => (
  <div
    className={cn(
      "flex flex-col rounded-3xl border border-line bg-surface p-6 shadow-[var(--shadow-card)]",
      className,
    )}
  >
    <SectionTitle icon={Clock} hint="Pick up where you left off">
      Jump back in
    </SectionTitle>
    <div className="flex flex-col gap-0.5">
      {boards.map((b) => {
        const color = b.color || "#2f8159";
        return (
          <Link
            key={b.id}
            to={`/board/${b.id}`}
            className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-2"
          >
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-xl font-display text-[12px] font-bold"
              style={{ backgroundColor: `${color}22`, color }}
            >
              {b.title?.[0]?.toUpperCase() || "B"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-ink transition-colors group-hover:text-brand-600">
                {b.title}
              </p>
              <p className="text-[11px] text-faint">Updated {relativeTime(b.updated_at)}</p>
            </div>
            <span className="hidden items-center gap-1.5 text-[11px] font-medium tabular text-faint sm:flex">
              <Users className="h-3.5 w-3.5" /> {b.member_count}
            </span>
            <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-medium tabular text-muted">
              {b.task_count} tasks
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-faint opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-brand-500 group-hover:opacity-100" />
          </Link>
        );
      })}
    </div>
  </div>
);

export default RecentBoards;
