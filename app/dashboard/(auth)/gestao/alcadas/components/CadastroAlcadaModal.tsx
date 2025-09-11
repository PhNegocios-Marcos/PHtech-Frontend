"use client";

import React, { useEffect } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
import { X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

// ✅ Schema de validação para Alçada
const schema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  valor: z
    .union([z.number(), z.string()])
    .transform((val) => (typeof val === "string" ? parseFloat(val) || 0 : val))
    .refine((val) => !isNaN(val) && val >= 0, {
      message: "Valor deve ser um número válido e não negativo"
    })
});

type FormData = z.infer<typeof schema>;

type CadastroAlcadaModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Componente para o campo de valor com tratamento numérico
const ValorInput = ({ field }: { field: any }) => {
  return (
    <Input
      type="number"
      min="0"
      step="0.01"
      value={field.value}
      onChange={(e) => {
        const value = e.target.value;
        field.onChange(value === "" ? "" : parseFloat(value) || 0);
      }}
      onBlur={field.onBlur}
    />
  );
};

export default function CadastroAlcadaModal({ isOpen, onClose }: CadastroAlcadaModalProps) {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      descricao: "",
      valor: 0
    }
  });

  const router = useRouter();

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
      toast.error("Autenticação necessária", {
        description: "Faça login para continuar",
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      return;
    }

    const payload = {
      nome: data.nome,
      descricao: data.descricao,
      valor: data.valor
    };

    try {
      const response = await fetch(`${API_BASE_URL}/alcada/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Erro ao cadastrar alçada");
      }

      toast.success("Alçada cadastrada com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      onClose();
      methods.reset();
    } catch (error: any) {
      console.error("Erro ao cadastrar alçada:", error);
      toast.error("Erro ao cadastrar alçada", {
        description: error.message || "Tente novamente mais tarde",
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-1/3 max-w-full! px-5 rounded-l-xl">
        <SheetHeader className="px-0">
          <SheetTitle className="text-xl font-semibold">
            Cadastrar nova alçada
          </SheetTitle>
        </SheetHeader>
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
              <Card>
                <CardHeader>
                  <CardTitle>Dados da alçada</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-flow-row-dense grid-cols-3 gap-4">
                    <FormField
                      control={methods.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Nome da alçada</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o nome da alçada" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="valor"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel>Valor</FormLabel>
                          <FormControl>
                            <ValorInput field={field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="descricao"
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Input placeholder="Descreva a alçada" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                  </div>
                </CardContent>
              </Card>

              <div className="mb-6 flex flex-col mt-auto justify-end gap-4">
                <Button type="submit" className="py-6">Cadastrar alçada</Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}