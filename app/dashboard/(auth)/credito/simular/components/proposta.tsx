"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead
} from "@/components/ui/table";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Simulacao {
  PARCELAS: Array<{
    PRESTACAO: number;
    JUROS: number;
    AMORTIZACAO: number;
    SALDO_DEVEDOR: number;
  }>;
  iof: number;
  taxaCadastro: number;
  valorCliente: number;
  CET: number;
  PRAZO: number;
  TAXA_MENSAL: number;
  VALOR_FINANCIADO: number;
}

interface Telefone {
  ddd: number | string;
  numero: number | string;
  detalhe_telefone_numero: string;
  status_telefone: number;
}

interface Endereco {
  logradouro: string;
  numero: string | number;
  complemento?: string;
  cep?: string;
  bairro: string;
  cidade: string;
  uf: string;
  estado?: string;
  origemDado?: string;
}

interface DadosBancarios {
  id: string;
  id_banco: string;
  id_cliente: string;
  agencia: string;
  conta: string;
  status: number;
  tipo_pix: string;
  pix: string;
}

interface Emails {
  email: string;
  [key: string]: any;
}

interface ClienteApiResponse {
  hash: string;
  nome: string;
  tipo_documento: number;
  numero_documento: string;
  cpf: string;
  nome_mae: string;
  nome_pai: string;
  telefones: Record<string, Telefone>;
  enderecos: Record<string, Endereco>;
  dados_bancarios: DadosBancarios[];
  documentos?: any[];
  emails?: Emails;
}

interface PropostaClienteProps {
  cpf: string;
  simulacao?: Simulacao | undefined;
  proutoName: string;
  produtoHash: any;
  simulacaoSelecionadaKey: string; // Adicionar esta linha
}

const pixKeyTypeOptions = [
  { id: "1", name: "CPF" },
  { id: "2", name: "Telefone" },
  { id: "3", name: "E-mail" },
  { id: "4", name: "Chave Aleatória" }
];

export default function PropostaCliente({
  cpf,
  simulacao,
  proutoName,
  produtoHash,
  simulacaoSelecionadaKey
}: PropostaClienteProps) {
  const [cliente, setCliente] = useState<ClienteApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, selectedPromotoraId, userData } = useAuth();

  const idUser = (userData as any)?.id ?? "null";

  const [tipoPix, setTipoPix] = useState("1");
  const [pixValue, setPixValue] = useState("");

  const cleanCPF = cpf.replace(/\D/g, "");

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCliente() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/cliente/${cleanCPF}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Cliente não encontrado");

        const data = await res.json();

        if (Array.isArray(data)) {
          if (data.length === 0) {
            setError("Nenhum cliente encontrado");
            setCliente(null);
            toast.error("Nenhum cliente encontrado", {
              style: {
                background: "var(--toast-error)",
                color: "var(--toast-error-foreground)",
                boxShadow: "var(--toast-shadow)"
              }
            });
          } else {
            setCliente(data[0]);
          }
        } else if (data && typeof data === "object") {
          setCliente(data);
        } else {
          setError("Nenhum cliente encontrado");
          setCliente(null);
          toast.error("Nenhum cliente encontrado", {
            style: {
              background: "var(--toast-error)",
              color: "var(--toast-error-foreground)",
              boxShadow: "var(--toast-shadow)"
            }
          });
        }
      } catch (e: any) {
        setError(e.message || "Erro ao buscar cliente");
        setCliente(null);
        toast.error(e.message || "Erro ao buscar cliente", {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
      } finally {
        setLoading(false);
      }
    }

    if (cpf) {
      fetchCliente();
    }
  }, [cpf, token]);

  const gerarProposta = async () => {
    try {
      // Preparar dados da simulação no formato esperado
      const simulacaoData = simulacao
        ? {
            VALOR_FINANCIADO: simulacao.VALOR_FINANCIADO?.toFixed(2) || "0.00",
            VALOR_PRESTACAO: simulacao.PARCELAS[0]?.PRESTACAO?.toFixed(2) || "0.00",
            PRAZO: simulacao.PRAZO || simulacao.PARCELAS.length,
            VALOR_LIQUIDO: (
              simulacao.valorCliente -
              (simulacao.iof || 0) -
              (simulacao.taxaCadastro || 0)
            ).toFixed(2),
            IOF: (simulacao.iof || 0).toFixed(2),
            VALOR_BRUTO: simulacao.valorCliente?.toFixed(2),
            PARCELAS: simulacao.PARCELAS.reduce(
              (acc, parcela, index) => {
                acc[(index + 1).toString()] = {
                  VENCIMENTO: new Date(Date.now() + (index + 1) * 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
                  SALDO_DEVEDOR: "0.00",
                  AMORTIZACAO: (parcela.PRESTACAO - parcela.JUROS).toFixed(2),
                  JUROS: parcela.JUROS.toFixed(2),
                  PRESTACAO: parcela.PRESTACAO.toFixed(2)
                };
                return acc;
              },
              {} as Record<string, any>
            ),
            NOME_TABELA: proutoName,
            TAXA_MENSAL: simulacao.TAXA_MENSAL?.toFixed(2) || "0.00"
          }
        : {};

      const body = {
        cliente_hash: cliente?.hash,
        produto_hash: produtoHash,
        promotora_hash: selectedPromotoraId,
        responsavel_hash: idUser,
        cliente_banco_hash: cliente?.dados_bancarios?.[0]?.id ?? null,
        banco_hash: cliente?.dados_bancarios?.[0]?.id_banco ?? null,
        endereco_hash: null,
        proposta_nome: cliente?.nome,
        proposta_email: cliente?.emails?.email ?? "",
        proposta_telefone: Object.values(cliente?.telefones || {})
          .filter((t) => t.status_telefone === 1)
          .map((t) => `${t.ddd}${t.numero}`)
          .join(";"),
        proposta_numero_documento: cliente?.numero_documento,
        proposta_tipo_documento: cliente?.tipo_documento,
        proposta_cpf: cliente?.cpf,
        proposta_sexo: "", // Precisa ser obtido do cliente
        proposta_nome_mae: cliente?.nome_mae,
        proposta_nome_pai: cliente?.nome_pai || "",
        proposta_estado_civil: "", // Precisa ser obtido do cliente
        proposta_naturalidade: "", // Precisa ser obtido do cliente
        proposta_data_nascimento: "", // Precisa ser obtido do cliente
        proposta_endereco_cep: cliente?.enderecos?.[0]?.cep ?? "",
        proposta_enderco_logradouro: cliente?.enderecos?.[0]?.logradouro ?? "",
        proposta_endereco_numero: cliente?.enderecos?.[0]?.numero ?? "",
        proposta_endereco_complemento: cliente?.enderecos?.[0]?.complemento ?? "",
        proposta_endereco_bairro: cliente?.enderecos?.[0]?.bairro ?? "",
        proposta_endereco_cidade: cliente?.enderecos?.[0]?.cidade ?? "",
        proposta_endereco_estado:
          cliente?.enderecos?.[0]?.estado ?? cliente?.enderecos?.[0]?.uf ?? "",
        proposta_endereco_uf: cliente?.enderecos?.[0]?.uf ?? "",
        proposta_valor_solicitado: simulacao?.valorCliente?.toFixed(2) || "0.00",
        proposta_banco_agencia: cliente?.dados_bancarios?.[0]?.agencia ?? "",
        proposta_banco_conta: cliente?.dados_bancarios?.[0]?.conta ?? "",
        proposta_banco_pix: cliente?.dados_bancarios?.[0]?.pix ?? "",
        proposta_banco_tipo_chave_pix: cliente?.dados_bancarios?.[0]?.tipo_pix ?? "",
        proposta_status: 1, // EM ANALISE
        proposta_tipo_liquidacao: 1,
        roteiro_operacional_hash: "0198566d-269a-718f-923e-3413ddad1c76",
        simulacao: simulacao
          ? {
              [simulacaoSelecionadaKey]: simulacaoData
            }
          : {}
      };

      const response = await axios.post(`${API_BASE_URL}/proposta/criar`, body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      toast.success("Proposta gerada com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });

      navigate("/dashboard/credito/operacoes"); // Redireciona programaticamente
    } catch (error) {
      console.error("erro ao gerar proposta", error);
      toast.error("Erro ao gerar proposta", {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    }
  };

  if (loading) return <p>Carregando dados do cliente...</p>;
  if (error) return <p className="text-red-600">Erro: {error}</p>;
  if (!cliente) return <p>Cliente não encontrado.</p>;

  const telefonesAtivos = Object.values(cliente.telefones || {})
    .filter((t) => t.status_telefone === 1)
    .slice(0, 2);
  const endereco = Object.values(cliente.enderecos || {})[0];

  return (
    <>
      <div className="flex justify-end gap-4">
        <Button onClick={gerarProposta}>Gerar Proposta</Button>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Dados do Cliente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Label>Nome</Label>
              <Input value={cliente.nome} readOnly />
            </div>
            <div>
              <Label>CPF</Label>
              <Input value={cliente.cpf} readOnly />
            </div>
            <div>
              <Label>Nome da Mãe</Label>
              <Input value={cliente.nome_mae} readOnly />
            </div>

            <div>
              <Label>Email</Label>
              <Input value={cliente.emails?.email || ""} readOnly />
            </div>

            {telefonesAtivos.map((tel, i) => (
              <div key={i}>
                <Label>Telefone</Label>
                <Input value={`(${String(tel.ddd)}) ${String(tel.numero)}`} readOnly />
              </div>
            ))}

            {endereco && (
              <div className="md:col-span-3">
                <Label>Endereço</Label>
                <Input
                  value={`${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade} - ${endereco.uf}`}
                  readOnly
                />
              </div>
            )}

            {cliente.dados_bancarios && cliente.dados_bancarios.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="agenciaConta">Conta Bancária</Label>
                <Input
                  id="agenciaConta"
                  value={`Agência: ${cliente.dados_bancarios[0].agencia} - Conta: ${cliente.dados_bancarios[0].conta}`}
                  readOnly
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="mb-4">
                    <Label htmlFor="tipoPix">Tipo de Chave PIX</Label>
                    <Input
                      id="tipoPixInput"
                      value={pixKeyTypeOptions.find((option) => option.id === tipoPix)?.name || ""}
                      className="w-full"
                      readOnly
                    />
                  </div>

                  <div>
                    <Label htmlFor="pixValue">Valor da Chave PIX</Label>
                    <Input id="pixValue" value={cliente.dados_bancarios[0].pix} readOnly />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {simulacao && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resultado da Simulação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parcela</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Juros</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {simulacao.PARCELAS.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>R$ {(p.PRESTACAO ?? 0).toFixed(2)}</TableCell>
                    <TableCell>R$ {(p.JUROS ?? 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex flex-wrap justify-around gap-4">
              <p>
                <strong>IOF:</strong> R$ {(simulacao.iof ?? 0).toFixed(2)}
              </p>
              <p>
                <strong>Taxa de Cadastro:</strong> R$ {(simulacao.taxaCadastro ?? 0).toFixed(2)}
              </p>
              <p>
                <strong>Valor Cliente:</strong> R$ {(simulacao.valorCliente ?? 0).toFixed(2)}
              </p>
              <p>
                <strong>CET:</strong> {(simulacao.CET ?? 0).toFixed(2)}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
