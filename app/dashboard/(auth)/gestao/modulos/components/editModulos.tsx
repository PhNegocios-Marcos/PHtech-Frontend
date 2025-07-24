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
  FormMessage
} from "@/components/ui/form";

const equipeSchema = z.object({
  id: z.string(),
  nome: z.string().optional(),
  status: z.number()
});

type ModulosFormValues = z.infer<typeof equipeSchema> & {
  nome?: string;
};

type ModulosEditProps = {
  modulos: ModulosFormValues;
  onClose: () => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function ModulosEditForm({ modulos, onClose }: ModulosEditProps) {
  const methods = useForm<ModulosFormValues>({
    resolver: zodResolver(equipeSchema),
    defaultValues: modulos
  });

  const { token } = useAuth();

  useEffect(() => {
    methods.reset(modulos);
  }, [modulos, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

  const onSubmit = async (data: ModulosFormValues) => {
    try {
      const payload = { ...data };

      // Se o nome for igual ao original ou estiver vazio, não enviar no payload
      if (data.nome === modulos.nome || !data.nome?.trim()) {
        delete payload.nome;
      }

      await axios.put(`${API_BASE_URL}/modulo/atualizar`, payload, {
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
        </form>
      </Form>
    </FormProvider>
  );
}
