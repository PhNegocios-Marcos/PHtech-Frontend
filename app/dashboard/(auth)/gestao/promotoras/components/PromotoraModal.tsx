"use client";

import React, { useState, useEffect } from "react";
import { UsuariosTable } from "./userPromotora";
import { PromotorEdit } from "./editPromotora";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

export type Promotora = {
  id: string;
  nome: string;
  razao_social: string;
  cnpj: string; // padronizado como string
  representante: string | null;
  master: string;
  master_id: string;
  rateio_master: string;
  rateio_sub: string;
  status: number;
};

type PromotoraDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  promotora: Promotora | null;
};

export function PromotoraDrawer({ isOpen, onClose, promotora }: PromotoraDrawerProps) {
  const [formData, setFormData] = useState<Promotora | null>(null);

  useEffect(() => {
    if (isOpen && promotora) {
      setFormData({ ...promotora });
    }
  }, [promotora, isOpen]);

  if (!isOpen || !formData) return null;

  return (
    <aside className="w-full rounded-md bg-white p-4 shadow">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Informações</TabsTrigger>
          <TabsTrigger value="reports">Usuários</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <PromotorEdit data={formData} onClose={onClose} />
        </TabsContent>
        <TabsContent value="reports">
          <UsuariosTable cnpj={formData.cnpj} />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
