"use client";

import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

type ProtectedRouteProps = {
  requiredPermission: string;
  children: React.ReactNode;
};

export default function ProtectedRoute({ requiredPermission, children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hasPermission = useHasPermission(requiredPermission);

  useEffect(() => {
    if (!hasPermission) {
      router.replace("/dashboard/default");
    }
  }, [hasPermission, pathname, router]);

  if (!hasPermission) return null;

  return <>{children}</>;
}
