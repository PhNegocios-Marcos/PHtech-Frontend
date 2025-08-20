"use client";

import React, { forwardRef, useImperativeHandle, useEffect, useState } from "react";
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

export const Contato = forwardRef(({ formData, onChange, fields }: ContatoProps, ref) => {
  const [emailValue, setEmailValue] = useState(formData.emails?.[0]?.email || "");
  const [dddValue, setDddValue] = useState(formData.telefones?.[0]?.ddd || "");
  const [telefoneValue, setTelefoneValue] = useState(formData.telefones?.[0]?.numero || "");

  // Garantir que o campo de email exista
  const allFields: FormField[] = [...fields];
  if (!allFields.some(f => f.name === "emails.0.email")) {
    allFields.push({
      name: "emails.0.email",
      label: "Email",
      type: "email",
      required: true
    });
  }

  // Criar valores padrão baseados nos campos recebidos
  const defaultValues: Record<string, any> = {};
  allFields.forEach(field => {
    if (field.name === 'emails.0.email') {
      defaultValues[field.name] = formData.emails?.[0]?.email || '';
    }
  });

  const createSchema = () => {
    const schemaObj: Record<string, any> = {};

    allFields.forEach((field) => {
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
    trigger,
    setValue
  } = useForm<ContatoFormData>({
    resolver: zodResolver(contatoSchema),
    defaultValues
  });

  const watchedValues = watch();

  // Atualizar o formData quando os valores mudarem
  useEffect(() => {
    allFields.forEach(field => {
      if (watchedValues[field.name] !== undefined) {
        onChange(field.name, watchedValues[field.name]);
      }
    });
  }, [watchedValues]);

  // Atualizar o email no formData quando mudar
  useEffect(() => {
    onChange('emails.0.email', emailValue);
  }, [emailValue]);

  // Atualizar o DDD no formData quando mudar
  useEffect(() => {
    onChange('telefones.0.ddd', dddValue);
  }, [dddValue]);

  // Atualizar o telefone no formData quando mudar
  useEffect(() => {
    onChange('telefones.0.numero', telefoneValue);
  }, [telefoneValue]);

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

    if (field.name === 'emails.0.email') {
      return (
        <div key={field.name} className="col-span-2">
          <label className="block text-sm font-medium mb-1">
            {field.label}
            {field.required && <span className="text-red-500">*</span>}
          </label>
          <Input
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            type={field.type}
            placeholder={field.label}
            className="mt-1"
          />
          {isErrorString && (
            <p className="text-sm text-red-600 mt-1">
              {errorMessage}
            </p>
          )}
        </div>
      );
    }

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
          className="mt-1"
          onChange={(e) => {
            setValue(field.name, e.target.value);
            onChange(field.name, e.target.value);
          }}
        />
        {isErrorString && (
          <p className="text-sm text-red-600 mt-1">
            {errorMessage}
          </p>
        )}
      </div>
    );
  };

  return (
    <form className="m-10 grid grid-cols-1 gap-5" onSubmit={(e) => e.preventDefault()}>
      {allFields.map(renderField)}
      
      {/* Campos de telefone fixos */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">
            DDD
            <span className="text-red-500">*</span>
          </label>
          <Input
            value={dddValue}
            onChange={(e) => setDddValue(e.target.value.replace(/\D/g, '').slice(0, 2))}
            placeholder="DDD"
            className="mt-1"
            maxLength={2}
          />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">
            Telefone
            <span className="text-red-500">*</span>
          </label>
          <Input
            value={telefoneValue}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              let formattedValue = value;
              
              if (value.length <= 11) {
                if (value.length <= 6) {
                  formattedValue = value.replace(/(\d{0,4})/, '$1');
                } else if (value.length <= 10) {
                  formattedValue = value.replace(/(\d{4})(\d{0,4})/, '$1-$2');
                } else {
                  formattedValue = value.replace(/(\d{5})(\d{0,4})/, '$1-$2');
                }
              }
              
              setTelefoneValue(formattedValue);
            }}
            placeholder="Número do telefone"
            className="mt-1"
            maxLength={11}
          />
        </div>
      </div>
    </form>
  );
});

Contato.displayName = "Contato";
