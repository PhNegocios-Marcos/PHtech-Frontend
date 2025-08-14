"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Produto } from "./produtos";
import { SubprodutoEdit } from "./informacoes";
import { Subproduto } from "./subprodutos"
import { Button } from "@/components/ui/button";
import TabelaProduto from "./tabela";
import { toast } from "sonner";

type Props = {
  subproduto: Subproduto;
  onClose: () => void;
  onRefresh?: () => void; // pode ser opcional
};

export default function ProdutoDetalhesTabs({ subproduto, onClose, onRefresh }: Props) {
  const handleRefreshFallback = () => {
    toast.info("Atualização não configurada", {
      style: {
        background: 'var(--toast-info)',
        color: 'var(--toast-info-foreground)',
        boxShadow: 'var(--toast-shadow)'
      }
    });
  };

  return (
    <div className="space-y-4 rounded-md border p-4 shadow-sm">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-lg font-semibold">{subproduto.nome_tabela}</h2>
        <Button onClick={onClose} variant="outline">
          Voltar
        </Button>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          {/* <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="Tabela">Tabela</TabsTrigger> */}
        </TabsList>

        <TabsContent value="info">
          <SubprodutoEdit
            subproduto={subproduto}
            onClose={onClose}
            onRefresh={onRefresh ?? handleRefreshFallback} // fallback usando toast
          />
        </TabsContent>

        <TabsContent value="Tabela">
          <TabelaProduto onClose={() => toast.info("Fechar aba", {
            style: {
              background: 'var(--toast-info)',
              color: 'var(--toast-info-foreground)',
              boxShadow: 'var(--toast-shadow)'
            }
          })}/>
        </TabsContent>
      </Tabs>
    </div>
  );
}
