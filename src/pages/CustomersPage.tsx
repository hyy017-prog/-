import { useMemo, useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CustomerFormModal } from "@/components/customers/CustomerFormModal";
import { useAuth } from "@/contexts/AuthContext";
import { useCustomers } from "@/hooks/useCustomers";
import { useOrders } from "@/hooks/useOrders";
import {
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "@/services/customerService";
import { formatCurrency } from "@/utils/format";
import type { Customer, CustomerFormValues } from "@/types";

export default function CustomersPage() {
  const { user } = useAuth();
  const { customers, loading } = useCustomers();
  const { orders } = useOrders();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const statsByCustomer = useMemo(() => {
    const map = new Map<string, { count: number; total: number }>();
    orders.forEach((o) => {
      const prev = map.get(o.customerId) ?? { count: 0, total: 0 };
      map.set(o.customerId, { count: prev.count + 1, total: prev.total + o.amount });
    });
    return map;
  }, [orders]);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.trim().toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setModalOpen(true);
  };

  const handleSubmit = async (values: CustomerFormValues) => {
    if (!user) return;
    try {
      if (editing) {
        await updateCustomer(user.uid, editing.id, values);
        toast.success("已更新客戶");
      } else {
        await addCustomer(user.uid, values);
        toast.success("已新增客戶");
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
      await deleteCustomer(user.uid, deleting.id);
      toast.success("已刪除客戶");
      setDeleting(null);
    } catch (err) {
      console.error(err);
      toast.error("刪除失敗，請再試一次");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-display font-bold">客戶管理</h2>
          <p className="text-sm text-ink-500 mt-1">共 {customers.length} 位客戶</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="h-4 w-4" />
          新增客戶
        </Button>
      </div>

      <Card>
        <Input
          placeholder="搜尋姓名、電話、Email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {loading ? (
        <div className="text-center py-16 text-sm text-ink-500">載入中...</div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center mb-3">
            <MagnifyingGlassIcon className="h-6 w-6 text-ink-300" />
          </div>
          <p className="text-sm font-medium">
            {customers.length === 0 ? "還沒有任何客戶" : "找不到符合條件的結果"}
          </p>
          {customers.length === 0 && (
            <Button size="sm" className="mt-4" onClick={openCreate}>
              <PlusIcon className="h-4 w-4" />
              新增第一位客戶
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const stat = statsByCustomer.get(c.id) ?? { count: 0, total: 0 };
            return (
              <Card key={c.id} className="flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-11 w-11 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                    <UserCircleIcon className="h-7 w-7 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{c.name}</p>
                    <p className="text-xs text-ink-500 truncate">{c.phone || c.email || "-"}</p>
                  </div>
                </div>

                <dl className="grid grid-cols-2 gap-y-1 text-xs text-ink-500 mb-4">
                  <dt>歷史訂單</dt>
                  <dd className="text-right text-ink-900 dark:text-ink-100">{stat.count} 筆</dd>
                  <dt>總消費</dt>
                  <dd className="text-right text-ink-900 dark:text-ink-100">
                    {formatCurrency(stat.total)}
                  </dd>
                  {c.line && (
                    <>
                      <dt>LINE</dt>
                      <dd className="text-right text-ink-900 dark:text-ink-100 truncate">{c.line}</dd>
                    </>
                  )}
                </dl>

                <div className="mt-auto flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(c)}>
                    <PencilIcon className="h-3.5 w-3.5" />
                    編輯
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleting(c)} aria-label="刪除">
                    <TrashIcon className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <CustomerFormModal
        open={modalOpen}
        customer={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleting}
        title="刪除客戶"
        description={`確定要刪除「${deleting?.name}」嗎？此操作不會刪除該客戶的歷史訂單，但無法復原客戶資料。`}
        confirmLabel="刪除"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
