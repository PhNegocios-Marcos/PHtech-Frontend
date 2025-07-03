"use client";

import { useState } from "react";
import Cleave from "cleave.js/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead
} from "@/components/ui/table";

interface Props {
  produtoHash: string;
  onMontarProposta?: (cpf: string) => void;
}

interface Parcela {
  valor_parcela: number;
  valor_juros: number;
}

interface ResultadoSimulacao {
  mensagem: {
    parcelas: Parcela[];
    iof: number;
    taxaCadastro: number;
    valorCliente: number;
    CET: number;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SimuladorFgts({ produtoHash, onMontarProposta }: Props) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const formatarData = (data: string): string => {
    if (!data) return "";
    const [dia, mes, ano] = data.split("/");
    return `${ano}-${mes}-${dia}`;
  };

  const handleSimular = async () => {
    const endpoint = `${API_BASE_URL}/simulacao/v0/fgts`;

    const body = {
      produto_hash: produtoHash,
      banco_hash: "019611f9-3d47-7048-b9b2-4f96d5264cf4",
      usuario_hash: "0196a5ff-1706-7246-b0ac-715fbb7b29a6",
      taxa_banco: "20",
      cpf: formValues.cpf,
      saldo: formValues.saldo,
      mes_aniversario: Number(formValues.mes_aniversario),
      juros: formValues.juros?.replace(",", "."),
      parcelas_adiantadas: Number(formValues.parcelas_adiantadas),
      data_inicio: formatarData(formValues.data_inicio)
    };

    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      setResultado(data);
    } catch (err) {
      console.error("Erro na simulação FGTS:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMontarProposta = async () => {
    const cpf = formValues.cpf;

    if (!cpf) {
      alert("CPF não informado");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cliente/buscar/${cpf}`);

      if (response.ok) {
        const data = await response.json();

        if (data?.cliente) {
          alert("Cliente já cadastrado.");
          return;
        }
      }

      if (onMontarProposta) {
        onMontarProposta(cpf);
      } else {
        window.location.href = `/proposta?cpf=${cpf}`;
      }
    } catch (error) {
      console.error("Erro ao verificar cliente:", error);
      alert("Erro na verificação. Tente novamente.");
    }
  };

  const renderInput = (key: string, label: string, props = {}) => (
    <div>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <input
          id={key}
          value={formValues[key] || ""}
          onChange={(e) => handleChange(key, e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
          {...props}
        />
      </CardContent>
    </div>
  );

  const renderDateInput = (key: string, label: string) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Cleave
        id={key}
        placeholder="dd/mm/yyyy"
        options={{ date: true, delimiter: "/", datePattern: ["d", "m", "Y"] }}
        value={formValues[key] || ""}
        onChange={(e) => handleChange(key, e.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-4">
        <Button onClick={handleSimular} disabled={loading}>
          {loading ? "Simulando..." : "Simular"}
        </Button>

        {resultado?.mensagem && (
          <Button variant="secondary" onClick={handleMontarProposta}>
            Montar Proposta
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {renderInput("cpf", "CPF")}
        {renderInput("saldo", "Saldo FGTS")}
        {renderInput("mes_aniversario", "Mês Aniversário (1 a 12)")}
        {renderInput("juros", "Taxa de Juros (%)")}
        {renderInput("parcelas_adiantadas", "Parcelas Adiantadas")}
        {renderDateInput("data_inicio", "Data de Início")}
      </div>

      {resultado?.mensagem && (
        <Card>
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
                {resultado.mensagem.parcelas.map((p, i) => (
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
                <strong>IOF:</strong> R$ {resultado.mensagem.iof}
              </p>
              <p>
                <strong>Taxa de Cadastro:</strong> R$ {resultado.mensagem.taxaCadastro}
              </p>
              <p>
                <strong>Valor Cliente:</strong> R$ {resultado.mensagem.valorCliente}
              </p>
              <p>
                <strong>CET:</strong> {resultado.mensagem.CET}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
