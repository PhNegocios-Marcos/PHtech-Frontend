"use client";

import React, { forwardRef, useImperativeHandle, useEffect, useState } from "react";
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

export const DadosBancarios = forwardRef<{ validate: () => Promise<boolean> }, DadosBancariosProps>(
  ({ formData, onChange, fields }, ref) => {
    const uniqueFields = Array.from(new Map(fields.map((field) => [field.name, field])).values());
    const [currentPixType, setCurrentPixType] = useState("");

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

    const pixOptions = [
      { value: "1", label: "Chave CPF" },
      { value: "2", label: "Chave CNPJ" },
      { value: "3", label: "Chave E-mail" },
      { value: "4", label: "Chave Celular" }
    ];

    const {
      register,
      setValue,
      formState: { errors },
      trigger,
      watch
    } = useForm<DadosBancariosFormData>({
      resolver: zodResolver(dadosBancariosSchema),
      defaultValues: uniqueFields.reduce(
        (acc, field) => {
          const keys = field.name.split(".");
          let value = formData;
          for (const key of keys) {
            value = value?.[key] || "";
          }
          acc[field.name] = value;
          return acc;
        },
        {} as Record<string, any>
      )
    });

    // Sincronizar formData com o estado do formulário
    useEffect(() => {
      uniqueFields.forEach((field) => {
        const keys = field.name.split(".");
        let value = formData;
        for (const key of keys) {
          value = value?.[key] || "";
        }
        setValue(field.name, value);
      });

      // Inicializar o tipo PIX atual
      const pixType = getFieldValue("dados_bancarios.0.tipo_pix");
      setCurrentPixType(pixType);
    }, [formData, setValue, uniqueFields]);

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

    const getFieldValue = (fieldName: string) => {
      const keys = fieldName.split(".");
      let value = formData;
      for (const key of keys) {
        value = value?.[key] || "";
      }
      return value;
    };

    // Funções de máscara para cada tipo de PIX
    const applyMask = (value: string, pixType: string): string => {
      const cleanValue = value.replace(/\D/g, "");
      
      switch (pixType) {
        case "1": // CPF
          if (cleanValue.length <= 11) {
            return cleanValue
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d{1,2})/, '$1-$2')
              .replace(/(-\d{2})\d+?$/, '$1');
          }
          break;
          
        case "2": // CNPJ
          if (cleanValue.length <= 14) {
            return cleanValue
              .replace(/(\d{2})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d)/, '$1.$2')
              .replace(/(\d{3})(\d)/, '$1/$2')
              .replace(/(\d{4})(\d)/, '$1-$2')
              .replace(/(-\d{2})\d+?$/, '$1');
          }
          break;
          
        case "4": // Celular
          if (cleanValue.length <= 11) {
            return cleanValue
              .replace(/(\d{2})(\d)/, '($1) $2')
              .replace(/(\d{5})(\d)/, '$1-$2')
              .replace(/(-\d{4})\d+?$/, '$1');
          }
          break;
          
        case "3": // E-mail - não aplica máscara, apenas validação
        default:
          return value;
      }
      
      return value;
    };

    const handlePixTypeChange = (selected: any) => {
      const selectedValue = selected?.value ?? "";
      setCurrentPixType(selectedValue);
      setValue("dados_bancarios.0.tipo_pix", selectedValue);
      onChange("dados_bancarios.0.tipo_pix", selectedValue);
      
      // Limpar o valor da chave PIX quando mudar o tipo
      setValue("dados_bancarios.0.chave_pix", "");
      onChange("dados_bancarios.0.chave_pix", "");
    };

    const handleChavePixChange = (value: string) => {
      const maskedValue = applyMask(value, currentPixType);
      setValue("dados_bancarios.0.chave_pix", maskedValue);
      onChange("dados_bancarios.0.chave_pix", maskedValue);
    };

    const renderField = (field: FormField) => {
      const errorMessage = errors[field.name]?.message;
      const isErrorString = typeof errorMessage === "string";
      const fieldValue = getFieldValue(field.name);

      if (field.type === "select" && field.name.includes("tipo_pix")) {
        const options = field.options?.length ? field.options : pixOptions;
        return (
          <div key={field.name} className="space-y-2">
            <span>{field.label}</span>
            <Combobox
              data={options}
              displayField="label"
              value={options.find((opt) => opt.value === fieldValue) ?? null}
              onChange={handlePixTypeChange}
              searchFields={["label"]}
            />
            {isErrorString && <p className="text-sm text-red-600">{errorMessage}</p>}
          </div>
        );
      }

      if (field.name.includes("chave_pix")) {
        return (
          <div key={field.name} className="space-y-2">
            <span>{field.label}</span>
            <Input
              {...register(field.name)}
              placeholder={getChavePixPlaceholder(currentPixType)}
              value={fieldValue}
              onChange={(e) => handleChavePixChange(e.target.value)}
              className="mt-1"
              type={currentPixType === "3" ? "email" : "text"} // Tipo email para chave de e-mail
            />
            {isErrorString && <p className="text-sm text-red-600">{errorMessage}</p>}
            {currentPixType && (
              <p className="text-xs text-gray-500">
                {getMaskDescription(currentPixType)}
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
            value={fieldValue}
            onChange={(e) => {
              const newValue = e.target.value;
              setValue(field.name, newValue);
              onChange(field.name, newValue);
            }}
            className="mt-1"
          />
          {isErrorString && <p className="text-sm text-red-600">{errorMessage}</p>}
        </div>
      );
    };

    const getChavePixPlaceholder = (pixType: string): string => {
      switch (pixType) {
        case "1": return "000.000.000-00";
        case "2": return "00.000.000/0000-00";
        case "3": return "seu.email@exemplo.com";
        case "4": return "(11) 99999-9999";
        default: return "Informe a chave PIX";
      }
    };

    const getMaskDescription = (pixType: string): string => {
      switch (pixType) {
        case "1": return "Formato: 000.000.000-00";
        case "2": return "Formato: 00.000.000/0000-00";
        case "3": return "Digite um e-mail válido";
        case "4": return "Formato: (11) 99999-9999";
        default: return "Selecione o tipo de chave PIX";
      }
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
  }
);

DadosBancarios.displayName = "DadosBancarios";