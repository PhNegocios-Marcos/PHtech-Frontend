"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import axios from "axios";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead
} from "@/components/ui/table";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Parcela {
  valor_parcela: number;
  valor_juros: number;
}

interface Simulacao {
  parcelas: Parcela[];
  iof: number;
  taxaCadastro: number;
  valorCliente: number;
  CET: number;
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
  simulacao?: Simulacao;
  produtoHash: string;
}

export default function PropostaCliente({ cpf, simulacao, produtoHash }: PropostaClienteProps) {
  const [cliente, setCliente] = useState<ClienteApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, selectedPromotoraId, userData } = useAuth();
  
  // console.log("promotoras: ", selectedPromotoraId)
  // console.log("id: ", (userData as any)?.id ?? "Usuário")

  const idUser = (userData as any)?.id ?? "null";

  useEffect(() => {
    async function fetchCliente() {
      setLoading(true);
      setError(null);
      // console.log("cpf: ", cpf);
      try {
        const res = await fetch(`${API_BASE_URL}/cliente/${cpf}`, {
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
          } else {
            setCliente(data[0]);
          }
        } else if (data && typeof data === "object") {
          setCliente(data);
        } else {
          setError("Nenhum cliente encontrado");
          setCliente(null);
        }
      } catch (e: any) {
        setError(e.message || "Erro ao buscar cliente");
        setCliente(null);
      } finally {
        setLoading(false);
      }
    }

    if (cpf) {
      fetchCliente();
    }
  }, [cpf, token]);

  if (loading) return <p>Carregando dados do cliente...</p>;
  if (error) return <p className="text-red-600">Erro: {error}</p>;
  if (!cliente) return <p>Cliente não encontrado.</p>;

  const telefonesAtivos = Object.values(cliente.telefones || {})
    .filter((t) => t.status_telefone === 1)
    .slice(0, 2);
  const endereco = Object.values(cliente.enderecos || {})[0];

  const gerarProposta = async () => {
    try {


      const body = {
        cliente_hash: cliente.hash,
        produto_hash: produtoHash, // precisa ser definido em algum lugar (ex: dropdown selecionado)
        promotora_hash: selectedPromotoraId, // idem
        responsavel_hash: idUser, // idem
        cliente_banco_hash: cliente.dados_bancarios?.[0]?.id ?? null, // primeiro dado bancário
        banco_hash: cliente.dados_bancarios?.[0]?.id_banco ?? null,
        proposta_nome: cliente.nome,
        proposta_email: cliente.emails?.email ?? "", // pode ser undefined
        proposta_telefone: cliente.telefones?.[0]?.numero ?? "", // você pode mapear melhor isso se quiser
        proposta_numero_documento: cliente.numero_documento,
        proposta_tipo_documento: cliente.tipo_documento,
        proposta_cpf: cliente.cpf,
        proposta_sexo: "", // ❌ não informado no ClienteApiResponse, precisa ser preenchido manualmente
        proposta_nome_mae: cliente.nome_mae,
        proposta_nome_pai: cliente.nome_pai,
        proposta_estado_civil: "", // ❌ não informado, precisa ser preenchido
        proposta_naturalidade: "", // ❌ não informado, precisa ser preenchido
        proposta_data_nascimento: "", // ❌ não informado, precisa ser preenchido

        proposta_endereco_cep: cliente.enderecos?.[0]?.cep ?? "",
        proposta_enderco_logradouro: cliente.enderecos?.[0]?.logradouro ?? "",
        proposta_endereco_numero: cliente.enderecos?.[0]?.numero ?? "",
        proposta_endereco_complemento: cliente.enderecos?.[0]?.complemento ?? "",
        proposta_endereco_bairro: cliente.enderecos?.[0]?.bairro ?? "",
        proposta_endereco_cidade: cliente.enderecos?.[0]?.cidade ?? "",
        proposta_endereco_estado: cliente.enderecos?.[0]?.estado ?? "",
        proposta_endereco_uf: cliente.enderecos?.[0]?.uf ?? "",

        proposta_valor_solicitado: simulacao?.valorCliente ?? 0, // vindo do `PropostaClienteProps.simulacao`
        proposta_banco_agencia: cliente.dados_bancarios?.[0]?.agencia ?? "",
        proposta_banco_conta: cliente.dados_bancarios?.[0]?.conta ?? "",
        proposta_banco_pix: "", // ❌ não informado
        proposta_banco_tipo_chave_pix: "", // ❌ não informado
        proposta_status: "EM ANALISE" // ou o status padrão que a sua API espera
      };

      const response = await axios.post(`${API_BASE_URL}/proposta/criar`, body, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = response.data;

      // console.log(data);
    } catch (error) {
      console.error("erro ao gerar proposta", error);
    }
  };

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
                <Label>Telefone {i + 1}</Label>
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
              <div>
                <Label>Conta Bancária</Label>
                <Input
                  value={`Agência: ${cliente.dados_bancarios[0].agencia} - Conta: ${cliente.dados_bancarios[0].conta}`}
                  readOnly
                />
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
                {simulacao.parcelas.map((p, i) => (
                  <TableRow key={i}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>R$ {p.valor_parcela.toFixed(2)}</TableCell>
                    <TableCell>R$ {p.valor_juros.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex flex-wrap justify-around gap-4">
              <p>
                <strong>IOF:</strong> R$ {simulacao.iof.toFixed(2)}
              </p>
              <p>
                <strong>Taxa de Cadastro:</strong> R$ {simulacao.taxaCadastro.toFixed(2)}
              </p>
              <p>
                <strong>Valor Cliente:</strong> R$ {simulacao.valorCliente.toFixed(2)}
              </p>
              <p>
                <strong>CET:</strong> {simulacao.CET.toFixed(2)}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
