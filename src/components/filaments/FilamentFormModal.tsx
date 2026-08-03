import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Filament, FilamentFormValues } from "@/types";
import { dateInputToDate, timestampToDateInputValue } from "@/utils/format";

const filamentSchema = z.object({
  brand: z.string().min(1, "請輸入品牌"),
  material: z.string().min(1, "請輸入材料"),
  color: z.string().min(1, "請輸入顏色"),
  weightGrams: z.coerce.number().min(1, "請輸入總重量"),
  remainingGrams: z.coerce.number().min(0, "不可為負數"),
  price: z.coerce.number().min(0, "不可為負數"),
  purchaseDateInput: z.string().min(1, "請選擇購買日期"),
  openedDateInput: z.string().optional().default(""),
  isDried: z.boolean().default(false),
  driedDateInput: z.string().optional().default(""),
  storageLocation: z.string().optional().default(""),
  lowStockThreshold: z.coerce.number().min(0, "不可為負數"),
});

type FilamentFormSchema = z.infer<typeof filamentSchema>;

interface FilamentFormModalProps {
  open: boolean;
  filament?: Filament | null;
  onClose: () => void;
  onSubmit: (values: FilamentFormValues) => Promise<void>;
}

export function FilamentFormModal({
  open,
  filament,
  onClose,
  onSubmit,
}: FilamentFormModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FilamentFormSchema>({
    resolver: zodResolver(filamentSchema),
    defaultValues: {
      weightGrams: 1000,
      remainingGrams: 1000,
      price: 0,
      lowStockThreshold: 100,
      isDried: false,
    },
  });

  const isDried = watch("isDried");

  useEffect(() => {
    if (!open) return;
    if (filament) {
      reset({
        brand: filament.brand,
        material: filament.material,
        color: filament.color,
        weightGrams: filament.weightGrams,
        remainingGrams: filament.remainingGrams,
        price: filament.price,
        purchaseDateInput: timestampToDateInputValue(filament.purchaseDate),
        openedDateInput: timestampToDateInputValue(filament.openedDate),
        isDried: filament.isDried,
        driedDateInput: timestampToDateInputValue(filament.driedDate),
        storageLocation: filament.storageLocation,
        lowStockThreshold: filament.lowStockThreshold,
      });
    } else {
      reset({
        brand: "",
        material: "PLA",
        color: "",
        weightGrams: 1000,
        remainingGrams: 1000,
        price: 0,
        purchaseDateInput: new Date().toISOString().slice(0, 10),
        openedDateInput: "",
        isDried: false,
        driedDateInput: "",
        storageLocation: "",
        lowStockThreshold: 100,
      });
    }
  }, [open, filament, reset]);

  const submit = async (values: FilamentFormSchema) => {
    setSubmitting(true);
    try {
      const purchaseDate = dateInputToDate(values.purchaseDateInput);
      const openedDate = values.openedDateInput
        ? dateInputToDate(values.openedDateInput)
        : null;
      const driedDate = values.driedDateInput
        ? dateInputToDate(values.driedDateInput)
        : null;

      const formValues: FilamentFormValues = {
        brand: values.brand,
        material: values.material,
        color: values.color,
        weightGrams: values.weightGrams,
        remainingGrams: values.remainingGrams,
        price: values.price,
        storageLocation: values.storageLocation,
        isDried: values.isDried,
        lowStockThreshold: values.lowStockThreshold,
        purchaseDate: purchaseDate ? Timestamp.fromDate(purchaseDate) : null,
        openedDate: openedDate ? Timestamp.fromDate(openedDate) : null,
        driedDate: driedDate ? Timestamp.fromDate(driedDate) : null,
      };

      await onSubmit(formValues);
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
                {filament ? "編輯耗材" : "新增耗材"}
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

            <form onSubmit={handleSubmit(submit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <Input label="品牌" {...register("brand")} error={errors.brand?.message} />
                <Input label="材料" {...register("material")} error={errors.material?.message} />
              </div>

              <Input label="顏色" {...register("color")} error={errors.color?.message} />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="整捲重量 (g)"
                  type="number"
                  {...register("weightGrams")}
                  error={errors.weightGrams?.message}
                />
                <Input
                  label="剩餘重量 (g)"
                  type="number"
                  {...register("remainingGrams")}
                  error={errors.remainingGrams?.message}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="購入價格 (NT$)"
                  type="number"
                  step="0.1"
                  {...register("price")}
                  error={errors.price?.message}
                />
                <Input
                  label="低庫存提醒門檻 (g)"
                  type="number"
                  {...register("lowStockThreshold")}
                  error={errors.lowStockThreshold?.message}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="購買日期"
                  type="date"
                  {...register("purchaseDateInput")}
                  error={errors.purchaseDateInput?.message}
                />
                <Input label="開封日期" type="date" {...register("openedDateInput")} />
              </div>

              <Input label="存放位置" placeholder="例如：防潮箱 A" {...register("storageLocation")} />

              <label className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-300">
                <input type="checkbox" className="rounded" {...register("isDried")} />
                已烘乾
              </label>

              {isDried && (
                <Input label="烘乾日期" type="date" {...register("driedDateInput")} />
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>
                  取消
                </Button>
                <Button type="submit" isLoading={submitting}>
                  {filament ? "儲存變更" : "新增"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
