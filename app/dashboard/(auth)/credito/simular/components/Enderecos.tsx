"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";

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
  const e = formData.enderecos[0];

  // Criar schema dinamicamente
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

  const {
    register,
    setValue,
    formState: { errors },
    trigger
  } = useForm<EnderecoFormData>({
    resolver: zodResolver(enderecoSchema),
    defaultValues: fields.reduce(
      (acc, field) => {
        acc[field.name] = e[field.name] || "";
        return acc;
      },
      {} as Record<string, any>
    )
  });

  useImperativeHandle(ref, () => ({
    validate: () => trigger()
  }));

  const buscarEndereco = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();

      if (data.erro) {
        alert("CEP não encontrado");
        return;
      }

      const campos = {
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
        uf: data.uf
      };

      Object.entries(campos).forEach(([key, val]) => {
        setValue(key as keyof EnderecoFormData, val);
        onChange(`enderecos.0.${key}`, val);
      });
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      alert("Não foi possível buscar o endereço. Verifique sua conexão.");
    }
  };

  const renderField = (field: FormField) => {
    const errorMessage = errors[field.name]?.message;
    const isErrorString = typeof errorMessage === "string";

    return (
      <div key={field.name}>
        <span>{field.label}</span>
        <Input
          {...register(field.name)}
          placeholder={field.label}
          value={e[field.name] || ""}
          onChange={async (ev) => {
            const value = ev.target.value;
            setValue(field.name, value);
            onChange(`enderecos.0.${field.name}`, value);
            if (field.name === "cep" && value.length === 8) {
              await buscarEndereco(value);
            }
          }}
          className="mt-1"
        />
        {isErrorString && <p className="text-sm text-red-600">{errorMessage}</p>}
      </div>
    );
  };

  return (
    <div className="m-10">
      <form className="grid grid-cols-1 gap-5 md:grid-cols-3" onSubmit={(e) => e.preventDefault()}>
        {fields.map(renderField)}
        {/* Complemento (não validado) */}
        <div>
          <span>Complemento</span>
          <Input
            placeholder="Complemento"
            value={e.complemento}
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
