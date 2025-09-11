"use client";

import React, { useEffect } from "react";
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
  FormMessage
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const schema = z.object({
  averbador_nome: z.string().min(1, "Nome é obrigatório")
});

type FormData = z.infer<typeof schema>;

type CadastroConvenioModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CadastroAverbadorModal({ isOpen, onClose }: CadastroConvenioModalProps) {
  const router = useRouter();
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      averbador_nome: ""
    }
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

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error("Token não encontrado. Faça login.", {
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/averbador/criar`, {
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

      toast.success("Averbador cadastrado com sucesso!", {
        style: {
          background: 'var(--toast-success)',
          color: 'var(--toast-success-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar averbador:", error);
      toast.error(`Erro ao cadastrar averbador: ${error instanceof Error ? error.message : String(error)}`, {
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
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
                <h2 className="text-xl font-semibold">Cadastrar Novo Averbador</h2>
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
                  <CardTitle>Dados do Averbador</CardTitle>
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
                            <Input placeholder="Digite o nome" {...field} />
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