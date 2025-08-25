"use client";

import React, { forwardRef, useImperativeHandle } from "react";
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
}

interface ContatoProps {
  formData: any;
  onChange: (path: string, value: any) => void;
  fields: FormField[];
}

const getNestedValue = (obj: any, path: string): string => {
  return path.split(".").reduce((acc, part) => acc?.[part], obj) || "";
};

export const Contato = forwardRef(({ formData, onChange, fields }: ContatoProps, ref) => {
  const defaultValues: Record<string, any> = {};
  fields.forEach((field) => {
    defaultValues[field.name] = getNestedValue(formData, field.name);
  });

  const schemaObj: Record<string, any> = {};
  fields.forEach((field) => {
    if (field.required) {
      let zField = z.string().min(1, `${field.label} é obrigatório`);
      if (field.type === "email") zField = zField.email("Email inválido");
      schemaObj[field.name] = zField;
    } else {
      schemaObj[field.name] = z.string().optional();
    }
  });
  const contatoSchema = z.object(schemaObj);
  type ContatoFormData = z.infer<typeof contatoSchema>;

  const {
    register,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<ContatoFormData>({
    resolver: zodResolver(contatoSchema),
    defaultValues,
  });

  useImperativeHandle(ref, () => ({
    validate: async () => {
      const result = await trigger();
      if (!result) {
        toast.warning("Preencha os campos obrigatórios corretamente", {
          style: {
            background: "var(--toast-warning)",
            color: "var(--toast-warning-foreground)",
            boxShadow: "var(--toast-shadow)",
          },
        });
      }
      return result;
    },
  }));

  return (
    <form className="m-10 grid grid-cols-1 gap-5" onSubmit={(e) => e.preventDefault()}>
      {fields.map((field) => {
        const errorMessage = errors[field.name]?.message;
        const isErrorString = typeof errorMessage === "string";
        return (
          <div key={field.name} className="col-span-2">
            <label className="block text-sm font-medium mb-1">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input
              {...register(field.name)}
              type={field.type}
              placeholder={field.label}
              value={getNestedValue(formData, field.name)}
              onChange={(e) => {
                setValue(field.name, e.target.value);
                onChange(field.name, e.target.value);
              }}
              className="mt-1"
            />
            {isErrorString && <p className="text-sm text-red-600 mt-1">{errorMessage}</p>}
          </div>
        );
      })}
    </form>
  );
});

Contato.displayName = "Contato";