import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToShowcaseItems } from "@/services/showcaseService";
import type { ShowcaseItem } from "@/types";

export function useShowcaseItems() {
  const { user } = useAuth();
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToShowcaseItems(
      user.uid,
      (data) => {
        setItems(data);
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

  return { items, loading, error };
}
