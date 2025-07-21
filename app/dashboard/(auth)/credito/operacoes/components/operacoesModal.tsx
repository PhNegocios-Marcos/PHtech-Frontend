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

type Proposta = {
  id: string;
  Correspondente: string;
  Operação: string;
  Produto: string;
  Tomador: string;
  CPF: string;
  Valor: string;
  Data: string;
  status: number;
  roteiro: string;
  Tabela: string;
};

type Equipe = {
  id: string;
  nome: string;
  descricao: string;
  status: number;
};

type PropostaDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  Proposta: Proposta | null;
};

export function OperacoesDrawer({ isOpen, onClose, Proposta }: PropostaDrawerProps) {
  const [formData, setFormData] = useState<Proposta | null>(null);

  useEffect(() => {
    if (isOpen && Proposta) {
      setFormData({ ...Proposta });
    }
  }, [Proposta, isOpen]);

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
          <Informacoes Proposta={formData} onClose={onClose} />
        </TabsContent>

        <TabsContent value="Envolvidos">
          <Envolvidos />
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
