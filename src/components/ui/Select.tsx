import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-ink-700 dark:text-ink-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5",
            "px-3.5 py-2.5 text-sm text-ink-900 dark:text-ink-100",
            "focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-colors",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
