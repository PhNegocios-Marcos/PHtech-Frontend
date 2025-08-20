"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DadosPessoais } from "./DadosPessoais";
import { Contato } from "./Contato";
import { Enderecos } from "./Enderecos";
import { DadosBancarios } from "./DadosBancarios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Produto } from "../../../cadastro/produto/components/ProdutoModal";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface CadastrarProps {
  cpf: string;
  simulacao: any;
  produto?: Produto;
  onCadastrado?: (cpf: string, simulacao: any) => void;
  onClienteExiste?: (cpf: string) => void;
  produtoId?: string;
}

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: { value: string; label: string }[];
}

interface FormSection {
  section: string;
  fields: FormField[];
}

interface TabRef {
  validate: () => Promise<boolean>;
}

export default function Cadastrar({
  cpf,
  simulacao,
  onCadastrado,
  produto,
  produtoId
}: CadastrarProps) {
  const { token } = useAuth();
  const [formSections, setFormSections] = useState<FormSection[] | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("DadosPessoais");
  const tabOrder = ["DadosPessoais", "Contato", "Enderecos", "DadosBancarios"];

  const dadosPessoaisRef = useRef<TabRef | null>(null);
  const telefonesRef = useRef<TabRef | null>(null);
  const enderecosRef = useRef<TabRef | null>(null);
  const bancariosRef = useRef<TabRef | null>(null);

  const tabRefs: Record<string, React.RefObject<TabRef | null>> = {
    DadosPessoais: dadosPessoaisRef,
    Contato: telefonesRef,
    Enderecos: enderecosRef,
    DadosBancarios: bancariosRef
  };

  const getFields = (sectionName: string): FormField[] => {
    if (!formSections) return [];
    const section = formSections.find((s) => s.section === sectionName);
    if (!section) return [];
    if (sectionName === "Enderecos") {
      return section.fields.map((field) => ({
        ...field,
        name: field.name.startsWith("enderecos.0.") ? field.name : `enderecos.0.${field.name}`
      }));
    }
    return section.fields;
  };

  const pixOptions = [
    { value: "1", label: "Chave CPF" },
    { value: "2", label: "Chave CNPJ" },
    { value: "3", label: "Chave E-mail" },
    { value: "4", label: "Chave Celular" }
  ];

  const [formData, setFormData] = useState({
    produtoId: produtoId || "",
    nome: "",
    nome_pai: "",
    nome_mae: "",
    tipo_documento: "1",
    numero_documento: "",
    cpf: cpf,
    sexo: "M",
    data_nascimento: "",
    estado_civil: "",
    naturalidade: "",
    nacionalidade: "Brasileira",
    telefones: {
      0: { ddd: "", numero: "" }
    },
    enderecos: {
      0: {
        cep: "",
        logradouro: "",
        numero: 0,
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        uf: ""
      }
    },
    emails: {
      0: {
        email: "",
        status: 1
      }
    },
    dados_bancarios: {
      0: {
        id_banco: "019611f9-3d2d-7200-9289-688323e474b5",
        agencia: "",
        conta: "",
        status: 1,
        tipo_pix: "",
        pix: ""
      }
    }
  });

  useEffect(() => {
    if (produtoId) {
      setFormData((prev) => ({
        ...prev,
        produtoId: produtoId
      }));
    }
  }, [produtoId]);

  useEffect(() => {
    const fetchDefaultSections = async () => {
      try {
        if (!produtoId) {
          setFormSections([]);
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/produto-config-campos-cadastro/listar`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { produto_hash: produtoId }
        });

        const sectionsData: FormSection[] = Object.keys(response.data).map((sectionName) => ({
          section: sectionName,
          fields: response.data[sectionName].map((item: any) => item.fields)
        }));

        const validSections = sectionsData.filter((section) => tabOrder.includes(section.section));
        setFormSections(validSections);
      } catch (error) {
        console.error("Erro ao buscar seções:", error);
        setFormSections([]);
        toast.error("Erro ao carregar configurações do formulário", {
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

    fetchDefaultSections();
  }, [token, produtoId]);

  const handleChange = (path: string, value: any) => {
    const keys = path.split(".");
    setFormData((prev) => {
      const updated = structuredClone(prev);
      let obj: any = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!obj[key]) {
          obj[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
        }
        obj = obj[key];
      }

      // Só atualiza se o valor for diferente
      if (obj[keys[keys.length - 1]] !== value) {
        obj[keys[keys.length - 1]] = value;
        return updated;
      }

      return prev; // Retorna o estado anterior se não houver alteração
    });
  };

  const handleNext = async () => {
    const ref = tabRefs[activeTab];
    if (ref?.current?.validate) {
      const isValid = await ref.current.validate();
      if (!isValid) {
        toast.warning("Preencha todos os campos obrigatórios antes de continuar", {
          style: {
            background: "var(--toast-warning)",
            color: "var(--toast-warning-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
        return;
      }
    }
    const currentIndex = tabOrder.indexOf(activeTab);
    const nextTab = tabOrder[currentIndex + 1];
    if (nextTab) {
      setActiveTab(nextTab);
    }
  };

  const sanitizeFormData = (data: any): any => {
    const clone = structuredClone(data);

    const limparCampos = [
      "cpf",
      "numero_documento",
      "telefones.0.ddd",
      "telefones.0.numero",
      "telefones.1.ddd",
      "telefones.1.numero",
      "enderecos.0.cep"
    ];

    limparCampos.forEach((path) => {
      const keys = path.split(".");
      let obj = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj?.[keys[i]];
        if (!obj) return;
      }
      const lastKey = keys[keys.length - 1];
      if (obj && typeof obj[lastKey] === "string") {
        obj[lastKey] = obj[lastKey].replace(/[.\-]/g, "");
      }
    });

    return clone;
  };

  const handleSubmit = async () => {
    for (const tab of tabOrder) {
      const ref = tabRefs[tab];
      if (ref?.current?.validate) {
        const valid = await ref.current.validate();
        if (!valid) {
          setActiveTab(tab);
          toast.warning("Preencha todos os campos obrigatórios", {
            style: {
              background: "var(--toast-warning)",
              color: "var(--toast-warning-foreground)",
              boxShadow: "var(--toast-shadow)"
            }
          });
          return;
        }
      }
    }

    try {
      const sanitizedData = sanitizeFormData(formData);

      const response = await axios.post(`${API_BASE_URL}/cliente`, sanitizedData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        toast.success("Cliente cadastrado com sucesso!", {
          style: {
            background: "var(--toast-success)",
            color: "var(--toast-success-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
        if (onCadastrado) {
          onCadastrado(formData.cpf, simulacao);
        }
      }
    } catch (err: any) {
      console.error("Erro ao cadastrar cliente:", err);
      toast.error(`Erro ao cadastrar cliente: ${err.response?.data?.message || err.message}`, {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    }
  };

  if (loading) {
    return <div>Carregando formulário...</div>;
  }

  const bancariosFields = getFields("DadosBancarios").map((f) =>
    f.name === "dados_bancarios.0.tipo_pix" ? { ...f, options: pixOptions } : f
  );

  return (
    <div>
      <Card className="mx-auto mt-10 max-w-6xl space-y-6 p-6">
        <h1 className="mb-4 text-2xl font-bold">Cadastro de Cliente</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="DadosPessoais">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="Contato">Contato</TabsTrigger>
            <TabsTrigger value="Enderecos">Endereços</TabsTrigger>
            <TabsTrigger value="DadosBancarios">Dados Bancários</TabsTrigger>
          </TabsList>

          <TabsContent value="DadosPessoais">
            <DadosPessoais
              ref={dadosPessoaisRef}
              formData={formData}
              onChange={handleChange}
              fields={getFields("DadosPessoais")}
            />
          </TabsContent>
          <TabsContent value="Contato">
            <Contato
              ref={telefonesRef}
              formData={formData}
              onChange={handleChange}
              fields={getFields("Contato")}
            />
          </TabsContent>
          <TabsContent value="Enderecos">
            <Enderecos
              ref={enderecosRef}
              formData={formData}
              onChange={handleChange}
              fields={getFields("Enderecos")}
            />
          </TabsContent>
          <TabsContent value="DadosBancarios">
            <DadosBancarios
              ref={bancariosRef}
              formData={formData}
              onChange={handleChange}
              fields={bancariosFields}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          {activeTab === tabOrder[tabOrder.length - 1] ? (
            <Button onClick={handleSubmit}>Cadastrar</Button>
          ) : (
            <Button onClick={handleNext}>Próximo</Button>
          )}
        </div>
      </Card>
    </div>
  );
}
