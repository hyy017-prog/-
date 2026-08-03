import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { PrintJob, ShowcaseItem, ShowcaseItemFormValues } from "@/types";

const showcaseSchema = z.object({
  sourceJobId: z.string().optional().default(""),
  name: z.string().min(1, "請輸入作品名稱"),
  photoURL: z.string().optional().default(""),
  timelapseVideoURL: z.string().optional().default(""),
  description: z.string().optional().default(""),
  material: z.string().optional().default(""),
  printTimeMinutes: z.coerce.number().min(0, "不可為負數"),
  cost: z.coerce.number().min(0, "不可為負數"),
  price: z.coerce.number().min(0, "不可為負數"),
  isFavorited: z.boolean().default(false),
});

type ShowcaseFormSchema = z.infer<typeof showcaseSchema>;

interface ShowcaseFormModalProps {
  open: boolean;
  item?: ShowcaseItem | null;
  completedJobs: PrintJob[];
  onClose: () => void;
  onSubmit: (values: ShowcaseItemFormValues) => Promise<void>;
}

export function ShowcaseFormModal({
  open,
  item,
  completedJobs,
  onClose,
  onSubmit,
}: ShowcaseFormModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ShowcaseFormSchema>({
    resolver: zodResolver(showcaseSchema),
    defaultValues: { isFavorited: false },
  });

  useEffect(() => {
    if (!open) return;
    if (item) {
      reset({
        sourceJobId: item.sourceJobId ?? "",
        name: item.name,
        photoURL: item.photoURL,
        timelapseVideoURL: item.timelapseVideoURL,
        description: item.description,
        material: item.material,
        printTimeMinutes: item.printTimeMinutes,
        cost: item.cost,
        price: item.price,
        isFavorited: item.isFavorited,
      });
    } else {
      reset({
        sourceJobId: "",
        name: "",
        photoURL: "",
        timelapseVideoURL: "",
        description: "",
        material: "",
        printTimeMinutes: 0,
        cost: 0,
        price: 0,
        isFavorited: false,
      });
    }
  }, [open, item, reset]);

  const handleImportJob = (jobId: string) => {
    const job = completedJobs.find((j) => j.id === jobId);
    if (!job) return;
    setValue("sourceJobId", jobId);
    setValue("name", job.name);
    setValue("photoURL", job.photoURL ?? "");
    setValue("material", job.material);
    setValue("printTimeMinutes", job.printTimeMinutes);
    setValue("cost", job.totalCost);
    setValue("price", job.revenue);
  };

  const submit = async (values: ShowcaseFormSchema) => {
    setSubmitting(true);
    try {
      const formValues: ShowcaseItemFormValues = {
        sourceJobId: values.sourceJobId || null,
        name: values.name,
        photoURL: values.photoURL,
        timelapseVideoURL: values.timelapseVideoURL,
        description: values.description,
        material: values.material,
        printTimeMinutes: values.printTimeMinutes,
        cost: values.cost,
        price: values.price,
        isFavorited: values.isFavorited,
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
                {item ? "編輯作品展示" : "新增作品展示"}
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
              {!item && completedJobs.length > 0 && (
                <Select
                  label="從已完成的列印作品匯入（可選）"
                  onChange={(e) => handleImportJob(e.target.value)}
                  defaultValue=""
                >
                  <option value="">不匯入，手動填寫</option>
                  {completedJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.name}
                    </option>
                  ))}
                </Select>
              )}

              <Input label="作品名稱" {...register("name")} error={errors.name?.message} />
              <Input
                label="作品照片網址"
                placeholder="貼上圖片網址，或先在「列印作品管理」上傳照片後匯入"
                {...register("photoURL")}
              />
              <Input
                label="縮時影片網址"
                placeholder="YouTube / Vimeo 連結"
                {...register("timelapseVideoURL")}
              />
              <Textarea label="作品介紹" rows={3} {...register("description")} />

              <div className="grid grid-cols-2 gap-4">
                <Input label="材料" {...register("material")} />
                <Input
                  label="列印時間 (分鐘)"
                  type="number"
                  {...register("printTimeMinutes")}
                  error={errors.printTimeMinutes?.message}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="成本 (NT$)"
                  type="number"
                  step="0.1"
                  {...register("cost")}
                  error={errors.cost?.message}
                />
                <Input
                  label="售價 (NT$)"
                  type="number"
                  step="0.1"
                  {...register("price")}
                  error={errors.price?.message}
                />
              </div>

              <label className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-300">
                <input type="checkbox" className="rounded" {...register("isFavorited")} />
                加入收藏
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>
                  取消
                </Button>
                <Button type="submit" isLoading={submitting}>
                  {item ? "儲存變更" : "新增"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
