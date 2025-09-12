"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SeguroTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroSeguroModal from "./components/cadastroSeguroModal";

export default function Page() {
  const podeCriar = useHasPermission("Seguros_criar");
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Seguro_ver">
      <div className="mb-4 flex flex-col justify-between space-y-4 md:flex-row">
        <CampoBoasVindas />

        {podeCriar && (
          <Button onClick={() => setIsCadastroOpen(true)}>
            Nova faixa de seguro
          </Button>
        )}
      </div>

      <SeguroTable />

      <CadastroSeguroModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </ProtectedRoute>
  );
}