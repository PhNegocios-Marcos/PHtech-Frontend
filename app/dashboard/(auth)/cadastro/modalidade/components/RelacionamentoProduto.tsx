"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Combobox } from "./Combobox";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Produto } from "./produtos";

type Option = {
  id: string;
  name: string;
};

type Props = {
  produto: Produto;
  onClose: () => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RelacaoProdutoConvenio({ produto }: Props) {
  const [convenios, setConvenios] = useState<Option[]>([]);
  const [produtos, setProdutos] = useState<Option[]>([]);

  const [selectedConvenio, setSelectedConvenio] = useState<Option | null>(null);
  const [selectedSubProduto, setSelectedSubProduto] = useState<Option | null>(null);

  const [loading, setLoading] = useState(false);
  const [loading02, setLoading02] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const { token } = useAuth();

  useEffect(() => {
    async function fetchConvenios() {
      try {
        const res = await axios.get(`${API_BASE_URL}/convenio`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = res.data.map((c: any) => ({
          id: c.convenio_hash,
          name: c.convenio_nome,
        }));
        setConvenios(data);
      } catch (error) {
        console.error("Erro ao carregar convênios", error);
      }
    }

    fetchConvenios();
  }, [token]);

  useEffect(() => {
    async function fetchProdutos() {
      try {
        const res = await axios.get(`${API_BASE_URL}/subprodutos/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = res.data.map((p: any) => ({
          id: p.produtos_subprodutos_id,
          name: p.produtos_subprodutos_nome,
        }));
        setProdutos(data);
      } catch (error) {
        console.error("Erro ao carregar produtos", error);
      }
    }

    fetchProdutos();
  }, [token]);

  async function handleRelacionarConvenio() {
    if (!selectedConvenio) {
      setMessage("Selecione convênio");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      await axios.post(
        `${API_BASE_URL}/rel_produto_convenio/criar`,
        {
          convenio_hash: selectedConvenio.id,
          produto_hash: produto.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Relação com convênio criada com sucesso!");
      setMessageType("success");
    } catch (error) {
      console.error(error);
      setMessage("Erro ao criar relação com convênio");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  async function handleRelacionarCategoria() {
    if (!selectedSubProduto) {
      setMessage("Selecione um Tipo de Operacao");
      setMessageType("error");
      return;
    }

    setLoading02(true);
    setMessage("");
    setMessageType("");

    try {
      await axios.post(
        `${API_BASE_URL}/rel-produto-sub-produto/criar`,
        {
          sub_produto_hash: selectedSubProduto.id,
          produto_hash: produto.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage("Relação com Tipo de Operacao criada com sucesso!");
      setMessageType("success");
    } catch (error) {
      console.error(error);
      setMessage("Erro ao criar relação com Tipo de Operacao");
      setMessageType("error");
    } finally {
      setLoading02(false);
    }
  }

  return (
    <Card className="mx-auto max-w-4xl p-4">
      <CardHeader>
        <CardTitle>Relacionar Produto</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5 mb-5">
          {/* Coluna 1 - Convênio */}
          <div className="space-y-2">
            <span className="text-muted-foreground text-sm">Convênio</span>
            <Combobox
              data={convenios}
              displayField="name"
              value={selectedConvenio}
              onChange={setSelectedConvenio}
              searchFields={["name"]}
              placeholder="Selecione um convênio"
            />
            <Button
              onClick={handleRelacionarConvenio}
              disabled={loading}
              className="mt-2"
            >
              {loading ? "Salvando..." : "Relacionar Convênio"}
            </Button>
          </div>

          {/* Coluna 2 - Categoria */}
          <div className="space-y-2">
            <span className="text-muted-foreground text-sm">Tipo de operação</span>
            <Combobox
              data={produtos}
              displayField="name"
              value={selectedSubProduto}
              onChange={setSelectedSubProduto}
              searchFields={["name"]}
              placeholder="Selecione um Tipo de Operacao"
            />
            <Button
              onClick={handleRelacionarCategoria}
              disabled={loading02}
              className="mt-2"
            >
              {loading02 ? "Salvando..." : "Relacionar Tipo de Operacao"}
            </Button>
          </div>
        </div>

        {/* Mensagem de sucesso ou erro */}
        {message && (
          <p
            className={`mt-4 text-sm ${
              messageType === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
