"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import CampoBoasVindas from "@/components/boasvindas";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import { OrgaoModal } from "./components/leads";
import CadastroOrgao from "./components/cadastroOrgao";

export default function Page() {
  const podeCriar = useHasPermission("Orgaos_criar");

  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Orgao_Ver">
      <div className="mb-4 flex justify-between space-y-4">
        <CampoBoasVindas />

        {podeCriar && (
          <Button onClick={() => setIsCadastroOpen(true)} id="Orgaos_criar">
            Novo Orgão
          </Button>
        )}
      </div>

      {!isCadastroOpen && <OrgaoModal />}

      <CadastroOrgao isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </ProtectedRoute>
  );
}
