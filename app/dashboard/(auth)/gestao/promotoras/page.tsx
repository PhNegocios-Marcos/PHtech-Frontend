"use client";

import { useState } from "react";
import CustomDateRangePicker from "@/components/custom-date-range-picker";
import { Button } from "@/components/ui/button";
import { PromotorasTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PromotoraDrawer, Promotora } from "./components/PromotoraModal";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";

import CadastroPromotoraModal from "./components/CadastroPromotoraModal";

export default function Page() {
  const podeCriar = useHasPermission("Produtos_criar");

  const [selectedPromotora, setSelectedPromotora] = useState<Promotora | null>(null);
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Promotora_ver">
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />
        {podeCriar && <Button onClick={() => setIsCadastroOpen(true)}>Nova promotora</Button>}
      </div>

      <PromotorasTable onSelectPromotora={setSelectedPromotora} />

      {selectedPromotora && (
        <PromotoraDrawer onClose={() => setSelectedPromotora(null)} promotora={selectedPromotora} />
      )}

      {/* Modal de cadastro nova promotora */}
      <CadastroPromotoraModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </ProtectedRoute>
  );
}
