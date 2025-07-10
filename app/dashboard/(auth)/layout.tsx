"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { tokensToHast } from "shiki";

const TEMPO_INATIVIDADE = 30 * 60 * 1000; // 30 minutos
// const TEMPO_INATIVIDADE = 30 * 1000; // 30 minutos

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

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInatividade = () => {
    // alert("Você está inativo há 30 minutos!");
    router.push("/dashboard/login");
  };

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(handleInatividade, TEMPO_INATIVIDADE);
  };

  useEffect(() => {
    const eventos = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    eventos.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // inicia o timer ao montar

    return () => {
      eventos.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

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
