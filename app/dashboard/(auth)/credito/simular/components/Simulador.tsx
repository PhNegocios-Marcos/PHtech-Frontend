// Arquivo: src/components/SimuladorFgts.tsx
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
import PropostaCliente, { Simulacao } from "./proposta";
import Cadastrar from "./cadastrarCliente";
import axios from "axios";
import { toast } from "sonner";

interface SimuladorFgtsProps {
  modalidadeHash: any;
  categoriaHash: any;
  convenioHash: any;
  onCadastrarCliente: (cpf: string, dadosSimulacao: any) => void;
  proutoName: string;
  onProdutoIdReceived?: (produtoId: string) => void;
}

interface ResultadoSimulacao {
  mensagem: Record<string, Simulacao>; // Apenas objeto com chaves UUID
}

interface Section {
  type: string;
  title: string;
  items: any[];
  fields: any[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SimuladorFgts({
  modalidadeHash,
  onCadastrarCliente,
  convenioHash,
  categoriaHash,
  proutoName,
  onProdutoIdReceived
}: SimuladorFgtsProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);
  const [loading, setLoading] = useState(false);
  const [cpfProposta, setCpfProposta] = useState<string | null>(null);
  const [abrirCadastro, setAbrirCadastro] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [produtoHash, setProdutoHash] = useState<Section[]>([]);
  const [simulacaoSelecionadaKey, setSimulacaoSelecionadaKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSimulateButton, setShowSimulateButton] = useState(true);
  const [produtoId, setProdutoId] = useState<string | null>(null);

  const { token } = useAuth();

  useEffect(() => {
    async function fetchSections() {
      try {
        const response = await axios({
          method: "get",
          url: `${API_BASE_URL}/simulacao-campos-produtos/listar`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          params: {
            modalidade_hash: modalidadeHash,
            operacao_hash: categoriaHash,
            convenio_hash: convenioHash
          }
        });

        const data = response.data;
        const arrData = Array.isArray(data) ? data : [data];

        console.log(response.data);
        console.log(response.status);

        const parsedSections: Section[] = arrData.map((item: any) => ({
          type: item.simulacao_campos_produtos_type,
          title: item.simulacao_campos_produtos_title,
          items: JSON.parse(item.simulacao_campos_produtos_items),
          fields: JSON.parse(item.simulacao_campos_produtos_fields)
        }));

        setSections(parsedSections);
        setProdutoHash(arrData[0].simulacao_campos_produtos_produto_id);
        setErrorMessage("");
        setShowSimulateButton(true);

        if (arrData.length > 0 && arrData[0].simulacao_campos_produtos_produto_id) {
          const id = arrData[0].simulacao_campos_produtos_produto_id;
          setProdutoId(id);
          if (onProdutoIdReceived) {
            onProdutoIdReceived(id);
          }
        }
      } catch (error: any) {
        if (error.response?.data === null) {
          setErrorMessage("Produto não possui campos configurados para a simulação");
          setShowSimulateButton(false);
          toast.error("Produto não possui campos configurados para a simulação", {
            style: {
              background: "var(--toast-error)",
              color: "var(--toast-error-foreground)",
              boxShadow: "var(--toast-shadow)"
            }
          });
        } else {
          setErrorMessage("Ocorreu um erro ao carregar os campos da simulação");
          setShowSimulateButton(false);
          toast.error("Erro ao carregar campos da simulação", {
            style: {
              background: "var(--toast-error)",
              color: "var(--toast-error-foreground)",
              boxShadow: "var(--toast-shadow)"
            }
          });
        }
      }
    }

    fetchSections();
  }, [token, modalidadeHash, categoriaHash, convenioHash, onProdutoIdReceived]);

  const handleChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const buildRequestBody = () => {
    if (!sections.length) return {};

    const fields = sections[0].fields;
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

      // Seleciona automaticamente a simulação ao simular
      // se for apenas uma simulação, seleciona "0"
      if (data && data.mensagem && typeof data.mensagem === "object") {
        const keys = Object.keys(data.mensagem);
        if (keys.length > 0) {
          setSimulacaoSelecionadaKey(keys[0]); // Seleciona a primeira chave UUID
        }
      }

      toast.success("Simulação realizada com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    } catch (err) {
      console.error("Erro na simulação FGTS:", err);
      toast.error("Erro ao realizar simulação", {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMontarProposta = async () => {
    if (!simulacaoSelecionadaKey) {
      toast.error("Selecione uma simulação antes de montar a proposta!", {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      return;
    }

    const cpfRaw = formValues.cpf;
    const cpf = cpfRaw?.replace(/\D/g, ""); // Limpa o CPF
    if (!cpf) {
      toast.error("CPF não informado", {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
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

      if (!response.ok) throw new Error("Erro ao verificar cliente");

      const data = await response.json();
      const clienteExiste = data?.some((cliente: any) => {
        const clienteCpfLimpo = cliente.cpf?.replace(/\D/g, "");
        return clienteCpfLimpo === cpf;
      });

      setCpfProposta(cpf);
      setAbrirCadastro(!clienteExiste);
    } catch (error) {
      console.error(error);
      toast.error("Erro na verificação. Tente novamente.", {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
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

    // Adicione esta condição para o campo CPF
    if (item.key === "cpf") {
      return (
        <div className="space-y-2" key={item.key}>
          <Label htmlFor={item.key}>{item.label}</Label>
          <Cleave
            id={item.key}
            placeholder="000.000.000-00"
            options={{
              blocks: [3, 3, 3, 2],
              delimiters: [".", ".", "-"],
              numericOnly: true
            }}
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

  if (abrirCadastro && formValues.cpf && produtoId) {
    // Limpa o CPF (remove pontos e traços)
    // const cpfLimpo = formValues.cpf.replace(/\D/g, "");

    return (
      <Cadastrar
        cpf={formValues.cpf} // Passa o CPF limpo
        simulacao={resultado?.mensagem}
        produtoId={produtoId}
        isOpen={abrirCadastro}
        onClose={() => setAbrirCadastro(false)}
        onCadastrado={(cpf, simulacao) => {
          setCpfProposta(cpf);
          setAbrirCadastro(false);
          if (simulacao) setResultado({ mensagem: simulacao });
          onCadastrarCliente(cpf, simulacao);
        }}
        onClienteExiste={(cpf) => {
          setCpfProposta(cpf);
          setAbrirCadastro(false);
        }}
      />
    );
  }

  // Exibir a proposta selecionada
  // Exibir a proposta selecionada
  if (
    cpfProposta &&
    resultado?.mensagem &&
    simulacaoSelecionadaKey &&
    resultado.mensagem[simulacaoSelecionadaKey]
  ) {
    const simulacaoEscolhida = resultado.mensagem[simulacaoSelecionadaKey];
    return (
      <PropostaCliente
        cpf={cpfProposta}
        proutoName={proutoName}
        produtoHash={produtoHash}
        simulacao={simulacaoEscolhida}
        simulacaoSelecionadaKey={simulacaoSelecionadaKey}
      />
    );
  }

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-center text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="flex justify-end gap-4">
        {showSimulateButton && (
          <Button onClick={handleSimular} disabled={loading}>
            {loading ? "Simulando..." : "Simular"}
          </Button>
        )}
        {resultado?.mensagem && (
          <Button onClick={handleMontarProposta} disabled={!simulacaoSelecionadaKey}>
            Montar proposta
          </Button>
        )}
      </div>

      {sections.length > 0 &&
        sections.map((section, i) => (
          <div key={i} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {section.items.map(renderInputField)}
          </div>
        ))}

      {resultado?.mensagem && (
        <div className="space-y-6">
          {Object.keys(resultado.mensagem).length > 0 ? (
            Object.entries(resultado.mensagem).map(([uuid, simulacao], i) => (
              <Card
                key={uuid}
                className={`mb-6 cursor-pointer border ${
                  simulacaoSelecionadaKey === uuid
                    ? "border-primary bg-primary/10"
                    : "border-gray-300"
                }`}
                onClick={() => setSimulacaoSelecionadaKey(uuid)}>
                <CardHeader>
                  <CardTitle>Simulação {i + 1}</CardTitle>
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
                      {Array.isArray(simulacao.PARCELAS) &&
                        simulacao.PARCELAS.map((p, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>R$ {p.PRESTACAO?.toFixed(2)}</TableCell>
                            <TableCell>R$ {p.JUROS?.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  <div className="flex flex-wrap justify-around gap-4">
                    <p>
                      <strong>IOF:</strong> R$ {simulacao.iof?.toFixed(2)}
                    </p>
                    <p>
                      <strong>Taxa Cadastro:</strong> R$ {simulacao.taxaCadastro?.toFixed(2)}
                    </p>
                    <p>
                      <strong>Valor Cliente:</strong> R$ {simulacao.valorCliente?.toFixed(2)}
                    </p>
                    <p>
                      <strong>CET:</strong> {simulacao.CET?.toFixed(2)}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p>Nenhuma simulação encontrada.</p>
          )}
        </div>
      )}
    </div>
  );
}
