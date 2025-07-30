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
const Informacoes = ({ Proposta }: { Proposta: Proposta | null }) => (
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
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">ID da Proposta</p>
            <p className="text-lg font-mono bg-muted px-3 py-2 rounded">{Proposta?.id}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Correspondente</p>
            <p className="text-lg">{Proposta?.Correspondente}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Tomador</p>
            <p className="text-lg font-medium">{Proposta?.Tomador}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">CPF</p>
            <p className="text-lg font-mono">{Proposta?.CPF}</p>
          </div>
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
                  <td className="px-4 py-Â3 font-mono">{row.amortizacao}</td>
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
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <FileText className="w-5 h-5" />
        Documentos Necessários
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[
          { doc: "RG", status: "completed", date: "20/07/2025" },
          { doc: "Comprovante de Residência", status: "completed", date: "21/07/2025" },
          { doc: "Contrato", status: "pending", date: null },
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-muted">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${item.status === "completed" ? "bg-primary" : "bg-secondary"}`} />
              <span className="font-medium">{item.doc}</span>
            </div>
            <Badge variant={item.status === "completed" ? "default" : "secondary"}>
              {item.status === "completed" ? `Enviado em ${item.date}` : "Pendente"}
            </Badge>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
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
      <div className="space-y-4">
        {[
          { party: "Assinatura Tomador", status: "pending" },
          { party: "Assinatura Avalista", status: "completed", date: "22/07/2025" },
        ].map((item, index) => (
          <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-muted">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${item.status === "completed" ? "bg-primary" : "bg-secondary"}`} />
              <span className="font-medium">{item.party}</span>
            </div>
            <Badge variant={item.status === "completed" ? "default" : "secondary"}>
              {item.status === "completed" ? `Assinado em ${item.date}` : "Pendente"}
            </Badge>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const Historico = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <History className="w-5 h-5" />
        Histórico da Operação
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {[
          { date: "25/07/2025", event: "Proposta criada", status: "completed" },
          { date: "26/07/2025", event: "Documentos enviados", status: "completed" },
          { date: "27/07/2025", event: "Análise de crédito iniciada", status: "current" },
        ].map((item, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className={`w-3 h-3 rounded-full mt-1 ${item.status === "completed" ? "bg-primary" : "bg-secondary"}`} />
            <div>
              <p className="font-medium">{item.event}</p>
              <p className="text-sm text-muted-foreground">{item.date}</p>
            </div>
          </div>
        ))}
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
    Correspondente: "Banco XYZ",
    Operação: "Crédito Pessoal",
    Produto: "Empréstimo",
    Tomador: "João Silva Santos",
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
                    <section.component Proposta={formData} />
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