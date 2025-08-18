"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, FileText, PenTool, History, Info, Calculator, ArrowLeft, ArrowRight } from "lucide-react";
import AjusteOperacaoModal from "./AjusteOperacaoModal"; // novo arquivo/modal

// API PAYLOAD EXEMPLO (TIPO):
// Este é o payload que você DEVE esperar da API para preencher o componente abaixo:
export type ApiPropostaPayload = {
  id: string;
  correspondente: string;
  operacao: string;
  produto: string;
  tomador: string;
  cpf: string;
  valor: string | number;
  data: string; // "2025-07-30 15:23:20"
  status: number;
  roteiro: string;
  tabela: string;
  informacoes: {
    modoLiquidacao: string;
    contaLiquidacao: string;
    codigoIpoc: string;
    observacoes: string;
  };
  historico: {
    correspondente: string;
    operador: string;
    grupo: string;
    dataUltimaAtualizacao: string;
    ultimaAtualizacaoPor: string;
    eventos: {
      event: string;
      description: string;
      iniciado: string;
      finalizado: string;
      status: "completed" | "failed" | "pending" | "edit";
      tipoPendencia?: any;
      campos?: any;
    }[];
  };
  operacaoParametros: {
    valorParcela: string;
    taxaJurosAM: string;
    quantidadeParcelas: string;
    carenciaPrincipal: string;
    baseCalculo: string;
    periodicidadePagamento: string;
    dataInicio: string;
    dataPrimeiroPagamento: string;
    corban: string;
    ajustarVencimentos: string;
  }[];
  operacaoResultados: {
    dataEmissao: string;
    dataVencimento: string;
    prazo: string;
    indexador: string;
    valorContrato: string;
    custoEmissao: string;
    iof: string;
    valorLiquido: string;
    valorFuturo: string;
    cetAA: string;
  }[];
  operacaoParcelas: {
    parcela: number;
    vencimento: string;
    saldo: string;
    amortizacao: string;
    juros: string;
    pagamento: string;
  }[];
  documentos: {
    nome: string;
    tipo: string;
    signatarios: string;
    data: string;
    status: string;
  }[];
  documentosSignatario: {
    nome: string;
    tipo: string;
    signatarios: string;
    data: string;
    status: string;
  }[];
  assinaturas: {
    signatario: string;
    telefone: string;
    email: string;
    data: string;
  }[];
};

// Função para formatar número/string para BRL
const formatToBRL = (value: number | string | null | undefined): string => {
  if (value == null) return "R$ 0,00";
  let cleanedValue = String(value).replace(/[^\d.,-]/g, "");
  cleanedValue = cleanedValue.replace(",", ".");
  const numericValue = parseFloat(cleanedValue.replace(/\.+/g, ".")) || 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue);
};

// Formata data para DD/MM/YYYY HH:MM:SS
const formatToBrazilianDate = (date: string | null | undefined): string => {
  if (!date) return "N/A";
  try {
    const dateTime = new Date(date);
    if (isNaN(dateTime.getTime())) return "Data inválida";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(dateTime);
  } catch {
    return "Data inválida";
  }
};

// Formata CPF/CNPJ
const formatCpfOrCnpj = (value: string | null | undefined): string => {
  if (!value) return "N/A";
  const cleanedValue = value.replace(/\D/g, "");
  if (cleanedValue.length === 11)
    return cleanedValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  else if (cleanedValue.length === 14)
    return cleanedValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return cleanedValue;
};

type OperacoesDetalhesProps = {
  propostaId: string; // Você vai receber só o ID da proposta como prop
};

const ProcessStepper = ({ status }: { status?: number }) => {
  // Você pode usar status para marcar qual step está ativo baseado no status da proposta
  const steps = [
    { label: "Criação", status: "completed" },
    { label: "Documentação", status: "completed" },
    { label: "Análise", status: status === 2 ? "current" : "pending" },
    { label: "Aprovação", status: "pending" },
    { label: "Assinatura", status: "pending" },
    { label: "Liberação", status: "pending" },
  ];

  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto mb-6">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                step.status === "completed"
                  ? "bg-primary text-primary-foreground"
                  : step.status === "current"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step.status === "completed" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span className={`text-xs mt-2 font-medium ${step.status === "current" ? "text-foreground" : "text-muted-foreground"}`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
              steps[index + 1].status === "completed" || step.status === "completed"
                ? "bg-primary"
                : "bg-muted"
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};

const Informacoes = ({ proposta }: { proposta: ApiPropostaPayload }) => (
  <div className="space-y-6 w-full">
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="w-5 h-5" />
          Dados da Proposta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {[
            { label: "Produto", value: proposta.produto },
            { label: "Modo de Liquidação", value: proposta.informacoes.modoLiquidacao },
            { label: "Tomador", value: proposta.tomador },
            { label: "CPF/CNPJ", value: formatCpfOrCnpj(proposta.cpf) },
            { label: "Conta de Liquidação", value: proposta.informacoes.contaLiquidacao },
            { label: "Código IPOC", value: proposta.informacoes.codigoIpoc },
            { label: "Valor", value: formatToBRL(proposta.valor) },
            { label: "Data de Início", value: formatToBrazilianDate(proposta.data) },
            { label: "Observações", value: proposta.informacoes.observacoes },
          ].map((item, index) => (
            <div key={index} className="space-y-2 w-full">
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              <p className="text-lg font-medium">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const Historico = ({ proposta }: { proposta: ApiPropostaPayload }) => {
  const [pendenciaModal, setPendenciaModal] = useState<{ open: boolean; evento: any | null }>({ open: false, evento: null });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="w-5 h-5" />
          Andamento da Operação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {[
              { label: "Correspondente", value: proposta.historico.correspondente },
              { label: "Operador", value: proposta.historico.operador },
              { label: "Grupo", value: proposta.historico.grupo },
              { label: "Data da Última Atualização", value: proposta.historico.dataUltimaAtualizacao },
              { label: "Última Atualização Feita Por", value: proposta.historico.ultimaAtualizacaoPor },
            ].map((item, index) => (
              <div key={index} className="space-y-2 w-full">
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <p className="text-lg font-medium">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="relative w-full">
            <div className="absolute left-3 top-0 w-0.5 h-full bg-border" />
            {proposta.historico.eventos.map((item, index) => (
              <div key={index} className="relative flex items-start gap-4 mb-6 w-full">
                <div
                  className={`absolute w-6 h-6 rounded-full flex items-center justify-center left-0 mt-1 ${
                    item.status === "completed" ? "bg-primary" : "bg-destructive"
                  }`}
                >
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="ml-10 w-full">
                  <p className="text-lg font-semibold">{item.event}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="text-sm text-muted-foreground mt-1">Iniciado: {item.iniciado}</p>
                  <p className="text-sm text-muted-foreground">Finalizado: {item.finalizado}</p>
                  {item.status === "pending" && (
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => setPendenciaModal({ open: true, evento: item })}
                    >
                      Resolver Pendência
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <AjusteOperacaoModal
        isOpen={pendenciaModal.open}
        evento={pendenciaModal.evento}
        onClose={() => setPendenciaModal({ open: false, evento: null })}
      />
    </Card>
  );
};

const Operacao = ({ proposta }: { proposta: ApiPropostaPayload }) => (
  <div className="space-y-8 w-full">
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5" />
          Parâmetros da Operação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {proposta.operacaoParametros.map((item, index) => (
            <div key={index} className={`p-4 rounded-lg border ${item.valorParcela ? "bg-secondary" : "bg-muted"} w-full`}>
              <p className="text-sm font-medium text-muted-foreground mb-1">{item.valorParcela ? "Valor da Parcela" : "Parâmetro"}</p>
              <p className="text-lg font-bold">{item.valorParcela || "-"}</p>
              {/* Adicione mais campos conforme necessário */}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ArrowRight className="w-5 h-5" />
          Resultados da Operação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {proposta.operacaoResultados.map((item, index) => (
            <div key={index} className={`p-4 rounded-lg border ${item.valorContrato ? "bg-secondary" : "bg-muted"} w-full`}>
              <p className="text-sm font-medium text-muted-foreground mb-1">{item.valorContrato ? "Valor do Contrato" : "Resultado"}</p>
              <p className="text-lg font-bold">{item.valorContrato || "-"}</p>
              {/* Adicione mais campos conforme necessário */}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Detalhes das Parcelas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-3 text-left font-semibold">Parcela</th>
                <th className="px-4 py-3 text-left font-semibold">Vencimento</th>
                <th className="px-4 py-3 text-left font-semibold">Saldo Devedor</th>
                <th className="px-4 py-3 text-left font-semibold">Amortização</th>
                <th className="px-4 py-3 text-left font-semibold">Juros</th>
                <th className="px-4 py-3 text-left font-semibold">Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {proposta.operacaoParcelas.map((row, index) => (
                <tr key={index} className={`transition-colors hover:bg-muted ${index % 2 === 0 ? "bg-background" : "bg-muted"}`}>
                  <td className="px-4 py-3 font-medium">{row.parcela}</td>
                  <td className="px-4 py-3">{row.vencimento}</td>
                  <td className="px-4 py-3 font-mono">{row.saldo}</td>
                  <td className="px-4 py-3 font-mono">{row.amortizacao}</td>
                  <td className="px-4 py-3 font-mono">{row.juros}</td>
                  <td className="px-4 py-3 font-mono font-semibold">{row.pagamento}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted font-bold">
                <td className="px-4 py-3" colSpan={5}>
                  Total
                </td>
                <td className="px-4 py-3 font-mono text-primary">
                  {proposta.operacaoParcelas.reduce((acc, curr) => {
                    const pag = parseFloat((curr.pagamento || "0").replace(/[^\d,.-]/g, "").replace(",", "."));
                    return acc + (isNaN(pag) ? 0 : pag);
                  }, 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

const Documentos = ({ proposta }: { proposta: ApiPropostaPayload }) => (
  <div className="space-y-8 w-full">
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5" />
          Documentos da Operação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-3 text-left font-semibold">Nome</th>
                <th className="px-4 py-3 text-left font-semibold">Tipo de Documento</th>
                <th className="px-4 py-3 text-left font-semibold">Signatários</th>
                <th className="px-4 py-3 text-left font-semibold">Data de Criação</th>
                <th className="px-4 py-3 text-left font-semibold">Status da Assinatura</th>
                <th className="px-4 py-3 text-left font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {proposta.documentos.map((row, index) => (
                <tr key={index} className={`transition-colors hover:bg-muted ${index % 2 === 0 ? "bg-background" : "bg-muted"}`}>
                  <td className="px-4 py-3 font-medium">{row.nome}</td>
                  <td className="px-4 py-3">{row.tipo}</td>
                  <td className="px-4 py-3">{row.signatarios}</td>
                  <td className="px-4 py-3">{row.data}</td>
                  <td className="px-4 py-3">
                    <Badge variant={row.status === "Concluído" ? "default" : "secondary"}>{row.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm">
                      Visualizar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          Linhas por página: {proposta.documentos.length} | 1–{proposta.documentos.length} de {proposta.documentos.length}
        </div>
      </CardContent>
    </Card>
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5" />
          Documentos - {proposta.tomador}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Nenhum documento encontrado</p>
      </CardContent>
    </Card>
  </div>
);

const Assinaturas = ({ proposta }: { proposta: ApiPropostaPayload }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <PenTool className="w-5 h-5" />
        Status das Assinaturas
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-3 text-left font-semibold">Signatário</th>
              <th className="px-4 py-3 text-left font-semibold">Telefone</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">Data de Criação</th>
              <th className="px-4 py-3 text-left font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {proposta.assinaturas.map((row, index) => (
              <tr key={index} className={`transition-colors hover:bg-muted ${index % 2 === 0 ? "bg-background" : "bg-muted"}`}>
                <td className="px-4 py-3 font-medium">{row.signatario}</td>
                <td className="px-4 py-3">{row.telefone}</td>
                <td className="px-4 py-3">{row.email}</td>
                <td className="px-4 py-3">{row.data}</td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm">
                    Reenviar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

// Seções para navegação
const sections = [
  { id: "informacoes", label: "Informações", component: Informacoes, icon: Info },
  { id: "historico", label: "Histórico", component: Historico, icon: History },
  { id: "operacao", label: "Operação", component: Operacao, icon: Calculator },
  { id: "documentos", label: "Documentos", component: Documentos, icon: FileText },
  { id: "assinaturas", label: "Assinaturas", component: Assinaturas, icon: PenTool },
];

export default function OperacoesDetalhes({ propostaId }: OperacoesDetalhesProps) {
  const [proposta, setProposta] = useState<ApiPropostaPayload | null>(null);
  const [activeSection, setActiveSection] = useState<string>("informacoes");
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const router = useRouter();

  // Busca da proposta na API
  useEffect(() => {
    // Substitua por sua chamada real de API (Exemplo fictício):
    async function fetchProposta() {
      // const response = await fetch(`/api/propostas/${propostaId}`);
      // const data = await response.json();
      // setProposta(data);

      // MOCK EXEMPLO:
      setProposta({
        id: "OP-2025-001",
        correspondente: "PH Negócios",
        operacao: "Crédito Pessoal",
        produto: "Empréstimo",
        tomador: "Tiago Silva Oliveira",
        cpf: "12345678901",
        valor: "3702.74",
        data: "2025-07-30 15:23:20",
        status: 2,
        roteiro: "Análise",
        tabela: "Tabela A",
        informacoes: {
          modoLiquidacao: "Débito em Conta",
          contaLiquidacao: "123456-7 / Banco XYZ",
          codigoIpoc: "IPOC-2025-001",
          observacoes: "Nenhuma observação adicional",
        },
        historico: {
          correspondente: "PH Negócios",
          operador: "PhNegociosAPI",
          grupo: "Admin",
          dataUltimaAtualizacao: "30/07/2025",
          ultimaAtualizacaoPor: "PhNegociosAPI",
          eventos: [
            {
              event: "Rascunho",
              description: "Registro criado",
              iniciado: "30/07/2025 - 15:23:20 por PhNegociosAPI",
              finalizado: "30/07/2025 - 15:23:22 por PhNegociosAPI",
              status: "completed",
            },
            {
              event: "Pendência - Enviar Documento",
              description: "Envie o documento solicitado",
              iniciado: "31/07/2025 - 10:00:00 por Sistema",
              finalizado: "",
              status: "pending",
              tipoPendencia: "upload", // custom field
              campos: [
                { name: "documento", label: "Dcumenoto", type: "file" }
              ]
            },
            {
              event: "Pendência - Ajustar Dados",
              description: "Ajuste os dados informados",
              iniciado: "31/07/2025 - 11:00:00 por Sistema",
              finalizado: "",
              status: "pending",
              tipoPendencia: "edit", // custom field
              campos: [
                { name: "cpf", label: "CPF", type: "text", value: "" },
                { name: "nome", label: "Nome", type: "text", value: "" }
              ]
            },
            // ... outros eventos
          ],
        },
        operacaoParametros: [
          {
            valorParcela: "R$ 290,00",
            taxaJurosAM: "4,9900%",
            quantidadeParcelas: "36",
            carenciaPrincipal: "0",
            baseCalculo: "Base 365 - Meses",
            periodicidadePagamento: "1 Mês",
            dataInicio: "30/07/2025",
            dataPrimeiroPagamento: "21/10/2025",
            corban: "0,00000000",
            ajustarVencimentos: "Dias Úteis",
          },
        ],
        operacaoResultados: [
          {
            dataEmissao: "30/07/2025",
            dataVencimento: "21/09/2028",
            prazo: "3 anos e 1 mês",
            indexador: "Sem indexador pós-fixado",
            valorContrato: "R$ 4.380,87",
            custoEmissao: "R$ 525,70",
            iof: "R$ 152,43",
            valorLiquido: "R$ 3.702,74",
            valorFuturo: "R$ 10.440,00",
            cetAA: "107,1710%",
          },
        ],
        operacaoParcelas: [
          { parcela: 0, vencimento: "30/07/2025", saldo: "R$ 4.380,87", amortizacao: "R$ 0,00", juros: "R$ 0,00", pagamento: "R$ 0,00" },
          { parcela: 1, vencimento: "21/10/2025", saldo: "R$ 4.712,17", amortizacao: "R$ 49,03", juros: "R$ 240,97", pagamento: "R$ 290,00" },
          // ... outras parcelas
        ],
        documentos: [
          {
            nome: "FotoRG_3e5eb5bc-ab55-4896-a93c-9dc4ec1b5f79.pdf",
            tipo: "Documento de Identificação com Foto",
            signatarios: "Tiago Silva Oliveira",
            data: "30/07/2025, 15:36:21",
            status: "Concluído",
          },
          // ... outros documentos
        ],
        documentosSignatario: [],
        assinaturas: [
          {
            signatario: "Tiago Silva Oliveira",
            telefone: "(75) 99143-4902",
            email: "traquino.silva12@gmail.com",
            data: "30/07/2025, 19:07",
          },
        ],
      });
    }
    fetchProposta();
    setActiveSection("informacoes");
    setProgress(0);
  }, [propostaId]);

  useEffect(() => {
    const observerOptions = {
      // root: containerRef.current, // Remova ou ajuste esta linha!
      rootMargin: "-50% 0px -50% 0px",
      threshold: [0, 0.1, 0.5, 0.9, 1],
    };

    const observer = new IntersectionObserver(
      (entries) => {
        let topmostSection: string | null = null;
        let minTop = Infinity;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rect = entry.target.getBoundingClientRect();
            const topPosition = rect.top;
            if (topPosition < minTop && entry.intersectionRatio >= 0.5) {
              minTop = topPosition;
              topmostSection = entry.target.id;
            }
          }
        });

        if (topmostSection && topmostSection !== activeSection) {
          setActiveSection(topmostSection);
          const sectionIndex = sections.findIndex((s) => s.id === topmostSection);
          const newProgress = ((sectionIndex + 1) / sections.length) * 100;
          setProgress(newProgress);
        }
      },
      observerOptions
    );

    const currentSections = Object.values(sectionRefs.current);
    currentSections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      currentSections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
    };
  }, [activeSection]);

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element && containerRef.current) {
      const container = containerRef.current;
      const offset = 120; // Ajuste conforme o header
      const elementPosition = element.getBoundingClientRect().top + container.scrollTop;
      const offsetPosition = elementPosition - offset;

      container.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      setActiveSection(sectionId);
      const sectionIndex = sections.findIndex((s) => s.id === sectionId);
      const newProgress = ((sectionIndex + 1) / sections.length) * 100;
      setProgress(newProgress);
    }
  };

  if (!proposta) return <div>Carregando...</div>;

  return (
    <div className="w-full h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 mb-2">
        <div>
          <h2 className="text-2xl font-bold">Detalhes da Operação</h2>
          <p className="text-muted-foreground mt-1">ID: {proposta.id}</p>
        </div>
        <Button onClick={() => router.back()} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
      {/* Main Content */}
      <div className="flex h-[calc(100%-120px)]">
        {/* Scrollable Content */}
        <div ref={containerRef} className="flex-1 px-8 pb-16 overflow-y-auto" style={{ scrollBehavior: "smooth" }}>
          <div className="py-6">
            <ProcessStepper status={proposta.status} />
          </div>
          <div className="space-y-20 py-10">
            {sections.map((section) => (
              <section
                key={section.id}
                    ref={el => {
                      sectionRefs.current[section.id] = el as HTMLDivElement | null;
                    }}
                id={section.id}
                className="scroll-mt-28"
              >
                <div className="flex items-center gap-3 mb-6 pb-3 border-b">
                  <section.icon className="w-6 h-6" />
                  <h3 className="text-2xl font-bold">{section.label}</h3>
                </div>
                <div className="space-y-8 w-full">
                  {/* @ts-ignore */}
                  <section.component proposta={proposta} />
                </div>
              </section>
            ))}
          </div>
        </div>
        {/* Timeline Navigation */}
        <div className="w-80 border-l h-full">
          <div className="sticky top-6 p-8 h-full flex flex-col justify-between">
            <div>
              <div className="mb-8">
                <h4 className="text-sm font-bold text-muted-foreground mb-3 uppercase tracking-wide">
                  Progresso da Navegação
                </h4>
                <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{Math.round(progress)}% concluído</p>
              </div>
              <nav className="space-y-3 flex-1">
                {sections.map((section, index) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  const isCompleted = sections.findIndex((s) => s.id === activeSection) > index;
                  return (
                    <div key={section.id} className="relative">
                      {index !== sections.length - 1 && (
                        <div className={`absolute left-6 top-14 w-0.5 h-10 transition-all duration-300 ${
                          isCompleted || isActive ? "bg-primary" : "bg-border"
                        }`} />
                      )}
                      <button
                        onClick={() => scrollToSection(section.id)}
                        className={`flex items-center w-full text-left px-4 py-4 rounded-lg text-sm transition-all duration-300 ${
                          isActive ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <div className="relative">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center mr-4 transition-all duration-300 ${
                              isActive ? "bg-primary-foreground/20" : isCompleted ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            {isCompleted ? <CheckCircle className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                          </div>
                        </div>
                        <span className="flex-1 font-medium">{section.label}</span>
                        {isActive && <ArrowRight className="w-4 h-4 ml-2" />}
                      </button>
                    </div>
                  );
                })}
              </nav>
            </div>
            <div className="mt-8 space-y-3">
              <Button className="w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprovar Operação
              </Button>
              <Button variant="outline" className="w-full">
                <Clock className="w-4 h-4 mr-2" />
                Solicitar Revisão
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
