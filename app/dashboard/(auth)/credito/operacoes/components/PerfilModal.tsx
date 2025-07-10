"use client";

import React, { useState, useEffect } from "react";
import { Informacoes } from "./Informacoes";
import { Envolvidos } from "./Envolvidos";
import { Operacao } from "./operacao";
import { Documentos } from "./documentos"
import { Assinaturas } from "./assinaturas";
import { KYC } from "./KYC";
import { Credito } from "./credito";
import { Historico } from "./historico";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProcessStepper } from "./process";

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
        <h2 className="text-2xl font-semibold">Detalhes da operação</h2>
        <Button onClick={onClose} variant="outline">
          Voltar
        </Button>
      </div>

      <ProcessStepper />

      <Tabs defaultValue="Informações" className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="Informações">Informações</TabsTrigger>
          <TabsTrigger value="Envolvidos">Envolvidos</TabsTrigger>
          <TabsTrigger value="Operação">Operação</TabsTrigger>
          <TabsTrigger value="Documentos">Documentos</TabsTrigger>
          <TabsTrigger value="Assinaturas">Assinaturas</TabsTrigger>
          <TabsTrigger value="KYC">KYC</TabsTrigger>
          <TabsTrigger value="Crédito">Crédito</TabsTrigger>
          <TabsTrigger value="Histórico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="Informações" className="space-y-4">
          <Informacoes perfil={formData} onClose={onClose} />
        </TabsContent>

        <TabsContent value="Envolvidos">
          <Envolvidos equipeNome={formData.nome} />
        </TabsContent>

        <TabsContent value="Operação">
          <Operacao />
        </TabsContent>

        <TabsContent value="Documentos">
          <Documentos />
        </TabsContent>

        <TabsContent value="Assinaturas">
          <Assinaturas />
        </TabsContent>

        <TabsContent value="KYC">
          <KYC />
        </TabsContent>

        <TabsContent value="Crédito">
          <Credito />
        </TabsContent>

        <TabsContent value="Histórico">
          <Historico />
        </TabsContent>

      </Tabs>
    </div>
  );
}
