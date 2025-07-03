"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import CampoBoasVindas from "@/components/boasvindas";
import { Combobox } from "./components/Combobox";
import SimuladorFgts from "./components/SimuladorFgts";
import Proposta from "./components/cadastrarCliente"; // importe seu componente Proposta

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Produto {
  id: number;
  name: string;
  hash: string;
}

export default function CreditSimular() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [cpfProposta, setCpfProposta] = useState<string | null>(null);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/produtos/listar`);
        const data = await response.json();

        const formatado = data.map((item: any) => ({
          id: item.id,
          name: item.nome,
          hash: item.id,
        }));

        setProdutos(formatado);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };

    fetchProdutos();
  }, []);

  // Callback para abrir a tela de proposta com o CPF
  const handleAbrirProposta = (cpf: string) => {
    setCpfProposta(cpf);
  };

  return (
    <ProtectedRoute requiredPermission="Credito_Simular">
      <CampoBoasVindas />
      <div className="space-y-6">
        {!cpfProposta ? (
          <>
            <div className="w-[400px] mt-10">
              <Combobox
                data={produtos}
                displayField="name"
                value={selectedProduct}
                onChange={(val) => setSelectedProduct(val)}
                label="Produto"
                placeholder="Selecione um produto"
                searchFields={["name"]}
              />
            </div>

            {selectedProduct?.name.toLowerCase() === "fgts" && (
              <SimuladorFgts
                produtoHash={selectedProduct.hash}
                onMontarProposta={handleAbrirProposta} // passa callback
              />
            )}

            {/* Futuro suporte para "consignado"
            {selectedProduct?.name.toLowerCase() === "consignado" && (
              <SimuladorConsignado produtoHash={selectedProduct.hash} />
            )} */}
          </>
        ) : (
          <Proposta cpf={cpfProposta} />
        )}
      </div>
    </ProtectedRoute>
  );
}
