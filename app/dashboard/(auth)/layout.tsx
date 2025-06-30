"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, tokenExpiraEm, loading } = useAuth();

  const [defaultOpen, setDefaultOpen] = useState(true);

  useEffect(() => {
    const sidebarCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("sidebar_state="))
      ?.split("=")[1];

    setDefaultOpen(sidebarCookie !== "false");
  }, []);

  useEffect(() => {
    if (!token) {
      // console.log("Token ausente: redirecionando para login em 2 segundos");
      const timer = setTimeout(() => {
        router.push("/dashboard/login");
      }, 2000);

      return () => clearTimeout(timer); // limpa caso o componente desmonte antes
    }
  }, [token, tokenExpiraEm, router]);

  useEffect(() => {
    if (!token || !tokenExpiraEm) return;

    const timeoutInicial = setTimeout(() => {
      const agora = new Date();
      const expira = new Date(tokenExpiraEm);
      const tempoRestante = expira.getTime() - agora.getTime();

      if (tempoRestante <= 0) {
        router.push("/dashboard/login");
        return;
      }

      const timeoutExpiracao = setTimeout(() => {
        router.push("/dashboard/login");
      }, tempoRestante);

      // Limpa o timeout de expiração se o token mudar antes do tempo
      return () => clearTimeout(timeoutExpiracao);
    }, 100000); // ⏱️ Espera 2 segundos antes de tudo

    // Limpa o timeout inicial se o token/tokenExpiraEm mudar
    return () => clearTimeout(timeoutInicial);
  }, [token, tokenExpiraEm]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-t-2 border-b-2" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar />
      <SidebarInset>
        <Header />
        <div className="@container/main p-4 xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto xl:group-data-[theme-content-layout=centered]/layout:mt-8">
          {children}
        </div>
        <Toaster position="top-center" />
      </SidebarInset>
    </SidebarProvider>
  );
}
