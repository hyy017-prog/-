import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { FAILURE_CATEGORY_LABEL, type FailureCategory, type FailureRecord, type FailureRecordFormValues } from "@/types";

const failureSchema = z.object({
  photoURL: z.string().optional().default(""),
  category: z.enum([
    "warping",
    "stringing",
    "layer_shift",
    "support",
    "adhesion",
    "clog",
    "other",
  ]),
  failureReason: z.string().min(1, "請描述失敗原因"),
  solution: z.string().optional().default(""),
  isResolved: z.boolean().default(false),
});

type FailureFormSchema = z.infer<typeof failureSchema>;

interface FailureFormModalProps {
  open: boolean;
  record?: FailureRecord | null;
  onClose: () => void;
  onSubmit: (values: FailureRecordFormValues) => Promise<void>;
}

export function FailureFormModal({ open, record, onClose, onSubmit }: FailureFormModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FailureFormSchema>({
    resolver: zodResolver(failureSchema),
    defaultValues: { category: "other", isResolved: false },
  });

  useEffect(() => {
    if (!open) return;
    if (record) {
      reset({
        photoURL: record.photoURL,
        category: record.category,
        failureReason: record.failureReason,
        solution: record.solution,
        isResolved: record.isResolved,
      });
    } else {
      reset({
        photoURL: "",
        category: "other",
        failureReason: "",
        solution: "",
        isResolved: false,
      });
    }
  }, [open, record, reset]);

  const submit = async (values: FailureFormSchema) => {
    setSubmitting(true);
    try {
      await onSubmit(values as FailureRecordFormValues);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start lg:items-center justify-center bg-black/40 px-4 py-6 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="card w-full max-w-lg p-6 my-auto"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-lg">
                {record ? "編輯失敗案例" : "新增失敗案例"}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="關閉"
                type="button"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(submit)} className="space-y-4">
              <Input
                label="照片網址（可選）"
                placeholder="貼上失敗成品的照片連結"
                {...register("photoURL")}
              />

              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select label="失敗分類" {...field}>
                    {(Object.keys(FAILURE_CATEGORY_LABEL) as FailureCategory[]).map((k) => (
                      <option key={k} value={k}>
                        {FAILURE_CATEGORY_LABEL[k]}
                      </option>
                    ))}
                  </Select>
                )}
              />

              <Textarea
                label="失敗原因"
                rows={3}
                {...register("failureReason")}
                error={errors.failureReason?.message}
              />
              <Textarea label="解決方式" rows={3} {...register("solution")} />

              <label className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-300">
                <input type="checkbox" className="rounded" {...register("isResolved")} />
                已解決
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>
                  取消
                </Button>
                <Button type="submit" isLoading={submitting}>
                  {record ? "儲存變更" : "新增"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
