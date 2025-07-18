"use client";

import { useState, useEffect } from "react";
import Cleave from "cleave.js/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";

import PropostaCliente from "./proposta";
import Cadastrar from "./cadastrarCliente";
import axios from "axios";

interface SimuladorFgtsProps {
  produtoHash: string;
  onCadastrarCliente: (cpf: string, dadosSimulacao: any) => void; // aceita dois parâmetros
  proutoName: string;
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

interface Section {
  type: string;
  title: string;
  items: any[];
  fields: any[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SimuladorFgts({
  produtoHash,
  onCadastrarCliente,
  proutoName
}: SimuladorFgtsProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);
  const [loading, setLoading] = useState(false);
  const [cpfProposta, setCpfProposta] = useState<string | null>(null);
  const [abrirCadastro, setAbrirCadastro] = useState(false);
  const [sections, setSections] = useState<Section[]>([]); // novo estado para sections dinâmicas

  const { token } = useAuth();

  // console.log(proutoName);

  // Função para carregar os campos da API na montagem do componente
  useEffect(() => {
    async function fetchSections() {
      try {
        const response = await axios.get(`${API_BASE_URL}/simulacao-campos-produtos/listar`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          params: {
            simulacao_campos_produtos_rel_produto_sub_produto_id: produtoHash
          }
        });

        const data = response.data;

        // Se vier um array, mapeia todos, senão trata um único objeto
        const arrData = Array.isArray(data) ? data : [data];

        const parsedSections: Section[] = arrData.map((item: any) => ({
          type: item.simulacao_campos_produtos_type,
          title: item.simulacao_campos_produtos_title,
          items: JSON.parse(item.simulacao_campos_produtos_items),
          fields: JSON.parse(item.simulacao_campos_produtos_fields)
        }));

        setSections(parsedSections);
      } catch (error) {
        console.error("Erro ao carregar campos da simulação:", error);
      }
    }

    fetchSections();
  }, [produtoHash]);

  const handleChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const buildRequestBody = () => {
    if (!sections.length) return {};

    const fields = sections[0].fields; // assumindo 1 seção (igual antes)
    const body: Record<string, any> = {
      produto_hash: produtoHash,
      taxa_banco: "20"
    };

    fields.forEach(({ key, type }) => {
      let value = formValues[key];
      if (value === undefined || value === null || value === "") return;

      if (type === "number") {
        value = Number(value);
        if (isNaN(value)) value = 0;
      }

      if (type === "date") {
        // se valor no formato dd/mm/yyyy converte para yyyy-mm-dd
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

  const handleSimular = async () => {
    const endpoint = `${API_BASE_URL}/simulacao/v0/${proutoName}`;
    const body = buildRequestBody();

    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

  const handleCadastrarCliente = async () => {
    const cpfRaw = formValues.cpf;
    const cpf = cpfRaw?.replace(/\D/g, "");
    if (!cpf) {
      alert("CPF não informado");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cliente`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        alert("Erro ao verificar cliente.");
        return;
      }

      const data = await response.json();

      const clienteExiste = data?.some((cliente: any) => {
        const clienteCpf = cliente.cpf?.replace(/\D/g, "");
        return clienteCpf === cpf;
      });

      if (clienteExiste) {
        setCpfProposta(cpf);
        setAbrirCadastro(false);
        return;
      }

      // Cliente não existe, abre cadastro
      setAbrirCadastro(true);
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
        <Input
          type="text"
          id={item.key}
          placeholder={item.placeholder || ""}
          value={formValues[item.key] || ""}
          onChange={(e) => handleChange(item.key, e.target.value)}
        />
      </div>
    );
  };

  // Se cadastro estiver aberto, renderiza componente Cadastrar
  if (abrirCadastro && formValues.cpf) {
    return (
      <Cadastrar
        cpf={formValues.cpf}
        simulacao={resultado?.mensagem}
        onCadastrado={(cpf, simulacao) => {
          setCpfProposta(cpf);
          setAbrirCadastro(false);
          if (simulacao) setResultado({ mensagem: simulacao });
        }}
        onClienteExiste={(cpf) => {
          setCpfProposta(cpf);
          setAbrirCadastro(false);
        }}
      />
    );
  }

  // Se cpfProposta definido, mostra proposta
  if (cpfProposta) {
    return <PropostaCliente cpf={cpfProposta} produtoHash={produtoHash} simulacao={resultado?.mensagem} />;
  }

  // Renderiza formulário e botões normais
  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-4">
        <Button onClick={handleSimular} disabled={loading}>
          {loading ? "Simulando..." : "Simular"}
        </Button>
        {resultado?.mensagem && <Button onClick={handleCadastrarCliente}>Montar proposta</Button>}
      </div>

      {sections.length > 0 &&
        sections.map((section, i) => (
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
