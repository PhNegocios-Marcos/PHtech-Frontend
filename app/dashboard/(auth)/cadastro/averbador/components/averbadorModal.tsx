"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AverbadorEdit } from "./editAverbador";
import { Button } from "@/components/ui/button";
import { Averbador } from "./leads";

type AverbadorPerfilProps = {
  averbador: Averbador;
  onClose: () => void;
  onRefresh: () => void;
};

export function AverbadorPerfil({ averbador, onClose, onRefresh }: AverbadorPerfilProps) {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-lg font-semibold">Detalhes do Usuário</h2>
        <Button onClick={onClose} variant="outline">
          Voltar
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          {/* <TabsTrigger value="overview">Informações</TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Relacionados
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview">
          <AverbadorEdit averbador={averbador} onClose={onClose} onRefresh={onRefresh} />
        </TabsContent>

        <TabsContent value="reports">{/* Conteúdo dos relacionados */}</TabsContent>
      </Tabs>
    </div>
  );
}
