"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FA from "./components/2FA";
import { useAuth } from "@/contexts/AuthContext";
import Promotoras from "./components/promotoras";

type ModalType = "none" | "2FA" | "modal2" | "promotoras";

type OTPFormProps = {
  onNext?: () => void; // ← permite o uso opcional de um callback externo
};

// Schema Zod
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
});

export default function Page() {
  const [currentModal, setCurrentModal] = useState<ModalType>("none");
  const [promotorasModal, setpromotorasModal] = useState<ModalType>("none");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const [loginError, setLoginError] = useState<string | null>(null); // novo estado
  const { setToken, setMail, setUserData, userData, token, setPromotoras, setSenha } =
    useAuth(); // pega o setToken do contexto

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
      setLoginError(null); // limpa erro anterior

      const response = await fetch("http://127.0.0.1:8000/auth/pre_login", {
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
        // Se a API retornar uma mensagem de erro, use ela. Senão, mostra genérica.
        const errorMessage = data.message || "Email ou senha inválidos.";
        setLoginError(errorMessage);
        return;
      }

      // setToken(data?.token);
      setMail(email);
      setSenha(password);
      // console.log("dados do user: ", data);
      // console.log("promotoas: ", data?.promotoras)
      // console.log("tipoUsuario: ", data?.tipo_usuario);
      // console.log("senha: ", password)
      setPromotoras(data?.promotoras);


      if (data?.tipo_usuario === "Promotora") {
        setpromotorasModal("promotoras");
      } else {
        setCurrentModal("2FA");
      }
    } catch (error: any) {
      setLoginError("Erro na conexão com o servidor.");
      console.error("Erro ao fazer login:", error instanceof Error ? error.message : error);
    }
  };

  const closeModal = () => setCurrentModal("none");
  const closeModalPromotoras = () => setpromotorasModal("none");

  // console.log(token)

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
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    href="/dashboard/forgot-password"
                    className="ml-auto inline-block text-sm underline">
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
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
              {loginError && <p className="text-center text-sm text-red-500">{loginError}</p>}
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
        <Promotoras onNext={() => setCurrentModal("modal2")} onClose={closeModalPromotoras} />
      ) : null}
    </div>
  );
}
