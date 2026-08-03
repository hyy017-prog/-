import { useEffect, useState, type ChangeEvent } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { PrintJob, PrintJobFormValues, PrintJobStatus } from "@/types";
import { timestampToDateInputValue, dateInputToDate } from "@/utils/format";
import { Timestamp } from "firebase/firestore";
import { useFilaments } from "@/hooks/useFilaments";

const jobSchema = z.object({
  name: z.string().min(1, "請輸入作品名稱"),
  stlFileName: z.string().min(1, "請輸入 STL 檔名"),
  gcodeFileName: z.string().optional().default(""),
  printer: z.string().min(1, "請選擇印表機"),
  material: z.string().min(1, "請選擇材料"),
  materialBrand: z.string().optional().default(""),
  color: z.string().optional().default(""),
  materialGrams: z.coerce.number().min(0, "不可為負數"),
  printTimeMinutes: z.coerce.number().min(0, "不可為負數"),
  layerHeight: z.coerce.number().min(0, "不可為負數"),
  nozzleSize: z.coerce.number().min(0, "不可為負數"),
  infillPercentage: z.coerce.number().min(0).max(100, "填充率介於 0-100"),
  supportSetting: z.string().optional().default(""),
  speed: z.coerce.number().min(0, "不可為負數"),
  printDateInput: z.string().min(1, "請選擇列印日期"),
  completedDateInput: z.string().optional().default(""),
  status: z.enum(["queued", "printing", "completed", "failed", "cancelled"]),
  failureReason: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  materialCost: z.coerce.number().min(0, "不可為負數"),
  revenue: z.coerce.number().min(0, "不可為負數"),
});

type JobFormSchema = z.infer<typeof jobSchema>;

const PRINTERS = [
  "Bambu Lab X1 Carbon",
  "Bambu Lab P1S",
  "Bambu Lab A1",
  "Prusa MK4",
  "Prusa Mini",
  "Creality K1",
  "Creality Ender-3",
  "Elegoo Neptune",
  "Elegoo Saturn (樹脂)",
  "Anycubic Kobra",
  "其他",
];

const MATERIALS = ["PLA", "PETG", "ABS", "TPU", "ASA", "PC", "尼龍", "樹脂 (Resin)", "其他"];

const STATUS_OPTIONS: { value: PrintJobStatus; label: string }[] = [
  { value: "queued", label: "待列印" },
  { value: "printing", label: "列印中" },
  { value: "completed", label: "已完成" },
  { value: "failed", label: "失敗" },
  { value: "cancelled", label: "取消" },
];

interface JobFormModalProps {
  open: boolean;
  job?: PrintJob | null;
  onClose: () => void;
  onSubmit: (values: PrintJobFormValues) => Promise<void>;
}

export function JobFormModal({ open, job, onClose, onSubmit }: JobFormModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { filaments } = useFilaments();

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<JobFormSchema>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      status: "queued",
      materialGrams: 0,
      printTimeMinutes: 0,
      layerHeight: 0.2,
      nozzleSize: 0.4,
      infillPercentage: 15,
      speed: 60,
      materialCost: 0,
      revenue: 0,
    },
  });

  const status = watch("status");

  useEffect(() => {
    if (!open) return;
    if (job) {
      reset({
        name: job.name,
        stlFileName: job.stlFileName,
        gcodeFileName: job.gcodeFileName,
        printer: job.printer,
        material: job.material,
        materialBrand: job.materialBrand,
        color: job.color,
        materialGrams: job.materialGrams,
        printTimeMinutes: job.printTimeMinutes,
        layerHeight: job.layerHeight,
        nozzleSize: job.nozzleSize,
        infillPercentage: job.infillPercentage,
        supportSetting: job.supportSetting,
        speed: job.speed,
        printDateInput: timestampToDateInputValue(job.printDate),
        completedDateInput: timestampToDateInputValue(job.completedDate),
        status: job.status,
        failureReason: job.failureReason,
        notes: job.notes,
        materialCost: job.materialCost,
        revenue: job.revenue,
      });
      setPhotoPreview(job.photoURL);
    } else {
      reset({
        name: "",
        stlFileName: "",
        gcodeFileName: "",
        printer: PRINTERS[0],
        material: MATERIALS[0],
        materialBrand: "",
        color: "",
        materialGrams: 0,
        printTimeMinutes: 0,
        layerHeight: 0.2,
        nozzleSize: 0.4,
        infillPercentage: 15,
        supportSetting: "無",
        speed: 60,
        printDateInput: new Date().toISOString().slice(0, 10),
        completedDateInput: "",
        status: "queued",
        failureReason: "",
        notes: "",
        materialCost: 0,
        revenue: 0,
      });
      setPhotoPreview(null);
    }
    setPhotoFile(null);
  }, [open, job, reset]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const submit = async (values: JobFormSchema) => {
    setSubmitting(true);
    try {
      const { printDateInput, completedDateInput, ...rest } = values;
      const printDate = dateInputToDate(printDateInput);
      const completedDate = completedDateInput
        ? dateInputToDate(completedDateInput)
        : null;

      const formValues: PrintJobFormValues = {
        ...rest,
        printDate: printDate ? Timestamp.fromDate(printDate) : null,
        completedDate: completedDate ? Timestamp.fromDate(completedDate) : null,
        totalCost: rest.materialCost, // Phase 2 會加入電費/折舊/人工等，這裡先等於材料成本
        photoFile,
        existingPhotoURL: job?.photoURL ?? null,
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
            className="card w-full max-w-2xl p-6 my-auto"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-lg">
                {job ? "編輯列印工作" : "新增列印工作"}
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

            <form onSubmit={handleSubmit(submit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
              {/* 照片上傳 */}
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
                  {photoPreview ? (
                    <img src={photoPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <PhotoIcon className="h-8 w-8 text-ink-300" />
                  )}
                </div>
                <div>
                  <label className="inline-block">
                    <span className="sr-only">上傳作品照片</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="text-xs file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-brand-500/10 file:text-brand-600 dark:file:text-brand-400 file:text-xs file:font-medium hover:file:bg-brand-500/20"
                    />
                  </label>
                  <p className="text-xs text-ink-500 mt-1">建議正方形照片，10MB 以內</p>
                </div>
              </div>

              {/* 基本資訊 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="作品名稱" {...register("name")} error={errors.name?.message} />
                <Select label="列印狀態" {...register("status")}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
                <Input label="STL 檔名" {...register("stlFileName")} error={errors.stlFileName?.message} />
                <Input label="Gcode 檔名" {...register("gcodeFileName")} />
              </div>

              {/* 列印設定 */}
              <div>
                <p className="text-sm font-semibold mb-3">列印設定</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Controller
                    control={control}
                    name="printer"
                    render={({ field }) => (
                      <Select label="Printer" {...field}>
                        {PRINTERS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </Select>
                    )}
                  />
                  <Controller
                    control={control}
                    name="material"
                    render={({ field }) => (
                      <Select label="材料" {...field}>
                        {MATERIALS.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </Select>
                    )}
                  />
                  <Input label="材料品牌" {...register("materialBrand")} />
                  <Input label="顏色" {...register("color")} />
                  <Input
                    label="使用克數 (g)"
                    type="number"
                    step="0.1"
                    {...register("materialGrams")}
                    error={errors.materialGrams?.message}
                  />
                  <Input
                    label="列印時間 (分鐘)"
                    type="number"
                    {...register("printTimeMinutes")}
                    error={errors.printTimeMinutes?.message}
                  />
                  <Input
                    label="層高 (mm)"
                    type="number"
                    step="0.01"
                    {...register("layerHeight")}
                    error={errors.layerHeight?.message}
                  />
                  <Input
                    label="噴嘴尺寸 (mm)"
                    type="number"
                    step="0.1"
                    {...register("nozzleSize")}
                    error={errors.nozzleSize?.message}
                  />
                  <Input
                    label="填充率 (%)"
                    type="number"
                    {...register("infillPercentage")}
                    error={errors.infillPercentage?.message}
                  />
                  <Input label="支撐設定" {...register("supportSetting")} />
                  <Input
                    label="速度 (mm/s)"
                    type="number"
                    {...register("speed")}
                    error={errors.speed?.message}
                  />
                </div>
              </div>

              {/* 日期 */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="列印日期"
                  type="date"
                  {...register("printDateInput")}
                  error={errors.printDateInput?.message}
                />
                <Input label="完成日期" type="date" {...register("completedDateInput")} />
              </div>

              {status === "failed" && (
                <Textarea label="失敗原因" rows={2} {...register("failureReason")} />
              )}

              <Textarea label="備註" rows={2} {...register("notes")} />

              {/* 財務（可從耗材庫存自動帶入材料成本，或手動輸入） */}
              {filaments.length > 0 && (
                <Select
                  label="從耗材庫存帶入材料成本（可選）"
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    const f = filaments.find((x) => x.id === e.target.value);
                    if (!f) return;
                    const grams = Number(watch("materialGrams")) || 0;
                    const pricePerGram = f.price / f.weightGrams;
                    setValue("materialCost", Number((grams * pricePerGram).toFixed(2)));
                  }}
                  defaultValue=""
                >
                  <option value="">不使用，手動輸入下方成本</option>
                  {filaments.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.brand} {f.material} {f.color}（NT${(f.price / f.weightGrams).toFixed(2)}/g，剩{" "}
                      {f.remainingGrams}g）
                    </option>
                  ))}
                </Select>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="材料成本 (NT$)"
                  type="number"
                  step="0.1"
                  {...register("materialCost")}
                  error={errors.materialCost?.message}
                />
                <Input
                  label="售價 (NT$)"
                  type="number"
                  step="0.1"
                  {...register("revenue")}
                  error={errors.revenue?.message}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 sticky bottom-0 bg-surface-card dark:bg-surface-dark-card">
                <Button variant="ghost" type="button" onClick={onClose}>
                  取消
                </Button>
                <Button type="submit" isLoading={submitting}>
                  {job ? "儲存變更" : "新增"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
