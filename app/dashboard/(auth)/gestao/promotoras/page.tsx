"use client";

import { useState } from "react";
import CustomDateRangePicker from "@/components/custom-date-range-picker";
import { Button } from "@/components/ui/button";
import { PromotorasTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PromotoraDrawer, Promotora } from "./components/PromotoraModal";
import CadastroPromotoraModal from "./components/CadastroPromotoraModal";

export default function Page() {
  const router = useRouter();
  const [selectedPromotora, setSelectedPromotora] = useState<Promotora | null>(null);
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseDrawer = () => setSelectedPromotora(null);
  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Gestão_Permissões">
      <div className="space-y-4">
        <div className="flex flex-col justify-between">
          <CampoBoasVindas />
          <div className="mb-4 flex items-center justify-end space-x-2">
            <Button onClick={() => setIsCadastroOpen(true)}>Nova Promotora</Button>
          </div>
          {!selectedPromotora && !isCadastroOpen && (
            <>
              <PromotorasTable onSelectPromotora={setSelectedPromotora} />
            </>
          )}

          {selectedPromotora && (
            <>
              <div className="mb-4"></div>
              <PromotoraDrawer
                isOpen={true}
                onClose={handleCloseDrawer}
                promotora={selectedPromotora}
              />
            </>
          )}

          {/* Modal de cadastro nova promotora */}
          <CadastroPromotoraModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
