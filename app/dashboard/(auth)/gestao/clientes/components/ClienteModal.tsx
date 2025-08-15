"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import EditarCliente from "./editarCliente";
import HistoricoCliente from "./historicoCliente";
import { toast } from "sonner";

export type Cliente = {
  id: string;
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  data_nascimento: string;
  status: number;
  data_cadastro: string;
  data_atualizacao: string;
};

type ClienteProps = {
  cliente: Cliente;
  onClose: () => void;
  onRefresh: () => void;
};

export function ModalCliente({ onClose, onRefresh, cliente }: ClienteProps) {
  const handleError = (message: string) => {
    toast.error(message, {
      style: {
        background: "var(--toast-error)",
        color: "var(--toast-error-foreground)",
        boxShadow: "var(--toast-shadow)"
      }
    });
  };

  const handleSuccess = (message: string) => {
    toast.success(message, {
      style: {
        background: "var(--toast-success)",
        color: "var(--toast-success-foreground)",
        boxShadow: "var(--toast-shadow)"
      }
    });
  };

  return (
    <div className="space-y-4 p-4">
      <Tabs defaultValue="dados" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dados">Dados do Cliente</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="dados">
          <EditarCliente
            cliente={cliente}
            onClose={onClose}
            onRefresh={onRefresh}
          />
        </TabsContent>
        <TabsContent value="historico">
          <HistoricoCliente cliente={cliente} />
        </TabsContent>
      </Tabs>
    </div>
  );
}