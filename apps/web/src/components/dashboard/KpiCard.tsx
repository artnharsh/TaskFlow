import { ArrowUpRight } from "lucide-react";
import { cn } from "../../lib/utils";

const Sparkbars = ({ data, featured }) => {
  const bars = data.slice(-11);
  const max = Math.max(1, ...bars);
  const peak = Math.max(...bars);
  return (
    <div className="flex h-10 items-end gap-[3px]" aria-hidden="true">
      {bars.map((v, i) => (
        <span
          key={i}
          className={cn(
            "w-1.5 rounded-full",
            featured ? "bg-white/45" : v === peak ? "bg-brand-500" : "bg-brand-300",
          )}
          style={{ height: `${Math.max((v / max) * 100, 14)}%` }}
        />
      ))}
    </div>
  );
};

const KpiCard = ({ label, value, hint, featured, trend, icon: Icon = ArrowUpRight }) => (
  <div
    className={cn(
      "group relative overflow-hidden rounded-3xl p-5 transition-shadow duration-300",
      featured
        ? "brand-gradient text-white shadow-[var(--shadow-brand)]"
        : "border border-line bg-surface text-ink hover:shadow-[var(--shadow-soft)]",
    )}
  >
    {featured && (
      <>
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/15 blur-xl" />
        <div className="absolute -bottom-12 -left-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
      </>
    )}
    <div className="relative">
      <div className="mb-7 flex items-start justify-between gap-2">
        <span className={cn("text-[15px] font-medium", featured ? "text-white/90" : "text-ink")}>
          {label}
        </span>
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-2xl transition-colors duration-200",
            featured
              ? "bg-white/20 text-white"
              : "bg-brand-50 text-brand-600 group-hover:bg-brand-100",
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-[40px] font-semibold leading-none tracking-tight tabular">
            {value}
          </p>
          {hint && (
            <p className={cn("mt-3 text-xs", featured ? "text-white/75" : "text-muted")}>{hint}</p>
          )}
        </div>
        {trend && trend.length >= 2 && <Sparkbars data={trend} featured={featured} />}
      </div>
    </div>
  </div>
);

export default KpiCard;
