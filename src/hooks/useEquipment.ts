import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToEquipment } from "@/services/equipmentService";
import type { Equipment, MaintenanceStatus } from "@/types";

export function getMaintenanceStatus(item: Equipment): {
  status: MaintenanceStatus;
  daysSince: number | null;
  daysRemaining: number | null;
} {
  if (!item.lastMaintenanceDate || !item.maintenanceIntervalDays) {
    return { status: "ok", daysSince: null, daysRemaining: null };
  }
  const last = item.lastMaintenanceDate.toDate();
  const daysSince = Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = item.maintenanceIntervalDays - daysSince;

  let status: MaintenanceStatus = "ok";
  if (daysRemaining <= 0) status = "overdue";
  else if (daysRemaining <= 7) status = "due_soon";

  return { status, daysSince, daysRemaining };
}

export function useEquipment() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setEquipment([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToEquipment(
      user.uid,
      (data) => {
        setEquipment(data);
        setLoading(false);
        setError(null);
      },
      (message) => {
        setError(message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, [user]);

  const dueForMaintenance = useMemo(
    () =>
      equipment.filter((e) => {
        const { status } = getMaintenanceStatus(e);
        return status === "overdue" || status === "due_soon";
      }),
    [equipment]
  );

  return { equipment, dueForMaintenance, loading, error };
}
