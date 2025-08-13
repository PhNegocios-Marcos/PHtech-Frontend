"use client";

import React, { useState, useEffect } from "react";
import { TaxaEditForm } from "./editarTaxa";
import { Button } from "@/components/ui/button";

export type Taxa = {
  cad_tac_id: number;
  cad_tac_valor_minimo: string;
  cad_tac_valor_maximo: string;
  cad_tac_valor_cobrado: string;
};

type TaxaDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  taxa: Taxa | null;
  onRefresh?: () => void;
};

export function TaxaModal({ isOpen, onClose, taxa, onRefresh }: TaxaDrawerProps) {
  const [formData, setFormData] = useState<Taxa | null>(null);

  useEffect(() => {
    if (isOpen && taxa) {
      setFormData({ ...taxa });
    }
  }, [taxa, isOpen]);

  if (!isOpen || !formData) return null;

  const handleSuccess = () => {
    onRefresh?.();
    onClose();
  };

  return (
    <div className="w-full space-y-4 px-6">
      <TaxaEditForm taxa={formData} onClose={handleSuccess} />
    </div>
  );
}