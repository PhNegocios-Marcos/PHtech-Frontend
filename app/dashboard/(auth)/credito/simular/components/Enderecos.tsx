// Arquivo: Enderecos.tsx
"use client";

import React, { forwardRef, useImperativeHandle, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  mask?: string;
}

interface EnderecoProps {
  formData: any;
  onChange: (path: string, value: any) => void;
  fields: FormField[];
}

export const Enderecos = forwardRef(({ formData, onChange, fields }: EnderecoProps, ref) => {
  const e = formData.enderecos[0] || {};

  // Criar schema dinamicamente
  const createSchema = () => {
    const schemaObj: Record<string, any> = {};

    fields.forEach((field) => {
      const fieldName = field.name.startsWith("enderecos.0.") ? field.name.split(".").slice(2).join(".") : field.name;
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
    trigger,
  } = useForm<EnderecoFormData>({
    resolver: zodResolver(enderecoSchema),
    defaultValues: fields.reduce(
      (acc, field) => {
        const fieldName = field.name.startsWith("enderecos.0.") ? field.name.split(".").slice(2).join(".") : field.name;
        acc[fieldName] = e[fieldName] || "";
        return acc;
      },
      {} as Record<string, any>
    ),
  });

  // Sincronizar formData com o estado do formulário
  useEffect(() => {
    fields.forEach((field) => {
      const fieldName = field.name.startsWith("enderecos.0.") ? field.name.split(".").slice(2).join(".") : field.name;
      setValue(fieldName, e[fieldName] || "");
    });
  }, [formData, setValue, fields]);

  useImperativeHandle(ref, () => ({
    validate: () => trigger(),
  }));

  // Função para formatar o CEP no formato 99999-999
  const formatCep = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length > 5) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
    }
    return cleaned;
  };

  const buscarEndereco = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      return;
    }

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();

      if (data.erro) {
        toast.error("CEP não encontrado", {
          style: {
            background: 'var(--toast-error)',
            color: 'var(--toast-error-foreground)',
            boxShadow: 'var(--toast-shadow)'
          }
        });
        return;
      }

      const campos = {
        logradouro: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "",
        uf: data.uf || "",
      };

      Object.entries(campos).forEach(([key, val]) => {
        setValue(key as keyof EnderecoFormData, val);
        onChange(`enderecos.0.${key}`, val);
      });

      toast.success("Endereço encontrado com sucesso!", {
        style: {
          background: 'var(--toast-success)',
          color: 'var(--toast-success-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      toast.error("Não foi possível buscar o endereço. Verifique sua conexão.", {
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
    }
  };

  const renderField = (field: FormField) => {
    const fieldName = field.name.startsWith("enderecos.0.") ? field.name.split(".").slice(2).join(".") : field.name;
    const errorMessage = errors[fieldName]?.message;
    const isErrorString = typeof errorMessage === "string";

    return (
      <div key={field.name} className="grid gap-1">
        <span>{field.label}</span>
        {field.name === "enderecos.0.cep" ? (
          <Input
            {...register(fieldName)}
            placeholder={field.label}
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
        ) : (
          <Input
            {...register(fieldName)}
            placeholder={field.label}
            type={field.type}
            onChange={(e) => {
              const value = field.type === "number" ? parseInt(e.target.value) || 0 : e.target.value;
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
        {/* Complemento (não validado) */}
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