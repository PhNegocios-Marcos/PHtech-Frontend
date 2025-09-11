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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import toastComponent from "@/utils/toastComponent";

const schema = z.object({
  modalidade_credito_nome: z.string().min(1, "Definir o nome da modalidade é obrigatório"),
  modalidade_credito_id: z.string().optional(),
  // modalidade_credito_cor_grafico: z.string().optional(),
  // modalidade_credito_digito_prefixo: z.preprocess(
  //   (val) => val === "" ? undefined : Number(val),
  //   z.number().min(1, "Definir um prefixo é obrigatório")
  // )
});

type FormData = z.infer<typeof schema>;

type CadastroModalidadeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CadastrModalidadeModal({ isOpen, onClose }: CadastroModalidadeModalProps) {
  const router = useRouter();
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      modalidade_credito_nome: "",
      modalidade_credito_id: "",
      // modalidade_credito_cor_grafico: "",
      // modalidade_credito_digito_prefixo: undefined,
    },
  });

  const { token } = useAuth();

  // Função para evitar números negativos
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const value = e.target.value;
    // Permite apenas números positivos ou vazio
    if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
      field.onChange(value === "" ? undefined : parseInt(value));
    }
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
      console.log(data);

      const response = await fetch(`${API_BASE_URL}/modalidade-credito/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.detail || "Erro desconhecido");
      }

      toastComponent.success("Modalidade cadastrada com sucesso!");
      onClose();
    } catch (error: any) {
      console.error("Erro ao cadastrar produto:", error);
      toastComponent.error("Erro ao cadastrar modalidade");
    }
  };

  if (!isOpen) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="px-5 rounded-l-xl">
        <SheetHeader className="px-0">
          <SheetTitle className="text-xl font-semibold">
            Cadastrar nova modalidade
          </SheetTitle>
          <SheetDescription>
            Cadastre uma modalidade e defina o prefixo dela. 
          </SheetDescription>
        </SheetHeader>
                <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col h-full">
              <Card className="overflow-auto">
                <CardHeader>
                  <CardTitle>Dados da modalidade</CardTitle>
                </CardHeader>

                <CardContent>
                  <div>
                    <FormField
                      control={methods.control}
                      name="modalidade_credito_nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o nome da modalidade" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* <FormField
                      control={methods.control}
                      name="modalidade_credito_digito_prefixo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prefixo</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Defina o prefixo desta modalidade"
                              value={field.value === undefined ? "" : field.value}
                              onChange={(e) => handleNumberChange(e, field)}
                              min="0"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
{/* 
                    <FormField
                      control={methods.control}
                      name="modalidade_credito_cor_grafico"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cor do Gráfico</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: var(--color-desktop)" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}
                  </div>
                </CardContent>
              </Card>

              <div className="mb-6 flex flex-col mt-auto justify-end gap-4">
                 <Button type="submit" className="py-6">Cadastrar</Button>
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