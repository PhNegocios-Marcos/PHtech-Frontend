// Arquivo: CadastroModulosModal.tsx
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
import { useRouter } from "next/navigation";
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
import { X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const schema = z.object({
  nome: z.string().min(5, "Por favor, defina um nome para o módulo")
});

type FormData = z.infer<typeof schema>;

type CadastroEquipeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CadastroModulosModal({
  isOpen,
  onClose,
}: CadastroEquipeModalProps) {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
    },
  });

  const router = useRouter();

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
      const response = await fetch(`${API_BASE_URL}/modulo/criar`, {
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

      toast.success("Módulo cadastrado com sucesso!", {
        style: {
          background: 'var(--toast-success)',
          color: 'var(--toast-success-foreground)',
          boxShadow: 'var(--toast-shadow)'
        }
      });
      onClose();
    } catch (error: any) {
      console.error("Erro ao cadastrar módulo:", error);
      toast.error(`Erro ao cadastrar módulo: ${error.message || error}`, {
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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-1/3 max-w-full! px-5 rounded-l-xl">
        <SheetHeader className="px-0">
          <SheetTitle className="text-xl font-semibold">
            Cadastrar novo módulo
          </SheetTitle>
        </SheetHeader>
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Módulo</CardTitle>
                </CardHeader>

                <CardContent>
                  <FormField
                    control={methods.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do módulo</FormLabel>
                        <FormControl>
                          <Input placeholder="Digite o nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="mb-6 flex flex-col mt-auto justify-end gap-4">
                <Button type="submit" className="py-6">Cadastrar módulo</Button>
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </SheetContent>
    </Sheet>

    // <>
    //   <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

    //   <aside
    //     role="dialog"
    //     aria-modal="true"
    //     className="fixed top-0 right-0 z-50 h-full w-1/2 bg-background shadow-lg overflow-auto p-6 rounded-l-2xl"
    //   >

    //   </aside>
    // </>
  );
}