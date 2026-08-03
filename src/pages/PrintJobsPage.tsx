import { useMemo, useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusBadge } from "@/components/jobs/StatusBadge";
import { JobFormModal } from "@/components/jobs/JobFormModal";
import { useAuth } from "@/contexts/AuthContext";
import { usePrintJobStats } from "@/hooks/usePrintJobStats";
import {
  addPrintJob,
  updatePrintJob,
  deletePrintJob,
} from "@/services/printJobService";
import { formatCurrency, formatDate, formatMinutes } from "@/utils/format";
import { PRINT_JOB_STATUS_LABEL, type PrintJob, type PrintJobFormValues, type PrintJobStatus } from "@/types";

type SortKey = "printDate-desc" | "printDate-asc" | "name-asc" | "revenue-desc";

export default function PrintJobsPage() {
  const { user } = useAuth();
  // 這裡重用 Dashboard 的即時訂閱 hook 取得完整列表（stats.recentJobs 只取前 5 筆，
  // 所以我們改為直接透過同一份訂閱資料來源，在下方另外拉出完整清單）
  const { stats, loading } = usePrintJobStats();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PrintJobStatus | "all">("all");
  const [sort, setSort] = useState<SortKey>("printDate-desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<PrintJob | null>(null);
  const [deletingJob, setDeletingJob] = useState<PrintJob | null>(null);
  const [deleting, setDeleting] = useState(false);

  // usePrintJobStats 內部已訂閱完整資料，這裡透過 allJobs 取得（見下方 hook 調整）
  const allJobs = stats.allJobs;

  const filteredJobs = useMemo(() => {
    let result = allJobs;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (j) =>
          j.name.toLowerCase().includes(q) ||
          j.material.toLowerCase().includes(q) ||
          j.printer.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((j) => j.status === statusFilter);
    }

    const sorted = [...result];
    switch (sort) {
      case "printDate-desc":
        sorted.sort((a, b) => (b.printDate?.toMillis() ?? 0) - (a.printDate?.toMillis() ?? 0));
        break;
      case "printDate-asc":
        sorted.sort((a, b) => (a.printDate?.toMillis() ?? 0) - (b.printDate?.toMillis() ?? 0));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
        break;
      case "revenue-desc":
        sorted.sort((a, b) => b.revenue - a.revenue);
        break;
    }
    return sorted;
  }, [allJobs, search, statusFilter, sort]);

  const openCreate = () => {
    setEditingJob(null);
    setModalOpen(true);
  };

  const openEdit = (job: PrintJob) => {
    setEditingJob(job);
    setModalOpen(true);
  };

  const handleSubmit = async (values: PrintJobFormValues) => {
    if (!user) return;
    try {
      if (editingJob) {
        await updatePrintJob(user.uid, editingJob.id, values);
        toast.success("已更新列印工作");
      } else {
        await addPrintJob(user.uid, values);
        toast.success("已新增列印工作");
      }
    } catch (err) {
      console.error(err);
      toast.error("儲存失敗，請再試一次");
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!user || !deletingJob) return;
    setDeleting(true);
    try {
      await deletePrintJob(user.uid, deletingJob.id, deletingJob.photoURL);
      toast.success("已刪除列印工作");
      setDeletingJob(null);
    } catch (err) {
      console.error(err);
      toast.error("刪除失敗，請再試一次");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-display font-bold">列印作品管理</h2>
          <p className="text-sm text-ink-500 mt-1">
            共 {allJobs.length} 筆列印工作
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="h-4 w-4" />
          新增列印工作
        </Button>
      </div>

      <Card className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="搜尋作品名稱、材料、印表機..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PrintJobStatus | "all")}
          >
            <option value="all">全部狀態</option>
            {Object.entries(PRINT_JOB_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="printDate-desc">列印日期（新到舊）</option>
            <option value="printDate-asc">列印日期（舊到新）</option>
            <option value="name-asc">名稱（A-Z）</option>
            <option value="revenue-desc">售價（高到低）</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-16 text-sm text-ink-500">載入中...</div>
      ) : filteredJobs.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center mb-3">
            <MagnifyingGlassIcon className="h-6 w-6 text-ink-300" />
          </div>
          <p className="text-sm font-medium">
            {allJobs.length === 0 ? "還沒有任何列印工作" : "找不到符合條件的結果"}
          </p>
          {allJobs.length === 0 && (
            <Button size="sm" className="mt-4" onClick={openCreate}>
              <PlusIcon className="h-4 w-4" />
              新增第一筆
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="flex flex-col">
              <div className="flex gap-3 mb-3">
                <div className="h-16 w-16 rounded-xl bg-black/5 dark:bg-white/5 overflow-hidden shrink-0 flex items-center justify-center">
                  {job.photoURL ? (
                    <img src={job.photoURL} alt={job.name} className="h-full w-full object-cover" />
                  ) : (
                    <CubeIcon className="h-6 w-6 text-ink-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{job.name}</p>
                  <p className="text-xs text-ink-500 truncate">
                    {job.material} · {job.color || "未指定顏色"}
                  </p>
                  <div className="mt-1.5">
                    <StatusBadge status={job.status} />
                  </div>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-y-1 text-xs text-ink-500 mb-4">
                <dt>列印日期</dt>
                <dd className="text-right text-ink-900 dark:text-ink-100">{formatDate(job.printDate)}</dd>
                <dt>列印時間</dt>
                <dd className="text-right text-ink-900 dark:text-ink-100">{formatMinutes(job.printTimeMinutes)}</dd>
                <dt>使用克數</dt>
                <dd className="text-right text-ink-900 dark:text-ink-100">{job.materialGrams} g</dd>
                <dt>售價</dt>
                <dd className="text-right text-ink-900 dark:text-ink-100">{formatCurrency(job.revenue)}</dd>
              </dl>

              <div className="mt-auto flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(job)}>
                  <PencilIcon className="h-3.5 w-3.5" />
                  編輯
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingJob(job)}
                  aria-label="刪除"
                >
                  <TrashIcon className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <JobFormModal
        open={modalOpen}
        job={editingJob}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deletingJob}
        title="刪除列印工作"
        description={`確定要刪除「${deletingJob?.name}」嗎？此操作無法復原。`}
        confirmLabel="刪除"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeletingJob(null)}
      />
    </div>
  );
}
