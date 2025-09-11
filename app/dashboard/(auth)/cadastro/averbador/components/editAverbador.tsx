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
import { useRouter } from "next/navigation";

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
  averbador: Averbador;
  onClose: () => void;
  onRefresh: () => void;
};

export function AverbadorEdit({ averbador, onClose, onRefresh }: AverbadorDrawerProps) {
  const router = useRouter();

  const methods = useForm<Averbador>({
    resolver: zodResolver(averbadorSchema),
    defaultValues: averbador
  });

  const { token } = useAuth();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!token) {
        toast.error("Token de autenticação não encontrado", {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          }
        });
        sessionStorage.clear();
        router.push("/dashboard/login");
      } else {
        // console.log("tem token");
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [token, router]);



  useEffect(() => {
    methods.reset(averbador);
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
      changedFields.averbador_hash = averbador.averbador_hash;
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

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 pt-6">
          <Card className="col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Editar Averbador: <span className="text-primary">{averbador.averbador_nome}</span>
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
            <Button type="submit">Salvar alterações</Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
