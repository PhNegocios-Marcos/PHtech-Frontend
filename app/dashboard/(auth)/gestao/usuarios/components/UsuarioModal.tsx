"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsuarioEdit } from "./editUsuario";
import { Button } from "@/components/ui/button";
import Equipes from "./equipe";
import Perfil from "./perfil";
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
};

type UsuarioPerfilProps = {
  usuario: Usuario;
  onClose: () => void;
  onRefresh: () => void;
};

export function UsuarioPerfil({ usuario, onClose, onRefresh }: UsuarioPerfilProps) {
  const handleRefresh = () => {
    toast.info("Atualizando dados do usuário...", {
      style: {
        background: 'var(--toast-info)',
        color: 'var(--toast-info-foreground)',
        border: '1px solid var(--toast-border)',
        boxShadow: 'var(--toast-shadow)'
      }
    });
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={onClose} 
          variant="outline"
          className="mb-4"
        >
          Voltar
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Informações</TabsTrigger>
          <TabsTrigger value="reports">Equipes</TabsTrigger>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <UsuarioEdit 
            usuario={usuario} 
            onClose={onClose} 
            onRefresh={handleRefresh} 
          />
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <Equipes 
            usuario={usuario} 
            onClose={onClose} 
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="perfil" className="mt-4">
          <Perfil 
            usuario={usuario} 
            onClose={onClose} 
            onRefresh={handleRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}