"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";


type UsuarioPerfilProps = {
  onClose: () => void;
  onRefresh: () => void;
};

export function ModalRO({ onClose, onRefresh }: UsuarioPerfilProps) {
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
          {/* <TabsTrigger value="overview">Informações</TabsTrigger> */}
          {/* <TabsTrigger value="reports">Equipes</TabsTrigger>
          <TabsTrigger value="Perfil">Perfil</TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview">
          {/* <UsuarioEdit usuario={usuario} onClose={onClose} onRefresh={onRefresh} /> */}
        </TabsContent>

      </Tabs>
    </div>
  );
}
