import { Plus, Sparkles } from "lucide-react";
import Button from "../ui/Button";

const EmptyState = ({ onCreate }) => (
  <div className="card flex flex-col items-center justify-center gap-4 rounded-3xl py-20 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500">
      <Sparkles className="h-7 w-7" />
    </div>
    <div>
      <h3 className="font-display text-lg font-semibold tracking-tight">Create your first board</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
        Spin up a board and let AI generate your first set of tasks from a simple goal.
      </p>
    </div>
    <Button onClick={onCreate}>
      <Plus className="h-4 w-4" /> New board
    </Button>
  </div>
);

export default EmptyState;
