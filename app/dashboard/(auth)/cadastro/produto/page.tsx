"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import CampoBoasVindas from "@/components/boasvindas";
import ProtectedRoute from "@/components/ProtectedRoute";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const schema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  prefixo: z.string().min(1, "Prefixo é obrigatório"),
  idade_minima: z.coerce.number().min(1, "Idade mínima é obrigatória"),
  idade_maxima: z.coerce.number().min(1, "Idade máxima é obrigatória"),
  prazo_minimo: z.coerce.number().min(1, "Prazo mínimo é obrigatório"),
  prazo_maximo: z.coerce.number().min(1, "Prazo máximo é obrigatório"),
  id_uy3: z.string().uuid("UUID inválido"),
  cor_grafico: z.string().min(1, "Cor do gráfico é obrigatória")
});

type FormData = z.infer<typeof schema>;

export default function CadastroProdutoPage() {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      prefixo: "",
      idade_minima: 18,
      idade_maxima: 65,
      prazo_minimo: 6,
      prazo_maximo: 24,
      id_uy3: "",
      cor_grafico: ""
    }
  });

  const { token } = useAuth();

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
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(JSON.stringify(err));
      }

      alert("Produto cadastrado com sucesso!");
      methods.reset();
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      alert("Erro ao cadastrar produto: " + error);
    }
  };

  return (
        <ProtectedRoute requiredPermission="Cadastro_ver">
    
    <div className="space-y-4">
      <CampoBoasVindas />

      <h1 className="mb-6 text-2xl font-bold">Cadastrar Novo Produto</h1>

      <FormProvider {...methods}>
        <Form {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Produto</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {[
                    { name: "nome", label: "Nome", type: "text" },
                    { name: "prefixo", label: "Prefixo", type: "text" },
                    { name: "idade_minima", label: "Idade Mínima", type: "number" },
                    { name: "idade_maxima", label: "Idade Máxima", type: "number" },
                    { name: "prazo_minimo", label: "Prazo Mínimo", type: "number" },
                    { name: "prazo_maximo", label: "Prazo Máximo", type: "number" },
                    { name: "id_uy3", label: "ID UY3 (UUID)", type: "text" },
                    { name: "cor_grafico", label: "Cor do Gráfico (ex: var(--cor))", type: "text" }
                  ].map(({ name, label, type }) => (
                    <FormField
                      key={name}
                      control={methods.control}
                      name={name as keyof FormData}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{label}</FormLabel>
                          <FormControl>
                            <Input type={type} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
              <Button type="reset" variant="outline" onClick={() => methods.reset()}>
                Limpar
              </Button>
              <Button type="submit">Cadastrar Produto</Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
        </ProtectedRoute>
    
  );
}
