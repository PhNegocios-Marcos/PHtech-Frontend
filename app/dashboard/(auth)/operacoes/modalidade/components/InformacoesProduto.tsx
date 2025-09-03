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
import { Produto } from "./produtos";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { toast } from "sonner";

// Definir a interface Produto para garantir consistência
// export interface Produto {
//   id: string;
//   modalidade_credito_nome: string;
//   modalidade_credito_status: number;
//   modalidade_credito_digito_prefixo: number;
//   id_uy3: string | null;
//   modalidade_credito_cor_grafico?: string | null;
// }

// Update your produtoSchema to match the expected structure
const produtoSchema = z.object({
  id: z.string(),
  modalidade_credito_nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  modalidade_credito_status: z.number(),
  modalidade_credito_digito_prefixo: z.number(),
  id_uy3: z.string().nullable(),
  modalidade_credito_cor_grafico: z.string().nullable().optional()
});

type ProdutoFormData = z.infer<typeof produtoSchema>;

type ProdutoDrawerProps = {
  produto: Produto;
  onClose: (() => void) | undefined;
  onRefresh?: () => void;
};

export function ProdutoEdit({ produto, onClose, onRefresh }: ProdutoDrawerProps) {
  const defaultValues: ProdutoFormData = {
    id: produto.id || "",
    modalidade_credito_nome: produto.modalidade_credito_nome || "",
    modalidade_credito_status: produto.modalidade_credito_status || 1, // Default to active
    modalidade_credito_digito_prefixo: produto.modalidade_credito_digito_prefixo || 0,
    id_uy3: produto.id_uy3 || null,
    modalidade_credito_cor_grafico: produto.modalidade_credito_cor_grafico || ""
  };

  const methods = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues
  });

  const { token } = useAuth();
  const originalData = useRef<ProdutoFormData>(defaultValues);

  useEffect(() => {
    if (produto) {
      const values: ProdutoFormData = {
        id: produto.id,
        modalidade_credito_nome: produto.modalidade_credito_nome,
        modalidade_credito_status: produto.modalidade_credito_status,
        modalidade_credito_digito_prefixo: produto.modalidade_credito_digito_prefixo,
        id_uy3: produto.id_uy3,
        modalidade_credito_cor_grafico: produto.modalidade_credito_cor_grafico || ""
      };
      methods.reset(values);
      originalData.current = values;
    }
  }, [produto, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

  const onSubmit = async (data: ProdutoFormData) => {
    if (!token) {
      toast.error("Token de autenticação não encontrado.");
      return;
    }

    const updatedFields: Partial<ProdutoFormData> = { id: data.id };

    // Check each field for changes
    Object.keys(data).forEach((key) => {
      const fieldKey = key as keyof ProdutoFormData;
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
    const numValue = value === "" ? '' : parseInt(value, 10) || '';
    field.onChange(numValue);
  };

  return (
    <>
      <div onClick={handleClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="bg-background fixed top-0 right-0 z-50 h-full w-full overflow-auto p-6 shadow-lg md:w-1/2">
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  Editar Modalidade:{" "}
                  <span className="text-primary">{produto.modalidade_credito_nome}</span>
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-2xl font-bold hover:text-gray-900"
                  aria-label="Fechar">
                  ×
                </button>
              </div>

              <Card>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={methods.control}
                      name="modalidade_credito_nome"
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
                      name="modalidade_credito_status"
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
                      name="modalidade_credito_digito_prefixo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dígito Prefixo</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
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
                      name="modalidade_credito_cor_grafico"
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