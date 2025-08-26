"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import EditarCliente from "./editarCliente";
import HistoricoCliente from "./historicoCliente";
import { toast } from "sonner";

export type Cliente = {
  hash: string;
  nome: string;
  tipo_documento: number;
  numero_documento: string;
  cpf: string;
  nome_mae: string;
  nome_pai: string;
  telefones: {
    [key: string]: {
      detalhe_telefone_numero: string;
      ddd: number;
      numero: number;
      status_telefone: number;
    };
  };
  enderecos: {
    [key: string]: {
      logradouro: string;
      numero: string;
      complemento: string;
      cep: string;
      bairro: string;
      cidade: string;
      uf: string;
      estado: string;
      origemDado: string;
    };
  };
  dados_bancarios: Array<{
    id: string;
    id_banco: string;
    id_cliente: string;
    agencia: string | null;
    conta: string | null;
    status: number;
    data_insercao: string;
    data_atualizacao: string;
    tipo_pix: string | null;
    pix: string | null;
  }>;
  documentos: Array<{
    url_doc: string;
  }>;
  emails: {
    id: string;
    id_cliente: string;
    email: string;
    status: number;
    data_insercao: string;
    data_atualizacao: string;
  };
  status?: number;
  data_cadastro?: string;
  data_atualizacao?: string;
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
        <div className="mb-4 flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="dados">Dados do Cliente</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>
          <Button type="button" variant="outline" onClick={onClose}>
            Voltar
          </Button>
        </div>

        <TabsContent value="dados">
          <EditarCliente cliente={cliente} onClose={onClose} onRefresh={onRefresh} />
        </TabsContent>
        <TabsContent value="historico">
          <HistoricoCliente onClose={onClose} cliente={cliente} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
