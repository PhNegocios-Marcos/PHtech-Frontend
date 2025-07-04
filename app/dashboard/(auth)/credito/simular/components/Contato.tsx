"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";

const contatoSchema = z.object({
  ddd: z.string().min(2, "DDD obrigatório"),
  numero: z.string().min(8, "Número obrigatório"),
  email: z.string().email("Email inválido")
});

type ContatoFormData = z.infer<typeof contatoSchema>;

export const Telefones = forwardRef(
  (
    {
      formData,
      onChange
    }: {
      formData: any;
      onChange: (path: string, value: any) => void;
    },
    ref
  ) => {
    const {
      register,
      setValue,
      formState: { errors },
      trigger
    } = useForm<ContatoFormData>({
      resolver: zodResolver(contatoSchema),
      defaultValues: {
        ddd: formData.telefones[0].ddd,
        numero: formData.telefones[0].numero,
        email: formData.emails[0].email
      }
    });

    useImperativeHandle(ref, () => ({
      validate: () => trigger()
    }));

    return (
      <form className="m-10 grid grid-cols-2 gap-5" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-1">
            <Input
              {...register("ddd")}
              placeholder="DDD"
              value={formData.telefones[0].ddd}
              onChange={(e) => {
                setValue("ddd", e.target.value);
                onChange("telefones.0.ddd", e.target.value);
              }}
            />
            {errors.ddd?.message && <p className="text-sm text-red-600">{errors.ddd.message}</p>}
          </div>

          <div className="col-span-3">
            <Input
              {...register("numero")}
              placeholder="Número"
              value={formData.telefones[0].numero}
              onChange={(e) => {
                setValue("numero", e.target.value);
                onChange("telefones.0.numero", e.target.value);
              }}
            />
            {errors.numero?.message && (
              <p className="text-sm text-red-600">{errors.numero.message}</p>
            )}
          </div>
        </div>

        <div>
          <Input
            {...register("email")}
            placeholder="E-mail"
            value={formData.emails[0].email}
            onChange={(e) => {
              setValue("email", e.target.value);
              onChange("emails.0.email", e.target.value);
            }}
            className="full"
          />
          {errors.email?.message && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>
      </form>
    );
  }
);
