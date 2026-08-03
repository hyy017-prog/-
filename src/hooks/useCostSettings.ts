import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCostSettings, updateCostSettings } from "@/services/userSettingsService";
import { DEFAULT_COST_SETTINGS, type CostSettings } from "@/types";

export function useCostSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CostSettings>(DEFAULT_COST_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getCostSettings(user.uid)
      .then((s) => {
        if (!cancelled) setSettings(s);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const save = async (next: CostSettings) => {
    if (!user) return;
    setSaving(true);
    try {
      await updateCostSettings(user.uid, next);
      setSettings(next);
    } finally {
      setSaving(false);
    }
  };

  return { settings, loading, saving, save };
}
