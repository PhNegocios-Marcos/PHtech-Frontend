"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AverbadorEdit } from "./editAverbador";
import { Button } from "@/components/ui/button";
import { Averbador } from "./leads";

type AverbadorPerfilProps = {
  averbador: Averbador | null;
  onClose: () => void;
  onRefresh: () => void;
};

export function AverbadorPerfil({ averbador, onClose, onRefresh }: AverbadorPerfilProps) {
  return (
    <div>
      <Tabs defaultValue="overview" className="space-y-4">
        {/* <TabsList>
          <TabsTrigger value="overview">Informações</TabsTrigger>
          <TabsTrigger value="reports" disabled>
            Relacionados
          </TabsTrigger>
        </TabsList> */}

        <TabsContent value="overview">
          <AverbadorEdit averbador={averbador} onClose={onClose} onRefresh={onRefresh} />
        </TabsContent>

        {/* <TabsContent value="reports">Conteúdo dos relacionados</TabsContent> */}
      </Tabs>
    </div>
  );
}
