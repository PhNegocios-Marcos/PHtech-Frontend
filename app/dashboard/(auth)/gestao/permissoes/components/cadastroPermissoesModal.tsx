"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Combobox } from "@/components/Combobox";
import { toast } from "sonner";
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const schema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  modulo: z.string().min(1, "Módulo é obrigatório")
});

type FormData = z.infer<typeof schema>;

type CadastroEquipeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ModuloOption = {
  id: string;
  name: string;
};

export default function CadastroPermissoesModal({ isOpen, onClose }: CadastroEquipeModalProps) {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      modulo: ""
    }
  });

  const { token } = useAuth();
  const [modulos, setModulos] = useState<ModuloOption[]>([]);
  const router = useRouter();

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
    if (!token || !isOpen) return;

    async function fetchModulos() {
      try {
        const response = await fetch(`${API_BASE_URL}/modulo/listar`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Erro ao buscar módulos");

        const data = await response.json();
        const options = data.map((modulo: any) => ({
          id: String(modulo.id),
          name: modulo.nome
        }));
        setModulos(options);
        
        // toast.success("Módulos carregados com sucesso", {
        //   style: {
        //     background: 'var(--toast-success)',
        //     color: 'var(--toast-success-foreground)',
        //     boxShadow: 'var(--toast-shadow)'
        //   },
        //   description: `${options.length} módulos disponíveis`
        // });
      } catch (error) {
        console.error("Erro ao listar módulos:", error);
        toast.error("Falha ao carregar módulos", {
          style: {
            background: 'var(--toast-error)',
            color: 'var(--toast-error-foreground)',
            boxShadow: 'var(--toast-shadow)'
          },
          description: "Não foi possível carregar a lista de módulos"
        });
      }
    }

    fetchModulos();
  }, [token, isOpen]);

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error("Autenticação necessária", {
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        },
        description: "Faça login para continuar"
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/permissoes/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Erro ao cadastrar equipe");
      }

      toast.success("Equipe cadastrada com sucesso!", {
        style: {
          background: 'var(--toast-success)',
          color: 'var(--toast-success-foreground)',
          boxShadow: 'var(--toast-shadow)'
        },
        description: `Equipe ${data.nome} criada`
      });
      onClose();
    } catch (error: any) {
      console.error("Erro ao cadastrar equipe:", error);
      toast.error("Falha ao cadastrar equipe", {
        style: {
          background: 'var(--toast-error)',
          color: 'var(--toast-error-foreground)',
          boxShadow: 'var(--toast-shadow)'
        },
        description: error.message || "Erro desconhecido"
      });
    }
  };

  if (!isOpen) return null;

  const handleClose = () => {
    toast.info("Cadastro cancelado", {
      style: {
        background: 'var(--toast-info)',
        color: 'var(--toast-info-foreground)',
        boxShadow: 'var(--toast-shadow)'
      }
    });
    onClose();
  };

  return (
    <>
      <div onClick={handleClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 h-full w-1/2 overflow-auto bg-background p-6 shadow-lg rounded-l-2xl">
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cadastrar Nova Equipe</h2>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-2xl font-bold hover:text-gray-900"
                  aria-label="Fechar">
                  ×
                </button>
              </div>

              <Card className="flex-grow overflow-auto">
                <CardHeader>
                  <CardTitle>Dados da Equipe</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={methods.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Equipe</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o nome" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="modulo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Módulo</FormLabel>
                          <FormControl>
                            <Combobox
                              data={modulos}
                              displayField="name"
                              value={modulos.find((opt) => opt.id === field.value) ?? null}
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

              <div className="mt-6 flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit">Cadastrar Equipe</Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </aside>
    </>
  );
}