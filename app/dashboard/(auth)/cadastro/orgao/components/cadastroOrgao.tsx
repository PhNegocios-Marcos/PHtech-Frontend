"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Combobox } from "./Combobox";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Convenio {
  convenio_hash: string;
  convenio_nome: string;
}

const schema = z.object({
  orgao_nome: z.string().min(1, "Nome do órgão é obrigatório"),
  convenio_hash: z.string().uuid("Hash inválido"),
  orgao_data_corte: z.string().min(1, "orgao Data Corte é obrigatório")
});

type FormData = z.infer<typeof schema>;

type CadastroProdutoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CadastroOrgao({ isOpen, onClose }: CadastroProdutoModalProps) {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      orgao_nome: "",
      convenio_hash: "",
      orgao_data_corte: ""
    }
  });

  const { token } = useAuth();
  const router = useRouter();
  const [convenios, setConvenios] = useState<Convenio[]>([]);

  useEffect(() => {
    if (!token || !isOpen) return;

    fetch(`${API_BASE_URL}/convenio`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((err) => {
            throw new Error(JSON.stringify(err));
          });
        }
        return res.json();
      })
      .then((data: any[]) => {
        const conveniosFormatados: Convenio[] = data.map((item) => ({
          convenio_hash: item.convenio_hash,
          convenio_nome: item.convenio_nome
        }));
        setConvenios(conveniosFormatados);
      })
      .catch((error) => {
        console.error("Erro ao listar convênios:", error);
        alert("Erro ao listar convênios: " + error);
      });
  }, [token, isOpen]);

  const onSubmit = async (data: FormData) => {
    if (!token) {
      alert("Token não encontrado. Faça login.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/orgaos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(JSON.stringify(err));
      }

      alert("Órgão cadastrado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar órgão:", error);
      alert("Erro ao cadastrar órgão: " + error);
    }
  };

  if (!isOpen) return null;

  // Função para pegar o nome do convênio pelo hash selecionado
  const getConvenioNome = (hash: string) => {
    const conv = convenios.find((c) => c.convenio_hash === hash);
    return conv ? conv.convenio_nome : "";
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 h-full w-1/2 overflow-auto bg-white p-6 shadow-lg">
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cadastrar Novo Órgão</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-2xl font-bold hover:text-gray-900"
                  aria-label="Fechar">
                  ×
                </button>
              </div>

              <Card className="flex-grow overflow-auto">
                <CardHeader>
                  <CardTitle>Dados do Órgão</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={methods.control}
                      name="orgao_nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Órgão</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o nome do órgão" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="convenio_hash"
                      render={({ field }) => {
                        // encontra o objeto convenio pelo hash armazenado no form
                        const selectedOption =
                          convenios
                            .map((c) => ({ label: c.convenio_nome, value: c.convenio_hash }))
                            .find((opt) => opt.value === field.value) || null;

                        return (
                          <FormItem>
                            <FormLabel>Convênio</FormLabel>
                            <FormControl>
                              <Combobox
                                data={convenios.map((c) => ({
                                  label: c.convenio_nome,
                                  value: c.convenio_hash
                                }))}
                                displayField="label"
                                value={selectedOption}
                                onChange={(option) => {
                                  field.onChange(option.value); // só passa o hash para o form
                                }}
                                placeholder="Selecione o convênio"
                                searchFields={["label"]}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                    <FormField
                      control={methods.control}
                      name="orgao_data_corte"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Órgão data corte</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o orgao data corte" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">Cadastrar</Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </aside>
    </>
  );
}
