import { useMemo, useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  WrenchScrewdriverIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EquipmentFormModal } from "@/components/equipment/EquipmentFormModal";
import { useAuth } from "@/contexts/AuthContext";
import { useEquipment, getMaintenanceStatus } from "@/hooks/useEquipment";
import { usePrintJobStats } from "@/hooks/usePrintJobStats";
import {
  addEquipment,
  updateEquipment,
  deleteEquipment,
} from "@/services/equipmentService";
import { formatDate, formatMinutes } from "@/utils/format";
import { cn } from "@/utils/cn";
import {
  EQUIPMENT_TYPE_LABEL,
  type Equipment,
  type EquipmentFormValues,
  type MaintenanceStatus,
} from "@/types";

const STATUS_STYLE: Record<MaintenanceStatus, string> = {
  ok: "bg-brand-500/10 text-brand-600 dark:text-brand-400",
  due_soon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  overdue: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const STATUS_LABEL: Record<MaintenanceStatus, string> = {
  ok: "保養正常",
  due_soon: "即將到期",
  overdue: "保養逾期",
};

export default function EquipmentPage() {
  const { user } = useAuth();
  const { equipment, dueForMaintenance, loading } = useEquipment();
  const { stats } = usePrintJobStats();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [deleting, setDeleting] = useState<Equipment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const printerMinutesByModel = useMemo(() => {
    const map = new Map<string, number>();
    stats.allJobs.forEach((j) => {
      if (!j.printer) return;
      map.set(j.printer, (map.get(j.printer) ?? 0) + (j.printTimeMinutes || 0));
    });
    return map;
  }, [stats.allJobs]);

  const filtered = useMemo(() => {
    if (!search.trim()) return equipment;
    const q = search.trim().toLowerCase();
    return equipment.filter(
      (e) => e.name.toLowerCase().includes(q) || e.model.toLowerCase().includes(q)
    );
  }, [equipment, search]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (e: Equipment) => {
    setEditing(e);
    setModalOpen(true);
  };

  const handleSubmit = async (values: EquipmentFormValues) => {
    if (!user) return;
    try {
      if (editing) {
        await updateEquipment(user.uid, editing.id, values);
        toast.success("已更新設備");
      } else {
        await addEquipment(user.uid, values);
        toast.success("已新增設備");
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
      await deleteEquipment(user.uid, deleting.id);
      toast.success("已刪除設備");
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
          <h2 className="text-2xl font-display font-bold">設備管理</h2>
          <p className="text-sm text-ink-500 mt-1">共 {equipment.length} 項設備</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="h-4 w-4" />
          新增設備
        </Button>
      </div>

      {dueForMaintenance.length > 0 && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 flex items-start gap-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              {dueForMaintenance.length} 項設備需要保養
            </p>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-0.5">
              {dueForMaintenance.map((e) => e.name).join("、")}
            </p>
          </div>
        </div>
      )}

      <Card>
        <Input
          placeholder="搜尋設備名稱、型號..."
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
            {equipment.length === 0 ? "還沒有任何設備" : "找不到符合條件的結果"}
          </p>
          {equipment.length === 0 && (
            <Button size="sm" className="mt-4" onClick={openCreate}>
              <PlusIcon className="h-4 w-4" />
              新增第一項設備
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => {
            const { status, daysRemaining } = getMaintenanceStatus(e);
            const platformMinutes = printerMinutesByModel.get(e.model) ?? 0;
            return (
              <Card key={e.id} className="flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{e.name}</p>
                    <p className="text-xs text-ink-500 truncate">
                      {EQUIPMENT_TYPE_LABEL[e.type]} · {e.model || "未指定型號"}
                    </p>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
                    <WrenchScrewdriverIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                </div>

                <div className="mb-3">
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                      STATUS_STYLE[status]
                    )}
                  >
                    {STATUS_LABEL[status]}
                    {status !== "ok" && daysRemaining !== null && (
                      <span className="ml-1">
                        （{daysRemaining <= 0 ? `已逾期 ${Math.abs(daysRemaining)} 天` : `剩 ${daysRemaining} 天`}）
                      </span>
                    )}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-y-1 text-xs text-ink-500 mb-4">
                  <dt>累積時數</dt>
                  <dd className="text-right text-ink-900 dark:text-ink-100">{e.accumulatedHours} 小時</dd>
                  <dt>上次保養</dt>
                  <dd className="text-right text-ink-900 dark:text-ink-100">
                    {e.lastMaintenanceDate ? formatDate(e.lastMaintenanceDate) : "尚未記錄"}
                  </dd>
                  {e.type === "printer" && platformMinutes > 0 && (
                    <>
                      <dt>平台記錄列印時數</dt>
                      <dd className="text-right text-ink-900 dark:text-ink-100">
                        {formatMinutes(platformMinutes)}
                      </dd>
                    </>
                  )}
                </dl>

                <div className="mt-auto flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(e)}>
                    <PencilIcon className="h-3.5 w-3.5" />
                    編輯
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleting(e)} aria-label="刪除">
                    <TrashIcon className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <EquipmentFormModal
        open={modalOpen}
        equipment={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleting}
        title="刪除設備"
        description={`確定要刪除「${deleting?.name}」嗎？此操作無法復原。`}
        confirmLabel="刪除"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
