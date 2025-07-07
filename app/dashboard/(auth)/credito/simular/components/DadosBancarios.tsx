"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";

const dadosBancariosSchema = z.object({
  agencia: z.string().min(1, "Agência é obrigatória"),
  conta: z.string().min(1, "Conta é obrigatória")
});

type DadosBancariosFormData = z.infer<typeof dadosBancariosSchema>;

type DadosBancariosProps = {
  formData: {
    dados_bancarios: {
      agencia: string;
      conta: string;
    }[];
  };
  onChange: (path: string, value: any) => void;
};

export const DadosBancarios = forwardRef(({ formData, onChange }: DadosBancariosProps, ref) => {
  const d = formData.dados_bancarios[0];

  const {
    register,
    setValue,
    formState: { errors },
    trigger
  } = useForm<DadosBancariosFormData>({
    resolver: zodResolver(dadosBancariosSchema),
    defaultValues: {
      agencia: d.agencia,
      conta: d.conta
    }
  });

  useImperativeHandle(ref, () => ({
    validate: () => trigger()
  }));

  return (
    <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
      {/* <h2 className="mb-2 font-semibold">Dados Bancários</h2> */}

      <div className="grid w-62 grid-cols-2 gap-2">
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
          {errors.conta?.message && <p className="text-sm text-red-600">{errors.conta.message}</p>}
        </div>
      </div>
    </form>
  );
});
