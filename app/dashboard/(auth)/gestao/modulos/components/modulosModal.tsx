// Arquivo: ModulosDrawer.tsx
"use client";

import React, { useState, useEffect } from "react";
import { ModulosEditForm } from "./editModulos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type Modulos = {
  id: string;
  nome: string;
  status: number;
};

type ModalDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  modulos: Modulos | null;
  onRefresh?: () => void;
};

export function ModulosDrawer({ isOpen, onClose, modulos, onRefresh }: ModalDrawerProps) {
  const [formData, setFormData] = useState<Modulos | null>(null);

  useEffect(() => {
    if (isOpen && modulos) {
      try {
        setFormData({ ...modulos });
      } catch (error: any) {
        console.error("Erro ao carregar dados do módulo:", error.message || error);
        toast.error(`Erro ao carregar dados: ${error.message || error}`, {
          style: {
            background: 'var(--toast-error)',
            color: 'var(--toast-error-foreground)',
            boxShadow: 'var(--toast-shadow)'
          }
        });
        onClose();
      }
    }
  }, [modulos, isOpen]);

  if (!isOpen || !formData) return null;

  const handleSuccess = () => {
    onRefresh?.();
    onClose();
    toast.success("Operação realizada com sucesso!", {
      style: {
        background: 'var(--toast-success)',
        color: 'var(--toast-success-foreground)',
        boxShadow: 'var(--toast-shadow)'
      }
    });
  };

  return (
    <Tabs defaultValue="Informações">
      <ModulosEditForm modulos={formData} onClose={handleSuccess} />
    </Tabs>
  );
}