"use client";

import React, { useState, useEffect } from "react";
import { SeguroEditForm } from "./editarSeguro";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export type Seguro = {
  id: string;
  seguradora_hash: string;
  faixa_inicio: string;
  faixa_fim: string;
  valor_seguradora: string;
  valor_pago_cliente: string;
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
    onRefresh?.();
    onClose();
  };

  return (
    <div className="w-full space-y-4 px-6">
      <SeguroEditForm seguro={formData} onClose={handleSuccess} />
    </div>
  );
}