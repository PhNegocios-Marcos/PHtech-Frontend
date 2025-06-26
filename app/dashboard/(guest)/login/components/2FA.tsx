"use client";

import { useState } from "react";
import { ArrowLeftIcon, MailIcon, Chrome, MessageSquareMore } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Email from "./email";
import Sms from "./sms";
import Google from "./google";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

type ModalType = "none" | "email" | "sms" | "google";

type FAProps = {
  onNext?: () => void;
  onClose?: () => void;
};

export default function FA({ onNext, onClose }: FAProps) {
  const [emailModal, setEmailModal] = useState<ModalType>("none");
  const [smsModal, setSmsModal] = useState<ModalType>("none");
  const [googleModal, setGoogleModal] = useState<ModalType>("none");

  const {
    token,
    email,
    senha,
    selectedPromotoraId,
    setToken,
    setTokenExpiraEm, // <-- adicionado
    setUserData,
    setUserPermissoes,
    userData,
  } = useAuth();

  const router = useRouter();

  const handleSms = async () => {
    try {
      const login = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          senha,
          promotora: selectedPromotoraId,
        }),
      });

      const dataLogin = await login.json();

      setUserData(dataLogin?.dados_usuario?.[0]);
      setToken(dataLogin?.token);
      setTokenExpiraEm(dataLogin?.expira_em); // <-- aqui

      sessionStorage.removeItem("auth_senha");
    } catch (err: any) {
      console.error("Erro no login:", err);
    }

    if (!token) {
      alert("Token de autenticação não encontrado.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/sms_2fa_gerar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Erro ao solicitar SMS.");
        return;
      }

      console.log("SMS enviado com sucesso:", data);
      setSmsModal("sms");
    } catch (error: any) {
      console.error("Erro ao solicitar SMS:", error);
      alert("Erro na solicitação de SMS.");
    }
  };

  const handleEmail = async () => {
    try {
      const request = selectedPromotoraId
        ? { email, senha, promotora: selectedPromotoraId }
        : { email, senha };

      const login = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const dataLogin = await login.json();

      setUserData(dataLogin?.dados_usuario);
      setToken(dataLogin?.token);
      setTokenExpiraEm(dataLogin?.expira_em); // <-- aqui
      setUserPermissoes(dataLogin?.permissoes);

      sessionStorage.removeItem("auth_senha");

    } catch (err: any) {
      console.error("Erro ao fazer Login: ", err);
    }

    router.push("/dashboard/default"); // fallback
  };

  const handleGoogle = async () => {
    try {
      const login = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          senha,
          promotora: selectedPromotoraId,
        }),
      });

      const dataLogin = await login.json();

      setUserData(dataLogin?.dados_usuario?.[0]);
      setToken(dataLogin?.token);
      setTokenExpiraEm(dataLogin?.expira_em); // <-- aqui

      sessionStorage.removeItem("auth_senha");
    } catch (err: any) {
      console.error("Erro no login com Google:", err);
    }

    setGoogleModal("google");
  };

  const closeAllModals = () => {
    setEmailModal("none");
    setSmsModal("none");
    setGoogleModal("none");

    if (onNext) onNext();
  };

  return (
    <div>
      {emailModal === "none" && smsModal === "none" && googleModal === "none" && (
        <Card className="w-full md:w-[350px]">
          <CardHeader>
            <CardTitle className="text-center">Autenticação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-3">
              <Button onClick={handleEmail} variant="outline" className="w-full">
                <MailIcon className="mr-2 h-4 w-4" />
                Continue com Email
              </Button>
              <Button onClick={handleSms} variant="outline" className="w-full">
                <MessageSquareMore className="mr-2 h-4 w-4" />
                Continue com SMS
              </Button>
              <Button onClick={handleGoogle} variant="outline" className="w-full">
                <Chrome className="mr-2 h-4 w-4" />
                Continue com Google
              </Button>
            </div>
            {onClose && (
              <Button onClick={onClose} variant="ghost" className="w-full text-red-500">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {emailModal === "email" && <Email onNext={closeAllModals} />}
      {smsModal === "sms" && <Sms onNext={closeAllModals} />}
      {googleModal === "google" && <Google onNext={closeAllModals} />}
    </div>
  );
}
