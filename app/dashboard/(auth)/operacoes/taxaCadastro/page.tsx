"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TaxaCadastroTable } from "./components/leads";
import CampoBoasVindas from "@/components/boasvindas";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroTaxaModal from "./components/cadastroTaxaModal";

export default function Page() {
  const podeCriar = useHasPermission("Taxas_criar");
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="TaxaCadastro_Ver">
      <div className="mb-4 flex flex-col justify-between space-y-4 md:flex-row">
        <CampoBoasVindas />

        {podeCriar && (
          <Button onClick={() => setIsCadastroOpen(true)}>
            Nova Faixa de Taxa
          </Button>
        )}
      </div>

      <TaxaCadastroTable />

      <CadastroTaxaModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </ProtectedRoute>
  );
}