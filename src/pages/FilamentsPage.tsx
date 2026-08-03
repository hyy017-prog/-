import { useMemo, useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FilamentFormModal } from "@/components/filaments/FilamentFormModal";
import { useAuth } from "@/contexts/AuthContext";
import { useFilaments } from "@/hooks/useFilaments";
import {
  addFilament,
  updateFilament,
  deleteFilament,
} from "@/services/filamentService";
import { formatCurrency, formatDate } from "@/utils/format";
import type { Filament, FilamentFormValues } from "@/types";

export default function FilamentsPage() {
  const { user } = useAuth();
  const { filaments, lowStockFilaments, loading } = useFilaments();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Filament | null>(null);
  const [deleting, setDeleting] = useState<Filament | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return filaments;
    const q = search.trim().toLowerCase();
    return filaments.filter(
      (f) =>
        f.brand.toLowerCase().includes(q) ||
        f.material.toLowerCase().includes(q) ||
        f.color.toLowerCase().includes(q)
    );
  }, [filaments, search]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (f: Filament) => {
    setEditing(f);
    setModalOpen(true);
  };

  const handleSubmit = async (values: FilamentFormValues) => {
    if (!user) return;
    try {
      if (editing) {
        await updateFilament(user.uid, editing.id, values);
        toast.success("已更新耗材");
      } else {
        await addFilament(user.uid, values);
        toast.success("已新增耗材");
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
      await deleteFilament(user.uid, deleting.id);
      toast.success("已刪除耗材");
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
          <h2 className="text-2xl font-display font-bold">耗材管理</h2>
          <p className="text-sm text-ink-500 mt-1">共 {filaments.length} 捲耗材</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="h-4 w-4" />
          新增耗材
        </Button>
      </div>

      {lowStockFilaments.length > 0 && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3">
          <div className="flex items-start gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                {lowStockFilaments.length} 捲耗材庫存偏低
              </p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-0.5">
                {lowStockFilaments
                  .map((f) => `${f.brand} ${f.material} ${f.color}（剩 ${f.remainingGrams}g）`)
                  .join("、")}
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <Input
          placeholder="搜尋品牌、材料、顏色..."
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
            {filaments.length === 0 ? "還沒有任何耗材紀錄" : "找不到符合條件的結果"}
          </p>
          {filaments.length === 0 && (
            <Button size="sm" className="mt-4" onClick={openCreate}>
              <PlusIcon className="h-4 w-4" />
              新增第一捲
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((f) => {
            const isLow = f.remainingGrams <= f.lowStockThreshold;
            const percent = Math.min(
              100,
              Math.round((f.remainingGrams / f.weightGrams) * 100)
            );
            return (
              <Card key={f.id} className="flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {f.brand} · {f.material}
                    </p>
                    <p className="text-xs text-ink-500 truncate">{f.color || "未指定顏色"}</p>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                    <ArchiveBoxIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-ink-500 mb-1">
                    <span>剩餘 {f.remainingGrams}g</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isLow ? "bg-amber-500" : "bg-brand-500"}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  {isLow && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">庫存偏低，建議補貨</p>
                  )}
                </div>

                <dl className="grid grid-cols-2 gap-y-1 text-xs text-ink-500 mb-4">
                  <dt>購入價格</dt>
                  <dd className="text-right text-ink-900 dark:text-ink-100">{formatCurrency(f.price)}</dd>
                  <dt>購買日期</dt>
                  <dd className="text-right text-ink-900 dark:text-ink-100">{formatDate(f.purchaseDate)}</dd>
                  <dt>存放位置</dt>
                  <dd className="text-right text-ink-900 dark:text-ink-100 truncate">
                    {f.storageLocation || "-"}
                  </dd>
                  <dt>烘乾狀態</dt>
                  <dd className="text-right flex items-center justify-end gap-1">
                    {f.isDried ? (
                      <>
                        <CheckBadgeIcon className="h-3.5 w-3.5 text-brand-500" />
                        <span className="text-ink-900 dark:text-ink-100">已烘乾</span>
                      </>
                    ) : (
                      <span className="text-ink-900 dark:text-ink-100">未烘乾</span>
                    )}
                  </dd>
                </dl>

                <div className="mt-auto flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(f)}>
                    <PencilIcon className="h-3.5 w-3.5" />
                    編輯
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleting(f)} aria-label="刪除">
                    <TrashIcon className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <FilamentFormModal
        open={modalOpen}
        filament={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleting}
        title="刪除耗材"
        description={`確定要刪除「${deleting?.brand} ${deleting?.material} ${deleting?.color}」嗎？此操作無法復原。`}
        confirmLabel="刪除"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
