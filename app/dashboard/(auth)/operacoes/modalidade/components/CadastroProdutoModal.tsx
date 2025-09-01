"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

const schema = z.object({
  modalidade_credito_nome: z.string().min(1, "Nome é obrigatório"),
  modalidade_credito_id: z.string().optional(),
  modalidade_credito_cor_grafico: z.string().optional(),
  modalidade_credito_digito_prefixo: z.preprocess(
    (val) => val === "" ? undefined : Number(val),
    z.number().min(1).optional()
  )
});

type FormData = z.infer<typeof schema>;

type CadastroProdutoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CadastroProdutoModal({ isOpen, onClose }: CadastroProdutoModalProps) {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      modalidade_credito_nome: "",
      modalidade_credito_id: "",
      modalidade_credito_cor_grafico: "",
      modalidade_credito_digito_prefixo: undefined,
    },
  });

  const { token } = useAuth();

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error("Token não encontrado. Faça login.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/modalidade-credito/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.detail || "Erro desconhecido");
      }

      toast.success("Produto cadastrado com sucesso!");
      onClose();
    } catch (error: any) {
      console.error("Erro ao cadastrar produto:", error);
      toast.error("Erro ao cadastrar produto: " + (error.message || error));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 h-full w-1/2 bg-white shadow-lg overflow-auto p-6"
      >
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col h-full">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cadastrar Novo Produto</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-2xl font-bold hover:text-gray-900"
                  aria-label="Fechar"
                >
                  ×
                </button>
              </div>

              <Card className="flex-grow overflow-auto">
                <CardHeader>
                  <CardTitle>Dados do Produto</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={methods.control}
                      name="modalidade_credito_nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o nome" {...field} />
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
                          <FormLabel>Prefixo</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Idade mínima"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                              value={field.value === undefined ? "" : field.value}
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
                            <Input placeholder="Ex: var(--color-desktop)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit">Cadastrar</Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </aside>
    </>
  );
}