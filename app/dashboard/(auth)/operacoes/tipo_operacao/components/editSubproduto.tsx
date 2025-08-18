"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Produto } from "./produtos";
import { SubprodutoEdit } from "./informacoes";
import { Subproduto } from "./subprodutos";
import { Button } from "@/components/ui/button";

type Props = {
  subproduto: Subproduto;
  onClose: () => void;
  onRefresh?: () => void; // pode ser opcional
};

export default function ProdutoDetalhesTabs({ subproduto, onClose, onRefresh }: Props) {
  return (
    <div>
      <Tabs defaultValue="info" className="w-full">
        {/* <TabsList>
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="Tabela">Tabela</TabsTrigger>
        </TabsList> */}

        {/* <TabsContent value="info"> */}
          <SubprodutoEdit
            subproduto={subproduto}
            onClose={onClose}
            onRefresh={onRefresh ?? (() => {})} // caso onRefresh não exista, passa uma função vazia
          />
        {/* </TabsContent> */}

        {/* <TabsContent value="Tabela">
          <TabelaProduto subproduto={subproduto} onClose={() => console.log("Fechar aba")}/>
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
