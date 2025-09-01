"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Produto } from "./produtos";
import { ProdutoEdit } from "./InformacoesProduto";
// import RelacionamentoProduto from "./RelacionamentoProduto";
import { Button } from "@/components/ui/button";
// import TabelaProduto from "./taxa"

type Props = {
  produto: Produto | null;
  onClose: () => void;
  onRefresh?: () => void; // pode ser opcional
};

export default function ProdutoDetalhesTabs({ produto, onClose, onRefresh }: Props) {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="info" className="w-full">
        {/* <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="relacionamento">Relacionamento</TabsTrigger>
        </TabsList> */}

        <TabsContent value="info">
          <ProdutoEdit
            produto={produto}
            onClose={onClose}
            onRefresh={onRefresh ?? (() => {})} // caso onRefresh não exista, passa uma função vazia
          />
        </TabsContent>

        {/* <TabsContent value="relacionamento">
          <RelacionamentoProduto produto={produto} onClose={() => console.log("Fechar aba")} />
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
