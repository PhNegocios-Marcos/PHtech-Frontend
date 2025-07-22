"use client";

import React from "react";
import Cleave from "cleave.js/react";
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
  FormMessage
} from "@/components/ui/form";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const schema = z
  .object({
    nome_taxa: z.string().min(1, "Nome da tabela é obrigatório"),
    prazo_minimo: z.string().min(1, "Prazo mínimo é obrigatório"),
    prazo_maximo: z.string().min(1, "Prazo máximo é obrigatório"),
    taxa_mensal: z.string().min(1, "Taxa mensal é obrigatório"),
  })

type FormData = z.infer<typeof schema>;

type CadastroTabelaModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CadastroTabelaModal({ isOpen, onClose }: CadastroTabelaModalProps) {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome_taxa: "",
      prazo_minimo: "",
      prazo_maximo: "",
      taxa_mensal: ""
    }
  });

  const { token } = useAuth();
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    if (!token) {
      alert("Token não encontrado. Faça login.");
      return;
    }

    const payload = {
      nome_taxa: data.nome_taxa,
      prazo_minimo: data.prazo_minimo,
      prazo_maximo: data.prazo_maximo,
      taxa_mensal: data.taxa_mensal
    };

    try {
      const response = await fetch(`${API_BASE_URL}/config_taxas_prazos/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(JSON.stringify(err));
      }

      alert("Tabela cadastrada com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      alert("Erro ao cadastrar usuário: " + error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 h-full w-1/2 overflow-auto bg-white p-6 shadow-lg">
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cadastrar Nova Tabela</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-2xl font-bold hover:text-gray-900"
                  aria-label="Fechar">
                  ×
                </button>
              </div>

              <Card className="flex-grow overflow-auto">
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={methods.control}
                      name="nome_taxa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Tabela</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o nome" {...field} />
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
                          <FormLabel>Prozo mínimo</FormLabel>
                          <FormControl>
                            <Input placeholder="12" {...field} />
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
                          <FormLabel>Prazo máximo</FormLabel>
                          <FormControl>
                            <Input placeholder="64" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="taxa_mensal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Taxa mensal</FormLabel>
                          <FormControl>
                            <Input placeholder="1.6" {...field} />
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
