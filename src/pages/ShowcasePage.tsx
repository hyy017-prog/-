import { useMemo, useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  HeartIcon,
  ShareIcon,
  PhotoIcon,
  PlayCircleIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ShowcaseFormModal } from "@/components/showcase/ShowcaseFormModal";
import { useAuth } from "@/contexts/AuthContext";
import { useShowcaseItems } from "@/hooks/useShowcaseItems";
import { usePrintJobStats } from "@/hooks/usePrintJobStats";
import {
  addShowcaseItem,
  updateShowcaseItem,
  deleteShowcaseItem,
} from "@/services/showcaseService";
import { formatCurrency, formatMinutes } from "@/utils/format";
import type { ShowcaseItem, ShowcaseItemFormValues } from "@/types";

export default function ShowcasePage() {
  const { user } = useAuth();
  const { items, loading } = useShowcaseItems();
  const { stats } = usePrintJobStats();
  const completedJobs = useMemo(
    () => stats.allJobs.filter((j) => j.status === "completed"),
    [stats.allJobs]
  );

  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ShowcaseItem | null>(null);
  const [deleting, setDeleting] = useState<ShowcaseItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = useMemo(() => {
    let result = items;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.material.toLowerCase().includes(q)
      );
    }
    if (favoritesOnly) result = result.filter((i) => i.isFavorited);
    return result;
  }, [items, search, favoritesOnly]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (i: ShowcaseItem) => {
    setEditing(i);
    setModalOpen(true);
  };

  const handleSubmit = async (values: ShowcaseItemFormValues) => {
    if (!user) return;
    try {
      if (editing) {
        await updateShowcaseItem(user.uid, editing.id, values);
        toast.success("已更新作品");
      } else {
        await addShowcaseItem(user.uid, values);
        toast.success("已新增作品展示");
      }
    } catch (err) {
      console.error(err);
      toast.error("儲存失敗，請再試一次");
      throw err;
    }
  };

  const toggleFavorite = async (i: ShowcaseItem) => {
    if (!user) return;
    try {
      await updateShowcaseItem(user.uid, i.id, { isFavorited: !i.isFavorited });
    } catch (err) {
      console.error(err);
      toast.error("操作失敗，請再試一次");
    }
  };

  const handleShare = async (i: ShowcaseItem) => {
    const text = `${i.name}\n${i.description}\n材料：${i.material || "-"} · 列印時間：${formatMinutes(
      i.printTimeMinutes
    )}${i.price ? ` · 售價：${formatCurrency(i.price)}` : ""}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("已複製分享文字到剪貼簿");
    } catch {
      toast.error("複製失敗，你的瀏覽器可能不支援");
    }
  };

  const handleDelete = async () => {
    if (!user || !deleting) return;
    setIsDeleting(true);
    try {
      await deleteShowcaseItem(user.uid, deleting.id);
      toast.success("已刪除作品");
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
          <h2 className="text-2xl font-display font-bold">作品展示</h2>
          <p className="text-sm text-ink-500 mt-1">共 {items.length} 件作品</p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="h-4 w-4" />
          新增作品展示
        </Button>
      </div>

      <Card className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="搜尋作品名稱、介紹、材料..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant={favoritesOnly ? "primary" : "secondary"}
          onClick={() => setFavoritesOnly((v) => !v)}
        >
          {favoritesOnly ? (
            <HeartSolidIcon className="h-4 w-4" />
          ) : (
            <HeartIcon className="h-4 w-4" />
          )}
          只看收藏
        </Button>
      </Card>

      {loading ? (
        <div className="text-center py-16 text-sm text-ink-500">載入中...</div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center py-16 text-center">
          <div className="h-12 w-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center mb-3">
            <MagnifyingGlassIcon className="h-6 w-6 text-ink-300" />
          </div>
          <p className="text-sm font-medium">
            {items.length === 0 ? "還沒有任何作品展示" : "找不到符合條件的結果"}
          </p>
          {items.length === 0 && (
            <Button size="sm" className="mt-4" onClick={openCreate}>
              <PlusIcon className="h-4 w-4" />
              新增第一件作品
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((i) => (
            <Card key={i.id} className="flex flex-col overflow-hidden p-0">
              <div className="h-40 bg-black/5 dark:bg-white/5 flex items-center justify-center relative">
                {i.photoURL ? (
                  <img src={i.photoURL} alt={i.name} className="h-full w-full object-cover" />
                ) : (
                  <PhotoIcon className="h-10 w-10 text-ink-300" />
                )}
                {i.timelapseVideoURL && (
                  <a
                    href={i.timelapseVideoURL}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-2 right-2 bg-black/60 rounded-full p-1.5"
                    title="觀看縮時影片"
                  >
                    <PlayCircleIcon className="h-5 w-5 text-white" />
                  </a>
                )}
                <button
                  onClick={() => toggleFavorite(i)}
                  className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 rounded-full p-1.5 transition-colors"
                  aria-label="收藏"
                >
                  {i.isFavorited ? (
                    <HeartSolidIcon className="h-4 w-4 text-red-400" />
                  ) : (
                    <HeartIcon className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <p className="font-medium truncate mb-1">{i.name}</p>
                {i.description && (
                  <p className="text-xs text-ink-500 line-clamp-2 mb-3">{i.description}</p>
                )}

                <dl className="grid grid-cols-2 gap-y-1 text-xs text-ink-500 mb-4">
                  <dt>材料</dt>
                  <dd className="text-right text-ink-900 dark:text-ink-100">{i.material || "-"}</dd>
                  <dt>列印時間</dt>
                  <dd className="text-right text-ink-900 dark:text-ink-100">
                    {formatMinutes(i.printTimeMinutes)}
                  </dd>
                  <dt>售價</dt>
                  <dd className="text-right text-ink-900 dark:text-ink-100">
                    {formatCurrency(i.price)}
                  </dd>
                </dl>

                <div className="mt-auto flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" onClick={() => openEdit(i)}>
                    <PencilIcon className="h-3.5 w-3.5" />
                    編輯
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleShare(i)} aria-label="分享">
                    <ShareIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleting(i)} aria-label="刪除">
                    <TrashIcon className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ShowcaseFormModal
        open={modalOpen}
        item={editing}
        completedJobs={completedJobs}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={!!deleting}
        title="刪除作品展示"
        description={`確定要刪除「${deleting?.name}」嗎？此操作無法復原。`}
        confirmLabel="刪除"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
