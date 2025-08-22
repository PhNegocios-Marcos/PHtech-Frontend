"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AverbadorTable } from "./components/leads";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroAverbadorModal from "./components/CadastroAverbadorModal";
import CampoBoasVindas from "@/components/boasvindas";

export default function Page() {
  const podeCriar = useHasPermission("Convenios_criar");
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Averbador_ver">
      <div className="flex justify-between space-y-4 mb-4">
        <CampoBoasVindas />

        {podeCriar && (
          <Button id="Averbador_criar" onClick={() => setIsCadastroOpen(true)}>
            Novo Averbador
          </Button>
        )}
      </div>

       <AverbadorTable />

      <CadastroAverbadorModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </ProtectedRoute>
  );
}
