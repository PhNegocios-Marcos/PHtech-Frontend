"use client";

import React, { forwardRef, useImperativeHandle, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Cleave from "cleave.js/react";
import { Input } from "@/components/ui/input";
import { Combobox } from "./Combobox"; // seu componente Combobox

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

  // Estados locais
  const [tipoDoc, setTipoDoc] = useState(formData.tipo_documento);
  const [numeroDoc, setNumeroDoc] = useState(formData.numero_documento);

  // Lista manual dos 27 estados brasileiros para Naturalidade
  const optionsNaturalidade = [
    { label: "Acre - AC", value: "ac" },
    { label: "Alagoas - AL", value: "al" },
    { label: "Amapá - AP", value: "ap" },
    { label: "Amazonas - AM", value: "am" },
    { label: "Bahia - BA", value: "ba" },
    { label: "Ceará - CE", value: "ce" },
    { label: "Distrito Federal - DF", value: "df" },
    { label: "Espírito Santo - ES", value: "es" },
    { label: "Goiás - GO", value: "go" },
    { label: "Maranhão - MA", value: "ma" },
    { label: "Mato Grosso - MT", value: "mt" },
    { label: "Mato Grosso do Sul - MS", value: "ms" },
    { label: "Minas Gerais - MG", value: "mg" },
    { label: "Pará - PA", value: "pa" },
    { label: "Paraíba - PB", value: "pb" },
    { label: "Paraná - PR", value: "pr" },
    { label: "Pernambuco - PE", value: "pe" },
    { label: "Piauí - PI", value: "pi" },
    { label: "Rio de Janeiro - RJ", value: "rj" },
    { label: "Rio Grande do Norte - RN", value: "rn" },
    { label: "Rio Grande do Sul - RS", value: "rs" },
    { label: "Rondônia - RO", value: "ro" },
    { label: "Roraima - RR", value: "rr" },
    { label: "Santa Catarina - SC", value: "sc" },
    { label: "São Paulo - SP", value: "sp" },
    { label: "Sergipe - SE", value: "se" },
    { label: "Tocantins - TO", value: "to" }
  ];

  // Opções fixas
  const tipoDocumentoOptions = [
    { label: "RG", value: "1" },
    { label: "CNPJ", value: "2" }
  ];

  const optionsSexo = [
    { label: "Masculino", value: "M" },
    { label: "Feminino", value: "F" },
    { label: "Outro", value: "O" }
  ];

  const optionsNacionalidade = [
    { label: "Brasileiro(a)", value: "brasileiro" },
    { label: "Estrangeiro(a)", value: "estrangeiro" },
    { label: "Outro", value: "outro" }
  ];

  const optionEstadoCivil = [
    { label: "Solteiro", value: "Solteiro" },
    { label: "Casado", value: "Casado" },
    { label: "Divorciado", value: "Divorciado" },
    { label: "Viúvo", value: "Viúvo" }
  ];

  return (
    <form
      className="m-10 grid grid-cols-1 gap-5 space-y-3 md:grid-cols-2"
      onSubmit={(e) => e.preventDefault()}>
      {/* Nome */}
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

      {/* Nome do Pai */}
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

      {/* Nome da Mãe */}
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
        {errors.nome_mae?.message && (
          <p className="text-sm text-red-600">{errors.nome_mae.message}</p>
        )}
      </div>

      {/* Tipo do Documento */}
      <div>
        <span>Tipo do Documento</span>
        <Combobox
          value={tipoDocumentoOptions.find((opt) => opt.value === formData.tipo_documento) || null}
          onChange={(selected) => {
            setValue("tipo_documento", selected.value);
            onChange("tipo_documento", selected.value);
          }}
          data={tipoDocumentoOptions}
          displayField="label"
          placeholder="Tipo Documento"
          className="mt-1"
        />
        {errors.tipo_documento?.message && (
          <p className="text-sm text-red-600">{errors.tipo_documento.message}</p>
        )}
      </div>

      {/* Número do Documento */}
      <div>
        <span>Número do Documento</span>
        <Cleave
          value={numeroDoc}
          options={
            tipoDoc === "CNPJ"
              ? { delimiters: [".", ".", "/", "-"], blocks: [2, 3, 3, 4, 2], numericOnly: true }
              : { delimiters: [".", ".", "-"], blocks: [2, 3, 3, 1], numericOnly: true }
          }
          placeholder="Número Documento"
          className="mt-1 w-full rounded-md border px-2 py-1 text-sm"
          onChange={(e) => {
            setNumeroDoc(e.target.value);
            setValue("numero_documento", e.target.value);
            onChange("numero_documento", e.target.value);
          }}
        />
        {errors.numero_documento?.message && (
          <p className="text-sm text-red-600">{errors.numero_documento.message}</p>
        )}
      </div>

      {/* Sexo */}
      <div>
        <span>Sexo</span>
        <Combobox
          value={optionsSexo.find((o) => o.value === formData.sexo) || null}
          data={optionsSexo}
          onChange={(selected) => {
            setValue("sexo", selected.value);
            onChange("sexo", selected.value);
          }}
          displayField="label"
          placeholder="Sexo"
          className="mt-1"
        />
        {errors.sexo?.message && <p className="text-sm text-red-600">{errors.sexo.message}</p>}
      </div>

      {/* Data de Nascimento */}
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

      {/* Estado Civil */}
      <div>
        <span>Estado Civil</span>
        <Combobox
          value={optionEstadoCivil.find((o) => o.value === formData.estado_civil) || null}
          data={optionEstadoCivil}
          onChange={(selected) => {
            setValue("estado_civil", selected.value);
            onChange("estado_civil", selected.value);
          }}
          displayField="label"
          placeholder="Estado Civil"
          className="mt-1"
        />
        {errors.estado_civil?.message && (
          <p className="text-sm text-red-600">{errors.estado_civil.message}</p>
        )}
      </div>

      {/* Naturalidade */}
      <div>
        <span className="text-muted-foreground text-sm">Naturalidade</span>
        <Combobox
          value={optionsNaturalidade.find((o) => o.value === formData.naturalidade) || null}
          data={optionsNaturalidade}
          displayField="label"
          onChange={(selected) => {
            setValue("naturalidade", selected.value);
            onChange("naturalidade", selected.value);
          }}
          placeholder="Naturalidade"
          className="mt-1"
          dropdownClassName="max-h-60 overflow-y-auto" // ou popoverClassName dependendo da lib
        />

        {errors.naturalidade?.message && (
          <p className="text-sm text-red-600">{errors.naturalidade.message}</p>
        )}
      </div>

      {/* Nacionalidade */}
      <div>
        <span>Nacionalidade</span>
        <Combobox
          value={optionsNacionalidade.find((o) => o.value === formData.nacionalidade) || null}
          data={optionsNacionalidade}
          displayField="label"
          onChange={(selected) => {
            setValue("nacionalidade", selected.value);
            onChange("nacionalidade", selected.value);
          }}
          placeholder="Nacionalidade"
          className="mt-1"
        />
        {errors.nacionalidade?.message && (
          <p className="text-sm text-red-600">{errors.nacionalidade.message}</p>
        )}
      </div>

      {/* CPF */}
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

DadosPessoais.displayName = "DadosPessoais";
