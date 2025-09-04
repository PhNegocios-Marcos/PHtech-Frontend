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
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner"; // ✅ adicionado
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const subprodutoSchema = z.object({
  produtos_subprodutos_id: z.string().optional(),
  produtos_subprodutos_nome: z
    .string()
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  produtos_subprodutos_atividade: z.string(),
  produtos_subprodutos_status: z.number()
});

type Subproduto = z.infer<typeof subprodutoSchema>;

type SubprodutoDrawerProps = {
  subproduto: Subproduto;
  onClose: () => void;
  onRefresh: () => void;
};

export function SubprodutoEdit({ subproduto, onClose, onRefresh }: SubprodutoDrawerProps) {
  const router = useRouter();
  const methods = useForm<Subproduto>({
    resolver: zodResolver(subprodutoSchema),
    defaultValues: {
      ...subproduto,
      produtos_subprodutos_status: subproduto.produtos_subprodutos_status ?? 1
    }
  });

  const { token } = useAuth();

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

  useEffect(() => {
    methods.reset({
      ...subproduto,
      produtos_subprodutos_status: subproduto.produtos_subprodutos_status ?? 1
    });
  }, [subproduto, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

  const onSubmit = async (data: Subproduto) => {
    if (!token) {
      toast.error("Token global não definido!", {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      return;
    }

    const payload = {
      id: data.produtos_subprodutos_id,
      nome: data.produtos_subprodutos_nome,
      atividade: data.produtos_subprodutos_atividade,
      status: data.produtos_subprodutos_status
    };

    try {
      await axios.put(`${API_BASE_URL}/subprodutos/atualizar`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Subproduto atualizado com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });

      onClose();
      onRefresh();
    } catch (error: any) {
      console.error("Erro ao atualizar subproduto:", error.response?.data || error.message);
      toast.error(`Erro: ${error.response?.data?.detail || error.message}`, {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit, (errors) => {
          console.warn("Erros de validação:", errors);
        })}
        className="grid grid-cols-2 gap-4"
      >
        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Editar Tipo de Operação:{" "}
                <span className="text-primary">{subproduto.produtos_subprodutos_nome}</span>
              </CardTitle>
              <Button onClick={onClose} variant="outline">
                Voltar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={methods.control}
                name="produtos_subprodutos_nome"
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
                name="produtos_subprodutos_atividade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Atividade</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={methods.control}
                name="produtos_subprodutos_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Combobox
                        data={statusOptions}
                        displayField="name"
                        value={
                          statusOptions.find((opt) => opt.id === field.value) ?? statusOptions[0]
                        }
                        onChange={(selected) => field.onChange(selected?.id ?? 1)}
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

        <div className="col-span-2 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar Alterações</Button>
        </div>
      </form>
    </FormProvider>
  );
}
