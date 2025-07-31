"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Combobox } from "./Combobox";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Convenio } from "./convenios";

type Option = {
  id: string;
  name: string;
};

type Props = {
  convenio: Convenio;
  onClose: () => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RelacaoProdutoConvenio({ convenio }: Props) {
  const [averbador, setAverbador] = useState<Option[]>([]);
  const [produtos, setProdutos] = useState<Option[]>([]);

  const [selectedAverbador, setSelectedAverbador] = useState<Option | null>(null);
  const [selectedSubProduto, setSelectedSubProduto] = useState<Option | null>(null);

  const [loading, setLoading] = useState(false);
  const [loading02, setLoading02] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  const { token } = useAuth();

  useEffect(() => {
    async function fetchAverbador() {
      try {
        const res = await axios.get(`${API_BASE_URL}/convenio`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        const data = res.data.map((c: any) => ({
          id: c.convenio_hash,
          name: c.convenio_nome
        }));
        setAverbador(data);
      } catch (error) {
        console.error("Erro ao carregar convênios", error);
      }
    }

    fetchAverbador();
  }, [token]);

  useEffect(() => {
    async function fetchProdutos() {
      try {
        const res = await axios.get(`${API_BASE_URL}/rel-produto-sub-produto/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        const data = res.data.map((p: any) => ({
          id: p.rel_produto_subproduto_id,
          name: p.produtos_subprodutos_nome
        }));
        setProdutos(data);
      } catch (error) {
        console.error("Erro ao carregar produtos", error);
      }
    }

    fetchProdutos();
  }, [token]);

  async function handleRelacionarCategoria() {
    if (!selectedSubProduto) {
      setMessage("Selecione convênio");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");



    try {
      await axios.post(
        `${API_BASE_URL}/listarSubprodutos/`,
        {
          // convenio_hash: selectedAverbador.id,
          averbador_hash: "0197c5d8-0d2a-7242-92c7-3fd8dfe4cd63",
          convenio_hash: convenio.convenio_hash,
          rel_produto_sub_produto_id: selectedSubProduto.id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Relacionar Produto</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="mt-5 mb-5 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Coluna 1 - Convênio */}
          <div className="space-y-2">
            <span className="text-muted-foreground text-sm">Averbador</span>
            <Combobox
              data={averbador}
              displayField="name"
              value={selectedAverbador}
              onChange={setSelectedAverbador}
              searchFields={["name"]}
              placeholder="Selecione um convênio"
            />
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
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button
            onClick={handleRelacionarCategoria}
            disabled={loading02}
            className="col-span-2 mt-2 flex justify-end gap-2">
            {loading02 ? "Salvando..." : "Relacionar Tipo de Operacao"}
          </Button>
        </div>

        {/* Mensagem de sucesso ou erro */}
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
