"use client";

import React, { useState, useEffect } from "react";
import { UsuariosTable } from "./userPromotora";
import { PromotorEdit } from "./editPromotora";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export type Promotora = {
  id: string;
  nome: string;
  razao_social: string;
  cnpj: string;
  representante: string | null;
  master: string;
  master_id: string;
  rateio_master: string;
  rateio_sub: string;
  status: number;
};

type PromotoraDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  promotora: Promotora | null;
};

export function PromotoraDrawer({ isOpen, onClose, promotora }: PromotoraDrawerProps) {
  const [formData, setFormData] = useState<Promotora | null>(null);

  useEffect(() => {
    if (isOpen && promotora) {
      try {
        setFormData({ ...promotora });
        toast.success("Dados da promotora carregados", {
          style: {
            background: 'var(--toast-success)',
            color: 'var(--toast-success-foreground)',
            boxShadow: 'var(--toast-shadow)'
          },
          description: `Editando: ${promotora.nome}`
        });
      } catch (error: any) {
        toast.error("Erro ao carregar dados", {
          style: {
            background: 'var(--toast-error)',
            color: 'var(--toast-error-foreground)',
            boxShadow: 'var(--toast-shadow)'
          },
          description: error.message || "Não foi possível carregar os dados da promotora"
        });
        onClose();
      }
    }
  }, [promotora, isOpen, onClose]);

  if (!isOpen || !formData) {
    return null;
  }

  const handleTabChange = (value: string) => {
    toast.info(`Aba alterada para ${value === "overview" ? "Informações" : "Usuários"}`, {
      style: {
        background: 'var(--toast-info)',
        color: 'var(--toast-info-foreground)',
        boxShadow: 'var(--toast-shadow)'
      }
    });
  };

  return (
    <Tabs defaultValue="overview" className="space-y-4" onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="overview">Informações</TabsTrigger>
        <TabsTrigger value="reports">Usuários</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <PromotorEdit data={formData} onClose={onClose} />
      </TabsContent>
      <TabsContent value="reports">
        <UsuariosTable cnpj={formData.cnpj} onClose={onClose} promotora={formData} />
      </TabsContent>
    </Tabs>
  );
}