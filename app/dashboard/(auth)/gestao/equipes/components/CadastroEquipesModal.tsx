"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import toastComponent from "@/utils/toastComponent";
import { toast } from "sonner";

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
import { Combobox } from "./Combobox";
import axios from "axios";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

// Schema validando promotora apenas se for banco
const schema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
  status: z.enum(["0", "1"]),
  promotora: z.string().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

type CadastroEquipeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CadastroEquipeModal({
  isOpen,
  onClose,
}: CadastroEquipeModalProps) {
  const [promotoras, setPromotoras] = useState<{ id: string; nome: string }[]>([]);
  const [selectedPromotora, setSelectedPromotora] = useState<{ id: string; nome: string } | null>(null);

  const { token, selectedPromotoraId, userData } = useAuth();
  const router = useRouter();
  const isBanco = userData?.tipo_usuario === "Banco";

  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      descricao: "",
      status: "1",
      promotora: isBanco ? "" : selectedPromotoraId,
    },
  });

  // Redireciona se não tiver token
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

  // Carregar promotoras apenas se for banco
  useEffect(() => {
    if (isBanco && isOpen) {
      const fetchPromotoras = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/promotora/listar`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = response.data.map((item: any) => ({
            id: item.id,
            nome: item.nome,
            nomeUnico: `${item.nome}#${item.id}`
          }));

          setPromotoras(data);
        } catch (error) {
          toastComponent.error("Erro ao carregar promotoras", {
            description: `${error}`,
          });
        }
      };
      fetchPromotoras();
    }
  }, [isBanco, isOpen, token]);

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toastComponent.error("Autenticação necessária", {
        description: "Faça login para continuar",
      });
      return;
    }

    // Definir promotora: banco precisa escolher, promotora usa a do contexto
    const promotoraId = isBanco
      ? selectedPromotora
      : selectedPromotoraId;

    if (isBanco && !promotoraId) {
      toastComponent.error("Selecione uma promotora para cadastrar a equipe");
      return;
    }

    const payload = {
      promotora: isBanco ? selectedPromotora?.id : selectedPromotoraId,
      nome: data.nome,
      descricao: data.descricao,
      status: Number(data.status),
    };

    try {
      const response = await fetch(`${API_BASE_URL}/equipe/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Erro ao cadastrar equipe");
      }

      console.log(response);

      if (response.ok) {
        toastComponent.success("Equipe cadastrada com sucesso!");
      }

      onClose();
      methods.reset();
    } catch (error: any) {
      console.error("Erro ao cadastrar equipe:", error);
      toastComponent.error(error.message || "Tente novamente mais tarde");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50"
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 h-full w-1/2 bg-background shadow-lg overflow-auto p-6 rounded-l-2xl"
      >
        <FormProvider {...methods}>
          <Form {...methods}>
            <form
              onSubmit={methods.handleSubmit(onSubmit)}
              className="flex flex-col h-full"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cadastrar nova equipe</h2>
                <X onClick={onClose} className="cursor-pointer" />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Dados da equipe</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={methods.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da equipe</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="descricao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Input placeholder="Descreva a equipe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {isBanco && (
                      <FormField
                        control={methods.control}
                        name="promotora"
                        render={() => (
                          <FormItem>
                            <FormLabel>Promotora da equipe</FormLabel>
                            <FormControl>
                              <Combobox
                                data={promotoras}
                                displayField="nome"
                                value={selectedPromotora}
                                onChange={(item) =>setSelectedPromotora(item)}
                                searchFields={["id", "nome"]}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <FormField
                      control={methods.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}         
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione um status" className="w-full"/>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Status</SelectLabel>
                                  <SelectItem value="1">Ativo</SelectItem>
                                  <SelectItem value="0">Inativo</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
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
                <Button type="submit">Cadastrar equipe</Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </aside>
    </>
  );
}
