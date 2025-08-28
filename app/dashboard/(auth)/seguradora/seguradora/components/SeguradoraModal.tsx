"use client";

import React, { useState, useEffect } from "react";
import { SeguradoraEditForm } from "./editarSeguradora";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type Seguradora = {
  id: string;
  seguradora_hash: string;
  nome: string;
  razao_social: string;
  cnpj: string;
  status: number; // Changed from status?: number to status: number
};

type SeguradoraDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  seguradora: Seguradora | null;
  onRefresh?: () => void;
};

export function SeguradoraModal({ isOpen, onClose, seguradora, onRefresh }: SeguradoraDrawerProps) {
  const [formData, setFormData] = useState<Seguradora | null>(null);

  useEffect(() => {
    if (isOpen && seguradora) {
      setFormData({ ...seguradora });
    }
  }, [seguradora, isOpen]);

  if (!isOpen || !formData) return null;

  const handleSuccess = () => {
    // toast.success("Seguradora atualizada com sucesso!", {
    //   style: {
    //     background: "var(--toast-success)",
    //     color: "var(--toast-success-foreground)",
    //     boxShadow: "var(--toast-shadow)"
    //   }
    // });
    onRefresh?.();
    onClose();
  };

  return (
    <div className="w-full space-y-4 px-6">
      <SeguradoraEditForm seguradora={formData} onClose={handleSuccess} />
    </div>
  );
}
