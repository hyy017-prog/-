import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useFilaments } from "@/hooks/useFilaments";
import { useCostSettings } from "@/hooks/useCostSettings";
import { formatCurrency } from "@/utils/format";
import type { CostSettings } from "@/types";

interface CalculatorForm {
  filamentId: string;
  manualPricePerGram: number;
  materialGrams: number;
  printTimeMinutes: number;
  laborMinutes: number;
  quantity: number;
}

export default function CostCalculatorPage() {
  const { filaments, loading: filamentsLoading } = useFilaments();
  const { settings, loading: settingsLoading, saving, save } = useCostSettings();

  const [showSettings, setShowSettings] = useState(false);
  const [localSettings, setLocalSettings] = useState<CostSettings>(settings);
  const [markupMode, setMarkupMode] = useState<"1.5" | "2" | "3" | "custom">("2");
  const [customMarkup, setCustomMarkup] = useState(2.5);

  // 設定載入完成後同步進本地編輯狀態
  useEffect(() => {
    if (!settingsLoading) setLocalSettings(settings);
  }, [settingsLoading, settings]);

  const { register, watch } = useForm<CalculatorForm>({
    defaultValues: {
      filamentId: "",
      manualPricePerGram: 0.8,
      materialGrams: 20,
      printTimeMinutes: 120,
      laborMinutes: 15,
      quantity: 1,
    },
  });

  const values = watch();
  const selectedFilament = filaments.find((f) => f.id === values.filamentId);
  const pricePerGram = selectedFilament
    ? selectedFilament.price / selectedFilament.weightGrams
    : Number(values.manualPricePerGram) || 0;

  const breakdown = useMemo(() => {
    const grams = Number(values.materialGrams) || 0;
    const printMinutes = Number(values.printTimeMinutes) || 0;
    const laborMinutes = Number(values.laborMinutes) || 0;
    const qty = Math.max(1, Number(values.quantity) || 1);

    const materialCost = grams * pricePerGram;
    const electricityCost =
      (printMinutes / 60) * (localSettings.printerPowerWatts / 1000) *
      localSettings.electricityRatePerKwh;
    const depreciationCost = (printMinutes / 60) * localSettings.machineDepreciationPerHour;
    const laborCost = (laborMinutes / 60) * localSettings.laborRatePerHour;
    const packagingCost = localSettings.packagingCost;
    const shippingCost = localSettings.shippingCost;

    const subtotal =
      materialCost + electricityCost + depreciationCost + laborCost + packagingCost + shippingCost;
    const platformFee = subtotal * (localSettings.platformFeePercent / 100);
    const tax = subtotal * (localSettings.taxPercent / 100);
    const totalCostPerUnit = subtotal + platformFee + tax;
    const totalCost = totalCostPerUnit * qty;

    return {
      materialCost,
      electricityCost,
      depreciationCost,
      laborCost,
      packagingCost,
      shippingCost,
      platformFee,
      tax,
      totalCostPerUnit,
      totalCost,
      qty,
    };
  }, [values, pricePerGram, localSettings]);

  const markup =
    markupMode === "1.5" ? 1.5 : markupMode === "2" ? 2 : markupMode === "3" ? 3 : customMarkup;
  const suggestedPricePerUnit = breakdown.totalCostPerUnit * markup;
  const suggestedPriceTotal = suggestedPricePerUnit * breakdown.qty;
  const profitPerUnit = suggestedPricePerUnit - breakdown.totalCostPerUnit;

  const handleSaveSettings = async () => {
    try {
      await save(localSettings);
      toast.success("已儲存成本設定");
      setShowSettings(false);
    } catch (err) {
      console.error(err);
      toast.error("儲存失敗，請再試一次");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-display font-bold">成本計算</h2>
          <p className="text-sm text-ink-500 mt-1">
            依材料、電費、機器折舊等自動試算成本，並建議售價
          </p>
        </div>
        <Button variant="secondary" onClick={() => setShowSettings((v) => !v)}>
          <Cog6ToothIcon className="h-4 w-4" />
          成本參數設定
        </Button>
      </div>

      {showSettings && (
        <Card>
          <CardHeader>
            <h3 className="font-display font-semibold">全域成本參數</h3>
            <p className="text-xs text-ink-500">套用到之後每一次的成本試算，可隨時調整</p>
          </CardHeader>
          {settingsLoading ? (
            <p className="text-sm text-ink-500">載入中...</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Input
                label="電費單價 (NT$/度)"
                type="number"
                step="0.1"
                value={localSettings.electricityRatePerKwh}
                onChange={(e) =>
                  setLocalSettings((s) => ({ ...s, electricityRatePerKwh: Number(e.target.value) }))
                }
              />
              <Input
                label="印表機功率 (W)"
                type="number"
                value={localSettings.printerPowerWatts}
                onChange={(e) =>
                  setLocalSettings((s) => ({ ...s, printerPowerWatts: Number(e.target.value) }))
                }
              />
              <Input
                label="人工時薪 (NT$)"
                type="number"
                value={localSettings.laborRatePerHour}
                onChange={(e) =>
                  setLocalSettings((s) => ({ ...s, laborRatePerHour: Number(e.target.value) }))
                }
              />
              <Input
                label="機器折舊 (NT$/小時)"
                type="number"
                value={localSettings.machineDepreciationPerHour}
                onChange={(e) =>
                  setLocalSettings((s) => ({
                    ...s,
                    machineDepreciationPerHour: Number(e.target.value),
                  }))
                }
              />
              <Input
                label="包材成本 (NT$/件)"
                type="number"
                value={localSettings.packagingCost}
                onChange={(e) =>
                  setLocalSettings((s) => ({ ...s, packagingCost: Number(e.target.value) }))
                }
              />
              <Input
                label="運費 (NT$/件)"
                type="number"
                value={localSettings.shippingCost}
                onChange={(e) =>
                  setLocalSettings((s) => ({ ...s, shippingCost: Number(e.target.value) }))
                }
              />
              <Input
                label="平台抽成 (%)"
                type="number"
                value={localSettings.platformFeePercent}
                onChange={(e) =>
                  setLocalSettings((s) => ({ ...s, platformFeePercent: Number(e.target.value) }))
                }
              />
              <Input
                label="稅金 (%)"
                type="number"
                value={localSettings.taxPercent}
                onChange={(e) =>
                  setLocalSettings((s) => ({ ...s, taxPercent: Number(e.target.value) }))
                }
              />
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button onClick={handleSaveSettings} isLoading={saving}>
              儲存設定
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-display font-semibold mb-4">作品參數</h3>
          <div className="space-y-4">
            <Select label="從耗材庫存選擇（可選）" {...register("filamentId")}>
              <option value="">不使用庫存，手動輸入單價</option>
              {filaments.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.brand} {f.material} {f.color}（NT$
                  {(f.price / f.weightGrams).toFixed(2)}/g）
                </option>
              ))}
            </Select>

            {!values.filamentId && (
              <Input
                label="材料單價 (NT$/g)"
                type="number"
                step="0.01"
                {...register("manualPricePerGram")}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input label="使用克數 (g)" type="number" {...register("materialGrams")} />
              <Input label="列印時間 (分鐘)" type="number" {...register("printTimeMinutes")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="人工處理時間 (分鐘)" type="number" {...register("laborMinutes")} />
              <Input label="數量" type="number" min={1} {...register("quantity")} />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-display font-semibold mb-4">成本試算（單件）</h3>
          {filamentsLoading || settingsLoading ? (
            <p className="text-sm text-ink-500">載入中...</p>
          ) : (
            <dl className="space-y-2 text-sm">
              <Row label="材料成本" value={breakdown.materialCost} />
              <Row label="電費" value={breakdown.electricityCost} />
              <Row label="機器折舊" value={breakdown.depreciationCost} />
              <Row label="人工" value={breakdown.laborCost} />
              <Row label="包材" value={breakdown.packagingCost} />
              <Row label="運費" value={breakdown.shippingCost} />
              <Row label="平台抽成" value={breakdown.platformFee} />
              <Row label="稅金" value={breakdown.tax} />
              <div className="border-t border-black/5 dark:border-white/5 my-2" />
              <Row label="總成本（單件）" value={breakdown.totalCostPerUnit} bold />
              {breakdown.qty > 1 && (
                <Row label={`總成本（共 ${breakdown.qty} 件）`} value={breakdown.totalCost} bold />
              )}
            </dl>
          )}
        </Card>
      </div>

      <Card>
        <h3 className="font-display font-semibold mb-4">建議售價</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {(["1.5", "2", "3", "custom"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMarkupMode(m)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                markupMode === m
                  ? "bg-brand-500 text-white"
                  : "bg-black/5 dark:bg-white/10 text-ink-700 dark:text-ink-300 hover:bg-black/10 dark:hover:bg-white/15"
              }`}
            >
              {m === "1.5" ? "150%" : m === "2" ? "200%" : m === "3" ? "300%" : "自訂"}
            </button>
          ))}
          {markupMode === "custom" && (
            <input
              type="number"
              step="0.1"
              value={customMarkup}
              onChange={(e) => setCustomMarkup(Number(e.target.value))}
              className="w-24 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm"
            />
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-brand-500/10 p-4">
            <p className="text-xs text-ink-500 mb-1">建議售價（單件）</p>
            <p className="text-xl font-display font-bold text-brand-600 dark:text-brand-400">
              {formatCurrency(suggestedPricePerUnit)}
            </p>
          </div>
          <div className="rounded-xl bg-black/5 dark:bg-white/5 p-4">
            <p className="text-xs text-ink-500 mb-1">預估利潤（單件）</p>
            <p className="text-xl font-display font-bold">{formatCurrency(profitPerUnit)}</p>
          </div>
          {breakdown.qty > 1 && (
            <div className="rounded-xl bg-black/5 dark:bg-white/5 p-4">
              <p className="text-xs text-ink-500 mb-1">建議售價（共 {breakdown.qty} 件）</p>
              <p className="text-xl font-display font-bold">{formatCurrency(suggestedPriceTotal)}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className={bold ? "font-semibold" : "text-ink-500"}>{label}</dt>
      <dd className={bold ? "font-semibold" : ""}>{formatCurrency(value)}</dd>
    </div>
  );
}
