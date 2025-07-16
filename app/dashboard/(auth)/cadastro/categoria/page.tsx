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

// Schema para cadastro de categoria (subproduto)
const schema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  atividade: z.string().min(1, "Atividade é obrigatória")
});

type FormData = z.infer<typeof schema>;

export default function CadastroCategoriaPage() {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      atividade: ""
    }
  });

  const { token } = useAuth();

  const onSubmit = async (data: FormData) => {
    if (!token) {
      alert("Token não encontrado. Faça login.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/subprodutos/criar`, {
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

      alert("Categoria cadastrada com sucesso!");
      methods.reset();
    } catch (error) {
      console.error("Erro ao cadastrar categoria:", error);
      alert("Erro ao cadastrar categoria: " + error);
    }
  };

  return (
    <ProtectedRoute requiredPermission="Cadastro_ver">
      <CampoBoasVindas />

      <div className="mt-10 space-y-4">
        <h1 className="mb-6 text-2xl font-bold">Cadastrar Nova Categoria</h1>

        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Categoria</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                      { name: "nome", label: "Nome", type: "text" },
                      { name: "atividade", label: "Atividade", type: "text" }
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
                <Button type="submit">Cadastrar Categoria</Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </div>
    </ProtectedRoute>
  );
}
