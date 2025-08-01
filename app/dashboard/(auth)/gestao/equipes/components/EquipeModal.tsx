"use client";

import React, { useState, useEffect } from "react";
import { EquipeEditForm } from "./editEquipe";
import { UsuariosPorEquipeTable } from "./listaPromotoras";
import { NovoMembro } from "./addNovoMembro";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export type Equipe = {
  id: string;
  nome: string;
  descricao: string;
  status: number;
  promotora?: string;
};

type EquipeDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  equipe: Equipe | null;
  onRefresh?: () => void;
};

export function EquipeDrawer({ isOpen, onClose, equipe, onRefresh }: EquipeDrawerProps) {
  const [formData, setFormData] = useState<Equipe | null>(null);

  useEffect(() => {
    if (isOpen && equipe) {
      setFormData({ ...equipe });
    }
  }, [equipe, isOpen]);

  if (!isOpen || !formData) return null;

  const handleSuccess = () => {
    onRefresh?.();
    onClose();
  };

  return (
    <div className="w-full space-y-4 px-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Informações</TabsTrigger>
          <TabsTrigger value="members">Membros</TabsTrigger>
          <TabsTrigger value="ADD_novo_members">Novo Membro</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <EquipeEditForm equipe={formData} onClose={handleSuccess} />
        </TabsContent>

        <TabsContent value="members">
          <UsuariosPorEquipeTable equipeNome={formData.nome} />
        </TabsContent>

        <TabsContent value="ADD_novo_members">
          <NovoMembro equipeNome={formData.nome} onClose={onClose} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
