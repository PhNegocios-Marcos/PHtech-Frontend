"use client";

import { useState } from "react";
import { REGEXP_ONLY_DIGITS } from "input-otp";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

type OTPFormProps = {
  onNext?: () => void;
};

export default function OTPForm({ onNext }: OTPFormProps) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { token, email } = useAuth();
  const router = useRouter();

  async function handleVerify(pin: string) {
    if (!token) {
      alert("Token de autenticação não encontrado.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://127.0.0.1:8000/auth/email_2fa_verificar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email,
          pin
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erro ao verificar código");
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/dashboard/default"); // ← fallback
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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

        {loading && <p>Verificando código...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">Código confirmado! Redirecionando...</p>}

        <p className="text-muted-foreground text-sm">
          Você será redirecionado automaticamente após a confirmação do código.
        </p>
      </CardContent>
    </Card>
  );
}
