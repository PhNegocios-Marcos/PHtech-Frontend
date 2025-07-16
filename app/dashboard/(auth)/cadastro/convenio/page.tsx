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
    <ProtectedRoute requiredPermission="Convenios_ver">
      <CampoBoasVindas />

      <div className="space-y-4">
        <div className="flex flex-col justify-between">
          <div className="mb-4 flex items-center justify-end space-x-2">
            {podeCriar && (
              <Button id="Convenios_criar" onClick={() => setIsCadastroOpen(true)}>
                Novo Convênio
              </Button>
            )}
          </div>

          {!isCadastroOpen && <ConveniosTable />}

          <CadastroConvenioModal isOpen={isCadastroOpen} onClose={handleCloseCadastro} />
        </div>
      </div>
    </ProtectedRoute>
  );
}