import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToCustomers } from "@/services/customerService";
import type { Customer } from "@/types";

export function useCustomers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCustomers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToCustomers(
      user.uid,
      (data) => {
        setCustomers(data);
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

  return { customers, loading, error };
}
