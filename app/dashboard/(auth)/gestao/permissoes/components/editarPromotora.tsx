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
  FormMessage
} from "@/components/ui/form";

const permissoesSchema = z.object({
  id: z.string(),
  nome: z.string().optional(),
  status: z.number()
});

type EquipeFormValues = z.infer<typeof permissoesSchema> & {
  nome?: string;
  modulo?: string;
};

type EquipeEditProps = {
  permissoes: EquipeFormValues;
  onClose: () => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function EquipeEditForm({ permissoes, onClose }: EquipeEditProps) {
  const methods = useForm<EquipeFormValues>({
    resolver: zodResolver(permissoesSchema),
    defaultValues: permissoes
  });

  const { token } = useAuth();

  useEffect(() => {
    methods.reset(permissoes);
  }, [permissoes, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

  const onSubmit = async (data: EquipeFormValues) => {
    try {
      // Remove o campo nome se ele não foi alterado
      const payload: Partial<EquipeFormValues> = { id: data.id, status: data.status };

      if (data.nome && data.nome !== permissoes.nome) {
        payload.nome = data.nome;
      }

      await axios.put(`${API_BASE_URL}/permissoes/atualizar`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.erro || "Erro ao atualizar equipe";

      if (msg === "Nome já cadastrado.") {
        methods.setError("nome", {
          type: "manual",
          message: msg
        });
      } else {
        alert(msg);
      }

      console.error("Erro ao atualizar equipe:", error);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <Card className="col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  <h2>
                    Editar Averbador: <span className="text-primary">{permissoes.nome}</span>
                  </h2>
                </CardTitle>
                <Button onClick={onClose} variant="outline">
                  Voltar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={methods.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Equipe</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Combobox
                          data={statusOptions}
                          displayField="name"
                          value={statusOptions.find((opt) => opt.id === field.value) ?? null}
                          onChange={(selected) => field.onChange(selected?.id)}
                          searchFields={["name"]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Alterações</Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </FormProvider>
  );
}
