// Arquivo: PerfilDrawer.tsx
"use client";

import React, { useState, useEffect } from "react";
import { EquipeEditForm } from "./editUsuario";
import { UsuariosPorEquipeTable } from "./listaPromotoras";
import { Permissoes } from "./listaNovaPermissao";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
      try {
        setFormData({ ...usuario });
      } catch (error: any) {
        console.error("Erro ao carregar dados do usuário:", error.message || error);
        toast.error(`Erro ao carregar dados: ${error.message || error}`, {
          style: {
            background: 'var(--toast-error)',
            color: 'var(--toast-error-foreground)',
            boxShadow: 'var(--toast-shadow)'
          }
        });
        onClose();
      }
    }
  }, [usuario, isOpen]);

  if (!isOpen || !formData) return null;

  return (
    <div className="w-full space-y-4">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="overview">Informações</TabsTrigger>
          <TabsTrigger value="reports">Permissões</TabsTrigger>
          <TabsTrigger value="activities">Adicionar permissões</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <EquipeEditForm perfil={formData} onClose={onClose} />
        </TabsContent>

        <TabsContent value="reports">
          <UsuariosPorEquipeTable onClose={onClose} equipeNome={formData.nome} />
        </TabsContent>

        <TabsContent value="activities">
          <Permissoes equipeNome={formData.nome} perfilId={formData.id} onClose={onClose} />
        </TabsContent>
      </Tabs>
    </div>
  );
}