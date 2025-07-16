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

// Novo schema de convênio
const schema = z.object({
  convenio_nome: z.string().min(1, "Nome do convênio é obrigatório"),
  convenio_prefixo: z.coerce.number().min(1, "Prefixo é obrigatório"),
  convenio_grupo: z.string().uuid("UUID do grupo é inválido")
});

type FormData = z.infer<typeof schema>;

export default function CadastroConvenioPage() {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      convenio_nome: "",
      convenio_prefixo: 100,
      convenio_grupo: ""
    }
  });

  const { token } = useAuth();

  const onSubmit = async (data: FormData) => {
    if (!token) {
      alert("Token não encontrado. Faça login.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/convenio`, {
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

      alert("Convênio cadastrado com sucesso!");
      methods.reset();
    } catch (error) {
      console.error("Erro ao cadastrar convênio:", error);
      alert("Erro ao cadastrar convênio: " + error);
    }
  };

  return (
    <ProtectedRoute requiredPermission="Cadastro_ver">
      <CampoBoasVindas />

      <div className="mt-10 space-y-4">
        <h1 className="mb-6 text-2xl font-bold">Cadastrar Novo Convênio</h1>

        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Convênio</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {[
                      { name: "convenio_nome", label: "Nome do Convênio", type: "text" },
                      { name: "convenio_prefixo", label: "Prefixo", type: "number" },
                      { name: "convenio_grupo", label: "Grupo (UUID)", type: "text" }
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
                <Button type="submit">Cadastrar Convênio</Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </div>
    </ProtectedRoute>
  );
}
