"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Acao = "criar" | "ver" | "atualizar" | "desativar";

type Permissao = {
  id: string;
  nome: string;
  status: number;
};

type PermissaoMapeada = {
  [categoria: string]: Partial<Record<Acao, { id: string; nome: string; status: number }>>;
};

type PermissoesProps = {
  equipeNome: string;
  perfilId: string;
  onClose: () => void;
};

export function Permissoes({ equipeNome, perfilId, onClose }: PermissoesProps) {
  const [permissoes, setPermissoes] = useState<PermissaoMapeada>({});
  const [equipeLabel, setEquipeLabel] = useState<string>(equipeNome);
  const { token } = useAuth();

  const acoes: Acao[] = ["criar", "ver", "atualizar", "desativar"];

  // Estado para as permissões selecionadas (checkboxes marcados)
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());

  // Buscar permissões do backend
  useEffect(() => {
    async function fetchPermissoes() {
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/permissoes/listar`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const erro = await response.json();
          throw new Error(erro?.detail || "Erro ao buscar permissões");
        }

        const data = await response.json();

        const mapeado: PermissaoMapeada = {};

        for (const categoria in data) {
          for (const item of data[categoria]) {
            const [prefixo, acao] = item.nome.split("_");
            if (!acoes.includes(acao as Acao)) continue;

            if (!mapeado[categoria]) mapeado[categoria] = {};
            mapeado[categoria][acao as Acao] = {
              id: item.id,
              nome: item.nome,
              status: item.status
            };
          }
        }

        setPermissoes(mapeado);
      } catch (error: any) {
        console.error("Erro ao buscar permissões:", error.message || error);
      }
    }

    fetchPermissoes();
  }, [token]);

  // Inicializar checkboxes selecionados com base nas permissões ativas (status=1)
  useEffect(() => {
    const iniciais = new Set<string>();

    for (const categoria in permissoes) {
      for (const acao of acoes) {
        const permissao = permissoes[categoria]?.[acao];
        if (permissao && permissao.status === 1) {
          iniciais.add(permissao.nome);
        }
      }
    }

    setSelecionadas(new Set());
  }, [permissoes]);

  // Função para alternar seleção do checkbox
  const togglePermissao = (nome: string, checked: boolean | undefined) => {
    setSelecionadas((prev) => {
      const novo = new Set(prev);
      if (checked) {
        novo.add(nome);
      } else {
        novo.delete(nome);
      }
      return novo;
    });
  };

  // Enviar permissões selecionadas para o backend
  const enviarPermissoesSelecionadas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rel_permissao_perfil/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          perfil: perfilId,
          permissoes: Array.from(selecionadas)
        })
      });

      if (!response.ok) {
        const erro = await response.json();
        throw new Error(erro?.detail || "Erro ao enviar permissões");
      }

      alert("Permissões atualizadas com sucesso!");
    } catch (error: any) {
      console.error("Erro ao enviar permissões:", error.message || error);
      alert("Erro ao enviar permissões: " + (error.message || error));
    }
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Permissões do Perfil: <span className="text-primary">{equipeLabel}</span>
          </CardTitle>
          <Button onClick={onClose} variant="outline">
            Voltar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-auto">
        <table className="min-w-full border text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="border px-2 py-1 text-left">Categoria</th>
              {acoes.map((acao) => (
                <th key={acao} className="border px-2 py-1 text-center capitalize">
                  {acao}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(permissoes).map(([categoria, permissoesAcoes]) => (
              <tr key={categoria} className="even:bg-muted/30">
                <td className="border px-2 py-1 font-medium capitalize">{categoria}</td>
                {acoes.map((acao) => {
                  const permissao = permissoesAcoes[acao];
                  return (
                    <td key={`${categoria}_${acao}`} className="border px-2 py-1 text-center">
                      {permissao ? (
                        <div className="flex items-center justify-center gap-1">
                          <Checkbox
                            key={permissao.nome}
                            checked={selecionadas.has(permissao.nome)}
                            onCheckedChange={(checked) =>
                              togglePermissao(permissao.nome, !!checked)
                            }
                          />
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <Button onClick={enviarPermissoesSelecionadas}>Salvar Permissões Selecionadas</Button>
        </div>
      </CardContent>
    </Card>
  );
}
