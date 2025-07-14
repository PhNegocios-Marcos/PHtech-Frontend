"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/Combobox";
import InputMask from "react-input-mask";


const pixKeyTypeOptions = [
  { id: "1", name: "CPF" },
  { id: "2", name: "Telefone" },
  { id: "3", name: "E-mail" },
  { id: "4", name: "Chave Aleatória" },
];

const dadosBancariosSchema = z.object({
  agencia: z.string().min(1, "Agência é obrigatória"),
  conta: z.string().min(1, "Conta é obrigatória"),
  tipo: z.string().min(1, "Conta é obrigatória"),
  pix: z.string().min(1, "Conta é obrigatória")
});

type DadosBancariosFormData = z.infer<typeof dadosBancariosSchema>;

type DadosBancariosProps = {
  formData: {
    dados_bancarios: {
      0: {
        agencia: string;
        conta: string;
        tipo_pix: string;
        pix: string;
      };
    };
  };
  onChange: (path: string, value: any) => void;
};

export const DadosBancarios = forwardRef(({ formData, onChange }: DadosBancariosProps, ref) => {
  const d = formData.dados_bancarios[0];

   const [tipoPix, setTipoPix] = useState("1"); // default CPF
  const [pixValue, setPixValue] = useState("");

  // Máscaras para cada tipo PIX
  const getMask = () => {
    switch (tipoPix) {
      case "1": // CPF
        return "999.999.999-99";
      case "2": // Telefone (celular brasileiro)
        return "+55 (99) 99999-9999";
      case "3": // E-mail não tem máscara, retorna null
        return null;
      case "4": // Chave aleatória: sem máscara
        return null;
      default:
        return null;
    }
  };

  const {
    register,
    setValue,
    formState: { errors },
    trigger
  } = useForm<DadosBancariosFormData>({
    resolver: zodResolver(dadosBancariosSchema),
    defaultValues: {
      agencia: d.agencia,
      conta: d.conta,
      tipo: d.tipo_pix,
      pix: d.pix
    }
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

  return (
    <div className="m-10">
      <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
        <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-4">
          <div>
            <span>Agência</span>
            <Input
              {...register("agencia")}
              placeholder="Agência"
              value={d.agencia}
              onChange={(e) => {
                setValue("agencia", e.target.value);
                onChange("dados_bancarios.0.agencia", e.target.value);
              }}
              className="mt-1"
            />
            {errors.agencia?.message && (
              <p className="text-sm text-red-600">{errors.agencia.message}</p>
            )}
          </div>

          <div>
            <span>Conta</span>
            <Input
              {...register("conta")}
              placeholder="Conta"
              value={d.conta}
              onChange={(e) => {
                setValue("conta", e.target.value);
                onChange("dados_bancarios.0.conta", e.target.value);
              }}
              className="mt-1"
            />
            {errors.conta?.message && (
              <p className="text-sm text-red-600">{errors.conta.message}</p>
            )}
          </div>
          <div>
            <span>tipos de chave PIX</span>
            <Combobox
              data={pixKeyTypeOptions}
              displayField="name"
              value={pixKeyTypeOptions.find((opt) => opt.id === d.tipo_pix) ?? null}
              onChange={(selected) => {
                const selectedId = selected?.id ?? "";
                setValue("tipo", selectedId);
                onChange("dados_bancarios.0.tipo_pix", selectedId);
              }}
              searchFields={["name"]}
            />
            {errors.tipo?.message && <p className="text-sm text-red-600">{errors.tipo.message}</p>}
          </div>
          <div>
            <span>chave PIX</span>
            <Input
              {...register("pix")}
              placeholder="chave PIX"
              value={d.pix}
              onChange={(e) => {
                setValue("pix", e.target.value);
                onChange("dados_bancarios.0.pix", e.target.value);
              }}
              className="mt-1"
            />
            {errors.pix?.message && <p className="text-sm text-red-600">{errors.pix.message}</p>}
          </div>
        </div>
      </form>
    </div>
  );
});
