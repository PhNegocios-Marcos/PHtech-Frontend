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
import { toast } from "sonner";

const averbadorSchema = z.object({
  averbador_hash: z.string(),
  averbador_nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  averbador_status: z.coerce.number()
});

type Averbador = z.infer<typeof averbadorSchema>;

type AverbadorDrawerProps = {
  averbador: Averbador | null;
  onClose: () => void;
  onRefresh: () => void;
};

export function AverbadorEdit({ averbador, onClose, onRefresh }: AverbadorDrawerProps) {
  const defaultValues: Averbador = averbador || {
    averbador_hash: "",
    averbador_nome: "",
    averbador_status: 1
  };

  const methods = useForm<Averbador>({
    resolver: zodResolver(averbadorSchema),
    defaultValues
  });

  const { token } = useAuth();

  useEffect(() => {
    methods.reset(averbador || defaultValues);
  }, [averbador, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

  const onSubmit = async (data: Averbador) => {
    if (!token) {
      console.error("Token global não definido!");
      toast.error("Token de autenticação não encontrado", {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
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
      toast.info("Nenhuma alteração detectada", {
        style: {
          background: "var(--toast-info)",
          color: "var(--toast-info-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      onClose();
      return;
    }

    // Assegura que o identificador está presente no payload
    if (!changedFields.averbador_hash) {
      changedFields.averbador_hash = averbador?.averbador_hash;
    }

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/averbador/atualizar`, changedFields, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Averbador atualizado com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      onClose();
      onRefresh();
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error.response?.data || error.message);
      toast.error(`Erro: ${error.response?.data?.detail || error.message}`, {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
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
                Averbador: <span className="text-primary">{averbador?.averbador_nome}</span>
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-2xl font-bold hover:text-gray-900"
                aria-label="Fechar">
                ×
              </button>
            </div>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 pt-6">
              <Card className="col-span-2">
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
      </aside>
    </>
  );
}
