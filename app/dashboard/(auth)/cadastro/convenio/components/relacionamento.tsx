"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Combobox } from "./Combobox";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Convenio } from "./convenios";
import { toast } from "sonner";

type Option = {
  id: string;
  name: string;
};

type Props = {
  convenio: Convenio;
  onClose: () => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RelacaoProdutoConvenio({ convenio, onClose }: Props) {
  const [averbador, setAverbador] = useState<Option[]>([]);
  const [produtos, setProdutos] = useState<Option[]>([]);

  const [selectedAverbador, setSelectedAverbador] = useState<Option | null>(null);
  const [selectedSubProduto, setSelectedSubProduto] = useState<Option | null>(null);

  const [loading, setLoading] = useState(false);
  const [loading02, setLoading02] = useState(false);

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
        toast.error("Erro ao carregar convênios", {
          style: {
            background: 'var(--toast-error)',
            color: 'var(--toast-error-foreground)',
            boxShadow: 'var(--toast-shadow)'
          }
        });
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
        toast.error("Erro ao carregar produtos", {
          style: {
            background: 'var(--toast-error)',
            color: 'var(--toast-error-foreground)',
            boxShadow: 'var(--toast-shadow)'
          }
        });
      }
    }

    fetchProdutos();
  }, [token]);

  async function handleRelacionarCategoria() {
    if (!selectedSubProduto) {
      toast.error("Selecione convênio", {
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
      return;
    }

    setLoading(true);

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
      toast.success("Relação com convênio criada com sucesso!", {
        style: {
          background: 'var(--toast-success)',
          color: 'var(--toast-success-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
    } catch (error: any) {
      console.error(error);
      toast.error(`Erro: ${error.response?.data?.detail || error.message}`, {
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="m-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Relacionar produto: <span className="text-primary">{convenio.convenio_nome}</span>
          </CardTitle>
          <Button onClick={onClose} variant="outline">
            Voltar
          </Button>
        </div>
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
      </CardContent>
    </Card>
  );
}