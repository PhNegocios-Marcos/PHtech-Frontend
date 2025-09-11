"use client";

import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const schema = z.object({
  valor_minimo: z.string().min(1, "Valor mínimo é obrigatório"),
  valor_maximo: z.string().min(1, "Valor máximo é obrigatório"),
  valor_cobrado: z.string().min(1, "Valor cobrado é obrigatório")
});

type FormData = z.infer<typeof schema>;

type CadastroTaxaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
};

export default function CadastroTaxaModal({ isOpen, onClose, onRefresh }: CadastroTaxaModalProps) {
  const router = useRouter();
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      valor_minimo: "",
      valor_maximo: "",
      valor_cobrado: ""
    }
  });

  const { token } = useAuth();

    useEffect(() => {
    const timeout = setTimeout(() => {
      if (token == null) {
    sessionStorage.clear();
        router.push("/dashboard/login");
      } else {
        // console.log("tem token");
      }
    }, 2000); // espera 2 segundos antes de verificar

    return () => clearTimeout(timeout); // limpa o timer se o componente desmontar antes
  }, [token, router]);

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error("Token não encontrado. Faça login.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/faixa-valor-cobrado/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        const msg = err?.erro || `Erro ${response.status}: ${response.statusText}`;
        throw new Error(msg);
      }

      toast.success("Faixa de taxa cadastrada com sucesso!");
      methods.reset();
      if (onRefresh) await onRefresh();
      onClose();
    } catch (error: any) {
      console.error("Erro ao cadastrar faixa de taxa:", error);
      toast.error("Erro ao cadastrar faixa de taxa: " + error.message || error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 h-full w-1/2 overflow-auto bg-background p-6 shadow-lg rounded-l-2xl">
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cadastrar Nova Faixa de Taxa</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-2xl font-bold hover:text-gray-900"
                  aria-label="Fechar">
                  ×
                </button>
              </div>

              <Card className="flex-grow overflow-auto">
                <CardHeader>
                  <CardTitle>Dados da Faixa de Taxa</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={methods.control}
                      name="valor_minimo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Mínimo</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o valor mínimo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="valor_maximo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Máximo</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o valor máximo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="valor_cobrado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Cobrado</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o valor cobrado" {...field} />
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
                <Button type="submit">Cadastrar Faixa de Taxa</Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </aside>
    </>
  );
}
