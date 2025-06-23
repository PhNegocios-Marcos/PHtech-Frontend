"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Combobox } from "./Combobox"; // ajuste o path se for diferente
import { Button } from "@/components/ui/button";
import FA from "./2FA";

type ModalType = "none" | "2FA" | "modal2" | "promotoras";

type OTPFormProps = {
  onNext?: () => void; // ← permite o uso opcional de um callback externo
  onClose?: () => void;
};

export default function OTPForm({ onNext, onClose }: OTPFormProps) {
  const { promotoras, setSelectedPromotoraId } = useAuth();
  const router = useRouter();
  const [currentModal, setCurrentModal] = useState<ModalType>("none");

  const [selectedPromotora, setSelectedPromotora] = useState<any | null>(null);

  const handleConfirm = () => {
    if (selectedPromotora && selectedPromotora.id) {
      setSelectedPromotoraId(selectedPromotora.id);
      setCurrentModal("2FA");
    } else {
      alert("Selecione uma promotora primeiro.");
    }
  };

  const closeModal = () => setCurrentModal("none");

  return (
    <div>
      {currentModal === "none" && (
        <Card className="w-full md:w-[350px]">
          <CardHeader>
            <CardTitle>Escolha a promotora</CardTitle>
          </CardHeader>
          <CardContent>
            <Combobox
              data={promotoras || []}
              displayField="nome"
              value={selectedPromotora}
              onChange={(val) => {
                setSelectedPromotora(val);
              }}
              label="Promotora"
              placeholder="Selecione uma promotora"
              searchFields={["nome"]}
            />
          </CardContent>
          <Button className="mx-auto w-20" onClick={handleConfirm}>
            Confirmar
          </Button>
        </Card>
      )}

      {currentModal === "2FA" && (
        <FA onNext={() => setCurrentModal("modal2")} onClose={closeModal} />
      )}
    </div>
  );
}
