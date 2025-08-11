"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DadosPessoais } from "./DadosPessoais";
import { Telefones } from "./Contato";
import { Enderecos } from "./Enderecos";
import { DadosBancarios } from "./DadosBancarios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Produto } from "../../../cadastro/produto/components/ProdutoModal";

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

  const dadosPessoaisRef = useRef<{ validate: () => Promise<boolean> }>(null);
  const telefonesRef = useRef<{ validate: () => Promise<boolean> }>(null);
  const enderecosRef = useRef<{ validate: () => Promise<boolean> }>(null);
  const bancariosRef = useRef<{ validate: () => Promise<boolean> }>(null);

  const getFields = (sectionName: string) => {
    if (!formSections) return []; // Isso cobre o caso de formSections ser null
    return formSections.find((s) => s.section === sectionName)?.fields || [];
  };

  const tabRefs: Record<string, React.RefObject<any>> = {
    DadosPessoais: dadosPessoaisRef,
    Contato: telefonesRef,
    Enderecos: enderecosRef,
    DadosBancarios: bancariosRef
  };

  // Estado inicial do formulário
  const [formData, setFormData] = useState({
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
      0: { ddd: "", numero: "" },
      1: { ddd: "", numero: "" }
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

  console.log("protudoId: ", produtoId);

  // 2. Alternativa com seções pré-definidas (se não puder listar dinamicamente)
  useEffect(() => {
    const fetchDefaultSections = async () => {
      try {
        if (!produtoId) {
          setFormSections([]);
          setLoading(false);
          return;
        }

        // Lista de seções que podem existir
        const possibleSections = ["DadosPessoais", "Contato", "Enderecos", "DadosBancarios"];

        // Busca apenas as seções que existem para este produto
        const sectionsData = await Promise.all(
          possibleSections.map(async (sectionName) => {
            try {
              const response = await axios.get(
                `${API_BASE_URL}/produto-config-campos-cadastro/listar`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                  params: { produto_hash: produtoId, section: sectionName }
                }
              );
              return {
                section: sectionName,
                fields: response.data.fields
              };
            } catch {
              // Se a seção não existir, retorna null (será filtrado depois)
              return null;
            }
          })
        );

        // Filtra seções não encontradas
        setFormSections(sectionsData.filter(Boolean) as FormSection[]);
      } catch (error) {
        console.error("Erro ao buscar seções:", error);
        setFormSections([]);
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
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleNext = async () => {
    const ref = tabRefs[activeTab];
    if (ref?.current?.validate) {
      const isValid = await ref.current.validate();
      if (!isValid) return;
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
          return alert("Preencha os campos obrigatórios.");
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
        alert("Cliente cadastrado com sucesso!");
        if (onCadastrado) {
          onCadastrado(formData.cpf, simulacao);
        }
      }
    } catch (err) {
      console.error("Erro ao cadastrar cliente:", err);
      alert("Erro inesperado.");
    }
  };

  if (loading) {
    return <div>Carregando formulário...</div>;
  }

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
            <Telefones
              ref={telefonesRef}
              formData={formData}
              onChange={handleChange}
              fields={getFields("DadosPessoais")}
            />
          </TabsContent>
          <TabsContent value="Enderecos">
            <Enderecos
              ref={enderecosRef}
              formData={formData}
              onChange={handleChange}
              fields={getFields("DadosPessoais")}
            />
          </TabsContent>
          <TabsContent value="DadosBancarios">
            <DadosBancarios
              ref={bancariosRef}
              formData={formData}
              onChange={handleChange}
              fields={getFields("DadosPessoais")}
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
