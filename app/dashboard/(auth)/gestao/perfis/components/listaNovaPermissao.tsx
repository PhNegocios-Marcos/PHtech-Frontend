// Arquivo: Permissoes.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set());

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
        toast.error(`Erro ao buscar permissões: ${error.message || error}`, {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
      }
    }

    fetchPermissoes();
  }, [token]);

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

      toast.success("Permissões atualizadas com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    } catch (error: any) {
      console.error("Erro ao enviar permissões:", error.message || error);
      toast.error(`Erro ao enviar permissões: ${error.message || error}`, {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    }
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            Perfil: <span className="text-primary">{equipeLabel}</span>
          </CardTitle>

          <div>
            <Button onClick={onClose} variant="outline">
              Voltar
            </Button>
            <Button className="ml-4" onClick={enviarPermissoesSelecionadas}>
              Salvar Permissões Selecionadas
            </Button>
          </div>
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
      </CardContent>
    </Card>
  );
}
