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
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  produtoHash: string;
  proutoName: string;
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

export default function SimuladorFgts({ produtoHash, onMontarProposta, proutoName }: Props) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  // 🔁 Simulação de retorno do backend (deveria vir de uma API tipo /api/fgts-form-config)
  const sections = [
    {
      type: "form",
      title: "Dados da Simulação",
      items: [
        { key: "cpf", label: "CPF", type: "text", placeholder: "Digite seu CPF" },
        { key: "saldo", label: "Saldo FGTS", type: "text" },
        { key: "mes_aniversario", label: "Mês Aniversário (1 a 12)", type: "text" },
        { key: "juros", label: "Taxa de Juros (%)", type: "text" },
        { key: "parcelas_adiantadas", label: "Parcelas Adiantadas", type: "text" },
        { key: "data_inicio", label: "Data de Início", type: "date" }
      ],
      fields: [
        { key: "cpf", label: "CPF", type: "text", required: true },
        { key: "saldo", label: "Saldo FGTS", type: "text" },
        { key: "mes_aniversario", label: "Mês Aniversário", type: "number" },
        { key: "juros", label: "Taxa de Juros", type: "text" },
        { key: "parcelas_adiantadas", label: "Parcelas Adiantadas", type: "number" },
        { key: "data_inicio", label: "Data de Início", type: "date" }
      ]
    }
  ];

  const handleChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  // Função para montar o body da requisição de forma dinâmica
  const buildRequestBody = () => {
    const fields = sections[0].fields;
    const body: Record<string, any> = {
      produto_hash: produtoHash,
      taxa_banco: "20", // pode parametrizar se quiser
    };

    fields.forEach(({ key, type }) => {
      let value = formValues[key];

      if (value === undefined || value === null || value === "") return; // ignora vazio

      if (type === "number") {
        value = Number(value);
        if (isNaN(value)) value = 0;
      }

      if (type === "date") {
        // converte dd/mm/yyyy para yyyy-mm-dd
        const parts = value.split("/");
        if (parts.length === 3) {
          value = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      if (typeof value === "string" && value.includes(",")) {
        value = value.replace(",", ".");
      }

      body[key] = value;
    });

    return body;
  };

  // console.log(proutoName)

  const handleSimular = async () => {
    const endpoint = `${API_BASE_URL}/simulacao/v0/${proutoName}`;

    const body = buildRequestBody();

    // console.log("Requisição:", body);

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
      const response = await fetch(`${API_BASE_URL}/cliente/${cpf}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data?.cliente) {
        alert("Cliente já cadastrado.");
        return;
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

  const renderInputField = (item: any) => {
    if (item.type === "date") {
      return (
        <div className="space-y-2" key={item.key}>
          <Label htmlFor={item.key}>{item.label}</Label>
          <Cleave
            id={item.key}
            placeholder="dd/mm/yyyy"
            options={{ date: true, delimiter: "/", datePattern: ["d", "m", "Y"] }}
            value={formValues[item.key] || ""}
            onChange={(e) => handleChange(item.key, e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
      );
    }
    return (
      <div key={item.key} className="space-y-2">
        <Label htmlFor={item.key}>{item.label}</Label>
        <input
          type="text"
          id={item.key}
          placeholder={item.placeholder || ""}
          value={formValues[item.key] || ""}
          onChange={(e) => handleChange(item.key, e.target.value)}
          className="w-full rounded border border-gray-300 px-3 py-2"
        />
      </div>
    );
  };

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

      {sections.map((section, i) => (
        <div key={i} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {section.items.map(renderInputField)}
        </div>
      ))}

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
