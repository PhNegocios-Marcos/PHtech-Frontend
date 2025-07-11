"use client";

import React, { forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";

const enderecoSchema = z.object({
  cep: z.string().min(8, "CEP é obrigatório"),
  logradouro: z.string().min(1, "Logradouro obrigatório"),
  numero: z.string().min(1, "Número obrigatório"),
  bairro: z.string().min(1, "Bairro obrigatório"),
  cidade: z.string().min(1, "Cidade obrigatória"),
  estado: z.string().min(1, "Estado obrigatório"),
  uf: z.string().min(2, "UF obrigatório")
});

type EnderecoFormData = z.infer<typeof enderecoSchema>;

export const Enderecos = forwardRef(
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
    const e = formData.enderecos[0];

    const {
      register,
      setValue,
      formState: { errors },
      trigger
    } = useForm<EnderecoFormData>({
      resolver: zodResolver(enderecoSchema),
      defaultValues: {
        cep: e.cep,
        logradouro: e.logradouro,
        numero: String(e.numero),
        bairro: e.bairro,
        cidade: e.cidade,
        estado: e.estado,
        uf: e.uf
      }
    });

    useImperativeHandle(ref, () => ({
      validate: () => trigger()
    }));

    const buscarEndereco = async (cep: string) => {
      const cepLimpo = cep.replace(/\D/g, "");

      if (cepLimpo.length !== 8) return;

      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

        if (!res.ok) {
          throw new Error("Erro na requisição");
        }

        const data = await res.json();

        if (data.erro) {
          alert("CEP não encontrado");
          return;
        }

        const campos = {
          logradouro: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
          estado: data.uf,
          uf: data.uf
        };

        Object.entries(campos).forEach(([key, val]) => {
          setValue(key as keyof EnderecoFormData, val);
          onChange(`enderecos.0.${key}`, val);
        });
      } catch (error) {
        console.error("Erro ao buscar endereço:", error);
        alert("Não foi possível buscar o endereço. Verifique sua conexão.");
      }
    };

    return (
      <div className="m-10">
        <form
          className="grid grid-cols-1 gap-5 md:grid-cols-3"
          onSubmit={(e) => e.preventDefault()}>
          <div>
            <span>CEP</span>
            <Input
              {...register("cep")}
              placeholder="CEP"
              value={e.cep}
              onChange={async (ev) => {
                const cep = ev.target.value;
                setValue("cep", cep);
                onChange("enderecos.0.cep", cep);
                if (cep.length === 8) {
                  await buscarEndereco(cep);
                }
              }}
              className="mt-1"
            />
            {errors.cep?.message && <p className="text-sm text-red-600">{errors.cep.message}</p>}
          </div>

          <div>
            <span>Logradouro</span>
            <Input
              {...register("logradouro")}
              placeholder="Logradouro"
              value={e.logradouro}
              onChange={(ev) => {
                setValue("logradouro", ev.target.value);
                onChange("enderecos.0.logradouro", ev.target.value);
              }}
              className="mt-1"
            />
            {errors.logradouro?.message && (
              <p className="text-sm text-red-600">{errors.logradouro.message}</p>
            )}
          </div>

          <div>
            <span>Número</span>
            <Input
              {...register("numero")}
              placeholder="Número"
              value={String(e.numero)}
              onChange={(ev) => {
                setValue("numero", ev.target.value);
                onChange("enderecos.0.numero", Number(ev.target.value));
              }}
              className="mt-1"
            />
            {errors.numero?.message && (
              <p className="text-sm text-red-600">{errors.numero.message}</p>
            )}
          </div>

          <div>
            <span>Bairro</span>
            <Input
              {...register("bairro")}
              placeholder="Bairro"
              value={e.bairro}
              onChange={(ev) => {
                setValue("bairro", ev.target.value);
                onChange("enderecos.0.bairro", ev.target.value);
              }}
              className="mt-1"
            />
            {errors.bairro?.message && (
              <p className="text-sm text-red-600">{errors.bairro.message}</p>
            )}
          </div>

          <div>
            <span>Cidade</span>
            <Input
              {...register("cidade")}
              placeholder="Cidade"
              value={e.cidade}
              onChange={(ev) => {
                setValue("cidade", ev.target.value);
                onChange("enderecos.0.cidade", ev.target.value);
              }}
              className="mt-1"
            />
            {errors.cidade?.message && (
              <p className="text-sm text-red-600">{errors.cidade.message}</p>
            )}
          </div>

          <div>
            <span>Estado</span>
            <Input
              {...register("estado")}
              placeholder="Estado"
              value={e.estado}
              onChange={(ev) => {
                setValue("estado", ev.target.value);
                onChange("enderecos.0.estado", ev.target.value);
              }}
              className="mt-1"
            />
            {errors.estado?.message && (
              <p className="text-sm text-red-600">{errors.estado.message}</p>
            )}
          </div>

          <div>
            <span>UF</span>
            <Input
              {...register("uf")}
              placeholder="UF"
              value={e.uf}
              onChange={(ev) => {
                setValue("uf", ev.target.value);
                onChange("enderecos.0.uf", ev.target.value);
              }}
              className="mt-1"
            />
            {errors.uf?.message && <p className="text-sm text-red-600">{errors.uf.message}</p>}
          </div>

          <div>
            <span>Complemento</span>
            <Input
              placeholder="Complemento"
              value={e.complemento}
              onChange={(ev) => {
                onChange("enderecos.0.complemento", ev.target.value);
              }}
              className="mt-1"
            />
          </div>
        </form>
      </div>
    );
  }
);