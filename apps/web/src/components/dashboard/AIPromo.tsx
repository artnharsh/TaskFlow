import { Plus, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";

const AIPromo = ({ onCreate, className }) => (
  <div
    className={cn(
      "brand-gradient relative flex flex-col justify-between overflow-hidden rounded-3xl p-6 text-white shadow-[var(--shadow-brand)]",
      className,
    )}
  >
    <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
    <div className="absolute -bottom-14 -left-8 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
    <div className="relative">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20 backdrop-blur">
        <Sparkles className="h-5 w-5" />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
        Let AI plan your sprint
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-white/80">
        Spin up a board and turn a one-line goal into a prioritized backlog in seconds.
      </p>
    </div>
    <button
      onClick={onCreate}
      className="relative mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-brand-700 shadow-[var(--shadow-card)] transition-transform duration-200 active:scale-[0.97]"
    >
      <Plus className="h-4 w-4" /> New board
    </button>
  </div>
);

export default AIPromo;
