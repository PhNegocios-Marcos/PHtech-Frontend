"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "./Combobox";
import { useAuth } from "@/contexts/AuthContext";
import { Convenio } from "./convenios";

type Produto = {
  id: string;
  produtos_nome: string;
};

type CategoriaProduto = {
  id: string;
  nome: string;
};

type Props = {
  convenio: Convenio;
  onClose: () => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RelacaoProdutoConvenio({ convenio }: Props) {
  const { token } = useAuth();

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);

  const [categoriasProduto, setCategoriasProduto] = useState<CategoriaProduto[]>([]);
  const [selectedCategorias, setSelectedCategorias] = useState<string[]>([]);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

//   console.log("produtos: ", produtos);
  // Buscar produtos do convênio
  useEffect(() => {
    async function fetchProdutos() {
      try {
        const res = await axios.get(`${API_BASE_URL}/convenio/${convenio.convenio_hash}/produtos`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = res.data.mensagem.map((p: any) => ({
          id: p.produtos_id,
          produtos_nome: p.produtos_nome
        }));

        setProdutos(data);
      } catch (error) {
        console.error("Erro ao carregar produtos", error);
        setMessage("Erro ao carregar produtos");
        setMessageType("error");
      }
    }

    fetchProdutos();
  }, [token, convenio.convenio_hash]);

  // Buscar categorias (tipos de operação) ao selecionar um produto
  useEffect(() => {
    if (!selectedProduto) return;

    const produtoId = selectedProduto.id; // <- TypeScript entende que aqui nunca será null

    async function fetchCategorias() {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/listarSubprodutos/${produtoId}/convenio/${convenio.convenio_hash}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const { categoriasProduto, categoriasConvenio } = res.data.mensagem;

        const parsed = Object.entries(categoriasProduto).map(([id, nome]) => ({
          id,
          nome: nome as string
        }));

        setCategoriasProduto(parsed);
        setSelectedCategorias(categoriasConvenio || []);
      } catch (error) {
        console.error("Erro ao carregar subprodutos", error);
        setMessage("Erro ao carregar subprodutos");
        setMessageType("error");
      }
    }

    fetchCategorias();
  }, [selectedProduto, convenio, token]);

  const toggleCategoria = (id: string) => {
    setSelectedCategorias((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSalvar = async () => {
    if (!selectedProduto) return;

    try {
      await axios.post(
        `${API_BASE_URL}/rel-produto-sub-produto/criar-multiplos`,
        {
          produto_hash: selectedProduto.id,
          sub_produtos: selectedCategorias
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage("Relações salvas com sucesso!");
      setMessageType("success");
    } catch (error) {
      console.error(error);
      setMessage("Erro ao salvar relações");
      setMessageType("error");
    }
  };

  return (
    <Card className="mx-auto max-w-4xl p-4">
      <CardHeader>
        <CardTitle>Relacionar Produto e Tipos de Operação</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Seletor de Produto */}
        <div>
          <span className="text-muted-foreground text-sm">Produto</span>
          <Combobox
            data={produtos}
            value={selectedProduto}
            onChange={setSelectedProduto}
            displayField="produtos_nome"
            searchFields={["produtos_nome"]}
            placeholder="Selecione um produto"
          />
        </div>

        {/* Checkboxes de subprodutos */}
        {selectedProduto && categoriasProduto.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Tipos de Operação</h4>
            {categoriasProduto.map((cat) => (
              <div key={cat.id} className="flex items-center space-x-2">
                <Checkbox
                  id={cat.id}
                  checked={selectedCategorias.includes(cat.id)}
                  onCheckedChange={() => toggleCategoria(cat.id)}
                />
                <label htmlFor={cat.id} className="text-sm">
                  {cat.nome}
                </label>
              </div>
            ))}
            <Button onClick={handleSalvar}>Salvar Seleção</Button>
          </div>
        )}

        {/* Mensagem de feedback */}
        {message && (
          <p
            className={`mt-4 text-sm ${
              messageType === "success" ? "text-green-600" : "text-red-600"
            }`}>
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
