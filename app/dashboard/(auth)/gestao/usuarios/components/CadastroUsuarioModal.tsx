"use client";

import React from "react";
import Cleave from "cleave.js/react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const telefoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

const schema = z
  .object({
    nome: z.string().min(1, "Nome é obrigatório"),
    cpf: z.string().regex(cpfRegex, "CPF inválido"),
    email: z.string().email("Email inválido"),
    telefone: z.string().regex(telefoneRegex, "Telefone inválido"),
    endereco: z.string().min(1, "Endereço é obrigatório"),
    senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
    confirmar_senha: z.string().min(6, "Confirmação deve ter ao menos 6 caracteres"),
    tipo_acesso: z.enum(["externo", "interno"]),
  })
  .refine((data) => data.senha === data.confirmar_senha, {
    message: "As senhas não conferem",
    path: ["confirmar_senha"],
  });

type FormData = z.infer<typeof schema>;

type CadastroUsuarioModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CadastroUsuarioModal({
  isOpen,
  onClose,
}: CadastroUsuarioModalProps) {
  const methods = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tipo_acesso: "externo",
      cpf: "",
      telefone: "",
      email: "",
      nome: "",
      endereco: "",
      senha: "",
      confirmar_senha: "",
    },
  });

  const { token } = useAuth();
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    if (!token) {
      alert("Token não encontrado. Faça login.");
      return;
    }

    const payload = {
      nome: data.nome,
      cpf: data.cpf.replace(/\D/g, ""),
      email: data.email,
      telefone: data.telefone.replace(/\D/g, ""),
      endereco: data.endereco,
      senha: data.senha,
      confirmar_senha: data.confirmar_senha,
      tipo_acesso: data.tipo_acesso,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/usuario/criar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(JSON.stringify(err));
      }

      alert("Usuário cadastrado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      alert("Erro ao cadastrar usuário: " + error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/50" aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 h-full w-1/2 bg-white shadow-lg overflow-auto p-6"
      >
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col h-full">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cadastrar Novo Usuário</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-2xl font-bold hover:text-gray-900"
                  aria-label="Fechar"
                >
                  ×
                </button>
              </div>

              <Card className="flex-grow overflow-auto">
                <CardHeader>
                  <CardTitle>Dados do Usuário</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={methods.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o nome" {...field} />
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
                            <Cleave
                              {...field}
                              options={{
                                delimiters: [".", ".", "-"],
                                blocks: [3, 3, 3, 2],
                                numericOnly: true,
                              }}
                              className="w-full rounded-lg border px-3 py-1"
                              placeholder="000.000.000-00"
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
                            <Input type="email" placeholder="exemplo@email.com" {...field} />
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
                            <Cleave
                              {...field}
                              options={{
                                delimiters: ["(", ") ", "-"],
                                blocks: [0, 2, 5, 4],
                                numericOnly: true,
                              }}
                              placeholder="(00) 00000-0000"
                              className="w-full rounded-lg border px-3 py-1"
                            />
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
                            <Input placeholder="Digite o endereço" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="senha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Senha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="confirmar_senha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Senha</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirmar senha" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={methods.control}
                      name="tipo_acesso"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Acesso</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="externo">Externo</SelectItem>
                              <SelectItem value="interno">Interno</SelectItem>
                            </SelectContent>
                          </Select>
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
                <Button type="submit">Cadastrar</Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </aside>
    </>
  );
}
