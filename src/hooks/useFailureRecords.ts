import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToFailureRecords } from "@/services/failureService";
import type { FailureRecord } from "@/types";

export function useFailureRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<FailureRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToFailureRecords(
      user.uid,
      (data) => {
        setRecords(data);
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

  return { records, loading, error };
}
