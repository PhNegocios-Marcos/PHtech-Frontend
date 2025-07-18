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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";

const usuarioSchema = z.object({
  id: z.string(),
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  telefone: z.string(),
  endereco: z.string(),
  status: z.number()
});

type Usuario = z.infer<typeof usuarioSchema> & {
  cpf?: string;
  email?: string;
  tipo_acesso?: string;
  cnpj?: string;
};

type UsuarioDrawerProps = {
  usuario: Usuario;
  onClose: () => void;
  onRefresh: () => void;
};

export function OrgaoEdit({ usuario, onClose, onRefresh }: UsuarioDrawerProps) {
  const methods = useForm<Usuario>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: usuario
  });

  const { token } = useAuth();

  useEffect(() => {
    methods.reset(usuario);
  }, [usuario, methods]);

  const statusOptions = [
    { id: 1, name: "Ativo" },
    { id: 0, name: "Inativo" }
  ];

  const onSubmit = async (data: Usuario) => {
    if (!token) {
      console.error("Token global não definido!");
      return;
    }

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/usuario/atualizar`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onClose();
      onRefresh();
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error.response?.data || error.message);
      alert(`Erro: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4 p-6">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Editar Usuário</CardTitle>
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
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-gray-100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly className="bg-gray-100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={methods.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
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
      </Form>
    </FormProvider>
  );
}