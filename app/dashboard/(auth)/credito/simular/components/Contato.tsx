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

interface ContatoProps {
  formData: any;
  onChange: (path: string, value: any) => void;
  fields: FormField[];
}

export const Telefones = forwardRef(({ formData, onChange, fields }: ContatoProps, ref) => {
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
    watch,
    formState: { errors },
    trigger
  } = useForm<ContatoFormData>({
    resolver: zodResolver(contatoSchema),
    defaultValues: {
      ddd1: formData.telefones[0].ddd,
      numero1: formData.telefones[0].numero,
      ddd2: formData.telefones[1].ddd,
      numero2: formData.telefones[1].numero,
      email: formData.emails[0].email
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    onChange("telefones.0.ddd", watchedValues.ddd1);
  }, [watchedValues.ddd1]);

  useEffect(() => {
    onChange("telefones.0.numero", watchedValues.numero1);
  }, [watchedValues.numero1]);

  useEffect(() => {
    onChange("telefones.1.ddd", watchedValues.ddd2);
  }, [watchedValues.ddd2]);

  useEffect(() => {
    onChange("telefones.1.numero", watchedValues.numero2);
  }, [watchedValues.numero2]);

  useEffect(() => {
    onChange("emails.0.email", watchedValues.email);
  }, [watchedValues.email]);

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
          onChange={(e) => {
            onChange(
              `telefones.${fieldName.includes("1") ? "0" : "1"}.${fieldName.includes("ddd") ? "ddd" : "numero"}`,
              e.target.value
            );
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
    <form className="m-10 grid grid-cols-2 gap-5" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-4 gap-2">
        {fields.filter((f) => f.name.includes("1")).map(renderField)}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {fields.filter((f) => f.name.includes("2")).map(renderField)}
      </div>
      <div>{fields.filter((f) => f.name === "email").map(renderField)}</div>
    </form>
  );
});

Telefones.displayName = "Telefones";