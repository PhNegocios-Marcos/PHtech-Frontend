"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";

const dadosPessoaisSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  nome_pai: z.string().min(1, "Nome do pai é obrigatório"),
  nome_mae: z.string().min(1, "Nome da mãe é obrigatório"),
  tipo_documento: z.string().min(1, "Tipo documento é obrigatório"),
  numero_documento: z.string().min(1, "Número documento é obrigatório"),
  sexo: z.string().min(1, "Sexo é obrigatório"),
  data_nascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  estado_civil: z.string().min(1, "Estado civil é obrigatório"),
  naturalidade: z.string().min(1, "Naturalidade é obrigatória"),
  nacionalidade: z.string().min(1, "Nacionalidade é obrigatória")
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
      nome_mae: formData.nome_mae,
      tipo_documento: formData.tipo_documento,
      numero_documento: formData.numero_documento,
      sexo: formData.sexo,
      data_nascimento: formData.data_nascimento,
      estado_civil: formData.estado_civil,
      naturalidade: formData.naturalidade,
      nacionalidade: formData.nacionalidade
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
        <span>Nome do Pai</span>
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
        <span>Nome da Mãe</span>
        <Input
          {...register("nome_mae")}
          placeholder="Nome da Mãe"
          onChange={(e) => {
            setValue("nome_mae", e.target.value);
            onChange("nome_mae", e.target.value);
          }}
          value={formData.nome_mae}
          className="mt-1"
        />
        {errors.nome_mae?.message && <p className="text-sm text-red-600">{errors.nome_mae.message}</p>}
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
        <span>Número do Documento</span>
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
        <span>Data de Nascimento</span>
        <Input
          type="date"
          {...register("data_nascimento")}
          onChange={(e) => {
            setValue("data_nascimento", e.target.value);
            onChange("data_nascimento", e.target.value);
          }}
          value={formData.data_nascimento}
          className="mt-1"
        />
        {errors.data_nascimento?.message && (
          <p className="text-sm text-red-600">{errors.data_nascimento.message}</p>
        )}
      </div>

      <div>
        <span>Estado Civil</span>
        <Input
          {...register("estado_civil")}
          placeholder="Estado Civil"
          onChange={(e) => {
            setValue("estado_civil", e.target.value);
            onChange("estado_civil", e.target.value);
          }}
          value={formData.estado_civil}
          className="mt-1"
        />
        {errors.estado_civil?.message && (
          <p className="text-sm text-red-600">{errors.estado_civil.message}</p>
        )}
      </div>

      <div>
        <span>Naturalidade</span>
        <Input
          {...register("naturalidade")}
          placeholder="Naturalidade"
          onChange={(e) => {
            setValue("naturalidade", e.target.value);
            onChange("naturalidade", e.target.value);
          }}
          value={formData.naturalidade}
          className="mt-1"
        />
        {errors.naturalidade?.message && (
          <p className="text-sm text-red-600">{errors.naturalidade.message}</p>
        )}
      </div>

      <div>
        <span>Nacionalidade</span>
        <Input
          {...register("nacionalidade")}
          placeholder="Nacionalidade"
          onChange={(e) => {
            setValue("nacionalidade", e.target.value);
            onChange("nacionalidade", e.target.value);
          }}
          value={formData.nacionalidade}
          className="mt-1"
        />
        {errors.nacionalidade?.message && (
          <p className="text-sm text-red-600">{errors.nacionalidade.message}</p>
        )}
      </div>

      <div>
        <span>CPF</span>
        <Input
          placeholder="CPF"
          value={formData.cpf}
          onChange={(e) => onChange("cpf", e.target.value)}
          className="mt-1"
        />
      </div>
    </form>
  );
});