import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToFilaments } from "@/services/filamentService";
import type { Filament } from "@/types";

export function useFilaments() {
  const { user } = useAuth();
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setFilaments([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToFilaments(
      user.uid,
      (data) => {
        setFilaments(data);
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

  const lowStockFilaments = useMemo(
    () => filaments.filter((f) => f.remainingGrams <= f.lowStockThreshold),
    [filaments]
  );

  return { filaments, lowStockFilaments, loading, error };
}
