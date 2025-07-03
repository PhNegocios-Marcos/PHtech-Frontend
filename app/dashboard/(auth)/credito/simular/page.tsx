"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Combobox } from "./components/Combobox";
import Cleave from "cleave.js/react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import ProtectedRoute from "@/components/ProtectedRoute";
import CampoBoasVindas from "@/components/boasvindas";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Produto {
  id: number;
  name: string;
  hash: string;
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

export default function CreditSimular() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [resultadoSimulacao, setResultadoSimulacao] = useState<ResultadoSimulacao | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/produtos/listar`);
        const data = await response.json();

        const formatado = data.map((item: any) => ({
          id: item.id,
          name: item.nome,
          hash: item.id // ou outro campo caso `produto_hash` exista
        }));

        setProdutos(formatado);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };

    fetchProdutos();
  }, []);

  const handleChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
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
          className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          {...props}
        />
      </CardContent>
    </div>
  );

  const renderDateInput = (key: string, label: string) => (
    <div className="space-y-2">
      <Label htmlFor={key} className="font-medium">
        {label}
      </Label>
      <Cleave
        id={key}
        placeholder="dd/mm/yyyy"
        options={{ date: true, delimiter: "/", datePattern: ["d", "m", "Y"] }}
        value={formValues[key] || ""}
        onChange={(e) => handleChange(key, e.target.value)}
        className="w-full rounded border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );

  const camposProdutoFgts = (
    <>
      {renderInput("cpf", "CPF")}
      {renderInput("saldo", "Saldo FGTS")}
      {renderInput("mes_aniversario", "Mês Aniversário (1 a 12)")}
      {renderInput("juros", "Taxa de Juros (%)")}
      {renderInput("parcelas_adiantadas", "Parcelas Adiantadas")}
      {renderDateInput("data_inicio", "Data de Início")}
    </>
  );

  const formatarData = (data: string): string => {
    if (!data) return "";
    const [dia, mes, ano] = data.split("/");
    return `${ano}-${mes}-${dia}`;
  };

  const handleSimular = async () => {
    if (!selectedProduct) return;

    const endpoint = `${API_BASE_URL}/simulacao/v0/${selectedProduct.name.toLowerCase()}`;

    const body = {
      produto_hash: selectedProduct.hash,
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Erro da API:", text);
        throw new Error(`Erro ${response.status}`);
      }

      const data = await response.json();
      setResultadoSimulacao(data);
    } catch (error) {
      console.error("Erro ao simular:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredPermission="Credito_Simular">
      <CampoBoasVindas />
      <div className="space-y-6">
        <div className="w-[400px] mb-0 mt-10">
          <Combobox
            data={produtos}
            displayField="name"
            value={selectedProduct}
            onChange={(val) => {
              setSelectedProduct(val);
              setFormValues({});
              setResultadoSimulacao(null);
            }}
            label="Produto"
            placeholder="Selecione um produto"
            searchFields={["name"]}
          />
        </div>

        <div className="flex justify-end">
          {selectedProduct?.name.toLowerCase() === "fgts" && (
            <Button onClick={handleSimular} className="" disabled={loading}>
              {loading ? "Simulando..." : "Simular"}
            </Button>
          )}
        </div>

        {selectedProduct?.name.toLowerCase() === "fgts" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{camposProdutoFgts}</div>
        )}

        {resultadoSimulacao?.mensagem && (
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
                  {resultadoSimulacao.mensagem.parcelas.map((p, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>R$ {p.valor_parcela.toFixed(2)}</TableCell>
                      <TableCell>R$ {p.valor_juros.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex flex-wrap justify-around gap-4">
                <p>
                  <strong>IOF:</strong> R$ {resultadoSimulacao.mensagem.iof}
                </p>
                <p>
                  <strong>Taxa de Cadastro:</strong> R$ {resultadoSimulacao.mensagem.taxaCadastro}
                </p>
                <p>
                  <strong>Valor Cliente:</strong> R$ {resultadoSimulacao.mensagem.valorCliente}
                </p>
                <p>
                  <strong>CET:</strong> {resultadoSimulacao.mensagem.CET}%
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
