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
import { toast } from "sonner";

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
  produto: Produto | null;
  onClose: (() => void) | undefined;
  onRefresh?: () => void;
};

export function ProdutoEdit({ produto, onClose, onRefresh }: ProdutoDrawerProps) {
  const defaultValues: Produto = {
    id: produto?.id || "",
    nome: produto?.nome || "",
    status: produto?.status || 1, // Default to active
    idade_minima: produto?.idade_minima || 0,
    idade_maxima: produto?.idade_maxima || 0,
    prazo_minimo: produto?.prazo_minimo || 0,
    prazo_maximo: produto?.prazo_maximo || 0,
    id_uy3: produto?.id_uy3 || null,
    cor_grafico: produto?.cor_grafico || ""
  };

  const methods = useForm<Produto>({
    resolver: zodResolver(produtoSchema),
    defaultValues
  });

  const { token } = useAuth();
  const originalData = useRef<Produto>(defaultValues);

  useEffect(() => {
    if (produto) {
      const values = {
        ...produto,
        cor_grafico: produto.cor_grafico || ""
      };
      methods.reset(values);
      originalData.current = values;
    }
  }, [produto, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

  const onSubmit = async (data: Produto) => {
    if (!token) {
      toast.error("Token de autenticação não encontrado.");
      return;
    }

    const updatedFields: Partial<Produto> = { id: data.id };

    // Check each field for changes
    Object.keys(data).forEach((key) => {
      const fieldKey = key as keyof Produto;
      const newValue = data[fieldKey];
      const oldValue = originalData.current[fieldKey];

      // Handle null/undefined normalization
      const normalizedNewValue = newValue === null ? undefined : newValue;
      const normalizedOldValue = oldValue === null ? undefined : oldValue;

      // Compare values
      if (normalizedNewValue !== normalizedOldValue) {
        updatedFields[fieldKey] = normalizedNewValue as any;
      }
    });

    // If only ID was added (no changes)
    if (Object.keys(updatedFields).length === 1) {
      toast.info("Nenhuma alteração detectada.", {
        style: {
          background: "var(--toast-info)",
          color: "var(--toast-info-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      return;
    }

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/rel-rotina-operacional-prod-convenio/atualizar`,
        updatedFields,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success("Produto atualizado com sucesso!");
      onClose?.();
      onRefresh?.();
    } catch (error: any) {
      console.error("Erro ao atualizar produto:", error.response?.data || error.message);
      toast.error(`Erro: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleClose = () => {
    toast.info("Edição cancelada", {
      style: {
        background: "var(--toast-info)",
        color: "var(--toast-info-foreground)",
        boxShadow: "var(--toast-shadow)"
      }
    });
    onClose?.();
  };

  // Handle number input more gracefully
  const handleNumberChange = (field: any, value: string) => {
    const numValue = value === "" ? 0 : parseInt(value, 10) || 0;
    field.onChange(numValue);
  };

  return (
    <>
      <div onClick={handleClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 h-full w-full overflow-auto bg-white p-6 shadow-lg md:w-1/2">
        <FormProvider {...methods}>
          <Form {...methods}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Editar Modalidade: <span className="text-primary">{produto?.nome}</span>
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-2xl font-bold hover:text-gray-900"
                aria-label="Fechar">
                ×
              </button>
            </div>

            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <Combobox
                              data={statusOptions}
                              displayField="name"
                              value={statusOptions.find((opt) => opt.id === field.value) || null}
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
                              value={field.value}
                              onChange={(e) => handleNumberChange(field, e.target.value)}
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
                              value={field.value}
                              onChange={(e) => handleNumberChange(field, e.target.value)}
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
                              value={field.value}
                              onChange={(e) => handleNumberChange(field, e.target.value)}
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
                              value={field.value}
                              onChange={(e) => handleNumberChange(field, e.target.value)}
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
                            <Input {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={methods.formState.isSubmitting}>
                  {methods.formState.isSubmitting ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </aside>
    </>
  );
}
