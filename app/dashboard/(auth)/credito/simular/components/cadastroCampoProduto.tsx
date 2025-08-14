"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Combobox } from "@/components/Combobox";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import clsx from "clsx";
import { toast } from "sonner";

interface ComboboxProps<T> {
  data: T[];
  displayField: keyof T;
  value: T | null;
  onChange: (item: T | null) => void;
  label?: string;
  placeholder?: string;
  searchFields?: (keyof T)[];
  className?: string;
  dropdownClassName?: string;
}

interface AvailableField {
  value: string;
  label: string;
  type: string;
}

interface TypeOption {
  value: string;
  label: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const fieldSchema = z.object({
  key: z.string().min(1, "Chave do campo é obrigatória"),
  label: z.string().min(1, "Rótulo é obrigatório").refine((val) => val !== "Sem nome", {
    message: "Rótulo não pode ser 'Sem nome'"
  }),
  type: z.enum(["text", "number", "date"], {
    errorMap: () => ({ message: "Tipo de campo inválido" })
  }),
  required: z.boolean().optional(),
  placeholder: z.string().optional()
});

const schema = z.object({
  produto_hash: z.string().min(1, "Produto é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  items: z.array(fieldSchema).min(1, "Pelo menos um item é obrigatório"),
  fields: z.array(fieldSchema).min(1, "Pelo menos um campo é obrigatório")
}).refine(
  (data) => {
    const allLabels = [...data.items, ...data.fields].map((field) => field.label);
    return allLabels.length === new Set(allLabels).size;
  },
  { message: "Os rótulos dos campos devem ser únicos" }
);

type FormData = z.infer<typeof schema>;

type ProdutoOption = {
  id: string;
  name: string;
};

type CadastroCamposModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
};

export default function CadastroInputProduto({
  isOpen,
  onClose,
  onRefresh
}: CadastroCamposModalProps) {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      produto_hash: "",
      title: "Dados da Simulação",
      items: [
        {
          key: "",
          label: "",
          type: "text",
          required: false,
          placeholder: ""
        }
      ],
      fields: [
        {
          key: "",
          label: "",
          type: "text",
          required: false,
          placeholder: ""
        }
      ]
    }
  });

  const { token } = useAuth();
  const [produtos, setProdutos] = useState<ProdutoOption[]>([]);
  const [produtoSelect, setProdutoSelect] = useState<ProdutoOption | null>(null);
  const [availableFields] = useState<AvailableField[]>([
    { value: "cpf", label: "CPF", type: "text" },
    { value: "saldo", label: "Saldo FGTS", type: "text" },
    { value: "mes_aniversario", label: "Mês Aniversário", type: "number" },
    { value: "juros", label: "Taxa de Juros", type: "text" },
    { value: "parcelas_adiantadas", label: "Parcelas Adiantadas", type: "number" },
    { value: "data_inicio", label: "Data de Início", type: "date" }
  ]);

  const { fields: items, append: appendItem, remove: removeItem } = useFieldArray({
    control: methods.control,
    name: "items"
  });

  const { fields: fields, append: appendField, remove: removeField } = useFieldArray({
    control: methods.control,
    name: "fields"
  });

  useEffect(() => {
    if (!token || !isOpen) return;

    async function fetchProdutos() {
      try {
        const response = await fetch(`${API_BASE_URL}/rel-produto-sub-produto-convenio/listar`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache"
          }
        });

        if (!response.ok) throw new Error("Erro ao buscar produtos");

        const data = await response.json();
        const options = data.map((produto: any) => ({
          id: produto.relacionamento_hash,
          name: `${produto.convenio_nome} - ${produto.modalidade_credito_nome} - ${produto.tipo_operacao_nome}`
        }));

        setProdutos(options);
      } catch (error) {
        console.error("Erro ao listar produtos:", error);
        toast.error("Erro ao listar produtos", {
          style: {
            background: 'var(--toast-error)',
            color: 'var(--toast-error-foreground)',
            boxShadow: 'var(--toast-shadow)'
          }
        });
      }
    }

    async function fetchConfig() {
      if (!produtoSelect?.id) return;

      try {
        const response = await fetch(`${API_BASE_URL}/simulacao-campos-produtos/listar?produto_hash=${produtoSelect.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache"
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            methods.reset({
              produto_hash: produtoSelect.id,
              title: "Dados da Simulação",
              items: [
                {
                  key: "",
                  label: `Campo ${items.length + 1}`,
                  type: "text",
                  required: false,
                  placeholder: ""
                }
              ],
              fields: [
                {
                  key: "",
                  label: `Campo ${fields.length + 1}`,
                  type: "text",
                  required: false,
                  placeholder: ""
                }
              ]
            });
            return;
          }
          throw new Error("Erro ao buscar configuração");
        }

        const apiData = await response.json();
        const transformedData = {
          produto_hash: apiData.produto_hash || produtoSelect.id,
          title: apiData.title || "Dados da Simulação",
          items: apiData.items?.map((item: any, index: number) => ({
            key: item.key,
            label: item.label || `Campo ${index + 1}`,
            type: item.type,
            required: item.required || false,
            placeholder: item.placeholder || ""
          })) || [
            {
              key: "",
              label: `Campo ${items.length + 1}`,
              type: "text",
              required: false,
              placeholder: ""
            }
          ],
          fields: apiData.fields?.map((field: any, index: number) => ({
            key: field.key,
            label: field.label || `Campo ${index + 1}`,
            type: field.type,
            required: field.required || false,
            placeholder: field.placeholder || ""
          })) || [
            {
              key: "",
              label: `Campo ${fields.length + 1}`,
              type: "text",
              required: false,
              placeholder: ""
            }
          ]
        };

        methods.reset(transformedData);
      } catch (error) {
        console.error("Erro ao buscar configuração:", error);
        toast.error("Erro ao buscar configuração", {
          style: {
            background: 'var(--toast-error)',
            color: 'var(--toast-error-foreground)',
            boxShadow: 'var(--toast-shadow)'
          }
        });
      }
    }

    fetchProdutos();
    fetchConfig();
  }, [token, isOpen, produtoSelect, methods, items.length, fields.length]);

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/simulacao-campos-produtos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          produto_hash: data.produto_hash,
          simulacao_campos_produtos_type: "fgts",
          simulacao_campos_produtos_title: data.title,
          simulacao_campos_produtos_items: JSON.stringify(data.items),
          simulacao_campos_produtos_fields: JSON.stringify(data.fields)
        })
      });

      if (!response.ok) throw new Error("Erro ao salvar configuração");

      toast.success("Configuração salva com sucesso!", {
        style: {
          background: 'var(--toast-success)',
          color: 'var(--toast-success-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
      if (onRefresh) onRefresh();
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar configuração:", error);
      toast.error(`Erro ao salvar configuração: ${error.message}`, {
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
    }
  };

  return (
    <>
      <aside
        className={clsx(
          "fixed inset-y-0 right-0 z-50 h-screen w-full max-w-2xl border-l bg-background p-6 shadow-lg transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}>
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cadastro de Campos da Simulação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <FormField
                      control={methods.control}
                      name="produto_hash"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Produto</FormLabel>
                          <FormControl>
                            <Combobox
                              data={produtos}
                              displayField="name"
                              value={produtos.find((p) => p.id === field.value) || null}
                              onChange={(selected: ProdutoOption | null) => {
                                field.onChange(selected?.id || "");
                                setProdutoSelect(selected);
                              }}
                              searchFields={["name"]}
                              placeholder="Selecione um produto"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o título" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="rounded-md border p-4">
                      <h3 className="text-lg font-medium">Itens</h3>
                      <FieldArray arrayName="items" availableFields={availableFields} append={appendItem} remove={removeItem} fields={items} />
                    </div>

                    <div className="rounded-md border p-4">
                      <h3 className="text-lg font-medium">Campos</h3>
                      <FieldArray arrayName="fields" availableFields={availableFields} append={appendField} remove={removeField} fields={fields} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Configuração</Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </aside>
    </>
  );
}

type FieldArrayProps = {
  arrayName: "items" | "fields";
  availableFields: AvailableField[];
  append: (value: any) => void;
  remove: (index: number) => void;
  fields: any[];
  className?: string;
};

function FieldArray({ arrayName, availableFields, append, remove, fields, className }: FieldArrayProps) {
  const { control, watch, setValue } = useFormContext();

  const generateUniqueLabel = (baseLabel: string, existingLabels: string[]) => {
    let newLabel = baseLabel;
    let counter = 1;
    while (existingLabels.includes(newLabel)) {
      newLabel = `${baseLabel} ${counter}`;
      counter++;
    }
    return newLabel;
  };

  const existingLabels = watch(`${arrayName}`).map((field: any) => field.label);

  return (
    <div className={clsx("grid gap-4", className)}>
      {fields.map((field, fieldIndex) => (
        <div key={field.id} className="rounded-md border p-4">
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={control}
              name={`${arrayName}.${fieldIndex}.key`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave do Campo</FormLabel>
                  <FormControl>
                    <Combobox<AvailableField>
                      data={availableFields}
                      displayField="label"
                      value={availableFields.find((f) => f.value === field.value) || null}
                      onChange={(selected: AvailableField | null) => {
                        field.onChange(selected?.value || "");
                        setValue(`${arrayName}.${fieldIndex}.type`, selected?.type || "text");
                        const newLabel = generateUniqueLabel(
                          selected?.label || `Campo ${fieldIndex + 1}`,
                          existingLabels.filter((_: string, idx: number) => idx !== fieldIndex)
                        );
                        setValue(`${arrayName}.${fieldIndex}.label`, newLabel);
                      }}
                      searchFields={["label"]}
                      placeholder="Selecione um campo"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`${arrayName}.${fieldIndex}.label`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rótulo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o rótulo do campo"
                      {...field}
                      onChange={(e) => {
                        const newLabel = generateUniqueLabel(
                          e.target.value || `Campo ${fieldIndex + 1}`,
                          existingLabels.filter((_: string, idx: number) => idx !== fieldIndex)
                        );
                        field.onChange(newLabel);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`${arrayName}.${fieldIndex}.type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <Combobox<TypeOption>
                      data={[
                        { value: "text", label: "Texto" },
                        { value: "number", label: "Número" },
                        { value: "date", label: "Data" }
                      ]}
                      displayField="label"
                      value={{
                        value: field.value,
                        label:
                          field.value === "text"
                            ? "Texto"
                            : field.value === "number"
                              ? "Número"
                              : "Data"
                      }}
                      onChange={(selected: TypeOption | null) => field.onChange(selected?.value || "text")}
                      searchFields={["label"]}
                      placeholder="Selecione o tipo"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {arrayName === "items" && (
              <FormField
                control={control}
                name={`${arrayName}.${fieldIndex}.placeholder`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placeholder</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o placeholder" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {arrayName === "fields" && (
              <FormField
                control={control}
                name={`${arrayName}.${fieldIndex}.required`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Obrigatório</FormLabel>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <Button
            type="button"
            variant="destructive"
            onClick={() => remove(fieldIndex)}
            className="mt-4">
            Remover Campo
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const newLabel = generateUniqueLabel(`Campo ${fields.length + 1}`, existingLabels);
          append({ key: "", label: newLabel, type: "text", required: false, placeholder: "" });
        }}
        className="mt-4">
        Adicionar Campo
      </Button>
    </div>
  );
}