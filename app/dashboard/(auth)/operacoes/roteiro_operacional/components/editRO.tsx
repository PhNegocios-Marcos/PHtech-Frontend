"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { X } from "lucide-react";

const roteiroSchema = z.object({
  rotina_operacional_hash: z.string(),
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  idade_minima: z.coerce.number().min(1, "Idade mínima é obrigatória"),
  idade_maxima: z.coerce.number().min(1, "Idade máxima é obrigatória"),
  prazo_maximo: z.coerce.number().min(1, "Prazo máximo é obrigatória"),
  valor_bruto_minimo: z.coerce.number().min(0.01, "Valor bruto mínimo é obrigatório"),
  valor_bruto_maximo: z.coerce.number().min(1.0, "Valor bruto máximo é obrigatório"),
  taxa_minima: z.coerce.number().min(0.01, "Taxa mínima é obrigatória"),
  taxa_maxima: z.coerce.number().min(0.01, "Taxa máxima é obrigatória"),
  usa_margem_seguranca: z.enum(["0", "1"]),
  valor_margem_seguranca: z.coerce.number().optional(),
  usa_limite_proposta: z.enum(["0", "1"]),
  valor_limite_proposta: z.coerce.number().optional(),
  quantidade_propostas_ativas: z.coerce.number().min(1, "Quantidade é obrigatória"),
  dia_corte_competencia: z.coerce.number().min(1, "Dia de corte da competência é obrigatório"),
  validade_ccb: z.coerce.number().min(1, "Validade CCB é obrigatória"),
  dia_recebimento: z.coerce.number().min(1, "Dia de recebimento é obrigatório"),
  dia_corte_folha_pagamento: z.coerce.number().min(1, "Dia de corte da folha é obrigatório"),
  status: z.enum(["0", "1"]),
  tarifa_cadastro_minima: z.coerce.number().min(0.01, "Tarifa cadastro mínima é obrigatória"),
  tarifa_cadastro_maxima: z.coerce.number().min(0.01, "Tarifa cadastro máxima é obrigatória")
});

export type Roteiro = z.infer<typeof roteiroSchema>;

export type RoteiroDrawerProps = {
  roteiro: Roteiro;
  onClose: () => void;
  onRefresh: () => void;
};

type FormFieldConfig = {
  name: keyof Roteiro;
  label: string;
  placeholder?: string;
  type?: "text" | "number";
  component?: "input" | "select";
  options?: Array<{ value: string; label: string }>;
  showInputOnTrue?: {
    fieldName: keyof Roteiro;
    label: string;
    placeholder: string;
    type: string;
  };
};

export function ROEdit({ roteiro, onClose, onRefresh }: RoteiroDrawerProps) {
  const methods = useForm<Roteiro>({
    resolver: zodResolver(roteiroSchema),
    // No useForm do ROEdit, garanta a conversão:
    defaultValues: {
      ...roteiro,
      idade_minima: Number(roteiro.idade_minima),
      idade_maxima: Number(roteiro.idade_maxima),
      // repita para todos os campos numéricos
      usa_margem_seguranca: String(roteiro.usa_margem_seguranca) as "0" | "1",
      usa_limite_proposta: String(roteiro.usa_limite_proposta) as "0" | "1",
      status: String(roteiro.status) as "0" | "1"
    }
  });

  const router = useRouter();
  const { token } = useAuth();

  const formFields: FormFieldConfig[] = [
    { name: "nome", label: "Nome", placeholder: "Digite o nome do roteiro", type: "text" },
    { name: "descricao", label: "Descrição", placeholder: "Digite a descrição", type: "text" },
    { name: "idade_minima", label: "Idade Mínima", placeholder: "18", type: "number" },
    { name: "idade_maxima", label: "Idade Máxima", placeholder: "65", type: "number" },
    { name: "prazo_maximo", label: "Prazo Máximo (meses)", placeholder: "36", type: "number" },
    {
      name: "valor_bruto_minimo",
      label: "Valor Bruto Mínimo",
      placeholder: "500.00",
      type: "number"
    },
    {
      name: "valor_bruto_maximo",
      label: "Valor Bruto Máximo",
      placeholder: "15500.50",
      type: "number"
    },
    { name: "taxa_minima", label: "Taxa Mínima (% a.m.)", placeholder: "1.5", type: "number" },
    { name: "taxa_maxima", label: "Taxa Máxima (% a.m.)", placeholder: "5.0", type: "number" },
    {
      name: "tarifa_cadastro_minima",
      label: "Tarifa Cadastro Mínima",
      placeholder: "100.00",
      type: "number"
    },
    {
      name: "tarifa_cadastro_maxima",
      label: "Tarifa Cadastro Máxima",
      placeholder: "500.00",
      type: "number"
    },
    {
      name: "dia_corte_competencia",
      label: "Dia de Corte da Competência",
      placeholder: "1",
      type: "number"
    },
    { name: "dia_recebimento", label: "Dia de Recebimento", placeholder: "1", type: "number" },
    {
      name: "dia_corte_folha_pagamento",
      label: "Dia de Corte da Folha",
      placeholder: "1",
      type: "number"
    },
    {
      name: "validade_ccb",
      label: "Validade CCB",
      placeholder: "Dias que o CCB é válido",
      type: "number"
    },
    {
      name: "quantidade_propostas_ativas",
      label: "Quantidade de Propostas Ativas",
      placeholder: "0",
      type: "number"
    }
  ];

  const formFields2: FormFieldConfig[] = [
    {
      name: "usa_limite_proposta",
      label: "Usa Limite de Proposta",
      placeholder: "Selecione",
      component: "select",
      options: [
        { value: "0", label: "Não" },
        { value: "1", label: "Sim" }
      ],
      showInputOnTrue: {
        fieldName: "valor_limite_proposta",
        label: "Valor do Limite de Proposta",
        placeholder: "Digite o valor limite",
        type: "number"
      }
    },
    {
      name: "usa_margem_seguranca",
      label: "Usa Margem de Segurança",
      placeholder: "Selecione",
      component: "select",
      options: [
        { value: "0", label: "Não" },
        { value: "1", label: "Sim" }
      ],
      showInputOnTrue: {
        fieldName: "valor_margem_seguranca",
        label: "Valor da Margem de Segurança",
        placeholder: "Digite o valor da margem",
        type: "number"
      }
    },
    {
      name: "status",
      label: "Status",
      placeholder: "Selecione",
      component: "select",
      options: [
        { value: "0", label: "Inativo" },
        { value: "1", label: "Ativo" }
      ]
    }
  ];

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!token) {
        toast.error("Token de autenticação não encontrado", {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
        sessionStorage.clear();
        router.push("/dashboard/login");
      } else {
        // console.log("tem token");
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [token, router]);

  const onSubmit = async (data: Roteiro) => {
    console.log("Dados do formulário (ANTES do processamento):", data);

    if (!token) {
      toast.error("Token de autenticação não encontrado.");
      return;
    }

    // Apenas os campos que precisam ser enviados
    const payload = {
      rotina_operacional_hash: data.rotina_operacional_hash,
      nome: data.nome,
      descricao: data.descricao,
      idade_minima: Number(data.idade_minima),
      idade_maxima: Number(data.idade_maxima),
      prazo_maximo: Number(data.prazo_maximo),
      valor_bruto_minimo: Number(data.valor_bruto_minimo),
      valor_bruto_maximo: Number(data.valor_bruto_maximo),
      taxa_minima: Number(data.taxa_minima),
      taxa_maxima: Number(data.taxa_maxima),

      // CORREÇÃO: comparar com string
      usa_margem_seguranca: data.usa_margem_seguranca === "1" ? 1 : 0,

      // CORREÇÃO: comparar com string
      usa_limite_proposta: data.usa_limite_proposta === "1" ? 1 : 0,

      valor_limite_proposta:
        data.usa_limite_proposta === "1" ? Number(data.valor_limite_proposta) : undefined,
      valor_margem_seguranca:
        data.usa_margem_seguranca === "1" ? Number(data.valor_margem_seguranca) : undefined,
      quantidade_propostas_ativas: Number(data.quantidade_propostas_ativas),
      dia_corte_competencia: Number(data.dia_corte_competencia),
      validade_ccb: Number(data.validade_ccb),
      dia_recebimento: Number(data.dia_recebimento),
      dia_corte_folha_pagamento: Number(data.dia_corte_folha_pagamento),

      // CORREÇÃO: comparar com string
      status: data.status === "1" ? 1 : 0,

      tarifa_cadastro_minima: Number(data.tarifa_cadastro_minima),
      tarifa_cadastro_maxima: Number(data.tarifa_cadastro_maxima)
    }; // ← Fechamento correto do objeto

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/rotina-operacional/atualizar`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Roteiro atualizado com sucesso!");
      onClose();
      onRefresh();
    } catch (error: any) {
      console.error("Erro ao atualizar roteiro:", error.response?.data || error.message);
      toast.error(`Erro: ${error.response?.data?.detail || error.message}`);
    }
  };

  // Mude a função handleSelectChange para:
  const handleSelectChange = (fieldName: keyof Roteiro, value: string) => {
    methods.setValue(fieldName, value as any);
  };

  const renderFormField = (fieldConfig: FormFieldConfig) => {
    const {
      name,
      label,
      placeholder,
      type = "text",
      component = "input",
      options = [],
      showInputOnTrue
    } = fieldConfig;
    const fieldValue = methods.watch(name);

    return (
      <React.Fragment key={name}>
        <FormField
          control={methods.control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{label}</FormLabel>
              {component === "select" ? (
                <Select
                  onValueChange={(value) => handleSelectChange(name, value)}
                  value={field.value ? String(field.value) : ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <FormControl>
                  <Input
                    placeholder={placeholder}
                    type={type}
                    {...field}
                    value={field.value === undefined ? "" : field.value}
                    onChange={(e) => {
                      if (type === "number") {
                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value));
                      } else {
                        field.onChange(e.target.value);
                      }
                    }}
                  />
                </FormControl>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {showInputOnTrue && fieldValue === "1" && (
          <FormField
            control={methods.control}
            name={showInputOnTrue.fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{showInputOnTrue.label}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={showInputOnTrue.placeholder}
                    type="number"
                    value={field.value === undefined ? "" : field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value === "" ? undefined : Number(e.target.value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </React.Fragment>
    );
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="bg-background fixed top-0 right-0 z-50 h-full w-1/2 overflow-auto p-6 shadow-lg">
        <FormProvider {...methods}>
          <Form {...methods}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Roteiro Operacional: <span className="text-primary">{roteiro.nome}</span>
              </h2>
              <X onClick={onClose} className="cursor-pointer" />
            </div>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
              <Card className="col-span-2">
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <CardTitle></CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {formFields.map(renderFormField)}
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      {formFields2.map(renderFormField)}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={methods.formState.isSubmitting}>
                  {methods.formState.isSubmitting ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </aside>
    </>
  );
}
