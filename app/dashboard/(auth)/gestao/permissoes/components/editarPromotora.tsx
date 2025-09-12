"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Combobox } from "@/components/Combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const permissoesSchema = z.object({
  id: z.string(),
  nome: z.string().min(5, "Por favor, defina um nome para esta permissão."),
  status: z.number()
});

type EquipeFormValues = z.infer<typeof permissoesSchema> & {
  nome?: string;
  modulo?: string;
};

type EquipeEditProps = {
  permissoes: EquipeFormValues | null;
  onClose: () => void;
  onCancel?: () => void;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function EquipeEditForm({ permissoes, onClose }: EquipeEditProps) {
  const router = useRouter();
  const methods = useForm<EquipeFormValues>({
    resolver: zodResolver(permissoesSchema),
    defaultValues: permissoes || { id: "", nome: "", status: 1 }
  });

  const { token } = useAuth();

  useEffect(() => {
    methods.reset(permissoes || { id: "", nome: "", status: 1 });
  }, [permissoes, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

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

  const onSubmit = async (data: EquipeFormValues) => {
    if (!token) {
      toast.error("Autenticação necessária", {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        },
        description: "Faça login para continuar"
      });
      return;
    }

    try {
      const payload: Partial<EquipeFormValues> = { id: data.id, status: data.status };

      if (data.nome && data.nome !== permissoes?.nome) {
        payload.nome = data.nome;
      }

      await axios.put(`${API_BASE_URL}/permissoes/atualizar`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      toast.success("Equipe atualizada com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        },
        description: `Alterações salvas para: ${data.nome}`
      });
      onClose();
    } catch (error: any) {
      const msg = error?.response?.data?.erro || "Erro ao atualizar equipe";

      if (msg === "Nome já cadastrado.") {
        methods.setError("nome", {
          type: "manual",
          message: msg
        });
        toast.warning("Nome já existe", {
          style: {
            background: "var(--toast-warning)",
            color: "var(--toast-warning-foreground)",
            boxShadow: "var(--toast-shadow)"
          },
          description: "Escolha outro nome para a equipe"
        });
      } else {
        toast.error("Falha na atualização", {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          },
          description: msg
        });
      }

      console.error("Erro ao atualizar equipe:", error);
    }
  };

  const handleClose = () => {
    toast.info("Edição cancelada", {
      style: {
        background: "var(--toast-info)",
        color: "var(--toast-info-foreground)",
        boxShadow: "var(--toast-shadow)"
      }
    });
    onClose();
  };

  return (
    <Sheet open={!!permissoes} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-1/3 max-w-full! px-5 rounded-l-xl">
        <SheetHeader className="px-0">
          <SheetTitle className="text-xl font-semibold">
            Editar permissão: <span className="text-primary">{permissoes?.nome}</span>
          </SheetTitle>
        </SheetHeader>

        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
              <Card>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={methods.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da permissão</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl> 
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <Combobox
                              data={statusOptions}
                              displayField="name"
                              value={statusOptions.find((opt) => opt.id === field.value) ?? null}
                              onChange={(selected) => field.onChange(selected?.id)}
                              searchFields={["name"]}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="mb-6 flex flex-col mt-auto justify-end gap-4">
                <Button type="submit" className="py-6">Salvar alterações</Button>
                <Button type="button" variant="outline" onClick={handleClose}>
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
