import { PAYMENT_STATUS_LABEL, type PaymentStatus } from "@/types";
import { cn } from "@/utils/cn";

const STYLES: Record<PaymentStatus, string> = {
  unpaid: "bg-red-500/10 text-red-600 dark:text-red-400",
  partial: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  paid: "bg-brand-500/10 text-brand-600 dark:text-brand-400",
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
        STYLES[status]
      )}
    >
      {PAYMENT_STATUS_LABEL[status]}
    </span>
  );
}
