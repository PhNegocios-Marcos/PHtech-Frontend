"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Combobox } from "./Combobox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Produto } from "./produtos";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const schema = z.object({
  nome_taxa: z.string().min(1, "Nome da tabela é obrigatório"),
  prazo_minimo: z.string().min(1, "Prazo mínimo é obrigatório"),
  prazo_maximo: z.string().min(1, "Prazo máximo é obrigatório"),
  taxa_mensal: z.string().min(1, "Taxa mensal é obrigatório"),
  incrementador: z.string().min(1, "Incrementador é obrigatório"),
  periodiciade: z.string().min(1, "Periodicidade é obrigatória")
});

type FormData = z.infer<typeof schema>;

type CadastroTabelaModalProps = {
  produto: Produto;
  isOpen: boolean;
  onClose: () => void;
};

type Option = {
  id?: string;
  nome: string;
  hash?: string;
};

export type Taxa = {
  taxa_prazo_hash: string;
  taxa_nome: string;
  status: number;
  prazo_minimo: number;
  taxa_mensal: number;
  prazo_maximo: number;
  id_uy3: string | null;
  cor_grafico: string | null;
  prefixo: string | null;
  vigencia_inicio: string;
  vigencia_prazo: string;
  tipo_operacao_nome: string;
};

const formFields = [
  {
    name: "nome_taxa",
    label: "Nome Tabela",
    type: "input",
    placeholder: "Digite o nome"
  },
  {
    name: "prazo_minimo",
    label: "Prazo mínimo",
    type: "input",
    placeholder: "12"
  },
  {
    name: "prazo_maximo",
    label: "Prazo máximo",
    type: "input",
    placeholder: "64"
  },
  {
    name: "taxa_mensal",
    label: "Taxa mensal",
    type: "input",
    placeholder: "1.6"
  },
  {
    name: "incrementador",
    label: "Incrementador",
    type: "combobox",
    options: [{ id: "PERSONALIZADO", name: "PERSONALIZADO" }]
  },
  {
    name: "periodiciade",
    label: "Periodicidade",
    type: "input",
    placeholder: "12"
  }
];

export default function CadastroTabelaModal({ isOpen, onClose, produto }: CadastroTabelaModalProps) {
  const [idProduto, setIdProduto] = useState<any>(null);
  const { token, userData } = useAuth();

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome_taxa: "",
      prazo_minimo: "",
      prazo_maximo: "",
      taxa_mensal: "",
      incrementador: "",
      periodiciade: ""
    }
  });

  const dateForm = useForm({
    defaultValues: {
      inicio: undefined,
      fim: undefined
    }
  });
  const { inicio, fim } = dateForm.getValues();

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error("Token não encontrado. Faça login.", {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      return;
    }

    const payload = {
      relacionamento_produto: idProduto?.rel_produto_subproduto_convenio_convenio_id,
      nome_tabela: data.nome_taxa,
      prazo_minimo: data.prazo_minimo,
      prazo_maximo: data.prazo_maximo,
      taxa_mensal: data.taxa_mensal,
      relacionamento_produto_hash: produto?.id,
      usuario_criacao_hash: (userData as any)?.id ?? "id_user",
      incrementador: data.incrementador,
      periodicidade: data.periodiciade,
      vigencia_inicio: format(inicio ?? new Date(), "yyyy-MM-dd"),
      vigencia_fim: format(fim ?? new Date(), "yyyy-MM-dd")
    };

    try {
      const response = await fetch(`${API_BASE_URL}/produtos-config-tabelas/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(JSON.stringify(err));
      }

      toast.success("Tabela cadastrada com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });

      methods.reset();
      onClose();
    } catch (error: any) {
      console.error("Erro ao cadastrar usuário:", error);
      toast.error("Erro ao cadastrar usuário: " + (error.message || error), {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 h-full w-2/2 overflow-auto bg-background p-6 shadow-lg md:w-1/2">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Cadastrar Nova Tabela</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-2xl font-bold hover:text-gray-900"
                aria-label="Fechar">
                ×
              </button>
            </div>

            <Card className="mt-5 flex-grow overflow-auto">
              <h5 className="mx-5 text-xl font-semibold">Tabela Taxa</h5>
              <CardContent>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {formFields.map((field) => (
                    <FormField
                      key={field.name}
                      control={methods.control}
                      name={field.name as keyof FormData}
                      render={({ field: renderField }) => (
                        <FormItem>
                          <FormLabel>{field.label}</FormLabel>
                          <FormControl>
                            {field.type === "input" ? (
                              <Input placeholder={field.placeholder} {...renderField} />
                            ) : field.type === "combobox" ? (
                              <Combobox
                                data={field.options || []}
                                displayField="name"
                                value={field.options?.find((opt) => opt.id === renderField.value) ?? null}
                                onChange={(selected) => renderField.onChange(selected?.id ?? "")}
                                searchFields={["name"]}
                              />
                            ) : null}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  <div>
                    <FormProvider {...dateForm}>
                      <Form {...dateForm}>
                        <div className="space-y-8">
                          <FormField
                            control={dateForm.control}
                            name="inicio"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Inicio da vigência</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}>
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Selecione data</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) => date < new Date()}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </Form>
                    </FormProvider>
                  </div>
                  <div>
                    <FormProvider {...dateForm}>
                      <Form {...dateForm}>
                        <div className="space-y-8">
                          <FormField
                            control={dateForm.control}
                            name="fim"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Fim da vigência</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}>
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Selecione data</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) => date < new Date()}
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </Form>
                    </FormProvider>
                  </div>
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
        </FormProvider>
      </aside>
    </>
  );
}
