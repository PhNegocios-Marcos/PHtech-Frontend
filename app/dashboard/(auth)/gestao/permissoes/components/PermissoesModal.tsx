"use client";

import React, { useState, useEffect } from "react";
import { EquipeEditForm } from "./editarPromotora";
// import { UsuariosPorEquipeTable } from "./listaPromotoras";
// import { NovoMembro } from "./addNovoMembro"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export type Permissao = {
  id: string;
  nome: string;
  status: number;
  promotora?: string;
};

type EquipeDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  permissao: Permissao | null;
  onRefresh?: () => void;
};

export function PermissoesDrawer({ isOpen, onClose, permissao, onRefresh }: EquipeDrawerProps) {
  const [formData, setFormData] = useState<Permissao | null>(null);

  useEffect(() => {
    if (isOpen && permissao) {
      setFormData({ ...permissao });
    }
  }, [permissao, isOpen]);

  if (!isOpen || !formData) return null;

  const handleSuccess = () => {
    onRefresh?.();
    onClose();
  };

  return (
    <div className="w-full space-y-4 px-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-2xl font-semibold">Editar Permissões</h2>
        <Button onClick={onClose} variant="outline">
          Voltar
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          {/* <TabsTrigger value="overview">Informações</TabsTrigger>
          <TabsTrigger value="members">Membros</TabsTrigger>
          <TabsTrigger value="ADD_novo_members">Novo Membro</TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <EquipeEditForm permissoes={formData} onClose={handleSuccess} />
        </TabsContent>

        {/* <TabsContent value="members">
          <UsuariosPorEquipeTable equipeNome={formData.nome} />
        </TabsContent> */}

        {/* <TabsContent value="ADD_novo_members">
          <NovoMembro equipeNome={formData.nome} />
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
