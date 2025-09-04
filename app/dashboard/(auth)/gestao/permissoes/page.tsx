"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PermissoesTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroPermissoesModal from "./components/cadastroPermissoesModal";

export default function Page() {
  const podeCriar = useHasPermission("Usuarios_criar");
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Gestão_Permissões">
      <div className="mb-4 flex flex-col justify-between space-y-4 md:flex-row">
        <CampoBoasVindas />

        {podeCriar && (
          <Button onClick={() => setIsCadastroOpen(true)}>
            Nova permissão
          </Button>
        )}
      </div>

      <PermissoesTable />

      <CadastroPermissoesModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </ProtectedRoute>
  );
}
