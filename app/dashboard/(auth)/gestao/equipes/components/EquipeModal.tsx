"use client";

import React, { useState, useEffect } from "react";
import { EquipeEditForm } from "./editEquipe";
import { UsuariosPorEquipeTable } from "./listaPromotoras";
import { NovoMembro } from "./addNovoMembro";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (isOpen && equipe) {
      try {
        setFormData({ ...equipe });
        // toast.info(`Editando equipe: ${equipe.nome}`, {
        //   style: {
        //     background: 'var(--toast-info)',
        //     color: 'var(--toast-info-foreground)',
        //     boxShadow: 'var(--toast-shadow)'
        //   }
        // });
      } catch (error: any) {
        console.error("Erro ao carregar dados da equipe:", error.message || error);
        toast.error("Erro ao carregar equipe", {
          description: error.message || "Tente novamente mais tarde",
          style: {
            background: 'var(--toast-error)',
            color: 'var(--toast-error-foreground)',
            boxShadow: 'var(--toast-shadow)'
          }
        });
        onClose();
      }
    }
  }, [equipe, isOpen]);

  const handleSuccess = () => {
    onRefresh?.();
    onClose();
    // toast.success("Equipe atualizada com sucesso!", {
    //   style: {
    //     background: 'var(--toast-success)',
    //     color: 'var(--toast-success-foreground)',
    //     boxShadow: 'var(--toast-shadow)'
    //   }
    // });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // toast.info(`Visualizando: ${getTabLabel(value)}`, {
    //   style: {
    //     background: 'var(--toast-info)',
    //     color: 'var(--toast-info-foreground)',
    //     boxShadow: 'var(--toast-shadow)'
    //   }
    // });
  };

  const getTabLabel = (value: string) => {
    switch (value) {
      case "overview": return "Informações";
      case "members": return "Membros";
      case "ADD_novo_members": return "Novo Membro";
      default: return "";
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="w-full space-y-4 px-6">
      <Tabs 
        defaultValue="overview" 
        className="space-y-4"
        value={activeTab}
        onValueChange={handleTabChange}
      >
        <TabsList className="w-full">
          <TabsTrigger value="overview">Informações</TabsTrigger>
          {/* <TabsTrigger value="members">Membros</TabsTrigger> */}
          <TabsTrigger value="ADD_novo_members">Gestão de membros</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <EquipeEditForm equipe={formData} onClose={handleSuccess} />
        </TabsContent>

        {/* <TabsContent value="members">
          <UsuariosPorEquipeTable onClose={onClose} equipeNome={formData.nome} />
        </TabsContent> */}

        <TabsContent value="ADD_novo_members">
          <NovoMembro equipeNome={formData.nome} onClose={onClose} />
        </TabsContent>
      </Tabs>
    </div>
  );
}