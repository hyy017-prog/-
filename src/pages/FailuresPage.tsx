import { useMemo, useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { FailureFormModal } from "@/components/failures/FailureFormModal";
import { useAuth } from "@/contexts/AuthContext";
import { useFailureRecords } from "@/hooks/useFailureRecords";
import {
  addFailureRecord,
  updateFailureRecord,
  deleteFailureRecord,
} from "@/services/failureService";
import { cn } from "@/utils/cn";
import {
  FAILURE_CATEGORY_LABEL,
  type FailureCategory,
  type FailureRecord,
  type FailureRecordFormValues,
} from "@/types";

export default function FailuresPage() {
  const { user } = useAuth();
  const { records, loading } = useFailureRecords();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<FailureCategory | "all">("all");
  const [resolvedFilter, setResolvedFilter] = useState<"all" | "resolved" | "unresolved">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FailureRecord | null>(null);
  const [deleting, setDeleting] = useState<FailureRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    let result = records;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.failureReason.toLowerCase().includes(q) ||
          r.solution.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "all") result = result.filter((r) => r.category === categoryFilter);
    if (resolvedFilter === "resolved") result = result.filter((r) => r.isResolved);
    if (resolvedFilter === "unresolved") result = result.filter((r) => !r.isResolved);
    return result;
  }, [records, search, categoryFilter, resolvedFilter]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (r: FailureRecord) => {
    setEditing(r);
    setModalOpen(true);
  };

  const handleSubmit = async (values: FailureRecordFormValues) => {
    if (!user) return;
    try {
      if (editing) {
        await updateFailureRecord(user.uid, editing.id, values);
        toast.success("已更新失敗案例");
      } else {
        await addFailureRecord(user.uid, values);
        toast.success("已新增失敗案例");
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
      await deleteFailureRecord(user.uid, deleting.id);
      toast.success("已刪除失敗案例");
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
          <h2 className="text-2xl font-display font-bold">列印失敗資料庫</h2>
          <p className="text-sm text-ink-500 mt-1">
            共 {records.length} 筆案例，Phase 5「AI 助手」上線後會引用這裡的資料回答問題
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="h-4 w-4" />
          新增失敗案例
        </Button>
      </div>

      <Card className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="搜尋失敗原因、解決方式..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as FailureCategory | "all")}
          >
            <option value="all">全部分類</option>
            {(Object.keys(FAILURE_CATEGORY_LABEL) as FailureCategory[]).map((k) => (
              <option key={k} value={k}>
                {FAILURE_CATEGORY_LABEL[k]}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-36">
          <Select
            value={resolvedFilter}
            onChange={(e) => setResolvedFilter(e.target.value as typeof resolvedFilter)}
          >
            <option value="all">全部狀態</option>
            <option value="resolved">已解決</option>
            <option value="unresolved">未解決</option>
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
            {records.length === 0 ? "還沒有任何失敗案例" : "找不到符合條件的結果"}
          </p>
          {records.length === 0 && (
            <Button size="sm" className="mt-4" onClick={openCreate}>
              <PlusIcon className="h-4 w-4" />
              新增第一筆
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <Card key={r.id} className="flex flex-col">
              <div className="flex gap-3 mb-3">
                <div className="h-14 w-14 rounded-xl bg-black/5 dark:bg-white/5 overflow-hidden shrink-0 flex items-center justify-center">
                  {r.photoURL ? (
                    <img src={r.photoURL} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <PhotoIcon className="h-6 w-6 text-ink-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-black/5 dark:bg-white/10 text-ink-700 dark:text-ink-300 mb-1">
                    {FAILURE_CATEGORY_LABEL[r.category]}
                  </span>
                  <p className="text-sm line-clamp-2">{r.failureReason}</p>
                </div>
              </div>

              {r.solution && (
                <p className="text-xs text-ink-500 line-clamp-2 mb-3">解法：{r.solution}</p>
              )}

              <div
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium mb-4",
                  r.isResolved ? "text-brand-600 dark:text-brand-400" : "text-amber-600 dark:text-amber-400"
                )}
              >
                {r.isResolved ? (
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                ) : (
                  <ExclamationTriangleIcon className="h-3.5 w-3.5" />
                )}
                {r.isResolved ? "已解決" : "未解決"}
              </div>

              <div className="mt-auto flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(r)}>
                  <PencilIcon className="h-3.5 w-3.5" />
                  編輯
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleting(r)} aria-label="刪除">
                  <TrashIcon className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <FailureFormModal
        open={modalOpen}
        record={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleting}
        title="刪除失敗案例"
        description="確定要刪除這筆失敗案例嗎？此操作無法復原。"
        confirmLabel="刪除"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
