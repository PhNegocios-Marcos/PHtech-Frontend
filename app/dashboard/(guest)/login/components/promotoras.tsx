import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Combobox } from "./Combobox";
import { Button } from "@/components/ui/button";
import FA from "./2FA";
import { ArrowLeftIcon } from "lucide-react";
import Login from "./login";

type ModalType = "none" | "2FA" | "modal2" | "promotoras" | "usa_2fa";

type OTPFormProps = {
  onNext?: () => void;
  onClose?: () => void;
};

type Tema = {
  id: string;
  promotora: string;
  preset: string;
  radius: string;
  scale: string;
  contentLayout: string;
  image: string;
};

type Promotora = {
  id: string;
  nome: string;
  temas: Tema[];
};

export default function OTPForm({ onNext, onClose }: OTPFormProps) {
  const {
    usa_2fa,
    promotoras,
    setSelectedPromotoraId,
    setSelectedPromotoraTemas,
    setSelectedPromotoraLogo,
    setSelectedPromotoraNome
  } = useAuth();

  const router = useRouter();
  const [currentModal, setCurrentModal] = useState<ModalType>("none");
  const [selectedPromotora, setSelectedPromotora] = useState<Promotora | null>(null);
  const [usa2faModal, setUsa2faModal] = useState<ModalType>("none");

  const handleConfirm = () => {
    if (selectedPromotora && selectedPromotora.id) {
      const tema =
        Array.isArray(selectedPromotora.temas) && selectedPromotora.temas.length > 0
          ? selectedPromotora.temas[0]
          : null;

      setSelectedPromotoraId(selectedPromotora.id);
      setSelectedPromotoraTemas(tema?.preset ?? "default");
      setSelectedPromotoraLogo(tema?.image ?? "/logo.png");
      setSelectedPromotoraNome(selectedPromotora.nome ?? "Ph tech"); // ✅ salva o nome

      if (usa_2fa === 0) {
        setUsa2faModal("usa_2fa");
      } else {
        setCurrentModal("2FA");
      }
    } else {
      alert("Selecione uma promotora primeiro.");
    }
  };

  const closeModal = () => setCurrentModal("none");

  return (
    <div className="w-full">
      {currentModal === "none" && (
        <div className="w-full">
          <Card className="p-[40px] bg-background gap-0">
            <CardHeader className="px-0">
              <CardTitle className="text-black dark:text-white text-[24px] font-semibold mb-0">Escolher a promotora</CardTitle>
              <p className="text-md text-gray-400 dark:text-gray-200 mb-10">Selecione uma promotora e visualize todos os seus dados.</p>
            </CardHeader>
            <CardContent className="px-0">
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

            <Button className="mx-auto w-full py-6 mb-2 mt-12" onClick={handleConfirm}>
              Confirmar
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="ghost" className="w-full text-red-500 border border-red-500">
                <ArrowLeftIcon className="h-4 full" />
                Voltar
              </Button>
            )}
          </Card>
        </div>
      )}

      {currentModal === "2FA" ? (
        <FA onNext={() => setCurrentModal("modal2")} onClose={closeModal} />
      ) : usa2faModal === "usa_2fa" ? (
        <Login onNext={() => setCurrentModal("modal2")} onClose={closeModal} />
      ) : null}
    </div>
  );
}
