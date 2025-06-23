"use client";

import React, { useState, useEffect } from "react";
import { UsuarioEdit } from "./editUsuario";
import { UsuariosTable } from "./listaPromotoras";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Usuario = {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  tipo_acesso: string;
  telefone: string;
  endereco: string;
  status: number;
  cnpj: string; // Para buscar usuários por promotora, se aplicável
};

type UsuarioDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario | null;
};

export function UsuarioDrawer({ isOpen, onClose, usuario}: UsuarioDrawerProps) {
  const [formData, setFormData] = useState<Usuario | null>(null);

  useEffect(() => {
    if (isOpen && usuario) {
      setFormData({ ...usuario });
    }
  }, [usuario, isOpen]);

  if (!isOpen || !formData) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-gray-900/50" aria-hidden="true" />

      <aside
        className="fixed top-0 right-0 z-50 flex h-full w-full flex-col bg-white shadow-lg md:w-1/2"
        role="dialog"
        aria-modal="true">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Detalhes do Usuário</h2>
          <button
            onClick={onClose}
            aria-label="Fechar painel"
            className="text-2xl leading-none text-gray-600 hover:text-gray-900">
            ×
          </button>
        </div>

        <div className="h-full overflow-y-auto p-4">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="z-10">
              <TabsTrigger value="overview">Informações</TabsTrigger>
              <TabsTrigger value="reports">Relacionados</TabsTrigger>
              <TabsTrigger value="activities" disabled>
                Atividades
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="lg:col-span-2">
                <UsuarioEdit usuario={formData} onClose={onClose} />
              </div>
            </TabsContent>
            <TabsContent value="reports">
              <UsuariosTable email={formData.email} />
            </TabsContent>
            <TabsContent value="activities">...</TabsContent>
          </Tabs>
        </div>
      </aside>
    </>
  );
}
