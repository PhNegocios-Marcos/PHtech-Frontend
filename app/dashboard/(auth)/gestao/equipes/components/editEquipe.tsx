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

const equipeSchema = z.object({
  id: z.string(),
  nome: z.string().min(2).max(100),
  descricao: z.string().optional(),
  status: z.number()
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
    defaultValues: equipe
  });

  const { token } = useAuth();

  useEffect(() => {
    methods.reset(equipe);
  }, [equipe, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

  const onSubmit = async (data: EquipeFormValues) => {
    if (!token) {
      toast.error("Autenticação necessária", {
        description: "Faça login para continuar",
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
      return;
    }

    try {
      const response = await axios.put(`${API_BASE_URL}/equipe/atualizar`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      toast.success("Equipe atualizada com sucesso!", {
        style: {
          background: 'var(--toast-success)',
          color: 'var(--toast-success-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
      onClose();
    } catch (error: any) {
      console.error("Erro ao atualizar equipe:", error);
      const errorMessage = error.response?.data?.message || "Erro ao atualizar equipe";
      
      toast.error("Falha na atualização", {
        description: errorMessage,
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });

      // Set field errors if available
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([field, message]) => {
          methods.setError(field as keyof EquipeFormValues, {
            type: "manual",
            message: message as string
          });
        });
      }
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
                  <h2>Equipe: <span className="text-primary">{equipe.nome}</span></h2>
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
            </CardContent>
          </Card>
        </form>
      </Form>
    </FormProvider>
  );
}