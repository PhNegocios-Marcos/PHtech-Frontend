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

// Define ComboboxProps interface to match the Combobox component
interface ComboboxProps<T> {
  data: T[];
  displayField: keyof T;
  value: T | null;
  onChange: (item: T) => void;
  label?: string;
  placeholder?: string;
  searchFields?: (keyof T)[];
  className?: string;
  dropdownClassName?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Esquema de validação para um único campo
const fieldSchema = z.object({
  key: z.string().min(1, "Chave do campo é obrigatória"),
  label: z.string().min(1, "Rótulo é obrigatório"),
  type: z.enum(["text", "number", "date"], {
    errorMap: () => ({ message: "Tipo de campo inválido" })
  }),
  required: z.boolean().optional(),
  placeholder: z.string().optional()
});

// Esquema principal
const schema = z.object({
  produto_hash: z.string().min(1, "Produto é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  items: z.array(fieldSchema).min(1, "Pelo menos um item é obrigatório"),
  fields: z.array(fieldSchema).min(1, "Pelo menos um campo é obrigatório")
});

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
  const [availableFields] = useState([
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
        alert("Erro ao listar produtos.");
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
            // No configuration found for this produto_hash, reset to default
            methods.reset({
              produto_hash: produtoSelect.id,
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
            });
            return;
          }
          throw new Error("Erro ao buscar configuração");
        }

        const apiData = await response.json();
        // Transform API data to match FormData structure
        const transformedData = {
          produto_hash: apiData.produto_hash || produtoSelect.id,
          title: apiData.title || "Dados da Simulação",
          items: apiData.items?.map((item: any) => ({
            key: item.key,
            label: item.label,
            type: item.type,
            required: item.required || false,
            placeholder: item.placeholder || ""
          })) || [
            {
              key: "",
              label: "",
              type: "text",
              required: false,
              placeholder: ""
            }
          ],
          fields: apiData.fields?.map((field: any) => ({
            key: field.key,
            label: field.label,
            type: field.type,
            required: field.required || false,
            placeholder: field.placeholder || ""
          })) || [
            {
              key: "",
              label: "",
              type: "text",
              required: false,
              placeholder: ""
            }
          ]
        };
        methods.reset(transformedData);
      } catch (error) {
        console.error("Erro ao carregar configuração:", error);
        methods.reset({
          produto_hash: produtoSelect.id,
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
        });
      }
    }

    fetchProdutos();
    fetchConfig();
  }, [token, isOpen, produtoSelect, methods]);

  useEffect(() => {
    methods.setValue("produto_hash", produtoSelect?.id ?? "");
  }, [produtoSelect, methods]);

  const onSubmit = async (data: FormData) => {
    if (!token) {
      alert("Token não encontrado. Faça login.");
      return;
    }

    try {
      const payload = {
        produto_hash: data.produto_hash,
        type: "form",
        title: data.title,
        items: data.items.map((item) => ({
          key: item.key,
          label: item.label,
          type: item.type,
          placeholder: item.placeholder || undefined
        })),
        fields: data.fields.map((field) => ({
          key: field.key,
          label: field.label,
          type: field.type,
          required: field.required || false
        }))
      };

      console.log("Payload enviado:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_BASE_URL}/simulacao-campos-produtos/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      console.log("Resposta da API:", JSON.stringify(responseData, null, 2));

      if (!response.ok) {
        throw new Error(JSON.stringify(responseData));
      }

      alert("Configuração de campos cadastrada com sucesso!");
      methods.reset();
      setProdutoSelect(null);
      if (onRefresh) {
        await onRefresh();
      }
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar configuração de campos:", error);
      alert("Erro ao cadastrar configuração de campos: " + error);
    }
  };

  if (!isOpen) return null;

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
                <h2 className="text-xl font-semibold">Configurar Campos de Simulação</h2>
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
                  <CardTitle>Configuração dos Campos</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
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
                              value={produtoSelect}
                              onChange={setProdutoSelect}
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
  availableFields: { value: string; label: string; type: string }[];
  append: (value: any) => void;
  remove: (index: number) => void;
  fields: any[];
  className?: string;
};

function FieldArray({ arrayName, availableFields, append, remove, fields, className }: FieldArrayProps) {
  const { control, watch, setValue } = useFormContext();

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
                    <Combobox
                      data={availableFields}
                      displayField="label"
                      value={availableFields.find((f) => f.value === field.value) || null}
                      onChange={(selected) => {
                        field.onChange(selected?.value || "");
                        setValue(`${arrayName}.${fieldIndex}.type`, selected?.type || "text");
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
                    <Input placeholder="Digite o rótulo do campo" {...field} />
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
                    <Combobox
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
                      onChange={(selected) => field.onChange(selected?.value || "text")}
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
        onClick={() => append({ key: "", label: "", type: "text", required: false, placeholder: "" })}
        className="mt-4">
        Adicionar Campo
      </Button>
    </div>
  );
}