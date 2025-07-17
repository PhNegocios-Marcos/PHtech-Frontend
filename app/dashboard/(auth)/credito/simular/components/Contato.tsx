"use client";

import React, { forwardRef, useImperativeHandle, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";

const contatoSchema = z.object({
  ddd1: z.string().min(2, "DDD obrigatório"),
  numero1: z.string().min(8, "Número obrigatório"),
  ddd2: z.string().min(2, "DDD obrigatório"),
  numero2: z.string().min(8, "Número obrigatório"),
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

    // Observa os valores e sincroniza com onChange externo
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
      validate: () => trigger()
    }));

    // console.log(watchedValues.email)

    return (
      <form className="m-10 grid grid-cols-2 gap-5" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-1">
            <span>DDD</span>
            <Input
              {...register("ddd1")}
              placeholder="DDD"
              className="mt-1"
            />
            {errors.ddd1 && <p className="text-sm text-red-600">{errors.ddd1.message}</p>}
          </div>

          <div className="col-span-3">
            <span>Número</span>
            <Input
              {...register("numero1")}
              placeholder="Número"
              className="mt-1"
            />
            {errors.numero1 && <p className="text-sm text-red-600">{errors.numero1.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-1">
            <span>DDD</span>
            <Input
              {...register("ddd2")}
              placeholder="DDD"
              className="mt-1"
            />
            {errors.ddd2 && <p className="text-sm text-red-600">{errors.ddd2.message}</p>}
          </div>

          <div className="col-span-3">
            <span>Número</span>
            <Input
              {...register("numero2")}
              placeholder="Número"
              className="mt-1"
            />
            {errors.numero2 && <p className="text-sm text-red-600">{errors.numero2.message}</p>}
          </div>
        </div>

        <div>
          <span>E-mail</span>
          <Input
            {...register("email")}
            placeholder="E-mail"
            className="full"
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>
      </form>
    );
  }
);

Telefones.displayName = "Telefones";
