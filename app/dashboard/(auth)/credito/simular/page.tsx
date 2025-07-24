"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import CampoBoasVindas from "@/components/boasvindas";
import { Combobox } from "./components/Combobox";
import SimuladorFgts from "./components/Simulador";
import Proposta from "./components/cadastrarCliente";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Produto {
  id: number;
  name: string;
  hash: string;
}

export default function CreditSimular() {
  const [convenios, setConvenios] = useState<Produto[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Produto[]>([]);

  const [selectedConvenio, setSelectedConvenio] = useState<Produto | null>(null);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<Produto | null>(null);

  const [cpfProposta, setCpfProposta] = useState<string | null>(null);
  const [simulacao, setSimulacao] = useState<any>(null);

  const { token } = useAuth();

  console.log("selectedProduto.hash", selectedProduto)

  // Carrega os convenios ao iniciar
  useEffect(() => {
    const fetchConvenios = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/convenio`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const formatado = response.data.map((item: any) => ({
          id: item.id,
          name: item.convenio_nome,
          hash: item.convenio_hash
        }));

        setConvenios(formatado);
      } catch (error) {
        console.error("Erro ao buscar convênios:", error);
      }
    };

    fetchConvenios();
  }, []);

  // Carrega produtos ao selecionar convenio
  useEffect(() => {
    if (!selectedConvenio) return;

    const fetchProdutos = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/convenio/${selectedConvenio.hash}/produtos`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        // console.log("Resposta de produtos:", response.data);

        const produtosArray = response.data.mensagem ?? [];

        const formatado = produtosArray.map((item: any) => ({
          id: item.produtos_id,
          name: item.produtos_nome,
          hash: item.rel_produtos_convenios_id
        }));

        setProdutos(formatado);
        setSelectedProduto(null);
        setSelectedCategoria(null);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };

    fetchProdutos();
  }, [selectedConvenio]);

  // Carrega categorias ao selecionar produto
  useEffect(() => {
    if (!selectedProduto) return;

    const fetchCategorias = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/rel-produto-sub-produto/${selectedProduto.id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const subprodutos = Array.isArray(response.data) ? response.data : [response.data];

        const formatado = subprodutos.map((item: any) => ({
          id: item.produtos_subprodutos_id,
          name: item.get_subprodutos?.[0]?.produtos_subprodutos_nome ?? "Sem nome",
          hash: item.rel_produto_subproduto_id
        }));

        setCategorias(formatado);
        setSelectedCategoria(null);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };

    fetchCategorias();
  }, [selectedProduto]);

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
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
              <Combobox
                data={convenios}
                displayField="name"
                value={selectedConvenio}
                onChange={(val) => setSelectedConvenio(val)}
                label="Convênio"
                placeholder="Selecione o convênio"
                searchFields={["name"]}
              />

              {selectedConvenio && (
                <Combobox
                  data={produtos}
                  displayField="name"
                  value={selectedProduto}
                  onChange={(val) => setSelectedProduto(val)}
                  label="Produto"
                  placeholder="Selecione o produto"
                  searchFields={["name"]}
                />
              )}

              {selectedProduto && (
                <Combobox
                  data={categorias}
                  displayField="name"
                  value={selectedCategoria}
                  onChange={(val) => setSelectedCategoria(val)}
                  label="Tipo de Operação"
                  placeholder="Selecione o Tipo de Operação"
                  searchFields={["name"]}
                />
              )}
            </div>
            {selectedCategoria && selectedProduto && (
              <SimuladorFgts
                produtoHash={selectedProduto.id}
                onCadastrarCliente={handleAbrirCadastro}
                proutoName={selectedProduto.name.toLowerCase()}
              />
            )}
          </>
        ) : (
          simulacao && <Proposta cpf={cpfProposta} simulacao={simulacao} />
        )}
      </div>
    </ProtectedRoute>
  );
}
