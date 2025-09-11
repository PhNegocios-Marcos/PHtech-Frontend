"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import AjusteOperacaoModal from "./AjusteOperacaoModal";
import {
  CheckCircle,
  Clock,
  FileText,
  PenTool,
  History,
  Info,
  Calculator,
  ArrowLeft,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { maskDate, maskFinalValueWithZero, maskMoneyReal, maskPercentage } from "@/utils/maskTable";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// API PAYLOAD EXEMPLO (TIPO):
export type ApiPropostaPayload = {
  id: string;
  correspondente: string;
  operacao: string;
  produto: string;
  tomador: string;
  cpf: string;
  valor: string | number;
  data: string;
  status: string; // Alterado de number para string
  cor_status: string;
  numero_operacao: string;
  roteiro: string;
  taxa: string; // Adicionado campo que existe no JSON
  informacoes: {
    modoLiquidacao: string | number;
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
    valorParcela: string | null;
    taxaJurosAM: string;
    quantidadeParcelas: number;
    carenciaPrincipal: string;
    baseCalculo: string;
    periodicidadePagamento: string;
    periodicidade: number;
    data_inicio: string | null;
    dataPrimeiroPagamento: string | null;
    dataUltimoPagamento: string | null;
    corban: string;
    ajustarVencimentos: string;
    usa_seguro: number | null;
    seguro: string | null;
    usa_tac: number | null;
    valor_tac: string | null;
    iof: string | null;
  }[];
  operacaoResultados?: {
    // Tornado opcional
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
    parcela: string;
    vencimento: string;
    saldo: string;
    amortizacao: string;
    juros: string;
    pagamento: string;
  }[];
  documentos?: {
    // Tornado opcional
    nome: string;
    tipo: string;
    signatarios: string;
    data: string;
    status: string;
  }[];
  documentosSignatario?: {
    // Tornado opcional
    nome: string;
    tipo: string;
    signatarios: string;
    data: string;
    status: string;
  }[];
  assinaturas?: {
    // Tornado opcional
    signatario: string;
    telefone: string;
    email: string;
    data: string;
  }[];
};

interface OperacoesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  propostaId: string; // ← Receber o ID em vez do objeto completo
}

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
    maximumFractionDigits: 2
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
      hour12: false
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
  propostaId?: string;
};

const ProcessStepper = ({ status }: { status?: string }) => {
  const statusMap: Record<string, number> = {
    "Não iniciado": 0,
    "Em análise": 2
    // Adicione outros mapeamentos conforme necessário
  };

  const statusNumber = status ? statusMap[status] || 0 : 0;

  const steps = [
    { label: "Criação", status: "completed" },
    { label: "Documentação", status: "completed" },
    { label: "Análise", status: statusNumber === 2 ? "current" : "pending" },
    { label: "Aprovação", status: "pending" },
    { label: "Assinatura", status: "pending" },
    { label: "Liberação", status: "pending" }
  ];

  return (
    <div className="mb-6 hidden sm:flex w-full items-center justify-between">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                step.status === "completed"
                  ? "bg-primary text-primary-foreground"
                  : step.status === "current"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}>
              {step.status === "completed" ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span
              className={`mt-2 text-xs font-medium ${step.status === "current" ? "text-foreground" : "text-muted-foreground"}`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`mx-2 xl:mx-4 h-0.5 md:w-8 xl:w-16 transition-all duration-300 ${
                steps[index + 1].status === "completed" || step.status === "completed"
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const Informacoes = ({ proposta }: { proposta: ApiPropostaPayload }) => (
  <div className="w-full space-y-6">
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-md sm:text-lg">
          Dados da proposta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { label: "Produto", value: proposta.produto },
            { label: "CPF/CNPJ", value: formatCpfOrCnpj(proposta.cpf) },
            { label: "Tomador", value: proposta.tomador },
            { label: "Modo de liquidação", value: proposta.informacoes.modoLiquidacao },
            { label: "Conta de liquidação", value: proposta.informacoes.contaLiquidacao },
            { label: "Valor líquido", value: formatToBRL(proposta.valor) },
            { label: "Código IPOC", value: proposta.informacoes.codigoIpoc },
            { label: "Data de cadastro", value: maskDate(proposta.data) },
            { label: "Observações", value: proposta.informacoes.observacoes },
            { label: "Correspondente", value: proposta.historico.correspondente },
            { label: "Operador", value: proposta.historico.operador },
            { label: "Grupo", value: proposta.historico.grupo },
            { label: "Data da última atualização", value: maskDate(proposta.historico.dataUltimaAtualizacao) },
            { label: "Última atualização feita por", value: proposta.historico.ultimaAtualizacaoPor}  
          ].map((item, index) => (
            <div key={index} className="w-full">
              <p className="text-muted-foreground text-sm font-medium mb-0 sm:mb-1">{item.label}</p>
              <p className="text-md sm:text-lg font-medium">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const Historico = ({ proposta }: { proposta: ApiPropostaPayload }) => {
  const [pendenciaModal, setPendenciaModal] = useState<{ open: boolean; evento: any | null }>({
    open: false,
    evento: null
  });

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-lg">
            Andamento da operação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full space-y-6">
            <div className="relative w-full">
              <div className="bg-border absolute top-0 left-3 h-full w-0.5" />
              {proposta.historico.eventos.map((item, index) => (
                <div key={index} className="relative mb-6 flex w-full items-start gap-4">
                  <div
                    className={`absolute left-0 mt-1 flex h-6 w-6 items-center justify-center rounded-full ${
                      item.status === "completed"
                        ? "bg-primary"
                        : item.status === "failed"
                          ? "bg-[var(--primary-300)]"
                          : "bg-[var(--primary-300)]"
                    }`}>
                    {item.status === "completed" ? (
                      <CheckCircle className="text-primary-foreground h-4 w-4" />
                    ) : item.status === "failed" ? (
                      <AlertCircle className="text-destructive-foreground h-4 w-4" />
                    ) : (
                      <Clock className="text-primary-foreground h-4 w-4" />
                    )}
                  </div>
                  <div className="ml-10 w-full">
                    <p className="text-lg font-medium">{item.event}</p>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                    <p className="text-muted-foreground text-sm">Iniciado em {maskDate(item.iniciado)}</p>
                    <p className="text-muted-foreground text-sm">Finalizado em {maskDate(item.finalizado)}</p>

                    {/* ALTERAÇÃO AQUI: Mostrar botão para status "failed" também */}
                    {(item.status === "pending" || item.status === "failed") &&
                      item.tipoPendencia &&
                      Object.keys(item.tipoPendencia).length > 0 &&
                      item.campos &&
                      Object.keys(item.campos).length > 0 && (
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={() => setPendenciaModal({ open: true, evento: item })}>
                          Resolver Pendência
                        </Button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      <AjusteOperacaoModal
        isOpen={pendenciaModal.open}
        evento={pendenciaModal.evento}
        onClose={() => setPendenciaModal({ open: false, evento: null })}
        propostaId={proposta.id} // ← Passe o ID da proposta
      />
    </>
  );
};

const formatarData = (dataString: string): string => {
  const data = new Date(dataString);

  // Verifica se a data é válida
  if (isNaN(data.getTime())) {
    return "Data inválida";
  }

  const dia = String(data.getDate()).padStart(2, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano}`;
};

const formatarStringNumerica = (valor: string) => {
  const numero = parseFloat(valor);
  const verifyNumber =  isNaN(numero) ? valor : numero.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return verifyNumber === "0,00" ? verifyNumber : "R$ " + verifyNumber
};

const Operacao = ({ proposta }: { proposta: ApiPropostaPayload }) => (
  <div className="w-full space-y-8">
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-md sm:text-lg">
          Parâmetros da operação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          {proposta.operacaoParametros.map((item, index) => (
            <div key={index} className={`rounded-lg grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 border p-4 justify-between ${item.valorParcela ? "bg-secondary" : "bg-muted"} w-full`}>
              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">Taxa de juros ao mês</p>
                <p className="text-lg font-bold">{`${maskFinalValueWithZero(item.taxaJurosAM)}%` || "-"}</p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">Prazo de operação</p>
                <p className="text-lg font-bold">{`${item.quantidadeParcelas} meses`}</p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">Data de início</p>
                <p className="text-lg font-bold">{maskDate(item.data_inicio)}</p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">Data do primeiro pagamento</p>
                <p className="text-lg font-bold">{maskDate(item.dataPrimeiroPagamento)}</p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">Data do último pagamento</p>
                <p className="text-lg font-bold">{maskDate(item.dataUltimoPagamento)}</p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">Prazo de pagamento</p>
                <p className="text-lg font-bold">{`${item.periodicidade} meses`}</p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">Seguro</p>
                <p className="text-md font-medium">
                  {item.usa_seguro === 0 ? "Não informado" : item.seguro}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">TAC</p>
                <p className={`${item.usa_tac === 0 ? 'font-medium text-md' : 'font-bold text-lg'}`}>
                  {item.usa_tac === 0 ? "Não informado" : `${item.valor_tac} %`}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">IOF</p>
                <p className="text-lg font-bold">{`${maskFinalValueWithZero(item.iof)}%`}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Adicionar verificação para operacaoResultados */}
    {proposta.operacaoResultados && proposta.operacaoResultados.length > 0 && (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowRight className="h-5 w-5" />
            Resultados da Operação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {proposta.operacaoResultados.map((item, index) => (
              <div
                key={index}
                className={`rounded-lg border p-4 ${item.valorContrato ? "bg-secondary" : "bg-muted"} w-full`}>
                <p className="text-muted-foreground mb-1 text-sm font-medium">
                  {item.valorContrato ? "Valor do Contrato" : "Resultado"}
                </p>
                <p className="text-lg font-bold">{item.valorContrato || "-"}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}

    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-md sm:text-lg">Detalhes das parcelas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="px-4 py-3 text-left font-semibold">Nº de parcelas</th>
                <th className="px-4 py-3 text-left font-semibold">Valor da parcela</th>
                <th className="px-4 py-3 text-left font-semibold">Vencimento</th>
                <th className="px-4 py-3 text-left font-semibold">Saldo devedor</th>
                <th className="px-4 py-3 text-left font-semibold">Amortização</th>
                <th className="px-4 py-3 text-left font-semibold">Juros</th>
                <th className="px-4 py-3 text-left font-semibold">Pagamento</th>
              </tr>
            </thead>
            <tbody>
              {proposta.operacaoParcelas.map((row, index) => (
                <tr
                  key={index}
                  className={`hover:bg-muted transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted"}`}>
                  <td className="px-4 py-3">{++index}</td>
                  <td className="px-4 py-3">{(formatarStringNumerica(row.parcela))}</td>
                  <td className="px-4 py-3">{formatarData(row.vencimento)}</td>
                  <td className="px-4 py-3">{formatarStringNumerica(row.saldo)}</td>
                  <td className="px-4 py-3">{formatarStringNumerica(row.amortizacao)}</td>
                  <td className="px-4 py-3">{formatarStringNumerica(row.juros)}</td>
                  <td className={`px-4 py-3 ${row.pagamento.length === 0 ? 'font-regular' : 'font-semibold'}`}>
                    {row.pagamento.length === 0 ? "Pagamento não informado" : formatarStringNumerica(row.pagamento)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

const Documentos = ({ proposta }: { proposta: ApiPropostaPayload }) => (
  <div className="w-full space-y-8">
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-md sm:text-lg">
          {/* <FileText className="h-5 w-5" /> */}
          Documentos da operação
        </CardTitle>
      </CardHeader>
      <CardContent>
        {proposta.documentos && proposta.documentos.length > 0 ? (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">{/* Renderizar tabela de documentos */}</table>
            </div>
            <div className="text-muted-foreground mt-4 text-sm">
              Linhas por página: {proposta.documentos.length} | 1–{proposta.documentos.length} de{" "}
              {proposta.documentos.length}
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">Nenhum documento encontrado</p>
        )}
      </CardContent>
    </Card>

    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-md sm:text-lg">
          {/* <FileText className="h-5 w-5" /> */}
          Documentos - {proposta.tomador}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">Nenhum documento encontrado</p>
      </CardContent>
    </Card>
  </div>
);

const Assinaturas = ({ proposta }: { proposta: ApiPropostaPayload }) => (
  <Card className="w-full">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-md sm:text-lg ">
        {/* <PenTool className="h-5 w-5" /> */}
        Status das assinaturas
      </CardTitle>
    </CardHeader>
    <CardContent>
      {proposta.assinaturas && proposta.assinaturas.length > 0 ? (
        <div className="w-full overflow-x-auto">
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
                <tr
                  key={index}
                  className={`hover:bg-muted transition-colors ${index % 2 === 0 ? "bg-background" : "bg-muted"}`}>
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
      ) : (
        <p className="text-muted-foreground text-sm">Nenhuma assinatura encontrada</p>
      )}
    </CardContent>
  </Card>
);

const transformApiData = (apiData: any): ApiPropostaPayload => {
  return {
    ...apiData,
    // Garantir que arrays opcionais existam
    operacaoResultados: apiData.operacaoResultados || [],
    documentos: apiData.documentos || [],
    documentosSignatario: apiData.documentosSignatario || [],
    assinaturas: apiData.assinaturas || []
  };
};

// Seções para navegação
const sections = [
  { id: "informacoes", label: "Informações", component: Informacoes, icon: Info },
  { id: "operacao", label: "Operação", component: Operacao, icon: Calculator },
  { id: "documentos", label: "Documentos", component: Documentos, icon: FileText },
  { id: "assinaturas", label: "Assinaturas", component: Assinaturas, icon: PenTool },
  { id: "historico", label: "Histórico", component: Historico, icon: History }
];

const LoadingSkeleton = () => (
  <div className="min-h-[900px] w-full overflow-hidden">
    <div className="mb-2 flex items-center justify-between border-b px-6 py-4">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>
    </div>
    <div className="flex">
      <div className="flex-1 px-8 pb-16">
        <div className="py-6">
          <div className="mx-auto mb-6 flex w-full max-w-4xl items-center justify-between">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="mt-2 h-4 w-16" />
                </div>
                {i < 6 && <Skeleton className="mx-4 h-0.5 w-16" />}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-10">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="scroll-mt-28">
              <div className="mb-6 flex items-center gap-3 border-b pb-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-7 w-48" />
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="min-h-[100vh] w-80 border-l">
        <div
          className="sticky top-0 z-30 flex w-80 flex-col justify-between bg-background p-8"
          style={{ marginTop: "131px" }}>
          <div>
            <div className="mb-8">
              <Skeleton className="mb-3 h-4 w-40" />
              <Skeleton className="mb-2 h-2.5 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <nav className="flex-1 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="relative">
                  {i !== 5 && <Skeleton className="absolute top-14 left-6 h-10 w-0.5" />}
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </nav>
            <Skeleton className="mt-20 h-9 w-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ErrorDisplay = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="flex min-h-[500px] flex-col items-center justify-center p-8">
    <AlertCircle className="text-destructive mb-4 h-16 w-16" />
    <h3 className="mb-2 text-xl font-semibold">Erro ao carregar proposta</h3>
    <p className="text-muted-foreground mb-6 text-center">{message}</p>
    <Button onClick={onRetry}>Tentar novamente</Button>
  </div>
);

export default function OperacoesDetalhes({ isOpen, onClose, propostaId }: OperacoesDrawerProps) {
  const [proposta, setProposta] = useState<ApiPropostaPayload | null>(null);
  const [activeSection, setActiveSection] = useState<string>("informacoes");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const router = useRouter();
  const searchParams = useSearchParams();

  const { token } = useAuth();

    useEffect(() => {
    const timeout = setTimeout(() => {
      if (token == null) {
    sessionStorage.clear();
        router.push("/dashboard/login");
      } else {
        // console.log("tem token");
      }
    }, 2000); // espera 2 segundos antes de verificar

    return () => clearTimeout(timeout); // limpa o timer se o componente desmontar antes
  }, [token, router]);

  // Busca da proposta na API
  useEffect(() => {
    // Obter o valor do parâmetro de busca de forma estável
    const idFromParams = searchParams.get("id");

    async function fetchProposta() {
      try {
        setLoading(true);
        setError(null);

        // Se não temos um propostaId, tentamos obter da URL
        const idToUse = propostaId || idFromParams;

        if (!token) {
          throw new Error("Token de autenticação não encontrado");
        }

        if (!idToUse) {
          throw new Error("ID da proposta não encontrado");
        }

        // Substitua por sua chamada real de API
        const response = await fetch(`${API_BASE_URL}/proposta/${idToUse}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);
        setProposta(transformApiData(data)); // Usar a função de transformação
      } catch (err) {
        console.error("Erro ao carregar proposta:", err);
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    }

    // Só executar se temos um ID para buscar
    if (propostaId || idFromParams) {
      fetchProposta();
      setActiveSection("informacoes");
      setProgress(0);
    } else {
      setError("ID da proposta não fornecido");
      setLoading(false);
    }
  }, [propostaId, searchParams]); // Mantenha searchParams aqui

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -60% 0px",
      threshold: Array.from({ length: 11 }, (_, i) => i / 10)
    };

    const observer = new IntersectionObserver((entries) => {
      let mostVisibleSection: string | null = null;
      let maxRatio = 0;

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
          maxRatio = entry.intersectionRatio;
          mostVisibleSection = entry.target.id;
        }
      });

      if (mostVisibleSection && mostVisibleSection !== activeSection) {
        setActiveSection(mostVisibleSection);
        const sectionIndex = sections.findIndex((s) => s.id === mostVisibleSection);
        const newProgress = ((sectionIndex + 1) / sections.length) * 100;
        setProgress(newProgress);
      }
    }, observerOptions);

    const currentSections = Object.values(sectionRefs.current);
    currentSections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      currentSections.forEach((section) => {
        if (section) observer.unobserve(section);
      });
      observer.disconnect();
    };
  }, [proposta, activeSection]);

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      setActiveSection(sectionId);
      const sectionIndex = sections.findIndex((s) => s.id === sectionId);
      const newProgress = ((sectionIndex + 1) / sections.length) * 100;
      setProgress(newProgress);
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Recarregar a proposta
    setTimeout(() => {
      const idToUse = propostaId || searchParams.get("id");
      if (idToUse) {
        // Refazer a chamada à API
        fetch(`/api/propostas/${idToUse}`)
          .then((response) => {
            if (!response.ok) throw new Error(`Erro ${response.status}`);
            return response.json();
          })
          .then((data) => {
            setProposta(data);
            setError(null);
          })
          .catch((err) => {
            setError(err.message);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }, 1000);
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} onRetry={handleRetry} />;
  if (!proposta) return <ErrorDisplay message="Proposta não encontrada" onRetry={handleRetry} />;

  return (
    <Card>
      <div className="min-h-[900px] w-full overflow-hidden">
        {/* Main Content */}
        <div className="flex">
          {/* Conteúdo principal SEM scroll interno */}
          <div ref={containerRef} className="flex-1 w-full px-4 sm:px-8 pb-16">
            {/* Header */}
            <div className="mb-4 flex flex-col 2xl:flex-row 2xl:items-center flex-wrap justify-between">
              <div className="w-full 2xl:w-auto flex justify-between items-center">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Detalhes da operação</h2>
                  <p className="text-muted-foreground mt-1">Nº {proposta.numero_operacao}</p>
                </div>

                <Button onClick={onClose} size="sm" className="2xl:hidden rounded-2xl sm:rounded">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:flex">Voltar</span>
                </Button>
              </div>

              <div className="pt-6">
                  <ProcessStepper status={proposta.status} />
              </div>
            </div>

            <div className="space-y-10">
              {sections.map((section) => (
                <section
                  key={section.id}
                  ref={(el) => {
                    sectionRefs.current[section.id] = el as HTMLDivElement | null;
                  }}
                  id={section.id}
                  className="scroll-mt-28">
                  <div className="mb-3 flex items-center gap-2">
                    <section.icon className="h-6 w-6 text-primary" />
                    <h3 className="text-lg sm:text-xl font-medium">{section.label}</h3>
                  </div>
                  <div className="w-full space-y-8">
                    {/* @ts-ignore */}
                    <section.component proposta={proposta} />
                  </div>
                </section>
              ))}
            </div>
          </div>
          {/* Sticky lateral */}
          <div className="min-h-[100vh] w-80 hidden 2xl:flex border-l">
            <div
              style={{ position: "fixed", marginTop: "131px" }}
              className="sticky top-0 z-30 flex w-80 flex-col justify-between bg-background p-8">
              <div>
                <div className="mb-8">
                  <h4 className="text-muted-foreground mb-3 text-sm font-bold tracking-wide uppercase">
                    Progresso da Navegação
                  </h4>
                  <div className="bg-muted mb-2 h-2.5 w-full rounded-full">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">{Math.round(progress)}% concluído</p>
                </div>
                <nav className="flex-1 space-y-3">
                  {sections.map((section, index) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    const isCompleted = sections.findIndex((s) => s.id === activeSection) > index;
                    return (
                      <div key={section.id} className="relative">
                        {index !== sections.length - 1 && (
                          <div
                            className={`absolute top-14 left-6 h-10 w-0.5 transition-all duration-300 ${
                              isCompleted || isActive ? "bg-primary" : "bg-border"
                            }`}
                          />
                        )}
                        <button
                          onClick={() => scrollToSection(section.id)}
                          className={`flex w-full items-center rounded-lg px-4 py-4 text-left text-sm transition-all duration-300 ${
                            isActive
                              ? "bg-primary text-primary-foreground font-medium"
                              : "text-muted-foreground hover:bg-muted"
                          }`}>
                          <div className="relative">
                            <div
                              className={`mr-4 flex h-5 w-5 items-center justify-center rounded-full transition-all duration-300 ${
                                isActive
                                  ? "bg-primary-foreground/20"
                                  : isCompleted
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                              }`}>
                              {isCompleted ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <Icon className="h-3 w-3" />
                              )}
                            </div>
                          </div>
                          <span className="flex-1 font-medium">{section.label}</span>
                          {isActive && <ArrowRight className="ml-2 h-4 w-4" />}
                        </button>
                      </div>
                    );
                  })}
                </nav>
                <Button className="right-0 mt-20" onClick={onClose} size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
