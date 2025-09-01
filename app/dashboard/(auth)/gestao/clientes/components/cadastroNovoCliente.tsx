"use client";

import * as React from "react";
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button as ShadButton } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Combobox } from "@/components/Combobox";
import Cleave from "cleave.js/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Define FormSection type
interface FormSection {
  section: string;
  fields: FormField[];
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
      { name: "ddd1", label: "DDD", type: "text", required: true },
      { name: "numero1", label: "Número", type: "text", required: true },
      { name: "email", label: "Email", type: "text", required: true }
    ]
  },
  {
    section: "Enderecos",
    fields: [
      { name: "enderecos.0.cep", label: "CEP", type: "text", required: true },
      { name: "enderecos.0.logradouro", label: "Logradouro", type: "text", required: true },
      { name: "enderecos.0.numero", label: "Número", type: "number", required: true },
      { name: "enderecos.0.complemento", label: "Complemento", type: "text", required: false },
      { name: "enderecos.0.bairro", label: "Bairro", type: "text", required: true },
      { name: "enderecos.0.cidade", label: "Cidade", type: "text", required: true },
      { name: "enderecos.0.estado", label: "Estado", type: "text", required: true },
      { name: "enderecos.0.uf", label: "UF", type: "text", required: true }
    ]
  },
  {
    section: "DadosBancarios",
    fields: [
      { name: "dados_bancarios.0.agencia", label: "Agência", type: "text", required: false },
      { name: "dados_bancarios.0.conta", label: "Conta", type: "text", required: false },
      {
        name: "dados_bancarios.0.tipo_pix",
        label: "Tipo de Chave Pix",
        type: "select",
        required: true,
        options: [
          { value: "cpf", label: "CPF" },
          { value: "cnpj", label: "CNPJ" },
          { value: "email", label: "E-mail" },
          { value: "telefone", label: "Telefone" },
          { value: "aleatoria", label: "Chave Aleatória" }
        ]
      },
      { name: "dados_bancarios.0.pix", label: "Chave Pix/TED", type: "text", required: true }
    ]
  }
];

interface FormField {
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

const DadosPessoais = forwardRef<
  { validate: () => Promise<boolean> },
  { formData: any; onChange: (path: string, value: any) => void; fields: FormField[] }
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

  const renderField = (field: FormField) => {
    const errorMessage = errors[field.name]?.message;
    const isErrorString = typeof errorMessage === "string";

    switch (field.type) {
      case "text":
        return (
          <div key={field.name} className="space-y-2">
            <span>{field.label}</span>
            <Input
              {...register(field.name)}
              placeholder={field.label}
              onChange={(e) => {
                setValue(field.name, e.target.value);
                onChange(field.name, e.target.value);
              }}
              value={formData[field.name] || ""}
              className="mt-1"
            />
            {isErrorString && <p className="text-sm text-red-600">{errorMessage}</p>}
          </div>
        );

      case "select":
        // Para tipo_documento, converte para número
        if (field.name === "tipo_documento") {
          return (
            <div key={field.name} className="space-y-2">
              <span>{field.label}</span>
              <Combobox
                value={field.options?.find((opt) => Number(opt.value) === Number(formData[field.name])) || null}
                onChange={(selected) => {
                  setValue(field.name, selected?.value ? Number(selected.value) : undefined);
                  onChange(field.name, selected?.value ? Number(selected.value) : undefined);
                }}
                data={field.options || []}
                displayField="label"
                placeholder={field.label}
                searchFields={["label"]}
                className="mt-1"
              />
              {isErrorString && <p className="text-sm text-red-600">{errorMessage}</p>}
            </div>
          );
        }
        return (
          <div key={field.name} className="space-y-2">
            <span>{field.label}</span>
            <Combobox
              value={field.options?.find((opt) => opt.value === formData[field.name]) || null}
              onChange={(selected) => {
                setValue(field.name, selected?.value || "");
                onChange(field.name, selected?.value || "");
              }}
              data={field.options || []}
              displayField="label"
              placeholder={field.label}
              searchFields={["label"]}
              className="mt-1"
            />
            {isErrorString && <p className="text-sm text-red-600">{errorMessage}</p>}
          </div>
        );

      case "date":
        return (
          <div key={field.name} className="space-y-2">
            <span>{field.label}</span>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                {...register(field.name)}
                onChange={(e) => {
                  setValue(field.name, e.target.value);
                  onChange(field.name, e.target.value);
                }}
                value={formData[field.name] || ""}
                className="mt-1"
              />
              <Popover>
                <PopoverTrigger asChild></PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData[field.name] ? new Date(formData[field.name]) : undefined}
                    onSelect={(date) => {
                      const isoDate = date ? date.toISOString().slice(0, 10) : "";
                      setValue(field.name, isoDate);
                      onChange(field.name, isoDate);
                    }}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>
            {isErrorString && <p className="text-sm text-red-600">{errorMessage}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form
      className="m-10 grid grid-cols-1 gap-5 space-y-3 md:grid-cols-2"
      onSubmit={(e) => e.preventDefault()}>
      {uniqueFields.map(renderField)}
    </form>
  );
});
DadosPessoais.displayName = "DadosPessoais";

const Contato = forwardRef<
  { validate: () => Promise<boolean> },
  {
    formData: any;
    onChange: (path: string, value: any) => void;
    fields: FormField[];
    addPhone?: () => void;
  }
>(({ formData, onChange, fields, addPhone }, ref) => {
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

  const {
    register,
    setValue,
    watch,
    formState: { errors },
    trigger
  } = useForm<ContatoFormData>({
    resolver: zodResolver(contatoSchema),
    defaultValues: {
      ddd1: formData.telefones[0]?.ddd || "",
      numero1: formData.telefones[0]?.numero || "",
      ddd2: formData.telefones[1]?.ddd || "",
      numero2: formData.telefones[1]?.numero || "",
      email: formData.emails[0]?.email || ""
    }
  });

  // Sincroniza os valores do RHF com formData sempre que formData mudar
  useEffect(() => {
    setValue("ddd1", formData.telefones[0]?.ddd || "");
    setValue("numero1", formData.telefones[0]?.numero || "");
    setValue("ddd2", formData.telefones[1]?.ddd || "");
    setValue("numero2", formData.telefones[1]?.numero || "");
    setValue("email", formData.emails[0]?.email || "");
  }, [formData, setValue]);

  const watchedValues = watch();

  // Atualiza formData imediatamente ao digitar
  const handleInputChange = (fieldName: string, value: string) => {
    setValue(fieldName, value);
    if (fieldName === "email") {
      onChange("emails.0.email", value);
    } else if (fieldName.includes("ddd")) {
      onChange(`telefones.${fieldName.includes("1") ? "0" : "1"}.ddd`, value);
    } else if (fieldName.includes("numero")) {
      onChange(`telefones.${fieldName.includes("1") ? "0" : "1"}.numero`, value);
    }
  };

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

  const renderField = (field: FormField) => {
    const fieldName = field.name;
    const value = watchedValues[fieldName] || "";
    const errorMessage = errors[field.name]?.message;
    const isErrorString = typeof errorMessage === "string";

    return (
      <div key={field.name} className={field.name.includes("ddd") ? "col-span-1" : "col-span-3"}>
        <span>{field.label}</span>
        <Input
          {...register(fieldName)}
          placeholder={field.label}
          value={value}
          onChange={(e) => handleInputChange(fieldName, e.target.value)}
          className="mt-1"
        />
        {isErrorString && <p className="text-sm text-red-600">{errorMessage}</p>}
      </div>
    );
  };

  return (
    <form className="m-10 grid grid-cols-2 gap-5" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-3 gap-2">
        {fields.filter((f) => f.name.includes("1")).map(renderField)}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {fields.filter((f) => f.name.includes("2")).map(renderField)}
      </div>
      <div>{fields.filter((f) => f.name === "email").map(renderField)}</div>
      {addPhone && (
        <div className="col-span-2 mt-4">
          <Button type="button" onClick={addPhone}>
            Adicionar Telefone
          </Button>
        </div>
      )}
    </form>
  );
});
Contato.displayName = "Contato";

const Enderecos = forwardRef<
  { validate: () => Promise<boolean> },
  { formData: any; onChange: (path: string, value: any) => void; fields: FormField[] }
>(({ formData, onChange, fields }, ref) => {
  const e = formData.enderecos[0] || {};

  const createSchema = () => {
    const schemaObj: Record<string, any> = {};
    fields.forEach((field) => {
      const fieldName = field.name.startsWith("enderecos.0.")
        ? field.name.split(".").slice(2).join(".")
        : field.name;
      if (field.required) {
        schemaObj[fieldName] = z.string().min(1, `${field.label} é obrigatório`);
      } else {
        schemaObj[fieldName] = z.string().optional();
      }
    });
    return z.object(schemaObj);
  };

  const enderecoSchema = createSchema();
  type EnderecoFormData = z.infer<typeof enderecoSchema>;

  const {
    register,
    setValue,
    formState: { errors },
    trigger
  } = useForm<EnderecoFormData>({
    resolver: zodResolver(enderecoSchema),
    defaultValues: fields.reduce(
      (acc, field) => {
        const fieldName = field.name.startsWith("enderecos.0.")
          ? field.name.split(".").slice(2).join(".")
          : field.name;
        acc[fieldName] = e[fieldName] || "";
        return acc;
      },
      {} as Record<string, any>
    )
  });

  useEffect(() => {
    fields.forEach((field) => {
      const fieldName = field.name.startsWith("enderecos.0.")
        ? field.name.split(".").slice(2).join(".")
        : field.name;
      setValue(fieldName, e[fieldName] || "");
    });
  }, [formData, setValue, fields]);

  useImperativeHandle(ref, () => ({
    validate: () => trigger()
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
        toast.error("CEP não encontrado", {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
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
        setValue(key as keyof EnderecoFormData, val);
        onChange(`enderecos.0.${key}`, val);
      });

      toast.success("Endereço encontrado com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      toast.error("Não foi possível buscar o endereço. Verifique sua conexão.", {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    }
  };

  const renderField = (field: FormField) => {
    const fieldName = field.name.startsWith("enderecos.0.")
      ? field.name.split(".").slice(2).join(".")
      : field.name;
    const errorMessage = errors[fieldName]?.message;
    const isErrorString = typeof errorMessage === "string";

    // Garante que o valor do input é sempre string
    const value =
      field.name === "enderecos.0.numero"
        ? e["numero"] !== undefined
          ? String(e["numero"])
          : ""
        : e[fieldName] || "";

    return (
      <div key={field.name} className="grid gap-1">
        <span>{field.label}</span>
        {field.name === "enderecos.0.cep" ? (
          <Input
            {...register(fieldName)}
            placeholder={field.label}
            value={e["cep"] || ""}
            onChange={(e) => {
              const rawValue = e.target.value;
              const formattedValue = formatCep(rawValue);
              setValue(fieldName, formattedValue);
              onChange(field.name, formattedValue);
              if (formattedValue.replace(/\D/g, "").length === 8) {
                buscarEndereco(formattedValue);
              }
            }}
            className="mt-1"
          />
        ) : field.name === "enderecos.0.numero" ? (
          <Input
            {...register(fieldName)}
            placeholder={field.label}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(fieldName, e.target.value);
              onChange(field.name, e.target.value);
            }}
            className="mt-1"
          />
        ) : (
          <Input
            {...register(fieldName)}
            placeholder={field.label}
            type={field.type}
            value={e[fieldName] || ""}
            onChange={(e) => {
              const value = e.target.value;
              setValue(fieldName, value);
              onChange(field.name, value);
            }}
            className="mt-1"
          />
        )}
        {isErrorString && <p className="text-sm text-red-600">{errorMessage}</p>}
      </div>
    );
  };

  return (
    <div className="m-10">
      <form className="grid grid-cols-1 gap-5 md:grid-cols-3" onSubmit={(e) => e.preventDefault()}>
        {fields.map(renderField)}
        <div className="grid gap-1">
          <span>Complemento</span>
          <Input
            placeholder="Complemento"
            value={e.complemento || ""}
            onChange={(ev) => {
              onChange("enderecos.0.complemento", ev.target.value);
            }}
            className="mt-1"
          />
        </div>
      </form>
    </div>
  );
});
Enderecos.displayName = "Enderecos";

const DadosBancarios = forwardRef<
  { validate: () => Promise<boolean> },
  { formData: any; onChange: (path: string, value: any) => void; fields: FormField[] }
>(({ formData, onChange, fields }, ref) => {
  const uniqueFields = Array.from(new Map(fields.map((field) => [field.name, field])).values());

  const createSchema = () => {
    const schemaObj: Record<string, any> = {};
    uniqueFields.forEach((field) => {
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

  const {
    register,
    setValue,
    formState: { errors },
    trigger
  } = useForm<DadosBancariosFormData>({
    resolver: zodResolver(dadosBancariosSchema),
    defaultValues: uniqueFields.reduce(
      (acc, field) => {
        const keys = field.name.split(".");
        let value = formData;
        for (const key of keys) {
          value = value[key] || "";
        }
        acc[field.name] = value;
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

  const renderField = (field: FormField) => {
    const errorMessage = errors[field.name]?.message;
    const isErrorString = typeof errorMessage === "string";

    if (field.type === "select" && field.name === "dados_bancarios.0.tipo_pix") {
      return (
        <div key={field.name} className="space-y-2">
          <span>{field.label}</span>
          <Combobox
            data={field.options || []}
            displayField="label"
            value={
              field.options?.find((opt) => opt.value === formData.dados_bancarios[0].tipo_pix) ??
              null
            }
            onChange={(selected) => {
              const selectedValue = selected?.value ?? "";
              setValue(field.name, selectedValue);
              onChange(field.name, selectedValue);
            }}
            searchFields={["label"]}
          />
          {isErrorString && <p className="text-sm text-red-600">{errorMessage}</p>}
        </div>
      );
    }

    return (
      <div key={field.name} className="space-y-2">
        <span>{field.label}</span>
        <Input
          {...register(field.name)}
          placeholder={field.label}
          value={formData.dados_bancarios[0][field.name.split(".").pop()!] || ""}
          onChange={(e) => {
            setValue(field.name, e.target.value);
            onChange(field.name, e.target.value);
          }}
          className="mt-1"
        />
        {isErrorString && <p className="text-sm text-red-600">{errorMessage}</p>}
      </div>
    );
  };

  return (
    <div className="m-10">
      <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
        <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-3">
          {uniqueFields.map(renderField)}
        </div>
      </form>
    </div>
  );
});
DadosBancarios.displayName = "DadosBancarios";

interface CadastroClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CadastroClienteModal({ isOpen, onClose }: CadastroClienteModalProps) {
  const { token } = useAuth();
  const [formSections] = useState<FormSection[]>(fixedFormSections);
  const [loading] = useState(false);
  const [activeTab, setActiveTab] = useState("DadosPessoais");
  const tabOrder = ["DadosPessoais", "Contato", "Enderecos", "DadosBancarios"];

  const dadosPessoaisRef = useRef<TabRef | null>(null);
  const telefonesRef = useRef<TabRef | null>(null);
  const enderecosRef = useRef<TabRef | null>(null);
  const bancariosRef = useRef<TabRef | null>(null);

  const tabRefs: Record<string, React.RefObject<TabRef | null>> = {
    DadosPessoais: dadosPessoaisRef,
    Contato: telefonesRef,
    Enderecos: enderecosRef,
    DadosBancarios: bancariosRef
  };

  const [formData, setFormData] = useState({
    nome: "",
    nome_pai: "",
    nome_mae: "",
    tipo_documento: "",
    numero_documento: "",
    cpf: "",
    sexo: "",
    data_nascimento: "",
    estado_civil: "",
    naturalidade: "",
    nacionalidade: "",
    telefones: {
      0: { ddd: "", numero: "" }
    },
    enderecos: {
      0: {
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        uf: ""
      }
    },
    emails: {
      0: {
        email: "",
        status: 1
      }
    },
    dados_bancarios: {
      0: {
        id_banco: "019611f9-3d2d-7200-9289-688323e474b5",
        status: 1,
        pix: "",
        tipo_pix: ""
      }
    }
  });

  const getFields = (sectionName: string): FormField[] => {
    const section = formSections.find((s) => s.section === sectionName);
    if (!section) return [];
    if (sectionName === "Enderecos") {
      return section.fields.map((field) => ({
        ...field,
        name: field.name.startsWith("enderecos.0.") ? field.name : `enderecos.0.${field.name}`
      }));
    }
    return section.fields;
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

  const handleNext = async () => {
    const ref = tabRefs[activeTab];
    if (ref?.current?.validate) {
      const isValid = await ref.current.validate();
      if (!isValid) {
        toast.warning("Preencha todos os campos obrigatórios antes de continuar", {
          style: {
            background: "var(--toast-warning)",
            color: "var(--toast-warning-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
        return;
      }
    }
    const currentIndex = tabOrder.indexOf(activeTab);
    const nextTab = tabOrder[currentIndex + 1];
    if (nextTab) {
      setActiveTab(nextTab);
    }
  };

  const sanitizeFormData = (data: any): any => {
    const clone = structuredClone(data);
    const limparCampos = [
      "cpf",
      "numero_documento",
      "telefones.0.ddd",
      "telefones.0.numero",
      "telefones.1.ddd",
      "telefones.1.numero",
      "enderecos.0.cep"
    ];

    limparCampos.forEach((path) => {
      const keys = path.split(".");
      let obj = clone;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj?.[keys[i]];
        if (!obj) return;
      }
      const lastKey = keys[keys.length - 1];
      if (obj && typeof obj[lastKey] === "string") {
        obj[lastKey] = obj[lastKey].replace(/[.\-]/g, "");
      }
    });

    return clone;
  };

  const handleSubmit = async () => {
    for (const tab of tabOrder) {
      const ref = tabRefs[tab];
      if (ref?.current?.validate) {
        const valid = await ref.current.validate();
        if (!valid) {
          setActiveTab(tab);
          toast.warning("Preencha todos os campos obrigatórios", {
            style: {
              background: "var(--toast-warning)",
              color: "var(--toast-warning-foreground)",
              boxShadow: "var(--toast-shadow)"
            }
          });
          return;
        }
      }
    }

    try {
      const sanitizedData = sanitizeFormData(formData);
      // Chumba o id_banco
      if (sanitizedData.dados_bancarios && sanitizedData.dados_bancarios[0]) {
        sanitizedData.dados_bancarios[0].id_banco = "019611f9-3d2d-7200-9289-688323e474b5";
      }
      // Garante tipo_documento como número
      if (typeof sanitizedData.tipo_documento === "string") {
        sanitizedData.tipo_documento = Number(sanitizedData.tipo_documento);
      }
      const response = await axios.post(`${API_BASE_URL}/cliente`, sanitizedData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        toast.success("Cliente cadastrado com sucesso!", {
          style: {
            background: "var(--toast-success)",
            color: "var(--toast-success-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
        onClose();
      }
    } catch (err: any) {
      console.error("Erro ao cadastrar cliente:", err);
      toast.error(`Erro ao cadastrar cliente: ${err.response?.data?.message || err.message}`, {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    }
  };

  // Remove useEffect for fetching fields, now using fixed fields

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 h-full w-full overflow-auto bg-background p-6 shadow-lg md:w-1/2">
        <Card className="mx-auto mt-10 max-w-6xl space-y-6 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Cadastro de Cliente</h1>
            <button
              type="button"
              onClick={onClose}
              className="text-2xl font-bold hover:text-gray-900"
              aria-label="Fechar">
              ×
            </button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="DadosPessoais">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="Contato">Contato</TabsTrigger>
              <TabsTrigger value="Enderecos">Endereços</TabsTrigger>
              <TabsTrigger value="DadosBancarios">Dados Bancários</TabsTrigger>
            </TabsList>

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
                addPhone={() => {
                  // Add new phone logic
                  setFormData((prev) => {
                    const nextIndex = Object.keys(prev.telefones).length;
                    return {
                      ...prev,
                      telefones: {
                        ...prev.telefones,
                        [nextIndex]: { ddd: "", numero: "" }
                      }
                    };
                  });
                }}
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
          </Tabs>

          <div className="flex justify-end">
            {activeTab === tabOrder[tabOrder.length - 1] ? (
              <Button onClick={handleSubmit}>Cadastrar</Button>
            ) : (
              <Button onClick={handleNext}>Próximo</Button>
            )}
          </div>
        </Card>
      </aside>
    </>
  );
}
