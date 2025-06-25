"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsuarioEdit } from "./editUsuario";
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
  onRefresh: () => void;
};

export function UsuarioPerfil({ usuario, onClose, onRefresh }: UsuarioPerfilProps) {
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
          <TabsTrigger value="reports" disabled>
            Relacionados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <UsuarioEdit 
            usuario={usuario} 
            onClose={onClose} 
            onRefresh={onRefresh} 
          />
        </TabsContent>

        <TabsContent value="reports">
          {/* Conteúdo dos relacionados */}
        </TabsContent>
      </Tabs>
    </div>
  );
}