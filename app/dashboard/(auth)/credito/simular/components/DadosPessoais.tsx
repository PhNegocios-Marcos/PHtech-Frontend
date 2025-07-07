"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";

const dadosPessoaisSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  nome_pai: z.string().min(1, "Nome do pai é obrigatório"),
  tipo_documento: z.string().min(1, "Tipo documento é obrigatório"),
  numero_documento: z.string().min(1, "Número documento é obrigatório"),
  sexo: z.string().min(1, "Sexo é obrigatório")
});

type DadosPessoaisFormData = z.infer<typeof dadosPessoaisSchema>;

type DadosPessoaisProps = {
  formData: DadosPessoaisFormData & { cpf: string };
  onChange: (path: string, value: any) => void;
};

export const DadosPessoais = forwardRef(({ formData, onChange }: DadosPessoaisProps, ref) => {
  const {
    register,
    setValue,
    formState: { errors },
    trigger
  } = useForm<DadosPessoaisFormData>({
    resolver: zodResolver(dadosPessoaisSchema),
    defaultValues: {
      nome: formData.nome,
      nome_pai: formData.nome_pai,
      tipo_documento: formData.tipo_documento,
      numero_documento: formData.numero_documento,
      sexo: formData.sexo
    }
  });

  useImperativeHandle(ref, () => ({
    validate: () => trigger()
  }));

  return (
    <form
      className="m-10 grid grid-cols-1 gap-5 space-y-3 md:grid-cols-2"
      onSubmit={(e) => e.preventDefault()}>
      <div>
        <span>Nome</span>
        <Input
          {...register("nome")}
          placeholder="Nome"
          onChange={(e) => {
            setValue("nome", e.target.value);
            onChange("nome", e.target.value);
          }}
          value={formData.nome}
          className="mt-1"
        />
        {errors.nome?.message && <p className="text-sm text-red-600">{errors.nome.message}</p>}
      </div>

      <div>
        <span>Nomae do pai</span>
        <Input
          {...register("nome_pai")}
          placeholder="Nome do Pai"
          onChange={(e) => {
            setValue("nome_pai", e.target.value);
            onChange("nome_pai", e.target.value);
          }}
          className="mt-1"
          value={formData.nome_pai}
        />
        {errors.nome_pai?.message && (
          <p className="text-sm text-red-600">{errors.nome_pai.message}</p>
        )}
      </div>

      <div>
        <span>Tipo do Documento</span>
        <Input
          {...register("tipo_documento")}
          placeholder="Tipo Documento"
          onChange={(e) => {
            setValue("tipo_documento", e.target.value);
            onChange("tipo_documento", e.target.value);
          }}
          value={formData.tipo_documento}
          className="mt-1"
        />
        {errors.tipo_documento?.message && (
          <p className="text-sm text-red-600">{errors.tipo_documento.message}</p>
        )}
      </div>

      <div>
        <span>Numero do Documento</span>
        <Input
          {...register("numero_documento")}
          placeholder="Número Documento"
          onChange={(e) => {
            setValue("numero_documento", e.target.value);
            onChange("numero_documento", e.target.value);
          }}
          value={formData.numero_documento}
          className="mt-1"
        />
        {errors.numero_documento?.message && (
          <p className="text-sm text-red-600">{errors.numero_documento.message}</p>
        )}
      </div>

      <div>
        <span>Sexo</span>
        <Input
          {...register("sexo")}
          placeholder="Sexo"
          onChange={(e) => {
            setValue("sexo", e.target.value);
            onChange("sexo", e.target.value);
          }}
          value={formData.sexo}
          className="mt-1"
        />
        {errors.sexo?.message && <p className="text-sm text-red-600">{errors.sexo.message}</p>}
      </div>

      <div>
        <span>CPF</span>
        <Input
          placeholder="CPF"
          value={formData.cpf}
          onChange={(e) => onChange("cpf", e.target.value)}
          className="mt-1"
        />
        {/* Caso queira mostrar erro relacionado a CPF, pode adicionar aqui */}
      </div>

      {/* <div>
        <Input placeholder="CPF" value={formData.cpf} />
      </div> */}
    </form>
  );
});
