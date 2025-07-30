"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, FileText, PenTool, History, Info, Calculator, X, ArrowRight } from "lucide-react";

type Proposta = {
  id: string;
  Correspondente: string;
  Operação: string;
  Produto: string;
  Tomador: string;
  CPF: string;
  Valor: string;
  Data: string;
  status: number;
  roteiro: string;
  Tabela: string;
};

type PropostaDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  Proposta: Proposta | null;
};

// Mock ProcessStepper Component
const ProcessStepper = () => {
  const steps = [
    { label: "Criação", status: "completed" },
    { label: "Documentação", status: "completed" },
    { label: "Análise", status: "current" },
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
            <span
              className={`text-xs mt-2 font-medium ${
                step.status === "current" ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
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

// Enhanced Components
const Informacoes = ({ proposta }: { proposta: Proposta }) => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="w-5 h-5" />
          Dados da Proposta
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "Produto", value: proposta.Produto },
            { label: "Modo de Liquidação", value: "Débito em Conta" },
            { label: "Tomador", value: proposta.Tomador },
            { label: "Tipo de Liquidação", value: "Automática" },
            { label: "Conta de Liquidação", value: "123456-7 / Banco XYZ" },
            { label: "Código IPOC", value: "IPOC-2025-001" },
            { label: "Observações", value: "Nenhuma observação adicional" },
          ].map((item, index) => (
            <div key={index} className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              <p className="text-lg font-medium">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const Operacao = () => (
  <div className="space-y-8">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5" />
          Parâmetros da Operação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: "Valor da Parcela", value: "R$ 290,00", highlight: true },
            { label: "Taxa de Juros A.M.", value: "4,9900%", highlight: true },
            { label: "Quantidade de Parcelas", value: "36" },
            { label: "Carência de Principal", value: "0" },
            { label: "Base de Cálculo", value: "Base 365 - Meses" },
            { label: "Periodicidade do Pagamento", value: "1 Mês" },
            { label: "Data de Início", value: "30/07/2025" },
            { label: "Data do Primeiro Pagamento", value: "21/10/2025" },
            { label: "CORBAN", value: "0,00000000" },
            { label: "Ajustar Vencimentos", value: "Dias Úteis" },
          ].map((item, index) => (
            <div key={index} className={`p-4 rounded-lg border ${item.highlight ? "bg-secondary" : "bg-muted"}`}>
              <p className="text-sm font-medium text-muted-foreground mb-1">{item.label}</p>
              <p className={`text-lg ${item.highlight ? "font-bold" : "font-semibold"}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ArrowRight className="w-5 h-5" />
          Resultados da Operação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { label: "Data de Emissão", value: "30/07/2025" },
            { label: "Data de Vencimento", value: "21/09/2028" },
            { label: "Prazo", value: "3 anos e 1 mês" },
            { label: "Indexador", value: "Sem indexador pós-fixado" },
            { label: "Valor do Contrato", value: "R$ 4.380,87", highlight: true },
            { label: "Custo da Emissão", value: "R$ 525,70" },
            { label: "IOF", value: "R$ 152,43" },
            { label: "Valor Líquido", value: "R$ 3.702,74", highlight: true },
            { label: "Valor Futuro", value: "R$ 10.440,00", highlight: true },
            { label: "CET A.A.", value: "107,1710%", highlight: true },
          ].map((item, index) => (
            <div key={index} className={`p-4 rounded-lg border ${item.highlight ? "bg-secondary" : "bg-muted"}`}>
              <p className="text-sm font-medium text-muted-foreground mb-1">{item.label}</p>
              <p className={`text-lg ${item.highlight ? "font-bold" : "font-semibold"}`}>{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Detalhes das Parcelas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
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
              {[
                { parcela: 0, vencimento: "30/07/2025", saldo: "R$ 4.380,87", amortizacao: "R$ 0,00", juros: "R$ 0,00", pagamento: "R$ 0,00" },
                { parcela: 0, vencimento: "21/09/2025", saldo: "R$ 4.761,20", amortizacao: "R$ 0,00", juros: "R$ 380,33", pagamento: "R$ 0,00" },
                { parcela: 1, vencimento: "21/10/2025", saldo: "R$ 4.712,17", amortizacao: "R$ 49,03", juros: "R$ 240,97", pagamento: "R$ 290,00" },
                { parcela: 2, vencimento: "21/11/2025", saldo: "R$ 4.660,65", amortizacao: "R$ 51,52", juros: "R$ 238,48", pagamento: "R$ 290,00" },
                { parcela: 3, vencimento: "21/12/2025", saldo: "R$ 4.606,53", amortizacao: "R$ 54,12", juros: "R$ 235,88", pagamento: "R$ 290,00" },
              ].map((row, index) => (
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
                <td className="px-4 py-3 font-mono text-primary">R$ 10.440,00</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

const Documentos = () => (
  <div className="space-y-8">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5" />
          Documentos da Operação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
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
              {[
                {
                  nome: "FotoRG_3e5eb5bc-ab55-4896-a93c-9dc4ec1b5f79.pdf",
                  tipo: "Documento de Identificação com Foto",
                  signatarios: "Tiago Silva Oliveira",
                  data: "30/07/2025, 15:36:21",
                  status: "Concluído",
                },
                {
                  nome: "AssinaturaDigital_eafca2c7-eb22-4c61-8ea1-65907f8ebcc4.png",
                  tipo: "Documento",
                  signatarios: "Tiago Silva Oliveira",
                  data: "30/07/2025, 15:36:21",
                  status: "Concluído",
                },
                {
                  nome: "TermoConsentimento_2bdd6ed5-b530-46bb-8fde-3e906457ff19.pdf",
                  tipo: "Contrato Assinado",
                  signatarios: "Tiago Silva Oliveira",
                  data: "30/07/2025, 15:36:21",
                  status: "-",
                },
                {
                  nome: "Proposta_08cda6d9-a934-4068-be34-6e59ae1464a9.pdf",
                  tipo: "Contrato Assinado",
                  signatarios: "Tiago Silva Oliveira",
                  data: "30/07/2025, 15:36:21",
                  status: "-",
                },
                {
                  nome: "Voucher_790e5885-9b3e-4832-873c-d611acce90d3.pdf",
                  tipo: "Documento",
                  signatarios: "Tiago Silva Oliveira",
                  data: "30/07/2025, 15:36:21",
                  status: "Concluído",
                },
                {
                  nome: "FotoCliente_e946756e-0cb7-40ac-a60f-2189daae5111.png",
                  tipo: "Selfie",
                  signatarios: "Tiago Silva Oliveira",
                  data: "30/07/2025, 15:36:21",
                  status: "Concluído",
                },
                {
                  nome: "Contrato.pdf",
                  tipo: "Minuta",
                  signatarios: "Tiago Silva Oliveira",
                  data: "30/07/2025, 15:23:29",
                  status: "Concluído",
                },
              ].map((row, index) => (
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
          Linhas por página: 5 | 1–5 de 5
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5" />
          Documentos - Tiago Silva Oliveira
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Nenhum documento encontrado</p>
      </CardContent>
    </Card>
  </div>
);

const Assinaturas = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <PenTool className="w-5 h-5" />
        Status das Assinaturas
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
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
            {[
              {
                signatario: "Tiago Silva Oliveira",
                telefone: "(75) 99143-4902",
                email: "traquino.silva12@gmail.com",
                data: "30/07/2025, 19:07",
              },
            ].map((row, index) => (
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

const Historico = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <History className="w-5 h-5" />
        Andamento da Operação
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-6">
        {/* Summary Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: "Correspondente", value: "PH Negócios" },
            { label: "Operador", value: "PhNegociosAPI" },
            { label: "Grupo", value: "Admin" },
            { label: "Data da Última Atualização", value: "30/07/2025" },
            { label: "Última Atualização Feita Por", value: "PhNegociosAPI" },
          ].map((item, index) => (
            <div key={index} className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              <p className="text-lg font-medium">{item.value}</p>
            </div>
          ))}
        </div>
        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-3 top-0 w-0.5 h-full bg-border" />
          {[
            {
              event: "Rascunho",
              description: "Registro criado",
              iniciado: "30/07/2025 - 15:23:20 por PhNegociosAPI",
              finalizado: "30/07/2025 - 15:23:22 por PhNegociosAPI",
              status: "completed",
            },
            {
              event: "Aprovação de Compliance",
              description: "Aprovado pelo sistema. Esteira de compliance executada com sucesso.",
              iniciado: "30/07/2025 - 15:23:22 por Sistema",
              finalizado: "30/07/2025 - 15:23:22 por Sistema",
              status: "completed",
            },
            {
              event: "Aprovação de Crédito",
              description: "Aprovado automaticamente pelo sistema: Crédito analisado pelo fundo cessionário",
              iniciado: "30/07/2025 - 15:23:23 por Sistema",
              finalizado: "30/07/2025 - 15:23:23 por Sistema",
              status: "completed",
            },
            {
              event: "Aprovação de Instrumento",
              description: "Aprovado automaticamente pelo sistema",
              iniciado: "30/07/2025 - 15:23:24 por Sistema",
              finalizado: "30/07/2025 - 15:23:25 por Sistema",
              status: "completed",
            },
            {
              event: "Assinatura",
              description: "Coleta de assinatura concluída com sucesso por TIAGO SILVA OLIVEIRA com score 95.",
              iniciado: "30/07/2025 - 15:23:29 por Sistema",
              finalizado: "30/07/2025 - 15:36:22 por Sistema",
              status: "completed",
            },
            {
              event: "Garantia Manual",
              description: "Aprovação da garantia não concluída por cancelamento manual.",
              iniciado: "30/07/2025 - 15:36:23 por Sistema",
              finalizado: "30/07/2025 - 15:42:52 por PhNegociosAPI",
              status: "failed",
            },
            {
              event: "Cancelada",
              description: "Operação cancelada manualmente: Cliente ja com emprestimo ativo !.",
              iniciado: "30/07/2025 - 15:42:53 por Sistema",
              finalizado: "30/07/2025 - 15:42:53 por Sistema",
              status: "failed",
            },
          ].map((item, index) => (
            <div key={index} className="relative flex items-start gap-4 mb-6">
              <div
                className={`absolute w-6 h-6 rounded-full flex items-center justify-center left-0 mt-1 ${
                  item.status === "completed" ? "bg-primary" : "bg-destructive"
                }`}
              >
                <CheckCircle className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="ml-10">
                <p className="text-lg font-semibold">{item.event}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <p className="text-sm text-muted-foreground mt-1">Iniciado: {item.iniciado}</p>
                <p className="text-sm text-muted-foreground">Finalizado: {item.finalizado}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

const sections = [
  { id: "informacoes", label: "Informações", component: Informacoes, icon: Info },
  { id: "operacao", label: "Operação", component: Operacao, icon: Calculator },
  { id: "documentos", label: "Documentos", component: Documentos, icon: FileText },
  { id: "assinaturas", label: "Assinaturas", component: Assinaturas, icon: PenTool },
  { id: "historico", label: "Histórico", component: Historico, icon: History },
];

export default function OperacoesDrawer({ isOpen, onClose, Proposta }: PropostaDrawerProps) {
  const [formData, setFormData] = useState<Proposta | null>(null);
  const [activeSection, setActiveSection] = useState<string>("informacoes");
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Mock data for demonstration
  const mockProposta: Proposta = {
    id: "OP-2025-001",
    Correspondente: "PH Negócios",
    Operação: "Crédito Pessoal",
    Produto: "Empréstimo",
    Tomador: "Tiago Silva Oliveira",
    CPF: "123.456.789-00",
    Valor: "R$ 3.702,74",
    Data: "30/07/2025",
    status: 2,
    roteiro: "Análise",
    Tabela: "Tabela A",
  };

  useEffect(() => {
    if (isOpen) {
      setFormData(Proposta || mockProposta);
      setActiveSection("informacoes"); // Reset to first section when drawer opens
    } else {
      setActiveSection("informacoes"); // Reset when drawer closes
      setProgress(0);
    }
  }, [Proposta, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const observerOptions = {
      root: containerRef.current,
      rootMargin: "-50% 0px -50% 0px", // Trigger when section is near the center of the viewport
      threshold: [0, 0.1, 0.5, 0.9, 1], // Multiple thresholds for smoother transitions
    };

    const observer = new IntersectionObserver(
      (entries) => {
        let topmostSection: string | null = null;
        let minTop = Infinity;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rect = entry.target.getBoundingClientRect();
            const topPosition = rect.top;

            // Select the section closest to the top of the container
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
  }, [isOpen, activeSection]);

  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element && containerRef.current) {
      const container = containerRef.current;
      const offset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const containerPosition = container.getBoundingClientRect().top;
      const offsetPosition = elementPosition - containerPosition + container.scrollTop - offset;

      container.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Update active section immediately on click
      setActiveSection(sectionId);
      const sectionIndex = sections.findIndex((s) => s.id === sectionId);
      const newProgress = ((sectionIndex + 1) / sections.length) * 100;
      setProgress(newProgress);
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-background z-50">
      <div className="h-full flex max-w-7xl mx-auto bg-background shadow-lg">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-2xl font-bold">Detalhes da Operação</h2>
              <p className="text-muted-foreground mt-1">ID: {formData.id}</p>
            </div>
            <Button onClick={onClose} variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              Fechar
            </Button>
          </div>
          {/* Process Stepper */}
          <div className="px-6 py-6">
            <ProcessStepper />
          </div>
          {/* Content */}
          <div ref={containerRef} className="flex-1 overflow-y-auto px-8 pb-16" style={{ scrollBehavior: "smooth" }}>
            <div className="space-y-20 py-10">
              {sections.map((section) => (
                /* @ts-ignore */
                <section key={section.id} ref={(el) => (sectionRefs.current[section.id] = el)} id={section.id} className="scroll-mt-28">
                  <div className="flex items-center gap-3 mb-6 pb-3 border-b">
                    <section.icon className="w-6 h-6" />
                    <h3 className="text-2xl font-bold">{section.label}</h3>
                  </div>
                  <div className="space-y-8">
                    <section.component proposta={formData} />
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
        {/* Timeline Navigation */}
        <div className="w-80 border-l">
          <div className="sticky top-0 p-8">
            {/* Progress Header */}
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
            {/* Navigation */}
            <nav className="space-y-3">
              {sections.map((section, index) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                const isCompleted = sections.findIndex((s) => s.id === activeSection) > index;
                return (
                  <div key={section.id} className="relative">
                    {index !== sections.length - 1 && (
                      <div
                        className={`absolute left-6 top-14 w-0.5 h-10 transition-all duration-300 ${
                          isCompleted || isActive ? "bg-primary" : "bg-border"
                        }`}
                      />
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
            {/* Action Buttons */}
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