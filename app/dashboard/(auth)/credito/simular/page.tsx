// Arquivo: src/app/CreditSimular/page.tsx
"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import CampoBoasVindas from "@/components/boasvindas";
import { Combobox } from "./components/Combobox";
import SimuladorFgts from "./components/Simulador";
import Proposta from "./components/cadastrarCliente";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroInputUser from "./components/cadastroInputUser";
import CadastroInputProduto from "./components/cadastroCampoProduto";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Modalidade {
  id: any;
  name: any;
  hash: any;
}

export default function CreditSimular() {
  const [convenios, setConvenios] = useState<Modalidade[]>([]);
  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const [categorias, setCategorias] = useState<Modalidade[]>([]);
  const [produtoId, setProdutoId] = useState<string | null>(null);
  const [selectedConvenio, setSelectedConvenio] = useState<Modalidade | null>(null);
  const [selectedModalidade, setSelectedModalidade] = useState<Modalidade | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<Modalidade | null>(null);
  const [cpfProposta, setCpfProposta] = useState<string | null>(null);
  const [simulacao, setSimulacao] = useState<any>(null);
  const [simuladorKey, setSimuladorKey] = useState<number>(0);

  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const handleCloseCadastro = () => setIsCadastroOpen(false);

  const [isCadastroOpen2, setIsCadastroOpen2] = useState(false);
  const handleCloseCadastro2 = () => setIsCadastroOpen2(false);

  const { token } = useAuth();
  const podeCriar = useHasPermission("Input_Campos_Cadastro_Cliente_Criar");

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
        toast.error("Erro ao carregar convênios", {
          style: {
            background: 'var(--toast-error)',
            color: 'var(--toast-error-foreground)',
            boxShadow: 'var(--toast-shadow)'
          }
        });
      }
    };

    fetchConvenios();
  }, []);

  useEffect(() => {
    if (!selectedConvenio) return;

    const fetchModalidades = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/convenio/${selectedConvenio.hash}/produtos`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const produtosArray = response.data.mensagem ?? [];

        const formatado = produtosArray.map((item: any) => ({
          id: item.modalidade_hash,
          name: item.modalidade_nome,
          hash: item.relacionamento_hash
        }));

        setModalidades(formatado);
        setSelectedModalidade(null);
        setSelectedCategoria(null);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        toast.error("Erro ao carregar modalidades", {
          style: {
            background: 'var(--toast-error)',
            color: 'var(--toast-error-foreground)',
            boxShadow: 'var(--toast-shadow)'
          }
        });
      }
    };

    fetchModalidades();
  }, [selectedConvenio]);

  useEffect(() => {
    if (!selectedModalidade) return;

    const fetchCategorias = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/rel-produto-sub-produto/${selectedModalidade.id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const subModalidades = Array.isArray(response.data) ? response.data : [response.data];

        const formatado = subModalidades.map((item: any) => ({
          id: item.produtos_subprodutos_id,
          name: item.get_subprodutos?.[0]?.produtos_subprodutos_nome ?? "Sem nome",
          hash: item.rel_produto_subproduto_id
        }));

        setCategorias(formatado);
        setSelectedCategoria(null);
        setSimuladorKey((prev) => prev + 1);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        toast.error("Erro ao carregar categorias", {
          style: {
            background: 'var(--toast-error)',
            color: 'var(--toast-error-foreground)',
            boxShadow: 'var(--toast-shadow)'
          }
        });
      }
    };

    fetchCategorias();
  }, [selectedModalidade]);

  const handleAbrirCadastro = (cpf: string, dadosSimulacao: any) => {
    setCpfProposta(cpf);
    setSimulacao(dadosSimulacao);
    toast.success("Cliente encontrado, montando proposta...", {
      style: {
        background: 'var(--toast-success)',
        color: 'var(--toast-success-foreground)',
        boxShadow: 'var(--toast-shadow)'
      }
    });
  };

  return (
    <ProtectedRoute requiredPermission="Simular_ver">
      <div className="flex flex-row justify-between">
        <CampoBoasVindas />
        <div className="grid grid-cols-1 gap-1 md:grid-cols-2">
          {podeCriar && (
            <Button onClick={() => setIsCadastroOpen(true)}>Campos Usuario</Button>
          )}
          {podeCriar && (
            <Button onClick={() => setIsCadastroOpen2(true)}>Campos Produto</Button>
          )}
        </div>
      </div>
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
                  data={modalidades}
                  displayField="name"
                  value={
                    selectedModalidade
                      ? {
                          id: selectedModalidade.id,
                          name:
                            selectedModalidade.name.length > 23
                              ? selectedModalidade.name.slice(0, 20) + "..."
                              : selectedModalidade.name,
                          hash: selectedModalidade.hash
                        }
                      : null
                  }
                  onChange={(val: Modalidade) => setSelectedModalidade(val)}
                  label="Modalidade"
                  placeholder="Selecione o Modalidade"
                  searchFields={["name"]}
                />
              )}

              {selectedModalidade && (
                <Combobox
                  data={categorias}
                  displayField="name"
                  value={selectedCategoria}
                  onChange={(val) => {
                    setSelectedCategoria(val);
                    setSimuladorKey((prev) => prev + 1);
                  }}
                  label="Tipo de Operação"
                  placeholder="Selecione o Tipo de Operação"
                  searchFields={["name"]}
                />
              )}
            </div>
            {selectedCategoria && selectedModalidade && (
              <SimuladorFgts
                key={`simulador-${simuladorKey}`}
                convenioHash={selectedConvenio?.hash}
                modalidadeHash={selectedModalidade.id}
                categoriaHash={selectedCategoria.id}
                onCadastrarCliente={handleAbrirCadastro}
                proutoName={selectedModalidade.name.toLowerCase()}
                onProdutoIdReceived={(id) => {
                  setProdutoId(id);
                }}
              />
            )}
          </>
        ) : (
          simulacao && <Proposta cpf={cpfProposta} simulacao={simulacao} />
        )}
      </div>
      <CadastroInputUser isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
      <CadastroInputProduto isOpen={isCadastroOpen2} onClose={handleCloseCadastro2} />
    </ProtectedRoute>
  );
}