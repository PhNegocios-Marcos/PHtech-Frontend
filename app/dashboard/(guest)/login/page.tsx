"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FA from "./components/2FA";
import Promotoras from "./components/promotoras";
import Login from "./components/login";
import { useAuth } from "@/contexts/AuthContext";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import Image from "next/image";
import { useRouter } from "next/navigation";
// import GlassCard from "@/components/glassCardComponent";

type ModalType = "none" | "2FA" | "modal2" | "promotoras" | "usa_2fa";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
});

export default function Page() {
  const [currentModal, setCurrentModal] = useState<ModalType>("none");
  const [usa2faModal, setUsa2faModal] = useState<ModalType>("none");
  const [loading, setLoading] = useState(false); 
  const [promotorasModal, setPromotorasModal] = useState<ModalType>("none");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();

  const {
    setMail,
    setSenha,
    setPromotoras,
    setId,
    setUsa_2fa,
    setTokenExpiraEm,
    setToken,
    setUserData,
    id,
    senha
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

      setLoading(true);

      setMail(email);
      setSenha(password);
      setUsa_2fa(data?.usa_2fa);
      setPromotoras(data?.promotoras);
      setId(data?.id);

      if (data?.tipo_usuario === "Promotora") {
        setPromotorasModal("promotoras");
        setLoading(false);
      } else {
        if (data.usa_2fa === 1) {
          setCurrentModal("2FA");
        } else {
          setUsa2faModal("usa_2fa");
        }
      }

    } catch (error: any) {
      setLoading(false);
      setLoginError("Erro na conexão com o servidor.");
      console.error("Erro ao fazer login:", error instanceof Error ? error.message : error);
    }
  };

  const closeModal = () => setCurrentModal("none");
  const closeModalPromotoras = () => setPromotorasModal("none");

  const imageList = ["/image.svg"];

  const randomImage = useMemo(() => {
    const index = Math.floor(Math.random() * imageList.length);
    return imageList[index];
  }, []);

  const backgroundImageFile = randomImage;

  return (
      <div className="flex flex-col h-screen">
        <div className="w-full flex my-auto">
          <div className="xl:w-[65%] lg:w-[50%]  overflow-hidden h-screen items-center justify-center hidden lg:flex">
            <img
              src={`${backgroundImageFile}`}
              className="w-full h-full object-cover object-left"
              alt="Banner login"
            />
          </div>

          <div className="flex flex-col max-h-screen items-center justify-center xl:w-[35%] lg:w-[50%] w-full 2xl:px-40 xl:px-10">
              <div className="w-full flex justify-center 2xl:mb-7 xl:mb-6 lg:mb-5">
                <Image
                  src={'/logo.png'}
                  alt="Logotipo da PH Tech"
                  width={150}
                  height={150}
                />
              </div>

                {currentModal === "none" && promotorasModal === "none" && (
                <div className="w-full flex flex-col justify-center">
                  <Card className="p-[40px] bg-background gap-0 border-0 shadow-none!">
                    <CardTitle className="text-black dark:text-white text-[24px] font-semibold mb-0">Fazer login</CardTitle>
                    <p className="text-md text-gray-400 dark:text-gray-200 mb-10">Seja bem vindo! Entre no sistema e gerencie suas operações.</p>

                    <div className="mb-10">
                      <Label htmlFor="email" className="text-black dark:text-white mb-1">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Digite o seu e-mail"
                        value={email}
                        className="py-[24px] bg-gray-300/50 placeholder:text-gray-400 text-black dark:text-white border-0"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      {errors.email && <p className="text-sm text-black dark:text-white">{errors.email}</p>}
                    </div>

                    <div className="mb-12"> 
                      <Label htmlFor="password" className="text-black dark:text-white mb-1">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Digite a sua senha"
                        value={password}
                        className="py-[24px] bg-gray-300/50 placeholder:text-gray-400 text-black dark:text-white border-0"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      {errors.password && <p className="text-sm text-black dark:text-white">{errors.password}</p>}

                      <div className="w-full flex justify-end">
                        <Link
                          href="/dashboard/forgot-password"
                          className="mt-2 inline-block text-black dark:text-white text-[12px]">
                          Esqueceu sua senha? <span className="underline">Clique aqui</span>
                        </Link>
                      </div>

                      {loginError && <p className="text-center text-sm text-black dark:text-white">{loginError}</p>}
                    </div>

                    <Button onClick={handleLogin} type="button" className="w-full py-7 disabled:bg-red-800" disabled={loading}>
                      {loading ? "Entrando..." : "Entrar"}
                    </Button>
                  </Card>
                 </div>
                )}

            {currentModal === "2FA" ? (
              <FA onNext={() => setCurrentModal("modal2")} onClose={closeModal} />
            ) : promotorasModal === "promotoras" ? (
              <Promotoras onNext={() => setCurrentModal("modal2")} onClose={closeModalPromotoras} />
            ) : usa2faModal === "usa_2fa" ? (
              <Login onNext={() => setCurrentModal("modal2")} onClose={closeModal} />
            ) : null}

            <p className="w-full text-center text-gray-400 dark:text-gray-200 text-sm">
              Powered by <span className="cursor-pointer hover:text-primary transition">Aurora Core Bank</span>
            </p>
          </div>
        </div>
      </div>
  );
}
