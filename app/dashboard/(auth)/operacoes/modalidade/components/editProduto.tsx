"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProdutoEdit } from "./InformacoesProduto";
import { Produto } from "./produtos";
// import RelacionamentoProduto from "./RelacionamentoProduto";

// Import or define the Produto interface to match ProdutoEdit's expectations
// export interface Produto {
//   id: string;
//   modalidade_credito_nome: string;
//   modalidade_credito_status: number;
//   modalidade_credito_digito_prefixo: number;
//   id_uy3: string | null;
//   modalidade_credito_cor_grafico?: string | null;
// }

type Props = {
  produto: Produto;
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