"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FA from "./components/2FA";
import Promotoras from "./components/promotoras";
import { useAuth } from "@/contexts/AuthContext";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type ModalType = "none" | "2FA" | "modal2" | "promotoras";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
});

export default function Page() {
  const [currentModal, setCurrentModal] = useState<ModalType>("none");
  const [promotorasModal, setPromotorasModal] = useState<ModalType>("none");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    setMail,
    setSenha,
    setPromotoras,
    setId,
    id
  } = useAuth();

  const handleLogin = async () => {
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0]
      });
      return;
    }

    try {
      setErrors({});
      setLoginError(null);

      const response = await fetch(`${API_BASE_URL}/auth/pre_login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          senha: password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || "Email ou senha inválidos.";
        setLoginError(errorMessage);
        return;
      }

      // Armazenando dados no contexto
      setMail(email);
      setSenha(password);
      setPromotoras(data?.promotoras);
      setId(data?.id); // ✅ ID do usuário sendo armazenado

      console.log("data: ", data)

      console.log(id)

      if (data?.tipo_usuario === "Promotora") {
        setPromotorasModal("promotoras");
      } else {
        setCurrentModal("2FA");
      }
    } catch (error: any) {
      setLoginError("Erro na conexão com o servidor.");
      console.error("Erro ao fazer login:", error instanceof Error ? error.message : error);
    }
  };

  const closeModal = () => setCurrentModal("none");
  const closeModalPromotoras = () => setPromotorasModal("none");

  return (
    <div className="flex items-center justify-center py-4 lg:h-screen">
      {currentModal === "none" && promotorasModal === "none" && (
        <Card className="mx-auto w-96">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription className="text-[13px]">
              Digite seu e-mail e senha abaixo para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@bundui.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    href="/dashboard/forgot-password"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              {loginError && (
                <p className="text-center text-sm text-red-500">{loginError}</p>
              )}
              <Button onClick={handleLogin} type="button" className="w-full">
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentModal === "2FA" ? (
        <FA onNext={() => setCurrentModal("modal2")} onClose={closeModal} />
      ) : promotorasModal === "promotoras" ? (
        <Promotoras
          onNext={() => setCurrentModal("modal2")}
          onClose={closeModalPromotoras}
        />
      ) : null}
    </div>
  );
}
