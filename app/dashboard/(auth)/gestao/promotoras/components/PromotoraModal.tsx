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
  onClose: (promotora?: Promotora) => void; // Make it accept an optional parameter
  promotora: Promotora | null;
};

export function PromotoraDrawer({ onClose, promotora }: PromotoraDrawerProps) {
  const [formData, setFormData] = useState<Promotora | null>(null);

  useEffect(() => {
    if (promotora) {
      try {
        setFormData({ ...promotora });
        // toast.success("Dados da promotora carregados", {
        //   style: {
        //     background: 'var(--toast-success)',
        //     color: 'var(--toast-success-foreground)',
        //     boxShadow: 'var(--toast-shadow)'
        //   },
        //   description: `Editando: ${promotora.nome}`
        // });
      } catch (error: any) {
        toast.error("Erro ao carregar dados", {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          },
          description: error.message || "Não foi possível carregar os dados da promotora"
        });
        onClose();
      }
    }
  }, [promotora, onClose]);

  if (!formData) {
    return null;
  }

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="w-full">
        <TabsTrigger value="overview">Informações</TabsTrigger>
        <TabsTrigger value="reports">Usuários</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <PromotorEdit cnpj={formData.cnpj} data={formData} onClose={onClose} />
      </TabsContent>
      <TabsContent value="reports">
        <UsuariosTable cnpj={formData.cnpj} onClose={onClose} promotora={formData} />
      </TabsContent>
    </Tabs>
  );
}
