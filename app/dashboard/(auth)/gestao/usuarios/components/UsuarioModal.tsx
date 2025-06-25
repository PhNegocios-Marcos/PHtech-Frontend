"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsuarioEdit } from "./editUsuario";
import { UsuariosTable } from "./listaPromotoras";
import { Button } from "@/components/ui/button";

type Usuario = {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  tipo_acesso: string;
  telefone: string;
  endereco: string;
  status: number;
  cnpj: string;
};

type UsuarioPerfilProps = {
  usuario: Usuario;
  onClose: () => void;
};

export function UsuarioPerfil({ usuario, onClose }: UsuarioPerfilProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="text-lg font-semibold">Detalhes do Usuário</h2>
        <Button onClick={onClose} variant="outline">
          Voltar
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Informações</TabsTrigger>
          <TabsTrigger value="reports">Relacionados</TabsTrigger>
          <TabsTrigger value="activities" disabled>
            Atividades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <UsuarioEdit usuario={usuario} onClose={onClose} />
        </TabsContent>

        <TabsContent value="reports">
          <UsuariosTable email={usuario.email} />
        </TabsContent>

        <TabsContent value="activities">...</TabsContent>
      </Tabs>
    </div>
  );
}
