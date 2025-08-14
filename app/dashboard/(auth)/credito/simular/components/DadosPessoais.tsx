"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Cleave from "cleave.js/react";
import { Input } from "@/components/ui/input";
import { Combobox } from "./Combobox";
import { toast } from "sonner";

interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: { value: string; label: string }[];
}

interface DadosPessoaisProps {
  formData: any;
  onChange: (path: string, value: any) => void;
  fields: FormField[];
}

export const DadosPessoais = forwardRef<
  { validate: () => Promise<boolean> },
  DadosPessoaisProps
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
        acc[field.name] = formData[field.name] || "";
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
            {isErrorString && (
              <p className="text-sm text-red-600">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case "select":
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
            {isErrorString && (
              <p className="text-sm text-red-600">
                {errorMessage}
              </p>
            )}
          </div>
        );

      case "date":
        return (
          <div key={field.name} className="space-y-2">
            <span>{field.label}</span>
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
            {isErrorString && (
              <p className="text-sm text-red-600">
                {errorMessage}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form
      className="m-10 grid grid-cols-1 gap-5 space-y-3 md:grid-cols-2"
      onSubmit={(e) => e.preventDefault()}
    >
      {uniqueFields.map(renderField)}
    </form>
  );
});

DadosPessoais.displayName = "DadosPessoais";