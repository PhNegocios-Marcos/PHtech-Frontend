"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Combobox } from "@/components/Combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Orgao } from "./leads";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

// Schema com coerção para number
const usuarioSchema = z.object({
  orgao_orgao_nomehash: z.string().optional(),
  orgao_hash: z.string(),
  orgao_data_corte: z.coerce.number(),
  orgao_prefixo: z.coerce.number(),
  orgao_status: z.coerce.number(),
  orgao_nome: z.string()
});

type OrgaoDrawerProps = {
  orgao: Orgao;
  onClose: () => void;
  onRefresh: () => void;
};

export function OrgaoEdit({ orgao, onClose, onRefresh }: OrgaoDrawerProps) {
  const methods = useForm<Orgao>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: orgao
  });

  const { token } = useAuth();

  useEffect(() => {
    methods.reset(orgao);
  }, [orgao, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

  function getModifiedFields<T extends object>(original: T, updated: T): Partial<T> {
    const modified: Partial<T> = {};
    (Object.keys(updated) as (keyof T)[]).forEach((key) => {
      if (updated[key] !== original[key]) {
        modified[key] = updated[key];
      }
    });
    return modified;
  }

  const onSubmit = async (data: Orgao) => {
    if (!token) {
      console.error("Token global não definido!");
      return;
    }

    const payload = getModifiedFields(orgao, data);

    if (Object.keys(payload).length === 0) {
      alert("Nenhuma alteração detectada.");
      return;
    }

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/orgaos/${orgao.orgao_hash}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onClose();
      onRefresh();
    } catch (error: any) {
      console.error("Erro ao atualizar órgão:", error.response?.data || error.message);
      alert(`Erro: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 p-6">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Editar Órgão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={methods.control}
                  name="orgao_nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={methods.control}
                  name="orgao_prefixo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prefixo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={methods.control}
                  name="orgao_data_corte"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data Corte</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={methods.control}
                  name="orgao_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Combobox
                          data={statusOptions}
                          displayField="name"
                          value={
                            statusOptions.find((opt) => opt.id === field.value) ?? statusOptions[0]
                          }
                          onChange={(selected) => field.onChange(selected?.id ?? 1)}
                          searchFields={["name"]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="col-span-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
