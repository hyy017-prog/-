import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import {
  EQUIPMENT_TYPE_LABEL,
  type Equipment,
  type EquipmentFormValues,
  type EquipmentType,
} from "@/types";
import { dateInputToDate, timestampToDateInputValue } from "@/utils/format";

const equipmentSchema = z.object({
  name: z.string().min(1, "請輸入設備名稱"),
  type: z.enum(["printer", "nozzle", "pei_sheet", "hotend", "ams", "other"]),
  model: z.string().optional().default(""),
  purchaseDateInput: z.string().optional().default(""),
  lastMaintenanceDateInput: z.string().optional().default(""),
  maintenanceIntervalDays: z.coerce.number().min(0, "不可為負數"),
  accumulatedHours: z.coerce.number().min(0, "不可為負數"),
  notes: z.string().optional().default(""),
});

type EquipmentFormSchema = z.infer<typeof equipmentSchema>;

interface EquipmentFormModalProps {
  open: boolean;
  equipment?: Equipment | null;
  onClose: () => void;
  onSubmit: (values: EquipmentFormValues) => Promise<void>;
}

export function EquipmentFormModal({
  open,
  equipment,
  onClose,
  onSubmit,
}: EquipmentFormModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EquipmentFormSchema>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      type: "printer",
      maintenanceIntervalDays: 90,
      accumulatedHours: 0,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (equipment) {
      reset({
        name: equipment.name,
        type: equipment.type,
        model: equipment.model,
        purchaseDateInput: timestampToDateInputValue(equipment.purchaseDate),
        lastMaintenanceDateInput: timestampToDateInputValue(equipment.lastMaintenanceDate),
        maintenanceIntervalDays: equipment.maintenanceIntervalDays,
        accumulatedHours: equipment.accumulatedHours,
        notes: equipment.notes,
      });
    } else {
      reset({
        name: "",
        type: "printer",
        model: "",
        purchaseDateInput: new Date().toISOString().slice(0, 10),
        lastMaintenanceDateInput: "",
        maintenanceIntervalDays: 90,
        accumulatedHours: 0,
        notes: "",
      });
    }
  }, [open, equipment, reset]);

  const submit = async (values: EquipmentFormSchema) => {
    setSubmitting(true);
    try {
      const purchaseDate = values.purchaseDateInput
        ? dateInputToDate(values.purchaseDateInput)
        : null;
      const lastMaintenanceDate = values.lastMaintenanceDateInput
        ? dateInputToDate(values.lastMaintenanceDateInput)
        : null;

      const formValues: EquipmentFormValues = {
        name: values.name,
        type: values.type,
        model: values.model,
        maintenanceIntervalDays: values.maintenanceIntervalDays,
        accumulatedHours: values.accumulatedHours,
        notes: values.notes,
        purchaseDate: purchaseDate ? Timestamp.fromDate(purchaseDate) : null,
        lastMaintenanceDate: lastMaintenanceDate ? Timestamp.fromDate(lastMaintenanceDate) : null,
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
                {equipment ? "編輯設備" : "新增設備"}
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
              <div className="grid grid-cols-2 gap-4">
                <Input label="設備名稱" {...register("name")} error={errors.name?.message} />
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select label="類型" {...field}>
                      {(Object.keys(EQUIPMENT_TYPE_LABEL) as EquipmentType[]).map((t) => (
                        <option key={t} value={t}>
                          {EQUIPMENT_TYPE_LABEL[t]}
                        </option>
                      ))}
                    </Select>
                  )}
                />
              </div>

              <Input label="型號" placeholder="例如：Bambu Lab X1 Carbon" {...register("model")} />

              <div className="grid grid-cols-2 gap-4">
                <Input label="購入日期" type="date" {...register("purchaseDateInput")} />
                <Input label="上次保養日期" type="date" {...register("lastMaintenanceDateInput")} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="保養提醒間隔 (天)"
                  type="number"
                  {...register("maintenanceIntervalDays")}
                  error={errors.maintenanceIntervalDays?.message}
                />
                <Input
                  label="累積使用時數"
                  type="number"
                  step="0.1"
                  {...register("accumulatedHours")}
                  error={errors.accumulatedHours?.message}
                />
              </div>

              <Textarea label="備註" rows={2} {...register("notes")} />

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>
                  取消
                </Button>
                <Button type="submit" isLoading={submitting}>
                  {equipment ? "儲存變更" : "新增"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
