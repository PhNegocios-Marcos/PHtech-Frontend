"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
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
  nome: z.string().min(1, "Nome é obrigatório"),
  idade_minima: z.number().min(0, "Idade mínima deve ser positiva"),
  idade_maxima: z.number().min(0, "Idade máxima deve ser positiva"),
  prazo_minimo: z.number().min(1, "Prazo mínimo deve ser pelo menos 1"),
  prazo_maximo: z.number().min(1, "Prazo máximo deve ser pelo menos 1"),
  id_uy3: z.string().optional(),
  cor_grafico: z.string().optional()
});

type FormData = z.infer<typeof schema>;

type CadastroProdutoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CadastroProdutoModal({
  isOpen,
  onClose,
}: CadastroProdutoModalProps) {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      idade_minima: 0,
      idade_maxima: 0,
      prazo_minimo: 1,
      prazo_maximo: 1,
      id_uy3: "809ebc8f-a1b4-4202-9a4e-da2b7f388cc6",
      cor_grafico: ""
    },
  });

  const { token } = useAuth();
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    if (!token) {
      alert("Token não encontrado. Faça login.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/produtos/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(JSON.stringify(err));
      }

      alert("Produto cadastrado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      alert("Erro ao cadastrar produto: " + error);
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
                      name="nome"
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
                      name="idade_minima"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idade Mínima</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Idade mínima" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                              placeholder="Idade máxima" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                              placeholder="Prazo mínimo" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                              placeholder="Prazo máximo" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
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