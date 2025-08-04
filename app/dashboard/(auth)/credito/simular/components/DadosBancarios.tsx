"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/Combobox";
import InputMask from "react-input-mask";

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: { value: string; label: string }[];
}

interface DadosBancariosProps {
  formData: any;
  onChange: (path: string, value: any) => void;
  fields: FormField[];
}

export const DadosBancarios = forwardRef(
  ({ formData, onChange, fields }: DadosBancariosProps, ref) => {
    const d = formData.dados_bancarios[0];

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

    const dadosBancariosSchema = createSchema();
    type DadosBancariosFormData = z.infer<typeof dadosBancariosSchema>;

    const {
      register,
      setValue,
      formState: { errors },
      trigger
    } = useForm<DadosBancariosFormData>({
      resolver: zodResolver(dadosBancariosSchema),
      defaultValues: fields.reduce(
        (acc, field) => {
          acc[field.name] = d[field.name] || "";
          return acc;
        },
        {} as Record<string, any>
      )
    });

    useImperativeHandle(ref, () => ({
      validate: () => trigger()
    }));

    const pixKeyTypeOptions = [
      { id: "1", name: "CPF" },
      { id: "2", name: "Telefone" },
      { id: "3", name: "E-mail" },
      { id: "4", name: "Chave Aleatória" }
    ];

    const renderField = (field: FormField) => {
      const errorMessage = errors[field.name]?.message;
      const isErrorString = typeof errorMessage === "string";

      if (field.name === "tipo_pix") {
        return (
          <div key={field.name}>
            <span>{field.label}</span>
            <Combobox
              data={pixKeyTypeOptions}
              displayField="name"
              value={pixKeyTypeOptions.find((opt) => opt.id === d.tipo_pix) ?? null}
              onChange={(selected) => {
                const selectedId = selected?.id ?? "";
                setValue("tipo_pix", selectedId);
                onChange("dados_bancarios.0.tipo_pix", selectedId);
              }}
              searchFields={["name"]}
            />
            {isErrorString && <p className="text-sm text-red-600">{errorMessage}</p>}
          </div>
        );
      }

      return (
        <div key={field.name}>
          <span>{field.label}</span>
          <Input
            {...register(field.name)}
            placeholder={field.label}
            value={d[field.name] || ""}
            onChange={(e) => {
              setValue(field.name, e.target.value);
              onChange(`dados_bancarios.0.${field.name}`, e.target.value);
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
          <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-4">
            {fields.map(renderField)}
          </div>
        </form>
      </div>
    );
  }
);

DadosBancarios.displayName = "DadosBancarios";
