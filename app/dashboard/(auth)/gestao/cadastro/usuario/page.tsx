"use client";

import React from "react";
import Cleave from "cleave.js/react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const telefoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

const schema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().regex(cpfRegex, "CPF inválido"),
  email: z.string().email("Email inválido"),
  telefone: z.string().regex(telefoneRegex, "Telefone inválido"),
  endereco: z.string().min(1, "Endereço é obrigatório"),
  senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  confirmar_senha: z.string().min(6, "Confirmação deve ter ao menos 6 caracteres"),
  // promotora: z.string().uuid("Promotora inválida"),
  tipo_acesso: z.enum(["externo", "interno"])
}).refine((data) => data.senha === data.confirmar_senha, {
  message: "As senhas não conferem",
  path: ["confirmar_senha"]
});

type FormData = z.infer<typeof schema>;

export default function CadastroPromotora() {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
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
      // promotora: ""
    }
  });

  const { token } = useAuth();
  const router = useRouter();

  // console.log('token no cadastro user: ', token)

  // Componente para input Cleave com máscara
  function InputCleave({
    value,
    onChange,
    onBlur,
    error,
    placeholder,
    options
  }: {
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    error?: string;
    placeholder?: string;
    options: any;
  }) {
    return (
      <div>
        <Cleave
          options={options}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full rounded-lg border px-3 py-2 ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  const onSubmit = async (data: FormData) => {
    if (!token) {
      alert("Token não encontrado. Faça login.");
      return;
    }


    // Remove máscara antes de enviar para o backend
    const payload = {
      nome: data.nome,
      cpf: data.cpf.replace(/\D/g, ""),
      email: data.email,
      telefone: data.telefone.replace(/\D/g, ""),
      endereco: data.endereco,
      senha: data.senha,
      confirmar_senha: data.confirmar_senha,
      // promotora: data.promotora,
      tipo_acesso: data.tipo_acesso
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/usuario/criar", {
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

      alert("Promotora cadastrada com sucesso!");
      router.push("/dashboard/default");
    } catch (error) {
      console.error("Erro ao cadastrar usuario:", error);
      alert("Erro ao cadastrar usuario: " + error);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-3xl space-y-6 rounded-xl border p-6">
      <h2 className="text-center text-xl font-bold">Cadastrar Usuários</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm">Nome</label>
            <Input placeholder="Digite o nome" {...register("nome")} />
            {errors.nome && <p className="text-sm text-red-500">{errors.nome.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm">CPF</label>
            <Controller
              name="cpf"
              control={control}
              render={({ field }) => (
                <InputCleave
                  {...field}
                  options={{
                    delimiters: [".", ".", "-"],
                    blocks: [3, 3, 3, 2],
                    numericOnly: true
                  }}
                  placeholder="000.000.000-00"
                  error={errors.cpf?.message}
                />
              )}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Email</label>
            <Input type="email" placeholder="exemplo@email.com" {...register("email")} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm">Telefone</label>
            <Controller
              name="telefone"
              control={control}
              render={({ field }) => (
                <InputCleave
                  {...field}
                  options={{
                    delimiters: ["(", ") ", "-"],
                    blocks: [0, 2, 5, 4], // zero para permitir que o primeiro bloco seja "(", depois 2 dígitos do DDD, 5 números e 4 números
                    numericOnly: true
                  }}
                  placeholder="(00) 00000-0000"
                  error={errors.telefone?.message}
                />
              )}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Endereço</label>
            <Input placeholder="Digite o endereço" {...register("endereco")} />
            {errors.endereco && <p className="text-sm text-red-500">{errors.endereco.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm">Senha</label>
            <Input type="password" placeholder="Senha" {...register("senha")} />
            {errors.senha && <p className="text-sm text-red-500">{errors.senha.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm">Confirmar Senha</label>
            <Input type="password" placeholder="Confirmar senha" {...register("confirmar_senha")} />
            {errors.confirmar_senha && (
              <p className="text-sm text-red-500">{errors.confirmar_senha.message}</p>
            )}
          </div>

          {/* <div>
            <label className="mb-1 block text-sm">Promotora (UUID)</label>
            <Input placeholder="UUID da promotora" {...register("promotora")} />
            {errors.promotora && <p className="text-sm text-red-500">{errors.promotora.message}</p>}
          </div> */}

          <div>
            <label className="mb-1 block text-sm">Tipo de Acesso</label>
            <select {...register("tipo_acesso")} className="w-full rounded-lg border px-3 py-2">
              <option value="externo">Externo</option>
              <option value="interno">Interno</option>
            </select>
            {errors.tipo_acesso && (
              <p className="text-sm text-red-500">{errors.tipo_acesso.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/default")}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-primary text-white">
            Cadastrar
          </Button>
        </div>
      </form>
    </div>
  );
}
