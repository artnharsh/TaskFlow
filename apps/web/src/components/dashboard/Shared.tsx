export const SectionTitle = ({ icon: Icon, children, hint }) => (
  <div className="mb-5 flex items-center gap-2.5">
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-500">
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0">
      <h3 className="font-display text-sm font-semibold tracking-tight">{children}</h3>
      {hint && <p className="truncate text-[11px] text-faint">{hint}</p>}
    </div>
  </div>
);

export const EmptyHint = ({ icon: Icon, children }) => (
  <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
    <Icon className="h-6 w-6 text-faint" />
    <p className="max-w-[15rem] text-xs text-muted">{children}</p>
  </div>
);

export const Legend = ({ color, label, value }) => (
  <div className="flex items-center gap-2.5">
    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
    <span className="text-sm text-muted">{label}</span>
    <span className="ml-auto text-sm font-semibold tabular text-ink">{value}</span>
  </div>
);

export const StatRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-sm text-muted">{label}</span>
    <span className="text-sm font-semibold tabular text-ink">{value}</span>
  </div>
);
