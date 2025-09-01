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
import GlassCard from "@/components/glassCardComponent";

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

      // Armazenando dados no contexto
      setMail(email);
      setSenha(password);
      setUsa_2fa(data?.usa_2fa);
      setPromotoras(data?.promotoras);
      setId(data?.id); // ✅ ID do usuário sendo armazenado

      // console.log("data: ", data)
      // console.log("usa_2fa page: ", data?.usa_2fa);

      // console.log(id)

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
  const imageConstruct = {
    backgroundImage: `url(${backgroundImageFile})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
  }

  return (
      <div className="flex flex-col h-screen py-20 px-[24px] md:px-[64px] xl:px-[256px]" style={imageConstruct}>
        <div className="flex w-full flex-col lg:flex-row my-auto justify-between items-center">
          <div className="lg:w-[50%] sm:w-[75%] w-full  hidden md:mb-6 sm:flex flex-col justify-center gap-3">
            <Image
              src="/logo_white.png" // caminho da imagem (pública ou importada)
              alt="Descrição da imagem"
              width={200}
              height={200}
            />
            <h3 className="text-white text-[16px] md:text-[24px] text-center lg:text-left lg:text-[28px] xl:text-[32px]">
              A melhor experiência <br/> para você e seu cliente.
            </h3>
          </div>
          <div className="flex items-center justify-center lg:w-[35%] sm:w-[75%] w-full">
            {currentModal === "none" && promotorasModal === "none" && (
              <div className="w-full">
                <Card className="p-[40px] bg-background">
                  <h1 className="text-black dark:text-white text-[24px] font-medium mb-8">Fazer login</h1>

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
          </div>
        </div>
      </div>
  );
}
