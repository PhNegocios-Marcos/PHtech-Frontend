"use client";

import React, { useEffect, useRef } from "react";
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

const produtoSchema = z.object({
  id: z.string(),
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  status: z.number(),
  idade_minima: z.number(),
  idade_maxima: z.number(),
  prazo_minimo: z.number(),
  prazo_maximo: z.number(),
  id_uy3: z.string().nullable(),
  cor_grafico: z.string().nullable().optional()
});

type Produto = z.infer<typeof produtoSchema>;

type ProdutoDrawerProps = {
  produto: Produto;
  onClose?: () => void;
  onRefresh?: () => void;
};

export function ProdutoEdit({ produto, onClose, onRefresh }: ProdutoDrawerProps) {
  const methods = useForm<Produto>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      ...produto,
      cor_grafico: produto.cor_grafico || ""
    }
  });

  const { token } = useAuth();
  const originalData = useRef<Produto>({ ...produto, cor_grafico: produto.cor_grafico || "" });

  useEffect(() => {
    methods.reset({
      ...produto,
      cor_grafico: produto.cor_grafico || ""
    });
    originalData.current = { ...produto, cor_grafico: produto.cor_grafico || "" };
  }, [produto, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

  const onSubmit = async (data: Produto) => {
    if (!token) {
      console.error("Token global não definido!");
      return;
    }

    const updatedFields: Partial<Produto> = { id: data.id };

    for (const key in data) {
      if (key === "id") continue;
      const newValue = data[key as keyof Produto];
      const oldValue = originalData.current[key as keyof Produto];
      const hasChanged = JSON.stringify(newValue) !== JSON.stringify(oldValue);
      if (hasChanged && newValue !== undefined) {
        updatedFields[key as keyof Produto] = newValue as any;
      }
    }

    if (Object.keys(updatedFields).length === 1) {
      alert("Nenhuma alteração detectada.");
      return;
    }

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/produtos/atualizar`, updatedFields, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onClose) onClose();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      console.error("Erro ao atualizar produto:", error.response?.data || error.message);
      alert(`Erro: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 p-6">
          <Card>
            <CardHeader>
              <CardTitle>Editar Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={methods.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input value={field.value ?? ""} onChange={field.onChange} />
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
                          onChange={(selected) => field.onChange(selected?.id ?? 1)}
                          searchFields={["name"]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="idade_minima"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idade Mínima</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="idade_maxima"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idade Máxima</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="prazo_minimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo Mínimo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="prazo_maximo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo Máximo</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="cor_grafico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor do Gráfico</FormLabel>
                      <FormControl>
                        <Input value={field.value ?? ""} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
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
