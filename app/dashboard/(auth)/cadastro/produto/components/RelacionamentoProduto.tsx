"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Combobox } from "./Combobox"; // ajuste se necessário
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form"; // ✅ import do shadcn/ui
import { useAuth } from "@/contexts/AuthContext";

type Option = {
  id: string;
  name: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RelacaoProdutoConvenio() {
  const [convenios, setConvenios] = useState<Option[]>([]);
  const [produtos, setProdutos] = useState<Option[]>([]);

  const [selectedConvenio, setSelectedConvenio] = useState<Option | null>(null);
  const [selectedProduto, setSelectedProduto] = useState<Option | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { token } = useAuth();

  useEffect(() => {
    async function fetchConvenios() {
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
        const res = await axios.get(`${API_BASE_URL}/produtos/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        const data = res.data.map((p: any) => ({
          id: p.id,
          name: p.nome
        }));
        setProdutos(data);
      } catch (error) {
        console.error("Erro ao carregar produtos", error);
      }
    }

    fetchProdutos();
  }, [token]);

  async function handleRelacionar() {
    if (!selectedConvenio || !selectedProduto) {
      setMessage("Selecione convênio e produto");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await axios.post(
        `${API_BASE_URL}/rel_produto_convenio/criar`,
        {
          convenio_id: selectedConvenio.id,
          produto_id: selectedProduto.id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setMessage("Relação criada com sucesso!");
    } catch (error) {
      console.error(error);
      setMessage("Erro ao criar relação");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="max-w-[400px] space-y-1">
          <span className="text-muted-foreground text-sm">Convênio</span>
          <Combobox
            data={convenios}
            displayField="name"
            value={selectedConvenio}
            onChange={setSelectedConvenio}
            searchFields={["name"]}
            placeholder="Selecione um convênio"
          />
        </div>

        <div className="max-w-[400px] space-y-1">
          <span className="text-muted-foreground text-sm">Produto</span>
          <Combobox
            data={produtos}
            displayField="name"
            value={selectedProduto}
            onChange={setSelectedProduto}
            searchFields={["name"]}
            placeholder="Selecione um produto"
          />
        </div>
      </div>

      <Button onClick={handleRelacionar} disabled={loading} className="mt-6">
        {loading ? "Salvando..." : "Relacionar"}
      </Button>

      {message && <p className="text-muted-foreground mt-4 text-sm">{message}</p>}
    </div>
  );
}
