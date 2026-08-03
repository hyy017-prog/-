import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToOrders } from "@/services/orderService";
import type { Order } from "@/types";

export function useOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToOrders(
      user.uid,
      (data) => {
        setOrders(data);
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

  return { orders, loading, error };
}
