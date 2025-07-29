"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Produto } from "./produtos";
import { SubprodutoEdit } from "./informacoes";
import { Subproduto } from "./subprodutos";
import { Button } from "@/components/ui/button";
import TabelaProduto, { Produto } from "./tableProduto";
import CadastroTaxaModal from "./modalNovaTable";

export type Props = {
  // subproduto: Subproduto;
  produto: Produto;
  onClose: () => void;
  onRefresh?: () => void; // pode ser opcional
};

export default function ProdutoDetalhesTabs({  onClose, onRefresh, produto }: Props) {
  const [isCadastroTableOpen, setIsCadastroTableOpen] = useState(false);
  const handleCloseCadastroTable = () => setIsCadastroTableOpen(false);

  return (
    <div className="space-y-4 rounded-md border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* <h2 className="text-lg font-semibold">{subproduto.nome_tabela}</h2> */}
        <Button onClick={onClose} variant="outline">
          Voltar
        </Button>
      </div>

      <Tabs defaultValue="Tabela" className="w-full">
        <TabsList>
          <Button onClick={() => setIsCadastroTableOpen(true)}>Nova Tabela</Button>
          {/* <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="Tabela">Tabela</TabsTrigger> */}
        </TabsList>

        {/* <TabsContent value="info">
          <SubprodutoEdit
            subproduto={subproduto}
            onClose={onClose}
            onRefresh={onRefresh ?? (() => {})} // caso onRefresh não exista, passa uma função vazia
          />
        </TabsContent> */}

        <TabsContent value="Tabela">
          <TabelaProduto produto={produto} onClose={() => console.log("Fechar aba")} />
        </TabsContent>
      </Tabs>
      <CadastroTaxaModal isOpen={isCadastroTableOpen} onClose={handleCloseCadastroTable} />
    </div>
  );
}
