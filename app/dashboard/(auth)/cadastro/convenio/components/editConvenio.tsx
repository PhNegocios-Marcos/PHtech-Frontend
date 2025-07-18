"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Convenio } from "./convenios";
import { ConvenioEdit } from "./informacoesConvenio";
import RelacionamentoProduto from "./relacionamento";
import { Button } from "@/components/ui/button";

type Props = {
  convenio: Convenio;
  onClose: () => void;
  onRefresh?: () => void; // pode ser opcional
};

export default function ProdutoDetalhesTabs({ convenio, onClose, onRefresh }: Props) {
  return (
    <div className="space-y-4 rounded-md border p-4 shadow-sm">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-lg font-semibold">{convenio.convenio_nome}</h2>
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
          <ConvenioEdit
            convenio={convenio}
            onClose={onClose}
            onRefresh={onRefresh ?? (() => {})} // caso onRefresh não exista, passa uma função vazia
          />
        </TabsContent>

        <TabsContent value="relacionamento">
          <RelacionamentoProduto convenio={convenio} onClose={() => console.log("Fechar aba")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
