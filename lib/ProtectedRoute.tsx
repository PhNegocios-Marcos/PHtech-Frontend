// routes/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";

type Props = {
  children: React.ReactNode;
  allowedTypes: string[];
};

export function ProtectedRoute({ children, allowedTypes }: Props) {
  // const { user } = useAuth();

  // if (!user || !allowedTypes.includes(user.tipo_acesso)) {
    return <Navigate to="/dashboard/default" replace />;
  // }

  return <>{children}</>;
}
