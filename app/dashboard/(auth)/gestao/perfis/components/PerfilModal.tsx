"use client";

import React, { useState, useEffect } from "react";
import { PerfilEdit } from "./editUsuario";
import { UsuariosPorEquipeTable } from "./listaPromotoras";
import { Permissoes } from "./listaNovaPermissao";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  perfil: string;
};

type Equipe = {
  id: string;
  nome: string;
  descricao: string;
  status: number;
};

type UsuarioDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario | Equipe | null;
};

export function PerfilDrawer({ isOpen, onClose, usuario }: UsuarioDrawerProps) {
  const [formData, setFormData] = useState<Usuario | Equipe | null>(null);

  useEffect(() => {
    if (isOpen && usuario) {
      setFormData({ ...usuario });
    }
  }, [usuario, isOpen]);

  if (!isOpen || !formData) return null;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-semibold">Detalhes da Equipe</h2>
        <Button onClick={onClose} variant="outline">
          Voltar
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Informações</TabsTrigger>
          <TabsTrigger value="reports">Permissões</TabsTrigger>
          <TabsTrigger value="activities">ADD Nova Permissão</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <PerfilEdit perfil={formData} onClose={onClose} />
        </TabsContent>

        <TabsContent value="reports">
          <UsuariosPorEquipeTable equipeNome={formData.nome} />
        </TabsContent>

        <TabsContent value="activities">
          <Permissoes equipeNome={formData.nome} perfilId={formData.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
