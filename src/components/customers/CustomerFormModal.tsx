import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { Customer, CustomerFormValues } from "@/types";

const customerSchema = z.object({
  name: z.string().min(1, "請輸入姓名"),
  phone: z.string().optional().default(""),
  email: z.string().email("Email 格式不正確").optional().or(z.literal("")),
  address: z.string().optional().default(""),
  line: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

type CustomerFormSchema = z.infer<typeof customerSchema>;

interface CustomerFormModalProps {
  open: boolean;
  customer?: Customer | null;
  onClose: () => void;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
}

export function CustomerFormModal({
  open,
  customer,
  onClose,
  onSubmit,
}: CustomerFormModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormSchema>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    if (!open) return;
    reset(
      customer
        ? {
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            line: customer.line,
            notes: customer.notes,
          }
        : { name: "", phone: "", email: "", address: "", line: "", notes: "" }
    );
  }, [open, customer, reset]);

  const submit = async (values: CustomerFormSchema) => {
    setSubmitting(true);
    try {
      await onSubmit({ ...values, email: values.email ?? "" });
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
                {customer ? "編輯客戶" : "新增客戶"}
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
              <Input label="姓名" {...register("name")} error={errors.name?.message} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="電話" {...register("phone")} />
                <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
              </div>
              <Input label="地址" {...register("address")} />
              <Input label="LINE ID" {...register("line")} />
              <Textarea label="備註" rows={2} {...register("notes")} />

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>
                  取消
                </Button>
                <Button type="submit" isLoading={submitting}>
                  {customer ? "儲存變更" : "新增"}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
