"use client";

import { useState } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type OTPFormProps = {
  onNext?: () => void; // ← permite o uso opcional de um callback externo
};

export default function OTPForm({ onNext }: OTPFormProps) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { token, email, selectedPromotoraId, senha, setToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const router = useRouter();

  async function handleVerify(pin: string) {
    // if (!token) {
    //   alert("Token de autenticação não encontrado.");
    //   return;
    // }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("${API_BASE_URL}/auth/google_2fa_verificar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, pin })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erro ao verificar código");
      }

      setSuccess(true);

      // console.log("funcionou");

      // setTimeout(() => {
      //   router.push("/dashboard/default"); // ← fallback
      // }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function gerarNovoQRCode() {
    if (!token) {
      alert("Token de autenticação não encontrado.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/google_2fa_gerar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, gerar_novo: 1 })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erro ao gerar QR Code");
      }

      const data = await response.json();
      setSecretCode(data.code);
      setQrCode(data.qr_base64);
      setShowModal(true);
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <Card className="w-full md:w-[350px]">
      <CardHeader>
        <CardTitle>Digite o código de verificação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <InputOTP
          maxLength={6}
          pattern={REGEXP_ONLY_DIGITS}
          value={pin}
          onChange={setPin}
          onComplete={(val) => {
            if (val.length === 6) {
              handleVerify(val);
            }
          }}>
          <InputOTPGroup className="space-x-4 *:rounded-lg! *:border!">
            {[...Array(6)].map((_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <div className="flex items-center">
          <button
            type="button"
            className="ml-auto inline-block cursor-pointer text-sm underline"
            onClick={gerarNovoQRCode}>
            Gerar novo QR CODE
          </button>
        </div>

        {loading && <p>Verificando código...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">Código confirmado! Redirecionando...</p>}

        <p className="text-muted-foreground text-sm">
          Você será redirecionado automaticamente após a confirmação do código.
        </p>
      </CardContent>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-[90%] max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-bold">Novo QR Code</h2>
            <div className="mb-4">
              <p className="text-sm font-medium">Código secreto:</p>
              <p className="font-mono break-all text-red-600">{secretCode}</p>
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium">QR Code:</p>
              <div
                className="flex w-full justify-center rounded"
                dangerouslySetInnerHTML={{ __html: qrCode }}
              />
            </div>
            <Button
              onClick={() => setShowModal(false)}
              className="mt-4 rounded px-4 py-2 text-white">
              Fechar
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
