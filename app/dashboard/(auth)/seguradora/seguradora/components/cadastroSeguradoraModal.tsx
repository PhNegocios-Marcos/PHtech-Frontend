"use client";

import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const schema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  razao_social: z.string().min(1, "Razão social é obrigatória"),
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "CNPJ inválido")
});

type FormData = z.infer<typeof schema>;

type CadastroSeguradoraModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CadastroSeguradoraModal({ isOpen, onClose }: CadastroSeguradoraModalProps) {
  const router = useRouter();
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      razao_social: "",
      cnpj: ""
    }
  });

  const { token } = useAuth();

  // Função para formatar o CNPJ
  const formatCNPJ = (value: string): string => {
    const cleaned = value.replace(/\D/g, "");
    
    if (cleaned.length <= 2) {
      return cleaned;
    }
    if (cleaned.length <= 5) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    }
    if (cleaned.length <= 8) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
    }
    if (cleaned.length <= 12) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
    }
    
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
  };

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
      toast.error("Token não encontrado. Faça login.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/seguradoras/criar`, {
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

      toast.success("Seguradora cadastrada com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar seguradora:", error);
      toast.error("Erro ao cadastrar seguradora: " + error);
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
                <h2 className="text-xl font-semibold">Cadastrar Nova Seguradora</h2>
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
                  <CardTitle>Dados da Seguradora</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
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
                      name="razao_social"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Razão Social</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite a razão social" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={methods.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Digite o CNPJ (ex: 12.345.678/0001-90)" 
                              value={field.value}
                              onChange={(e) => {
                                const formattedValue = formatCNPJ(e.target.value);
                                field.onChange(formattedValue);
                              }}
                              maxLength={18}
                            />
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
                <Button type="submit">Cadastrar Seguradora</Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </aside>
    </>
  );
}