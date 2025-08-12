"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SeguradorasTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroSeguradoraModal from "./components/cadastroSeguradoraModal";

export default function Page() {
  const podeCriar = useHasPermission("Seguradoras_criar");
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Gestão_Seguradoras">
      <div className="mb-4 flex flex-col justify-between space-y-4 md:flex-row">
        <CampoBoasVindas />

        {podeCriar && (
          <Button onClick={() => setIsCadastroOpen(true)}>
            Nova Seguradora
          </Button>
        )}
      </div>

      <SeguradorasTable />

      <CadastroSeguradoraModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </ProtectedRoute>
  );
}