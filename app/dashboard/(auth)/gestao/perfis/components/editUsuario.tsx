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
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

// Validação com Zod
const perfilSchema = z.object({
  id: z.string(),
  nome: z.string().min(2),
  descricao: z.string().optional(),
  status: z.number()
});


type Perfil = z.infer<typeof perfilSchema> & {
  nome?: string,
};

type PerfilDrawerProps = {
  onClose: () => void;
  perfil: Perfil | null;
};

export function PerfilEdit({ perfil, onClose }: PerfilDrawerProps) {
  const methods = useForm<Perfil>({
    resolver: zodResolver(perfilSchema),
    defaultValues: perfil || {}
  });

  const { token } = useAuth();

  useEffect(() => {
    if (perfil) {
      methods.reset(perfil);
    }
  }, [perfil, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

  const onSubmit = async (data: Perfil) => {
    if (!token) {
      console.error("Token global não definido!");
      return;
    }

    try {
      await axios.put("http://127.0.0.1:8000/perfil/atualizar", data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Perfil atualizado com sucesso!");
      onClose();
      window.location.reload();
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error.response?.data || error.message);
      alert(`Erro: ${JSON.stringify(error.response?.data || error.message)}`);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4 overflow-y-auto p-6"
        >
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Dados do Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">

                <FormField
                  control={methods.control}
                  name="nome"
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
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
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
                          onChange={(selected) => field.onChange(selected.id)}
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

          <div className="col-span-2 p-4">
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
