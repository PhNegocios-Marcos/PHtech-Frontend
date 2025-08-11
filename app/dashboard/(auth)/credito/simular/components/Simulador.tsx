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
import PropostaCliente, { Simulacao, Parcela } from "./proposta";
import Cadastrar from "./cadastrarCliente";
import axios from "axios";

interface SimuladorFgtsProps {
  modalidadeHash: any;
  categoriaHash: any;
  convenioHash: any;
  onCadastrarCliente: (cpf: string, dadosSimulacao: any) => void;
  proutoName: string;
  onProdutoIdReceived?: (produtoId: string) => void; // Nova prop opcional
}

interface ResultadoSimulacao {
  mensagem: Record<string, Simulacao>;
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
  onProdutoIdReceived // Adicione aqui na desestruturação das props
}: SimuladorFgtsProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);
  const [loading, setLoading] = useState(false);
  const [cpfProposta, setCpfProposta] = useState<string | null>(null);
  const [abrirCadastro, setAbrirCadastro] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
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

        const parsedSections: Section[] = arrData.map((item: any) => ({
          type: item.simulacao_campos_produtos_type,
          title: item.simulacao_campos_produtos_title,
          items: JSON.parse(item.simulacao_campos_produtos_items),
          fields: JSON.parse(item.simulacao_campos_produtos_fields)
        }));

        setSections(parsedSections);
        setErrorMessage("");
        setShowSimulateButton(true);

        // Captura o simulacao_campos_produtos_produto_id
        if (arrData.length > 0 && arrData[0].simulacao_campos_produtos_produto_id) {
          const id = arrData[0].simulacao_campos_produtos_produto_id;
          setProdutoId(id);
          if (onProdutoIdReceived) {
            onProdutoIdReceived(id);
          }
        }
      } catch (error: any) {
        console.error("Erro ao carregar campos da simulação:", error);
        if (error.response && error.response.data && error.response.data === null) {
          setErrorMessage("Produto não possui campos configurados para a simulação");
          setShowSimulateButton(false);
        } else {
          setErrorMessage("Ocorreu um erro ao carregar os campos da simulação");
          setShowSimulateButton(false);
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
      produto_hash: modalidadeHash,
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
      setSimulacaoSelecionadaKey(null); // resetar seleção a cada simulação nova
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

  // Cadastro aberto
  if (abrirCadastro && formValues.cpf && produtoId) {
    return (
      <Cadastrar
        cpf={formValues.cpf}
        simulacao={resultado?.mensagem}
        produtoId={produtoId} // Passe o produtoId aqui
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

  // Quando há cpfProposta e simulação selecionada, abre PropostaCliente só com aquela simulação
  if (cpfProposta && simulacaoSelecionadaKey && resultado?.mensagem) {
    const simulacaoEscolhida = resultado.mensagem[simulacaoSelecionadaKey];
    return (
      <PropostaCliente
        cpf={cpfProposta}
        modalidadeHash={modalidadeHash}
        simulacao={simulacaoEscolhida}
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
        {resultado?.mensagem && <Button onClick={handleCadastrarCliente}>Montar proposta</Button>}
      </div>

      {sections.length > 0 &&
        sections.map((section, i) => (
          <div key={i} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {section.items.map(renderInputField)}
          </div>
        ))}

      {resultado?.mensagem && (
        <div className="space-y-6">
          {Array.isArray(resultado.mensagem) ? (
            resultado.mensagem.length > 0 ? (
              resultado.mensagem.map((simulacao, i) => (
                <Card
                  key={i}
                  className={`mb-6 cursor-pointer border ${
                    simulacaoSelecionadaKey === i.toString()
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-300"
                  }`}
                  onClick={() => {
                    setSimulacaoSelecionadaKey(i.toString());
                    if (!cpfProposta && formValues.cpf) {
                      setCpfProposta(formValues.cpf);
                    }
                  }}>
                  <CardHeader>
                    <CardTitle>Simulação {i + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="mt-10 rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Parcela</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Juros</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Array.isArray(simulacao.parcelas) &&
                            simulacao.parcelas.map((p: Parcela, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell>{idx + 1}</TableCell>
                                <TableCell>R$ {p.valor_parcela.toFixed(2)}</TableCell>
                                <TableCell>R$ {p.valor_juros.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex flex-wrap justify-around gap-4">
                      <p>
                        <strong>IOF:</strong> R$ {simulacao.iof.toFixed(2)}
                      </p>
                      <p>
                        <strong>Taxa Cadastro:</strong> R$ {simulacao.taxaCadastro.toFixed(2)}
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
              ))
            ) : (
              <p>Nenhuma simulação encontrada.</p>
            )
          ) : (
            // Se mensagem for um único objeto
            <Card
              className={`mb-6 cursor-pointer border ${
                simulacaoSelecionadaKey === "0" ? "border-blue-600 bg-blue-50" : "border-gray-300"
              }`}
              onClick={() => {
                setSimulacaoSelecionadaKey("0");
                if (!cpfProposta && formValues.cpf) {
                  setCpfProposta(formValues.cpf);
                }
              }}>
              <CardHeader>
                <CardTitle>Simulação</CardTitle>
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
                    {Array.isArray(resultado.mensagem.parcelas) &&
                      resultado.mensagem.parcelas.map((p, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>R$ {p.valor_parcela.toFixed(2)}</TableCell>
                          <TableCell>R$ {p.valor_juros.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <div className="flex flex-wrap justify-around gap-4">
                  <p>
                    <strong>IOF:</strong> R$ {resultado.mensagem.iof.toFixed(2)}
                  </p>
                  <p>
                    <strong>Taxa Cadastro:</strong> R$ {resultado.mensagem.taxaCadastro.toFixed(2)}
                  </p>
                  <p>
                    <strong>Valor Cliente:</strong> R$ {resultado.mensagem.valorCliente.toFixed(2)}
                  </p>
                  <p>
                    <strong>CET:</strong> {resultado.mensagem.CET.toFixed(2)}%
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
