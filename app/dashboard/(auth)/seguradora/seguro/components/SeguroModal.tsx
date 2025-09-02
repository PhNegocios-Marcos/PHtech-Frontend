"use client";

import React, { useState, useEffect } from "react";
import { SeguroEditForm } from "./editarSeguro";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type Seguro = {
  id: string;
  nome: string;
  faixa_inicio: string;
  faixa_fim: string;
  valor_seguradora: string;
  valor_pago_cliente: string;
  seguro_faixa_hash: string;
};

type SeguroDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  seguro: Seguro | null;
  onRefresh?: () => void;
};

export function SeguroModal({ isOpen, onClose, seguro, onRefresh }: SeguroDrawerProps) {
  const [formData, setFormData] = useState<Seguro | null>(null);

  useEffect(() => {
    if (isOpen && seguro) {
      setFormData({ ...seguro });
    }
  }, [seguro, isOpen]);

  if (!isOpen || !formData) return null;

  const handleSuccess = () => {
    // toast.success("Operação realizada com sucesso!", {
    //   style: {
    //     background: 'var(--toast-success)',
    //     color: 'var(--toast-success-foreground)',
    //     boxShadow: 'var(--toast-shadow)'
    //   }
    // });
    // onRefresh?.();
    onClose();
  };

  return (
    <div className="w-full space-y-4 px-6">
      <SeguroEditForm seguro={formData} onClose={handleSuccess} />
    </div>
  );
}
