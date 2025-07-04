"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DadosPessoais } from "./DadosPessoais";
import { Telefones } from "./Contato";
import { Enderecos } from "./Enderecos";
import { DadosBancarios } from "./DadosBancarios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { error } from "console";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Cadastrar({ cpf }: { cpf: string }) {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState("DadosPessoais");
  const tabOrder = ["DadosPessoais", "Contato", "Enderecos", "DadosBancarios"];

  // Refs para cada aba
  const dadosPessoaisRef = useRef<{ validate: () => Promise<boolean> }>(null);
  const telefonesRef = useRef<{ validate: () => Promise<boolean> }>(null);
  const enderecosRef = useRef<{ validate: () => Promise<boolean> }>(null);
  const bancariosRef = useRef<{ validate: () => Promise<boolean> }>(null);

  const tabRefs: Record<string, React.RefObject<any>> = {
    DadosPessoais: dadosPessoaisRef,
    Contato: telefonesRef,
    Enderecos: enderecosRef,
    DadosBancarios: bancariosRef
  };

  const [formData, setFormData] = useState({
    nome: "",
    nome_pai: "",
    tipo_documento: "1",
    numero_documento: "",
    cpf: cpf,
    sexo: "M",
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
    dados_bancarios: [
      {
        id_banco: "019611f9-3d2d-7200-9289-688323e474b5",
        agencia: "",
        conta: "",
        status: 1
      }
    ]
  });

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
      if (!isValid) return; // bloqueia avanço se inválido
    }

    const currentIndex = tabOrder.indexOf(activeTab);
    const nextTab = tabOrder[currentIndex + 1];
    if (nextTab) {
      setActiveTab(nextTab);
    }
  };

  const handleSubmit = async () => {
    // opcional: validar todas as abas antes de enviar
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
      const res = await fetch(`${API_BASE_URL}/cliente`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      console.log(formData)

      if (res.ok) {
        alert("Cliente cadastrado com sucesso!");
      } else {
        alert("Erro ao cadastrar cliente.");
      }
    } catch (err) {
      console.error("Erro:", err);
      alert("Erro inesperado.");
    }

  };

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
            <DadosPessoais ref={dadosPessoaisRef} formData={formData} onChange={handleChange} />
          </TabsContent>
          <TabsContent value="Contato">
            <Telefones ref={telefonesRef} formData={formData} onChange={handleChange} />
          </TabsContent>
          <TabsContent value="Enderecos">
            <Enderecos ref={enderecosRef} formData={formData} onChange={handleChange} />
          </TabsContent>
          <TabsContent value="DadosBancarios">
            <DadosBancarios ref={bancariosRef} formData={formData} onChange={handleChange} />
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
