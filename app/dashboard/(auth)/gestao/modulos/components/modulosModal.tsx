"use client";

import React, { useState, useEffect } from "react";
import { ModulosEditForm } from "./editModulos";
// import { UsuariosPorEquipeTable } from "./listaPromotoras";
// import { NovoMembro } from "./addNovoMembro"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export type Modulos = {
  id: string;
  nome: string;
  status: number;
};

type ModalDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  modulos: Modulos | null;
  onRefresh?: () => void;
};

export function ModulosDrawer({ isOpen, onClose, modulos, onRefresh }: ModalDrawerProps) {
  const [formData, setFormData] = useState<Modulos | null>(null);

  useEffect(() => {
    if (isOpen && modulos) {
      setFormData({ ...modulos });
    }
  }, [modulos, isOpen]);

  if (!isOpen || !formData) return null;

  const handleSuccess = () => {
    onRefresh?.();
    onClose();
  };

  return (

      <Tabs defaultValue="Informações">
        {/* <TabsList>
          <TabsTrigger value="Informações">Informações</TabsTrigger>
          <TabsTrigger value="members">Membros</TabsTrigger>
          <TabsTrigger value="ADD_novo_members">Novo Membro</TabsTrigger>
        </TabsList> */}

        {/* <TabsContent value="Informações" className="space-y-4"> */}
          <ModulosEditForm modulos={formData} onClose={handleSuccess} />
        {/* </TabsContent> */}

        {/* <TabsContent value="members">
          <UsuariosPorEquipeTable equipeNome={formData.nome} />
        </TabsContent> */}

        {/* <TabsContent value="ADD_novo_members">
          <NovoMembro equipeNome={formData.nome} />
        </TabsContent> */}
      </Tabs>
  );
}
