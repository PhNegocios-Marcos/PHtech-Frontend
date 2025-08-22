"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConveniosTable } from "./components/convenios";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useHasPermission } from "@/hooks/useFilteredPageRoutes";
import CadastroConvenioModal from "./components/CadastroConvenioModal";
import CampoBoasVindas from "@/components/boasvindas";

export default function Page() {
  const podeCriar = useHasPermission("Convenios_criar");
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const handleCloseCadastro = () => setIsCadastroOpen(false);

  return (
    <ProtectedRoute requiredPermission="Convenio_ver">
      <div className="flex justify-between space-y-4 mb-4">
        <CampoBoasVindas />

        {podeCriar && (
          <Button id="Convenios_criar" onClick={() => setIsCadastroOpen(true)}>
            Novo Convênio
          </Button>
        )}
      </div>

       <ConveniosTable />

      <CadastroConvenioModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
    </ProtectedRoute>
  );
}
