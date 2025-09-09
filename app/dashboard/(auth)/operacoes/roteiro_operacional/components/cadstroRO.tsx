"use client";

import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const createSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  idade_minima: z.coerce.number().min(1, "Idade mínima é obrigatória"),
  idade_maxima: z.coerce.number().min(1, "Idade máxima é obrigatória"),
  prazo_minimo: z.coerce.number().min(1, "Prazo mínimo é obrigatório"),
  prazo_maximo: z.coerce.number().min(1, "Prazo máximo é obrigatória"),
  valor_bruto_minimo: z.coerce
    .number()
    .min(0.01, "Valor bruto mínimo é obrigatório"),
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

export type CreateFormData = z.infer<typeof createSchema>;

type CadastroRoteiroModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type FormFieldConfig = {
  name: keyof CreateFormData;
  label: string;
  placeholder: string;
  type?: "text" | "number";
  component?: "input" | "select";
  options?: { value: string; label: string }[];
  showInputOnTrue?: {
    fieldName: keyof CreateFormData;
    label: string;
    placeholder: string;
    type?: "text" | "number";
  };
};

export default function CadastroRoteiroModal({
  isOpen,
  onClose,
  onSuccess
}: CadastroRoteiroModalProps) {
  const { token, userData } = useAuth();
  const router = useRouter();

  const methods = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      idade_minima: undefined,
      idade_maxima: undefined,
      prazo_minimo: undefined,
      prazo_maximo: undefined,
      valor_bruto_minimo: undefined,
      valor_bruto_maximo: undefined,
      taxa_minima: undefined,
      taxa_maxima: undefined,
      validade_ccb: undefined,
      usa_margem_seguranca: "0",
      valor_margem_seguranca: undefined,
      usa_limite_proposta: "0",
      valor_limite_proposta: undefined,
      quantidade_propostas_ativas: undefined,
      dia_corte_competencia: undefined,
      dia_recebimento: undefined,
      dia_corte_folha_pagamento: undefined,
      status: "1",
      tarifa_cadastro_minima: undefined,
      tarifa_cadastro_maxima: undefined
    }
  });

  const formFields: FormFieldConfig[] = [
    { name: "nome", label: "Nome", placeholder: "Digite o nome do roteiro", type: "text" },
    { name: "descricao", label: "Descrição", placeholder: "Digite a descrição", type: "text" },
    { name: "idade_minima", label: "Idade Mínima", placeholder: "18", type: "number" },
    { name: "idade_maxima", label: "Idade Máxima", placeholder: "65", type: "number" },
    { name: "prazo_minimo", label: "Prazo Mínimo (meses)", placeholder: "6", type: "number" },
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
      if (token == null) {
        router.push("/dashboard/login");
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [token, router]);

  const onSubmit = async (data: CreateFormData) => {
    console.log("Dados do formulário:", data);
    
    if (!token) {
      toast.error("Token de autenticação não encontrado.");
      return;
    }

    try {
      const payload = {
        nome: data.nome,
        descricao: data.descricao,
        idade_minima: Number(data.idade_minima),
        idade_maxima: Number(data.idade_maxima),
        prazo_minimo: Number(data.prazo_minimo),
        prazo_maximo: Number(data.prazo_maximo),
        valor_bruto_minimo: Number(data.valor_bruto_minimo),
        valor_bruto_maximo: Number(data.valor_bruto_maximo),
        taxa_minima: Number(data.taxa_minima),
        taxa_maxima: Number(data.taxa_maxima),
        validade_ccb: Number(data.validade_ccb),
        usa_margem_seguranca: data.usa_margem_seguranca === "1" ? 1 : 0,
        margem_seguranca: data.usa_margem_seguranca === "1" ? Number(data.valor_margem_seguranca) || 0 : 0,
        usa_limite_propostas: data.usa_limite_proposta === "1" ? 1 : 0,
        valor_limite_proposta: data.usa_limite_proposta === "1" ? Number(data.valor_limite_proposta) || 0 : 0,
        limite_propostas_ativas: Number(data.quantidade_propostas_ativas),
        dia_corte_competencia: Number(data.dia_corte_competencia),
        dia_recebimento: Number(data.dia_recebimento),
        dia_corte_folha_pagamento: Number(data.dia_corte_folha_pagamento),
        tarifa_cadastro_minima: Number(data.tarifa_cadastro_minima),
        tarifa_cadastro_maxima: Number(data.tarifa_cadastro_maxima),
        status: parseInt(data.status),
        usuario_criacao: userData?.id
      };

      console.log("Payload enviado:", payload);

      const response = await axios.post(`${API_BASE_URL}/rotina-operacional/criar`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200 || response.status === 201) {
        methods.reset();
        toast.success("Roteiro cadastrado com sucesso!");
        onClose();
        if (onSuccess) onSuccess();
      } else {
        console.error("Erro na resposta da API:", response.data);
        toast.error("Erro ao cadastrar roteiro.");
      }
    } catch (error: any) {
      console.error("Erro ao cadastrar roteiro:", error);
      if (axios.isAxiosError(error)) {
        console.error("Detalhes do erro:", error.response?.data);
        toast.error(`Erro: ${error.response?.data?.message || "Erro ao cadastrar roteiro"}`);
      } else {
        toast.error("Erro ao cadastrar roteiro.");
      }
    }
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
                  onValueChange={field.onChange}
                  value={field.value ? String(field.value) : ""} // Convertendo para string
                >
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
                    value={field.value === undefined ? '' : field.value}
                    onChange={(e) => {
                      if (type === "number") {
                        field.onChange(e.target.value === '' ? undefined : Number(e.target.value));
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
                    value={field.value === undefined ? '' : field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value === '' ? undefined : Number(e.target.value));
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

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        className="bg-background fixed top-0 right-0 !left-auto z-50 h-full w-2/2 overflow-auto rounded-l-2xl p-6 shadow-lg md:w-1/2">
        <FormProvider {...methods}>
          <Form {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit, (errors) => {
                console.log("Erros de validação:", errors);
                toast.error("Por favor, corrija os erros no formulário");
              })}
              className="flex h-full flex-col">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cadastrar Novo Roteiro</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-2xl font-bold hover:text-gray-900"
                  aria-label="Fechar">
                  ×
                </button>
              </div>
              <Card className="flex-grow overflow-auto">
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {formFields.map(renderFormField)}
                    {formFields2.map(renderFormField)}
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