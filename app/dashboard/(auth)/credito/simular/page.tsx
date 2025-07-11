"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import CampoBoasVindas from "@/components/boasvindas";
import { Combobox } from "./components/Combobox";
import SimuladorFgts from "./components/Simulador";
import Proposta from "./components/cadastrarCliente";
import { useAuth } from "@/contexts/AuthContext";

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
  const [simulacao, setSimulacao] = useState<any>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/produtos/listar`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();

        const formatado = data.map((item: any) => ({
          id: item.id,
          name: item.nome,
          hash: item.id
        }));

        setProdutos(formatado);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };

    fetchProdutos();
  }, []);

  const handleAbrirCadastro = (cpf: string, dadosSimulacao: any) => {
    setCpfProposta(cpf);
    setSimulacao(dadosSimulacao);
  };

  return (
    <ProtectedRoute requiredPermission="Simular_ver">
      <CampoBoasVindas />
      <div className="space-y-6">
        {!cpfProposta ? (
          <>
            <div className="mt-10 w-[400px]">
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

            {selectedProduct?.name.toLowerCase() && (
              <SimuladorFgts
                produtoHash={selectedProduct.hash}
                onCadastrarCliente={(cpf, dadosSimulacao) =>
                  handleAbrirCadastro(cpf, dadosSimulacao)
                }
                proutoName={selectedProduct.name.toLowerCase()}
              />
            )}
          </>
        ) : (
          // ✅ usa os dados reais da simulação
          simulacao && <Proposta cpf={cpfProposta} simulacao={simulacao} />
        )}
      </div>
    </ProtectedRoute>
  );
}
