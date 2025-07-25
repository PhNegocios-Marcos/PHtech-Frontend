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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const averbadorSchema = z.object({
  averbador_hash: z.string(),
  averbador_nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  averbador_status: z.coerce.number(),
});

type Averbador = z.infer<typeof averbadorSchema>;

type AverbadorDrawerProps = {
  averbador: Averbador;
  onClose: () => void;
  onRefresh: () => void;
};

export function AverbadorEdit({ averbador, onClose, onRefresh }: AverbadorDrawerProps) {
  const methods = useForm<Averbador>({
    resolver: zodResolver(averbadorSchema),
    defaultValues: averbador,
  });

  const { token } = useAuth();

  useEffect(() => {
    methods.reset(averbador);
  }, [averbador, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" },
  ];

  const onSubmit = async (data: Averbador) => {
    if (!token) {
      console.error("Token global não definido!");
      return;
    }

    // Filtra apenas os campos que foram alterados
    const changedFields: Partial<Averbador> = {};

    Object.entries(data).forEach(([key, value]) => {
      if ((averbador as any)[key] !== value) {
        (changedFields as any)[key] = value;
      }
    });

    if (Object.keys(changedFields).length === 0) {
      // Nenhuma alteração detectada
      console.log("Nenhuma alteração detectada.");
      onClose();
      return;
    }

    // Assegura que o identificador está presente no payload
    if (!changedFields.averbador_hash) {
      changedFields.averbador_hash = averbador.averbador_hash;
    }

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/averbador/atualizar`, changedFields, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onClose();
      onRefresh();
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error.response?.data || error.message);
      alert(`Erro: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 p-6">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Editar Averbador</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={methods.control}
                  name="averbador_nome"
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
                  name="averbador_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Combobox
                          data={statusOptions}
                          displayField="name"
                          value={statusOptions.find((opt) => opt.id === field.value) ?? null}
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
