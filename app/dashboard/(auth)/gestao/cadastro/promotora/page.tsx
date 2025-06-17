"use client";

import React from "react";
import Cleave from "cleave.js/react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

const schema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  razao_social: z.string().min(1, "Razão social é obrigatória"),
  cnpj: z.string().regex(cnpjRegex, "CNPJ inválido"),
  rateio_master: z.coerce.number().min(0).max(100),
  master: z.enum(["0", "1"])
});

type FormData = z.infer<typeof schema>;

export default function CadastroPromotora() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      master: "0",
      cnpj: ""
    }
  });

  const { token } = useAuth();
  const router = useRouter();

  // Componente interno para input CNPJ com Cleave
  function InputCleaveCNPJ({
    value,
    onChange,
    onBlur,
    error,
    placeholder
  }: {
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    error?: string;
    placeholder?: string;
  }) {
    return (
      <div>
        <Cleave
          options={{
            delimiters: [".", ".", "/", "-"],
            blocks: [2, 3, 3, 4, 2],
            numericOnly: true
          }}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder || "00.000.000/0000-00"}
          className={`w-full rounded-lg border px-3 py-2 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    if (!token) return alert("Token não encontrado. Faça login.");

    const payload = {
      nome: data.nome,
      razao_social: data.razao_social,
      cnpj: data.cnpj.replace(/\D/g, ""),
      master: Number(data.master),
      rateio_master: data.rateio_master
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/promotora", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(JSON.stringify(err));
      }

      alert("Promotora cadastrada com sucesso!");
      router.push("/dashboard/default");
    } catch (error) {
      console.error("Erro ao cadastrar promotora:", error);
      alert("Erro ao cadastrar promotora: " + error);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-3xl space-y-6 rounded-xl border p-6">
      <h2 className="text-center text-xl font-bold">Cadastrar Promotora</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm">Nome Promotora</label>
            <Input placeholder="Digite o nome" {...register("nome")} />
            {errors.nome && <p className="text-sm text-red-500">{errors.nome.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm">Razão Social</label>
            <Input placeholder="Digite a razão social" {...register("razao_social")} />
            {errors.razao_social && (
              <p className="text-sm text-red-500">{errors.razao_social.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm">CNPJ</label>
            <Controller
              name="cnpj"
              control={control}
              render={({ field }) => (
                <InputCleaveCNPJ
                  {...field}
                  error={errors.cnpj?.message}
                />
              )}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Rateio</label>
            <Input placeholder="Rateio (%)" type="number" {...register("rateio_master")} />
            {errors.rateio_master && (
              <p className="text-sm text-red-500">{errors.rateio_master.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm">É Master?</label>
            <select {...register("master")} className="w-full rounded-lg border px-3 py-2">
              <option value="1">Sim</option>
              <option value="0">Não</option>
            </select>
            {errors.master && <p className="text-sm text-red-500">{errors.master.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/default")}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-primary text-white">
            Cadastrar
          </Button>
        </div>
      </form>
    </div>
  );
}
