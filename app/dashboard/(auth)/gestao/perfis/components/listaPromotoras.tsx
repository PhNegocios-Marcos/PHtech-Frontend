"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type Acao = "criar" | "ver" | "atualizar" | "desativar";

type Permissao = {
  id: string;
  acao: Acao;
  status: number;
};

type PermissoesPorSecao = {
  [secao: string]: Partial<Record<Acao, Permissao>>;
};

type UsuariosTableProps = {
  equipeNome: string;
    onClose: () => void;

};

export function UsuariosPorEquipeTable({ equipeNome, onClose }: UsuariosTableProps) {[]
  const [permissoesPorSecao, setPermissoesPorSecao] = useState<PermissoesPorSecao>({});
  const [equipeLabel, setEquipeLabel] = useState<string>("");
  const { token } = useAuth();

  const atualizarStatusPermissao = async (id: string, novoStatus: 0 | 1) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rel_permissao_perfil/atualizar`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id, status: novoStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.detail || "Erro ao atualizar permissão");
      }

      setPermissoesPorSecao((prev) => {
        const atualizado: PermissoesPorSecao = { ...prev };

        for (const secao in atualizado) {
          for (const acao in atualizado[secao]) {
            const perm = atualizado[secao][acao as Acao];
            if (perm?.id === id) {
              atualizado[secao][acao as Acao] = { ...perm, status: novoStatus };
            }
          }
        }

        return atualizado;
      });
    } catch (error: any) {
      console.error("Erro ao atualizar permissão:", error.message || error);
    }
  };

  useEffect(() => {
    async function fetchPermissoes() {
      if (!token || !equipeNome) return;

      try {
        const response = await fetch(`${API_BASE_URL}/rel_permissao_perfil/${equipeNome}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.detail || "Erro ao buscar permissões da equipe");
        }

        const data = await response.json();
        setEquipeLabel(data.perfil ?? equipeNome);

        const permissoes = data.permissões || {};
        const novoFormato: PermissoesPorSecao = {};

        for (const secao in permissoes) {
          for (const item of permissoes[secao]) {
            const nome = item.permissao_nome; // exemplo: "Perfis_criar"
            const partes = nome.split("_");
            const acao = partes[1] as Acao;

            if (!["criar", "ver", "atualizar", "desativar"].includes(acao)) continue;

            if (!novoFormato[secao]) {
              novoFormato[secao] = {};
            }

            novoFormato[secao][acao] = {
              id: item.id_relacionamento,
              acao,
              status: item.permissao_status
            };
          }
        }

        setPermissoesPorSecao(novoFormato);
      } catch (error: any) {
        console.error("Erro ao buscar dados:", error.message || error);
      }
    }

    fetchPermissoes();
  }, [token, equipeNome]);

  const acoes: Acao[] = ["criar", "ver", "atualizar", "desativar"];

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
              <th className="border px-2 py-1 text-left">Seção</th>
              {acoes.map((acao) => (
                <th key={acao} className="border px-2 py-1 text-center capitalize">
                  {acao}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(permissoesPorSecao).map(([secao, acoesObj]) => (
              <tr key={secao} className="even:bg-muted/30">
                <td className="border px-2 py-1 font-medium capitalize">{secao.toLowerCase()}</td>
                {acoes.map((acao) => {
                  const permissao = acoesObj[acao];
                  return (
                    <td key={acao} className="border px-2 py-1 text-center">
                      {permissao ? (
                        <Checkbox
                          checked={permissao.status === 1}
                          onCheckedChange={(checked) =>
                            atualizarStatusPermissao(permissao.id, checked ? 1 : 0)
                          }
                        />
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
