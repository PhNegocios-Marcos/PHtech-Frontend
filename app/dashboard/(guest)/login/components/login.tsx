"use client";

import { useState, useEffect } from "react";
import { ArrowLeftIcon, MailIcon, Chrome, MessageSquareMore } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Email from "./email";
import Sms from "./sms";
import Google from "./google";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
    tokenExpiraEm,
    setTokenExpiraEm,
    setUserData,
    setUserPermissoes,
    selectedPromotoraTemas,
    userData
  } = useAuth();

  const router = useRouter();

  useEffect(() => {
    const login = async () => {
      try {
        const request = selectedPromotoraId
          ? { email, senha, promotora: selectedPromotoraId }
          : { email, senha };

        const login = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(request)
        });

        const dataLogin = await login.json();

        setUserData(dataLogin?.dados_usuario);
        setToken(dataLogin?.token);
        setTokenExpiraEm(dataLogin?.expira_em);
        setUserPermissoes(dataLogin?.permissoes);

        sessionStorage.removeItem("auth_senha");

        router.push("/dashboard/default");
      } catch (err: any) {
        console.error("Erro ao fazer Login: ", err);
      }
    };

    login(); // Executa automaticamente ao montar
  }, []);

  const closeAllModals = () => {
    setEmailModal("none");
    setSmsModal("none");
    setGoogleModal("none");

    if (onNext) onNext();
  };

  return (
    <>
    </>
  );
}
