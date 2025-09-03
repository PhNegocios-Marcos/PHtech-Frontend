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
import { Textarea } from "@/components/ui/textarea";

const alcadaSchema = z.object({
  id: z.string(),
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  descricao: z.string().min(5, { message: "Descrição deve ter pelo menos 5 caracteres" }),
  valor: z.number().min(0, { message: "Valor deve ser maior ou igual a 0" }),
  status: z.number().default(1) // Adicionando valor padrão para status
});

type Alcada = z.infer<typeof alcadaSchema>;

type AlcadaEditProps = {
  alcada: {
    id: string;
    nome: string;
    descricao: string;
    valor: number;
    status?: number; // Tornando status opcional
  };
  onClose?: () => void;
  onRefresh?: () => void;
};

export function AlcadaEdit({ alcada, onClose, onRefresh }: AlcadaEditProps) {
  // Garantir que status tenha um valor padrão
  const alcadaComStatus = {
    ...alcada,
    status: alcada.status ?? 1
  };

  const methods = useForm<Alcada>({
    resolver: zodResolver(alcadaSchema),
    defaultValues: {
      ...alcadaComStatus
    }
  });

  const { token } = useAuth();
  const originalData = useRef<Alcada>({ ...alcadaComStatus });

  useEffect(() => {
    const alcadaComStatus = {
      ...alcada,
      status: alcada.status ?? 1
    };

    methods.reset({
      ...alcadaComStatus
    });
    originalData.current = { ...alcadaComStatus };
  }, [alcada, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

  const onSubmit = async (data: Alcada) => {
    if (!token) {
      toast.error("Token de autenticação não encontrado.");
      return;
    }

    const updatedFields: Partial<Alcada> = { id: data.id };

    // Check each field for changes
    Object.keys(data).forEach((key) => {
      const fieldKey = key as keyof Alcada;
      const newValue = data[fieldKey];
      const oldValue = originalData.current[fieldKey];

      if (newValue !== oldValue) {
        updatedFields[fieldKey] = newValue as any;
      }
    });

    // If only ID was added (no changes)
    if (Object.keys(updatedFields).length === 1) {
      toast("Nenhuma alteração detectada.");
      return;
    }

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/alcada/atualizar`, updatedFields, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Alçada atualizada com sucesso!");
      if (onClose) onClose();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      console.error("Erro ao atualizar alçada:", error.response?.data || error.message);
      toast.error(`Erro: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6 p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Editar Alçada: <span className="text-primary">{alcada.nome}</span>
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
                  name="valor"
                  rules={{
                    min: {
                      value: 0,
                      message: "O valor não pode ser negativo"
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          value={field.value ?? 0}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            field.onChange(isNaN(value) ? 0 : Math.max(0, value));
                          }}
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
                        <Textarea value={field.value ?? ""} onChange={field.onChange} rows={3} />
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
