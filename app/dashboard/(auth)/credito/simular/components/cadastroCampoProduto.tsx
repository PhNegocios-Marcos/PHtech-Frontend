"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider, useFieldArray, useFormContext } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, CirclePlus } from "lucide-react";
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
import { Combobox } from "@/components/Combobox";
import { toast } from "sonner";

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

const fieldSchema = z.object({
  name: z.string().min(1, "Nome do campo é obrigatório"),
  label: z.string().min(1, "Rótulo é obrigatório"),
  type: z.enum(["text", "select", "date", "number"], {
    errorMap: () => ({ message: "Tipo de campo inválido" })
  }),
  required: z.boolean().optional(),
  options: z
    .array(
      z.object({
        value: z.string().min(1, "Valor da opção é obrigatório"),
        label: z.string().min(1, "Rótulo da opção é obrigatório")
      })
    )
    .optional()
});

const sectionSchema = z.object({
  section: z.enum(["DadosSimulacao", "ResultadoSimulacao"], {
    errorMap: () => ({ message: "Seção inválida" })
  }),
  fields: z.array(fieldSchema).min(1, "Pelo menos um campo é obrigatório")
});

const schema = z.object({
  produto_hash: z.string().min(1, "Produto é obrigatório"),
  sections: z
    .array(sectionSchema)
    .min(1, "Pelo menos uma seção é obrigatória")
    .refine(
      (sections) => {
        const sectionNames = sections.map((s) => s.section);
        return sectionNames.length === new Set(sectionNames).size;
      },
      { message: "Não são permitidas seções duplicadas" }
    )
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

const sectionOptions = [
  { value: "DadosSimulacao", label: "Dados da Simulação" },
  { value: "ResultadoSimulacao", label: "Resultado da Simulação" }
] as const;

export default function CadastroInputProduto({
  isOpen,
  onClose,
  onRefresh
}: CadastroCamposModalProps) {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      produto_hash: "",
      sections: [
        {
          section: "DadosSimulacao",
          fields: [{ name: "", label: "", type: "text", required: false, options: [] }]
        }
      ]
    }
  });

  const { token } = useAuth();
  const [produtos, setProdutos] = useState<ProdutoOption[]>([]);
  const [produtoSelect, setProdutoSelect] = useState<ProdutoOption | any>(null);
  const [availableFields] = useState([
    { value: "cpf", label: "CPF", section: "DadosSimulacao" },
    { value: "saldo", label: "Saldo FGTS", section: "DadosSimulacao" },
    { value: "mes_aniversario", label: "Mês Aniversário", section: "DadosSimulacao" },
    { value: "juros", label: "Taxa de Juros", section: "DadosSimulacao" },
    { value: "parcelas_adiantadas", label: "Parcelas Adiantadas", section: "DadosSimulacao" },
    { value: "data_inicio", label: "Data de Início", section: "DadosSimulacao" },
    { value: "valor_liberado", label: "Valor Liberado", section: "ResultadoSimulacao" },
    { value: "valor_parcela", label: "Valor Parcela", section: "ResultadoSimulacao" },
    {
      value: "quantidade_parcelas",
      label: "Quantidade de Parcelas",
      section: "ResultadoSimulacao"
    },
    { value: "cet", label: "CET", section: "ResultadoSimulacao" },
    { value: "taxa_juros", label: "Taxa de Juros", section: "ResultadoSimulacao" }
  ]);

  const {
    fields: sections,
    append: appendSection,
    remove: removeSection
  } = useFieldArray({
    control: methods.control,
    name: "sections"
  });

  const getAvailableSectionOptions = () => {
    const selectedSections = methods.getValues("sections").map((s) => s.section);
    return sectionOptions.filter((option) => !selectedSections.includes(option.value));
  };

  // AJUSTE AQUI: Converte o retorno do endpoint para o formato do formulário
  const transformApiData = (apiData: any): FormData["sections"] => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      return [
        {
          section: "DadosSimulacao",
          fields: [{ name: "", label: "", type: "text", required: false, options: [] }]
        }
      ];
    }

    // O endpoint retorna um array. Vamos assumir que cada item é uma seção (pode adaptar se vier mais de uma seção)
    // Aqui, exemplos para 'DadosSimulacao' e 'ResultadoSimulacao'. Adapte se vier mais seções.
    const sections: FormData["sections"] = [];

    // Exemplo: pegar sempre a seção "DadosSimulacao" se tiver
    const dadosSimulacao = apiData.find(
      (item: any) =>
        item.simulacao_campos_produtos_title === "Dados da Simulação" ||
        item.simulacao_campos_produtos_title?.toLowerCase().includes("simulação")
    );
    if (dadosSimulacao && dadosSimulacao.simulacao_campos_produtos_fields) {
      let fieldsArr: any[] = [];
      try {
        fieldsArr = JSON.parse(dadosSimulacao.simulacao_campos_produtos_fields);
      } catch {}
      sections.push({
        section: "DadosSimulacao",
        fields: fieldsArr.map((f) => ({
          name: f.key || f.name || "",
          label: f.label || "",
          type:
            f.type === "text" || f.type === "number" || f.type === "date" || f.type === "select"
              ? f.type
              : "text",
          required: typeof f.required === "boolean" ? f.required : false,
          options: f.options || []
        }))
      });
    }

    // Caso venha uma seção de resultado
    const resultadoSimulacao = apiData.find(
      (item: any) =>
        item.simulacao_campos_produtos_title === "Resultado da Simulação" ||
        item.simulacao_campos_produtos_title?.toLowerCase().includes("resultado")
    );
    if (resultadoSimulacao && resultadoSimulacao.simulacao_campos_produtos_fields) {
      let fieldsArr: any[] = [];
      try {
        fieldsArr = JSON.parse(resultadoSimulacao.simulacao_campos_produtos_fields);
      } catch {}
      sections.push({
        section: "ResultadoSimulacao",
        fields: fieldsArr.map((f) => ({
          name: f.key || f.name || "",
          label: f.label || "",
          type:
            f.type === "text" || f.type === "number" || f.type === "date" || f.type === "select"
              ? f.type
              : "text",
          required: typeof f.required === "boolean" ? f.required : false,
          options: f.options || []
        }))
      });
    }

    // fallback se não achar nenhuma seção
    if (sections.length === 0) {
      return [
        {
          section: "DadosSimulacao",
          fields: [{ name: "", label: "", type: "text", required: false, options: [] }]
        }
      ];
    }

    return sections;
  };

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
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
      }
    }

    fetchProdutos();
  }, [token, isOpen]);

  useEffect(() => {
    if (!token || !isOpen || !produtoSelect?.id) return;

    async function fetchConfig() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/simulacao-campos-produtos/listar?produto_hash=${produtoSelect.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              "Cache-Control": "no-cache"
            }
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            methods.reset({
              produto_hash: produtoSelect.id,
              sections: [
                {
                  section: "DadosSimulacao",
                  fields: [{ name: "", label: "", type: "text", required: false, options: [] }]
                }
              ]
            });
            return;
          }
          throw new Error("Erro ao buscar configuração");
        }

        const apiData = await response.json();
        const transformedData = transformApiData(apiData);
        methods.reset({ produto_hash: produtoSelect.id, sections: transformedData });
      } catch (error) {
        console.error("Erro ao carregar configuração:", error);
        toast.error("Erro ao carregar configuração", {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
        methods.reset({
          produto_hash: produtoSelect.id,
          sections: [
            {
              section: "DadosSimulacao",
              fields: [{ name: "", label: "", type: "text", required: false, options: [] }]
            }
          ]
        });
      }
    }

    fetchConfig();
  }, [token, isOpen, produtoSelect, methods]);

  useEffect(() => {
    methods.setValue("produto_hash", produtoSelect?.id ?? "");
  }, [produtoSelect, methods]);

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

    try {
      const payload = data.sections.map((section) => ({
        produto_hash: data.produto_hash,
        section: section.section,
        fields: section.fields.map((field) => ({
          name: field.name,
          label: field.label,
          type: field.type,
          required: field.required,
          ...(field.type === "select" && field.options ? { options: field.options } : {})
        }))
      }));

      const response = await fetch(`${API_BASE_URL}/simulacao-campos-produtos/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Erro ao salvar configuração");
      }

      toast.success("Configuração de campos da simulação salva com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      methods.reset();
      setProdutoSelect(null);
      if (onRefresh) {
        await onRefresh();
      }
      onClose();
    } catch (error: any) {
      console.error("Erro ao cadastrar configuração de campos:", error);
      toast.error(`Erro ao cadastrar configuração: ${error.message}`, {
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
        className="fixed top-0 right-0 z-50 h-full w-1/2 overflow-auto bg-background p-6 shadow-lg">
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Configurar Campos da Simulação</h2>
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

                    {sections.map((section, sectionIndex) => (
                      <div
                        key={section.id}
                        className="rounded-md border-2 border-solid p-4 shadow-lg">
                        <FormField
                          control={methods.control}
                          name={`sections.${sectionIndex}.section`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Seção</FormLabel>
                              <FormControl>
                                <Combobox
                                  data={getAvailableSectionOptions()}
                                  displayField="label"
                                  value={
                                    sectionOptions.find((opt) => opt.value === field.value) || null
                                  }
                                  onChange={(selected) => field.onChange(selected?.value || "")}
                                  searchFields={["label"]}
                                  placeholder="Selecione uma seção"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="mt-4">
                          {/* <h3 className="text-lg font-medium">Campos</h3> */}
                          <FieldArray
                            sectionIndex={sectionIndex}
                            availableFields={availableFields}
                          />
                        </div>

                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeSection(sectionIndex)}
                          className="mt-4">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    {sections.length < sectionOptions.length && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          appendSection({
                            section: getAvailableSectionOptions()[0]?.value || "DadosSimulacao",
                            fields: [
                              { name: "", label: "", type: "text", required: false, options: [] }
                            ]
                          })
                        }
                        className="mt-4">
                        <CirclePlus className="h-4 w-4" />{" "}
                      </Button>
                    )}
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
  sectionIndex: number;
  availableFields: { value: string; label: string; section: string }[];
  className?: string;
};

function FieldArray({ sectionIndex, availableFields, className }: FieldArrayProps) {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.fields`
  });

  const currentSection = watch(`sections.${sectionIndex}.section`);
  const filteredFields = availableFields.filter((field) => field.section === currentSection);

  return (
    <div className={clsx("grid gap-4", className)}>
      {fields.map((field, fieldIndex) => (
        <div
          key={field.id}
          className="rounded-md border-1 border-solid p-4 hover:bg-[var(--primary-100)]">
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={control}
              name={`sections.${sectionIndex}.fields.${fieldIndex}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Campo</FormLabel>
                  <FormControl>
                    <Combobox
                      data={filteredFields}
                      displayField="label"
                      value={filteredFields.find((f) => f.value === field.value) || null}
                      onChange={(selected) => field.onChange(selected?.value || "")}
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
              name={`sections.${sectionIndex}.fields.${fieldIndex}.label`}
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
              name={`sections.${sectionIndex}.fields.${fieldIndex}.type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <Combobox
                      data={[
                        { value: "text", label: "Texto" },
                        { value: "select", label: "Seleção" },
                        { value: "date", label: "Data" },
                        { value: "number", label: "Número" }
                      ]}
                      displayField="label"
                      value={{
                        value: field.value,
                        label:
                          field.value === "text"
                            ? "Texto"
                            : field.value === "select"
                              ? "Seleção"
                              : field.value === "date"
                                ? "Data"
                                : "Número"
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

            <FormField
              control={control}
              name={`sections.${sectionIndex}.fields.${fieldIndex}.required`}
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
          </div>

          {watch(`sections.${sectionIndex}.fields.${fieldIndex}.type`) === "select" && (
            <OptionArray sectionIndex={sectionIndex} fieldIndex={fieldIndex} />
          )}

          <Button
            type="button"
            variant="destructive"
            onClick={() => remove(fieldIndex)}
            className="mt-4">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ name: "", label: "", type: "text", required: false, options: [] })}
        className="mt-4">
        <CirclePlus className="h-4 w-4" />{" "}
      </Button>
    </div>
  );
}

type OptionArrayProps = {
  sectionIndex: number;
  fieldIndex: number;
};

function OptionArray({ sectionIndex, fieldIndex }: OptionArrayProps) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.fields.${fieldIndex}.options`
  });

  return (
    <div className="mt-4">
      <h4 className="text-md font-medium">Opções do Campo Select</h4>
      {fields.map((option, optionIndex) => (
        <div key={option.id} className="mt-2 flex gap-2 rounded-md border p-2">
          <FormField
            control={control}
            name={`sections.${sectionIndex}.fields.${fieldIndex}.options.${optionIndex}.value`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o valor" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`sections.${sectionIndex}.fields.${fieldIndex}.options.${optionIndex}.label`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rótulo</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o rótulo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="destructive"
            className="self-end"
            onClick={() => remove(optionIndex)}>
            Remover
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        className="mt-4"
        onClick={() => append({ value: "", label: "" })}>
        <CirclePlus className="h-4 w-4" />{" "}
      </Button>
    </div>
  );
}
