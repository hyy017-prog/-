import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { FullPageSpinner } from "@/components/ui/Spinner";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();

  if (initializing) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
