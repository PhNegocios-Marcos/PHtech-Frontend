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
import { ArrowLeft } from "lucide-react";
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

const roteiroSchema = z
  .object({
    rotina_operacional_hash: z.string(),
    nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }).optional(),
    descricao: z.string(),
    idade_minima: z.number(),
    idade_maxima: z.number(),
    prazo_maximo: z.number(),
    valor_bruto_minimo: z.number(),
    valor_bruto_maximo: z.number(),
    tac_min: z.number(),
    tac_max: z.number(),
    usuario_atualizacao: z.string().optional(),
    usa_limite_proposta: z.boolean().default(false),
    valor_limite_proposta: z.number().optional(),
    usa_margem_seguranca: z.boolean().default(false),
    valor_margem_seguranca: z.number().optional()
  })
  .refine((data) => !data.usa_limite_proposta || data.valor_limite_proposta !== undefined, {
    message:
      "Valor do limite de proposta é obrigatório quando 'Usa Limite de Proposta' está ativado",
    path: ["valor_limite_proposta"]
  })
  .refine((data) => !data.usa_margem_seguranca || data.valor_margem_seguranca !== undefined, {
    message:
      "Valor da margem de segurança é obrigatório quando 'Usa Margem de Segurança' está ativado",
    path: ["valor_margem_seguranca"]
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
  type?: string;
  readOnly?: boolean;
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
    defaultValues: roteiro
  });

  const { token } = useAuth();

  const [showLimiteProposta, setShowLimiteProposta] = useState(
    roteiro?.usa_limite_proposta || false
  );
  const [showMargemSeguranca, setShowMargemSeguranca] = useState(
    roteiro?.usa_margem_seguranca || false
  );

  useEffect(() => {
    if (roteiro) {
      const initialValues = {
        ...roteiro,
        usa_limite_proposta: Boolean(roteiro.usa_limite_proposta),
        usa_margem_seguranca: Boolean(roteiro.usa_margem_seguranca),
        valor_limite_proposta: roteiro.usa_limite_proposta
          ? roteiro.valor_limite_proposta
          : undefined,
        valor_margem_seguranca: roteiro.usa_margem_seguranca
          ? roteiro.valor_margem_seguranca
          : undefined
      };
      methods.reset(initialValues);
      setShowLimiteProposta(initialValues.usa_limite_proposta);
      setShowMargemSeguranca(initialValues.usa_margem_seguranca);
    }
  }, [roteiro, methods]);

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
    { name: "tac_min", label: "TAC Mínima", placeholder: "100.00", type: "number" },
    { name: "tac_max", label: "TAC Máxima", placeholder: "500.00", type: "number" }
  ];

  const formFields2: FormFieldConfig[] = [
    {
      name: "usa_limite_proposta",
      label: "Usa Limite de Proposta",
      placeholder: "Selecione",
      component: "select",
      options: [
        { value: "false", label: "Não" },
        { value: "true", label: "Sim" }
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
        { value: "false", label: "Não" },
        { value: "true", label: "Sim" }
      ],
      showInputOnTrue: {
        fieldName: "valor_margem_seguranca",
        label: "Valor da Margem de Segurança",
        placeholder: "Digite o valor da margem",
        type: "number"
      }
    }
  ];

  const onSubmit = async (data: Roteiro) => {
    if (!token) {
      console.error("Token global não definido!");
      return;
    }

    const payload = {
      ...data,
      valor_limite_proposta: data.usa_limite_proposta ? data.valor_limite_proposta : undefined,
      valor_margem_seguranca: data.usa_margem_seguranca ? data.valor_margem_seguranca : undefined
    };

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/rotina-operacional/atualizar`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onClose();
      onRefresh();
    } catch (error: any) {
      console.error("Erro ao atualizar roteiro:", error.response?.data || error.message);
      alert(`Erro: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleSelectChange = (fieldName: keyof Roteiro, value: string) => {
    const booleanValue = value === "true";
    methods.setValue(fieldName, booleanValue);

    if (fieldName === "usa_limite_proposta") {
      setShowLimiteProposta(booleanValue);
      if (!booleanValue) {
        methods.setValue("valor_limite_proposta", undefined);
      }
    } else if (fieldName === "usa_margem_seguranca") {
      setShowMargemSeguranca(booleanValue);
      if (!booleanValue) {
        methods.setValue("valor_margem_seguranca", undefined);
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="col-span-2">
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Editar Roteiro</CardTitle>
                <Button onClick={onClose} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {formFields.map((fieldConfig) => (
                  <FormField
                    key={fieldConfig.name}
                    control={methods.control}
                    name={fieldConfig.name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldConfig.label}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={fieldConfig.placeholder}
                            type={fieldConfig.type}
                            value={
                              field.value === undefined || field.value === null
                                ? ""
                                : String(field.value)
                            }
                            onChange={(e) => {
                              if (fieldConfig.type === "number") {
                                const numValue = e.target.value ? Number(e.target.value) : null;
                                field.onChange(numValue); // Permite null para campos opcionais
                              } else {
                                field.onChange(e.target.value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}

                {formFields2.map((fieldConfig) => (
                  <React.Fragment key={fieldConfig.name}>
                    <FormField
                      control={methods.control}
                      name={fieldConfig.name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{fieldConfig.label}</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value ? "true" : "false"}
                              onValueChange={(value) => {
                                const booleanValue = value === "true";
                                field.onChange(booleanValue);
                                if (fieldConfig.name === "usa_limite_proposta") {
                                  setShowLimiteProposta(booleanValue);
                                  if (!booleanValue)
                                    methods.setValue("valor_limite_proposta", undefined);
                                } else if (fieldConfig.name === "usa_margem_seguranca") {
                                  setShowMargemSeguranca(booleanValue);
                                  if (!booleanValue)
                                    methods.setValue("valor_margem_seguranca", undefined);
                                }
                              }}>
                              <SelectTrigger>
                                <SelectValue placeholder={fieldConfig.placeholder} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Sim</SelectItem>
                                <SelectItem value="false">Não</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {fieldConfig.showInputOnTrue &&
                      ((fieldConfig.name === "usa_limite_proposta" &&
                        methods.watch("usa_limite_proposta")) ||
                        (fieldConfig.name === "usa_margem_seguranca" &&
                          methods.watch("usa_margem_seguranca"))) && (
                        <FormField
                          control={methods.control}
                          name={fieldConfig.showInputOnTrue!.fieldName}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{fieldConfig.showInputOnTrue!.label}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={fieldConfig.showInputOnTrue!.placeholder}
                                  type={fieldConfig.showInputOnTrue!.type}
                                  value={
                                    field.value === undefined || field.value === null
                                      ? ""
                                      : String(field.value)
                                  }
                                  onChange={(e) => {
                                    const numValue = e.target.value ? Number(e.target.value) : null;
                                    field.onChange(numValue === null ? undefined : numValue);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="col-span-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
