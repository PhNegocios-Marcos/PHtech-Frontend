"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/Combobox";
import { toast } from "sonner";

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

export const DadosBancarios = forwardRef<
  { validate: () => Promise<boolean> },
  DadosBancariosProps
>(({ formData, onChange, fields }, ref) => {
  const uniqueFields = Array.from(
    new Map(fields.map((field) => [field.name, field])).values()
  );

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
            background: 'var(--toast-warning)',
            color: 'var(--toast-warning-foreground)',
            boxShadow: 'var(--toast-shadow)'
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
            value={field.options?.find((opt) => opt.value === formData.dados_bancarios[0].tipo_pix) ?? null}
            onChange={(selected) => {
              const selectedValue = selected?.value ?? "";
              setValue(field.name, selectedValue);
              onChange(field.name, selectedValue);
            }}
            searchFields={["label"]}
          />
          {isErrorString && (
            <p className="text-sm text-red-600">
              {errorMessage}
            </p>
          )}
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
        {isErrorString && (
          <p className="text-sm text-red-600">
            {errorMessage}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="m-10">
      <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
        <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-4">
          {uniqueFields.map(renderField)}
        </div>
      </form>
    </div>
  );
});

DadosBancarios.displayName = "DadosBancarios";