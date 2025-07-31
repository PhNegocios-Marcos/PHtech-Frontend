"use client";

import React, {useState} from "react";
import { Button } from "@/components/ui/button";
import { ROEdit } from "./editRO";
import { Roteiro } from "./editRO";
import { RoteiroOperacional } from "./ROTable";
import { useAuth } from "@/contexts/AuthContext";

type ModalROProps = {
  onClose: () => void;
  onRefresh: () => void;
  roteiro?: RoteiroOperacional; // Alterado para usar o tipo da tabela
};

export function ModalRO({ onClose, onRefresh, roteiro }: ModalROProps) {
      const { userData } = useAuth();
    
  // Converter de RoteiroOperacional para Roteiro
  const roteiroConvertido: Roteiro = roteiro ? {
    rotina_operacional_hash: roteiro.rotina_operacional_hash,
    nome: roteiro.nome,
    descricao: roteiro.descricao,
    idade_minima: roteiro.idade_minima,
    idade_maxima: roteiro.idade_maxima,
    prazo_maximo: roteiro.prazo_maximo,
    valor_bruto_minimo: parseFloat(roteiro.valor_bruto_minimo),
    valor_bruto_maximo: parseFloat(roteiro.valor_bruto_maximo),
    tac_min: parseFloat(roteiro.tarifa_cadastro_minima),
    tac_max: parseFloat(roteiro.tarifa_cadastro_maxima),
    usa_limite_proposta: roteiro.usa_limite_proposta,
    usa_margem_seguranca: roteiro.usa_margem_seguranca,
    valor_limite_proposta: 0, // Você precisa definir como obter esse valor
    valor_margem_seguranca: 0, // Você precisa definir como obter esse valor
    usuario_atualizacao: userData?.id
  } : {
    rotina_operacional_hash: "",
    nome: "",
    descricao: "",
    idade_minima: 0,
    idade_maxima: 0,
    prazo_maximo: 0,
    valor_bruto_minimo: 0,
    valor_bruto_maximo: 0,
    tac_min: 0,
    tac_max: 0,
    usa_limite_proposta: false,
    usa_margem_seguranca: false,
    usuario_atualizacao: ""
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-lg font-semibold">
          {roteiro?.rotina_operacional_hash ? "Editar Roteiro" : "Novo Roteiro"}
        </h2>
        <Button onClick={onClose} variant="outline">
          Voltar
        </Button>
      </div>

      <div className="space-y-4">
        <ROEdit 
          roteiro={roteiroConvertido}
          onClose={onClose} 
          onRefresh={onRefresh} 
        />
      </div>
    </div>
  );
}