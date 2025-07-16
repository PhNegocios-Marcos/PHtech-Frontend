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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const subprodutoSchema = z.object({
  produtos_subprodutos_id: z.string().optional(),
  produtos_subprodutos_nome: z
    .string()
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  produtos_subprodutos_atividade: z.string(),
  produtos_subprodutos_status: z.number()
});

type Subproduto = z.infer<typeof subprodutoSchema>;

type SubprodutoDrawerProps = {
  subproduto: Subproduto;
  onClose: () => void;
  onRefresh: () => void;
};

export function SubprodutoEdit({
  subproduto,
  onClose,
  onRefresh
}: SubprodutoDrawerProps) {
  const methods = useForm<Subproduto>({
    resolver: zodResolver(subprodutoSchema),
    defaultValues: {
      ...subproduto,
      produtos_subprodutos_status: subproduto.produtos_subprodutos_status ?? 1
    }
  });

  const { token } = useAuth();

  useEffect(() => {
    methods.reset({
      ...subproduto,
      produtos_subprodutos_status: subproduto.produtos_subprodutos_status ?? 1
    });
  }, [subproduto, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

  const onSubmit = async (data: Subproduto) => {
    console.log("subpro: ", data);

    if (!token) {
      console.error("Token global não definido!");
      return;
    }

    const payload = {
      id: data.produtos_subprodutos_id,
      nome: data.produtos_subprodutos_nome,
      atividade: data.produtos_subprodutos_atividade,
      status: data.produtos_subprodutos_status
    };

    console.log("payload", payload);

    try {
      await axios.put(`${API_BASE_URL}/subprodutos/atualizar`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onClose();
      onRefresh();
    } catch (error: any) {
      console.error("Erro ao atualizar subproduto:", error.response?.data || error.message);
      alert(`Erro: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit, (errors) => {
          console.warn("Erros de validação:", errors);
        })}
        className="grid grid-cols-2 gap-4 p-6"
      >
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Editar Subproduto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={methods.control}
                name="produtos_subprodutos_nome"
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
                name="produtos_subprodutos_atividade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Atividade</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methods.control}
                name="produtos_subprodutos_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Combobox
                        data={statusOptions}
                        displayField="name"
                        value={statusOptions.find(opt => opt.id === field.value) ?? statusOptions[0]}
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
    </FormProvider>
  );
}
