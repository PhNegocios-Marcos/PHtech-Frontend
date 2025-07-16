"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Produto } from "./produtos";
import { ProdutoEdit } from "./InformacoesProduto";
import RelacionamentoProduto from "./RelacionamentoProduto";
import { Button } from "@/components/ui/button";

type Props = {
  produto: Produto;
  onClose: () => void;
  onRefresh?: () => void; // pode ser opcional
};

export default function ProdutoDetalhesTabs({ produto, onClose, onRefresh }: Props) {
  return (
    <div className="space-y-4 rounded-md border p-4 shadow-sm">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-lg font-semibold">{produto.nome}</h2>
        <Button onClick={onClose} variant="outline">
          Voltar
        </Button>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="relacionamento">Relacionamento</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <ProdutoEdit
            produto={produto}
            onClose={onClose}
            onRefresh={onRefresh ?? (() => {})} // caso onRefresh não exista, passa uma função vazia
          />
        </TabsContent>

        <TabsContent value="relacionamento">
          <RelacionamentoProduto  />
        </TabsContent>
      </Tabs>
    </div>
  );
}
