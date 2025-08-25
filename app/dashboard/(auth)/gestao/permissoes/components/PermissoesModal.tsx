"use client";

import React, { useState, useEffect } from "react";
import { EquipeEditForm } from "./editarPromotora";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type Permissao = {
  id: string;
  nome: string;
  status: number;
  promotora?: string;
};

type EquipeDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  permissao: Permissao | null;
  onRefresh?: () => void;
};

export function PermissoesDrawer({ isOpen, onClose, permissao, onRefresh }: EquipeDrawerProps) {
  const [formData, setFormData] = useState<Permissao | null>(null);

  useEffect(() => {
    if (isOpen && permissao) {
      setFormData({ ...permissao });
      // toast.info("Dados da permissão carregados", {
      //   style: {
      //     background: 'var(--toast-info)',
      //     color: 'var(--toast-info-foreground)',
      //     boxShadow: 'var(--toast-shadow)'
      //   },
      //   description: `Editando: ${permissao.nome}`
      // });
    }
  }, [permissao, isOpen]);

  const handleSuccess = () => {
    // toast.success("Permissão atualizada com sucesso", {
    //   style: {
    //     background: 'var(--toast-success)',
    //     color: 'var(--toast-success-foreground)',
    //     boxShadow: 'var(--toast-shadow)'
    //   }
    // });
    onRefresh?.();
    onClose();
  };

  const handleClose = () => {
    toast.info("Edição cancelada", {
      style: {
        background: 'var(--toast-info)',
        color: 'var(--toast-info-foreground)',
        boxShadow: 'var(--toast-shadow)'
      }
    });
    onClose();
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="w-full space-y-4 px-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <EquipeEditForm 
          permissoes={formData} 
          onClose={handleSuccess} 
          onCancel={handleClose} 
        />
      </Tabs>
    </div>
  );
}