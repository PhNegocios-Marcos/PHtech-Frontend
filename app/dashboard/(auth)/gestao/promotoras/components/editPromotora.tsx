"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Combobox } from "@/components/Combobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { MultiSelect, type MultiSelectOption } from "@/components/multi-select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type Promotora = {
  id: string;
  nome: string;
  razao_social: string;
  cnpj: string;
  representante: string | null;
  master: string;
  master_id: string;
  rateio_master: string;
  rateio_sub: string;
  status: number;
  gerentes?: string[];
};

type Usuario = {
  nome: string;
  id: string;
  hash?: string;
  email: string;
  tipo_usuario: string;
  status: number;
};

type PromotorEditProps = {
  data: Promotora;
  cnpj: string;
  id: string;
  onClose: () => void;
};

export function PromotorEdit({ data, onClose, cnpj, id }: PromotorEditProps) {
  const methods = useForm({
    defaultValues: data
  });
  const { token, userData } = useAuth();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosBanco, setUsuariosBanco] = useState<Usuario[]>([]);
  const isBanco = userData?.tipo_usuario === "Banco";

  useEffect(() => {
    methods.reset(data);
  }, [data, methods]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const value = e.target.value;
    if (value === "" || (!isNaN(Number(value)) && Number(value) >= 0)) {
      field.onChange(value);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (token == null) {
        router.push("/dashboard/login");
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [token, router]);

  useEffect(() => {
    async function fetchUsuariosRelacionados() {
      if (!token || !cnpj) {
        toast.error("Autenticação necessária", {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          },
          description: "Token ou CNPJ não encontrado"
        });
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/rel_usuario_promotora/${cnpj}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.detail || "Erro ao buscar relacionamentos");
        }

        const data = await response.json();
        const usuariosArray: Usuario[] = [];

        Object.values(data.promotoras).forEach((prom: any) => {
          prom.usuarios.forEach((relUsuario: any) => {
            if (relUsuario.usuario) {
              usuariosArray.push({
                nome: relUsuario.usuario.nome,
                email: relUsuario.usuario.email,
                tipo_usuario: relUsuario.usuario.tipo_usuario,
                status: relUsuario.usuario.status,
                id: relUsuario.usuario.id
              });
            }
          });
        });

        setUsuarios(usuariosArray);
      } catch (error: any) {
        console.error("Erro na requisição:", error.message || error);
        toast.error("Falha ao carregar usuários", {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            boxShadow: "var(--toast-shadow)"
          },
          description: error.message || "Erro desconhecido"
        });
      }
    }

    fetchUsuariosRelacionados();
  }, [token, cnpj]);

  React.useEffect(() => {
    async function fetchUsuarios() {
      try {
        if (!token) {
          throw new Error("Token de autenticação não encontrado");
        }

        const response = await fetch(`${API_BASE_URL}/usuario/listar`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData?.detail || "Erro ao buscar usuários");
        }

        const data = await response.json();

        // Filter users to only include those with tipo_usuario === "Banco"
        const usuariosFiltrados = data
          .filter((usuario: any) => usuario.tipo_usuario === "Banco")
          .map((usuario: any) => ({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            tipo_usuario: usuario.tipo_usuario,
            status: usuario.status
          }));

        setUsuariosBanco(usuariosFiltrados);
      } catch (error: any) {
        console.error("Erro ao buscar usuários:", error.message);
        toast.error(`Erro ao carregar usuários: ${error.message}`, {
          style: {
            background: "var(--toast-error)",
            color: "var(--toast-error-foreground)",
            border: "1px solid var(--toast-border)",
            boxShadow: "var(--toast-shadow)"
          }
        });
      }
    }

    fetchUsuarios();
  }, [token]);

  const onSubmit = async (formData: Promotora) => {
    if (!token) {
      toast.error("Token de autenticação não encontrado.", {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      return;
    }

    const payload = {
      id: formData.id,
      nome: formData.nome,
      representante: formData.representante,
      razao_social: formData.razao_social,
      status: Number(formData.status)
    };

    const payload2 = {
      usuario_hash: formData.gerentes || [],
      promotora_hash: formData.id
    };

    try {
      await axios.put(`${API_BASE_URL}/promotora/atualizar`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const response2 = await fetch(`${API_BASE_URL}/gestao-promotora-gerente/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload2)
      });

      if (!response2.ok) {
        throw new Error("Erro ao atualizar relacionamentos com gerentes");
      }

      toast.success("Promotora atualizada com sucesso!", {
        style: {
          background: "var(--toast-success)",
          color: "var(--toast-success-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
      onClose();
      window.location.reload();
    } catch (error: any) {
      toast.error(`Erro: ${error.response?.data?.detail || error.message}`, {
        style: {
          background: "var(--toast-error)",
          color: "var(--toast-error-foreground)",
          boxShadow: "var(--toast-shadow)"
        }
      });
    }
  };

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="grid grid-cols-2 overflow-y-auto">
          <Card className="col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Dados da Promotora: <span className="text-primary">{data.nome}</span>
                </CardTitle>
                <div>
                  <Button onClick={onClose} variant="outline">
                    Voltar
                  </Button>
                  <Button className="ml-4" type="submit">
                    Salvar alterações
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 space-y-4">
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
                  name="razao_social"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                          {...field}
                          readOnly
                          className="cursor-not-allowed bg-gray-100 text-gray-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="representante"
                  render={({ field }) => {
                    // Usar a lista original de usuários para representante
                    const representanteOptions = usuarios
                      .filter((usuario) => usuario.email && usuario.email.trim() !== "")
                      .map((usuario) => ({
                        id: usuario.email,
                        name: usuario.nome || usuario.email || "Usuário sem nome"
                      }));

                    const selectedValue =
                      representanteOptions.find((opt) => opt.id === field.value) || null;

                    return (
                      <FormItem>
                        <FormLabel>Representante</FormLabel>
                        <FormControl>
                          <Combobox
                            data={representanteOptions}
                            displayField="name"
                            value={selectedValue}
                            onChange={(selected) => field.onChange(selected?.id || "")}
                            searchFields={["name"]}
                            placeholder="Selecione um representante..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={methods.control}
                  name="gerentes"
                  render={({ field }) => {
                    // Usar a lista filtrada de usuários Banco para gerentes
                    const gerenteOptions: MultiSelectOption[] = usuariosBanco
                      .filter((usuario) => usuario.email && usuario.email.trim() !== "")
                      .map((usuario) => ({
                        label: String(usuario.nome || usuario.email || "Usuário sem nome"),
                        value: String(usuario.id)
                      }));

                    return (
                      <FormItem>
                        <FormLabel>Gerentes</FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={gerenteOptions}
                            onValueChange={(values) => {
                              field.onChange(values);
                            }}
                            defaultValue={field.value || []}
                            placeholder="Selecione os gerentes..."
                            deduplicateOptions={true}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={methods.control}
                  name="rateio_master"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rateio Master</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value || ""}
                          onChange={(e) => handleNumberChange(e, field)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="rateio_sub"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rateio Sub</FormLabel>
                      <FormControl>
                        <Input
                          value={field.value || ""}
                          onChange={(e) => handleNumberChange(e, field)}
                        />
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
        </form>
      </Form>
    </FormProvider>
  );
}