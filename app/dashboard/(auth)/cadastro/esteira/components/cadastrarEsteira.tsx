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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const telefoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

function validarCPF(cpf: string) {
  cpf = cpf.replace(/\D/g, "");

  const penultimoNum = parseInt(cpf[cpf.length - 2]);
  const ultimoNum = parseInt(cpf[cpf.length - 1]);

  let somaPrimeiroDigito = 0;
  for (let i = 0; i < 9; i++) {
    const digito = parseInt(cpf[i]);
    const peso = 10 - i;
    somaPrimeiroDigito += digito * peso;
  }

  const restoPrimeiro = somaPrimeiroDigito % 11;
  const primeiroDigito = restoPrimeiro < 2 ? 0 : 11 - restoPrimeiro;

  let somaSegundoDigito = 0;
  for (let i = 0; i < 9; i++) {
    const digito = parseInt(cpf[i]);
    const peso = 11 - i;
    somaSegundoDigito += digito * peso;
  }
  somaSegundoDigito += primeiroDigito * 2;

  const restoSegundo = somaSegundoDigito % 11;
  const segundoDigito = restoSegundo < 2 ? 0 : 11 - restoSegundo;

  if (primeiroDigito !== penultimoNum || segundoDigito !== ultimoNum) {
    return false
  } else {
    return true
  }
}

const schema = z
  .object({
    nome: z.string().min(1, "Nome é obrigatório"),
    cpf: z
      .string()
      .min(11, "CPF incompleto")
      .refine((val) => validarCPF(val), {
        message: "CPF inválido"
      }),
    email: z.string().email("Email inválido"),
    telefone: z.string().regex(telefoneRegex, "Telefone inválido"),
    endereco: z.string().min(1, "Endereço é obrigatório"),
    senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
    confirmar_senha: z.string().min(6, "Confirmação deve ter ao menos 6 caracteres"),
    tipo_acesso: z.enum(["externo", "interno"])
  })
  .refine((data) => data.senha === data.confirmar_senha, {
    message: "As senhas não conferem",
    path: ["confirmar_senha"]
  });

type FormData = z.infer<typeof schema>;

type CadastroUsuarioModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CadatroEsteira({ isOpen, onClose }: CadastroUsuarioModalProps) {
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
      confirmar_senha: ""
    }
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
      tipo_acesso: data.tipo_acesso
    };

    try {
      const response = await fetch(`${API_BASE_URL}/usuario/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
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
        className="fixed top-0 right-0 z-50 h-full w-1/2 overflow-auto bg-white p-6 shadow-lg">
        <FormProvider {...methods}>
          <Form {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className="flex h-full flex-col">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cadastrar Novo Usuário</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-2xl font-bold hover:text-gray-900"
                  aria-label="Fechar">
                  ×
                </button>
              </div>

              <Card className="flex-grow overflow-auto">
                <CardHeader>
                  <CardTitle>Dados do Usuário</CardTitle>
                </CardHeader>

                <CardContent>
                 
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
