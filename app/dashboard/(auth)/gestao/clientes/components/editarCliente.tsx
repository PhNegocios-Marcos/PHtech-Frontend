"use client";

import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Combobox } from "@/components/Combobox";
import { FileText, Upload, X } from "lucide-react";
import toastComponent from "@/utils/toastComponent";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Define FormSection type
interface FormSection {
  section: string;
  fields: FormFieldDef[];
}

// Fixed fields definition
const fixedFormSections: FormSection[] = [
  {
    section: "DadosPessoais",
    fields: [
      { name: "nome", label: "Nome", type: "text", required: true },
      { name: "nome_pai", label: "Nome do Pai", type: "text", required: false },
      { name: "nome_mae", label: "Nome da Mãe", type: "text", required: false },
      {
        name: "tipo_documento",
        label: "Tipo de Documento",
        type: "select",
        required: true,
        options: [
          { value: "1", label: "RG" },
          { value: "2", label: "CNH" }
        ]
      },
      { name: "numero_documento", label: "Número do Documento", type: "text", required: true },
      { name: "cpf", label: "CPF", type: "text", required: true },
      {
        name: "sexo",
        label: "Sexo",
        type: "select",
        required: true,
        options: [
          { value: "M", label: "Masculino" },
          { value: "F", label: "Feminino" }
        ]
      },
      { name: "data_nascimento", label: "Data de Nascimento", type: "date", required: true },
      {
        name: "estado_civil",
        label: "Estado Civil",
        type: "select",
        required: true,
        options: [
          { value: "solteiro", label: "Solteiro(a)" },
          { value: "casado", label: "Casado(a)" },
          { value: "divorciado", label: "Divorciado(a)" },
          { value: "viuvo", label: "Viúvo(a)" },
          { value: "separado", label: "Separado(a)" }
        ]
      },
      { name: "naturalidade", label: "Naturalidade", type: "text", required: true },
      { name: "nacionalidade", label: "Nacionalidade", type: "text", required: true }
    ]
  },
  {
    section: "Contato",
    fields: [
      // { name: "ddd", label: "DDD", type: "text", required: true },
      // { name: "numero", label: "Número", type: "text", required: true },
      { name: "numero", label: "Número de telefone", type: "text", required: true},
      { name: "email", label: "Email", type: "text", required: true }
    ]
  },
  {
    section: "Enderecos",
    fields: [
      { name: "cep", label: "CEP", type: "text", required: true },
      { name: "logradouro", label: "Logradouro", type: "text", required: true },
      { name: "numero", label: "Número", type: "number", required: true },
      { name: "complemento", label: "Complemento", type: "text", required: false },
      { name: "bairro", label: "Bairro", type: "text", required: true },
      { name: "cidade", label: "Cidade", type: "text", required: true },
      { name: "estado", label: "Estado", type: "text", required: true },
      { name: "uf", label: "UF", type: "text", required: true }
    ]
  },
  {
    section: "DadosBancarios",
    fields: [
      { name: "agencia", label: "Agência", type: "text", required: false },
      { name: "conta", label: "Conta", type: "text", required: false },
      {
        name: "tipo_pix",
        label: "Tipo de Chave Pix",
        type: "select",
        required: true,
        options: [
          { value: "1", label: "CPF" },
          { value: "2", label: "CNPJ" },
          { value: "3", label: "E-mail" },
          { value: "4", label: "Telefone" },
          { value: "5", label: "Chave Aleatória" }
        ]
      },
      { name: "pix", label: "Chave Pix/TED", type: "text", required: true }
    ]
  },
  {
    section: "Documentos",
    fields: []
  }
];

interface FormFieldDef {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: { value: string; label: string }[];
  mask?: string;
}

interface TabRef {
  validate: () => Promise<boolean>;
}

// Componente para Dados Pessoais
const DadosPessoais = forwardRef<
  { validate: () => Promise<boolean> },
  { formData: any; onChange: (path: string, value: any) => void; fields: FormFieldDef[] }
>(({ formData, onChange, fields }, ref) => {
  const uniqueFields = Array.from(new Map(fields.map((field) => [field.name, field])).values());

  const createSchema = () => {
    const schemaObj: Record<string, any> = {};
    uniqueFields.forEach((field) => {
      if (field.name === "tipo_documento") {
        schemaObj[field.name] = z.number().refine((val) => val === 1 || val === 2, {
          message: "Tipo de documento deve ser 1 (RG) ou 2 (CNH)"
        });
      } else if (field.required) {
        schemaObj[field.name] = z.string().min(1, `${field.label} é obrigatório`);
      } else {
        schemaObj[field.name] = z.string().optional();
      }
    });
    return z.object(schemaObj);
  };

  const schema = createSchema();
  type FormData = z.infer<typeof schema>;

  const {
    register,
    setValue,
    formState: { errors },
    trigger
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: uniqueFields.reduce(
      (acc, field) => {
        if (field.name === "tipo_documento") {
          acc[field.name] = formData[field.name] !== "" ? Number(formData[field.name]) : undefined;
        } else {
          acc[field.name] = formData[field.name] || "";
        }
        return acc;
      },
      {} as Record<string, any>
    )
  });

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const result = await trigger();
      if (!result) {
        toast.warning("Preencha os campos obrigatórios corretamente", {
          style: {
            background: "var(--toast-warning)",
            color: "var(--toast-warning-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
      }
      return result;
    }
  }));

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: uniqueFields.reduce(
      (acc, field) => {
        if (field.name === "tipo_documento") {
          acc[field.name] = formData[field.name] !== "" ? Number(formData[field.name]) : undefined;
        } else {
          acc[field.name] = formData[field.name] || "";
        }
        return acc;
      },
      {} as Record<string, any>
    )
  });

  const renderField = (field: FormFieldDef) => {
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name}
        render={({ field: fieldProps }) => (
          <FormItem className="space-y-2">
            <FormLabel>{field.label}</FormLabel>
            <FormControl>
              {field.type === "text" ? (
                <Input
                  {...fieldProps}
                  placeholder={field.label}
                  onChange={(e) => {
                    fieldProps.onChange(e.target.value);
                    onChange(field.name, e.target.value);
                  }}
                  value={fieldProps.value || ""}
                  className="mt-1"
                />
              ) : field.type === "select" ? (
                <Combobox
                  value={field.options?.find((opt) => opt.value === fieldProps.value) || null}
                  onChange={(selected) => {
                    const value = selected?.value || "";
                    fieldProps.onChange(value);
                    onChange(field.name, value);
                  }}
                  data={field.options || []}
                  displayField="label"
                  placeholder={field.label}
                  searchFields={["label"]}
                  className="mt-1"
                />
              ) : field.type === "date" ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    {...fieldProps}
                    onChange={(e) => {
                      fieldProps.onChange(e.target.value);
                      onChange(field.name, e.target.value);
                    }}
                    value={fieldProps.value || ""}
                    className="mt-1"
                  />
                </div>
              ) : null}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Form {...form}>
      <div className="m-10 grid grid-cols-1 gap-5 space-y-3 md:grid-cols-3">
        {uniqueFields.map(renderField)}
      </div>
    </Form>
  );
});
DadosPessoais.displayName = "DadosPessoais";

// Componente para Contato
const Contato = forwardRef<
  { validate: () => Promise<boolean> },
  {
    formData: any;
    onChange: (path: string, value: any) => void;
    fields: FormFieldDef[];
  }
>(({ formData, onChange, fields }, ref) => {
  const createSchema = () => {
    const schemaObj: Record<string, any> = {};
    fields.forEach((field) => {
      if (field.required) {
        schemaObj[field.name] = z.string().min(1, `${field.label} é obrigatório`);
        if (field.name.includes("email")) {
          schemaObj[field.name] = schemaObj[field.name].email("Email inválido");
        }
      } else {
        schemaObj[field.name] = z.string().optional();
      }
    });
    return z.object(schemaObj);
  };

  const contatoSchema = createSchema();
  type ContatoFormData = z.infer<typeof contatoSchema>;

  const form = useForm<ContatoFormData>({
    resolver: zodResolver(contatoSchema),
    defaultValues: {
      numero: "",
      email: formData.emails?.email || ""
    }
  });

  useEffect(() => {
    // Pegar o primeiro telefone do objeto - agora vem com detalhe_telefone_numero
    const primeiroTelefone = Object.values(formData.telefones || {})[0] as any;
    const ddd = form.setValue("ddd", primeiroTelefone?.ddd?.toString() || "");
    const number = form.setValue("numero", primeiroTelefone?.numero?.toString() || "");
    const completeNumber = `${ddd}` + `${number}`;

    form.setValue("email", formData.emails?.email || "");
  }, [formData, form]);

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const result = await form.trigger();
      if (!result) {
        toast.warning("Preencha os campos obrigatórios corretamente", {
          style: {
            background: "var(--toast-warning)",
            color: "var(--toast-warning-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
      }
      return result;
    }
  }));

  const handleInputChange = (fieldName: keyof ContatoFormData, value: string) => {
    form.setValue(fieldName, value);
    if (fieldName === "email") {
      onChange("emails.email", value);
    } else if (fieldName === "ddd" || fieldName === "numero") {
      // Criar um objeto de telefones com uma única entrada
      const telefoneId = Object.keys(formData.telefones || {})[0] || `temp-${Date.now()}`;
      onChange(`telefones.${telefoneId}.${fieldName}`, value);
    }
  };

  const renderField = (field: FormFieldDef) => {
    const fieldName = field.name as keyof ContatoFormData;

    return (
      <FormField
        key={field.name}
        control={form.control}
        name={fieldName}
        render={({ field: fieldProps }) => (
          <FormItem className={field.name.includes("ddd") ? "col-span-1" : "col-span-3"}>
            <FormLabel>{field.label}</FormLabel>
            <FormControl>
              <Input
                {...fieldProps}
                placeholder={field.label}
                onChange={(e) => {
                  fieldProps.onChange(e.target.value);
                  handleInputChange(fieldName, e.target.value);
                }}
                className="mt-1"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Form {...form}>
      <div className="m-10 grid grid-cols-2 gap-5">
        <div className="grid grid-cols-3 gap-2">
          {fields.filter((f) => f.name !== "email").map(renderField)}
        </div>
        <div>{fields.filter((f) => f.name === "email").map(renderField)}</div>
      </div>
    </Form>
  );
});
Contato.displayName = "Contato";

// Componente para Endereços
const Enderecos = forwardRef<
  { validate: () => Promise<boolean> },
  { formData: any; onChange: (path: string, value: any) => void; fields: FormFieldDef[] }
>(({ formData, onChange, fields }, ref) => {
  // Pegar o primeiro endereço do objeto
  const primeiroEndereco = Object.values(formData.enderecos || {})[0] as any;

  const createSchema = () => {
    const schemaObj: Record<string, any> = {};
    fields.forEach((field) => {
      if (field.required) {
        schemaObj[field.name] = z.string().min(1, `${field.label} é obrigatório`);
      } else {
        schemaObj[field.name] = z.string().optional();
      }
    });
    return z.object(schemaObj);
  };

  const enderecoSchema = createSchema();
  type EnderecoFormData = z.infer<typeof enderecoSchema>;

  const form = useForm<EnderecoFormData>({
    resolver: zodResolver(enderecoSchema),
    defaultValues: fields.reduce(
      (acc, field) => {
        acc[field.name as keyof EnderecoFormData] = primeiroEndereco?.[field.name] || "";
        return acc;
      },
      {} as Record<string, any>
    )
  });

  useEffect(() => {
    fields.forEach((field) => {
      form.setValue(field.name as keyof EnderecoFormData, primeiroEndereco?.[field.name] || "");
    });
  }, [formData, form, fields, primeiroEndereco]);

  useImperativeHandle(ref, () => ({
    validate: () => form.trigger()
  }));

  const formatCep = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 5) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
    }
    return cleaned;
  };

  const buscarEndereco = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }

      const campos = {
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
        uf: data.uf || ""
      };

      Object.entries(campos).forEach(([key, val]) => {
        form.setValue(key as keyof EnderecoFormData, val);
        const enderecoId = Object.keys(formData.enderecos || {})[0] || `temp-${Date.now()}`;
        onChange(`enderecos.${enderecoId}.${key}`, val);
      });

      toast.success("Endereço encontrado com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      toast.error("Não foi possível buscar o endereço. Verifique sua conexão.");
    }
  };

  const renderField = (field: FormFieldDef) => {
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name as keyof EnderecoFormData}
        render={({ field: fieldProps }) => {
          const value = primeiroEndereco?.[field.name] || "";

          return (
            <FormItem className="grid gap-1">
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                {field.name === "cep" ? (
                  <Input
                    {...fieldProps}
                    placeholder={field.label}
                    value={fieldProps.value || ""}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      const formattedValue = formatCep(rawValue);
                      fieldProps.onChange(formattedValue);
                      const enderecoId =
                        Object.keys(formData.enderecos || {})[0] || `temp-${Date.now()}`;
                      onChange(`enderecos.${enderecoId}.${field.name}`, formattedValue);
                      if (formattedValue.replace(/\D/g, "").length === 8) {
                        buscarEndereco(formattedValue);
                      }
                    }}
                    className="mt-1"
                  />
                ) : field.name === "numero" ? (
                  <Input
                    {...fieldProps}
                    placeholder={field.label}
                    type="text"
                    value={fieldProps.value || ""}
                    onChange={(e) => {
                      fieldProps.onChange(e.target.value);
                      const enderecoId =
                        Object.keys(formData.enderecos || {})[0] || `temp-${Date.now()}`;
                      onChange(`enderecos.${enderecoId}.${field.name}`, e.target.value);
                    }}
                    className="mt-1"
                  />
                ) : (
                  <Input
                    {...fieldProps}
                    placeholder={field.label}
                    type={field.type}
                    value={fieldProps.value || ""}
                    onChange={(e) => {
                      fieldProps.onChange(e.target.value);
                      const enderecoId =
                        Object.keys(formData.enderecos || {})[0] || `temp-${Date.now()}`;
                      onChange(`enderecos.${enderecoId}.${field.name}`, e.target.value);
                    }}
                    className="mt-1"
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    );
  };

  return (
    <Form {...form}>
      <div className="m-10">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">{fields.map(renderField)}</div>
      </div>
    </Form>
  );
});
Enderecos.displayName = "Enderecos";

// Componente para Dados Bancários
const DadosBancarios = forwardRef<
  { validate: () => Promise<boolean> },
  { formData: any; onChange: (path: string, value: any) => void; fields: FormFieldDef[] }
>(({ formData, onChange, fields }, ref) => {
  const primeiroDadoBancario = formData.dados_bancarios?.[0] || {};

  const createSchema = () => {
    const schemaObj: Record<string, any> = {};
    fields.forEach((field) => {
      if (field.required) {
        schemaObj[field.name] = z.string().min(1, `${field.label} é obrigatório`);
      } else {
        schemaObj[field.name] = z.string().optional();
      }
    });
    return z.object(schemaObj);
  };

  const dadosBancariosSchema = createSchema();
  type DadosBancariosFormData = z.infer<typeof dadosBancariosSchema>;

  const form = useForm<DadosBancariosFormData>({
    resolver: zodResolver(dadosBancariosSchema),
    defaultValues: fields.reduce(
      (acc, field) => {
        acc[field.name as keyof DadosBancariosFormData] = primeiroDadoBancario[field.name] || "";
        return acc;
      },
      {} as Record<string, any>
    )
  });

  useEffect(() => {
    fields.forEach((field) => {
      form.setValue(
        field.name as keyof DadosBancariosFormData,
        primeiroDadoBancario[field.name] || ""
      );
    });
  }, [formData, form, fields, primeiroDadoBancario]);

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const result = await form.trigger();
      if (!result) {
        toast.warning("Preencha os campos obrigatórios corretamente");
      }
      return result;
    }
  }));

  const renderField = (field: FormFieldDef) => {
    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name as keyof DadosBancariosFormData}
        render={({ field: fieldProps }) => (
          <FormItem className="space-y-2">
            <FormLabel>{field.label}</FormLabel>
            <FormControl>
              {field.type === "select" && field.name === "tipo_pix" ? (
                <Combobox
                  data={field.options || []}
                  displayField="label"
                  value={
                    field.options?.find((opt) => opt.value === primeiroDadoBancario.tipo_pix) ??
                    null
                  }
                  onChange={(selected) => {
                    const selectedValue = selected?.value ?? "";
                    fieldProps.onChange(selectedValue);
                    onChange(`dados_bancarios.0.${field.name}`, selectedValue);
                  }}
                  searchFields={["label"]}
                />
              ) : (
                <Input
                  {...fieldProps}
                  placeholder={field.label}
                  value={fieldProps.value || ""}
                  onChange={(e) => {
                    fieldProps.onChange(e.target.value);
                    onChange(`dados_bancarios.0.${field.name}`, e.target.value);
                  }}
                  className="mt-1"
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Form {...form}>
      <div className="m-10">
        <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-3">
          {fields.map(renderField)}
        </div>
      </div>
    </Form>
  );
});
DadosBancarios.displayName = "DadosBancarios";

// Componente para Documentos
const Documentos = forwardRef<
  { validate: () => Promise<boolean> },
  { formData: any; onChange: (path: string, value: any) => void; fields: FormFieldDef[] }
>(({ formData }, ref) => {
  useImperativeHandle(ref, () => ({
    validate: async () => true // Sem validação obrigatória para documentos
  }));

  const isImage = (url: string): boolean => {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
    return imageExtensions.some((ext) => url.toLowerCase().includes(ext));
  };

  const getFileName = (url: string): string => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      // Remove parâmetros de query da URL
      return pathname.split("/").pop()?.split("?")[0] || "documento";
    } catch {
      return url.split("/").pop()?.split("?")[0] || "documento";
    }
  };

  const getFileType = (url: string): string => {
    const extension = url.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(extension)) {
      return "image";
    } else if (extension === "pdf") {
      return "pdf";
    } else if (["doc", "docx"].includes(extension)) {
      return "word";
    }
    return "other";
  };

  const FileIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-12 w-12 text-red-500" />;
      case "word":
        return <FileText className="h-12 w-12 text-blue-500" />;
      case "image":
        return <FileText className="h-12 w-12 text-green-500" />;
      default:
        return <FileText className="h-12 w-12 text-gray-500" />;
    }
  };

  return (
    <div className="m-10">
      <div className="space-y-4">
        {formData.documentos && formData.documentos.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Documentos do Cliente</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {formData.documentos.map((doc: any, index: number) => {
                const fileName = getFileName(doc.url_doc);
                const fileType = getFileType(doc.url_doc);
                const isImg = fileType === "image";

                return (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg border bg-gray-50 transition-colors hover:bg-gray-100 dark:bg-gray-800">
                    {isImg ? (
                      <div className="group relative">
                        <img
                          src={doc.url_doc}
                          alt={fileName}
                          className="h-48 w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            // Mostrar ícone se a imagem falhar ao carregar
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                              const fallback = document.createElement("div");
                              fallback.className =
                                "p-4 flex items-center justify-center bg-gray-200 h-48";
                              fallback.innerHTML =
                                '<svg class="h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                        <div className="bg-opacity-0 group-hover:bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.open(doc.url_doc, "_blank")}
                            className="bg-opacity-50 hover:bg-opacity-70 bg-black text-white">
                            Visualizar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-gray-200 p-4">
                        <FileIcon type={fileType} />
                      </div>
                    )}

                    <div className="p-3">
                      <div className="mb-2">
                        <span
                          className="block max-w-xs truncate text-sm font-medium"
                          title={fileName}>
                          {fileName}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">{fileType}</span>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.url_doc, "_blank")}
                        className="w-full">
                        {isImg ? "Visualizar Imagem" : "Abrir Documento"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border bg-gray-50 py-8 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-600">Nenhum documento encontrado para este cliente.</p>
          </div>
        )}
      </div>
    </div>
  );
});
Documentos.displayName = "Documentos";

export default function EditarCliente({
  cliente,
  onClose,
  onRefresh
}: {
  cliente: any;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const { token, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("DadosPessoais");
  const [fetchingData, setFetchingData] = useState(false);

  const tabOrder = ["DadosPessoais", "Contato", "Enderecos", "DadosBancarios", "Documentos"];

  // Refs para validação de cada aba
  const dadosPessoaisRef = useRef<TabRef | null>(null);
  const telefonesRef = useRef<TabRef | null>(null);
  const enderecosRef = useRef<TabRef | null>(null);
  const bancariosRef = useRef<TabRef | null>(null);
  const documentosRef = useRef<TabRef | null>(null);

  const tabRefs: Record<string, React.RefObject<TabRef | null>> = {
    DadosPessoais: dadosPessoaisRef,
    Contato: telefonesRef,
    Enderecos: enderecosRef,
    DadosBancarios: bancariosRef,
    Documentos: documentosRef
  };

  const [formData, setFormData] = useState({
    hash: "",
    nome: "",
    nome_pai: "",
    nome_mae: "",
    tipo_documento: "",
    numero_documento: "",
    cpf: cliente.cpf || "",
    telefones: {},
    enderecos: {},
    emails: { email: "", status: 1 },
    dados_bancarios: [
      {
        id_banco: "019611f9-3d2d-7200-9289-688323e474b5",
        status: 1,
        pix: "",
        tipo_pix: ""
      }
    ],
    documentos: [],
    status: 1
  });

  // Novo useEffect para buscar dados do endpoint
  useEffect(() => {
    const fetchClienteData = async () => {
      if (!cliente?.cpf) return;

      setFetchingData(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/cliente/${cliente.cpf}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && response.data.length > 0) {
          const clienteData = response.data[0];

          setFormData({
            hash: clienteData.hash || "",
            nome: clienteData.nome || "",
            nome_pai: clienteData.nome_pai || "",
            nome_mae: clienteData.nome_mae || "",
            tipo_documento: clienteData.tipo_documento?.toString() || "",
            numero_documento: clienteData.numero_documento || "",
            cpf: clienteData.cpf || "",
            telefones: clienteData.telefones || {},
            enderecos: clienteData.enderecos || {},
            emails: clienteData.emails || { email: "", status: 1 },
            dados_bancarios: clienteData.dados_bancarios || [
              {
                id_banco: "019611f9-3d2d-7200-9289-688323e474b5",
                status: 1,
                pix: "",
                tipo_pix: ""
              }
            ],
            documentos: clienteData.documentos || [],
            status: clienteData.status || 1
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados do cliente:", error);
        toast.error("Erro ao carregar dados do cliente");
      } finally {
        setFetchingData(false);
      }
    };

    fetchClienteData();
  }, [cliente?.cpf, token]);

  // Adicionar indicador de carregamento no JSX
  if (fetchingData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-10">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2"></div>
            <p>Carregando dados do cliente...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getFields = (sectionName: string): FormFieldDef[] => {
    const section = fixedFormSections.find((s) => s.section === sectionName);
    return section ? section.fields : [];
  };

  const handleChange = (path: string, value: any) => {
    const keys = path.split(".");
    setFormData((prev) => {
      const updated = structuredClone(prev);
      let obj: any = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!obj[key]) {
          obj[key] = /^\d+$/.test(keys[i + 1]) ? [] : {};
        }
        obj = obj[key];
      }

      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(`${API_BASE_URL}/cliente/${formData.hash}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Dados atualizados com sucesso!", {
      style: {
        background: 'var(--toast-success)',
        color: 'var(--toast-success-foreground)',
        boxShadow: 'var(--toast-shadow)'
      }
    });
      console.log("Cliente atualizado:", response.data);
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toastComponent.error("Erro ao atualizar dados do cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="py-0">
      <CardHeader className="mt-6">
        <div className="flex items-center justify-between">
          <CardTitle>
            Cliente: <span className="text-primary">{formData.nome}</span>
          </CardTitle>
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Voltar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* <div className="mb-4 flex items-center justify-between"> */}
          <TabsList className="w-full">
            <TabsTrigger value="DadosPessoais">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="Contato">Contato</TabsTrigger>
            <TabsTrigger value="Enderecos">Endereços</TabsTrigger>
            <TabsTrigger value="DadosBancarios">Dados Bancários</TabsTrigger>
            <TabsTrigger value="Documentos">Documentos</TabsTrigger>
          </TabsList>
          {/* <Button type="button" variant="outline" onClick={onClose}>
              Voltar
            </Button> */}
          {/* </div> */}

          <TabsContent value="DadosPessoais">
            <DadosPessoais
              ref={dadosPessoaisRef}
              formData={formData}
              onChange={handleChange}
              fields={getFields("DadosPessoais")}
            />
          </TabsContent>

          <TabsContent value="Contato">
            <Contato
              ref={telefonesRef}
              formData={formData}
              onChange={handleChange}
              fields={getFields("Contato")}
            />
          </TabsContent>

          <TabsContent value="Enderecos">
            <Enderecos
              ref={enderecosRef}
              formData={formData}
              onChange={handleChange}
              fields={getFields("Enderecos")}
            />
          </TabsContent>

          <TabsContent value="DadosBancarios">
            <DadosBancarios
              ref={bancariosRef}
              formData={formData}
              onChange={handleChange}
              fields={getFields("DadosBancarios")}
            />
          </TabsContent>
          <TabsContent value="Documentos">
            <Documentos
              ref={documentosRef}
              formData={formData}
              onChange={handleChange}
              fields={getFields("Documentos")}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
