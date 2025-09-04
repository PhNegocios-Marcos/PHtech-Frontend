"use client";

import React, { useEffect } from "react";
import axios from "axios";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Combobox } from "@/components/Combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

// Validação com Zod
const perfilSchema = z.object({
  id: z.string(),
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }).optional(),
  descricao: z.string().optional(),
  status: z.number()
});

type Perfil = z.infer<typeof perfilSchema>;

type PerfilDrawerProps = {
  onClose: () => void;
  perfil: Perfil | null;
};

export function EquipeEditForm({ perfil, onClose }: PerfilDrawerProps) {
  const methods = useForm<Perfil>({
    resolver: zodResolver(perfilSchema),
    defaultValues: perfil || {}
  });

  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (perfil) {
      methods.reset(perfil);
      // toast.info("Dados do perfil carregados", {
      //   style: {
      //     background: "var(--toast-info)",
      //     color: "var(--toast-info-foreground)",
      //     boxShadow: "var(--toast-shadow)"
      //   },
      //   description: `Editando: ${perfil.nome}`
      // });
    }
  }, [perfil, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

    useEffect(() => {
    const timeout = setTimeout(() => {
      if (token == null) {
        // console.log("token null");
        router.push("/dashboard/login");
      } else {
        // console.log("tem token");
      }
    }, 2000); // espera 2 segundos antes de verificar

    return () => clearTimeout(timeout); // limpa o timer se o componente desmontar antes
  }, [token, router]);

  const onSubmit = async (data: Perfil) => {
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

    // Cria uma cópia dos dados para enviar
    const payload = { ...data };

    // Remove o campo 'nome' se não foi alterado
    if (perfil && data.nome === perfil.nome) {
      delete payload.nome;
    }

    try {
      await axios.put(`${API_BASE_URL}/perfil/atualizar`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Perfil atualizado com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      onClose();
      window.location.reload();
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error.response?.data || error.message);
      toast.error("Falha ao atualizar perfil", {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        },
        description: error.response?.data?.message || "Erro desconhecido"
      });
    }
  };

  const handleClose = () => {
    // toast.info("Edição cancelada", {
    //   style: {
    //     background: "var(--toast-info)",
    //     color: "var(--toast-info-foreground)",
    //     boxShadow: "var(--toast-shadow)"
    //   }
    // });
    onClose();
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4 overflow-y-auto">
          <Card className="col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Perfil: <span className="text-primary">{perfil?.nome}</span>
                </CardTitle>
                <div>
                  <Button onClick={handleClose} variant="outline">
                    Voltar
                  </Button>
                  <Button className="ml-4" type="submit">Salvar alterações</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={methods.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                          onChange={(selected) => field.onChange(selected.id)}
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
        </form>
      </Form>
    </FormProvider>
  );
}
