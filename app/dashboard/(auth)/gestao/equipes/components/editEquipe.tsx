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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const equipeSchema = z.object({
  id: z.string(),
  // nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  descricao: z.string().optional(),
  status: z.number(),
  // promotora: z.string().optional(),
});

type EquipeFormValues = z.infer<typeof equipeSchema> & {
  nome?: string;
};

type EquipeEditProps = {
  equipe: EquipeFormValues;
  onClose: () => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function EquipeEditForm({ equipe, onClose }: EquipeEditProps) {
  const methods = useForm<EquipeFormValues>({
    resolver: zodResolver(equipeSchema),
    defaultValues: equipe,
  });

  const { token } = useAuth();

  useEffect(() => {
    methods.reset(equipe);
  }, [equipe, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" },
  ];

  const onSubmit = async (data: EquipeFormValues) => {
    try {
      await axios.put(`${API_BASE_URL}/equipe/atualizar`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar equipe:", error);
      alert("Erro ao atualizar equipe");
    }
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      value={
                        statusOptions.find((opt) => opt.id === field.value) ?? null
                      }
                      onChange={(selected) => field.onChange(selected?.id)}
                      searchFields={["name"]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={methods.control}
              name="descricao"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
        </form>
      </Form>
    </FormProvider>
  );
}