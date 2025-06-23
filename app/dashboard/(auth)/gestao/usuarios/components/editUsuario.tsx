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

// Validação com Zod
const usuarioSchema = z.object({
  id: z.string(),
  nome: z.string().min(2),
  // cpf: z.string(),
  // email: z.string().email(),
  //   tipo_acesso: z.string(),
  telefone: z.string(),
  endereco: z.string(),
  status: z.number()
});

type Usuario = z.infer<typeof usuarioSchema> & {
  cpf?: string;
  email?: string;
};

type UsuarioDrawerProps = {
  onClose: () => void;
  usuario: Usuario | null;
};

export function UsuarioEdit({ usuario, onClose }: UsuarioDrawerProps) {
  const methods = useForm<Usuario>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: usuario || {}
  });

  const { token } = useAuth();

  useEffect(() => {
    if (usuario) {
      methods.reset(usuario);
    }
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
      await axios.put("http://127.0.0.1:8000/usuario/atualizar", data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Usuário atualizado com sucesso!");
      onClose();
      window.location.reload();
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error.response?.data || error.message);
      alert(`Erro: ${JSON.stringify(error.response?.data || error.message)}`);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form {...methods}>
        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="grid grid-cols-2 gap-4 overflow-y-auto p-6">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Dados do Usuário</CardTitle>
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
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

                {/* <FormField
                  control={methods.control}
                  name="tipo_acesso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Acesso</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

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

          <div className="col-span-2 p-4">
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
