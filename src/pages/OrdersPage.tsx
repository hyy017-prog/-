import { useMemo, useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PrinterIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PaymentStatusBadge } from "@/components/orders/PaymentStatusBadge";
import { OrderFormModal } from "@/components/orders/OrderFormModal";
import { OrderPrintModal } from "@/components/orders/OrderPrintModal";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useOrders";
import { useCustomers } from "@/hooks/useCustomers";
import { addOrder, updateOrder, deleteOrder } from "@/services/orderService";
import { formatCurrency, formatDate } from "@/utils/format";
import { PAYMENT_STATUS_LABEL, type Order, type OrderFormValues, type PaymentStatus } from "@/types";

export default function OrdersPage() {
  const { user } = useAuth();
  const { orders, loading } = useOrders();
  const { customers } = useCustomers();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [printing, setPrinting] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    let result = orders;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.productName.toLowerCase().includes(q) ||
          o.trackingNumber.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((o) => o.paymentStatus === statusFilter);
    }
    return result;
  }, [orders, search, statusFilter]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (o: Order) => {
    setEditing(o);
    setModalOpen(true);
  };

  const handleSubmit = async (values: OrderFormValues) => {
    if (!user) return;
    const customer = customers.find((c) => c.id === values.customerId);
    const customerName = customer?.name ?? "未知客戶";
    try {
      if (editing) {
        await updateOrder(user.uid, editing.id, values, customerName);
        toast.success("已更新訂單");
      } else {
        await addOrder(user.uid, values, customerName);
        toast.success("已新增訂單");
      }
    } catch (err) {
      console.error(err);
      toast.error("儲存失敗，請再試一次");
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!user || !deleting) return;
    setIsDeleting(true);
    try {
      await deleteOrder(user.uid, deleting.id);
      toast.success("已刪除訂單");
      setDeleting(null);
    } catch (err) {
      console.error(err);
      toast.error("刪除失敗，請再試一次");
    } finally {
      setIsDeleting(false);
    }
  };

  const printingCustomer = printing
    ? customers.find((c) => c.id === printing.customerId) ?? null
    : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-display font-bold">訂單管理</h2>
          <p className="text-sm text-ink-500 mt-1">共 {orders.length} 筆訂單</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="h-4 w-4" />
          新增訂單
        </Button>
      </div>

      <Card className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="搜尋客戶、產品、宅配單號..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | "all")}
          >
            <option value="all">全部付款狀態</option>
            {Object.entries(PAYMENT_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-16 text-sm text-ink-500">載入中...</div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center mb-3">
            <MagnifyingGlassIcon className="h-6 w-6 text-ink-300" />
          </div>
          <p className="text-sm font-medium">
            {orders.length === 0 ? "還沒有任何訂單" : "找不到符合條件的結果"}
          </p>
          {orders.length === 0 && customers.length === 0 && (
            <p className="text-xs text-ink-500 mt-1">請先到「客戶管理」新增客戶</p>
          )}
          {orders.length === 0 && customers.length > 0 && (
            <Button size="sm" className="mt-4" onClick={openCreate}>
              <PlusIcon className="h-4 w-4" />
              新增第一筆訂單
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((o) => (
            <Card key={o.id} className="flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{o.customerName}</p>
                  <p className="text-xs text-ink-500 truncate">{o.productName}</p>
                </div>
                <div className="h-9 w-9 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                </div>
              </div>

              <div className="mb-3">
                <PaymentStatusBadge status={o.paymentStatus} />
              </div>

              <dl className="grid grid-cols-2 gap-y-1 text-xs text-ink-500 mb-4">
                <dt>數量</dt>
                <dd className="text-right text-ink-900 dark:text-ink-100">{o.quantity}</dd>
                <dt>金額</dt>
                <dd className="text-right text-ink-900 dark:text-ink-100">{formatCurrency(o.amount)}</dd>
                <dt>下單日期</dt>
                <dd className="text-right text-ink-900 dark:text-ink-100">{formatDate(o.orderDate)}</dd>
                <dt>交貨日期</dt>
                <dd className="text-right text-ink-900 dark:text-ink-100">
                  {o.deliveryDate ? formatDate(o.deliveryDate) : "-"}
                </dd>
              </dl>

              <div className="mt-auto flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(o)}>
                  <PencilIcon className="h-3.5 w-3.5" />
                  編輯
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setPrinting(o)} aria-label="列印">
                  <PrinterIcon className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleting(o)} aria-label="刪除">
                  <TrashIcon className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <OrderFormModal
        open={modalOpen}
        order={editing}
        customers={customers}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <OrderPrintModal
        open={!!printing}
        order={printing}
        customer={printingCustomer}
        onClose={() => setPrinting(null)}
      />

      <ConfirmDialog
        open={!!deleting}
        title="刪除訂單"
        description={`確定要刪除「${deleting?.customerName} - ${deleting?.productName}」這筆訂單嗎？此操作無法復原。`}
        confirmLabel="刪除"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
