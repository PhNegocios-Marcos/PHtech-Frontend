"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import TabelaProduto from "./tableProduto";
import RelRO from "./relacionamentoRO";
import { toast } from "sonner";

export type Produto = {
  id: string;
  nome: string;
  status: number;
  idade_minima: number;
  idade_maxima: number;
  prazo_minimo: number;
  prazo_maximo: number;
  id_uy3: string | null;
  cor_grafico: string | null;
  config_tabela_hash: string;
  usuario_atualizacao: string;
  tabela_hash: string;
  status_relacionamento: any;
  relacionamento_hash: any;
};

export type Tabela = {
  tabela_hash: string;
  Tabela_nome: string;
  status: number;
  prazo_minimo: number;
  Tabela_mensal: number;
  prazo_maximo: number;
  id_uy3: string | null;
  cor_grafico: string | null;
  prefixo: string | null;
  vigencia_inicio: string;
  vigencia_prazo: string;
};

type produtoProps = {
  produto: Produto;
  onClose: () => void;
  onRefresh: () => void;
};

export function ModalProduto({ onClose, onRefresh, produto }: produtoProps) {
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
      <Tabs defaultValue="Tabela" className="space-y-4">
        <TabsList>
          <TabsTrigger value="Tabela">Tabela</TabsTrigger>
          <TabsTrigger value="RO">RO</TabsTrigger>
        </TabsList>

        <TabsContent value="Tabela">
          <TabelaProduto
            produto={produto}
            onClose={onClose}
          />
        </TabsContent>
        <TabsContent value="RO">
          <RelRO produto={produto} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
