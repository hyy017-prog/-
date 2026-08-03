import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon, PrinterIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import type { Customer, Order } from "@/types";
import { formatCurrency, formatDate } from "@/utils/format";

type DocType = "quotation" | "shipping" | "invoice";

const DOC_LABELS: Record<DocType, string> = {
  quotation: "報價單",
  shipping: "出貨單",
  invoice: "發票",
};

interface OrderPrintModalProps {
  open: boolean;
  order: Order | null;
  customer: Customer | null;
  onClose: () => void;
}

export function OrderPrintModal({ open, order, customer, onClose }: OrderPrintModalProps) {
  const [docType, setDocType] = useState<DocType>("quotation");

  if (!order) return null;

  const docNumber = `${docType === "quotation" ? "Q" : docType === "shipping" ? "S" : "IV"}-${order.id.slice(0, 8).toUpperCase()}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start lg:items-center justify-center bg-black/40 px-4 py-6 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="card w-full max-w-2xl p-6 my-auto"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
          >
            <div className="flex items-center justify-between mb-5 print:hidden">
              <h3 className="font-display font-semibold text-lg">列印文件</h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="關閉"
                type="button"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-2 mb-5 print:hidden">
              {(Object.keys(DOC_LABELS) as DocType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setDocType(t)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    docType === t
                      ? "bg-brand-500 text-white"
                      : "bg-black/5 dark:bg-white/10 text-ink-700 dark:text-ink-300"
                  }`}
                >
                  {DOC_LABELS[t]}
                </button>
              ))}
            </div>

            {/* 可列印內容 */}
            <div id="print-area" className="border border-black/10 rounded-xl p-8 text-black bg-white">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold">PrintOS</h1>
                  <p className="text-sm text-gray-500">3D 列印管理平台</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold">{DOC_LABELS[docType]}</h2>
                  <p className="text-sm text-gray-500">單號：{docNumber}</p>
                  <p className="text-sm text-gray-500">日期：{formatDate(order.orderDate)}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">客戶</p>
                <p className="font-medium">{customer?.name ?? order.customerName}</p>
                {customer?.phone && <p className="text-sm text-gray-600">{customer.phone}</p>}
                {customer?.address && <p className="text-sm text-gray-600">{customer.address}</p>}
              </div>

              <table className="w-full text-sm mb-6 border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-800">
                    <th className="text-left py-2">產品</th>
                    <th className="text-right py-2">數量</th>
                    <th className="text-right py-2">單價</th>
                    <th className="text-right py-2">金額</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-2">{order.productName}</td>
                    <td className="text-right py-2">{order.quantity}</td>
                    <td className="text-right py-2">{formatCurrency(order.unitPrice)}</td>
                    <td className="text-right py-2">{formatCurrency(order.amount)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="text-right py-2 font-semibold">
                      總計
                    </td>
                    <td className="text-right py-2 font-semibold">{formatCurrency(order.amount)}</td>
                  </tr>
                </tfoot>
              </table>

              {docType === "shipping" && (
                <div className="mb-6 text-sm">
                  <p className="text-gray-500 mb-1">物流資訊</p>
                  <p>
                    {order.shippingCompany || "未指定物流"}
                    {order.trackingNumber && ` · 單號：${order.trackingNumber}`}
                  </p>
                  <p className="text-gray-600 mt-1">
                    交貨日期：{order.deliveryDate ? formatDate(order.deliveryDate) : "未指定"}
                  </p>
                </div>
              )}

              {docType === "invoice" && (
                <div className="mb-6 text-sm">
                  <p className="text-gray-500 mb-1">付款狀態</p>
                  <p>{order.paymentMethod || "-"} · {order.paymentStatus === "paid" ? "已付款" : order.paymentStatus === "partial" ? "部分付款" : "未付款"}</p>
                </div>
              )}

              {order.notes && (
                <div className="text-sm text-gray-600 border-t border-gray-200 pt-4">
                  備註：{order.notes}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-5 print:hidden">
              <Button variant="ghost" onClick={onClose}>
                關閉
              </Button>
              <Button onClick={() => window.print()}>
                <PrinterIcon className="h-4 w-4" />
                列印 {DOC_LABELS[docType]}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
