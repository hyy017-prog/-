import { PRINT_JOB_STATUS_LABEL, type PrintJobStatus } from "@/types";
import { cn } from "@/utils/cn";

const STATUS_STYLES: Record<PrintJobStatus, string> = {
  queued: "bg-ink-100 dark:bg-white/10 text-ink-700 dark:text-ink-300",
  printing: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  completed: "bg-brand-500/10 text-brand-600 dark:text-brand-400",
  failed: "bg-red-500/10 text-red-600 dark:text-red-400",
  cancelled: "bg-ink-100 dark:bg-white/10 text-ink-500",
};

export function StatusBadge({ status }: { status: PrintJobStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
        STATUS_STYLES[status]
      )}
    >
      {PRINT_JOB_STATUS_LABEL[status]}
    </span>
  );
}
