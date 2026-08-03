import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import type { Customer, Order, OrderFormValues, PaymentStatus } from "@/types";
import { dateInputToDate, timestampToDateInputValue } from "@/utils/format";

const orderSchema = z.object({
  customerId: z.string().min(1, "請選擇客戶"),
  productName: z.string().min(1, "請輸入產品名稱"),
  quantity: z.coerce.number().min(1, "數量至少為 1"),
  unitPrice: z.coerce.number().min(0, "不可為負數"),
  amount: z.coerce.number().min(0, "不可為負數"),
  paymentMethod: z.string().optional().default(""),
  paymentStatus: z.enum(["unpaid", "partial", "paid"]),
  orderDateInput: z.string().min(1, "請選擇下單日期"),
  deliveryDateInput: z.string().optional().default(""),
  shippingCompany: z.string().optional().default(""),
  trackingNumber: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

type OrderFormSchema = z.infer<typeof orderSchema>;

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "unpaid", label: "未付款" },
  { value: "partial", label: "部分付款" },
  { value: "paid", label: "已付款" },
];

interface OrderFormModalProps {
  open: boolean;
  order?: Order | null;
  customers: Customer[];
  onClose: () => void;
  onSubmit: (values: OrderFormValues) => Promise<void>;
}

export function OrderFormModal({
  open,
  order,
  customers,
  onClose,
  onSubmit,
}: OrderFormModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormSchema>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      paymentStatus: "unpaid",
    },
  });

  const quantity = watch("quantity");
  const unitPrice = watch("unitPrice");

  // 數量或單價變動時自動帶入金額（使用者仍可手動覆寫）
  useEffect(() => {
    const q = Number(quantity) || 0;
    const p = Number(unitPrice) || 0;
    setValue("amount", Number((q * p).toFixed(2)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity, unitPrice]);

  useEffect(() => {
    if (!open) return;
    if (order) {
      reset({
        customerId: order.customerId,
        productName: order.productName,
        quantity: order.quantity,
        unitPrice: order.unitPrice,
        amount: order.amount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderDateInput: timestampToDateInputValue(order.orderDate),
        deliveryDateInput: timestampToDateInputValue(order.deliveryDate),
        shippingCompany: order.shippingCompany,
        trackingNumber: order.trackingNumber,
        notes: order.notes,
      });
    } else {
      reset({
        customerId: customers[0]?.id ?? "",
        productName: "",
        quantity: 1,
        unitPrice: 0,
        amount: 0,
        paymentMethod: "",
        paymentStatus: "unpaid",
        orderDateInput: new Date().toISOString().slice(0, 10),
        deliveryDateInput: "",
        shippingCompany: "",
        trackingNumber: "",
        notes: "",
      });
    }
  }, [open, order, customers, reset]);

  const submit = async (values: OrderFormSchema) => {
    setSubmitting(true);
    try {
      const orderDate = dateInputToDate(values.orderDateInput);
      const deliveryDate = values.deliveryDateInput
        ? dateInputToDate(values.deliveryDateInput)
        : null;

      const formValues: OrderFormValues = {
        customerId: values.customerId,
        productName: values.productName,
        quantity: values.quantity,
        unitPrice: values.unitPrice,
        amount: values.amount,
        paymentMethod: values.paymentMethod,
        paymentStatus: values.paymentStatus,
        shippingCompany: values.shippingCompany,
        trackingNumber: values.trackingNumber,
        notes: values.notes,
        orderDate: orderDate ? Timestamp.fromDate(orderDate) : null,
        deliveryDate: deliveryDate ? Timestamp.fromDate(deliveryDate) : null,
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
                {order ? "編輯訂單" : "新增訂單"}
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

            {customers.length === 0 ? (
              <p className="text-sm text-ink-500 py-6 text-center">
                請先到「客戶管理」新增至少一位客戶，才能建立訂單。
              </p>
            ) : (
              <form onSubmit={handleSubmit(submit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                <Select label="客戶" {...register("customerId")} error={errors.customerId?.message}>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>

                <Input
                  label="產品"
                  {...register("productName")}
                  error={errors.productName?.message}
                />

                <div className="grid grid-cols-3 gap-4">
                  <Input label="數量" type="number" {...register("quantity")} error={errors.quantity?.message} />
                  <Input
                    label="單價 (NT$)"
                    type="number"
                    step="0.1"
                    {...register("unitPrice")}
                    error={errors.unitPrice?.message}
                  />
                  <Input
                    label="金額 (NT$)"
                    type="number"
                    step="0.1"
                    {...register("amount")}
                    error={errors.amount?.message}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="付款方式" placeholder="例如：現金、轉帳、LINE Pay" {...register("paymentMethod")} />
                  <Select label="付款狀態" {...register("paymentStatus")}>
                    {PAYMENT_STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="下單日期"
                    type="date"
                    {...register("orderDateInput")}
                    error={errors.orderDateInput?.message}
                  />
                  <Input label="交貨日期" type="date" {...register("deliveryDateInput")} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="物流" placeholder="例如：黑貓宅急便" {...register("shippingCompany")} />
                  <Input label="宅配單號" {...register("trackingNumber")} />
                </div>

                <Textarea label="備註" rows={2} {...register("notes")} />

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" type="button" onClick={onClose}>
                    取消
                  </Button>
                  <Button type="submit" isLoading={submitting}>
                    {order ? "儲存變更" : "新增"}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
