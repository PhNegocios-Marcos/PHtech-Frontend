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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Esquema de validação para um único campo
const fieldSchema = z.object({
  name: z.string().min(1, "Nome do campo é obrigatório"),
  label: z.string().min(1, "Rótulo é obrigatório"),
  type: z.enum(["text", "select", "date", "number"], {
    errorMap: () => ({ message: "Tipo de campo inválido" })
  }),
  required: z.boolean(),
  options: z
    .array(
      z.object({
        value: z.string().min(1, "Valor da opção é obrigatório"),
        label: z.string().min(1, "Rótulo da opção é obrigatório")
      })
    )
    .optional()
});

// Esquema de validação para uma seção
const sectionSchema = z.object({
  section: z.enum(["DadosPessoais", "Contato", "Enderecos", "DadosBancarios"], {
    errorMap: () => ({ message: "Seção inválida" })
  }),
  fields: z.array(fieldSchema).min(1, "Pelo menos um campo é obrigatório")
});

// Esquema principal
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
  { value: "DadosPessoais", label: "Dados Pessoais" },
  { value: "Contato", label: "Contato" },
  { value: "Enderecos", label: "Endereços" },
  { value: "DadosBancarios", label: "Dados Bancários" }
] as const;

export default function CadastroCamposModal({
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
          section: "DadosPessoais", // Valor inicial válido
          fields: [{ name: "", label: "", type: "text", required: false, options: [] }]
        }
      ]
    }
  });

  const { token } = useAuth();
  const [produtos, setProdutos] = useState<ProdutoOption[]>([]);
  const [produtoSelect, setProdutoSelect] = useState<ProdutoOption | null>(null);
  const [availableFields] = useState([
    { value: "nome", label: "Nome" },
    { value: "nome_pai", label: "Nome do Pai" },
    { value: "nome_mae", label: "Nome da Mãe" },
    { value: "tipo_documento", label: "Tipo de Documento" },
    { value: "numero_documento", label: "Número do Documento" },
    { value: "cpf", label: "CPF" },
    { value: "sexo", label: "Sexo" },
    { value: "data_nascimento", label: "Data de Nascimento" },
    { value: "estado_civil", label: "Estado Civil" },
    { value: "naturalidade", label: "Naturalidade" },
    { value: "nacionalidade", label: "Nacionalidade" },
    { value: "telefones.0.ddd", label: "DDD Telefone 1" },
    { value: "telefones.0.numero", label: "Número Telefone 1" },
    { value: "telefones.1.ddd", label: "DDD Telefone 2" },
    { value: "telefones.1.numero", label: "Número Telefone 2" },
    { value: "enderecos.0.cep", label: "CEP" },
    { value: "enderecos.0.logradouro", label: "Logradouro" },
    { value: "enderecos.0.numero", label: "Número" },
    { value: "enderecos.0.complemento", label: "Complemento" },
    { value: "enderecos.0.bairro", label: "Bairro" },
    { value: "enderecos.0.cidade", label: "Cidade" },
    { value: "enderecos.0.estado", label: "Estado" },
    { value: "enderecos.0.uf", label: "UF" },
    { value: "emails.0.email", label: "E-mail" },
    { value: "dados_bancarios.0.id_banco", label: "Banco" },
    { value: "dados_bancarios.0.agencia", label: "Agência" },
    { value: "dados_bancarios.0.conta", label: "Conta" },
    { value: "dados_bancarios.0.tipo_pix", label: "Tipo PIX" },
    { value: "dados_bancarios.0.pix", label: "Chave PIX" }
  ]);

  const {
    fields: sections,
    append: appendSection,
    remove: removeSection
  } = useFieldArray({
    control: methods.control,
    name: "sections"
  });

  // Filtrar seções disponíveis para evitar duplicatas
  const getAvailableSectionOptions = () => {
    const selectedSections = methods.getValues("sections").map((s) => s.section);
    return sectionOptions.filter((option) => !selectedSections.includes(option.value));
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
          // Aqui concatena os 3 nomes separados por " - "
          name: `${produto.convenio_nome} - ${produto.modalidade_credito_nome} - ${produto.tipo_operacao_nome}`
        }));

        setProdutos(options);
      } catch (error) {
        console.error("Erro ao listar produtos:", error);
        alert("Erro ao listar produtos.");
      }
    }

    fetchProdutos();
  }, [token, isOpen]);

  useEffect(() => {
    methods.setValue("produto_hash", produtoSelect?.id ?? "");
  }, [produtoSelect, methods]);

  const onSubmit = async (data: FormData) => {
    if (!token) {
      alert("Token não encontrado. Faça login.");
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

      console.log("Dados enviados:", payload);

      const response = await fetch(`${API_BASE_URL}/produto-config-campos-cadastro/criar`, {
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
                <h2 className="text-xl font-semibold">Configurar Campos de Cadastro</h2>
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
                      <div key={section.id} className="rounded-md border p-4">
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
                          <h3 className="text-lg font-medium">Campos</h3>
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
                          Remover Seção
                        </Button>
                      </div>
                    ))}

                    {sections.length < sectionOptions.length && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          appendSection({
                            section: getAvailableSectionOptions()[0]?.value || "DadosPessoais",
                            fields: [
                              { name: "", label: "", type: "text", required: false, options: [] }
                            ]
                          })
                        }
                        className="mt-4">
                        Adicionar Seção
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
  availableFields: { value: string; label: string }[];
  className?: string;
};

function FieldArray({ sectionIndex, availableFields, className }: FieldArrayProps) {
  const { control, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.fields`
  });

  return (
    <div className={clsx("grid gap-4", className)}>
      {fields.map((field, fieldIndex) => (
        <div key={field.id} className="rounded-md border p-4">
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={control}
              name={`sections.${sectionIndex}.fields.${fieldIndex}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Campo</FormLabel>
                  <FormControl>
                    <Combobox
                      data={availableFields}
                      displayField="label"
                      value={availableFields.find((f) => f.value === field.value) || null}
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
            Remover Campo
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ name: "", label: "", type: "text", required: false, options: [] })}
        className="mt-4">
        Adicionar Campo
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
        Adicionar Opção
      </Button>
    </div>
  );
}
