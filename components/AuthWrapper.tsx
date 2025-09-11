"use client"

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token } = useAuth();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (token == null) {
        sessionStorage.clear();
        router.push("/dashboard/login");
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [token, router]);

  return <>{children}</>;
}